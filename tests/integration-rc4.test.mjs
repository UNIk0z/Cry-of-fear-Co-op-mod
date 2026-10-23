import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {decodeBsp,uniqueValue as v} from '../scripts/bsp.mjs';
import {integrateMap} from '../scripts/build-integration-rc4.mjs';
import {MAINTENANCE_MAPS} from '../scripts/build-maintenance-rc4.mjs';
import {worldHull,sampleSpawn} from '../scripts/collision.mjs';
const maps=process.env.COF_ORIGINAL_MAPS,parent=process.env.COF_REGRESSION_BUILD;
test('integration retains five BSPs and all original geometry; scene door checks both prerequisites at Use and relocation',{skip:!maps||!parent},()=>{
 for(const spec of MAINTENANCE_MAPS){
  const source=fs.readFileSync(path.join(maps,spec.sourceMap+'.bsp')),before=fs.readFileSync(path.join(parent,spec.map+'.bsp')),report=JSON.parse(fs.readFileSync(path.join(parent,spec.map+'.json'))),built=integrateMap(source,before,report);
  assert.ok(built.output.subarray(124,source.length).equals(source.subarray(124)));
  if(spec.sourceMap!=='c_start'){assert.ok(built.output.equals(before));continue;}
  const entities=decodeBsp(built.output).entities,old=decodeBsp(before).entities,named=n=>entities.find(e=>v(e,'targetname')===n);
  assert.equal(v(entities[204],'classname'),'func_button');assert.equal(v(entities[204],'master'),'amultiscr1');
  assert.equal(v(named(v(entities[204],'target')),'master'),'sc4_cond_204_gate');
  assert.equal(v(named('sc4_cond_204_move'),'master'),'amultiscr1');assert.equal(v(named('sc4_cond_204_recheck'),'master'),'sc4_cond_204_gate');
  assert.equal(v(entities[784],'triggermode'),'1');assert.equal(v(entities[784],'initialstate'),'0');assert.equal(v(entities[172],'doorlockedssd'),'10.3');
  assert.equal(v(entities[200],'sc4_scene3_done'),'16');assert.equal(v(entities[147],'master'),'sc4_scene3_pending');
  assert.deepEqual(entities[207],old[207]);
  for(const i of [419,421,713,717])assert.deepEqual(entities[i],old[i]);
  const hull=worldHull(source),points=[1,2].map(i=>v(named('sc4_checkpoint_421_p'+i),'origin').split(' ').map(Number));
  for(const p of points)assert.ok(sampleSpawn(hull,[p[0],p[1],p[2]+36]).staticCandidate);
  assert.ok(Math.hypot(points[0][0]-points[1][0],points[0][1]-points[1][1])>=40);
  assert.notDeepEqual(points,[1,2].map(i=>v(named('sc4_checkpoint_419_p'+i),'origin').split(' ').map(Number)));
  const mutated=structuredClone(report);mutated.sourceMap='c_start';const malformed=Buffer.from(source);malformed.writeInt32LE(1,4);assert.throws(()=>integrateMap(malformed,before,mutated));
 }
});
