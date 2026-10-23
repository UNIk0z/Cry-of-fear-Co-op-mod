# First two-player c_start2 test — package v1

Historical package. The user has since confirmed working Steam + Sandboxie clients
on ONE PC and reproduced the bug on original c_start2, not this spawn experiment.
Use DOOR_TEST.md for the current controlled same-map door comparison. Preserve
the existing Sandboxie setup; the two-PC instruction below is superseded.

Ready for user-assisted testing. Built from ca74c3f's unchanged four-spawn
experiment. No game was launched this session; no file was installed into Steam.
All gameplay results remain NOT TESTED. Use two PCs and two Steam accounts.

## Install on both PCs while the game is closed

The package contains only this guide and install-c-start2-cooptest.ps1. Send
those files (or gameplay-test-v1.zip) to your friend. Each player builds from
their own Steam-installed c_start2.bsp. No Node, SDK, editor, administrator
launch, executable replacement or download is needed.

On this PC, open PowerShell and run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File '%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\outputs\cry-of-fear-coop\scripts\install-c-start2-cooptest.ps1'
```

Your friend extracts the ZIP, opens PowerShell in the extracted directory, and
runs the following. Replace only MapsDirectory if their Steam library differs;
Steam > Cry of Fear > Properties > Installed Files > Browse locates their root.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File '.\install-c-start2-cooptest.ps1' -MapsDirectory 'D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps'
```

The source is D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps\c_start2.bsp.
The destination is the same directory's **c_start2_cooptest.bsp**.
The installer refuses different source versions or an existing destination.
Both installations must print 18,699,548 bytes and this SHA256:

```text
12b52fb58d8ad99f511a7202eed2702066e898faea0a00ed68c61962138a67ec
```

If it says the alias already exists, check its hash with Get-FileHash. A matching
hash means it is already installed; do not rebuild or remove it unnecessarily.
If the source hash differs, stop and report it; do not disable the guard.

Exact manual-copy alternative on this PC (use INSTEAD of the installer):

```powershell
$sourceMap = '%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\work\prototype-spawns-001\c_start2.bsp'
$testMap = 'D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps\c_start2_cooptest.bsp'
if ((Get-FileHash -LiteralPath $sourceMap).Hash.ToLowerInvariant() -ne '12b52fb58d8ad99f511a7202eed2702066e898faea0a00ed68c61962138a67ec') { throw 'Unexpected source map' }
if (Test-Path -LiteralPath $testMap) { throw 'Destination exists; do not overwrite' }
Copy-Item -LiteralPath $sourceMap -Destination $testMap -ErrorAction Stop
Get-FileHash -LiteralPath $testMap -Algorithm SHA256
```

## Steam and native co-op launch

1. Both players launch **Cry of Fear from Steam Library > Play**, using the
   installed launcher and their normal working video settings. This installation
   has CoFLaunchApp.exe and cof.exe in the root above. Do not launch the copied
   runtime or hlds.exe for this test. Keep your already-working console setup.
2. Host chooses **Host new coop game**. Allow at least two players (four is
   the installed default; supported UI range is 1–4). Use the same networking
   and password setup that previously let you play together. For remote internet
   play, leave LAN server off; for an existing LAN/VPN setup, retain its working
   settings. Complete the game's normal co-op lobby/campaign selection.
3. Friend chooses **Join coop game** and joins that host. Alternatively, open
   the console with the grave/tilde key above Tab and enter the following,
   substituting the host's reachable address and actual server port:

   ```text
   password "YOUR_SERVER_PASSWORD"
   connect HOST_REACHABLE_IP:27015
   ```

   Omit password when none is set. 27015 is the usual port, not a measured value
   for this session; use the actual address/port from your working setup. Do not
   give your friend 127.0.0.1. For connectivity help, the developers provide a
   [native co-op/Hamachi tutorial](https://www.youtube.com/watch?v=6Bw-_nnYeEU).
4. Start a stock native cooperative campaign and reach a playable section.
   The inspected native entry is cof_campaign_01; c_cof_bridge is an inspected
   playable reference. Before changing maps, both players must be connected,
   alive, moving and able to see one another. If this fails, stop here: the
   experiment cannot diagnose a broken native baseline.
5. Host opens the console and runs **status**. Save its map, player count,
   server address and any errors. Then, HOST ONLY:

   ```text
   changelevel c_start2_cooptest
   status
   ```

   Do not include .bsp. Wait for both players to finish loading. Confirm status
   names c_start2_cooptest and shows two clients. Do not start this experiment
   with a fresh single-player `map` command or force coop/deathmatch cvars: keep
   the native session initialized by the game. Your earlier reported successful
   native-host/changelevel procedure is the runtime basis for this test.

If the console no longer opens, stop and report the launcher/options shown rather
than changing executable arguments blindly. The installed config binds grave
and tilde to toggleconsole; launching the menu has not been visually verified by
Codex. Do not install a different launcher to solve this test.

## What to do in the map

Run the experiment first. Take screenshots/video from BOTH viewpoints; Steam
F12 is suitable if your overlay is enabled. Keep each action separate.

| Check | Exact observation to collect |
|---|---|
| Initial spawn | Before touching a door, face each other in a lit area. Host sees friend? Friend sees host? Body versus weapon only? Can both walk/look/jump? HP and starting inventory on each PC? Any stuck/overlapping spawn? |
| Visibility over time | Separate, turn away, reunite and cross rooms. Record the FIRST action after which either model disappears. Collision alone is not visibility proof. |
| Doors | Use your configured Use/Interact key. Try host alone while friend stays clear, then friend alone at a different equivalent door or a fresh run. Record physical door/location, response/message, whether each crosses, and visibility afterward. A locked door is not automatically a co-op bug. |
| Computer/script | The inspected computer button targets computeron, then multimystery. At the story computer, have one player interact while the other watches; record each screen/audio change, controls, completion, repeat behavior and inventory. If unreachable, report NOT TESTED. |
| Return transition — LAST | After other checks, approach the return door near the initial spawn. First try host with friend standing away and record who moves. On a fresh run try both nearby. Record status before/after, both arrival positions, visibility, controls and inventory. |

The return chain is inter_door lolexit2 -> inter_door_exit -> trigger_multiple
haehecl -> trigger_changelevel **c_start** (landmark hahaland). It includes a
same-map relocation followed by a cross-BSP change. Note which stage fails;
video is useful if they happen too quickly to separate.

**Expected routing limitation:** progression still loads unmodified c_start.
A return from there targets original c_start2, not c_start2_cooptest. The alias
is a test entry only; no campaign routing or door fix is included. Once status
shows another map, subsequent failures belong to that unmodified map/stage.

No trigger_camera or cof_teleport entities were found in c_start2. The computer
is still a scripted event; camera-free entity data does not prove every event
works. Full introductory cutscene validation belongs to c_start, which has 25
trigger_camera entities and is outside this spawn-only experiment. Record any
actual camera/control event encountered, but do not claim the campaign's
cutscenes pass from this map alone.

If the experiment loads and the first checks are captured, run the control:
re-create the same stock native co-op session, join both players, then host runs
`changelevel c_start2`. Repeat the initial visibility check and the specific
failing interaction with the same player order. Do not compare a fresh native
session against a session already altered by a failed story transition.
Return to native co-op through the menu to recover from a softlock. Stop after
one reproducible crash/loading failure; retain exact error text.

## Report back

```text
Both map hashes match expected: yes/no (paste mismatches)
Native baseline: map= ; host sees friend= ; friend sees host=
Experiment loaded: yes/no; status map= ; connected players=
Spawn: host position/HP/items= ; friend position/HP/items=
Visibility immediately: host sees friend= ; friend sees host=
First disappearance, if any: action= ; affected viewpoint= ; collision still present=
Door: location/screenshot= ; user=host/friend ; partner nearby/away= ; result/message=
Computer/event: host screen/audio/control= ; friend screen/audio/control= ; finished/repeated=
Transition: actor= ; partner nearby/away= ; map before/after= ; both moved= ; visibility/control/items afterward=
Original c_start2 control: same symptom/different/not tested; details=
Crash/console error: exact text= ; last successful action=
Evidence: screenshots or short video from both PCs
```

Use PASSED, FAILED, BLOCKED or NOT TESTED for each check. Do not include passwords
or private/public IPs when sharing logs outside this conversation.

## Revert

Close the game. Run the SAME installer command with **-Remove** appended on
each PC. It removes only the known-hash c_start2_cooptest.bsp; a changed file is
retained for inspection. No original map, DLL, config, WAD or save is modified.

## Engineering findings and limits

- The BSP is a complete classic BSP30 file: 18,699,548 bytes, 447 entities. All
  443 original entities are preserved; all 14 non-entity lump bytes, offsets and
  lengths match the original. Original bytes from offset 12 through original EOF
  are unchanged. Only the entity header pair changes; a new entity lump is
  appended. It is NOT an entity export. Engine acceptance/playability needs this
  gameplay test; the obsolete entity lump retained in the file is unused.
- Source c_start2.bsp has no matching companion files in the installed maps
  directory and no c_start2 string in its entity values. Renaming adds no known
  entity/resource dependency. Original geometry, textures, models, sounds and
  event references remain inherited from the full Steam installation. Hardcoded
  filename behavior inside the game's DLL remains unverified.
- FGD and native maps support cof_coop_spawn1–4. The host UI supports 1–4 players.
  Native campaign map .cfg files specify starting equipment; c_start2 has none.
  No inventory .cfg, model override, customizer or co-op transition is added.
  Record actual inventory rather than assuming native loadout inheritance.
- The previous fonts.wad message is not evidence of fatal initialization.
  [ReHLDS W_LoadWadFile](https://github.com/rehlds/ReHLDS/blob/master/rehlds/engine/wad.cpp)
  prints this warning and returns -1 for a missing nonfirst WAD; the first WAD
  failure takes Sys_Error instead.
  [Host_Init](https://github.com/rehlds/ReHLDS/blob/master/rehlds/engine/host.cpp)
  loads gfx.wad, then fonts.wad, and continues to network/server initialization
  without checking the second return. This is comparative engine-source evidence,
  NOT inspection of CoF's exact proprietary implementation. The missing optional
  font load is likely harmless; the old timeout's cause remains unknown. fonts.wad
  is absent from the inspected installed-content snapshot and isn't named in
  c_start2's worldspawn WAD list. Do not fabricate it or copy Half-Life assets.
- No headless retry or automated Steam launch was attempted. Native desktop
  control is unavailable; the user-assisted baseline/map-load test above is the
  remaining runtime gate.
