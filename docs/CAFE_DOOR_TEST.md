# Cafe door experiment v10

`c_start2_coop_cafe` is ready for user-assisted Steam testing, NOT gameplay
verified. V9's unchanged cafe doors failed in your latest report. This experiment
keeps the proven ordinary pair unchanged and adapts only the cafe pair and its
enable/removal controllers. Notes remain stock. Whole-map success is pending.

## Install

Close both clients. Run this full command in PowerShell or Command Prompt:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\outputs\cry-of-fear-coop\scripts\install-cafe-doors.ps1"
```

It reconstructs a complete BSP from your own `c_start2.bsp` at
`D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps\c_start2_coop_cafe.bsp`.
Original maps and earlier experiments stay intact. For another installation,
append `-MapsDirectory "YOUR_FULL_MAPS_DIRECTORY"`. No asset downloads or Node
are required. ZIP users keep the JSON next to the extracted installer.

Verify in normal PowerShell, then from inside your existing Sandboxie box:

```powershell
Get-FileHash -LiteralPath "D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps\c_start2_coop_cafe.bsp" -Algorithm SHA256
```

Expected: `451f150c84178e04a5ee589fdad28268576ac555b3cd15d5aa4f9865e1c4c974`.
18,705,154 bytes; 479 entities. If the box sees a different version, run this
installer inside that box. Keep your working Sandboxie configuration.

## Load

Use your working normal Steam P1 + Sandboxie P2, Host new coop game / Join coop
game. Once both are connected, HOST runs:

```text
changelevel c_start2_coop_cafe
status
```

Both clients run `status`; confirm this exact alias. Do not initialize it as a
new single-player game. Check initial models, movement and inventory.

## Cafe and story checks

1. Briefly repeat the known ordinary section door in both directions. P2 first,
   P1 waiting; then P1 follows. E, sound, fade and mutual models must still work.
2. Progress normally to the cafe. D0204 is the entrance panel *14 centered near
   `(1009,1986,-547)`. D0206 is the return panel *15 near `(1032,1986,-547)`.
   Before the original interior enable trigger is touched, D0206 must refuse
   movement. Its disabled E attempt may be silent. Do not force-enable it with
   console commands or use noclip to skip the trigger.
3. P2 uses the entrance with P1 waiting. Only P2 should fade and move, to original
   feet `(1064,1987,-591)`, facing east. Walk normally into the interior; this
   touches original trigger413 and enables the shared return door. Check return
   with P2, then independently test P1 entrance and return. Return feet are
   `(972,1986,-599)`, facing west. Wait three seconds between same-panel presses.
4. When together, check both character models in both windows, controls, floor,
   weapons/ammo and note collection. Nearby players may hear positional audio,
   but only the accepted mover should fade. Cafe sounds reuse doormove2/doorstop2.
5. Use the cafe computer through normal progression. Original computeron ->
   multimystery must run its encounter/music/story events. Both old cafe panels
   must disappear at their original removal event; E must not relocate anyone
   afterward. Continue through the intended newly opened route. Report a story
   softlock separately from a door failure.
6. After the sequential checks pass, reload and try opposite-door use together;
   also try same-panel use together (one accepted move, follower retries after
   three seconds), and an occupied landing. Finally, if practical, let one player
   begin a cafe-door fade just as the other starts the computer sequence: removal
   should cancel a still-pending relocation and the screen should clear. Record
   the order. This lifecycle edge has only static wiring checks so far.
7. Reload with `changelevel c_start2_coop_cafe`. The cafe return must start
   disabled again even after the previous run enabled it. Check retained shutters
   and locks refuse passage as before. Return through c_start loads STOCK c_start2;
   cross-map progression was not converted and should not be counted as a pass.

## Recover and report

For a stuck fade over five seconds, wrong mover, invisibility or softlock, stop
that run and HOST restores the verified reference:

```text
changelevel c_start2_doorfade
```

Report: exact `status` map, door ID/side, P1/P2 order, initial disabled return,
entry/return after trigger, sound/fade, mutual models, computer event/removal,
repeat/reload, concurrency/occupied landing, any console errors and the earliest
failure. Use CAFE_DOOR_MATRIX.csv. Unperformed checks remain NOT TESTED.

## Remove

Close clients and run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\outputs\cry-of-fear-coop\scripts\install-cafe-doors.ps1" -Remove
```

Removal accepts only this known-hash alias. Unknown/modified files are retained.
The script never overwrites `c_start2.bsp` or the successful V8 map.

## Engineering limits

The original brush models, names, feet/yaws and sound files are retained. V8
createFadeDoorPlan and timing are unchanged. Cafe relocation adds a zero-delay
threaded manager to recheck door life; a frame of timing difference is possible.
Original per-door lock messages and music-fade fields are not reproduced by the
replacement panel; story music targets remain unchanged. No key access is
removed. Native SDK definitions and installed export names support the adapter;
they do not prove compiled master behavior, actor retention or story progression.
The global-state reset and pending-removal path require this gameplay test.
