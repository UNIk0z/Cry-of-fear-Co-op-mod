# One continuous original-story test — RC2

RC2 is incomplete. This test establishes how far the connected campaign runs;
it is not a promise that all branches reach an ending. Use two legitimate Steam
clients and the same package. Keep the previously working network/Sandboxie setup.
Do not uninstall the verified baseline. Close Cry of Fear before installation.

## Install on both PCs

Extract the complete package. In PowerShell, run this literal path on the current
development PC (on your friend's PC replace only the extracted-folder prefix):

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\outputs\connected-story-campaign-rc2\install-story-package.ps1"
```

The default original-map directory is
`D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps`.
Use `-MapsDirectory "<existing Steam game>\cryoffear\maps"` for another library.
The installer verifies all source/plan/output hashes before installing and refuses
unknown existing aliases. It creates `cof_campaign_story2.bsp` and `s2_*.bsp`.
An "Already installed and verified" line means the exact expected file is present.
It does not mean a new gameplay fix was applied. No menu or original BSP is replaced.

## Start at the original intro

1. Host double-clicks **Host Coop Game.cmd** in this package. This requests
   Steam app223710 with `-console -dev +maxplayers 2 +map cof_campaign_story2`.
   It uses Steam's registered executable; it does not launch HLDS or copy binaries.
   This command path is implemented but gameplay unverified.
2. If the launch arguments are ignored, use the game's existing **Host new coop
   game** dialog, select `cof_campaign_story2` if listed, and create a2-player
   session. Do not load the native cooperative campaign's alternate intro.
   If the map is absent or the session will not initialize, report that as the
   launch blocker rather than substituting a different campaign/manual map chain.
3. Friend joins via the same working Steam friend/server connection as before.
   Both open console and enter:

   ```text
   developer 1
   condebug
   status
   ```

   Host `status` must show `cof_campaign_story2`, two active players and2 max
   players. If it shows a single-player session, stop and report its exact output.
4. Both use the native ready control shown by the lobby. Expect the original
   story introduction once, on both screens. Confirm camera, sound, restoration
   of control and both visible character models. Record whether ready actually
   starts it; a visible lobby alone is not success.

## Follow the original story without console map changes

5. Follow original objectives through the intro into the nightmare. The first
   destination is `s2_nightmare_e0`; the graph then connects onward into c_start
   street variants. Check `status` immediately after each automatic transition.
6. Continue the street/cafe/credential sequence into `s2_start2`. Try ordinary
   doors with each player independently. Check intended room and orientation,
   collision, repeat/reverse Use, sounds/fade, movement and mutual visibility.
   Each player should be able to read both credential papers. Other static notes
   should reach both connected players with native readers; silent delivery is
   not implemented. Record title, collector and each player's journal result.
7. At the cafe code puzzle, record each displayed code and whether each player
   can use the host's code. **Shared validation is still blocked.** Do not enter
   a guessed console bypass or count individual private solutions as a shared
   solution. If ordinary play cannot progress, this is the stopping point.
8. If original progression continues, follow the apartment chain. Record the
   current alias, floor/door location, expected destination and actual room.
   Test a ground weapon/ammo/healing pickup once per player. Extra physical
   copies are intentional; no client-only disappearance or once-per-slot claim.
   Locked and scripted doors remain potential blockers. `s2_apartment1_e3/e5`
   specifically lack validated arrival landmarks and should be reported if reached.
9. Continue through subsequent original objectives and automatically connected
   levels, checking a scene and inventory/journal after each transition. Use
   CAMPAIGN_ROUTES.md to identify the current entry variant. The game determines
   order and branches; a shortest graph path is not a valid puzzle walkthrough.
10. At each native group door, both living players gather close to the door on
    its playable side and one presses E. Then exchange the activating player.
    Success requires destination BSP loading for both, correct arrival, control,
    models and expected inventory—not a ready message. If still waiting despite
    both being present, save both `status` outputs and the door location.
11. If normal progression reaches an ending branch, let its complete original
    scene and end behavior finish on both clients. Record the final alias and
    ending seen. An ending reached with manual `map`/`changelevel` commands does
    not establish an end-to-end pass. All branch/endings remain unverified.

Keep both players connected for the main run. After recording its result, a
separate late-join-during-scene attempt may reproduce the known camera defect;
do not interrupt the main run solely for that diagnostic.

## Report the first blocker or final outcome

Send: both `status` outputs; last working alias -> failing alias; precise door,
note or puzzle location; which player acted; what each player saw; expected and
actual room/floor; whether models/control/inventory/journal survived. Include both
console logs if available. Note whether a locked door was legitimately unlocked.
If the host ends the server, the friend's disconnection is expected.

Do not repeatedly retry a reliable overflow. Preserve logs and stop the run if
it disconnects a player. Unsupported headless automation will not be retried.

## Roll back RC2 only

Close the game, then run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\outputs\connected-story-campaign-rc2\install-story-package.ps1" -Remove
```

Removal preflights all195 aliases and deletes only matching RC2 files. Unknown
or modified files are retained and stop removal. Originals and previous working
aliases remain. RC2 does not install/change the failed RC1 menu insertion.
