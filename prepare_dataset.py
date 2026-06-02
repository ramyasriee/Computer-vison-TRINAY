import os
import shutil
from pathlib import Path
import yaml

base_dir = Path(r"c:\Users\ramya\Documents\amarashyamvision")
ds1_dir = base_dir / "Doors and Stairs.v1i.yolov8"
ds2_dir = base_dir / "fall detection.v1i.yolov8"
out_dir = base_dir / "combined_dataset"

def process_dataset(src_dir, split, class_offset, is_ds1):
    src_images = src_dir / split / "images"
    src_labels = src_dir / split / "labels"
    
    if not src_images.exists() or not src_labels.exists():
        return

    dest_images = out_dir / split / "images"
    dest_labels = out_dir / split / "labels"
    
    dest_images.mkdir(parents=True, exist_ok=True)
    dest_labels.mkdir(parents=True, exist_ok=True)

    prefix = "ds1_" if is_ds1 else "ds2_"
    
    for img_file in src_images.glob("*.jpg"):
        shutil.copy(img_file, dest_images / f"{prefix}{img_file.name}")
        
        lbl_file = src_labels / f"{img_file.stem}.txt"
        dest_lbl = dest_labels / f"{prefix}{img_file.stem}.txt"
        
        if lbl_file.exists():
            with open(lbl_file, "r") as f:
                lines = f.readlines()
            
            with open(dest_lbl, "w") as f:
                for line in lines:
                    parts = line.strip().split()
                    if parts:
                        cls_id = int(parts[0])
                        parts[0] = str(cls_id + class_offset)
                        f.write(" ".join(parts) + "\n")

# Process train, valid, test
for split in ["train", "valid", "test"]:
    process_dataset(ds1_dir, split, 0, True)
    process_dataset(ds2_dir, split, 3, False)

# Create data.yaml
yaml_content = {
    "train": f"{out_dir}/train/images",
    "val": f"{out_dir}/valid/images",
    "test": f"{out_dir}/test/images",
    "nc": 4,
    "names": ["door", "stairs", "window", "fall"]
}

with open(out_dir / "data.yaml", "w") as f:
    yaml.dump(yaml_content, f)

print("Dataset combination complete. YAML written to:", out_dir / "data.yaml")
