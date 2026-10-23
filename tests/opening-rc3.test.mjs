import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {decodeBsp,sha256,uniqueValue as v} from '../scripts/bsp.mjs';
import {OPENING,buildOpening} from '../scripts/build-opening-rc3.mjs';
import {worldHull,sampleSpawn} from '../scripts/collision.mjs';
const maps=process.env.COF_ORIGINAL_MAPS,parents=process.env.COF_CAMPAIGN_BUILD,build=process.env.COF_RC3_BUILD,opts={skip:!maps||!parents||!build};
const cls=e=>v(e,'classname'),read=(dir,name)=>fs.readFileSync(path.join(dir,name));
function data(spec){const bytes=read(build,spec.map+'.bsp'),source=read(maps,spec.sourceMap+'.bsp'),parentBytes=read(parents,spec.parent+'.bsp');return {spec,bytes,source,parentBytes,bsp:decodeBsp(bytes),original:decodeBsp(source),parent:decodeBsp(parentBytes),plan:JSON.parse(read(build,spec.map+'.json')),parentPlan:JSON.parse(read(parents,spec.parent+'.json'))};}
const named=(bsp,name)=>bsp.entities.filter(e=>v(e,'targetname')===name);
const one=(bsp,name)=>{const a=named(bsp,name);assert.equal(a.length,1,name);return a[0];};
test('RC3 regenerates three complete BSPs deterministically, preserving all original bodies and RC2 model records',opts,()=>{
 for(const spec of OPENING){const d=data(spec),again=buildOpening(d.source,d.parentBytes,d.parentPlan,spec);
  assert.ok(again.output.equals(d.bytes));assert.equal(sha256(d.bytes),d.plan.outputSha256);
  assert.ok(d.bytes.subarray(124,d.source.length).equals(d.source.subarray(124)));
  assert.deepEqual(d.bsp.lumps.slice(1,14),d.original.lumps.slice(1,14));
  const a=d.parent.lumps[14],b=d.bsp.lumps[14];assert.ok(d.bytes.subarray(b.offset,b.offset+a.length).equals(d.parentBytes.subarray(a.offset,a.offset+a.length)));assert.equal(b.length,a.length+(spec.sourceMap==='c_intro'?64:0));
  assert.throws(()=>buildOpening(Buffer.from('wrong source'),d.parentBytes,d.parentPlan,spec),/mismatch/);
 }
});
test('only native readiness starts intro, root events are consumed once; following maps use guarded first-join hooks',opts,()=>{
 const {bsp,original}=data(OPENING[0]);assert.equal(cls(bsp.entities[157]),'info_target');assert.equal(v(original.entities[157],'target'),'multiintroduct');
 assert.equal(cls(one(bsp,'multiintroduct')),'game_counter');assert.equal(v(one(bsp,'multiintroduct'),'spawnflags'),'1');
 const ready=one(bsp,'sc_begin_story');assert.equal(cls(ready),'game_zone_player');
 assert.equal(v(ready,'origin'),'0 0 1');assert.equal(v(ready,'incount'),'sc3_ready_count');
 assert.equal(v(ready,'intarget'),undefined);assert.equal(v(ready,'outtarget'),undefined);assert.equal(v(ready,'outcount'),undefined);
 const count=one(bsp,'sc3_ready_count');assert.equal(v(count,'health'),'2');assert.equal(v(count,'spawnflags'),'1');
 assert.equal(bsp.entities.filter(e=>cls(e)==='cof_lobby_start'&&v(e,'message')==='sc_begin_story').length,1);
 assert.deepEqual(bsp.entities.filter(e=>v(e,'target')==='multiintroduct').map(e=>v(e,'targetname')),['sc3_ready_count']);
 for(const spec of OPENING.slice(1)){const {bsp}=data(spec),join=one(bsp,'game_playerjoin');assert.equal(cls(join),'game_counter');assert.equal(v(join,'health'),'2');assert.equal(v(join,'spawnflags'),'1');assert.equal(named(bsp,'game_playerspawn').length,0);assert.equal(v(named(bsp,'sc3_spawn_complete').find(e=>cls(e)==='trigger_relay'),'delay'),'0.1');}
});
test('intro occupancy guard rejects a solo callback and never stores solo readiness for a later join',opts,()=>{
 const {bsp,bytes}=data(OPENING[0]),gate=one(bsp,'sc3_ready_count'),zone=one(bsp,'sc_begin_story');
 // Exercise native synchronous count/USE_SET/threshold/remove at the BSP
 // boundary. A join is deliberately not a ready callback. This models
 // entity dispatch only, not the native ready UI or client rendering.
 let removed=false,starts=0;
 const callback=players=>{if(!removed&&players===Number(v(gate,'health'))){starts++;removed=true;}};
 callback(0);assert.equal(starts,0);callback(1);assert.equal(starts,0);
 // P2 arriving cannot reach the intro, even after a premature solo callback.
 assert.equal(named(bsp,'game_playerjoin').length,0);assert.equal(starts,0);
 const record=bsp.lumps[14].offset+Number(v(zone,'model').slice(1))*64,origin=v(zone,'origin').split(' ').map(Number);
 for(const spawn of bsp.entities.filter(e=>/^cof_coop_spawn[12]$/.test(cls(e))))v(spawn,'origin').split(' ').map(Number).forEach((p,i)=>{assert.ok(p-16>bytes.readFloatLE(record+i*4)+origin[i]);assert.ok(p+36<bytes.readFloatLE(record+12+i*4)+origin[i]);});
 callback(2);assert.equal(starts,1);callback(2);assert.equal(starts,1);
});
test('global cameras, lights, fades and original cinematic event timings remain unchanged from RC2',opts,()=>{
 for(const spec of OPENING){const {bsp,parent}=data(spec);
  for(const before of parent.entities.filter(e=>['trigger_camera','env_fade','light','light_spot','light_environment','env_dlight','env_elight','env_dynlight','cof_introduction'].includes(cls(e))))assert.deepEqual(bsp.entities[before.index].pairs,before.pairs);
  for(const before of parent.entities.filter(e=>cls(e)==='multi_manager'))assert.deepEqual(bsp.entities[before.index].pairs.filter(([k])=>k!=='targetname'),before.pairs.filter(([k])=>k!=='targetname'));
  const cameraNames=new Set(bsp.entities.filter(e=>cls(e)==='trigger_camera').map(e=>v(e,'targetname')));
  assert.ok(!bsp.entities.some(e=>cls(e)==='game_zone_player'&&cameraNames.has(v(e,'intarget'))));
 }
});
test('native actor effects reach both zone branches; equipment grants retain native fields and have one-shot gates',opts,()=>{
 let grants=0;
 for(const spec of OPENING){const {bsp,original,plan}=data(spec);for(const c of plan.changes.filter(c=>c.kind==='per-player native dispatch')){
  const after=bsp.entities[c.entity],before=original.entities[c.entity];assert.deepEqual(after.pairs.filter(([k])=>k!=='targetname'),before.pairs.filter(([k])=>k!=='targetname'));
  let dispatch=one(bsp,c.name);if(c.onceOnly){assert.equal(cls(dispatch),'game_counter');assert.equal(v(dispatch,'spawnflags'),'1');dispatch=one(bsp,v(dispatch,'target'));}
  assert.equal(cls(dispatch),'game_zone_player');assert.equal(v(dispatch,'intarget'),c.native);assert.equal(v(dispatch,'outtarget'),c.native);
  if(c.classname==='cof_giveitems'){grants++;assert.ok(c.onceOnly);assert.ok(!(Number(v(after,'spawnflags')??0)&2));}
 }}assert.equal(grants,3);
});
test('party relocation uses original destinations and separated supported gameplay landings, resets reusable slot selection',opts,()=>{
 for(const spec of OPENING){const {bsp,original,source,plan}=data(spec),hull=worldHull(source);
  for(const c of plan.changes.filter(c=>c.kind==='party story relocation')){
   const dest=one(original,c.originalDestination);assert.deepEqual(c.positions[0],v(dest,'origin').split(/\s+/).map(Number));assert.equal(c.angles,v(dest,'angles')??'0 0 0');
   if(!c.holding){assert.notDeepEqual(c.positions[0],c.positions[1]);for(const p of c.positions)assert.ok(sampleSpawn(hull,[p[0],p[1],p[2]+36]).staticCandidate);}
   const prefix='sc3_party_'+c.entity,mm=one(bsp,c.name);assert.equal(v(mm,prefix+'_reset'),'0');assert.equal(v(mm,prefix+'_zone'),'0.01');assert.equal(v(one(bsp,prefix+'_reset'),'frags'),'0');
   const counters=named(bsp,prefix+'_count');assert.deepEqual(counters.map(e=>v(e,'health')),['1','2']);assert.ok(counters.every(e=>!v(e,'spawnflags')));
   // Model the proven native increment/threshold behavior through TWO uses.
   for(let use=0;use<2;use++){let counts=[0,0],moved=[];for(let actor=1;actor<=2;actor++)counters.forEach((e,i)=>{if(++counts[i]===Number(v(e,'health')))moved.push([actor,v(e,'target')]);});assert.deepEqual(moved,[[1,prefix+'_move0'],[2,prefix+'_move1']]);}
  }
  for(let i=1;i<=2;i++){const e=bsp.entities.find(e=>cls(e)==='cof_coop_spawn'+i);assert.ok(sampleSpawn(hull,v(e,'origin').split(/\s+/).map(Number)).staticCandidate);}
  assert.ok(!bsp.entities.some(e=>/^cof_coop_spawn[34]$/.test(cls(e)??'')));
 }
});
test('nightmare handoff retains authored ending delay, releases cameras and removes obsolete camera before queued next map',opts,()=>{
 const {bsp,original}=data(OPENING[1]);assert.equal(cls(bsp.entities[428]),'info_target');assert.equal(v(bsp.entities[429],'target'),'changelevelea');
 assert.deepEqual(bsp.entities[437].pairs,original.entities[437].pairs);
 const gate=one(bsp,'changelevelea');assert.equal(cls(gate),'game_counter');assert.equal(v(gate,'spawnflags'),'1');
 const mm=one(bsp,'sc3_handoff');assert.equal(v(mm,'sc3_stop_cameras'),'0');assert.equal(v(mm,'sc3_remove_camera'),'0.05');assert.equal(v(mm,'sc3_queue_level'),'0.2');
 for(const e of named(bsp,'sc3_stop_cameras')){assert.equal(v(e,'triggerstate'),'0');assert.equal(cls(one(bsp,v(e,'target'))),'trigger_camera');}
 assert.equal(v(one(bsp,'sc3_remove_camera_actor'),'message'),'weapon_camera');assert.equal(v(one(bsp,'sc3_queue_level'),'netname'),'changelevel s3_start');
 assert.equal(v(data(OPENING[0]).bsp.entities.find(e=>cls(e)==='cof_changelevel'),'message'),'s3_nightmare');
});
