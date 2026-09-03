import { Jimp } from "jimp";
import fs from 'fs';

async function processSpriteSheet() {
    console.log("Processing exact ref robot RUN sprite sheet (2x4 grid)...");
    const inputPath = "C:\\Users\\mstfj\\.gemini\\antigravity-ide\\brain\\0cf8651e-ba7c-472f-b3ba-3003faa8d32c\\robot_run_exact_ref_1788435162572.jpg";
    const image = await Jimp.read(inputPath);
    
    const topHalf = image;
    const data = topHalf.bitmap.data;
    const tw = topHalf.bitmap.width;
    const th = topHalf.bitmap.height;
    
    // Aggressive global white/grey/shadow removal to prevent any artifacts!
    for (let x = 0; x < tw; x++) {
        for (let y = 0; y < th; y++) {
            const idx = (y * tw + x) * 4;
            const r = data[idx];
            const g = data[idx+1];
            const b = data[idx+2];
            
            const isPitchBlack = (r < 40 && g < 40 && b < 40);
            const isNeon = (r > 80 && r > g + 20 && b < 100);
            
            if (!isPitchBlack && !isNeon) {
                data[idx + 3] = 0; // Make transparent
            }
        }
    }
    
    // Slice the 2x4 grid into 8 chunks
    const cols = 4;
    const rows = 2;
    const chunkW = Math.floor(tw / cols);
    const chunkH = Math.floor(th / rows);
    const robots = [];
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            robots.push({
                startX: c * chunkW,
                endX: (c + 1) * chunkW - 1,
                startY: r * chunkH,
                endY: (r + 1) * chunkH - 1
            });
        }
    }
    
    console.log(`Manually sliced into ${robots.length} distinct frames from 2x4 grid!`);
    
    let maxW = 0;
    let maxH = 0;
    
    for (let r of robots) {
        let minX = tw, maxX = 0;
        let minY = th, maxY = 0;
        let foundPixel = false;
        
        for (let x = r.startX; x <= r.endX; x++) {
            for (let y = r.startY; y <= r.endY; y++) {
                if (data[(y * tw + x) * 4 + 3] !== 0) {
                    foundPixel = true;
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }
        
        // Use full chunk bounds if no pixels found (safeguard)
        r.minX = foundPixel ? minX : r.startX;
        r.maxX = foundPixel ? maxX : r.endX;
        r.minY = foundPixel ? minY : r.startY;
        r.maxY = foundPixel ? maxY : r.endY;
        
        r.w = r.maxX - r.minX + 1;
        r.h = r.maxY - r.minY + 1;
        
        if (r.w > maxW) maxW = r.w;
        if (r.h > maxH) maxH = r.h;
    }
    
    console.log(`Max dimensions: ${maxW}x${maxH}`);
    
    // Create new image with 8 perfectly aligned frames in a single row
    const outW = maxW * robots.length;
    const outImage = new Jimp({ width: outW, height: maxH, color: 0x00000000 }); // transparent background
    
    for (let i = 0; i < robots.length; i++) {
        const r = robots[i];
                }
            }
        }
    }
    
    await finalSheet.write('./public/robot_walk.png');
    fs.copyFileSync('./public/robot_walk.png', 'C:\\Users\\mstfj\\.gemini\\antigravity-ide\\brain\\0cf8651e-ba7c-472f-b3ba-3003faa8d32c\\robot_walk.png');
    console.log(`Saved perfectly aligned sprite sheet with ${robots.length} frames!`);
}

processSpriteSheet();
