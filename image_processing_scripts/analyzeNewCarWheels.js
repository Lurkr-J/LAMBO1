import { Jimp } from 'jimp';

async function findWheels() {
    const carImg = await Jimp.read('C:\\Users\\mstfj\\.gemini\\antigravity-ide\\brain\\0cf8651e-ba7c-472f-b3ba-3003faa8d32c\\remove_the_wheels_202609031236.png');
    
    let leftSumX = 0, leftSumY = 0, leftCount = 0;
    let rightSumX = 0, rightSumY = 0, rightCount = 0;
    
    for (let y = 400; y < 750; y++) {
        for (let x = 50; x < 1300; x++) {
            const idx = (y * carImg.bitmap.width + x) * 4;
            const r = carImg.bitmap.data[idx];
            const g = carImg.bitmap.data[idx+1];
            const b = carImg.bitmap.data[idx+2];
            
            // Checking for neon orange/yellow highlights which define the wheels
            if (r > 150 && (r - b) > 50) {
                if (x < 688) { // Left half of 1376
                    leftSumX += x;
                    leftSumY += y;
                    leftCount++;
                } else { // Right half
                    rightSumX += x;
                    rightSumY += y;
                    rightCount++;
                }
            }
        }
    }
    
    console.log(`Left wheel center: cx=${leftSumX/leftCount}, cy=${leftSumY/leftCount}`);
    console.log(`Right wheel center: cx=${rightSumX/rightCount}, cy=${rightSumY/rightCount}`);
}
findWheels();
