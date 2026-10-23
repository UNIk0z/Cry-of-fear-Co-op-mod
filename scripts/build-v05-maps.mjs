// v0.5 map pass over the delivered v0.4 maps (= the v0.2 build; v0.3/v0.4 changed
// only the adapter). Usage: node build-v05-maps.mjs V04_MAP_BUILD ORIGINAL_MAPS NEW_BUILD
// Every map is reconstructed byte for byte from its single-player source and plan
// (as build-v02-maps.mjs), then these entity edits are made (entity lump only):
// 1. Spawn slots inside an exit or a solid wall (spawn-exits.mjs): moved to the nearest standing
//    spot outside every exit trigger, clear of the other slots and reachable on
//    foot from slot 1.
// 2. Fall zones that kill every player kill only the one who falls (fallZones).
// 3. Co-op door panels let the next player through after 0.5 s (doorWaits).
// 4. Extra ammo copies sit in a 2x2 square with the original (ammoSquares).
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeBsp,sha256,uniqueValue as v} from './bsp.mjs';
import {assembleCampaign} from './build-connected-campaign.mjs';
import {worldHull,sampleSpawn} from './collision.mjs';
import {exitTriggers,hullTouches,coopSpawns,brushSolid} from './spawn-exits.mjs';
import {xyz} from './campaign-destinations.mjs';

// The delivered v0.4 catalog (W/outputs/v04-candidate/release.json); its maps are the input.
export const V05_PARENT='f610774e';   // prefix; the packaging pins the full hash

const overlaps=(a,b)=>Math.abs(a[0]-b[0])<32&&Math.abs(a[1]-b[1])<32&&Math.abs(a[2]-b[2])<72;
export function relocateSpawns(bytes,entities,changes){
 const bsp={...decodeBsp(bytes),entities};const exits=exitTriggers(bytes,bsp);const spawns=coopSpawns(bsp);
 if(!spawns.length)return 0;const hull=worldHull(bytes),inBrush=brushSolid(bytes,bsp);let edits=0;
 const free=p=>sampleSpawn(hull,p).staticCandidate&&!exits.some(b=>hullTouches(p,b,16))&&inBrush(p)===undefined;
 const first=spawns.find(s=>s.slot===1)??spawns[0];
 // Floor reachable on foot from slot 1 (8-unit steps, stairs by +-8/16, never
 // through a wall or an exit), nearest first; the first free one is taken.
 const walk=anchor=>{
  const seen=new Set([anchor.join(',')]),queue=[anchor],out=[];
  while(queue.length&&seen.size<6000){const p=queue.shift();out.push(p);
   for(const [dx,dy] of [[8,0],[-8,0],[0,8],[0,-8]]){if(Math.hypot(p[0]+dx-anchor[0],p[1]+dy-anchor[1])>256)continue;
    for(const dz of [0,8,-8,16,-16]){const q=[p[0]+dx,p[1]+dy,p[2]+dz],key=q.join(',');if(seen.has(key))break;
     if(!sampleSpawn(hull,q).staticCandidate||hull.contents(p.map((x,i)=>(x+q[i])/2))!==-1||exits.some(b=>hullTouches(q,b)))continue;
     seen.add(key);queue.push(q);break;}}}
  return out;
 };
 for(const s of spawns){
  const wall=inBrush(s.origin);
  if(!exits.some(b=>hullTouches(s.origin,b))&&wall===undefined)continue;
  const anchor=free(first.origin)?first.origin:s.origin;
  const found=walk(anchor).find(p=>free(p)&&!spawns.some(o=>o!==s&&overlaps(o.origin,p)))??null;
  const what=wall===undefined?'an exit':'a wall';
  if(!found){changes.push({kind:`v05 spawn slot inside ${what}, no free spot found`,slot:s.slot,origin:s.origin});continue;}
  const was=s.origin;s.origin=found;s.entity.pairs=s.entity.pairs.map(([k,x])=>[k,k==='origin'?found.join(' '):x]);edits++;
  changes.push({kind:`v05 spawn slot moved out of ${what}`,slot:s.slot,from:was,to:found,...(wall===undefined?{exits:exits.filter(b=>hullTouches(was,b)).map(b=>b.entity)}:{wall})});
 }
 return edits;
}
// 2. Fall zones (playtest: "when he fell to his death in the death trigger i also
//    died", s4_subwaysick1). A touch trigger whose only target is a
//    cof_killplayer kills EVERY player (decomp effects.cpp CCoFKillPlayer::Use
//    loops all clients), so one fall ended the game for everyone. Such a trigger
//    becomes a trigger_hurt of 1000 that kills only whoever falls in; the dead
//    player can then be revived (the adapter brings the body to a partner,
//    coop-runtime.hpp fall_frame). With nobody left alive the game's own game
//    over follows, as before. Scene deaths (a cof_killplayer fired by a
//    multi_manager, s4_attic) are not touched.
export function fallZones(entities,changes){
 const named=n=>entities.filter(e=>v(e,'targetname')===n);let edits=0;
 for(const e of entities){
  const c=v(e,'classname');if(c!=='trigger_once'&&c!=='trigger_multiple')continue;
  const t=v(e,'target');if(!t||v(e,'master')||v(e,'killtarget')||Number(v(e,'delay')??0)>0)continue;
  const targets=named(t);if(!targets.length||!targets.every(x=>v(x,'classname')==='cof_killplayer'))continue;
  e.pairs=e.pairs.filter(([k])=>!['classname','target','spawnflags','wait','delay','message'].includes(k));
  e.pairs.push(['classname','trigger_hurt'],['dmg','1000'],['spawnflags','0']);edits++;
  changes.push({kind:'v05 fall zone kills only who falls in',entity:e.index,was:c,killplayer:t});
 }
 return edits;
}
// 3. Same-map co-op doors (playtest: "the other person cant go behind you because
//    only 1 person can use a door at a time"). A converted door is a func_button
//    with wait 2.5 that fires a multithreaded presentation manager
//    (cof_story_presentN: fade, teleport at 1.2 s, close, reveal; each thread keeps
//    its own activator). The 2.5 s wait locked the panel for everyone else
//    (DOOR_PRESENTATION.md deferred a per-player cooldown). It becomes 0.5 s: the
//    next player follows at once; a second press by the same player only repeats
//    the fade and the teleport to the same spot.
export const DOOR_WAIT='0.5';
export function doorWaits(entities,changes){
 let edits=0;
 for(const e of entities){
  if(v(e,'classname')!=='func_button'||!/^cof_story_present\d+$/.test(v(e,'target')??'')||v(e,'wait')!=='2.5')continue;
  e.pairs=e.pairs.map(([k,x])=>[k,k==='wait'?DOOR_WAIT:x]);edits++;
 }
 if(edits)changes.push({kind:'v05 co-op door panel wait 2.5 -> '+DOOR_WAIT+' s',doors:edits});
 return edits;
}
// 4. Extra ammo for the other players (playtest: "the ammo is supposed to be on the
//    scaffolding but because there is so much ammo it just fell off"). The
//    connected-campaign build (build-connected-campaign.mjs) gave each plain
//    ammo/weapon pickup up to three copies 36..96 units away in a line, checked
//    against the world hull only, so copies on a scaffold or a table (brush
//    entities) landed beside it and fell. The copies now sit in a 2-by-2 square
//    with the original, 14 units apart, on the original's own height, toward
//    the side the old copies were on.
export const AMMO_SPACING=14;
export function ammoSquares(entities,originalCount,changes){
 const key=e=>JSON.stringify(e.pairs.filter(([k])=>k!=='origin'));let edits=0;
 const sources=entities.slice(0,originalCount).filter(e=>/^(ammo_|weapon_)/.test(v(e,'classname')??'')&&xyz(v(e,'origin')));
 const extra=entities.slice(originalCount);
 for(const s of sources){
  const at=xyz(v(s,'origin')),k=key(s);
  const copies=extra.filter(e=>key(e)===k&&(p=>p&&Math.hypot(p[0]-at[0],p[1]-at[1])<=100&&Math.abs(p[2]-at[2])<1)(xyz(v(e,'origin'))));
  if(!copies.length||copies.length>3)continue;
  const mean=[0,1].map(i=>copies.reduce((sum,c)=>sum+xyz(v(c,'origin'))[i]-at[i],0));
  const sx=mean[0]<0?-AMMO_SPACING:AMMO_SPACING,sy=mean[1]<0?-AMMO_SPACING:AMMO_SPACING;
  const slots=[[sx,0],[0,sy],[sx,sy]];
  copies.forEach((c,i)=>{const p=[at[0]+slots[i][0],at[1]+slots[i][1],at[2]];c.pairs=c.pairs.map(([kk,x])=>[kk,kk==='origin'?p.join(' '):x]);edits++;});
  changes.push({kind:'v05 extra pickups in a 2x2 square',entity:s.index,type:v(s,'classname'),copies:copies.length});
 }
 return edits;
}
// 5. The first map's extras room (Katz 2026-10-22: "keep the first-level
//    extras-room tunnel door locked for now: the door on the left with the
//    creepy painting"). c_start's inter_door "unlockablesdoor" (#828, music
//    unlockables.mp3) became an ordinary co-op door panel. The panel gets a
//    lock no item opens: CBaseButton keeps m_isLocked while lockedby is set
//    (decomp buttons.cpp) and plays the latch sound with a short message.
export function extrasDoorLocked(entities,changes){
 let edits=0;
 for(const e of entities){
  if(v(e,'classname')!=='func_button'||v(e,'targetname')!=='unlockablesdoor'||v(e,'lockedby'))continue;
  e.pairs.push(['lockedby','sc5_extras_later'],['lockedmsg','It\'s locked.'],['lockedsnd','buttons/latchlocked1.wav']);edits++;
  changes.push({kind:'v05 extras room door locked',entity:e.index});
 }
 return edits;
}
export function applyV05({parentBytes,entities,changes,originalCount}){return relocateSpawns(parentBytes,entities,changes)+fallZones(entities,changes)+doorWaits(entities,changes)+(originalCount?ammoSquares(entities,originalCount,changes):0)+extrasDoorLocked(entities,changes);}

export function main(args){
 if(args.length!==3)throw Error('Usage: build-v05-maps.mjs V04_MAP_BUILD ORIGINAL_MAPS NEW_BUILD');
 const [previous,maps,out]=args.map(a=>path.resolve(a));
 if(fs.existsSync(out))throw Error('Fresh output directory required');fs.mkdirSync(out,{recursive:true});
 const changed=[],counts={};let total=0;
 for(const f of fs.readdirSync(previous).filter(f=>f.endsWith('.json')&&!/^(state-report|v0\d-summary)\.json$/.test(f)).sort()){
  const map=f.slice(0,-5),plan=JSON.parse(fs.readFileSync(path.join(previous,f),'utf8')),parentBytes=fs.readFileSync(path.join(previous,map+'.bsp'));
  if(plan.map!==map||sha256(parentBytes)!==plan.outputSha256)throw Error('Previous build changed: '+map);
  const source=fs.readFileSync(path.join(maps,plan.sourceMap+'.bsp'));if(sha256(source)!==plan.sourceSha256)throw Error('Original map changed: '+plan.sourceMap);
  const entities=structuredClone(decodeBsp(parentBytes).entities),models=plan.modelClones??[];
  if(!assembleCampaign(source,entities,models).output.equals(parentBytes))throw Error('v0.4 map reconstruction mismatch: '+map);
  const changes=[];const edits=applyV05({parentBytes,entities,changes,originalCount:decodeBsp(source).entities.length});
  if(!edits){fs.copyFileSync(path.join(previous,map+'.bsp'),path.join(out,map+'.bsp'));fs.copyFileSync(path.join(previous,f),path.join(out,f));if(changes.length)console.error(map,JSON.stringify(changes));continue;}
  const built=assembleCampaign(source,entities,models);
  const report={...plan,v05:true,v05ParentSha256:plan.outputSha256,v05ParentPlanSha256:sha256(fs.readFileSync(path.join(previous,f))),v05Changes:changes,
   edits:built.edits,appendText:built.appendText,entities:built.entities,outputSha256:sha256(built.output),fileBytes:built.output.length,status:'AWAITING GAMEPLAY VERIFICATION'};
  fs.writeFileSync(path.join(out,map+'.bsp'),built.output);fs.writeFileSync(path.join(out,f),JSON.stringify(report,null,2)+'\n');
  changed.push(map);total+=edits;for(const c of changes)counts[c.kind]=(counts[c.kind]??0)+1;
 }
 const summary={schemaVersion:1,v05:true,previous,changedMaps:changed,edits:total,changeCounts:counts};
 fs.writeFileSync(path.join(out,'v05-summary.json'),JSON.stringify(summary,null,2)+'\n');
 const state=JSON.parse(fs.readFileSync(path.join(previous,'state-report.json'),'utf8'));
 fs.writeFileSync(path.join(out,'state-report.json'),JSON.stringify({...state,v05:true,v05ChangedMaps:changed,v05ChangeCounts:counts},null,2)+'\n');
 return summary;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{const s=main(process.argv.slice(2));console.log(JSON.stringify({changedMaps:s.changedMaps.length,edits:s.edits,changeCounts:s.changeCounts}));}catch(e){console.error(e.stack);process.exitCode=1;}}
