"""
TRINAY — Custom YOLOv8 Training Script
Trains separate models for:
  1. Doors & Stairs (door, stairs, window)
  2. Fall Detection (fall)
Then exports both to ONNX for fast local inference.

Run from the project root:
  python train_custom_models.py

Requirements:
  pip install ultralytics
"""

from pathlib import Path
import sys

try:
    from ultralytics import YOLO
except ImportError:
    print("ERROR: ultralytics not installed. Run:  pip install ultralytics")
    sys.exit(1)

BASE = Path(__file__).resolve().parent

DATASETS = [
    {
        "name": "doors_stairs",
        "yaml": BASE / "Doors and Stairs.v1i.yolov8" / "data.yaml",
        "output": BASE / "trinay-website" / "models" / "doors_stairs.pt",
    },
    {
        "name": "fall_detection",
        "yaml": BASE / "fall detection.v1i.yolov8" / "data.yaml",
        "output": BASE / "trinay-website" / "models" / "fall_detection.pt",
    },
]

EPOCHS    = 30   # increase to 50–100 for better accuracy; 30 is fast
IMG_SIZE  = 416  # smaller = faster training; 640 for best accuracy
BATCH     = 16
BASE_WEIGHTS = BASE / "yolov8n.pt"


def train_model(cfg: dict):
    name   = cfg["name"]
    yaml   = str(cfg["yaml"])
    outdir = cfg["output"].parent
    outdir.mkdir(parents=True, exist_ok=True)

    print(f"\n{'='*60}")
    print(f"  Training: {name}")
    print(f"  Dataset : {yaml}")
    print(f"{'='*60}\n")

    model = YOLO(str(BASE_WEIGHTS))
    results = model.train(
        data=yaml,
        epochs=EPOCHS,
        imgsz=IMG_SIZE,
        batch=BATCH,
        name=name,
        project=str(outdir / "runs"),
        patience=10,
        device="cpu",   # change to 0 if you have a CUDA GPU
        verbose=True,
    )

    # Copy best weights to models dir
    best_pt = Path(results.save_dir) / "weights" / "best.pt"
    if best_pt.exists():
        import shutil
        shutil.copy(best_pt, cfg["output"])
        print(f"\n  Saved best weights → {cfg['output']}")
    else:
        print(f"\n  WARNING: best.pt not found at {best_pt}")

    # Export to ONNX for inference server
    onnx_path = cfg["output"].with_suffix(".onnx")
    print(f"  Exporting to ONNX → {onnx_path}")
    model_best = YOLO(str(cfg["output"]))
    model_best.export(format="onnx", imgsz=IMG_SIZE, simplify=True)
    print(f"  ONNX export done.")


if __name__ == "__main__":
    for ds in DATASETS:
        if not ds["yaml"].exists():
            print(f"SKIP {ds['name']}: dataset not found at {ds['yaml']}")
            continue
        train_model(ds)

    print("\n\nAll training complete!")
    print("Run the inference server with:  python inference_server.py")
