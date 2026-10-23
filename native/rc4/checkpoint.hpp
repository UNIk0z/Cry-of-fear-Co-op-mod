#pragma once
#include "journal.hpp"
#include <array>
#include <string>
#include <utility>
#include <vector>
#include <cstdint>
#include <filesystem>
namespace rc4 {
constexpr std::size_t WorldRemovedLimit=1024,WorldUnlockedLimit=256;
struct SavedWeapon {std::string name;int clip=-1,ammoIndex=-1;};
// Schema 5: a quick-select key (quickselset1..3, hl.dll 10019A1C): the
// inventory slot it points at (player+0x3DC/+0x3E0/+0x3E4, 1..6, 0 none) and
// the weapon it names (m_sQuickSel1..3, +0x204C/+0x20CC/+0x214C, 128 bytes).
struct QuickSlot {int slot=0;std::string weapon;};
struct SavedPlayer {
 std::string identity,equipped;
 float health=0,stamina=0;
 std::array<int,32> ammo{};
 std::array<int,5> items{};
 std::array<std::string,6> inventory{};
 int tapes=0,battery=0;bool usedSyringe=false;
 std::vector<SavedWeapon> weapons;
 // Schema 2: where this player stood when the checkpoint was committed.
 bool hasPose=false;std::array<float,3> origin{},angles{};
 // Schema 4: story wounds (player+0x60C m_iHealthCap 0..2, set by
 // cof_maxhealthchange for its activator) and the night-vision pickup
 // (+0x434). Co-op map changes rebuild players without them.
 int healthCap=0;bool nightVision=false;
 std::array<QuickSlot,3> quick{};
 // Schema 6: the phone screen (player+0x5CC m_iPhoneMessage) and
 // m_iPhoneDisabled (+0x1F14).
 int phoneMessage=0,phoneDisabled=0;
 // Schema 8 (v0.5): the two weapons of a dual wield (classnames, empty: none).
 std::string dualA,dualB;
};
// Schema 8 (v0.5): the host's setup for this playthrough, fixed once it starts.
struct SessionOptions {bool have=false;int maxPlayers=2,collision=1,friendlyFire=0;};
struct GlobalSnapshot {std::vector<unsigned char> bytes;std::vector<std::string> tokens;};
struct Checkpoint {
 std::string map,owner;int recorder=0;
 std::vector<Note> notes;std::vector<NoteMetadata> metadata;
 bool haveDigits=false,haveCredentials=false;
 std::array<int,4> digits{};std::array<int,2> credentials{};
 GlobalSnapshot globals;
 std::vector<SavedPlayer> players;
 // Schema 2: BSP entity indices of taken pickups and key-unlocked doors.
 std::vector<std::pair<int,std::string>> removed;std::vector<int> unlocked;
 // Schema 3: the shared keypad code (player+0x2040, 9999 none) and type (+0x2044).
 bool haveKeypad=false;int keypadCode=9999,keypadType=0;
 // Schema 4: the shared ending choices, bit 1 roof boss killed (+0x4CD),
 // 2 P345 given to the doctor (+0x4CE), 4 package delivered (+0x4CF).
 int endingFlags=0;
 // Schema 7 (v0.2): the host's music track (player+0x2310, empty: none) and
 // its loop flag (+0x231C), so a load plays what the save heard.
 std::string music;int musicLoop=0;
 // Schema 8 (v0.5): the difficulty this playthrough started with (the
 // "difficulty" cvar, 1..3, 4 nightmare; 0 unknown in older saves) and the setup.
 int difficulty=0;SessionOptions options;
 // Schema 8: the weapon given to the doctor (player+0x5B0 m_iDoctorWeapon, 1 P345, 2 revolver).
 int doctorWeapon=0;
 // Schema 8: the current objective (hints key) and its custom hints file, if any.
 std::string objective,objectiveFile;
};
// The three c_start aliases keep their authored landing markers and their
// exact recorder anchors (419/421); every other RC2/RC4 alias saves anywhere.
bool legacy_checkpoint_map(const std::string& map);
bool checkpoint_map(const std::string& map);
bool checkpoint_identity(const std::string& identity);
bool validate_globals(const GlobalSnapshot& globals);
bool checkpoint_globals_equal(const GlobalSnapshot& a,const GlobalSnapshot& b);
int checkpoint_global(const GlobalSnapshot& globals,const std::string& name);
std::vector<unsigned char> encode_checkpoint(const Checkpoint& value);
bool decode_checkpoint(const std::vector<unsigned char>& bytes,Checkpoint& value);
bool commit_checkpoint(const std::filesystem::path& directory,int slot,const Checkpoint& value);
bool read_checkpoint(const std::filesystem::path& directory,int slot,Checkpoint& value,bool& backup);
}
