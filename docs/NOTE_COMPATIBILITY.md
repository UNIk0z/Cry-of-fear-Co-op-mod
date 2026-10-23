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

# Integrated note delivery — 2026-10-10

New log: P1 delivery before sign-on; native HUD send100F71D5 zeros code metadata,
client1006F190 updates widgets immediately. CmdStart43/readiness+quiet HUD barrier
and per-slot packet dedup implemented; native zeros are followed by captured code
metadata. Full filename recovery/shared grants remain. No inventory reset.
Automated ordering/resend tests pass. WHITE INVENTORY CAUSE UNPROVEN and actual
visual/code consistency across transitions awaits the integrated gameplay test.

---

# Native journal current state — 2026-10-10

Canonical combined note/inventory topic: this file + PICKUP_RESEARCH + PUZZLE_SYNC;
do not add duplicate NOTE_AND_INVENTORY. Current authorized -dll adapter supersedes
historical map-only limitations below. Latest real test confirms story-note grants
and access for BOTH. Preserve fresh V11/RC2 grant proxies and resource correction.

Confirmed regressions: P1 UI/icons white after second collected PASSWORD paper
(original242, usertype1), and P1 padlock note text lacks numeric digits after map
change although P2 sees them. Causes unproved. Original username243 is distinct;
frozen focused test's assigned order does not establish actual collection order.

Native source journal.hpp/.cpp:16×0x120-byte records at player+0x7A8; exact guarded
allocation0x281C/edict serial. Native ID fields are16 bytes apart; current bounded
17-byte ID validation allows16-char termination in next field. Authored cafe title
+ID-prefix check recovers long original resource filenames; no new assets invented.
AddNote capture requires3 bytes,1 short,11 strings and carries codeFlag/value/type.
Native bank capture skips special nerds records because metadata is external;
accepted original AddNote captures it. Safe collect/restore validates whole bank
before copying; rejection preserves native data and suppresses identical warnings.

adapter.cpp message_end/collect/restore/write_string: forward native first,
canonical grant, post-native PreThink/HUD resync at0.1s per recipient; full resource
in AddNote and matching NoteDoc recall; notifications delivered once per entry/
recipient. No live document handles persisted. Four-recipient fixtures pass;
real report is TWO-player only. Investigate UI bank layout/message metadata/order,
client texture/resources and HUD initialization using new screenshots/log.

Canonical puzzle validation is separate from dynamic client note text; compare
P1/P2 AddNote metadata and recall initialization across actual transition. Actual
saved nerds record has codeFlag1/type1/nonzero value, not proof P1 renders it.
Latest save-restored notes FAIL; old pending late-join statements do not establish
new behavior. See PROJECT_HANDOFF, RC4_REGRESSION_DIAGNOSTICS, RC4_CHECKPOINT.

---

# Story notes

18 relevant note entities across the81-map roster were audited:14 cof_document,
2 cof_passwordnote and2 cof_addcodenote. Latest user report verifies BOTH c_start2
credential papers; RC2 retains their RC1 records/helpers exactly. Another floor
note failed; its map/location was not established, so no specific repair is claimed.

Native cof_document factory100AA2A0 ->10018560, vtable101A7D98, Use100A3B90 sets
the activating player's document handle and sends the native recipient message
on each call. Candidate renames the existing document and places an established
game_zone_player at its original targetname; both IN/OUT fire the same document
with each player as activator. Original content and pickup/script callers stay.
14 adapters are IMPLEMENTED — AWAITING GAMEPLAY VERIFICATION. Unlike password
note cache creation, this path does not require a new document per recipient.

Readers open normally. Closing through the native reader is still required for
archival. Quiet grant remains BLOCKED; failed V12 is not revived. Late-join
catch-up is NOT IMPLEMENTED.2 code-note entities remain player-specific until
their accepted puzzle solution can be synchronized too.

Use document-use-real.txt as private code evidence. Earlier document-use.txt in
the same research directory was a misidentified class and must not be cited.
