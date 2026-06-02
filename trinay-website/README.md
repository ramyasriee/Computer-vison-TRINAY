# TRINAY Website

This folder contains the static TRINAY pages and the local launcher for live YOLOv8 detection.

## Run Live Detection

From the workspace root:

```powershell
& .\venv\Scripts\Activate.ps1
python .\trinay-website\server.py
```

Open:

- Main site: http://127.0.0.1:8000/
- Live detection: http://127.0.0.1:8000/detect.html

## Notes

- `server.py` launches the optimized local backend used by `detect.html`.
- Model path defaults to `yolov8n.pt` at the workspace root.
