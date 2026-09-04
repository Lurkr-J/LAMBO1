# LAMBO 🚗🤖

A Limbo-inspired 2.5D web-based platformer featuring a vehicle that can dynamically transform into a mechanical robot!

## Features
- **Hovercar Mode:** Fast-paced driving mechanics with rotating 3D wheel meshes embedded directly into the 2D car sprite.
- **Robot Mode:** Transform instantly (using 'T') into a bipedal robot!
- **Procedural Animations:** 
  - **Transformation:** A cinematic 3D spin-and-fold effect that smoothly swaps the car and robot forms.
  - **Jumping:** "Squash and stretch" physics when leaping and landing.
  - **Idle:** Procedural breathing (chest heaving) when standing still.
  - **Walking:** An 8-frame 2D sprite sheet walk cycle powered by texture offset logic.
- **Distinct Mechanics:** The car moves 2x faster but cannot jump. The robot moves at normal speed but can jump over obstacles.
- **Limbo Art Style:** Pure pitch-black silhouettes against a moody fog, accented with subtle glowing neon orange highlights.
- **Sprite Studio pipeline:** Pixel sprites are generated from JSON specs with `.sprite-studio/sprite_tool.py`, then packed into sheets. See `MUSTAFA-REHBERI.md`.

## Tech Stack
- **Three.js** (WebGL 3D Engine)
- **Vite** (Build Tool & Dev Server)
- **Vanilla JavaScript** (No complex frameworks, just pure logic)

## How to Play

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open the provided localhost URL in your browser.
5. Optional: add `?art=pixel` to load the Sprite Studio pixel pack instead of the concept-art sprites.

Mustafa: start with `MUSTAFA-REHBERI.md`.

### Controls
- **A / D** or **arrow keys:** Move left and right
- **Spacebar** or **W:** Jump (robot form only)
- **T:** Transform (hovercar ↔ robot)

The first gap cannot be crossed in hovercar form. Transform, then jump.

## About the Project
This project was developed iteratively. The `image_processing_scripts/` folder contains various Node.js scripts (using Jimp) that were used to procedurally process AI-generated concept art. These scripts automatically detected wheel locations, hollowed out wheel wells, extracted frames from sprite sheets, and perfectly isolated transparent backgrounds using flood-fill algorithms!
