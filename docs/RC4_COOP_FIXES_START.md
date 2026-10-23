# Install coop-fixes-001

Close BOTH games first, including the Sandboxie client. Then, in this folder:

1. Double-click **`remove previous RC4.cmd`**. This removes campaign-doors-001,
   the build you tested. If it refuses, you have the older integration build
   installed instead: run **`remove integration RC4.cmd`**. Each remover only
   deletes files whose exact hashes it knows; the wrong one refuses and changes
   nothing.
2. Double-click **`install.cmd`**.
3. Double-click **`Host RC4.cmd`** to play. To continue a save later, close both
   games and use **`Continue RC4 slot1.cmd`**.

Do steps 1–2 for the Sandboxie client too. Right-click each `.cmd` → **Run
Sandboxed** so it installs into the boxed game copy. The batch files use the
normal game folder `D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps`.

PowerShell equivalent, from this folder:

~~~powershell
$patch = (Get-Location).Path
$maps = 'D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps'
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$patch\previous-rc4-rollback\install-story-package.ps1" -Remove -MapsDirectory $maps
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$patch\install-story-package.ps1" -VerifyOnly -MapsDirectory $maps
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$patch\install-story-package.ps1" -MapsDirectory $maps
~~~

## Rollback

To go back, close both games and double-click `remove.cmd`. Then reinstall
campaign-doors-001 from this package:

~~~powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$patch\baseline\install-story-package.ps1" -MapsDirectory $maps
~~~

Saves are never deleted. The RC3 opening build remains available through its
own launcher, which runs without `-dll`.
