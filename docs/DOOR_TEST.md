# Door visibility test v2 — use the working Steam + Sandboxie setup

Both clients on ONE PC are sufficient. Preserve your Sandboxie configuration.
These two fresh map names test ONE unlocked same-map door pair. The experiment
is generated and structurally verified; gameplay has NOT been tested by Codex.

## Install

Close both game instances. In normal PowerShell run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File '%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\outputs\cry-of-fear-coop\scripts\install-door-experiment.ps1'
```

Alternatively, extract door-visibility-test-v2.zip, open PowerShell there and run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File '.\install-door-experiment.ps1'
```

This creates only:

```text
D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps\c_start2_doorctrl.bsp
D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps\c_start2_doorbypass.bsp
```

It reads your own original c_start2.bsp and refuses a different original version
or unknown existing alias. Known matching aliases are retained without overwrite.
No original maps, config, DLLs, models, saves or Sandboxie settings are changed.

If the Sandboxie client uses another installation, run the installer with
`-MapsDirectory 'ITS_GAME_ROOT\cryoffear\maps'` too. Restart BOTH clients after
installation. Existing virtual copies can shadow normal files; if loading or
hash mismatch occurs, verify the files from PowerShell opened inside the SAME
sandbox. Do not clear/reset your sandbox. Commands to verify that view:

```powershell
Get-FileHash -LiteralPath 'D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps\c_start2_doorctrl.bsp'
Get-FileHash -LiteralPath 'D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps\c_start2_doorbypass.bsp'
```

Expected control: 18,636,891 bytes / SHA256
3933456e6c0e8a449ec17e7829c9d69a8880a1e414b54dd6c0cf2b361483157e.
Expected bypass: 18,699,267 bytes / SHA256
7d2f8c347f97e2135d9cbb49cc871c9d7cac2d16a0559b75a0841b59c79518f0.

Generated full BSPs also exist at:

```text
%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\work\door-experiment-001\c_start2_doorctrl.bsp
%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\work\door-experiment-001\c_start2_doorbypass.bsp
```

Manual copy alternative (instead of installer):

```powershell
$builtMaps = '%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\work\door-experiment-001'
$installedMaps = 'D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps'
$names = @('c_start2_doorctrl.bsp', 'c_start2_doorbypass.bsp')
foreach ($name in $names) { if (Test-Path -LiteralPath (Join-Path $installedMaps $name)) { throw "Already exists: $name" } }
foreach ($name in $names) { Copy-Item -LiteralPath (Join-Path $builtMaps $name) -Destination (Join-Path $installedMaps $name) -ErrorAction Stop }
foreach ($name in $names) { Get-FileHash -LiteralPath (Join-Path $installedMaps $name) }
```

## Run 1 — original-door control

1. Launch P1 normally through Steam; launch P2 through your working Sandboxie
   procedure. Create/join native co-op as you already do. Both should be visible.
2. HOST console:

   ```text
   changelevel c_start2_doorctrl
   status
   ```

3. Find the selected pair, not the return-to-c_start door near the initial spawn
   and not the later cafe doors. Exact panels/destinations are:

   | Panel | Bounds / midpoint | Arrives at |
   |---|---|---|
   | Door 49, *6 | x 3632–3680, y -1279–-1278, z -896–-803; midpoint 3656 -1278.5 -849.5 | 1040 -1711, same BSP |
   | Door 50, *7 | x 1015–1063, y -1690–-1689, z -896–-803; midpoint 1039 -1689.5 -849.5 | 3655 -1257, same BSP |

   Both are ordinary unlocked doors with latch/door sound fields. No position
   console command is assumed available. If you cannot identify the pair, send
   a screenshot of your chosen door/route; do not classify another door's result
   as this experiment. No cheats/teleport commands are needed.
4. Before crossing, stand together and capture each viewpoint. Confirm both
   bodies visible, normal movement and inventory. Do not continue the comparison
   if either model is already invisible before reaching the selected door.
5. P1 uses the door once with P2 standing clear. Record whether P1 alone or both
   relocate. If P2 remains behind, P2 follows. Once together on the far side,
   face each other at close range and record both visibility directions,
   collision, controls and inventory. Run `status` to confirm no map change.
6. If the reported failure occurs, let P2 disconnect/rejoin once and record each
   visibility direction. Preserve a screenshot/video from BOTH windows. Do not
   disconnect the HOST as a substitute: that destroys the listen-server test.

## Run 2 — bypass candidate

Restart both games and re-create the normal native co-op session first, keeping
the same Sandboxie configuration. This prevents a control-run failure's state
from contaminating the experiment. Host runs:

```text
changelevel c_start2_doorbypass
status
```

Check initial two-way visibility again. Return to the SAME selected panel.
**Walk into it rather than pressing Use.** P1 first, P2 second; each is intended
to relocate individually. Move the first arrival away from the destination
point so the second can arrive without overlap. Once both occupy the SAME
destination room, check both models, control, collision and inventory; run
`status` again. Walk into the opposite selected panel to return and repeat.
sdw
Expected candidate result: both models remain visible in both directions on
outward and return crossings, with valid floor positions, controls and inventory,
and no reconnect. If pressing Use does nothing, that is expected in this variant.
If walking into the selected panel does nothing, report that as a relocation
failure; it does NOT reject the visibility hypothesis because the bypass never ran.

Only these two panels are modified. Other doors retain original behavior and
may still cause invisibility. The special door sound/fade and Use interaction
are intentionally bypassed here. A visibility pass would justify preserving
those interactions in the next implementation; it is NOT full fix acceptance.
Cross-map story routing remains stock; do not test the return-to-c_start route
as the chosen same-map pair.

If bypass loading/crashing fails, stop once and capture the exact console text.
Do not change startup/authentication settings or repeat headless launches.

## Report

```text
Both clients see the expected map hashes: yes/no/not checked
CONTROL status map before/after= ; door screenshot/location=
CONTROL initial P1 sees P2= ; P2 sees P1=
CONTROL after P1 action: P1 moved= ; P2 moved=
CONTROL once together: P1 sees P2= ; P2 sees P1= ; collision/control/items=
CONTROL after P2 rejoin: P1 sees P2= ; P2 sees P1=
BYPASS status map before/after= ; SAME panel confirmed=
BYPASS initial P1 sees P2= ; P2 sees P1=
BYPASS walking into panel: P1 moved= ; P2 moved independently=
BYPASS once together: P1 sees P2= ; P2 sees P1= ; floor/control/collision/items=
BYPASS return crossing: same checks=
First error/failed action= ; exact console text=
Screenshots or short video from BOTH windows=
```

The highest-value result is the control reproducing asymmetric rejoin recovery
and the bypass preserving two-way visibility without rejoin. If both fail after
successful relocation, the next focus is common teleport/destination/player
state, not another arbitrary door replacement. Optional later controls are
normal host death/respawn, then recovery on a native co-op map; they are not
prerequisites for these two runs.

## Revert

Close both games. Append **-Remove** to the same installer command. Only these
two known-hash aliases are removed. Unknown/changed aliases are preserved; the
preflight checks both before deleting either. If installed separately in a
sandbox/second game path, run the same rollback there. Do not clear the sandbox.
The earlier c_start2_cooptest experiment, original maps and game settings remain
untouched. More engineering evidence is in TRANSITION_VISIBILITY.md.
