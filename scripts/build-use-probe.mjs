import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeBsp,sha256,uniqueValue} from './bsp.mjs';
import {buildUseDoorExperiment,DOOR_ROUTES} from './build-use-door-experiment.mjs';
import {prepareOutput} from './cof-inspect.mjs';
const block=pairs=>'{\n'+pairs.map(([k,v])=>`"${k}" "${v}"\n`).join('')+'}\n';

// One functional change from v4: remove DirectUseOnly. HUD/button cues are
// diagnostic feedback for the reported no-action defect, not door presentation.
export function buildUseProbe(bytes){
  const base=buildUseDoorExperiment(bytes),old=decodeBsp(bytes),parent=decodeBsp(base.output);
  const expected=structuredClone(parent.entities);
  for(const r of DOOR_ROUTES){
    expected[r.door].pairs.find(([k])=>k==='spawnflags')[1]='1';
    expected[r.door].pairs.find(([k])=>k==='sounds')[1]='3';
  }
  const markers=DOOR_ROUTES.map((r,i)=>({index:parent.entities.length+i,pairs:[
    ['origin',r.origin],['targetname',r.helper],['message',`USE${r.door} ACTIVATED`],
    ['spawnflags','1'],['x','-1'],['y','0.2'],['effect','0'],['color','80 255 80'],
    ['color2','80 255 80'],['fadein','0'],['fadeout','0.2'],['holdtime','3'],['channel','4'],['classname','game_text']
  ]}));
  expected.push(...markers);
  const edits=base.report.edits.map(e=>({...e,to:DOOR_ROUTES.some(r=>r.door===e.entity)
    ?e.to.replace('"spawnflags" "17"','"spawnflags" "1"').replace('"sounds" "0"','"sounds" "3"'):e.to}));
  let text=old.entityText;
  for(const e of edits)text=text.slice(0,e.start)+e.to+text.slice(e.end);
  const appendText=base.report.appendText+markers.map(e=>block(e.pairs)).join('');
  text+=appendText;
  const entityBytes=Buffer.from(text+'\0','latin1'),offset=Math.ceil(bytes.length/4)*4;
  const output=Buffer.alloc(offset+entityBytes.length);bytes.copy(output);entityBytes.copy(output,offset);
  output.writeInt32LE(offset,4);output.writeInt32LE(entityBytes.length,8);
  const next=decodeBsp(output);
  if(JSON.stringify(next.entities)!==JSON.stringify(expected)||!output.subarray(12,bytes.length).equals(bytes.subarray(12))
    ||JSON.stringify(next.lumps.slice(1))!==JSON.stringify(old.lumps.slice(1)))throw Error('Preservation failure');
  for(const r of DOOR_ROUTES){
    const targets=next.entities.filter(e=>uniqueValue(e,'targetname')===r.helper);
    if(targets.length!==2||!['cof_teleport','game_text'].every(c=>targets.filter(e=>uniqueValue(e,'classname')===c).length===1))throw Error('Unexpected diagnostic fan-out');
  }
  return {output,report:{...base.report,map:'c_start2_useprobe',outputSha256:sha256(output),fileBytes:output.length,
    entities:next.entities.length,baseOutputSha256:sha256(base.output),edits,appendText,addedEntities:[...base.report.addedEntities,...markers],
    activation:'Button flags1 as original computer button245; direct target fan-out to unchanged point teleporter plus game_text marker. Sound3 diagnostic cue.',
    limitations:'V4 failed with no E relocation. Flag16 restriction hypothesis only; HUD/sound cues diagnose activation. Point selection/hull/reset/visibility still unverified. Solids remain as v4; no touch activation or door presentation restored.'}};
}
export function main(args){
  if(args.length!==2||path.basename(args[0]).toLowerCase()!=='c_start2.bsp')throw Error('Usage: build-use-probe.mjs ORIGINAL_c_start2.bsp NEW_WORK_DIRECTORY');
  const [source,destination]=args,result=buildUseProbe(fs.readFileSync(source));
  const directory=prepareOutput(destination,[path.dirname(source)]);
  fs.writeFileSync(path.join(directory,'c_start2_useprobe.bsp'),result.output,{flag:'wx'});
  fs.writeFileSync(path.join(directory,'use-probe-report.json'),JSON.stringify(result.report,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({directory,sha256:result.report.outputSha256,bytes:result.output.length,entities:result.report.entities}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{main(process.argv.slice(2));}catch(error){console.error(`ERROR: ${error.message}`);process.exitCode=1;}
}
