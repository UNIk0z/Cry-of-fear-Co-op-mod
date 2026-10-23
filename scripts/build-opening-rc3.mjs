import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeBsp,sha256,uniqueValue as v} from './bsp.mjs';
import {assembleCampaign} from './build-connected-campaign.mjs';
import {worldHull,sampleSpawn} from './collision.mjs';
import {entrySpawns} from './campaign-destinations.mjs';
import {prepareOutput} from './cof-inspect.mjs';
export const OPENING=[{sourceMap:'c_intro',parent:'cof_campaign_story2',map:'cof_campaign_story3'},{sourceMap:'c_nightmare',parent:'s2_nightmare_e0',map:'s3_nightmare'},{sourceMap:'c_start',parent:'s2_start_e1',map:'s3_start'}];
const cls=e=>v(e,'classname'),xyz=s=>s.split(/\s+/).map(Number);
const set=(e,k,val)=>{e.pairs=e.pairs.filter(([key])=>key!==k);e.pairs.push([k,String(val)]);};
const point=(e,name)=>{e.pairs=[['classname','info_target'],['targetname',name],['origin',v(e,'origin')??'0 0 0']];};
// Preserve the author's exact feet position for the first participant, and use
// clear, supported nearby standing space for the other. A documented cinematic
// holding point may lack floor support; it is never called a playable spawn.
export function partyLanding(bytes,exit,{holding=false}={}){
 const feet=xyz(v(exit,'origin')),angles=v(exit,'angles')??'0 0 0',hull=worldHull(bytes),center=feet.map((x,i)=>x+(i===2?36:0));
 const samples=[{feet,standing:sampleSpawn(hull,center)}];
 if(!holding&&!samples[0].standing.staticCandidate)throw Error('Original playable landing fails standing support: '+v(exit,'targetname'));
 for(const radius of [36,48,64,80,96])for(const [dx,dy] of [[radius,0],[-radius,0],[0,radius],[0,-radius]]){
  const p=[feet[0]+dx,feet[1]+dy,feet[2]],c=[p[0],p[1],p[2]+36],sample=sampleSpawn(hull,c);
  if(sample.staticCandidate&&[.25,.5,.75].every(t=>hull.contents([center[0]+dx*t,center[1]+dy*t,center[2]+1])===-1))return {positions:[feet,p],angles,samples:[...samples,{feet:p,standing:sample}],holding,overlap:false};
 }
 if(holding&&hull.contents(center.map((x,i)=>x+(i===2?1:0)))===-1)return {positions:[feet,feet],angles,samples,holding:true,overlap:true,limitation:'Original cinematic holding position shared during control lock/fade; no playable landing claim'};
 throw Error('No second safe landing at original destination '+v(exit,'targetname'));
}
export function buildOpening(originalBytes,parentBytes,parentPlan,spec){
 if(sha256(originalBytes)!==parentPlan.sourceSha256||sha256(parentBytes)!==parentPlan.outputSha256)throw Error('Opening source/RC2 parent mismatch');
 const original=decodeBsp(originalBytes),parent=decodeBsp(parentBytes),entities=structuredClone(parent.entities),changes=[],models=structuredClone(parentPlan.modelClones??[]);
 const add=o=>{const e={index:entities.length,pairs:Array.isArray(o)?o:Object.entries(o).map(([k,val])=>[k,String(val)])};entities.push(e);return e;};
 const named=name=>entities.filter(e=>v(e,'targetname')===name);
 const marker=(name,text)=>add({classname:'trigger_command',targetname:name,netname:`echo [STORYCOOP_RC3] ${text}`});
 const zone=(name,target)=>add({classname:'game_zone_player',model:'*1',targetname:name,intarget:target,outtarget:target});
 function once(name,target){add({classname:'game_counter',targetname:name,frags:'0',health:'1',spawnflags:'1',target});}
 function gateTimeline(name){const managers=named(name);if(!managers.length||managers.some(e=>cls(e)!=='multi_manager'))throw Error('Unexpected timeline '+name);
  const privateName='sc3_timeline_'+name;for(const e of managers)set(e,'targetname',privateName);once(name,privateName);marker(privateName,'TIMELINE '+spec.map+' '+name);changes.push({kind:'one-shot timeline',name,managers:managers.map(e=>e.index)});
 }
 function recipients(e,{onceOnly=false}={}){const name=v(e,'targetname');if(!name||named(name).length!==1)throw Error('Ambiguous actor event '+e.index);
  const native='sc3_native_'+e.index;set(e,'targetname',native);
  if(onceOnly){const dispatch='sc3_dispatch_'+e.index;once(name,dispatch);zone(dispatch,native);}else zone(name,native);
  changes.push({kind:'per-player native dispatch',entity:e.index,classname:cls(e),name,native,onceOnly});
 }
 function partyTeleport(index,{holding=false}={}){const e=entities[index],source=original.entities[index],name=v(source,'targetname'),dest=named(v(source,'target'));
  if(cls(e)!=='cof_teleport'||!name||dest.length!==1||cls(dest[0])!=='info_teleport_destination')throw Error('Unexpected story relocation '+index);
  const landing=partyLanding(originalBytes,dest[0],{holding}),prefix='sc3_party_'+index;
  // Reset counters before enumerating. Reusable story teleports are serialized
  // by the original scene timelines; ordinary independent doors are untouched.
  point(e,prefix+'_retired');add([['classname','multi_manager'],['targetname',name],[prefix+'_reset','0'],[prefix+'_zone','0.01']]);
  add({classname:'game_counter_set',targetname:prefix+'_reset',target:prefix+'_count',frags:'0'});zone(prefix+'_zone',prefix+'_count');
  for(let i=0;i<2;i++){const target=prefix+'_dest'+i,move=prefix+'_move'+i;add({classname:'info_teleport_destination',targetname:target,origin:landing.positions[i].join(' '),angles:landing.angles});add({classname:'cof_teleport',targetname:move,target});add({classname:'game_counter',targetname:prefix+'_count',frags:'0',health:i+1,target:move});}
  changes.push({kind:'party story relocation',entity:index,name,originalDestination:v(source,'target'),...landing});
 }
 // Rewrite only the three opening aliases; every other RC2 destination stays.
 for(const e of entities)for(const pair of e.pairs){const route=OPENING.find(s=>s.parent===pair[1]);if(route&&['map','message'].includes(pair[0]))pair[1]=route.map;}
 if(spec.sourceMap==='c_intro'){
  if(cls(original.entities[157])!=='trigger_once'||v(original.entities[157],'target')!=='multiintroduct')throw Error('Intro start trigger changed');
  point(entities[157],'sc3_disabled_spawn_intro');gateTimeline('multiintroduct');
  // A native lobby callback can complete with only the host. Count players at
  // callback time instead of storing a solo-ready token for a later join. That
  // token would start the scene when an unready P2 arrived. Fail closed if the
  // lobby was completed early; native UI recovery is not a map-script feature.
  const ready=named('sc_begin_story');if(ready.length!==1||cls(ready[0])!=='trigger_relay')throw Error('RC2 ready callback changed');
  // Native zone incount sends USE_SET with the complete count synchronously.
  // Nonzero origin selects Intersects rather than zero-origin TraceModel.
  // Reuse RC2's metadata cloning to enclose the world without changing its hull.
  // Do not defer counting through multi_manager: a join in that delay could
  // otherwise pair an earlier solo-ready callback with an unready new player.
  const at=original.lumps[14].offset,mins=[0,4,8].map(k=>originalBytes.readFloatLE(at+k)-128),maxs=[12,16,20].map(k=>originalBytes.readFloatLE(at+k)+128),index=original.lumps[14].length/64+models.length;
  models.push({sourceModel:1,index,mins,maxs,purpose:'Synchronous native lobby occupancy count; nonzero-origin AABB; no world collision changes'});
  ready[0].pairs=[['classname','game_zone_player'],['targetname','sc_begin_story'],['model','*'+index],['origin','0 0 1'],['incount','sc3_ready_count']];
  add({classname:'game_counter',targetname:'sc3_ready_count',frags:'0',health:'2',spawnflags:'1',target:'multiintroduct'});
  partyTeleport(346,{holding:true});
  changes.push({kind:'ready-only intro',removedTouch:157,lobbyTarget:'sc_begin_story',storyGate:'multiintroduct',minimumPlayersAtCallback:2,soloCompletion:'BLOCKED: restart lobby; do not carry readiness forward to an unready late join'});
 }
 if(spec.sourceMap==='c_nightmare'||spec.sourceMap==='c_start'){
  const root=spec.sourceMap==='c_nightmare'?'multiintro3':'multiscene1',touches=spec.sourceMap==='c_nightmare'?[125,293]:[120];
  for(const i of touches){if(v(original.entities[i],'target')!==root)throw Error('Opening trigger changed '+i);point(entities[i],'sc3_disabled_touch_'+i);}
  gateTimeline(root);if(spec.sourceMap==='c_nightmare')gateTimeline('nightmulti');
  if(named('game_playerjoin').length)throw Error('Existing player-join hook requires review');
  // Native100F76A4 guards player+24D0 before FireTargets100F7709. Ordinary
  // respawns cannot count twice. Delay leaves Player::Spawn's call stack.
  add({classname:'game_counter',targetname:'game_playerjoin',frags:'0',health:'2',spawnflags:'1',target:'sc3_spawn_complete'});
  add({classname:'trigger_relay',targetname:'sc3_spawn_complete',target:root,delay:'0.1',triggerstate:'1',spawnflags:'1'});
  marker('sc3_spawn_complete','TWO_JOINS '+spec.map);
  changes.push({kind:'two-player join barrier',root,removedTouches:touches,limitations:'Native once-per-player-instance join hook; no mid-scene camera/inventory catch-up. Two clients required. Engine joining order needs gameplay validation.'});
 }
 const teleportIndices=spec.sourceMap==='c_nightmare'?[254,434]:spec.sourceMap==='c_start'?[536,537]:[];
 for(const index of teleportIndices)partyTeleport(index,{holding:spec.sourceMap==='c_start'&&index===536||spec.sourceMap==='c_nightmare'&&index===428});
 for(const source of original.entities){const e=entities[source.index];if(['cof_blur','cof_camerazoom','cof_logo'].includes(cls(source)))recipients(e);
  if(cls(source)==='cof_giveitems')recipients(e,{onceOnly:true});
  if(cls(source)==='cof_clearitems'&&v(source,'message')==='weapon_camera')recipients(e,{onceOnly:true});
 }
 if(spec.sourceMap==='c_nightmare'){
  // Original teleea45 is an offstage solid-hull position for five seconds of
  // the existing black fade. Keep both actors at the preceding valid landing
  // during that hold, then retain the authored final teleport/map event timing.
  point(entities[428],'teleportea45');changes.push({kind:'black-fade holding correction',entity:428,originalDestination:'teleea45',reason:'Original interim standing hull is solid; retain prior valid position until authored final teleport at5s'});
  entities[429].pairs=[['classname','trigger_relay'],['targetname','teleportea'],['target','changelevelea'],['triggerstate','1']];
  changes.push({kind:'authored final event to cooperative handoff',entity:429,reason:'Original teleea has one standing slot in a changelevel volume; retain original5s event timing without relocating clients into that single-player staging area'});
  const exit=named('changelevelea');if(exit.length!==1||cls(exit[0])!=='cof_changelevel')throw Error('Nightmare exit changed');point(exit[0],'sc3_retired_capture_exit');
  once('changelevelea','sc3_handoff');const stop='sc3_stop_cameras';
  for(const cam of original.entities.filter(e=>cls(e)==='trigger_camera'))add({classname:'trigger_relay',targetname:stop,target:v(cam,'targetname'),triggerstate:'0'});
  add({classname:'cof_clearitems',targetname:'sc3_remove_camera_actor',message:'weapon_camera'});zone('sc3_remove_camera','sc3_remove_camera_actor');
  add([['classname','multi_manager'],['targetname','sc3_handoff'],[stop,'0'],['sc3_remove_camera','0.05'],['sc3_exit_marker','0.1'],['sc3_queue_level','0.2']]);
  marker('sc3_exit_marker','NIGHTMARE_HANDOFF to s3_start');add({classname:'trigger_command',targetname:'sc3_queue_level',netname:'changelevel s3_start'});
  changes.push({kind:'nightmare fresh-unit handoff',destination:'s3_start',captureInventory:false,reason:'Original waking scene removes camera and grants phone/knife. Candidate avoids transferring obsolete camera state; hang cause not established.'});
 }
 for(const s of entities.filter(e=>/^cof_coop_spawn[34]$/.test(cls(e)??'')))point(s,'sc3_unused_slot_'+s.index);
 const authoredStart={c_intro:98,c_nightmare:104,c_start:55}[spec.sourceMap];
 const spawnPlan=entrySpawns(originalBytes,{...original,entities:original.entities.filter(e=>cls(e)!=='info_player_start'||e.index===authoredStart)});
 if(spawnPlan.status==='BLOCKED'||spawnPlan.spawns.length<2)throw Error('Author opening start cannot support two players: '+spec.sourceMap);
 for(let i=1;i<=2;i++){const matches=entities.filter(e=>cls(e)==='cof_coop_spawn'+i);if(matches.length!==1)throw Error('Ambiguous player slot');set(matches[0],'origin',spawnPlan.spawns[i-1].origin.join(' '));set(matches[0],'angles',spawnPlan.spawns[i-1].angles.join(' '));}
 changes.push({kind:'authored opening spawn',entity:authoredStart,spawns:spawnPlan.spawns.slice(0,2)});
 const built=assembleCampaign(originalBytes,entities,models);
 return {...built,report:{schemaVersion:2,...spec,sourceSha256:sha256(originalBytes),parentSha256:sha256(parentBytes),outputSha256:sha256(built.output),fileBytes:built.output.length,entities:built.entities,edits:built.edits,appendText:built.appendText,modelClones:built.modelClones,changes,status:'AWAITING GAMEPLAY VERIFICATION',runtimeHangCause:'NOT ESTABLISHED',maxPlayers:2}};
}
export function main(args){if(args.length!==3)throw Error('Usage: build-opening-rc3.mjs ORIGINAL_MAPS RC2_BUILD FRESH_OUTPUT');const [maps,parents,output]=args,out=prepareOutput(output,[maps,parents]);const reports=[];
 for(const spec of OPENING){const r=buildOpening(fs.readFileSync(path.join(maps,spec.sourceMap+'.bsp')),fs.readFileSync(path.join(parents,spec.parent+'.bsp')),JSON.parse(fs.readFileSync(path.join(parents,spec.parent+'.json'))),spec);fs.writeFileSync(path.join(out,spec.map+'.bsp'),r.output,{flag:'wx'});fs.writeFileSync(path.join(out,spec.map+'.json'),JSON.stringify(r.report,null,2)+'\n',{flag:'wx'});reports.push(r.report);}
 fs.writeFileSync(path.join(out,'opening-report.json'),JSON.stringify(reports.map(({edits,appendText,...r})=>r),null,2)+'\n');console.log(JSON.stringify(reports.map(r=>({map:r.map,entities:r.entities,changes:r.changes.length,sha256:r.outputSha256}))));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{main(process.argv.slice(2));}catch(e){console.error(e.stack);process.exitCode=1;}}
