from __future__ import annotations

import json
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
RUNTIME_FILES = (
    "manifest.json",
    "rules.json",
    "src/background.js",
    "src/content.js",
    "ui/popup.html",
    "ui/popup.js",
    "ui/styles.css",
    "assets/icon16.png",
    "assets/icon48.png",
    "assets/icon128.png",
)


def package_name() -> str:
    manifest = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))
    version = manifest["version"].replace(".", "-")
    return f"web-stream-optimizer-{version}.zip"


def build_package() -> Path:
    missing = [relative for relative in RUNTIME_FILES if not (ROOT / relative).is_file()]
    if missing:
        raise FileNotFoundError(f"Missing runtime package files: {missing}")

    DIST.mkdir(exist_ok=True)
    output = DIST / package_name()
    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for relative in RUNTIME_FILES:
            data = (ROOT / relative).read_bytes()
            info = zipfile.ZipInfo(relative, date_time=(2026, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            archive.writestr(info, data, compresslevel=9)
    return output


if __name__ == "__main__":
    print(build_package())
