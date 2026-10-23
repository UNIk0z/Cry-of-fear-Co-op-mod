# Use activation probe v5

**Actual result:** user reports USE49 ACTIVATED plus cue for BOTH actors, neither
relocates. Dispatch confirmed; relocation FAILED. Reverse50 untested. Continue
with [USE_SELECTOR_TEST.md](USE_SELECTOR_TEST.md); older pending statements below
are historical.

**c_start2_useprobe — engineering verified; gameplay NOT TESTED.**

User reports v4: P1 and P2 press E, neither relocates, panel blocks passage,
no console error reported. Actual status/map hash was not captured. This does
not distinguish failed button activation from failed point teleport execution.

One functional change: button flags17 -> flags1, matching original computer
button245. This removes SDK “Direct use only”; it is a hypothesis, not a proven
cause. Buttons remain solid and stationary; no touch activation. For feedback,
sounds3 adds the standard access cue, and two game_text helpers show green
`USE49 ACTIVATED` / `USE50 ACTIVATED` for three seconds. Text is deliberately
broadcast to both windows; it does NOT mean both players should teleport.

Each marker shares the corresponding teleporter targetname (one teleporter +
one marker per name). This uses ordinary target fan-out; [Valve's reference
dispatch](https://github.com/ValveSoftware/halflife/blob/master/dlls/subs.cpp)
calls each matching entity. SDK game_text and installed export support the
marker; exact Steam dispatch/display remains subject to this test.
V4 teleporters/destinations/wait1 and all geometry remain unchanged. No model,
spawn, DLL, Steam or Sandboxie changes. Other story doors remain original.

## Install and load

Close both clients. Run in normal PowerShell:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File '%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\outputs\cry-of-fear-coop\scripts\install-use-probe.ps1'
Get-FileHash -LiteralPath 'D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps\c_start2_useprobe.bsp' -Algorithm SHA256
```

Expected hash: `79c096cc82cf6d7f12f25189904a84cd3de26b3f4ceb5b833ba0821bf165c9b4`.
Generated full BSP: `%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\work\use-probe-001\c_start2_useprobe.bsp`.
18,699,606 bytes / 447 entities. The installer reconstructs from your own
original and refuses unknown files. Its JSON remains beside the ZIP's extracted
installer or in the repository's patches directory. Originals/v2/v3/v4 retained.

Run the same hash command inside your existing Sandboxie box to verify both
file views match. If necessary run the installer within that box using its
actual `-MapsDirectory`. Do not clear or reconfigure Sandboxie.

Restart normal Steam P1 and Sandboxie Steam P2, host/join your working native
co-op baseline and verify mutual models. HOST console:

```text
changelevel c_start2_useprobe
status
```

P2 also runs `status`. Both must show **c_start2_useprobe**, not dooruse or stock
c_start2. Confirm initial models/control/collision before approaching the SAME
panel tested in the v2 bypass/v4. Visual landmark “before cafe” remains unverified.

## Press E and report the marker

P2 leads while P1 waits. Stand close, face the middle of that panel and press E
once. Release E; wait two seconds. Record marker, sound, who moved and whether
the panel remains blocking. If no relocation, make one P1 attempt too, then stop.

| Observation | What it establishes / next report |
|---|---|
| Marker appears, nobody moves | Button target dispatch reached game_text; point relocation remains suspect. Report both actors and console output. |
| Only button cue, no marker/movement | Some button feedback occurred; target dispatch/display still unresolved. |
| No cue/marker/movement | No activation confirmed; map identity, selection/reach and feedback support still need distinguishing. Not proof of a collision root cause. |
| Wrong player or both players move | Independent actor selection fails. Stop and report who pressed E and who moved. |
| Only activating player moves correctly | Continue the core checks below; marker alone is not a gameplay pass. |

If P2 alone relocates, move clear of arrival, let P1 follow with E, then check
BOTH model directions once together, grounded position/view direction, controls,
inventory and collision. Test return with P1 leading, then a repeat cycle with
order reversed. Check for automatic extra teleport after reset. No reconnect
may repair a pass. Outward destination remains feet1040 -1711 -896/yaw270;
return3655 -1257 -896/yaw90. `status` must keep this same alias.

Send: map/status name, marker Yes/No, cue Yes/No, pressing player, who moved,
panel still blocked Yes/No, console errors; if relocation works, outward/return
two-way visibility and controls. Missing original sound/fade remains intentional;
diagnostic cue is not restored story presentation.

## Remove

Close clients and append `-Remove` to the installer command above (also inside
the box if installed there). Only the hash-matching probe alias is removed.
The successful v2 bypass remains available. No headless retries needed.
