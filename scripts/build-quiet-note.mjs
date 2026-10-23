import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeBsp,sha256,uniqueValue as v} from './bsp.mjs';
import {buildSharedNote} from './build-shared-note.mjs';
import {prepareOutput} from './cof-inspect.mjs';

export const QUIET_NOTE_MAP='c_start2_notequiet';
export const SHARED_NOTE_SHA='ef1c8f26a0c359d17a5b082813751a171f3e52cb86516317a21e3ff200468b95';
const block=pairs=>'{\n'+pairs.map(([k,value])=>`"${k}" "${value}"\n`).join('')+'}';

// WITHDRAWN: user reports P2 collects, P1 receives no notification/journal entry.
// Native UserDoc always calls ShowMenu(34). This failed candidate sends a synchronous
// activator-specific close immediately after each grant, then reopens only the
// original collector. It is popup suppression, NOT a silent native grant API.
export function buildQuietNote(bytes){
 const base=buildSharedNote(bytes);
 if(sha256(base.output)!==SHARED_NOTE_SHA)throw Error('Shared-note reference changed');
 const original=decodeBsp(bytes),parent=decodeBsp(base.output),added=structuredClone(base.report.addedEntities);
 const find=name=>{const result=added.filter(e=>v(e,'targetname')===name);if(result.length!==1)throw Error('Expected unique '+name);return result[0];};
 const start=find('cof_note243_collect');
 start.pairs.splice(start.pairs.length-1,0,['cof_note243_grant1_note','0.05']);
 const callbacks=[];
 for(let slot=1;slot<=4;slot++){
  const grant=`cof_note243_grant${slot}`,raw=grant+'_note',note=find(grant);
  note.pairs=note.pairs.map(([k,value])=>[k,k==='targetname'?raw:value]);
  // Spawn relay BEFORE closer. Native FireTargets enumerates matching entities
  // synchronously in edict order; ordering is an explicit gameplay test gate.
  // No relay delay/multi_manager between the UserDoc and VGUIMenu(200) messages.
  added.push({index:original.entities.length+added.length,pairs:[['origin','27 2069 -518'],['targetname',grant],['target',raw],['triggerstate','2'],['classname','trigger_relay']]});
  added.push({index:original.entities.length+added.length,pairs:[['origin','27 2069 -518'],['targetname',grant],['classname','cof_closeallvgui']]});
  callbacks.push({grant,raw,ordering:'synchronous relay then activator-only closer'});
 }
 let text=original.entityText;
 for(const edit of base.report.edits)text=text.slice(0,edit.start)+edit.to+text.slice(edit.end);
 const appendText='\n'+added.map(e=>block(e.pairs)+'\n').join('');
 const entityBytes=Buffer.from(text+appendText+'\0','latin1'),offset=Math.ceil(bytes.length/4)*4;
 const output=Buffer.alloc(offset+entityBytes.length);bytes.copy(output);entityBytes.copy(output,offset);
 output.writeInt32LE(offset,4);output.writeInt32LE(entityBytes.length,8);
 const next=decodeBsp(output);
 if(!output.subarray(12,bytes.length).equals(bytes.subarray(12))||JSON.stringify(next.lumps.slice(1))!==JSON.stringify(original.lumps.slice(1)))throw Error('BSP preservation failed');
 for(let i=0;i<parent.entities.length;i++){
  const name=v(parent.entities[i],'targetname');
  if(name==='cof_note243_collect'||/^cof_note243_grant[1-4]$/.test(name??''))continue;
  if(JSON.stringify(next.entities[i].pairs)!==JSON.stringify(parent.entities[i].pairs))throw Error('Unexpected parent change '+i);
 }
 return{output,report:{...base.report,status:'FAILED_REMOTE_DELIVERY_WITHDRAWN',map:QUIET_NOTE_MAP,outputSha256:sha256(output),fileBytes:output.length,entities:next.entities.length,
  appendText,addedEntities:added,sharedNoteReferenceSha256:SHARED_NOTE_SHA,
  quiet:{callbacks,collectorRead:'cof_note243_grant1_note',collectorReadAt:0.05,method:'synchronous per-recipient native close; cached note read for original collector'},
  scope:'One username note UI candidate. Four existing first-use helpers retained, no extra note or loot copies. All original/cafe/ordinary records unchanged from v11.',
  limits:'WITHDRAWN after user failure: P2 collected/retained note; P1 received no notification or journal addition. Native grant internally opens its reader before immediate close; this is not a silent API. Native closedocument archives the pending document and sends AddNote; the closer does not explicitly run that handshake. Missing archival is a hypothesis pending P1 diagnostic. Retained for forensic reproduction only. No per-player loot conversion or late-join catch-up.'}};
}
export function main(args){
 if(args.length!==2||path.basename(args[0]).toLowerCase()!=='c_start2.bsp')throw Error('Usage: build-quiet-note.mjs ORIGINAL_c_start2.bsp NEW_WORK_DIRECTORY');
 const result=buildQuietNote(fs.readFileSync(args[0])),directory=prepareOutput(args[1],[path.dirname(args[0])]);
 fs.writeFileSync(path.join(directory,QUIET_NOTE_MAP+'.bsp'),result.output,{flag:'wx'});
 fs.writeFileSync(path.join(directory,'conversion-report.json'),JSON.stringify(result.report,null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({status:result.report.status,map:QUIET_NOTE_MAP,sha256:result.report.outputSha256,bytes:result.report.fileBytes,entities:result.report.entities}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{main(process.argv.slice(2));}catch(error){console.error(error.message);process.exitCode=1;}}
