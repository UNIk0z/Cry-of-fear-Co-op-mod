import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {sha256,decodeBsp} from './bsp.mjs';
import {prepareOutput} from './cof-inspect.mjs';
const repo=fileURLToPath(new URL('..',import.meta.url));
export function main(args){
 if(args.length!==3||!/^[a-f0-9]{40}$/.test(args[2]))throw Error('Usage: package-story-release.mjs PRIVATE_WORK_DIRECTORY NEW_OUTPUT_DIRECTORY IMPLEMENTATION_COMMIT');
 const [work,dest,commit]=args,out=prepareOutput(dest,[work]),plans=path.join(out,'plans');fs.mkdirSync(plans);fs.mkdirSync(path.join(out,'baseline'));fs.mkdirSync(path.join(out,'tools'));
 const specifications=[['story-candidate-002','conversion-report.json','c_start2'],['crossmap-pair-001','c_start_link_rc1.json','c_start'],['crossmap-pair-001','c_start2_link_rc1.json','c_start2'],['door-batch-002','c_apartment1_story_rc1.json','c_apartment1'],
  ...fs.readdirSync(path.join(work,'door-batch-001')).filter(n=>/_story_rc1\.json$/.test(n)).map(n=>['door-batch-001',n,n.replace(/_story_rc1\.json$/,'')])];
 const maps=[],summaries=[];
 for(const [index,[dir,file,sourceMap]] of specifications.entries()){
  const r=JSON.parse(fs.readFileSync(path.join(work,dir,file),'utf8')),b=fs.readFileSync(path.join(work,dir,r.map+'.bsp'));
  if(sha256(b)!==r.outputSha256||decodeBsp(b).entities.length!==r.entities||b.length!==r.fileBytes)throw Error('Stale candidate: '+r.map);
  const plan={schemaVersion:1,map:r.map,sourceSha256:r.sourceSha256,outputSha256:r.outputSha256,fileBytes:r.fileBytes,edits:r.edits,appendText:r.appendText};
  const encoded=Buffer.from(JSON.stringify(plan,null,2)+'\n');fs.writeFileSync(path.join(plans,r.map+'.json'),encoded,{flag:'wx'});
  maps.push({map:r.map,sourceMap,sourceSha256:r.sourceSha256,outputSha256:r.outputSha256,planSha256:sha256(encoded),defaultInstall:index<4,status:'IMPLEMENTED_AWAITING_GAMEPLAY_VERIFICATION'});
  summaries.push({map:r.map,sourceMap,entities:r.entities,fileBytes:r.fileBytes,doors:r.convertedDoorIds??[],spawns:r.spawns??r.crossMap?.spawnCenters??[],resources:r.resources??[],crossMap:r.crossMap??null,limits:r.limits,
   testLocations:r.inventory?.doors?.filter(d=>d.converted).map(d=>({id:d.id,doorCenter:d.bounds.center,destination:d.destination?.feet}))??[]});
 }
 if(new Set(maps.map(m=>m.map)).size!==maps.length||maps.length!==16)throw Error('Unexpected release candidate inventory');
 const nativeMenu=fs.readFileSync(path.join(work,'cafe-code-001','GameMenu.res')),menuText=nativeMenu.toString('latin1'),last=menuText.lastIndexOf('}');
 const insertText='\r\n\t"90"\r\n\t{\r\n\t\t"label" "Host Coop Game"\r\n\t\t"command" "OpenCreateMultiplayerGameDialog"\r\n\t\t"notsingle" "1"\r\n\t}\r\n';
 const catalog={schemaVersion:1,release:'story-coop-experimental-rc1',implementationCommit:commit,nativeDllSha256:'0036b91c01e92ed205513f52563053a55a66a32d257efb5f476b8f1f3dde0e63',maps,
  menu:{sourceSha256:sha256(nativeMenu),outputSha256:sha256(Buffer.from(menuText.slice(0,last)+insertText+menuText.slice(last),'latin1')),insertText},gameplayStatus:'AWAITING_GAMEPLAY_VERIFICATION'};
 fs.writeFileSync(path.join(out,'release.json'),JSON.stringify(catalog,null,2)+'\n',{flag:'wx'});
 fs.writeFileSync(path.join(out,'map-summary.json'),JSON.stringify(summaries,null,2)+'\n',{flag:'wx'});
 const audit=JSON.parse(fs.readFileSync(path.join(work,'campaign-audit-001','campaign-audit.json'),'utf8'));
 fs.writeFileSync(path.join(out,'campaign-graph.json'),JSON.stringify({root:audit.root,reachableFromIntro:audit.reachableFromIntro,missingMapReferences:audit.missingMapReferences,unclassifiedReferenceCount:audit.unclassifiedReferenceCount,caveat:audit.caveat,
  maps:audit.maps.map(m=>({map:m.map,sourceSha256:m.sourceSha256,entityCount:m.entityCount,edges:m.edges,unresolved:m.unresolved,ordinaryCandidates:m.doors.filter(d=>d.eligible).map(d=>d.id)}))},null,2)+'\n',{flag:'wx'});
 for(const [source,target] of [['scripts/install-story-package.ps1','install-story-package.ps1'],['scripts/collect-story-log.ps1','collect-story-log.ps1'],['docs/RELEASE_TESTING.md','TESTING.md'],['docs/RELEASE_README.md','README.md'],['docs/MASTER_REPORT.md','MASTER_REPORT.md'],['docs/NETWORK_OVERFLOW.md','NETWORK_OVERFLOW.md'],['docs/COMPATIBILITY_MATRIX.md','COMPATIBILITY_MATRIX.md'],['docs/ARCHITECTURE.md','ARCHITECTURE.md'],['scripts/install-shared-note.ps1','baseline/install-shared-note.ps1'],['patches/c_start2-coop-note.experimental.json','baseline/c_start2-coop-note.experimental.json'],['scripts/analyze-network-log.mjs','tools/analyze-network-log.mjs'],['scripts/cof-inspect.mjs','tools/cof-inspect.mjs'],['scripts/bsp.mjs','tools/bsp.mjs']])fs.copyFileSync(path.join(repo,source),path.join(out,target),fs.constants.COPYFILE_EXCL);
 for(const [name,argument] of [['install.cmd',''],['remove.cmd',' -Remove']])fs.writeFileSync(path.join(out,name),'@echo off\r\npowershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-story-package.ps1"'+argument+'\r\nset "cofExit=%errorlevel%"\r\npause\r\nexit /b %cofExit%\r\n',{flag:'wx'});
 console.log(JSON.stringify({out,newMapPlans:maps.length,defaultMaps:maps.filter(m=>m.defaultInstall).map(m=>m.map),implementationCommit:commit,assetsDistributed:false}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{main(process.argv.slice(2));}catch(e){console.error(e.message);process.exitCode=1;}}
