import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeBsp,sha256,uniqueValue} from './bsp.mjs';
import {buildUseSelector} from './build-use-selector.mjs';
import {DOOR_ROUTES} from './build-use-door-experiment.mjs';
import {prepareOutput} from './cof-inspect.mjs';

export const VERIFIED_V6_SHA='c4a310d5ff2ef72f8794044cbc38b9d3447f836b9a4ce07b02a92c8b245b1566';
// Approximation, not measured Steam inter_door timing. To tune, change these
// values and rebuild manifests/installers with new fixed output hashes.
export const PRESENTATION_TIMING=Object.freeze({audioCloseAt:1.20,fadeOut:0.60,
  fadeHold:0.90,teleportAt:1.20,closeAt:1.25,fadeInAt:1.35,fadeIn:0.60,cooldown:2.50});
const block=pairs=>'{\n'+pairs.map(([k,v])=>`"${k}" "${v}"\n`).join('')+'}';
function set(e,key,value){const pair=e.pairs.find(([k])=>k===key);if(!pair)throw Error(`Missing ${key}`);pair[1]=String(value);}
const ambient=(origin,name,sample)=>({pairs:[['origin',origin],['targetname',name],
  ['message',sample],['health','10'],['pitch','100'],['pitchstart','100'],
  ['channel','6'],['spawnflags','50'],['classname','ambient_generic']]});
const manager=(origin,name,events)=>({pairs:[['origin',origin],['targetname',name],
  ['spawnflags','1'],...events.map(([target,time])=>[target,String(time)]),['classname','multi_manager']]});
const fade=(origin,name,flags,duration,hold)=>({pairs:[['origin',origin],['targetname',name],
  ['spawnflags',String(flags)],['duration',String(duration)],['holdtime',String(hold)],
  ['rendercolor','0 0 0'],['renderamt','255'],['classname','env_fade']]});

// One shared factory for the user-verified v8 sequence and conservative conversion.
// This extraction must leave the original v8 BSP byte-identical (regression SHA).
export function createFadeDoorPlan(r,{destination,opening,closing}){
  const t=PRESENTATION_TIMING,start=`cof_story_present${r.door}`;
  const openName=`cof_story_open${r.door}`,closeName=`cof_story_close${r.door}`;
  const out=`cof_story_black${r.door}`,back=`cof_story_reveal${r.door}`;
  const events=[[openName,0],[out,0],[r.helper,t.teleportAt],[closeName,t.closeAt],[back,t.fadeInAt]];
  return{start,events,entities:[ambient(r.origin,openName,opening),ambient(destination,closeName,closing),
    fade(r.origin,out,4,t.fadeOut,t.fadeHold),fade(destination,back,5,t.fadeIn,0),manager(r.origin,start,events)]};
}

export function buildDoorPresentation(bytes,variant){
  if(!['audio','fade'].includes(variant))throw Error('Require audio or fade variant');
  const base=buildUseSelector(bytes),original=decodeBsp(bytes),parent=decodeBsp(base.output);
  if(sha256(base.output)!==VERIFIED_V6_SHA)throw Error('Working v6 baseline changed');
  const expected=structuredClone(parent.entities),added=[],routes=[];
  const t=PRESENTATION_TIMING;
  if(!(t.fadeOut<t.teleportAt&&t.teleportAt<t.closeAt&&t.closeAt<t.fadeInAt
    &&t.fadeInAt<t.fadeOut+t.fadeHold&&t.fadeInAt+t.fadeIn<t.cooldown))throw Error('Unsafe presentation timing');
  for(const r of DOOR_ROUTES){
    const sourceDoor=original.entities[r.door],destination=uniqueValue(expected[r.exit],'origin');
    const opening=uniqueValue(sourceDoor,'opensound'),closing=uniqueValue(sourceDoor,'closesound');
    if(opening!=='doors/doormove1.wav'||closing!=='doors/doorstop8.wav')throw Error('Original sound fields changed');
    // Direct point helper and original destination records are NEVER edited.
    const closeName=`cof_story_close${r.door}`,openName=`cof_story_open${r.door}`;
    set(expected[r.door],'sounds','0'); // Replace the access beep with story audio.
    set(expected[r.door],'wait',t.cooldown); // Shared panel reset, not player control lock.
    if(variant==='audio'){
      // Existing point teleport executes directly first. Opening at the arrival
      // position follows it in target fan-out, avoiding a source sound lost to PAS.
      // Only closing audio is delayed; no delayed entity selects a player here.
      added.push(ambient(destination,r.helper,opening),ambient(destination,closeName,closing),
        manager(r.origin,r.helper,[[closeName,t.audioCloseAt]]));
      routes.push({...r,opening,closing,openingOrigin:destination,closingOrigin:destination,
        directTeleport:true,sequence:[[r.helper,0],[closeName,t.audioCloseAt]]});
    }else{
      const {start,events,entities}=createFadeDoorPlan(r,{destination,opening,closing});
      set(expected[r.door],'target',start);
      // HUD stays diagnostic; dispatch it at the new start, before full black.
      const marker=expected.find(e=>uniqueValue(e,'classname')==='game_text'&&uniqueValue(e,'targetname')===r.helper);
      if(!marker)throw Error('Working marker missing');set(marker,'targetname',start);
      added.push(...entities);
      routes.push({...r,start,opening,closing,openingOrigin:r.origin,closingOrigin:destination,
        directTeleport:false,sequence:events});
    }
  }
  for(const e of added){e.index=expected.length;expected.push(e);}
  // Reuse original replacement spans; unrelated original records stay verbatim.
  const edits=base.report.edits.map(e=>({...e,to:block(expected[e.entity].pairs)}));
  let text=original.entityText;
  for(const e of edits)text=text.slice(0,e.start)+e.to+text.slice(e.end);
  const addedEntities=expected.slice(original.entities.length).map((e,i)=>({index:original.entities.length+i,pairs:e.pairs}));
  const appendText='\n'+addedEntities.map(e=>block(e.pairs)+'\n').join('');
  const entityBytes=Buffer.from(text+appendText+'\0','latin1'),offset=Math.ceil(bytes.length/4)*4;
  const output=Buffer.alloc(offset+entityBytes.length);bytes.copy(output);entityBytes.copy(output,offset);
  output.writeInt32LE(offset,4);output.writeInt32LE(entityBytes.length,8);
  const next=decodeBsp(output);
  if(JSON.stringify(next.entities.map(e=>e.pairs))!==JSON.stringify(expected.map(e=>e.pairs))
    ||!output.subarray(12,bytes.length).equals(bytes.subarray(12))
    ||JSON.stringify(next.lumps.slice(1))!==JSON.stringify(original.lumps.slice(1)))throw Error('Preservation failure');
  for(const r of DOOR_ROUTES){
    const a=next.entities.filter(e=>uniqueValue(e,'classname')==='cof_teleport'&&uniqueValue(e,'targetname')===r.helper);
    const b=parent.entities.filter(e=>uniqueValue(e,'classname')==='cof_teleport'&&uniqueValue(e,'targetname')===r.helper);
    if(a.length!==1||JSON.stringify(a[0].pairs)!==JSON.stringify(b[0].pairs)
      ||JSON.stringify(next.entities[r.exit].pairs)!==JSON.stringify(parent.entities[r.exit].pairs))throw Error('Verified relocation changed');
  }
  return{output,report:{...base.report,map:`c_start2_door${variant}`,status:'EXPERIMENTAL_NOT_RUNTIME_TESTED',
    variant,baseOutputSha256:VERIFIED_V6_SHA,outputSha256:sha256(output),fileBytes:output.length,
    entities:next.entities.length,edits,appendText,addedEntities,routes,timing:t,
    activation:variant==='audio'?'V6 direct teleport unchanged; positional opening on arrival, threaded delayed closing audio.':'Threaded per-activation multi_manager -> activator-only finite fades and unchanged v6 point teleporter; delayed activator behavior requires Steam verification.',
    limitations:'Original Steam fade timing not exposed. Positional audio may be heard by nearby players; no private-audio claim. Shared 2.5s panel cooldown serializes same-panel presses; input remains enabled. Threading/activator fades and timing are SDK/reference-supported, not gameplay-verified. No permanent fade, player render change or original inter_door execution.'}};
}
export function main(args){
  if(args.length!==2||path.basename(args[0]).toLowerCase()!=='c_start2.bsp')throw Error('Usage: build-door-presentation.mjs ORIGINAL_c_start2.bsp NEW_WORK_DIRECTORY');
  const source=fs.readFileSync(args[0]);
  const results=['audio','fade'].map(v=>buildDoorPresentation(source,v));
  const directory=prepareOutput(args[1],[path.dirname(args[0])]);
  for(const r of results){fs.writeFileSync(path.join(directory,r.report.map+'.bsp'),r.output,{flag:'wx'});
    fs.writeFileSync(path.join(directory,r.report.map+'-report.json'),JSON.stringify(r.report,null,2)+'\n',{flag:'wx'});}
  console.log(JSON.stringify(results.map(({report:r})=>({map:r.map,sha256:r.outputSha256,bytes:r.fileBytes,entities:r.entities}))));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{main(process.argv.slice(2));}catch(error){console.error(`ERROR: ${error.message}`);process.exitCode=1;}
}
