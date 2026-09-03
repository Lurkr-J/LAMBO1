import { Jimp } from 'jimp';

async function cropCenterWheel() {
    const wheelImg = await Jimp.read('./public/wheel.png');
    const cx = 1376 / 2;
    const cy = 768 / 2;
    const r = 180; // 360x360 box, enough for a wheel
    
    const cropped = new Jimp({ width: r*2, height: r*2, color: 0x00000000 });
    for(let y=0; y<r*2; y++) {
        for(let x=0; x<r*2; x++) {
            const srcX = cx - r + x;
            const srcY = cy - r + y;
            const idx = (srcY * wheelImg.bitmap.width + srcX) * 4;
            const red = wheelImg.bitmap.data[idx];
            const g = wheelImg.bitmap.data[idx+1];
            const b = wheelImg.bitmap.data[idx+2];
            
            // Stricter background removal: anything brighter than 180 is removed (white/grey background)
            // Or anything that is transparent
            if ((red < 180 || g < 180 || b < 180) && wheelImg.bitmap.data[idx+3] > 0) {
                // Also cut into a perfect circle
                const dist = Math.sqrt((x - r)**2 + (y - r)**2);
                if (dist <= r) {
                    const color = wheelImg.getPixelColor(srcX, srcY);
                    cropped.setPixelColor(color, x, y);
                }
            }
        }
    }
    await cropped.write('./public/wheel_cropped.png');
    console.log("Saved wheel_cropped.png");
}
cropCenterWheel();
