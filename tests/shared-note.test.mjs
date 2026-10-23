import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {decodeBsp,uniqueValue as v} from '../scripts/bsp.mjs';
import {entitySpans} from '../scripts/build-door-experiment.mjs';
import {buildCafeDoors} from '../scripts/build-cafe-doors.mjs';
import {buildSharedNote,NOTE_MAP} from '../scripts/build-shared-note.mjs';
const fixture=process.env.COF_C_START2_FIXTURE,options={skip:!fixture};

test('single-note experiment retains cafe chain and every other original record/lump',options,()=>{
  const source=fs.readFileSync(fixture),base=decodeBsp(buildCafeDoors(source).output),r=buildSharedNote(source),b=decodeBsp(r.output);
  assert.equal(r.report.map,NOTE_MAP);assert.equal(b.entities.length,493);
  assert.deepEqual(b.lumps.slice(1),base.lumps.slice(1));assert.ok(r.output.subarray(12,source.length).equals(source.subarray(12)));
  const a=entitySpans(base.entityText),c=entitySpans(b.entityText);
  for(let i=0;i<base.entities.length;i++)if(i!==243){
    assert.deepEqual(b.entities[i].pairs,base.entities[i].pairs);
    assert.equal(b.entityText.slice(c[i].start,c[i].end),base.entityText.slice(a[i].start,a[i].end));
  }
  assert.equal(v(b.entities[243],'classname'),'env_model');assert.equal(v(b.entities[243],'origin'),'27 2069 -518');
  assert.equal(v(b.entities[243],'angles'),'0 -53 0');assert.equal(v(b.entities[242],'classname'),'cof_passwordnote');
  assert.equal(v(b.entities[242],'usertype'),'1');assert.deepEqual(buildSharedNote(source).output,r.output);
  assert.throws(()=>buildSharedNote(r.output),/SHA256 mismatch/);
  assert.ok(!b.entities.slice(base.entities.length).some(e=>/game_text|game_player_equip|item_|weapon_/.test(v(e,'classname')??'')));
});
test('generated fan-out assigns one fresh native note to each of 1-4 players and removes collection entry points',options,()=>{
  const r=buildSharedNote(fs.readFileSync(fixture)),b=decodeBsp(r.output);
  const named=n=>b.entities.filter(e=>v(e,'targetname')===n);
  const button=named('cof_note243_button')[0],manager=named(v(button,'target'))[0],zone=named('cof_note243_players')[0];
  assert.equal(v(button,'wait'),'-1');assert.equal(v(button,'spawnflags'),'129');assert.equal(v(button,'sounds'),'0');
  assert.equal(v(manager,'cof_note243_players'),'0');assert.equal(v(manager,'spawnflags'),'1');
  assert.equal(v(zone,'classname'),'game_zone_player');assert.equal(v(zone,'intarget'),v(zone,'outtarget'));
  const counters=named(v(zone,'intarget'));assert.equal(counters.length,4);
  const helpers=counters.map(e=>named(v(e,'target'))[0]);
  assert.equal(new Set(helpers.map(e=>e.index)).size,4);
  for(const helper of helpers){assert.equal(v(helper,'classname'),'cof_passwordnote');assert.equal(v(helper,'usertype'),'0');
    assert.equal(v(helper,'effects'),'128');assert.equal(v(helper,'origin'),'0 0 -3000');}
  for(const players of [[1],[2],[1,2],[1,3],[1,2,3],[1,2,3,4]]){
    const counts=counters.map(e=>Number(v(e,'frags'))),grants=[];
    for(const actor of players)for(let i=0;i<4;i++){
      counts[i]++;if(counts[i]===Number(v(counters[i],'health')))grants.push({actor,helper:helpers[i].index});
    }
    assert.deepEqual(grants.map(x=>x.actor),players);assert.equal(new Set(grants.map(x=>x.helper)).size,players.length);
  }
  // This validates generated wiring under documented semantics, not DLL runtime.
  for(const [relay,target] of [['visual','cof_note243_visual'],['button','cof_note243_button'],['dispatch',r.report.note.dispatch]]){
    const name=`cof_note243_remove_${relay}`;assert.equal(v(manager,name),'0.1');assert.equal(v(named(name)[0],'killtarget'),target);
  }
});
