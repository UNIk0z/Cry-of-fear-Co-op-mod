import {uniqueValue as v} from './bsp.mjs';

// IDs belong to authored story events, never to an arrival/map alias. Native
// env_global initializes a missing record only (10015080); On/Off writes are
// explicit and idempotent. No load reset is permitted outside the new lobby.
export const RC4_STATE_IDS={
 blacker:'sc4.event.c_start.blacker',wake:'sc4.event.c_start.wake',
 padlock:'sc4.puzzle.c_start.padlock',computer:'sc4.event.c_start2.computer',
 cafeAlive204:'sc4.door.c_start2.204.alive',cafeAlive206:'sc4.door.c_start2.206.alive',
 cafeEnabled206:'sc4.door.c_start2.206.enabled'
};
export const STABLE_STATE_IDS=[...Object.values(RC4_STATE_IDS).slice(0,4).flatMap(id=>[id+'.done',id+'.active']),...Object.values(RC4_STATE_IDS).slice(4)];
const cls=e=>v(e,'classname');
const set=(e,k,val)=>{e.pairs=e.pairs.filter(([key])=>key!==k);e.pairs.push([k,String(val)]);};

export function applyCampaignState({sourceMap,map,entities,originalEntities,changes}){
 const add=o=>{const e={index:entities.length,pairs:Object.entries(o).map(([k,val])=>[k,String(val)])};entities.push(e);return e;};
 const named=n=>entities.filter(e=>v(e,'targetname')===n);
 const requireAt=(i,k,val)=>{if(v(originalEntities[i],k)!==val)throw Error(`RC4 dependency ${sourceMap}:${i}.${k}`);};
 const manager=(name,actions,master)=>add({classname:'multi_manager',targetname:name,spawnflags:'1',...(master?{master}:{}),...Object.fromEntries(actions)});
 const global=(name,id,mode,initial)=>add({classname:'env_global',targetname:name,globalstate:id,triggermode:mode,initialstate:initial,spawnflags:'1'});
 const gate=(name,id)=>add({classname:'multisource',targetname:name,globalstate:id});
 const restore=(name,actions,master)=>{
  manager(name,actions,master);
  // multisource registers its inputs on its deferred Think; allow that native
  // initialization to finish before asking a zero-input global master.
  add({classname:'trigger_auto',target:name,delay:'0.4',triggerstate:'1',spawnflags:'1'});
 };
 function completion(key,prefix){
  const id=RC4_STATE_IDS[key],done=prefix+'_done',active=prefix+'_active';
  global(done,id+'.done',1,0);global(active,id+'.active',0,1);
  gate(prefix+'_completed',id+'.done');gate(prefix+'_pending',id+'.active');
  manager(prefix+'_finish',[[done,0],[active,0]]);
  return{finish:prefix+'_finish',doneGate:prefix+'_completed',activeGate:prefix+'_pending',id};
 }
 function guard(name,state,prefix,finishAt){
  const roots=named(name);if(!roots.length)throw Error('Missing RC4 event '+name);
  for(const e of roots)set(e,'targetname',prefix+'_original');
  manager(name,[[prefix+'_original',0],...(finishAt!==undefined?[[state.finish,finishAt]]:[])],state.activeGate);
 }
 if(sourceMap==='c_intro'){
  const actions=[];
  for(const [i,id] of STABLE_STATE_IDS.entries()){
   const initial=id.endsWith('.active')||id.endsWith('.alive')?1:0;
   global('sc4_reset_'+i,id,initial,initial);actions.push(['sc4_reset_'+i,0]);
  }
  restore('sc4_new_campaign',actions);
  changes.push({kind:'explicit new campaign state reset',ids:STABLE_STATE_IDS});
 }
 if(sourceMap==='c_start'){
  requireAt(163,'targetname','sblacker');requireAt(163,'model','models/cutscene/blacker.mdl');
  requireAt(164,'target','multiblack');requireAt(165,'killblack','2');requireAt(166,'killtarget','sblacker');
  const black=completion('blacker','sc4_black');guard('multiblack',black,'sc4_black');
  if(v(entities[166],'target'))throw Error('Black scare relay already has a target');
  set(entities[166],'target',black.finish);set(entities[164],'targetname','sc4_black_touch');
  add({classname:'trigger_relay',targetname:'sc4_black_remove_touch',killtarget:'sc4_black_touch',triggerstate:'1'});
  restore('sc4_black_restore',[['killblack',0],['sc4_black_remove_touch',0]],black.doneGate);
  changes.push({kind:'persistent completed event',id:black.id,entity:163,completion:'authored killblack at2s',restore:['sblacker','sc4_black_touch'],excludedFigure:170});

  const wake=completion('wake','sc4_wake');guard('multiscene1',wake,'sc4_wake',47);
  const hide=['invsimon3','invsequence1','invsequence2','simonw_inv','simona_inv'];
  for(const name of hide)if(named(name).length!==1||cls(named(name)[0])!=='env_customize'||v(named(name)[0],'m_iVisible')!=='2')throw Error('Unsafe wake restoration '+name);
  restore('sc4_wake_restore',hide.map(n=>[n,0]),wake.doneGate);
  changes.push({kind:'persistent wake completion',id:wake.id,completionSeconds:47,restore:hide,prevents:'cutscene, camera stripping, repeated phone/knife grants and padlock visual reset on revisit'});

  requireAt(713,'targetname','sd_door1');requireAt(717,'message','sd_door1');requireAt(722,'targetname','multi_pad');
  if(cls(entities[713])!=='inter_door'||cls(entities[717])!=='cof_interdooronoff')throw Error('Native padlock door adapter changed');
  // Native inter_door KeyValue accepts lockedby -> private+190; IsLocked reads
  // that field. Spawnflag4 means disabled (+180), which is a DIFFERENT state.
  // Start explicitly locked; remove the authored wake's initial locking toggle.
  // Success/solved re-entry each unlock this known fresh state exactly once.
  set(entities[713],'lockedby','The door is locked.');
  for(const e of entities)if(cls(e)==='multi_manager'&&e.index===499)e.pairs=e.pairs.filter(([k])=>k!=='sd_door1_lock');
  const pad=completion('padlock','sc4_pad');guard('multi_pad',pad,'sc4_pad');
  const originalSuccess=named('sc4_pad_original');if(originalSuccess.length!==1)throw Error('Padlock success ambiguity');
  set(originalSuccess[0],pad.finish,0);
  restore('sc4_pad_restore',[['padlock_gr_vis',0],['padlock_air_inv',0],['sd_door1_lock',0],['killpadbutton',0]],pad.doneGate);
  changes.push({kind:'persistent solved puzzle world state',id:pad.id,acceptedDigits:'native adapter shared session tuple',restore:['padlock_gr_vis','padlock_air_inv','sd_door1_lock','killpadbutton'],defaultDoorLocked:true});
 }
 if(sourceMap==='c_start2'){
  requireAt(339,'targetname','multimystery');requireAt(345,'killtarget','cafedoors');requireAt(412,'killtarget','cafedoors2');
  const old={c_start2_coop_cafe_alive204:RC4_STATE_IDS.cafeAlive204,c_start2_coop_cafe_alive206:RC4_STATE_IDS.cafeAlive206,c_start2_coop_cafe_enabled206:RC4_STATE_IDS.cafeEnabled206};
  for(const e of entities)for(const p of e.pairs)if(p[0]==='globalstate'&&old[p[1]])p[1]=old[p[1]];
  const resets=entities.filter(e=>cls(e)==='trigger_auto'&&v(e,'target')==='cof_cafe_reset');
  if(resets.length!==1)throw Error('Expected one cafe load reset');
  resets[0].pairs=[['classname','info_target'],['targetname','sc4_retired_cafe_reset']];
  const computer=completion('computer','sc4_pc');guard('multimystery',computer,'sc4_pc');
  const pc=named('sc4_pc_original');if(pc.length!==1)throw Error('Computer success ambiguity');set(pc[0],computer.finish,0);
  restore('sc4_pc_restore',[['killcafedoors',0],['killcafedoors2',0],['wtcafdoors',0],['trigletitstarttr',0]],computer.doneGate);
  changes.push({kind:'persistent cafe door and computer states',id:computer.id,retiredReset:resets[0].index,doorIds:Object.values(old),restore:['killcafedoors','killcafedoors2','wtcafdoors','trigletitstarttr']});
 }
 return{schemaVersion:1,map,stableStateIds:STABLE_STATE_IDS,storage:'native server global-state table; native adapter adds journal and puzzle tuple',runtimeStatus:'AWAITING TWO-CLIENT GAMEPLAY',diskSaving:false};
}
