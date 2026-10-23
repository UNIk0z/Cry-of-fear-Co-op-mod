// Included inside the adapter namespace. A converted key door keeps its native
// inter_door: the key-use trace (100E4630..100E468F) requires that exact class,
// compares lockedby with the held key and consumes it. Unlock (10048E40) clears
// lockedby +0x190 of the pinned 0x1B0 allocation but fires no target. The map's
// NAME_button is the verified fade/teleport relocation; it is hidden here like
// func_wall_toggle until the lock clears, then NAME_open (authored relay) sets
// the shared global and removes the native door. Revisits remove the door via
// trigger_auto; the button is revealed when the door is gone. SDK calls only.
struct KeyDoor {std::string name;Edict* door=nullptr;int doorSerial=-1;Edict* button=nullptr;int buttonSerial=-1;Edict* relay=nullptr;int relaySerial=-1;int solid=0;bool done=false;};
std::vector<KeyDoor> keyDoors;
void keydoor_reset(){keyDoors.clear();}
Edict* keydoor_named(const std::string& name,const char* type){
 Edict* e=nullptr;
 for(int n=0;n<64;++n){e=find_next(e,"targetname",name.c_str());if(!e)break;if(live(e)&&std::strcmp(classname(e),type)==0)return e;}
 return nullptr;
}
void keydoor_show(Edict* button,bool visible,int solid){
 auto p=vars(button);if(!p)return;
 // entvars solid10C/effects118 match this backend's pinned metadata; EF_NODRAW=0x80.
 store(p,0x10c,visible?solid:0);const unsigned effects=load<unsigned>(p,0x118);store(p,0x118,visible?effects&~0x80u:effects|0x80u);
 const std::array<float,3> at{load<float>(p,8),load<float>(p,12),load<float>(p,16)};eng<void(__cdecl*)(Edict*,const float*)>(28)(button,at.data());
}
bool keydoor_unlocked(Edict* door){
 auto it=allocations.find(door);
 if(it==allocations.end()||it->second.serial!=serial(door)||it->second.bytes!=0x1b0||std::strcmp(classname(door),"inter_door")||eng<void*(__cdecl*)(Edict*)>(64)(door)!=it->second.memory)return false;
 return load<int>(it->second.memory,0x190)==0;
}
void keydoor_activate(){
 keyDoors.clear();if(!scoped())return;
 Edict* e=nullptr;
 for(int n=0;n<512;++n){
  e=find_next(e,"classname","inter_door");if(!e)break;
  const std::string name=live(e)?targetname(e):"";if(name.rfind("sc4_keydoor_",0)!=0)continue;
  KeyDoor k;k.name=name;k.door=e;k.doorSerial=serial(e);k.button=keydoor_named(name+"_button","func_button");k.relay=keydoor_named(name+"_open","trigger_relay");
  if(!k.button){log("[STORYCOOP_RC4] KEYDOOR missing relocation button; native door retained\n");continue;}
  k.buttonSerial=serial(k.button);k.solid=load<int>(vars(k.button),0x10c);if(!k.solid)k.solid=4;
  // Hide first: the native key trace must hit only the original inter_door.
  keydoor_show(k.button,false,k.solid);
  if(!k.relay){log("[STORYCOOP_RC4] KEYDOOR missing relay; native door retained, button hidden\n");continue;}
  k.relaySerial=serial(k.relay);keyDoors.push_back(k);
  char line[160]{};std::snprintf(line,sizeof(line),"[STORYCOOP_RC4] KEYDOOR tracking %s; native lock/key retained until unlock\n",name.c_str());log(line);
 }
}
void keydoor_frame(){
 if(!scoped())return;
 for(auto& k:keyDoors){
  if(k.done)continue;
  const bool present=serial(k.door)==k.doorSerial;
  if(present&&!keydoor_unlocked(k.door))continue;
  if(serial(k.button)!=k.buttonSerial){k.done=true;log("[STORYCOOP_RC4] KEYDOOR button lost; native door retained\n");continue;}
  if(present){
   if(serial(k.relay)!=k.relaySerial){k.done=true;log("[STORYCOOP_RC4] KEYDOOR relay lost; native door retained\n");continue;}
   native<void(__cdecl*)(Edict*,Edict*)>(3)(k.relay,k.door);
  }
  keydoor_show(k.button,true,k.solid);k.done=true;
  char line[200]{};std::snprintf(line,sizeof(line),"[STORYCOOP_RC4] KEYDOOR %s %s; verified relocation enabled\n",k.name.c_str(),present?"unlocked by native key":"already unlocked (shared state)");log(line);
 }
}
