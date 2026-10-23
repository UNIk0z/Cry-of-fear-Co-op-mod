import fs from 'node:fs';
import path from 'node:path';
import {decodeBsp,sha256,uniqueValue as v} from './bsp.mjs';
// Read-only audit of retained campaign plus candidate overrides. Never infer
// gameplay completion from a target graph or convert an unknown prerequisite.
const [rc2,rc2Package,overlay,out]=process.argv.slice(2);
if(!out||fs.existsSync(out))throw Error('Usage: audit-integration-rc4 RC2_BUILD RC2_PACKAGE OVERLAY NEW_REPORT');
const catalog=JSON.parse(fs.readFileSync(path.join(rc2Package,'release.json'))),names=new Set(catalog.maps.map(m=>m.map));
for(const file of fs.readdirSync(overlay).filter(n=>n.endsWith('.bsp')))names.add(file.slice(0,-4));
const result={schemaVersion:1,status:'STATIC AUDIT ONLY; unresolved prerequisites are preserved',maps:[],missingRoutes:[],totals:{maps:0,retainedDestinationDoors:0,conditionalDoors:0,recorders:0,notes:0,cameras:0}};
for(const map of names){
 const custom=fs.existsSync(path.join(overlay,map+'.bsp')),bytes=fs.readFileSync(path.join(custom?overlay:rc2,map+'.bsp'));
 const expected=custom?JSON.parse(fs.readFileSync(path.join(overlay,map+'.json'))).outputSha256:catalog.maps.find(m=>m.map===map).outputSha256;
 if(sha256(bytes)!==expected)throw Error('Changed map '+map);
 const entities=decodeBsp(bytes).entities,doors=[],recorders=[],notes=[],routes=new Set();let cameras=0;
 for(const e of entities){const cls=v(e,'classname'),name=v(e,'targetname');
  if(cls==='inter_door'&&v(e,'target')){
   const callers=name?entities.filter(q=>q!==e&&q.pairs.some(([k,val])=>k===name||val===name)).map(q=>({entity:q.index,class:v(q,'classname')})):[];
   const conditional=!!(name||v(e,'lockedby')||v(e,'master')||callers.length);
   doors.push({entity:e.index,target:v(e,'target'),conditional,callers,decision:'RETAINED; needs authored prerequisite and destination validation'});
   ++result.totals.retainedDestinationDoors;if(conditional)++result.totals.conditionalDoors;
  }
  if(cls==='tape_recorder'){recorders.push({entity:e.index,supported:['s4_start','s4_start_e0','s4_start_e2'].includes(map)&&[419,421].includes(e.index)});++result.totals.recorders;}
  if(['cof_document','cof_passwordnote','cof_addcodenote'].includes(cls)){notes.push({entity:e.index,class:cls});++result.totals.notes;}
  if(cls==='trigger_camera'){++cameras;++result.totals.cameras;}
  for(const [k,val] of e.pairs)if(['map','message'].includes(k)&&/^(s[234]_|cof_campaign_story)/.test(val)){routes.add(val);if(!names.has(val))result.missingRoutes.push({map,entity:e.index,target:val});}
 }
 result.maps.push({map,overlay:custom,retainedDoors:doors,recorders,notes,cameras,routes:[...routes].sort()});++result.totals.maps;
}
fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({totals:result.totals,missingRoutes:result.missingRoutes}));
