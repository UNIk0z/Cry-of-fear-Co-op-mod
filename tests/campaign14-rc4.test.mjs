import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {sha256} from '../scripts/bsp.mjs';
import {CAMPAIGN14_PARENT} from '../scripts/package-state-rc4.mjs';
import {PLAYER_SCRIPTS} from '../scripts/player-package.mjs';
const repo=fileURLToPath(new URL('..',import.meta.url));
const pkg=process.env.COF_CAMPAIGN14_PACKAGE,previous=process.env.COF_CAMPAIGN13_PACKAGE;
const ready=!!(pkg&&previous&&fs.existsSync(path.join(pkg,'release.json'))&&fs.existsSync(path.join(previous,'release.json')));
const read=(...p)=>fs.readFileSync(path.join(...p));

test('coop-fixes-014 package: adapter only over 013; maps, plans and extras identical',{skip:!ready},()=>{
 const before=read(previous,'release.json');assert.equal(sha256(before),CAMPAIGN14_PARENT);
 const now=JSON.parse(read(pkg,'release.json')),old=JSON.parse(before);
 assert.equal(now.coopFixes.id,'coop-fixes-014');assert.equal(now.coopFixes.mapsByteIdentical,true);assert.deepEqual(now.coopFixes.changedMaps,[]);
 assert.deepEqual(now.maps,old.maps);assert.deepEqual(now.extras,old.extras);
 for(const m of now.maps)assert.equal(sha256(read(pkg,'plans',m.map+'.json')),m.planSha256);
 assert.notEqual(now.runtimeAdapter.sha256,old.runtimeAdapter.sha256);assert.equal(sha256(read(pkg,'native','storycoop_rc4.dll')),now.runtimeAdapter.sha256);
 assert.equal(sha256(read(pkg,'previous-rc4-rollback','release.json')),CAMPAIGN14_PARENT);
 const known=JSON.parse(read(pkg,'known-builds.json'));assert.equal(known.builds[0].catalogSha256,CAMPAIGN14_PARENT);
 // Player scripts moved on in v0.1; tests/v01.test.mjs compares the current package.
});

test('014 adapter source: players are always packed; EF_NODRAW (0x80) at entity_state+0x3C in scene cameras',()=>{
 const adapter=fs.readFileSync(path.join(repo,'native','rc4','adapter.cpp'),'utf8');
 assert.ok(!adapter.includes('hide_player_from(e,host))return 0;'));
 // v0.1: the same flag also hides Simon cutscene actors outside scene views.
 assert.ok(adapter.includes('const bool hide=player?hide_player_from(e,host):hide_actor_from(e,host);')||adapter.includes('const bool hide=player&&hide_player_from(e,host);'));   // v0.2: only players
 assert.ok(adapter.includes('if(result&&hide&&state)store(state,0x3c,load<unsigned>(state,0x3c)|0x80u);'));
});
