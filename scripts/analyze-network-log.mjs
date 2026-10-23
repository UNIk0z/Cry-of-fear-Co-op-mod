import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {prepareOutput} from './cof-inspect.mjs';
const patterns=[
 ['reliable-sizebuf',/SZ_GetSpace:\s*overflow on netchan->message/i],
 ['reliable-overflow',/WARNING:\s*reliable overflow for\s+(.+)/i],
 ['reliable-clear-nonzero',/Netchan_Clear\(\).*reliable length not 0/i],
 ['dll-message-overflow',/MESSAGE_END called.*message buffer from \.dll had overflowed/i],
 ['visible-entity-limit',/Too many entities in visible packet list/i],
 ['unreliable-datagram-overflow',/(?:datagram|sv\.spectator) overflowed/i],
 ['client-overflowed',/^\s*(.+?)\s+overflowed\s*$/i],
 ['authentication-rejected',/Steam validation rejected|STEAM.*authentication.*(?:fail|reject)/i],
];
export function analyzeNetworkLog(text,{client='unknown'}={}){
 const events=[],cases=[],maps=[],lineCounts=new Map();let activeCase='unmarked',map=null;
 for(const [i,line] of text.split(/\r?\n/).entries()){
  const marker=line.match(/\[STORYCOOP\]\s+CASE\s+([A-Za-z0-9_-]+)(?:\s+(\d+))?/);
  if(marker){activeCase=marker[1]+(marker[2]?':'+marker[2]:'');cases.push({line:i+1,id:activeCase});}
  const status=line.match(/^\s*map\s*:\s*([a-z0-9_]+)/i);
  if(status){map=status[1].toLowerCase();maps.push({line:i+1,map,case:activeCase});}
  for(const [kind,pattern] of patterns)if(pattern.test(line)){
   events.push({line:i+1,kind,client,case:activeCase,map,text:line.trim()});
   lineCounts.set(line.trim(),(lineCounts.get(line.trim())??0)+1);
  }
 }
 const counts=Object.fromEntries(patterns.map(([kind])=>[kind,events.filter(e=>e.kind===kind).length]));
 return{schemaVersion:1,client,cases,maps,counts,events,repeatedDiagnosticLines:[...lineCounts].filter(([,n])=>n>1).map(([text,count])=>({text,count})),
  conclusion:events.length?'DIAGNOSTIC_EVENTS_PRESENT':'NO_MATCHING_DIAGNOSTICS_IN_SUPPLIED_LOG',
  limitations:'Console observations only, not a packet trace. No matching lines does not prove a fix, successful transitions, inventory preservation or absence of buffer overflow. Repeated console lines are not counted network sends. Authentication errors remain separate.'};
}
export function main(args){
 if(args.length<2||args.length>3)throw Error('Usage: analyze-network-log.mjs INPUT_LOG NEW_WORK_DIRECTORY [P1|P2|P3|P4]');
 const [file,dest,client='unknown']=args;if(!['unknown','P1','P2','P3','P4'].includes(client))throw Error('Invalid client label');
 const r=analyzeNetworkLog(fs.readFileSync(file,'utf8'),{client}),out=prepareOutput(dest,[path.dirname(file)]);
 fs.writeFileSync(path.join(out,'network-log-report.json'),JSON.stringify(r,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({client,events:r.events.length,counts:r.counts,out}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{main(process.argv.slice(2));}catch(e){console.error(e.message);process.exitCode=1;}}
