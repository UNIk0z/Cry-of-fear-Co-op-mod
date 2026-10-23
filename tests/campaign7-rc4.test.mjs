import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {sha256} from '../scripts/bsp.mjs';
import {CAMPAIGN7_PARENT} from '../scripts/package-state-rc4.mjs';
const repo=fileURLToPath(new URL('..',import.meta.url));
const pkg=process.env.COF_CAMPAIGN7_PACKAGE,previous=process.env.COF_CAMPAIGN6_PACKAGE;
const ready=!!(pkg&&previous&&fs.existsSync(path.join(pkg,'release.json'))&&fs.existsSync(path.join(previous,'release.json')));
const read=(...p)=>fs.readFileSync(path.join(...p));

test('coop-fixes-007 is native-only over the delivered coop-fixes-006 and carries the one-step setup',{skip:!ready},()=>{
 const before=read(previous,'release.json');assert.equal(sha256(before),CAMPAIGN7_PARENT);
 const now=JSON.parse(read(pkg,'release.json')),old=JSON.parse(before);
 assert.equal(now.coopFixes.id,'coop-fixes-007');assert.equal(now.coopFixes.parentCatalog,CAMPAIGN7_PARENT);assert.deepEqual(now.coopFixes.changedMaps,[]);
 assert.equal(now.maps.length,old.maps.length);
 for(const m of now.maps){const o=old.maps.find(x=>x.map===m.map);assert.ok(o);assert.equal(m.outputSha256,o.outputSha256);assert.equal(m.planSha256,o.planSha256);}
 assert.deepEqual(now.extras,old.extras);assert.notEqual(now.runtimeAdapter.sha256,old.runtimeAdapter.sha256);
 assert.equal(sha256(read(pkg,'native','storycoop_rc4.dll')),now.runtimeAdapter.sha256);
 assert.ok(read(pkg,'previous-rc4-rollback','release.json').equals(before));
 // The repo's setup scripts have moved on (coop-fixes-008); the 007 package keeps its own copies.
 for(const f of ['setup-coop.ps1','find-cof.ps1','join-coop.ps1'])assert.ok(read(pkg,f).toString('utf8').includes('coop-fixes-007'),f);
 for(const f of ['INSTALL co-op.cmd','JOIN a co-op game.cmd','Start co-op menu.cmd','remove.cmd'])assert.ok(fs.existsSync(path.join(pkg,f)),f);
 const known=JSON.parse(read(pkg,'known-builds.json'));
 assert.equal(known.builds[0].catalogSha256,CAMPAIGN7_PARENT);
 assert.ok(known.builds.some(b=>b.release==='connected-story-campaign-rc2'&&b.maps.length>=194),'RC2 maps known');
 assert.ok(known.menus.length>=1&&known.experimentMaps.includes('c_start2_cooptest'));
 for(const name of known.experimentMaps)assert.ok(!now.maps.some(m=>m.map===name));
});

test('007 adapter wiring: world player models, rejoin, credit spacing, net tuning',()=>{
 const session=fs.readFileSync(path.join(repo,'native','rc4','session-runtime.hpp'),'utf8'),story=fs.readFileSync(path.join(repo,'native','rc4','story-runtime.hpp'),'utf8'),adapter=fs.readFileSync(path.join(repo,'native','rc4','adapter.cpp'),'utf8'),checkpoint=fs.readFileSync(path.join(repo,'native','rc4','checkpoint-runtime.hpp'),'utf8');
 assert.ok(session.includes('WorldPointerRva=0x223190')&&session.includes('modelStates[index]'));
 assert.ok(adapter.includes('rejoin_frame(e)')&&adapter.includes('fanout_lookup(start,key,value,out)')&&adapter.includes('if(logo_end()||score_end())return;')&&adapter.includes('net_tune(e)'));
 assert.ok(checkpoint.includes('rejoin_departing(e);if(client_ready(e))checkpoint_capture_departing(e);'));
 assert.ok(story.includes('restore_player(e,saved,saved.hasPose,true)')&&story.includes('now-s.lastSent>=4.f'));
 // Still exactly one direct call into the pinned game DLL.
 assert.equal((story.match(/0xDE990/g)??[]).length,1);
});
