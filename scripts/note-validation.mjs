import fs from 'node:fs';
import path from 'node:path';
import {decodeBsp,uniqueValue as v} from './bsp.mjs';
// Exact indices in the SHA-pinned backend's two native credential tables.
export const CAFE_CREDENTIALS={user:['davidspc','jillusername','excelsior','dorrarpc','confuseduser','leatherhoff45','ea45'],pass:['apple45','cloudyday','rosesarered','junesummer','unforgettable','thebeatles54','marriageinapril']};
const contentKeys=['note1','note2','note3','note4','page1','page2','page3','page4','label','turnsound'];
export function validateStoryNotes(bytes,assetRoot,map){
 const entities=decodeBsp(bytes).entities,rows=[],ids=new Map();
 function resource(value){
  if(!value||path.isAbsolute(value)||value.split(/[\\/]/).some(p=>!p||p==='..'||p==='.')||/[:\x00-\x1f]/.test(value))throw Error(`${map}: unsafe/missing note resource ${value}`);
  if(assetRoot&&!fs.statSync(path.join(assetRoot,...value.split(/[\\/]/))).isFile())throw Error(`${map}: missing note resource ${value}`);
  return value;
 }
 for(const e of entities){const type=v(e,'classname');if(!['cof_document','cof_passwordnote','cof_addcodenote'].includes(type))continue;
  const row={entity:e.index,type,resources:[]};
  if(type==='cof_document'){
   if(!v(e,'targetname')||entities.filter(x=>v(x,'targetname')===v(e,'targetname')).length!==1)throw Error(`${map}: unnamed/nonunique document ${e.index}`);
   const signature=JSON.stringify(contentKeys.map(k=>v(e,k)??''));
   for(let i=1;i<=4;++i){const id=v(e,'note'+i),page=v(e,'page'+i);if(!id&&!page)continue;if(!id||!page||Buffer.byteLength(id)>16||Buffer.byteLength(page)>15)throw Error(`${map}: unsupported/missing native note ID/page ${e.index}`);
    if(Buffer.byteLength(id)===16&&i<4&&v(e,'note'+(i+1)))throw Error(`${map}: overlapping full-width multi-page ID ${e.index}`);
    const old=ids.get(id);if(old&&old!==signature)throw Error(`${map}: conflicting note ID ${id}`);ids.set(id,signature);
    row.resources.push(resource('notes/'+id),resource('gfx/vgui/640_'+page+'.tga'));
   }
   if(!v(e,'note1'))throw Error(`${map}: document ${e.index} has no archive ID`);
   if(v(e,'label'))row.resources.push(resource(v(e,'label')));
   if(v(e,'turnsound'))row.resources.push(resource('sound/'+v(e,'turnsound')));
   row.behavior='Native per-activator reader/EHANDLE; archive on closedocument; authored game_zone fan-out';
  }else if(type==='cof_passwordnote'){
   const kind=(v(e,'usertype')??'0')==='1'?'pass':'user';if(!['0','1'].includes(v(e,'usertype')??'0'))throw Error(`${map}: unsupported credential type ${e.index}`);
   row.kind=kind;row.behavior='Fresh native grant per recipient; UserDoc opens; closedocument archives generated document; canonical credential index';
   for(const [i,title] of CAFE_CREDENTIALS[kind].entries()){
    const file=resource('notes/'+title+'.txt');row.resources.push(file,resource('gfx/vgui/640_'+kind+(i+1)+'.tga'));
    if(assetRoot&&fs.readFileSync(path.join(assetRoot,file),'utf8').split(/\r?\n/)[0]!==title)throw Error(`${map}: credential archive title/filename mismatch ${file}`);
   }
   row.resources.push(resource('gfx/vgui/notes/hiddennote'+(kind==='pass'?1:2)+'.tga'));
  }else{
   if(!/^[1-4]$/.test(v(e,'iuser1')??''))throw Error(`${map}: unsupported native code-note type ${e.index}`);
   row.behavior='Native virtual nerds record; identity includes captured code flag/value/type; no ordinary text-file ID';row.codeType=Number(v(e,'iuser1'));
  }
  rows.push(row);
 }
 return rows;
}
