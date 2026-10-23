// coop-fixes-010: the user's "CRY OF FEAR / CO-OP" main menu title.
//
// The game's title is gfx/vgui/menu_logo.tga (512 x 66, 32-bit, bottom-left
// origin, TGA 2.0 footer). The user drew the CO-OP version from it. Neither
// image is shipped: the package carries only the XOR of the two files
// (raw deflate), and the installer rebuilds the new title from that PC's own
// original, checked by SHA256 before and after. The original is kept next to
// it for remove.cmd.
import fs from 'node:fs';
import zlib from 'node:zlib';

export const MENU_LOGO_TARGET='gfx/vgui/menu_logo.tga';

// Non-interlaced 8-bit RGBA PNG -> RGBA rows, top row first.
export function decodePng(b){
 if(b.toString('latin1',1,4)!=='PNG')throw Error('Not a PNG');
 let o=8,w=0,h=0,ok=false;const idat=[];
 while(o<b.length){const len=b.readUInt32BE(o),type=b.toString('latin1',o+4,o+8),d=b.subarray(o+8,o+8+len);
  if(type==='IHDR'){w=d.readUInt32BE(0);h=d.readUInt32BE(4);ok=d[8]===8&&d[9]===6&&d[12]===0;}
  if(type==='IDAT')idat.push(d);if(type==='IEND')break;o+=12+len;}
 if(!ok)throw Error('PNG must be 8-bit RGBA, not interlaced');
 const raw=zlib.inflateSync(Buffer.concat(idat)),stride=w*4,px=Buffer.alloc(stride*h);
 for(let y=0;y<h;y++){const f=raw[y*(stride+1)],at=y*(stride+1)+1;
  for(let x=0;x<stride;x++){const a=x>=4?px[y*stride+x-4]:0,up=y?px[(y-1)*stride+x]:0,c=x>=4&&y?px[(y-1)*stride+x-4]:0;let v=raw[at+x];
   if(f===1)v+=a;else if(f===2)v+=up;else if(f===3)v+=(a+up)>>1;else if(f===4){const p=a+up-c,pa=Math.abs(p-a),pb=Math.abs(p-up),pc=Math.abs(p-c);v+=pa<=pb&&pa<=pc?a:pb<=pc?up:c;}else if(f!==0)throw Error('PNG filter');
   px[y*stride+x]=v&255;}}
 return {width:w,height:h,rgba:px};
}

// The game's TGA with its pixels replaced: same header, same footer, same length.
export function menuLogoFromPng(original,png){
 if(original.length<18||original[2]!==2||original[16]!==32||(original[17]&0x20)||original[0]!==0)throw Error('Unexpected original title format');
 const w=original.readUInt16LE(12),h=original.readUInt16LE(14),{width,height,rgba}=decodePng(png);
 if(width!==w||height!==h)throw Error(`The new title must be ${w} x ${h} (it is ${width} x ${height})`);
 const out=Buffer.from(original);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const s=(y*w+x)*4,d=18+((h-1-y)*w+x)*4;out[d]=rgba[s+2];out[d+1]=rgba[s+1];out[d+2]=rgba[s];out[d+3]=rgba[s+3];}
 return out;
}
export function xorDelta(original,result){if(original.length!==result.length)throw Error('Length');const d=Buffer.alloc(result.length);for(let i=0;i<d.length;i++)d[i]=original[i]^result[i];return zlib.deflateRawSync(d,{level:9});}
export function applyDelta(original,delta){const d=zlib.inflateRawSync(delta);if(d.length!==original.length)throw Error('Delta length');const out=Buffer.alloc(d.length);for(let i=0;i<d.length;i++)out[i]=original[i]^d[i];return out;}
// Once installed, the game's own title is the kept .storycoop-original copy.
export function menuLogoFromFiles(gameRoot,pngPath){const target=gameRoot+'/'+MENU_LOGO_TARGET,kept=target+'.storycoop-original',original=fs.readFileSync(fs.existsSync(kept)?kept:target),result=menuLogoFromPng(original,fs.readFileSync(pngPath));return {original,result,delta:xorDelta(original,result)};}
