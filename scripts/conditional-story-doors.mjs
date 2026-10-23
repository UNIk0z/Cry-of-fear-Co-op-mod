import {decodeBsp,uniqueValue as v} from './bsp.mjs';
import {destinationEvidence,brushBounds} from './campaign-destinations.mjs';
import {createFadeDoorPlan,PRESENTATION_TIMING} from './build-door-presentation.mjs';

// Call only after map-specific dependency guards. Reuse the verified sequence
// while retaining the original brush/name and real script-controlled access.
export function convertConditionalDoor({source,entities,index,state,initial,toggle,changes}){
 const bsp=decodeBsp(source),door=bsp.entities[index],name=v(door,'targetname'),evidence=destinationEvidence(source,bsp,door),bounds=brushBounds(source,bsp,door);
 if(v(entities[index],'classname')!=='inter_door'||!name||!evidence.safe||!bounds)throw Error('Unsafe conditional door '+index);
 const add=o=>{const e={index:entities.length,pairs:Array.isArray(o)?o:Object.entries(o).map(([k,val])=>[k,String(val)])};entities.push(e);return e;};
 const authoredMaster=v(door,'master');
 const prefix='sc4_cond_'+index,gate=prefix+'_gate',helper=prefix+'_move',dest=prefix+'_dest',origin=bounds.center.join(' '),plan=createFadeDoorPlan({door:index,helper,origin},{destination:evidence.feet.join(' '),opening:v(door,'opensound'),closing:v(door,'closesound')});
 if(entities.some(e=>v(e,'targetname')===plan.start))throw Error('Conditional presentation name collision');
 entities[index].pairs=door.pairs.filter(([k])=>['model','angles','targetname','renderfx','renderamt','rendermode','rendercolor'].includes(k));
 entities[index].pairs.push(['classname','func_button'],['target',plan.start],['master',authoredMaster??gate],['spawnflags','1'],['wait',String(PRESENTATION_TIMING.cooldown)],['sounds','0']);
 add({classname:'multisource',targetname:gate,globalstate:state,origin});
 if(toggle!==undefined){const t=entities[toggle];if(v(t,'classname')!=='cof_interdooronoff'||v(t,'message')!==name)throw Error('Conditional native lock helper changed');
  t.pairs=[['classname','env_global'],['targetname',v(t,'targetname')],['origin',v(t,'origin')??origin],['globalstate',state],['triggermode','3'],['initialstate',String(initial)],['spawnflags','1']];
 }
 add({classname:'info_teleport_destination',targetname:dest,origin:evidence.feet.join(' '),angles:evidence.angles.join(' ')});
 // Recheck access at delayed relocation. A script may lock it during the fade.
 add([['classname','multi_manager'],['spawnflags','1'],['targetname',helper],['master',authoredMaster??gate],[prefix+(authoredMaster?'_recheck':'_tele'),'0']]);
 if(authoredMaster)add({classname:'multi_manager',spawnflags:1,targetname:prefix+'_recheck',master:gate,[prefix+'_tele']:0});
 add({classname:'cof_teleport',targetname:prefix+'_tele',target:dest,origin});
 for(const e of plan.entities){if(v(e,'classname')==='multi_manager')e.pairs.push(['master',gate]);add(e.pairs);}
 const start=entities.find(e=>v(e,'targetname')===plan.start),message=v(door,'message'),music=v(door,'music');
 if(message&&entities.some(e=>v(e,'targetname')===message))start.pairs.push([message,'1.25']);
 if(music){if(!/^[a-z0-9_/.-]+\.mp3$/i.test(music))throw Error('Unsafe original conditional music');add({classname:'trigger_command',targetname:prefix+'_music',netname:'sv_coop_music '+music});start.pairs.push([prefix+'_music','1.25']);}
 changes.push({kind:'conditional verified door presentation',entity:index,name,state,initial,toggle:toggle??null,evidence,events:plan.events,preservedMessage:message??null,preservedMusic:music??null,status:'AWAITING GAMEPLAY VERIFICATION'});
}

// Native key use (100E4630..100E468F) traces for an exact inter_door, compares
// its lockedby with the held key and consumes it; unlock 10048E40 fires no
// target. Keep that native door for its lock, key and messages. The adapter
// (keydoor-runtime.hpp) hides the prepared verified-relocation button at
// ServerActivate like func_wall_toggle (not solid, no draw), observes the
// cleared lock, fires NAME_open and then reveals the button on the same brush.
// A position offset is NOT used: DONT_MOVE buttons LinearMove to spawn origin.
export function convertKeyDoor({source,entities,index,state,changes}){
 const bsp=decodeBsp(source),door=bsp.entities[index],lock=v(door,'lockedby'),evidence=destinationEvidence(source,bsp,door),bounds=brushBounds(source,bsp,door);
 if(v(entities[index],'classname')!=='inter_door'||!lock||v(door,'targetname')||v(door,'master')||!evidence.safe||!bounds||JSON.stringify(entities[index].pairs)!==JSON.stringify(door.pairs))throw Error('Unsafe key door '+index);
 const add=o=>{const e={index:entities.length,pairs:Array.isArray(o)?o:Object.entries(o).map(([k,val])=>[k,String(val)])};entities.push(e);return e;};
 const name='sc4_keydoor_'+index,prefix='sc4_cond_'+index,gate=prefix+'_gate',helper=prefix+'_move',dest=prefix+'_dest',origin=bounds.center.join(' ');
 const plan=createFadeDoorPlan({door:index,helper,origin},{destination:evidence.feet.join(' '),opening:v(door,'opensound'),closing:v(door,'closesound')});
 const taken=new Set(entities.map(e=>v(e,'targetname')).filter(Boolean));
 for(const n of [name,name+'_button',name+'_open',name+'_unlocked',gate,helper,dest,prefix+'_tele',plan.start])if(taken.has(n))throw Error('Key door name collision '+n);
 // The only original change is a name for the authored removal relay.
 entities[index].pairs.push(['targetname',name]);
 add([...door.pairs.filter(([k])=>['model','angles','renderfx','renderamt','rendermode','rendercolor'].includes(k)),['classname','func_button'],['targetname',name+'_button'],['target',plan.start],['master',gate],['spawnflags','1'],['wait',String(PRESENTATION_TIMING.cooldown)],['sounds','0']]);
 add({classname:'multisource',targetname:gate,globalstate:state,origin});
 add({classname:'env_global',targetname:name+'_unlocked',globalstate:state,triggermode:1,initialstate:0,spawnflags:1,origin});
 add({classname:'trigger_relay',targetname:name+'_open',target:name+'_unlocked',killtarget:name,triggerstate:1,origin});
 // Revisits and checkpoint loads: an already unlocked door is removed again.
 add({classname:'trigger_auto',target:name+'_open',globalstate:state,delay:0.2,triggerstate:1,spawnflags:1,origin});
 add({classname:'info_teleport_destination',targetname:dest,origin:evidence.feet.join(' '),angles:evidence.angles.join(' ')});
 add([['classname','multi_manager'],['spawnflags','1'],['targetname',helper],['master',gate],[prefix+'_tele','0']]);
 add({classname:'cof_teleport',targetname:prefix+'_tele',target:dest,origin});
 for(const e of plan.entities){if(v(e,'classname')==='multi_manager')e.pairs.push(['master',gate]);add(e.pairs);}
 const start=entities.find(e=>v(e,'targetname')===plan.start),message=v(door,'message'),music=v(door,'music');
 if(message&&entities.some(e=>v(e,'targetname')===message))start.pairs.push([message,'1.25']);
 if(music){if(!/^[a-z0-9_/.-]+\.mp3$/i.test(music))throw Error('Unsafe original key-door music');add({classname:'trigger_command',targetname:prefix+'_music',netname:'sv_coop_music '+music});start.pairs.push([prefix+'_music','1.25']);}
 changes.push({kind:'adapter-bridged native key door',entity:index,name,key:lock,state,button:name+'_button',hiddenUntilUnlock:'adapter SOLID_NOT+EF_NODRAW',relay:name+'_open',evidence,events:plan.events,preservedMusic:music??null,status:'AWAITING GAMEPLAY VERIFICATION'});
}
