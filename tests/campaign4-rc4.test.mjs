import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {decodeBsp,sha256,uniqueValue as v} from '../scripts/bsp.mjs';
import {assembleCampaign} from '../scripts/build-connected-campaign.mjs';
import {overlayAlias,RC2_REPLACED,campaignOverlayMap,retargetRoutes} from '../scripts/build-campaign4-rc4.mjs';
import {campaignKeys} from '../scripts/campaign-doors-all.mjs';
import {MAINTENANCE_MAPS} from '../scripts/build-maintenance-rc4.mjs';
import {PROLOGUE_RAIN,RAIN_STREAKS} from '../scripts/coop-rain.mjs';
const maps=process.env.COF_ORIGINAL_MAPS,rc2=process.env.COF_CAMPAIGN_BUILD,build=process.env.COF_CAMPAIGN4_BUILD,parent3=process.env.COF_COOP_FIXES3_BUILD;
const ready=!!(maps&&rc2&&build&&parent3&&fs.existsSync(path.join(build??'','state-report.json')));
const cls=e=>v(e,'classname');
const exits=bytes=>decodeBsp(bytes).entities.filter(e=>['cof_changelevel','inter_door_coop_changelevel','trigger_changelevel'].includes(cls(e))).map(e=>v(e,'message')??v(e,'map')).filter(Boolean);

test('campaign4 alias mapping: overlay roles keep their existing s4_ maps, everything else gets an s4_ twin',()=>{
 const aliases=new Set(['s2_start_e1','s2_lake_e0','s2_nightmare_e0','cof_campaign_story2','s2_apartment2_e3']);
 assert.equal(overlayAlias('s2_start_e1',aliases),'s4_start');assert.equal(overlayAlias('s2_nightmare_e0',aliases),'s4_nightmare');
 assert.equal(overlayAlias('cof_campaign_story2',aliases),'cof_campaign_story4');assert.equal(overlayAlias('s2_lake_e0',aliases),'s4_lake_e0');
 assert.equal(overlayAlias('s2_apartment2_e3',aliases),'s4_apartment2_e3');assert.equal(overlayAlias('s2_unknown',aliases),null);assert.equal(overlayAlias('kakelae',aliases),null);
 const entities=[{index:0,pairs:[['classname','cof_changelevel'],['message','s2_lake_e0']]},{index:1,pairs:[['classname','game_text'],['message','s2_lake_e0']]}],changes=[];
 assert.equal(retargetRoutes(entities,aliases,changes),1);assert.equal(v(entities[0],'message'),'s4_lake_e0');assert.equal(v(entities[1],'message'),'s2_lake_e0');
});

test('campaign4 build: every exit stays in the overlay; all RC2 roles present; parents and plans reproduce',{skip:!ready},()=>{
 const summary=JSON.parse(fs.readFileSync(path.join(build,'state-report.json'))),rc2Report=JSON.parse(fs.readFileSync(path.join(rc2,'campaign-report.json')));
 const produced=new Set(fs.readdirSync(build).filter(f=>f.endsWith('.bsp')).map(f=>f.slice(0,-4)));
 assert.equal(produced.size,194);assert.equal(summary.convertedMaps,194);assert.equal(summary.campaignMaps.length,186);
 const rc2Aliases=new Set(rc2Report.results.map(r=>r.map));
 for(const r of rc2Report.results)assert.ok(produced.has(overlayAlias(r.map,rc2Aliases)),'missing role '+r.map);
 for(const name of produced){const bytes=fs.readFileSync(path.join(build,name+'.bsp')),report=JSON.parse(fs.readFileSync(path.join(build,name+'.json')));
  assert.equal(sha256(bytes),report.outputSha256);for(const exit of exits(bytes))assert.ok(produced.has(exit),`${name} exit ${exit} leaves the overlay`);
  // The installer rebuilds from the original BSP with exactly these plan fields.
  const source=fs.readFileSync(path.join(maps,report.sourceMap+'.bsp'));assert.equal(sha256(source),report.sourceSha256);
  const rebuilt=assembleCampaign(source,decodeBsp(bytes).entities,report.modelClones);assert.ok(rebuilt.output.equals(bytes),'plan reproduces '+name);
  assert.equal(JSON.stringify(rebuilt.edits),JSON.stringify(report.edits));assert.equal(rebuilt.appendText,report.appendText);
 }
});

test('campaign4 build: new maps differ from their RC2 parent only by door conversions and routes',{skip:!ready},()=>{
 const summary=JSON.parse(fs.readFileSync(path.join(build,'state-report.json'))),keys=campaignKeys(maps,[...new Set(summary.campaignMaps.map(s=>s.sourceMap))]),rc2Aliases=new Set(JSON.parse(fs.readFileSync(path.join(rc2,'campaign-report.json'))).results.map(r=>r.map));
 for(const spec of summary.campaignMaps.filter((s,i)=>i%9===0||['s4_asylum1_e0','s4_apartment1_e0','s4_sewer2_e0','s4_subway1st1_e0'].includes(s.map))){
  const parentBytes=fs.readFileSync(path.join(rc2,spec.parent+'.bsp')),parentReport=JSON.parse(fs.readFileSync(path.join(rc2,spec.parent+'.json'))),source=fs.readFileSync(path.join(maps,spec.sourceMap+'.bsp'));
  assert.equal(sha256(parentBytes),spec.parentSha256);
  const again=campaignOverlayMap({source,parentBytes,parentReport,sourceMap:spec.sourceMap,map:spec.map,rc2Aliases,keys});
  assert.ok(again.output.equals(fs.readFileSync(path.join(build,spec.map+'.bsp'))),'deterministic '+spec.map);
  const before=decodeBsp(parentBytes).entities,after=decodeBsp(again.output).entities,touched=new Set(again.report.changes.flatMap(c=>[c.entity,...(c.controllers??[]).map(x=>x.entity),c.toggle,c.trigger,c.manager,c.lockStage,c.unlockStage,c.sceneTrigger].filter(n=>Number.isInteger(n)))),routed=new Set(again.report.changes.filter(c=>c.kind==='campaign4 route').map(c=>c.entity));
  for(let i=0;i<before.length;i++)if(!touched.has(i)&&!routed.has(i))assert.deepEqual(after[i].pairs,before[i].pairs,`${spec.map} entity ${i} changed unexpectedly`);
 }
});

test('campaign4 doors: gated, key and linked doors are wired to one shared global each',{skip:!ready},()=>{
 const ents=m=>decodeBsp(fs.readFileSync(path.join(build,m+'.bsp'))).entities,named=(e,n)=>e.filter(x=>v(x,'targetname')===n);
 // c_asylum1: 4 unlocks 3 from the other side; 74 starts disabled, enabled by inter_door_disable frags=1; 71 is a staff-key door.
 const a=ents('s4_asylum1_e0');
 assert.equal(cls(a[3]),'func_button');assert.equal(v(a[3],'master'),'sc4_cd_3_gate');assert.equal(v(named(a,'sc4_cd_3_gate')[0],'globalstate'),'sc4.door.c_asylum1.3.enabled');
 const unlock=named(a,'sc4_cd_4_unlock')[0];assert.equal(cls(unlock),'env_global');assert.equal(v(unlock,'globalstate'),'sc4.door.c_asylum1.3.enabled');assert.equal(v(unlock,'triggermode'),'1');
 assert.ok(a.some(e=>cls(e)==='multi_manager'&&e.pairs.some(([k,val])=>k==='sc4_cd_4_unlock'&&val==='1.25')));
 assert.equal(cls(a[74]),'func_button');const enable=a.find(e=>v(e,'targetname')==='staffdoor2_ed');assert.equal(cls(enable),'env_global');assert.equal(v(enable,'triggermode'),'1');assert.equal(v(enable,'initialstate'),'0');
 assert.equal(cls(a[71]),'inter_door');assert.equal(v(a[71],'targetname'),'sc4_keydoor_71');assert.equal(cls(named(a,'sc4_keydoor_71_button')[0]),'func_button');assert.equal(cls(named(a,'sc4_keydoor_71_open')[0]),'trigger_relay');
 // c_subway1st1: doors locked and unlocked in sequence toggle per visit like
 // the native door: every authored toggle flips one router into a plain gate.
 const s=ents('s4_subway1st1_e0');for(const i of [135,157,159,240]){assert.equal(cls(s[i]),'func_button');const gate=named(s,'sc4_cd_'+i+'_gate')[0],router=named(s,'sc4_cd_'+i+'_router')[0];
  assert.equal(cls(gate),'multisource');assert.equal(v(gate,'globalstate'),undefined);assert.equal(cls(router),'trigger_relay');assert.equal(v(router,'target'),'sc4_cd_'+i+'_gate');assert.equal(v(router,'triggerstate'),'2');}
 // c_park 125: one toggle locks, another unlocks; together they are a sequence.
 const p=ents('s4_park_e0');for(const t of [126,224]){assert.equal(cls(p[t]),'trigger_relay');assert.equal(v(p[t],'target'),'sc4_cd_125_router');}
 assert.ok(p.some(e=>cls(e)==='trigger_auto'&&v(e,'target')==='sc4_cd_125_router'),'initially unlocked door opens its gate at load');
 // A once-only unlock stays a persistent shared switch (c_basement electricity door).
 const b=ents('s4_basement_e0');assert.equal(cls(b[681]),'env_global');assert.equal(v(b[681],'globalstate'),'sc4.door.c_basement.236.enabled');assert.equal(v(b[681],'triggermode'),'1');
 // No native useunlock may ever point at a converted button.
 for(const name of fs.readdirSync(build).filter(f=>f.endsWith('.bsp'))){const e=decodeBsp(fs.readFileSync(path.join(build,name))).entities;
  for(const d of e.filter(x=>cls(x)==='inter_door'&&v(x,'useunlock')))assert.ok(e.some(x=>cls(x)==='inter_door'&&v(x,'targetname')===v(d,'useunlock')),name+' native useunlock to a converted door');}
});

test('campaign4 existing overlay: only routes change, the prologue adds rain and the new-campaign door reset',{skip:!ready},()=>{
 for(const spec of MAINTENANCE_MAPS){
  const before=decodeBsp(fs.readFileSync(path.join(parent3,spec.map+'.bsp'))).entities,report=JSON.parse(fs.readFileSync(path.join(build,spec.map+'.json'))),after=decodeBsp(fs.readFileSync(path.join(build,spec.map+'.bsp'))).entities;
  const routed=new Set(report.changes.filter(c=>c.kind==='campaign4 route').map(c=>c.entity));
  // Doors converted by the campaign pass on these overlay maps (and their controllers).
  const doors=new Set(report.changes.filter(c=>['campaign door','campaign gated door','adapter-bridged native key door'].includes(c.kind)).flatMap(c=>[c.entity,...(c.controllers??[]).map(x=>x.entity)]));
  if(!['c_start','c_apartment1'].includes(spec.sourceMap))assert.equal(doors.size,0);
  for(const d of report.doorDecisions??[])if([204,713].includes(d.entity)&&spec.sourceMap==='c_start')assert.equal(d.status,'OWNED_BY_RC4_STAGE');
  for(let i=0;i<before.length;i++){if(spec.sourceMap==='c_intro'&&i===101)continue;if(!routed.has(i)&&!doors.has(i))assert.deepEqual(after[i].pairs,before[i].pairs,`${spec.map} entity ${i}`);}
  for(const e of after)for(const [k,val] of e.pairs)if(['message','map'].includes(k)&&['cof_changelevel','inter_door_coop_changelevel'].includes(cls(e)))assert.ok(!val.startsWith('s2_'),spec.map+' still routes to '+val);
  if(spec.sourceMap!=='c_intro'){if(!doors.size)assert.equal(after.length,before.length);continue;}
  assert.equal(v(after[101],'m_iDripsPerSecond'),'3000');
  const rain=after.filter(e=>cls(e)==='env_rain');assert.equal(rain.length,PROLOGUE_RAIN.length);
  for(const e of rain){assert.equal(v(e,'texture'),RAIN_STREAKS.texture);assert.equal(v(e,'m_iExtent'),'1');const m=report.modelClones.find(x=>'*'+x.index===v(e,'model'));assert.ok(m&&PROLOGUE_RAIN.some(r=>JSON.stringify(r.mins)===JSON.stringify(m.mins)));}
  const resets=after.filter(e=>cls(e)==='multi_manager'&&/^sc4_campaign_doors_reset_\d+$/.test(v(e,'targetname')));const resetChange=report.changes.find(c=>c.kind==='new campaign resets every converted door state');assert.ok(resetChange&&resetChange.states>=20);assert.equal(resets.length,Math.ceil(resetChange.states/15));
  for(const m of resets)assert.ok(m.pairs.filter(([k])=>!['classname','targetname','spawnflags'].includes(k)).length<=15,'multi_manager target limit');
 }
});
