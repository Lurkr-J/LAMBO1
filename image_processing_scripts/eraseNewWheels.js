import { Jimp } from 'jimp';
import fs from 'fs';

async function eraseWheels() {
    const carImg = await Jimp.read('./public/car.png');
    
    const wheels = [
        { cx: 310, cy: 469, r: 130 },
        { cx: 949, cy: 468, r: 130 }
    ];
    
    for (const w of wheels) {
        for (let y = Math.floor(w.cy - w.r); y <= Math.ceil(w.cy + w.r); y++) {
            for (let x = Math.floor(w.cx - w.r); x <= Math.ceil(w.cx + w.r); x++) {
                if (x >= 0 && x < carImg.bitmap.width && y >= 0 && y < carImg.bitmap.height) {
                    const dist = Math.sqrt((x - w.cx)**2 + (y - w.cy)**2);
                    if (dist <= w.r) {
                        const idx = (Math.floor(y) * carImg.bitmap.width + Math.floor(x)) * 4;
                        carImg.bitmap.data[idx + 3] = 0; // Transparent
                    }
                }
            }
        }
    }
    
    await carImg.write('./public/car.png');
    fs.copyFileSync('./public/car.png', 'C:\\Users\\mstfj\\.gemini\\antigravity-ide\\brain\\0cf8651e-ba7c-472f-b3ba-3003faa8d32c\\car.png');
    console.log("Erased wheels from car.png");
}
eraseWheels();
