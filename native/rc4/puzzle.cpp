#include "puzzle.hpp"
#include <algorithm>
#include <cstring>
#include <vector>

namespace rc4 {
namespace {
// Exact original hl.dll SHA256:
// 0036b91c01e92ed205513f52563053a55a66a32d257efb5f476b8f1f3dde0e63.
// The loader verifies that pin before installing any callbacks. The native
// CBasePlayer allocation and field names were independently checked against
// its factory and serialization metadata; this is not a generic HL layout.
constexpr std::size_t kPlayerBytes = 0x281c;
constexpr std::size_t kPadlockHandle = 0x2350;
constexpr std::size_t kPadlockSerial = 0x2354;
constexpr std::size_t kDigits = 0x235c;
PuzzleApi api;
bool haveSolution = false;
std::array<std::int32_t, 4> solution{};
bool haveCredentials = false;
std::array<std::int32_t, 2> credentials{};

struct Owner {
    Edict* lock = nullptr;
    Edict* actor = nullptr;
    std::int32_t lockSerial = -1;
    std::int32_t actorSerial = -1;
    std::uint32_t lockBits = 0;
    bool awaitingFinish = false;
};
std::vector<Owner> owners;
enum class ContextKind { None, Rotate, Cancel, Think };
struct Context { Owner owner; ContextKind kind = ContextKind::None; };
thread_local Context context;
struct ComputerContext {
    Edict* entity = nullptr;
    std::int32_t serial = -1;
    std::size_t calls = 0;
    std::array<std::int32_t, 2> selected{};
    bool valid = false;
};
thread_local ComputerContext computerContext;

bool scoped() { return api.scoped_map && api.scoped_map(); }
bool class_is(Edict* entity, const char* expected) {
    if (!entity || !api.classname) return false;
    const char* actual = api.classname(entity);
    return actual && std::strcmp(actual, expected) == 0;
}
template<class T> T read(const void* data, std::size_t offset) {
    T value{};
    std::memcpy(&value, static_cast<const unsigned char*>(data) + offset, sizeof(value));
    return value;
}
bool player(Edict* actor, void*& data, std::size_t& bytes) {
    if (!api.player_memory || !api.entity_serial || !class_is(actor, "player")) return false;
    return api.entity_serial(actor) >= 0 && api.player_memory(actor, data, bytes) &&
        data && bytes == kPlayerBytes;
}
bool supplied_player(Edict* actor, void* data, std::size_t bytes) {
    void* trusted = nullptr;
    std::size_t trustedBytes = 0;
    return player(actor, trusted, trustedBytes) && data == trusted && bytes == trustedBytes;
}
bool apply_solution(Edict* actor, void* data, std::size_t bytes) {
    if (!scoped() || !supplied_player(actor, data, bytes)) return false;
    std::array<std::int32_t, 4> digits{};
    std::memcpy(digits.data(), static_cast<unsigned char*>(data) + kDigits, sizeof(digits));
    if (!haveSolution) {
        if (!std::all_of(digits.begin(), digits.end(), [](std::int32_t n) { return n >= 1 && n <= 9; }))
            return false; // Native initialization has not generated a full tuple yet.
        solution = digits;
        haveSolution = true;
    }
    std::memcpy(static_cast<unsigned char*>(data) + kDigits, solution.data(), sizeof(solution));
    return true;
}
bool handle(Edict* actor, Owner& result) {
    void* data = nullptr;
    std::size_t bytes = 0;
    if (!player(actor, data, bytes) || !api.resolve_handle || !api.lock_is_solved) return false;
    const auto bits = read<std::uint32_t>(data, kPadlockHandle);
    const auto serial = read<std::int32_t>(data, kPadlockSerial);
    if (!bits || serial < 0) return false;
    Edict* lock = api.resolve_handle(bits, serial);
    if (!lock || !class_is(lock, "item_padlock") || api.entity_serial(lock) != serial) return false;
    result = {lock, actor, serial, api.entity_serial(actor), bits, false};
    return true;
}
bool live_owner(const Owner& owner) {
    void* data = nullptr;
    std::size_t bytes = 0;
    return api.resolve_handle && api.entity_serial && player(owner.actor, data, bytes) &&
        api.entity_serial(owner.actor) == owner.actorSerial &&
        api.resolve_handle(owner.lockBits, owner.lockSerial) == owner.lock &&
        class_is(owner.lock, "item_padlock");
}
bool same_actor(const Owner& left, const Owner& right) {
    return left.actor == right.actor && left.actorSerial == right.actorSerial;
}
bool actor_still_holds(const Owner& owner) {
    Owner active;
    return handle(owner.actor, active) && active.lock == owner.lock && active.lockSerial == owner.lockSerial;
}
std::vector<Owner>::iterator owner_for(Edict* lock) {
    return std::find_if(owners.begin(), owners.end(), [lock](const Owner& o) { return o.lock == lock; });
}
void observe(const Owner& active) {
    auto found = owner_for(active.lock);
    if (found != owners.end() && (!live_owner(*found) || found->lockSerial != active.lockSerial ||
        (!found->awaitingFinish && !actor_still_holds(*found)))) {
        owners.erase(found);
        found = owners.end();
    }
    if (found == owners.end() && !api.lock_is_solved(active.lock)) owners.push_back(active);
}
void clear_context() { context = Context{}; }
} // namespace

void configure_puzzle(const PuzzleApi& value) { api = value; puzzle_reset(); }
void puzzle_reset() {
    haveSolution = false; solution = {};
    haveCredentials = false; credentials = {};
    puzzle_map_changed();
}
void puzzle_map_changed() { owners.clear(); clear_context(); computerContext = {}; }
bool puzzle_has_solution() { return haveSolution; }
std::array<std::int32_t, 4> puzzle_solution() { return solution; }
bool puzzle_has_credentials() { return haveCredentials; }
std::array<std::int32_t, 2> puzzle_credentials() { return credentials; }
bool puzzle_load_saved(bool digitsReady,std::array<std::int32_t,4> digits,
                       bool loginReady,std::array<std::int32_t,2> login) {
    if ((digitsReady&&!std::all_of(digits.begin(),digits.end(),[](int n){return n>=1&&n<=9;}))||
        (loginReady&&!std::all_of(login.begin(),login.end(),[](int n){return n>=1&&n<=8;}))) return false;
    puzzle_map_changed();haveSolution=digitsReady;solution=digits;
    haveCredentials=loginReady;credentials=login;return true;
}
bool puzzle_before_computer_spawn(Edict* entity) {
    if (!scoped() || !api.entity_serial || api.entity_serial(entity) < 0 ||
        !class_is(entity, "cof_computer") || computerContext.entity) return false;
    computerContext = {entity, api.entity_serial(entity), 0, {}, true};
    return true;
}
bool puzzle_random_long_override(std::int32_t low, std::int32_t high,
                                 std::int32_t generated, std::int32_t& result) {
    if (!computerContext.entity || !computerContext.valid || !scoped() ||
        !api.entity_serial || api.entity_serial(computerContext.entity) != computerContext.serial)
        return false;
    // Spawn's original Precache was checked separately: it makes no RNG calls.
    // Any other call shape or a third call invalidates this pinned two-call path.
    if (low != 1 || high != 8 || generated < 1 || generated > 8 || computerContext.calls >= 2) {
        computerContext.valid = false;
        return false;
    }
    const auto index = computerContext.calls++;
    result = haveCredentials ? credentials[index] : generated;
    computerContext.selected[index] = result;
    return true;
}
void puzzle_cancel_computer_spawn() { computerContext = {}; }
void puzzle_after_computer_spawn(Edict* entity, std::int32_t& usernameIndex,
                                 std::int32_t& passwordIndex) {
    const auto spawned = computerContext;
    puzzle_cancel_computer_spawn();
    if (!scoped() || !api.entity_serial || spawned.entity != entity || !spawned.valid ||
        spawned.calls != 2 || api.entity_serial(entity) != spawned.serial ||
        !class_is(entity, "cof_computer") || usernameIndex != spawned.selected[0] ||
        passwordIndex != spawned.selected[1]) return;
    if (!haveCredentials) {
        credentials = {usernameIndex, passwordIndex};
        haveCredentials = true;
    }
}
void puzzle_on_player_initialized(Edict* actor, void* data, std::size_t bytes) {
    apply_solution(actor, data, bytes);
}
void puzzle_on_frame(Edict* actor, void* data, std::size_t bytes) {
    if (!apply_solution(actor, data, bytes)) return;
    Owner active;
    if (handle(actor, active)) observe(active);
}
PuzzleDecision puzzle_before_client_command(Edict* actor, const char* command) {
    if (!scoped()) return PuzzleDecision::Unrelated;
    void* data = nullptr;
    std::size_t bytes = 0;
    if (player(actor, data, bytes)) apply_solution(actor, data, bytes);
    const bool rotate = command && std::strcmp(command, "padlockrotate") == 0;
    const bool cancel = command && std::strcmp(command, "padlockcancel") == 0;
    if (!rotate && !cancel) return PuzzleDecision::Unrelated;
    if (!haveSolution || context.kind != ContextKind::None) return PuzzleDecision::Block;
    Owner active;
    if (!handle(actor, active)) return PuzzleDecision::Block;
    if (cancel) {
        // A second client may have opened the SP panel concurrently. Let that
        // client's original Cancel clear its own UI/control state without
        // stealing the wheel owner or changing a different player's state.
        context = {active, ContextKind::Cancel};
        return PuzzleDecision::ForwardOwned;
    }
    observe(active);
    auto owner = owner_for(active.lock);
    if (owner == owners.end() || !same_actor(*owner, active) || owner->awaitingFinish ||
        api.lock_is_solved(active.lock)) return PuzzleDecision::Block;
    context = {*owner, ContextKind::Rotate};
    return PuzzleDecision::ForwardOwned;
}
void puzzle_after_client_command() {
    if (context.kind == ContextKind::Rotate) {
        auto owner = owner_for(context.owner.lock);
        if (owner != owners.end() && live_owner(*owner) && api.lock_is_solved(owner->lock))
            owner->awaitingFinish = true; // Native Check cleared the actor handle; keep cleanup ownership.
    } else if (context.kind == ContextKind::Cancel) {
        auto owner = owner_for(context.owner.lock);
        if (owner != owners.end() && same_actor(*owner, context.owner) && !owner->awaitingFinish)
            owners.erase(owner);
    }
    clear_context();
}
PuzzleDecision puzzle_before_think(Edict* entity) {
    if (!scoped() || !class_is(entity, "item_padlock") || !api.lock_is_solved ||
        !api.lock_is_solved(entity)) return PuzzleDecision::Unrelated;
    auto owner = owner_for(entity);
    if (context.kind != ContextKind::None || owner == owners.end() || !owner->awaitingFinish ||
        !live_owner(*owner)) return PuzzleDecision::Block;
    context = {*owner, ContextKind::Think};
    return PuzzleDecision::ForwardOwned;
}
void puzzle_after_think() {
    if (context.kind == ContextKind::Think) {
        auto owner = owner_for(context.owner.lock);
        if (owner != owners.end() && same_actor(*owner, context.owner)) owners.erase(owner);
    }
    clear_context();
}
bool puzzle_find_override(Edict* start, const char* key, const char* value, Edict*& result) {
    if (start || !key || !value || std::strcmp(key, "classname") != 0 ||
        std::strcmp(value, "player") != 0 || !scoped() ||
        context.kind == ContextKind::None || !live_owner(context.owner)) return false;
    result = context.owner.actor;
    return true;
}
Edict* puzzle_sound_actor(Edict* lock) {
    if (!scoped() || context.kind != ContextKind::Rotate ||
        context.owner.lock != lock || !live_owner(context.owner)) return nullptr;
    return context.owner.actor;
}
} // namespace rc4

#ifdef RC4_PUZZLE_TEST
#include <cassert>
#include <cstdio>
namespace rc4 {
struct Edict {
    std::uint32_t id;
    std::int32_t serial;
    const char* kind;
    std::array<unsigned char, 0x281c> memory{};
    std::size_t bytes = 0x281c;
    bool solved = false;
    bool alive = true;
};
static Edict testP1{1, 10, "player"}, testP2{2, 20, "player"}, testP3{3, 30, "player"},
    testP4{4, 40, "player"}, testLock{5, 50, "item_padlock"}, testComputer{6, 60, "cof_computer"};
static std::array<Edict*, 6> testEntities{&testP1, &testP2, &testP3, &testP4, &testLock, &testComputer};
static bool testScope = true;
static bool test_scoped() { return testScope; }
static bool test_memory(Edict* e, void*& p, std::size_t& bytes) {
    if (!e || !e->alive || std::strcmp(e->kind, "player")) return false;
    p = e->memory.data(); bytes = e->bytes; return true;
}
static std::int32_t test_serial(Edict* e) { return e && e->alive ? e->serial : -1; }
static const char* test_classname(Edict* e) { return e && e->alive ? e->kind : ""; }
static Edict* test_resolve(std::uint32_t bits, std::int32_t serial) {
    for (Edict* e : testEntities) if (e->alive && e->id == bits && e->serial == serial) return e;
    return nullptr;
}
static bool test_solved(Edict* e) { return e->solved; }
static void test_digits(Edict& e, std::array<std::int32_t, 4> digits) {
    std::memcpy(e.memory.data() + 0x235c, digits.data(), sizeof(digits));
}
static void test_handle(Edict& actor, Edict* lock) {
    std::uint32_t bits = lock ? lock->id : 0;
    std::int32_t serial = lock ? lock->serial : 0;
    std::memcpy(actor.memory.data() + 0x2350, &bits, 4);
    std::memcpy(actor.memory.data() + 0x2354, &serial, 4);
}
static void test_frame(Edict& e) { puzzle_on_frame(&e, e.memory.data(), e.bytes); }
static void test_initialize(Edict& e) { puzzle_on_player_initialized(&e, e.memory.data(), e.bytes); }
static bool test_matches(Edict& e, const std::array<std::int32_t, 4>& digits) {
    return !std::memcmp(e.memory.data() + 0x235c, digits.data(), sizeof(digits));
}
} // namespace rc4
int main() {
    using namespace rc4;
    configure_puzzle({test_scoped, test_memory, test_serial, test_classname, test_resolve, test_solved});
    std::int32_t usernameIndex = 0, passwordIndex = 0;
    puzzle_after_computer_spawn(&testComputer, usernameIndex, passwordIndex);
    assert(!puzzle_has_credentials());
    assert(puzzle_before_computer_spawn(&testComputer));
    assert(puzzle_random_long_override(1, 8, 3, usernameIndex));
    assert(puzzle_random_long_override(1, 8, 7, passwordIndex));
    puzzle_after_computer_spawn(&testComputer, usernameIndex, passwordIndex);
    assert(puzzle_has_credentials() && puzzle_credentials() == (std::array<std::int32_t, 2>{3, 7}));
    puzzle_map_changed(); usernameIndex = 8; passwordIndex = 1;
    assert(puzzle_before_computer_spawn(&testComputer));
    assert(puzzle_random_long_override(1, 8, 8, usernameIndex));
    assert(puzzle_random_long_override(1, 8, 1, passwordIndex));
    puzzle_after_computer_spawn(&testComputer, usernameIndex, passwordIndex);
    assert(usernameIndex == 3 && passwordIndex == 7);
    assert(!puzzle_random_long_override(1, 8, 8, usernameIndex));
    assert(puzzle_before_computer_spawn(&testComputer));
    assert(!puzzle_random_long_override(0, 8, 8, usernameIndex));
    assert(!puzzle_random_long_override(1, 8, 8, usernameIndex));
    puzzle_cancel_computer_spawn();
    assert(puzzle_before_computer_spawn(&testComputer));
    testComputer.serial++;
    assert(!puzzle_random_long_override(1, 8, 8, usernameIndex));
    puzzle_cancel_computer_spawn();
    test_initialize(testP1); assert(!puzzle_has_solution());
    test_digits(testP1, {2, 4, 7, 9}); test_initialize(testP1);
    const std::array<std::int32_t, 4> canonical{2, 4, 7, 9};
    assert(puzzle_has_solution() && puzzle_solution() == canonical);
    for (Edict* e : {&testP2, &testP3, &testP4}) {
        test_digits(*e, {1, 1, 1, 1}); test_initialize(*e); assert(test_matches(*e, canonical));
    }
    puzzle_map_changed(); assert(puzzle_solution() == canonical);
    test_digits(testP2, {8, 8, 8, 8}); testP2.bytes = 0x236c; test_initialize(testP2);
    assert(!test_matches(testP2, canonical)); testP2.bytes = 0x281c;
    testScope = false; test_initialize(testP2); assert(!test_matches(testP2, canonical));
    testScope = true; test_initialize(testP2); assert(test_matches(testP2, canonical));
    Edict* result = &testP1;
    assert(!puzzle_find_override(nullptr, "classname", "player", result));
    assert(puzzle_before_client_command(&testP2, "camera") == PuzzleDecision::Unrelated);
    assert(!puzzle_find_override(nullptr, "classname", "player", result));
    test_handle(testP2, &testLock); test_frame(testP2);
    assert(puzzle_before_client_command(&testP2, "padlockrotate") == PuzzleDecision::ForwardOwned);
    assert(puzzle_sound_actor(&testLock) == &testP2);
    assert(puzzle_find_override(nullptr, "classname", "player", result) && result == &testP2);
    assert(!puzzle_find_override(&testP1, "classname", "player", result));
    assert(!puzzle_find_override(nullptr, "targetname", "player", result));
    assert(!puzzle_find_override(nullptr, "classname", "monster", result));
    assert(puzzle_before_client_command(&testP1, "padlockcancel") == PuzzleDecision::Block);
    testLock.solved = true; test_handle(testP2, nullptr); puzzle_after_client_command();
    assert(!puzzle_sound_actor(&testLock));
    assert(!puzzle_find_override(nullptr, "classname", "player", result));
    assert(puzzle_before_think(&testLock) == PuzzleDecision::ForwardOwned);
    assert(puzzle_find_override(nullptr, "classname", "player", result) && result == &testP2);
    puzzle_after_think(); assert(!puzzle_find_override(nullptr, "classname", "player", result));
    assert(puzzle_before_think(&testLock) == PuzzleDecision::Block);
    puzzle_map_changed(); testLock.solved = false;
    assert(puzzle_before_think(&testLock) == PuzzleDecision::Unrelated);
    test_handle(testP1, &testLock); test_handle(testP2, &testLock); test_frame(testP1); test_frame(testP2);
    assert(puzzle_before_client_command(&testP2, "padlockrotate") == PuzzleDecision::Block);
    assert(puzzle_before_client_command(&testP2, "padlockcancel") == PuzzleDecision::ForwardOwned);
    assert(puzzle_find_override(nullptr, "classname", "player", result) && result == &testP2);
    test_handle(testP2, nullptr); puzzle_after_client_command();
    assert(puzzle_before_client_command(&testP1, "padlockrotate") == PuzzleDecision::ForwardOwned);
    testLock.serial++; // Deleted/reused native edict must invalidate the context.
    assert(!puzzle_sound_actor(&testLock));
    assert(!puzzle_find_override(nullptr, "classname", "player", result));
    puzzle_after_client_command();
    assert(puzzle_before_client_command(&testP1, "padlockrotate") == PuzzleDecision::Block);
    puzzle_reset(); assert(!puzzle_has_solution() && !puzzle_has_credentials());
    std::puts("RC4 puzzle fixtures passed: canonical digits/credentials, four players, map retention, allocation bounds, P2 cleanup scope, ownership and stale serials.");
    return 0;
}
#endif
