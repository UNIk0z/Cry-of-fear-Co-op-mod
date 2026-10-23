import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {decodeBsp,uniqueValue as v} from '../scripts/bsp.mjs';
import {buildCrossMap,LINK_MAPS} from '../scripts/build-crossmap-pair.mjs';
const fixture=process.env.COF_C_START2_FIXTURE,opts={skip:!fixture};
test('native two-map portal resolves both aliases, preserves BSP geometry and retains unrelated story entities',opts,()=>{
 const directory=path.dirname(fixture);
 for(const name of ['c_start','c_start2']){
  const bytes=fs.readFileSync(path.join(directory,name+'.bsp')),original=decodeBsp(bytes),r=buildCrossMap(bytes,name),b=decodeBsp(r.output),link=r.report.crossMap;
  assert.ok(r.output.subarray(12,bytes.length).equals(bytes.subarray(12)));assert.deepEqual(b.lumps.slice(1),original.lumps.slice(1));
  assert.equal(v(b.entities[link.door],'classname'),'inter_door_coop_changelevel');assert.equal(v(b.entities[link.zone],'classname'),'trigger_coop_changelevel');
  assert.equal(v(b.entities[link.door],'message'),LINK_MAPS[name==='c_start'?'c_start2':'c_start']);assert.equal(v(b.entities[link.door],'target'),v(b.entities[link.zone],'targetname'));
  for(let slot=1;slot<=4;slot++)assert.equal(b.entities.filter(e=>v(e,'classname')===`cof_coop_spawn${slot}`).length,1);
  const modified=new Set(r.report.edits.map(e=>e.entity));for(let i=0;i<original.entities.length;i++)if(!modified.has(i))assert.deepEqual(b.entities[i].pairs,original.entities[i].pairs);
  assert.deepEqual(buildCrossMap(bytes,name).output,r.output);assert.throws(()=>buildCrossMap(r.output,name),/SHA mismatch/);
 }
});
