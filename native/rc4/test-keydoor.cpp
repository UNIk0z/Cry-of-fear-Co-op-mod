// Owned SDK fixture for keydoor-runtime.hpp; no original game code is loaded.
#define _CRT_SECURE_NO_WARNINGS
#include "adapter.cpp"
#include <cassert>
namespace rc4 {struct Edict {std::array<unsigned char,0x400> data{};};}
using namespace rc4;
namespace {
std::array<Edict,8> entities{};
std::unordered_map<Edict*,std::vector<unsigned char>> mem;
std::array<unsigned char,0xa0> globalData{};
std::vector<std::string> strings{"","s4_apartment1_e3","inter_door","func_button","trigger_relay","sc4_keydoor_193","sc4_keydoor_193_button","sc4_keydoor_193_open","sc4_keydoor_36","c_apartment1"};
std::vector<std::pair<Edict*,Edict*>> uses;int relinks=0;std::vector<std::string> lines;
int intern(const char* s){for(std::size_t i=0;i<strings.size();++i)if(strings[i]==s)return static_cast<int>(i);strings.emplace_back(s);return static_cast<int>(strings.size()-1);}
const char* str(int n){return n>=0&&n<static_cast<int>(strings.size())?strings[n].c_str():"";}
int index(Edict* e){for(int i=0;i<8;++i)if(e==&entities[i])return i;return -1;}
Edict* byindex(int i){return i>=0&&i<8?&entities[i]:nullptr;}
void* ev(Edict* e){return e->data.data()+0x80;}
void* pd(Edict* e){auto it=mem.find(e);return it==mem.end()?nullptr:it->second.data();}
void* alloc(Edict* e,int n){mem[e]=std::vector<unsigned char>(n);return mem[e].data();}
void free_(Edict* e){mem.erase(e);}
void print(const char* s){lines.emplace_back(s);}
Edict* find_(Edict* start,const char* key,const char* value){
 const int field=std::strcmp(key,"classname")==0?0:0x1d0;
 for(int i=start?index(start)+1:1;i<8;++i)if(load<int>(&entities[i],0)==0&&std::strcmp(str(load<int>(ev(&entities[i]),field)),value)==0)return &entities[i];
 return &entities[0]; // real engine: world edict, not null, when nothing matches
}
void set_origin(Edict* e,const float* o){store(ev(e),8,o[0]);store(ev(e),12,o[1]);store(ev(e),16,o[2]);++relinks;}
void use(Edict* used,Edict* other){uses.emplace_back(used,other);}
void make(int i,const char* type,const char* name,int serialValue){auto e=&entities[i];*e={};store(e,0,0);store(e,4,serialValue);store(ev(e),0,intern(type));store(ev(e),0x1d0,intern(name));}
Edict* door=&entities[1];Edict* button=&entities[2];Edict* relay=&entities[3];
void world(bool withRelay,int doorBytes){
 keydoor_reset();allocations.clear();mem.clear();uses.clear();relinks=0;lines.clear();
 for(auto& e:entities){e={};store(&e,0,1);}
 make(1,"inter_door","sc4_keydoor_193",11);make(2,"func_button","sc4_keydoor_193_button",12);make(4,"inter_door","plain_door",14);
 if(withRelay)make(3,"trigger_relay","sc4_keydoor_193_open",13);
 store(ev(button),0x10c,4);store(ev(button),0x118,0x10u);store(ev(button),8,36.f);store(ev(button),12,-115.5f);store(ev(button),16,192.5f);
 allocate(door,doorBytes);store(pd(door),0x190,intern("apartmentkey"));allocate(&entities[4],0x1b0);
}
bool hidden(){return load<int>(ev(button),0x10c)==0&&(load<unsigned>(ev(button),0x118)&0x80u)!=0;}
bool shown(){return load<int>(ev(button),0x10c)==4&&load<unsigned>(ev(button),0x118)==0x10u;}
}
int main(){
 globals=globalData.data();verified=true;store(globals,0x0c,1);store(globals,0x90,2);store(globals,0x94,8);
 engine[14]=reinterpret_cast<void*>(&find_);engine[28]=reinterpret_cast<void*>(&set_origin);engine[63]=reinterpret_cast<void*>(&alloc);engine[64]=reinterpret_cast<void*>(&pd);engine[65]=reinterpret_cast<void*>(&free_);
 engine[66]=reinterpret_cast<void*>(&str);engine[68]=reinterpret_cast<void*>(&ev);engine[71]=reinterpret_cast<void*>(&index);engine[72]=reinterpret_cast<void*>(&byindex);engine[81]=reinterpret_cast<void*>(&print);
 original[3]=reinterpret_cast<void*>(&use);
 // Activation hides the relocation button (not solid, no draw, relinked) so
 // the native key trace and locked message can only reach the inter_door.
 world(true,0x1b0);keydoor_activate();assert(keyDoors.size()==1&&hidden()&&relinks==1);
 // Locked: nothing fires, button remains hidden, origin is never moved.
 for(int f=0;f<3;++f)keydoor_frame();assert(uses.empty()&&hidden()&&load<float>(ev(button),16)==192.5f);
 // Native key unlock clears lockedby: relay fires once with the door as
 // activator, then the button is revealed in place with its own flags.
 store(pd(door),0x190,0);keydoor_frame();assert(uses.size()==1&&uses[0].first==relay&&uses[0].second==door&&shown()&&load<float>(ev(button),16)==192.5f);
 keydoor_frame();store(door,0,1);keydoor_frame();assert(uses.size()==1&&relinks==2);
 // Revisit/checkpoint: trigger_auto already removed the door; reveal without
 // firing the relay again.
 world(true,0x1b0);keydoor_activate();assert(hidden());keydoor_frame();assert(uses.empty()&&hidden());store(door,0,1);keydoor_frame();assert(uses.empty()&&shown());
 // Unverified door allocation is never read as unlocked: native door kept.
 world(true,0x1a0);keydoor_activate();store(pd(door),0x190,0);for(int f=0;f<3;++f)keydoor_frame();assert(uses.empty()&&hidden());
 // Missing relay: native door retained, button stays hidden, nothing tracked.
 world(false,0x1b0);keydoor_activate();assert(keyDoors.empty()&&hidden());
 // Serial reuse of the button slot is not revealed or touched.
 world(true,0x1b0);keydoor_activate();store(button,4,99);store(pd(door),0x190,0);keydoor_frame();assert(uses.empty());
 // Unscoped maps and plain inter_doors are never tracked.
 world(true,0x1b0);store(globals,0x0c,9);keydoor_activate();assert(keyDoors.empty()&&shown());store(globals,0x0c,1);
 keydoor_reset();assert(keyDoors.empty());
 std::puts("PASS key-door bridge fixtures: hidden until native unlock, single relay with door activator, in-place reveal, revisit removal, pinned allocation/serial guards, missing relay and unscoped maps retain native doors");
}
