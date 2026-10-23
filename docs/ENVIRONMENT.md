# Environment evidence — 2026-10-08

## Latest state; earlier access failures below are historical

Approved require_escalated reads now access D:\SteamLibrary\steamapps\common\Cry of Fear.
Normal reads still fail. Root contains cof.exe, CoFLaunchApp.exe, hlds.exe,
Core.dll and engine/Steam libraries. cryoffear/cl_dlls contains client.dll,
hl.dll and GameUI.dll. liblist.gam declares version 1.6, gamedll cl_dlls/hl.dll,
startmap intro, mpfilter c_ and args -num_edicts 4096 -heapsize 1024000. The
declared intro file wasn't found; c_intro.bsp exists. Effective startup is unverified.

User-supplied/authorized tools:
- D:\CryOfFear_SDK_1.3\FGD\cry_of_fear.fgd — read, local copy in workspace work/.
- D:\CryOfFear_SDK_1.3\RMF\COOP\ — source examples located.
- D:\J.A.C.K\jack.exe and D:\bspguy\bspguy.exe — located, not GUI-tested.
- D:\Ghidra\ghidra_12.1.4_PUBLIC\ghidraRun.bat — located, not executed/needed.

SDK assets are restricted to Cry of Fear content creation; originals stay outside
Git. Native campaign cfgs contain equipment/ammo records. models/player contains
police1–4 folders. Steam wasn't observed running in the elevated process check.
Independent asset snapshot uses copies, not junctions/hardlinks; critical/config
hashes match. Native HLDS probe reached console initialization, fonts.wad warning,
then bounded termination without map-load evidence. TEST_RESULTS has exact status.

## First-session evidence

## Verified commands and files

| Item | Observed result |
|---|---|
| Steam library index | Read C:\Program Files (x86)\Steam\steamapps\libraryfolders.vdf; app 223710 is indexed under D:\SteamLibrary, size entry 0 |
| Game manifest/layout | BLOCKED: Get-Content D:\SteamLibrary\steamapps\appmanifest_223710.acf and Get-ChildItem ...\common returned Access is denied |
| Read grants | D:\SteamLibrary\steamapps, then D:\SteamLibrary, both granted for the session; reads remained denied |
| Shell escalation | Rejected: sandbox_approval=false; cannot ask for escalated permissions under the granular policy |
| Node | Executed --version: v24.17.0 |
| Git | Executed --version: git version 2.54.0.windows.3 |
| Visual Studio | vswhere reports complete, launchable Community 2022, 17.14.39 |
| MSVC | Found version directories 14.34.31933 and 14.44.35207; no compiler test performed |
| Python | python.exe/py.exe resolve to WindowsApps aliases; both failed with 'The file cannot be accessed by the system' |
| bspguy | Found %USERPROFILE%\Downloads\bspguy_v6_windows_x64.zip, 3,410,707 bytes; not extracted or executed |
| SDK, J.A.C.K./Hammer, Ghidra | Actual installations unverified; no broad drive scan performed |
| VS Code | Not found at two standard candidate paths; existence elsewhere remains unverified |
| Bundled document runtime | App tool reported no runtime dependencies configured |
| Native UI observation | Native computer APIs are disabled in the available UI tool; no gameplay observation was performed |

Node executable:
`C:\Program Files\Microsoft Visual Studio\2022\Community\MSBuild\Microsoft\VisualStudio\NodeJs\node.exe`

Git executable:
`C:\Program Files\Microsoft Visual Studio\2022\Community\Common7\IDE\CommonExtensions\Microsoft\TeamFoundation\Team Explorer\Git\cmd\git.exe`

vswhere executable:
`C:\Program Files (x86)\Microsoft Visual Studio\Installer\vswhere.exe`

## Additional failed environment probe

Direct invocation of our .ps1 probe was rejected by the machine's execution
policy. A process-scoped Bypass invocation then stalled, and Ctrl+C terminated it.
Two bounded runs after narrowing executable lookup and library selection timed
out after 20 seconds. The final transcript stopped after 'Inspecting Cry of Fear
manifest in D:\SteamLibrary'. No full JSON environment report was produced.
The final scratch transcript is ../../work/environment/probe-transcript.txt.
No game process was launched. Do not retry without changed drive access.

Permission-denied errors were followed by misleading 'does not exist' messages.
Do not conclude the game is absent from these errors. The Steam index alone does
not prove that the actual installation is complete, available, or launchable.
