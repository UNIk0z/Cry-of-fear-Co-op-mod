import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {sha256} from './bsp.mjs';
import {prepareOutput} from './cof-inspect.mjs';
const repo=fileURLToPath(new URL('..',import.meta.url));
export function main(args){
 if(args.length!==3||!/^[a-f0-9]{40}$/.test(args[2]))throw Error('Usage: package-connected-campaign.mjs PRIVATE_BUILD NEW_OUTPUT COMMIT');
 const [build,dest,commit]=args,r=JSON.parse(fs.readFileSync(path.join(build,'campaign-report.json'))),out=prepareOutput(dest,[build]),plans=path.join(out,'plans');fs.mkdirSync(plans);
 const maps=[];
 for(const m of r.results){const source=JSON.parse(fs.readFileSync(path.join(build,m.map+'.json'))),bytes=fs.readFileSync(path.join(build,m.map+'.bsp'));if(sha256(bytes)!==source.outputSha256)throw Error('Stale generated map '+m.map);
  const plan=Object.fromEntries(['schemaVersion','map','sourceSha256','outputSha256','fileBytes','edits','appendText','modelClones'].map(k=>[k,source[k]])),encoded=Buffer.from(JSON.stringify(plan)+'\n');fs.writeFileSync(path.join(plans,m.map+'.json'),encoded,{flag:'wx'});
  maps.push({map:m.map,sourceMap:m.sourceMap,sourceSha256:source.sourceSha256,outputSha256:source.outputSha256,planSha256:sha256(encoded),defaultInstall:true,status:m.entryPlan.status});
 }
 const unique=[...new Map(r.results.map(x=>[x.sourceMap,x])).values()];
 const summary={originalMaps:r.originalMaps,generatedMaps:r.convertedMaps,generatedRoutes:r.linkedTransitions,reachableAliases:r.reachableAliases,sourceTransitions:new Set(r.results.flatMap(m=>m.crossings.map(e=>m.sourceMap+':'+e.entity))).size,newSameMapDoors:unique.flatMap(m=>m.doors).filter(d=>d.evidence).length,preservedBaselineDoors:unique.flatMap(m=>m.doors).filter(d=>d.status==='PRESERVED_BASELINE_CHAIN').length,remainingDestinationDoors:unique.flatMap(m=>m.retainedDoors).filter(d=>d.blocking).length,notesAudited:unique.flatMap(m=>m.notes).length,documentAdapters:unique.flatMap(m=>m.notes).filter(n=>n.type==='document').length,cameras:unique.flatMap(m=>m.cameras).length,pickupLocations:unique.flatMap(m=>m.pickups).length,pickupCopies:unique.flatMap(m=>m.pickups).reduce((n,p)=>n+p.copies,0),blockedEntries:r.results.filter(m=>m.entryPlan.status==='BLOCKED').map(m=>({map:m.map,sourceMap:m.sourceMap,landmark:m.landmark,reason:m.entryPlan.reason})),status:'IMPLEMENTED — AWAITING GAMEPLAY VERIFICATION',endToEndPlayable:false};
 const catalog={schemaVersion:2,release:'connected-story-campaign-rc2',implementationCommit:commit,nativeDllSha256:'0036b91c01e92ed205513f52563053a55a66a32d257efb5f476b8f1f3dde0e63',entry:r.entry,maps,menu:null,summary};
 fs.writeFileSync(path.join(out,'release.json'),JSON.stringify(catalog,null,2)+'\n',{flag:'wx'});
 fs.writeFileSync(path.join(out,'campaign-summary.json'),JSON.stringify(summary,null,2)+'\n',{flag:'wx'});
 fs.writeFileSync(path.join(out,'campaign-routes.json'),JSON.stringify(r,null,2)+'\n',{flag:'wx'});
 const table=['# Campaign route and arrival status','','Generated links are structural candidates. BLOCKED arrivals have no validated native co-op spawns.','', '| Original | Installed alias | Entry landmark | Spawn status | Outgoing aliases |','|---|---|---|---|---|'];
 for(const m of r.results)table.push(`| ${m.sourceMap} | ${m.map} | ${m.landmark??'initial'} | ${m.entryPlan.status==='BLOCKED'?'BLOCKED':m.entryPlan.spawns.length+' static slots; gameplay pending'} | ${[...new Set(m.crossings.map(e=>e.next))].join(', ')} |`);
 fs.writeFileSync(path.join(out,'CAMPAIGN_ROUTES.md'),table.join('\n')+'\n',{flag:'wx'});
 for(const [src,target] of [['scripts/install-story-package.ps1','install-story-package.ps1'],['scripts/host-story-coop.ps1','host-story-coop.ps1'],['scripts/collect-story-log.ps1','collect-story-log.ps1'],['docs/CONNECTED_CAMPAIGN_TEST.md','TESTING.md'],['docs/CONNECTED_CAMPAIGN_REPORT.md','README.md'],['docs/COMPATIBILITY_MATRIX.md','COMPATIBILITY_MATRIX.md']])fs.copyFileSync(path.join(repo,src),path.join(out,target),fs.constants.COPYFILE_EXCL);
 for(const [name,script,arg] of [['install.cmd','install-story-package.ps1',''],['remove.cmd','install-story-package.ps1',' -Remove'],['Host Coop Game.cmd','host-story-coop.ps1','']])fs.writeFileSync(path.join(out,name),`@echo off\r\npowershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0${script}"${arg}\r\nset "cofExit=%errorlevel%"\r\npause\r\nexit /b %cofExit%\r\n`,{flag:'wx'});
 console.log(JSON.stringify({out,...summary}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{main(process.argv.slice(2));}catch(e){console.error(e.stack);process.exitCode=1;}}
