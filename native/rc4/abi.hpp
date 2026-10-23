#pragma once
#include <array>
#include <cstdint>
#include <cstring>

// Independently declared narrow API140 ABI, checked against the pinned CoF DLL
// and Valve's public engine interface. No proprietary implementation included.
namespace rc4 {
struct Edict;
using Table = std::array<void*, 50>;
using Engine = std::array<void*, 144>;
template<class T> T load(const void* p, std::size_t at) {
 T out{}; std::memcpy(&out,static_cast<const unsigned char*>(p)+at,sizeof(out));return out;
}
template<class T> void store(void* p,std::size_t at,const T& value) {
 std::memcpy(static_cast<unsigned char*>(p)+at,&value,sizeof(value));
}
constexpr std::size_t PlayerBytes=0x281c, JournalOffset=0x7a8;
}
