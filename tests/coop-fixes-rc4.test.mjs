import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {decodeBsp,uniqueValue as v} from '../scripts/bsp.mjs';
import {coopFixesMap} from '../scripts/build-coop-fixes-rc4.mjs';
import {MAINTENANCE_MAPS} from '../scripts/build-maintenance-rc4.mjs';
const maps=process.env.COF_ORIGINAL_MAPS,parent=process.env.COF_CAMPAIGN_DOORS_BUILD;
test('coop fixes: completed wake removes the authored spawn block wall on revisit; other maps byte-identical',{skip:!maps||!parent},()=>{
 for(const spec of MAINTENANCE_MAPS){
  const source=fs.readFileSync(path.join(maps,spec.sourceMap+'.bsp')),before=fs.readFileSync(path.join(parent,spec.map+'.bsp')),report=JSON.parse(fs.readFileSync(path.join(parent,spec.map+'.json'))),built=coopFixesMap(source,before,report);
  assert.ok(built.output.subarray(124,source.length).equals(source.subarray(124)));
  if(spec.sourceMap!=='c_start'){assert.ok(built.output.equals(before));continue;}
  const entities=decodeBsp(built.output).entities,old=decodeBsp(before).entities,restore=entities.find(e=>v(e,'targetname')==='sc4_wake_restore');
  assert.equal(v(restore,'block'),'0');assert.equal(v(restore,'master'),'sc4_wake_completed');assert.equal(v(restore,'invsimon3'),'0');
  // The authored wall itself and the authored wake action are untouched.
  assert.deepEqual(entities[119],old[119]);assert.equal(v(entities[145],'block'),'0');
  for(let i=0;i<old.length;i++)if(entities[i]!==restore&&v(old[i],'targetname')!=='sc4_wake_restore')assert.deepEqual(entities[i],old[i]);
  assert.equal(entities.length,old.length);
  assert.throws(()=>coopFixesMap(source,built.output,{...report,...built,output:undefined}));
 }
});
test('title vehicle chain matches original c_intro except the documented ready hold',{skip:!maps||!parent},()=>{
 const original=decodeBsp(fs.readFileSync(path.join(maps,'c_intro.bsp'))).entities,current=decodeBsp(fs.readFileSync(path.join(parent,'cof_campaign_story4.bsp'))).entities;
 const byName=list=>{const m=new Map();for(const e of list){const n=v(e,'targetname');if(n){if(!m.has(n))m.set(n,[]);m.get(n).push(e);}}return m;};
 const a=byName(original),c=byName(current);
 for(const [index,model,name,target] of [[99,'*56','skittag','instop1'],[102,'*57','skittag','2instop1'],[142,'*58','skittag','3instop1'],[341,'*149','skittag22','kollie']]){
  const o=original[index],n=current[index];
  for(const e of [o,n]){assert.equal(v(e,'classname'),'func_tracktrain');assert.equal(v(e,'model'),model);assert.equal(v(e,'targetname'),name);assert.equal(v(e,'target'),target);assert.equal(v(e,'speed'),'300');}
  assert.equal(v(o,'startspeed'),'300');assert.equal(v(n,'startspeed'),'0');
  assert.deepEqual(n.pairs.filter(([k])=>k!=='startspeed'),o.pairs.filter(([k])=>k!=='startspeed'));
  // Every path_track along the route is unchanged.
  let node=target;const seen=new Set();
  while(node&&!seen.has(node)){seen.add(node);const [po]=a.get(node)??[],[pc]=c.get(node)??[];assert.ok(po&&pc,'path '+node);assert.deepEqual(pc.pairs,po.pairs);node=v(po,'target');}
  assert.ok(seen.size>1);
 }
 // The single gated timeline still starts both vehicle groups at t=0.
 const [timeline]=c.get('sc3_timeline_multiintroduct')??[];assert.equal(v(timeline,'skittag'),'0');assert.equal(v(timeline,'skittag22'),'0');
 // Headlight dynamic lights still ride skittag22 with their authored values.
 for(const i of [339,340]){assert.equal(v(current[i],'classname'),'env_dynlight');assert.equal(v(current[i],'movewith'),'skittag22');assert.deepEqual(current[i].pairs,original[i].pairs);}
});
