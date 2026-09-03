import { Jimp } from 'jimp';

async function findCarHoles() {
    const carImg = await Jimp.read('./public/car.png');
    
    let sumX1 = 0, sumY1 = 0, count1 = 0;
    let sumX2 = 0, sumY2 = 0, count2 = 0;
    
    // We expect the car to be roughly in the middle, wheels in the lower half
    for(let y=400; y<700; y++) {
        for(let x=100; x<1200; x++) {
            const idx = (y * carImg.bitmap.width + x) * 4;
            const a = carImg.bitmap.data[idx+3];
            
            // Check for transparent pixels inside the wheel region
            if (a < 50) { 
                if (x < 688) {
                    sumX1 += x; sumY1 += y; count1++;
                } else {
                    sumX2 += x; sumY2 += y; count2++;
                }
            }
        }
    }
    
    console.log(`Left hole center: cx=${sumX1/count1}, cy=${sumY1/count1}, count=${count1}`);
    console.log(`Right hole center: cx=${sumX2/count2}, cy=${sumY2/count2}, count=${count2}`);
}
findCarHoles();
