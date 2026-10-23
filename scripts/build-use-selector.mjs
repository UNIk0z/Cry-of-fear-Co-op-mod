import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeBsp,sha256,uniqueValue} from './bsp.mjs';
import {buildUseProbe} from './build-use-probe.mjs';
import {prepareOutput} from './cof-inspect.mjs';

// Native player cof_teleport records omit message, unlike the explicit empty
// selector in v4/v5. Change only that serialization before changing handlers.
export function buildUseSelector(bytes){
  const base=buildUseProbe(bytes),original=decodeBsp(bytes),expected=decodeBsp(base.output).entities;
  const points=expected.filter(e=>uniqueValue(e,'classname')==='cof_teleport');
  if(points.length!==2||points.some(e=>e.pairs.filter(([k])=>k==='message').length!==1||uniqueValue(e,'message')!==''))throw Error('Unexpected selector baseline');
  for(const e of points)e.pairs=e.pairs.filter(([k])=>k!=='message');
  // Scope removals to helper entities from the plan, never the HUD message keys.
  const added=base.report.addedEntities.map(e=>uniqueValue(e,'classname')==='cof_teleport'
    ?{...e,pairs:e.pairs.filter(([k])=>k!=='message')}:e);
  const block=e=>'{\n'+e.pairs.map(([k,v])=>`"${k}" "${v}"\n`).join('')+'}\n';
  const appendText='\n'+added.map(block).join('');
  let text=original.entityText;
  for(const e of base.report.edits)text=text.slice(0,e.start)+e.to+text.slice(e.end);
  const entityBytes=Buffer.from(text+appendText+'\0','latin1'),offset=Math.ceil(bytes.length/4)*4;
  const output=Buffer.alloc(offset+entityBytes.length);bytes.copy(output);entityBytes.copy(output,offset);
  output.writeInt32LE(offset,4);output.writeInt32LE(entityBytes.length,8);
  const next=decodeBsp(output);
  if(JSON.stringify(next.entities)!==JSON.stringify(expected)||!output.subarray(12,bytes.length).equals(bytes.subarray(12))
    ||JSON.stringify(next.lumps.slice(1))!==JSON.stringify(original.lumps.slice(1)))throw Error('Preservation failure');
  return {output,report:{...base.report,map:'c_start2_useselect',outputSha256:sha256(output),fileBytes:output.length,
    baseOutputSha256:sha256(base.output),appendText,addedEntities:added,status:'VERIFIED_BY_USER_CORE_TRANSITION',
    activation:'V5 buttons/flags1/sound3/HUD markers unchanged. Only remove message empty keys from point teleporters443/444 to match native player records.',
    limitations:'V6 core VERIFIED BY USER: both actors independently use E, both directions and mutual models pass. Binary selector root cause unmeasured. Original audio/fade not implemented; simultaneous behavior/inventory/floor details not separately reported.'}};
}
export function main(args){
  if(args.length!==2||path.basename(args[0]).toLowerCase()!=='c_start2.bsp')throw Error('Usage: build-use-selector.mjs ORIGINAL_c_start2.bsp NEW_WORK_DIRECTORY');
  const [source,destination]=args,result=buildUseSelector(fs.readFileSync(source));
  const directory=prepareOutput(destination,[path.dirname(source)]);
  fs.writeFileSync(path.join(directory,'c_start2_useselect.bsp'),result.output,{flag:'wx'});
  fs.writeFileSync(path.join(directory,'use-selector-report.json'),JSON.stringify(result.report,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({directory,sha256:result.report.outputSha256,bytes:result.output.length,entities:result.report.entities}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{main(process.argv.slice(2));}catch(error){console.error(`ERROR: ${error.message}`);process.exitCode=1;}
}
