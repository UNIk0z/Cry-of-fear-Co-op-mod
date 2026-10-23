import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {decodeBsp,sha256,uniqueValue as v} from '../scripts/bsp.mjs';
import {buildStoryCandidate} from '../scripts/build-story-candidate.mjs';
import {entrySpawns,destinationEvidence} from '../scripts/campaign-destinations.mjs';
const build=process.env.COF_CAMPAIGN_BUILD,maps=process.env.COF_ORIGINAL_MAPS,opts={skip:!build||!maps};
const report=()=>JSON.parse(fs.readFileSync(path.join(build,'campaign-report.json')));
const source=name=>fs.readFileSync(path.join(maps,name+'.bsp'));
test('connected release contains complete maps, preserves original geometry and original model records',opts,()=>{
 let cachedName,cached;
 for(const item of report().results){if(cachedName!==item.sourceMap){cachedName=item.sourceMap;cached=source(cachedName);}const original=decodeBsp(cached),output=fs.readFileSync(path.join(build,item.map+'.bsp')),bsp=decodeBsp(output),plan=JSON.parse(fs.readFileSync(path.join(build,item.map+'.json')));
  assert.equal(sha256(output),item.outputSha256);assert.equal(sha256(cached),plan.sourceSha256);
  assert.deepEqual(bsp.lumps.slice(1,14),original.lumps.slice(1,14));
  assert.ok(output.subarray(124,cached.length).equals(cached.subarray(124)));
  const a=original.lumps[14],b=bsp.lumps[14];assert.ok(output.subarray(b.offset,b.offset+a.length).equals(cached.subarray(a.offset,a.offset+a.length)));
  for(const model of plan.modelClones){const at=b.offset+model.index*64;assert.deepEqual([0,4,8].map(k=>output.readFloatLE(at+k)),model.mins);assert.deepEqual([12,16,20].map(k=>output.readFloatLE(at+k)),model.maxs);assert.deepEqual([24,28,32].map(k=>output.readFloatLE(at+k)),[0,0,0]);}
  for(const e of bsp.entities.filter(e=>v(e,'classname')==='trigger_coop_changelevel'&&/^sc_exit_/.test(v(e,'targetname')??'')))assert.equal(v(e,'origin'),'0 0 0');
 }
});
test('every generated edge resolves inside the release; blocked entries remain explicit',opts,()=>{
 const r=report(),names=new Set(r.results.map(x=>x.map));assert.equal(names.size,195);assert.equal(r.originalMaps,81);assert.equal(r.reachableAliases,195);
 for(const m of r.results){for(const e of m.crossings)assert.ok(names.has(e.next));if(m.entryPlan.status==='BLOCKED')assert.equal(m.entryPlan.spawns.length,0);}
 const intro=r.results.find(x=>x.map===r.entry);assert.equal(intro.entryPlan.originalStart,98);assert.equal(intro.entryPlan.spawns.length,4);
 const a=r.results.filter(x=>x.sourceMap==='c_apartment1'&&['land1','land2','land3'].includes(x.landmark));assert.equal(new Set(a.map(x=>x.entryPlan.originalOrigin.join(','))).size,3);
 const bytes=source('c_start');assert.equal(entrySpawns(bytes,decodeBsp(bytes),{landmark:'hahaland'}).status,'BLOCKED');
});
test('c_start2 retains verified credential and door records; no withdrawn quiet-note closer returns',opts,()=>{
 const base=decodeBsp(buildStoryCandidate(source('c_start2')).output),r=report().results.find(x=>x.sourceMap==='c_start2'),bsp=decodeBsp(fs.readFileSync(path.join(build,r.map+'.bsp')));
 for(const i of [49,50,242,243])assert.deepEqual(bsp.entities[i].pairs,base.entities[i].pairs);
 for(const e of base.entities.filter(e=>/^cof_(?:note|story_)/.test(v(e,'targetname')??'')))assert.deepEqual(bsp.entities[e.index].pairs,e.pairs);
 assert.ok(!bsp.entities.some(e=>v(e,'classname')==='cof_closeallvgui'));
});
test('converted destinations exactly match named original exits; locked doors retain conditions',opts,()=>{
 const unique=[...new Map(report().results.map(x=>[x.sourceMap,x])).values()];
 for(const m of unique){const bytes=source(m.sourceMap),original=decodeBsp(bytes),bsp=decodeBsp(fs.readFileSync(path.join(build,m.map+'.bsp')));
  for(const d of m.doors.filter(x=>x.evidence)){const e=original.entities[d.evidence.exit];assert.equal(d.evidence.feet.join(' '),v(e,'origin').trim().split(/\s+/).map(Number).join(' '));assert.ok(d.evidence.safe);}
  for(const d of m.retainedDoors){const index=Number(d.id.split(':D')[1]);assert.deepEqual(bsp.entities[index].pairs,original.entities[index].pairs);}
 }
 const bytes=source('c_apartment1'),bsp=decodeBsp(bytes);const invalid={pairs:[['target','nonexistent_exit']]};assert.equal(destinationEvidence(bytes,bsp,invalid).safe,false);
});
test('document adapters preserve all content and use one dispatcher; camera timelines retained',opts,()=>{
 const unique=[...new Map(report().results.map(x=>[x.sourceMap,x])).values()];let notes=0,cameras=0;
 for(const m of unique){const original=decodeBsp(source(m.sourceMap)),bsp=decodeBsp(fs.readFileSync(path.join(build,m.map+'.bsp')));
  for(const n of m.notes.filter(x=>x.type==='document')){notes++;const e=bsp.entities[n.entity],before=original.entities[n.entity];assert.deepEqual(e.pairs.filter(([k])=>k!=='targetname'),before.pairs.filter(([k])=>k!=='targetname'));const dispatch=bsp.entities.filter(e=>v(e,'targetname')===n.sourceName);assert.equal(dispatch.length,1);assert.equal(v(dispatch[0],'intarget'),n.nativeName);assert.equal(v(dispatch[0],'outtarget'),n.nativeName);}
  for(const c of m.cameras){cameras++;const a=original.entities[c.entity],b=bsp.entities[c.entity];assert.deepEqual(a.pairs.filter(([k])=>k!=='spawnflags'),b.pairs.filter(([k])=>k!=='spawnflags'));assert.equal(Number(v(b,'spawnflags')),Number(v(a,'spawnflags')??0)|1024);}
 }assert.equal(notes,14);assert.equal(cameras,311);
});
