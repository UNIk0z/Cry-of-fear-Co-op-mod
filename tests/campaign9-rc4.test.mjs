import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {sha256} from '../scripts/bsp.mjs';
import {CAMPAIGN9_PARENT} from '../scripts/package-state-rc4.mjs';
const repo=fileURLToPath(new URL('..',import.meta.url));
const pkg=process.env.COF_CAMPAIGN9_PACKAGE,previous=process.env.COF_CAMPAIGN8_PACKAGE;
const ready=!!(pkg&&previous&&fs.existsSync(path.join(pkg,'release.json'))&&fs.existsSync(path.join(previous,'release.json')));
const read=(...p)=>fs.readFileSync(path.join(...p));
const pairs=text=>Object.fromEntries([...text.matchAll(/"([^"]*)"\s+"([^"]*)"/g)].map(m=>[m[1],m[2]]));

test('coop-fixes-009 changes only the adapter and the two Custom Campaign labels over coop-fixes-008',{skip:!ready},()=>{
 const before=read(previous,'release.json');assert.equal(sha256(before),CAMPAIGN9_PARENT);
 const now=JSON.parse(read(pkg,'release.json')),old=JSON.parse(before);
 assert.equal(now.coopFixes.id,'coop-fixes-009');assert.equal(now.coopFixes.parentCatalog,CAMPAIGN9_PARENT);assert.deepEqual(now.coopFixes.changedMaps,[]);
 assert.equal(now.maps.length,old.maps.length);
 for(const m of now.maps){const o=old.maps.find(x=>x.map===m.map);assert.ok(o);assert.equal(m.outputSha256,o.outputSha256);assert.equal(m.planSha256,o.planSha256);}
 // Simon's model is still built at install time, identically.
 const simon=now.extras.find(x=>x.build),oldSimon=old.extras.find(x=>x.build);assert.deepEqual(simon,oldSimon);
 for(const kind of ['new','continue']){
  const x=now.extras.find(e=>e.target==='maps/storycoop_'+kind+'.custom'),o=old.extras.find(e=>e.target===x.target);
  assert.notEqual(x.sha256,o.sha256);const bytes=read(pkg,x.file);assert.equal(sha256(bytes),x.sha256);
  // The Custom Campaign list cuts descriptions after 26 characters (user screenshot 2026-10-13).
  const p=pairs(bytes.toString('latin1'));assert.equal(p.firstmap,'sc4coop_'+kind);assert.ok(p.description.length<=22,p.description);
 }
 assert.notEqual(now.runtimeAdapter.sha256,old.runtimeAdapter.sha256);
 assert.equal(sha256(read(pkg,'native','storycoop_rc4.dll')),now.runtimeAdapter.sha256);
 assert.ok(read(pkg,'previous-rc4-rollback','release.json').equals(before));
 // The repo's setup scripts have moved on (coop-fixes-010); the 009 package keeps its own copies.
 for(const f of ['setup-coop.ps1','join-coop.ps1'])assert.ok(read(pkg,f).toString('utf8').includes('coop-fixes-009'),f);
 assert.ok(read(pkg,'find-cof.ps1').length>0&&   /* coop-fixes-013 added the Steam name lookup to the repo copy */read(pkg,'install-story-package.ps1').toString('utf8').includes('simon-player-model'));
 for(const f of ['INSTALL co-op.cmd','JOIN a co-op game.cmd','Start co-op menu.cmd','remove.cmd'])assert.ok(fs.existsSync(path.join(pkg,f)),f);
 const known=JSON.parse(read(pkg,'known-builds.json'));assert.equal(known.builds[0].catalogSha256,CAMPAIGN9_PARENT);
 // The 008 labels are recognised as this project's files, so setup moves them aside.
 for(const kind of ['new','continue'])assert.ok(known.builds[0].extras.some(x=>x.target==='maps/storycoop_'+kind+'.custom'&&x.sha256===old.extras.find(e=>e.target===x.target).sha256));
 const files=[];const walk=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true}))e.isDirectory()?walk(path.join(d,e.name)):files.push(e.name);};walk(pkg);
 assert.ok(!files.some(f=>/\.(mdl|tga)$/i.test(f)),'no game art is shipped');
});

test('009 adapter wiring: Simon on the opening maps, moving dual-wield pose, *paused* text, menu credit',()=>{
 const src=f=>fs.readFileSync(path.join(repo,'native','rc4',f),'utf8');
 const session=src('session-runtime.hpp'),story=src('story-runtime.hpp'),adapter=src('adapter.cpp');
 assert.ok(session.includes('bool model_map(){return scoped()||opening();}')&&!/world_models_simon\(\)\{\n if\(!simonModel\|\|!scoped\(\)/.test(session));
 assert.ok(story.includes('store(v,0x138,now)')&&!story.includes('store(v,0x138,start)'));
 assert.ok(session.includes('"*paused*"')&&session.includes('pause_notice(paused,now)'));
 assert.ok(session.includes('developed by Anas Sammak')   /* wording changed by user request in coop-fixes-013 */&&session.includes('"c_game_menu1"')&&adapter.includes('menu_credit_frame();')&&adapter.includes('menu_credit_reset();'));
 // Still exactly one direct call into the pinned game DLL.
 assert.equal((story.match(/0xDE990/g)??[]).length,1);
});
