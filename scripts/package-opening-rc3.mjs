import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decodeBsp,sha256} from './bsp.mjs';
import {OPENING} from './build-opening-rc3.mjs';
import {prepareOutput} from './cof-inspect.mjs';
const repo=fileURLToPath(new URL('..',import.meta.url));
export function main(args){
 if(![4,5].includes(args.length)||!/^[a-f0-9]{40}$/.test(args[3]))throw Error('Usage: package-opening-rc3.mjs PRIVATE_BUILD RC2_PACKAGE NEW_OUTPUT COMMIT [PREVIOUS_RC3_PACKAGE]');
 const [build,rc2,dest,commit,previous]=args,parent=JSON.parse(fs.readFileSync(path.join(rc2,'release.json')));
 if(parent.release!=='connected-story-campaign-rc2')throw Error('Expected RC2 parent catalog');
 const out=prepareOutput(dest,[build,rc2,...(previous?[previous]:[])]);fs.mkdirSync(path.join(out,'plans'));const maps=[],dependencies=new Map(),reports=[];
 for(const spec of OPENING){const r=JSON.parse(fs.readFileSync(path.join(build,spec.map+'.json'))),bytes=fs.readFileSync(path.join(build,spec.map+'.bsp'));
  const p=parent.maps.find(m=>m.map===spec.parent);if(!p||p.outputSha256!==r.parentSha256||sha256(bytes)!==r.outputSha256)throw Error('Stale RC2 parent or generated BSP');
  const plan=Object.fromEntries(['schemaVersion','map','sourceSha256','outputSha256','fileBytes','edits','appendText','modelClones'].map(k=>[k,r[k]])),encoded=Buffer.from(JSON.stringify(plan)+'\n');
  fs.writeFileSync(path.join(out,'plans',spec.map+'.json'),encoded,{flag:'wx'});maps.push({map:spec.map,sourceMap:spec.sourceMap,sourceSha256:r.sourceSha256,outputSha256:r.outputSha256,planSha256:sha256(encoded),defaultInstall:true});
  for(const e of decodeBsp(bytes).entities)for(const [key,value] of e.pairs)if(['map','message'].includes(key)){const dependency=parent.maps.find(m=>m.map===value);if(dependency)dependencies.set(value,{map:value,outputSha256:dependency.outputSha256});}
  const {edits,appendText,...summary}=r;reports.push(summary);
 }
 const catalog={schemaVersion:2,release:'story-opening-rc3',implementationCommit:commit,nativeDllSha256:parent.nativeDllSha256,entry:'cof_campaign_story3',maps,dependencies:[...dependencies.values()],requiresFullRC2:true,menu:null,status:'AWAITING GAMEPLAY VERIFICATION',runtimeHangCause:'NOT ESTABLISHED'};
 fs.writeFileSync(path.join(out,'release.json'),JSON.stringify(catalog,null,2)+'\n');fs.writeFileSync(path.join(out,'opening-report.json'),JSON.stringify(reports,null,2)+'\n');
 for(const [src,target] of [['scripts/install-story-package.ps1','install-story-package.ps1'],['scripts/host-story-coop.ps1','host-story-coop.ps1'],['scripts/collect-story-log.ps1','collect-story-log.ps1'],['docs/RC3_OPENING_REPORT.md','README.md'],['docs/RC3_OPENING_TEST.md','TESTING.md']])fs.copyFileSync(path.join(repo,src),path.join(out,target),fs.constants.COPYFILE_EXCL);
 for(const [name,script,arg] of [['install.cmd','install-story-package.ps1',''],['remove.cmd','install-story-package.ps1',' -Remove'],['Host Coop Game.cmd','host-story-coop.ps1',' -Map cof_campaign_story3']])fs.writeFileSync(path.join(out,name),`@echo off\r\npowershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0${script}"${arg}\r\nset "cofExit=%errorlevel%"\r\npause\r\nexit /b %cofExit%\r\n`);
 if(previous){
  const old=JSON.parse(fs.readFileSync(path.join(previous,'release.json')));
  if(old.release!=='story-opening-rc3'||old.nativeDllSha256!==catalog.nativeDllSha256||old.maps.length!==maps.length||old.maps.some(m=>!maps.some(n=>n.map===m.map&&n.sourceSha256===m.sourceSha256)))throw Error('Previous RC3 rollback catalog mismatch');
  const rollback=path.join(out,'build005-rollback');fs.mkdirSync(rollback);
  fs.copyFileSync(path.join(previous,'release.json'),path.join(rollback,'release.json'));
  // Reuse the unchanged guarded remover. Remove needs the old catalog only,
  // never old plans/assets, and refuses the newer intro before any deletion.
  fs.copyFileSync(path.join(repo,'scripts/install-story-package.ps1'),path.join(rollback,'install-story-package.ps1'));
  fs.writeFileSync(path.join(out,'remove-build005.cmd'),'@echo off\r\npowershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0build005-rollback\\install-story-package.ps1" -Remove\r\nset "cofExit=%errorlevel%"\r\npause\r\nexit /b %cofExit%\r\n');
 }
 console.log(JSON.stringify({out,maps:maps.length,dependencies:catalog.dependencies}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{main(process.argv.slice(2));}catch(e){console.error(e.stack);process.exitCode=1;}}
