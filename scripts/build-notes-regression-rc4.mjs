import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {sha256,decodeBsp,uniqueValue as v} from './bsp.mjs';
import {assembleCampaign} from './build-connected-campaign.mjs';
import {prepareOutput} from './cof-inspect.mjs';
import {MAINTENANCE_MAPS} from './build-maintenance-rc4.mjs';
import {validateStoryNotes,CAFE_CREDENTIALS} from './note-validation.mjs';
export const PREVIOUS_MAINTENANCE='9e7e15fcb3f5ac2fbad219c294d31fe1d812bda6fa476a0f65a4dd8ae9c60b8e';
export function main(args){
 if(args.length!==6)throw Error('Usage: build-notes-regression-rc4.mjs ORIGINAL_MAPS MAINTENANCE_BUILD MAINTENANCE_PACKAGE RC2_BUILD RC2_PACKAGE NEW_BUILD');
 const [maps,parent,previous,rc2,rc2Package,destination]=args,previousBytes=fs.readFileSync(path.join(previous,'release.json'));
 if(sha256(previousBytes)!==PREVIOUS_MAINTENANCE)throw Error('Changed delivered maintenance catalog');
 const catalog=JSON.parse(previousBytes),rc2Catalog=JSON.parse(fs.readFileSync(path.join(rc2Package,'release.json'))),assets=path.dirname(maps),audit={schemaVersion:1,sourceMaps:81,convertedAliases:195,credentials:CAFE_CREDENTIALS,originalNotes:[],convertedNotes:[],newAliases:[],status:'STRUCTURAL/RESOURCE CHECK ONLY; actual readers unverified'};
 // Audit the retained campaign, without producing another campaign variant.
 for(const source of [...new Set(rc2Catalog.maps.map(m=>m.sourceMap))]){const entry=rc2Catalog.maps.find(m=>m.sourceMap===source),bytes=fs.readFileSync(path.join(maps,source+'.bsp'));if(sha256(bytes)!==entry.sourceSha256)throw Error('Changed source '+source);const notes=validateStoryNotes(bytes,assets,source);if(notes.length)audit.originalNotes.push({map:source,notes});}
 for(const entry of rc2Catalog.maps){const bytes=fs.readFileSync(path.join(rc2,entry.map+'.bsp'));if(sha256(bytes)!==entry.outputSha256)throw Error('Changed RC2 '+entry.map);const notes=validateStoryNotes(bytes,assets,entry.map);if(notes.length)audit.convertedNotes.push({map:entry.map,notes});}
 const prepared=MAINTENANCE_MAPS.map(spec=>{const entry=catalog.maps.find(m=>m.map===spec.map),output=fs.readFileSync(path.join(parent,spec.map+'.bsp')),report=JSON.parse(fs.readFileSync(path.join(parent,spec.map+'.json'))),source=fs.readFileSync(path.join(maps,spec.sourceMap+'.bsp'));
  if(!entry||sha256(output)!==entry.outputSha256||report.outputSha256!==entry.outputSha256||sha256(source)!==spec.sourceSha256||!report.maintenance)throw Error('Changed maintenance input '+spec.map);
  if(!assembleCampaign(source,decodeBsp(output).entities,report.modelClones).output.equals(output))throw Error('Protected reconstruction mismatch');
  const notes=validateStoryNotes(output,assets,spec.map);audit.newAliases.push({map:spec.map,notes,unchanged:true});
  return {spec,output,report:{...report,regression:true,protectedMaintenance:{catalogSha256:PREVIOUS_MAINTENANCE,outputSha256:entry.outputSha256,planSha256:entry.planSha256}}};
 });
 const out=prepareOutput(destination,[maps,parent,previous,rc2,rc2Package]);
 for(const {spec,output,report} of prepared){fs.writeFileSync(path.join(out,spec.map+'.bsp'),output,{flag:'wx'});fs.writeFileSync(path.join(out,spec.map+'.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});}
 fs.writeFileSync(path.join(out,'note-audit.json'),JSON.stringify(audit,null,2)+'\n',{flag:'wx'});
 fs.writeFileSync(path.join(out,'state-report.json'),JSON.stringify({schemaVersion:2,release:'story-state-rc4',maintenance:true,regression:true,convertedMaps:8,previousCatalogSha256:PREVIOUS_MAINTENANCE,noteAuditSha256:sha256(fs.readFileSync(path.join(out,'note-audit.json')))},null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({out,unchangedMaps:8,originalNoteEntities:audit.originalNotes.reduce((n,m)=>n+m.notes.length,0),convertedNoteAliases:audit.convertedNotes.length}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{main(process.argv.slice(2));}catch(e){console.error(e.stack);process.exitCode=1;}}
