import { Jimp } from "jimp";

async function analyzeAndCropWheels() {
    console.log("Analyzing car.png to find exact wheel centers...");
    const img = await Jimp.read('public/car.png');
    
    // Exact coordinates provided by the user
    const leftCenter = { cx: 260, cy: 580 };
    const rightCenter = { cx: 785, cy: 580 };
    const radius = 110;
    
    // Function to extract wheel tightly
    async function cropWheel(cx, cy, radius, outputPath) {
        const wheelSize = radius * 2 + 20;
        const wheelImg = new Jimp({ width: wheelSize, height: wheelSize, color: 0x00000000 });
        for (let y = 0; y < wheelSize; y++) {
            for (let x = 0; x < wheelSize; x++) {
                const dx = x - wheelSize / 2;
                const dy = y - wheelSize / 2;
                if (Math.sqrt(dx*dx + dy*dy) <= radius) {
                    const carX = Math.floor(cx + dx);
                    const carY = Math.floor(cy + dy);
                    if(carX >= 0 && carX < img.bitmap.width && carY >= 0 && carY < img.bitmap.height) {
                        const color = img.getPixelColor(carX, carY);
                        wheelImg.setPixelColor(color, x, y);
                    }
                }
            }
        }
        await wheelImg.write(outputPath);
        console.log(`Saved ${outputPath}`);
    }
    
    // Extract using the exact 110 radius
    await cropWheel(leftCenter.cx, leftCenter.cy, radius, 'public/wheel_front.png');
    await cropWheel(rightCenter.cx, rightCenter.cy, radius, 'public/wheel_back.png');
}

analyzeAndCropWheels();
