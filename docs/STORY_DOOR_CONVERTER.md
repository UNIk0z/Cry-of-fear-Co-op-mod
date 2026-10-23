# Door compatibility latest boundary — 2026-10-10

Canonical DOOR_COMPATIBILITY is this file + TRANSITION_VISIBILITY + CAFE_DOOR_ADAPTER;
do not duplicate. Latest real report: after padlock and “Look to the right” scene,
newly unlocked door executes incompatible original SP transition and reintroduces
visibility/teleport failure. CONFIRMED PROGRESSION BLOCKER. Actual alias/ID unknown.

The safe V6/V8 mechanism remains user-verified. Scripted doors are intentional
exceptions to simple static conversion; authored names/lock/enable/kill callers and
every arrival alias require explicit lifecycle adaptation. Maintenance converts
c_start713 sd_door1 via shared padlock.done/master on s4_start/e0/e2 and rewrites
unlock717 sd_door1_lock as explicit env_global On. Apartment228/229 use shared
gates691/754 and scene621/280 latch. These guarded candidates do NOT identify or
prove conversion of the failed door. Inspect served BSP/report +runtime enable
callers and172 retained RC2 doors, reuse conditional-story-doors.mjs and existing
createFadeDoorPlan; preserve original timeline and recheck gate at delayed move.

Do not restore original inter_door, globally unlock, add player-model initialization
or rebuild195 maps. Those approaches bypass lifecycle or failed the visibility
reproduction. Root cause of original native model invisibility remains unmeasured.

---

# Conservative story-door converter

Authoritative mechanism: user-verified v8 fade map. createFadeDoorPlan in
build-door-presentation.mjs is shared by v8 and convert-story-doors.mjs. Its
extraction is guarded by exact v8 SHA4a0e1d...6a23; no mechanism redesign.
build-c-start2-full.mjs pins the original SHA and expects only49/50. Production
must equal v8 ordered entity pairs minus its two diagnostic game_text entities.

The reusable analyzeStoryDoors/convertStoryDoors functions inspect original BSP30
entities and model bounds. Eligible profile: unnamed, unlocked, no master,
no special flags/fields, doortype0/default, reference music-fade settings,
original WAV paths, unique ordinary exit with valid feet/angles and static
standing support. Names, locks, keys, enable/remove/script hooks and unknown
fields are exceptions. Same-map classification excludes spatial trigger paths
to map changes. Shared exits used by any retained/non-door caller are blocked.
multi_manager target KEY references count as incoming dependencies too.

Unsupported individual destinations are reported without preventing unrelated
safe conversion. Repeated identical classname fields all transform consistently;
conflicting repeats remain exceptions. Existing generated-name references or
already-converted input are rejected. No manufactured reverse, model/spawn
reset, global fade, player render operation or original inter_door execution.

Four targeted original records are replaced; other raw records retained. Append
new entity lump at alignedEOF; only header bytes4..11 change. All14 other lumps
retain ranges/hashes. Helpers/destinations resolve uniquely; no debug entities
added. Per-door IDs, classifications, dependencies, reasons, changed fields,
original sounds, sequence and static samples saved in conversion-report.json.
Static samples exclude moving brushes and player overlap. Timing/cooldown/audio
are the same as verified v8; broader maps still require their own tests.

Current build (Node path is the installed verified runtime):

```powershell
& "C:\Program Files\Microsoft Visual Studio\2022\Community\MSBuild\Microsoft\VisualStudio\NodeJs\node.exe" scripts/build-c-start2-full.mjs "ORIGINAL_c_start2.bsp" "NEW_WORK_DIRECTORY"
```

The file must actually be named c_start2.bsp; placeholder above means its full
original path. Output directory must be fresh, outside game maps. Reusable CLI:
convert-story-doors.mjs ORIGINAL.bsp NEW_MAP_NAME NEW_WORK_DIRECTORY. Don't run
batch campaign conversion yet. New fixed-source guarded PowerShell installer
reuses earlier manifest reconstruction and rollback logic; no Node needed by user.
Source asset snapshots/full BSPs stay in work; ZIP contains only own patch/code/docs.

Tests/story-door-conversion.test.mjs uses COF_C_START2_FIXTURE outside Git.
Existing suite and new targeted tests PASS30; no synthetic or structural check
counts as multiplayer gameplay. Every new alias starts NOT TESTED in the matrix.
After ordinary production test, resolve cafe enable/remove adapter and verify
all applicable c_start2 doors before campaign discovery/expansion. Cross-map
campaign progression remains a separate task.
