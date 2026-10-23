import {decodeBsp,uniqueValue as v} from './bsp.mjs';

// Exact hull-0 point contents (nodes/leaves), unlike the clip hulls in
// collision.mjs: thin windows and the sky brush are told apart. -1 empty,
// -2 solid, -3 water, -6 sky.
export function pointContents(bytes){
 const bsp=decodeBsp(bytes),slice=i=>{const l=bsp.lumps[i];return bytes.subarray(l.offset,l.offset+l.length);};
 const planes=slice(1),nodes=slice(5),leaves=slice(10),models=slice(14),root=models.readInt32LE(36);
 if(!planes.length||planes.length%20||!nodes.length||nodes.length%24||!leaves.length||leaves.length%28)throw Error('Invalid hull-0 lump sizes');
 return p=>{let n=root,guard=0;while(n>=0){if(++guard>4096||n>=nodes.length/24)throw Error('Bad hull-0 node');const a=n*24,pl=nodes.readInt32LE(a)*20;
  const d=planes.readFloatLE(pl)*p[0]+planes.readFloatLE(pl+4)*p[1]+planes.readFloatLE(pl+8)*p[2]-planes.readFloatLE(pl+12);n=nodes.readInt16LE(a+4+(d>=0?0:2));}
  const leaf=-1-n;if(leaf>=leaves.length/28)throw Error('Bad hull-0 leaf');return leaves.readInt32LE(leaf*28);};
}

// Native env_rain (CEnvRain, hl.dll vtable 101C20D8): Spawn 1009E8C0 sets the
// brush model's bounds, EF_NODRAW and SOLID_NOT; Think 100A0DB0 sends
// MSG_BROADCAST TE_BEAMPOINTS streaks from random points of the box top down to
// the first surface (m_iExtent 1), so every client sees the same rain wherever
// the player bodies are. It reads pev->mins/maxs WITHOUT the origin, so the
// volume is the appended bounds model itself. KeyValue 10096D30 names.
export const RAIN_STREAKS={texture:'sprites/rain.spr',m_dripSize:20,m_dripSpeed:40,m_burstSize:6,m_brightness:160,m_flUpdateTime:0.1,m_fLifeTime:0.5,m_iExtent:1,rendercolor:'180 190 210'};

// Evidence that the volume top is open air (streak origins) and not sky/solid.
export function rainVolumeEvidence(contents,mins,maxs,step=64){
 let open=0,total=0;
 for(let x=mins[0];x<=maxs[0];x+=step)for(let y=mins[1];y<=maxs[1];y+=step){total++;if(contents([x,y,maxs[2]])===-1)open++;}
 return {topSamples:total,openTop:open,openFraction:total?open/total:0};
}

export function addRainVolume({bytes,entities,models,nativeModelCount,sourceModel=1,mins,maxs,name,minOpen=0.5,contents=pointContents(bytes)}){
 if(mins.some((x,i)=>!(x<maxs[i])))throw Error('Empty rain volume '+name);
 const evidence=rainVolumeEvidence(contents,mins,maxs);
 if(evidence.openFraction<minOpen)throw Error(`Rain volume ${name} top is not open air (${evidence.openTop}/${evidence.topSamples})`);
 const index=nativeModelCount+models.length;models.push({sourceModel,mins,maxs,index,purpose:'Native env_rain streak volume; never drawn or solid'});
 const e={index:entities.length,pairs:Object.entries({classname:'env_rain',model:'*'+index,origin:'0 0 0',...RAIN_STREAKS}).map(([k,val])=>[k,String(val)])};
 entities.push(e);
 return {name,entity:e.index,model:'*'+index,mins,maxs,...evidence};
}

// Prologue (c_intro) rain for every co-op client. The client rain
// (RainData, client 10085980) spawns drops around the LOCAL PLAYER'S BODY from
// the first rain_settings height (568), so lobby bodies never put rain in the
// street (2,000 units away) or on the rooftops (z 970..1826, above 568).
// kakelae (3000 drops) stays unused: native rain_modify Use refuses
// multiplayer (100A99C9) and UpdateClientData (100F8150) overwrites any value
// with the constant rain_modify anyway. Volumes come from hull-0 scans of the
// shot focus points (sky z 606 street, 1826/1650 rooftops).
export const PROLOGUE_RAIN=[
 {name:'street (inkamera1)',mins:[-150,-2400,-40],maxs:[1100,-250,596]},
 {name:'rooftops south (kkamera1-4)',mins:[550,-3650,960],maxs:[1150,-2050,1815]},
 {name:'rooftops north (kkamera1-4)',mins:[700,-2050,960],maxs:[1150,250,1640]}
];
export function addPrologueRain({bytes,entities,models,changes}){
 const original=decodeBsp(bytes),cls=e=>v(e,'classname');
 const settings=entities[100],steady=entities[101];
 if(cls(settings)!=='rain_settings'||v(settings,'m_flDistance')!=='3000'||cls(steady)!=='rain_modify'||v(steady,'targetname')||v(steady,'m_iDripsPerSecond')!=='1000'||cls(entities[217])!=='rain_modify'||v(entities[217],'m_iDripsPerSecond')!=='3000')throw Error('Prologue rain dependencies changed');
 // The constant (unnamed) rain_modify is what every client gets; use the
 // authored heavy-rain value the multiplayer refusal never let through.
 steady.pairs=steady.pairs.map(([k,val])=>[k,k==='m_iDripsPerSecond'?'3000':val]);
 const contents=pointContents(bytes),nativeModelCount=original.lumps[14].length/64,volumes=PROLOGUE_RAIN.map(r=>addRainVolume({bytes,entities,models,nativeModelCount,contents,...r}));
 changes.push({kind:'prologue rain for every co-op client',clientRain:{entity:101,dripsPerSecond:{from:1000,to:3000,source:'kakelae #217'}},streaks:RAIN_STREAKS,volumes,status:'AWAITING GAMEPLAY VERIFICATION'});
 return volumes;
}
