// Native AddNote is not an idempotent layout operation: 1006F668 gets
// digit[0].x, then 1006F6F5 adds label.width to it on EVERY nonzero code/type
// packet. VidInit reuses the viewport; its journal reset only hides the panel.
// Keep the original glyphs and scaling, and execute that branch once per
// connection/slot. Later registration packets retain the code and code flag,
// but type=0 skips the already-completed glyph/layout branch.
std::unordered_map<int,std::array<NoteMetadata,NoteLimit>> codeLayouts;
int note_connection(Edict* e){return engine[113]?eng<int(__cdecl*)(Edict*)>(113)(e):0;}
NoteMetadata layout_metadata(Edict* e,int slot,NoteMetadata meta,bool ready){
 if(!meta.codeFlag||!meta.codeValue||meta.codeType<1||meta.codeType>4||slot<1||slot>16)return meta;
 if(!ready){meta.codeType=0;return meta;}
 const int id=note_connection(e);if(id<=0)return meta;
 auto& done=codeLayouts[id][slot-1];
 if(done.codeFlag&&done.codeType==meta.codeType&&done.codeValue==meta.codeValue)meta.codeType=0;
 else done=meta;
 return meta;
}
// Evidence for the post-transition drift report: every packet that makes the
// client run its relative layout (codeType>0), and code notes whose metadata
// reaches the wire zeroed. Both are rare; nothing else is logged here.
void code_trace(const char* source,Edict* e,int slot,NoteMetadata meta,bool ready){
 char line[200]{};std::snprintf(line,sizeof(line),"[STORYCOOP_RC4] CODE_LAYOUT source=%s player=%d userid=%d slot=%d flag=%d type=%d ready=%d map=%s\n",source,eng<int(__cdecl*)(Edict*)>(71)(e),note_connection(e),slot,meta.codeFlag,meta.codeType,ready?1:0,map_name());log(line);
}
struct NoteWrite {int kind=0,value=0;float number=0;std::string text;};
struct NoteWire {bool active=false;int dest=0,type=0;Edict* recipient=nullptr;bool hasOrigin=false;std::array<float,3> origin{};std::vector<NoteWrite> writes;} noteWire;
bool note_buffer(int kind,int value=0,float number=0,const char* text=nullptr){
 if(!noteWire.active)return false;
 noteWire.writes.push_back({kind,value,number,text?text:""});return true;
}
bool packet_valid(){return packet.valid&&packet.slot>=1&&packet.slot<=16&&packet.bytes==3&&packet.shorts==1&&packet.strings==11&&Journal::valid(packet.note);}
// Returns false when the buffered native packet is intentionally dropped.
bool flush_note(){
 if(!noteWire.active)return true;
 if(packet_valid()){
  // User report: P1 saw an unopenable duplicate "Hidden note #1" row. A native
  // grant re-sent a note the shared journal already holds at ANOTHER slot.
  // Drop only that duplicate row; same-slot, new and code packets still flow.
  const auto id=Journal::resource(packet.note);
  for(std::size_t i=0;i<journal.size();++i)if(static_cast<int>(i)!=packet.slot-1&&Journal::resource(journal.at(i))==id&&std::strcmp(reinterpret_cast<const char*>(journal.at(i).data()),reinterpret_cast<const char*>(packet.note.data()))==0){
   char line[200]{};std::snprintf(line,sizeof(line),"[STORYCOOP_RC4] JOURNAL duplicate row suppressed player=%d nativeSlot=%d sharedSlot=%u id=%s\n",eng<int(__cdecl*)(Edict*)>(71)(packet.recipient),packet.slot,static_cast<unsigned>(i+1),id.c_str());log(line);
   noteWire={};return false;
  }
  auto meta=packet.meta;
  if(!meta.codeFlag&&std::strcmp(reinterpret_cast<const char*>(packet.note.data()+0x40),"nerds")==0&&static_cast<std::size_t>(packet.slot)<=journal.size()){
   const auto i=packet.slot-1;
   if(journal.at(i)==packet.note&&journal.metadata(i).codeFlag)meta=journal.metadata(i);
  }
  const auto canonical=meta;
  const bool ready=client_ready(packet.recipient);
  meta=layout_metadata(packet.recipient,packet.slot,meta,ready);
  if(meta.codeType>0)code_trace("native",packet.recipient,packet.slot,meta,ready);
  else if(!meta.codeFlag&&static_cast<std::size_t>(packet.slot)<=journal.size()&&journal.metadata(packet.slot-1).codeFlag)code_trace("native-zero",packet.recipient,packet.slot,meta,ready);
  if(noteWire.writes.size()==15&&noteWire.writes[0].kind==48&&noteWire.writes[1].kind==48&&noteWire.writes[2].kind==50&&noteWire.writes[3].kind==48){
   noteWire.writes[1].value=meta.codeFlag;noteWire.writes[2].value=meta.codeValue;noteWire.writes[3].value=meta.codeType;
   // Signatures describe registered authoritative content, not the type=0
   // presentation optimization. Unready delivery still needs one full replay.
   if(client_ready(packet.recipient))packet.meta=canonical;
  }
 }
 eng<void(__cdecl*)(int,int,const float*,Edict*)>(46)(noteWire.dest,noteWire.type,noteWire.hasOrigin?noteWire.origin.data():nullptr,noteWire.recipient);
 for(const auto& w:noteWire.writes){
  if(w.kind==54)eng<void(__cdecl*)(const char*)>(54)(w.text.c_str());
  else if(w.kind==52||w.kind==53)eng<void(__cdecl*)(float)>(w.kind)(w.number);
  else eng<void(__cdecl*)(int)>(w.kind)(w.value);
 }
 noteWire={};return true;
}
