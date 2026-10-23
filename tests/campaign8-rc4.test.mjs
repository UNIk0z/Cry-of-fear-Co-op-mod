import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {sha256} from '../scripts/bsp.mjs';
import {CAMPAIGN8_PARENT} from '../scripts/package-state-rc4.mjs';
import {SIMON_SOURCES,simonPlan,buildSimonModel} from '../scripts/simon-model.mjs';
const repo=fileURLToPath(new URL('..',import.meta.url));
const pkg=process.env.COF_CAMPAIGN8_PACKAGE,previous=process.env.COF_CAMPAIGN7_PACKAGE,game=process.env.COF_GAME_DIRECTORY;
const ready=!!(pkg&&previous&&fs.existsSync(path.join(pkg,'release.json'))&&fs.existsSync(path.join(previous,'release.json')));
const haveGame=!!(game&&fs.existsSync(path.join(game,SIMON_SOURCES.police))&&fs.existsSync(path.join(game,SIMON_SOURCES.simon)));
const read=(...p)=>fs.readFileSync(path.join(...p));

test('coop-fixes-008 is native-only over coop-fixes-007 and describes the Simon model instead of copying the police model',{skip:!ready},()=>{
 const before=read(previous,'release.json');assert.equal(sha256(before),CAMPAIGN8_PARENT);
 const now=JSON.parse(read(pkg,'release.json')),old=JSON.parse(before);
 assert.equal(now.coopFixes.id,'coop-fixes-008');assert.equal(now.coopFixes.parentCatalog,CAMPAIGN8_PARENT);assert.deepEqual(now.coopFixes.changedMaps,[]);
 assert.equal(now.maps.length,old.maps.length);
 for(const m of now.maps){const o=old.maps.find(x=>x.map===m.map);assert.ok(o);assert.equal(m.outputSha256,o.outputSha256);assert.equal(m.planSha256,o.planSha256);}
 assert.deepEqual(now.extras.filter(x=>x.file),old.extras.filter(x=>x.file));
 const simon=now.extras.find(x=>x.target==='models/player/simon/simon.mdl');
 assert.equal(simon.build,'simon-player-model');assert.equal(simon.optional,true);assert.equal(simon.copyFrom,undefined);
 assert.deepEqual([simon.sources.police,simon.sources.simon],[SIMON_SOURCES.police,SIMON_SOURCES.simon]);
 assert.equal(Buffer.from(simon.transforms,'base64').length,simon.boneMap.length*12*8);
 assert.notEqual(simon.sha256,old.extras.find(x=>x.target===simon.target).sha256);
 // No model bytes are shipped.
 const files=[];const walk=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true}))e.isDirectory()?walk(path.join(d,e.name)):files.push(e.name);};walk(pkg);
 assert.ok(!files.some(f=>f.toLowerCase().endsWith('.mdl')));
 assert.notEqual(now.runtimeAdapter.sha256,old.runtimeAdapter.sha256);
 assert.equal(sha256(read(pkg,'native','storycoop_rc4.dll')),now.runtimeAdapter.sha256);
 assert.ok(read(pkg,'previous-rc4-rollback','release.json').equals(before));
 // The repo's setup scripts have moved on (coop-fixes-009); the 008 package keeps its own copies.
 for(const f of ['setup-coop.ps1','find-cof.ps1','join-coop.ps1'])assert.ok(read(pkg,f).toString('utf8').includes('coop-fixes-008'),f);
 // The repo installer has moved on (coop-fixes-010 title); 008 ships the Simon build step.
 assert.ok(read(pkg,'install-story-package.ps1').toString('utf8').includes('simon-player-model'));
 for(const f of ['INSTALL co-op.cmd','JOIN a co-op game.cmd','Start co-op menu.cmd','remove.cmd'])assert.ok(fs.existsSync(path.join(pkg,f)),f);
 const known=JSON.parse(read(pkg,'known-builds.json'));
 assert.equal(known.builds[0].catalogSha256,CAMPAIGN8_PARENT);
 assert.ok(known.builds[0].extras.some(x=>x.target===simon.target&&x.sha256==='b08061541abc1ced6fc39c519c8a88b48858427d30a3c39554c4029859abd478'),'the 007 police copy is set aside');
 if(haveGame){const police=read(game,SIMON_SOURCES.police),s=read(game,SIMON_SOURCES.simon);
  if(sha256(police)===simon.sources.policeSha256&&sha256(s)===simon.sources.simonSha256){const model=buildSimonModel(police,s,simon);assert.equal(sha256(model),simon.sha256);assert.equal(model.length,simon.fileBytes);}}
});

test('Simon model: Simon mesh on the police skeleton, every Simon bone mapped, deterministic',{skip:!haveGame},()=>{
 const police=read(game,SIMON_SOURCES.police),simon=read(game,SIMON_SOURCES.simon),plan=simonPlan(police,simon);
 assert.equal(plan.boneMap.length,simon.readInt32LE(0x8c));
 assert.ok(plan.boneMap.every(b=>b>=0&&b<police.readInt32LE(0x8c)));
 const a=buildSimonModel(police,simon,plan),b=buildSimonModel(police,simon,simonPlan(police,simon));assert.ok(a.equals(b));
 // Police skeleton/animations kept; Simon's textures and body parts appended.
 assert.ok(a.subarray(0x8c,180).equals(police.subarray(0x8c,180)));
 const X=(police.length+15)&~15;assert.equal(a.readInt32LE(184),X+simon.readInt32LE(184));assert.equal(a.readInt32LE(204),simon.readInt32LE(204));
 assert.equal(a.readInt32LE(72),a.length);assert.equal(a.toString('latin1',8,17),'simon.mdl');
});

test('008 adapter wiring: dual weight lift, per-viewer light flags, save sound and partner notice, bounded model sets, rejoin camera/pose, game-over reload, quick keys',()=>{
 const session=fs.readFileSync(path.join(repo,'native','rc4','session-runtime.hpp'),'utf8'),story=fs.readFileSync(path.join(repo,'native','rc4','story-runtime.hpp'),'utf8'),adapter=fs.readFileSync(path.join(repo,'native','rc4','adapter.cpp'),'utf8'),checkpoint=fs.readFileSync(path.join(repo,'native','rc4','checkpoint-runtime.hpp'),'utf8');
 assert.ok(session.includes('s.attempts>=3')&&session.includes('now+1.f'));
 assert.ok(story.includes('DualWeightRva=0x231888+15*0x2c+0x28')&&story.includes('score_sync()'));
 assert.ok(adapter.includes('score_begin(dest,type,e)')&&adapter.includes('logo_end()||score_end()'));
 assert.ok(checkpoint.includes('save/save_sequence.wav')&&checkpoint.includes("on the host's PC."));
 const camera=fs.readFileSync(path.join(repo,'native','rc4','camera-runtime.hpp'),'utf8'),format=fs.readFileSync(path.join(repo,'native','rc4','checkpoint.cpp'),'utf8');
 assert.ok(checkpoint.includes('checkpoint_game_over_check')&&checkpoint.includes('quick_restore(qp,saved,slots)')&&/deactivate\(\)\{(deathmatch_close\(\);)?checkpoint_game_over_check\(\);/.test(adapter)   /* v0.5 closes the spawnflags hold first */);
 assert.ok(camera.includes('void camera_join(Edict* e)')&&adapter.includes('camera_join(e)')&&adapter.includes('view_seen(view,client)')&&/w\.put<std::uint32_t>\([5-8]\)/.test(format)   /* schema 6 since coop-fixes-013, 7 since v0.2 */);
 assert.ok(story.includes('restore_player(e,saved,saved.hasPose,true)'));
 assert.ok(/@\(1,2,3,4,5(,6(,7(,8)?)?)?\)/.test(fs.readFileSync(path.join(repo,'scripts','read-coop-checkpoint.ps1'),'utf8')))   /* schema 6 since coop-fixes-013 */;
 // Still exactly one direct call into the pinned game DLL.
 assert.equal((story.match(/0xDE990/g)??[]).length,1);
});
