import fs from 'fs';
import path from 'path';
import { Jimp } from 'jimp';

async function processFolder() {
    const inputFolder = './countach';
    const outputFolder = './countach';
    
    const files = fs.readdirSync(inputFolder).filter(file => file.endsWith('.jpeg') || file.endsWith('.jpg') || file.endsWith('.png'));
    
    for (const file of files) {
        // Skip files that are already the processed output (e.g. if we run twice)
        if (file.endsWith('.png') && fs.existsSync(path.join(inputFolder, file.replace('.png', '.jpeg')))) continue;

        console.log(`Processing ${file}...`);
        const inputPath = path.join(inputFolder, file);
        
        // Output as PNG
        const outName = file.replace(/\.jpe?g$/, '.png');
        const outputPath = path.join(outputFolder, outName);
        
        const image = await Jimp.read(inputPath);
        
        // Make background transparent (removing white background typical of AI generations)
        const w = image.bitmap.width;
        const h = image.bitmap.height;
        const data = image.bitmap.data;
        
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const idx = (y * w + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                
                // If it's a white-ish background pixel
                if (r > 200 && g > 200 && b > 200) {
                    data[idx + 3] = 0; // Alpha = 0
                }
            }
        }
        
        await image.write(outputPath);
        console.log(`Saved ${outputPath}`);
    }
}

processFolder();
