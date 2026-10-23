import fs from 'node:fs';
import path from 'node:path';
import {decodeBsp,uniqueValue as v} from './bsp.mjs';
import {analyzeStoryDoors} from './convert-story-doors.mjs';
import {destinationEvidence,brushBounds} from './campaign-destinations.mjs';
import {createFadeDoorPlan,PRESENTATION_TIMING} from './build-door-presentation.mjs';
import {worldHull} from './collision.mjs';
import {convertKeyDoor} from './conditional-story-doors.mjs';

// Campaign-wide conversion of the native same-map inter_doors RC2 retained.
// A native SP inter_door loses mutual player visibility in multiplayer, so
// every door a story path may use becomes the user-verified relocation
// (func_button -> actor fade/audio -> cof_teleport -> inter_door_exit origin).
// Native semantics read from hl.dll (no patching):
// - cof_interdooronoff Use 100A6EA0 TOGGLES the first entity named by message.
// - inter_door_disable Use 10049280 needs a player activator and calls
//   SetDisabled 10048030 with (frags == 0): frags 1 enables, 0 disables.
//   inter_door spawnflag 4 starts disabled (Spawn 10048BD6, +0x180).
// - cof_inter_door_exitchange Use 10048EF0 swaps a door's target at runtime:
//   such doors stay native (their destination is not static).
// - inter_door spawnflag 2 only changes the arrival view handling of the
//   native teleport step (100484CE -> 100EA5C0); the relocation is equivalent.
// - Key use 100E4630 needs the exact native inter_door: keydoor-runtime bridge.
const cls=e=>v(e,'classname');
const DEFAULT_AUDIO={opening:'doors/doormove1.wav',closing:'doors/doorstop8.wav'};
export const keyName=e=>{const m=(v(e,'message')??'').match(/([^/\\]+)\.txt$/i);return m?m[1].toLowerCase():null;};
// coop-fixes-013 (user: the hallway door and the basement door were still
// native): scripted=true also counts keys a story script hands out, a
// cof_giveitems in item mode (spawnflag 1, message inventoryitems/NAME.txt;
// the item branch 100A6C0D adds that card), e.g. c_apartment1 hallkey and
// c_apartment5 basementkey. Their doors then get the same key-door bridge.
export function campaignKeys(mapsDir,sources,{scripted=false}={}){
 const keys=new Map();
 const given=e=>cls(e)==='item_key'||(scripted&&cls(e)==='cof_giveitems'&&(Number(v(e,'spawnflags')??0)&1)===1&&/^inventoryitems\//i.test(v(e,'message')??''));
 for(const s of sources)for(const e of decodeBsp(fs.readFileSync(path.join(mapsDir,s+'.bsp'))).entities)if(given(e)&&keyName(e))keys.set(keyName(e),[...(keys.get(keyName(e))??[]),s]);
 return keys;
}
function references(entities,name){
 if(!name)return [];
 return entities.flatMap((e,index)=>{const keys=e.pairs.filter(([k,val])=>k!=='targetname'&&val===name).map(([k])=>k);
  if(cls(e)==='multi_manager')for(const [k] of e.pairs)if(k.replace(/#.*$/,'')===name)keys.push('manager:'+k);
  return keys.length?[{index,classname:cls(e),keys}]:[];});
}
// How many authored activations reach an entity (manager keys, targets). A
// repeatable caller (button, multiple trigger) counts as several.
const REPEATABLE=new Set(['func_button','trigger_multiple','func_rot_button','momentary_rot_button','game_counter','trigger_relay']);
function firings(entities,name){return references(entities,name).reduce((n,r)=>n+r.keys.filter(k=>k==='target'||k.startsWith('manager:')).length*(REPEATABLE.has(r.classname)?2:1),0);}

function audio(door){
 const ok=s=>typeof s==='string'&&/^[a-z0-9_/.-]+\.wav$/i.test(s)&&!s.split('/').includes('..');
 const opening=ok(v(door,'opensound'))?v(door,'opensound'):DEFAULT_AUDIO.opening,closing=ok(v(door,'closesound'))?v(door,'closesound'):DEFAULT_AUDIO.closing;
 return {opening,closing,defaulted:opening!==v(door,'opensound')||closing!==v(door,'closesound')};
}

function relocation({entities,index,door,evidence,bounds,prefix,master,name,sound}){
 const add=o=>{const e={index:entities.length,pairs:Array.isArray(o)?o:Object.entries(o).map(([k,val])=>[k,String(val)])};entities.push(e);return e;};
 const helper=prefix+'_move',dest=prefix+'_dest',tele=prefix+'_tele',origin=bounds.center.join(' ');
 const plan=createFadeDoorPlan({door:index,helper,origin},{destination:evidence.feet.join(' '),opening:sound.opening,closing:sound.closing});
 const taken=new Set(entities.map(e=>v(e,'targetname')).filter(Boolean));
 for(const n of [helper,dest,tele,plan.start,...plan.entities.map(e=>v(e,'targetname')).filter(Boolean)])if(taken.has(n))throw Error('Campaign door name collision '+n);
 entities[index].pairs=door.pairs.filter(([k])=>['model','angles','renderfx','renderamt','rendermode','rendercolor'].includes(k));
 if(name)entities[index].pairs.push(['targetname',name]);
 entities[index].pairs.push(['classname','func_button'],['target',plan.start],['spawnflags','1'],['wait',String(PRESENTATION_TIMING.cooldown)],['sounds','0']);
 if(master)entities[index].pairs.push(['master',master]);
 add({classname:'info_teleport_destination',targetname:dest,origin:evidence.feet.join(' '),angles:evidence.angles.join(' ')});
 // A gated door rechecks access when the delayed move runs: a script may
 // lock it again during the fade.
 add([['classname','multi_manager'],['spawnflags','1'],['targetname',helper],...(master?[['master',master]]:[]),[tele,'0']]);
 add({classname:'cof_teleport',targetname:tele,target:dest,origin});
 for(const e of plan.entities){if(master&&cls(e)==='multi_manager')e.pairs.push(['master',master]);add(e.pairs);}
 const start=entities.find(e=>v(e,'targetname')===plan.start),message=v(door,'message'),music=v(door,'music');
 if(message&&entities.some(e=>v(e,'targetname')===message))start.pairs.push([message,'1.25']);
 if(music&&/^[a-z0-9_/.-]+\.mp3$/i.test(music)){add({classname:'trigger_command',targetname:prefix+'_music',netname:'sv_coop_music '+music});start.pairs.push([prefix+'_music','1.25']);}
 return {start:plan.start,events:plan.events,preservedMessage:message??null,preservedMusic:music??null};
}


// Convert every remaining same-map native door of one RC2 alias. skip: indices
// owned by hand-written RC4 stages. Decide first, then apply, so linked pairs
// stay consistent. Returns per-door decisions.
// "useunlock" (inter_door KeyValue 1004878B -> +0x1A0): passing through door
// A clears the lock of the door it names ("It's locked from the other side").
// Both sides convert together (A's relocation switches B's state on) or both
// stay native: a native useunlock must never reach a converted button.
export function convertCampaignDoors({source,sourceMap,entities,keys,skip=new Set(),changes}){
 const bsp=decodeBsp(source),original=bsp.entities,hull=worldHull(source),inventory=analyzeStoryDoors(source,{sourceMap}),decisions=[];
 const add=o=>{const e={index:entities.length,pairs:Object.entries(o).map(([k,val])=>[k,String(val)])};entities.push(e);return e;};
 const doorNames=new Map();for(const e of original)if(cls(e)==='inter_door'&&v(e,'targetname'))doorNames.set(v(e,'targetname'),(doorNames.get(v(e,'targetname'))??0)+1);
 const doorByName=name=>original.findIndex(e=>cls(e)==='inter_door'&&v(e,'targetname')===name);
 const plans=new Map();
 for(const record of inventory.doors){
  const i=record.index,door=original[i],native=reason=>plans.set(i,{i,kind:'native',reason});
  if(skip.has(i)){plans.set(i,{i,kind:'owned',reason:'hand-written stage'});continue;}
  if(cls(entities[i])!=='inter_door'){plans.set(i,{i,kind:'done',reason:'RC2 or earlier stage'});continue;}
  if(JSON.stringify(entities[i].pairs)!==JSON.stringify(door.pairs)){native('parent edited this door');continue;}
  if(record.crossMapPath){native('cross-map door: one player triggers the level change for everyone');continue;}
  if(!record.destination){native('no inter_door_exit (decor or locked scenery)');continue;}
  const name=v(door,'targetname')??null,lock=v(door,'lockedby')??null,master=v(door,'master')??null,flags=Number(v(door,'spawnflags')??0);
  const refs=references(original,name),toggles=refs.filter(r=>r.classname==='cof_interdooronoff'&&r.keys.every(k=>k==='message'));
  const switches=refs.filter(r=>r.classname==='inter_door_disable'&&r.keys.every(k=>k==='target'));
  const unlockers=refs.filter(r=>r.classname==='inter_door'&&r.keys.every(k=>k==='useunlock'));
  const kills=refs.filter(r=>r.keys.every(k=>k==='killtarget'));
  const other=refs.filter(r=>![...toggles,...switches,...unlockers,...kills].includes(r));
  if(other.length){native('name used by other logic: '+other.map(o=>o.classname+':'+o.keys.join('+')).join(' '));continue;}
  if(name&&doorNames.get(name)>1&&(toggles.length||switches.length||unlockers.length)){native('shared door name with a lock controller');continue;}
  if(flags&~6){native('unknown spawnflags '+flags);continue;}
  const unlocks=v(door,'useunlock')??null,unlockTarget=unlocks?doorByName(unlocks):-1;
  if(unlocks&&unlockTarget<0){native('useunlock names no door');continue;}
  const evidence=destinationEvidence(source,bsp,door,hull),bounds=brushBounds(source,bsp,door);
  // The native door teleports to this exact exit too: a narrow landing (stairs,
  // closet, corridor) with standing support is no worse than the native move.
  const narrow=!evidence.safe&&evidence.sample?.staticCandidate===true&&Array.isArray(evidence.feet);
  if((!evidence.safe&&!narrow)||!bounds){native('destination has no standing support: '+(evidence.reason??'no bounds'));continue;}
  if(narrow)evidence.narrowLanding=true;
  const sound=audio(door),key=lock?keys.get(lock.toLowerCase()):null,base={i,door,name,lock,flags,evidence,bounds,sound,unlocks,unlockTarget,kills};
  if(lock&&key&&!narrow&&!toggles.length&&!switches.length&&!unlockers.length&&!name&&!master&&!(flags&4)&&!unlocks){plans.set(i,{...base,kind:'key',key});continue;}
  if(lock&&!toggles.length&&!unlockers.length){native('locked with no key or script unlock (native locked message)');continue;}
  if(master){native('authored master on a converted map is not yet modelled');continue;}
  if(lock&&switches.length){native('both a lock and a disable switch');continue;}
  if((flags&4)&&!switches.length){native('starts disabled and nothing enables it');continue;}
  // Total authored activations of all lock controllers. Exactly one: a
  // persistent shared switch (checkpoints keep it). More: the door is locked
  // and unlocked in sequence; it toggles per visit exactly like the native
  // cof_interdooronoff, because revisits and Continue re-run those scripts.
  const fired=toggles.reduce((n,t)=>{const tn=v(original[t.index],'targetname');return n+(tn?firings(original,tn):0);},0),perVisit=toggles.length>0&&fired!==1;
  if(perVisit&&(switches.length||unlockers.length)){native('repeatedly toggled door that also has other lock controllers');continue;}
  if(toggles.length||switches.length||unlockers.length||(flags&4))plans.set(i,{...base,kind:'gated',toggles,switches,unlockers,fired,perVisit,initial:lock||(flags&4)?0:1,state:perVisit?null:`sc4.door.${sourceMap}.${i}.enabled`});
  else plans.set(i,{...base,kind:'plain'});
 }
 // Linked pairs convert together or not at all.
 const converted=p=>p&&['plain','gated','key'].includes(p.kind);
 for(let changed=true;changed;){changed=false;
  for(const p of plans.values())if(converted(p)){
   const target=p.unlocks?plans.get(p.unlockTarget):null;
   if(p.unlocks&&!(target?.kind==='gated'&&!target.perVisit)){plans.set(p.i,{i:p.i,kind:'native',reason:'its useunlock door cannot be converted'});changed=true;continue;}
   if(p.kind==='gated'&&p.unlockers.some(u=>!converted(plans.get(u.index)))){plans.set(p.i,{i:p.i,kind:'native',reason:'unlocked from a door that stays native'});changed=true;}
  }}
 for(const p of [...plans.values()].sort((a,b)=>a.i-b.i)){
  const decide=(status,reason,extra={})=>decisions.push({entity:p.i,status,reason,...extra});
  if(p.kind==='owned'){decide('OWNED_BY_RC4_STAGE',p.reason);continue;}
  if(p.kind==='done'){decide('ALREADY_CONVERTED',p.reason);continue;}
  if(p.kind==='native'){decide('KEPT_NATIVE',p.reason);continue;}
  if(p.kind==='key'){convertKeyDoor({source,entities,index:p.i,state:`sc4.door.${sourceMap}.${p.i}.unlocked`,changes});decide('CONVERTED_KEY_DOOR','native key use bridged by the adapter',{key:p.lock,keySources:p.key});continue;}
  const prefix='sc4_cd_'+p.i;let master=null;const controllers=[];
  if(p.kind==='gated'){
   // One shared, persistent state per authored door; checkpoints carry it in
   // the native global stream. A door activated once becomes an idempotent
   // On/Off (revisits re-run map scripts); repeated activation keeps toggling.
   const at=p.bounds.center.join(' ');master=prefix+'_gate';
   if(p.perVisit){
    // Native multisource Use toggles its caller's slot; one router relay is the
    // only registered input, so every authored toggle flips the same slot.
    const router=prefix+'_router';
    for(const t of p.toggles){const te=original[t.index],tn=v(te,'targetname');
     entities[t.index].pairs=[['classname','trigger_relay'],...(tn?[['targetname',tn]]:[]),['origin',v(te,'origin')??at],['target',router],['triggerstate','2']];
     controllers.push({entity:t.index,kind:'cof_interdooronoff',fired:tn?firings(original,tn):0,mode:'toggle per visit'});}
    add({classname:'trigger_relay',targetname:router,target:master,triggerstate:2,origin:at});
    add({classname:'multisource',targetname:master,origin:at});
    // multisource registers its inputs on a deferred think; open an initially
    // unlocked door after that.
    if(p.initial)add({classname:'trigger_auto',target:router,delay:0.4,triggerstate:2,spawnflags:1,origin:at});
   }else{
   for(const t of p.toggles){const te=original[t.index],tn=v(te,'targetname'),fired=tn?firings(original,tn):0,mode=p.initial?0:1;
    entities[t.index].pairs=[['classname','env_global'],...(tn?[['targetname',tn]]:[]),['origin',v(te,'origin')??at],['globalstate',p.state],['triggermode',String(mode)],['initialstate',String(p.initial)],['spawnflags','1']];
    controllers.push({entity:t.index,kind:'cof_interdooronoff',fired,mode:['off','on','dead','toggle'][mode]});}
   for(const s of p.switches){const se=original[s.index],sn=v(se,'targetname'),mode=Number(v(se,'frags')??0)!==0?1:0;
    entities[s.index].pairs=[['classname','env_global'],...(sn?[['targetname',sn]]:[]),['origin',v(se,'origin')??at],['globalstate',p.state],['triggermode',String(mode)],['initialstate',String(p.initial)],['spawnflags','1']];
    controllers.push({entity:s.index,kind:'inter_door_disable',mode:mode?'enable':'disable'});}
   for(const u of p.unlockers)controllers.push({entity:u.index,kind:'useunlock (other side)',mode:'on when that door is used'});
   add({classname:'multisource',targetname:master,globalstate:p.state,origin:at});
   }
  }
  const plan=relocation({entities,index:p.i,door:p.door,evidence:p.evidence,bounds:p.bounds,prefix,master,name:p.name,sound:p.sound});
  let unlock=null;
  if(p.unlocks){const target=plans.get(p.unlockTarget),name=prefix+'_unlock';unlock={door:p.unlockTarget,state:target.state};
   add({classname:'env_global',targetname:name,globalstate:target.state,triggermode:1,initialstate:target.initial,spawnflags:1,origin:p.bounds.center.join(' ')});
   entities.find(e=>v(e,'targetname')===plan.start).pairs.push([name,'1.25']);}
  if(p.kind==='gated'){changes.push({kind:'campaign gated door',entity:p.i,name:p.name,state:p.state,initial:p.initial,controllers,unlocks:unlock,evidence:p.evidence,audio:p.sound,...plan,status:'AWAITING GAMEPLAY VERIFICATION'});
   decide('CONVERTED_GATED_DOOR',p.perVisit?'locked and unlocked in sequence: toggles per visit like the native door':'script-controlled access kept as a shared global',{state:p.state,initial:p.initial,perVisit:!!p.perVisit,controllers});}
  else{changes.push({kind:'campaign door',entity:p.i,name:p.name,killedBy:p.kills.map(k=>k.index),spawnflags:p.flags,unlocks:unlock,evidence:p.evidence,audio:p.sound,...plan,status:'AWAITING GAMEPLAY VERIFICATION'});
   decide('CONVERTED_DOOR',p.name?'named; only removed by scripts':'no conditions RC2 could model',{audioDefaulted:p.sound.defaulted,unlocks:unlock});}
 }
 return decisions;
}
