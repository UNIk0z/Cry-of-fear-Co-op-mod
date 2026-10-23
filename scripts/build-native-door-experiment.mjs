import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeBsp,sha256,values} from './bsp.mjs';
import {entitySpans,SOURCE_SHA} from './build-door-experiment.mjs';
import {prepareOutput} from './cof-inspect.mjs';

// Native worldspawn declarations, exactly as in cof_campaign_01_p4 and SDK.
export const MODEL_PAIRS=[1,2,3,4].map(i=>[`player${i}`,`police${i}`]);
export function buildNativeDoorExperiment(bytes) {
  if(sha256(bytes)!==SOURCE_SHA) throw new Error('Original c_start2 SHA256 mismatch');
  const old=decodeBsp(bytes), spans=entitySpans(old.entityText);
  if(spans.length!==old.entities.length||!values(old.entities[0],'classname').every(v=>v==='worldspawn')) throw new Error('Unexpected worldspawn');
  if(MODEL_PAIRS.some(([key])=>values(old.entities[0],key).length)) throw new Error('Model declaration already exists');
  const insertionOffset=spans[0].end-1;
  const insertionText=MODEL_PAIRS.map(([k,v])=>`"${k}" "${v}"\n`).join('');
  const text=old.entityText.slice(0,insertionOffset)+insertionText+old.entityText.slice(insertionOffset);
  const entityBytes=Buffer.from(text+'\0','latin1'),offset=Math.ceil(bytes.length/4)*4;
  const output=Buffer.alloc(offset+entityBytes.length);bytes.copy(output);entityBytes.copy(output,offset);
  output.writeInt32LE(offset,4);output.writeInt32LE(entityBytes.length,8);
  const next=decodeBsp(output), expected=structuredClone(old.entities);
  expected[0].pairs.push(...MODEL_PAIRS);
  if(JSON.stringify(next.entities)!==JSON.stringify(expected)
    ||!output.subarray(12,bytes.length).equals(bytes.subarray(12))
    ||!next.lumps.slice(1).every(l=>l.sha256===old.lumps[l.index].sha256&&l.offset===old.lumps[l.index].offset&&l.length===old.lumps[l.index].length)) throw new Error('Preservation failure');
  return {output,report:{schemaVersion:1,status:'EXPERIMENTAL_NOT_RUNTIME_TESTED',
    sourceSha256:SOURCE_SHA,outputSha256:sha256(output),fileBytes:output.length,
    entityCount:next.entities.length,modifiedEntities:[0],addedWorldspawnPairs:MODEL_PAIRS,
    insertionOffset,insertionText,allOriginalPairsPreserved:true,allOriginalDoorEntitiesUnchanged:true,
    unchangedNonEntityLumps:14,
    hypothesis:'Native per-slot worldspawn model declarations may permit correct model restoration after original Use-door relocation. No internal cause/function difference is proven.',
    limitations:'Explicit standard police1-4 models as native campaign. Custom slot models are not tested. No new spawns, door swaps, helper triggers or presentation changes.'}};
}
export function main(args) {
  if(args.length!==2)throw new Error('Usage: build-native-door-experiment.mjs ORIGINAL_c_start2.bsp NEW_WORK_DIRECTORY');
  const [source,destination]=args;
  if(path.basename(source).toLowerCase()!=='c_start2.bsp')throw new Error('Require original c_start2 filename');
  const result=buildNativeDoorExperiment(fs.readFileSync(source));
  const directory=prepareOutput(destination,[path.dirname(source)]);
  fs.writeFileSync(path.join(directory,'c_start2_doornative.bsp'),result.output,{flag:'wx'});
  fs.writeFileSync(path.join(directory,'native-door-report.json'),JSON.stringify(result.report,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({directory,...result.report},null,2));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{main(process.argv.slice(2));}catch(error){console.error(`ERROR: ${error.message}`);process.exitCode=1;}
}
