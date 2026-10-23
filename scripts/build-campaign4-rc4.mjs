import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeBsp,sha256,uniqueValue as v} from './bsp.mjs';
import {assembleCampaign} from './build-connected-campaign.mjs';
import {prepareOutput} from './cof-inspect.mjs';
import {MAINTENANCE_MAPS,apartmentOfficeStage} from './build-maintenance-rc4.mjs';
import {apartmentKeyRoomStage} from './build-campaign-doors-rc4.mjs';
import {convertCampaignDoors,campaignKeys} from './campaign-doors-all.mjs';
import {addPrologueRain} from './coop-rain.mjs';

// coop-fixes-004 "campaign4": the RC4 overlay covers EVERY map. The delivered
// coop-fixes-003 catalog is the parent of the eight existing s4_ maps; every
// other RC2 alias gets an s4_ twin built from its exact RC2 parent (installed
// RC2 files are never overwritten). All exits stay inside the overlay.
export const CAMPAIGN4_PARENT='af5abe251223407c7a1503d77da63795968b3584ebadd06374cc735892f88232';
// coop-fixes-005 "campaign5": the same overlay rebuilt WITHOUT the prologue rain
// (user 2026-10-12: "remove the rain it looks awful"). Parent: the delivered
// coop-fixes-004 catalog; only the prologue map changes.
export const CAMPAIGN5_PARENT='5883c5b748d53b480bedce1a4d201f9586e151e5823c792c16edfe13f5acba48';
const cls=e=>v(e,'classname');
const OVERLAY=new Set(MAINTENANCE_MAPS.map(s=>s.parent));
// RC2 aliases whose role the existing overlay already plays.
export const RC2_REPLACED={cof_campaign_story2:'cof_campaign_story4',s2_start_e1:'s4_start',s2_nightmare_e0:'s4_nightmare',s2_nightmare_e1:'s4_nightmare'};
export function overlayAlias(name,rc2Aliases){
 if(RC2_REPLACED[name])return RC2_REPLACED[name];
 if(rc2Aliases.has(name)&&name.startsWith('s2_'))return 's4_'+name.slice(3);
 return null;
}
// Only cof_changelevel / inter_door_coop_changelevel message (and a plain
// trigger_changelevel map) name maps in RC2 output; exact alias equality.
export function retargetRoutes(entities,rc2Aliases,changes){
 let n=0;
 for(const e of entities){const c=cls(e);if(!['cof_changelevel','inter_door_coop_changelevel','trigger_changelevel'].includes(c))continue;
  for(const pair of e.pairs)if((pair[0]==='message'||pair[0]==='map')){const next=overlayAlias(pair[1],rc2Aliases);if(next&&next!==pair[1]){changes.push({kind:'campaign4 route',entity:e.index,key:pair[0],before:pair[1],after:next});pair[1]=next;n++;}}}
 for(const e of entities)for(const [k,val] of e.pairs)if(['message','map'].includes(k)&&/^s2_/.test(val)&&['cof_changelevel','inter_door_coop_changelevel','trigger_changelevel'].includes(cls(e)))throw Error('Unrouted RC2 exit '+val);
 return n;
}
const APARTMENT_OWNED=new Set([193,228,229,713]);

export function campaignOverlayMap({source,parentBytes,parentReport,sourceMap,map,rc2Aliases,keys}){
 const entities=structuredClone(decodeBsp(parentBytes).entities),models=structuredClone(parentReport.modelClones??[]),changes=[];
 if(!assembleCampaign(source,entities,models).output.equals(parentBytes))throw Error('RC2 parent reconstruction mismatch '+map);
 let skip=new Set();
 if(sourceMap==='c_apartment1'){apartmentOfficeStage({source,entities,changes});apartmentKeyRoomStage({source,entities,changes});skip=APARTMENT_OWNED;}
 const doorDecisions=convertCampaignDoors({source,sourceMap,entities,keys,skip,changes});
 const routes=retargetRoutes(entities,rc2Aliases,changes);
 const built=assembleCampaign(source,entities,models);
 const {edits,appendText}=built;
 return {output:built.output,report:{schemaVersion:2,map,sourceMap,sourceSha256:sha256(source),parent:parentReport.map,parentRelease:'rc2',parentSha256:sha256(parentBytes),campaign4:true,outputSha256:sha256(built.output),fileBytes:built.output.length,entities:built.entities,edits,appendText,modelClones:models,routes,doorDecisions,changes,status:'AWAITING GAMEPLAY VERIFICATION'}};
}

// The eight maps of the existing overlay: exits and (prologue) rain/reset.
export function campaignMaintenanceMap({source,parentBytes,parentReport,spec,rc2Aliases,keys,resetStates=[],rain=true}){
 const entities=structuredClone(decodeBsp(parentBytes).entities),models=structuredClone(parentReport.modelClones??[]),changes=structuredClone(parentReport.changes??[]);
 if(!assembleCampaign(source,entities,models).output.equals(parentBytes))throw Error('coop-fixes-003 parent reconstruction mismatch '+spec.map);
 const add=o=>{const e={index:entities.length,pairs:Object.entries(o).map(([k,val])=>[k,String(val)])};entities.push(e);return e;};
 if(spec.sourceMap==='c_intro'){
  if(rain)addPrologueRain({bytes:source,entities,models,changes});
  // A new campaign starts every converted door in its authored state. Native
  // env_global SF_GLOBAL_SET only creates missing records; set them explicitly.
  // multi_manager holds at most 16 targets: one manager per chunk of 15.
  for(let c=0;c<resetStates.length;c+=15){const chunk=resetStates.slice(c,c+15),manager='sc4_campaign_doors_reset_'+(c/15);
   chunk.forEach((s,k)=>add({classname:'env_global',targetname:manager+'_'+k,globalstate:s.state,triggermode:s.initial,initialstate:s.initial,spawnflags:1}));
   add({classname:'multi_manager',targetname:manager,spawnflags:1,...Object.fromEntries(chunk.map((s,k)=>[manager+'_'+k,0]))});
   add({classname:'trigger_auto',target:manager,delay:0.4,triggerstate:1,spawnflags:1});}
  changes.push({kind:'new campaign resets every converted door state',states:resetStates.length});
 }
 // The remaining native same-map doors of the overlay maps get the same
 // campaign pass; doors a hand-written stage owns or already edited stay as is.
 let doorDecisions=[];
 if(spec.sourceMap==='c_start'||spec.sourceMap==='c_apartment1')doorDecisions=convertCampaignDoors({source,sourceMap:spec.sourceMap,entities,keys,skip:spec.sourceMap==='c_start'?new Set([204,713]):APARTMENT_OWNED,changes});
 const routeChanges=[];retargetRoutes(entities,rc2Aliases,routeChanges);changes.push(...routeChanges);
 const built=assembleCampaign(source,entities,models);
 return {output:built.output,report:{...parentReport,...built,output:undefined,campaign4:true,campaign4ParentSha256:sha256(parentBytes),outputSha256:sha256(built.output),fileBytes:built.output.length,modelClones:models,doorDecisions,changes}};
}

// coop-fixes-013 "campaign13": the same build plus the key doors whose key a
// story script hands out (campaignKeys scripted). Every map is compared with
// the delivered coop-fixes-012 catalog; only the listed maps may differ.
export const CAMPAIGN13_PARENT='5bd3cc18b40ccd59a8796de675e9e90ed984eeebb75ca94422def8aec039f280';
export function main(args){
 const campaign13=args.length===10&&args[6]==='--campaign5'&&args[8]==='--campaign13';
 const campaign5=(args.length===8||campaign13)&&args[6]==='--campaign5';
 if(args.length!==6&&!campaign5)throw Error('Usage: build-campaign4-rc4.mjs ORIGINAL_MAPS RC2_BUILD RC2_PACKAGE COOP_FIXES3_BUILD COOP_FIXES3_PACKAGE NEW_BUILD [--campaign5 COOP_FIXES4_PACKAGE [--campaign13 COOP_FIXES12_PACKAGE]]');
 const [maps,rc2,rc2Package,parent,prior,destination]=args,rc2Catalog=JSON.parse(fs.readFileSync(path.join(rc2Package,'release.json'))),catalogBytes=fs.readFileSync(path.join(prior,'release.json'));
 if(sha256(catalogBytes)!==CAMPAIGN4_PARENT)throw Error('Changed campaign4 parent catalog');
 const catalog=JSON.parse(catalogBytes),rc2Report=JSON.parse(fs.readFileSync(path.join(rc2,'campaign-report.json'))),rc2Aliases=new Set(rc2Report.results.map(r=>r.map));
 const sources=[...new Set(rc2Report.results.map(r=>r.sourceMap))],sourceBytes=new Map(sources.map(s=>[s,fs.readFileSync(path.join(maps,s+'.bsp'))]));
 const keys=campaignKeys(maps,sources,{scripted:campaign13});
 const fresh=rc2Report.results.filter(r=>!OVERLAY.has(r.map)&&!RC2_REPLACED[r.map]).map(r=>{
  const parentBytes=fs.readFileSync(path.join(rc2,r.map+'.bsp')),parentReport=JSON.parse(fs.readFileSync(path.join(rc2,r.map+'.json')));
  const rc2Entry=rc2Catalog.maps.find(m=>m.map===r.map);
  if(!rc2Entry||sha256(parentBytes)!==r.outputSha256||rc2Entry.outputSha256!==r.outputSha256||parentReport.outputSha256!==r.outputSha256||sha256(sourceBytes.get(r.sourceMap))!==parentReport.sourceSha256)throw Error('Changed RC2 parent '+r.map);
  const map=overlayAlias(r.map,rc2Aliases);
  const built=campaignOverlayMap({source:sourceBytes.get(r.sourceMap),parentBytes,parentReport,sourceMap:r.sourceMap,map,rc2Aliases,keys});
  built.spec={map,sourceMap:r.sourceMap,sourceSha256:parentReport.sourceSha256,parent:r.map,parentRelease:'rc2',parentSha256:r.outputSha256,parentPlanSha256:rc2Entry.planSha256};
  built.report.parentPlanSha256=rc2Entry.planSha256;
  return built;
 });
 const existingMap=(spec,resetStates)=>{
  const parentBytes=fs.readFileSync(path.join(parent,spec.map+'.bsp')),parentReport=JSON.parse(fs.readFileSync(path.join(parent,spec.map+'.json'))),entry=catalog.maps.find(m=>m.map===spec.map);
  if(!entry||sha256(parentBytes)!==entry.outputSha256||parentReport.outputSha256!==entry.outputSha256||sha256(sourceBytes.get(spec.sourceMap)??fs.readFileSync(path.join(maps,spec.sourceMap+'.bsp')))!==spec.sourceSha256)throw Error('Changed coop-fixes-003 parent '+spec.map);
  return {spec,...campaignMaintenanceMap({source:sourceBytes.get(spec.sourceMap)??fs.readFileSync(path.join(maps,spec.sourceMap+'.bsp')),parentBytes,parentReport,spec,rc2Aliases,keys,resetStates,rain:!campaign5})};
 };
 // The prologue resets every converted door state, so it is built last.
 const later=MAINTENANCE_MAPS.filter(s=>s.sourceMap!=='c_intro').map(spec=>existingMap(spec));
 const states=new Map();
 for(const r of [...fresh.map(f=>f.report),...later.map(l=>l.report)])for(const c of r.changes){if(c.kind==='campaign gated door'&&c.state)states.set(c.state,c.initial);if(c.kind==='adapter-bridged native key door')states.set(c.state,0);}
 for(const [state,initial] of [['sc4.door.c_apartment1.office.enabled',1],['sc4.door.c_apartment1.office_return.enabled',0],['sc4.event.c_apartment1.office.pending',1],['sc4.door.c_apartment1.keyroom_exit.enabled',0],['sc4.event.c_apartment1.keyroom.pending',1],['sc4.door.c_apartment1.apartment.unlocked',0]])states.set(state,initial);
 const resetStates=[...states].map(([state,initial])=>({state,initial})).sort((a,b)=>a.state.localeCompare(b.state));
 const existing=MAINTENANCE_MAPS.map(spec=>spec.sourceMap==='c_intro'?existingMap(spec,resetStates):later.find(l=>l.spec===spec));
 // Every exit of every overlay map must reach a generated overlay map.
 const produced=new Set([...existing.map(e=>e.spec.map),...fresh.map(f=>f.report.map)]);
 for(const r of [...existing.map(e=>e.output),...fresh.map(f=>f.output)])for(const e of decodeBsp(r).entities)if(['cof_changelevel','inter_door_coop_changelevel'].includes(cls(e))&&v(e,'message')&&!produced.has(v(e,'message')))throw Error('Exit leaves the overlay: '+v(e,'message'));
 // campaign5: every map is compared with the delivered coop-fixes-004 catalog.
 let previous5=null;
 if(campaign5){const bytes=fs.readFileSync(path.join(args[7],'release.json'));if(sha256(bytes)!==CAMPAIGN5_PARENT)throw Error('Changed campaign5 parent catalog');previous5=JSON.parse(bytes);
  for(const r of [...existing.map(e=>e.report),...fresh.map(f=>f.report)]){const prior5=previous5.maps.find(m=>m.map===r.map);if(!prior5)throw Error('campaign5 map missing from coop-fixes-004 '+r.map);r.campaign5=true;r.campaign5ParentSha256=prior5.outputSha256;}
  if(previous5.maps.length!==existing.length+fresh.length)throw Error('campaign5 map count differs from coop-fixes-004');}
 let changed13=null;
 if(campaign13){const bytes=fs.readFileSync(path.join(args[9],'release.json'));if(sha256(bytes)!==CAMPAIGN13_PARENT)throw Error('Changed campaign13 parent catalog');const previous13=JSON.parse(bytes);changed13=[];
  for(const r of [...existing.map(e=>e.report),...fresh.map(f=>f.report)]){const prior=previous13.maps.find(m=>m.map===r.map);if(!prior)throw Error('campaign13 map missing from coop-fixes-012 '+r.map);r.campaign13=true;r.campaign13ParentSha256=prior.outputSha256;if(prior.outputSha256!==r.outputSha256)changed13.push(r.map);}
  if(previous13.maps.length!==existing.length+fresh.length)throw Error('campaign13 map count differs from coop-fixes-012');}
 const out=prepareOutput(destination,[maps,rc2,rc2Package,parent,prior,...(campaign5?[args[7]]:[]),...(campaign13?[args[9]]:[])]);
 for(const {spec,output,report} of existing){fs.writeFileSync(path.join(out,spec.map+'.bsp'),output,{flag:'wx'});fs.writeFileSync(path.join(out,spec.map+'.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});}
 for(const {output,report} of fresh){fs.writeFileSync(path.join(out,report.map+'.bsp'),output,{flag:'wx'});fs.writeFileSync(path.join(out,report.map+'.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});}
 const decisions={};for(const f of fresh)for(const d of f.report.doorDecisions)decisions[d.status]=(decisions[d.status]??0)+1;
 const summary={schemaVersion:2,maintenance:true,integration:true,coopFixes:true,coopFixes3:true,campaign4:true,...(campaign5?{campaign5:true,campaign5PreviousCatalogSha256:CAMPAIGN5_PARENT,campaign5ChangedMaps:[...existing.map(e=>e.report),...fresh.map(f=>f.report)].filter(r=>r.campaign5ParentSha256!==r.outputSha256).map(r=>r.map),prologueRain:false}:{}),...(campaign13?{campaign13:true,campaign13PreviousCatalogSha256:CAMPAIGN13_PARENT,campaign13ChangedMaps:changed13,scriptedKeys:true}:{}),convertedMaps:existing.length+fresh.length,previousCatalogSha256:CAMPAIGN4_PARENT,changedMaps:existing.filter(e=>e.report.campaign4ParentSha256!==e.report.outputSha256).map(e=>e.spec.map),campaignMaps:fresh.map(f=>f.spec),resetStates:resetStates.length,doorDecisionsPerAlias:decisions};
 fs.writeFileSync(path.join(out,'state-report.json'),JSON.stringify(summary,null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({...summary,campaignMaps:summary.campaignMaps.length}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{main(process.argv.slice(2));}catch(e){console.error(e.stack);process.exitCode=1;}}
