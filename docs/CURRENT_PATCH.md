# Current c_start2 patch

This package installs the last reported working shared-note version, V11, with
the ordinary and cafe door adapters already included. **It does not implement
every requested feature.** Quiet remote note receipt and independent per-player
weapon/ammo/healing pickups remain unresolved. Failed V12's menu-close mechanism
is absent from this map. No new map variant or speculative fix is introduced.

## Install

1. Close both game clients. Extract the entire ZIP to a normal folder; do not
   run scripts from inside the ZIP. Keep all extracted files together.
2. Double-click `install-current-patch.cmd` on each PC. For your existing
   Steam + Sandboxie setup, ensure both game views see the installed alias.
   Leave your working Steam/Sandboxie configuration intact.
3. The window should report **Installed** or **Already installed and verified**.
   If it reports an error, stop and keep the exact message. No administrator
   launch is required by this package. Do not bypass source/DLL version guards.

The default installation is:
`D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps\c_start2_coop_note.bsp`.
Its SHA256 is:
`ef1c8f26a0c359d17a5b082813751a171f3e52cb86516317a21e3ff200468b95`.
The original `c_start2.bsp` and game DLLs are retained. The installer reads your
own original map and reconstructs the full modified BSP; no game assets are
distributed and no Node runtime is needed on your friend's PC.

For a different Steam library, extract to `C:\CoF-Coop-Patch` and run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\CoF-Coop-Patch\install-shared-note.ps1" -MapsDirectory "YOUR_ACTUAL_FULL_CRYOFFEAR_MAPS_DIRECTORY"
```

## Load through native co-op

Launch Cry of Fear from Steam. Start your working native **Host coop game / Create
server** session on `cof_campaign_01` and have the other player join. Once both
are alive and mutually visible, the host enters:

```text
changelevel c_start2_coop_note
status
```

The map name in `status` must be `c_start2_coop_note`. A still-installed
`c_start2_notequiet` file does not affect this alias; do not load that failed V12
map. Do not launch this using a single-player `map` command or force game-mode
cvars. Native multiplayer initialization is required.

## Actual coverage

| Feature | Included behavior | Evidence / limitation |
|---|---|---|
| Ordinary story doors49/50 | Independent E relocation, original audio and finite fades | V8 reference user verified both directions/actors/mutual models; chain retained here |
| Cafe doors204/206 | E relocation with shared enable/removal state and load reset | Adapter included; cafe gates/full progression not separately confirmed by user |
| Username note243 | Native first-use grant routed to connected players | V11 user reports both receive the note and both readers open |
| Remote note popup | Both readers still open; close normally to complete archival | Quiet delivery NOT fixed; do not add V12's immediate menu close |
| Password note242 / other notes | Original behavior | Not converted; username success is not full note coverage |
| Weapons, ammo, healing, other pickups | Original behavior | Per-player pickup consumption/visibility NOT implemented; weapon-stay is not an equivalent fix |
| Late joins, cutscenes, cross-map routing | Existing candidate/original behavior | No complete compatibility claim; changing maps may return to stock campaign files |

Both players should close their readers normally and check their actual journals.
No manual diagnostic console command is required to use this baseline.
Cafe story gates, duplicates and broader progression remain gameplay test gates.
Full campaign conversion is not included.

For the next gameplay report, identify the player who collected the username
paper. After both readers close normally, reopen each journal and report whether
both contain the readable entry. Test the ordinary doors with each player in
both directions and report relocation, sounds/fades and mutual model visibility.
For the cafe, report whether its story-controlled door enables at the expected
point and whether either player gets stuck. Keep the exact console error for
any failure. See SHARED_NOTE_TEST.md for the detailed note checks.

The current native map-only interfaces have no verified automatic per-recipient
document archival call or per-pickup claim/hiding facility. A supported native
extension would be needed unless another working native interface is identified.
The unavailable Steam-compatible extension is a technical blocker, not a feature
silently approximated by this package. See the project's QUIET_NOTE_RESEARCH and
PICKUP_RESEARCH for the saved evidence; do not repeat failed investigations.

## Remove

Close both clients and double-click `remove-current-patch.cmd`. Only the
known-hash V11 alias is removed; an unknown/changed file is retained. The original
campaign map, DLLs, saves and earlier experiment files remain available.
