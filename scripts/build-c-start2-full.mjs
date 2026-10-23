import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeBsp,sha256,uniqueValue} from './bsp.mjs';
import {SOURCE_SHA} from './build-door-experiment.mjs';
import {buildDoorPresentation} from './build-door-presentation.mjs';
import {convertStoryDoors} from './convert-story-doors.mjs';
import {prepareOutput} from './cof-inspect.mjs';

export const VERIFIED_V8_SHA='4a0e1ddb450133d429250bb1d480689f4c9c1dc7949844affd2b541507b76a23';
export function buildCStart2Full(bytes){
  if(sha256(bytes)!==SOURCE_SHA)throw Error('Original c_start2 SHA256 mismatch');
  const reference=buildDoorPresentation(bytes,'fade');
  if(sha256(reference.output)!==VERIFIED_V8_SHA)throw Error('User-verified v8 mechanism changed');
  const result=convertStoryDoors(bytes,{sourceMap:'c_start2',map:'c_start2_coop_full'});
  if(JSON.stringify(result.report.convertedDoorIds)!==JSON.stringify(['c_start2:D0049','c_start2:D0050']))throw Error('Unexpected conversion scope');
  const v8=decodeBsp(reference.output),next=decodeBsp(result.output);
  const referencePairs=v8.entities.filter(e=>!(uniqueValue(e,'classname')==='game_text'
    &&/^USE(49|50) ACTIVATED$/.test(uniqueValue(e,'message')??''))).map(e=>e.pairs);
  if(JSON.stringify(next.entities.map(e=>e.pairs))!==JSON.stringify(referencePairs))throw Error('Production chain differs from v8 beyond removing two probes');
  return{output:result.output,report:{...result.report,referenceSha256:VERIFIED_V8_SHA,
    v8PairsIdenticalExceptTwoProbeEntities:true,scope:'All safe ordinary same-map doors converted:2/4 same-map, with2 scripted cafe exceptions;3 locked/no-exit and1 cross-map door retained. Whole map NOT gameplay verified.'}};
}
export function main(args){
  if(args.length!==2||path.basename(args[0]).toLowerCase()!=='c_start2.bsp')throw Error('Usage: build-c-start2-full.mjs ORIGINAL_c_start2.bsp NEW_WORK_DIRECTORY');
  const result=buildCStart2Full(fs.readFileSync(args[0])),directory=prepareOutput(args[1],[path.dirname(args[0])]);
  fs.writeFileSync(path.join(directory,'c_start2_coop_full.bsp'),result.output,{flag:'wx'});
  fs.writeFileSync(path.join(directory,'conversion-report.json'),JSON.stringify(result.report,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({directory,map:result.report.map,sha256:result.report.outputSha256,bytes:result.report.fileBytes,
    entities:result.report.entities,converted:result.report.convertedDoorIds,referencePreserved:true}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{main(process.argv.slice(2));}catch(error){console.error(`ERROR: ${error.message}`);process.exitCode=1;}
}
