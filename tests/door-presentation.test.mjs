import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {decodeBsp,sha256,uniqueValue} from '../scripts/bsp.mjs';
import {buildDoorPresentation,VERIFIED_V6_SHA,PRESENTATION_TIMING as timing} from '../scripts/build-door-presentation.mjs';
import {buildUseSelector} from '../scripts/build-use-selector.mjs';
import {DOOR_ROUTES} from '../scripts/build-use-door-experiment.mjs';

// Actual game fixture remains outside Git. These verify preservation/configuration,
// NOT delayed activator identity, audio, fading or multiplayer runtime behavior.
const sourcePath=process.env.COF_C_START2_FIXTURE;
test('presentation preserves the user-verified teleport and scopes its additions',{skip:!sourcePath},()=>{
  const source=fs.readFileSync(sourcePath),baseline=buildUseSelector(source);
  assert.equal(sha256(baseline.output),VERIFIED_V6_SHA);
  const original=decodeBsp(source),v6=decodeBsp(baseline.output);
  for(const variant of ['audio','fade']){
    const result=buildDoorPresentation(source,variant),next=decodeBsp(result.output);
    assert.equal(next.entities.length,variant==='audio'?453:457);
    assert.deepEqual(next.lumps.slice(1),original.lumps.slice(1));
    assert.ok(result.output.subarray(12,source.length).equals(source.subarray(12)));
    assert.deepEqual(buildDoorPresentation(source,variant).output,result.output);
    for(let i=0;i<v6.entities.length;i++){
      const expected=structuredClone(v6.entities[i].pairs);
      const r=DOOR_ROUTES.find(r=>r.door===i);
      if(r){expected.find(([k])=>k==='sounds')[1]='0';expected.find(([k])=>k==='wait')[1]=String(timing.cooldown);
        if(variant==='fade')expected.find(([k])=>k==='target')[1]=`cof_story_present${r.door}`;
      }
      if(variant==='fade'&&[445,446].includes(i)){
        const r=DOOR_ROUTES[i-445];expected.find(([k])=>k==='targetname')[1]=`cof_story_present${r.door}`;
      }
      assert.deepEqual(next.entities[i].pairs,expected,`${variant} original/v6 entity${i}`);
    }
    for(const r of DOOR_ROUTES){
      const point=next.entities.filter(e=>uniqueValue(e,'classname')==='cof_teleport'&&uniqueValue(e,'targetname')===r.helper);
      assert.equal(point.length,1);assert.equal(point[0].pairs.some(([k])=>k==='message'),false);
      const targets=next.entities.filter(e=>uniqueValue(e,'targetname')===r.helper);
      assert.equal(targets.length,variant==='audio'?4:1); // Deliberate fan-out only in A.
      const sequence=result.report.routes.find(route=>route.door===r.door).sequence;
      for(const [target] of sequence)assert.ok(next.entities.some(e=>uniqueValue(e,'targetname')===target));
      const audio=next.entities.slice(447).filter(e=>uniqueValue(e,'classname')==='ambient_generic'
        &&[r.helper,`cof_story_open${r.door}`,`cof_story_close${r.door}`].includes(uniqueValue(e,'targetname')));
      assert.equal(audio.length,2);assert.ok(audio.every(e=>uniqueValue(e,'spawnflags')==='50'));
      assert.deepEqual(audio.map(e=>uniqueValue(e,'message')),['doors/doormove1.wav','doors/doorstop8.wav']);
    }
    const managers=next.entities.slice(447).filter(e=>uniqueValue(e,'classname')==='multi_manager');
    assert.equal(managers.length,2);assert.ok(managers.every(e=>uniqueValue(e,'spawnflags')==='1'));
    const fades=next.entities.filter(e=>uniqueValue(e,'classname')==='env_fade');
    assert.equal(fades.length,variant==='audio'?0:4);
    assert.ok(fades.every(e=>(Number(uniqueValue(e,'spawnflags'))&4)!==0
      &&(Number(uniqueValue(e,'spawnflags'))&8)===0&&uniqueValue(e,'renderamt')==='255'
      &&uniqueValue(e,'rendercolor')==='0 0 0'&&Number(uniqueValue(e,'duration'))>0));
    assert.equal(result.report.baseOutputSha256,VERIFIED_V6_SHA);
    const bad=Buffer.from(source);bad[0]^=1;assert.throws(()=>buildDoorPresentation(bad,variant),/SHA256 mismatch/);
    assert.throws(()=>buildDoorPresentation(result.output,variant),/SHA256 mismatch/);
  }
  assert.ok(timing.fadeOut<timing.teleportAt&&timing.teleportAt<timing.closeAt
    &&timing.closeAt<timing.fadeInAt&&timing.fadeInAt<timing.fadeOut+timing.fadeHold
    &&timing.cooldown>timing.fadeInAt+timing.fadeIn);
});
