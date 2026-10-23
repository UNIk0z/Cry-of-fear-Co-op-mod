// v0.2 map pass over the delivered v0.1 maps (user playtest 2026-10-16).
// Usage: node build-v02-maps.mjs V01_MAP_BUILD ORIGINAL_MAPS NEW_BUILD
// Every map of V01_MAP_BUILD (bsp + plan json) is read, reconstructed byte for
// byte from its single-player source and plan, and these entity edits are made
// (entity lump only; original geometry untouched; all records in the plan):
// 1. Staged actors. Single player hides every staged actor when a level starts:
//    the arriving player stands in (or is teleported into) a trigger whose chain
//    runs env_customize m_iVisible 2 at 0..1 s (c_apartment1 trigger_once 343 ->
//    multispawnhe, c_asylum1 2 -> multistartas, c_start 120, ...). Co-op players
//    arrive on cof_coop_spawn points and a revisit is a fresh map load, so those
//    hides never ran and the actors stood idle until their scene. Each actor that
//    such a chain hides and that a scene later shows (env_customize m_iVisible 1)
//    gets an unnamed env_customize m_iVisible 2: the game's own spawn-time path
//    (CEnvCustomize::PostSpawn -> UTIL_DesiredAction). A hide is idempotent, so a
//    first visit that still runs the original chain is unchanged.
// 2. Sparks the same chain switches off at 0..1 s (env_spark toggles on any Use,
//    decomp buttons.cpp) start off instead, and that toggle is removed from the
//    chain: the state after the chain is the same, with or without the chain.
// 3. Chains the co-op build gated to the first visit (a master the original
//    trigger does not have): an actor the scene hides at its end (c_apartment1
//    "fuckingplayer", Simon at the start, hidden at 10 s) is hidden at load and
//    shown again by the chain at 0.1 s, so the first visit plays as before and a
//    revisit does not show the actor standing there.
// 4. Door audio. CInterDoor (decomp CoF_InterDoor.cpp) plays the door's music
//    for its user (loop = spawnflags 2) and a "silentroom" door stops the track;
//    "propertarget" fires after the move. The converted doors only set the
//    sv_coop_music cvar (read by PlayerSpawn alone): they now run the adapter's
//    "sc_door_music <track> <loop> 0" (shared music, no restart for a player who
//    already has the track); silent rooms run "sc_door_music - 0 <fade>";
//    propertarget is fired by the door's presentation chain; the native
//    inter_door_coop_changelevel gets its door's "music" key back (it plays it
//    for every player and sets sv_coop_music for the next map's spawns).
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeBsp,sha256} from './bsp.mjs';
import {assembleCampaign} from './build-connected-campaign.mjs';

// The delivered v0.1 catalog (outputs/v01-candidate/release.json); its maps are the input.
export const V02_PARENT='099eeaef22eca40e5cf41b45e2a403874c05525ee6627ad1dd023a29daf21e19';
const v=(e,k)=>{const p=e.pairs.find(q=>q[0]===k);return p?p[1]:undefined;};
const cls=e=>v(e,'classname');
const SKIP=new Set(['targetname','classname','origin','spawnflags','wait']);
const vec=s=>String(s??'0 0 0').trim().split(/\s+/).map(Number);
const CUSTOMIZE_DEFAULTS=[['body','-1'],['frame','-1'],['m_fFramerate','-1'],['m_flRadius','1000'],['m_iPlayerReact','-1'],['m_voicePitch','-1'],['skin','-1']];

function brushModels(bytes){
 const d=decodeBsp(bytes),l=d.lumps[14],out=[];
 for(let o=l.offset;o+64<=l.offset+l.length;o+=64)out.push({mins:[0,1,2].map(i=>bytes.readFloatLE(o+i*4)),maxs:[0,1,2].map(i=>bytes.readFloatLE(o+12+i*4))});
 return out;
}
const named=(entities,name)=>entities.filter(e=>(v(e,'targetname')??'')===name);
// Ops a chain fires, with times: [{entity, time}] (multi_manager delays, trigger_relay
// delay); ops.managers lists the multi_managers it went through.
export function chainOps(entities,start,startDelay=0){
 const ops=[],seen=new Set();ops.managers=[];
 const walk=(name,time,depth)=>{if(depth>6)return;for(const x of named(entities,name)){if(seen.has(x.index))continue;seen.add(x.index);
  if(cls(x)==='multi_manager'){ops.managers.push(x);for(const [k,val] of x.pairs)if(!SKIP.has(k))walk(k.replace(/#\d+$/,''),time+Number(val),depth+1);}
  else if(cls(x)==='trigger_relay'&&v(x,'target')){ops.push({entity:x,time});walk(v(x,'target'),time+Number(v(x,'delay')??0),depth+1);}
  else ops.push({entity:x,time});}};
 walk(start,startDelay,0);return ops;
}
// Staged actors: named env_models that some named env_customize shows (m_iVisible 1).
export function stagedActors(entities){
 const shown=new Set(entities.filter(e=>cls(e)==='env_customize'&&v(e,'targetname')&&v(e,'m_iVisible')==='1').map(e=>v(e,'target')));
 return new Set(entities.filter(e=>cls(e)==='env_model'&&v(e,'targetname')&&shown.has(v(e,'targetname'))).map(e=>v(e,'targetname')));
}
// Single-player start chains: an unmastered trigger brush containing an arrival
// point whose chain hides at least one staged actor at 0..1 s. Arrival points
// are info_player_start and the destinations of the teleports a player fires
// on arrival: a trigger brush (or trigger_cofteleport) around an info_landmark
// that fires a cof_teleport / targets an info_teleport_destination
// (c_asylum1 as1 -> teleporta1_1 -> teleporta1_1ld inside trigger_once 2).
export function startChains(source){
 const d=decodeBsp(source),entities=d.entities,models=brushModels(source),staged=stagedActors(entities);
 const inside=(e,p)=>{const m=/^\*(\d+)$/.exec(v(e,'model')??'');const b=m&&models[+m[1]];if(!b)return false;const o=vec(v(e,'origin'));return [0,1,2].every(i=>p[i]>=b.mins[i]+o[i]-16&&p[i]<=b.maxs[i]+o[i]+40);};
 const landmarks=entities.filter(e=>cls(e)==='info_landmark').map(e=>vec(v(e,'origin')));
 const points=entities.filter(e=>cls(e)==='info_player_start').map(e=>vec(v(e,'origin')));
 for(const t of entities){
  if(!/^trigger_(once|multiple|cofteleport)$/.test(cls(t))||!v(t,'target')||!landmarks.some(p=>inside(t,p)))continue;
  const targets=cls(t)==='trigger_cofteleport'?[v(t,'target')]:chainOps(entities,v(t,'target')).filter(o=>cls(o.entity)==='cof_teleport').map(o=>v(o.entity,'target'));
  for(const name of targets)for(const dest of named(entities,name))if(cls(dest)==='info_teleport_destination')points.push(vec(v(dest,'origin')));
 }
 const chains=[];
 for(const t of entities){
  if(!/^trigger_(once|multiple)$/.test(cls(t))||!v(t,'target')||v(t,'master')||!points.some(p=>inside(t,p)))continue;
  const ops=chainOps(entities,v(t,'target'),Number(v(t,'delay')??0));
  const hides=ops.filter(o=>o.time<=1&&cls(o.entity)==='env_customize'&&v(o.entity,'m_iVisible')==='2'&&staged.has(v(o.entity,'target')));
  if(hides.length)chains.push({trigger:t.index,target:v(t,'target'),ops,hides:[...new Set(hides.map(o=>v(o.entity,'target')))],
   sparks:[...new Set(ops.filter(o=>o.time<=1&&cls(o.entity)==='env_spark').map(o=>v(o.entity,'targetname')))]});
 }
 return chains;
}
function customize(target,visible,targetname){
 return [['classname','env_customize'],...(targetname?[['targetname',targetname]]:[]),['target',target],['m_iVisible',String(visible)],['origin','0 0 0'],...CUSTOMIZE_DEFAULTS];
}
export function applyV02({source,entities,changes}){
 const original=decodeBsp(source).entities;let edits=0;
 const add=pairs=>{entities.push({index:entities.length,pairs});edits++;};
 const staged=stagedActors(entities);
 const hiddenAtLoad=new Set(entities.filter(e=>cls(e)==='env_customize'&&!v(e,'targetname')&&v(e,'m_iVisible')==='2').map(e=>v(e,'target')));
 const hide=(name,why)=>{if(hiddenAtLoad.has(name)||!named(entities,name).some(e=>cls(e)==='env_model'))return;hiddenAtLoad.add(name);add(customize(name,2));changes.push({kind:'v02 staged actor hidden at load',actor:name,...why});};
 // 1 + 2: single-player start chains.
 const chains=startChains(source);
 for(const c of chains){
  for(const name of c.hides)if(staged.has(name))hide(name,{startTrigger:c.trigger,chain:c.target});
  for(const spark of c.sparks){
   for(const s of named(entities,spark)){if(cls(s)!=='env_spark')continue;const sf=Number(v(s,'spawnflags')??0);if((sf&96)!==96)continue;
    s.pairs=s.pairs.map(([k,val])=>[k,k==='spawnflags'?String(sf&~64):val]);edits++;changes.push({kind:'v02 spark starts off',entity:s.index,spark,startTrigger:c.trigger});}
   for(const m of chainOps(entities,c.target).managers){
    const before=m.pairs.length;m.pairs=m.pairs.filter(([k,val])=>!(k.replace(/#\d+$/,'')===spark&&Number(val)<=1));
    if(m.pairs.length!==before){edits++;changes.push({kind:'v02 spark toggle removed from start chain',entity:m.index,spark});}
   }
  }
 }
 // 3: chains gated by the co-op build to the first visit.
 for(const t of entities){
  const o=original[t.index];if(!o||cls(o)!==cls(t)||!/^trigger_(once|multiple)$/.test(cls(t))||!v(t,'master')||v(o,'master')===v(t,'master')||!v(t,'target'))continue;
  const ops=chainOps(entities,v(t,'target'),Number(v(t,'delay')??0));
  const early=new Set(ops.filter(x=>x.time<=1&&cls(x.entity)==='env_customize'&&v(x.entity,'m_iVisible')==='2').map(x=>v(x.entity,'target')));
  const late=[...new Set(ops.filter(x=>x.time>1&&cls(x.entity)==='env_customize'&&v(x.entity,'m_iVisible')==='2').map(x=>v(x.entity,'target')))].filter(n=>!early.has(n)&&!staged.has(n));
  const first=named(entities,v(t,'target')).find(e=>cls(e)==='multi_manager');if(!first)continue;
  for(const name of late){
   if(!named(entities,name).some(e=>cls(e)==='env_model')||hiddenAtLoad.has(name))continue;
   hide(name,{gatedTrigger:t.index,master:v(t,'master'),endOfScene:true});
   const show='sc5_show_'+name;add(customize(name,1,show));first.pairs.push([show,'0.1']);edits++;
   changes.push({kind:'v02 gated scene shows its actor again',trigger:t.index,actor:name,chain:v(t,'target'),at:0.1});
  }
 }
 // 4: door audio.
 for(const e of entities){
  if(cls(e)!=='trigger_command')continue;const m=/^sv_coop_music (\S+)$/.exec(v(e,'netname')??'');if(!m)continue;
  const door=/(\d+)_music$/.exec(v(e,'targetname')??'');const o=door&&original[+door[1]];
  const loop=o&&/inter_door/.test(cls(o))&&v(o,'music')===m[1]&&(Number(v(o,'spawnflags')??0)&2)?1:0;
  e.pairs=e.pairs.map(([k,val])=>[k,k==='netname'?`sc_door_music ${m[1]} ${loop} 0`:val]);edits++;
  changes.push({kind:'v02 door music heard by every player',entity:e.index,track:m[1],loop,door:door?+door[1]:null});
 }
 for(const o of original){
  if(cls(o)!=='inter_door')continue;const e=entities[o.index];if(!e)continue;
  const silent=v(o,'silentroom')&&v(o,'silentroom')!=='0',proper=v(o,'propertarget'),music=v(o,'music');
  if(cls(e)==='inter_door_coop_changelevel'){
   if(music&&!v(e,'music')){e.pairs.push(['music',music]);if(Number(v(o,'spawnflags')??0)&2)e.pairs.push(['iuser1','1']);edits++;changes.push({kind:'v02 level-change door music',entity:e.index,track:music});}
   continue;
  }
  if(cls(e)!=='func_button'||(!silent&&!proper))continue;
  const chain=named(entities,v(e,'target')??'').find(x=>cls(x)==='multi_manager');if(!chain)continue;
  if(silent){const fade=Number(v(o,'musicfadeout')??-1);const name=`sc5_d${o.index}_silence`;
   if(!named(entities,name).length){add([['classname','trigger_command'],['targetname',name],['netname',`sc_door_music - 0 ${fade>=0?fade:1}`],['origin',v(o,'origin')??'0 0 0']]);chain.pairs.push([name,'0']);edits++;changes.push({kind:'v02 silent room stops the music',door:o.index,fade:fade>=0?fade:1});}}
  if(proper&&!chain.pairs.some(([k])=>k.replace(/#\d+$/,'')===proper)){chain.pairs.push([proper,'1.25']);edits++;changes.push({kind:'v02 door propertarget fired',door:o.index,target:proper});}
 }
 return edits;
}

export function main(args){
 if(args.length!==3)throw Error('Usage: build-v02-maps.mjs V01_MAP_BUILD ORIGINAL_MAPS NEW_BUILD');
 const [previous,maps,out]=args.map(a=>path.resolve(a));
 if(fs.existsSync(out))throw Error('Fresh output directory required');fs.mkdirSync(out,{recursive:true});
 const changed=[],counts={};let total=0;
 for(const f of fs.readdirSync(previous).filter(f=>f.endsWith('.json')&&f!=='state-report.json').sort()){
  const map=f.slice(0,-5),plan=JSON.parse(fs.readFileSync(path.join(previous,f),'utf8')),parentBytes=fs.readFileSync(path.join(previous,map+'.bsp'));
  if(plan.map!==map||sha256(parentBytes)!==plan.outputSha256)throw Error('Previous build changed: '+map);
  const source=fs.readFileSync(path.join(maps,plan.sourceMap+'.bsp'));if(sha256(source)!==plan.sourceSha256)throw Error('Original map changed: '+plan.sourceMap);
  const entities=structuredClone(decodeBsp(parentBytes).entities),models=plan.modelClones??[];
  if(!assembleCampaign(source,entities,models).output.equals(parentBytes))throw Error('v0.1 map reconstruction mismatch: '+map);
  const changes=[];const edits=applyV02({source,entities,changes});
  if(!edits){fs.copyFileSync(path.join(previous,map+'.bsp'),path.join(out,map+'.bsp'));fs.copyFileSync(path.join(previous,f),path.join(out,f));continue;}
  const built=assembleCampaign(source,entities,models);
  const report={...plan,v02:true,v02ParentSha256:plan.outputSha256,v02ParentPlanSha256:sha256(fs.readFileSync(path.join(previous,f))),v02Changes:changes,
   edits:built.edits,appendText:built.appendText,entities:built.entities,outputSha256:sha256(built.output),fileBytes:built.output.length,status:'AWAITING GAMEPLAY VERIFICATION'};
  fs.writeFileSync(path.join(out,map+'.bsp'),built.output);fs.writeFileSync(path.join(out,f),JSON.stringify(report,null,2)+'\n');
  changed.push(map);total+=edits;for(const c of changes)counts[c.kind]=(counts[c.kind]??0)+1;
 }
 const summary={schemaVersion:1,v02:true,previous,changedMaps:changed,edits:total,changeCounts:counts};
 fs.writeFileSync(path.join(out,'v02-summary.json'),JSON.stringify(summary,null,2)+'\n');
 // The packaging reads the build's state report: v0.1's, plus the v0.2 fields.
 const state=JSON.parse(fs.readFileSync(path.join(previous,'state-report.json'),'utf8'));
 fs.writeFileSync(path.join(out,'state-report.json'),JSON.stringify({...state,v02:true,v02PreviousCatalogSha256:V02_PARENT,v02ChangedMaps:changed,v02ChangeCounts:counts},null,2)+'\n');
 return summary;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{const s=main(process.argv.slice(2));console.log(JSON.stringify({changedMaps:s.changedMaps.length,edits:s.edits,changeCounts:s.changeCounts}));}catch(e){console.error(e.stack);process.exitCode=1;}}
