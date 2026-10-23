import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeBsp,sha256,uniqueValue} from './bsp.mjs';
import {buildDoorBypass,entitySpans,SOURCE_SHA} from './build-door-experiment.mjs';
import {prepareOutput} from './cof-inspect.mjs';

export const DOOR_ROUTES=[
  {door:49,model:'*6',exit:51,destination:'d1_1_exit1',helper:'cof_story_use49',origin:'3656 -1278.5 -849.5'},
  {door:50,model:'*7',exit:48,destination:'d1_1_exit2',helper:'cof_story_use50',origin:'1039 -1689.5 -849.5'}
];
const block=pairs=>'{\n'+pairs.map(([k,v])=>`"${k}" "${v}"\n`).join('')+'}';

// Scope is deliberately restricted to this original, unlocked pair. A future
// converter must understand lock/enable/retarget callers before accepting more.
export function buildUseDoorExperiment(bytes) {
  if(sha256(bytes)!==SOURCE_SHA)throw new Error('Original c_start2 SHA256 mismatch');
  const original=decodeBsp(bytes),bypass=buildDoorBypass(bytes);
  const spans=entitySpans(original.entityText),expected=structuredClone(original.entities);
  const replacements=[],added=[];
  for(const route of DOOR_ROUTES){
    const e=original.entities[route.door];
    if(uniqueValue(e,'classname')!=='inter_door'||uniqueValue(e,'model')!==route.model||uniqueValue(e,'target')!==route.destination
      ||['lockedby','master','targetname'].some(k=>uniqueValue(e,k))||Number(uniqueValue(e,'spawnflags')??0)!==0)throw new Error('Door is not the verified unlocked pair');
    if(original.entities.some(e=>uniqueValue(e,'targetname')===route.helper))throw new Error('Helper name collision');
    const pairs=e.pairs.filter(([k])=>['model','renderamt','rendermode','rendercolor'].includes(k));
    pairs.push(['target',route.helper],['spawnflags','17'],['wait','1'],['sounds','0'],['delay','0'],['classname','func_button']);
    expected[route.door].pairs=pairs;
    replacements.push({...spans[route.door],entity:route.door,text:block(pairs)});
    const exit=expected[route.exit];
    if(uniqueValue(exit,'classname')!=='inter_door_exit'||uniqueValue(exit,'targetname')!==route.destination)throw new Error('Unexpected exit');
    exit.pairs.find(([k])=>k==='classname')[1]='info_teleport_destination';
    const span=spans[route.exit],oldBlock=original.entityText.slice(span.start,span.end);
    replacements.push({...span,entity:route.exit,text:oldBlock.replace('"inter_door_exit"','"info_teleport_destination"')});
    added.push({index:original.entities.length+added.length,pairs:[['origin',route.origin],['targetname',route.helper],['target',route.destination],['message',''],['classname','cof_teleport']]});
  }
  let text=original.entityText;
  for(const r of [...replacements].sort((a,b)=>b.start-a.start))text=text.slice(0,r.start)+r.text+text.slice(r.end);
  text+='\n'+added.map(e=>block(e.pairs)+'\n').join('');expected.push(...added);
  const entityBytes=Buffer.from(text+'\0','latin1'),offset=Math.ceil(bytes.length/4)*4;
  const output=Buffer.alloc(offset+entityBytes.length);bytes.copy(output);entityBytes.copy(output,offset);
  output.writeInt32LE(offset,4);output.writeInt32LE(entityBytes.length,8);
  const next=decodeBsp(output);
  if(JSON.stringify(next.entities)!==JSON.stringify(expected)||!output.subarray(12,bytes.length).equals(bytes.subarray(12))
    ||!next.lumps.slice(1).every(l=>JSON.stringify(l)===JSON.stringify(original.lumps[l.index])))throw new Error('Preservation failure');
  for(const route of DOOR_ROUTES)for(const name of [route.helper,route.destination])if(next.entities.filter(e=>uniqueValue(e,'targetname')===name).length!==1)throw new Error('Ambiguous target');
  const edits=[...replacements].sort((a,b)=>b.start-a.start).map(r=>({entity:r.entity,start:r.start,end:r.end,from:original.entityText.slice(r.start,r.end),to:r.text}));
  return {output,report:{schemaVersion:1,status:'EXPERIMENTAL_NOT_RUNTIME_TESTED',map:'c_start2_dooruse',sourceSha256:SOURCE_SHA,
    outputSha256:sha256(output),fileBytes:output.length,entities:next.entities.length,modifiedEntities:[48,49,50,51],addedEntities:added,
    routes:DOOR_ROUTES,edits,appendText:'\n'+added.map(e=>block(e.pairs)+'\n').join(''),destinations:bypass.report.destinations,
    unchangedNonEntityLumps:14,originalBytesAfterEntityHeaderPreserved:true,
    activation:'func_button flags 17 = DontMove + DirectUseOnly; no touch flag; one-second shared button reset; direct target cof_teleport with SDK blank message player selector.',
    limitations:'Point cof_teleport is supported by SDK/native BSPs, but is NOT the user-verified trigger_teleport Touch handler. Activator selection, hull adjustment, reset firing and visibility remain Steam runtime gates. Selected door audio/fades omitted; models/spawns unchanged.'}};
}
export function main(args){
  if(args.length!==2)throw new Error('Usage: build-use-door-experiment.mjs ORIGINAL_c_start2.bsp NEW_WORK_DIRECTORY');
  const [source,destination]=args;
  if(path.basename(source).toLowerCase()!=='c_start2.bsp')throw new Error('Require original c_start2 filename');
  const result=buildUseDoorExperiment(fs.readFileSync(source));
  const directory=prepareOutput(destination,[path.dirname(source)]);
  fs.writeFileSync(path.join(directory,'c_start2_dooruse.bsp'),result.output,{flag:'wx'});
  fs.writeFileSync(path.join(directory,'use-door-report.json'),JSON.stringify(result.report,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({directory,sha256:result.report.outputSha256,bytes:result.output.length,entities:result.report.entities,status:result.report.status}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{main(process.argv.slice(2));}catch(error){console.error(`ERROR: ${error.message}`);process.exitCode=1;}
}
