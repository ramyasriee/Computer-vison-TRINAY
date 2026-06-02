"use strict";

const state = {
  visible: true,
  voiceEnabled: true,
  proximityBeepEnabled: false,
  spatialAudioEnabled: false,
  environmentModeEnabled: false,
  environmentPreset: "outdoor",
  ambientLightWarningEnabled: false,
  ambientDarkLatched: false,
  alertId: -1,
  pollTimer: null,
  alertTimer: null,
  proximityPulseTimer: null,
  lastProximityBeepAt: 0,
  lastEnvironmentAlertKey: "",
  latestDetections: [],
  audioContext: null,
  ocrBusy: false,
  summaryBusy: false,
  lastConfig: {
    confidence_threshold: null,
    danger_threshold_m: null,
    mirror_view: null,
  },
};

let statusDot;
let startBtn;
let startBtnText;
let startBtnIcon;
let alertBanner;
let alertBannerText;
let placeholder;
let metricObjects;
let metricClosest;
let metricDist;
let metricAlerts;
let statObjects;
let statAlerts;
let statFPS;
let detectList;
let confSlider;
let confVal;
let distSlider;
let distVal;
let toggleMirror;
let toggleEnvironment;
let toggleVoice;
let toggleBeep;
let toggleSpatial;
let toggleAmbientLight;
let modeOutdoor;
let modeIndoor;
let streamFrame;
let logoutBtn;
let userEmailElem;
let accountNameElem;
let accountEmailElem;
let accountSummaryElem;
let recentObjectsElem;
let captureCanvas;
let captureCtx;
let brightnessCanvas;
let brightnessCtx;
let sigCanvas;
let sigCtx;
let currentUser = null;

const RECENT_OBJECTS_KEY = "trinay_recent_objects";
const USER_EMAIL_KEY = "trinay_user_email";
const USER_NAME_KEY = "trinay_user_name";
const FRAME_WIDTH = 640;
const FRAME_HEIGHT = 360;
const PROXIMITY_BEEP_MAX_INTERVAL_MS = 1600;
const PROXIMITY_BEEP_MIN_INTERVAL_MS = 220;
const PROXIMITY_BEEP_ACTIVATION_RATIO = 0.02;
const PROXIMITY_BEEP_DANGER_RATIO = 0.035;
const PROXIMITY_BEEP_PULSE_MS = 100;
const PROXIMITY_BEEP_DURATION_MS = 110;
const PROXIMITY_BEEP_FREQUENCY = 880;
const SPATIAL_PAN_LEFT = -0.9;
const SPATIAL_PAN_CENTER = 0;
const SPATIAL_PAN_RIGHT = 0.9;
const AMBIENT_LIGHT_THRESHOLD = 40;
const AMBIENT_LIGHT_RESET_THRESHOLD = 48;
const BRIGHTNESS_SAMPLE_WIDTH = 32;
const BRIGHTNESS_SAMPLE_HEIGHT = 18;
const ENVIRONMENT_PRESETS = {
  outdoor: {
    label: "Outdoor",
    classIds: new Set([0, 2, 5, 9, 16]),
    labels: new Set(["person", "car", "bus", "traffic light", "dog"]),
  },
  indoor: {
    label: "Indoor",
    classIds: new Set([56, 57, 59, 60]),
    labels: new Set(["chair", "couch", "bed", "dining table", "door"]),
  },
};

function formatRelativeTime(timestamp) {
  const diffMs = Math.max(0, Date.now() - timestamp);
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes === 1) return "1 min ago";
  if (minutes < 60) return `${minutes} mins ago`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return "1 hour ago";
  return `${hours} hours ago`;
}

function loadRecentObjects() {
  try {
    const raw = window.localStorage.getItem(RECENT_OBJECTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function saveRecentObjects(items) {
  window.localStorage.setItem(RECENT_OBJECTS_KEY, JSON.stringify(items.slice(0, 8)));
}

function renderRecentObjects(items) {
  if (!recentObjectsElem) return;
  if (!items.length) {
    recentObjectsElem.innerHTML = '<div style="color:var(--muted);font-size:0.8rem;padding:0.3rem 0;">No recent objects yet.</div>';
    return;
  }

  recentObjectsElem.replaceChildren();
  items.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'recent-item';
    row.innerHTML = `
      <span class="r-label">${item.label}</span>
      <span class="r-count">${item.count}x</span>
      <span class="r-last">${formatRelativeTime(item.lastSeen)}</span>`;
    recentObjectsElem.appendChild(row);
  });
}

function updateRecentObjects(detections) {
  if (!detections || !detections.length) return;
  const items = loadRecentObjects();
  const indexByLabel = new Map(items.map((item, index) => [item.label, index]));

  detections.forEach((detection) => {
    const label = detection.label || 'Unknown';
    const now = Date.now();
    const existingIndex = indexByLabel.get(label);
    if (existingIndex !== undefined) {
      const existing = items[existingIndex];
      existing.count += 1;
      existing.lastSeen = now;
      existing.bestConfidence = Math.max(existing.bestConfidence || 0, detection.confidence || 0);
    } else {
      items.push({
        label,
        count: 1,
        lastSeen: now,
        bestConfidence: detection.confidence || 0,
      });
    }
  });

  items.sort((a, b) => b.count - a.count || b.lastSeen - a.lastSeen);
  saveRecentObjects(items);
  renderRecentObjects(items.slice(0, 6));

  if (currentUser) {
    setAccountPanel(currentUser, items.slice(0, 6));
  }
}

function setAccountPanel(user, stats) {
  if (!user || !user.email) return;
  const email = user.email;
  const displayName = user.display_name || email.split('@', 1)[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase());
  if (userEmailElem) userEmailElem.textContent = displayName;
  if (accountNameElem) accountNameElem.textContent = displayName;
  if (accountEmailElem) accountEmailElem.textContent = email;
  if (accountSummaryElem) {
    const topLabels = (stats || []).slice(0, 3).map((item) => `${item.label} (${item.count})`).join(', ');
    accountSummaryElem.textContent = topLabels ? `Recent detections: ${topLabels}.` : 'Recent detections will appear here after you use live detection.';
  }
  window.localStorage.setItem(USER_EMAIL_KEY, email);
  window.localStorage.setItem(USER_NAME_KEY, displayName);
}

function speak(text) {
  if (!state.voiceEnabled || !window.speechSynthesis) {
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.05;
  utterance.pitch = 1;
  utterance.volume = 1;

  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find((voice) => voice.lang && voice.lang.startsWith && voice.lang.startsWith("en") && voice.name && voice.name.toLowerCase().includes("natural"))
    || voices.find((voice) => voice.lang && voice.lang.startsWith && voice.lang.startsWith("en"))
    || voices[0];

  if (preferred) {
    utterance.voice = preferred;
  }

  window.speechSynthesis.speak(utterance);
}

function getFrameBrightness() {
  if (!streamFrame || !streamFrame.complete || streamFrame.naturalWidth === 0) {
    return null;
  }

  if (!brightnessCanvas) {
    brightnessCanvas = document.createElement("canvas");
    brightnessCtx = brightnessCanvas.getContext("2d", { willReadFrequently: true });
  }

  if (!brightnessCtx) {
    return null;
  }

  brightnessCanvas.width = BRIGHTNESS_SAMPLE_WIDTH;
  brightnessCanvas.height = BRIGHTNESS_SAMPLE_HEIGHT;
  brightnessCtx.drawImage(streamFrame, 0, 0, BRIGHTNESS_SAMPLE_WIDTH, BRIGHTNESS_SAMPLE_HEIGHT);

  const imageData = brightnessCtx.getImageData(0, 0, BRIGHTNESS_SAMPLE_WIDTH, BRIGHTNESS_SAMPLE_HEIGHT).data;
  let sum = 0;
  let pixels = 0;

  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    sum += (0.299 * r) + (0.587 * g) + (0.114 * b);
    pixels += 1;
  }

  return pixels > 0 ? sum / pixels : null;
}

function maybeWarnAmbientLight() {
  if (!state.visible || !state.ambientLightWarningEnabled) {
    state.ambientDarkLatched = false;
    return;
  }

  const brightness = getFrameBrightness();
  if (brightness === null) {
    return;
  }

  if (brightness >= AMBIENT_LIGHT_RESET_THRESHOLD) {
    state.ambientDarkLatched = false;
    return;
  }

  if (brightness < AMBIENT_LIGHT_THRESHOLD && !state.ambientDarkLatched) {
    state.ambientDarkLatched = true;
    speak("Warning. Environment too dark. Detection accuracy reduced.");
  }
}

function getEnvironmentPreset() {
  return ENVIRONMENT_PRESETS[state.environmentPreset] || ENVIRONMENT_PRESETS.outdoor;
}

function isEnvironmentFilteredDetection(detection) {
  if (!state.environmentModeEnabled) {
    return true;
  }

  const preset = getEnvironmentPreset();
  const classId = Number(detection?.class_id);
  const label = String(detection?.label || "").trim().toLowerCase();

  if (Number.isFinite(classId) && preset.classIds.has(classId)) {
    return true;
  }

  return preset.labels.has(label);
}

function getEnvironmentFilteredDetections(detections) {
  if (!Array.isArray(detections)) {
    return [];
  }

  return detections.filter(isEnvironmentFilteredDetection);
}

function getFilteredDangerDetections(detections) {
  return getEnvironmentFilteredDetections(detections).filter((detection) => Boolean(detection?.danger));
}

function getEnvironmentAlertKey(detections) {
  return detections
    .map((detection) => `${detection.class_id ?? detection.label}:${detection.label}:${detection.distance_text}`)
    .join("|");
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getProximityProfile(detections) {
  const filteredDetections = getEnvironmentFilteredDetections(detections);
  if (!Array.isArray(filteredDetections) || filteredDetections.length === 0) {
    return null;
  }

  let strongestDetection = null;
  let strongestAreaRatio = 0;

  filteredDetections.forEach((detection) => {
    const bbox = Array.isArray(detection.bbox) ? detection.bbox : null;
    if (!bbox || bbox.length < 4) {
      return;
    }

    const width = Number(bbox[2]);
    const height = Number(bbox[3]);
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      return;
    }

    const areaRatio = (width * height) / (FRAME_WIDTH * FRAME_HEIGHT);
    if (areaRatio > strongestAreaRatio) {
      strongestAreaRatio = areaRatio;
      strongestDetection = detection;
    }
  });

  if (!strongestDetection || strongestAreaRatio < PROXIMITY_BEEP_ACTIVATION_RATIO) {
    return null;
  }

  const normalizedArea = strongestAreaRatio / PROXIMITY_BEEP_DANGER_RATIO;
  const intervalMs = clamp(
    Math.round(PROXIMITY_BEEP_MAX_INTERVAL_MS / Math.max(normalizedArea, 0.25)),
    PROXIMITY_BEEP_MIN_INTERVAL_MS,
    PROXIMITY_BEEP_MAX_INTERVAL_MS,
  );

  return {
    label: strongestDetection.label || "Unknown",
    areaRatio: strongestAreaRatio,
    intervalMs,
    centerX: strongestDetection.bbox && Array.isArray(strongestDetection.bbox) ? Number(strongestDetection.bbox[0]) + (Number(strongestDetection.bbox[2]) / 2) : null,
    isDanger: Boolean(strongestDetection.danger) || strongestAreaRatio >= PROXIMITY_BEEP_DANGER_RATIO,
  };
}

function getSpatialPan(centerX) {
  if (!Number.isFinite(centerX)) {
    return SPATIAL_PAN_CENTER;
  }

  const leftBoundary = FRAME_WIDTH / 3;
  const rightBoundary = (FRAME_WIDTH / 3) * 2;

  if (centerX < leftBoundary) {
    return SPATIAL_PAN_LEFT;
  }

  if (centerX > rightBoundary) {
    return SPATIAL_PAN_RIGHT;
  }

  return SPATIAL_PAN_CENTER;
}

async function playProximityBeep() {
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) {
    return;
  }

  if (!state.audioContext) {
    state.audioContext = new AudioCtor();
  }

  if (state.audioContext.state === "suspended") {
    try {
      await state.audioContext.resume();
    } catch (_) {
      return;
    }
  }

  const context = state.audioContext;
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  const pannerNode = state.spatialAudioEnabled && typeof context.createStereoPanner === "function"
    ? context.createStereoPanner()
    : null;
  const profile = getProximityProfile(state.latestDetections);

  oscillator.type = "sine";
  oscillator.frequency.value = PROXIMITY_BEEP_FREQUENCY;
  gainNode.gain.value = 0.0001;

  if (pannerNode && profile) {
    pannerNode.pan.value = getSpatialPan(profile.centerX);
  }

  if (pannerNode) {
    oscillator.connect(pannerNode);
    pannerNode.connect(gainNode);
  } else {
    oscillator.connect(gainNode);
  }

  gainNode.connect(context.destination);

  const now = context.currentTime;
  gainNode.gain.exponentialRampToValueAtTime(0.18, now + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + (PROXIMITY_BEEP_DURATION_MS / 1000));

  oscillator.start(now);
  oscillator.stop(now + (PROXIMITY_BEEP_DURATION_MS / 1000) + 0.01);

  oscillator.onended = () => {
    try {
      if (pannerNode) {
        pannerNode.disconnect();
      }
      oscillator.disconnect();
      gainNode.disconnect();
    } catch (_) {
      // Ignore teardown errors from already-closed audio nodes.
    }
  };
}

function stopProximityBeep() {
  window.clearInterval(state.proximityPulseTimer);
  state.proximityPulseTimer = null;
  state.lastProximityBeepAt = 0;

  if (state.audioContext) {
    const context = state.audioContext;
    state.audioContext = null;
    try {
      void context.close().catch(() => {});
    } catch (_) {
      // Ignore close failures and drop the reference either way.
    }
  }
}

function startProximityBeep() {
  if (state.proximityPulseTimer || !state.visible || !state.proximityBeepEnabled) {
    return;
  }

  state.proximityPulseTimer = window.setInterval(() => {
    if (!state.visible || !state.proximityBeepEnabled) {
      stopProximityBeep();
      return;
    }

    const profile = getProximityProfile(state.latestDetections);
    if (!profile) {
      return;
    }

    const now = Date.now();
    if (now - state.lastProximityBeepAt < profile.intervalMs) {
      return;
    }

    state.lastProximityBeepAt = now;
    void playProximityBeep();
  }, PROXIMITY_BEEP_PULSE_MS);
}

function syncProximityBeep() {
  if (!state.visible || !state.proximityBeepEnabled) {
    stopProximityBeep();
    return;
  }

  const profile = getProximityProfile(state.latestDetections);
  if (!profile) {
    if (state.proximityPulseTimer) {
      stopProximityBeep();
    }
    return;
  }

  startProximityBeep();
}

async function pushConfig(payload) {
  const keys = Object.keys(payload);
  let changed = false;

  keys.forEach((key) => {
    if (state.lastConfig[key] !== payload[key]) {
      changed = true;
    }
  });

  if (!changed) {
    return;
  }

  keys.forEach((key) => {
    state.lastConfig[key] = payload[key];
  });

  try {
    await fetch("/api/config", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (_) {
    // Status polling will show failures.
  }
}

function debounce(fn, delayMs) {
  let timer = null;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delayMs);
  };
}

function renderDetections(detections) {
  if (!detections || detections.length === 0) {
    const empty = document.createElement("div");
    empty.style.color = "var(--muted)";
    empty.style.fontSize = "0.8rem";
    empty.style.padding = "0.3rem 0";
    empty.textContent = "No objects detected";
    detectList.replaceChildren(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  detections.forEach((detection) => {
    const item = document.createElement("div");
    item.className = `detect-item${detection.danger ? " near" : ""}`;
    item.innerHTML = `
      <span class="d-label">${detection.label}</span>
      <span class="d-dist">${detection.distance_text}</span>
      <span class="d-conf">${Math.round(detection.confidence * 100)}%</span>`;
    fragment.appendChild(item);
  });

  detectList.replaceChildren(fragment);
  updateRecentObjects(detections);
}

async function refreshStatus() {
  try {
    const response = await fetch("/api/status", { cache: "no-store" });
    const data = await response.json();
    state.latestDetections = Array.isArray(data.detections) ? data.detections : [];

    statusDot.className = data.error ? "status-dot error" : data.camera_active ? "status-dot live" : "status-dot";
    metricObjects.querySelector(".val").textContent = data.objects;
    metricClosest.querySelector(".val").textContent = data.nearest_label || "—";
    metricDist.querySelector(".val").textContent = data.nearest_distance_text || "—";
    metricAlerts.querySelector(".val").textContent = data.alerts;
    statObjects.textContent = data.total_detections;
    statAlerts.textContent = data.alerts;
    statFPS.textContent = data.fps ? data.fps.toFixed(0) : "—";

    if (data.error) {
      placeholder.style.display = "flex";
      placeholder.querySelector("p").textContent = data.error;
    } else if (state.visible) {
      placeholder.style.display = "none";
    }

    renderDetections(data.detections || []);
    syncProximityBeep();
    maybeWarnAmbientLight();

    const filteredDangerDetections = getFilteredDangerDetections(state.latestDetections);
    if (state.environmentModeEnabled) {
      const environmentAlertKey = getEnvironmentAlertKey(filteredDangerDetections);
      if (environmentAlertKey && environmentAlertKey !== state.lastEnvironmentAlertKey) {
        state.lastEnvironmentAlertKey = environmentAlertKey;
        const target = filteredDangerDetections[0];
        if (target) {
          const alertText = `Warning! ${target.label} is ${target.distance_text || target.distanceText || "close"} away.`;
          alertBannerText.textContent = alertText;
          alertBanner.classList.add("visible");
          window.clearTimeout(state.alertTimer);
          state.alertTimer = window.setTimeout(() => alertBanner.classList.remove("visible"), 2500);
          speak(alertText.replace(/^warning!?\s*/i, ""));
        }
      } else if (!environmentAlertKey) {
        state.lastEnvironmentAlertKey = "";
      }
    } else if (state.visible && data.alert_id !== state.alertId) {
      state.alertId = data.alert_id;
      if (data.alert_text) {
        alertBannerText.textContent = data.alert_text;
        alertBanner.classList.add("visible");
        window.clearTimeout(state.alertTimer);
        state.alertTimer = window.setTimeout(() => alertBanner.classList.remove("visible"), 2500);
        const speechText = data.alert_text.replace(/^warning!?\s*/i, "");
        speak(speechText);
      }
    }

    if (data.nearest_distance_m !== null && data.nearest_distance_m !== undefined && data.nearest_distance_m <= parseFloat(distSlider.value)) {
      metricDist.classList.add("danger-active");
    } else {
      metricDist.classList.remove("danger-active");
    }
  } catch (_) {
    statusDot.className = "status-dot error";
    placeholder.style.display = "flex";
    placeholder.querySelector("p").textContent = "Unable to reach the local detection server.";
  }
}

function startView() {
  state.visible = true;
  streamFrame.src = "/video_feed";
  placeholder.style.display = "none";
  startBtnText.textContent = "Hide Camera";
  startBtnIcon.textContent = "⏸";
  startBtn.classList.add("stopping");
  syncProximityBeep();

  if (!state.pollTimer) {
    refreshStatus();
    state.pollTimer = window.setInterval(refreshStatus, 1000);
  }
}

function stopView() {
  state.visible = false;
  streamFrame.removeAttribute("src");
  placeholder.style.display = "flex";
  startBtnText.textContent = "Show Camera";
  startBtnIcon.textContent = "📷";
  startBtn.classList.remove("stopping");

  alertBanner.classList.remove("visible");
  window.clearTimeout(state.alertTimer);
  window.speechSynthesis?.cancel();
  stopProximityBeep();
  state.ambientDarkLatched = false;

  if (state.pollTimer) {
    window.clearInterval(state.pollTimer);
    state.pollTimer = null;
  }
}

function buildSignature(imageData) {
  const data = imageData.data;
  const sig = new Array(data.length / 4);
  let idx = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    sig[idx++] = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  }
  return sig;
}

function captureFrame({ maxWidth = 720, quality = 0.7 } = {}) {
  if (!streamFrame || !streamFrame.complete || streamFrame.naturalWidth === 0) {
    return null;
  }

  const aspect = streamFrame.naturalHeight / streamFrame.naturalWidth;
  const targetW = Math.min(maxWidth, streamFrame.naturalWidth);
  const targetH = Math.max(1, Math.round(targetW * aspect));

  if (!captureCanvas) {
    captureCanvas = document.createElement("canvas");
    captureCtx = captureCanvas.getContext("2d");
  }

  captureCanvas.width = targetW;
  captureCanvas.height = targetH;
  captureCtx.drawImage(streamFrame, 0, 0, targetW, targetH);
  const dataUrl = captureCanvas.toDataURL("image/jpeg", quality);
  const parts = dataUrl.split(",");

  if (!sigCanvas) {
    sigCanvas = document.createElement("canvas");
    sigCtx = sigCanvas.getContext("2d");
  }

  sigCanvas.width = 16;
  sigCanvas.height = 9;
  sigCtx.drawImage(streamFrame, 0, 0, 16, 9);
  const sigData = sigCtx.getImageData(0, 0, 16, 9);
  const signature = buildSignature(sigData);

  return {
    image_base64: parts.length > 1 ? parts[1] : dataUrl,
    mime_type: "image/jpeg",
    width: targetW,
    height: targetH,
    signature,
    dataUrl,
  };
}

function getFramePayload() {
  const frame = captureFrame({ maxWidth: 720, quality: 0.7 });
  if (!frame) {
    return null;
  }
  return { image_base64: frame.image_base64, mime_type: frame.mime_type };
}

window.addEventListener("DOMContentLoaded", () => {
  statusDot = document.getElementById("status-dot");
  startBtn = document.getElementById("start-btn");
  startBtnText = document.getElementById("start-btn-text");
  startBtnIcon = document.getElementById("start-btn-icon");
  alertBanner = document.getElementById("alert-banner");
  alertBannerText = document.getElementById("alert-text");
  placeholder = document.getElementById("camera-placeholder");
  metricObjects = document.getElementById("metric-objects");
  metricClosest = document.getElementById("metric-closest");
  metricDist = document.getElementById("metric-dist");
  metricAlerts = document.getElementById("metric-alerts");
  statObjects = document.getElementById("stat-objects");
  statAlerts = document.getElementById("stat-alerts");
  statFPS = document.getElementById("stat-fps");
  detectList = document.getElementById("detect-list");
  confSlider = document.getElementById("conf-slider");
  confVal = document.getElementById("conf-val");
  distSlider = document.getElementById("dist-slider");
  distVal = document.getElementById("dist-val");
  toggleMirror = document.getElementById("toggle-mirror");
  toggleEnvironment = document.getElementById("toggle-environment");
  toggleVoice = document.getElementById("toggle-voice");
  toggleBeep = document.getElementById("toggle-beep");
  toggleSpatial = document.getElementById("toggle-spatial");
  toggleAmbientLight = document.getElementById("toggle-ambient-light");
  modeOutdoor = document.getElementById("mode-outdoor");
  modeIndoor = document.getElementById("mode-indoor");
  streamFrame = document.getElementById("overlay-canvas");
  logoutBtn = document.getElementById("logout-btn");
  userEmailElem = document.getElementById("user-email");
  accountNameElem = document.getElementById("account-name");
  accountEmailElem = document.getElementById("account-email");
  accountSummaryElem = document.getElementById("account-summary");
  recentObjectsElem = document.getElementById("recent-objects");
  const saveBtn = document.getElementById("save-snapshot-btn");

  streamFrame.addEventListener("load", () => {
    if (state.visible) {
      placeholder.style.display = "none";
    }
  });

  streamFrame.addEventListener("error", () => {
    placeholder.style.display = "flex";
    placeholder.querySelector("p").textContent = "The local video stream is not available yet.";
    statusDot.className = "status-dot error";
  });

  startBtn.addEventListener("click", () => {
    if (state.visible) {
      stopView();
    } else {
      startView();
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await fetch("/api/logout", { method: "POST" });
        window.localStorage.removeItem(USER_EMAIL_KEY);
        window.localStorage.removeItem(USER_NAME_KEY);
      } finally {
        window.location.href = "/index.html";
      }
    });
  }

  const pushConfidenceDebounced = debounce((value) => {
    void pushConfig({ confidence_threshold: value });
  }, 180);

  const pushDangerDebounced = debounce((value) => {
    void pushConfig({ danger_threshold_m: value });
  }, 180);

  confSlider.addEventListener("input", () => {
    const value = parseFloat(confSlider.value);
    confVal.textContent = `${Math.round(value * 100)}%`;
    pushConfidenceDebounced(value);
  });

  distSlider.addEventListener("input", () => {
    const value = parseFloat(distSlider.value);
    distVal.textContent = `${value.toFixed(1)} m`;
    pushDangerDebounced(value);
  });

  toggleMirror.addEventListener("change", () => {
    void pushConfig({ mirror_view: toggleMirror.checked });
  });

  function updateEnvironmentModeUi() {
    const enabled = toggleEnvironment.checked;
    modeOutdoor.disabled = !enabled;
    modeIndoor.disabled = !enabled;
    modeOutdoor.classList.toggle("active", enabled && state.environmentPreset === "outdoor");
    modeIndoor.classList.toggle("active", enabled && state.environmentPreset === "indoor");
  }

  toggleEnvironment.addEventListener("change", () => {
    state.environmentModeEnabled = toggleEnvironment.checked;
    if (!state.environmentModeEnabled) {
      state.lastEnvironmentAlertKey = "";
    }
    updateEnvironmentModeUi();
    syncProximityBeep();
  });

  modeOutdoor.addEventListener("click", () => {
    state.environmentPreset = "outdoor";
    state.environmentModeEnabled = true;
    toggleEnvironment.checked = true;
    updateEnvironmentModeUi();
    state.lastEnvironmentAlertKey = "";
    syncProximityBeep();
  });

  modeIndoor.addEventListener("click", () => {
    state.environmentPreset = "indoor";
    state.environmentModeEnabled = true;
    toggleEnvironment.checked = true;
    updateEnvironmentModeUi();
    state.lastEnvironmentAlertKey = "";
    syncProximityBeep();
  });

  toggleVoice.addEventListener("change", () => {
    state.voiceEnabled = toggleVoice.checked;
  });

  toggleBeep.addEventListener("change", () => {
    state.proximityBeepEnabled = toggleBeep.checked;
    if (state.proximityBeepEnabled) {
      state.lastProximityBeepAt = 0;
      syncProximityBeep();
    } else {
      stopProximityBeep();
    }
  });

  toggleSpatial.addEventListener("change", () => {
    state.spatialAudioEnabled = toggleSpatial.checked;
    if (state.proximityBeepEnabled) {
      syncProximityBeep();
    }
  });

  toggleAmbientLight.addEventListener("change", () => {
    state.ambientLightWarningEnabled = toggleAmbientLight.checked;
    state.ambientDarkLatched = false;
    if (state.ambientLightWarningEnabled) {
      maybeWarnAmbientLight();
    }
  });

  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      const frame = captureFrame({ maxWidth: 1024, quality: 0.9 });
      if (!frame) {
        alert("No camera frame available yet.");
        return;
      }

      // download image locally
      const link = document.createElement("a");
      link.href = frame.dataUrl;
      link.download = `trinay_snapshot_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      // post to server for storage (best-effort)
      try {
        await fetch("/api/save_snapshot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image_base64: frame.image_base64, mime_type: frame.mime_type, width: frame.width, height: frame.height, captured_at: Date.now() }),
        });
      } catch (_) {
        // ignore server errors
      }
    });
  }

  async function resolveAuthAndStart() {
    try {
      const res = await fetch('/api/whoami', { cache: 'no-store' });
      const data = await res.json();
      if (data && data.ok && data.user && data.user.email) {
        currentUser = data.user;
        setAccountPanel(data.user, loadRecentObjects());
        renderRecentObjects(loadRecentObjects().slice(0, 6));
        startView();
        return;
      }
    } catch (_) {
      // fall through to redirect
    }

    window.location.href = '/login.html?next=detect.html';
  }

  confVal.textContent = `${Math.round(parseFloat(confSlider.value) * 100)}%`;
  distVal.textContent = `${parseFloat(distSlider.value).toFixed(1)} m`;
  state.voiceEnabled = toggleVoice.checked;
  state.proximityBeepEnabled = toggleBeep.checked;
  state.spatialAudioEnabled = toggleSpatial.checked;
  state.ambientLightWarningEnabled = toggleAmbientLight.checked;
  state.environmentModeEnabled = toggleEnvironment.checked;
  updateEnvironmentModeUi();

  void pushConfig({
    confidence_threshold: parseFloat(confSlider.value),
    danger_threshold_m: parseFloat(distSlider.value),
    mirror_view: toggleMirror.checked,
  });

  resolveAuthAndStart();
});
