// coop-fixes-008: Simon's player model, built on each PC from that PC's own
// game files (nothing of the game's models is shipped).
//
// The game's models\player.mdl is the police model, so 005..007 installed a
// police officer named simon. The real Simon mesh lives in
// models\cutscene\simon_clothes.mdl on a Biped skeleton that lines up with the
// player skeleton of models\player\police1\police1.mdl. The player model is
// police1 (bones, sequences, hitboxes, attachments) with Simon's textures,
// skins and body parts appended; every Simon vertex/normal is moved from its
// Simon bone's bind space into the bind space of the matching police bone.
//
// Package time (this file): read the bind poses, choose the bone map and the
// per-bone transforms, and store them with their exact IEEE bits in the
// catalog. Install time (install-story-package.ps1, same arithmetic): only
// multiply-adds in doubles, rounded to float32, so the result is
// byte-identical on every PC and checked against the catalog SHA256.
import fs from 'node:fs';

export const SIMON_SOURCES={police:'models/player/police1/police1.mdl',simon:'models/cutscene/simon_clothes.mdl'};
const SPECIAL={veska:'Bip01 Pelvis'};   // the bag hangs off the pelvis

function readBones(b){
 const n=b.readInt32LE(0x8c),at=b.readInt32LE(0x90),out=[];
 for(let i=0;i<n;++i){const o=at+i*112;const raw=b.subarray(o,o+32);const end=raw.indexOf(0);
  out.push({name:raw.subarray(0,end<0?32:end).toString('latin1'),parent:b.readInt32LE(o+32),value:[0,1,2,3,4,5].map(k=>b.readFloatLE(o+64+k*4))});}
 return out;
}
// Studio AngleQuaternion / QuaternionMatrix / bind pose to model space.
function quat(a){const sy=Math.sin(a[2]*.5),cy=Math.cos(a[2]*.5),sp=Math.sin(a[1]*.5),cp=Math.cos(a[1]*.5),sr=Math.sin(a[0]*.5),cr=Math.cos(a[0]*.5);
 return [sr*cp*cy-cr*sp*sy,cr*sp*cy+sr*cp*sy,cr*cp*sy-sr*sp*cy,cr*cp*cy+sr*sp*sy];}
function qmat([x,y,z,w]){return [[1-2*y*y-2*z*z,2*x*y-2*w*z,2*x*z+2*w*y],[2*x*y+2*w*z,1-2*x*x-2*z*z,2*y*z-2*w*x],[2*x*z-2*w*y,2*y*z+2*w*x,1-2*x*x-2*y*y]];}
const mul=(A,B)=>A.map((_,i)=>[0,1,2].map(j=>A[i][0]*B[0][j]+A[i][1]*B[1][j]+A[i][2]*B[2][j]));
const mv=(A,v)=>[0,1,2].map(i=>A[i][0]*v[0]+A[i][1]*v[1]+A[i][2]*v[2]);
function world(bones){const W=[];for(const b of bones){const R=qmat(quat(b.value.slice(3))),t=b.value.slice(0,3);
 if(b.parent<0)W.push([R,t]);else{const [PR,Pt]=W[b.parent];const r=mv(PR,t);W.push([mul(PR,R),[r[0]+Pt[0],r[1]+Pt[1],r[2]+Pt[2]]]);}}return W;}

// Bone map and 12 doubles per Simon bone (row-major 3x3, then offset):
// police_bind^-1 * simon_bind.
export function simonPlan(police,simon){
 const pb=readBones(police),sb=readBones(simon),WP=world(pb),WS=world(sb),pidx=new Map(pb.map((b,i)=>[b.name,i]));
 if(pb.length<1||sb.length<1||sb.length>255)throw Error('Unexpected skeletons');
 const boneMap=sb.map((b,i)=>{let n=b.name;if(SPECIAL[n]){if(!pidx.has(SPECIAL[n]))throw Error('Missing pelvis');return pidx.get(SPECIAL[n]);}
  while(!pidx.has(n)){i=sb[i].parent;if(i<0)throw Error('Simon bone without a player ancestor: '+b.name);n=sb[i].name;}return pidx.get(n);});
 const values=new Float64Array(sb.length*12);
 sb.forEach((_,i)=>{const [Rs,ts]=WS[i],[Rp,tp]=WP[boneMap[i]];const RpT=[0,1,2].map(k=>[0,1,2].map(j=>Rp[j][k]));
  const M=mul(RpT,Rs),c=mv(RpT,[ts[0]-tp[0],ts[1]-tp[1],ts[2]-tp[2]]);values.set([...M[0],...M[1],...M[2],...c],i*12);});
 return {boneMap,transforms:Buffer.from(values.buffer).toString('base64')};
}

// Same steps and the same floating-point order as the installer's C#.
export function buildSimonModel(police,simon,plan){
 const map=plan.boneMap,xf=new Float64Array(new Uint8Array(Buffer.from(plan.transforms,'base64')).buffer);
 if(xf.length!==map.length*12)throw Error('Transform count');
 const X=(police.length+15)&~15,out=Buffer.alloc(X+simon.length);police.copy(out,0);simon.copy(out,X);
 const r=o=>out.readInt32LE(o),w=(o,v)=>out.writeInt32LE(v,o);
 const [nt,ti,td]=[180,184,188].map(o=>simon.readInt32LE(o)),[nsr,nsf,si]=[192,196,200].map(o=>simon.readInt32LE(o)),[nbp,bpi]=[204,208].map(o=>simon.readInt32LE(o));
 for(let i=0;i<nt;++i){const o=X+ti+80*i;w(o+76,r(o+76)+X);}
 const point=(at,b,translate)=>{const v=[out.readFloatLE(at),out.readFloatLE(at+4),out.readFloatLE(at+8)],m=b*12;
  for(let a=0;a<3;++a){let t=xf[m+a*3]*v[0];t=t+xf[m+a*3+1]*v[1];t=t+xf[m+a*3+2]*v[2];if(translate)t=t+xf[m+9+a];out.writeFloatLE(Math.fround(t),at+a*4);}};
 for(let i=0;i<nbp;++i){const o=X+bpi+76*i,nm=r(o+64);w(o+72,r(o+72)+X);const mi=r(o+72);
  for(let j=0;j<nm;++j){const mo=mi+112*j;const [nmesh,meshi,nv,vinfo,vi,nn,ninfo,ni]=[72,76,80,84,88,92,96,100].map(k=>r(mo+k));
   for(const k of [76,84,88,96,100,108]){const v=r(mo+k);if(v)w(mo+k,v+X);}
   for(let m=0;m<nmesh;++m){const me=X+meshi+20*m;w(me+4,r(me+4)+X);if(r(me+16))w(me+16,r(me+16)+X);}
   for(let k=0;k<nv;++k){const b=out[X+vinfo+k];if(b>=map.length)throw Error('Vertex bone');point(X+vi+12*k,b,true);out[X+vinfo+k]=map[b];}
   for(let k=0;k<nn;++k){const b=out[X+ninfo+k];if(b>=map.length)throw Error('Normal bone');point(X+ni+12*k,b,false);out[X+ninfo+k]=map[b];}}}
 w(180,nt);w(184,X+ti);w(188,X+td);w(192,nsr);w(196,nsf);w(200,X+si);w(204,nbp);w(208,X+bpi);
 out.fill(0,8,72);out.write('simon.mdl',8,'latin1');w(72,out.length);
 return out;
}

export function simonModelFromGame(gameRoot){
 const police=fs.readFileSync(gameRoot+'/'+SIMON_SOURCES.police),simon=fs.readFileSync(gameRoot+'/'+SIMON_SOURCES.simon);
 const plan=simonPlan(police,simon);return {police,simon,plan,model:buildSimonModel(police,simon,plan)};
}
