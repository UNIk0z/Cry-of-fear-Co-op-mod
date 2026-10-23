#pragma once
#include <array>
#include <cstddef>
#include <cstdint>

namespace rc4 {
struct Edict;

// These callbacks are supplied only after the proxy has verified the original
// DLL hash and ABI. Resolution must check the live edict table before reading a
// candidate pointer; player_memory must use the tracked native allocation size.
struct PuzzleApi {
    bool (*scoped_map)() = nullptr;
    bool (*player_memory)(Edict*, void*&, std::size_t&) = nullptr;
    std::int32_t (*entity_serial)(Edict*) = nullptr; // negative means invalid
    const char* (*classname)(Edict*) = nullptr;
    Edict* (*resolve_handle)(std::uint32_t, std::int32_t) = nullptr;
    bool (*lock_is_solved)(Edict*) = nullptr; // native item_padlock entvars.body != 0 (+0x114)
};

enum class PuzzleDecision { Unrelated, ForwardOwned, Block };

void configure_puzzle(const PuzzleApi& api);
void puzzle_reset();                 // new campaign/server: clear solution too
void puzzle_map_changed();           // ordinary map load: keep session solution
void puzzle_on_player_initialized(Edict* actor, void* data, std::size_t bytes);
void puzzle_on_frame(Edict* actor, void* data, std::size_t bytes);
bool puzzle_has_solution();
std::array<std::int32_t, 4> puzzle_solution();
// Pair these only around original cof_computer DispatchSpawn. Forward the
// original engine RandomLong first, then let the override replace its return
// inside the two proven (1,8) calls BEFORE native accepted strings are built.
// No RNG call is skipped and no computer private field is accessed.
bool puzzle_before_computer_spawn(Edict* entity);
bool puzzle_random_long_override(std::int32_t low, std::int32_t high,
                                 std::int32_t generated, std::int32_t& result);
void puzzle_cancel_computer_spawn();
// Pass the resulting public iuser2/iuser3 after successful original Spawn.
// This validates the two-call context and commits the initial credential pair.
void puzzle_after_computer_spawn(Edict* entity, std::int32_t& usernameIndex,
                                 std::int32_t& passwordIndex);
bool puzzle_has_credentials();
std::array<std::int32_t, 2> puzzle_credentials();
bool puzzle_load_saved(bool haveDigits,std::array<std::int32_t,4> digits,
                       bool haveLogin,std::array<std::int32_t,2> login);

// Invoke before forwarding the ORIGINAL SDK callback, and pair ForwardOwned
// with its matching after hook even if native dispatch throws in a test host.
// Block suppresses only a scoped padlock operation whose ownership is unsafe.
PuzzleDecision puzzle_before_client_command(Edict* actor, const char* command);
void puzzle_after_client_command();
PuzzleDecision puzzle_before_think(Edict* entity);
void puzzle_after_think();

// Returns true only for an exact first-player lookup inside the narrow native
// padlock context. All camera enumeration and unrelated lookups pass through.
bool puzzle_find_override(Edict* start, const char* key, const char* value,
                          Edict*& result);
// Native lock model/camera lives offstage. Route its original sound emission
// once to the validated live actor, only inside the owned Rotate callback.
Edict* puzzle_sound_actor(Edict* lock);
} // namespace rc4
