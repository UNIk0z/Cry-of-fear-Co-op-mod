import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeBsp,sha256,uniqueValue as value} from './bsp.mjs';
import {entitySpans} from './build-door-experiment.mjs';
import {buildCStart2Full,VERIFIED_V8_SHA} from './build-c-start2-full.mjs';
import {createFadeDoorPlan,PRESENTATION_TIMING} from './build-door-presentation.mjs';
import {worldHull,sampleSpawn} from './collision.mjs';
import {prepareOutput} from './cof-inspect.mjs';

export const CAFE_MAP='c_start2_coop_cafe';
const block=pairs=>'{\n'+pairs.map(([k,v])=>`"${k}" "${v}"\n`).join('')+'}';
const entity=pairs=>({pairs});
const global=(origin,name,state,mode,initial)=>entity([['origin',origin],['targetname',name],
  ['globalstate',state],['triggermode',String(mode)],['initialstate',String(initial)],
  ['spawnflags','1'],['classname','env_global']]);
const master=(origin,name,state)=>entity([['origin',origin],['targetname',name],
  ['globalstate',state],['classname','multisource']]);
const manager=(origin,name,gate,events)=>entity([['origin',origin],['targetname',name],
  ['spawnflags','1'],...(gate?[['master',gate]]:[]),...events.map(([n,t])=>[n,String(t)]),['classname','multi_manager']]);

// Deliberately map-specific: the general converter must continue rejecting
// unrecognized named/disabled doors. Source hash and exact dependency guards
// prevent this adapter from silently unlocking a different story configuration.
export function buildCafeDoors(bytes){
  const base=buildCStart2Full(bytes),original=decodeBsp(bytes),parent=decodeBsp(base.output);
  const expected=structuredClone(parent.entities),spans=entitySpans(original.entityText);
  const edits=structuredClone(base.report.edits),added=[],routes=[],hull=worldHull(bytes);
  const change=(i,pairs,purpose)=>{expected[i].pairs=pairs;edits.push({...spans[i],entity:i,to:block(pairs),purpose});};
  const requireValue=(i,k,v)=>{if(value(original.entities[i],k)!==v)throw Error(`Cafe dependency changed: ${i}.${k}`);};
  requireValue(413,'target','cafedoors2en');requireValue(414,'classname','inter_door_disable');
  requireValue(414,'target','cafedoors2');requireValue(414,'frags','1');
  requireValue(339,'killcafedoors','0');requireValue(339,'killcafedoors2','0');
  const enableState=`${CAFE_MAP}_enabled206`,enableGate='cof_cafe_enabled206';
  const resetEvents=[];
  for(const r of [{door:204,exit:205,kill:345,name:'cafedoors',origin:'1008.5 1985.5 -547'},
    {door:206,exit:203,kill:412,name:'cafedoors2',origin:'1031.5 1985.5 -547'}]){
    requireValue(r.door,'classname','inter_door');requireValue(r.door,'targetname',r.name);
    requireValue(r.door,'spawnflags',r.door===206?'4':undefined);
    requireValue(r.kill,'killtarget',r.name);requireValue(r.kill,'classname','trigger_relay');
    requireValue(r.exit,'classname','inter_door_exit');
    const target=value(original.entities[r.door],'target'),destination=value(original.entities[r.exit],'origin');
    requireValue(r.exit,'targetname',target);
    const feet=destination.split(' ').map(Number),standingSample=sampleSpawn(hull,[feet[0],feet[1],feet[2]+36]);
    if(!standingSample.staticCandidate)throw Error(`Cafe ${r.door} destination fails static clearance/support`);
    const helper=`cof_story_use${r.door}`,teleport=`cof_cafe_tele${r.door}`;
    const aliveState=`${CAFE_MAP}_alive${r.door}`,aliveGate=`cof_cafe_alive${r.door}`;
    const opening=value(original.entities[r.door],'opensound'),closing=value(original.entities[r.door],'closesound');
    if(opening!=='doors/doormove2.wav'||closing!=='doors/doorstop2.wav')throw Error('Cafe sounds changed');
    const plan=createFadeDoorPlan({...r,helper},{destination,opening,closing});
    // Preserve the original names: unmodified story killtargets remove the same
    // brush at the same event. Master checks do not replace the E activator.
    const pairs=original.entities[r.door].pairs.filter(([k])=>['model','targetname','renderamt','rendermode','rendercolor'].includes(k));
    pairs.push(['target',plan.start],['master',r.door===206?enableGate:aliveGate],
      ['spawnflags','1'],['wait',String(PRESENTATION_TIMING.cooldown)],['sounds','0'],['delay','0'],['classname','func_button']);
    change(r.door,pairs,'Cafe Use panel; original brush/name retained; shared story master');
    change(r.exit,original.entities[r.exit].pairs.map(([k,v])=>[k,k==='classname'?'info_teleport_destination':v]),'Cafe destination classname only');
    const start=plan.entities.find(e=>value(e,'classname')==='multi_manager');
    start.pairs.splice(start.pairs.length-1,0,['master',r.door===206?enableGate:aliveGate]);
    added.push(...plan.entities,
      // Recheck life at delayed relocation, so removal during a fade cancels the
      // move while the existing fade-in still clears the accepted actor's screen.
      manager(r.origin,helper,aliveGate,[[teleport,0]]),
      entity([['origin',r.origin],['targetname',teleport],['target',target],['classname','cof_teleport']]),
      master(r.origin,aliveGate,aliveState),
      global(r.origin,`cof_cafe_kill${r.door}`,aliveState,0,1),
      global(r.origin,`cof_cafe_reset${r.door}`,aliveState,1,1));
    const killPairs=structuredClone(original.entities[r.kill].pairs);
    if(killPairs.some(([k])=>k==='target'))throw Error('Kill relay already has a downstream target');
    killPairs.splice(killPairs.length-1,0,['target',`cof_cafe_kill${r.door}`]);
    change(r.kill,killPairs,'Original killtarget unchanged; disable delayed relocation after removal');
    resetEvents.push([`cof_cafe_reset${r.door}`,0]);
    routes.push({...r,target,destination,helper,teleport,aliveState,aliveGate,opening,closing,
      standingSample,sequence:plan.events,initiallyEnabled:r.door===204});
  }
  const origin=value(original.entities[414],'origin');
  change(414,global(origin,'cafedoors2en',enableState,1,0).pairs,'Original trigger_once name enables a shared state idempotently');
  added.push(master(origin,enableGate,enableState),global(origin,'cof_cafe_reset_disabled',enableState,0,0));
  resetEvents.push(['cof_cafe_reset_disabled',0]);
  // env_global initialstate alone does not reset an existing global table on a
  // second changelevel. Explicit load reset prevents a prior run unlocking 206.
  added.push(manager(origin,'cof_cafe_reset',undefined,resetEvents),
    entity([['origin',origin],['target','cof_cafe_reset'],['triggerstate','1'],['spawnflags','1'],['classname','trigger_auto']]));
  const addedEntities=[...base.report.addedEntities,...added.map((e,i)=>({index:parent.entities.length+i,pairs:e.pairs}))];
  expected.push(...addedEntities.slice(base.report.addedEntities.length));
  let text=original.entityText;edits.sort((a,b)=>b.start-a.start);
  if(new Set(edits.map(e=>e.entity)).size!==edits.length)throw Error('Duplicate edit');
  for(const e of edits)text=text.slice(0,e.start)+e.to+text.slice(e.end);
  const appendText='\n'+addedEntities.map(e=>block(e.pairs)+'\n').join('');
  const entityBytes=Buffer.from(text+appendText+'\0','latin1'),offset=Math.ceil(bytes.length/4)*4;
  const output=Buffer.alloc(offset+entityBytes.length);bytes.copy(output);entityBytes.copy(output,offset);
  output.writeInt32LE(offset,4);output.writeInt32LE(entityBytes.length,8);const next=decodeBsp(output);
  if(JSON.stringify(next.entities.map(e=>e.pairs))!==JSON.stringify(expected.map(e=>e.pairs))
    ||!output.subarray(12,bytes.length).equals(bytes.subarray(12))
    ||JSON.stringify(next.lumps.slice(1))!==JSON.stringify(original.lumps.slice(1)))throw Error('Cafe BSP preservation failure');
  for(const e of addedEntities){const name=value(e,'targetname');if(name&&next.entities.filter(x=>value(x,'targetname')===name).length!==1)throw Error(`Name collision: ${name}`);}
  return{output,report:{schemaVersion:1,status:'STRUCTURALLY_VALIDATED_NOT_GAMEPLAY_TESTED',map:CAFE_MAP,
    sourceSha256:base.report.sourceSha256,outputSha256:sha256(output),referenceSha256:VERIFIED_V8_SHA,
    fileBytes:output.length,entities:next.entities.length,edits,appendText,addedEntities,routes,timing:PRESENTATION_TIMING,
    modifiedOriginalEntities:edits.map(e=>e.entity).sort((a,b)=>a-b),
    convertedDoorIds:['c_start2:D0049','c_start2:D0050','c_start2:D0204','c_start2:D0206'],
    retainedDoorIds:['c_start2:D0006','c_start2:D0019','c_start2:D0227','c_start2:D0228'],
    scope:'Ordinary v9 pair unchanged; cafe doors adapted; notes, computer, story manager, enable trigger and cross-map routes retained.',
    limits:'Cafe masters/reset/queued removal require Steam gameplay verification. The life check adds a zero-delay threaded manager before cafe relocation; timing may differ by a frame. Original lock messages/music fades are not reproduced by the panel. Positional audio/shared cooldown and alias routing limits remain. Notes are not synchronized.'}};
}
export function main(args){
  if(args.length!==2||path.basename(args[0]).toLowerCase()!=='c_start2.bsp')throw Error('Usage: build-cafe-doors.mjs ORIGINAL_c_start2.bsp NEW_WORK_DIRECTORY');
  const result=buildCafeDoors(fs.readFileSync(args[0])),directory=prepareOutput(args[1],[path.dirname(args[0])]);
  fs.writeFileSync(path.join(directory,CAFE_MAP+'.bsp'),result.output,{flag:'wx'});
  fs.writeFileSync(path.join(directory,'conversion-report.json'),JSON.stringify(result.report,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({map:CAFE_MAP,sha256:result.report.outputSha256,bytes:result.report.fileBytes,entities:result.report.entities,modified:result.report.modifiedOriginalEntities}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{main(process.argv.slice(2));}catch(error){console.error(`ERROR: ${error.message}`);process.exitCode=1;}
}
