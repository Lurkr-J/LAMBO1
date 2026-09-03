import { Jimp } from 'jimp';

async function checkBounds() {
    const img = await Jimp.read('C:\\Users\\mstfj\\.gemini\\antigravity-ide\\brain\\0cf8651e-ba7c-472f-b3ba-3003faa8d32c\\robot_run_exact_ref_1788435162572.jpg');
    const data = img.bitmap.data;
    const tw = img.bitmap.width;
    const th = img.bitmap.height;
    
    const cols = 4, rows = 2;
    const chunkW = Math.floor(tw/cols), chunkH = Math.floor(th/rows);
    
    for(let r=0; r<rows; r++) {
        for(let c=0; c<cols; c++) {
            let startX = c*chunkW, endX = (c+1)*chunkW-1;
            let startY = r*chunkH, endY = (r+1)*chunkH-1;
            
            let minX = tw, maxX = 0, minY = th, maxY = 0;
            let found = false;
            for(let x=startX; x<=endX; x++){
                for(let y=startY; y<=endY; y++){
                    const idx = (y*tw+x)*4;
                    const rCol = data[idx], gCol = data[idx+1], bCol = data[idx+2];
                    const isBlack = (rCol<40 && gCol<40 && bCol<40);
                    const isNeon = (rCol>80 && rCol>gCol+20 && bCol<100);
                    if(isBlack || isNeon) {
                        found = true;
                        if(x<minX) minX=x; if(x>maxX) maxX=x;
                        if(y<minY) minY=y; if(y>maxY) maxY=y;
                    }
                }
            }
            console.log(`Chunk r${r} c${c}: found=${found}, minY=${minY}, maxY=${maxY}, h=${maxY-minY+1}`);
        }
    }
}
checkBounds().catch(console.error);
