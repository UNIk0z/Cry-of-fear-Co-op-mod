# c_start2 native-spawn experiment

Generated and structurally validated; NOT DEPLOYED / NOT RUNTIME TESTED.
This is a hypothesis test, not a playable campaign or confirmed visibility fix.

All three actual co-op references contain cof_coop_spawn1–4; c_start2 lacks them.
The SDK confirms these character slots, their standing bounds and enabled default.
The additional native entry map cof_campaign_01 also uses them without a model
customizer. Slot-only scope is retained; no forced model change is justified yet.
Add only these four native slots near the original spawn. Retain the ordinary
start, all doors, original events/items/enemies and geometry. The generated work
artifact retains its original filename; the user-requested Steam test uses the
separate c_start2_cooptest filename with identical bytes.
Four slots mirror native setup even though the intended session has two players.

| Slot | Origin | Angles | Hull 1 center | First solid sample below |
|---|---|---|---|---|
| 1 | 2428 -883 -728 | 0 90 0 | EMPTY | 5 units |
| 2 | 2428 -819 -728 | 0 90 0 | EMPTY | 5 units |
| 3 | 2492 -819 -728 | 0 90 0 | EMPTY | 5 units |
| 4 | 2556 -819 -728 | 0 90 0 | EMPTY | 6 units |

Center sampled at origin+1 in Z. Conventional standing boxes don't overlap and
inspected trigger/inter_door model bounds don't intersect them. Clear candidate
2428 -947 -728 was rejected because it overlaps trigger_multiple *3, bounds
[2381 -987 -764]–[2467 -914 -642], firing the return transition. Several X-offset
candidates were solid. World sampling doesn't prove CoF hull selection, dynamic
collision, spawn selection, floor tracing or model visibility. Structural fields
use [Valve's BSP definitions](https://github.com/ValveSoftware/halflife/blob/master/utils/common/bspfile.h);
the implementation does not copy or inject engine code.

## Build / preservation

With the Node binary from README, run from this repository:

```powershell
& $nodeBinary scripts/append-spawns.mjs '%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\work\map-samples-001\c_start2.bsp' patches/c_start2-native-spawns.experimental.json '%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\work\prototype-spawns-002'
```

Exact source SHA and filename are required. Append a new entity lump, update only
its header pair and retain all other original bytes, including the unused old
entity lump. Output size grows. Engine acceptance of this layout is not yet
verified. Output is deterministic, repeat application/existing outputs are refused,
and all original pairs plus 14 non-entity hashes must match. Hashes: PROGRESS.md.

Generated map and report live in work/prototype-spawns-001/. No Steam map is
patched. The latest user instruction authorizes preparing a reversible overlay
in the actual Steam installation for supported client testing. See GAMEPLAY_TEST:
scripts/install-c-start2-cooptest.ps1 builds the identical BSP under a fresh alias,
refuses overwrites and wrong source versions, and removes only its known output.
Do not overwrite c_start2.bsp. The full independent runtime snapshot remains
historical diagnostic material; it is not the next launch target.

## Runtime gate

The independent native-server attempt only initialized console and warned about
fonts.wad before timeout. No experimental map was deployed into that runtime.
Establish supported Steam listen-server launch and two authenticated clients on
a native reference first; then compare baseline/experimental c_start2. Record both
views at spawn, door use, transition, death and reconnect before further changes.
