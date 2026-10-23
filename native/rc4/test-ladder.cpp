// Owned SDK fixture for ladder-runtime.hpp; no original game code is loaded.
#define _CRT_SECURE_NO_WARNINGS
#include "adapter.cpp"
#include <cassert>
namespace rc4 {struct Edict {std::array<unsigned char,0x400> data{};};}
using namespace rc4;
namespace {
std::array<Edict,32> entities{};
std::unordered_map<Edict*,std::vector<unsigned char>> mem;
std::array<unsigned char,0xa0> globalData{};
std::vector<std::string> strings{"","s4_start_e0","c_start","player"};
std::unordered_map<Edict*,std::pair<std::string,std::string>> keys;int nextFree=20;std::vector<std::string> lines;
int intern(const char* s){for(std::size_t i=0;i<strings.size();++i)if(strings[i]==s)return static_cast<int>(i);strings.emplace_back(s);return static_cast<int>(strings.size()-1);}
const char* str(int n){return n>=0&&n<static_cast<int>(strings.size())?strings[n].c_str():"";}
int index(Edict* e){for(int i=0;i<32;++i)if(e==&entities[i])return i;return -1;}
Edict* byindex(int i){return i>=0&&i<32?&entities[i]:nullptr;}
void* ev(Edict* e){return e->data.data()+0x80;}
void* pd(Edict* e){auto it=mem.find(e);return it==mem.end()?nullptr:it->second.data();}
void* alloc(Edict* e,int n){mem[e]=std::vector<unsigned char>(n);return mem[e].data();}
void free_(Edict* e){mem.erase(e);}
void print(const char* s){lines.emplace_back(s);}
Edict* find_(Edict* start,const char* key,const char* value){
 const int field=std::strcmp(key,"classname")==0?0:std::strcmp(key,"target")==0?0x1cc:0x1d0;
 for(int i=start?index(start)+1:1;i<32;++i)if(load<int>(&entities[i],0)==0&&std::strcmp(str(load<int>(ev(&entities[i]),field)),value)==0)return &entities[i];
 return &entities[0]; // real engine: world edict, not null, when nothing matches
}
Edict* create(int name){auto e=&entities[nextFree++];*e={};store(e,0,0);store(e,4,500+nextFree);store(ev(e),0,name);return e;}
void remove_(Edict* e){release(e);store(e,0,1);}
void kv(Edict* e,KeyValue* data){if(!std::strcmp(data->key,"targetname"))store(ev(e),0x1d0,intern(data->value));keys[e]={data->key,data->value};data->handled=1;}
int spawn_(Edict* e){allocate(e,0x200);return 0;}
Edict* make(int i,const char* type,const char* name,const char* target,int bytes,float x){auto e=&entities[i];*e={};store(e,0,0);store(e,4,100+i);store(ev(e),0,intern(type));store(ev(e),0x1d0,intern(name));store(ev(e),0x1cc,intern(target));store(ev(e),8,x);allocate(e,bytes);return e;}
void player(int i){auto e=&entities[i];*e={};store(e,0,0);store(e,4,200+i);store(ev(e),0,3);allocate(e,PlayerBytes);}
void climb(Edict* manager,int who,Edict* camera){store(pd(manager),0x114,reinterpret_cast<std::uint32_t>(pd(&entities[who])));store(pd(&entities[who]),0x5ac,camera?reinterpret_cast<std::uint32_t>(pd(camera)):0u);}
std::uint32_t master(int i){return load<std::uint32_t>(pd(&entities[i]),0x17c);}
bool logged(const char* part){for(const auto& l:lines)if(l.find(part)!=std::string::npos)return true;return false;}
}
int main(){
 globals=globalData.data();verified=true;store(globals,0x0c,1);store(globals,0x90,2);store(globals,0x94,32);
 engine[14]=reinterpret_cast<void*>(&find_);engine[22]=reinterpret_cast<void*>(&remove_);engine[23]=reinterpret_cast<void*>(&create);engine[63]=reinterpret_cast<void*>(&alloc);engine[64]=reinterpret_cast<void*>(&pd);engine[65]=reinterpret_cast<void*>(&free_);
 engine[66]=reinterpret_cast<void*>(&str);engine[67]=reinterpret_cast<void*>(&intern);engine[68]=reinterpret_cast<void*>(&ev);engine[71]=reinterpret_cast<void*>(&index);engine[72]=reinterpret_cast<void*>(&byindex);engine[81]=reinterpret_cast<void*>(&print);
 original[1]=reinterpret_cast<void*>(&spawn_);original[6]=reinterpret_cast<void*>(&kv);
 for(auto& e:entities)store(&e,0,1);
 player(1);player(2);
 auto ladderA=make(3,"cof_ladder_manager","nerdclimb2","",0x1b4,100.f);make(4,"cof_ladder_manager_use","","nerdclimb2",0x184,100.f);make(5,"cof_ladder_manager_use","","nerdclimb2",0x184,100.f);
 auto ladderB=make(6,"cof_ladder_manager","nerdclimb3","",0x1b4,2000.f);make(7,"cof_ladder_manager_use","","nerdclimb3",0x184,2000.f);
 store(pd(&entities[7]),0x17c,static_cast<std::uint32_t>(intern("authored_master")));
 auto cameraA=make(8,"camera_model","","",0x200,100.f);auto cameraB=make(9,"camera_model","","",0x200,2000.f);
 ladder_activate();
 const auto gate=static_cast<std::uint32_t>(intern("sc4_ladder_reserved"));
 assert(ladders.size()==2&&ladderGate&&keys[ladderGate].second=="sc4.ladder.reserved.never"&&std::strcmp(classname(ladderGate),"multisource")==0);
 // Free ladders keep their authored masters.
 ladder_frame();assert(master(4)==0&&master(5)==0&&master(7)==static_cast<std::uint32_t>(intern("authored_master")));
 // P1 climbs ladder A: both of A's use brushes refuse others; B unaffected.
 climb(ladderA,1,cameraA);ladder_frame();assert(master(4)==gate&&master(5)==gate&&master(7)!=gate&&logged("LADDER nerdclimb2 reserved by player=1"));
 // Native LadderThink ends the climb (camera cleared, slot kept): released.
 store(pd(&entities[1]),0x5ac,0u);ladder_frame();assert(master(4)==0&&master(5)==0&&logged("LADDER nerdclimb2 released"));
 // A stale slot on A while P1 climbs B reserves only B and restores B's authored master after.
 climb(ladderB,1,cameraB);ladder_frame();assert(master(4)==0&&master(7)==gate);
 store(pd(&entities[1]),0x5ac,0u);ladder_frame();assert(master(7)==static_cast<std::uint32_t>(intern("authored_master")));
 // Independent simultaneous use of separate ladders by P1 and P2.
 climb(ladderA,1,cameraA);climb(ladderB,2,cameraB);ladder_frame();assert(master(4)==gate&&master(7)==gate);
 // Disconnect mid-climb: the freed player can no longer hold ladder A.
 store(&entities[1],0,1);ladder_frame();assert(master(4)==0&&master(5)==0&&master(7)==gate);
 // Death keeps the reservation until native LadderThink ends that climb on
 // its timer; then P2 is released normally.
 store(pd(&entities[2]),0x5ac,0u);ladder_frame();assert(master(7)==static_cast<std::uint32_t>(intern("authored_master")));
 // Map change clears everything; unscoped maps never install reservations.
 ladder_reset();assert(ladders.empty()&&!ladderGate);store(globals,0x0c,2);player(1);ladder_activate();assert(ladders.empty());
 // v0.2: a tall ladder (c_subway2st3 528 units): the climb camera 500 units up
 // keeps the reservation for the whole climb, and its steps are not interpolated.
 ladder_reset();store(globals,0x0c,1);for(int i:{1,2})player(i);
 ladderA=make(3,"cof_ladder_manager","nerdclimb2","",0x1b4,100.f);make(4,"cof_ladder_manager_use","","nerdclimb2",0x184,100.f);make(5,"cof_ladder_manager_use","","nerdclimb2",0x184,100.f);
 store(ev(ladderA),0xb8,intern("models/ladder_climb.mdl"));ladder_activate();
 auto tall=make(10,"camera_model","","",0x200,100.f);store(ev(tall),16,500.f);store(ev(tall),0xb8,intern("models/ladder_climb.mdl"));
 climb(ladderA,2,tall);ladder_frame();assert(master(4)==gate&&(load<unsigned>(ev(tall),0x118)&0x20u)&&logged("LADDER nerdclimb2 reserved by player=2"));
 // A camera with another model (a cutscene camera_model) never holds the ladder.
 store(ev(tall),0xb8,intern("models/mdl_camera.mdl"));ladder_frame();assert(master(4)==0);
 store(pd(&entities[2]),0x5ac,0u);ladder_frame();
 std::puts("PASS ladder reservation fixtures: per-ladder lock while the native climber owns a camera_model there, release at climb end/disconnect, separate ladders independent, authored masters restored, stale native slot ignored, map reset and unscoped maps untouched");
}
