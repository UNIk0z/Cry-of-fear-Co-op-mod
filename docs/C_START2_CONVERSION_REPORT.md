# c_start2 conversion report

Source: original c_start2.bsp SHA256 3933456e6c0e8a449ec17e7829c9d69a8880a1e414b54dd6c0cf2b361483157e,443entities.
Output: c_start2_coop_full.bsp SHA256 f863ee55f5404a69d2edb278f7261f966ac6a57a2a8dcda0f58a9e173a42ebad,18,701,086bytes/455entities.
Reference: c_start2_doorfade SHA256 4a0e1ddb450133d429250bb1d480689f4c9c1dc7949844affd2b541507b76a23, VERIFIED BY USER on49/50.
**New alias NOT GAMEPLAY TESTED. This is not a fully compatible map claim.**

## Coverage and stable door IDs

All8 original inter_door entities enumerated:4 same-map,1 cross-map-linked,
3 locked with no destination. Exactly2 ordinary same-map doors converted;2
scripted cafe transitions remain for manual review. Every ID uses the zero-based
original entity index and fixed source hash; original indices are retained.
Coordinates are brush centers, not destination feet/player origins. Reverse
candidates are geometry hints; conversion never invents another direction.

| Stable ID | Model / approximate source center | Destination | Decision | Reason |
|---|---|---|---|---|
| c_start2:D0006 | *1; 2496.5 -1012 -707 | none | RETAINED locked-no-destination | lockedby=a_big_dong; missing/unsupported opening or closing WAV reference; no unique inter_door_exit destination |
| c_start2:D0019 | *5; 2423 -907.5 -719 | lolexit2 | RETAINED cross-map | missing/unsupported opening or closing WAV reference; cross-map activation path 15 -> 17 |
| c_start2:D0049 | *6; 3656 -1278.5 -849.5 | d1_1_exit1 | CONVERTED ordinary | Verified v8 chain; production NOT TESTED |
| c_start2:D0050 | *7; 1039 -1689.5 -849.5 | d1_1_exit2 | CONVERTED ordinary | Verified v8 chain; production NOT TESTED |
| c_start2:D0204 | *14; 1008.5 1985.5 -547 | s1_1_exit1 | RETAINED manual review | externally named door; preserve enable/remove/script semantics |
| c_start2:D0206 | *15; 1031.5 1985.5 -547 | s1_1_exit2 | RETAINED manual review | externally named door; preserve enable/remove/script semantics; special spawnflags=4 |
| c_start2:D0227 | *16; 2872 -769.5 -720 | none | RETAINED locked-no-destination | lockedby=dsasad; no unique inter_door_exit destination |
| c_start2:D0228 | *17; 2942.5 -832 -720 | none | RETAINED locked-no-destination | lockedby=dsasad; no unique inter_door_exit destination |

## Intentional changes

Original49/50: inter_door -> func_button; model/render fields retained. New
targets cof_story_present49/50; flags1, wait2.5, sounds0, delay0. Original
opening/closing WAV references move to helper emitters. Original unlocked/locked
messages, lock sounds, musicfadein/out2 and doortype0 metadata are removed only
from these already-unlocked converted records, matching verified v8 behavior.
No key/master/state condition was present on either converted door.

Original48/51: classname becomes info_teleport_destination. Names, feet origins,
angles and pair order retained: d1_1_exit2=(3655,-1257,-896),yaw90;
d1_1_exit1=(1040,-1711,-896),yaw270. Two cof_teleport helpers omit message.
Each route adds2 original-WAV emitters,2 activator-only fades,1 threaded manager;
12 entities added total. Sequence and fields are exactly v8's after deleting
its2 green game_text markers. No probe, access beep or debug-only helper added.

All439 other original entity records remain VERBATIM. All14 non-entity lump
offsets/lengths/hashes and original bytes12..EOF retained. Geometry, lighting,
PVS, collision, enemies, spawns, inventory, original ambient audio and story
logic receive no edits. Retained restrictions are structurally unchanged;
their actual cooperative behavior still needs gameplay verification.

## Explicit exceptions

D0204 targetname cafedoors is killtarget of relay345 killcafedoors. Story
manager339 multimystery schedules that relay. D0206 targetname cafedoors2 has
initial disabled flag4, relay412 killcafedoors2, and controller414
inter_door_disable (frags1), fired by trigger_once413. Their controller/remove
semantics on a replacement func_button have not been verified. Both doors,
destinations203/205 and all dependent story entities stay byte-identical.
They may retain the original invisibility defect when crossed; do not report
them as converted or compatible. A condition-preserving adapter is a later
manual milestone, before c_start2 can be called fully converted/verified.

D0006 lockedby=a_big_dong; D0227/D0228 lockedby=dsasad. None has a destination;
no new transition is manufactured and no lock/key requirement is bypassed.
These are locked/no-exit records, not confirmed collectible-key transition types.

D0019 targets exit16 lolexit2. At its standing destination, trigger15 can fire
trigger_changelevel17 -> c_start. Keep this spatial cross-map path unchanged,
including landmark hahaland. No trigger_changelevel or landmark is converted.
Source entity values contain no c_start2 basename references. Compiled hardcoded
map-name behavior remains unmeasured. Returning from c_start loads STOCK c_start2;
renaming doesn't make a persistent campaign installation.

## Validation and remaining gate

30 Node tests PASS (0fail/0skip), including existing BSP/staging suites plus
conversion gates: locks/masters/flags/names/story fields, shared exits, manager
key references, invalid standing destinations and identical duplicate classes.
V8 rebuild SHA unchanged; production equals v8 pairs minus2 probes. All5 prior
reference BSP hashes retained. Independent PowerShell output == Node full BSP;
source/known-file/unknown-file/remove/rollback guards PASS.
Evidence: work/c-start2-full-002/verification.json and node-test-output.txt;
work/c-start2-full-install-check-001/installer-verification.json.

Matrix: C_START2_DOOR_MATRIX.csv. New-alias runtime cells start NOT TESTED; v8
reference PASSED applies ONLY to49/50. Update cells using PASSED, FAILED, BLOCKED,
NOT TESTED after real reports. Conversion BLOCKED means unsupported adaptation,
not a measured failure of original story conditions. Do not auto-grade a map.
Next: ordinary production regression plus retained restriction/story checks.
Cafe adaptation and full c_start2 gameplay gate precede remaining campaign work.
