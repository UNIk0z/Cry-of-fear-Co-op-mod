#define _CRT_SECURE_NO_WARNINGS
#include "adapter.cpp"
#include <cassert>
namespace rc4 {struct Edict {std::array<unsigned char,0x400> data{};};}
using namespace rc4;
namespace {
std::array<Edict,10> entities{};
std::unordered_map<Edict*,std::vector<unsigned char>> mem;
std::array<unsigned char,0xa0> globalData{};
std::array<Edict*,10> views{};
std::vector<int> wire;std::vector<std::string> text;
int viewCalls=0,uidBase=100;
const char* strings(int n){switch(n){case 1:return "s4_start";case 2:return "player";case 3:return "trigger_camera";case 4:return "info_target";case 5:return "s2_later";case 6:return "original_sp";}return "";}
int index(Edict* e){for(int i=0;i<10;++i)if(e==&entities[i])return i;return -1;}
Edict* byindex(int i){return i>=0&&i<10?&entities[i]:nullptr;}
void* ev(Edict* e){return e->data.data()+0x80;}
void* pd(Edict* e){auto it=mem.find(e);return it==mem.end()?nullptr:it->second.data();}
void* alloc(Edict* e,int n){mem[e]=std::vector<unsigned char>(n);return mem[e].data();}
void free_(Edict* e){mem.erase(e);}
int userid(Edict* e){return uidBase+index(e);}
void view(Edict* e,Edict* v){views[index(e)]=v;++viewCalls;}
int begins=0,ends=0;
void begin(int,int,const float*,Edict*){wire.clear();text.clear();++begins;}
void end(){++ends;}
void integer(int n){wire.push_back(n);}
void str(const char* s){text.emplace_back(s);}
void handle(Edict* e,Edict* cam){store(pd(e),0x2348,reinterpret_cast<std::uint32_t>(cam));store(pd(e),0x234c,cam?serial(cam):0);}
void health(Edict* e,bool alive){store(ev(e),0x164,alive?30.f:0.f);store(ev(e),0x174,alive?0:2);}
void init(){
 camera_reset();allocations.clear();mem.clear();viewCalls=0;
 for(int i=0;i<10;++i){entities[i]={};store(&entities[i],4,10+i);store(ev(&entities[i]),0,i>=5?3:2);}
 for(int i=1;i<=4;++i){auto e=&entities[i];allocate(e,PlayerBytes);health(e,true);store(ev(e),0x170,2.f);views[i]=e;set_view(e,e);camera_frame(e);}
 for(int i=5;i<=7;++i)allocate(&entities[i],0x154);
 store(ev(&entities[8]),0,4);store(ev(&entities[9]),0,4);
}
void start(Edict* e,Edict* cam){set_view(e,cam);handle(e,cam);store(ev(cam),0x248,1);store(ev(e),0x1a8,load<unsigned>(ev(e),0x1a8)|0x1080u);store(ev(e),0x170,0.f);camera_frame(e);}
void finish(Edict* e,Edict* cam){store(ev(cam),0x248,0);handle(e,nullptr);camera_frame(e);}
Note code(){Note n{};std::strcpy(reinterpret_cast<char*>(n.data()+0x40),"nerds");return n;}
void emit_slot(Edict* e,int slot,NoteMetadata meta){const auto n=code();message_begin(1,7,nullptr,e);write_byte(slot);write_byte(meta.codeFlag);write_short(meta.codeValue);write_byte(meta.codeType);for(auto f:NoteFields)write_string(reinterpret_cast<const char*>(n.data()+f.offset));message_end();}
void emit(Edict* e,NoteMetadata meta){const auto n=code();message_begin(1,7,nullptr,e);write_byte(1);write_byte(meta.codeFlag);write_short(meta.codeValue);write_byte(meta.codeType);for(auto f:NoteFields)write_string(reinterpret_cast<const char*>(n.data()+f.offset));message_end();}
}
int main(){
 globals=globalData.data();verified=true;store(globals,0x0c,1);store(globals,0x90,4);store(globals,0x94,10);store(globals,0,10.f);
 engine[63]=reinterpret_cast<void*>(&alloc);engine[64]=reinterpret_cast<void*>(&pd);engine[65]=reinterpret_cast<void*>(&free_);engine[66]=reinterpret_cast<void*>(&strings);engine[68]=reinterpret_cast<void*>(&ev);engine[71]=reinterpret_cast<void*>(&index);engine[72]=reinterpret_cast<void*>(&byindex);engine[92]=reinterpret_cast<void*>(&view);engine[113]=reinterpret_cast<void*>(&userid);
 engine[46]=reinterpret_cast<void*>(&begin);engine[47]=reinterpret_cast<void*>(&end);engine[48]=reinterpret_cast<void*>(&integer);engine[50]=reinterpret_cast<void*>(&integer);engine[54]=reinterpret_cast<void*>(&str);
 // Both roles and all four slots: down before scene, complete while down,
 // native revival afterwards. Never mutate health, deadflag or down controls.
 for(int slot=1;slot<=4;++slot){init();auto e=&entities[slot];auto cam=&entities[5];health(e,false);start(e,cam);const auto before=viewCalls;camera_frame(e);assert(viewCalls==before&&views[slot]==cam);finish(e,cam);assert(views[slot]==e&&load<int>(ev(e),0x174)==2&&load<unsigned>(ev(e),0x1a8)==0x1080);health(e,true);camera_frame(e);assert(views[slot]==e&&load<unsigned>(ev(e),0x1a8)==0&&load<float>(ev(e),0x170)==2&&cameraLeases.empty());for(int i=1;i<=4;++i)if(i!=slot)assert(views[i]==&entities[i]);}
 // Death during scene / revival while scene remains active.
 init();auto e=&entities[1];auto cam=&entities[5];start(e,cam);health(e,false);camera_frame(e);health(e,true);camera_frame(e);assert(views[1]==cam&&load<unsigned>(ev(e),0x1a8)==0x1080);finish(e,cam);assert(views[1]==e&&load<unsigned>(ev(e),0x1a8)==0);
 // Native living cleanup has priority, including controls it already restored.
 init();start(e,cam);store(ev(cam),0x248,0);handle(e,nullptr);set_view(e,e);store(ev(e),0x1a8,0u);camera_frame(e);assert(load<unsigned>(ev(e),0x1a8)==0&&cameraLeases.empty());
 // A second active camera supersedes the first; no early cleanup.
 init();start(e,cam);start(e,&entities[6]);store(ev(cam),0x248,0);camera_frame(e);assert(views[1]==&entities[6]);finish(e,&entities[6]);assert(views[1]==e);
 // Native observer view restored, without enabling movement or changing mode.
 init();health(e,false);store(ev(e),0x1a8,0x100000u);set_view(e,&entities[8]);start(e,cam);finish(e,cam);assert(views[1]==&entities[8]&&(load<unsigned>(ev(e),0x1a8)&0x100000u));
 // Alternate authored view uses the native camera ownership handle.
 init();set_view(e,&entities[8]);handle(e,cam);store(ev(cam),0x248,1);camera_frame(e);health(e,false);finish(e,cam);assert(views[1]==e);
 // Removed/recycled camera is never dereferenced; player serial mismatch is
 // forgotten and cannot issue SetView to a replacement connection.
 init();health(e,false);start(e,cam);release(cam);store(cam,4,99);handle(e,nullptr);camera_frame(e);assert(views[1]==e);init();start(e,cam);const auto count=viewCalls;store(e,4,999);camera_frame(e);assert(viewCalls==count&&cameraLeases.empty());
 init();start(e,cam);camera_forget(e);assert(cameraLeases.empty());camera_reset();assert(nativeViews.empty());
 // Repair both native view channels even while the dead-player HUD early-outs.
 init();cameraViewMessage=20;cameraAttachMessage=21;health(e,false);start(e,cam);finish(e,cam);assert(wire==std::vector<int>{1}&&load<int>(pd(e),0x2038)==1&&load<int>(pd(e),0x203c)==1);cameraViewMessage=0;cameraAttachMessage=0;
 // Preserve unrelated flags and a pre-existing native control lock.
 init();store(ev(e),0x1a8,0x1200u);camera_frame(e);health(e,false);start(e,cam);finish(e,cam);health(e,true);camera_frame(e);assert(load<unsigned>(ev(e),0x1a8)==0x1200u);
 // A down player's prior native non-cinematic view survives scene end, then
 // goes back to self after revival, unless another native view has taken over.
 init();set_view(e,&entities[8]);health(e,false);start(e,cam);finish(e,cam);assert(views[1]==&entities[8]);health(e,true);camera_frame(e);assert(views[1]==e);
 init();start(e,cam);store(globals,0x0c,6);const auto scopedCalls=viewCalls;camera_frame(e);assert(viewCalls==scopedCalls);store(globals,0x0c,1);
 // A lit flashlight and the held view model (+0xBC) are held off during the
 // scene EVERY frame (a redeploy mid-scene is caught) and the latest values
 // return after it; unrelated bits of player+0x5D0 survive. Nothing is lit.
 init();{auto fl=pd(e);store(fl,0x1ea8,1);store(fl,0x5d0,0x18u);store(ev(e),0xbc,55);start(e,cam);assert(load<int>(fl,0x1ea8)==0&&load<unsigned>(fl,0x5d0)==0x10u&&load<int>(ev(e),0xbc)==0);
  store(ev(e),0xbc,77);camera_frame(e);assert(load<int>(fl,0x1ea8)==0&&load<int>(ev(e),0xbc)==0);finish(e,cam);camera_frame(e);assert(load<int>(fl,0x1ea8)==1&&load<unsigned>(fl,0x5d0)==0x18u&&load<int>(ev(e),0xbc)==77&&cinematicHidden.empty());}
 init();{auto fl=pd(e);start(e,cam);finish(e,cam);camera_frame(e);assert(load<int>(fl,0x1ea8)==0&&load<unsigned>(fl,0x5d0)==0&&load<int>(ev(e),0xbc)==0);}
 // A down player stays dark until native revival, then relights; the view
 // model native revival deploys is the one that comes back.
 init();{auto fl=pd(e);store(fl,0x1ea8,1);store(fl,0x5d0,8u);store(ev(e),0xbc,55);health(e,false);start(e,cam);finish(e,cam);camera_frame(e);assert(load<int>(fl,0x1ea8)==0&&load<int>(ev(e),0xbc)==0);
  health(e,true);store(ev(e),0xbc,66);camera_frame(e);camera_frame(e);assert(load<int>(fl,0x1ea8)==1&&load<int>(ev(e),0xbc)==66&&cinematicHidden.empty());}
 // coop-fixes-004: the phone (bits 1|2, state +0x1E98) and Glock (bit 4)
 // spotlights are dark during the scene and exactly those bits come back; a
 // phone switched during the scene stays as the player left it. Each hold
 // forces a fresh ViewEntity (+0x203C invalid), again every 0.5 s.
 init();{auto fl=pd(e);store(fl,0x1e98,1);store(fl,0x5d0,0x15u);store(fl,0x203c,1);start(e,cam);assert(load<unsigned>(fl,0x5d0)==0x10u&&load<int>(fl,0x203c)==-1);
  store(fl,0x203c,7);store(globals,0,load<float>(globals,0)+0.2f);camera_frame(e);assert(load<int>(fl,0x203c)==7);store(globals,0,load<float>(globals,0)+0.4f);camera_frame(e);assert(load<int>(fl,0x203c)==-1);
  finish(e,cam);camera_frame(e);assert(load<unsigned>(fl,0x5d0)==0x15u&&cinematicHidden.empty());}
 init();{auto fl=pd(e);store(fl,0x1e98,1);store(fl,0x5d0,0x06u);start(e,cam);assert(load<unsigned>(fl,0x5d0)==0);store(fl,0x1e98,0);finish(e,cam);camera_frame(e);assert(load<unsigned>(fl,0x5d0)==4u);}
 // Native note packet -> journal -> canonical replay; subsequent native HUD
 // zeros and positive repeats preserve glyphs without repeating x += width.
 init();addNote=7;codeLayouts.clear();journal.reset();emit(e,{1,9799,1});assert((wire==std::vector<int>{1,1,9799,0}));assert(journal.metadata(0).codeValue==9799&&codeLayouts.empty());allocations.at(e).commands=true;store(globals,0,12.f);restore(e);assert((wire==std::vector<int>{1,1,9799,1}));
 emit(e,{1,9799,1});assert((wire==std::vector<int>{1,1,9799,0}));store(globals,0,14.f);emit(e,{});assert((wire==std::vector<int>{1,1,9799,0}));assert(journal.metadata(0).codeType==1);
 // Map/HUD registration uses the same connection ledger; other players get
 // their own first layout. Exact same digit images remain native and scaled.
 store(globals,0x0c,5);allocations.at(e).commands=true;store(globals,0,16.f);allocations.at(e).delivered={};restore(e);assert(wire[3]==0&&wire[2]==9799);
 auto other=&entities[2];allocations.at(other).commands=true;restore(other);assert(wire[3]==1&&wire[2]==9799);
 for(int width:{640,800,1024,1280,1920,2560}){const double scale=width/1024.0;double x=370*scale;for(int replay=0;replay<25;++replay){auto meta=layout_metadata(e,1,{1,9799,1},true);if(meta.codeType)x+=231*scale;}assert(x==370*scale);}
 codeLayouts.erase(note_connection(e));assert(layout_metadata(e,1,{1,9799,1},true).codeType==1);assert(layout_metadata(e,1,{1,9799,1},true).codeType==0);
 // A native re-send of a shared note at ANOTHER slot is dropped whole (no
 // begin/end pair reaches the engine); the same note at its own slot flows.
 {const int b=begins,en=ends;emit_slot(e,2,{1,9799,1});assert(begins==b&&ends==en);emit_slot(e,1,{1,9799,1});assert(begins==b+1&&ends==en+1);}
 // Other note types have separate slot state; normal note metadata unchanged.
 assert(layout_metadata(e,2,{1,6789,3},true).codeType==3);assert(layout_metadata(e,2,{1,6789,3},true).codeType==0);assert(layout_metadata(e,3,{},true).codeFlag==0);
 // coop-fixes-008: a player who (re)joins while a scene camera runs gets the
 // same camera after their first second, once, and their own view back when
 // no living player watches it any more. A down player is never moved.
 {init();auto scene=&entities[5];store(ev(scene),0x248,1);store(globals,0,10.f);for(int i=1;i<=4;++i)allocations.at(&entities[i]).born=0.f;
  for(int i=1;i<=3;++i)view_seen(scene,&entities[i]);view_seen(&entities[4],&entities[4]);
  allocations.at(&entities[4]).born=9.5f;camera_join(&entities[4]);assert(views[4]==&entities[4]&&joinViews.empty());
  store(globals,0,11.f);camera_join(&entities[4]);assert(views[4]==scene&&joinViews.count(&entities[4]));
  const int calls=viewCalls;camera_join(&entities[4]);assert(viewCalls==calls);
  store(ev(scene),0x248,0);for(int i=1;i<=3;++i)view_seen(&entities[i],&entities[i]);camera_join(&entities[4]);assert(views[4]==&entities[4]&&joinViews.empty());
  init();store(ev(scene),0x248,1);for(int i=1;i<=4;++i)allocations.at(&entities[i]).born=0.f;view_seen(scene,&entities[1]);view_seen(&entities[2],&entities[2]);health(&entities[2],false);store(globals,0,30.f);
  camera_join(&entities[2]);assert(views[2]==&entities[2]&&joinViews.empty());
  // Only a down player watches the camera: nobody is moved.
  health(&entities[2],true);health(&entities[1],false);camera_join(&entities[2]);assert(views[2]==&entities[2]);store(globals,0,10.f);}
 std::puts("PASS camera/note fixtures: four recipient slots, death/revival, camera chaining, observer, alternate view, serial/free guards, native cleanup priority, exact code replay/layout persistence");
}
