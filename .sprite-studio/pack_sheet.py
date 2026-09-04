#!/usr/bin/env python3
"""Pack individual Sprite Studio PNG frames into one horizontal game sheet."""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from sprite_rig import load_png
from sprite_tool import Canvas, fail


def parse_args(argv):
    if len(argv) < 3:
        fail("usage: python .sprite-studio/pack_sheet.py OUTPUT.png FRAME1.png [FRAME2.png ...]")
    return Path(argv[1]), [Path(item) for item in argv[2:]]


def main():
    workspace = Path.cwd().resolve()
    output, frames = parse_args(sys.argv)
    if not output.is_absolute():
        output = workspace / output
    if not output.resolve().is_relative_to((workspace / "assets").resolve()):
        fail("output must stay under assets/")
    loaded = []
    for frame in frames:
        path = frame if frame.is_absolute() else workspace / frame
        width, height, rgba, _ = load_png(path)
        loaded.append((width, height, rgba, path))
    cell = max(width for width, _, _, _ in loaded), max(height for _, height, _, _ in loaded)
    sheet = Canvas(cell[0] * len(loaded), cell[1], "transparent")
    for index, (width, height, rgba, _) in enumerate(loaded):
        offset_x = index * cell[0] + (cell[0] - width) // 2
        offset_y = cell[1] - height
        for y in range(height):
            for x in range(width):
                pixel = tuple(rgba[(y * width + x) * 4:(y * width + x) * 4 + 4])
                if pixel[3]:
                    sheet.pixel(offset_x + x, offset_y + y, pixel)
    output.parent.mkdir(parents=True, exist_ok=True)
    sheet.save_png(output)
    report = {
        "output": str(output.relative_to(workspace)),
        "frames": len(loaded),
        "frameSize": [cell[0], cell[1]],
        "sheetSize": [sheet.width, sheet.height],
    }
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
