import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeBsp,sha256,uniqueValue as v} from './bsp.mjs';
import {assembleCampaign} from './build-connected-campaign.mjs';
import {prepareOutput} from './cof-inspect.mjs';
import {MAINTENANCE_MAPS} from './build-maintenance-rc4.mjs';
// Exact delivered coop-fixes-002 catalog; its maps are coop-fixes-maps-001.
export const COOP_FIXES3_PARENT='4f87e5f05210c93ef8d05b405a554eec8e9b0b612d02b44316461b0a2ecd847c';
const cls=e=>v(e,'classname');
export function coopFixes3Map(source,parent,report){
 const original=decodeBsp(source),entities=structuredClone(decodeBsp(parent).entities),changes=structuredClone(report.changes??[]);
 if(!assembleCampaign(source,entities,report.modelClones).output.equals(parent))throw Error('Parent reconstruction mismatch');
 if(report.sourceMap==='c_intro'){
  // User report (four builds running): no title train. Original c_intro: the
  // skittag/skittag22 func_tracktrains have startspeed 300, so native
  // TrackTrain::Find (100D48F8) starts them at map load; the intro manager
  // multiintroduct (#489) TOGGLES them at t=0, i.e. stops them at the station,
  // and multiintro1 (#115 "skittag#1"=10, #342 "skittag22#1"=10) starts them
  // again for the shot with the pass sound (tagpassljud=19) and headlights.
  // Maintenance set startspeed 0 (the lobby wait let them leave early) but kept
  // the t=0 toggle, which now STARTS them: they finish the route during the
  // title and are parked at the end of the line when their shot comes.
  // Remove only that t=0 toggle; startspeed 0 already holds them at the station.
  const timeline=entities[489],before=original.entities[489];
  if(cls(timeline)!=='multi_manager'||v(timeline,'targetname')!=='sc3_timeline_multiintroduct'||v(timeline,'skittag')!=='0'||v(timeline,'skittag22')!=='0'||v(before,'targetname')!=='multiintroduct')throw Error('Intro timeline changed');
  for(const i of [99,102,142,341])if(cls(entities[i])!=='func_tracktrain'||v(entities[i],'startspeed')!=='0'||v(original.entities[i],'startspeed')!=='300')throw Error('Title train hold changed');
  const restart=[[115,'skittag#1'],[342,'skittag22#1']];
  for(const [i,key] of restart)if(cls(entities[i])!=='multi_manager'||v(entities[i],'targetname')!=='multiintro1'||v(entities[i],key)!=='10')throw Error('Authored train start changed');
  timeline.pairs=timeline.pairs.filter(([key])=>key!=='skittag'&&key!=='skittag22');
  changes.push({kind:'title train held at the station until its authored start',entity:489,removed:['skittag=0','skittag22=0'],authoredStart:'multiintro1 +10s (#115, #342)',evidence:'original startspeed 300 + t=0 toggle = stop; startspeed 0 + t=0 toggle = early start',status:'AWAITING GAMEPLAY VERIFICATION'});
 }
 const built=assembleCampaign(source,entities,report.modelClones);
 return {...built,report:{...report,...built,output:undefined,coopFixes3:true,coopFixes3ParentSha256:sha256(parent),outputSha256:sha256(built.output),fileBytes:built.output.length,changes}};
}
export function main(args){
 if(args.length!==4)throw Error('Usage: build-coop-fixes3-rc4.mjs ORIGINAL_MAPS COOP_FIXES_BUILD COOP_FIXES2_PACKAGE NEW_BUILD');
 const [maps,parent,prior,destination]=args,catalogBytes=fs.readFileSync(path.join(prior,'release.json'));
 if(sha256(catalogBytes)!==COOP_FIXES3_PARENT)throw Error('Changed coop-fixes3 parent catalog');
 const catalog=JSON.parse(catalogBytes),prepared=MAINTENANCE_MAPS.map(spec=>{
  const before=fs.readFileSync(path.join(parent,spec.map+'.bsp')),source=fs.readFileSync(path.join(maps,spec.sourceMap+'.bsp')),report=JSON.parse(fs.readFileSync(path.join(parent,spec.map+'.json'))),entry=catalog.maps.find(m=>m.map===spec.map);
  if(sha256(source)!==spec.sourceSha256||!entry||sha256(before)!==entry.outputSha256||report.outputSha256!==entry.outputSha256)throw Error('Changed source/parent');
  return {spec,...coopFixes3Map(source,before,report)};
 });
 const out=prepareOutput(destination,[maps,parent,prior]);
 for(const {spec,output,report} of prepared){fs.writeFileSync(path.join(out,spec.map+'.bsp'),output,{flag:'wx'});fs.writeFileSync(path.join(out,spec.map+'.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});}
 const changedMaps=prepared.filter(p=>p.report.coopFixes3ParentSha256!==p.report.outputSha256).map(p=>p.spec.map);
 fs.writeFileSync(path.join(out,'state-report.json'),JSON.stringify({schemaVersion:2,maintenance:true,integration:true,coopFixes:true,coopFixes3:true,convertedMaps:8,previousCatalogSha256:COOP_FIXES3_PARENT,changedMaps},null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({out,changedMaps}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{main(process.argv.slice(2));}catch(e){console.error(e.stack);process.exitCode=1;}}
