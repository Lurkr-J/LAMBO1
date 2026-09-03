import { Jimp } from 'jimp';
import fs from 'fs';

async function perfectRemoveBg() {
    // Read the original processed image (before my previous attempt)
    const artifactPath = 'C:\\Users\\mstfj\\.gemini\\antigravity-ide\\brain\\0cf8651e-ba7c-472f-b3ba-3003faa8d32c\\remove_the_wheels_202609031236.png';
    const carImg = await Jimp.read(artifactPath);
    
    const w = carImg.bitmap.width;
    const h = carImg.bitmap.height;
    
    // 1. Strict thresholding across the entire image
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            const r = carImg.bitmap.data[idx];
            const g = carImg.bitmap.data[idx+1];
            const b = carImg.bitmap.data[idx+2];
            
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const diff = max - min;
            
            // Stricter definition of the car and neon
            const isBlack = max < 20; // Pure black car body
            const isNeon = diff > 30; // Bright orange neon
            const isWhite = min > 150; // Neon core glow
            
            if (!isBlack && !isNeon && !isWhite) {
                carImg.bitmap.data[idx+3] = 0; // Make background grey/fog transparent
            }
        }
    }
    
    // 2. Despeckle / Edge cleanup (remove isolated pixels or thin artifacts)
    for(let i=0; i<2; i++) { // Run twice for smoother edges
        for(let y=1; y<h-1; y++) {
            for(let x=1; x<w-1; x++) {
                const idx = (y * w + x) * 4;
                if (carImg.bitmap.data[idx+3] > 0) {
                    let opaqueNeighbors = 0;
                    if (carImg.bitmap.data[((y-1)*w+x)*4+3] > 0) opaqueNeighbors++;
                    if (carImg.bitmap.data[((y+1)*w+x)*4+3] > 0) opaqueNeighbors++;
                    if (carImg.bitmap.data[(y*w+x-1)*4+3] > 0) opaqueNeighbors++;
                    if (carImg.bitmap.data[(y*w+x+1)*4+3] > 0) opaqueNeighbors++;
                    
                    // If a pixel has fewer than 2 opaque neighbors, it's a jagged edge or speckle -> kill it
                    if (opaqueNeighbors < 2) {
                        carImg.bitmap.data[idx+3] = 0;
                    }
                }
            }
        }
    }

    await carImg.write('./public/car.png');
    fs.copyFileSync('./public/car.png', 'C:\\Users\\mstfj\\.gemini\\antigravity-ide\\brain\\0cf8651e-ba7c-472f-b3ba-3003faa8d32c\\car.png');
    console.log("Saved perfectly cleaned car.png");
}
perfectRemoveBg();
