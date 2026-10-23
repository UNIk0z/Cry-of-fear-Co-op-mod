# RC4 maintenance 001 — start here

Experimental two-client candidate. The hotfix's shared puzzle code and extra
pickups are VERIFIED WORKING by the user. The new introduction, audio, conditional
doors and checkpoint restore are AWAITING GAMEPLAY VERIFICATION.

1. Close both games and extract the whole ZIP. Keep the full RC2 prerequisite,
   RC3 build007 and the delivered RC4 intro hotfix comparison package.
2. In BOTH actual Steam/Sandboxie environments, run `remove previous RC4.cmd`
   to remove only the exact delivered intro hotfix, then `install.cmd`.
3. P1 runs `Host RC4.cmd`; P2 joins normally before either readies.
4. Follow TESTING.md in order. Stop at the first failed row and retain BOTH logs.
5. Checkpoint saving is limited to the supported wake-map recorders after story
   actions finish. Continue uses the existing Steam launcher; see CHECKPOINT.md.

Custom/boxed path, from the extracted package folder:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\previous-rc4-rollback\install-story-package.ps1 -Remove -MapsDirectory "D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\install-story-package.ps1 -VerifyOnly -MapsDirectory "D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\install-story-package.ps1 -MapsDirectory "D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps"
```

Run installation through each client's actual environment. A hash refusal leaves
files intact; retain the message and do not bypass it. If using failed build010
instead of the delivered hotfix, remove it with its own retained remover first.

Rollback with games closed: run this package's `remove.cmd` in both environments,
then reinstall the retained intro hotfix, or use RC3 build007 without `-dll`.
RC2/RC3/original maps, original DLLs and host checkpoint files are retained.

README.md explains the changes and causal evidence. CHECKPOINT.md states the
supported checkpoint scope and actual runtime interfaces. QA.json records
automated checks; it does not establish a playable restarted save.
