# RC4 experimental session-state adapter

RC3 build007 is the gameplay regression reference. The user observed two actual
Steam/Sandboxie clients participate in readiness, opening scenes, camera nightmare
gameplay and the automatic following-map transition. Other combinations, late
joins, every visual effect and four-player play remain unverified. Its original
three aliases and the immutable RC2 package are retained byte-for-byte.

RC4 adds a separate, user-authorized x86 server component and five new aliases.
It has NOT been loaded in the actual game or gameplay verified. First establish
the SDK bootstrap in TESTING.md, then test the exact cafe round trip.

## Native interfaces and root causes

The installed-version engine accepts -dll and API140 (50 game callbacks,144
engine callbacks). Installed CoF SDK is a content SDK. A separate MSVC component
uses this interface and forwards all846 original exports/ordinals, native
callbacks and function/name lookups. The original cl_dlls/hl.dll must match
SHA2560036b91c01e92ed205513f52563053a55a66a32d257efb5f476b8f1f3dde0e63.
The component performs no code patches, detours, authentication changes or
private function calls. It invokes exported SDK interfaces and engine callbacks;
its export stubs preserve the original calling conventions. Original hl.dll,
hw.dll, liblist.gam, Steam/Sandboxie and original maps remain unchanged.

The unofficial Xash recreation at github.com/milo-src/cry-of-fear-src was
previously reviewed/pinned; no compatible Steam replacement was established.
It was not rebuilt or used as the original DLL's implementation evidence.
Our narrow ABI declarations use the installed-version evidence and Valve's
public interface (https://github.com/ValveSoftware/halflife/blob/master/engine/eiface.h).

Native cof_changelevel and inter_door_coop_changelevel already snapshot weapons,
loaded/reserve ammunition, syringe weapons, equipped classname, health and
stamina for connected players. RC4 reuses these paths unchanged. Journal records
and player padlock digits are omitted from that snapshot. Ordinary player names
must remain stable: native matching uses the netname string pointer, not SteamID.
Generic keys/items, reconnect identity, weapon mode and arbitrary player
attributes are not fully captured. The verified raw nightmare->wake handoff
remains the intentional initial exception.

## What changed

- One native-generated digit tuple becomes the host's session solution. Each
  initialized participant receives that tuple before input. The computer's actual
  clue and native wheel validation read those same fields; this is not a static
  code. The two computer login choices also persist: a scoped RNG wrapper supplies
  the original selections before native Spawn builds its credential strings.
- Scoped padlock rotate/cancel/finished callbacks retain the actual owner. Only
  their exact first-player lookup is redirected to that actor. Camera player
  enumeration and other commands pass through. Native HUD/control/view cleanup
  runs unchanged. Both players should use the lock sequentially in this prototype:
  simultaneous native Use may still open/reset its shared wheels.
- The host retains original journal records (16 slots,288 bytes each). Stable
  narrative IDs are original note1 resources. Native AddNote packets provide
  special-code type/value metadata, which is retained separately; different code
  types are not inferred from the shared sentinel nerds. After native player/HUD
  initialization, the server journal is reconstructed and client AddNote packets
  rebuild the list, one record per recipient per0.1s. Readers are not reopened and
  the separate native pickup/archive notification is not replayed.
- No current-document or padlock entity pointers persist across BSPs. Live edict
  serials, engine pointer round-trips and tracked exact0x281C player allocation
  sizes guard private-data access. Conflicting content and capacity overflow are
  rejected/logged. Native16-slot capacity remains a limitation.
- env_global/multisource records use original-story IDs, independent of arrival
  aliases. The blacker163/trigger164/multiblack165/killblack166 chain records
  completion at the authored2s removal; re-entry removes figure and trigger.
  The separate static figure170 is untouched. The wake scene records completion
  after47s and suppresses repeated camera stripping/phone/knife grants and visual
  resets. Its first two-client join barrier is preserved.
- Padlock success records one solved flag and restores the original visible
  ground lock, hidden hanging lock, removed button and unlocked door on re-entry.
  Native lockedby initializes the lock state; spawnflag4 was investigated and
  rejected because it disables the door instead of locking it. Cafe completion
  and door enable/life states persist; the old per-load cafe reset is retired.

Aliases: cof_campaign_story4 -> s4_nightmare -> s4_start -> s4_start2 ->
s4_start_e0. Other destinations remain the existing RC2 routes. Narrative journal
and puzzle tuple adapters continue on s2_ story aliases; event restoration is
implemented only for the two authored corridor maps, not every campaign event.
All original geometry, collision, lighting and model records are preserved.

## Verification and limits

Build010 compiles with MSVC x86 /W4 /WX and linker /WX. Every original846 export
name/ordinal and each843 forwarding stub are checked. Four owned native fixture
suites pass: journal/dedup/bounds, four-player puzzle and owner contexts, mock
engine callback/session/message behavior, and actual own-DLL bootstrap refusing
a missing backend. No proprietary game DLL was loaded in those fixtures.
Five-map structural and guarded installer verification are recorded in the final
QA/handoff. These checks do not establish actual engine lifetime, first-HUD timing,
reader rendering, P2 wheel completion, inventory or scare behavior in gameplay.

Only session persistence is implemented. No disk/checkpoint saving, full-world
serialization, seamless reconnect, simultaneous padlock ownership, four-player
runtime pass or complete campaign compatibility is claimed. Later RC2 unresolved
doors/arrivals remain. The small intro pause is unchanged to preserve the tested
timeline. Installation/rollback adds/removes only exact new aliases and our DLL.
