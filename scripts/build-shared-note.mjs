import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeBsp,sha256,uniqueValue as value} from './bsp.mjs';
import {entitySpans} from './build-door-experiment.mjs';
import {buildCafeDoors} from './build-cafe-doors.mjs';
import {prepareOutput} from './cof-inspect.mjs';

export const NOTE_MAP='c_start2_coop_note';
export const CAFE_REFERENCE_SHA='451f150c84178e04a5ee589fdad28268576ac555b3cd15d5aa4f9865e1c4c974';
const block=pairs=>'{\n'+pairs.map(([k,v])=>`"${k}" "${v}"\n`).join('')+'}';
const entity=pairs=>({pairs});

// This adapter is restricted to the two credential papers and compiled proxy
// brush in c_start2. It is not an arbitrary journal/pickup conversion interface.
export function createCredentialNotePlan(bytes,parent,source,index){
  const usertype=value(source,'usertype')??'0';
  if(value(source,'classname')!=='cof_passwordnote'||![242,243].includes(index)||!['0','1'].includes(usertype))throw Error('Unsupported credential note');
  const origin=value(source,'origin'),angles=value(source,'angles'),prefix=`cof_note${index}`;
  const visual=entity([['origin',origin],['angles',angles],['model','models/items/generic_note.mdl'],
    ['targetname',`${prefix}_visual`],['spawnflags','2'],['classname','env_model']]);
  // Reuse the original computer's compact compiled brush; translate its bounds
  // onto the note instead of adding BSP geometry. Not Solid avoids new collision.
  const model=parent.lumps[14],p=model.offset+19*64;
  const mins=[0,4,8].map(k=>bytes.readFloatLE(p+k)),maxs=[12,16,20].map(k=>bytes.readFloatLE(p+k));
  if(JSON.stringify(mins)!==JSON.stringify([1292,1699,-555])||JSON.stringify(maxs)!==JSON.stringify([1316,1723,-527]))throw Error('Use proxy brush bounds changed');
  const center=maxs.map((v,k)=>(v+mins[k])/2),at=origin.split(' ').map(Number);at[2]+=8;
  const translation=at.map((v,k)=>v-center[k]).join(' ');
  const dispatch=`${prefix}_dispatch`,zone=`${prefix}_players`,start=`${prefix}_collect`;
  const added=[
    entity([['model','*19'],['origin',translation],['targetname',`${prefix}_button`],['target',start],
      ['spawnflags','129'],['wait','-1'],['sounds','0'],['delay','0'],['rendermode','1'],['renderamt','0'],['classname','func_button']]),
    entity([['origin',origin],['targetname',start],['spawnflags','1'],[zone,'0'],
      [`${prefix}_remove_visual`,'0.1'],[`${prefix}_remove_button`,'0.1'],[`${prefix}_remove_dispatch`,'0.1'],['classname','multi_manager']]),
    // Both branches dispatch identically: each native connected-player iteration
    // preserves that player as activator regardless of location inside/outside.
    entity([['model','*19'],['targetname',zone],['intarget',dispatch],['outtarget',dispatch],['classname','game_zone_player']]),
    entity([['origin',origin],['targetname',`${prefix}_remove_visual`],['killtarget',`${prefix}_visual`],['triggerstate','2'],['classname','trigger_relay']]),
    entity([['origin',origin],['targetname',`${prefix}_remove_button`],['killtarget',`${prefix}_button`],['triggerstate','2'],['classname','trigger_relay']]),
    entity([['origin',origin],['targetname',`${prefix}_remove_dispatch`],['killtarget',dispatch],['triggerstate','2'],['classname','trigger_relay']])];
  for(let slot=1;slot<=4;slot++){
    const grant=`${prefix}_grant${slot}`;
    // Four counters share one dispatcher intentionally. The Nth callback fires
    // ONLY limit N. Every player therefore gets a fresh native note instance,
    // rather than reusing the native note's already-created document cache.
    // Native first use initializes the recipient's document handle; the client
    // journal's persistent storage is not statically proven by that handle.
    added.push(entity([['origin',origin],['targetname',dispatch],['frags','0'],['health',String(slot)],
      ['spawnflags','1'],['target',grant],['classname','game_counter']]),
      entity([['origin','0 0 -3000'],['targetname',grant],['usertype',usertype],['effects','128'],
        ['rendermode','1'],['renderamt','0'],['classname','cof_passwordnote']]));
  }
  return{visual,added,origin,angles,dispatch,translation,center:at,size:maxs.map((v,k)=>v-mins[k]),usertype};
}

// V11 remains byte-identical: only the original username paper is adapted.
export function buildSharedNote(bytes){
  const base=buildCafeDoors(bytes);
  if(sha256(base.output)!==CAFE_REFERENCE_SHA)throw Error('Cafe reference changed');
  const original=decodeBsp(bytes),parent=decodeBsp(base.output),source=original.entities[243];
  if(value(source,'classname')!=='cof_passwordnote'||value(source,'usertype')!==undefined
    ||value(source,'origin')!=='27 2069 -518'||source.pairs.some(([k])=>!['origin','rendercolor','angles','classname'].includes(k)))throw Error('Selected original username note changed');
  const spans=entitySpans(original.entityText),edits=structuredClone(base.report.edits),expected=structuredClone(parent.entities);
  const {visual,added,origin,angles,dispatch,translation,center,size}=createCredentialNotePlan(base.output,parent,source,243);
  expected[243].pairs=visual.pairs;edits.push({...spans[243],entity:243,to:block(visual.pairs),purpose:'Selected note visual retained; native grant routed through one-use E proxy'});
  const addedEntities=[...base.report.addedEntities,...added.map((e,i)=>({index:parent.entities.length+i,pairs:e.pairs}))];
  expected.push(...addedEntities.slice(base.report.addedEntities.length));
  let text=original.entityText;edits.sort((a,b)=>b.start-a.start);
  for(const e of edits)text=text.slice(0,e.start)+e.to+text.slice(e.end);
  const appendText='\n'+addedEntities.map(e=>block(e.pairs)+'\n').join('');
  const entityBytes=Buffer.from(text+appendText+'\0','latin1'),offset=Math.ceil(bytes.length/4)*4;
  const output=Buffer.alloc(offset+entityBytes.length);bytes.copy(output);entityBytes.copy(output,offset);
  output.writeInt32LE(offset,4);output.writeInt32LE(entityBytes.length,8);const next=decodeBsp(output);
  if(JSON.stringify(next.entities.map(e=>e.pairs))!==JSON.stringify(expected.map(e=>e.pairs))
    ||!output.subarray(12,bytes.length).equals(bytes.subarray(12))
    ||JSON.stringify(next.lumps.slice(1))!==JSON.stringify(original.lumps.slice(1)))throw Error('Note BSP preservation failure');
  for(const e of addedEntities){const name=value(e,'targetname');if(name&&name!==dispatch&&next.entities.filter(x=>value(x,'targetname')===name).length!==1)throw Error(`Name collision: ${name}`);}
  if(next.entities.filter(e=>value(e,'targetname')===dispatch).length!==4)throw Error('Dispatcher fan-out changed');
  return{output,report:{...base.report,map:NOTE_MAP,outputSha256:sha256(output),fileBytes:output.length,entities:next.entities.length,
    edits,appendText,addedEntities,modifiedOriginalEntities:edits.map(e=>e.entity).sort((a,b)=>a-b),
    cafeReferenceSha256:CAFE_REFERENCE_SHA,note:{id:'c_start2:N0243',index:243,kind:'username',origin,angles,
      otherOriginalNoteUnchanged:242,originalGrant:'CPasswordNote::NoteUse',players:'native game_zone_player iteration; one fresh native helper per callback, maximum4',
      dispatch,helpers:4,proxy:{model:'*19',translation,center,size,spawnflags:129},
      collection:'one-use E button wait -1, followed by visual/button removal; counters remove on their first threshold fire'},
    scope:'Single username note experiment only; entire cafe/ordinary candidate unchanged. No inventory grant entities or replicated weapons/items.',
    limits:'Native zone/counter/E proxy/helper survival/journal/notification behavior requires gameplay proof. Native note cache/packet path inspected read-only, no binary change. Current connected players only, no late-join catch-up; one collection per fresh map. Other notes remain original. Door v10 limits still apply.'}};
}
export function main(args){
  if(args.length!==2||path.basename(args[0]).toLowerCase()!=='c_start2.bsp')throw Error('Usage: build-shared-note.mjs ORIGINAL_c_start2.bsp NEW_WORK_DIRECTORY');
  const result=buildSharedNote(fs.readFileSync(args[0])),directory=prepareOutput(args[1],[path.dirname(args[0])]);
  fs.writeFileSync(path.join(directory,NOTE_MAP+'.bsp'),result.output,{flag:'wx'});
  fs.writeFileSync(path.join(directory,'conversion-report.json'),JSON.stringify(result.report,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({map:NOTE_MAP,sha256:result.report.outputSha256,bytes:result.report.fileBytes,entities:result.report.entities,note:result.report.note.id}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{main(process.argv.slice(2));}catch(error){console.error(`ERROR: ${error.message}`);process.exitCode=1;}
}
