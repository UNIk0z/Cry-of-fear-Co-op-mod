import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {decodeBsp,uniqueValue as v} from '../scripts/bsp.mjs';
import {RC4_MAPS} from '../scripts/build-state-rc4.mjs';
import {buildMaintenanceMap,MAINTENANCE_MAPS,HOTFIX_PINS} from '../scripts/build-maintenance-rc4.mjs';
import {worldHull,sampleSpawn} from '../scripts/collision.mjs';
const maps=process.env.COF_ORIGINAL_MAPS,parent=process.env.COF_RC4_BUILD;
test('final intro exit requires both actors at authored relocation, without a Touch/movement callback',{skip:!maps||!parent},()=>{
 const spec=RC4_MAPS[0],source=fs.readFileSync(path.join(maps,'c_intro.bsp')),bytes=fs.readFileSync(path.join(parent,spec.map+'.bsp')),plan=JSON.parse(fs.readFileSync(path.join(parent,spec.map+'.json'))),built=buildMaintenanceMap(source,bytes,plan,spec),bsp=decodeBsp(built.output),before=decodeBsp(bytes);
 assert.equal(v(bsp.entities[291],'classname'),'info_target');assert.equal(v(bsp.entities[583],'sc4_final_zone'),'0.02');
 const zone=bsp.entities.find(e=>v(e,'targetname')==='sc4_final_zone'),gate=bsp.entities.find(e=>v(e,'targetname')==='sc4_final_count');
 assert.equal(v(zone,'incount'),v(gate,'targetname'));assert.equal(v(zone,'origin'),'0 0 1');assert.equal(v(gate,'health'),'2');assert.equal(v(gate,'spawnflags'),'1');assert.equal(v(gate,'target'),'sc_level_291');
 const at=bsp.lumps[14].offset+141*64,mins=[0,4,8].map(k=>built.output.readFloatLE(at+k)),maxs=[12,16,20].map(k=>built.output.readFloatLE(at+k));
 for(const i of [586,589]){const center=v(bsp.entities[i],'origin').split(' ').map(Number);center[2]+=36;assert.ok(center.every((x,k)=>x>=mins[k]+(k===2?1:0)&&x<=maxs[k]+(k===2?1:0)));}
 for(const e of before.entities)if(![99,102,142,341,291,583].includes(e.index))assert.deepEqual(bsp.entities[e.index].pairs,e.pairs);
 for(const i of [99,102,142,341]){assert.equal(v(bsp.entities[i],'startspeed'),'0');assert.equal(v(bsp.entities[i],'speed'),'300');assert.deepEqual(bsp.entities[i].pairs.filter(([k])=>k!=='startspeed'),before.entities[i].pairs.filter(([k])=>k!=='startspeed'));}
 assert.deepEqual(bsp.lumps.slice(1,14),before.lumps.slice(1,14));assert.equal(bsp.lumps[14].length,before.lumps[14].length);
 assert.ok(built.output.subarray(124,source.length).equals(source.subarray(124)));
 assert.throws(()=>buildMaintenanceMap(source,Buffer.from('bad'),plan,spec),/mismatch/);
});
test('eight maintenance outputs reconstruct exactly and internal routes/checkpoint landings resolve',{skip:!maps||!parent||!process.env.COF_CAMPAIGN_BUILD||!process.env.COF_MAINTENANCE_BUILD},()=>{
 const aliases=new Set(MAINTENANCE_MAPS.map(s=>s.map));
 for(const spec of MAINTENANCE_MAPS){
  const dir=HOTFIX_PINS[spec.map]?parent:process.env.COF_CAMPAIGN_BUILD,name=HOTFIX_PINS[spec.map]?spec.map:spec.parent,source=fs.readFileSync(path.join(maps,spec.sourceMap+'.bsp')),bytes=fs.readFileSync(path.join(dir,name+'.bsp')),plan=JSON.parse(fs.readFileSync(path.join(dir,name+'.json'))),built=buildMaintenanceMap(source,bytes,plan,spec);
  assert.ok(built.output.equals(fs.readFileSync(path.join(process.env.COF_MAINTENANCE_BUILD,spec.map+'.bsp'))));const bsp=decodeBsp(built.output);
  for(const e of bsp.entities)for(const [key,value] of e.pairs)if(['map','message'].includes(key)&&/^(s4_|cof_campaign_story4)/.test(value))assert.ok(aliases.has(value),spec.map+' route '+value);
  if(spec.sourceMap==='c_start'){
   const points=[1,2].map(k=>bsp.entities.find(e=>v(e,'targetname')==='sc4_checkpoint_419_p'+k)).map(e=>v(e,'origin').split(' ').map(Number));const hull=worldHull(source);
   for(const p of points)assert.ok(sampleSpawn(hull,[p[0],p[1],p[2]+36]).staticCandidate);assert.ok(Math.hypot(points[0][0]-points[1][0],points[0][1]-points[1][1])>=36);
  }
 }
});
test('conditional doors retain original stages, destinations, actor presentation and item placements',{skip:!maps||!parent||!process.env.COF_CAMPAIGN_BUILD},()=>{
 for(const spec of MAINTENANCE_MAPS.filter(s=>['c_start','c_apartment1'].includes(s.sourceMap))){
  const dir=HOTFIX_PINS[spec.map]?parent:process.env.COF_CAMPAIGN_BUILD,name=HOTFIX_PINS[spec.map]?spec.map:spec.parent,source=fs.readFileSync(path.join(maps,spec.sourceMap+'.bsp')),bytes=fs.readFileSync(path.join(dir,name+'.bsp')),plan=JSON.parse(fs.readFileSync(path.join(dir,name+'.json'))),built=buildMaintenanceMap(source,bytes,plan,spec),bsp=decodeBsp(built.output),old=decodeBsp(bytes);
  for(const i of spec.sourceMap==='c_start'?[713]:[228,229]){const e=bsp.entities[i],p=bsp.entities.find(e=>v(e,'targetname')===v(bsp.entities[i],'target'));
   assert.equal(v(e,'classname'),'func_button');assert.equal(v(e,'spawnflags'),'1');assert.equal(v(p,'master'),v(e,'master'));
   const gate=bsp.entities.find(g=>v(g,'targetname')===v(e,'master'));assert.equal(v(gate,'classname'),'multisource');
   const move=bsp.entities.find(e=>v(e,'targetname')==='sc4_cond_'+i+'_move');assert.equal(v(move,'master'),v(e,'master'));
   const tele=bsp.entities.find(e=>v(e,'targetname')==='sc4_cond_'+i+'_tele');assert.equal(v(tele,'classname'),'cof_teleport');assert.equal(v(tele,'netname'),undefined);
   const dest=bsp.entities.find(e=>v(e,'targetname')===v(tele,'target')),orig=decodeBsp(source),exit=orig.entities.find(e=>v(e,'targetname')===v(orig.entities[i],'target'));assert.equal(v(dest,'origin'),v(exit,'origin'));assert.equal(v(dest,'angles'),v(exit,'angles'));
  }
  if(spec.sourceMap==='c_start'){assert.equal(v(bsp.entities[717],'triggermode'),'1');assert.equal(v(bsp.entities[717],'globalstate'),'sc4.puzzle.c_start.padlock.done');}
  else {assert.equal(v(bsp.entities[691],'initialstate'),'1');assert.equal(v(bsp.entities[754],'initialstate'),'0');for(const i of [691,754])assert.equal(v(bsp.entities[i],'triggermode'),'1');for(const i of [431,495,690,692,742])assert.deepEqual(bsp.entities[i].pairs,old.entities[i].pairs);
   assert.equal(v(bsp.entities[343],'master'),'sc4_office_pending');assert.equal(v(bsp.entities[621],'sc4_office_lock'),'0');assert.equal(v(bsp.entities[280],'sc4_office_complete'),'0');
   assert.deepEqual(bsp.entities[621].pairs.filter(([k])=>k!=='sc4_office_lock'),old.entities[621].pairs.filter(([k])=>k!=='unldoor_office'));
  }
  for(const e of old.entities.filter(e=>/^(weapon_|ammo_|item_)/.test(v(e,'classname')??'')))assert.deepEqual(bsp.entities[e.index].pairs,e.pairs);
  assert.ok(built.output.subarray(124,source.length).equals(source.subarray(124)));
 }
});
