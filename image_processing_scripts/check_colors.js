import { Jimp } from 'jimp';

async function checkColors() {
    const img = await Jimp.read('C:\\Users\\mstfj\\.gemini\\antigravity-ide\\brain\\0cf8651e-ba7c-472f-b3ba-3003faa8d32c\\robot_run_exact_ref_1788435162572.jpg');
    let blackPixels = 0;
    let neonPixels = 0;
    const data = img.bitmap.data;
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        if (r < 40 && g < 40 && b < 40) blackPixels++;
        if (r > 80 && r > g + 20 && b < 100) neonPixels++;
    }
    console.log(`Pitch Black Pixels (<40): ${blackPixels}`);
    console.log(`Neon Pixels: ${neonPixels}`);
    
    // Check if we relax the threshold
    let relaxedBlack = 0;
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        if (r < 90 && g < 90 && b < 90) relaxedBlack++;
    }
    console.log(`Relaxed Black Pixels (<90): ${relaxedBlack}`);
}
checkColors().catch(console.error);
