import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeBsp,sha256,uniqueValue as v} from '../scripts/bsp.mjs';
import {assembleCampaign} from '../scripts/build-connected-campaign.mjs';
import {CAMPAIGN5_PARENT} from '../scripts/build-campaign4-rc4.mjs';
const repo=fileURLToPath(new URL('..',import.meta.url));
const maps=process.env.COF_ORIGINAL_MAPS,build=process.env.COF_CAMPAIGN5_BUILD,previous=process.env.COF_CAMPAIGN4_BUILD,parent3=process.env.COF_COOP_FIXES3_BUILD;
const ready=!!(maps&&build&&previous&&parent3&&fs.existsSync(path.join(build??'','state-report.json')));
const cls=e=>v(e,'classname');

test('campaign5 build: only the prologue differs from coop-fixes-004, and it has no added rain',{skip:!ready},()=>{
 const summary=JSON.parse(fs.readFileSync(path.join(build,'state-report.json')));
 assert.equal(summary.campaign5,true);assert.equal(summary.prologueRain,false);assert.equal(summary.campaign5PreviousCatalogSha256,CAMPAIGN5_PARENT);
 assert.deepEqual(summary.campaign5ChangedMaps,['cof_campaign_story4']);assert.equal(summary.convertedMaps,194);
 for(const file of fs.readdirSync(build).filter(f=>f.endsWith('.bsp'))){
  const map=file.slice(0,-4),now=fs.readFileSync(path.join(build,file)),before=fs.readFileSync(path.join(previous,file)),report=JSON.parse(fs.readFileSync(path.join(build,map+'.json')));
  assert.equal(report.campaign5,true);assert.equal(report.campaign5ParentSha256,sha256(before));
  if(map!=='cof_campaign_story4'){assert.ok(now.equals(before),'unchanged '+map);continue;}
  const entities=decodeBsp(now).entities,old=decodeBsp(before).entities,parent=decodeBsp(fs.readFileSync(path.join(parent3,file))).entities;
  assert.equal(entities.filter(e=>cls(e)==='env_rain').length,0);assert.ok(old.filter(e=>cls(e)==='env_rain').length>0);
  // The authored constant rain is the coop-fixes-003 value again, not 3000 drips.
  const modify=list=>list.filter(e=>cls(e)==='rain_modify').map(e=>v(e,'m_dripsPerSecond')??v(e,'drips')??JSON.stringify(e.pairs));
  assert.deepEqual(modify(entities),modify(parent));
  // The new-campaign door reset is kept.
  assert.equal(entities.filter(e=>cls(e)==='multi_manager'&&/^sc4_campaign_doors_reset_/.test(v(e,'targetname')??'')).length,Math.ceil(summary.resetStates/15));
  assert.equal(report.modelClones.length,JSON.parse(fs.readFileSync(path.join(parent3,map+'.json'))).modelClones?.length??0);
  // The plan reproduces the output from the original map.
  const source=fs.readFileSync(path.join(maps,report.sourceMap+'.bsp'));assert.equal(sha256(source),report.sourceSha256);
  assert.ok(assembleCampaign(source,structuredClone(entities),structuredClone(report.modelClones)).output.equals(now));
 }
});

test('main-menu Custom Campaign entries name the adapter tokens in the native file format',()=>{
 const adapter=fs.readFileSync(path.join(repo,'native','rc4','session-runtime.hpp'),'utf8');
 // coop-fixes-012: New Game and Load Slot 1..3 (the adapter maps sc4coop_slotN to slot N).
 for(const [kind,token] of [['new','sc4coop_new'],['slot1','sc4coop_slot1'],['slot2','sc4coop_slot2'],['slot3','sc4coop_slot3']]){
  const text=fs.readFileSync(path.join(repo,'scripts','menu','storycoop_'+kind+'.custom'),'latin1');
  const pairs=Object.fromEntries([...text.matchAll(/"([^"]*)"\s+"([^"]*)"/g)].map(m=>[m[1],m[2]]));
  assert.deepEqual(Object.keys(pairs).sort(),['author','description','firstmap']);
  assert.equal(pairs.firstmap,token);assert.ok(adapter.includes('"sc4coop_new"')&&adapter.includes('"sc4coop_slot",12')&&pairs.description.length<=26);
  // The client copies 64 bytes per field (1002E458/1002E495/1002E4E6).
  for(const value of Object.values(pairs))assert.ok(value.length<64&&/^[\x20-\x7e]+$/.test(value));
 }
});
