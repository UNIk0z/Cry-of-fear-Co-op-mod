import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {sha256} from '../scripts/bsp.mjs';
import {CAMPAIGN11_PARENT} from '../scripts/package-state-rc4.mjs';
const repo=fileURLToPath(new URL('..',import.meta.url));
const pkg=process.env.COF_CAMPAIGN11_PACKAGE,previous=process.env.COF_CAMPAIGN10_PACKAGE;
const ready=!!(pkg&&previous&&fs.existsSync(path.join(pkg,'release.json'))&&fs.existsSync(path.join(previous,'release.json')));
const read=(...p)=>fs.readFileSync(path.join(...p));

test('coop-fixes-011 changes only the adapter over coop-fixes-010',{skip:!ready},()=>{
 const before=read(previous,'release.json');assert.equal(sha256(before),CAMPAIGN11_PARENT);
 const now=JSON.parse(read(pkg,'release.json')),old=JSON.parse(before);
 assert.equal(now.coopFixes.id,'coop-fixes-011');assert.deepEqual(now.coopFixes.changedMaps,[]);
 for(const m of now.maps){const o=old.maps.find(x=>x.map===m.map);assert.equal(m.outputSha256,o.outputSha256);}
 assert.deepEqual(now.extras,old.extras);for(const x of now.extras.filter(e=>e.file))assert.ok(read(pkg,x.file).equals(read(previous,x.file)));
 assert.notEqual(now.runtimeAdapter.sha256,old.runtimeAdapter.sha256);assert.equal(sha256(read(pkg,'native','storycoop_rc4.dll')),now.runtimeAdapter.sha256);
 for(const f of ['setup-coop.ps1','find-cof.ps1','join-coop.ps1','install-story-package.ps1','host-story-coop.ps1'])assert.ok(fs.existsSync(path.join(pkg,f)),f);
 assert.equal(JSON.parse(read(pkg,'known-builds.json')).builds[0].catalogSha256,CAMPAIGN11_PARENT);
});

test('011 adapter: police defaults become Simon, short light notices',()=>{
 const session=fs.readFileSync(path.join(repo,'native','rc4','session-runtime.hpp'),'utf8');
 assert.ok(session.includes('bool default_player_model(int named)')&&session.includes('!default_player_model(named)'));
 for(const t of session.matchAll(/light_notify\(e,\d+u,"([^"]*)"/g))for(const line of t[1].split(String.fromCharCode(92)+'n'))assert.ok(line.length<=26,line);
});
