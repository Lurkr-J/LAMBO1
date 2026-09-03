import { Jimp } from "jimp";

async function extractWheel() {
    console.log("Extracting wheel from car.png...");
    // Read the original car image (with wheels)
    const carImg = await Jimp.read('public/car.png');
    
    // Left wheel center and radius based on center of mass analysis
    const cx = 268, cy = 527, r = 55;
    
    // Create a new blank transparent image for the wheel (240x240 to give it a little padding)
    const wheelSize = r * 2 + 20; // 240
    const wheelImg = new Jimp({ width: wheelSize, height: wheelSize, color: 0x00000000 });
    
    // Copy the circular region
    for (let y = 0; y < wheelSize; y++) {
        for (let x = 0; x < wheelSize; x++) {
            // Coordinate relative to the center of the new wheel image
            const dx = x - wheelSize / 2;
            const dy = y - wheelSize / 2;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist <= r) {
                // Corresponding coordinate in the car image
                const carX = Math.floor(cx + dx);
                const carY = Math.floor(cy + dy);
                
                // Get color from car
                const color = carImg.getPixelColor(carX, carY);
                // Set color in wheel
                wheelImg.setPixelColor(color, x, y);
            }
        }
    }
    
    await wheelImg.write('public/wheel.png');
    console.log("Wheel extracted and saved to public/wheel.png");
}

extractWheel();
