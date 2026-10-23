import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeBsp,sha256,uniqueValue as v} from './bsp.mjs';
import {entitySpans} from './build-door-experiment.mjs';
import {createFadeDoorPlan,PRESENTATION_TIMING} from './build-door-presentation.mjs';
import {buildStoryCandidate} from './build-story-candidate.mjs';
import {analyzeStoryDoors} from './convert-story-doors.mjs';
import {worldHull,sampleSpawn} from './collision.mjs';
import {brushBounds,destinationEvidence,entrySpawns,xyz} from './campaign-destinations.mjs';
import {prepareOutput} from './cof-inspect.mjs';
export const ENTRY_MAP='cof_campaign_story2';
const block=pairs=>'{\n'+pairs.map(([k,val])=>`"${k}" "${val}"\n`).join('')+'}';
const set=(e,key,val)=>{e.pairs=e.pairs.filter(([k])=>k!==key);e.pairs.push([key,String(val)]);};
const remove=(e,key)=>{e.pairs=e.pairs.filter(([k])=>k!==key);};
const entity=obj=>({pairs:Object.entries(obj).map(([k,val])=>[k,String(val)])});
const cls=e=>v(e,'classname');
const candidates=new Set(['model','angles','renderfx','renderamt','rendermode','rendercolor','classname','target','opensound','closesound','doortype','musicfadein','musicfadeout','music','message','zhlt_lightflags','unlockedmsg','unlockedsnd','lockedmsg','lockedsnd']);

export function campaignRoster(audit,entityData){
 const originals=audit.reachableFromIntro,roster=[],routes=new Map();
 for(const name of originals){
  const incoming=[];for(const from of audit.maps.filter(m=>originals.includes(m.map)))for(const edge of from.edges.filter(e=>e.to===name)){
   const e=entityData.get(from.map)[edge.entity],landmark=v(e,'landmark')??null;incoming.push({from:from.map,entity:edge.entity,landmark});
  }
  const landmarks=[...new Set(incoming.map(e=>e.landmark))].sort((a,b)=>String(a).localeCompare(String(b)));
  if(!landmarks.length)landmarks.push(null);
  for(const [i,landmark] of landmarks.entries()){
   const alias=name==='c_intro'?ENTRY_MAP:`s2_${name.slice(2)}${landmarks.length>1?'_e'+i:''}`;
   if(name==='c_intro'&&i>0){routes.set(name+'|'+(landmark??''),ENTRY_MAP);continue;}
   if(alias.length>31)throw Error('Alias too long: '+alias);
   roster.push({sourceMap:name,map:alias,landmark,incoming:incoming.filter(e=>e.landmark===landmark)});routes.set(name+'|'+(landmark??''),alias);
  }
 }
 return {roster,routes};
}

// Append cloned model metadata for a native AABB readiness query. No original
// geometry, render faces or world collision is moved. Think uses local mins/maxs,
// so translated origin alone (RC1) is wrong. These no-Touch triggers stay at zero.
export function assembleCampaign(bytes,entities,models=[]){
 const original=decodeBsp(bytes),spans=entitySpans(original.entityText),edits=[];
 for(let i=0;i<original.entities.length;i++)if(JSON.stringify(original.entities[i].pairs)!==JSON.stringify(entities[i].pairs))edits.push({...spans[i],entity:i,to:block(entities[i].pairs)});
 edits.sort((a,b)=>b.start-a.start);let text=original.entityText;for(const e of edits)text=text.slice(0,e.start)+e.to+text.slice(e.end);
 const appendText='\n'+entities.slice(original.entities.length).map(e=>block(e.pairs)+'\n').join(''),payload=Buffer.from(text+appendText+'\0','latin1');
 const entityOffset=Math.ceil(bytes.length/4)*4,modelOffset=Math.ceil((entityOffset+payload.length)/4)*4,lump=original.lumps[14];
 const output=Buffer.alloc(models.length?modelOffset+lump.length+models.length*64:entityOffset+payload.length);bytes.copy(output);payload.copy(output,entityOffset);output.writeInt32LE(entityOffset,4);output.writeInt32LE(payload.length,8);
 if(models.length){bytes.copy(output,modelOffset,lump.offset,lump.offset+lump.length);for(const [i,m] of models.entries()){
  const at=modelOffset+lump.length+i*64;bytes.copy(output,at,lump.offset+m.sourceModel*64,lump.offset+(m.sourceModel+1)*64);
  for(let k=0;k<3;k++){output.writeFloatLE(m.mins[k],at+k*4);output.writeFloatLE(m.maxs[k],at+12+k*4);output.writeFloatLE(0,at+24+k*4);}
 }output.writeInt32LE(modelOffset,116);output.writeInt32LE(lump.length+models.length*64,120);}
 const rebuilt=decodeBsp(output);
 if(JSON.stringify(rebuilt.entities.map(e=>e.pairs))!==JSON.stringify(entities.map(e=>e.pairs)))throw Error('Entity reconstruction mismatch');
 if(!output.subarray(12,116).equals(bytes.subarray(12,116))||!output.subarray(124,bytes.length).equals(bytes.subarray(124)))throw Error('Original source data modified');
 for(let i=1;i<(models.length?14:15);i++)if(JSON.stringify(rebuilt.lumps[i])!==JSON.stringify(original.lumps[i]))throw Error('Original non-entity data changed');
 if(models.length&&!output.subarray(modelOffset,modelOffset+lump.length).equals(bytes.subarray(lump.offset,lump.offset+lump.length)))throw Error('Original model records changed');
 return {output,edits,appendText,modelClones:models,entities:rebuilt.entities.length};
}

export function buildCampaignMap(bytes,variant,{auditMap,routes,entryPlan}){
 const original=decodeBsp(bytes),sourceMap=variant.sourceMap,base=sourceMap==='c_start2'?decodeBsp(buildStoryCandidate(bytes).output):original;
 const entities=structuredClone(base.entities),models=[],doors=[],notes=[],pickups=[],crossings=[],cameras=[],retained=[];
 const add=obj=>{const e=Array.isArray(obj)?{pairs:obj}:entity(obj);e.index=entities.length;entities.push(e);return e;};
 const hull=worldHull(bytes),inventory=analyzeStoryDoors(bytes,{sourceMap});
 const nativeModelCount=original.lumps[14].length/64;
 const boundsModel=(sourceModel,mins,maxs)=>{const index=nativeModelCount+models.length;models.push({sourceModel,mins,maxs,index,purpose:'Native cooperative readiness AABB; original model geometry untouched'});return '*'+index;};
 const byName=name=>original.entities.filter(e=>v(e,'targetname')===name);
 // Established V8/RC1 chains remain byte-for-byte records in c_start2.
 for(const record of inventory.doors){
  const source=original.entities[record.index],e=entities[record.index];
  if(cls(e)!=='inter_door'){doors.push({id:record.id,status:'PRESERVED_BASELINE_CHAIN',target:record.target});continue;}
  if(record.crossMapPath){continue;}
  const metadata=source.pairs.filter(([k])=>!candidates.has(k)).map(([k])=>k);
  if(!record.destination||metadata.length||v(source,'lockedby')||v(source,'targetname')||v(source,'master')||Number(v(source,'spawnflags')??0)||!record.bounds||!['0',undefined,''].includes(v(source,'doortype'))||['musicfadein','musicfadeout'].some(k=>!['2',undefined,''].includes(v(source,k)))){retained.push({id:record.id,target:record.target,reason:metadata.length?'Special fields: '+metadata.join(','):record.reasons.join('; '),blocking:!!record.destination});continue;}
  const evidence=destinationEvidence(bytes,original,source,hull);
  if(!evidence.safe){retained.push({id:record.id,target:record.target,reason:evidence.reason,blocking:true,evidence});continue;}
  const opening=v(source,'opensound'),closing=v(source,'closesound');if(!opening||!closing){retained.push({id:record.id,reason:'Incomplete native audio',blocking:true});continue;}
  const prefix=`sc_d${record.index}`,dest=prefix+'_dest',helper=prefix+'_move',plan=createFadeDoorPlan({door:record.index,helper,origin:record.bounds.center.join(' ')},{destination:evidence.feet.join(' '),opening,closing});
  e.pairs=source.pairs.filter(([k])=>['model','angles','renderfx','renderamt','rendermode','rendercolor'].includes(k));
  e.pairs.push(['classname','func_button'],['target',plan.start],['spawnflags','1'],['wait',String(PRESENTATION_TIMING.cooldown)],['sounds','0']);
  add({classname:'info_teleport_destination',targetname:dest,origin:evidence.feet.join(' '),angles:evidence.angles.join(' ')});
  add({classname:'cof_teleport',targetname:helper,target:dest,origin:record.bounds.center.join(' ')});
  for(const item of plan.entities)add(item.pairs);
  const message=v(source,'message');if(message&&byName(message).length){const manager=entities.find(x=>v(x,'targetname')===plan.start);manager.pairs.push([message,'1.25']);}
  // Preserve music through the native server command already used by co-op.
  const music=v(source,'music');if(music&&/^[a-z0-9_./-]+\.mp3$/i.test(music)){
   const name=prefix+'_music';add({classname:'trigger_command',targetname:name,netname:`sv_coop_music ${music}`,origin:evidence.feet.join(' ')});
   entities.find(x=>v(x,'targetname')===plan.start).pairs.push([name,'1.25']);
  }
  doors.push({id:record.id,status:'IMPLEMENTED_AWAITING_GAMEPLAY_VERIFICATION',evidence,preservedMessage:message??null,preservedMusic:music??null});
 }
 // Shared static documents: native Document::Use assigns a handle and sends its
 // original content per activator. Unlike password-note cache creation it may be
 // reused directly. Original pickup/script targets still call the original name.
 for(const source of original.entities.filter(e=>cls(e)==='cof_document')){
  const name=v(source,'targetname');if(!name||byName(name).length!==1){notes.push({entity:source.index,type:'document',status:'BLOCKED',reason:'Unnamed/nonunique document'});continue;}
  const native='sc_document_'+source.index;set(entities[source.index],'targetname',native);
  add({classname:'game_zone_player',model:'*1',targetname:name,intarget:native,outtarget:native});
  notes.push({entity:source.index,type:'document',status:'IMPLEMENTED_AWAITING_GAMEPLAY_VERIFICATION',sourceName:name,nativeName:native,contentKeys:source.pairs.filter(([k])=>/^(page|note)[1-4]$|^label$/.test(k))});
 }
 for(const source of original.entities.filter(e=>['cof_passwordnote','cof_addcodenote'].includes(cls(e))))notes.push({entity:source.index,type:cls(source),status:sourceMap==='c_start2'?'PRESERVED_USER_VERIFIED':'RETAINED_NATIVE_PLAYER_SPECIFIC'});
 // Native trigger_camera already sets all client views. Avoid per-player
 // retrigger fan-out (which toggles it off). Unskippable removes shared skip input.
 for(const source of original.entities.filter(e=>cls(e)==='trigger_camera')){set(entities[source.index],'spawnflags',Number(v(source,'spawnflags')??0)|1024);cameras.push({entity:source.index,status:'IMPLEMENTED_AWAITING_GAMEPLAY_VERIFICATION',change:'Native Unskippable flag; retain all-client view/timeline path'});}
 // Deterministic physical resource fallback, only anonymous plain consumables.
 const occupied=original.entities.filter(e=>/^(ammo_|weapon_|item_)/.test(cls(e)??'')).map(e=>xyz(v(e,'origin'))).filter(Boolean);
 for(const source of original.entities.filter(e=>/^(ammo_|weapon_)/.test(cls(e)??''))){
  const at=xyz(v(source,'origin'));if(!at||v(source,'targetname')||source.pairs.some(([k])=>['target','master','lockedby','itemlock','movewith','message'].includes(k))||/key|note/.test(cls(source)))continue;
  if(source.pairs.some(([k])=>!['origin','classname','angles','rendercolor','frags','spawnflags'].includes(k))||Number(v(source,'spawnflags')??0)!==0)continue;
  const positions=[];outer:for(const radius of [36,48,72,96])for(const [dx,dy] of [[radius,0],[-radius,0],[0,radius],[0,-radius],[radius,radius],[-radius,radius],[radius,-radius],[-radius,-radius]]){
   const p=[at[0]+dx,at[1]+dy,at[2]];if(!sampleSpawn(hull,[p[0],p[1],p[2]+36]).staticCandidate||occupied.some(q=>Math.abs(q[0]-p[0])<32&&Math.abs(q[1]-p[1])<32&&Math.abs(q[2]-p[2])<32))continue;
   if(![.25,.5,.75].every(t=>hull.contents([at[0]+dx*t,at[1]+dy*t,at[2]+37])===-1))continue;
   positions.push(p);occupied.push(p);if(positions.length===3)break outer;
  }
  for(const p of positions){const copy=structuredClone(source);set(copy,'origin',p.join(' '));add(copy.pairs);}
  pickups.push({entity:source.index,type:cls(source),copies:positions.length,positions,status:positions.length===3?'IMPLEMENTED_AWAITING_GAMEPLAY_VERIFICATION':'PARTIAL_SAFE_PLACEMENTS'});
 }
 // Every audited map destination is rewritten. Native point changes preserve
 // the game's own all-player transfer routine. Original trigger volumes/events
 // are retained as entry points; custom engines' single-player checks are removed.
 for(const edge of auditMap.edges){
  const source=original.entities[edge.entity],e=entities[edge.entity],landmark=v(source,'landmark')??null,next=routes.get(edge.to+'|'+(landmark??''));
  if(!next)throw Error('Unresolved campaign edge '+sourceMap+' -> '+edge.to);
  if(edge.classname==='trigger_changelevel'){
   if(source.pairs.some(([k,val])=>!['classname','model','map','landmark','targetname','origin','angles','spawnflags','changedelay'].includes(k)||k==='changedelay'&&Number(val)!==0))throw Error('Unreviewed transition condition '+sourceMap+':'+edge.entity);
   const originalName=v(source,'targetname'),nextName=originalName??`sc_level_${edge.entity}`;
   const linked=inventory.doors.filter(d=>d.crossMapPath?.includes(edge.entity)&&!d.conditions.lockedby&&!d.conditions.master&&!d.targetname&&d.conditions.spawnflags==='0');
   // Targeted exits retain their existing callers. Physical crossing uses a
   // one-shot touch trigger; cooperative Use exits use real native readiness.
   const useOnly=!!(Number(v(source,'spawnflags')??0)&2);
   e.pairs=source.pairs.filter(([k])=>(useOnly?['origin','angles']:['model','origin','angles']).includes(k));set(e,'classname',useOnly?'info_target':'trigger_once');if(!useOnly)set(e,'target',nextName);
   add({classname:'cof_changelevel',targetname:nextName,message:next,origin:'0 0 0'});
   for(const d of linked){const door=entities[d.index],bounds=d.bounds;if(!bounds)continue;const prefix=`sc_exit_${d.index}`,center=bounds.center;
    // Door-centric original-coordinate AABB, not translated local coordinates.
    const mins=[center[0]-112,center[1]-112,bounds.mins[2]-24],maxs=[center[0]+112,center[1]+112,bounds.maxs[2]+40];
    const model=boundsModel(Number(v(source,'model').slice(1)),mins,maxs);
    add({classname:'trigger_coop_changelevel',targetname:prefix+'_ready',model,origin:'0 0 0',rendermode:'2',renderamt:'0'});
    door.pairs=door.pairs.filter(([k])=>['model','angles','renderamt','rendermode','rendercolor'].includes(k));
    door.pairs.push(['classname','inter_door_coop_changelevel'],['message',next],['target',prefix+'_ready'],['noise',v(original.entities[d.index],'opensound')??'doors/doormove1.wav']);
    crossings.push({entity:edge.entity,door:d.index,next,landmark,mechanism:'native-group-door',bounds:{mins,maxs},status:'IMPLEMENTED_AWAITING_GAMEPLAY_VERIFICATION'});
   }
   if(!linked.length)crossings.push({entity:edge.entity,next,landmark,mechanism:'original-trigger -> native cof_changelevel',status:'IMPLEMENTED_AWAITING_GAMEPLAY_VERIFICATION'});
  }else if(edge.classname==='trigger_command'){
   set(e,'netname',(v(e,'netname')??'').replace(new RegExp('\\b(?:map|changelevel)\\s+'+edge.to+'(?=\\s*(?:;|$))','gi'),'changelevel '+next));crossings.push({entity:edge.entity,next,landmark,mechanism:'existing server command',status:'IMPLEMENTED_AWAITING_GAMEPLAY_VERIFICATION'});
  }else{set(e,edge.key,next);crossings.push({entity:edge.entity,next,landmark,mechanism:'existing '+edge.classname,status:'IMPLEMENTED_AWAITING_GAMEPLAY_VERIFICATION'});}
 }
 for(const d of inventory.doors.filter(d=>d.crossMapPath))if(cls(entities[d.index])==='inter_door')retained.push({id:d.id,target:d.target,kind:'cross-map story door',reason:'Native group adapter not applied: original lock/master/named activation requires a specific adapter',blocking:true});
 for(const e of entities.filter(e=>/^cof_coop_spawn[1-4]$/.test(cls(e)??'')))set(e,'classname','info_target');
 for(const spawn of entryPlan.spawns)add({classname:spawn.classname,origin:spawn.origin.join(' '),angles:spawn.angles.join(' ')});
 if(sourceMap==='c_intro'){
  set(entities[0],'iuser1','1');add({classname:'cof_lobby_start',message:'sc_begin_story',origin:v(original.entities.find(e=>cls(e)==='info_player_start'),'origin')});
  add({classname:'trigger_relay',targetname:'sc_begin_story',target:'multiintroduct',spawnflags:'1',triggerstate:'2'});
 }
 const built=assembleCampaign(bytes,entities,models);
 return {...built,report:{schemaVersion:2,...variant,sourceSha256:sha256(bytes),outputSha256:sha256(built.output),fileBytes:built.output.length,entities:built.entities,edits:built.edits,appendText:built.appendText,modelClones:models,doors,retainedDoors:retained,notes,pickups,crossings,cameras,entryPlan,status:'IMPLEMENTED_AWAITING_GAMEPLAY_VERIFICATION',limits:'Connected reference graph is not verified gameplay. Locked/scripted doors, PC solution validation, late joins, dynamic destination collision and state persistence may still block progression.'}};
}

export function main(args){
 if(args.length!==3)throw Error('Usage: build-connected-campaign.mjs CAMPAIGN_AUDIT.json ORIGINAL_MAPS_DIRECTORY FRESH_WORK_OUTPUT');
 const [auditFile,mapsDir,outDir]=args,audit=JSON.parse(fs.readFileSync(auditFile)),privateDir=path.dirname(auditFile),data=new Map();
 for(const name of audit.reachableFromIntro)data.set(name,JSON.parse(fs.readFileSync(path.join(privateDir,name+'.entities.json'))));
 const {roster,routes}=campaignRoster(audit,data),out=prepareOutput(outDir,[mapsDir]),results=[],arrivals=new Map();
 // GoldSrc landmark transfer preserves position relative to the source marker.
 // Derive the source position from its original door exit, or the touch volume
 // center when there is no door. These are evidence-backed static candidates,
 // not a claim that native cooperative inventory/checkpoint state is restored.
 for(const sourceMap of audit.reachableFromIntro){const bytes=fs.readFileSync(path.join(mapsDir,sourceMap+'.bsp')),bsp=decodeBsp(bytes),inventory=analyzeStoryDoors(bytes,{sourceMap});
  for(const edge of audit.maps.find(m=>m.map===sourceMap).edges){const e=bsp.entities[edge.entity],landmark=v(e,'landmark');if(!landmark)continue;
   const markers=bsp.entities.filter(x=>cls(x)==='info_landmark'&&v(x,'targetname')===landmark);if(markers.length!==1)continue;
   const door=inventory.doors.find(d=>d.crossMapPath?.includes(edge.entity)&&d.destination),bounds=brushBounds(bytes,bsp,e),position=door?door.destination.feet.map((x,i)=>x+(i===2?37:0)):bounds?.center;
   if(!position)continue;const marker=xyz(v(markers[0],'origin'));
   arrivals.set(sourceMap+':'+edge.entity,{sourceMap,entity:edge.entity,sourceLandmark:markers[0].index,sourcePosition:position,offset:position.map((x,i)=>x-marker[i]),angles:door?xyz(door.destination.angles??'0 0 0'):[0,0,0],basis:door?'original door exit + standing hull offset':'original touch-volume center; exact touching position varies'});
  }
 }
 for(const sourceMap of audit.reachableFromIntro){
  const bytes=fs.readFileSync(path.join(mapsDir,sourceMap+'.bsp')),bsp=decodeBsp(bytes),auditMap=audit.maps.find(m=>m.map===sourceMap);if(sha256(bytes)!==auditMap.sourceSha256)throw Error('Original source changed: '+sourceMap);
  for(const variant of roster.filter(r=>r.sourceMap===sourceMap)){
   const incoming=variant.incoming.map(e=>arrivals.get(e.from+':'+e.entity)).filter(Boolean),arrival=incoming[0]??null;
   const entryPlan=entrySpawns(bytes,bsp,sourceMap==='c_intro'?{}:{...variant,arrival}),r=buildCampaignMap(bytes,variant,{auditMap,routes,entryPlan});
   fs.writeFileSync(path.join(out,variant.map+'.bsp'),r.output,{flag:'wx'});fs.writeFileSync(path.join(out,variant.map+'.json'),JSON.stringify(r.report,null,2)+'\n',{flag:'wx'});
   results.push({...variant,outputSha256:r.report.outputSha256,entities:r.report.entities,entryPlan,doors:r.report.doors,retainedDoors:r.report.retainedDoors,notes:r.report.notes,pickups:r.report.pickups,cameras:r.report.cameras,crossings:r.report.crossings});
  }
  console.log(JSON.stringify({sourceMap,produced:roster.filter(r=>r.sourceMap===sourceMap).length}));
 }
 const aliases=new Set(results.map(r=>r.map));for(const m of results)for(const e of m.crossings)if(!aliases.has(e.next))throw Error('Missing generated BSP '+e.next);
 const reached=new Set(),queue=[ENTRY_MAP];while(queue.length){const name=queue.shift();if(reached.has(name))continue;reached.add(name);queue.push(...results.find(m=>m.map===name).crossings.map(e=>e.next));}
 const summary={schemaVersion:2,entry:ENTRY_MAP,originalMaps:audit.reachableFromIntro.length,convertedMaps:results.length,linkedTransitions:results.reduce((n,r)=>n+r.crossings.length,0),reachableAliases:reached.size,results,gameplayStatus:'AWAITING_GAMEPLAY_VERIFICATION'};
 fs.writeFileSync(path.join(out,'campaign-report.json'),JSON.stringify(summary,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({...summary,results:undefined}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{main(process.argv.slice(2));}catch(e){console.error(e.stack);process.exitCode=1;}}
