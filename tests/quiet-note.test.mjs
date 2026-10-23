import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {decodeBsp,sha256,uniqueValue as v} from '../scripts/bsp.mjs';
import {buildSharedNote} from '../scripts/build-shared-note.mjs';
import {buildQuietNote,QUIET_NOTE_MAP} from '../scripts/build-quiet-note.mjs';
const fixture=process.env.COF_C_START2_FIXTURE,options={skip:!fixture};

test('quiet-note candidate changes only the five selected helper records and appends eight routing entities',options,()=>{
 const source=fs.readFileSync(fixture),parent=decodeBsp(buildSharedNote(source).output),result=buildQuietNote(source),b=decodeBsp(result.output);
 assert.equal(result.report.map,QUIET_NOTE_MAP);assert.equal(b.entities.length,501);
 assert.equal(result.report.status,'FAILED_REMOTE_DELIVERY_WITHDRAWN');
 assert.equal(sha256(result.output),'6ccca5777cfa39c002d765bb0c9859f209693a945fd70382575cde1898041967');
 assert.deepEqual(b.lumps.slice(1),parent.lumps.slice(1));assert.ok(result.output.subarray(12,source.length).equals(source.subarray(12)));
 const changed=[];
 for(let i=0;i<parent.entities.length;i++)if(JSON.stringify(parent.entities[i].pairs)!==JSON.stringify(b.entities[i].pairs))changed.push(v(parent.entities[i],'targetname'));
 assert.deepEqual(changed,['cof_note243_collect',...Array.from({length:4},(_,i)=>`cof_note243_grant${i+1}`)]);
 assert.ok(!b.entities.slice(parent.entities.length).some(e=>/^(weapon_|item_|ammo_|cof_passwordnote$)/.test(v(e,'classname')??'')));
 assert.ok(result.report.limits.includes('not a silent API'));
});
test('recipient grant and close route synchronously; collector read retains the original manager activator',options,()=>{
 const b=decodeBsp(buildQuietNote(fs.readFileSync(fixture)).output),named=name=>b.entities.filter(e=>v(e,'targetname')===name);
 const manager=named('cof_note243_collect')[0];
 assert.equal(v(manager,'spawnflags'),'1');assert.equal(v(manager,'cof_note243_players'),'0');
 assert.equal(v(manager,'cof_note243_grant1_note'),'0.05');
 for(let i=1;i<=4;i++){
  const name=`cof_note243_grant${i}`,raw=name+'_note',routes=named(name);
  assert.deepEqual(routes.map(e=>v(e,'classname')),['trigger_relay','cof_closeallvgui']);
  assert.equal(v(routes[0],'target'),raw);assert.equal(v(routes[0],'delay'),undefined);
  assert.equal(v(routes[0],'triggerstate'),'2');assert.equal(v(named(raw)[0],'classname'),'cof_passwordnote');
  const counter=named('cof_note243_dispatch').find(e=>v(e,'health')===String(i));
  assert.equal(v(counter,'target'),name);
 }
 // Graph checks only: packet order, lack of visible flash, journal persistence,
 // duplicates and menu side effects require the real two-client Steam test.
});
