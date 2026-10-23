import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeBsp,sha256,uniqueValue} from './bsp.mjs';
import {worldHull,sampleSpawn} from './collision.mjs';
import {entitySpans} from './build-door-experiment.mjs';
import {createFadeDoorPlan,PRESENTATION_TIMING} from './build-door-presentation.mjs';
import {prepareOutput} from './cof-inspect.mjs';

const value=(e,k)=>uniqueValue(e,k);
const block=pairs=>'{\n'+pairs.map(([k,v])=>`"${k}" "${v}"\n`).join('')+'}';
const id=(map,index)=>`${map}:D${String(index).padStart(4,'0')}`;
const xyz=s=>typeof s==='string'&&s.trim().split(/\s+/).length===3&&s.trim().split(/\s+/).every(n=>Number.isFinite(Number(n)))?s.trim().split(/\s+/).map(Number):null;
const naming=/^[a-z][a-z0-9_]{0,30}$/;
const crossClasses=new Set(['trigger_changelevel','trigger_coop_changelevel','inter_door_coop_changelevel']);
const doorKeys=new Set(['model','renderamt','rendermode','rendercolor','target','classname',
  'musicfadein','musicfadeout','unlockedmsg','unlockedsnd','lockedmsg','lockedsnd',
  'opensound','closesound','doortype','targetname','lockedby','master','spawnflags']);
function conflicts(e){return [...new Set(e.pairs.map(([k])=>k))].filter(k=>e.pairs.filter(([p])=>p===k).some(([,v],i,a)=>v!==a[0][1]));}
function modelBounds(bytes,bsp,e){
  const model=value(e,'model');if(!/^\*\d+$/.test(model??''))return null;
  const n=Number(model.slice(1)),l=bsp.lumps[14];
  if(n===0||!l.length||l.length%64||n>=l.length/64)return null;
  const at=l.offset+n*64,mins=[0,4,8].map(i=>bytes.readFloatLE(at+i)),maxs=[12,16,20].map(i=>bytes.readFloatLE(at+i));
  if(![...mins,...maxs].every(Number.isFinite)||mins.some((v,i)=>v>maxs[i]))return null;
  return{mins,maxs,center:mins.map((v,i)=>(v+maxs[i])/2)};
}
function firedNames(e){
  const targets=e.pairs.filter(([k,v])=>['target','propertarget'].includes(k)&&v).map(([,v])=>v);
  if(value(e,'classname')==='multi_manager')for(const [key] of e.pairs){
    if(!['origin','angles','classname','targetname','spawnflags','wait','maxwait','mode','triggerstate','m_iszThreadName','m_iszLocusThread'].includes(key))targets.push(key.replace(/#.*$/,''));
  }
  return [...new Set(targets)];
}
function referrers(entities,name){
  if(!name)return[];
  return entities.flatMap((e,index)=>{
    const refs=e.pairs.filter(([k,v])=>k!=='targetname'&&v===name).map(([key])=>key);
    if(value(e,'classname')==='multi_manager')for(const [k] of e.pairs)if(k.replace(/#.*$/,'')===name)refs.push(`manager-key:${k}`);
    return refs.length?[{index,classname:value(e,'classname'),fields:refs}]:[];
  });
}

export function analyzeStoryDoors(bytes,{sourceMap}={}){
  if(!naming.test(sourceMap??''))throw Error('Invalid source map name');
  const bsp=decodeBsp(bytes),entities=bsp.entities;
  if(entities.some(e=>value(e,'classname')==='cof_teleport'&&/^cof_story_use\d+$/.test(value(e,'targetname')??'')))throw Error('Already converted/experimental map; require original BSP');
  const named=new Map();for(const [index,e] of entities.entries()){const n=value(e,'targetname');if(n)named.set(n,[...(named.get(n)??[]),index]);}
  const triggers=entities.flatMap((e,index)=>{const cls=value(e,'classname'),bounds=modelBounds(bytes,bsp,e);
    return bounds&&/^trigger_/.test(cls??'')?[{index,classname:cls,bounds}]:[];});
  function crossPath(starts){
    const queue=starts.map(index=>[index]),seen=new Set();
    while(queue.length){const p=queue.shift(),index=p.at(-1);if(seen.has(index))continue;seen.add(index);
      if(crossClasses.has(value(entities[index],'classname')))return p;
      for(const name of firedNames(entities[index]))for(const next of named.get(name)??[])queue.push([...p,next]);
    }return null;
  }
  const records=[];
  for(const [index,e] of entities.entries()){
    if(value(e,'classname')!=='inter_door'&&!e.pairs.some(([k,v])=>k==='classname'&&v==='inter_door'))continue;
    const bounds=modelBounds(bytes,bsp,e),target=value(e,'target'),matches=named.get(target)??[];
    const exitIndex=matches.length===1&&value(entities[matches[0]],'classname')==='inter_door_exit'?matches[0]:null;
    const exit=exitIndex===null?null:entities[exitIndex],feet=exit?xyz(value(exit,'origin')):null;
    const overlap=feet?triggers.filter(t=>{const p=[feet[0],feet[1],feet[2]+36];return t.bounds.mins.every((v,i)=>p[i]>=v&&p[i]<=t.bounds.maxs[i]);}).map(t=>t.index):[];
    const crossing=crossPath([...matches,...overlap]);
    const reasons=[];
    if(conflicts(e).length)reasons.push('conflicting repeated door keyvalues');
    if(value(e,'lockedby'))reasons.push(`lockedby=${value(e,'lockedby')}`);
    if(value(e,'master'))reasons.push(`master=${value(e,'master')}`);
    if(value(e,'targetname'))reasons.push('externally named door; preserve enable/remove/script semantics');
    if(Number(value(e,'spawnflags')??0)!==0)reasons.push(`special spawnflags=${value(e,'spawnflags')}`);
    if(!bounds)reasons.push('invalid/non-brush model');
    const unknown=e.pairs.filter(([k])=>!doorKeys.has(k)).map(([k])=>k);
    if(unknown.length)reasons.push(`unsupported fields: ${[...new Set(unknown)].join(',')}`);
    if(!['0',undefined,''].includes(value(e,'doortype')))reasons.push('unsupported doortype');
    if(['musicfadein','musicfadeout'].some(k=>!['2',undefined,''].includes(value(e,k))))reasons.push('non-reference music fade configuration');
    const opening=value(e,'opensound'),closing=value(e,'closesound');
    if(![opening,closing].every(s=>typeof s==='string'&&/^[a-z0-9_/.-]+\.wav$/i.test(s)&&!s.split('/').includes('..')))reasons.push('missing/unsupported opening or closing WAV reference');
    if(crossing)reasons.push(`cross-map activation path ${crossing.join(' -> ')}`);
    if(exitIndex===null)reasons.push('no unique inter_door_exit destination');
    if(exit&&(conflicts(exit).length||exit.pairs.some(([k])=>!['classname','targetname','origin','angles'].includes(k))))reasons.push('special/ambiguous exit fields');
    if(exit&&(!feet||!xyz(value(exit,'angles')??'0 0 0')))reasons.push('invalid destination origin/orientation');
    const generated=['use','present','open','close','black','reveal'].map(s=>`cof_story_${s}${index}`);
    if(generated.some(n=>named.has(n)||referrers(entities,n).length))reasons.push('generated-name collision');
    records.push({id:id(sourceMap,index),index,model:value(e,'model'),bounds,target,targetname:value(e,'targetname')??null,
      destination:exitIndex===null?null:{index:exitIndex,name:target,feet,angles:value(exit,'angles')??'0 0 0'},
      originalAudio:{opening:opening??null,closing:closing??null},
      conditions:{lockedby:value(e,'lockedby')??null,master:value(e,'master')??null,spawnflags:value(e,'spawnflags')??'0'},
      incoming:referrers(entities,value(e,'targetname')),destinationIncoming:referrers(entities,target),
      overlappingTriggers:overlap,crossMapPath:crossing,reasons,
      classification:crossing?'cross-map':exitIndex!==null?'same-map':value(e,'lockedby')?'locked-no-destination':'unresolved',
      eligible:reasons.length===0,reverseCandidates:[],runtimeStatus:'NOT TESTED'});
  }
  // Unsupported destinations are individual exceptions, not a reason to drop
  // safe unrelated doors. Static checks do not simulate player overlap.
  let hull;try{hull=worldHull(bytes);}catch(error){for(const r of records.filter(r=>r.eligible)){
    r.eligible=false;r.reasons.push(`unsupported collision validation: ${error.message}`);
  }}
  if(hull)for(const r of records.filter(r=>r.eligible)){
    try{r.standingSample=sampleSpawn(hull,[r.destination.feet[0],r.destination.feet[1],r.destination.feet[2]+36]);
      if(!r.standingSample.staticCandidate){r.eligible=false;r.reasons.push('destination fails static standing clearance/support');}
    }catch(error){r.eligible=false;r.reasons.push(`destination validation failed: ${error.message}`);}
  }
  // Never change an exit still used by retained doors or unexplained callers.
  let changed;do{changed=false;const selected=new Set(records.filter(r=>r.eligible).map(r=>r.index));
    for(const r of records.filter(r=>r.eligible))if(r.destinationIncoming.some(x=>!selected.has(x.index)||x.fields.some(k=>k!=='target'))){
      r.eligible=false;r.reasons.push('destination also referenced by retained/non-door logic');changed=true;
    }
  }while(changed);
  for(const r of records)if(r.destination&&r.bounds)r.reverseCandidates=records.filter(other=>other.index!==r.index&&other.destination&&other.bounds
    &&Math.hypot(r.destination.feet[0]-other.bounds.center[0],r.destination.feet[1]-other.bounds.center[1])<128
    &&Math.abs(r.destination.feet[2]-other.bounds.mins[2])<64
    &&Math.hypot(other.destination.feet[0]-r.bounds.center[0],other.destination.feet[1]-r.bounds.center[1])<128
    &&Math.abs(other.destination.feet[2]-r.bounds.mins[2])<64).map(x=>x.id);
  return{sourceMap,sourceSha256:sha256(bytes),originalEntityCount:entities.length,doors:records,
    counts:{all:records.length,sameMap:records.filter(r=>r.classification==='same-map').length,
      eligible:records.filter(r=>r.eligible).length,crossMap:records.filter(r=>r.classification==='cross-map').length,
      lockedNoDestination:records.filter(r=>r.classification==='locked-no-destination').length},
    mapNameReferences:entities.flatMap((e,index)=>e.pairs.filter(([,v])=>v.toLowerCase().includes(sourceMap.toLowerCase())).map(([key,text])=>({index,key,text}))),
    pairing:'Reverse candidates are geometric hints only; never manufacture a reverse door.'};
}

export function convertStoryDoors(bytes,{sourceMap,map}={}){
  if(!naming.test(map??'')||map===sourceMap)throw Error('Require a valid distinct output map name');
  const inventory=analyzeStoryDoors(bytes,{sourceMap}),original=decodeBsp(bytes);
  const candidates=inventory.doors.filter(r=>r.eligible);if(!candidates.length)throw Error('No safely convertible ordinary same-map doors');
  const expected=structuredClone(original.entities),spans=entitySpans(original.entityText),edits=[],helpers=[],presentation=[];
  const exits=new Set();
  for(const r of candidates){
    const route={door:r.index,helper:`cof_story_use${r.index}`,origin:r.bounds.center.join(' ')};
    const plan=createFadeDoorPlan(route,{destination:value(original.entities[r.destination.index],'origin'),
      opening:r.originalAudio.opening,closing:r.originalAudio.closing});
    const pairs=original.entities[r.index].pairs.filter(([k])=>['model','renderamt','rendermode','rendercolor'].includes(k));
    pairs.push(['target',plan.start],['spawnflags','1'],['wait',String(PRESENTATION_TIMING.cooldown)],
      ['sounds','0'],['delay','0'],['classname','func_button']);expected[r.index].pairs=pairs;
    edits.push({...spans[r.index],entity:r.index,to:block(pairs),purpose:'verified Use/fade/audio chain; original unlocked door metadata replaced'});
    const exitIndex=r.destination.index;if(!exits.has(exitIndex)){
      exits.add(exitIndex);for(const pair of expected[exitIndex].pairs)if(pair[0]==='classname')pair[1]='info_teleport_destination';
      edits.push({...spans[exitIndex],entity:exitIndex,to:block(expected[exitIndex].pairs),purpose:'destination classname only; feet/yaw/name/pair order unchanged; targeted record serialized'});
    }
    helpers.push({pairs:[['origin',route.origin],['targetname',route.helper],['target',r.target],['classname','cof_teleport']]});
    presentation.push(...plan.entities);r.converted=true;r.sequence=plan.events;
    r.intentionalChanges={doorClass:'inter_door -> func_button',destinationClass:'inter_door_exit -> info_teleport_destination',
      retainedBrushFields:pairs.filter(([k])=>['model','renderamt','rendermode','rendercolor'].includes(k)).map(([k])=>k),
      replacedOriginalFields:original.entities[r.index].pairs.filter(([k])=>!['model','renderamt','rendermode','rendercolor'].includes(k)).map(([k])=>k),
      audioReusedInHelpers:[r.originalAudio.opening,r.originalAudio.closing],probeEntitiesAdded:0};
  }
  const addedEntities=[...helpers,...presentation].map((e,i)=>({index:original.entities.length+i,pairs:e.pairs}));expected.push(...addedEntities);
  let text=original.entityText;edits.sort((a,b)=>b.start-a.start);
  for(const e of edits)text=text.slice(0,e.start)+e.to+text.slice(e.end);
  const appendText='\n'+addedEntities.map(e=>block(e.pairs)+'\n').join('');
  const entityBytes=Buffer.from(text+appendText+'\0','latin1'),offset=Math.ceil(bytes.length/4)*4;
  const output=Buffer.alloc(offset+entityBytes.length);bytes.copy(output);entityBytes.copy(output,offset);
  output.writeInt32LE(offset,4);output.writeInt32LE(entityBytes.length,8);const next=decodeBsp(output);
  if(JSON.stringify(next.entities.map(e=>e.pairs))!==JSON.stringify(expected.map(e=>e.pairs))
    ||!output.subarray(12,bytes.length).equals(bytes.subarray(12))
    ||JSON.stringify(next.lumps.slice(1))!==JSON.stringify(original.lumps.slice(1)))throw Error('BSP preservation failure');
  for(const e of addedEntities){const name=value(e,'targetname');if(!name||next.entities.filter(x=>value(x,'targetname')===name).length!==1)throw Error('Generated targetname is not unique');}
  for(const r of candidates)for(const [name] of r.sequence)if(next.entities.filter(e=>value(e,'targetname')===name).length!==1)throw Error('Sequence reference not unique');
  if(addedEntities.some(e=>value(e,'classname')==='game_text'||e.pairs.some(([k,v])=>k==='message'&&/^USE\d+ ACTIVATED$/.test(v))))throw Error('Diagnostic probe leaked');
  return{output,report:{schemaVersion:1,status:'STRUCTURALLY_VALIDATED_NOT_GAMEPLAY_TESTED',map,sourceMap,
    sourceSha256:inventory.sourceSha256,outputSha256:sha256(output),fileBytes:output.length,entities:next.entities.length,
    inventory,timing:PRESENTATION_TIMING,edits,appendText,addedEntities,convertedDoorIds:candidates.map(r=>r.id),
    retainedDoorIds:inventory.doors.filter(r=>!r.eligible).map(r=>r.id),modifiedOriginalEntities:edits.map(e=>e.entity).sort((a,b)=>a-b),
    limits:'Conservative ordinary unlocked pattern only. Named/gated/key/special doors retained. Static hull excludes dynamic/player overlap. Shared 2.5s panel cooldown; positional audio. Renamed-map hardcoded progression and full-map gameplay unverified.'}};
}
export function main(args){
  if(args.length!==3)throw Error('Usage: convert-story-doors.mjs ORIGINAL.bsp NEW_MAP_NAME NEW_WORK_DIRECTORY');
  const [source,map,destination]=args,sourceMap=path.basename(source,path.extname(source));
  if(path.extname(source).toLowerCase()!=='.bsp')throw Error('Require BSP file');
  const result=convertStoryDoors(fs.readFileSync(source),{sourceMap,map});
  const directory=prepareOutput(destination,[path.dirname(source)]);
  fs.writeFileSync(path.join(directory,map+'.bsp'),result.output,{flag:'wx'});
  fs.writeFileSync(path.join(directory,'conversion-report.json'),JSON.stringify(result.report,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({map,counts:result.report.inventory.counts,converted:result.report.convertedDoorIds,retained:result.report.retainedDoorIds,sha256:result.report.outputSha256}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{main(process.argv.slice(2));}catch(error){console.error(`ERROR: ${error.message}`);process.exitCode=1;}
}
