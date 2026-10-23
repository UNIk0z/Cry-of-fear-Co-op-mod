// v0.1 campaign coverage matrix (static): reads every map of a built co-op map
// directory (BSP + its build report) and summarizes, per original story map and
// its co-op aliases, what the v0.1 shared fixes act on. Static counts only:
// nothing here is gameplay evidence.
// Usage: audit-v01.mjs MAP_BUILD_DIR OUT_JSON OUT_MARKDOWN
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeBsp,uniqueValue as v} from './bsp.mjs';

// Simon cutscene models the adapter draws only inside scene views (coop-runtime.hpp).
export const SIMON_ACTOR_MODELS=['player3.mdl','badkarscenesim.mdl','simon_talk.mdl','simon_talk2.mdl','simon_talkp.mdl','simon_talk2die.mdl','simon_talks.mdl','sicksimon.mdl','sicksimond.mdl','booksimon.mdl','simon_door.mdl'];
const cls=e=>v(e,'classname');
const flags=e=>Number(v(e,'spawnflags')??0);
export function auditEntities(entities){
 const model=e=>(v(e,'model')??'').toLowerCase();
 const simon=entities.filter(e=>model(e).startsWith('models/cutscene/')&&SIMON_ACTOR_MODELS.includes(model(e).slice(16)));
 const doors=entities.filter(e=>cls(e)==='func_button'&&/^cof_story_present\d+$/.test(v(e,'target')??''));
 const weapons=entities.filter(e=>cls(e)==='cof_giveitems'&&!(flags(e)&1)&&/^weapon_/.test(v(e,'message')??''));
 return {
  cameras:entities.filter(e=>cls(e)==='trigger_camera').length,
  simonActors:simon.length,
  weaponGrants:[...new Set(weapons.map(e=>v(e,'message')))].sort(),
  keyGrants:entities.filter(e=>cls(e)==='cof_giveitems'&&(flags(e)&1)).length+entities.filter(e=>cls(e)==='item_key').length,
  coopDoors:doors.length,storyLockedDoors:doors.filter(e=>v(e,'master')).length,
  keyBridges:entities.filter(e=>/^sc4_keydoor_\d+$/.test(v(e,'targetname')??'')).length,
  nativeDisabledDoors:entities.filter(e=>cls(e)==='inter_door'&&(flags(e)&4)).length,
  transitions:entities.filter(e=>['trigger_coop_changelevel','inter_door_coop_changelevel','cof_changelevel','trigger_changelevel'].includes(cls(e))).length,
  recorders:entities.filter(e=>cls(e)==='tape_recorder').length,
  latches:entities.filter(e=>cls(e)==='env_global'&&/^sc4\./.test(v(e,'globalstate')??'')).length,
  endingEntities:entities.filter(e=>['cof_ending','cof_endingcheck'].includes(cls(e))).length,
 };
}
export function auditDirectory(dir){
 const rows=[];
 for(const file of fs.readdirSync(dir).filter(n=>n.endsWith('.bsp')).sort()){
  const map=file.slice(0,-4),report=JSON.parse(fs.readFileSync(path.join(dir,map+'.json'),'utf8'));
  rows.push({map,sourceMap:report.sourceMap,...auditEntities(decodeBsp(fs.readFileSync(path.join(dir,file))).entities)});
 }
 return rows;
}
// One line per original map: aliases and per-alias maxima (aliases repeat the same content).
export function groupBySource(rows){
 const groups=new Map();
 for(const r of rows){const g=groups.get(r.sourceMap)??{sourceMap:r.sourceMap,aliases:[],cameras:0,simonActors:0,weaponGrants:new Set(),keyGrants:0,coopDoors:0,storyLockedDoors:0,keyBridges:0,nativeDisabledDoors:0,transitions:0,recorders:0,latches:0,endingEntities:0};
  g.aliases.push(r.map);for(const k of ['cameras','simonActors','keyGrants','coopDoors','storyLockedDoors','keyBridges','nativeDisabledDoors','transitions','recorders','latches','endingEntities'])g[k]=Math.max(g[k],r[k]);for(const w of r.weaponGrants)g.weaponGrants.add(w);groups.set(r.sourceMap,g);}
 return [...groups.values()].map(g=>({...g,weaponGrants:[...g.weaponGrants].sort()}));
}
// Maps the user has played in the 013/014 two-player tests (host logs 2026-10-13, 2026-10-15).
export const PLAYED=new Set(['c_intro','c_nightmare','c_start','c_apartment1','c_apartment2','c_apartment3','c_apartment4']);
export function markdown(groups,rows){
 const yes=n=>n?String(n):'-';
 const lines=['| Original | Aliases | Cutscenes (cameras) / Simon actors | Weapon grants | Co-op doors (story-locked) / key bridges / native disabled | Transitions | Recorders | Latches / endings | Runtime evidence |','|---|---|---|---|---|---|---|---|---|'];
 for(const g of groups.sort((a,b)=>a.sourceMap.localeCompare(b.sourceMap)))
  lines.push(`| ${g.sourceMap} | ${g.aliases.length} | ${yes(g.cameras)} / ${yes(g.simonActors)} | ${g.weaponGrants.length?g.weaponGrants.join(', '):'-'} | ${yes(g.coopDoors)} (${yes(g.storyLockedDoors)}) / ${yes(g.keyBridges)} / ${yes(g.nativeDisabledDoors)} | ${yes(g.transitions)} | ${yes(g.recorders)} | ${yes(g.latches)} / ${yes(g.endingEntities)} | ${PLAYED.has(g.sourceMap)?'played in 013/014 tests (v0.1 changes NOT yet played)':'static only'} |`);
 const total=k=>rows.reduce((n,r)=>n+(Array.isArray(r[k])?r[k].length:r[k]),0);
 lines.push('',`Totals over ${rows.length} shipped maps: ${total('cameras')} scene cameras, ${total('simonActors')} Simon actor entities, ${total('weaponGrants')} weapon grants, ${total('coopDoors')} co-op door buttons (${total('storyLockedDoors')} story-locked), ${total('keyBridges')} key-door bridges, ${total('nativeDisabledDoors')} natively disabled inter_doors, ${total('transitions')} transition entities, ${total('recorders')} tape recorders.`);
 return lines.join('\n')+'\n';
}
export function main(args){
 if(args.length!==3)throw Error('Usage: audit-v01.mjs MAP_BUILD_DIR OUT_JSON OUT_MARKDOWN');
 const [dir,json,md]=args,rows=auditDirectory(dir),groups=groupBySource(rows);
 fs.writeFileSync(json,JSON.stringify({maps:rows.length,originals:groups.length,rows},null,1)+'\n');fs.writeFileSync(md,markdown(groups,rows));
 console.log(JSON.stringify({maps:rows.length,originals:groups.length}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{main(process.argv.slice(2));}catch(e){console.error(e.stack);process.exitCode=1;}}
