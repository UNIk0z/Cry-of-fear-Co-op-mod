# RC3 build007: one continuous two-player opening test

Use exactly two players and native Steam Cry of Fear. Gameplay remains unverified.
The two-client ZIP includes unchanged full RC2 in `rc2` and the new overlay in
`rc3`. Both computers need both packages. Only three new opening aliases are used:
cof_campaign_story3 -> s3_nightmare -> s3_start, then existing RC2 routes.

## Install and launch

1. Close Cry of Fear on both computers. Extract the complete two-client ZIP.
2. If RC3 build005 was installed, double-click `rc3\remove-build005.cmd` first.
   It removes only unchanged old RC3 aliases and retains RC2/originals. It also
   succeeds when none exist. Do not use it after installing build007.
3. Double-click `Install RC3.cmd` at the ZIP root on each computer. It runs the
   existing RC2 installer, then RC3, stopping on an error. Default maps directory:
   `D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps`.
4. After installation succeeds, P1 alone double-clicks `rc3\Host Coop Game.cmd`.
   Steam must already be signed in normally. P2 joins using the native connection
   method that worked for RC2. Do not run the host launcher on P2.
5. Both must join before either presses Ready. A solo ready callback now leaves
   the intro stopped, but native ready UI can close: restart that lobby. A later
   unready P2 join cannot start or recover it. Reconnect recovery is unsupported.

For different game paths, run BOTH installers with `-MapsDirectory` pointing to
that game's `cryoffear\maps`. Sandboxie writes/verification must target the same
boxed environment that runs the game; an unboxed check proves nothing about it.
Do not bypass the RC3 dependency guard. No original BSP or DLL is overwritten.

Example after extracting on this machine:

```powershell
$test = '%USERPROFILE%\Documents\Codex\2026-10-09\cry-of-fear-story-co-op\outputs\rc3-two-client-test'
$rc3 = "$test\rc3"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$test\rc2\install-story-package.ps1"
if ($LASTEXITCODE -ne 0) { throw 'RC2 installation failed; stop.' }
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$rc3\install-story-package.ps1"
if ($LASTEXITCODE -ne 0) { throw 'RC3 installation failed; do not launch.' }
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$rc3\host-story-coop.ps1" -Map cof_campaign_story3
```

The launcher sets maxplayers2 and **mp_footsteps1 before +map**. The pinned native
DLL reads that value for its forced lobby deadline; <=1 disables the deadline.
Use this launcher for acceptance. Changing the value after load is too late.
If Steam discovery fails, pass `-SteamExe` with its actual installed executable.
No New Game or generic HLDS launch. No Steam authentication changes.

Before ready, BOTH clients open console:

```text
condebug
echo STORYCOOP_RC3_BEGIN
status
```

`condebug` toggles logging: issue it only if logging is not already active. Keep
logs private. Confirm map cof_campaign_story3, maxplayers2 and both players listed.
Record start time. Do not manually fire entities, teleport, skip scenes or change
maps during the continuous run.

## Continuous acceptance run

All rows below are AWAITING GAMEPLAY VERIFICATION. Static tests do not pass them.

| # | Action / expected result |
|---|---|
| 1 | P1 hosts new alias; native ready UI appears |
| 2 | P2 joins; status lists both |
| 3 | Wait15 seconds with neither ready, then75 seconds with only P1 ready: no intro starts |
| 4 | P2 readies: widget finishes; intro starts once |
| 5 | Both hear dialogue/music and see the intended introduction |
| 6 | Both see correct camera/fades/overlays; report any overbright vehicle shot |
| 7 | Automatic transition reaches s3_nightmare on both |
| 8 | Both reach the intended nightmare area; neither stranded or stuck |
| 9 | Each has one usable camera; compare inventories |
| 10 | Both move, look and use camera during nightmare gameplay |
| 11 | P2 performs a required photo, then P1 another; shared progression advances |
| 12 | Finish without skipping; no interruption or stuck view |
| 13 | Ending automatically selects s3_start; NIGHTMARE_HANDOFF appears once |
| 14 | Both load successfully; no host hang or P2 timeout |
| 15 | Waking scene finishes; both gain phone/knife, camera removed, control/models visible |
| 16 | Walk onward together; report exact alias/door if first story route blocks |

Use `status` in nightmare gameplay and after waking. Black-fade holding areas are
not playable spawn locations. Host markers start `[STORYCOOP_RC3]`; original root
markers multiintroduct, multiintro3, nightmulti and multiscene1 should each appear
once; TWO_JOINS once on each following map. Markers record dispatch, not proof that both clients rendered or received the scene.

Stop at the first blocker. Report row, map, P1/P2 symptoms, errors and loading time.
If loading hangs, wait at most90 seconds; record whether host console responds.
Do not repeat long waits or relaunch loops. Do not reconnect in the main run.

A separate guard check can start a fresh host alone, ready it and wait15 seconds:
the intro must remain stopped. Close it, then start a fresh two-client main run.
This negative test does not establish native ready UI recovery or pass any row.

## Only if nightmare->wake fails: one direct-load comparison

Collect both logs FIRST. Close the failed session. Start a FRESH host:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$rc3\host-story-coop.ps1" -Map s3_start
```

P2 joins normally. P1 alone waits intentionally at the two-client barrier. Both
check `status` and logging, then whether waking completes, phone/knife arrive and
control returns. Use the same90-second bound; do this comparison once.

Direct load succeeds but progression fails: investigate transferred/handoff state.
Both fail: investigate destination initialization/resources/native rules. These
are triage directions, not diagnoses. Direct loading does not pass row13.

## Logs and rollback

Close normally if possible. Each client runs the existing collector:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$rc3\collect-story-log.ps1" -Client P1
```

P2 uses `-Client P2`, with its actual `-GameDirectory` if different. Sandboxie uses
`-LogPath` pointing to the actual boxed qconsole.log. Supply both fresh logs plus
the first failed row, inventory, visual/control/model differences and elapsed time.

With game closed, double-click `rc3\remove.cmd` for build007 rollback. It removes
only hash-matching RC3 aliases; RC2/originals remain. Changed files are refused.
"Already installed and verified" is success. Check `status` to avoid retesting RC2.
