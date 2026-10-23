import {decodeBsp,uniqueValue as v} from './bsp.mjs';
import {worldHull,sampleSpawn} from './collision.mjs';
export const xyz=s=>typeof s==='string'&&s.trim().split(/\s+/).length===3?s.trim().split(/\s+/).map(Number):null;
export function brushBounds(bytes,bsp,entity){
 const model=v(entity,'model');if(!/^\*[1-9][0-9]*$/.test(model??''))return null;
 const index=Number(model.slice(1)),l=bsp.lumps[14];if(index*64+64>l.length)return null;
 const at=l.offset+index*64,mins=[0,4,8].map(k=>bytes.readFloatLE(at+k)),maxs=[12,16,20].map(k=>bytes.readFloatLE(at+k));
 const translation=xyz(v(entity,'origin'))??[0,0,0];
 return {index,mins,maxs,translation,center:mins.map((x,i)=>(x+maxs[i])/2+translation[i])};
}
export function destinationEvidence(bytes,bsp,door,hull=worldHull(bytes)){
 const target=v(door,'target'),matches=bsp.entities.filter(e=>v(e,'targetname')===target);
 if(matches.length!==1||v(matches[0],'classname')!=='inter_door_exit')return {safe:false,reason:'No unique original inter_door_exit',target};
 const exit=matches[0],feet=xyz(v(exit,'origin')),angles=xyz(v(exit,'angles')??'0 0 0');
 if(!feet?.every(Number.isFinite)||!angles?.every(Number.isFinite))return {safe:false,reason:'Invalid original destination',target};
 const center=[feet[0],feet[1],feet[2]+37],sample=sampleSpawn(hull,[feet[0],feet[1],feet[2]+36]);
 // Prove a local walkable neighborhood, not just one empty sample behind a wall.
 // Original named destination remains authoritative; this never invents a room.
 const reachable=new Map([[`${center[0]},${center[1]},${center[2]}`,center]]),queue=[center];
 while(queue.length&&reachable.size<160){const p=queue.shift();for(const [dx,dy] of [[16,0],[-16,0],[0,16],[0,-16]]){
  if(Math.hypot(p[0]+dx-center[0],p[1]+dy-center[1])>112)continue;
  let next;for(const dz of [0,8,-8,16,-16]){const q=[p[0]+dx,p[1]+dy,p[2]+dz];
   if(sampleSpawn(hull,[q[0],q[1],q[2]-1]).staticCandidate&&[.25,.5,.75].every(t=>hull.contents(p.map((x,i)=>x+(q[i]-x)*t))===-1)){next=q;break;}}
  if(next){const key=next.join(',');if(!reachable.has(key)){reachable.set(key,next);queue.push(next);}}
 }}
 const points=[...reachable.values()],span=[0,1].map(i=>Math.max(...points.map(p=>p[i]))-Math.min(...points.map(p=>p[i])));
 const safe=sample.staticCandidate&&reachable.size>=9&&Math.max(...span)>=48;
 return {safe,reason:safe?null:'Original destination lacks standing support or connected local walkable area',target,exit:exit.index,feet,center,angles,sample,walkableSamples:reachable.size,span,
  authority:'Original targetname -> inter_door_exit origin; native relocation adds -player.mins.z + 1',runtimeStatus:'AWAITING GAMEPLAY VERIFICATION',limits:'Static world only; dynamic brushes, story state and player overlap require gameplay.'};
}
export function entrySpawns(bytes,bsp,{landmark=null,arrival=null}={}){
 const starts=bsp.entities.filter(e=>v(e,'classname')==='info_player_start'&&xyz(v(e,'origin'))?.every(Number.isFinite));
 if(!starts.length)return {status:'BLOCKED',reason:'No original story player start',spawns:[]};
 const markers=landmark?bsp.entities.filter(e=>v(e,'classname')==='info_landmark'&&v(e,'targetname')===landmark):[];
 // A return through a landmark must not silently select a default/checkpoint
 // start elsewhere in the map. Use the incoming original transition position.
 let chosen=!landmark&&starts.length===1?starts[0]:null;
 if(landmark&&markers.length===1&&arrival?.offset){const marker=xyz(v(markers[0],'origin'));chosen={index:null,pairs:[['origin',marker.map((x,i)=>x+arrival.offset[i]).join(' ')],['angles',(arrival.angles??[0,0,0]).join(' ')]]};}
 if(!chosen)return {status:'BLOCKED',reason:'Multiple checkpoint starts without a unique nearby incoming landmark',landmark,starts:starts.map(e=>({id:e.index,origin:v(e,'origin')})),spawns:[]};
 const anchor=xyz(v(chosen,'origin')),angles=xyz(v(chosen,'angles')??'0 0 0'),hull=worldHull(bytes),spawns=[];
 const exits=bsp.entities.filter(e=>v(e,'classname')==='trigger_changelevel'&&!(Number(v(e,'spawnflags')??0)&2)).map(e=>brushBounds(bytes,bsp,e)).filter(Boolean);
 const outsideExits=p=>!exits.some(b=>b.mins.every((lo,i)=>p[i]+(i===2?36:16)>=lo+b.translation[i]&&p[i]-(i===2?36:16)<=b.maxs[i]+b.translation[i]));
 // Limit adjustments to the immediate arrival volume, with a continuous clear
 // segment from the first valid point. No search across walls or other floors.
 let origin=anchor;
 if(!sampleSpawn(hull,origin).staticCandidate){let found;search:for(const dz of [0,8,-8,16,-16,32,-32,48,-48])for(const radius of [0,16,32,48,64])for(const [dx,dy] of [[radius,0],[-radius,0],[0,radius],[0,-radius]]){const p=[anchor[0]+dx,anchor[1]+dy,anchor[2]+dz];if(sampleSpawn(hull,p).staticCandidate){found=p;break search;}}
  if(!found)return {status:'BLOCKED',reason:'Landmark-relative arrival has no nearby standing space',landmark,anchor,arrival,spawns:[]};origin=found;}
 for(const radius of [0,36,48,72,96,128,160,192,224,256])for(const [dx,dy] of radius?[[radius,0],[-radius,0],[0,radius],[0,-radius],[radius,radius],[-radius,radius],[radius,-radius],[-radius,-radius]]:[[0,0]]){
  const at=[origin[0]+dx,origin[1]+dy,origin[2]];
  if(!sampleSpawn(hull,at).staticCandidate||!outsideExits(at)||spawns.some(s=>Math.abs(s.origin[0]-at[0])<32&&Math.abs(s.origin[1]-at[1])<32&&Math.abs(s.origin[2]-at[2])<72))continue;
  // Do not place a second player across an intervening solid wall.
  if(![.25,.5,.75].every(t=>hull.contents(origin.map((x,i)=>x+(at[i]-x)*t))===-1))continue;
  spawns.push({classname:`cof_coop_spawn${spawns.length+1}`,origin:at,angles});if(spawns.length===4)return {status:'IMPLEMENTED_AWAITING_GAMEPLAY_VERIFICATION',landmark,originalStart:chosen.index,originalOrigin:origin,anchor,arrival,spawns};
 }
 // Tight stair entries require following the connected floor around a corner;
 // a same-height radial search cannot discover a second legal standing point.
 const queue=[origin],visited=new Set([origin.join(',')]);
 while(queue.length&&visited.size<1600&&spawns.length<4){const p=queue.shift();for(const [dx,dy] of [[16,0],[-16,0],[0,16],[0,-16]]){
  if(Math.hypot(p[0]+dx-origin[0],p[1]+dy-origin[1])>256)continue;
  for(const dz of [0,8,-8,16,-16]){const q=[p[0]+dx,p[1]+dy,p[2]+dz],key=q.join(',');if(visited.has(key))break;
   if(!sampleSpawn(hull,q).staticCandidate||![.25,.5,.75].every(t=>hull.contents(p.map((x,i)=>x+(q[i]-x)*t))===-1))continue;
   visited.add(key);queue.push(q);
   if(outsideExits(q)&&spawns.every(s=>Math.abs(s.origin[0]-q[0])>=32||Math.abs(s.origin[1]-q[1])>=32||Math.abs(s.origin[2]-q[2])>=72))spawns.push({classname:`cof_coop_spawn${spawns.length+1}`,origin:q,angles});
   break;
  }if(spawns.length===4)break;
 }}
 if(spawns.length>=2)return {status:'IMPLEMENTED_AWAITING_GAMEPLAY_VERIFICATION',supportedSlots:spawns.length,reason:spawns.length===4?'Connected stair-floor candidates':'Only two/three separated static positions; do not use four players',landmark,originalStart:chosen.index,anchor,arrival,originalOrigin:origin,spawns};
 return {status:'BLOCKED',reason:'Original entry lacks two supported separated nearby positions',landmark,anchor,arrival,originalStart:chosen.index,spawns:[]};
}
