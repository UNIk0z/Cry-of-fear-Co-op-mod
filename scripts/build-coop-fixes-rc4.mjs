import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeBsp,sha256,uniqueValue as v} from './bsp.mjs';
import {assembleCampaign} from './build-connected-campaign.mjs';
import {prepareOutput} from './cof-inspect.mjs';
import {MAINTENANCE_MAPS} from './build-maintenance-rc4.mjs';
// Exact delivered campaign-doors-001 catalog; its maps are campaign-doors-maps-002.
export const COOP_FIXES_PARENT='07afd4d6133930bdd6711ca9176057b44a515f820d59edf2bde25ee7fda30ecf';
const cls=e=>v(e,'classname');
export function coopFixesMap(source,parent,report){
 const original=decodeBsp(source),entities=structuredClone(decodeBsp(parent).entities),changes=structuredClone(report.changes??[]);
 if(!assembleCampaign(source,entities,report.modelClones).output.equals(parent))throw Error('Parent reconstruction mismatch');
 if(report.sourceMap==='c_start'){
  // User report: black box near the original spawn after returning. c_start
  // func_wall_toggle119 "block" (brush *33, 63x66x166) stands on
  // info_player_start55 and the wake destination; the wake manager145 toggles
  // it away at t=0. Revisits skip the latched wake, and sc4_wake_restore
  // replayed only its five env_customize hides, so the wall stayed.
  const block=entities[119],wake=original.entities[145],restore=entities.filter(e=>v(e,'targetname')==='sc4_wake_restore');
  if(cls(block)!=='func_wall_toggle'||v(block,'targetname')!=='block'||v(block,'model')!=='*33'||v(block,'spawnflags')||JSON.stringify(block.pairs)!==JSON.stringify(original.entities[119].pairs))throw Error('Wake block wall changed');
  if(cls(wake)!=='multi_manager'||v(wake,'targetname')!=='multiscene1'||v(wake,'block')!=='0')throw Error('Authored wake block action changed');
  if(restore.length!==1||cls(restore[0])!=='multi_manager'||v(restore[0],'master')!=='sc4_wake_completed'||v(restore[0],'block')!==undefined)throw Error('Wake restore changed');
  // Toggle once at the same restore time as the other completed-wake actions.
  restore[0].pairs.push(['block','0']);
  changes.push({kind:'completed wake restores authored block wall removal',entity:119,manager:145,restore:'sc4_wake_restore',evidence:'brush centered on info_player_start55 and teleportdes1; only removed by the latched wake',status:'AWAITING GAMEPLAY VERIFICATION'});
 }
 const built=assembleCampaign(source,entities,report.modelClones);
 return {...built,report:{...report,...built,output:undefined,coopFixes:true,coopFixesParentSha256:sha256(parent),outputSha256:sha256(built.output),fileBytes:built.output.length,changes}};
}
export function main(args){
 if(args.length!==4)throw Error('Usage: build-coop-fixes-rc4.mjs ORIGINAL_MAPS CAMPAIGN_DOORS_BUILD CAMPAIGN_DOORS_PACKAGE NEW_BUILD');
 const [maps,parent,prior,destination]=args,catalogBytes=fs.readFileSync(path.join(prior,'release.json'));
 if(sha256(catalogBytes)!==COOP_FIXES_PARENT)throw Error('Changed coop-fixes parent catalog');
 const catalog=JSON.parse(catalogBytes),prepared=MAINTENANCE_MAPS.map(spec=>{
  const before=fs.readFileSync(path.join(parent,spec.map+'.bsp')),source=fs.readFileSync(path.join(maps,spec.sourceMap+'.bsp')),report=JSON.parse(fs.readFileSync(path.join(parent,spec.map+'.json'))),entry=catalog.maps.find(m=>m.map===spec.map);
  if(sha256(source)!==spec.sourceSha256||!entry||sha256(before)!==entry.outputSha256||report.outputSha256!==entry.outputSha256)throw Error('Changed source/parent');
  return {spec,...coopFixesMap(source,before,report)};
 });
 const out=prepareOutput(destination,[maps,parent,prior]);
 for(const {spec,output,report} of prepared){fs.writeFileSync(path.join(out,spec.map+'.bsp'),output,{flag:'wx'});fs.writeFileSync(path.join(out,spec.map+'.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});}
 const changedMaps=prepared.filter(p=>p.report.coopFixesParentSha256!==p.report.outputSha256).map(p=>p.spec.map);
 fs.writeFileSync(path.join(out,'state-report.json'),JSON.stringify({schemaVersion:2,maintenance:true,integration:true,coopFixes:true,convertedMaps:8,previousCatalogSha256:COOP_FIXES_PARENT,changedMaps},null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({out,changedMaps}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{main(process.argv.slice(2));}catch(e){console.error(e.stack);process.exitCode=1;}}
