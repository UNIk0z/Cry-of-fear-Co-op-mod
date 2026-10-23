import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {decodeBsp,sha256,uniqueValue as v} from '../scripts/bsp.mjs';
import {RC4_MAPS,RC4_ENTRY,buildStateMap} from '../scripts/build-state-rc4.mjs';
import {RC4_STATE_IDS,STABLE_STATE_IDS} from '../scripts/campaign-state-rc4.mjs';

const maps=process.env.COF_ORIGINAL_MAPS,rc2=process.env.COF_CAMPAIGN_BUILD,rc3=process.env.COF_RC3_BUILD,build=process.env.COF_RC4_BUILD;
const opts={skip:!maps||!rc2||!rc3||!build},cls=e=>v(e,'classname'),read=(dir,name)=>fs.readFileSync(path.join(dir,name));
function data(spec){const parents=spec.parentRelease==='rc3'?rc3:rc2,source=read(maps,spec.sourceMap+'.bsp'),parentBytes=read(parents,spec.parent+'.bsp'),parentPlan=JSON.parse(read(parents,spec.parent+'.json')),bytes=read(build,spec.map+'.bsp');return {spec,source,parentBytes,parentPlan,bytes,original:decodeBsp(source),parent:decodeBsp(parentBytes),bsp:decodeBsp(bytes),plan:JSON.parse(read(build,spec.map+'.json'))};}

test('RC4 has only five new safe aliases and retains exact RC3 build007 pins',()=>{
 assert.equal(RC4_ENTRY,'cof_campaign_story4');assert.equal(RC4_MAPS.length,5);assert.equal(new Set(RC4_MAPS.map(s=>s.map)).size,5);
 for(const s of RC4_MAPS){assert.match(s.map,/^(s4_|cof_campaign_)[a-z0-9_]+$/);assert.ok(s.map.length<=31);assert.notEqual(s.map,s.parent);assert.match(s.sourceSha256,/^[a-f0-9]{64}$/);assert.match(s.parentSha256,/^[a-f0-9]{64}$/);assert.match(s.parentPlanSha256,/^[a-f0-9]{64}$/);}
 assert.deepEqual(RC4_MAPS.filter(s=>s.parentRelease==='rc3').map(s=>s.parent),['cof_campaign_story3','s3_nightmare','s3_start']);
});

test('RC4 deterministically rebuilds from protected parents and preserves every original body/model record',opts,()=>{
 for(const spec of RC4_MAPS){const d=data(spec),again=buildStateMap(d.source,d.parentBytes,d.parentPlan,spec);
  assert.ok(again.output.equals(d.bytes));assert.equal(sha256(d.bytes),d.plan.outputSha256);assert.equal(sha256(d.source),spec.sourceSha256);assert.equal(sha256(d.parentBytes),spec.parentSha256);
  assert.ok(d.bytes.subarray(124,d.source.length).equals(d.source.subarray(124)));assert.deepEqual(d.bsp.lumps.slice(1,14),d.original.lumps.slice(1,14));
  const before=d.parent.lumps[14],after=d.bsp.lumps[14];assert.equal(after.length,before.length);assert.ok(d.bytes.subarray(after.offset,after.offset+after.length).equals(d.parentBytes.subarray(before.offset,before.offset+before.length)));
  assert.throws(()=>buildStateMap(Buffer.from('wrong source'),d.parentBytes,d.parentPlan,spec),/mismatch/);
  const changed=Buffer.from(d.parentBytes);changed[changed.length-1]^=1;assert.throws(()=>buildStateMap(d.source,changed,d.parentPlan,spec),/mismatch/);
  const plan=structuredClone(d.parentPlan);plan.outputSha256='0'.repeat(64);assert.throws(()=>buildStateMap(d.source,d.parentBytes,plan,spec),/mismatch/);
  assert.throws(()=>buildStateMap(d.source,d.parentBytes,d.parentPlan,{...spec,map:'s4_unpinned'}),/specification/);
 }
});

test('new opening bridge preserves verified readiness, camera/effects/equipment/timings apart from named destinations',opts,()=>{
 for(const spec of RC4_MAPS.slice(0,2)){const d=data(spec),bridges=new Map(d.plan.changes.filter(c=>c.kind==='route bridge').map(c=>[c.entity,c]));
  assert.equal(d.bsp.entities.length,d.parent.entities.length+(spec.sourceMap==='c_intro'?STABLE_STATE_IDS.length+2:0));
  for(const before of d.parent.entities){const after=d.bsp.entities[before.index],change=bridges.get(before.index);let expected=change?before.pairs.map(([k,val])=>[k,k===change.key?change.after:val]):before.pairs;
   if(spec.sourceMap==='c_intro'&&before.index===277)expected=expected.filter(([key])=>key!=='kakelae'&&key!=='kakelae#1');
   assert.deepEqual(after.pairs,expected);}
 }
 const nightmare=data(RC4_MAPS[1]);assert.equal(cls(nightmare.bsp.entities[647]),'trigger_command');assert.equal(v(nightmare.bsp.entities[647],'netname'),'changelevel s4_start');assert.deepEqual(nightmare.bsp.entities[645].pairs,nightmare.parent.entities[645].pairs);
});

test('intro keeps static weather, vehicle brushes, title timing and follow-up chain intact',opts,()=>{
 const d=data(RC4_MAPS[0]);
 for(const index of [99,100,101,102,142,162,210,216,217,489,550,573,580,581]){
  const before=d.parent.entities[index];
  if(index===573)assert.equal(v(d.bsp.entities[index],'message'),'s4_nightmare');
  else assert.deepEqual(d.bsp.entities[index].pairs,before.pairs);
 }
 const rainManager=d.bsp.entities[277];assert.equal(v(rainManager,'kakelae'),undefined);assert.equal(v(rainManager,'kakelae#1'),undefined);
 assert.equal(v(rainManager,'multiintro3'),'30');
 assert.equal(v(d.bsp.entities[489],'multikattej'),'52');assert.equal(v(d.bsp.entities[550],'introductfade2'),'44');
 assert.ok(d.plan.changes.some(c=>c.kind==='static multiplayer rain'&&c.removedTargets.length===2));
});

test('new campaign alone resets the persistent state shared by wake and cafe return aliases',opts,()=>{
 const intro=data(RC4_MAPS[0]),wake=data(RC4_MAPS[2]),back=data(RC4_MAPS[3]),cafe=data(RC4_MAPS[4]);
 assert.equal(new Set(STABLE_STATE_IDS).size,STABLE_STATE_IDS.length);
 const globals=d=>d.bsp.entities.filter(e=>cls(e)==='env_global');
 assert.deepEqual(globals(intro).filter(e=>(v(e,'targetname')??'').startsWith('sc4_reset_')).map(e=>v(e,'globalstate')),STABLE_STATE_IDS);
 for(const d of [wake,back,cafe])assert.ok(!d.bsp.entities.some(e=>(v(e,'targetname')??'').startsWith('sc4_reset_')||v(e,'target')==='cof_cafe_reset'));
 assert.deepEqual(wake.plan.state.stableStateIds,back.plan.state.stableStateIds);assert.deepEqual(back.plan.state.stableStateIds,cafe.plan.state.stableStateIds);
 for(const d of [wake,back]){
  const door=d.bsp.entities[713];assert.equal(v(door,'lockedby'),'The door is locked.');assert.equal(Number(v(door,'spawnflags')??0)&4,0);
  assert.ok(!d.bsp.entities[499].pairs.some(([k])=>k==='sd_door1_lock'));
  const pending=d.bsp.entities.filter(e=>cls(e)==='multi_manager'&&['multiblack','multiscene1','multi_pad'].includes(v(e,'targetname')));
  assert.equal(pending.length,3);for(const e of pending)assert.ok(v(e,'master'));
  for(const id of [RC4_STATE_IDS.blacker,RC4_STATE_IDS.wake,RC4_STATE_IDS.padlock])assert.ok(globals(d).some(e=>v(e,'globalstate')===id+'.done'));
 }
 const retired=cafe.bsp.entities.find(e=>v(e,'targetname')==='sc4_retired_cafe_reset');assert.equal(cls(retired),'info_target');
 for(const id of [RC4_STATE_IDS.cafeAlive204,RC4_STATE_IDS.cafeAlive206,RC4_STATE_IDS.cafeEnabled206])assert.ok(globals(cafe).some(e=>v(e,'globalstate')===id));
 assert.ok(globals(cafe).every(e=>!(v(e,'globalstate')??'').startsWith('c_start2_coop_cafe_')));
});

test('RC4 route closure covers both parallel corridor exits and retains every unrelated RC2 route',opts,()=>{
 const aliases=new Set(RC4_MAPS.map(s=>s.map));assert.equal(v(data(RC4_MAPS[0]).bsp.entities[573],'message'),'s4_nightmare');assert.equal(v(data(RC4_MAPS[1]).bsp.entities[581],'message'),RC4_ENTRY);
 for(const spec of RC4_MAPS.slice(2)){const d=data(spec),target=spec.map==='s4_start2'?'s4_start_e0':'s4_start2',indices=spec.map==='s4_start2'?[19,511]:[335,1073];
  for(const index of indices){assert.equal(v(d.bsp.entities[index],'message'),target);assert.ok(aliases.has(target));}
  const before=d.parent.entities.flatMap(e=>e.pairs.filter(([k,val])=>['map','message'].includes(k)&&val.startsWith('s2_')&&!['s2_start2','s2_start_e0'].includes(val)).map(([key,val])=>({index:e.index,key,val})));
  for(const route of before)assert.equal(v(d.bsp.entities[route.index],route.key),route.val);
 }
});

test('corridor inventory capture and native spawn/ready metadata stay intact without new lobby reset or raw exit',opts,()=>{
 for(const spec of RC4_MAPS.slice(2)){const d=data(spec);assert.equal(v(d.bsp.entities[0],'iuser1')??'0','0');assert.equal(d.bsp.entities.filter(e=>cls(e)==='cof_lobby_start').length,0);
  for(const before of d.parent.entities.filter(e=>/^cof_coop_spawn[1-4]$/.test(cls(e)??'')||cls(e)==='trigger_coop_changelevel'))assert.deepEqual(d.bsp.entities[before.index].pairs,before.pairs);
  for(const before of d.parent.entities.filter(e=>['cof_changelevel','inter_door_coop_changelevel'].includes(cls(e))))assert.deepEqual(d.bsp.entities[before.index].pairs.filter(([k])=>k!=='message'),before.pairs.filter(([k])=>k!=='message'));
  assert.ok(!d.bsp.entities.some(e=>cls(e)==='trigger_command'&&/\b(?:changelevel|map)\s+/i.test(v(e,'netname')??'')));
  assert.equal(d.plan.inventory.exactIdentityOrGenericItemRestore,false);
 }
});
