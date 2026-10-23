# Native door initialization experiment v3

Map: **c_start2_doornative**. Latest user gameplay result: **FAILED visibility**.
This procedure is historical. Do not repeat model initialization tests;
the next experiment is in [USE_DOOR_TEST.md](USE_DOOR_TEST.md).

The native BSP survey found same-map `inter_door` -> `inter_door_exit` pairs,
including `c_cof_asylum1day`. There is no verified classname replacement to copy.
Your remembered `cof_campaign_01` / `_p2` / `_p3` maps also use cooperative gates
to load other BSPs. Those gates are not a same-map replacement.

This experiment tests one native initialization difference: worldspawn now
declares `player1=police1` through `player4=police4`, as in native campaign part 4
and the SDK. **Every original door and exit remains unchanged**, retaining E/Use,
destinations, locks, sounds and fades. This may help model restoration; the
internal cause is unknown. Some native maps omit these declarations, so they
are not established as a universal requirement. Standard police slot models
are expected; custom player skins have not been tested.

The successful outward bypass remains unchanged. Its return crossing is pending.
Do not expand conversion until this Use/visibility/return test passes.

## Files and installation

Generated complete BSP (18,699,315 bytes, 443 entities; not just entity data):

`%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\work\native-door-experiment-001\c_start2_doornative.bsp`

Installed destination:

`D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps\c_start2_doornative.bsp`

Expected SHA256:

`fd4979bbb018c1b3f9a4f0d1ce06fd0cc05ce1ff8b9ffb84e291c07943b3049c`

Close both game clients first. In normal Windows PowerShell run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File '%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\outputs\cry-of-fear-coop\scripts\install-native-door-experiment.ps1'
Get-FileHash -LiteralPath 'D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps\c_start2_doornative.bsp' -Algorithm SHA256
```

The installer reconstructs the map from your own hash-verified original,
checks the four model assets and exact output hash, refuses unknown files and
never overwrites the original or v2 aliases. No Node/SDK/editor is needed.
Repeated installation verifies and keeps an identical existing alias.

Direct copy alternative (use instead of the installer):

```powershell
$candidate = '%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\work\native-door-experiment-001\c_start2_doornative.bsp'
$destination = 'D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps\c_start2_doornative.bsp'
if ((Get-FileHash -LiteralPath $candidate).Hash.ToLowerInvariant() -ne 'fd4979bbb018c1b3f9a4f0d1ce06fd0cc05ce1ff8b9ffb84e291c07943b3049c') { throw 'Unexpected source hash' }
if (Test-Path -LiteralPath $destination) { throw 'Destination exists; use the guarded installer' }
$copyStream = [IO.File]::Open($destination, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
try { $copyBytes = [IO.File]::ReadAllBytes($candidate); $copyStream.Write($copyBytes, 0, $copyBytes.Length) } finally { $copyStream.Dispose() }
Get-FileHash -LiteralPath $destination -Algorithm SHA256
```

Keep your working Sandboxie configuration. Run the same `Get-FileHash` command
in PowerShell launched inside the existing Sandboxie box to confirm its file
view sees the same hash. If it does not, do not test mismatched maps; run the
installer from that box to its game maps directory using `-MapsDirectory` if
different. It will refuse an unknown alias rather than erase sandbox contents.
No need to clear or reconfigure Sandboxie. A friend on another PC can run the
asset-free package's installer against their own legitimate game installation.

## Steam and console procedure

1. Launch normal Cry of Fear through Steam for P1. Launch your already working
   Steam + Cry of Fear Sandboxie instance for P2.
2. P1: **Host new coop game** / Create server; choose your known-working native
   `cof_campaign_01` baseline. P2 joins using your existing working method.
   Confirm each window sees the other player and both move/collide normally.
3. On HOST P1's console:

   ```text
   changelevel c_start2_doornative
   status
   ```

4. On P2, run `status` too. Both must report `c_start2_doornative`. Take a
   two-window before screenshot while standing in the same area. Initial
   two-way visibility is required before continuing. Do not change model or
   rendering cvars during this experiment.

## Door and acceptance test

Use **the same door panel that you walked into for the successful v2 bypass**.
It should now require your normal E/Use binding again. Walking into it alone
should not perform the bypass relocation. The suggested “after stairs, before
the cafe” landmark has not been visually verified by Codex; the previously
tested panel is the reliable identifier. The gated cafe doors are separate.

Exact BSP identifiers, if needed: door 49 / brush `*6` targets `d1_1_exit1`
(feet `1040 -1711 -896`, yaw 270). Return door 50 / brush `*7` targets
`d1_1_exit2` (feet `3655 -1257 -896`, yaw 90). These are zero-based indices;
there is no generic entity-index console command assumed here.

1. P1 presses E once while P2 waits. Record whether only P1 or both move.
   Observe opening/closing sound, fade, destination and return of control.
2. If P2 stays behind, P2 uses E independently. Once both occupy the SAME
   destination area, look at each other in both windows. Each must see the
   other's character; approaching and bumping confirms collision separately.
   Verify movement, look, Use and inventory controls. No reconnect is allowed
   to turn a failure into a pass. Record any delayed restoration after the fade.
3. Have P2 lead the reverse crossing using E, then P1 if still behind. Check
   the same destination/control/collision/two-way visibility conditions.
4. If this passes, repeat one outward and return cycle with the leader order
   reversed. Record sound/fade differences even if visibility passes.
5. Run `status` after each crossing: it must remain `c_start2_doornative`.
   Avoid the different door leading to `c_start`; its stock cross-map routing
   leaves this experiment and can later reload the original `c_start2`.

If visibility fails, capture both windows with both players close together,
record the first failing direction/actor and `status`, then stop this run.
Do not keep retrying or reconnect before recording the failure. The v2 bypass
can be used in a fresh run as the existing regression baseline; its reverse
path still needs a real test. No headless test or new server infrastructure
is required.

Report back this small result table (Yes/No plus notes):

| Check | Result |
|---|---|
| Map/hash match in both client file views | |
| Before: P1 sees P2 / P2 sees P1 | |
| Outward: E works; who moves first; correct destination | |
| Outward: P1 sees P2 / P2 sees P1 once together | |
| Reverse: E works; correct destination; both visibility directions | |
| Movement/look/Use/inventory/collision; reconnect required? | |
| Sound/fade timing or other presentation differences | |
| First failure: actor, direction, before/during/after fade, status map | |

## Rollback

Close both clients and run (also inside the existing box if installed there):

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File '%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\outputs\cry-of-fear-coop\scripts\install-native-door-experiment.ps1' -Remove
```

Only the hash-matching `c_start2_doornative.bsp` is removed. Unknown/changed
files are retained; original maps and control/bypass remain available.
