# Install and roll back the camera/note candidate

Both games must be closed. The full existing RC2 campaign is a prerequisite.
This package reconstructs8 overlay maps from your original local files; it does
not contain or replace original BSPs, hl.dll,client.dll,Steam/auth or liblist.
Run in BOTH actual Steam/Sandboxie environments; a boxed copy can have a different
maps directory. Never bypass a hash guard or delete an unknown alias manually.

Open PowerShell in the extracted package folder:

~~~powershell
$patch = (Get-Location).Path
$maps = 'D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps'
# Remove only the exact previously delivered integration-001 candidate.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$patch\previous-rc4-rollback\install-story-package.ps1" -Remove -MapsDirectory $maps
if ($LASTEXITCODE -ne 0) { throw 'Previous-build guard failed. Stop; preserve the error.' }
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$patch\install-story-package.ps1" -VerifyOnly -MapsDirectory $maps
if ($LASTEXITCODE -ne 0) { throw 'Preflight failed. Stop; no new files installed.' }
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$patch\install-story-package.ps1" -MapsDirectory $maps
if ($LASTEXITCODE -ne 0) { throw 'Installation failed. Preserve the error.' }
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$patch\host-story-coop.ps1" -Map cof_campaign_story4 -NativeRC4
~~~

If no RC4 overlay is installed, omit the previous-removal command only. Unknown
or mixed versions must be diagnosed, not overwritten. Existing saves are retained.
For a freshly saved slot2, close both clients, then:

~~~powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$patch\host-story-coop.ps1" -ContinueSlot 2
~~~

Continue slot1.cmd selects slot1. For another real host path also pass
-GameDirectory 'YOUR_ACTUAL_CRYOFFEAR_DIRECTORY'. Manual profiles must be rebound
to the same person/key after restart. Old saved419 means419; its real recorder
cannot be recovered from the old hard-coded header. Follow TESTING.md once.

Rollback, with both clients closed, in EACH environment:

~~~powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$patch\install-story-package.ps1" -Remove -MapsDirectory $maps
if ($LASTEXITCODE -ne 0) { throw 'Rollback guard failed. Stop.' }
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$patch\baseline\install-story-package.ps1" -MapsDirectory $maps
if ($LASTEXITCODE -ne 0) { throw 'Previous candidate reinstall failed. Preserve the error.' }
~~~

baseline contains the exact prior candidate plans/owned DLL and installer. That
candidate has the reported camera/layout bugs; its latest save test was interrupted. To return to the gameplay-tested
RC3 opening instead, leave RC4 removed and use your existing RC3 launcher without
-dll. Save files survive removal; old launchers do not support the new prepare
sequence. Never use the baseline Continue to validate this new implementation.
