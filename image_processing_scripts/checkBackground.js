import { Jimp } from 'jimp';

async function checkBackground() {
    const carImg = await Jimp.read('./public/car.png');
    
    const corners = [
        [0, 0],
        [carImg.bitmap.width - 1, 0],
        [0, carImg.bitmap.height - 1],
        [carImg.bitmap.width - 1, carImg.bitmap.height - 1]
    ];
    
    console.log("Checking corner pixels to determine background color:");
    for (const [x, y] of corners) {
        const idx = (y * carImg.bitmap.width + x) * 4;
        const r = carImg.bitmap.data[idx];
        const g = carImg.bitmap.data[idx+1];
        const b = carImg.bitmap.data[idx+2];
        const a = carImg.bitmap.data[idx+3];
        console.log(`(${x}, ${y}) -> R:${r} G:${g} B:${b} A:${a}`);
    }
}
checkBackground();
