import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {decodeBsp,sha256,uniqueValue} from '../scripts/bsp.mjs';
import {entitySpans} from '../scripts/build-door-experiment.mjs';
import {analyzeStoryDoors,convertStoryDoors} from '../scripts/convert-story-doors.mjs';
import {buildCStart2Full,VERIFIED_V8_SHA} from '../scripts/build-c-start2-full.mjs';
import {buildDoorPresentation} from '../scripts/build-door-presentation.mjs';

const sourcePath=process.env.COF_C_START2_FIXTURE;
const options={skip:!sourcePath};
function altered(source,edits){
  const bsp=decodeBsp(source),spans=entitySpans(bsp.entityText);let text=bsp.entityText;
  for(const [index,change] of [...edits].sort((a,b)=>b[0]-a[0])){const s=spans[index];text=text.slice(0,s.start)+change(text.slice(s.start,s.end))+text.slice(s.end);}
  const entity=Buffer.from(text+'\0','latin1'),offset=Math.ceil(source.length/4)*4,out=Buffer.alloc(offset+entity.length);
  source.copy(out);entity.copy(out,offset);out.writeInt32LE(offset,4);out.writeInt32LE(entity.length,8);return out;
}
test('inventory separates ordinary, scripted, locked-no-exit and spatial cross-map chains',options,()=>{
  const bytes=fs.readFileSync(sourcePath),a=analyzeStoryDoors(bytes,{sourceMap:'c_start2'});
  assert.deepEqual(a.counts,{all:8,sameMap:4,eligible:2,crossMap:1,lockedNoDestination:3});
  assert.deepEqual(a.doors.filter(r=>r.eligible).map(r=>r.index),[49,50]);
  const d=n=>a.doors.find(r=>r.index===n);
  assert.deepEqual(d(19).crossMapPath,[15,17]);assert.equal(d(19).classification,'cross-map');
  assert.deepEqual(d(204).incoming.map(r=>r.index),[345]);
  assert.deepEqual(d(206).incoming.map(r=>r.index),[412,414]);assert.equal(d(206).conditions.spawnflags,'4');
  assert.deepEqual(d(49).reverseCandidates,['c_start2:D0050']);assert.equal(a.mapNameReferences.length,0);
});
test('full map equals verified v8 entity pairs minus only two debug markers',options,()=>{
  const source=fs.readFileSync(sourcePath),before=decodeBsp(source),r=buildCStart2Full(source),next=decodeBsp(r.output);
  const v8=buildDoorPresentation(source,'fade');assert.equal(sha256(v8.output),VERIFIED_V8_SHA);
  assert.equal(next.entities.length,455);assert.deepEqual(next.lumps.slice(1),before.lumps.slice(1));
  assert.ok(r.output.subarray(12,source.length).equals(source.subarray(12)));
  const oldSpans=entitySpans(before.entityText),newSpans=entitySpans(next.entityText);
  for(let i=0;i<before.entities.length;i++)if(![48,49,50,51].includes(i)){
    assert.deepEqual(next.entities[i].pairs,before.entities[i].pairs);
    assert.equal(next.entityText.slice(newSpans[i].start,newSpans[i].end),before.entityText.slice(oldSpans[i].start,oldSpans[i].end));
  }
  assert.ok(!next.entityText.includes('ACTIVATED'));assert.equal(next.entities.filter(e=>uniqueValue(e,'classname')==='game_text').length,0);
  assert.deepEqual(buildCStart2Full(source).output,r.output);
  assert.throws(()=>buildCStart2Full(r.output),/SHA256 mismatch/);
  assert.throws(()=>convertStoryDoors(r.output,{sourceMap:'c_start2',map:'another_alias'}),/Already converted/);
  assert.throws(()=>convertStoryDoors(source,{sourceMap:'c_start2',map:'c_start2'}),/distinct/);
});
test('lock, master, flags, story fields and named doors are retained instead of unlocked',options,()=>{
  const source=fs.readFileSync(sourcePath);
  for(const [key,val] of [['lockedby','a_key'],['master','puzzle_gate'],['spawnflags','4'],['propertarget','story_event'],['targetname','scripted_door']]){
    const bytes=altered(source,[[49,s=>s.replace(/\n}$/,`\n"${key}" "${val}"\n}`)]]);
    const a=analyzeStoryDoors(bytes,{sourceMap:'c_start2'});assert.equal(a.doors.find(r=>r.index===49).eligible,false,key);
    const converted=convertStoryDoors(bytes,{sourceMap:'c_start2',map:'test_alias'}),old=decodeBsp(bytes),next=decodeBsp(converted.output);
    assert.deepEqual(next.entities[49].pairs,old.entities[49].pairs);assert.deepEqual(next.entities[51].pairs,old.entities[51].pairs);
    assert.deepEqual(converted.report.convertedDoorIds,['c_start2:D0050']); // No reverse door manufactured.
  }
});
test('shared exits, manager-key references and unsupported destinations block only affected doors',options,()=>{
  const source=fs.readFileSync(sourcePath);
  const shared=altered(source,[[49,s=>s.replace('"d1_1_exit1"','"d1_1_exit2"').replace(/\n}$/, '\n"master" "gate"\n}')]]);
  assert.equal(analyzeStoryDoors(shared,{sourceMap:'c_start2'}).counts.eligible,0);
  assert.throws(()=>convertStoryDoors(shared,{sourceMap:'c_start2',map:'test_alias'}),/No safely/);
  const manager=altered(source,[[339,s=>s.replace(/\n}$/,'\n"d1_1_exit1" "0"\n}')]]);
  assert.equal(analyzeStoryDoors(manager,{sourceMap:'c_start2'}).doors.find(r=>r.index===49).eligible,false);
  const unsupported=altered(source,[[51,s=>s.replace('1040 -1711 -896','1040 -1711 4096')]]);
  const r=convertStoryDoors(unsupported,{sourceMap:'c_start2',map:'test_alias'});
  assert.deepEqual(r.report.convertedDoorIds,['c_start2:D0050']);
  assert.ok(r.report.inventory.doors.find(r=>r.index===49).reasons.some(s=>s.includes('standing clearance')));
});
test('identical duplicate destination classes are all converted without altering its name',options,()=>{
  const source=fs.readFileSync(sourcePath);
  const bytes=altered(source,[[51,s=>s.replace(/\n}$/,'\n"classname" "inter_door_exit"\n}')]]);
  const r=convertStoryDoors(bytes,{sourceMap:'c_start2',map:'test_alias'}),e=decodeBsp(r.output).entities[51];
  assert.deepEqual(e.pairs.filter(([k])=>k==='classname').map(([,v])=>v),['info_teleport_destination','info_teleport_destination']);
  assert.equal(uniqueValue(e,'targetname'),'d1_1_exit1');assert.equal(uniqueValue(e,'classname'),'info_teleport_destination');
});
