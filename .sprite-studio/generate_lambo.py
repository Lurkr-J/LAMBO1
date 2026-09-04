#!/usr/bin/env python3
"""Build Limbo-style LAMBO pixel specs and render them through sprite_tool."""

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
WORKSPACE = ROOT.parent
TOOL = ROOT / "sprite_tool.py"
PACK = ROOT / "pack_sheet.py"
SPECS = ROOT / "specs"


def palette():
    return {
        "ink": "#050505ff",
        "body": "#000000ff",
        "neon": "#ff5500ff",
        "glow": "#ff8833ff",
        "joint": "#ffcc66ff",
    }


def cmd(kind, **kwargs):
    return {"type": kind, **kwargs}


def rect(x, y, w, h, color="body"):
    return cmd("rect", x=x, y=y, w=w, h=h, color=color)


def ellipse(x, y, w, h, color="body"):
    return cmd("ellipse", x=x, y=y, w=w, h=h, color=color)


def line(x1, y1, x2, y2, color="neon", thickness=1):
    return cmd("line", x1=x1, y1=y1, x2=x2, y2=y2, color=color, thickness=thickness)


def pixel(x, y, color="neon"):
    return cmd("pixel", x=x, y=y, color=color)


def poly(points, color="body"):
    return cmd("polygon", points=points, color=color)


def outline_poly(points):
    commands = [poly(points, "body")]
    closed = points + [points[0]]
    for start, end in zip(closed, closed[1:]):
        commands.append(line(start[0], start[1], end[0], end[1], "neon", 1))
    return commands


def write_spec(name, payload):
    SPECS.mkdir(parents=True, exist_ok=True)
    path = SPECS / f"{name}.json"
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    return path


def render(spec_path):
    result = subprocess.run(
        [sys.executable, str(TOOL), str(spec_path.relative_to(WORKSPACE))],
        cwd=WORKSPACE,
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise SystemExit(result.stderr or result.stdout or f"sprite_tool failed on {spec_path}")
    print(result.stdout.strip())
    return json.loads(result.stdout)


def car_spec():
    body = outline_poly([
        [8, 26], [14, 18], [28, 14], [46, 14], [62, 16], [78, 20],
        [86, 22], [90, 26], [88, 34], [18, 34],
    ])
    cabin = outline_poly([[32, 14], [40, 8], [54, 8], [62, 14]])
    spoiler = [
        rect(78, 16, 12, 3, "body"),
        line(78, 16, 90, 16, "neon"),
        line(90, 16, 90, 19, "neon"),
    ]
    wells = [
        ellipse(20, 28, 16, 16, "transparent"),
        ellipse(62, 28, 16, 16, "transparent"),
        line(20, 36, 36, 36, "neon"),
        line(62, 36, 78, 36, "neon"),
    ]
    vents = [
        line(48, 22, 58, 22, "glow"),
        line(48, 24, 56, 24, "glow"),
        pixel(18, 22, "joint"),
        pixel(84, 24, "joint"),
    ]
    return {
        "name": "lambo_car",
        "category": "characters",
        "animation": "Lambo Car",
        "size": [96, 48],
        "fps": 1,
        "background": "transparent",
        "palette": palette(),
        "frames": [{"name": "lambo_car", "commands": body + cabin + spoiler + wells + vents}],
    }


def wheel_spec():
    commands = [
        ellipse(2, 2, 20, 20, "body"),
        ellipse(2, 2, 20, 20, "neon"),
        ellipse(4, 4, 16, 16, "body"),
        ellipse(10, 10, 4, 4, "neon"),
        line(12, 4, 12, 10, "glow"),
        line(12, 14, 12, 20, "glow"),
        line(4, 12, 10, 12, "glow"),
        line(14, 12, 20, 12, "glow"),
        line(6, 6, 10, 10, "glow"),
        line(14, 14, 18, 18, "glow"),
    ]
    return {
        "name": "lambo_wheel",
        "category": "props",
        "animation": "Lambo Wheel",
        "size": [24, 24],
        "fps": 1,
        "background": "transparent",
        "palette": palette(),
        "frames": [{"name": "lambo_wheel", "commands": commands}],
    }


def robot_commands(left_hip, right_hip, left_knee, right_knee, left_foot, right_foot, lean=0):
    torso_x = 18 + lean
    commands = []
    commands += outline_poly([
        [torso_x + 4, 10], [torso_x + 14, 8], [torso_x + 26, 10],
        [torso_x + 24, 28], [torso_x + 6, 28],
    ])
    commands += outline_poly([
        [torso_x + 8, 4], [torso_x + 22, 4], [torso_x + 24, 10], [torso_x + 6, 10],
    ])
    commands += [
        pixel(torso_x + 10, 7, "joint"),
        pixel(torso_x + 18, 7, "joint"),
        rect(torso_x + 2, 12, 6, 3, "body"),
        rect(torso_x + 22, 12, 6, 3, "body"),
        line(torso_x + 2, 12, torso_x + 8, 14, "neon"),
        line(torso_x + 28, 12, torso_x + 22, 14, "neon"),
        pixel(torso_x + 4, 18, "glow"),
        pixel(torso_x + 24, 18, "glow"),
    ]

    def limb(hip, knee, foot):
        hx, hy = hip
        kx, ky = knee
        fx, fy = foot
        return [
            line(hx, hy, kx, ky, "body", 3),
            line(kx, ky, fx, fy, "body", 3),
            line(hx, hy, kx, ky, "neon", 1),
            line(kx, ky, fx, fy, "neon", 1),
            ellipse(hx - 1, hy - 1, 3, 3, "joint"),
            ellipse(kx - 1, ky - 1, 3, 3, "joint"),
            ellipse(fx - 2, fy - 1, 5, 3, "body"),
            line(fx - 2, fy + 1, fx + 2, fy + 1, "neon"),
        ]

    commands += limb(left_hip, left_knee, left_foot)
    commands += limb(right_hip, right_knee, right_foot)
    commands += [
        line(torso_x + 8, 28, left_hip[0], left_hip[1], "neon"),
        line(torso_x + 20, 28, right_hip[0], right_hip[1], "neon"),
        rect(torso_x + 4, 30, 4, 10, "body"),
        rect(torso_x + 22, 32, 4, 10, "body"),
        line(torso_x + 6, 30, torso_x + 6, 40, "glow"),
        line(torso_x + 24, 32, torso_x + 24, 42, "glow"),
    ]
    return commands


def robot_idle_spec():
    return {
        "name": "lambo_robot",
        "category": "characters",
        "animation": "Lambo Robot Idle",
        "size": [48, 64],
        "fps": 1,
        "background": "transparent",
        "palette": palette(),
        "frames": [{
            "name": "lambo_robot",
            "commands": robot_commands(
                left_hip=(16, 32), right_hip=(30, 32),
                left_knee=(14, 44), right_knee=(32, 44),
                left_foot=(14, 56), right_foot=(32, 56),
            ),
        }],
    }


def robot_run_spec():
    poses = [
        ((14, 32), (30, 32), (10, 42), (34, 46), (8, 54), (36, 58), -1),
        ((16, 31), (30, 33), (12, 40), (32, 48), (10, 52), (34, 58), 0),
        ((16, 32), (30, 32), (16, 44), (30, 44), (16, 56), (30, 56), 1),
        ((16, 33), (30, 31), (18, 48), (28, 40), (20, 58), (26, 52), 1),
        ((16, 32), (32, 32), (14, 46), (36, 42), (12, 58), (38, 54), 0),
        ((16, 31), (30, 33), (12, 48), (32, 40), (10, 58), (34, 52), -1),
        ((16, 32), (30, 32), (16, 44), (30, 44), (16, 56), (30, 56), -1),
        ((14, 33), (30, 31), (10, 48), (34, 40), (8, 58), (36, 52), 0),
    ]
    frames = []
    for index, pose in enumerate(poses, start=1):
        frames.append({
            "name": f"lambo_robot_run_{index:02d}",
            "commands": robot_commands(*pose),
        })
    return {
        "name": "lambo_robot_run",
        "category": "characters",
        "animation": "Lambo Robot Run",
        "size": [48, 64],
        "fps": 12,
        "background": "transparent",
        "palette": palette(),
        "frames": frames,
    }


def pack_run(manifest):
    files = [str(WORKSPACE / item) for item in manifest["files"]]
    output = "assets/characters/lambo_robot_run_sheet.png"
    result = subprocess.run(
        [sys.executable, str(PACK), output, *files],
        cwd=WORKSPACE,
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise SystemExit(result.stderr or result.stdout or "pack_sheet failed")
    print(result.stdout.strip())


def main():
    (WORKSPACE / "assets" / "characters").mkdir(parents=True, exist_ok=True)
    (WORKSPACE / "assets" / "props").mkdir(parents=True, exist_ok=True)
    (WORKSPACE / "assets" / "effects").mkdir(parents=True, exist_ok=True)
    (ROOT / "rigs").mkdir(parents=True, exist_ok=True)

    render(SPECS / "orange_spark.json")
    render(write_spec("lambo_car", car_spec()))
    render(write_spec("lambo_wheel", wheel_spec()))
    render(write_spec("lambo_robot", robot_idle_spec()))
    run_manifest = render(write_spec("lambo_robot_run", robot_run_spec()))
    pack_run(run_manifest)
    print("LAMBO sprite pipeline ready.")


if __name__ == "__main__":
    main()
