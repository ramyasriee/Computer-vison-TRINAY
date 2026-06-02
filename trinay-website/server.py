from __future__ import annotations

from pathlib import Path
import runpy
import sys


ROOT_DIR = Path(__file__).resolve().parent.parent
TARGET = ROOT_DIR / "trinay_website_server.py"

if not TARGET.exists():
    raise FileNotFoundError(f"Missing server entrypoint: {TARGET}")

# Ensure root imports resolve the same way when started from trinay-website/.
sys.path.insert(0, str(ROOT_DIR))
runpy.run_path(str(TARGET), run_name="__main__")
