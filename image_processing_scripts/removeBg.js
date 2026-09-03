import { Jimp } from "jimp";

function processImage(inputPath, outputPath, isWheel = false, isCar = false) {
    return new Promise(async (resolve) => {
        console.log("Processing", inputPath);
        const image = await Jimp.read(inputPath);
        const w = image.bitmap.width;
        const h = image.bitmap.height;
        const data = image.bitmap.data;
        
        // 1. Detect and remove the floor line (skip for wheel so it stays perfectly round!)
        if (!isWheel) {
            let floorY = h;
            let maxBlackCount = 0;
            
            for (let y = Math.floor(h / 2); y < h; y++) {
                let blackCount = 0;
                for (let x = 0; x < w; x++) {
                    const idx = (y * w + x) * 4;
                    if (data[idx] < 100 && data[idx+1] < 100 && data[idx+2] < 100) {
                        blackCount++;
                    }
                }
                if (blackCount > maxBlackCount) {
                    maxBlackCount = blackCount;
                    floorY = y;
                }
            }

            const cropY = floorY - 5; 
            
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    if (x < 10 || x > w - 10 || y < 10 || y > cropY) {
                        const idx = (y * w + x) * 4;
                        data[idx + 3] = 0; 
                    }
                }
            }
        } else {
            // For the wheel, just clear the outer 10px edges to prevent edge artifacts
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    if (x < 10 || x > w - 10 || y < 10 || y > h - 10) {
                        const idx = (y * w + x) * 4;
                        data[idx + 3] = 0;
                    }
                }
            }
        }

        // 2. Flood fill from the edges to remove the main white background.
        const visited = new Uint8Array(w * h);
        const stack = [];
        
        for (let x = 0; x < w; x++) {
            stack.push(0 * w + x);
            stack.push((h - 1) * w + x);
        }
        for (let y = 0; y < h; y++) {
            stack.push(y * w + 0);
            stack.push(y * w + w - 1);
        }
        
        while (stack.length > 0) {
            const pt = stack.pop();
            if (visited[pt]) continue;
            
            const idx = pt * 4;
            const r = data[idx];
            const g = data[idx+1];
            const b = data[idx+2];
            const a = data[idx+3];
            
            // Traverse if it's already transparent, OR if it's light colored (background)
            if (a === 0 || (r > 150 && g > 150 && b > 150)) {
                visited[pt] = 1;
                data[idx + 3] = 0; // make transparent
                
                const x = pt % w;
                const y = Math.floor(pt / w);
                
                if (x > 0 && !visited[pt - 1]) stack.push(pt - 1);
                if (x < w - 1 && !visited[pt + 1]) stack.push(pt + 1);
                if (y > 0 && !visited[pt - w]) stack.push(pt - w);
                if (y < h - 1 && !visited[pt + w]) stack.push(pt + w);
            }
        }

        // 3. Clean up the halos (gray anti-aliased pixels) and any floating junk
        for (let i = 0; i < w * h; i++) {
            const idx = i * 4;
            if (data[idx + 3] !== 0) {
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                
                const isOrange = (r > 100 && g > 30 && b < 100 && r > g);
                const isBlack = (r < 80 && g < 80 && b < 80);
                
                if (!isOrange && !isBlack) {
                    // Turn all white, gray, and non-orange regions into transparent
                    data[idx + 3] = 0;
                }
            }
        }

        image.write(outputPath, () => {
            console.log("Saved", outputPath);
            resolve();
        });
    });
}

const carImg = "C:\\Users\\mstfj\\.gemini\\antigravity-ide\\brain\\0cf8651e-ba7c-472f-b3ba-3003faa8d32c\\countach_car_white_bg_1788422073364.jpg";
const robotImg = "C:\\Users\\mstfj\\.gemini\\antigravity-ide\\brain\\0cf8651e-ba7c-472f-b3ba-3003faa8d32c\\countach_robot_white_bg_1788422084904.jpg";
const wheelImg = "C:\\Users\\mstfj\\.gemini\\antigravity-ide\\brain\\0cf8651e-ba7c-472f-b3ba-3003faa8d32c\\countach_wheel_sprite_1788423123086.jpg";

Promise.all([
    processImage(carImg, "./public/car.png", false, true), // isWheel=false, isCar=true
    processImage(robotImg, "./public/robot.png"),
    processImage(wheelImg, "./public/wheel.png", true)
]).then(() => console.log("All Done"));
