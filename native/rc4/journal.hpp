#pragma once
#include <array>
#include <cstdint>
#include <vector>
#include <cstddef>
#include <string>
namespace rc4 {
using Note=std::array<unsigned char,0x120>;
constexpr std::size_t NoteLimit=16;
struct NoteField {std::size_t offset,capacity;};
struct NoteMetadata {int codeFlag=0,codeValue=0,codeType=0;};
inline constexpr std::array<NoteField,11> NoteFields{{
 // Native archival copies a 16-character ID then clears the following ID.
 // Its terminator can therefore be the next field's first byte. Read at most
 // 17 bytes, without enlarging the pinned 0x120 record or accepting overflow.
 {0x40,17},{0x50,17},{0x60,17},{0x70,17},
 {0,16},{0x10,16},{0x20,16},{0x30,16},{0x80,48},{0xb0,64},{0xf0,48}
}};
class Journal {
 std::vector<Note> notes_;
 std::vector<NoteMetadata> metadata_;
 std::uint64_t generation_=1;
public:
 void reset();
 // Returns conflict/invalid/full count. Never silently replace acquired content.
 std::size_t collect(const void* player,std::size_t bytes);
 std::size_t grant(const Note& note,NoteMetadata metadata={});
 bool restore(void* player,std::size_t bytes) const;
 std::size_t size() const{return notes_.size();}
 std::uint64_t generation() const{return generation_;}
 const Note& at(std::size_t i) const{return notes_.at(i);}
 NoteMetadata metadata(std::size_t i) const{return metadata_.at(i);}
 static bool valid(const Note& note);
 // Recover the original cafe filename from its native archive title. The
 // backend truncates longer IDs when it clears the adjacent note2 field.
 // Only the authored pass/user page + hidden-note label + exact ID prefix
 // permits recovery; ordinary and code notes keep their actual identifiers.
 static std::string resource(const Note& note);
};
}
