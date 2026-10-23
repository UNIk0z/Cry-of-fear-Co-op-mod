import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {decodeBsp,sha256,uniqueValue as v} from '../scripts/bsp.mjs';
import {buildSharedNote} from '../scripts/build-shared-note.mjs';
import {buildStoryCandidate,V11_SHA} from '../scripts/build-story-candidate.mjs';
const fixture=process.env.COF_C_START2_FIXTURE,opts={skip:!fixture};
test('RC1 adds shared password and four spawns, preserving V11 door and username records',opts,()=>{
 const bytes=fs.readFileSync(fixture),baseline=buildSharedNote(bytes);assert.equal(sha256(baseline.output),V11_SHA);
 const base=decodeBsp(baseline.output),r=buildStoryCandidate(bytes),b=decodeBsp(r.output);
 assert.equal(b.entities.length,511);assert.ok(r.output.subarray(12,bytes.length).equals(bytes.subarray(12)));assert.deepEqual(b.lumps.slice(1),base.lumps.slice(1));
 for(let i=0;i<base.entities.length;i++)if(i!==242)assert.deepEqual(b.entities[i].pairs,base.entities[i].pairs);
 assert.equal(v(b.entities[242],'classname'),'env_model');assert.equal(v(b.entities[242],'origin'),'-600 1086 -602');
 const helpers=b.entities.filter(e=>/^cof_note242_grant[1-4]$/.test(v(e,'targetname')??''));assert.equal(helpers.length,4);
 for(const e of helpers){assert.equal(v(e,'usertype'),'1');assert.equal(v(e,'classname'),'cof_passwordnote');}
 for(let slot=1;slot<=4;slot++)assert.equal(b.entities.filter(e=>v(e,'classname')===`cof_coop_spawn${slot}`).length,1);
 assert.ok(!b.entities.some(e=>v(e,'classname')==='cof_closeallvgui'));
 assert.deepEqual(buildStoryCandidate(bytes).output,r.output);assert.throws(()=>buildStoryCandidate(r.output),/SHA256 mismatch/);
});
