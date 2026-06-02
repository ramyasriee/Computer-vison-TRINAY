from ultralytics import YOLO
from pathlib import Path
import sys

BASE = Path(__file__).resolve().parent

yaml_path = BASE / "combined_dataset" / "data.yaml"
if not yaml_path.exists():
    print(f"Error: {yaml_path} not found.")
    sys.exit(1)

outdir = BASE / "trinay-website" / "models"
outdir.mkdir(parents=True, exist_ok=True)

# Train the model
model = YOLO(str(BASE / "yolov8n.pt"))
results = model.train(
    data=str(yaml_path),
    epochs=25, # Short epochs to save time, adjust if needed
    imgsz=416,
    batch=16,
    name="trinay_custom",
    project=str(outdir / "runs"),
    device="cpu", # Change to 0 for GPU if available
    verbose=True
)

# Export to TFJS
best_pt = Path(results.save_dir) / "weights" / "best.pt"
if best_pt.exists():
    import shutil
    shutil.copy(best_pt, outdir / "custom_yolov8n.pt")
    
    # Exporting directly via python api
    model_best = YOLO(str(outdir / "custom_yolov8n.pt"))
    model_best.export(format="tfjs", imgsz=416)
    print("Training and TFJS export complete!")
else:
    print("Training failed or best.pt not found.")
