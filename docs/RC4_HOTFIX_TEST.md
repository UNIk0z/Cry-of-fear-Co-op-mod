# One two-client opening regression test

Close both games and extract the entire package. Keep the complete RC2 maps and
verified RC3 build007. Use the commands below in each environment when the maps
directory differs from the default. For Sandboxie, execute installation through
that environment against its actual maps directory.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\previous-rc4-rollback\install-story-package.ps1 -Remove -MapsDirectory "D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\install-story-package.ps1 -MapsDirectory "D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps"
```

The default equivalent is `remove previous RC4.cmd`, then `install.cmd` in BOTH
environments. If removal refuses changed files, retain them and report the
message. The previous remover refuses the newer hotfix before any deletion.

P1: run `Host RC4.cmd`. P2: join normally. Both join BEFORE either readies.
Enable console logging on each client with `condebug` if logging is off;
the command toggles logging, so use it once and note its console response.
Enter `echo STORYCOOP_RC4_HOTFIX_BEGIN` on both consoles.

Run this single uninterrupted test:

1. With both players joined, P1 readies; wait 75 seconds without P2 ready.
   The original intro must wait. Then P2 readies and both watch the intro.
2. Confirm the title vehicle appears on BOTH clients, rain remains visible and
   the static-rain warning is absent. Let the authored sequence run completely;
   do not type a manual map/changelevel command.
3. Confirm automatic `s4_nightmare` arrival for both, camera equipment and usable
   nightmare gameplay. Complete it normally. Confirm automatic `s4_start`
   wake-up, both clients visible/controllable with the intended inventory.

At the FIRST failure, stop this test, record its step and P1/P2 symptoms, and save
both console logs. Persistence tests remain deferred. BOOT/MAP/echo messages
prove initialization only, never that the scene or state works.

Host diagnostics: `VEHICLE_SPAWN skittag/skittag22 nativeResult=0` records native
acceptance; `NATIVE_THINK` records the first native manager dispatch for the
title root, multikattej, multiintro1, multiintro2 and kunitei2. Several entities
share manager names, so separate edict lines are expected. These observations
do not prove rendered visibility or successful completion. Opening MAP lines
must show `scope=0` and `OPENING_PASSIVE`; `s4_start` resumes `scope=1`.

Rollback, with games closed, in both environments:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\install-story-package.ps1 -Remove -MapsDirectory "D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps"
```

Or run this package's `remove.cmd`. Then use the existing RC3 build007 host
launcher without the `-dll` override; RC3/RC2/original files are retained.
