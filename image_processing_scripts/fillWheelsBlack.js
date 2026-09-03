import { Jimp } from 'jimp';

async function fillWheelsBlack() {
    console.log("Modifying car.png: filling wheel areas with pitch black...");
    const carImg = await Jimp.read('./public/car.png');
    
    const regions = [
        { cx: 265, cy: 574, r: 65 }, // Left (Arka Teker): 5 piksel daha sağa kaydırıldı (toplamda orijinale göre 10 piksel)
        { cx: 781, cy: 577, r: 65 }  // Right (Ön Teker): 1 birim sağa, 3 birim aşağı (önceki ayar)
    ];
    
    for (const region of regions) {
        for (let y = region.cy - region.r; y <= region.cy + region.r; y++) {
            for (let x = region.cx - region.r; x <= region.cx + region.r; x++) {
                if (x >= 0 && x < carImg.bitmap.width && y >= 0 && y < carImg.bitmap.height) {
                    const dx = x - region.cx;
                    const dy = y - region.cy;
                    if (Math.sqrt(dx*dx + dy*dy) <= region.r) {
                        const idx = (Math.floor(y) * carImg.bitmap.width + Math.floor(x)) * 4;
                        carImg.bitmap.data[idx] = 0;     // R
                        carImg.bitmap.data[idx+1] = 0;   // G
                        carImg.bitmap.data[idx+2] = 0;   // B
                        carImg.bitmap.data[idx+3] = 255; // Alpha (solid)
                    }
                }
            }
        }
    }
    
    await carImg.write('./public/car.png');
    console.log("Done! car.png has been updated.");
}

fillWheelsBlack();
