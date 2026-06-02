from __future__ import annotations

import json
import os
import threading
import time
from dataclasses import dataclass, field
from functools import partial
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

import cv2
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError, PyMongoError
import jwt
from http import cookies
from typing import Optional
from ultralytics import YOLO
import hashlib
import secrets
import datetime
from dotenv import load_dotenv
from urllib.parse import urlparse
import certifi


load_dotenv()

ROOT_DIR = Path(__file__).resolve().parent
SITE_DIR = ROOT_DIR / "trinay-website"
MODEL_PATH = ROOT_DIR / "yolov8n.pt"
HOST = "127.0.0.1"
PORT = 8000
CAPTURE_WIDTH = 640
CAPTURE_HEIGHT = 360
INFERENCE_SIZE = 320


def _distance_text(distance_m: float | None) -> str:
    if distance_m is None:
        return "—"
    if distance_m < 1:
        return f"{round(distance_m * 100):d} cm"
    return f"{distance_m:.2f} m"


def _estimate_distance(box_width_px: float, known_width_m: float = 0.45, focal_length_px: float = 600.0) -> float | None:
    if box_width_px < 5:
        return None
    distance_m = (known_width_m * focal_length_px) / box_width_px
    return max(0.1, min(distance_m, 20.0))


@dataclass
class DetectionState:
    lock: threading.Lock = field(default_factory=threading.Lock)
    latest_frame: Any | None = None
    frame_seq: int = 0
    latest_jpeg: bytes | None = None
    detections: list[dict[str, Any]] = field(default_factory=list)
    camera_active: bool = False
    error: str | None = None
    fps: float = 0.0
    total_detections: int = 0
    alert_count: int = 0
    alert_id: int = 0
    alert_text: str = ""
    nearest_label: str = "—"
    nearest_distance_m: float | None = None
    last_frame_at: float = 0.0

    def snapshot(self) -> dict[str, Any]:
        with self.lock:
            return {
                "camera_active": self.camera_active,
                "error": self.error,
                "fps": round(self.fps, 1),
                "objects": len(self.detections),
                "total_detections": self.total_detections,
                "alerts": self.alert_count,
                "alert_id": self.alert_id,
                "alert_text": self.alert_text,
                "nearest_label": self.nearest_label,
                "nearest_distance_m": self.nearest_distance_m,
                "nearest_distance_text": _distance_text(self.nearest_distance_m),
                "detections": self.detections,
                "last_frame_at": self.last_frame_at,
            }


class YOLOCameraEngine:
    def __init__(self, model_path: Path, state: DetectionState) -> None:
        self.model_path = model_path
        self.state = state
        self.model = YOLO(str(model_path))
        self.stop_event = threading.Event()
        self.capture_worker = threading.Thread(target=self._capture_loop, name="trinay-camera-capture", daemon=True)
        self.inference_worker = threading.Thread(target=self._inference_loop, name="trinay-camera-inference", daemon=True)
        self.conf_threshold = 0.45
        self.danger_threshold_m = 1.0
        self.mirror_view = True
        self._frame_lock = threading.Lock()
        self._capture_frame: Any | None = None
        self._capture_seq = 0
        self._latest_capture_mtime = 0.0
        self._last_global_alert = 0.0
        self._last_label_alert: dict[str, float] = {}

    def start(self) -> None:
        self.capture_worker.start()
        self.inference_worker.start()

    def stop(self) -> None:
        self.stop_event.set()
        self.capture_worker.join(timeout=2.0)
        self.inference_worker.join(timeout=2.0)

    def apply_config(self, payload: dict[str, Any]) -> None:
        with self.state.lock:
            if "confidence_threshold" in payload:
                self.conf_threshold = float(payload["confidence_threshold"])
            if "danger_threshold_m" in payload:
                self.danger_threshold_m = float(payload["danger_threshold_m"])
            if "mirror_view" in payload:
                self.mirror_view = bool(payload["mirror_view"])

    def _open_camera(self) -> cv2.VideoCapture:
        if os.name == "nt":
            cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
            if cap.isOpened():
                return cap
        return cv2.VideoCapture(0)

    def _capture_loop(self) -> None:
        cap = self._open_camera()
        if not cap.isOpened():
            with self.state.lock:
                self.state.error = "Could not open the webcam."
                self.state.camera_active = False
            return

        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, CAPTURE_WIDTH)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, CAPTURE_HEIGHT)
        cap.set(cv2.CAP_PROP_FPS, 30)

        with self.state.lock:
            self.state.camera_active = True
            self.state.error = None

        try:
            while not self.stop_event.is_set():
                ok, frame = cap.read()
                if not ok:
                    time.sleep(0.05)
                    continue

                with self.state.lock:
                    self.state.latest_frame = frame
                    self.state.frame_seq += 1
                    self._capture_seq = self.state.frame_seq

        finally:
            cap.release()
            with self.state.lock:
                self.state.camera_active = False

    def _inference_loop(self) -> None:
        last_processed_seq = -1
        last_frame_time = time.perf_counter()

        while not self.stop_event.is_set():
            with self.state.lock:
                frame = self.state.latest_frame
                frame_seq = self.state.frame_seq

            if frame is None or frame_seq == last_processed_seq:
                time.sleep(0.005)
                continue

            last_processed_seq = frame_seq
            working_frame = frame.copy()

            if self.mirror_view:
                working_frame = cv2.flip(working_frame, 1)

            results = self.model.predict(
                working_frame,
                imgsz=INFERENCE_SIZE,
                conf=self.conf_threshold,
                max_det=8,
                verbose=False,
            )
            result = results[0]

            detections: list[dict[str, Any]] = []
            nearest_label = "—"
            nearest_distance_m: float | None = None
            nearest_distance_value = float("inf")

            if result.boxes is not None:
                for box in result.boxes:
                    xyxy = box.xyxy[0].tolist()
                    x1, y1, x2, y2 = (int(v) for v in xyxy)
                    width = max(1, x2 - x1)
                    class_id = int(box.cls[0])
                    confidence = float(box.conf[0])
                    label = result.names[class_id]
                    distance_m = _estimate_distance(width)
                    danger = distance_m is not None and distance_m <= self.danger_threshold_m

                    detections.append(
                        {
                            "label": label,
                            "class_id": class_id,
                            "confidence": round(confidence, 3),
                            "distance_m": distance_m,
                            "distance_text": _distance_text(distance_m),
                            "danger": danger,
                            "bbox": [x1, y1, width, max(1, y2 - y1)],
                        }
                    )

                    color = (255, 77, 109) if danger else (180, 123, 238)
                    cv2.rectangle(working_frame, (x1, y1), (x2, y2), color, 2)
                    label_text = f"{label} {confidence * 100:.0f}%"
                    if distance_m is not None:
                        label_text += f" · {_distance_text(distance_m)}"
                    text_y = max(18, y1 - 8)
                    cv2.putText(working_frame, label_text, (x1, text_y), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)

                    if distance_m is not None and distance_m < nearest_distance_value:
                        nearest_distance_value = distance_m
                        nearest_label = label
                        nearest_distance_m = distance_m

            detections.sort(key=lambda item: item["distance_m"] if item["distance_m"] is not None else 99.0)

            now = time.perf_counter()
            fps = 1.0 / max(now - last_frame_time, 1e-6)
            last_frame_time = now

            danger_detections = [item for item in detections if item["danger"]]
            if danger_detections:
                nearest_danger = danger_detections[0]
                label = nearest_danger["label"]
                distance_m = nearest_danger["distance_m"]
                last_label_time = self._last_label_alert.get(label, 0.0)
                if now - self._last_global_alert >= 1.8 and now - last_label_time >= 3.5:
                    self._last_global_alert = now
                    self._last_label_alert[label] = now
                    with self.state.lock:
                        self.state.alert_count += 1
                        self.state.alert_id += 1
                        self.state.alert_text = f"Warning! {label} is {_distance_text(distance_m)} away."

            with self.state.lock:
                self.state.detections = detections
                self.state.fps = fps
                self.state.total_detections += len(detections)
                self.state.nearest_label = nearest_label
                self.state.nearest_distance_m = nearest_distance_m
                self.state.last_frame_at = time.time()


class DBManager:
    def __init__(self, mongo_uri: str, database_name: str) -> None:
        self.mongo_uri = mongo_uri
        self.database_name = database_name
        try:
            # Use certifi's CA bundle for Atlas TLS verification
            self.client = MongoClient(self.mongo_uri, tls=True, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=10000)
            # verify connection immediately
            self.client.admin.command("ping")
        except Exception as exc:
            raise RuntimeError(f"Could not connect to MongoDB at '{self.mongo_uri}': {exc}") from exc

        self.db = self.client[self.database_name]
        self.users = self.db["users"]
        self.snapshots = self.db["snapshots"]
        try:
            self.users.create_index("email", unique=True)
        except Exception as exc:
            print(f"Warning: failed creating index on users.email: {exc}")

    def register_user(self, email: str, password: str) -> tuple[bool, str | None]:
        salt = secrets.token_hex(16)
        pwd_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), bytes.fromhex(salt), 100000).hex()
        try:
            self.users.insert_one(
                {
                    "email": email,
                    "password_hash": pwd_hash,
                    "salt": salt,
                    "created_at": datetime.datetime.utcnow(),
                }
            )
            return True, None
        except DuplicateKeyError:
            return False, "Email already registered"
        except PyMongoError as exc:
            return False, f"Database error: {exc}"

    def verify_user(self, email: str, password: str) -> bool:
        row = self.users.find_one({"email": email}, {"password_hash": 1, "salt": 1})
        if not row:
            return False
        stored_hash = row.get("password_hash", "")
        salt = row.get("salt", "")
        check_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), bytes.fromhex(salt), 100000).hex()
        return check_hash == stored_hash

    def save_snapshot(self, data: dict[str, Any]) -> None:
        self.snapshots.insert_one({"timestamp": datetime.datetime.utcnow(), "data": data})


class InMemoryDB:
    """Simple in-memory DB fallback for local testing when MongoDB is unavailable."""
    def __init__(self) -> None:
        self._users: dict[str, dict[str, Any]] = {}
        self._snapshots: list[dict[str, Any]] = []

    def register_user(self, email: str, password: str) -> tuple[bool, str | None]:
        if email in self._users:
            return False, "Email already registered"
        salt = secrets.token_hex(16)
        pwd_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), bytes.fromhex(salt), 100000).hex()
        self._users[email] = {"password_hash": pwd_hash, "salt": salt, "created_at": datetime.datetime.utcnow()}
        return True, None

    def verify_user(self, email: str, password: str) -> bool:
        row = self._users.get(email)
        if not row:
            return False
        stored_hash = row.get("password_hash", "")
        salt = row.get("salt", "")
        check_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), bytes.fromhex(salt), 100000).hex()
        return check_hash == stored_hash

    def save_snapshot(self, data: dict[str, Any]) -> None:
        self._snapshots.append({"timestamp": datetime.datetime.utcnow(), "data": data})


class TrinayHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args: Any, state: DetectionState, engine: YOLOCameraEngine, db: Any, **kwargs: Any) -> None:
        self.state = state
        self.engine = engine
        self.db = db
        super().__init__(*args, **kwargs)

    def do_GET(self) -> None:  # noqa: N802
        request_path = urlparse(self.path).path

        if request_path == "/api/status":
            if not self._is_authenticated():
                self._send_json({"ok": False, "error": "Unauthorized"})
                return
            self._send_json(self.state.snapshot())
            return

        if request_path == "/api/whoami":
            token = self._get_jwt_from_cookie()
            if not token:
                self._send_json({"ok": False, "user": None})
                return
            payload = self._verify_jwt(token)
            if not payload:
                self._send_json({"ok": False, "user": None})
                return
            email = str(payload.get("email") or "")
            display_name = email.split("@", 1)[0].replace(".", " ").replace("_", " ").strip().title() or email
            self._send_json({"ok": True, "user": {"email": email, "display_name": display_name}})
            return

        if request_path == "/video_feed":
            if not self._is_authenticated():
                self._redirect_to_login()
                return
            self._send_video_stream()
            return

        if request_path == "/":
            self.path = "/index.html"
            request_path = self.path

        if not self._is_public_path(request_path) and not self._is_authenticated():
            self._redirect_to_login()
            return

        super().do_GET()

    def do_POST(self) -> None:  # noqa: N802
        # Support multiple API POST endpoints: /api/config, /api/register, /api/login, /api/save_snapshot
        length = int(self.headers.get("Content-Length", "0"))
        raw_body = self.rfile.read(length) if length else b"{}"
        try:
            payload = json.loads(raw_body.decode("utf-8"))
        except json.JSONDecodeError:
            self.send_error(HTTPStatus.BAD_REQUEST, "Invalid JSON payload")
            return

        if self.path in {"/api/config", "/api/save_snapshot", "/api/ocr", "/api/scene_summary"} and not self._is_authenticated():
            self._send_json({"ok": False, "error": "Unauthorized"})
            return

        if self.path == "/api/config":
            self.engine.apply_config(payload)
            self._send_json({"ok": True})
            return

        if self.path == "/api/register":
            email = str(payload.get("email", "")).strip()
            password = str(payload.get("password", ""))
            if not email or not password:
                self._send_json({"ok": False, "error": "Missing email or password"})
                return
            ok, err = self.db.register_user(email, password)
            self._send_json({"ok": ok, "error": err})
            return

        if self.path == "/api/login":
            email = str(payload.get("email", "")).strip()
            password = str(payload.get("password", ""))
            if not email or not password:
                self._send_json({"ok": False, "error": "Missing email or password"})
                return
            valid = self.db.verify_user(email, password)
            if valid:
                # create JWT and set as httpOnly cookie
                jwt_secret = os.getenv('JWT_SECRET')
                if not jwt_secret:
                    self._send_json({"ok": False, "error": "Server misconfiguration (missing JWT_SECRET)"})
                    return
                exp = int(os.getenv('JWT_EXP', '3600'))
                token = jwt.encode({"email": email, "exp": datetime.datetime.utcnow() + datetime.timedelta(seconds=int(exp))}, jwt_secret, algorithm='HS256')
                # set cookie header
                self.send_response(HTTPStatus.OK)
                self._set_cookie('trinay_auth', token, max_age=int(exp))
                self.end_headers()
                self.wfile.write(json.dumps({"ok": True}).encode('utf-8'))
                return
            else:
                self._send_json({"ok": False, "error": "Invalid credentials"})
            return

        if self.path == "/api/logout":
            # clear cookie
            self.send_response(HTTPStatus.OK)
            self._clear_cookie('trinay_auth')
            self.end_headers()
            self.wfile.write(json.dumps({"ok": True}).encode('utf-8'))
            return

        if self.path == "/api/export_users":
            # protected admin export - requires JWT of ADMIN_EMAIL
            token = self._get_jwt_from_cookie()
            if not token:
                self._send_json({"ok": False, "error": "Unauthorized"})
                return
            payload = self._verify_jwt(token)
            if not payload:
                self._send_json({"ok": False, "error": "Unauthorized"})
                return
            admin_email = os.getenv('MONGODB_ADMIN_EMAIL')
            if not admin_email or payload.get('email') != admin_email:
                self._send_json({"ok": False, "error": "Forbidden"})
                return
            # return list of users (email and created_at)
            try:
                docs = list(self.db.users.find({}, {"email": 1, "created_at": 1, "_id": 0}))
                # convert created_at to isoformat strings
                for d in docs:
                    if isinstance(d.get('created_at'), datetime.datetime):
                        d['created_at'] = d['created_at'].isoformat()
                self._send_json({"ok": True, "users": docs})
            except Exception as exc:
                self._send_json({"ok": False, "error": str(exc)})
            return

        if self.path == "/api/save_snapshot":
            # store arbitrary snapshot payload in DB
            try:
                self.db.save_snapshot(payload)
                self._send_json({"ok": True})
            except Exception as exc:
                self._send_json({"ok": False, "error": str(exc)})
            return

        if self.path == "/api/ocr":
            self._send_json({"ok": False, "error": "OCR integration is disabled"})
            return

        if self.path == "/api/scene_summary":
            self._send_json({"ok": False, "error": "Scene summary integration is disabled"})
            return

        self.send_error(HTTPStatus.NOT_FOUND)
        return

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def _is_authenticated(self) -> bool:
        token = self._get_jwt_from_cookie()
        if not token:
            return False
        return self._verify_jwt(token) is not None

    def _is_public_path(self, path: str) -> bool:
        return path in {
            "/",
            "/index.html",
            "/login.html",
            "/style.css",
            "/script.js",
            "/logo trinay.png",
            "/logo%20trinay.png",
            "/favicon.ico",
        }

    def _redirect_to_login(self) -> None:
        self.send_response(HTTPStatus.FOUND)
        self.send_header("Location", "/login.html")
        self.end_headers()

    def _send_json(self, payload: dict[str, Any]) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _set_cookie(self, name: str, value: str, max_age: int | None = None) -> None:
        cookie = cookies.SimpleCookie()
        cookie[name] = value
        cookie[name]['path'] = '/'
        cookie[name]['httponly'] = True
        cookie[name]['samesite'] = 'Lax'
        if max_age is not None:
            cookie[name]['max-age'] = str(int(max_age))
        # Only send Secure flag when not running on localhost
        self.send_header('Set-Cookie', cookie.output(header='', sep='').strip())

    def _clear_cookie(self, name: str) -> None:
        cookie = cookies.SimpleCookie()
        cookie[name] = ''
        cookie[name]['path'] = '/'
        cookie[name]['httponly'] = True
        cookie[name]['max-age'] = '0'
        cookie[name]['samesite'] = 'Lax'
        self.send_header('Set-Cookie', cookie.output(header='', sep='').strip())

    def _get_jwt_from_cookie(self) -> Optional[str]:
        cookie_header = self.headers.get('Cookie')
        if not cookie_header:
            return None
        cookie = cookies.SimpleCookie()
        cookie.load(cookie_header)
        morsel = cookie.get('trinay_auth')
        if not morsel:
            return None
        return morsel.value

    def _verify_jwt(self, token: str) -> Optional[dict[str, Any]]:
        secret = os.getenv('JWT_SECRET')
        if not secret:
            return None
        try:
            payload = jwt.decode(token, secret, algorithms=['HS256'])
            return payload
        except Exception:
            return None


    def _send_video_stream(self) -> None:
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "multipart/x-mixed-replace; boundary=frame")
        self.end_headers()

        try:
            while True:
                with self.state.lock:
                    frame = None if self.state.latest_frame is None else self.state.latest_frame.copy()
                    detections = [dict(item) for item in self.state.detections]
                    mirror_view = self.engine.mirror_view

                if frame is not None:
                    if mirror_view:
                        frame = cv2.flip(frame, 1)

                    for detection in detections:
                        x1, y1, width, height = detection["bbox"]
                        x2 = x1 + width
                        y2 = y1 + height
                        color = (255, 77, 109) if detection["danger"] else (180, 123, 238)
                        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                        label_text = f"{detection['label']} {detection['confidence'] * 100:.0f}%"
                        if detection["distance_m"] is not None:
                            label_text += f" · {detection['distance_text']}"
                        text_y = max(18, y1 - 8)
                        cv2.putText(frame, label_text, (x1, text_y), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)

                    ok, buffer = cv2.imencode(".jpg", frame)
                    frame = buffer.tobytes() if ok else None

                if frame is None:
                    time.sleep(0.02)
                    continue

                self.wfile.write(b"--frame\r\n")
                self.wfile.write(b"Content-Type: image/jpeg\r\n")
                self.wfile.write(f"Content-Length: {len(frame)}\r\n\r\n".encode("ascii"))
                self.wfile.write(frame)
                self.wfile.write(b"\r\n")
                time.sleep(0.03)
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            return


def main() -> None:
    if not SITE_DIR.exists():
        raise FileNotFoundError(f"Missing site directory: {SITE_DIR}")
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Missing model weights: {MODEL_PATH}")

    mongo_uri = os.getenv("MONGODB_URI")
    mongo_db_name = os.getenv("MONGODB_DB", "trinay")

    state = DetectionState()
    engine = YOLOCameraEngine(MODEL_PATH, state)

    # Initialize DB: prefer MongoDB when configured, otherwise use in-memory DB for local testing.
    if not mongo_uri:
        print("Warning: MONGODB_URI not set — using InMemoryDB for local testing.")
        db = InMemoryDB()
    else:
        try:
            db = DBManager(mongo_uri, mongo_db_name)
        except Exception as exc:
            print(f"Error connecting to MongoDB: {exc}")
            raise

    engine.start()

    handler = partial(TrinayHandler, directory=str(SITE_DIR), state=state, engine=engine, db=db)
    server = ThreadingHTTPServer((HOST, PORT), handler)

    print(f"Serving TRINAY at http://{HOST}:{PORT}/")
    print(f"Live detection stream: http://{HOST}:{PORT}/detect.html")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        engine.stop()
        server.server_close()


if __name__ == "__main__":
    main()
