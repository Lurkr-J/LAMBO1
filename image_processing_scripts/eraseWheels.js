import { Jimp } from "jimp";

async function eraseWheels() {
    console.log("Erasing wheels from car.png...");
    const img = await Jimp.read('public/car.png');
    
    // Coordinates based on typical car generation on 1024x1024 canvas
    // Left Wheel
    const w1x = 240, w1y = 550, r1 = 110;
    // Right Wheel
    const w2x = 790, w2y = 550, r2 = 110;

    img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (x, y, idx) {
        const d1 = Math.sqrt((x - w1x)**2 + (y - w1y)**2);
        const d2 = Math.sqrt((x - w2x)**2 + (y - w2y)**2);
        if (d1 < r1 || d2 < r2) {
            this.bitmap.data[idx+3] = 0; // erase wheel areas
        }
    });

    await img.write('public/car.png');
    console.log("Done erasing wheels.");
}

eraseWheels();
