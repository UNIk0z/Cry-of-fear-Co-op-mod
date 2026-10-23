import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {decodeBsp,uniqueValue as v} from '../scripts/bsp.mjs';
import {campaignDoorsMap} from '../scripts/build-campaign-doors-rc4.mjs';
import {MAINTENANCE_MAPS} from '../scripts/build-maintenance-rc4.mjs';
const maps=process.env.COF_ORIGINAL_MAPS,parent=process.env.COF_INTEGRATION_BUILD;
test('campaign doors keep six maps byte-identical; apartment key room and key door keep native prerequisites',{skip:!maps||!parent},()=>{
 for(const spec of MAINTENANCE_MAPS){
  const source=fs.readFileSync(path.join(maps,spec.sourceMap+'.bsp')),before=fs.readFileSync(path.join(parent,spec.map+'.bsp')),report=JSON.parse(fs.readFileSync(path.join(parent,spec.map+'.json'))),built=campaignDoorsMap(source,before,report);
  // Original lumps after the entity header are never rewritten.
  assert.ok(built.output.subarray(124,source.length).equals(source.subarray(124)));
  if(spec.sourceMap!=='c_apartment1'){assert.ok(built.output.equals(before));continue;}
  const entities=decodeBsp(built.output).entities,old=decodeBsp(before).entities,named=n=>entities.filter(e=>v(e,'targetname')===n);
  // Key room: the authored unlock is idempotent and the scare runs once.
  assert.equal(v(entities[713],'classname'),'func_button');assert.equal(v(entities[713],'master'),'sc4_cond_713_gate');
  assert.equal(v(entities[577],'classname'),'env_global');assert.equal(v(entities[577],'triggermode'),'1');assert.equal(v(entities[577],'initialstate'),'0');
  assert.equal(v(entities[577],'globalstate'),'sc4.door.c_apartment1.keyroom_exit.enabled');
  assert.equal(v(entities[573],'master'),'sc4_keyroom_pending');assert.equal(v(entities[574],'sc4_keyroom_complete'),'35');assert.equal(v(entities[574],'losaheheha'),'35');
  assert.equal(v(named('sc4_keyroom_complete')[0],'initialstate'),'1');
  // Key door: native inter_door, lock, key name, messages and exit unchanged.
  const door=entities[193],original=old[193];
  assert.deepEqual(door.pairs.slice(0,-1),original.pairs);assert.deepEqual(door.pairs.at(-1),['targetname','sc4_keydoor_193']);
  assert.equal(v(door,'classname'),'inter_door');assert.equal(v(door,'lockedby'),'apartmentkey');
  const [button]=named('sc4_keydoor_193_button'),[relay]=named('sc4_keydoor_193_open'),[auto]=entities.filter(e=>v(e,'classname')==='trigger_auto'&&v(e,'target')==='sc4_keydoor_193_open');
  assert.equal(v(button,'classname'),'func_button');assert.equal(v(button,'model'),v(door,'model'));assert.equal(v(button,'origin'),undefined);
  assert.equal(v(button,'master'),'sc4_cond_193_gate');assert.equal(v(button,'spawnflags'),'1');
  assert.equal(v(relay,'classname'),'trigger_relay');assert.equal(v(relay,'killtarget'),'sc4_keydoor_193');assert.equal(v(relay,'target'),'sc4_keydoor_193_unlocked');
  assert.equal(v(auto,'globalstate'),'sc4.door.c_apartment1.apartment.unlocked');
  const [unlock]=named('sc4_keydoor_193_unlocked');assert.equal(v(unlock,'triggermode'),'1');assert.equal(v(unlock,'initialstate'),'0');
  const [gate]=named('sc4_cond_193_gate');assert.equal(v(gate,'globalstate'),'sc4.door.c_apartment1.apartment.unlocked');
  const [start]=named(v(button,'target'));assert.equal(v(start,'master'),'sc4_cond_193_gate');assert.equal(v(start,'sc4_cond_193_music'),'1.25');
  const [move]=named('sc4_cond_193_move');assert.equal(v(move,'master'),'sc4_cond_193_gate');
  const [dest]=named('sc4_cond_193_dest');assert.equal(v(dest,'origin'),'-312 480 141');
  // Every other original record is retained exactly; only additions follow.
  for(let i=0;i<old.length;i++)if(![193,573,574,577,713].includes(i))assert.deepEqual(entities[i],old[i]);
  // Unchanged sibling doors stay native exactly as audited.
  for(const i of [36,333,368,386])assert.equal(v(entities[i],'classname'),'inter_door');
  assert.equal(new Set(entities.map(e=>v(e,'targetname')).filter(n=>n?.startsWith('sc4_keydoor_193'))).size,4);
  // Already edited or changed parents are refused.
  assert.throws(()=>campaignDoorsMap(source,built.output,{...report,...built,output:undefined}));
 }
});
