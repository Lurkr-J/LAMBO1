import { Jimp } from "jimp";

async function makeHovercar() {
    console.log("Converting to hovercar...");
    // Read the current car image
    const img = await Jimp.read('public/car.png');
    
    // Exact wheel coordinates
    const w1x = 260, w1y = 580, r1 = 110;
    const w2x = 785, w2y = 580, r2 = 110;
    
    for (let y = 0; y < img.bitmap.height; y++) {
        for (let x = 0; x < img.bitmap.width; x++) {
            const d1 = Math.sqrt((x - w1x)**2 + (y - w1y)**2);
            const d2 = Math.sqrt((x - w2x)**2 + (y - w2y)**2);
            
            // If inside the wheel regions
            if (d1 < r1 || d2 < r2) {
                const idx = (y * img.bitmap.width + x) * 4;
                // Only make transparent if it's part of the car (not the transparent background)
                if (img.bitmap.data[idx+3] > 0) {
                    img.bitmap.data[idx+3] = 0;   // Alpha = 0 (Transparent)
                }
            }
        }
    }
    
    await img.write('public/car.png');
    console.log("Hovercar transformation complete.");
}

makeHovercar();
