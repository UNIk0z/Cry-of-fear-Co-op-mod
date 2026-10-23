import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {sha256} from '../scripts/bsp.mjs';
import {CAMPAIGN6_PARENT} from '../scripts/package-state-rc4.mjs';
const repo=fileURLToPath(new URL('..',import.meta.url));
const pkg=process.env.COF_CAMPAIGN6_PACKAGE,previous=process.env.COF_CAMPAIGN5_PACKAGE;
const ready=!!(pkg&&previous&&fs.existsSync(path.join(pkg,'release.json'))&&fs.existsSync(path.join(previous,'release.json')));
const read=(...p)=>fs.readFileSync(path.join(...p));

test('coop-fixes-006 is native-only over the delivered coop-fixes-005',{skip:!ready},()=>{
 const before=read(previous,'release.json');assert.equal(sha256(before),CAMPAIGN6_PARENT);
 const now=JSON.parse(read(pkg,'release.json')),old=JSON.parse(before);
 assert.equal(now.coopFixes.id,'coop-fixes-006');assert.equal(now.coopFixes.parentCatalog,CAMPAIGN6_PARENT);assert.equal(now.coopFixes.mapsByteIdentical,true);assert.deepEqual(now.coopFixes.changedMaps,[]);
 assert.equal(now.maps.length,old.maps.length);
 for(const m of now.maps){const o=old.maps.find(x=>x.map===m.map);assert.ok(o,'map '+m.map);assert.equal(m.outputSha256,o.outputSha256);assert.equal(m.planSha256,o.planSha256);assert.ok(read(pkg,'plans',m.map+'.json').equals(read(previous,'plans',m.map+'.json')));}
 assert.deepEqual(now.extras,old.extras);assert.deepEqual(now.dependencies,old.dependencies);
 assert.notEqual(now.runtimeAdapter.sha256,old.runtimeAdapter.sha256);assert.equal(sha256(read(pkg,'native','storycoop_rc4.dll')),now.runtimeAdapter.sha256);
 const report=JSON.parse(read(pkg,'native','build-report.json').toString('utf8').replace(/^﻿/,''));assert.equal(Object.keys(report.sources).length,17);assert.ok(report.sources['story-runtime.hpp']);
 // Remove previous = exact 005 remover; the baseline reinstalls 005 with its menu files.
 assert.ok(read(pkg,'previous-rc4-rollback','release.json').equals(before));assert.ok(read(pkg,'baseline','release.json').equals(before));
 for(const x of old.extras)if(x.file)assert.equal(sha256(read(pkg,'baseline',x.file)),x.sha256);
 assert.ok(fs.existsSync(path.join(pkg,'Start co-op menu.cmd'))&&fs.existsSync(path.join(pkg,'remove previous RC4.cmd')));
});

test('dual wield, pose and ending carry are wired into the adapter',()=>{
 const story=fs.readFileSync(path.join(repo,'native','rc4','story-runtime.hpp'),'utf8'),adapter=fs.readFileSync(path.join(repo,'native','rc4','adapter.cpp'),'utf8'),checkpoint=fs.readFileSync(path.join(repo,'native','rc4','checkpoint.cpp'),'utf8');
 // The only direct call into the pinned game DLL: CBasePlayer::DualWield.
 assert.equal((story.match(/0xDE990/g)??[]).length,1);assert.ok(/verified&&backend\?/.test(story));
 assert.ok(adapter.includes('if(dual_command(e,command))return;'));assert.ok(/postthink\(Edict\* e\)\{[^}]*pose_frame\(e\)/.test(adapter));
 assert.ok(/start_frame\(\)\{[^}]*story_frame\(\)/.test(adapter));assert.ok(/deactivate\(\)\{[^\n]*story_adopt\(\)/.test(adapter));   // coop-fixes-013 added a braced loop before it
 // Schema 6 since coop-fixes-013 (phone state); schema 4 loading is kept.
 assert.ok(/w\.put<std::uint32_t>\([5-8]\)/.test(checkpoint)&&/version<1\|\|version>[5-8]/.test(checkpoint)&&checkpoint.includes('if(version>=4)'));
 assert.ok(/@\(1,2,3,4,5(,6(,7(,8)?)?)?\)/.test(fs.readFileSync(path.join(repo,'scripts','read-coop-checkpoint.ps1'),'utf8')));
 assert.ok(fs.readFileSync(path.join(repo,'native','rc4','build.ps1'),'utf8').includes("'story-runtime.hpp'"));
});
