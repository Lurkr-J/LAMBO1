import { Jimp } from 'jimp';

async function check() {
    const img = await Jimp.read('C:\\Users\\mstfj\\.gemini\\antigravity-ide\\brain\\0cf8651e-ba7c-472f-b3ba-3003faa8d32c\\robot_run_exact_ref_1788435162572.jpg');
    console.log(`AI Image dimensions: ${img.bitmap.width}x${img.bitmap.height}`);
}
check().catch(console.error);
