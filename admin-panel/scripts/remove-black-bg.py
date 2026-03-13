#!/usr/bin/env python3
"""Remove black background from PNG images, making it transparent."""
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Install Pillow: pip install Pillow")
    sys.exit(1)


def remove_black_bg(input_path: Path, output_path: Path, threshold: int = 30) -> None:
    """Make pixels darker than threshold transparent."""
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    new_data = []
    for item in data:
        r, g, b, a = item
        # Black or near-black -> transparent
        if r <= threshold and g <= threshold and b <= threshold:
            new_data.append((r, g, b, 0))
        else:
            new_data.append(item)
    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Saved: {output_path}")


def main() -> None:
    landing = Path(__file__).resolve().parent.parent / "public" / "landing"
    for name in ("merch-title-ge", "merch-title-az", "merch-title-am"):
        src = landing / f"{name}.png"
        if not src.exists():
            print(f"Skip (not found): {src}")
            continue
        remove_black_bg(src, src)  # overwrite in place


if __name__ == "__main__":
    main()
