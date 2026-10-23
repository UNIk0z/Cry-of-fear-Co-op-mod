import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {decodeBsp,uniqueValue as v} from '../scripts/bsp.mjs';
import {convertStoryDoors} from '../scripts/convert-story-doors.mjs';
import {extendDoorCandidate,apartmentResources} from '../scripts/build-door-batch.mjs';
const fixture=process.env.COF_APARTMENT1_FIXTURE,opts={skip:!fixture};
test('apartment resource fallback adds exactly three separated copies per selected type and retains original keys',opts,()=>{
 const bytes=fs.readFileSync(fixture),original=decodeBsp(bytes),r=apartmentResources(bytes);
 assert.equal(r.added.length,6);assert.equal(r.records.length,2);
 for(const record of r.records){assert.equal(record.extraOrigins.length,3);assert.equal(new Set(record.extraOrigins.map(p=>p.join(' '))).size,3);}
 for(const e of r.added)assert.ok(!e.pairs.some(([k])=>['target','master','targetname'].includes(k)));
 const conversion=convertStoryDoors(bytes,{sourceMap:'c_apartment1',map:'c_apartment1_story_rc1'}),built=extendDoorCandidate(bytes,conversion,{resources:true}),b=decodeBsp(built.output);
 assert.equal(b.entities.length,decodeBsp(conversion.output).entities.length+10);assert.deepEqual(b.lumps.slice(1),original.lumps.slice(1));assert.ok(built.output.subarray(12,bytes.length).equals(bytes.subarray(12)));
 assert.deepEqual(b.entities[342].pairs,original.entities[342].pairs);assert.equal(v(b.entities[342],'classname'),'item_key');
 assert.deepEqual(extendDoorCandidate(bytes,conversion,{resources:true}).output,built.output);
});
