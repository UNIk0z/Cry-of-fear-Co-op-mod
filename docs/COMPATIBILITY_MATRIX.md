# Compatibility — coop-fixes-002 (2026-10-10)

| Feature | Status |
|---|---|
| Ladder lock, black-box removal, P1 checkpoint restore | USER VERIFIED (coop-fixes-001) |
| P2 restore, landing, post-process fan-out, flashlight hold, duplicate-row suppression | Implemented; awaiting gameplay |
| Code position after a map change, train, P2 jitter | Open; evidence logging in place |

---

# Compatibility — coop-fixes-001 (2026-10-10)

| Feature | Status |
|---|---|
| Connectivity, lobby, opening, nightmare, doors, padlock, notes, pickups, death/revival camera | USER VERIFIED on campaign-doors-001; untouched |
| Ladders (33 managers / 15 maps) | Reservation implemented; awaiting gameplay |
| Automatic save identities / Continue request | Implemented; awaiting gameplay |
| Black box on revisit | Fixed in maps; awaiting gameplay |
| Title train | Retry plus evidence; awaiting gameplay |
| Code drift, P2 jitter | Diagnostics only |

---

# Compatibility — campaign-doors-001 (2026-10-10)

| Feature | Status |
|---|---|
| Doors, puzzle, sounds, notes, visibility, pickups already verified by you | PRESERVED; maps and code untouched except the apartment aliases |
| Camera recovery / note layout | IMPLEMENTED; AWAITING GAMEPLAY VERIFICATION |
| Checkpoint save/restore (s4_start aliases only) | IMPLEMENTED with diagnostics; AWAITING GAMEPLAY VERIFICATION |
| c_apartment1 office 228/229 (Codex) | IMPLEMENTED; untested |
| c_apartment1 key-room exit 713, apartment key door 193 | IMPLEMENTED; AWAITING GAMEPLAY VERIFICATION |
| Apartment return routes (s2_apartment1_e0..e5) | NOT COVERED: native doors |
| Other 6 key doors campaign-wide | NOT COVERED: native |

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

# Final integrated candidate sealed — 2026-10-10

Implementation commits d559c6b and7693b6f. Final release is current workspace
outputs/rc4-integrated-candidate.zip:59exact entries,662311bytes, SHA256
10271fa9daf8ca7ed752fcb506965586d54b670cb70f49c46c7dda857dbde543.
Expanded package contains owned source+replayable implementation.patch,8 BSP
plans, separate native adapter, bundled prior-candidate rollback, campaign audit,
QA and one START_HERE/TESTING procedure. Native003472064bytes SHA256
bffde10ecf2376eafa90269f4a6ce7d5c9101e92fb35ad9c2d928d9b24094e18.
Final6native suites/66Node/141installer/9Continue/8PSparses PASS; additional
65 source/map/baseline checks PASS,59ZIP entries exact. Bundled rollback
reinstalls8exact prior maps+DLL in a private fixture. No original game loaded,
launched or installed. White UI cause remains UNPROVEN; all runtime changes
AWAIT GAMEPLAY VERIFICATION. Supported save scope2active/4retained,3maps,
2recorders; arbitrary world/full campaign remain incomplete. Do not reopen
old experiments or replace baselines. Next evidence is the single consolidated
two-client regression; no manual testing was requested during development.
User DOOR_TEST.md edit stays uncommitted. Full final data:RC4_INTEGRATION_VERIFICATION.json.

---

# Integrated implementation — 2026-10-10 (current authority)

Final save guard: rejected/uncaptured native journal state refuses commit; valid-backup provenance retained through pre-map staging. Native003 + tests005: six suites PASS. Prior66 Node and141 installer/9 Continue checks remain; final artifact package is being resealed.

User resumed unattended implementation; prior HANDOFF ONLY is historical.
Current workspace %USERPROFILE%/Documents/Codex/2026-10-10/files-mentioned-by-the-user-consolelog-2; repository path unchanged. See RC4_INTEGRATION.md,
RC4_INTEGRATION_TEST.md and RC4_INTEGRATION_START.md for consolidated scope.
Journal CmdStart43/HUD barrier and per-slot dedup; separate419/421 checkpoints;
pre-map Continue staging before entities (boot c_game_menu1 allowed); action-item
readiness fix, bounded identity waits and protected unrestored disconnects;
checkpoint landing readback; gated original-master door204/scene3 persistence;
cinematic-only native PVS exception for4 authored title brushes. Original binaries
untouched. Three changed BSP aliases; other5 byte-identical. No195-map rebuild.
66Node PASS/0skip and6owned native suites PASS; game never loaded/launched by Codex.
White inventory cause still UNPROVEN; all new runtime behavior AWAITING GAMEPLAY
VERIFICATION. Full save system remains incomplete (2active/4retained,3maps,
checkpoint reconstruction/native globals only). Old save419 is not reinterpreted.
Campaign audit203aliases has0missing routes;528retained destination-door occurrences,
414conditional,172recorders. Counts include duplicate arrival aliases; unresolved
chains remain locked/native. Current output rc4-integrated-candidate; final QA and
commits recorded there. User DOOR_TEST.md remains untouched/uncommitted.

---

# Latest real test authority — final handoff 2026-10-10

| System | Current evidence/status |
|---|---|
| Steam + Sandboxie native connectivity/initial models | USER VERIFIED |
| Same-map E pair49/50 independent relocation | USER VERIFIED V6; audio/fade V8 also verified |
| RC3 build007 ready/opening/nightmare/automatic wake | USER VERIFIED reported configuration; four players/late join/all effects not established |
| Maintenance automatic intro exit without P2 movement | USER VERIFIED; latest8 BSPs unchanged |
| Canonical computer/padlock validation + extra resource pickups | USER VERIFIED earlier hotfix; display/save persistence separate |
| Story-note grants/access BOTH players | USER VERIFIED latest build; preserve |
| P1 inventory after second PASSWORD note242 | USER CONFIRMED white/corrupted UI, FAILED |
| Padlock note numeric content after transition | P1 FAILED/P2 retains digits; both own note |
| Title vehicle | USER CONFIRMED still invisible, FAILED |
| Scripted unlocked door after padlock scene | USER CONFIRMED incompatible SP transition, PROGRESSION BLOCKER; exact alias/ID unknown |
| Recorder save +complete restart/Continue | USER CONFIRMED FAILED map/location/inventory/notes/events restore; not a functional save system |
| Actual host slot1 file | Native decode accepted2 inventories/3 notes/puzzle/globals; payload validity only, NOT playable restore |
| Complete campaign/four-player/late-join/independent loot | NOT VERIFIED / incomplete coverage |

See PROJECT_HANDOFF/BUG_TRACKER and canonical topic docs. Historical “pending”
and map-only restrictions below are dated, superseded where noted; fixtures and
structural reachability do not establish gameplay. Current build remains RC4
notes-regression-001; no new install/package from this handoff.

---

# Current compatibility status

## RC4 notes regression — latest authoritative 2026-10-10

| Feature | Status | Evidence / boundary |
|---|---|---|
| Automatic intro transition | VERIFIED WORKING | Latest real user maintenance test;8BSPs byte-identical in patch |
| Café journal full-width IDs and resource recall | IMPLEMENTED; GAMEPLAY PENDING | Native tables/archive prove defect; bounded bank/wire fix; six native fixture suites PASS |
| Four-recipient shared acquisition/notice | IMPLEMENTED; GAMEPLAY PENDING | Owned four-client native-layout fixture; original readers/entities retained |
| Rejected native journal record | PRESERVED | Transactional bank validation; bounded warning; no destructive zero/overwrite |
| All currently converted notes | STRUCTURAL/RESOURCE PASS |81sources/195aliases;14documents/2credentials/2virtual code notes |
| Title vehicle | FAILED IN USER TEST; UNRESOLVED | Native Spawn alone insufficient; added bounded render/PVS/packet evidence only |
| Canonical puzzle, doors, pickups, checkpoint code | PRESERVED | Maps byte-identical; existing native implementations/fixtures retained; earlier verification boundaries apply |

## RC4 maintenance/checkpoint milestone — preserved baseline 2026-10-09

| Feature | Status | Evidence / boundary |
|---|---|---|
| Canonical shared computer/padlock code | VERIFIED WORKING | User real hotfix Steam/Sandboxie test; preserved |
| Extra pickups | VERIFIED WORKING | User real hotfix test; original placements/acquisition retained |
| Hotfix intro automatic exit | FAILED | Only advances after P2 movement |
| Maintenance authored exit occupancy | IMPLEMENTED — AUTOMATED TESTS PASSED; AWAITING GAMEPLAY VERIFICATION | Correct two actors after original callback; no independent cinematic timer |
| Title vehicle | IMPLEMENTED — AUTOMATED TESTS PASSED; AWAITING GAMEPLAY VERIFICATION | Original tracktrains held until ready timeline Use; actual missing-vehicle cause not yet observed |
| Original wheel/unlock audio | IMPLEMENTED — AUTOMATED TESTS PASSED; AWAITING GAMEPLAY VERIFICATION | Original exact events/owner routing once; spatial cause inferred |
| Conditional padlock/apartment doors | IMPLEMENTED — AUTOMATED TESTS PASSED; AWAITING GAMEPLAY VERIFICATION | Shared gates, authored lock/unlock stages, actor fade/audio/teleport; identified office pair |
| Cross-map journal/puzzle/events/inventory | AWAITING GAMEPLAY VERIFICATION | Existing banks/native handoff and new office latch retained; Phase A round trip required |
| Host recorder file commit / corruption recovery | IMPLEMENTED — AUTOMATED TESTS PASSED; AWAITING GAMEPLAY VERIFICATION | Actual Windows file/backup fixtures plus scoped menu/fade owned engine fixture |
| Fresh Continue / live player restore | IMPLEMENTED — AUTOMATED TESTS PASSED; AWAITING GAMEPLAY VERIFICATION | Real pinned memory interfaces +SDK grants/readback in owned engine; no actual restarted game |
| Save identity/absent records | IMPLEMENTED — AUTOMATED TESTS PASSED; AWAITING GAMEPLAY VERIFICATION | Stable IDs or explicit host profiles; 4records retained; no slot-only inventory |
| Other-map / four active checkpoints / whole-world persistence | BLOCKED | Two clear c_start landings only; unlatched enemies/pickups/entities can reset |
| Maintenance automated regression/package | IMPLEMENTED — AUTOMATED TESTS PASSED |63Node/6native suites/141installer/9read-only Continue assertions;7PS parse;45ZIP entries exact;10protected baselines retained |

These rows supersede all historical persistence/STOP classifications below.

## Latest authoritative RC4 opening FAIL / hotfix candidate — 2026-10-09

| Feature | Status | Evidence / limit |
|---|---|---|
| RC4 build010 cinematic progression | USER OBSERVED FAILED | Two Steam/Sandboxie clients stuck after first scene |
| RC4 title vehicle | USER OBSERVED MISSING | RC3 previously showed it; causal stage unknown |
| RC4 dynamic rain | NATIVE MULTIPLAYER USE REJECTED | Warning returns; no vehicle/removal/transition causal evidence |
| Hotfix opening isolation | IMPLEMENTED; GAMEPLAY PENDING | Native callback/memory/message fixtures; no first2map player state writes |
| Hotfix static rain/original chain | STRUCTURAL PASS; GAMEPLAY PENDING |2 unsupported Uses omitted; cinematic timing intact |
| RC3 build007 rollback | USER OBSERVED WORKING; RETAINED | Tested two-player opening/nightmare/wake only |
| RC4 persistence | UNVERIFIED; TESTING DEFERRED | Later code/maps retained until opening passes |
| Hotfix package/rollback QA | AUTOMATED PASS |60Node/4native/108PS;34ZIP files exact; real gameplay pending |

These rows supersede all earlier RC4 verification claims below.

## Authoritative RC3 gameplay / RC4 candidate — 2026-10-09

The user subsequently tested RC3 build007 with real Steam/Sandboxie clients.
This supersedes the NO TEST entries below for those specifically observed rows.

| Feature | Current status | Evidence / limit |
|---|---|---|
| RC3 readiness/opening participation/scenes | USER OBSERVED WORKING | Tested two-player session; other lobby cases unknown |
| RC3 nightmare camera gameplay/progression | USER OBSERVED WORKING | Not every effect/equipment case independently reported |
| RC3 automatic nightmare->wake transition | USER OBSERVED WORKING | Keep exact verified initial raw handoff |
| RC4 host journal + code-note metadata | IMPLEMENTED; GAMEPLAY PENDING | Native records/AddNote;16-slot cap;4 owned native fixture suites |
| RC4 computer/padlock session solution | IMPLEMENTED; GAMEPLAY PENDING | Original generated tuple + scoped login RNG + P2 cleanup |
| Simultaneous padlock Use | LIMITATION | Native shared panel can reset wheels; sequential candidate test |
| Native player inventory handoff | NATIVE CODE VERIFIED; GAMEPLAY ROUND TRIP PENDING | Existing capture paths retained; generic items/reconnect/mode incomplete |
| RC4 scare/wake/cafe/solved flags | IMPLEMENTED; GAMEPLAY PENDING | Five aliases; authored global IDs; relevant poststate restored |
| RC4 native forwarding/bootstrap | BUILD/FIXTURE PASS; REAL ENGINE PENDING | Exact846exports/API140; missing backend safely refused |
| RC4 engineering checks | PASS |59Node/0fail/0skip; four native suites; installer QA in handoff |
| Whole campaign/four-player runtime/disk saving | NOT VERIFIED / NOT IMPLEMENTED | Existing later RC2 blockers remain |

## Latest authoritative RC3 status — build007 (2026-10-09)

User confirms NO RC3 gameplay test. RC2 reported failures remain failures.

| Feature | Status | Evidence / limit |
|---|---|---|
| RC3 opening ready callback | IMPLEMENTED — AWAITING GAMEPLAY | Synchronous player count2 + one-shot timeline; no late solo-ready token |
| Forced lobby timeout setting | NATIVE CODE / LAUNCH ARGUMENTS VERIFIED | mp_footsteps1 before +map; actual ready UI needs two-client test |
| Solo-ready recovery | BLOCKED | Intro refused, native UI may close; restart lobby, both join before ready |
| P2 camera/effects/spawn/equipment | IMPLEMENTED — AWAITING GAMEPLAY | Existing005 adapters retained; nightmare/wake byte-identical |
| Nightmare->wake progression | AWAITING GAMEPLAY; HANG CAUSE UNKNOWN | Existing experimental handoff retained; no direct/natural load observed |
| Late-join cutscene recovery | BLOCKED | No native camera/effect/equipment catch-up established |
| Build007 engineering | PASS |53 Node,41 PowerShell fixture checks; no runtime simulation claim |
| Unboxed Steam install readiness | BLOCKED AT RC2 PREREQUISITE | First required RC2 alias fails guard; full unchanged RC2 included in bundle |
| Entire four-player campaign | BLOCKED | Opening test supports2; existing broader RC2 blockers remain |

The sections below retain RC2/historical classifications; newest RC3 state above
supersedes earlier pending opening implementation descriptions.

## Authoritative latest status — connected RC2

| Feature | Status | Evidence/limit |
|---|---|---|
| Existing E/teleport/audio/fade/models | VERIFIED WORKING | User baseline; new159 instances need gameplay |
| Both RC1 credential papers | VERIFIED WORKING | Latest user report; retained unchanged |
| Other floor note | FAILED | User report; unspecified location/type |
| Static document fan-out14 | IMPLEMENTED — AWAITING GAMEPLAY VERIFICATION | Native document handles assigned per actor; no quiet grant |
| RC1 group ready portal | FAILED | Both present, no transition |
| RC2 zero-origin readiness bounds | IMPLEMENTED — AWAITING GAMEPLAY VERIFICATION | Local/world query mismatch addressed; map load unproven |
| Original apartment destinations | FAILED | User report; RC2 preserves actual named exits and separates landmark entries |
| RC2 arrivals | IMPLEMENTED — AWAITING GAMEPLAY VERIFICATION / BLOCKED | 182 static candidates;13 blocked;2-player test |
| Original intro ready hook | IMPLEMENTED — AWAITING GAMEPLAY VERIFICATION | Native cof_lobby_start -> original intro once |
| RC1 Host Coop Game menu | FAILED | User reports absent |
| RC2 separate Steam launcher | IMPLEMENTED — AWAITING GAMEPLAY VERIFICATION | No menu edits; request through app223710 |
| P2/late-join scenes | FAILED | Native camera already loops clients; skip guard is not a join fix |
| Camera skip guard311 | IMPLEMENTED — AWAITING GAMEPLAY VERIFICATION | Original paths/timings retained |
| Authoritative accepted PC/keypad code | BLOCKED | Native validation reads player+2040; no supported shared-state adapter |
| Retained destination doors172 | BLOCKED | 102 same-map/70 cross-map conditions need adapters |
| Physical resource copies537 | IMPLEMENTED — AWAITING GAMEPLAY VERIFICATION | 220 locations; no per-client claims or duplicate story keys |
| Quiet/late-join note delivery | BLOCKED / NOT IMPLEMENTED | Failed V12 stays withdrawn |
| Shared save/load | NOT IMPLEMENTED / BLOCKED | No reliable state restoration; lower priority |
| Complete campaign playthrough | BLOCKED | Graph connectivity and static tests do not establish progression |

### Historical RC1 classifications (superseded where above differs)

| System | Status | Boundary |
|---|---|---|
| Native Steam + Sandboxie P1/P2 | VERIFIED WORKING by user | Existing configuration preserved |
| V8 ordinary49/50 E/audio/fade/models | VERIFIED WORKING by user | Authoritative regression chain |
| V11 username receipt/readers | VERIFIED WORKING by user report | Later journal/roles/duplicates not independently reported |
| Cafe204/206 conditional adapters | IMPLEMENTED — AWAITING GAMEPLAY VERIFICATION | Lifecycle and puzzle progression |
| RC1 password242 + four spawns | IMPLEMENTED — AUTOMATED TESTS PASSED | Native journals and player3/4 runtime pending |
| Cafe four-digit PC code | BLOCKED | Per-player native state; no verified map setter |
| Quiet remote reader | FAILED V12 / BLOCKED | Withdrawn; V11 native reader kept |
| Late-join story journal catch-up | NOT IMPLEMENTED | Requires authoritative acquired-note ledger/grant |
| Apartment ammo/syringe physical fallback | IMPLEMENTED — AUTOMATED TESTS PASSED | Selected two locations; no independent ownership |
| Per-client pickup visibility/claims | BLOCKED | Native map interface unestablished |
| 13-map ordinary-door/spawn candidates | IMPLEMENTED — AUTOMATED CHECKS PASSED | 44 doors; no complete map compatibility claim |
| Native two-map portal ring | IMPLEMENTED — AUTOMATED TESTS PASSED | Group readiness, repeated runtime/state QA pending |
| Reliable overflow repair | BLOCKED | Failure path known, traffic/ACK cause unmeasured |
| Console diagnostic parser | IMPLEMENTED — AUTOMATED TESTS PASSED | Not a packet capture or inventory observer |
| Static intro progression graph81 | IMPLEMENTED — AUTOMATED CHECKS PASSED | Conditional/hardcoded routing not runtime proven |
| Other17 spawn plans | BLOCKED | Ambiguous starts or insufficient static clearance |
| Original intro/ready-up adaptation | NOT IMPLEMENTED | Native/original camera inventory saved |
| Host Coop Game menu entry | IMPLEMENTED — AWAITING GAMEPLAY VERIFICATION | Existing host dialog; no complete story selector/resume |
| Host checkpoint / reconnect inventory | BLOCKED | First prove native state read and exact restoration |
| Complete campaign/ending conversion | NOT IMPLEMENTED | End-to-end tests and scripted adapters remain |

Campaign audit counts are static evidence. Converted candidate exits retain stock
map names except the explicitly linked portal pair; no connected81-map campaign
is shipped. Preserve source/BSP hashes and do not mass-convert unknown classes.
