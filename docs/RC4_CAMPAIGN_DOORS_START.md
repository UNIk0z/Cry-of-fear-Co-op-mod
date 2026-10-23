# Install and roll back campaign-doors-001

Both games must be fully closed, including the Sandboxie client. The full RC2
campaign is a prerequisite. The package rebuilds 8 overlay maps from your own
original files and adds its own `cl_dlls/storycoop_rc4.dll`. It never replaces
original BSPs, `hl.dll`, `client.dll`, liblist or Steam/auth files, and never
deletes save files. Run the steps in EACH real environment; a boxed copy can have
its own maps folder. Never bypass a hash guard or delete an unknown alias by hand.

Open PowerShell in the extracted package folder:

~~~powershell
$patch = (Get-Location).Path
$maps = 'D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps'
~~~

## 1. Remove the RC4 build that is installed now

Your last installed build is integration-001 (adapter `bffde10e…`). Remove it with
its exact remover:

~~~powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$patch\integration-rc4-rollback\install-story-package.ps1" -Remove -MapsDirectory $maps
if ($LASTEXITCODE -ne 0) { throw 'integration-001 guard refused. Do not continue; preserve the message.' }
~~~

If you had installed camera-notes-001 instead, use its remover. A remover only
deletes files whose exact hashes it knows; the wrong one refuses and changes
nothing.

~~~powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$patch\previous-rc4-rollback\install-story-package.ps1" -Remove -MapsDirectory $maps
if ($LASTEXITCODE -ne 0) { throw 'camera-notes-001 guard refused. Do not continue; preserve the message.' }
~~~

If no RC4 overlay is installed, skip step 1.

## 2. Verify, install and host

~~~powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$patch\install-story-package.ps1" -VerifyOnly -MapsDirectory $maps
if ($LASTEXITCODE -ne 0) { throw 'Preflight failed. Nothing was installed.' }
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$patch\install-story-package.ps1" -MapsDirectory $maps
if ($LASTEXITCODE -ne 0) { throw 'Installation failed. Preserve the message.' }
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$patch\host-story-coop.ps1" -Map cof_campaign_story4 -NativeRC4
~~~

Run steps 1 and 2 in the Sandboxie environment too, using that environment's
actual maps directory. Then follow TESTING.md.

To continue a saved slot later, close both games and run:

~~~powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$patch\host-story-coop.ps1" -ContinueSlot 2
~~~

Add `-GameDirectory 'YOUR_ACTUAL_CRYOFFEAR_DIRECTORY'` for another host path.

## Rollback

Close both games, then in EACH environment run:

~~~powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$patch\install-story-package.ps1" -Remove -MapsDirectory $maps
if ($LASTEXITCODE -ne 0) { throw 'Rollback guard refused. Stop.' }
~~~

Then reinstall one earlier build:

- **camera-notes-001** (bundled as `baseline`):

  ~~~powershell
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$patch\baseline\install-story-package.ps1" -MapsDirectory $maps
  ~~~

- **The last build you actually played (integration-001)**: use the `baseline`
  folder inside the camera-notes package at
  `%USERPROFILE%\Documents\Codex\2026-10-10\files-mentioned-by-the-user-consolelog-2\outputs\rc4-camera-notes-candidate`:

  ~~~powershell
  $cameraNotes = '%USERPROFILE%\Documents\Codex\2026-10-10\files-mentioned-by-the-user-consolelog-2\outputs\rc4-camera-notes-candidate'
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$cameraNotes\baseline\install-story-package.ps1" -MapsDirectory $maps
  ~~~

Save files survive removal. The verified RC3 opening remains available without
RC4: leave RC4 removed and use its own launcher, which runs without `-dll`.
