# c_start2_coop_full two-player test

**V8 reference pair VERIFIED BY USER; this new alias NOT GAMEPLAY TESTED.**
No green probe or access beep. Verified V8 sound/fade/player-specific sequence
retained on D0049/D0050. These are the ONLY2 safe ordinary transitions here;
cafe D0204/D0206 are unchanged manual-review exceptions. Full-map compatibility
is not claimed. Use your working normal Steam + Sandboxie clients on one PC.

## Install with both clients closed

Paste this full-path command into PowerShell or Command Prompt:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\outputs\cry-of-fear-coop\scripts\install-c-start2-full.ps1"
```

Installed map: `D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps\c_start2_coop_full.bsp`.
In normal PowerShell, then inside the existing Sandboxie box, verify:

```powershell
Get-FileHash -LiteralPath "D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps\c_start2_coop_full.bsp" -Algorithm SHA256
```

Both views must match `f863ee55f5404a69d2edb278f7261f966ac6a57a2a8dcda0f58a9e173a42ebad`.
Complete BSP:18,701,086bytes/455entities. Installer reconstructs it from your
own original, preserves all reference maps and refuses unknown aliases. No Node
or asset downloads needed. If box view differs, run installer within that box;
keep its manifest available. Do not clear/reconfigure your working Sandboxie setup.
For another game path pass -MapsDirectory "ACTUAL_MAPS_DIRECTORY".

ZIP alternative: extract c-start2-full-test-v9.zip anywhere; keep the JSON beside
install-c-start2-full.ps1 and run that extracted path. Generated engineering BSP
stays in `%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\work\c-start2-full-002\c_start2_coop_full.bsp`;
share the asset-free installer package, not copyrighted BSP/audio assets.

## Load through Steam native cooperative menu

Start normal P1 and Sandboxie P2. Host new coop game / Join coop game using
your working setup, then HOST console:

```text
changelevel c_start2_coop_full
status
```

P2 also runs status. Both must show c_start2_coop_full. Check initial mutual
models, controls and spawn collision; no spawn/model configuration was changed.
Stable IDs/locations are in C_START2_CONVERSION_REPORT.md and the CSV matrix.

## Converted ordinary pair

1. D0049: SAME source panel used in your successful V8 test, brush*6, approx
   (3656,-1279,-850). Keep P1 waiting; P2 presses E once. Check original sounds,
   only P2 fades/moves, full black conceals relocation, clear screen afterward,
   no green text or access beep. Wait3s before another press.
2. P1 follows independently. P2 steps clear of the landing spot for the first
   check. Once together, inspect mutual models, movement, floor/facing,
   collision and equipment/ammo. No reconnect/model-reset workaround.
3. D0050: other face of that transition, brush*7, approx(1039,-1689,-850).
   Test each player's return separately. Repeat outward once after3s to check
   reset, duplicate audio/activation, fade recovery and mutual models.
4. After sequential checks pass, try same-panel nearly simultaneous E: shared
   2.5s cooldown may accept only one; the other retries after3s. Then test one
   player on each side activating opposite panels together. Each accepted
   sequence must select/fade its own actor, with no swap or shared-state corruption.
5. Finally test arrival overlap once: one player waits on the landing spot,
   the other uses the door after cooldown. Report stuck/overlapping bodies,
   displacement, collision and visibility. Don't change landing positions or
   player physics to hide a failure.

Exact landing feet/yaw: D0049->(1040,-1711,-896),270;
D0050->(3655,-1257,-896),90. Sounds are positional; nearby players may hear them.
Input stays enabled; stand still during first fade check. Approximate sequence
unchanged: out0.6s, teleport1.20, close1.25, in1.35..1.95.

## Retained restrictions and story exceptions

Use a fresh session for these checks so an original door regression isn't mixed
with converted-pair results. D0006 is the shutter near the return area; D0227
and D0228 are the other locked panels. Check they still refuse passage and do
not consume inventory incorrectly. Their original lock/no-destination fields
are unchanged. No collectible-key transition is newly implemented here.

D0204/D0206 are the cafe-script pair near(1009/1032,1986,-547). Check original
story conditions/removal in normal progression: D0206 starts disabled, trigger413
enables it through controller414; story relay345/412 removes the cafe doors.
Record before/after condition behavior and your story actions. They still run
original inter_door; crossing may reproduce invisibility. Report by ID as an
unconverted exception, not a production-chain pass. Stop that run if it does.
Computer/story entities were preserved verbatim; don't force puzzle/lock states
with cheats. These need manual adaptation before a whole-map success claim.

D0019 is the c_start return route; it is cross-map and outside this same-map
milestone. Do not count it as converted. Original route/landmark retained;
returning through c_start loads stock c_start2, not this alias.

## Recover, report and remove

If screen stays black for5s, wrong actor moves or a transition fails, HOST:

```text
changelevel c_start2_doorfade
```

This reloads the verified reference for both clients. If it crashes, restart
the working Steam/Sandboxie session. Preserve console errors and last map name.
Report each stable ID with PASSED/FAILED/BLOCKED/NOT TESTED plus actor/order,
audio/fade, waiting player's screen, mover, mutual models, repeat/concurrency/
overlap and original condition behavior. Include both status names/hashes.
We update C_START2_DOOR_MATRIX.csv; one passed door does not grade the whole map.

Close both clients before guarded removal:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\outputs\cry-of-fear-coop\scripts\install-c-start2-full.ps1" -Remove
```

Remove within the box too if installed there. Only known-hash new alias is
removed; original and five regression references remain. No game DLL changes.
