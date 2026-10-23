# E/Use door replacement v4

**Map: c_start2_dooruse. User gameplay FAILED: neither player relocates with E.**
This procedure is historical; next targeted probe: [USE_PROBE_TEST.md](USE_PROBE_TEST.md).

User results: original control FAILED; outward touch bypass PASSED two-way
visibility; v3 native model initialization FAILED. No further model-key tests.
Observed native campaign progression doors load separate BSPs; they are not an
equivalent same-map mechanism. Keep the successful v2 bypass unchanged.

This candidate replaces ONLY the already-tested unlocked pair:

`E -> func_button -> named cof_teleport -> info_teleport_destination`

The SDK supports these classes/fields and the installed DLL exports them.
Native BSPs use the point teleporter for player relocation. This is an actual
execution change: the selected pair no longer invokes `inter_door`. It reuses
the bypass's destination names, feet coordinates and angles. The point class
is a different handler from the VERIFIED touch bypass: Steam participant
selection and position adjustment still require this test. The Xash recreation's
activator-aware implementation is research, not proof of Steam behavior.

Buttons reuse the original `*6`/`*7` panels, with flags 17 (Don't Move + Direct
Use Only), `wait=1`, `delay=0`, `sounds=0`; no Touch/Toggle/Can'tUse flags.
Two point helpers directly target the original exits, with SDK `message=""`
(player). No invented `!activator` selector, timed shared touch window, custom
entity class, or DLL modification. The buttons have a one-second shared reset;
hold/release E and wait two seconds between deliberate tests.

Selected door sounds/fades are intentionally omitted. Models, spawns, weapons,
inventory, enemies, puzzles, cafe gates and other doors remain original. These
panels now behave as button solids: observe collision/reach; static preservation
does not prove runtime usability. The tested pair is unlocked. This builder
rejects unsupported locking/enable conditions and is not a general converter.

## Install

Generated COMPLETE BSP, 18,699,076 bytes / 445 entities:

`%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\work\use-door-experiment-001\c_start2_dooruse.bsp`

Destination:

`D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps\c_start2_dooruse.bsp`

Expected SHA256:

`ff183cf19f9dffc210803d572a0083facca7f74897f2d0c064e76e7cd290355a`

Close both clients. In normal PowerShell:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File '%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\outputs\cry-of-fear-coop\scripts\install-use-door-experiment.ps1'
Get-FileHash -LiteralPath 'D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps\c_start2_dooruse.bsp' -Algorithm SHA256
```

This builds from your own original, checks source/output hashes and uses
CreateNew. Unknown destination files are retained. Originals and v2/v3 aliases
are untouched. The JSON patch must remain with the packaged installer, or in
the repository's patches directory. No Node/SDK/Ghidra is needed to install.

Direct-copy alternative (instead of installer, with no overwrite):

```powershell
$candidate='%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\work\use-door-experiment-001\c_start2_dooruse.bsp'
$destination='D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps\c_start2_dooruse.bsp'
if ((Get-FileHash -LiteralPath $candidate).Hash.ToLowerInvariant() -ne 'ff183cf19f9dffc210803d572a0083facca7f74897f2d0c064e76e7cd290355a') { throw 'Unexpected source hash' }
if (Test-Path -LiteralPath $destination) { throw 'Destination exists; use guarded installer' }
$copyStream=[IO.File]::Open($destination,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::None)
try { $copyBytes=[IO.File]::ReadAllBytes($candidate);$copyStream.Write($copyBytes,0,$copyBytes.Length) } finally { $copyStream.Dispose() }
Get-FileHash -LiteralPath $destination -Algorithm SHA256
```

Run the hash command in PowerShell inside your existing Sandboxie box as well.
Both file views must match. If the box sees a different/missing alias, run the
installer within the box, using `-MapsDirectory` if its installation differs.
It refuses an unknown alias; do not clear or reconfigure Sandboxie to bypass
that guard. A friend can extract the asset-free ZIP, keep its three files
together, then run from the extracted directory:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\install-use-door-experiment.ps1 -MapsDirectory 'D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps'
```

## Steam and first test: P2 must lead

1. Restart your working normal Steam P1 and Sandboxie Steam P2 clients. P1
   hosts through **Host new coop game**, choosing the known native campaign
   baseline; P2 joins by your existing method. Verify mutual visibility first.
2. HOST console:

   ```text
   changelevel c_start2_dooruse
   status
   ```

3. P2 also runs `status`. Both report `c_start2_dooruse`. Stand together and
   verify both see the other, move, use inventory and collide normally.
4. Find the SAME panel used in your successful bypass. “After stairs before
   cafe” remains an unverified visual landmark; your tested panel is reliable.
   Walking into it WITHOUT E should NOT relocate anyone.
5. **P2 presses E once. P1 stays still and does not press E.** Only P2 should
   relocate. If P1 moves, both move, nobody moves, or P2 gets stuck, record the
   first result and stop this run. That fails independent activation even if
   models look visible. Check immediately AND after two seconds for duplicate
   reset events. Do not use rendering/model cvars or reconnect to repair a run.
6. If P2 alone moved correctly, wait two seconds and P1 independently presses E.
   Move P2 clear of the arrival point first. Once together in the destination
   area, check BOTH visibility directions, movement/look, inventory/Use and
   collision. Seeing nobody across disconnected sections is not a visibility
   failure by itself. No reconnect is allowed for a pass.

Exact pair (zero-based BSP indices): 49 `*6` -> helper `cof_story_use49` ->
exit 51 `d1_1_exit1`, feet `1040 -1711 -896`, yaw 270. Reverse: 50 `*7` ->
`cof_story_use50` -> exit 48 `d1_1_exit2`, feet `3655 -1257 -896`, yaw 90.
These positions are unchanged from the bypass. Observe correct section,
orientation, grounded stance and no embedding/drifting; no invented diagnostic
console command is assumed.

## Return and repetition

If the first sequence passes, P1 leads the reverse E crossing while P2 waits,
then P2 follows independently. Recheck destination, BOTH model directions,
control/inventory/collision and map name. Repeat outward and return with leader
order reversed. Also test waiting near the panel while the other uses it:
the waiting player must remain in place. Do not rapidly overlap arrivals.

The original special sound/fade is absent on this pair, as intended. Report any
unexpected screen effect, freeze, automatic re-teleport or other presentation
change. Other story doors still use the original broken mechanism; avoid them
when judging this pair. The different exit to `c_start` leaves the experiment
and can later reload stock `c_start2`; this route was not converted.

Report:

| Check | Result |
|---|---|
| Both file hashes/status names match; initial mutual visibility | |
| Walking without E: no relocation | |
| P2-first E: ONLY P2 moved; grounded/oriented/control restored | |
| P1 E next: ONLY P1 moved; reset produced no extra teleport | |
| Once together: P1 sees P2 / P2 sees P1; collision/inventory | |
| Reverse E: each independently moves, both models visible | |
| Repeated cycles/waiting beside panel; any softlock/crash | |
| First failure: actor, direction, who moved, screenshot/status | |

This experiment passes only after every core check above passes in gameplay.
If it fails, record the first event before reconnecting, then use a fresh v2
bypass session for regression if needed. Its return remains unverified too.
No generic headless tests or campaign-wide conversion are required now.

## Rollback

Close clients, then run (also inside the box if installed there):

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File '%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\outputs\cry-of-fear-coop\scripts\install-use-door-experiment.ps1' -Remove
```

Only the hash-matching v4 alias is removed. Changed files are retained. No
original maps, working bypass files, Steam or Sandboxie settings are altered.
