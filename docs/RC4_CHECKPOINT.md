# Automatic identities and Continue request — coop-fixes-001 (2026-10-10)

Identity order: host-bound profile, then a valid Steam ID unique among the
connected players, then `auto:host` (listen-server host) and a single
`auto:guest`. STEAM_ID_PENDING waits. Two or more unresolved guests are refused.

Restore order: exact identity first. Otherwise the host gets the owner record,
and the single unmatched guest gets the single unmatched non-owner record. The
log line says "matched by role". Saves wait for role-matched players too.

The launcher writes `storycoop_saves/continue.request` ("COFCONT1 SLOT MAP").
The adapter consumes it once at the first real map, honors it only for that
exact map within 15 minutes, and deletes it. A Host launch removes any stale
request. The host launch always adds -condebug.

---

# Checkpoint diagnostics — campaign-doors-001 (2026-10-10)

The save scope and acceptance rules are unchanged. New log output:

- `[STORYCOOP] CHECKPOINT save player=N health=… stamina=… weapons=… inventory=… reserve=… equipped=…`
  for each connected player before the commit;
- the same line with `restored` after a successful restore;
- `Save refused: player N state/identity unavailable (REASON)`;
- `RESTORE WAIT: … (REASON)`;
- `Player RESTORE FAILED (REASON)`.

REASON names the exact step, for example: player dead or down, controls frozen,
no stable identity, landing marker missing, `cof_giveitems refused <item>`,
`readback differs: health reserve`, or `landing readback outside tolerance dx dy dz`.
No Steam IDs or profile keys are printed.

---

# Current camera/note milestone and Claude handoff — 2026-10-10

Same physical repository: `%USERPROFILE%/Documents/Codex/2026-10-08/token-efficiency-and-context-management-this/outputs/cry-of-fear-coop`; branch main. Implementation commit
d3fc20f9a4a3d3b604a9664b60c4797d36316db4. The final handoff commit is the commit
containing this section; resolve the exact current hash with git rev-parse HEAD.
No repository relocation or Claude-only fork. User docs/DOOR_TEST.md edit remains
intentionally uncommitted and untouched.

Latest USER two-client evidence: computer/padlock, sounds, shared note acquisition
and access, tested E/audio/fade/relocation doors and player visibility WORKING.
Camera after downed-player cinematic FAILED; code layout drifts right. This
candidate implements both corrections; gameplay still pending. Latest save test
INTERRUPTED by camera, not failed. Historical failures below describe older builds.

Candidate: `%USERPROFILE%\Documents\Codex\2026-10-10\files-mentioned-by-the-user-consolelog-2/outputs/rc4-camera-notes-candidate.zip`.
Native002 SHA256 9de26b8b61581ff88ac3fa49f0ef21017097b2d97869f0c649780d4054a543f3,
512512 bytes. All eight map plans/BSPs unchanged from integration-001. Prior
`%USERPROFILE%\Documents\Codex\2026-10-10\files-mentioned-by-the-user-consolelog-2/outputs/rc4-integrated-candidate` is preserved and bundled for rollback.
7 native suites,66 Node,146 installer,9 Continue,8 PS parses and9 exact bundled
rollback artifacts PASS. Campaign audit203 aliases/0 missing routes,854 camera
occurrences,816 within scope. No real game installed/launched by Codex.

Read RC4_CAMERA_NOTES.md for native evidence, source changes, limitations and
RC4_CAMERA_NOTES_TEST.md for A/B camera roles, C note page/map changes, D fresh
Sewer Store slot/full restart. Save implementation unchanged:2active/4retained,
three c_start aliases,419/421 fixed checkpoints, not full world persistence.
Next task: run that one real two-client test; fix any failure from its exact map,
scene, roles and complete logs. Do not regenerate195 maps or revisit unrelated
network overflow. Four players and every cinematic are NOT gameplay verified.

Claude entrypoint CLAUDE.md references PROJECT_HANDOFF, NEXT_SESSION,
DEVELOPMENT_ENVIRONMENT, ARTIFACT_INVENTORY, SAVE_SYSTEM and KNOWN_BUGS.
Tool/path inventory verified locally; D:/E: metadata required approved reads.
Claude has its own permissions. Claude CLI is NOT FOUND in current PATH/standard
checked locations; installation/model availability not changed or assumed.

---

# Integrated checkpoint correction — 2026-10-10

See RC4_INTEGRATION.md for current implementation. Version1 retained, separate
419/421 destinations; validated pre-map prepare replaces1-second after-map load.
Actual boot menu is allowed; shared state stages before map entity construction.
HUD/active-command readiness, weapon_action capture, bounded identity waits,
unrestored-bank protection and target/arrival readback added. Six owned native
suites pass; actual restart remains UNVERIFIED. Prior gameplay failure is NOT
overturned by fixtures. Scope remains2active/4retained on3c_start aliases; arbitrary
world/pickup/enemy state and exact positions are not serialized. Old419 save
cannot identify whether the player actually used421. No migration is guessed.

---

# Save/restore FAILED in real gameplay — 2026-10-10

Canonical SAVE_SYSTEM topic; do not duplicate it. Latest user fully closed both
clients after host E at sewer tape recorder reported saving. Custom Continue
returned to padlock map/wrong location; BOTH inventories empty and notes/triggers/
completed events missing. This is NOT a functional cooperative save system.
Earlier candidate/fixture descriptions below are implementation, not a pass.

Established design limits: checkpoint_map only s4_start/s4_start_e0/s4_start_e2;
two active players/four retained identities. Both recorder419/421 restore via
common Storage Tunnel419 anchor. checkpoint_save HARD-CODES recorder419;
no player origin/angles are serialized. Only native primitive global stream,
journal/puzzle and supported player inventory fields are captured, not whole
entity world, arbitrary quest flags or weapon modes. Wrong exact tape/map cause
remains unestablished until new log and expected checkpoint are correlated.

Load: header-only launcher selects whitelisted map; native load command must run
within1s of fresh worldspawn. Valid global/puzzle/journal payload stages first;
saved owner identity gate then native player readiness precede reconstruction.
Stable identity/profile (not slot) selects record, slot only fixed landing. Player
is marked restored BEFORE mutation; partial failure latches and prevents repeated
grant/save overwrite. A success write notice alone proves no restore step.

### Actual host save inspected during final handoff

Read-only access found slot1.cofsave and slot1.cofsave.bak in
`D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\storycoop_saves`.
Both are 5,390 bytes with identical SHA256
`2723866c48812cf07c7454870171f44289fe3e3a2e74b964edef2f0a396bd02b`;
filesystem modification times were 2026-10-10 01:27:06 and 01:27:04 respectively.
The current native decode_checkpoint accepted the entire primary payload,
including CRC and semantic validation. Private copies and a redacted inspection
are in current-chat work/final-handoff-private; identities never printed/committed.

- Map s4_start_e0, recorder419, two distinct player records; owner is record1.
- Both have weapon_syringe, weapon_switchblade and weapon_mobile, three nonempty
  inventory names, equipped switchblade, and one nonzero reserve-ammo index.
  Health30/56, stamina100; item counters zero.
- Three notes: leatherhoff45.txt, thebeatles54.txt, and nerds. The last has
  codeFlag1/codeType1 and a nonzero codeValue. Canonical digits and credentials exist.
- Native global stream is1,408 bytes: wake/blacker/padlock/computer done flags1;
  corresponding queried wake/blacker/padlock active flags0.

This file contains more than header metadata, while playable restoration remains
FAILED. Its exact association with the reported failing test/recorder is not
established by a new log. The header cannot identify the actual tape used because
checkpoint_save hardcodes recorder419. Do not infer that the expected sewer map
must be a different original BSP: aliases and recorder421 need runtime tracing.
The identical backup is not an independent earlier state. Keep both untouched.

Next investigation: correlate this actual file/hash and its backup with new test
log; identify real tape/served alias, map selection and load command timing;
inspect owner/profile gate and capture_player readiness, each explicit LOAD/
RESTORE message and actual SDK inventory helper results. Compare expected inventory/
event state to serialized records, then to live readback/HUD. Restore full location
and required story/world state deliberately after diagnosis. Do not claim save
success from CRC/write/native fixtures. Keep host save copies private and unchanged.

---

# Experimental cooperative recorder checkpoints

IMPLEMENTED — AUTOMATED TESTS PASSED. AWAITING GAMEPLAY VERIFICATION.
Operational saving and playable fresh restart have NOT been established in the
actual game. The owned engine fixtures never load the proprietary backend.

## Supported workflow

Only the listen-server host writes. Supported maps: `s4_start`, `s4_start_e0`,
`s4_start_e2`, after the wake sequence finishes and explicit story/puzzle actions
are inactive. Original recorder419 (Storage Tunnel) and recorder421 (Sewer Store)
both resume at the common Storage Tunnel419 anchor. Two active players and up
to four retained identity records; other-map/four-active-player saves are BLOCKED.

Default save slot is1. Host console `sc_checkpoint_slot 2` or `3` selects another.
Approach/use the original recorder normally. Its first native presentation may
require a second Use before SaveLoad arrives. `Checkpoint slotN COMMITTED` is
printed only after a successful disk commit. A guest gets a host-only notice,
without a commit; no fresh UI application is required.

Stable `STEAM_...` auth IDs are used when valid and unique. LAN/PENDING/duplicate
Steam IDs (including some same-account Sandboxie sessions) are refused. From
the HOST console run `status`, then explicitly assign each current user ID:

```text
sc_checkpoint_bind <host current USERID> uni
sc_checkpoint_bind <guest current USERID> partner
```

Replace angle-bracket placeholders with the numeric IDs actually shown by
`status`; they are not player slot numbers. Keys use letters/digits/underscore/
hyphen, maximum48 characters. Use the SAME person/key on every future join.
Bindings are session-local and must be reassigned after reopening; no Steam
identity or authentication is modified. Do not assign the same key to two people.
The saved host owner must match before player restoration starts.

Close the whole game. With the package installed, use `Continue RC4 slot1.cmd`,
or select a slot/custom host path through the existing launcher:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\host-story-coop.ps1 -ContinueSlot 2 -GameDirectory "D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear"
```

The launcher reads header/CRC/map only, uses Steam app223710, two-player native
multiplayer and `-dll cl_dlls/storycoop_rc4.dll`, followed by `+map SAVEDMAP
+sc_checkpoint_load SLOT`. The adapter fully revalidates the selected primary/
backup. Loading is a fresh map-start command within the first game-time second;
active-session/mismatched-map loads are refused. Do not type it into a running
campaign. P2 joins through the usual legitimate Steam/Sandboxie setup.
For manual profiles, rebind after `status` before expecting restoration.

Watch `LOAD staged`, then each `Player checkpoint restored and inventory read
back`. Missing messages/`LOAD REFUSED`/`RESTORE FAILED` are failures to investigate,
not permission to bypass validation. Confirm actual inventory/HUD/control and
model visibility in TESTING.md. A fresh participant without a retained record
keeps native initial state; a returning player receives their own latest bank
record. Departing records are captured before native disconnect/map teardown.

## Actual interfaces and data

The unchanged backend SHA256 is0036b91c01e92ed205513f52563053a55a66a32d257efb5f476b8f1f3dde0e63.
Its API140 callbacks/846 exports and original function lookups are forwarded.
No backend detours, private function calls, SP whole-world serializer or DLL/auth
patch is used. Version-pinned memory reads/writes require live edict serials,
engine pointer round-trip and tracked exact0x281C player allocation.
Health164/deadflag174/flags1A8 are confirmed by the pinned entvars metadata;
native padlock Use/cleanup sets/clears freeze bit80. Opening diagnostic targetname
access was corrected from108 (movetype) to actual1D0, so manager/vehicle names now
report correctly; the original diagnostic defect did not control game actions.

- Shared: campaign/version/map/checkpoint, original16-slot journal records and
  code metadata, canonical puzzle digits/login choices, primitive native
  CGlobalState stream through SaveGlobalState/RestoreGlobalState. Only its known
  token names/primitive fields are accepted; restored names/level/state are
  compared with a fresh capture independently of linked-list order.
- Player: stable identity, health/stamina,32 reserve indices,5 item counters,
  native6 inventory names, tapes/battery/used-syringe flag, owned weapon class,
  loaded clip/ammo index and equipped class. No edict/private/function pointers
  are stored. Weapon allocations and lists are validated before access.
- Restore: supported `cof_clearitems`, `cof_giveitems`, `cof_weaponswitch` entities
  synchronize fresh native inventory through SDK KeyValue/Spawn/Use. Missing
  entries are granted once; health/counts/clip/reserve are restored and read back.
  `cof_teleport` uses validated per-client landing markers. Slot selects a
  landing only; identity selects inventory. Journal packets retain existing
  post-HUD pacing. Unsupported/frozen/dead/ambiguous state refuses capture.
- Recorder: exact scoped MSG_ONE SaveLoad byte0/string interception via engine
  message callbacks, adjacent native UI fade suppression, host-only deferred
  StartFrame commit. A guest request cannot discard a host request in that frame.
  Unrelated UI and original single-player maps pass through.

The map rebuild retains known env_global event gates. Unlatched enemy/pickup/
temporary-world state and unconverted quest flags are outside this contract.
Inventory weapon modes and arbitrary private player attributes are not saved.
The full campaign/four active players remain BLOCKED, separate from this
implemented checkpoint candidate. Ordinary multiplayer inventory handoff stays
native; its gameplay round trip must pass before the restarted-save test.

## File safety / failures

Host files: `cryoffear\storycoop_saves\slot1.cofsave` through slot3, with `.bak`.
Binary version1, magicCOFCKP01, bounded64KiB, exact length and CRC32 over bytes20
through end. Header map/checkpoint is fixed and whitelisted; campaign ID is
`cof-original-story-rc4`. Counts/resources/identities/notes/global fields validate
before restoration. Ownership never falls back to client slot.

Writes use a new exclusive temporary file, flush, then same-folder atomic Windows
rename/replacement with the previous valid primary preserved as backup. Directory
or file reparse points refuse. Corrupt primary reads fall back to a valid backup;
committing over a corrupt primary refuses, preserving the good backup. With games
closed, retain the damaged file and backup elsewhere before manually recovering
the primary, or save to another slot. The launcher never repairs or rewrites files.

No success notice on serialization/identity/disk failure. Shared restore is read
back; each player restore is marked before mutation, so a partial failure cannot
grant every frame. `RESTORE FAILED` blocks further save overwrites; restart from
the valid checkpoint and retain logs. Frozen/native-uninitialized players wait
before mutation. Saving waits for connected returning records to finish restore.
Removing/upgrading this package retains host save files and original SP saves.
