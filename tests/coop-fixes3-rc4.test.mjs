import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {decodeBsp,uniqueValue as v} from '../scripts/bsp.mjs';
import {coopFixes3Map} from '../scripts/build-coop-fixes3-rc4.mjs';
import {MAINTENANCE_MAPS} from '../scripts/build-maintenance-rc4.mjs';
const maps=process.env.COF_ORIGINAL_MAPS,parent=process.env.COF_COOP_FIXES_BUILD;
test('coop fixes 3: title trains wait at the station until multiintro1; every other entity and map unchanged',{skip:!maps||!parent},()=>{
 for(const spec of MAINTENANCE_MAPS){
  const source=fs.readFileSync(path.join(maps,spec.sourceMap+'.bsp')),before=fs.readFileSync(path.join(parent,spec.map+'.bsp')),report=JSON.parse(fs.readFileSync(path.join(parent,spec.map+'.json'))),built=coopFixes3Map(source,before,report);
  if(spec.sourceMap!=='c_intro'){assert.ok(built.output.equals(before));continue;}
  const entities=decodeBsp(built.output).entities,old=decodeBsp(before).entities,original=decodeBsp(source).entities;
  assert.equal(entities.length,old.length);
  // Only the two t=0 train toggles leave the gated timeline.
  assert.equal(v(entities[489],'skittag'),undefined);assert.equal(v(entities[489],'skittag22'),undefined);
  assert.deepEqual(entities[489].pairs,old[489].pairs.filter(([k])=>k!=='skittag'&&k!=='skittag22'));
  for(let i=0;i<old.length;i++)if(i!==489)assert.deepEqual(entities[i],old[i]);
  // Original order of events: the t=0 toggle STOPPED trains moving since load
  // (startspeed 300); the authored restart remains at multiintro1 +10s.
  assert.equal(v(original[489],'skittag'),'0');for(const i of [99,102,142,341]){assert.equal(v(original[i],'startspeed'),'300');assert.equal(v(entities[i],'startspeed'),'0');}
  assert.equal(v(entities[115],'skittag#1'),'10');assert.equal(v(entities[342],'skittag22#1'),'10');assert.equal(v(entities[342],'tjenahej'),'10');
  // Nothing else in the gated timeline starts a title train.
  for(const e of entities)if(v(e,'targetname')==='sc3_timeline_multiintroduct'||v(e,'targetname')==='multiintroduct')for(const [k] of e.pairs)assert.ok(!/^skittag/.test(k));
  assert.throws(()=>coopFixes3Map(source,built.output,{...report,...built,output:undefined}));
 }
});
