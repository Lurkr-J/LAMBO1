---
name: lambo-sprites
description: Generate Limbo-style LAMBO sprites and animations with Sprite Studio Python tools. Use when Mustafa or the agent is asked to make sprites, walk cycles, sprite sheets, pixel art, robot/car frames, or use .sprite-studio.
---

# LAMBO sprite pipeline

This repo does **not** need the Sprite Studio desktop app for everyday sprite work. The Python engine in `.sprite-studio/` is enough.

## Art rules for this game

- Transparent PNG background. Never bake a black or white rectangle.
- Limbo look: pitch-black silhouette (`#000000` / `#050505`) plus neon orange (`#ff5500`) highlights.
- Canvas 8–512 px per side. Prefer 48–96 for characters.
- Game loads horizontal sprite sheets. Robot run = exactly 8 equal frames in one row.
- Final playable files live under `assets/`. Never write to `public/` (that folder does not exist).
- Do not overwrite `assets/car.png`, `assets/robot.png`, `assets/robot_walk.png`, `assets/wheel.png` unless the user asks. Those are the concept-art pack. New Sprite Studio output goes to `assets/characters/`, `assets/props/`, `assets/effects/`.

## Workflow the agent must follow

1. Write a JSON spec under `.sprite-studio/specs/`.
2. Render from the **project root**:
   `python .sprite-studio/sprite_tool.py .sprite-studio/specs/NAME.json`
3. For animations, pack frames into a sheet:
   `python .sprite-studio/pack_sheet.py assets/characters/NAME_sheet.png FRAME1.png FRAME2.png ...`
4. To reuse one master pose, write a rig under `.sprite-studio/rigs/` and run:
   `python .sprite-studio/sprite_rig.py --check .sprite-studio/rigs/NAME.json`
   then
   `python .sprite-studio/sprite_rig.py .sprite-studio/rigs/NAME.json`
5. Point the game at the new sheet only after the files exist. Pixel pack is selected with `?art=pixel`.

Regenerate the bundled demo set with `python .sprite-studio/generate_lambo.py`.

## Spec shape

```json
{
  "name": "lambo_robot_run",
  "category": "characters",
  "size": [48, 64],
  "fps": 12,
  "background": "transparent",
  "palette": { "body": "#000000ff", "neon": "#ff5500ff" },
  "frames": [
    { "name": "run_01", "commands": [{ "type": "rect", "x": 10, "y": 8, "w": 20, "h": 24, "color": "body" }] }
  ]
}
```

Commands: `pixel`, `rect`, `line`, `ellipse`, `polygon`. Categories: `characters`, `creatures`, `terrain`, `props`, `effects`. Max 24 frames per sprite_tool spec.

Copy `.sprite-studio/specs/orange_spark.json` for the smallest working example.

## Game hook

`main.js` reads concept art by default. `index.html?art=pixel` uses Sprite Studio files. Robot walk sheets must keep `ART.frames` in sync (currently 8).
