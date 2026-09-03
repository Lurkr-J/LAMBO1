import fs from 'fs';
import path from 'path';
import { Jimp } from 'jimp';

const artifactDir = 'C:\\Users\\mstfj\\.gemini\\antigravity-ide\\brain\\0cf8651e-ba7c-472f-b3ba-3003faa8d32c';

fs.copyFileSync(path.join(artifactDir, 'remove_the_wheels_202609031236.png'), './public/car.png');
fs.copyFileSync(path.join(artifactDir, 'Tekerlek_tasarımı_oluştur_202609031236.png'), './public/wheel.png');
console.log("Files copied to public/car.png and public/wheel.png");

async function analyzeNewImages() {
    const carImg = await Jimp.read('./public/car.png');
    console.log(`Car size: ${carImg.bitmap.width}x${carImg.bitmap.height}`);
    
    const wheelImg = await Jimp.read('./public/wheel.png');
    console.log(`Wheel size: ${wheelImg.bitmap.width}x${wheelImg.bitmap.height}`);
}
analyzeNewImages();
