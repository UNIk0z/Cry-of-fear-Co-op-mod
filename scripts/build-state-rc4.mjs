import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeBsp,sha256,uniqueValue as v} from './bsp.mjs';
import {assembleCampaign} from './build-connected-campaign.mjs';
import {applyCampaignState} from './campaign-state-rc4.mjs';
import {prepareOutput} from './cof-inspect.mjs';

export const RC4_ENTRY='cof_campaign_story4';
export const RC4_MAPS=[
 {sourceMap:'c_intro',parent:'cof_campaign_story3',parentRelease:'rc3',map:RC4_ENTRY,sourceSha256:'656980821d003a1d7974aaccb73210547d449318cacdf7661b0e03803f49a140',parentSha256:'eaa4b29ee0ded1e7432e56c054da75ae507e62fe541b841035a3fa2ccc3b332b',parentPlanSha256:'b516acb2ef0e1e75b187a145200345fc94591d2cdbc29db88976eddae654eb21'},
 {sourceMap:'c_nightmare',parent:'s3_nightmare',parentRelease:'rc3',map:'s4_nightmare',sourceSha256:'c6f78abb7ebc8299c62db69a018f652bdd9f35915cb90dd2d46257699c00ba65',parentSha256:'0f1614b85210699ba9849c145da85d8ea6c2a142be41430491cb2ecfefbe082f',parentPlanSha256:'7c36e3804b1de49b15b5f8b4fe239bbab9721c4ea9a05dc764c37d2fd005536c'},
 {sourceMap:'c_start',parent:'s3_start',parentRelease:'rc3',map:'s4_start',sourceSha256:'72d1520baf7950ba056c6bc53310612c8582e83488a4df690199045e67815415',parentSha256:'68b8e2e273a984627d373427a1c6a35eac8bec2f10cea3404848ce42ee613204',parentPlanSha256:'551c6010641d95ad7a460d35891886cf6776e499322d4a8f6c3fbc962b6d6b9b'},
 {sourceMap:'c_start',parent:'s2_start_e0',parentRelease:'rc2',map:'s4_start_e0',sourceSha256:'72d1520baf7950ba056c6bc53310612c8582e83488a4df690199045e67815415',parentSha256:'3c56b7627be024754d278429fc17678a9b2b84e7dac9216d446c9c3297d20d5b',parentPlanSha256:'baa2af3b48aeb48fee44d443c6cde9e8a4f4b1802c3ab9157eab690a21d3f7b9'},
 {sourceMap:'c_start2',parent:'s2_start2',parentRelease:'rc2',map:'s4_start2',sourceSha256:'3933456e6c0e8a449ec17e7829c9d69a8880a1e414b54dd6c0cf2b361483157e',parentSha256:'bb71c56963fbd55a27f67323192fb40af2149e2263e56f5e8b70325b37c97f95',parentPlanSha256:'096670862f7086280399bf54d0887918cab53e5fd8653c684ce59f40a5f2e10f'}
];
const cls=e=>v(e,'classname');
const routeEdits={
 cof_campaign_story4:[[573,'cof_changelevel','message','s3_nightmare','s4_nightmare']],
 s4_nightmare:[[581,'cof_changelevel','message','cof_campaign_story3',RC4_ENTRY],[647,'trigger_command','netname','changelevel s3_start','changelevel s4_start']],
 s4_start:[[335,'inter_door_coop_changelevel','message','s2_start2','s4_start2'],[1073,'cof_changelevel','message','s2_start2','s4_start2']],
 s4_start_e0:[[335,'inter_door_coop_changelevel','message','s2_start2','s4_start2'],[1073,'cof_changelevel','message','s2_start2','s4_start2']],
 s4_start2:[[19,'inter_door_coop_changelevel','message','s2_start_e0','s4_start_e0'],[511,'cof_changelevel','message','s2_start_e0','s4_start_e0']]
};

export function buildStateMap(originalBytes,parentBytes,parentPlan,spec){
 const pin=RC4_MAPS.find(s=>s.map===spec.map);
 if(!pin||JSON.stringify(pin)!==JSON.stringify(spec))throw Error('Unknown RC4 map specification');
 const parentPlanSha256=sha256(Buffer.from(JSON.stringify(parentPlan,null,2)+'\n'));
 if(sha256(originalBytes)!==pin.sourceSha256||sha256(parentBytes)!==pin.parentSha256||parentPlanSha256!==pin.parentPlanSha256||parentPlan.map!==pin.parent||parentPlan.sourceMap!==pin.sourceMap||parentPlan.sourceSha256!==pin.sourceSha256||parentPlan.outputSha256!==pin.parentSha256)throw Error('RC4 protected source/parent/plan mismatch');
 const original=decodeBsp(originalBytes),parent=decodeBsp(parentBytes),models=structuredClone(parentPlan.modelClones??[]);
 if(!assembleCampaign(originalBytes,parent.entities,models).output.equals(parentBytes))throw Error('RC4 parent reconstruction mismatch');
 const entities=structuredClone(parent.entities),changes=[];
 for(const [index,classname,key,before,after] of routeEdits[spec.map]){
  const e=entities[index];if(!e||cls(e)!==classname||v(e,key)!==before)throw Error('RC4 route changed at '+spec.map+':'+index);
  e.pairs=e.pairs.map(([k,val])=>[k,k===key?after:val]);
  changes.push({kind:'route bridge',entity:index,classname,key,before,after});
 }
 if(spec.sourceMap==='c_intro'){
  // Native CRainModify::Use 100A99A0 refuses dynamic multiplayer rain and
  // immediately returns. Keep static rain_settings/rain_modify entities and
  // every supported cinematic action; omit only these two rejected Uses.
  const manager=entities[277];
  if(cls(manager)!=='multi_manager'||v(manager,'targetname')!=='multiintro2'||v(manager,'kakelae')!=='0'||v(manager,'kakelae#1')!=='30'||cls(entities[217])!=='rain_modify'||v(entities[217],'targetname')!=='kakelae')throw Error('RC4 static rain dependency changed');
  manager.pairs=manager.pairs.filter(([key])=>key!=='kakelae'&&key!=='kakelae#1');
  changes.push({kind:'static multiplayer rain',entity:277,removedTargets:['kakelae','kakelae#1'],retainedStaticEntities:[100,101,216,217],nativeWarning:'Rain error: only static rain in multiplayer',warningBranch:'100A99C9..100A99DA returns without removing entities or firing targets'});
 }
 const state=['c_intro','c_start','c_start2'].includes(spec.sourceMap)?applyCampaignState({sourceMap:spec.sourceMap,map:spec.map,parentMap:spec.parent,entities,originalEntities:original.entities,changes}):null;
 const built=assembleCampaign(originalBytes,entities,models);
 if(sha256(originalBytes)!==pin.sourceSha256||sha256(parentBytes)!==pin.parentSha256||sha256(Buffer.from(JSON.stringify(parentPlan,null,2)+'\n'))!==pin.parentPlanSha256)throw Error('RC4 adapter modified protected inputs');
 return {...built,report:{schemaVersion:2,...spec,parentPlanSha256,protectedParent:{map:spec.parent,sha256:pin.parentSha256,planSha256:pin.parentPlanSha256,retained:true},sourceSha256:pin.sourceSha256,outputSha256:sha256(built.output),fileBytes:built.output.length,entities:built.entities,edits:built.edits,appendText:built.appendText,modelClones:built.modelClones,changes,state,status:'AWAITING GAMEPLAY VERIFICATION',maxPlayers:2,inventory:{mechanism:'existing native cof_changelevel / inter_door_coop_changelevel',nightmareHandoff:'preserved verified RC3 raw command, no capture',exactIdentityOrGenericItemRestore:false}}};
}

export function main(args){
 if(args.length!==4)throw Error('Usage: build-state-rc4.mjs ORIGINAL_MAPS RC2_BUILD RC3_BUILD NEW_BUILD');
 const [maps,rc2,rc3,destination]=args;
 // Complete input validation and generation before creating the output directory.
 const prepared=RC4_MAPS.map(spec=>{const parents=spec.parentRelease==='rc3'?rc3:rc2;return {spec,...buildStateMap(fs.readFileSync(path.join(maps,spec.sourceMap+'.bsp')),fs.readFileSync(path.join(parents,spec.parent+'.bsp')),JSON.parse(fs.readFileSync(path.join(parents,spec.parent+'.json'))),spec)};});
 const out=prepareOutput(destination,[maps,rc2,rc3]);
 for(const r of prepared){fs.writeFileSync(path.join(out,r.spec.map+'.bsp'),r.output,{flag:'wx'});fs.writeFileSync(path.join(out,r.spec.map+'.json'),JSON.stringify(r.report,null,2)+'\n',{flag:'wx'});}
 const report={schemaVersion:2,release:'story-state-rc4',entry:RC4_ENTRY,originalMaps:4,convertedMaps:prepared.length,protectedRC3:RC4_MAPS.filter(s=>s.parentRelease==='rc3').map(s=>({map:s.parent,sha256:s.parentSha256,planSha256:s.parentPlanSha256})),results:prepared.map(({report:{edits,appendText,...r}})=>r),status:'AWAITING GAMEPLAY VERIFICATION'};
 fs.writeFileSync(path.join(out,'state-report.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({out,maps:prepared.length,entry:RC4_ENTRY,protectedRC3:report.protectedRC3.map(m=>m.map),status:report.status}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{main(process.argv.slice(2));}catch(e){console.error(e.stack);process.exitCode=1;}}
