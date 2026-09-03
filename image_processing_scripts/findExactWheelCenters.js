import { Jimp } from 'jimp';

async function findExactWheelCenters() {
    const carImg = await Jimp.read('./public/car.png');
    
    let leftSumX = 0, leftSumY = 0, leftCount = 0;
    let rightSumX = 0, rightSumY = 0, rightCount = 0;
    
    for (let y = 400; y < 800; y++) {
        for (let x = 100; x < 900; x++) {
            const idx = (y * carImg.bitmap.width + x) * 4;
            const r = carImg.bitmap.data[idx];
            const g = carImg.bitmap.data[idx+1];
            const b = carImg.bitmap.data[idx+2];
            
            // The neon outline of the wheel is bright orange
            // Limbo style is black with orange highlights
            if (r > 100 && g > 30 && b < 100 && r > g) {
                if (x < 512) { // Left half
                    leftSumX += x; leftSumY += y; leftCount++;
                } else {
                    rightSumX += x; rightSumY += y; rightCount++;
                }
            }
        }
    }
    
    console.log(`Left wheel neon center: cx=${leftSumX/leftCount}, cy=${leftSumY/leftCount}`);
    console.log(`Right wheel neon center: cx=${rightSumX/rightCount}, cy=${rightSumY/rightCount}`);
}
findExactWheelCenters();
