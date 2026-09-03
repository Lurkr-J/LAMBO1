import { Jimp } from "jimp";
import fs from 'fs';

async function fixRobot() {
    console.log("Fixing robot image...");
    const inputPath = "C:\\Users\\mstfj\\.gemini\\antigravity-ide\\brain\\0cf8651e-ba7c-472f-b3ba-3003faa8d32c\\countach_robot_white_bg_1788422084904.jpg";
    const image = await Jimp.read(inputPath);
    const w = image.bitmap.width;
    const h = image.bitmap.height;
    const data = image.bitmap.data;
    
    // We will NOT crop the bottom. We just do flood fill from the corners.
    const visited = new Uint8Array(w * h);
    const stack = [];
    
    // Seed the corners
    stack.push(0); // Top-left
    stack.push(w - 1); // Top-right
    stack.push((h - 1) * w); // Bottom-left
    stack.push((h - 1) * w + w - 1); // Bottom-right
    
    while (stack.length > 0) {
        const pt = stack.pop();
        if (visited[pt]) continue;
        
        const idx = pt * 4;
        const r = data[idx];
        const g = data[idx+1];
        const b = data[idx+2];
        
        // Target white/light gray background
        if (r > 150 && g > 150 && b > 150) {
            visited[pt] = 1;
            data[idx + 3] = 0; // Transparent
            
            const x = pt % w;
            const y = Math.floor(pt / w);
            
            if (x > 0 && !visited[pt - 1]) stack.push(pt - 1);
            if (x < w - 1 && !visited[pt + 1]) stack.push(pt + 1);
            if (y > 0 && !visited[pt - w]) stack.push(pt - w);
            if (y < h - 1 && !visited[pt + w]) stack.push(pt + w);
        }
    }

    // Clean up floating gray artifacts (optional, but good for Limbo style)
    for (let i = 0; i < w * h; i++) {
        const idx = i * 4;
        if (data[idx + 3] !== 0) { // If not transparent
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            
            const isOrange = (r > 100 && g > 30 && b < 100 && r > g);
            const isBlack = (r < 80 && g < 80 && b < 80);
            
            if (!isOrange && !isBlack) {
                // If it's a muddy gray transition color, make it transparent
                data[idx + 3] = 0;
            }
        }
    }

    await image.write('./public/robot.png');
    fs.copyFileSync('./public/robot.png', 'C:\\Users\\mstfj\\.gemini\\antigravity-ide\\brain\\0cf8651e-ba7c-472f-b3ba-3003faa8d32c\\robot.png');
    console.log("Saved fixed robot.png!");
}

fixRobot();
