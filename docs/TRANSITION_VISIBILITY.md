# Current relevance — 2026-10-10

V6/V8 selected49/50 relocation/presentation remains VERIFIED BY USER. Latest
post-padlock unlocked scripted door reintroduces original SP visibility/teleport
failure (progression blocker); exact alias/entity unknown. Investigate coverage/
enable chain using STORY_DOOR_CONVERTER/conditional-story-doors, not another model
or rendering workaround. Historical failed V3 model initialization, V4/V5 Use
experiments, V2 bypass and successful omitted-message V6 evidence below are retained.

---

# Same-map door visibility — activation probe v5

## Latest: v8 presentation user-verified; debug-free production derivative ready

User confirms full fade/audio/independent E/both directions/mutual models on49/50,
no reconnect. Preserve that mechanism; no further visibility-root-cause study.
Conservative production c_start2_coop_full matches it without2probes. Only ordinary
49/50 converted; café204/206 named/disabled/remove hooks retained for manual review.
See C_START2_CONVERSION_REPORT and per-door matrix; full-map runtime not verified.

## Latest: v6 core VERIFIED BY USER; preserve it for presentation tests

User tested759c141 c_start2_useselect: each actor independently presses E and
relocates, both directions pass and mutual models remain visible. Omitted
message configuration now has successful runtime evidence. The binary reason
empty vs absent fails remains unmeasured; do not reintroduce the failing key.
No original inter_door runs on this pair. Fade/audio still unverified.

Two presentation aliases preserve point helper/destination pairs: audio retains
direct dispatch; fade adds SDK-threaded multi_manager and activator-only
env_fade4/5 before/after that same point teleport. No player entity render flags,
model index or networking fields change. Delayed activator retention supported
by reference code must pass Steam tests. See DOOR_PRESENTATION.md and
DOOR_PRESENTATION_TEST.md for sequence, shared cooldown and positional audio limits.

## Latest: Use49 dispatch confirmed; native selector omission test v6

User reports marker plus cue for E from BOTH actors, neither moves. Input/button
dispatch now confirmed on that route. It does not measure the cof_teleport
callback directly. Reverse50 unreported; no transition means no visibility pass.

Exact native records (work/point-selector-comparison-001.json) show all3
player-style cof_teleport references OMIT message; v4/v5 helpers explicitly
write message empty. Native cof_suicide4 485(trigger_multiple)->486(cof_teleport)
->484(info_teleport_destination) is complete. Forest targets unresolved; native
campaign758 message theboss selects a named monster. None proves Use/activator
multiplayer success. SDK line5347 blank-player wording permits this experiment.
[Valve util.h](https://github.com/ValveSoftware/halflife/blob/master/dlls/util.h)
defines FStringNull using handle0, rather than comparing string contents.
We have NOT verified empty allocation or this check in Steam CoF. Root cause
remains a hypothesis. Community recreation ignores message and is insufficient.

V6 c_start2_useselect removes ONLY two empty message keys, preserving working
button/HUD/cue configuration, original destinations, geometry and all other
v5 records. Engineering PASS; Steam gameplay pending in USE_SELECTOR_TEST.
If marker still appears without movement for both, stop this field experiment.
V2 touch bypass stays the sole verified outward relocation/visibility baseline.

## Latest: v4 has no observed E action

User reports P1 and P2 both press E, neither relocates, panel blocks passage;
no console error reported. Actual status/hash not supplied. This does not prove
point-teleporter failure: the button may never dispatch. Nor does it establish
collision as root cause. Original computer button245 has flags1; our v4 added
flag16 DirectUseOnly. Representative world point samples before both panels
are empty, but exclude dynamic entities/actual engine traces.

V5 c_start2_useprobe removes flag16 only as a functional change. Diagnostic
button sound3 and two game_text markers (all-player flag1) are added. Each
teleporter targetname intentionally also names one marker: normal target fan-out.
Same point teleporters/destinations/solids/wait1 as v4. Green USE49 ACTIVATED or
USE50 ACTIVATED establishes marker target dispatch; it doesn't prove teleport
success/actor selection. Absence alone cannot rule out disabled/missing feedback.
No cosmetic door fades or model/spawn changes, code rewrite or blind collider edit.

Engineering/installer/preservation checks PASS; gameplay pending. Exact
procedure USE_PROBE_TEST: correct alias/hash first, P2 Use with host waiting,
marker/cue/mover/block; one host attempt if no relocation. If correct actor moves,
full two-way/outward/return/control/collision/inventory/reset gate still required.
Probe hash79c096cc82cf6d7f12f25189904a84cd3de26b3f4ceb5b833ba0821bf165c9b4.

## Latest actual result and changed engineering direction

User tested v3 c_start2_doornative: FAILED model visibility after original Use
crossing. Model declarations alone are insufficient. User also corrected the
native comparison: personally observed campaign doors load separate BSPs. No
verified same-map native equivalent exists in our gameplay evidence. Earlier
asylum entity matches remain static only. Original control fails; outward touch
bypass passes; reverse remains pending. No more spawn/model variants.

V4 c_start2_dooruse changes selected pair to func_button (flags17=Don'tMove +
DirectUseOnly, wait1, no touch/toggle) -> cof_teleport named helper -> original
info_teleport_destination. SDK lines1846+,5347+,2550 support those interfaces;
installed hl.dll exports all three. Native cof_suicide4 chain485 trigger_multiple
->486 cof_teleport teleloll (message blank) ->484 destination exists; previously
saved activation report reused. This confirms native point-teleport usage, NOT
the exact multiplayer selector or successful Use-triggered behavior.

Original trigger_teleport bypass's only VERIFIED activation is Touch. Wiring
Use blindly to it is not evidence it will immediately teleport the activator.
A shared enabled touch window risks moving a nearby waiting player. V4 therefore
uses the SDK's point relocation interface directly, with blank message as defined
for players. It reuses the successful bypass's destination convention, but DOES
NOT call its exact verified Touch handler. Per-activator selection/hull adjustment,
button reach/reset and visibility are explicit runtime gates, not asserted facts.
No `!activator`, new class, model reset or networking code invented.

All14 other lumps/439 unrelated original entities remain byte-identical;
four original records modified and two point helpers added. Selected pair is
unlocked and not externally named/gated. Only those conditions are accepted by
this builder. Other locked/scripted story doors unchanged. Sounds/music fades
on selected pair omitted intentionally; no cosmetic restoration before core pass.
Original compiled brush panels reused as buttons; their solidity/reach can affect
runtime use, so both walking without E and close-by waiting are acceptance checks.

### Community code research (pinned; not installed game implementation)

Read [repository README](https://github.com/milo-src/cry-of-fear-src/blob/2971dbbd0059eedfc8ef9cb9c9fb149bb84b36a3/README.md),
[server triggers](https://github.com/milo-src/cry-of-fear-src/blob/2971dbbd0059eedfc8ef9cb9c9fb149bb84b36a3/src/cof/dlls/triggers.cpp),
[client entity transmission](https://github.com/milo-src/cry-of-fear-src/blob/2971dbbd0059eedfc8ef9cb9c9fb149bb84b36a3/src/cof/dlls/client.cpp),
[server CMake](https://github.com/milo-src/cry-of-fear-src/blob/2971dbbd0059eedfc8ef9cb9c9fb149bb84b36a3/src/cof/dlls/CMakeLists.txt),
and [license](https://github.com/milo-src/cry-of-fear-src/blob/2971dbbd0059eedfc8ef9cb9c9fb149bb84b36a3/src/cof/LICENSE).
Local targeted copies/tree/checks: work/source-research-004/. No full clone.

Confirmed: this unofficial Xash3D recreation has server-side inter_door Use,
access checks, deferred per-player fade and relocation, trigger teleport handlers,
point cof_teleport and client SetupVisibility/AddToFullPack code. Its point
teleporter selects pActivator or falls back to player1; shared relocation adjusts
feet/hull, clears velocity/ground and sets view. This informs candidate testing,
not Steam semantics. It ignores cof_teleport message's named-entity selector,
where native part4 targets a named boss: a concrete compatibility difference.
Its door implementation does not establish the installed visibility defect.
Client code excludes EF_NODRAW, missing models and out-of-PVS entities; these
are possible filters, not measurements of our failed players. No source root
cause inferred from those familiar operations.

Build structure exists: complete tree metadata, 124 explicitly listed server
files present, scripts/build-game.ps1 plus vendored engine/HLSDK/openvgui dirs.
README describes VS/CMake/Python builds for Xash with its own client/server
DLLs. No compilation was run; presence does not prove full buildability or game
feature completeness. It is not a verified Steam 1.6 source tree or drop-in DLL;
deploying it would change the runtime whose working native multiplayer we preserve.
Thus no supported Steam game-code fallback is established. If map-level routes
fail, first obtain a supported Steam-compatible extension/source route; do not
overwrite installed DLLs or claim runtime registration of a new class exists.

src/cof/LICENSE is the Valve HL1 SDK license: free-only SDK/mod distribution,
retained license/copyright/disclaimer obligations; commercial use requires Valve
permission. This is not a rights/provenance certification for every added CoF
file or permission to redistribute proprietary game assets/DLLs. Other vendored
components need their own terms checked before a distribution. Public source
was read for research; no implementation copied, built, installed or redistributed.
Ghidra was unnecessary for this map experiment and was not run; no proprietary
function reverse-engineering or binary modification performed.

Exact new test/deployment/rollback: USE_DOOR_TEST. P2 first with host stationary
discriminates activator-aware vs host-only/group behavior; then host independently,
co-located both-view models/control/inventory/collision, reverse/repetition and
no extra reset teleport. SHA ff183cf19f9dffc210803d572a0083facca7f74897f2d0c064e76e7cd290355a.
Static/installer checks PASS; Steam gameplay remains PENDING. No global converter.

## Earlier native survey and v3 initialization candidate (now failed)

Fifty shipped native-named BSPs (`c_cof_*`, `cof_*`) were inspected using only
their entity lumps. Complete ordered door configs plus direct named target
matches: `work/native-door-catalog-001.json`. Counts: 264 `inter_door`, 41
`inter_door_coop_changelevel`, 6 `inter_door_exit`, 3 teleport destinations,
4 `cof_teleport`, 16 spawn controllers. No point `inter_door_coop` and no
`trigger_teleport` occur in this set. This corrects the limited earlier survey;
it does not cover every possible game map or establish actual runtime behavior.

User remembers native `cof_campaign_01` and subsequent parts. Their proper
native gates use `inter_door_coop_changelevel` -> `trigger_coop_changelevel`,
with the next BSP in `message`, door audio in `noise` and cooperative gathering
behavior. E.g. part3 gates 59/60 name `c_cof_trainride`; part4 gates 616/617
name `c_cof_park`. Copying those would introduce a map change, not preserve this
same-map route. Their ordinary doors alone do not establish active relocation.

Matching same-map pairs DO exist in `c_cof_asylum1day`. Below are COMPLETE pairs
for one comparable native route (zero-based BSP indices; missing flags/keys
really are absent). No explicit relay is targeted between door and exit.

```text
// Entity 9
{
"model" "*9"
"musicfadeout" "2"
"musicfadein" "2"
"unlockedsnd" "buttons/latchunlocked1.wav"
"lockedsnd" "buttons/latchlocked2.wav"
"lockedmsg" "The door is locked. The plate above the door reads 'Staff Quarters'"
"closesound" "doors/doorstop8.wav"
"opensound" "doors/doormove11.wav"
"renderamt" "255"
"rendermode" "4"
"target" "staffquarters_b2"
"rendercolor" "0 0 0"
"classname" "inter_door"
}
// Entity 11
{
"origin" "781 665 145"
"targetname" "staffquarters_b2"
"angles" "0 0 0"
"classname" "inter_door_exit"
}
// Entity 12
{
"model" "*10"
"musicfadeout" "2"
"musicfadein" "2"
"closesound" "doors/doorstop8.wav"
"opensound" "doors/doormove11.wav"
"renderamt" "255"
"rendermode" "4"
"target" "staffquarters_a2"
"rendercolor" "0 0 0"
"classname" "inter_door"
}
// Entity 10
{
"origin" "729 667 144"
"targetname" "staffquarters_a2"
"angles" "0 180 0"
"classname" "inter_door_exit"
}
```

These match the story pair's CLASS, destination-target convention, brush form,
render values, closing sound and music fades. Different opening sound and
positions are presentation/layout. Neither native door above has `lockedby` or
`spawnflags`; a locked-message string alone is not an explicit lock condition.
Original story doors add `doortype=0` and latch/message fields; 103 native doors
also have `doortype=0`, 161 omit it. No alternative nonzero type was found.
SDK omits that key and no NUL string `doortype` was found in inspected hl.dll;
this is not proof it is ignored by every module. Removing it is not a justified
different-function experiment. The exact asylum pair's Use/visibility behavior
still needs a real observation; the user's remembered campaign is not that proof.

Asylum1day also has native `cof_coop_spawn1..4` (362..365), but no explicit
worldspawn player model fields. `c_cof_asylum1` and `cof_campaign_01_p4` DO
declare `player1=police1` through `player4=police4`. SDK worldspawn identifies
these as per-slot co-op model names. Original c_start2 lacks those declarations.
Other native player relocations use `cof_teleport` with blank `message` plus
target destination, or spawn-controller group teleports driven by managers.
None establishes an independent Use-door equivalent with this route's effects.
The part4 boss teleport is for a named monster, not a player reference.

| Mechanism | Activation / route | Visibility evidence |
|---|---|---|
| User's native campaign | Native E gates; precise same-map door unidentified | Native co-op works by user report |
| Native asylum pair | inter_door -> inter_door_exit, same BSP | Entity-data evidence only; runtime pending |
| c_start2_doorctrl | Original E door -> original exit | User: fails two-way models after crossing |
| c_start2_doorbypass | Touch trigger_teleport -> info_teleport_destination | User: outward relocation and two-way models pass; reverse pending |
| c_start2_doornative | Original E door/exit plus native worldspawn model declarations | New hypothesis; runtime pending |

V3 is ONE controlled native initialization change, not a class replacement or
custom door. It adds four slot declarations ONLY to entity 0; all original
door/exit/spawn records, target references, locks, sounds, fades and positions
remain byte-for-byte unchanged. Standard police1..4 assets are present in the
actual Steam installation. Some native maps omit declarations: they are not
proven necessary or sufficient. No model restoration function or alternate
multiplayer execution path has been identified. No player networking rewrite.

Installed hl.dll exports establish class entry points, not function behavior.
No function disassembly was performed. Ghidra's configured runtime is missing
in the scoped conventional JDK checks (minimum JDK21); no executable attempt or
runtime installation was made. Unofficial Xash recreation is not authoritative
for Steam code. This does not block the small manual map experiment.

Build/PS equality and all BSP preservation checks pass; full BSP hash
`fd4979bbb018c1b3f9a4f0d1ce06fd0cc05ce1ff8b9ffb84e291c07943b3049c`.
See NATIVE_DOOR_TEST for exact paths, guarded installation, E outward/return
checks in both windows, failure reporting and rollback. No runtime pass claimed.
If v3 fails, declarations alone are insufficient for this route; next isolate
SDK-supported Use activation of the known-working relocation or targeted code
inspection. Only a real Use + two-way visibility + return pass permits expansion.

## Latest runtime evidence (user-tested)

Both c_start2_doorctrl and c_start2_doorbypass LOADED in real Steam + Sandboxie
clients. Control Use-door visibility FAILED. Bypass outward touch relocation and
two-way visibility PASSED by user's observation of both windows. User reports a
screenshot; none is attached here for Codex inspection. Return crossing is NOT
TESTED. Native Use-door transitions also work by user report; remembered maps
are cof_campaign_01 and its parts. Broad survey above supersedes the earlier
three-map coverage. v2 implementation/runtime caveats below are historical
where superseded; root hiding/model/camera/replication operation remains unknown.

## Real user evidence (Steam + Sandboxie Plus, one Windows PC)

The user's two-client environment WORKS. Preserve the existing Sandboxie setup;
no second physical PC is required. Native co-op baseline passes connection,
spawn, two-way character visibility, independent movement and synchronization.
Original c_start2 loads in that native session; both players move and interact.
The previous c_start2_cooptest spawn experiment was NOT used in the reported run.

User-observed visibility matrix:

| Stage | P1 sees P2 | P2 sees P1 |
|---|---|---|
| Before story relocation | Yes | Yes |
| After story relocation | No | No |
| P2 disconnects/rejoins existing host | Yes | No |

Door use and relocation succeeded for both players; connection, control and
collision persisted. User clarification: any door connecting sections WITHOUT
a map change causes it. Exact map names/door IDs were not recorded. Treat this
as a real reproduction report, not Codex-observed results or an exact per-door
coverage pass. The user described the original BSP and later referred to the
previously supplied command; the actual loaded filename/hash wasn't captured.
The new hash-verified control removes this ambiguity without crediting the old
spawn experiment with a gameplay result. One earlier loading crash/unknown(1)
overflowed disappeared after
restart; its relationship to this reproducible issue is UNKNOWN.

Rejoin restoring the newly joined player as a visible TARGET, while the existing
host stays invisible even to the newly joined observer, favors investigating
persistent per-player state/initialization or server filtering. It weakens a
simple explanation confined to the old remote client's stale render cache. It
does NOT establish EF_NODRAW, modelindex=0, a new edict, failed AddToFullPack,
SetupVisibility, PVS/view-origin mismatch, or the precise restoration mechanism.
No live player flags/model indices or network entity states have been measured.

## Actual activation chains (zero-based BSP indices)

| Door | Model / trigger bounds | Target exit | Stored feet origin / yaw | Follow-on chain |
|---|---|---|---|---|
| 49 | *6; 3632 -1279 -896 to 3680 -1278 -803 | 51: d1_1_exit1 | 1040 -1711 -896 / 270 | No explicitly targeted relay/teleport/changelevel |
| 50 | *7; 1015 -1690 -896 to 1063 -1689 -803 | 48: d1_1_exit2 | 3655 -1257 -896 / 90 | No explicitly targeted relay/teleport/changelevel |
| 204 | *14; 1008 1961 -591 to 1009 2010 -503 | 205: s1_1_exit1 | 1064 1987 -591 / 0 | cafedoors can be removed by relay 345 killcafedoors |
| 206 | *15; 1031 1961 -591 to 1032 2010 -503 | 203: s1_1_exit2 | 972 1986 -599 / 180 | Initially disabled (flag 4); trigger_once 413 -> inter_door_disable 414 cafedoors2en enables it; relay 412 can remove it |

Each selected door is inter_door and its destination is inter_door_exit. There
is no trigger_teleport or cof_teleport in these original same-map chains. Moving
the player, fade/sound and participant selection happen inside the door entity's
compiled implementation. No map-level render/customize relay appears in these
explicit door-to-exit chains. Triggering-player versus all-player behavior
remains unmeasured.

The distinct return-to-c_start route remains door 19 (*5) -> exit 16 lolexit2 ->
touch region 15 (*3) -> haehecl changelevel 17 (*4), landmark hahaland 18.
This route is NOT the clarified same-map reproduction and is NOT changed.

## Native reference comparison

- c_cof_village2 257/258 and c_cof_city 377/378 use a brush
  inter_door_coop_changelevel targeting a brush trigger_coop_changelevel and
  naming the next BSP. These are cross-map gates, not drop-in same-map repairs.
- Bridge 174 -> multitrain, with cooperative gate 173 and cof_changelevel 210,
  is a separate native progression mechanism; copying it would alter this route.
- Ordinary inter_door classes remain in these native references, but none has
  an inter_door_exit, and the remaining nonempty ordinary door targets have no
  matching named entity in those three BSPs. Their mere presence is NOT proof
  that active original-style same-map relocation works in native co-op.
- SDK lines 4364+ describe inter_door_coop as a POINT entity with a studio model.
  The specified models/coop/door_coop.mdl is absent from the complete inspected
  runtime snapshot. Do not blindly attach original brush *6/*7 to that point
  class, import unrelated models, or call that an implemented native solution.
- SDK lines 4122+ and 2550 define brush trigger_teleport and point
  info_teleport_destination. Default TriggerCond flags allow clients (No Clients
  is flag 2). The inspected game hl.dll exports both, plus inter_door/co-op and
  model/spawn controllers. Export presence establishes entry points, not bodies
  or correct runtime behavior. Only export names were read; no disassembly.
- Inspected native campaign entry/parts/manhunt contain no trigger_teleport,
  inter_door_coop, cof_spawnpointonoff or cof_customiseplayer entities. Part 4
  has info_teleport_destination sawtelele, which alone does not prove player
  teleport behavior. We have no observed working same-map native equivalent yet.

## Implemented controlled bypass

Candidate map **c_start2_doorbypass** changes ONLY four classname values:
48/51 -> info_teleport_destination; 49/50 -> trigger_teleport. Reuses the SAME
two brush volumes, destination targetnames, feet positions and angles. No
initial co-op spawns/model changes are mixed into this test. The unchanged
byte-identical **c_start2_doorctrl** controls for the alias name.

The alternative is justified by the local SDK's matching brush/point interfaces,
the installed DLL entry points, and the suspected original door path. It is
not represented as an already working native co-op map pattern. Published
[Valve HLSDK TeleportTouch](https://github.com/ValveSoftware/halflife/blob/master/dlls/triggers.cpp)
relocates the touching player, applies its hull offset to the destination's feet
origin, sets view angles/velocity and does not set player hiding/model flags.
That is comparative reference behavior; CoF's modified implementation can differ.
No reference code was compiled, injected or copied into the game.

Standing center samples at destination feet+36 (+1 sample Z) are empty in hull 1
with floor support 2 units below. Conventional +/-16 XY boxes do not overlap
the corresponding return door planes (at least 5.5 units clear). These are static
checks, not dynamic collision/spawn/teleport proofs. Do NOT add 36 to the stored
origins; a standard teleport already does the hull adjustment at runtime.

Intentional diagnostic difference: walk into those two door panels instead of
Use; their special opening/closing sound/fade and Use behavior are bypassed.
Legacy door keyvalues remain byte-identical and may be ignored by the new class;
capture any unknown-key errors. The cafe doors/story gates remain original.
This can test relocation visibility, but cannot satisfy the complete acceptance
criteria for preserving the original door interaction by itself. A successful
two-way result justifies the next Use/audio-preserving implementation. It would
not by itself prove which flag/function inside inter_door was responsible.

## Source repository evaluation

The requested [milo-src/cry-of-fear-src](https://github.com/milo-src/cry-of-fear-src)
README calls it an unofficial recreation built on Xash3D FWGS/HLSDK, with custom
CoF-style gameplay modules. That author statement does not establish original
CoF source provenance, implementation completeness or equivalence to Steam 1.6.
Its src/cof tree is based on HLSDK-portable and shows a LICENSE file; attempts to
retrieve its license text failed, so the applicable terms were NOT verified.
No installed-version matching evidence was found in the inspected README/tree.
It was NOT cloned, built, installed or used to infer proprietary door/rendering
behavior. Map-level testing continues independently using the installed SDK.

## Next discriminating measurements

1. Compare the same pair in fresh control and bypass runs. Verify two-way
   visibility BEFORE and after both players occupy the SAME destination area.
   Seeing nobody in another disconnected section is normal visibility evidence,
   not sufficient proof of a bug. Record which participant actually moves when
   only one uses/walks into a doorway, and the order of traversal.
2. On the reproduced CONTROL failure, move close together, then let P2 rejoin
   once and capture the asymmetric matrix. This tests the reported signature
   specifically on the selected route rather than treating rejoin as a repair.
3. Optionally let the invisible host die/respawn normally while P2 stays nearby
   to test whether host reinitialization restores it as a visible target. Keep
   normal game rules; do not force unsupported cheat/respawn commands.
4. Reload a known working native map to test recovery from story-map state.
   This distinguishes recoverable map/session state from lasting client failure.
5. Do NOT disconnect/rejoin P1 as an independent-player test when P1 hosts the
   listen server: that tears down the session and confounds the comparison.

Engine flags/model/PVS/replication hypotheses remain unresolved until these
observations or a supported live diagnostic interface becomes available. No
campaign expansion, model proxies, networking replacement or binary patch.
