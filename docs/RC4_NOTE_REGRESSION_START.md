# RC4 notes patch — PowerShell installation

Close both games. The full RC2 prerequisite and currently installed maintenance001
are expected. The expanded package is already at the following path; extracting
the ZIP elsewhere is also supported by changing `$patch`. Run these commands in
each client's actual Steam/Sandboxie environment:

```powershell
$patch = '%USERPROFILE%\Documents\Codex\2026-10-09\cry-of-fear-story-co-op\outputs\rc4-note-regression-test'
$maps = 'D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps'
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$patch\previous-rc4-rollback\install-story-package.ps1" -Remove -MapsDirectory $maps
if ($LASTEXITCODE -ne 0) { throw 'Previous-build guard failed; keep the error and stop.' }
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$patch\install-story-package.ps1" -VerifyOnly -MapsDirectory $maps
if ($LASTEXITCODE -ne 0) { throw 'Preflight failed; keep the error and stop.' }
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$patch\install-story-package.ps1" -MapsDirectory $maps
if ($LASTEXITCODE -ne 0) { throw 'Installation failed; keep the error and stop.' }
```

Use the actual boxed maps path/environment for P2. A hash refusal retains unknown
files; do not bypass it. If an earlier hotfix is installed instead, remove it
with its own retained package first. Keep the maintenance package, which holds
the previous adapter and plans; this patch's previous remover alone cannot
reconstruct an old adapter.

P1 host command (P2 joins normally before either readies):

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$patch\host-story-coop.ps1" -Map cof_campaign_story4 -NativeRC4
```

Follow TESTING.md. Vehicle rendering remains unresolved; continue the note test
if the vehicle is absent but the preserved automatic transition succeeds.

Rollback to the exact retained maintenance build, with both games closed:

```powershell
$previous = '%USERPROFILE%\Documents\Codex\2026-10-09\cry-of-fear-story-co-op\outputs\rc4-maintenance-test'
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$patch\install-story-package.ps1" -Remove -MapsDirectory $maps
if ($LASTEXITCODE -ne 0) { throw 'Rollback guard failed; stop.' }
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$previous\install-story-package.ps1" -MapsDirectory $maps
if ($LASTEXITCODE -ne 0) { throw 'Previous-build reinstall failed; keep the error.' }
```

Original/RC2/RC3 files and host checkpoint files are retained. To run RC3, use
its original launcher without the RC4 `-dll` option. DIAGNOSTICS.md and QA.json
separate implementation/fixture evidence from actual gameplay verification.
