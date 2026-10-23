import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {validateStoryNotes,CAFE_CREDENTIALS} from '../scripts/note-validation.mjs';
import {MAINTENANCE_MAPS} from '../scripts/build-maintenance-rc4.mjs';
const maps=process.env.COF_ORIGINAL_MAPS,build=process.env.COF_REGRESSION_BUILD,parent=process.env.COF_MAINTENANCE_BUILD;
test('original document, generated credential and virtual code-note types validate their actual resources',{skip:!maps},()=>{
 const assets=path.dirname(maps),source=fs.readFileSync(path.join(maps,'c_apartment1.bsp'));
 const notes=validateStoryNotes(source,assets,'c_apartment1');assert.equal(notes.length,4);assert.ok(notes.every(n=>n.type==='cof_document'));
 const cafe=validateStoryNotes(fs.readFileSync(path.join(maps,'c_start2.bsp')),assets,'c_start2');assert.deepEqual(cafe.map(n=>[n.entity,n.kind]),[[242,'pass'],[243,'user']]);
 const long=Object.values(CAFE_CREDENTIALS).flat().map(s=>s+'.txt').filter(s=>s.length>=16);assert.equal(long.length,6);assert.equal(new Set(long.map(s=>s.slice(0,16))).size,long.length);
 assert.throws(()=>validateStoryNotes(Buffer.from(source.toString('latin1').replace('apnote1.txt','missing.txt'),'latin1'),assets,'bad'),/missing|ENOENT/);
 assert.throws(()=>validateStoryNotes(Buffer.from(source.toString('latin1').replace('apnote3.txt','apnote1.txt'),'latin1'),assets,'bad'),/conflicting note ID/);
 assert.throws(()=>validateStoryNotes(Buffer.from(source.toString('latin1').replace('apnote1.txt','../bad_.txt'),'latin1'),assets,'bad'),/unsafe/);
});
test('note patch retains every maintenance BSP and audits all existing converted note aliases',{skip:!build||!parent},()=>{
 for(const spec of MAINTENANCE_MAPS)assert.ok(fs.readFileSync(path.join(build,spec.map+'.bsp')).equals(fs.readFileSync(path.join(parent,spec.map+'.bsp'))));
 const audit=JSON.parse(fs.readFileSync(path.join(build,'note-audit.json')));assert.equal(audit.originalNotes.reduce((n,m)=>n+m.notes.length,0),18);assert.equal(audit.convertedNotes.length,27);assert.equal(audit.newAliases.length,8);
 const types=audit.originalNotes.flatMap(m=>m.notes).reduce((all,n)=>(all[n.type]=(all[n.type]??0)+1,all),{});assert.deepEqual(types,{cof_document:14,cof_addcodenote:2,cof_passwordnote:2});
});
