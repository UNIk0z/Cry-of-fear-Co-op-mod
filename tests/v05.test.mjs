// v0.5 map pass checks. Pure entity edits run on synthetic lists; the spawn
// relocation runs on the delivered s4_park maps when COF_V04_MAPS (the v0.4
// map build, W/work/claude-s17-maps-001) is set.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fallZones,doorWaits,ammoSquares,relocateSpawns,extrasDoorLocked,AMMO_SPACING} from '../scripts/build-v05-maps.mjs';
import {blockedSpawns,brushSolid,coopSpawns} from '../scripts/spawn-exits.mjs';
import {decodeBsp,uniqueValue as v} from '../scripts/bsp.mjs';

const ent=(index,pairs)=>({index,pairs:Object.entries(pairs)});

test('a cof_killplayer fall zone becomes a trigger_hurt that kills only the faller', () => {
  const list=[ent(0,{classname:'trigger_once',model:'*5',target:'fuckingdie'}),ent(1,{classname:'cof_killplayer',targetname:'fuckingdie',spawnflags:'39'}),
    ent(2,{classname:'trigger_once',model:'*6',target:'scene'}),ent(3,{classname:'multi_manager',targetname:'scene',fuckingdie:'2'}),
    ent(4,{classname:'trigger_once',model:'*7',target:'fuckingdie',master:'gate'})];
  const changes=[];assert.equal(fallZones(list,changes),1);
  assert.equal(v(list[0],'classname'),'trigger_hurt');assert.equal(v(list[0],'dmg'),'1000');assert.equal(v(list[0],'target'),undefined);assert.equal(v(list[0],'model'),'*5');
  assert.equal(v(list[2],'classname'),'trigger_once');   // a scene death stays the scene's
  assert.equal(v(list[4],'classname'),'trigger_once');   // gated by a master: untouched
});

test('co-op door panels wait 0.5 s, other buttons keep their wait', () => {
  const list=[ent(0,{classname:'func_button',target:'cof_story_present43',wait:'2.5'}),ent(1,{classname:'func_button',target:'elevator',wait:'2.5'}),ent(2,{classname:'func_button',target:'cof_story_present9',wait:'1'})];
  const changes=[];assert.equal(doorWaits(list,changes),1);
  assert.equal(v(list[0],'wait'),'0.5');assert.equal(v(list[1],'wait'),'2.5');assert.equal(v(list[2],'wait'),'1');
});

test('extra pickup copies sit in a 2x2 square with the original, on its height', () => {
  const list=[ent(0,{classname:'ammo_glock',origin:'100 200 64'}),ent(1,{classname:'ammo_glock',origin:'300 200 64'}),
    ent(2,{classname:'ammo_glock',origin:'136 200 64'}),ent(3,{classname:'ammo_glock',origin:'64 200 64'}),ent(4,{classname:'ammo_glock',origin:'100 236 64'}),
    ent(5,{classname:'ammo_shotgun',origin:'110 200 64'})];
  const changes=[];assert.equal(ammoSquares(list,2,changes),3);
  const at=i=>v(list[i],'origin').split(' ').map(Number);
  const square=[2,3,4].map(at);
  for(const p of square){assert.equal(p[2],64);assert.ok(Math.abs(p[0]-100)<=AMMO_SPACING&&Math.abs(p[1]-200)<=AMMO_SPACING);}
  assert.equal(new Set(square.map(p=>p.join(','))).size,3);
  assert.deepEqual(at(1),[300,200,64]);   // an authored pickup elsewhere is never moved
  assert.deepEqual(at(5),[110,200,64]);   // another type is not a copy
});

test('the extras room door on the first map stays locked', () => {
  const list=[ent(0,{classname:'func_button',targetname:'unlockablesdoor',target:'cof_story_present828'}),ent(1,{classname:'func_button',target:'cof_story_present826'})];
  const changes=[];assert.equal(extrasDoorLocked(list,changes),1);assert.equal(extrasDoorLocked(list,changes),0);
  assert.equal(v(list[0],'lockedby'),'sc5_extras_later');assert.equal(v(list[1],'lockedby'),undefined);
});

const maps=process.env.COF_V04_MAPS;
test('the park spawn slots leave the exit triggers (delivered maps)', {skip:!maps&&'set COF_V04_MAPS to the v0.4 map build'}, () => {
  for(const name of ['s4_park_e1','s4_park2_e1']){
    const bytes=fs.readFileSync(path.join(maps,name+'.bsp'));const bsp=decodeBsp(bytes);
    assert.ok(blockedSpawns(bytes,bsp).length>=2,name+' had blocked slots');
    const entities=structuredClone(bsp.entities),changes=[];assert.ok(relocateSpawns(bytes,entities,changes)>=2);
    assert.equal(blockedSpawns(bytes,{...bsp,entities}).length,0,name+' still blocked');
    assert.ok(changes.every(c=>/^v05 spawn slot moved out of an? (exit|wall)$/.test(c.kind)));
  }
});

test('s4_start slot 2 leaves the black box wall "block" (delivered maps)', {skip:!maps&&'set COF_V04_MAPS to the v0.4 map build'}, () => {
  const bytes=fs.readFileSync(path.join(maps,'s4_start.bsp'));const bsp=decodeBsp(bytes);
  const slot2=e=>coopSpawns({...bsp,entities:e}).find(s=>s.slot===2).origin;
  assert.equal(brushSolid(bytes,bsp)(slot2(bsp.entities)),119);
  const entities=structuredClone(bsp.entities),changes=[];relocateSpawns(bytes,entities,changes);
  assert.equal(brushSolid(bytes,{...bsp,entities})(slot2(entities)),undefined);
  assert.ok(changes.some(c=>c.kind==='v05 spawn slot moved out of a wall'&&c.slot===2&&c.wall===119));
});
