import { Jimp } from 'jimp';

async function processIdle() {
    console.log("Loading robot.png...");
    const img = await Jimp.read('public/robot.png');
    
    // Already flipped previously
    
    const data = img.bitmap.data;
    const tw = img.bitmap.width;
    const th = img.bitmap.height;
    
    for (let x = 0; x < tw; x++) {
        for (let y = 0; y < th; y++) {
            const idx = (y * tw + x) * 4;
            const r = data[idx];
            const g = data[idx+1];
            const b = data[idx+2];
            const a = data[idx+3];
            // Process all pixels to ensure transparent ones don't carry hidden color data
            const isPitchBlack = (r < 40 && g < 40 && b < 40);
            const isNeon = (r > 80 && r > g + 20 && b < 100);
            
            if (isPitchBlack) {
                // Force pure Limbo black
                data[idx] = 0;
                data[idx+1] = 0;
                data[idx+2] = 0;
            } else if (!isNeon) {
                // If it's not black and not neon, erase it and prevent WebGL white texture bleeding
                data[idx] = 0;
                data[idx+1] = 0;
                data[idx+2] = 0;
                data[idx+3] = 0;
            }
        }
    }
    
    await img.write("public/robot.png");
    console.log("Processed robot.png: Flipped horizontally and enforced Limbo colors!");
}

processIdle().catch(console.error);
