# RC4 integrated candidate — 2026-10-10

IMPLEMENTED — AWAITING GAMEPLAY VERIFICATION. This is an experimental overlay,
not a completed or gameplay-verified campaign/save system. The previous real
recorder/Continue test FAILED; no new real game was launched during this work.

## Evidence and implemented changes

The supplied consolelog.txt and all three screenshots were examined. The log
contains opening, note acquisition, and s4_start2 -> s4_start_e0 transition;
it contains NO checkpoint commit or Continue/load attempt. Prior actual save
inspection remains the only saved-payload evidence. It validates data, not restore.

1. Journal/UI: host journal packets precede CL_SignonReply in the log. Pinned
   client AddNote handler1006F190 writes live journal widgets; native HUD resend
   100F71D5 sends16 records with ZERO code metadata. The adapter now waits for
   pinned CmdStart43 and a quiet HUD interval, observes ResetHUD/InitHUD, and
   repairs changed slots after native resends. Per-slot payload comparison avoids
   duplicate unchanged ordinary note packets, including replay to the collector.
   No inventory reset, weapon change, resource replacement, or client DLL edit.
   Original grants and full cafe resource recovery are retained. These are
   evidence-backed ordering/deduplication corrections; the WHITE INVENTORY ROOT
   CAUSE REMAINS UNPROVEN. Screenshots retain phone/knife; no rejected bank or
   missing UI resource is logged. Visual repair must not be claimed yet.
2. Scripted door204 in c_start retains master amultiscr1 AND an initially locked
   shared gate. Original scene3 unlock at10.3s becomes idempotent On; actor-only
   verified sound/fade/teleport checks both prerequisites again at relocation.
   A completion latch at the authored final16s action prevents re-entry replay;
   restoration applies unlock/master/hidden actor only. Original camera and item
   actions remain at their timings. Door713/padlock and known-working ordinary
   doors stay unchanged. Door204 is an additional traced unsafe chain; the user's
   approximate “look right” description does not conclusively identify its ID.
3. Checkpoint identity/location: exact native recorder title plus proximity to
   pinned original tape entity distinguish419 Storage Tunnel from421 Sewer Store.
   Both are legitimately in c_start/s4_start_e0; a different BSP is not inherently
   required for the sewer. Each now uses its OWN authored two-player anchor.
   Saves log map and recorder. Old files labelled419 cannot reveal which tape was
   really used; we do not reinterpret or silently migrate them to421.
4. Continue: launcher stages a validated checkpoint BEFORE +map. The boot map
   c_game_menu1 observed in the supplied log is allowed. After native worldspawn,
   globals/journal/puzzle stage BEFORE other map entities and trigger_auto gates
   initialize. The old one-second after-map load command is explicitly rejected.
   This removes a source-level timing flaw; the old failed run has no load log
   proving which refusal or initialization path occurred.
5. Player restore: stable identities remain mandatory, with visible bounded wait
   reasons for missing owner/profiles/duplicates/HUD readiness. Empty native
   weapon_action placeholders no longer invalidate capture. Restore waits for
   active commands/HUD, reads health/weapons/clip/reserve/items back, checks the
   destination exists, and verifies arrival near it. Partial failure latches;
   unrestored disconnects cannot replace saved records with fresh empty state.
   A rejected/uncaptured native journal bank refuses a save instead of committing
   an incomplete note set; existing slot data remains intact.
6. Intro vehicle: actual log shows spawned moving brushes but packed=0 for BOTH
   clients in every observed phase. A narrow candidate permits only the original
   skittag/skittag22 brushes through the native PVS filter during a cinematic
   view on cof_campaign_story4. Other native pack filters/state serialization
   remain active. No camera, train timing, BSP geometry or original binary edits.
   This is a visibility candidate, not proof that the bus is visually repaired.

## Scope, saved format and remaining limitations

Version1 COFCKP01 remains compatible: campaign/map/recorder, stable owner, up to4
identity-keyed retained player records, health/stamina, weapons/loaded and reserve
ammo, six inventory names, consumable counters/equipped class, journal16 entries
with code metadata, canonical puzzle digits/credentials, validated native globals.
CRC, bounded parsing, atomic commit, backup and reparse/path guards remain.
No raw pointers, exact player coordinates, entire monster/pickup world or
unmapped quest flags are fabricated. Landing is checkpoint reconstruction.

Two active players remain supported; four active players require separate ready
gating, safe arrivals and gameplay work. Saves remain limited to s4_start,
s4_start_e0,s4_start_e2 with recorder419/421. Other recorders refuse rather than
claim success. Duplicate/LAN Steam sessions require the SAME host-assigned profile
keys after each restart; connection order never selects inventory. New participants
without a matching record receive a visible wait reason, not someone else's data.

Only THREE BSPs changed: s4_start,s4_start_e0,s4_start_e2. The other five integrated
BSPs (intro/nightmare/cafe/two apartment aliases), all RC2/RC3 and previous packages
remain untouched. Original binaries/authentication/liblist and installations were
not modified. User docs/DOOR_TEST.md edit is preserved outside our commits.

Read-only campaign audit covers195 retained RC2 aliases +8 overlay aliases:
203 maps, no missing routes;528 retained destination-door occurrences including
414 conditional occurrences,172 recorder occurrences,101 note-entity occurrences,
854 cameras. Counts include repeated arrival aliases; they are NOT unique original
door counts. Unsupported chains are listed in CAMPAIGN_AUDIT.json and retained,
not mass-unlocked or presented as fixed. Full campaign, arbitrary world restore,
all conditional doors, all scare completion and four-active-player saves remain
unfinished. No unsupported headless/HLDS experiment was repeated.

## Verification and delivery

66 applicable Node tests PASS,0 skipped; the2 previously excluded staging test
files remain excluded. Six owned native fixture suites PASS. They cover real
Windows atomic file writes, corruption/backup, reversed identity records, separate
recorder selection, menu-before-map staging beyond100s, placeholder weapon,
sign-on/HUD code resends, unchanged packet suppression, frozen-player waits,
inventory readback, arrival and no repeated grants. These fixtures do not load
the proprietary backend or represent two-client gameplay.

Own x86 adapter builds with /W4 /WX;846 export names/ordinals and843 preserving
tail jumps checked. Installer/rollback, packaged Continue and final archive checks
are recorded in QA.json. START_HERE.md gives one PowerShell installation/rollback
procedure. TESTING.md is the single ordered two-client regression. SOURCE.md and
source/native-rc4 contain the owned component source; no original BSP/DLL assets
are distributed. Exact final Git commits and artifact hashes are in QA.json.
