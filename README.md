# AmarashyamVision

A unified workspace for the TRINAY website and the VisionAssist platform. It includes:

- TRINAY static website with a live detection demo page (browser-based, TF.js COCO-SSD)
- VisionAssist Streamlit app for assistive-vision workflows
- YOLOv8 training scripts and datasets for custom detection models

## Quick Start

Choose what you want to run:

### 1) TRINAY Website + Live YOLOv8 Detection

From the repo root:

```powershell
& .\venv\Scripts\Activate.ps1
python .\trinay-website\server.py
```

Open:

- Main site: http://localhost:8000/
- Live detection: http://localhost:8000/detect.html

The live detection page now streams annotated YOLOv8 webcam frames from the local Python server.

### 2) VisionAssist Streamlit App

From the repo root:

```powershell
cd .\VisionAssist-clean
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
streamlit run app.py
```

Open the URL shown in the terminal (usually http://localhost:8501).

## Project Structure (top-level)

```
amarashyamvision/
  trinay-website/
    index.html
    detect.html
    detect.js
    detect.css
    models/
  VisionAssist-clean/
    app.py
    config/
    docs/
    models/
    reports/
    src/
  combined_dataset/
  Doors and Stairs.v1i.yolov8/
  fall detection.v1i.yolov8/
  train_combined.py
  train_custom_models.py
  yolov8n.pt
```

## Model Training (YOLOv8)

Install training dependency once:

```powershell
pip install ultralytics
```

### Train doors/stairs + fall detection

```powershell
python .\train_custom_models.py
```

Outputs:

- trinay-website/models/doors_stairs.pt
- trinay-website/models/fall_detection.pt
- ONNX exports in the same folder

### Train combined dataset

```powershell
python .\train_combined.py
```

Outputs:

- trinay-website/models/custom_yolov8n.pt
- TFJS export under trinay-website/models/runs/

## Notes

- If you serve the TRINAY website from the trinay-website folder, URLs are relative to that folder.
- If the logo shows 404, ensure trinay-website/logo trinay.png exists.
- The default detector uses the root-level yolov8n.pt weights.
- To reset training outputs, delete trinay-website/models/runs/ and trinay-website/models/*.pt.

## Troubleshooting

- Camera access: grant browser permissions for the live detection page.
- Slow training: reduce epochs or image size in train_custom_models.py / train_combined.py.
- GPU training: update the scripts to use device=0 when CUDA is available.
