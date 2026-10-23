import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeBsp,sha256,uniqueValue} from './bsp.mjs';
import {sampleSpawn,worldHull} from './collision.mjs';
import {prepareOutput} from './cof-inspect.mjs';

export const SOURCE_SHA = '3933456e6c0e8a449ec17e7829c9d69a8880a1e414b54dd6c0cf2b361483157e';
const changes = [
  {entity:48, from:'inter_door_exit', to:'info_teleport_destination', name:'d1_1_exit2'},
  {entity:49, from:'inter_door', to:'trigger_teleport', model:'*6', target:'d1_1_exit1'},
  {entity:50, from:'inter_door', to:'trigger_teleport', model:'*7', target:'d1_1_exit2'},
  {entity:51, from:'inter_door_exit', to:'info_teleport_destination', name:'d1_1_exit1'}
];

// Work on validated BSP entity text. Quoted values and comments may contain braces;
// only standalone brace tokens delimit an entity. Keep every other byte verbatim.
export function entitySpans(text) {
  const spans=[];
  let start=null;
  for (const token of text.matchAll(/"[^"]*"|\/\/[^\r\n]*|[{}]/g)) {
    if (token[0]==='{') {
      if (start!==null) throw new Error('Nested entity');
      start=token.index;
    } else if (token[0]==='}') {
      if (start===null) throw new Error('Unpaired entity close');
      spans.push({start,end:token.index+1}); start=null;
    }
  }
  if(start!==null) throw new Error('Unclosed entity');
  return spans;
}

export function buildDoorBypass(bytes) {
  if(sha256(bytes)!==SOURCE_SHA) throw new Error('Original c_start2 SHA256 mismatch');
  const original=decodeBsp(bytes), spans=entitySpans(original.entityText);
  if(spans.length!==original.entities.length) throw new Error('Entity span count mismatch');
  const edits=changes.map(change=>{
    const e=original.entities[change.entity];
    if(uniqueValue(e,'classname')!==change.from || (change.model&&uniqueValue(e,'model')!==change.model)
      || (change.target&&uniqueValue(e,'target')!==change.target) || (change.name&&uniqueValue(e,'targetname')!==change.name)) {
      throw new Error(`Unexpected entity ${change.entity}`);
    }
    const span=spans[change.entity], block=original.entityText.slice(span.start,span.end);
    const matches=[...block.matchAll(/"classname"\s+"([^"]*)"/g)];
    if(matches.length!==1 || matches[0][1]!==change.from) throw new Error('Ambiguous classname edit');
    const m=matches[0], offset=span.start+m.index+m[0].lastIndexOf(change.from);
    return {entity:change.entity,offset,from:change.from,to:change.to};
  });
  let text=original.entityText;
  for(const edit of [...edits].sort((a,b)=>b.offset-a.offset)) {
    text=text.slice(0,edit.offset)+edit.to+text.slice(edit.offset+edit.from.length);
  }
  const entityBytes=Buffer.from(text+'\0','latin1'), offset=Math.ceil(bytes.length/4)*4;
  const output=Buffer.alloc(offset+entityBytes.length);
  bytes.copy(output); entityBytes.copy(output,offset);
  output.writeInt32LE(offset,4); output.writeInt32LE(entityBytes.length,8);
  const rebuilt=decodeBsp(output), expected=structuredClone(original.entities);
  for(const change of changes) expected[change.entity].pairs.find(p=>p[0]==='classname')[1]=change.to;
  if(JSON.stringify(rebuilt.entities)!==JSON.stringify(expected)
    || !output.subarray(12,bytes.length).equals(bytes.subarray(12))
    || !rebuilt.lumps.slice(1).every(l=>l.sha256===original.lumps[l.index].sha256
      &&l.offset===original.lumps[l.index].offset&&l.length===original.lumps[l.index].length)) {
    throw new Error('Unrelated BSP/entity content changed');
  }
  // Standard HLSDK teleport destinations are feet origins. Do not add 36 to
  // the stored exits: the engine applies the player's hull offset when touching.
  const hull=worldHull(output), destinations=[48,51].map(index=>{
    const origin=uniqueValue(rebuilt.entities[index],'origin').split(' ').map(Number);
    const sample=sampleSpawn(hull,[origin[0],origin[1],origin[2]+36]);
    if(!sample.staticCandidate) throw new Error('Standing destination fails static hull check');
    const name=uniqueValue(rebuilt.entities[index],'targetname');
    if(rebuilt.entities.filter(e=>uniqueValue(e,'targetname')===name).length!==1) throw new Error('Ambiguous destination');
    return {index,name,storedFeetOrigin:origin,standingSample:sample};
  });
  return {output, report:{schemaVersion:1,sourceSha256:SOURCE_SHA,outputSha256:sha256(output),
    fileBytes:output.length,entities:rebuilt.entities.length,edits,destinations,
    unchangedNonEntityLumps:14,onlyFourClassnameValuesChanged:true,
    originalBytesAfterEntityHeaderPreserved:true,status:'EXPERIMENTAL_NOT_RUNTIME_TESTED',
    limitations:'Touch instead of Use for door pair 49/50. No door sound/fade on this pair; no model resets or new spawns. CoF runtime behavior still needs verification.'}};
}

export function main(args) {
  if(args.length!==2) throw new Error('Usage: build-door-experiment.mjs ORIGINAL_c_start2.bsp NEW_WORK_DIRECTORY');
  const [source,destination]=args;
  if(path.basename(source).toLowerCase()!=='c_start2.bsp') throw new Error('Require original c_start2 filename');
  const bytes=fs.readFileSync(source), result=buildDoorBypass(bytes);
  const directory=prepareOutput(destination,[path.dirname(source)]);
  fs.writeFileSync(path.join(directory,'c_start2_doorctrl.bsp'),bytes,{flag:'wx'});
  fs.writeFileSync(path.join(directory,'c_start2_doorbypass.bsp'),result.output,{flag:'wx'});
  fs.writeFileSync(path.join(directory,'door-experiment-report.json'),JSON.stringify(result.report,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({directory,...result.report},null,2));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try{main(process.argv.slice(2));}catch(error){console.error(`ERROR: ${error.message}`);process.exitCode=1;}
}
