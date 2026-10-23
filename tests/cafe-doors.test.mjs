import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {decodeBsp,sha256,uniqueValue as v} from '../scripts/bsp.mjs';
import {entitySpans} from '../scripts/build-door-experiment.mjs';
import {buildCStart2Full} from '../scripts/build-c-start2-full.mjs';
import {buildDoorPresentation} from '../scripts/build-door-presentation.mjs';
import {buildCafeDoors,CAFE_MAP} from '../scripts/build-cafe-doors.mjs';

const fixture=process.env.COF_C_START2_FIXTURE,options={skip:!fixture};
test('cafe adapter preserves geometry, ordinary reference, notes and unrelated story records',options,()=>{
  const source=fs.readFileSync(fixture),old=decodeBsp(source),r=buildCafeDoors(source),next=decodeBsp(r.output);
  assert.equal(r.report.map,CAFE_MAP);assert.equal(next.entities.length,479);
  assert.deepEqual(next.lumps.slice(1),old.lumps.slice(1));assert.ok(r.output.subarray(12,source.length).equals(source.subarray(12)));
  const changed=new Set([48,49,50,51,203,204,205,206,345,412,414]);
  assert.deepEqual(r.report.modifiedOriginalEntities,[...changed]);
  const a=entitySpans(old.entityText),b=entitySpans(next.entityText);
  for(let i=0;i<old.entities.length;i++)if(!changed.has(i)){
    assert.equal(next.entityText.slice(b[i].start,b[i].end),old.entityText.slice(a[i].start,a[i].end));
  }
  const ordinary=decodeBsp(buildCStart2Full(source).output);
  for(const i of [48,49,50,51])assert.deepEqual(next.entities[i].pairs,ordinary.entities[i].pairs);
  assert.deepEqual(next.entities.slice(443,455).map(e=>e.pairs),ordinary.entities.slice(443).map(e=>e.pairs));
  assert.equal(sha256(buildDoorPresentation(source,'fade').output),'4a0e1ddb450133d429250bb1d480689f4c9c1dc7949844affd2b541507b76a23');
  assert.ok(!next.entities.some(e=>v(e,'classname')==='game_text'));assert.deepEqual(buildCafeDoors(source).output,r.output);
  assert.throws(()=>buildCafeDoors(r.output),/SHA256 mismatch/);
  const bad=Buffer.from(source);bad[0]^=1;assert.throws(()=>buildCafeDoors(bad),/SHA256 mismatch/);
});
test('enable and removal dependencies gate starting and delayed cafe relocation without changing activator selector',options,()=>{
  const {output,report}=buildCafeDoors(fs.readFileSync(fixture)),b=decodeBsp(output);
  const named=n=>{const found=b.entities.filter(e=>v(e,'targetname')===n);assert.equal(found.length,1,n);return found[0];};
  const masterState=e=>v(named(v(e,'master')),'globalstate');
  const enable=b.entities[414],enableState=v(enable,'globalstate');
  assert.equal(v(enable,'classname'),'env_global');assert.equal(v(enable,'triggermode'),'1');
  assert.equal(v(enable,'initialstate'),'0');assert.equal(v(b.entities[413],'target'),v(enable,'targetname'));
  const states=new Map();
  const useGlobal=e=>states.set(v(e,'globalstate'),v(e,'triggermode')==='1');
  const allowed=e=>states.get(masterState(e))===true;
  const reset=named('cof_cafe_reset');
  const load=()=>{for(const [n] of reset.pairs.filter(([,t])=>t==='0'))useGlobal(named(n));};
  const auto=b.entities.filter(e=>v(e,'classname')==='trigger_auto'&&v(e,'target')==='cof_cafe_reset');assert.equal(auto.length,1);
  load();assert.equal(allowed(b.entities[204]),true);assert.equal(allowed(b.entities[206]),false);
  assert.equal(masterState(named(v(b.entities[206],'target'))),enableState);
  useGlobal(enable);useGlobal(enable);assert.equal(allowed(b.entities[206]),true); // enabling is not a toggle
  for(const r of report.routes){
    const panel=b.entities[r.door],helper=named(r.helper),tele=named(r.teleport),kill=b.entities[r.kill];
    assert.equal(v(panel,'targetname'),r.name);assert.equal(v(panel,'model'),r.door===204?'*14':'*15');
    assert.equal(v(kill,'killtarget'),r.name);assert.equal(v(tele,'classname'),'cof_teleport');
    assert.ok(!tele.pairs.some(([k])=>k==='message'));assert.equal(v(tele,'target'),r.target);
    assert.equal(v(helper,'classname'),'multi_manager');assert.equal(v(helper,'spawnflags'),'1');
    assert.equal(v(helper,r.teleport),'0');assert.equal(masterState(helper),r.aliveState);
    assert.equal(allowed(helper),true);useGlobal(named(v(kill,'target')));assert.equal(allowed(helper),false);
    // Pending accepted fades still have a finite reveal event after cancellation.
    const start=named(v(panel,'target')),reveal=named(`cof_story_reveal${r.door}`);
    assert.equal(v(start,`cof_story_reveal${r.door}`),'1.35');assert.equal(v(reveal,'spawnflags'),'5');
    assert.equal(v(reveal,'duration'),'0.6');assert.equal(v(reveal,'holdtime'),'0');
  }
  // A new map load explicitly resets all states even if the global table persists.
  load();assert.equal(allowed(b.entities[204]),true);assert.equal(allowed(b.entities[206]),false);
  for(const r of report.routes)assert.equal(allowed(named(r.helper)),true);
});
