#define _CRT_SECURE_NO_WARNINGS
#include "journal.hpp"
#include "abi.hpp"
#include <cassert>
#include <cstdio>
#include <cstring>
#include <array>
using namespace rc4;
int main(){
 std::array<unsigned char,PlayerBytes> p1{},p2{};
 Note note{};std::strcpy(reinterpret_cast<char*>(note.data()+0x40),"note_orig_1");
 std::strcpy(reinterpret_cast<char*>(note.data()),"page_orig_1");std::strcpy(reinterpret_cast<char*>(note.data()+0xf0),"Author's label");
 std::strcpy(reinterpret_cast<char*>(note.data()+0xb0),"Original title");
 std::memcpy(p1.data()+JournalOffset,note.data(),note.size());Journal j;
 assert(j.collect(p1.data(),p1.size())==0&&j.size()==1);
 auto gen=j.generation();assert(j.collect(p1.data(),p1.size())==0&&j.generation()==gen);
 assert(j.restore(p2.data(),p2.size()));assert(!std::memcmp(p2.data()+JournalOffset,note.data(),note.size()));
 assert(!j.restore(p2.data(),p2.size()));
 // Host object survives replacing every player/map allocation.
 p1.fill(0);p2.fill(0);assert(j.restore(p1.data(),p1.size())&&j.restore(p2.data(),p2.size()));
 // A same-ID changed clue is rejected rather than silently replacing acquisition.
 auto conflict=note;conflict[0]='X';std::memcpy(p2.data()+JournalOffset,conflict.data(),conflict.size());
 assert(j.collect(p2.data(),p2.size())==1&&j.size()==1&&j.generation()==gen);
 const auto before=p2;assert(!j.restore(p2.data(),p2.size())&&p2==before);
 auto bad=note;std::memset(bad.data()+0x40,'X',17);assert(!Journal::valid(bad));
 assert(j.collect(p1.data(),p1.size()-1)==1&&!j.restore(p1.data(),p1.size()-1));
 // 16 original slots: capacity failure doesn't evict earlier notes.
 for(int i=2;i<=17;++i){Note x=note;std::snprintf(reinterpret_cast<char*>(x.data()+0x40),16,"note_%d",i);std::memcpy(p2.data()+JournalOffset,x.data(),x.size());auto rejected=j.collect(p2.data(),p2.size());assert(rejected==(i==17?1u:0u));}
 assert(j.size()==16);j.reset();assert(j.size()==0);p1.fill(0);assert(!j.restore(p1.data(),p1.size()));
 // Real cafe filenames: the backend clears note2 after unbounded ID copying.
 // Exact16 and truncated17/18 character IDs terminate in note2's first byte.
 for(const char* title:{"jillusername","leatherhoff45","marriageinapril","unforgettable"}){
  Note cafe{};const std::string filename=std::string(title)+".txt";
  std::memcpy(cafe.data()+0x40,filename.data(),16);std::strcpy(reinterpret_cast<char*>(cafe.data()),"user1");
  std::strcpy(reinterpret_cast<char*>(cafe.data()+0xb0),title);std::strcpy(reinterpret_cast<char*>(cafe.data()+0xf0),"gfx/vgui/notes/hiddennote2.tga");
  assert(Journal::valid(cafe)&&Journal::resource(cafe)==filename);assert(j.grant(cafe)==0);
 }
 assert(j.size()==4);p1.fill(0);p2.fill(0);assert(j.restore(p1.data(),p1.size())&&j.restore(p2.data(),p2.size()));
 assert(j.collect(p1.data(),p1.size())==0&&j.collect(p2.data(),p2.size())==0&&j.size()==4);
 auto unknown=note;std::strcpy(reinterpret_cast<char*>(unknown.data()+0x40),"new_native.txt");std::memcpy(p2.data()+JournalOffset+4*0x120,unknown.data(),unknown.size());
 const auto untouched=p2;assert(!j.restore(p2.data(),p2.size())&&p2==untouched);
 auto spoof=j.at(0);std::strcpy(reinterpret_cast<char*>(spoof.data()+0xb0),"wrong");assert(Journal::resource(spoof)!="wrong.txt");
 std::puts("PASS journal stable IDs, original strings, shared restore, map replacement, conflicts, bounds, 16-slot capacity and new-session reset");
}
