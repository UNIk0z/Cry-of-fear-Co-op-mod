# Test results — coop-fixes-012 (Claude, 2026-10-13)

- Native: 13 suites PASS (work/claude-s13-tests-003.log): slot list (1/2/3, use again, timeout, walk away, partner told to wait), partner save owned by the host with both players told, Load Slot 1..3 / empty slot, lights.
- Node: 95/95 (campaign12 package, player folder contents and pins).
- Installer fixture: 1264 PASS (work/claude-s13-install-002). Setup from the PLAYER folder over an installed 011 + uninstall + reinstall + clean PC: 35 PASS (work/claude-s13-setup-002).
- No gameplay verification.

---

# Test results — coop-fixes-010 (Claude, 2026-10-13)

- Native: unchanged adapter; 13 suites PASS for it (work/claude-s10-tests-001.log).
- Node: 90/90 PASS, 0 skipped (campaign10 package + title delta tests).
- Installer fixture: 785 PASS (12 title checks; the old-remover upgrade path is skipped because 010 reuses 009's maps and adapter) (title install, kept original, refusals, restore, other-version skip). Setup over an installed 009: 24 PASS.
- ZIP: 458 entries exact. No gameplay verification.

---

# Test results — coop-fixes-009 (Claude, 2026-10-13)

- Native: 13 suites PASS (work/claude-s10-tests-001.log).
- Node: 88/88 PASS, 0 skipped (campaign9 package test).
- Installer fixture: 1243 PASS. One-step setup over an installed 008 (+ leftovers), unknown file, repair, clean friend PC, Steam discovery: 23 PASS.
- ZIP: 457 entries exact. No gameplay verification.

---

# Test results — coop-fixes-008 (Claude, 2026-10-13)

- Native: 13 suites PASS (work/claude-s9-tests-008.log).
- Node: 86 PASS / 0 fail / 0 skip (campaign8 package test incl. Simon model rebuild from the game files).
- Installer fixture: 1243 PASS. One-step setup (007 + leftovers, unknown file, repair, clean friend PC with the Simon model built, Steam discovery): 23 PASS.
- ZIP: 457 entries exact. No gameplay verification.

---

# Test results — coop-fixes-007 (Claude, 2026-10-12)

- Native: 13 suites PASS (session: Simon via world fields, one userinfo set per map, map models win, unrecognized world refused; story: credit spacing/queue/repeat drop, rejoin restore, missed fan-out replay once and only if missing, checkpoint priority, net tuning once per map).
- Node: 83 PASS / 0 fail / 0 skip (new campaign7 package test).
- Installer fixture on the 007 package: 1243 PASS. One-step setup end to end on copies (user-like folder with 006 + RC1/RC2/RC3 + test maps, unknown-file refusal, repair, clean friend PC, Steam discovery): 22 PASS.
- ZIP: 457 entries exact. No gameplay verification.

---

# Test results — coop-fixes-006 (Claude, 2026-10-12)

- Native: 13 suites PASS (new story suite: dual wield command and slot guard, weapon-hand pose/attack without holding the anim lock, dual-wield save, shared ending flags across map changes and saves, per-player story wound/night vision once per map, schema 4 and schema 3 compatibility).
- Node: 81 PASS / 0 fail / 0 skip (new campaign6 package test: maps/plans/extras identical to 005, 17 sources, baseline extras).
- Installer fixture on the 006 package: 1243 PASS. Upgrade/rollback paths from coop-fixes-005: 17 PASS. Continue launcher: 16 PASS (schema 4 save).
- ZIP: 451 entries exact. No gameplay verification.

---

# Test results — coop-fixes-005 (Claude, 2026-10-12)

- Native: 12 suites PASS (new session suite: light policy, frags resync, cutscene ScoreInfo resync, Simon model, pause attribution, main-menu host commands, per-session log).
- Node: 79 PASS / 0 skip (new: campaign5 build differs from 004 only in the prologue without rain; menu entry format).
- Installer fixture on the 194-map package: 1240 PASS (work/claude-s6-install-001). Upgrade/rollback paths from coop-fixes-004: 17 PASS (work/claude-s6-upgrade-001).
- ZIP: 447 entries exact. No gameplay verification.

---

# Test results — coop-fixes-004 (Claude, 2026-10-11)

- Native: 11 suites PASS (new: spotlight bits/ViewEntity resync, keypad sharing, schema 3, story text mirror, objective share).
- Node: 77 PASS / 0 skip (new: campaign4 overlay, routes, doors, plans).
- Installer fixture on the 194-map package: 1225 PASS (work/claude-s5-install-005). Upgrade/rollback paths: 16 PASS (work/claude-s5-upgrade-001). Continue launcher: 16 PASS (schema-3 save).
- User's current slot1 (schema 2, s4_start_e0) reads with the new reader (read-only copy).
- ZIP: 256 entries exact. No gameplay verification.

---

# Test results — coop-fixes-003 (Claude, 2026-10-10)

- Native: 11 suites PASS (new: world/campaign checkpoints, landings, boat).
- Node: 72 PASS / 0 skip (new: coop-fixes3 stage).
- Installer: 158 PASS. Upgrade/rollback: 16 PASS (incl. removing coop-fixes-002). Continue: 16 PASS (incl. a later-campaign save).
- The user's real schema-1 slot1 save decodes and re-encodes as schema 2 (read-only copy).
- ZIP: 70 entries exact. No gameplay verification.

---

# Test results — coop-fixes-002 (Claude, 2026-10-10)

- Native: 10 suites PASS.
- Node: 69 PASS / 0 skip.
- Installer: 155 PASS. Upgrade/rollback: 16 PASS. Continue: 13 PASS.
- ZIP: 68 entries exact.

Logs: work/claude-s3-*.

User gameplay on coop-fixes-001, verified working:
- ladder lock;
- black box gone;
- P1 notes, events and inventory restored.

Failed: see BUG_TRACKER.

---

# Test results — coop-fixes-001 (Claude, 2026-10-10)

- Native: 9 suites PASS, adding the ladder suite and the reworked
  identity/Continue checks in checkpoint-runtime.
- Node: 69 PASS / 0 skip, adding coop-fixes-rc4.test.mjs (spawn block wall and
  title train chain).
- Installer fixture: 152 PASS. Upgrade/rollback paths: 16 PASS. Continue: 13 PASS.
- PowerShell: 15 files parse. ZIP: 66 entries exact.

Logs (work root): claude-s2-tests-001.log, claude-s2-node-tests.log,
claude-s2-install-001, claude-s2-upgrade-001, claude-s2-continue-001.log.

---

# Test results — campaign-doors-001 (Claude, 2026-10-10)

All automated; no gameplay.

- Native: 8 suites PASS — journal, puzzle, adapter, camera/notes, probe,
  checkpoint, checkpoint-runtime (now with reason assertions), keydoor (new).
- Node: 67 PASS / 0 fail / 0 skip. The new test is tests/campaign-doors-rc4.test.mjs,
  run with COF_INTEGRATION_BUILD.
- Installer/rollback fixture: 149 PASS. Upgrade paths, including your actual
  integration-001 install and the baseline reinstall: 31 PASS. Continue launcher: 9 PASS.
- PowerShell: 15 files and 10 documented blocks parse. ZIP: 64 entries match the folder exactly.

Logs are under the work root: claude-keydoor-tests-001.log, claude-node-tests-001.log,
claude-install-001/verification.json, claude-rollback-001/verification.json and
claude-continue-001.log.

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

# Final handoff test status — authoritative 2026-10-10

Latest user observed real Steam/Sandboxie test: shared story-note grants/access
PASS BOTH. Host white inventory after second PASSWORD note242, host missing numeric
padlock-note content after transition, invisible title vehicle, post-padlock
scripted incompatible door and recorder/Continue restore FAIL. The latter is not
an operational save system. Screenshot/new-log evidence will arrive next session.
Previously verified V6/V8 doors, RC3 build007 opening/nightmare and maintenance
automatic intro progression remain preserved; no full campaign/4-player claim.

Frozen current candidate QA:65 Node pass/0fail/0skip (2 ENV-006 files excluded),
6 native owned fixture suites,141 installer/rollback,9 Continue,7 PS parse;
846 exports/843 jumps;47 exact archive files. Tests do not load original backend
or launch game. No unchanged implementation suites rerun for documentation-only
handoff. Source/package/baseline hashes and actual file presence checked separately.

Actual unboxed slot1 save/backup inspected read-only, both SHA2723866c48812cf07c7454870171f44289fe3e3a2e74b964edef2f0a396bd02b.
Current native decoder ACCEPTS full5,390-byte payload:2 player weapon/inventory
records,3 notes incl. code metadata, puzzle data, completed flags. No location/full
world serialized. Valid persisted records are not proof they were restored.
Private audit tool compiled with existing x86 /W4 /WX settings; original DLL never
loaded. See RC4_CHECKPOINT and current private redacted-save-inspection.txt.

Final handoff audit:121 checks PASS/0fail for18 updated documents, balanced Markdown
fences/references, exact artifact paths,9 compiled/packaged native source pins,
8 latest and8 maintenance BSP hashes, latest ZIP/DLL,12 protected baselines and
both private save copies. Git diff whitespace check passed. Audit remains in
current-chat work/final-handoff-private/handoff-checks.json; no raw save/IDs in Git.

No Codex real gameplay observation, new game install/launch, source feature or
package rebuild in this handoff. Older sections retain exact historical evidence.

---

# Actual verification — 2026-10-09

## Final build007 QA / package — 2026-10-09

Implementation80dc7dc; bundle in NEW chat outputs/rc3-two-client-test.zip.
469322bytes/229text files, SHA2566799c34cc6a79d196a1fcb94372bc1a72e03e4a05482b8dc7497e4e172cd3d59.
All ZIP entries match extracted files.209 RC2 files match the unchanged immutable
RC2 ZIP. Prior RC2/RC3 archive hashes unchanged.7 shipped PS scripts parse.
53 Node PASS/0fail/0skip;41 Windows PowerShell fixture assertions PASS, including
005->007 upgrade path and old-remover refusal before deleting newer/changed files.
Exact QA machine report docs/RC3_VERIFICATION.json; NEW work/rc3-resume-001,
work/rc3-install-check-007. Prior196 resource audit retained: no added media/items.

New actual Steam VerifyOnly stops at first RC2 dependency s2_apartment1_e7 missing
or changed; included full RC2 prerequisite, guard retained. No game writes/launch.
User confirms RC3 not yet tested; direct load/natural transition/rendering/control/
inventory all await gameplay. Hang cause NOT ESTABLISHED; late joining unsupported.
Solo-ready UI can close although guard prevents intro: restart, both join before
ready. Guide now waits75s with only P1 ready after BOTH join. Known first defect
requires actual two-client evidence before another opening-map modification.

Implementation recovered from f0997d5; no existing tooling or195-map rebuild.
Root bundle wrapper just calls both existing installers and stops on failure.
Previous implementation/QA retained; user sdw edit excluded from all commits.

## Latest: RC3 opening engineering PASS; RC2 actual opening FAILED

RC3 implementation82007ac; build work/rc3-opening-build-005.52 applicable Node
tests PASS/0fail/0skip, including6 new opening tests and46 existing regressions.
Two known ENV006 staging files excluded, not retried. Focused first run5pass/1fail
was an assertion that incorrectly required a unique diagnostic/relay shared
targetname; corrected test, no implementation change. Final52 passed.

33 Windows PowerShell fixture assertions PASS: reconstruction equals Node for3
complete BSPs, source/plan/DLL/output and missing/changed dependency guards,
repeat installation, all-or-nothing preflight and guarded removal, four RC2
dependencies/originals/native DLL/unrelated sentinel retained. Runtime is not
simulated by this fixture.196 actual Steam resource paths exist; initial checker
path false positives corrected for native mp3/commentary and sv_coop_music args.

Actual3 source BSP/DLL pins match. Actual production VerifyOnly BLOCKED because
all4 RC2 continuation dependencies absent from unboxed Steam maps. No writes.
Steam launch ShowCommand resolves app223710 +maxplayers2 +mapcof_campaign_story3;
no launch. Initial sandbox registry read denied; authorized read-only call passed.

User actual RC2 intro started before ready; P2 camera/effects/equipment and
nightmare location FAILED; vehicle-shot overbrightness observed; nightmare->wake
host hung/P2 timed out, host force-closed. Latest log reaches Server#4, no RC2
overflow/fatal stack. RC3 direct-load/natural progression/two-client results are
AWAITING GAMEPLAY VERIFICATION. Hang cause not established. All16 acceptance
rows pending; late-join recovery remains BLOCKED. Raw evidence work/rc3-opening-001
and work/rc3-install-check-001. See RC3_OPENING_REPORT/TEST and NEXT_SESSION.

## Historical: connected RC2 engineering PASS; gameplay pending at that time

Final ZIP209 text files/438594bytes; every entry hash matches extracted package.
No BSP/DLL/media/log files distributed; original RC1 archive checksum unchanged.
RC2 SHA256 eb1cddefe24dab11a262ea9d9ccda527d0e4938a0ff123dd94ea0c9541472fbf.

Current private build connected-campaign-005; implementation539c5c0/packagee96c8f9.
46 applicable Node tests PASS,0failed,0skipped (~14s).2 previously blocked ENV006
staging files deliberately excluded. New5 integration tests inspect all195 full
BSPs, original model records/13 nonentity lumps, ready metadata, closed alias
graph, declared blocked entries, original destinations/conditions, V8/RC1 note
and door records,14 document dispatchers and311 original camera timelines.

Windows PowerShell195-plan VerifyOnly PASS against snapshot AND actual Steam
originals; expected full BSP hashes/sizes all match.25 fixture assertions PASS:
three representative outputs equal Node; source/plan/DLL/unknown alias refusal
before writes; idempotency; changed-file rollback refusal before deletion; removal;
originals/DLL/unrelated baseline sentinel preserved. Both scripts parse. No game
files written or launched. Resource audit38 changed/appended references present.

Initial new regression failure used first-match lookup for intentionally shared
note counter names. Corrected test to compare stable entity indices; no production
note changes. One omitted existing apartment fixture was supplied. Focused6 then
final46 passed. Neither failed attempt is reported as gameplay evidence.

Native-code query mismatch explains why the translated RC1 ready-region approach
was invalid. RC2's cloned zero-origin AABB is structurally validated, not a proven
map-change fix.182 arrival candidates/13 blocked,159 new door candidates/172 retained
destination doors. End-to-end progression, PC shared acceptance, late joins,
lobby/launcher and saves are NOT PASSED. Latest user gameplay supersedes historical
RC1 rows: both credentials work; portal/menu/apartment destinations/other note fail.

Evidence: work/campaign-rc2-research and work/campaign-rc2-install-check-001.

### Historical results

## Latest: consolidated experimental RC1 engineering PASS; gameplay NOT TESTED

41 applicable Node tests PASS/0fail/0skip; two known ENV006 staging files excluded
without retry or pass claim. New RC1/portal/batch/graph/log tests plus existing
BSP/door/cafe/V11/withdrawn-V12 regressions included. No map timing changes after
that run; one test's descriptive name corrected. PowerShell installer/collector
parse and package-builder syntax checked.39 fixture assertions pass for complete
PS==Node maps, all preflight guards, repeat install, exact menu backup/restoration,
changed-file removal refusal, custom-menu opt-out, V11 retention and P2 log copy.
Windows PowerShell atomic replacement null argument was corrected before issue.
Actual Steam read-only VerifyOnly -AllDoorCandidates:16 plans/menu PASS, no writes.
Evidence work/rc1-qa-001; release VERIFICATION.json records structural/package QA.
No gameplay/HLDS/native UI automation. All new map/presentation/pickup/portal/
menu runtime features AWAITING GAMEPLAY VERIFICATION. No overflow fix, PC sync,
quiet archival, persistent host saves or end-to-end campaign claim.

## Latest: single-note candidate engineering PASS; journal gameplay NOT TESTED

34full Node tests pass/0fail/0skip. Cafe candidate parent unchanged except243;
password242 and inventory/computer/story objects preserved. Complete BSP/lumps/
source bytes retained. Generated one-use proxy, four native helper instances,
IN/OUT fan-out,1..4/gapped-slot routing and dispatch cleanup validated statically.
Independent PS==Node output, syntax, repo/flat manifest, source/output/known skip,
unknown-file install+remove, wrong native DLL, rollback/reinstall checks pass.
Game DLL is READ/hash guarded, never changed. Original/previous reference hashes
retained. Evidence: work/shared-note-002/, shared-note-install-check-001/ and
note-source-001/ bounded native analysis/actual Steam read hashes.
Read-only analysis confirms native document creation/recipient handle/message,
zone enumeration and exact counter thresholds. EHANDLE assignment is not proof
of persistent journal insertion. All user-facing E/journal/native notifications/
content/duplicates/inventory/visibility/story checks still NOT TESTED.

## Latest: cafe adapter engineering PASS; gameplay NOT TESTED

V9 cafe failure reported by user; exact actor/side/condition not recorded. V10
c_start2_coop_cafe adds condition-aware candidates for204/206 and preserves the
ordinary pair/reference.32 Node tests pass, zero failures/skips. Tests prove raw
record/lump preservation, source/repeat guards, helper selectors, state wiring,
enable idempotence, pending-move life gate and repeat-load reset under reference
semantics. These are NOT game-DLL execution. Original notes unchanged.
PowerShell syntax, source/output guards, repo/flat manifest lookup, known skip,
changed-output install/removal protection and rollback/reinstall pass. Exact
PS==Node bytes and unchanged reference hashes verified during packaging.
Evidence: work/cafe-doors-001/ and work/cafe-doors-install-check-001/.
Steam actors, cafe return enable, computer/removal, fade cancellation, reload
and overlap remain NOT TESTED. No map/DLL was installed or launched by Codex.

## Latest: production c_start2 conversion engineering PASS; runtime NOT TESTED

V7/V8 presentation reference verified by user only49/50. New c_start2_coop_full
SHA256 f863ee55f5404a69d2edb278f7261f966ac6a57a2a8dcda0f58a9e173a42ebad,455entities/18,701,086bytes.
Converted2/4 same-map doors;2cafe exceptions,1cross route and3locked/noexit intact.
PASS30 Node tests (0fail/0skip), including all existing suites and targeted
conservative conversion checks. V8 SHA unchanged after factory extraction;
production ordered pairs identical to v8 minus2game_text probes; no beep/debug.
4 original records modified,439 raw records VERBATIM;14 other lump ranges/hashes
and original bytes12..EOF retained. All5 prior BSP hashes retained. References
unique, player selector key omitted, standing samples supported (static only).
PASS independent PS==Node full bytes; source/existing-file/remove/rollback guards.
Evidence work/c-start2-full-002/verification.json/node-test-output.txt and
work/c-start2-full-install-check-001/installer-verification.json.
NOT GAMEPLAY TESTED: new alias loading/spawns/visibility, per-door production
operation, retained restriction/puzzle behavior, concurrency and player overlap.
Per-door C_START2_DOOR_MATRIX.csv separates reference from new-map results.
No whole-map or campaign gameplay success claimed; cafe conversion remains blocked.
Final Steam read: original/all5 references match expected hashes; new alias
absent. ZIP exactly5 intended asset-free entries with source-equal hashes PASS.
Evidence work/c-start2-full-002/steam-read-verification.json/package-verification.json.

## Latest: v7 audio / v8 full presentation VERIFIED BY USER

Audio: E, original audio, both actors relocate and mutual models PASSED BY USER.
Fade pair49/50: P1/P2 independent E, story-style sound, fade-out/relocation/
fade-back, BOTH directions, mutual models and no reconnect PASSED BY USER.
This verifies the tested pair, NOT all c_start2 doors, exact sub-frame timing,
same-panel simultaneous acceptance or destination overlap under concurrency.
Preserve v8 unchanged; new production alias must receive its own gameplay test.

## Latest: v7/v8 engineering PASS; presentation gameplay NOT TESTED

V6 core remains VERIFIED BY USER: both actors use E, both directions and mutual
models pass. Sound/fade/concurrency were not part of that confirmation.
A c_start2_dooraudio:453entities/18,700,674bytes;
SHA256 914d62c76c44265fa19076e7b200864e17b3cf06e2dbd0f9688f93049ec91176.
B c_start2_doorfade:457entities/18,701,626bytes;
SHA256 4a0e1ddb450133d429250bb1d480689f4c9c1dc7949844affd2b541507b76a23.
PASS: targeted Node actual-source fixture test (1pass,0fail,0skip), deterministic
and source/repeat guards, v6 baseline file hash unchanged, exact point/destination
pairs and omitted selectors retained; scoped buttons/HUD plus6/10 additions,
all439 unrelated original records and14 lumps/source bytes retained. Graph
target resolution, audio flags50/samples, threaded managers1, env_fade4/5 with
finite duration/hold and no permanent flag are configuration checks only.
PASS: both independent PowerShell outputs == generated Node full bytes;
syntax, both manifest locations, known skip, wrong source rejection, changed-file
install/remove protection, rollback/original retention and reinstall.
Evidence: work/door-presentation-001/verification.json; work/door-audio-install-check-001/
installer-verification.json; work/door-fade-install-check-001/installer-verification.json.
WAV names/hash/durations and installed exports verified from existing snapshot,
work/presentation-support-001.json. No assets changed/copied into deliverables.
NOT GAMEPLAY TESTED: original audio audibility/one-shots, fades, delayed activator,
full-black relocation timing, controls/recovery, concurrency/cooldown or candidate
visibility. Native fade timing remains unknown; defaults are approximations.
Final approved Steam read confirms original and installed v6 known hashes;
audio/fade aliases absent; actual WAVs match snapshot hashes. Evidence:
work/door-presentation-001/steam-read-verification.json. No game writes.
Package PASS: exactly5 intended asset-free entries, source-equal hashes;
work/door-presentation-001/package-verification.json. Final targeted Node run:
1pass/0fail/0skip, work/door-presentation-001/node-test-output.txt.

## Latest: v6 core transition VERIFIED BY USER

User tested c_start2_useselect from759c141 through normal Steam + Sandboxie:
P1/P2 each activate E and relocate; green marker works; BOTH directions pass;
mutual models stay visible. Core cooperative Use transition PASSED BY USER.
Original fade/door audio NOT implemented/tested. Simultaneous activation not
separately reported. Preserve v6 unchanged for regression comparison.

## Latest: v5 dispatch passes, relocation fails; v6 engineering PASS

USER: E shows USE49 ACTIVATED with sound for BOTH players; neither relocates.
Button target dispatch is confirmed; point callback/selector root cause unmeasured.
Reverse50, placement and post-transition visibility not tested. Status/hash absent.

V6 c_start2_useselect:447entities/18,699,580bytes, SHA256 c4a310d5ff2ef72f8794044cbc38b9d3447f836b9a4ce07b02a92c8b245b1566.
PASS: PS==Node full bytes; only helpers443/444 message-empty keys removed from
v5 (26 entity-text bytes); all other records unchanged; all14 other lump ranges,
hashes and original bytes12..EOF retained. Deterministic/source/repeat guards,
PS syntax, both manifest locations, known skip, unknown-file install/remove
protection, rollback/original retention/reinstall PASS. Evidence:
work/use-selector-001/verification.json and
work/use-selector-install-check-001/installer-verification.json.
Runtime NOT TESTED. Native omission is real configuration evidence, not proof
of a multiplayer fix. No Steam writes, game launch or Sandboxie changes.
Final approved read: original and installed v5 match known hashes; v6 absent.
ZIP verified exactly3 asset-free entries with source-equal content hashes.
work/use-selector-001/steam-read-verification.json and package-verification.json.

## Latest: v4 E failure; v5 engineering checks

USER: both P1/P2 E attempts produce no relocation, solid panel blocks passage;
no console error reported. Map status/hash not recorded. No button/point/root
cause conclusion. V4 core acceptance FAILED by report.

V5 c_start2_useprobe:447entities/18,699,606bytes; SHA256
79c096cc82cf6d7f12f25189904a84cd3de26b3f4ceb5b833ba0821bf165c9b4.
PASS: actual PS==Node full bytes; v4 comparison only flags17->1/sounds0->3 on
two buttons +2HUDmarkers; point/destinations unchanged. All14 other lump/source
bytes retained. Deterministic/source/repeat guards; deliberate one-point/one-marker
fan-out; PS syntax, both manifest locations, known skip, unknown-file install/
removal protection, rollback/original retention/reinstall PASS. Evidence:
work/use-probe-001/verification.json and
work/use-probe-install-check-001/installer-verification.json.
Static representative world eye approaches empty (not engine trace).
HUD display/Use/relocation/actor selection/visibility/return NOT GAMEPLAY TESTED.
Approved read: host's installed v4 SHA matches expected, original unchanged,
probe alias absent, cue asset present. ZIP installer/manifest/guide entries match
source hashes; no BSP/assets. Runtime status wasn't recorded in failed test.
No Steam writes/game launch/headless retry/Sandboxie modification by Codex.

## Latest: v3 gameplay failure; v4 Use replacement validation

USER-VERIFIED: c_start2_doornative FAILED visibility; model declarations
insufficient. Native campaign doors personally observed by user load separate
BSPs. Preserve outward v2 bypass pass; reverse still pending. Earlier pending
v3 statuses below are historical.

V4 c_start2_dooruse — NOT GAMEPLAY TESTED / NOT INSTALLED BY CODEX.
PASS: full445-entity BSP (18,699,076 bytes); only original48..51 changed,
two helpers added; other439 original entity records verbatim; all14 non-entity
lump offsets/lengths/hashes and original source bytes after header preserved.
Button flags17/wait1/noTouch, named helpers/direct targets uniquely resolved;
original destinations/yaws/spawns/models unchanged; prior static standing
destination probes empty/supported. Existing bypass hash unchanged.
PASS: PS syntax; independent PS==Node complete bytes; deterministic/source/
repeat guards; both repo and flattened-package manifest lookup; known-file skip,
changed-file install/removal refusal, rollback/original retention and reinstall.
Evidence: work/use-door-experiment-001/verification.json and
work/use-door-install-check-001/installer-verification.json. New output SHA256:
ff183cf19f9dffc210803d572a0083facca7f74897f2d0c064e76e7cd290355a.

NOT TESTED: Steam point teleporter participant/hull behavior, Use reach/solidity,
button reset, two-way visibility, reverse and repeated usage. New point handler
is not the exact user-verified Touch bypass. No claim of root cause or completed
conversion. USE_DOOR_TEST prioritizes P2 alone first to catch host-only/group use.
No generic unchanged suite rerun, headless probe or Steam/Sandboxie changes.

## Earlier: v2 user results and v3 engineering validation

USER-VERIFIED v2: both aliases loaded. Control Use relocation FAILED two-way
model visibility. Bypass outward touch relocation and mutual models PASSED;
reverse NOT TESTED. Screenshot reported by user but not attached here.

V3 c_start2_doornative: NOT GAMEPLAY TESTED / NOT INSTALLED BY CODEX.
PASSED actual-file checks: 18,699,315 bytes, 443 entities, only worldspawn gains
four model pairs; all other records verbatim, all original pairs retained,
14 non-entity ranges/hashes and original file bytes after header retained.
Spawns, targets, destination feet positions and collision geometry unchanged.
Independent PowerShell and Node outputs exactly equal; deterministic rebuild;
wrong-source/repeat guards, PS syntax, known-file skip, changed-file install/
removal refusal, rollback/original retention/reinstall all pass.
Evidence: work/native-door-experiment-001/verification.json and
work/native-door-install-check-001/installer-verification.json.
Output SHA fd4979bbb018c1b3f9a4f0d1ce06fd0cc05ce1ff8b9ffb84e291c07943b3049c.

Approved Steam read: original hash unchanged, v3 alias absent, required police
model MDLs present. ZIP only installer/guide/manifest. No game launch, Sandboxie
configuration change or original game file writes. Existing tool suite unchanged
and not rerun. Native survey is entity-data evidence, not a native door runtime
pass or compiled-function proof. Full Use/visibility/presentation/return acceptance
remains OPEN; NATIVE_DOOR_TEST is the next user-assisted test.

## Earlier real user reproduction and door experiment v2

USER-VERIFIED: native co-op works using Steam + Sandboxie Plus on one PC; original
c_start2 loads; same-map story doors relocate both players with connection,
controls and collision intact, but mutual visibility disappears. After P2 rejoin,
P1 sees P2, P2 does not see P1. Exact tested door/map status not captured. This
was ORIGINAL c_start2, not the earlier cooperative-spawn experiment. No fresh
Codex runtime observation is claimed. Initial transient overflow/crash remains
an independent issue of unknown cause.

PASSED engineering: new builder/control and bypass; PS syntax and independent
reconstruction match Node bytes; only four classname values changed; all other
entity text/pairs, counts and 14 non-entity offsets/lengths/hashes retained;
static standing destinations empty and supported. Deterministic build,
wrong-source/repeat rejection, quoted-brace/comment span handling, known-file
skip, changed-file protection for BOTH aliases before rollback, successful
rollback and original source retention passed on work fixtures.
Evidence: work/door-experiment-001/verification.json, report alongside it;
work/door-install-check-001/. Bypass SHA256
7d2f8c347f97e2135d9cbb49cc871c9d7cac2d16a0559b75a0841b59c79518f0.

PASSED final approved source check: installed original SHA still matches;
both new aliases absent; SDK-default coop door model absent in actual Steam
installation too. ZIP inventory verified: installer/guide only, no game assets.

Historical before user's v2 results above — NOT TESTED: alias loading, correct CoF runtime teleport/hull behavior, new
visibility result and interaction regressions. Touch activation instead of Use
and bypassed door sounds/fades are explicit diagnostic limitations. No Steam
map installation, Sandboxie setting change or executable launch by Codex.

Complete final acceptance (original door operation AND persistent two-way
visibility without reconnect) remains OPEN. DOOR_TEST contains exact next steps.

## Gameplay package v1 checks (latest)

- PASSED: dedicated installer PowerShell syntax and reconstruction using actual
  staged c_start2. Output 18,699,548 bytes, SHA256
  12b52fb58d8ad99f511a7202eed2702066e898faea0a00ed68c61962138a67ec.
- PASSED: 443 original entity records retained, four added; all 14 non-entity
  lump hashes/offsets/lengths retained; original bytes from offset 12 through
  original EOF unchanged. Evidence: work/gameplay-package-check-001/verification.json.
- PASSED: existing alias rejected; changed alias retained on removal attempt;
  wrong original SHA refused before installation; known alias removed by rollback;
  fresh reconstruction restored; original sample SHA unchanged.
- NOT TESTED: Steam UI launch, native session/client baseline, alias engine load,
  inventory/config inheritance, visibility, doors, scripted events and transitions.
  No game process launched or Steam file changed in this session.
- PASSED: final approved read found installed original c_start2 SHA256 still
  3933456e6c0e8a449ec17e7829c9d69a8880a1e414b54dd6c0cf2b361483157e;
  c_start2_cooptest.bsp is absent from Steam. ZIP inventory verified: only guide
  and installer, no copyrighted map or executable components.
- fonts.wad is likely a nonfatal optional-load warning based on published ReHLDS
  control flow. CoF-specific behavior and the old probe's stall cause are still
  unverified. GAMEPLAY_TEST includes sources and the user-assisted test procedure.

Existing tests below are historical evidence, not this session's gameplay passes.

## Latest session results (supersede historical access statuses below)

- PASSED: 24 engineering tests, 0 failed/skipped, approximately 2.26 s. Transcript
  logs/session-02-tool-tests.txt. All three PowerShell helpers pass syntax parsing;
  probe-runtime.mjs passes Node syntax checking.
- PASSED: nine actual BSPs parsed, eight-map scan and three structured comparisons
  generated. Original sample hashes matched before/copy/after. FGD inspected.
- PASSED: actual c_start2 experiment generation, 443 -> 447 entities; original
  entity pairs/text preserved and all 14 non-entity lumps/hash ranges unchanged.
  Generated output hash: 12b52fb58d8ad99f511a7202eed2702066e898faea0a00ed68c61962138a67ec.
- PASSED: selected spawn points empty in static world hull 1 with nearby solid
  support, conventional standing boxes separated, relevant brush bounds checked.
  These checks do not prove engine/player behavior.
- PASSED: independent runtime snapshot created; 19 critical/config files verified.
  Final original-source check found no changes to those files or the eight map
  samples. SDK and native-entry copied hashes match sources. Evidence:
  workspace work/environment/source-verification-002.json.
- FAILED: sandboxed native hlds process creation (spawn UNKNOWN), before launch.
- BLOCKED: approved isolated native hlds attempt reached console
  initialization, emitted `W_LoadWadFile, couldn't load fonts.wad`, no map-load
  evidence, no qconsole.log. Quit attempted at 10 s; process killed at 15.03 s.
  Exact output/arguments/exit: workspace work/environment/runtime-probe-001.json.
  Fonts warning is observed; it is not proven as the sole cause of the incomplete launch.
- PASSED: final process check found no hlds process left running.
- NOT TESTED: original Steam client baseline, copied client/listen-server support,
  two authenticated clients, experimental map engine loading, player visibility,
  door behavior, synchronized transitions, cinematics, death/reconnect and inventory.

The static-inspection/experiment milestone passed. No playable prototype or
runtime compatibility fix has passed. The earlier game-access blocker is resolved
through approved read commands, while normal sandbox reads still fail.

## First-session historical evidence

## PASSED: toolkit only

- Node v24.17.0 and Git 2.54.0.windows.3 execute from the recorded VS paths.
- BSP/CLI suite: 16 tests, 16 passed, 0 failed/skipped (initial run).
- PowerShell staging integration: 1 test passed, 0 failed/skipped.
- Final consolidated run: **17 tests passed, 0 failed, 0 skipped**, duration
  approximately 2.16 seconds. Output: logs/tool-tests-2026-10-08.txt (ignored).
- PowerShell parser syntax checks passed for both .ps1 helpers. This does not
  establish successful environment-probe execution against the live library.
- Synthetic BSP reading checks all 15 hashes, exact text, and unchanged input bytes.
- Invalid versions/headers/ranges/overlaps/entities fail closed.
- Duplicate keys, literal backslashes, non-ASCII bytes, repeated entities, and
  ambiguous names retain their representation without inferred engine semantics.
- CLI inspect/compare/scan run as real child processes and write reports.
- CLI input hashes remain unchanged; existing/unsafe outputs are rejected.
- Eight-map synthetic scan emits three comparisons; missing/corrupt inputs receive
  explicit statuses and nonzero exit codes.
- Staging copies exactly eight synthetic files; source/copy hashes match; an
  existing or outside-work destination and missing inputs are rejected.

These are engineering-tool passes. They prove no gameplay behavior.

## FAILED / BLOCKED environment checks

- FAILED: direct Python and py alias execution ('file cannot be accessed').
- FAILED: direct .ps1 invocation under the current execution policy. Our staging
  test succeeds with process-scoped Bypass; no machine/user policy was changed.
- BLOCKED: actual D: manifest, install layout, maps and SDK inspection. Permission
  grants did not remove denial; escalation is disabled by policy.
- BLOCKED: full child environment probe. Initial process cancelled; follow-ups
  terminated at 20 seconds. No completed environment report exists.

## Game verification

| Category | Result |
|---|---|
| Original game baseline launch | BLOCKED — cannot locate/read executable through the indexed library |
| Actual BSP parsing / pair comparison | BLOCKED — actual map bytes unavailable |
| Original hashes / safe launchable overlay | NOT TESTED — no source files or launch configuration available |
| Native co-op host and second client | NOT TESTED |
| Visibility at spawn / after transitions | NOT TESTED |
| Broken-door fix / enemies / story items | NOT TESTED |
| Cinematics / controls / shared progression | NOT TESTED |
| Death / reconnect / native-map regression | NOT TESTED |

No game executable was launched or left running. No game asset was modified.
The user's historical multiplayer observations are recorded as reports, not
fresh local test passes. Final consolidated evidence is recorded in PROGRESS.
# 2026-10-09 RC1 implementation checkpoint

Focused candidate/graph/parser tests:9 PASS/0fail/0skip. V11 byte hash regression,
password helper separation, native four spawn slots, deterministic complete BSPs,
all14 unchanged geometry/PVS/collision lumps, source bytes12..EOF, portal aliases,
resource clone count/keys retention and parser non-attribution passed. Initial
resource-loop and missing-parent-spawn assumptions were corrected before issue.
Installer/menu packaging checks pending at this checkpoint; no gameplay launch.
The old unrelated staging PowerShell Get-FileHash failures remain ENV006 and were
not retried. Existing sections below record earlier experiment histories.
