import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeBsp,sha256,uniqueValue as v} from './bsp.mjs';
import {assembleCampaign} from './build-connected-campaign.mjs';
import {prepareOutput} from './cof-inspect.mjs';
import {MAINTENANCE_MAPS} from './build-maintenance-rc4.mjs';
import {convertConditionalDoor} from './conditional-story-doors.mjs';
import {worldHull,sampleSpawn} from './collision.mjs';
export const INTEGRATION_PARENT='3b1ff5002c129a5d26327c9c59eb8ef0b4846f0e7b3480251dbbb12f851c64ae';
const set=(e,k,val)=>{e.pairs=e.pairs.filter(([key])=>key!==k);e.pairs.push([k,String(val)]);};
export function integrateMap(source,parent,report){
 const original=decodeBsp(source),entities=structuredClone(decodeBsp(parent).entities),changes=structuredClone(report.changes??[]);
 if(!assembleCampaign(source,entities,report.modelClones).output.equals(parent))throw Error('Parent reconstruction mismatch');
 const add=o=>{const e={index:entities.length,pairs:Object.entries(o).map(([k,val])=>[k,String(val)])};entities.push(e);return e;};
 if(report.sourceMap==='c_start'){
  const state='sc4.door.c_start.scene3.unlocked';
  for(const [i,k,val] of [[204,'master','amultiscr1'],[784,'newlockedby','nasiss'],[172,'doorlockedssd','10.3'],[200,'aglobal1','0'],[207,'globalstate','astate1']])if(v(original.entities[i],k)!==val||v(entities[i],k)!==val)throw Error('Scripted scene3 dependency changed');
  convertConditionalDoor({source,entities,index:204,state,initial:0,toggle:784,changes});
  // Original scene unlock is On, never toggle a persisted value on re-entry.
  set(entities[784],'triggermode',1);
  // astate1 already records this exact scene's start. Keep its original master
  // and initial locked state. Mark completion only at its final authored action.
  const done='sc4.event.c_start.scene3.done';
  add({classname:'env_global',targetname:'sc4_scene3_done',globalstate:done,triggermode:1,initialstate:0,spawnflags:1});
  add({classname:'env_global',targetname:'sc4_scene3_pending_off',globalstate:'sc4.event.c_start.scene3.pending',triggermode:0,initialstate:1,spawnflags:1});
  add({classname:'multisource',targetname:'sc4_scene3_pending',globalstate:'sc4.event.c_start.scene3.pending'});
  if(v(entities[147],'target')!=='multiscene3'||v(entities[147],'master'))throw Error('Scene3 entry changed');
  set(entities[147],'master','sc4_scene3_pending');
  entities[200].pairs.push(['sc4_scene3_done','16'],['sc4_scene3_pending_off','16']);
  // Completed scene: restore only its unlock/master/hidden actor, no camera,
  // pickup, fade, sound or teleport replay. Legacy saves have no completion
  // latch; do not infer completion merely from the scene-start astate1 flag.
  add({classname:'multisource',targetname:'sc4_scene3_completed',globalstate:done});
  add({classname:'env_global',targetname:'sc4_scene3_master_on',globalstate:'astate1',triggermode:1});
  add({classname:'multi_manager',targetname:'sc4_scene3_restore',master:'sc4_scene3_completed',spawnflags:1,doorlockedssd:0,sc4_scene3_master_on:0,invsimon3:0,sc4_scene3_pending_off:0});
  add({classname:'trigger_auto',target:'sc4_scene3_restore',delay:0.4,triggerstate:1,spawnflags:1});
  // Separate Sewer Store anchor. Search only its original room, retain the
  // proven Storage Tunnel markers, and require static support/clear passage.
  const tape=original.entities[421],p=v(tape,'origin').split(' ').map(Number),hull=worldHull(source),positions=[];
  if(v(tape,'classname')!=='tape_recorder'||v(tape,'message')!=='Sewer Store')throw Error('Sewer recorder changed');
  const offsets=[];for(let dx=-160;dx<=160;dx+=16)for(let dy=-160;dy<=160;dy+=16)if(Math.hypot(dx,dy)>=32&&Math.hypot(dx,dy)<=160)offsets.push([dx,dy]);offsets.sort((a,b)=>Math.hypot(...a)-Math.hypot(...b));
  for(const [dx,dy] of offsets)for(const dz of [0,-24,-32,8,-40]){
   const feet=[p[0]+dx,p[1]+dy,p[2]+dz],z=feet[2]+37;
   if(positions.length<2&&sampleSpawn(hull,[feet[0],feet[1],feet[2]+36]).staticCandidate&&[.25,.5,.75].every(t=>hull.contents([p[0]+dx*t,p[1]+dy*t,z])===-1)&&positions.every(q=>Math.hypot(q[0]-feet[0],q[1]-feet[1])>=40))positions.push(feet);
  }
  if(positions.length!==2)throw Error('Sewer recorder needs two safe supported landings');
  positions.forEach((q,k)=>add({classname:'info_teleport_destination',targetname:'sc4_checkpoint_421_p'+(k+1),origin:q.join(' '),angles:'0 0 0'}));
  changes.push({kind:'separate Sewer Store checkpoint',recorder:421,positions,scope:'two active; static clearance only; gameplay pending'});
 }
 const built=assembleCampaign(source,entities,report.modelClones);
 return {...built,report:{...report,...built,output:undefined,regression:false,integration:true,integrationParentSha256:sha256(parent),outputSha256:sha256(built.output),fileBytes:built.output.length,changes}};
}
export function main(args){
 if(args.length!==4)throw Error('Usage: build-integration-rc4.mjs ORIGINAL_MAPS PREVIOUS_BUILD PREVIOUS_PACKAGE NEW_BUILD');
 const [maps,parent,prior,destination]=args,catalogBytes=fs.readFileSync(path.join(prior,'release.json'));
 if(sha256(catalogBytes)!==INTEGRATION_PARENT)throw Error('Changed integration parent');
 const catalog=JSON.parse(catalogBytes),prepared=MAINTENANCE_MAPS.map(spec=>{
  const before=fs.readFileSync(path.join(parent,spec.map+'.bsp')),source=fs.readFileSync(path.join(maps,spec.sourceMap+'.bsp')),report=JSON.parse(fs.readFileSync(path.join(parent,spec.map+'.json'))),entry=catalog.maps.find(m=>m.map===spec.map);
  if(sha256(source)!==spec.sourceSha256||sha256(before)!==entry.outputSha256||report.outputSha256!==entry.outputSha256)throw Error('Changed source/parent');
  return {spec,...integrateMap(source,before,report)};
 });
 const out=prepareOutput(destination,[maps,parent,prior]);
 for(const {spec,output,report} of prepared){fs.writeFileSync(path.join(out,spec.map+'.bsp'),output,{flag:'wx'});fs.writeFileSync(path.join(out,spec.map+'.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});}
 fs.writeFileSync(path.join(out,'state-report.json'),JSON.stringify({schemaVersion:2,maintenance:true,integration:true,convertedMaps:8,previousCatalogSha256:INTEGRATION_PARENT,changedMaps:prepared.filter(p=>p.report.integrationParentSha256!==p.report.outputSha256).map(p=>p.spec.map)},null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({out,changedMaps:prepared.filter(p=>p.report.integrationParentSha256!==p.report.outputSha256).map(p=>p.spec.map)}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{main(process.argv.slice(2));}catch(e){console.error(e.stack);process.exitCode=1;}}
