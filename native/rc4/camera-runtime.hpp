// Included inside the adapter namespace. Pinned backend evidence is recorded
// in docs/RC4_CAMERA_NOTES.md. No private function calls or camera Use fanout.
struct CameraRef {Edict* entity=nullptr;int serial=-1;};
int cameraViewMessage=0,cameraAttachMessage=0;
CameraRef camera_ref(Edict* e){return {e,serial(e)};}
Edict* camera_resolve(CameraRef ref){return ref.entity&&serial(ref.entity)==ref.serial?ref.entity:nullptr;}
struct CameraLease {
 int playerSerial=-1;
 CameraRef owner{},view{},previous{};
 unsigned controls=0;
 bool ended=false;
 CameraRef recovered{};
};
std::unordered_map<Edict*,CameraLease> cameraLeases;
// User reports and screenshots (2026-10-10, twice): a light beam and the held
// phone show inside cutscenes. Native CFlashlight TurnOn/TurnOff
// (10040190/10040110) only flip player+0x1EA8 and bit 8 of player+0x5D0; the
// "Maglite" message is re-sent by UpdateClientData (100EEC38) on change. The
// held item's light and model are drawn from the client's view model, which
// the server sends from entvars viewmodel (+0xBC). While a player has a
// cinematic lease, hold both off EVERY frame (a deploy during the scene would
// otherwise restore them); return the latest values once the lease is gone and
// the player is alive (native revival owns down players).
// coop-fixes-004 (user: "cutscenes still have that flashlight ... maybe a post
// process texture"): the lit circle is the CLIENT spotlight, a projected
// gfx/flashlight.tga pass drawn from the current view origin. Client 100AEA10
// (phone, FlashFlags bits 1|2), 100AEE70 (Glock light, bit 4) and 100AE540
// (Maglite, bit 8) each draw only while the server's FlashFlags (player+0x5D0,
// sent by UpdateClientData 100EDC08 when it differs from +0x5D4) has their bit
// and 10072710 says the view is NOT another entity (gHUD+0x31C0 from the
// ViewEntity message). The previous hold cleared only the Maglite, and the log
// showed light=0: the beam was the phone's (toggle 100530B0, state +0x1E98).
// Clear every spotlight bit while a scene holds the player, restore exactly the
// bits that were on afterwards, and keep the client's view entity in sync.
struct CinematicHide {int serial=-1;bool light=false;int viewmodel=0;unsigned spot=0;int phone=0;float resync=0;};
std::unordered_map<Edict*,CinematicHide> cinematicHidden;
constexpr unsigned SpotlightBits=1u|2u|4u;
void flashlight_set(void* p,bool on){store(p,0x1ea8,on?1:0);const unsigned f=load<unsigned>(p,0x5d0);store(p,0x5d0,on?(f|8u):(f&~8u));}
// ResetHUD/InitHUD clear the client's view entity (1006FE00/100714B0) while
// the server only re-sends ViewEntity when +0x2038 differs from +0x203C.
void view_entity_resync(void* p){store(p,0x203c,-1);}
void cinematic_hold(Edict* client,void* p){
 auto v=vars(client);if(!v)return;
 auto found=cinematicHidden.find(client);const bool fresh=found==cinematicHidden.end()||found->second.serial!=serial(client);
 auto& h=cinematicHidden[client];if(fresh){h={};h.serial=serial(client);h.phone=load<int>(p,0x1e98);}
 if(load<int>(p,0x1ea8)){flashlight_set(p,false);h.light=true;}
 if(const unsigned f=load<unsigned>(p,0x5d0);f&SpotlightBits){h.spot|=f&SpotlightBits;store(p,0x5d0,f&~SpotlightBits);}
 if(const int model=load<int>(v,0xbc)){h.viewmodel=model;store(v,0xbc,0);}
 const float now=load<float>(globals,0);
 // coop-fixes-005: the light that remained in the user's cutscenes (spot=0) is
 // the per-player light in pev->frags (session-runtime.hpp). Forcing
 // UpdateClientData to resend FlashFlags (+0x5D4 = -1) also rewrites frags from
 // the now cleared FlashFlags and broadcasts it, so no player light remains.
 if(fresh||now>=h.resync){view_entity_resync(p);store(p,0x5d4,-1);h.resync=now+0.5f;}
 if(fresh){char line[160]{};std::snprintf(line,sizeof(line),"[STORYCOOP_RC4] CINEMATIC hold player=%d light=%d spot=%u viewmodel=%d\n",eng<int(__cdecl*)(Edict*)>(71)(client),h.light?1:0,h.spot,h.viewmodel?1:0);log(line);}
}
void cinematic_release(Edict* client,void* p){
 auto it=cinematicHidden.find(client);if(it==cinematicHidden.end())return;
 if(it->second.serial!=serial(client)){cinematicHidden.erase(it);return;}
 auto v=vars(client);if(!v||load<int>(v,0x174)!=0)return;
 const auto h=it->second;cinematicHidden.erase(it);
 if(h.light)flashlight_set(p,true);
 // The phone light comes back only if the player did not switch it during the
 // scene; native UpdateClientData then re-derives held/pocket mode (bit 1/2).
 unsigned spot=h.spot&4u;if(load<int>(p,0x1e98)==h.phone)spot|=h.spot&3u;
 if(spot)store(p,0x5d0,load<unsigned>(p,0x5d0)|spot);
 if(h.viewmodel&&!load<int>(v,0xbc))store(v,0xbc,h.viewmodel);
 char line[160]{};std::snprintf(line,sizeof(line),"[STORYCOOP_RC4] CINEMATIC release player=%d light=%d spot=%u viewmodel=%d\n",eng<int(__cdecl*)(Edict*)>(71)(client),h.light?1:0,spot,h.viewmodel?1:0);log(line);
}
std::unordered_map<Edict*,CameraRef> nativeViews;
std::unordered_map<Edict*,CameraRef> previousViews;
std::unordered_map<Edict*,std::pair<int,unsigned>> cameraControls;
bool camera_memory(Edict* e,void*& p){
 auto it=allocations.find(e);
 if(it==allocations.end()||it->second.serial!=serial(e)||it->second.bytes!=0x154||std::strcmp(classname(e),"trigger_camera"))return false;
 p=eng<void*(__cdecl*)(Edict*)>(64)(e);return p&&p==it->second.memory;
}
Edict* camera_handle(void* p,std::size_t offset){return resolve(load<std::uint32_t>(p,offset),load<int>(p,offset+4));}
bool camera_active(Edict* e){void* p=nullptr;return camera_memory(e,p)&&load<int>(vars(e),0x248)!=0;}
void camera_forget(Edict* e){cameraLeases.erase(e);nativeViews.erase(e);previousViews.erase(e);cameraControls.erase(e);cinematicHidden.erase(e);}
std::unordered_map<Edict*,CameraRef> clientViews;std::unordered_map<Edict*,std::pair<int,CameraRef>> joinViews;std::unordered_map<Edict*,std::pair<int,float>> joinSeen;
void camera_reset(){cameraLeases.clear();nativeViews.clear();previousViews.clear();cameraControls.clear();cinematicHidden.clear();clientViews.clear();joinViews.clear();joinSeen.clear();}
unsigned camera_baseline(Edict* e){auto it=cameraControls.find(e);return it!=cameraControls.end()&&it->second.first==serial(e)?it->second.second:load<unsigned>(vars(e),0x1a8)&0x1080u;}
void camera_restore_view(Edict* client,Edict* target,void* p){
 // Public engine calls mirror native UTIL_SetView and the ViewEntity HUD
 // update. Down players may not reach that native HUD update until revival.
 if(cameraAttachMessage){eng<void(__cdecl*)(int,int,const float*,Edict*)>(46)(1,cameraAttachMessage,nullptr,client);eng<void(__cdecl*)(int)>(50)(-1);eng<void(__cdecl*)(int)>(48)(-1);eng<void(__cdecl*)()>(47)();}
 eng<void(__cdecl*)(Edict*,Edict*)>(92)(client,target);
 const int id=eng<int(__cdecl*)(Edict*)>(71)(target);store(p,0x2038,id);
 if(cameraViewMessage){eng<void(__cdecl*)(int,int,const float*,Edict*)>(46)(1,cameraViewMessage,nullptr,client);eng<void(__cdecl*)(int)>(50)(id);eng<void(__cdecl*)()>(47)();store(p,0x203c,id);}
 nativeViews[client]=camera_ref(target);
}
void __cdecl set_view(Edict* client,Edict* view){
 void* p=nullptr;std::size_t bytes=0;void* cp=nullptr;
 if(scoped()&&player_memory(client,p,bytes)){
  if(camera_memory(view,cp)){
   auto found=cameraLeases.find(client);
   if(found==cameraLeases.end()||found->second.playerSerial!=serial(client)){
    CameraLease lease;lease.playerSerial=serial(client);
    auto prior=nativeViews.find(client);
    lease.previous=prior==nativeViews.end()?camera_ref(client):prior->second;
    lease.controls=camera_baseline(client);
    cameraLeases[client]=lease;
   }
   auto& lease=cameraLeases.at(client);lease.owner=camera_ref(view);lease.view=camera_ref(view);lease.ended=false;
   cinematic_hold(client,p);
  }
  auto last=nativeViews.find(client);previousViews[client]=last==nativeViews.end()?camera_ref(client):last->second;
  nativeViews[client]=camera_ref(view);
 }
 eng<void(__cdecl*)(Edict*,Edict*)>(92)(client,view);
}
void camera_frame(Edict* client){
 void* p=nullptr;std::size_t bytes=0;
 if(!scoped()||!player_memory(client,p,bytes)){camera_forget(client);return;}
 auto current=camera_handle(p,0x2348);
 auto it=cameraLeases.find(client);
 if(it==cameraLeases.end()){
  // Cameras may use an authored alternate view entity. The native ownership
  // handle is assigned after SetView; attach it on the next player frame.
  if(camera_active(current)&&nativeViews.count(client)){
   CameraLease lease;lease.playerSerial=serial(client);lease.owner=camera_ref(current);lease.view=nativeViews.at(client);
   lease.previous=previousViews.count(client)?previousViews.at(client):camera_ref(client);lease.controls=camera_baseline(client);
   it=cameraLeases.emplace(client,lease).first;
  }else{cinematic_release(client,p);cameraControls[client]={serial(client),load<unsigned>(vars(client),0x1a8)&0x1080u};return;}
 }
 if(it->second.playerSerial!=serial(client)){camera_forget(client);return;}
 cinematic_hold(client,p);
 auto& lease=it->second;auto v=vars(client);
 // Native Use assigns everyone, but both completion paths skip SetView and
 // EnableControl for !IsAlive, then clear 2348 even for the skipped players.
 if(current&&camera_active(current))return;
 if(camera_active(camera_resolve(lease.owner)))return;
 auto last=nativeViews.find(client);
 auto currentView=last==nativeViews.end()?nullptr:camera_resolve(last->second);
 const bool ours=currentView==camera_resolve(lease.view)&&last!=nativeViews.end()&&last->second.entity==lease.view.entity;
 const unsigned flags=load<unsigned>(v,0x1a8);
 const bool observer=(flags&0x100000u)!=0;
 const bool alive=load<int>(v,0x174)==0&&load<float>(v,0x164)>0&&!observer;
 if(!lease.ended&&!ours&&alive){cameraLeases.erase(it);return;} // native cleanup won
 if(!lease.ended&&ours){
  auto prior=camera_resolve(lease.previous);
  // Preserve native down/observer view. Self here means the native player's
  // view entity, not a forced live pose: deadflag, view_ofs and observer state
  // are untouched. Never dereference recycled camera or player allocations.
  auto target=alive?client:prior;
  if(!target||std::strcmp(classname(target),"trigger_camera")==0)target=client;
  camera_restore_view(client,target,p);lease.recovered=camera_ref(target);
  char line[160]{};std::snprintf(line,sizeof(line),"[STORYCOOP_RC4] CAMERA recovered player=%d state=%s\n",eng<int(__cdecl*)(Edict*)>(71)(client),observer?"observer":alive?"alive":"down");log(line);
 }
 lease.ended=true;
 if(!alive)return; // native revival owns deadflag, health, weapons and movement.
 // A later native interactive view owns its own control lock. Do not release
 // it merely because an earlier scene has ended.
 if(camera_handle(p,0x380)||camera_handle(p,0x388)||camera_handle(p,0x390))return;
 const auto now=nativeViews.find(client);
 if(lease.recovered.entity&&now!=nativeViews.end()&&camera_resolve(now->second)==camera_resolve(lease.recovered)&&camera_resolve(lease.recovered)!=client)camera_restore_view(client,client,p);
 if(now!=nativeViews.end()&&camera_resolve(now->second)!=client){cameraLeases.erase(it);return;}
 // Restore only the cinematic control bits; keep unrelated native flags.
 store(v,0x1a8,(flags&~0x1080u)|lease.controls);
 if(load<float>(v,0x170)==0)store(v,0x170,2.0f);
 if(current==camera_resolve(lease.owner)){store(p,0x2348,0u);store(p,0x234c,0);}
 cameraLeases.erase(it);
}

// --- A player who joins while a scene camera runs (coop-fixes-008) ------------
// User report: reconnecting during a camera scene left the player in the
// closed spawn box with no camera. The native trigger_camera Use sets the view
// of the players connected at that moment; one who (re)joins later keeps their
// own view until the next camera. The engine's view entity of every client is
// seen in SetupVisibility. A living player who has been in the map for a
// second gets the same running scene camera as another living player (engine
// SetView plus the ViewEntity message, as camera_restore_view) and their own
// view back once no living player watches it any more. No camera is Used.
void view_seen(Edict* view,Edict* client){if(live(client))clientViews[client]=camera_ref(live(view)?view:client);}
bool scene_camera(Edict* e){if(!live(e)||std::strcmp(classname(e),"trigger_camera"))return false;void* p=nullptr;return camera_memory(e,p)?load<int>(vars(e),0x248)!=0:true;}
bool view_alive(Edict* e){auto v=vars(e);return v&&load<int>(v,0x174)==0&&load<float>(v,0x164)>0&&!(load<unsigned>(v,0x1a8)&0x100000u);}
void join_view_set(Edict* client,Edict* target){
 void* p=nullptr;std::size_t bytes=0;
 if(player_memory(client,p,bytes))camera_restore_view(client,target,p);else eng<void(__cdecl*)(Edict*,Edict*)>(92)(client,target);
 clientViews[client]=camera_ref(target);
}
void camera_join(Edict* e){
 if(!globals||!live(e)||std::strcmp(classname(e),"player")||!engine[92]||!engine[71]||!engine[72])return;
 // Player allocations are tracked on the co-op story maps only; elsewhere
 // (the intro) the first frame this player entity was seen counts.
 const float now=load<float>(globals,0);auto a=allocations.find(e);float born=0;
 if(a!=allocations.end()&&a->second.serial==serial(e))born=a->second.born;else{auto& seen=joinSeen[e];if(seen.first!=serial(e))seen={serial(e),now};born=seen.second;}
 if(now-born<1.f)return;
 auto mine=clientViews.find(e);Edict* own=mine==clientViews.end()?nullptr:camera_resolve(mine->second);
 Edict* scene=nullptr;
 for(int i=1;i<=load<int>(globals,0x90)&&!scene;++i){auto o=eng<Edict*(__cdecl*)(int)>(72)(i);if(o==e||!live(o)||std::strcmp(classname(o),"player")||!view_alive(o))continue;
  auto it=clientViews.find(o);if(it==clientViews.end())continue;auto v=camera_resolve(it->second);if(v&&v!=o&&scene_camera(v))scene=v;}
 auto joined=joinViews.find(e);const bool ours=joined!=joinViews.end()&&joined->second.first==serial(e);
 const int index=eng<int(__cdecl*)(Edict*)>(71)(e);
 if(scene){
  if(!view_alive(e)||own==scene||(own&&own!=e&&scene_camera(own)))return;
  join_view_set(e,scene);joinViews[e]={serial(e),camera_ref(scene)};
  char line[140]{};std::snprintf(line,sizeof(line),"[STORYCOOP_RC4] CAMERA join player=%d gets the running scene camera %d\n",index,eng<int(__cdecl*)(Edict*)>(71)(scene));log(line);
  return;
 }
 if(!ours)return;
 auto given=camera_resolve(joined->second.second);joinViews.erase(joined);
 if(own&&own==given){join_view_set(e,e);char line[120]{};std::snprintf(line,sizeof(line),"[STORYCOOP_RC4] CAMERA join player=%d scene over, own view back\n",index);log(line);}
}
