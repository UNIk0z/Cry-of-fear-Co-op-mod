// v0.5 (playtest 2026-10-21: "more than 1 player ... stuck in a loop between the
// level changes"; host log: 40+ s4_park <-> s4_park2 changes). A co-op spawn
// slot whose standing player hull overlaps a touch trigger that leads to a level
// change sends that player straight back on arrival. The original maps placed
// the single-player arrival just outside such triggers; the co-op slot search
// (campaign-destinations.mjs) only avoided trigger_changelevel brushes, while
// CoF exits are usually trigger_once/trigger_multiple -> cof_changelevel.
import {uniqueValue as v} from './bsp.mjs';
import {brushBounds,xyz} from './campaign-destinations.mjs';

const LEVEL_CHANGE=new Set(['cof_changelevel','trigger_changelevel']);
// Every name an entity fires: its target, and for a multi_manager each key that is a target name.
function fires(entity){
 const out=[];const t=v(entity,'target');if(t)out.push(t);
 if(v(entity,'classname')==='multi_manager')for(const [k] of entity.pairs)if(!['classname','targetname','origin','spawnflags','wait','master'].includes(k))out.push(k.replace(/#\d+$/,''));
 return out;
}
// Touch triggers whose chain (at most 4 steps) ends in a level change.
export function exitTriggers(bytes,bsp){
 const byName=new Map();for(const e of bsp.entities){const n=v(e,'targetname');if(n){if(!byName.has(n))byName.set(n,[]);byName.get(n).push(e);}}
 const leads=(names,depth,seen)=>names.some(n=>{if(seen.has(n))return false;seen.add(n);return (byName.get(n)??[]).some(e=>{
  const c=v(e,'classname');if(LEVEL_CHANGE.has(c))return true;
  if(c==='trigger_command'&&/changelevel|\bmap /.test(v(e,'command')??v(e,'message')??''))return true;
  return depth<4&&leads(fires(e),depth+1,seen);});});
 const out=[];
 for(const e of bsp.entities){
  const c=v(e,'classname');
  if(c==='trigger_changelevel'&&!(Number(v(e,'spawnflags')??0)&2)){const b=brushBounds(bytes,bsp,e);if(b)out.push({...b,entity:e.index,classname:c,target:v(e,'map')});continue;}
  if(c!=='trigger_once'&&c!=='trigger_multiple')continue;
  if(!leads(fires(e),0,new Set()))continue;
  const b=brushBounds(bytes,bsp,e);if(b)out.push({...b,entity:e.index,classname:c,target:v(e,'target')});
 }
 return out;
}
// Standing player hull (32x32x72, origin 36 above the feet) against a brush, with a margin.
export function hullTouches(origin,b,margin=0){
 return [0,1,2].every(i=>{const half=i===2?36:16;return origin[i]+half+margin>=b.mins[i]+b.translation[i]&&origin[i]-half-margin<=b.maxs[i]+b.translation[i];});
}
export function coopSpawns(bsp){
 return bsp.entities.filter(e=>/^cof_coop_spawn[1-4]$/.test(v(e,'classname')??'')).map(e=>({entity:e,slot:Number(v(e,'classname').slice(-1)),origin:xyz(v(e,'origin')),angles:xyz(v(e,'angles')??'0 0 0')}));
}
// v0.5 (B2, "black box ... traps the second player"): a point test of the
// standing hull (clipnode hull 1) against the solid brush entities a map starts
// with. s4_start slot 2 stands inside func_wall_toggle "block" #119, the black box.
const SOLID_BRUSHES=new Set(['func_wall','func_wall_toggle','func_door','func_door_rotating','func_breakable','func_pushable','func_train','func_tracktrain','momentary_door','func_plat','func_rotating']);
export function brushSolid(bytes,bsp){
 const lump=i=>{const l=bsp.lumps[i];return bytes.subarray(l.offset,l.offset+l.length);};
 const planes=lump(1),nodes=lump(9),models=lump(14);
 const contents=(model,p)=>{let n=models.readInt32LE(model*64+40),guard=0;
  while(n>=0&&guard++<65536){const at=n*8,pl=nodes.readInt32LE(at)*20;const d=[0,4,8].reduce((t,k,i)=>t+planes.readFloatLE(pl+k)*p[i],0)-planes.readFloatLE(pl+12);n=nodes.readInt16LE(at+4+(d>=0?0:2));}
  return n;};
 const solids=bsp.entities.filter(e=>SOLID_BRUSHES.has(v(e,'classname'))&&!(v(e,'classname')==='func_wall_toggle'&&Number(v(e,'spawnflags')??0)&1)&&/^\*\d+$/.test(v(e,'model')??''))
  .map(e=>({entity:e.index,model:Number(v(e,'model').slice(1)),at:xyz(v(e,'origin')??'0 0 0')??[0,0,0]}));
 return origin=>solids.find(s=>contents(s.model,origin.map((x,i)=>x-s.at[i]))===-2)?.entity;
}
export function blockedSpawns(bytes,bsp){
 const exits=exitTriggers(bytes,bsp);
 return coopSpawns(bsp).map(s=>({...s,exits:exits.filter(b=>hullTouches(s.origin,b))})).filter(s=>s.exits.length);
}
