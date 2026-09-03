import { Jimp } from 'jimp';
import fs from 'fs';

async function removeGreyBackground() {
    const carImg = await Jimp.read('./public/car.png');
    
    for (let y = 0; y < carImg.bitmap.height; y++) {
        for (let x = 0; x < carImg.bitmap.width; x++) {
            const idx = (y * carImg.bitmap.width + x) * 4;
            const r = carImg.bitmap.data[idx];
            const g = carImg.bitmap.data[idx+1];
            const b = carImg.bitmap.data[idx+2];
            
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const diff = max - min;
            
            const isBlack = max < 30; // Car body
            const isColor = diff > 25; // Orange neon
            const isWhite = min > 220; // Neon core
            
            // If it's a grey pixel (not dark, not colorful, not pure white), make it transparent
            if (!isBlack && !isColor && !isWhite) {
                carImg.bitmap.data[idx+3] = 0; // Transparent
            }
        }
    }
    
    await carImg.write('./public/car.png');
    fs.copyFileSync('./public/car.png', 'C:\\Users\\mstfj\\.gemini\\antigravity-ide\\brain\\0cf8651e-ba7c-472f-b3ba-3003faa8d32c\\car.png');
    console.log("Saved processed car.png with transparent background.");
}
removeGreyBackground();
