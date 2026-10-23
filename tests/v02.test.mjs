import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeBsp,sha256} from '../scripts/bsp.mjs';
import {assembleCampaign} from '../scripts/build-connected-campaign.mjs';
import {startChains,stagedActors,chainOps,V02_PARENT} from '../scripts/build-v02-maps.mjs';
import {V02_PARENT as PACKAGE_V02_PARENT} from '../scripts/package-state-rc4.mjs';
const repo=fileURLToPath(new URL('..',import.meta.url));
const src=f=>fs.readFileSync(path.join(repo,'native','rc4',f),'utf8');
const v01=process.env.COF_V01_BUILD,v02=process.env.COF_V02_BUILD,game=process.env.COF_GAME_DIRECTORY,pkg=process.env.COF_V02_PACKAGE;
const haveBuilds=!!(v01&&v02&&game&&fs.existsSync(path.join(v02,'v02-summary.json'))&&fs.existsSync(path.join(game,'maps','c_apartment1.bsp')));
const v=(e,k)=>{const p=e.pairs.find(q=>q[0]===k);return p?p[1]:undefined;};
const cls=e=>v(e,'classname');

// What the v0.2 playtest fixes require of one built map (single-player source = truth).
function violations(dir,map,maps){
 const plan=JSON.parse(fs.readFileSync(path.join(dir,map+'.json'),'utf8'));
 const source=fs.readFileSync(path.join(maps,plan.sourceMap+'.bsp')),original=decodeBsp(source).entities,entities=decodeBsp(fs.readFileSync(path.join(dir,map+'.bsp'))).entities;
 const out=[],staged=stagedActors(entities);
 const atLoad=new Set(entities.filter(e=>cls(e)==='env_customize'&&!v(e,'targetname')&&v(e,'m_iVisible')==='2').map(e=>v(e,'target')));
 for(const c of startChains(source))for(const a of c.hides)if(staged.has(a)&&entities.some(e=>cls(e)==='env_model'&&v(e,'targetname')===a)&&!atLoad.has(a))out.push('staged actor not hidden at load: '+a);
 for(const e of entities)if(cls(e)==='trigger_command'&&/^sv_coop_music /.test(v(e,'netname')??''))out.push('door music only sets the cvar: '+v(e,'targetname'));
 for(const o of original){
  if(cls(o)!=='inter_door')continue;const e=entities[o.index];if(!e)continue;
  if(cls(e)==='inter_door_coop_changelevel'&&v(o,'music')&&v(e,'music')!==v(o,'music'))out.push('level-change door lost its music: '+o.index);
  if(cls(e)==='func_button'&&v(o,'silentroom')&&v(o,'silentroom')!=='0'){
   const chain=entities.find(x=>cls(x)==='multi_manager'&&v(x,'targetname')===v(e,'target'));
   if(chain&&!chainOps(entities,v(e,'target')).some(x=>cls(x.entity)==='trigger_command'&&/^sc_door_music - /.test(v(x.entity,'netname')??'')))out.push('silent room does not stop the music: '+o.index);
  }
 }
 return out;
}

test('v0.2 adapter: no model hiding, door music command, scene teleports, ladder lock, recorder on Use only, read-only idle trace, schema 7',()=>{
 const adapter=src('adapter.cpp'),coop=src('coop-runtime.hpp'),ladder=src('ladder-runtime.hpp'),ckp=src('checkpoint-runtime.hpp'),format=src('checkpoint.cpp');
 assert.ok(!/hide_actor_from|simon_actor_model/.test(adapter+coop));
 assert.ok(adapter.includes('"sc_door_music",&door_music_command')&&coop.includes('store(p,0x2310,name)')&&coop.includes('"sv_coop_music"'));
 assert.ok(!/recorder_notice_frame|near_any_recorder/.test(adapter+coop)&&ckp.includes('"Only host can save the game"'));
 assert.ok(adapter.includes('scene_teleport_frame(e)')&&coop.includes('scene_watched(o,now)!=camera'));
 assert.ok(ladder.includes('1024.f*1024.f')&&!ladder.includes('384.f*384.f')&&ladder.includes('0x20u'));
 const idle=coop.slice(coop.indexOf('// --- P2 idle camera diagnostics'),coop.indexOf('// --- "stuck"'));assert.ok(idle.length>500&&!/store\(/.test(idle));
 assert.ok(/w\.put<std::uint32_t>\([78]\)/.test(format)&&/version>[78]/.test(format)&&ckp.includes('loadedCheckpoint.music'));
 assert.ok(/@\(1,2,3,4,5,6,7(,8)?\)/.test(fs.readFileSync(path.join(repo,'scripts','read-coop-checkpoint.ps1'),'utf8')));
 assert.equal(V02_PARENT,PACKAGE_V02_PARENT);
 // Still exactly one direct call into the pinned game DLL.
 assert.equal((src('story-runtime.hpp').match(/0xDE990/g)??[]).length,1);
});

test('v0.2 maps: every map passes the playtest checks; v0.1 fails them; unchanged maps are byte-identical',{skip:!haveBuilds},()=>{
 const maps=path.join(game,'maps'),summary=JSON.parse(fs.readFileSync(path.join(v02,'v02-summary.json'),'utf8'));
 const names=fs.readdirSync(v02).filter(f=>f.endsWith('.json')&&!['state-report.json','v02-summary.json'].includes(f)).map(f=>f.slice(0,-5));
 assert.equal(names.length,194);let before=0;const failed=[];
 for(const map of names){
  const bad=violations(v02,map,maps);if(bad.length)failed.push(map+': '+bad.join('; '));
  before+=violations(v01,map,maps).length;
  const a=fs.readFileSync(path.join(v01,map+'.bsp')),b=fs.readFileSync(path.join(v02,map+'.bsp'));
  assert.equal(!a.equals(b),summary.changedMaps.includes(map),map);
  if(summary.changedMaps.includes(map)){const plan=JSON.parse(fs.readFileSync(path.join(v02,map+'.json'),'utf8'));
   assert.equal(sha256(b),plan.outputSha256);assert.equal(plan.v02ParentSha256,sha256(a));
   const source=fs.readFileSync(path.join(maps,plan.sourceMap+'.bsp'));assert.ok(assembleCampaign(source,decodeBsp(b).entities,plan.modelClones??[]).output.equals(b),map);}
 }
 assert.deepEqual(failed,[]);
 assert.ok(before>300,'the same checks find the playtest faults in v0.1 ('+before+')');
});

test('v0.2 package: v0.1 parent, changed maps from the build, adapter and docs',{skip:!(pkg&&fs.existsSync(path.join(pkg??'','release.json'))&&haveBuilds)},()=>{
 const c=JSON.parse(fs.readFileSync(path.join(pkg,'release.json'),'utf8')),summary=JSON.parse(fs.readFileSync(path.join(v02,'v02-summary.json'),'utf8'));
 assert.equal(c.coopFixes.id,'v0.2');assert.equal(c.coopFixes.parentCatalog,V02_PARENT);assert.deepEqual([...c.coopFixes.changedMaps].sort(),[...summary.changedMaps].sort());
 assert.equal(sha256(fs.readFileSync(path.join(pkg,'native','storycoop_rc4.dll'))),c.runtimeAdapter.sha256);
 assert.equal(JSON.parse(fs.readFileSync(path.join(pkg,'known-builds.json'),'utf8')).builds[0].catalogSha256,V02_PARENT);
 assert.ok(fs.readFileSync(path.join(pkg,'README.md'),'utf8').includes('v0.2'));
});
