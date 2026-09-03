import { Jimp } from "jimp";

async function analyze() {
    const img = await Jimp.read('public/car.png');
    let sumX = 0, sumY = 0, count = 0;
    let minX = 1000, maxX = 0, minY = 1000, maxY = 0;
    
    // Left wheel region roughly
    for(let y = 400; y < 900; y++) {
        for(let x = 0; x < 450; x++) {
            const idx = (y * img.bitmap.width + x) * 4;
            const r = img.bitmap.data[idx];
            const a = img.bitmap.data[idx+3];
            if (a > 0 && r > 150) { // bright orange
                sumX += x;
                sumY += y;
                count++;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }
    
    const cx = sumX / count;
    const cy = sumY / count;
    console.log(`Center of mass: CX=${cx}, CY=${cy}`);
    console.log(`Bounding box of bright orange: minX=${minX}, maxX=${maxX}, minY=${minY}, maxY=${maxY}`);
    
    // The radius is approximately half the width of the bounding box
    const radius = (maxX - minX) / 2;
    console.log(`Estimated Radius: ${radius}`);
}
analyze();
