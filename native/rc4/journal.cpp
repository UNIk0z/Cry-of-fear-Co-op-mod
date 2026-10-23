#include "journal.hpp"
#include "abi.hpp"
#include <cstring>
#include <algorithm>
namespace rc4 {
void Journal::reset(){notes_.clear();metadata_.clear();++generation_;}
bool Journal::valid(const Note& n){
 if(!n[0x40])return false;
 for(const auto& f:NoteFields)if(!std::memchr(n.data()+f.offset,0,f.capacity))return false;
 return true;
}
std::string Journal::resource(const Note& n){
 if(!valid(n))return {};
 const auto id=reinterpret_cast<const char*>(n.data()+0x40);
 const auto page=reinterpret_cast<const char*>(n.data());
 const auto label=reinterpret_cast<const char*>(n.data()+0xf0);
 const bool pass=std::strlen(page)==5&&std::strncmp(page,"pass",4)==0&&page[4]>='1'&&page[4]<='8'&&std::strcmp(label,"gfx/vgui/notes/hiddennote1.tga")==0;
 const bool user=std::strlen(page)==5&&std::strncmp(page,"user",4)==0&&page[4]>='1'&&page[4]<='8'&&std::strcmp(label,"gfx/vgui/notes/hiddennote2.tga")==0;
 if((pass||user)&&!n[0x50]&&!n[0x60]&&!n[0x70]){
  const auto title=reinterpret_cast<const char*>(n.data()+0xb0);
  const auto length=std::strlen(title);
  if(length>0&&length<28&&std::all_of(title,title+length,[](unsigned char c){return (c>='a'&&c<='z')||(c>='A'&&c<='Z')||(c>='0'&&c<='9')||c=='_';})){
   const std::string full=std::string(title)+".txt";
   if(std::strlen(id)==16&&full.size()>=16&&full.compare(0,16,id)==0)return full;
  }
 }
 return id;
}
std::size_t Journal::collect(const void* p,std::size_t bytes){
 if(!p||bytes!=PlayerBytes)return 1;
 std::size_t rejected=0;
 for(std::size_t i=0;i<NoteLimit;++i){
  Note n{};std::memcpy(n.data(),static_cast<const unsigned char*>(p)+JournalOffset+i*n.size(),n.size());
  if(!n[0x40])continue;
  // Native special-code records reuse "nerds" and carry their type/value only
  // in AddNote. Never guess their metadata from a buffer or the current puzzle.
  if(valid(n)&&std::strcmp(reinterpret_cast<const char*>(n.data()+0x40),"nerds")==0)continue;
  rejected+=grant(n);
 }
 return rejected;
}
std::size_t Journal::grant(const Note& n,NoteMetadata meta){
 if(!valid(n)||meta.codeFlag<0||meta.codeFlag>1||meta.codeType<0||meta.codeType>255)return 1;
 if(!meta.codeFlag&&std::strcmp(reinterpret_cast<const char*>(n.data()+0x40),"nerds")==0)return 0;
 std::size_t index=notes_.size();
 for(std::size_t i=0;i<notes_.size();++i){auto m=metadata_[i];
  const bool sameKey=meta.codeFlag?m.codeFlag&&m.codeType==meta.codeType&&m.codeValue==meta.codeValue:!m.codeFlag&&(resource(n)==resource(notes_[i])||std::strcmp(reinterpret_cast<const char*>(n.data()+0x40),reinterpret_cast<const char*>(notes_[i].data()+0x40))==0);
  if(sameKey){index=i;break;}
 }
 if(index<notes_.size()){
   const auto& found=notes_[index];
   // Ignore unused bytes beyond each terminated native string.
   bool same=true;for(const auto& f:NoteFields)if(std::strcmp(reinterpret_cast<const char*>(n.data()+f.offset),reinterpret_cast<const char*>(found.data()+f.offset)))same=false;
   return same?0:1;
  }
 if(notes_.size()==NoteLimit)return 1;
 notes_.push_back(n);metadata_.push_back(meta);++generation_;return 0;
}
bool Journal::restore(void* p,std::size_t bytes)const{
 if(!p||bytes!=PlayerBytes)return false;
 auto dest=static_cast<unsigned char*>(p)+JournalOffset;
 // A failed collection must never erase the native record it rejected. Check
 // the complete bank before writing, including same-key content conflicts.
 Journal check=*this;if(check.collect(p,bytes)||check.size()!=notes_.size())return false;
 std::array<unsigned char,0x120*NoteLimit> expected{};
 for(std::size_t i=0;i<notes_.size();++i)std::memcpy(expected.data()+i*0x120,notes_[i].data(),0x120);
 const bool changed=std::memcmp(dest,expected.data(),expected.size())!=0;
 if(changed)std::memcpy(dest,expected.data(),expected.size());
 return changed;
}
}
