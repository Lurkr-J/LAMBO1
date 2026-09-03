import { Jimp } from 'jimp';

async function analyzeNewWheel() {
    const wheelImg = await Jimp.read('./public/wheel.png');
    
    let minX = 10000, maxX = 0, minY = 10000, maxY = 0;
    let sumX = 0, sumY = 0, count = 0;
    
    // Find bounding box of non-transparent pixels
    for(let y=0; y<wheelImg.bitmap.height; y++) {
        for(let x=0; x<wheelImg.bitmap.width; x++) {
            const idx = (y * wheelImg.bitmap.width + x) * 4;
            const a = wheelImg.bitmap.data[idx+3];
            if (a > 0) { 
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
                sumX += x;
                sumY += y;
                count++;
            }
        }
    }
    console.log(`Wheel bounding box: minX=${minX}, maxX=${maxX}, minY=${minY}, maxY=${maxY}`);
    console.log(`Center of Mass: cx=${sumX/count}, cy=${sumY/count}`);
    
    // Let's also crop it and save as wheel_cropped.png
    if(count > 0) {
        const w = maxX - minX + 1;
        const h = maxY - minY + 1;
        const cropped = new Jimp({ width: w, height: h, color: 0x00000000 });
        for(let y=0; y<h; y++) {
            for(let x=0; x<w; x++) {
                const color = wheelImg.getPixelColor(minX + x, minY + y);
                cropped.setPixelColor(color, x, y);
            }
        }
        await cropped.write('./public/wheel_cropped.png');
        console.log("Cropped wheel saved to public/wheel_cropped.png");
    }
}
analyzeNewWheel();
