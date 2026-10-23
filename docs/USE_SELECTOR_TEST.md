# Native selector omission test v6

**VERIFIED BY USER:** commit759c141 core passes for BOTH actors and BOTH
directions, with mutual models preserved. Fade/original door sounds were not
implemented/tested. Keep this baseline unchanged; presentation experiments:
[DOOR_PRESENTATION_TEST.md](DOOR_PRESENTATION_TEST.md). Pending statements below
are the original test preparation record.

**c_start2_useselect: engineering verified; gameplay untested.**

Your v5 result confirms Use49 target dispatch: both players see the green marker
and hear the cue, but nobody relocates. Reverse Use50 was not reported.
Native player cof_teleport configurations omit message; our v5 wrote an explicit
empty message key. V6 removes ONLY those two keys. Buttons, markers, sound,
destinations and geometry stay identical. This tests a configuration hypothesis;
it is not a confirmed fix or verified native same-map cooperative door pattern.

## Install safely

Close both clients. In normal PowerShell run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File '%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\outputs\cry-of-fear-coop\scripts\install-use-selector.ps1'
Get-FileHash -LiteralPath 'D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps\c_start2_useselect.bsp' -Algorithm SHA256
```

Expected SHA256: `c4a310d5ff2ef72f8794044cbc38b9d3447f836b9a4ce07b02a92c8b245b1566`.
Installed path: `D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps\c_start2_useselect.bsp`.
The installer reconstructs the complete 18,699,580-byte / 447-entity BSP from
your own original c_start2.bsp. All14 non-entity lumps remain unchanged. It
preserves the original and earlier aliases, refuses unknown existing files,
and never changes game DLLs. No manual BSP copy is needed.

Alternatively extract outputs/use-selector-test-v6.zip to any folder; keep its
JSON beside install-use-selector.ps1 and run that extracted script instead.
For a different game location pass -MapsDirectory with your actual maps folder.
Generated engineering reference: `%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\work\use-selector-001\c_start2_useselect.bsp`.

Run the same Get-FileHash command inside your existing Sandboxie box. Both file
views must have the expected hash. If required run the extracted installer within
the box, using its actual maps directory. Preserve your working Sandboxie setup.

## Load through your working Steam cooperative session

Start normal Steam P1 and your existing Sandboxie Steam P2. Use the working
native Host new coop game / Join coop game procedure. Verify mutual models in
the native baseline, then HOST console:

```text
changelevel c_start2_useselect
status
```

P2 also runs status. Both must show c_start2_useselect. Confirm initial mutual
models, controls and collision. Approach the SAME Use49 panel as your v5 test;
the cafe landmark alone has not been verified as an entity identifier. Other
story doors still use their original mechanism; they are outside this test.

## Test once before expanding

1. Keep P1 stationary away from the panel. P2 faces the panel, presses E once,
   releases E, and waits two seconds. Record marker, cue and exactly who moves.
   The marker broadcasts to both windows; this does not mean both should move.
2. If nobody moves, make one P1 attempt. Record the same observations and any
   console messages, then stop. Do not repeatedly reinstall or change settings.
3. If only the user of E moves, let the waiting player follow independently.
   Once both stand in the same destination area, inspect each model from the
   other window. Check movement, collision, equipment/ammo and correct floor
   placement/facing. Wrong actor, both actors or stuck/below-floor movement fails.
4. Test the return panel (USE50 ACTIVATED), each player separately; wait at least
   two seconds between presses. Check mutual models again and repeat outward
   once to verify reset. Outward and reverse must both pass.

Expected destination feet: Use49 (1040,-1711,-896), yaw270; Use50
(3655,-1257,-896), yaw90. These are map origins, not a request to teleport using
console commands. No rejoining/model-reset workaround during this comparison.
Story fades/music/door audio remain omitted on this pair; the cue is diagnostic.
Do not test cutscenes/cross-map progression until this core relocation passes.
The original route to c_start is unchanged; returning there loads stock c_start2.

Report both status map names and hashes, actor order, marker/cue, who moved,
floor/facing, mutual visibility after both arrive, return/reset and console output.
If it repeats marker plus no movement, that is a useful failed selector test;
stop there. V2 c_start2_doorbypass remains the successful outward regression.

## Remove only this experiment

Close both clients, then run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File '%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\outputs\cry-of-fear-coop\scripts\install-use-selector.ps1' -Remove
```

Also run removal inside the box if installed there. Removal only deletes the
known-hash c_start2_useselect.bsp; modified/unknown files are retained.

## Evidence and limits

Native comparison: work/point-selector-comparison-001.json; complete native
cof_suicide4 chain485 ->486 ->484 omits message. SDK line5347 says blank selects
a player. [Valve util.h](https://github.com/ValveSoftware/halflife/blob/master/dlls/util.h)
tests string handle0; missing and explicitly empty fields may differ. Steam CoF's
allocation and selector implementation are unverified, so this is inference.
Node/PowerShell byte equality, exact two-key delta, 14-lump preservation and
guarded install/remove passed in workspace fixtures. No game launched by Codex.
