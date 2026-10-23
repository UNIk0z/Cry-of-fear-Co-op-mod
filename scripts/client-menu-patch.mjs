// coop-fixes-013 (user: "edit the dll its a mod might aswell make it good"):
// the main menu of cl_dlls/client.dll shows "Host Simon's Story", "Join
// Simon's Story", "Options" and "Quit", and the ping/health/name list of the
// other players is shown on every map.
//
// Read from this exact client.dll (SHA256 below) with dumpbin; nothing else in
// it changes. The game's file is never shipped: the package carries only the
// XOR of the original and the patched file (menu-logo.mjs xorDelta), the
// installer rebuilds it from that PC's own client.dll (SHA256-checked before
// and after) and keeps the original as client.dll.storycoop-original.
//
// Main menu (constructor 1002C390, click handler 1002D8D0, show 1002ECF0):
// ten image buttons, slot k (top to bottom) has image panel +C6F4+8(k-1),
// hit button +C6B4+4(k-1) and click id k. Ids go through the 11-entry jump
// table at 1002DF68 (id 11 is the Custom Campaign page's Back).
// - Slots 1..4 become Host Simon's Story, Join Simon's Story, Options, Quit:
//   their image paths now name sc_host / sc_join (new files) and the game's
//   own options / quit images, and their ids jump to the Custom Campaign page
//   (1002DB2E), Join Server (1002DCAD "optionshack 0"), Options (1002DCC2
//   "optionshack 2") and Quit (1002DDD6 "quit").
// - Slots 5..10 are never shown: every setVisible(1) of their hit buttons and
//   image panels (constructor, Back 1002DDFF, show 1002ECF0) becomes
//   setVisible(0), and their ids jump to the handler's plain return (1002DF61).
// - The Custom Campaign page lists maps/storyc*m (the four "Simon's Story"
//   entries, maps/storycoop_*.custom) instead of maps/*.custom: the 8-byte
//   search pattern at 10143888 (read as two dwords, length 8 at 1002E88D).
// HUD (1003BF20): the "%s - Health %i - Ping %d" list was drawn only while
// the map name contains "cof_" (strstr at 1003C66C), i.e. the prologue only.
// It now searches for "4" (the string at 1014231C): cof_campaign_story4 and
// every s4_ map, never the train menu c_game_menu1.
import fs from 'node:fs';
import {createHash} from 'node:crypto';

export const CLIENT_TARGET='cl_dlls/client.dll';
export const CLIENT_ORIGINAL_SHA256='d2a04641b301804f6f449aa68265042b13adc360925b80033d417ec9f38c9c00';
export const CLIENT_BYTES=1754112;
const sha=b=>createHash('sha256').update(b).digest('hex');
// VA -> file offset for this image (.text 10001000 @ 0x400, .rdata 1013A000 @ 0x138A00).
const offset=va=>va>=0x1013A000&&va<0x10189B52?va-0x1013A000+0x138A00:va>=0x10001000&&va<0x1013940C?va-0x10001000+0x400:-1;
const le=v=>{const b=Buffer.alloc(4);b.writeUInt32LE(v);return b;};
const text=(s,length)=>{const b=Buffer.alloc(length);b.write(s,'latin1');return b;};
export function clientPatches(){
 const p=[];const add=(va,from,to,why)=>p.push({va,from:Buffer.from(from),to:Buffer.from(to),why});
 const table=[0x1002D97C,0x1002D9D2,0x1002DB2E,0x1002DCAD,0x1002DCC2,0x1002DCD7,0x1002DD19,0x1002DD7C,0x1002DDC1,0x1002DDD6];
 const now=[0x1002DB2E,0x1002DCAD,0x1002DCC2,0x1002DDD6,0x1002DF61,0x1002DF61,0x1002DF61,0x1002DF61,0x1002DF61,0x1002DF61];
 table.forEach((was,i)=>add(0x1002DF68+i*4,le(was),le(now[i]),`menu click id ${i+1}`));
 for(const [va,was,is,len] of [[0x10143648,'gfx/vgui/menu/newgame.tga','gfx/vgui/menu/sc_host.tga',26],[0x10143900,'gfx/vgui/menu/newgame_mo.tga','gfx/vgui/menu/sc_host_mo.tga',29],
  [0x10143664,'gfx/vgui/menu/loadgame.tga','gfx/vgui/menu/sc_join.tga',27],[0x10143920,'gfx/vgui/menu/loadgame_mo.tga','gfx/vgui/menu/sc_join_mo.tga',30],
  [0x10143680,'gfx/vgui/menu/customc.tga','gfx/vgui/menu/options.tga',26],[0x10143940,'gfx/vgui/menu/customc_mo.tga','gfx/vgui/menu/options_mo.tga',29],
  [0x1014369C,'gfx/vgui/menu/jserver.tga','gfx/vgui/menu/quit.tga',26],[0x10143960,'gfx/vgui/menu/jserver_mo.tga','gfx/vgui/menu/quit_mo.tga',29]])add(va,text(was,len),text(is,len),'menu image '+is);
 const hidden=[0x1002DE39,0x1002DE46,0x1002DE53,0x1002DE60,0x1002DE6D,0x1002DE7A,0x1002ED67,0x1002ED74,0x1002ED81,0x1002ED8E,0x1002ED9B,0x1002EDA8,
  0x1002CAF1,0x1002CB57,0x1002CBBD,0x1002CC23,0x1002CC8B,0x1002CCED,0x1002DEC8,0x1002DED5,0x1002DEE2,0x1002DEEF,0x1002DEFC,0x1002DF0B,0x1002EDF6,0x1002EE03,0x1002EE10,0x1002EE1D,0x1002EE2A,0x1002EE37];
 for(const va of hidden)add(va,[0x6a,0x01],[0x6a,0x00],'menu slot 5..10 setVisible(0)');
 add(0x10143888,Buffer.from('*.custom','latin1'),Buffer.from('storyc*m','latin1'),'Custom Campaign list: Simon\'s Story entries only');
 add(0x1003C66D,le(0x1014688C),le(0x1014231C),'player ping/health/name list on every co-op map');
 return p;
}
export function patchClient(original){
 if(original.length!==CLIENT_BYTES||sha(original)!==CLIENT_ORIGINAL_SHA256)throw Error('client.dll is not the expected version');
 const out=Buffer.from(original);
 for(const {va,from,to,why} of clientPatches()){const o=offset(va);if(o<0||from.length!==to.length||!out.subarray(o,o+from.length).equals(from))throw Error('client.dll patch site changed: '+why);to.copy(out,o);}
 return out;
}
export function clientMenuFromFiles(gameRoot){
 const target=gameRoot+'/'+CLIENT_TARGET,kept=target+'.storycoop-original';
 const original=fs.readFileSync(fs.existsSync(kept)?kept:target);return {original,result:patchClient(original)};
}
