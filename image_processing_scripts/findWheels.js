import { Jimp } from "jimp";

async function findWheels() {
    const img = await Jimp.read('public/car.png');
    const h = img.bitmap.height;
    const w = img.bitmap.width;
    let minX1 = w, maxX1 = 0, minY1 = h, maxY1 = 0; // Left wheel
    let minX2 = w, maxX2 = 0, minY2 = h, maxY2 = 0; // Right wheel
    
    // Look at bottom 40% of image
    for(let y = Math.floor(h * 0.6); y < h; y++) {
        for(let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            const a = img.bitmap.data[idx+3];
            const r = img.bitmap.data[idx];
            if (a > 0 && r > 100) { 
                if (x < w / 2) {
                    if (x < minX1) minX1 = x;
                    if (x > maxX1) maxX1 = x;
                    if (y < minY1) minY1 = y;
                    if (y > maxY1) maxY1 = y;
                } else {
                    if (x < minX2) minX2 = x;
                    if (x > maxX2) maxX2 = x;
                    if (y < minY2) minY2 = y;
                    if (y > maxY2) maxY2 = y;
                }
            }
        }
    }
    console.log(`w: ${w}, h: ${h}`);
    console.log(`Wheel 1 (Left) - CX: ${(minX1+maxX1)/2}, CY: ${(minY1+maxY1)/2}, R: ${(maxX1-minX1)/2}`);
    console.log(`Wheel 2 (Right) - CX: ${(minX2+maxX2)/2}, CY: ${(minY2+maxY2)/2}, R: ${(maxX2-minX2)/2}`);
}

findWheels();
