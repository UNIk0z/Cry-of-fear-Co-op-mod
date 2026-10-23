import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeBsp, uniqueValue as value} from './bsp.mjs';
import {analyzeStoryDoors} from './convert-story-doors.mjs';
import {prepareOutput} from './cof-inspect.mjs';

const mapFields=new Map([['trigger_changelevel','map'],['cof_changelevel','message'],['inter_door_coop_changelevel','message']]);
const aliases=/^c_start2_(coop|door|use|note)|_story_rc\d+$/;
export function mapReferences(entities,knownMaps){
 const edges=[],unresolved=[];
 for(const e of entities){
  const classname=value(e,'classname'),key=mapFields.get(classname);
  if(key&&value(e,key))edges.push({entity:e.index,classname,key,to:value(e,key).toLowerCase(),kind:'native-map-field'});
  for(const [field,text] of e.pairs){
   if(field===key)continue;
   if(classname==='trigger_command'&&field==='netname'){
    const matches=[...text.matchAll(/(?:^|;)\s*(changelevel|map)\s+([a-z0-9_]+)\s*(?=;|$)/gi)];
    for(const m of matches)edges.push({entity:e.index,classname,key:field,to:m[2].toLowerCase(),kind:m[1].toLowerCase()==='map'?'singleplayer-command-review':'server-changelevel-command'});
   }else if(knownMaps.has(text.toLowerCase()))unresolved.push({entity:e.index,classname,key:field,to:text.toLowerCase(),kind:'unclassified-exact-map-reference'});
  }
 }
 return{edges,unresolved};
}
export function reachableMaps(maps,root){
 const byName=new Map(maps.map(m=>[m.map,m])),seen=new Set(),queue=[root];
 while(queue.length){const name=queue.shift();if(seen.has(name)||!byName.has(name))continue;seen.add(name);for(const e of byName.get(name).edges)if(!seen.has(e.to))queue.push(e.to);}
 return [...seen].sort();
}
export function main(args){
 if(args.length!==2)throw Error('Usage: audit-campaign.mjs INSTALLED_MAPS_DIRECTORY NEW_WORK_DIRECTORY');
 const [source,dest]=args,files=fs.readdirSync(source).filter(n=>/\.bsp$/i.test(n)&&!aliases.test(path.basename(n,'.bsp'))).sort();
 const names=new Set(files.map(n=>path.basename(n,'.bsp').toLowerCase())),out=prepareOutput(dest,[source]),maps=[],failed=[];
 for(const filename of files){
  const map=path.basename(filename,'.bsp').toLowerCase();
  try{
   const bytes=fs.readFileSync(path.join(source,filename)),bsp=decodeBsp(bytes),references=mapReferences(bsp.entities,names);
   const counts={};for(const e of bsp.entities){const c=value(e,'classname');counts[c]=(counts[c]??0)+1;}
   const relevant=bsp.entities.filter(e=>/^(cof_(passwordnote|document|computer|keypad.*|savepoint|tape.*|coop_spawn[1-4]|addcodenote)|info_player_start|trigger_changelevel|cof_changelevel|inter_door_coop_changelevel)$/.test(value(e,'classname')??''));
   const doors=analyzeStoryDoors(bytes,{sourceMap:map});
   const report={map,sourceSha256:bsp.sha256,fileBytes:bsp.fileBytes,entityCount:bsp.entities.length,counts,...references,
    doors:doors.doors.map(d=>({id:d.id,index:d.index,eligible:d.eligible,classification:d.classification,reasons:d.reasons,target:d.target,destination:d.destination?.name??null})),
    resourcePickups:bsp.entities.filter(e=>/^(weapon_|ammo_|item_)/.test(value(e,'classname')??'')).map(e=>({entity:e.index,classname:value(e,'classname'),origin:value(e,'origin')??null,targetname:value(e,'targetname')??null,hasStoryTargets:e.pairs.some(([k])=>['target','master','itemlock','movewith','lockedby'].includes(k))})),
    relevantEntities:relevant.map(e=>({entity:e.index,classname:value(e,'classname'),origin:value(e,'origin')??null,target:value(e,'target')??null})),
    automatedStatus:'INSPECTED_ONLY',gameplayStatus:'NOT TESTED'};
   maps.push(report);
   // Raw original entity data remains a private work artifact, never in a release.
   fs.writeFileSync(path.join(out,map+'.entities.json'),JSON.stringify(bsp.entities),{flag:'wx'});
  }catch(error){failed.push({map,error:error.message});}
 }
 const reached=reachableMaps(maps,'c_intro'),missing=maps.flatMap(m=>m.edges.filter(e=>!names.has(e.to)).map(e=>({from:m.map,...e})));
 const report={schemaVersion:1,mapsDirectory:path.resolve(source),root:'c_intro',maps,failed,reachableFromIntro:reached,
  missingMapReferences:missing,unclassifiedReferenceCount:maps.reduce((n,m)=>n+m.unresolved.length,0),
  caveat:'Static native fields and literal command graph only. Conditional endings, engine hardcoded routing and unclassified references require review; reachability is not campaign verification.'};
 fs.writeFileSync(path.join(out,'campaign-audit.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({inspected:maps.length,failed:failed.length,reachable:reached.length,missingReferences:missing.length,unclassified:report.unclassifiedReferenceCount,out}));
 if(failed.length)process.exitCode=2;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{main(process.argv.slice(2));}catch(e){console.error(e.message);process.exitCode=1;}}
