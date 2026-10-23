import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeBsp,sha256,uniqueValue as value} from './bsp.mjs';
import {entitySpans} from './build-door-experiment.mjs';
import {buildSharedNote,createCredentialNotePlan} from './build-shared-note.mjs';
import {prepareOutput} from './cof-inspect.mjs';
import {chooseSpawns} from './build-door-batch.mjs';
export const STORY_MAP='c_start2_story_rc1';
export const V11_SHA='ef1c8f26a0c359d17a5b082813751a171f3e52cb86516317a21e3ff200468b95';
const block=pairs=>'{\n'+pairs.map(([k,v])=>`"${k}" "${v}"\n`).join('')+'}';
export function buildStoryCandidate(bytes){
 const base=buildSharedNote(bytes);if(sha256(base.output)!==V11_SHA)throw Error('V11 baseline changed');
 const original=decodeBsp(bytes),parent=decodeBsp(base.output),source=original.entities[242];
 if(value(source,'origin')!=='-600 1086 -602'||value(source,'angles')!=='0 60 0'||value(source,'usertype')!=='1'
   ||source.pairs.some(([k])=>!['origin','usertype','rendercolor','angles','classname'].includes(k)))throw Error('Original password paper changed');
 const plan=createCredentialNotePlan(base.output,parent,source,242),spans=entitySpans(original.entityText);
 const edits=[...base.report.edits,{...spans[242],entity:242,to:block(plan.visual.pairs),purpose:'Password uses same native per-recipient first-use path as V11 username'}].sort((a,b)=>b.start-a.start);
 const spawns=chooseSpawns(bytes),spawnEntities=spawns.map(s=>({pairs:[['origin',s.origin.join(' ')],['angles',s.angles.join(' ')],['classname',s.classname]]}));
 const additions=[...plan.added,...spawnEntities];
 const addedEntities=[...base.report.addedEntities,...additions.map((e,i)=>({index:parent.entities.length+i,pairs:e.pairs}))];
 let text=original.entityText;for(const edit of edits)text=text.slice(0,edit.start)+edit.to+text.slice(edit.end);
 const appendText='\n'+addedEntities.map(e=>block(e.pairs)+'\n').join(''),entityBytes=Buffer.from(text+appendText+'\0','latin1'),offset=Math.ceil(bytes.length/4)*4;
 const output=Buffer.alloc(offset+entityBytes.length);bytes.copy(output);entityBytes.copy(output,offset);output.writeInt32LE(offset,4);output.writeInt32LE(entityBytes.length,8);
 const rebuilt=decodeBsp(output),expected=structuredClone(parent.entities);expected[242].pairs=plan.visual.pairs;expected.push(...additions);
 if(JSON.stringify(rebuilt.entities.map(e=>e.pairs))!==JSON.stringify(expected.map(e=>e.pairs))||!output.subarray(12,bytes.length).equals(bytes.subarray(12))
   ||JSON.stringify(rebuilt.lumps.slice(1))!==JSON.stringify(original.lumps.slice(1)))throw Error('Candidate preservation failed');
 for(const e of plan.added){const name=value(e,'targetname'),matches=rebuilt.entities.filter(x=>value(x,'targetname')===name);if(matches.length!==(name===plan.dispatch?4:1))throw Error('Password helper name collision');}
 return{output,report:{...base.report,map:STORY_MAP,status:'IMPLEMENTED_AWAITING_GAMEPLAY_VERIFICATION',baselineSha256:V11_SHA,
  outputSha256:sha256(output),fileBytes:output.length,entities:rebuilt.entities.length,edits,appendText,addedEntities,
  modifiedOriginalEntities:edits.map(e=>e.entity).sort((a,b)=>a-b),spawns,password:{index:242,origin:plan.origin,translation:plan.translation,helpers:4,usertype:1},
  scope:'V11 door/username chains unchanged; password shared with connected 1-4 players using fresh native helpers; four static native spawn candidates added.',
  limits:'Both readers open; close normally to archive. Password proxy input/native journal/puzzle content await gameplay verification. Player PC code mismatch is NOT fixed. No late-join catch-up, arbitrary notes, inventory persistence or quiet archival.'}};
}
export function main(args){
 if(args.length!==2||path.basename(args[0]).toLowerCase()!=='c_start2.bsp')throw Error('Usage: build-story-candidate.mjs ORIGINAL_c_start2.bsp NEW_WORK_DIRECTORY');
 const r=buildStoryCandidate(fs.readFileSync(args[0])),out=prepareOutput(args[1],[path.dirname(args[0])]);
 fs.writeFileSync(path.join(out,STORY_MAP+'.bsp'),r.output,{flag:'wx'});fs.writeFileSync(path.join(out,'conversion-report.json'),JSON.stringify(r.report,null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({map:STORY_MAP,sha256:r.report.outputSha256,bytes:r.report.fileBytes,entities:r.report.entities}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{main(process.argv.slice(2));}catch(e){console.error(e.message);process.exitCode=1;}}
