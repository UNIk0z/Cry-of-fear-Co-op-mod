import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeBsp,sha256,uniqueValue as value} from './bsp.mjs';
import {convertStoryDoors} from './convert-story-doors.mjs';
import {worldHull,sampleSpawn} from './collision.mjs';
import {buildSpawnExperiment} from './append-spawns.mjs';
import {prepareOutput} from './cof-inspect.mjs';
const block=pairs=>'{\n'+pairs.map(([k,v])=>`"${k}" "${v}"\n`).join('')+'}';
const xyz=s=>typeof s==='string'&&s.split(/\s+/).length===3?s.split(/\s+/).map(Number):null;
export function chooseSpawns(bytes){
 const bsp=decodeBsp(bytes),starts=bsp.entities.filter(e=>value(e,'classname')==='info_player_start');
 if(starts.length!==1)throw Error('Require exactly one original story start; multiple checkpoint origins need a manual plan');
 const origin=xyz(value(starts[0],'origin')),angles=xyz(value(starts[0],'angles')??'0 0 0');
 if(!origin?.every(Number.isFinite)||!angles?.every(Number.isFinite))throw Error('Invalid original start');
 const hull=worldHull(bytes),selected=[];
 for(const radius of [0,48,96])for(const delta of radius?[[radius,0],[-radius,0],[0,radius],[0,-radius],[radius,radius],[-radius,radius],[radius,-radius],[-radius,-radius]]:[[0,0]]){
  const at=[origin[0]+delta[0],origin[1]+delta[1],origin[2]];
  if(sampleSpawn(hull,at).staticCandidate&&!selected.some(s=>Math.abs(at[0]-s.origin[0])<32&&Math.abs(at[1]-s.origin[1])<32&&Math.abs(at[2]-s.origin[2])<72))selected.push({classname:`cof_coop_spawn${selected.length+1}`,origin:at,angles});
  if(selected.length===4)return selected;
 }
 throw Error('No four non-overlapping static spawn candidates within 96 units of the original start');
}
export function apartmentResources(bytes){
 const bsp=decodeBsp(bytes),hull=worldHull(bytes),existing=bsp.entities.filter(e=>/^(weapon_|ammo_|item_)/.test(value(e,'classname')??''))
  .map(e=>xyz(value(e,'origin'))).filter(p=>p?.every(Number.isFinite)),added=[],records=[];
 for(const [index,classname,at] of [[347,'ammo_glock','601 242 -40'],[482,'weapon_syringe','1120 1200 141']]){
  const source=bsp.entities[index];
  if(value(source,'classname')!==classname||value(source,'origin')!==at||value(source,'frags')!=='-1'
    ||source.pairs.some(([k])=>!['classname','origin','frags','angles','rendercolor'].includes(k)))throw Error('Selected apartment resource changed');
  const origin=xyz(at),positions=[];
  placement: for(const radius of [48,96])for(const [dx,dy] of [[radius,0],[-radius,0],[0,radius],[0,-radius],[radius,radius],[-radius,radius],[radius,-radius],[-radius,-radius]]){
   const candidate=[origin[0]+dx,origin[1]+dy,origin[2]];
   if(!sampleSpawn(hull,[candidate[0],candidate[1],candidate[2]+36]).staticCandidate
     ||existing.some(p=>Math.abs(p[0]-candidate[0])<32&&Math.abs(p[1]-candidate[1])<32&&Math.abs(p[2]-candidate[2])<32))continue;
   existing.push(candidate);positions.push(candidate);added.push({pairs:source.pairs.map(([k,v])=>[k,k==='origin'?candidate.join(' '):v])});
   if(positions.length===3)break placement;
  }
  if(positions.length!==3)throw Error('No three separated static resource placements');
  records.push({original:index,classname,originalOrigin:origin,extraOrigins:positions,totalInstances:4,policy:'Physical fallback, native consumption; no per-player ownership or anti-hoarding'});
 }
 return{added,records};
}
export function extendDoorCandidate(bytes,conversion,{resources=false}={}){
 const spawns=chooseSpawns(bytes),before=decodeBsp(conversion.output);
 // Reuse existing static validation, including native slots and player overlap.
 buildSpawnExperiment(conversion.output,{schemaVersion:1,operation:'append-native-coop-spawns',status:'EXPERIMENTAL_NOT_RUNTIME_TESTED',sourceSha256:sha256(conversion.output),spawns});
 const resourcePlan=resources?apartmentResources(bytes):{added:[],records:[]};
 const additions=[...spawns.map(s=>({pairs:[['origin',s.origin.join(' ')],['angles',s.angles.join(' ')],['classname',s.classname]]})),...resourcePlan.added];
 const appendText=conversion.report.appendText+additions.map(e=>block(e.pairs)+'\n').join('');
 const original=decodeBsp(bytes);let text=original.entityText;for(const edit of conversion.report.edits)text=text.slice(0,edit.start)+edit.to+text.slice(edit.end);
 const payload=Buffer.from(text+appendText+'\0','latin1'),offset=Math.ceil(bytes.length/4)*4,output=Buffer.alloc(offset+payload.length);
 bytes.copy(output);payload.copy(output,offset);output.writeInt32LE(offset,4);output.writeInt32LE(payload.length,8);const after=decodeBsp(output);
 if(!output.subarray(12,bytes.length).equals(bytes.subarray(12))||JSON.stringify(after.lumps.slice(1))!==JSON.stringify(original.lumps.slice(1))
  ||JSON.stringify(after.entities.map(e=>e.pairs))!==JSON.stringify([...before.entities,...additions].map(e=>e.pairs)))throw Error('Batch preservation failed');
 return{output,report:{...conversion.report,outputSha256:sha256(output),fileBytes:output.length,entities:after.entities.length,
  appendText,addedEntities:[...conversion.report.addedEntities,...additions.map((e,i)=>({index:before.entities.length+i,pairs:e.pairs}))],spawns,resources:resourcePlan.records,
  status:'IMPLEMENTED_AWAITING_GAMEPLAY_VERIFICATION',limits:'Ordinary doors and four static spawn candidates only. Original cross-map routing, named/scripted doors, notes, cutscenes, enemies and checkpoint semantics retained and unverified. Resource fallback in c_apartment1 only; extras can be hoarded. Static clearance excludes dynamic entities.'}};
}
export function main(args){
 if(args.length<3||args.length>4)throw Error('Usage: build-door-batch.mjs CAMPAIGN_AUDIT.json MAPS_DIRECTORY NEW_WORK_DIRECTORY [ONE_SOURCE_MAP]');
 const [auditFile,source,destination]=args,audit=JSON.parse(fs.readFileSync(auditFile,'utf8')),out=prepareOutput(destination,[source]),results=[];
 const selected=audit.maps.filter(m=>audit.reachableFromIntro.includes(m.map)&&m.map!=='c_start2'&&m.doors.some(d=>d.eligible)&&(!args[3]||m.map===args[3]));
 if(!selected.length)throw Error('No audited ordinary-door candidates selected');
 for(const map of selected){
  const bytes=fs.readFileSync(path.join(source,map.map+'.bsp'));if(sha256(bytes)!==map.sourceSha256)throw Error('Installed source changed: '+map.map);
  const alias=map.map+'_story_rc1',doors=convertStoryDoors(bytes,{sourceMap:map.map,map:alias});
  try{
   const r=extendDoorCandidate(bytes,doors,{resources:map.map==='c_apartment1'});
   fs.writeFileSync(path.join(out,alias+'.bsp'),r.output,{flag:'wx'});fs.writeFileSync(path.join(out,alias+'.json'),JSON.stringify(r.report,null,2)+'\n',{flag:'wx'});
   results.push({sourceMap:map.map,map:alias,sourceSha256:map.sourceSha256,outputSha256:r.report.outputSha256,doors:r.report.convertedDoorIds.length,spawns:4,resources:r.report.resources,status:r.report.status});
  }catch(e){results.push({sourceMap:map.map,map:alias,status:'BLOCKED_SPAWN_OR_RESOURCE_PLAN',reason:e.message,ordinaryDoorsAnalyzed:doors.report.convertedDoorIds.length});}
 }
 fs.writeFileSync(path.join(out,'batch-report.json'),JSON.stringify({schemaVersion:1,results,connectedCampaign:false,limits:'No cross-map alias rewriting; changing levels follows original map names. Successful builds are local compatibility candidates, not a complete campaign.'},null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({built:results.filter(r=>r.spawns===4).length,blocked:results.filter(r=>r.reason).length,doors:results.filter(r=>r.spawns===4).reduce((n,r)=>n+r.doors,0),out}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{main(process.argv.slice(2));}catch(e){console.error(e.message);process.exitCode=1;}}
