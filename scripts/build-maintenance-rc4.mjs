import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeBsp,sha256,uniqueValue as v} from './bsp.mjs';
import {assembleCampaign} from './build-connected-campaign.mjs';
import {RC4_MAPS,RC4_ENTRY} from './build-state-rc4.mjs';
import {prepareOutput} from './cof-inspect.mjs';
import {convertConditionalDoor} from './conditional-story-doors.mjs';
import {applyCampaignState} from './campaign-state-rc4.mjs';
import {worldHull,sampleSpawn} from './collision.mjs';

// The delivered hotfix is the comparison parent, never an output to overwrite.
export const HOTFIX_PINS={
 cof_campaign_story4:['907d89b6eb5c4553a1a94042b4827be9ace294bf415b1329db39b1a2f37f39a0','07b6b944754d39b893e24d2f1b12d15a401071ead6a99a8fbd2c7b2ef03d23dd'],
 s4_nightmare:['8c8c6d33bcc4bde8bb1678d746273bd40ea83051960a985836ce5072b3447abf','4322ecd7c7d66e5c96b73b892ed2bd996d0971bc348e3355bea466b4848f1657'],
 s4_start:['47e6cf7076e8e697be04346ad3dc977d4fb6d8148e10aa23f3c6af0008d437e0','7c452f55b2c75552e5d7c553fd7f53bfe1ae91ef53a2c3e3fae7145b49152023'],
 s4_start_e0:['4dc3e6acbceebdbbb06fd99be51399920e70d92914d826f4be7c99f03cc1b6be','a71d1655aadb6bf3f6d7b5fad529cf0eb720b5a109b19f997b97e1ff395c20b9'],
 s4_start2:['91becf32f71e34c6b71ed57d4b4c65b2b4ef0db1ff5f44a4f421ed844dcff80a','3f9771d072113879bea5635e28feb9c8649356863c5026503a73f012232dde31']
};
const cls=e=>v(e,'classname');
export const MAINTENANCE_MAPS=[...RC4_MAPS,
 {map:'s4_apartment1_e3',sourceMap:'c_apartment1',sourceSha256:'8777047485e8adeaf6e8c473cedcd48470207a32831b5df5e3e111c3d0c99bbc',parent:'s2_apartment1_e3',parentRelease:'rc2',parentSha256:'80dbc4ce09f2b7bc90bb8dbd4b4dc4260ffb474095d3485eadfd2d2218b2ce29',parentPlanSha256:'9251baa02624fe4d3a57dfcb9ce7257dcaa39fef8ffd64c51f338a04ab2737d4'},
 {map:'s4_apartment1_e7',sourceMap:'c_apartment1',sourceSha256:'8777047485e8adeaf6e8c473cedcd48470207a32831b5df5e3e111c3d0c99bbc',parent:'s2_apartment1_e7',parentRelease:'rc2',parentSha256:'72e94c5f2d5d3366c90a06e595ddfa07843b2b11cee456bd77b2909e03acd82e',parentPlanSha256:'0510af531830cfefc3d1b467c7a6615f9b40a74a2d8b7bad65f7b26b3bcddbd5'},
 {map:'s4_start_e2',sourceMap:'c_start',sourceSha256:'72d1520baf7950ba056c6bc53310612c8582e83488a4df690199045e67815415',parent:'s2_start_e2',parentRelease:'rc2',parentSha256:'0929720a8f2181ca634a188ce58ad52349f176f5516a7efd0344ce86ccf92a70',parentPlanSha256:'b4e51e3362744fa8b47330863d609ba7c803886e119e1c40e2daa23c74d039e7'}
];
// Apartment office doors 228/229 and scene 343 (shared by every c_apartment1
// alias of the RC4 overlay; coop-fixes-004 reuses it for the other variants).
export function apartmentOfficeStage({source,entities,changes}){
 const add=o=>entities.push({index:entities.length,pairs:Object.entries(o).map(([k,val])=>[k,String(val)])});
  if(v(entities[621],'unldoor_office')!=='0'||v(entities[280],'unldoor_office')!=='0'||v(entities[280],'udoor_office_a')!=='0'||v(entities[754],'newlockedby')!=='assange')throw Error('Apartment temporary lock/unlock stages changed');
  convertConditionalDoor({source,entities,index:228,state:'sc4.door.c_apartment1.office.enabled',initial:1,toggle:691,changes});
  convertConditionalDoor({source,entities,index:229,state:'sc4.door.c_apartment1.office_return.enabled',initial:0,toggle:754,changes});
  // Distinguish authored locking from unlocking instead of toggling a retained
  // session state blindly on a return visit. Completion is idempotent.
  for(const i of [691,754])entities[i].pairs=entities[i].pairs.map(([k,val])=>[k,k==='triggermode'?'1':val]);
  entities[621].pairs=entities[621].pairs.map(([k,val])=>[k==='unldoor_office'?'sc4_office_lock':k,val]);
  add({classname:'env_global',targetname:'sc4_office_lock',globalstate:'sc4.door.c_apartment1.office.enabled',triggermode:0,initialstate:1,spawnflags:1});
  add({classname:'env_global',targetname:'sc4_office_complete',globalstate:'sc4.event.c_apartment1.office.pending',triggermode:0,initialstate:1,spawnflags:1});
  add({classname:'multisource',targetname:'sc4_office_pending',globalstate:'sc4.event.c_apartment1.office.pending'});
  if(v(entities[343],'target')!=='multispawnhe'||v(entities[343],'master'))throw Error('Apartment scene trigger changed');
  entities[343].pairs.push(['master','sc4_office_pending']);entities[280].pairs.push(['sc4_office_complete','0']);
  changes.push({kind:'apartment explicit lock and one-time completion',lockStage:621,unlockStage:280,sceneTrigger:343,pendingState:'sc4.event.c_apartment1.office.pending',note:'Original scene/action timings preserved; known completed scene does not restart on these aliases'});
}
export function buildMaintenanceMap(source,parentBytes,parentPlan,spec){
 const known=MAINTENANCE_MAPS.find(s=>s.map===spec.map);if(!known||JSON.stringify(known)!==JSON.stringify(spec))throw Error('Unknown maintenance specification');
 const pins=HOTFIX_PINS[spec.map]??[spec.parentSha256,spec.parentPlanSha256];
 if(!pins||sha256(source)!==spec.sourceSha256||sha256(parentBytes)!==pins[0]||sha256(Buffer.from(JSON.stringify(parentPlan,null,2)+'\n'))!==pins[1])throw Error('Maintenance protected source/hotfix mismatch');
 const parent=decodeBsp(parentBytes),entities=structuredClone(parent.entities),models=structuredClone(parentPlan.modelClones??[]),changes=structuredClone(parentPlan.changes??[]);
 if(!assembleCampaign(source,entities,models).output.equals(parentBytes))throw Error('Maintenance parent reconstruction mismatch');
 const add=o=>entities.push({index:entities.length,pairs:Object.entries(o).map(([k,val])=>[k,String(val)])});
 if(spec.map==='s4_start_e2')applyCampaignState({sourceMap:spec.sourceMap,map:spec.map,parentMap:spec.parent,entities,originalEntities:decodeBsp(source).entities,changes});
 for(const e of entities)for(const pair of e.pairs){if(['map','message'].includes(pair[0])){
  const bridge={'s2_apartment1_e3':'s4_apartment1_e3','s2_apartment1_e7':'s4_apartment1_e7','s2_start_e2':'s4_start_e2',...(spec.map==='s4_start_e2'?{'s2_start2':'s4_start2'}:{})}[pair[1]];
  if(bridge){changes.push({kind:'maintenance route bridge',entity:e.index,key:pair[0],before:pair[1],after:bridge});pair[1]=bridge;}
 }}
 if(spec.sourceMap==='c_intro'){
  const touch=entities[291],finish=entities[583];
  if(cls(touch)!=='trigger_once'||v(touch,'model')!=='*141'||v(touch,'target')!=='sc_level_291'||cls(finish)!=='multi_manager'||v(finish,'targetname')!=='kunitei2'||v(finish,'sc3_party_346_zone')!=='0.01')throw Error('Authored final relocation/exit changed');
  // The final native teleport does not itself dispatch trigger Touch. Complete
  // the existing exit using a synchronous occupancy query AFTER that authored
  // party relocation, without waiting for either client's movement command.
  touch.pairs=[['classname','info_target'],['targetname','sc4_retired_final_touch']];
  finish.pairs.push(['sc4_final_zone','0.02']);
  add({classname:'game_zone_player',targetname:'sc4_final_zone',model:'*141',origin:'0 0 1',incount:'sc4_final_count'});
  add({classname:'game_counter',targetname:'sc4_final_count',frags:0,health:2,spawnflags:1,target:'sc_level_291'});
  changes.push({kind:'authored final relocation occupancy barrier',retiredTouch:291,callback:'kunitei2',afterRelocation:'sc3_party_346_zone',zone:'sc4_final_zone',model:141,requiredPlayers:2,exit:'sc_level_291',reason:'Explicit native Use/USE_SET completion after original cinematic endpoint; no movement-dependent Touch or independent cinematic deadline'});
  // Native TrackTrain::Find at100D48F8 copies startspeed into pev.speed at
  // map initialization, before the gated cinematic. Hold these four authored
  // vehicle brushes at their original paths until the original timeline Use.
  for(const i of [99,102,142,341]){
   const e=entities[i];if(cls(e)!=='func_tracktrain'||v(e,'startspeed')!=='300'||!['skittag','skittag22'].includes(v(e,'targetname')))throw Error('Title vehicle dependency changed');
   e.pairs=e.pairs.map(([k,val])=>[k,k==='startspeed'?'0':val]);
  }
  changes.push({kind:'vehicle start tied to authored ready timeline',entities:[99,102,142,341],initialSpeed:0,runSpeed:300,callback:'sc3_timeline_multiintroduct',reason:'Native Find otherwise starts vehicle motion during readiness wait; original Use/path animation remains authoritative',visibleInGame:'AWAITING GAMEPLAY VERIFICATION'});
 }
 if(spec.sourceMap==='c_start'){
  convertConditionalDoor({source,entities,index:713,state:'sc4.puzzle.c_start.padlock.done',initial:0,changes});
  const toggle=entities[717];if(cls(toggle)!=='cof_interdooronoff'||v(toggle,'message')!=='sd_door1')throw Error('Padlock unlock reference changed');
  // Completion already commits the shared solved flag. Re-entry's original
  // unlock action is retained as an idempotent On, never a private door toggle.
  toggle.pairs=[['classname','env_global'],['targetname','sd_door1_lock'],['globalstate','sc4.puzzle.c_start.padlock.done'],['triggermode','1'],['initialstate','0'],['spawnflags','1']];
  const hull=worldHull(source),original=decodeBsp(source);
  // Both nearby recorder interactions resume at this same safe tunnel anchor.
  // The second recorder's prop origin is not a four-player standing volume.
  for(const i of [419]){
   const tape=original.entities[i];if(cls(tape)!=='tape_recorder')throw Error('Checkpoint recorder changed');
   const p=v(tape,'origin').split(' ').map(Number),positions=[];
   const offsets=[];for(let dx=-128;dx<=128;dx+=32)for(let dy=-128;dy<=128;dy+=32)if(Math.hypot(dx,dy)>=32&&Math.hypot(dx,dy)<=160)offsets.push([dx,dy]);offsets.sort((a,b)=>Math.hypot(...a)-Math.hypot(...b));
   for(const [dx,dy] of offsets)for(const dz of [0,-24,-32,8,-40]){
    const feet=[p[0]+dx,p[1]+dy,p[2]+dz],center=[feet[0],feet[1],feet[2]+37];if(positions.length<2&&sampleSpawn(hull,[feet[0],feet[1],feet[2]+36]).staticCandidate&&[.25,.5,.75].every(t=>hull.contents([p[0]+dx*t,p[1]+dy*t,center[2]])===-1)&&!positions.some(q=>Math.hypot(q[0]-feet[0],q[1]-feet[1])<36))positions.push(feet);
   }
   if(positions.length!==2)throw Error('Checkpoint '+i+' needs two clear original-room landings: '+positions.length);
   positions.forEach((q,k)=>add({classname:'info_teleport_destination',targetname:'sc4_checkpoint_'+i+'_p'+(k+1),origin:q.join(' '),angles:'0 0 0'}));
   changes.push({kind:'safe recorder checkpoint',recorder:i,positions,authority:'Original recorder room; static standing support; actual dynamic overlap remains a gameplay check'});
  }
 }
 if(spec.sourceMap==='c_apartment1')apartmentOfficeStage({source,entities,changes});
 const built=assembleCampaign(source,entities,models);
 return {...built,report:{...parentPlan,...spec,parentSha256:spec.parentSha256,parentPlanSha256:spec.parentPlanSha256,...built,output:undefined,maintenance:true,protectedHotfix:{map:HOTFIX_PINS[spec.map]?spec.map:spec.parent,sha256:pins[0],planSha256:pins[1]},outputSha256:sha256(built.output),fileBytes:built.output.length,changes,status:'AWAITING GAMEPLAY VERIFICATION'}};
}
export function main(args){
 if(args.length!==4)throw Error('Usage: build-maintenance-rc4.mjs ORIGINAL_MAPS HOTFIX_BUILD RC2_BUILD NEW_BUILD');
 const [maps,parent,rc2,destination]=args;
 const prepared=MAINTENANCE_MAPS.map(spec=>{const dir=HOTFIX_PINS[spec.map]?parent:rc2,name=HOTFIX_PINS[spec.map]?spec.map:spec.parent;return {spec,...buildMaintenanceMap(fs.readFileSync(path.join(maps,spec.sourceMap+'.bsp')),fs.readFileSync(path.join(dir,name+'.bsp')),JSON.parse(fs.readFileSync(path.join(dir,name+'.json'))),spec)};});
 const out=prepareOutput(destination,[maps,parent,rc2]);
 for(const r of prepared){fs.writeFileSync(path.join(out,r.spec.map+'.bsp'),r.output,{flag:'wx'});fs.writeFileSync(path.join(out,r.spec.map+'.json'),JSON.stringify(r.report,null,2)+'\n',{flag:'wx'});}
 fs.writeFileSync(path.join(out,'state-report.json'),JSON.stringify({schemaVersion:2,release:'story-state-rc4',maintenance:true,entry:RC4_ENTRY,originalMaps:5,convertedMaps:prepared.length,results:prepared.map(({report:{edits,appendText,...r}})=>r),status:'AWAITING GAMEPLAY VERIFICATION'},null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({out,maps:prepared.length,entry:RC4_ENTRY}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{main(process.argv.slice(2));}catch(e){console.error(e.stack);process.exitCode=1;}}
