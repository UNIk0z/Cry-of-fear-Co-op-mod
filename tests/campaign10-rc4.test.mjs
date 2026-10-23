import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {sha256} from '../scripts/bsp.mjs';
import {CAMPAIGN10_PARENT} from '../scripts/package-state-rc4.mjs';
import {MENU_LOGO_TARGET,applyDelta,decodePng,menuLogoFromPng,xorDelta} from '../scripts/menu-logo.mjs';
const repo=fileURLToPath(new URL('..',import.meta.url));
const pkg=process.env.COF_CAMPAIGN10_PACKAGE,previous=process.env.COF_CAMPAIGN9_PACKAGE,game=process.env.COF_GAME_DIRECTORY;
const ready=!!(pkg&&previous&&fs.existsSync(path.join(pkg,'release.json'))&&fs.existsSync(path.join(previous,'release.json')));
const read=(...p)=>fs.readFileSync(path.join(...p));

test('coop-fixes-010 adds only the CO-OP menu title (as a delta) over coop-fixes-009',{skip:!ready},()=>{
 const before=read(previous,'release.json');assert.equal(sha256(before),CAMPAIGN10_PARENT);
 const now=JSON.parse(read(pkg,'release.json')),old=JSON.parse(before);
 assert.equal(now.coopFixes.id,'coop-fixes-010');assert.equal(now.coopFixes.parentCatalog,CAMPAIGN10_PARENT);assert.deepEqual(now.coopFixes.changedMaps,[]);
 assert.equal(now.maps.length,old.maps.length);
 for(const m of now.maps){const o=old.maps.find(x=>x.map===m.map);assert.equal(m.outputSha256,o.outputSha256);assert.equal(m.planSha256,o.planSha256);}
 assert.equal(now.runtimeAdapter.sha256,old.runtimeAdapter.sha256);
 assert.deepEqual(now.extras.filter(x=>!x.replaces),old.extras);
 const logo=now.extras.find(x=>x.replaces);
 assert.equal(logo.target,MENU_LOGO_TARGET);assert.equal(logo.file,'extras/menu_logo.coop-delta');assert.equal(logo.optional,true);
 assert.equal(logo.replaces.fileBytes,logo.fileBytes);assert.notEqual(logo.replaces.sha256,logo.sha256);
 const delta=read(pkg,logo.file);assert.equal(sha256(delta),logo.deltaSha256);
 // Rebuilt from this PC's own title (while it still holds the game's version).
 if(game){const t=path.join(game,MENU_LOGO_TARGET),keep=t+'.storycoop-original',own=fs.existsSync(keep)?fs.readFileSync(keep):fs.readFileSync(t);
  if(sha256(own)===logo.replaces.sha256){const made=applyDelta(own,delta);assert.equal(sha256(made),logo.sha256);assert.equal(made.length,logo.fileBytes);}}
 // No game art: no TGA/PNG/MDL anywhere in the package.
 const files=[];const walk=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true}))e.isDirectory()?walk(path.join(d,e.name)):files.push(e.name);};walk(pkg);
 assert.ok(!files.some(f=>/\.(mdl|tga|png)$/i.test(f)));
 // The repo's setup and join scripts have moved on (coop-fixes-011); 010 keeps its own copies.
 for(const f of ['setup-coop.ps1','join-coop.ps1'])assert.ok(read(pkg,f).toString('utf8').includes('coop-fixes-010'),f);
 for(const f of ['find-cof.ps1','install-story-package.ps1','host-story-coop.ps1'])assert.ok(fs.existsSync(path.join(pkg,f)),f);
 assert.ok(read(pkg,'previous-rc4-rollback','release.json').equals(before));
 const known=JSON.parse(read(pkg,'known-builds.json'));assert.equal(known.builds[0].catalogSha256,CAMPAIGN10_PARENT);
});

test('menu title delta: exact round trip, size and format guards',()=>{
 // A 2 x 1 TGA (bottom-left origin) and a matching RGBA PNG built here.
 const tga=Buffer.alloc(18+8+26);tga[2]=2;tga.writeUInt16LE(2,12);tga.writeUInt16LE(1,14);tga[16]=32;tga[17]=8;tga.write('TRUEVISION-XFILE.',18+8+8,'latin1');
 const png=(w,h,rgba)=>{const rows=Buffer.alloc((w*4+1)*h);for(let y=0;y<h;y++)rgba.copy(rows,y*(w*4+1)+1,y*w*4,(y+1)*w*4);
  const crcTable=[...Array(256)].map((_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});const crc=b=>{let c=0xffffffff;for(const x of b)c=crcTable[(c^x)&255]^(c>>>8);return (c^0xffffffff)>>>0;};
  const chunk=(t,d)=>{const l=Buffer.alloc(4);l.writeUInt32BE(d.length);const td=Buffer.concat([Buffer.from(t),d]);const c=Buffer.alloc(4);c.writeUInt32BE(crc(td));return Buffer.concat([l,td,c]);};
  const ih=Buffer.alloc(13);ih.writeUInt32BE(w,0);ih.writeUInt32BE(h,4);ih[8]=8;ih[9]=6;return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ih),chunk('IDAT',zlib.deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]);};
 const made=menuLogoFromPng(tga,png(2,1,Buffer.from([255,0,0,255,0,255,0,128])));
 assert.equal(made.length,tga.length);assert.ok(made.subarray(0,18).equals(tga.subarray(0,18))&&made.subarray(26).equals(tga.subarray(26)));
 assert.deepEqual([...made.subarray(18,26)],[0,0,255,255,0,255,0,128]);
 assert.ok(applyDelta(tga,xorDelta(tga,made)).equals(made));
 assert.deepEqual(decodePng(png(2,1,Buffer.from([1,2,3,4,5,6,7,8]))).rgba,Buffer.from([1,2,3,4,5,6,7,8]));
 assert.throws(()=>menuLogoFromPng(tga,png(3,1,Buffer.alloc(12))),/must be 2 x 1/);
});
