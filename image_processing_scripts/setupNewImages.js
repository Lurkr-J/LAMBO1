import fs from 'fs';
import path from 'path';
import { Jimp } from 'jimp';

fs.copyFileSync('./countach/remove_the_wheels_202609031236.png', './public/car.png');
fs.copyFileSync('./countach/Tekerlek_tasarımı_oluştur_202609031236.png', './public/wheel.png');
console.log("Files copied to public/car.png and public/wheel.png");

async function checkSize() {
    const carImg = await Jimp.read('./public/car.png');
    console.log(`Car size: ${carImg.bitmap.width}x${carImg.bitmap.height}`);
    
    // Find the transparent holes roughly at y=580 to see if the coordinates match
    // Check alpha at (260, 580)
    const a1 = carImg.bitmap.data[(580 * carImg.bitmap.width + 260) * 4 + 3];
    const a2 = carImg.bitmap.data[(580 * carImg.bitmap.width + 785) * 4 + 3];
    console.log(`Alpha at left hole (260,580): ${a1}`);
    console.log(`Alpha at right hole (785,580): ${a2}`);
}
checkSize();
