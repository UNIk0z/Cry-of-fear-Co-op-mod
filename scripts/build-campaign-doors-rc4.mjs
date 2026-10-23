import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeBsp,sha256,uniqueValue as v} from './bsp.mjs';
import {assembleCampaign} from './build-connected-campaign.mjs';
import {prepareOutput} from './cof-inspect.mjs';
import {MAINTENANCE_MAPS} from './build-maintenance-rc4.mjs';
import {convertConditionalDoor,convertKeyDoor} from './conditional-story-doors.mjs';
// Exact delivered camera-notes-001 catalog. Its maps are integration-001.
export const CAMPAIGN_DOORS_PARENT='82c93704cdaae280b5315859f08b9ac04eea861c61cc562361ad6a7c109617fc';
const cls=e=>v(e,'classname');
// Apartment key room (713) and apartment key door (193), shared by every
// c_apartment1 alias of the RC4 overlay.
export function apartmentKeyRoomStage({source,entities,changes}){
 const original=decodeBsp(source),add=o=>{const e={index:entities.length,pairs:Object.entries(o).map(([k,val])=>[k,String(val)])};entities.push(e);return e;};
  // Key room: trigger573 -> manager574 -> 35s cof_interdooronoff577 toggles
  // kakaelai713 (native Use 100A6EA0 clears/sets lockedby). 713 starts locked.
  const [trigger,manager,toggle,door,key]=[573,574,577,713,193].map(i=>original.entities[i]);
  if(cls(trigger)!=='trigger_once'||v(trigger,'target')!=='skrammasekul44'||v(trigger,'master')||cls(manager)!=='multi_manager'||v(manager,'losaheheha')!=='35'||cls(toggle)!=='cof_interdooronoff'||v(toggle,'targetname')!=='losaheheha'||v(toggle,'message')!=='kakaelai'||v(door,'targetname')!=='kakaelai'||v(door,'lockedby')!=='lasersvett')throw Error('Apartment key-room dependencies changed');
  if(cls(key)!=='inter_door'||v(key,'lockedby')!=='apartmentkey'||v(key,'target')!=='3_exit1')throw Error('Apartment key door changed');
  for(const i of [573,574,577,713,193])if(JSON.stringify(entities[i].pairs)!==JSON.stringify(original.entities[i].pairs))throw Error('Parent already edited apartment door '+i);
  convertConditionalDoor({source,entities,index:713,state:'sc4.door.c_apartment1.keyroom_exit.enabled',initial:0,toggle:577,changes});
  // The authored action is an unlock; never toggle a persisted value on re-entry.
  entities[577].pairs=entities[577].pairs.map(([k,val])=>[k,k==='triggermode'?'1':val]);
  add({classname:'env_global',targetname:'sc4_keyroom_complete',globalstate:'sc4.event.c_apartment1.keyroom.pending',triggermode:0,initialstate:1,spawnflags:1});
  add({classname:'multisource',targetname:'sc4_keyroom_pending',globalstate:'sc4.event.c_apartment1.keyroom.pending'});
  entities[573].pairs.push(['master','sc4_keyroom_pending']);
  // Latch at the authored unlock time, never earlier: an interrupted scene must
  // not leave the exit locked with its trigger disabled.
  entities[574].pairs.push(['sc4_keyroom_complete','35']);
  changes.push({kind:'apartment key-room one-time scare and idempotent exit unlock',trigger:573,manager:574,toggle:577,door:713,pendingState:'sc4.event.c_apartment1.keyroom.pending',latchAt:35,status:'AWAITING GAMEPLAY VERIFICATION'});
  convertKeyDoor({source,entities,index:193,state:'sc4.door.c_apartment1.apartment.unlocked',changes});
}
export function campaignDoorsMap(source,parent,report){
 const original=decodeBsp(source),entities=structuredClone(decodeBsp(parent).entities),changes=structuredClone(report.changes??[]);
 if(!assembleCampaign(source,entities,report.modelClones).output.equals(parent))throw Error('Parent reconstruction mismatch');
 const add=o=>{const e={index:entities.length,pairs:Object.entries(o).map(([k,val])=>[k,String(val)])};entities.push(e);return e;};
 if(report.sourceMap==='c_apartment1')apartmentKeyRoomStage({source,entities,changes});
 const built=assembleCampaign(source,entities,report.modelClones);
 return {...built,report:{...report,...built,output:undefined,campaignDoors:true,campaignDoorsParentSha256:sha256(parent),outputSha256:sha256(built.output),fileBytes:built.output.length,changes}};
}
export function main(args){
 if(args.length!==4)throw Error('Usage: build-campaign-doors-rc4.mjs ORIGINAL_MAPS INTEGRATION_BUILD CAMERA_NOTES_PACKAGE NEW_BUILD');
 const [maps,parent,prior,destination]=args,catalogBytes=fs.readFileSync(path.join(prior,'release.json'));
 if(sha256(catalogBytes)!==CAMPAIGN_DOORS_PARENT)throw Error('Changed campaign-doors parent catalog');
 const catalog=JSON.parse(catalogBytes),prepared=MAINTENANCE_MAPS.map(spec=>{
  const before=fs.readFileSync(path.join(parent,spec.map+'.bsp')),source=fs.readFileSync(path.join(maps,spec.sourceMap+'.bsp')),report=JSON.parse(fs.readFileSync(path.join(parent,spec.map+'.json'))),entry=catalog.maps.find(m=>m.map===spec.map);
  if(sha256(source)!==spec.sourceSha256||!entry||sha256(before)!==entry.outputSha256||report.outputSha256!==entry.outputSha256)throw Error('Changed source/parent');
  return {spec,...campaignDoorsMap(source,before,report)};
 });
 const out=prepareOutput(destination,[maps,parent,prior]);
 for(const {spec,output,report} of prepared){fs.writeFileSync(path.join(out,spec.map+'.bsp'),output,{flag:'wx'});fs.writeFileSync(path.join(out,spec.map+'.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});}
 const changedMaps=prepared.filter(p=>p.report.campaignDoorsParentSha256!==p.report.outputSha256).map(p=>p.spec.map);
 fs.writeFileSync(path.join(out,'state-report.json'),JSON.stringify({schemaVersion:2,maintenance:true,integration:true,campaignDoors:true,convertedMaps:8,previousCatalogSha256:CAMPAIGN_DOORS_PARENT,changedMaps},null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({out,changedMaps}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{main(process.argv.slice(2));}catch(e){console.error(e.stack);process.exitCode=1;}}
