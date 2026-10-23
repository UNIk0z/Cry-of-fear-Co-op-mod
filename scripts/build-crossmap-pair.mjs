import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeBsp,sha256,uniqueValue as value} from './bsp.mjs';
import {entitySpans} from './build-door-experiment.mjs';
import {buildStoryCandidate} from './build-story-candidate.mjs';
import {worldHull,sampleSpawn} from './collision.mjs';
import {prepareOutput} from './cof-inspect.mjs';
export const LINK_MAPS={c_start:'c_start_link_rc1',c_start2:'c_start2_link_rc1'};
const hashes={c_start:'72d1520baf7950ba056c6bc53310612c8582e83488a4df690199045e67815415',c_start2:'3933456e6c0e8a449ec17e7829c9d69a8880a1e414b54dd6c0cf2b361483157e'};
const centers=[[2407,-887,-728],[2440,-887,-728],[2407,-853,-728],[2440,-853,-728]];
const block=pairs=>'{\n'+pairs.map(([k,v])=>`"${k}" "${v}"\n`).join('')+'}';
export function buildCrossMap(bytes,sourceMap){
 if(!hashes[sourceMap]||sha256(bytes)!==hashes[sourceMap])throw Error('Cross-map source SHA mismatch');
 const original=decodeBsp(bytes),base=sourceMap==='c_start2'?buildStoryCandidate(bytes):{output:bytes,report:{schemaVersion:1,sourceSha256:sha256(bytes),edits:[],addedEntities:[]}};
 const parent=decodeBsp(base.output),expected=structuredClone(parent.entities),edits=structuredClone(base.report.edits),addedEntities=structuredClone(base.report.addedEntities),spans=entitySpans(original.entityText);
 const door=sourceMap==='c_start2'?19:335,zone=sourceMap==='c_start2'?17:333,zoneModel=sourceMap==='c_start2'?4:97,next=sourceMap==='c_start2'?'c_start':'c_start2';
 if(value(original.entities[door],'classname')!=='inter_door'||value(original.entities[zone],'classname')!=='trigger_changelevel'
  ||value(original.entities[zone],'map')!==next||value(original.entities[zone],'targetname')!=='haehecl'
  ||value(original.entities[door],'opensound')!=='doors/doormove1.wav'||['master','lockedby','targetname','spawnflags'].some(k=>value(original.entities[door],k)!==undefined))throw Error('Original unconditioned cross-map route changed');
 const boundsAt=original.lumps[14].offset+zoneModel*64,mins=[0,4,8].map(k=>bytes.readFloatLE(boundsAt+k)),maxs=[12,16,20].map(k=>bytes.readFloatLE(boundsAt+k));
 if(value(original.entities[zone],'model')!==`*${zoneModel}`||mins[0]!== (sourceMap==='c_start2'?2207:2206)||JSON.stringify(maxs.map((v,i)=>v-mins[i]))!==JSON.stringify([86,73,122]))throw Error('Original gathering brush changed');
 const translation=[170,0,0],translatedMins=mins.map((v,i)=>v+translation[i]),translatedMaxs=maxs.map((v,i)=>v+translation[i]),hull=worldHull(bytes);
 for(let i=0;i<centers.length;i++){
  const p=centers[i];if(!sampleSpawn(hull,p).staticCandidate||p.some((v,k)=>v-[16,16,36][k]<translatedMins[k]||v+[16,16,36][k]>translatedMaxs[k]))throw Error('Cross-map entry does not fit static gathering area');
  for(let j=0;j<i;j++)if(Math.abs(p[0]-centers[j][0])<32&&Math.abs(p[1]-centers[j][1])<32&&Math.abs(p[2]-centers[j][2])<72)throw Error('Cross-map spawns overlap');
 }
 const change=(index,pairs,purpose)=>{expected[index].pairs=pairs;edits.push({...spans[index],entity:index,to:block(pairs),purpose});};
 const nativeDoor=original.entities[door].pairs.filter(([k])=>['model','angles','renderamt','rendermode','rendercolor'].includes(k));
 nativeDoor.push(['message',LINK_MAPS[next]],['noise',value(original.entities[door],'opensound')],['target','haehecl'],['fuser1','1']);
 const music=value(original.entities[door],'music');if(music)nativeDoor.push(['music',music]);nativeDoor.push(['classname','inter_door_coop_changelevel']);
 change(door,nativeDoor,'Use actual native co-op group exit with original brush and opening sound');
 change(zone,[['model',`*${zoneModel}`],['origin',translation.join(' ')],['targetname','haehecl'],['rendermode','2'],['rendercolor','0 0 0'],['classname','trigger_coop_changelevel']],
  'Native group-readiness area; original brush translated 170 units onto accessible side of existing door');
 for(let i=0;i<4;i++){
  const classname=`cof_coop_spawn${i+1}`,pairs=[['origin',centers[i].join(' ')],['angles','0 270 0'],['classname',classname]];
  const found=addedEntities.filter(e=>value(e,'classname')===classname);
  if(sourceMap==='c_start2'){
   if(found.length!==1)throw Error('Expected exactly one parent native spawn per slot');found[0].pairs=pairs;expected[found[0].index].pairs=pairs;
  }else{if(parent.entities.some(e=>value(e,'classname')===classname))throw Error('Unexpected original native spawn');const e={index:expected.length,pairs};addedEntities.push(e);expected.push(e);}
 }
 edits.sort((a,b)=>b.start-a.start);if(new Set(edits.map(e=>e.entity)).size!==edits.length)throw Error('Duplicate original edits');
 let text=original.entityText;for(const e of edits)text=text.slice(0,e.start)+e.to+text.slice(e.end);
 const appendText='\n'+addedEntities.map(e=>block(e.pairs)+'\n').join(''),payload=Buffer.from(text+appendText+'\0','latin1'),offset=Math.ceil(bytes.length/4)*4,output=Buffer.alloc(offset+payload.length);
 bytes.copy(output);payload.copy(output,offset);output.writeInt32LE(offset,4);output.writeInt32LE(payload.length,8);const rebuilt=decodeBsp(output);
 if(JSON.stringify(rebuilt.entities.map(e=>e.pairs))!==JSON.stringify(expected.map(e=>e.pairs))||!output.subarray(12,bytes.length).equals(bytes.subarray(12))
  ||JSON.stringify(rebuilt.lumps.slice(1))!==JSON.stringify(original.lumps.slice(1)))throw Error('Cross-map preservation failed');
 return{output,report:{...base.report,map:LINK_MAPS[sourceMap],sourceMap,sourceSha256:sha256(bytes),outputSha256:sha256(output),fileBytes:output.length,entities:rebuilt.entities.length,
  status:'IMPLEMENTED_AWAITING_GAMEPLAY_VERIFICATION',edits,appendText,addedEntities,crossMap:{door,zone,next:LINK_MAPS[next],nativeDoorClass:'inter_door_coop_changelevel',nativeZoneClass:'trigger_coop_changelevel',translation,translatedMins,translatedMaxs,spawnCenters:centers},
  limits:'Two-map portal/overflow experiment only. c_start original same-map doors remain incompatible; do not use them in this portal test. Native readiness, fade, asset lookup, state transfer and journal/inventory retention require gameplay proof. No disconnected-player recovery. Other campaign exits retain stock routing.'}};
}
export function main(args){
 if(args.length!==2)throw Error('Usage: build-crossmap-pair.mjs ORIGINAL_MAPS_DIRECTORY NEW_WORK_DIRECTORY');
 const [source,dest]=args,out=prepareOutput(dest,[source]),results=[];
 for(const name of ['c_start','c_start2']){const r=buildCrossMap(fs.readFileSync(path.join(source,name+'.bsp')),name);fs.writeFileSync(path.join(out,r.report.map+'.bsp'),r.output,{flag:'wx'});fs.writeFileSync(path.join(out,r.report.map+'.json'),JSON.stringify(r.report,null,2)+'\n',{flag:'wx'});results.push({map:r.report.map,sha256:r.report.outputSha256,next:r.report.crossMap.next});}
 console.log(JSON.stringify(results));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{main(process.argv.slice(2));}catch(e){console.error(e.message);process.exitCode=1;}}
