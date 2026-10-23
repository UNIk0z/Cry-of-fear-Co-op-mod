# Door presentation gameplay test - v7/v8

**VERIFIED BY USER:** audio passes; full fade pair49/50 passes independent E,
original-style sound, out/relocation/in, both directions and mutual models without
reconnect. Keep these references unchanged. New production test:
[C_START2_FULL_TEST.md](C_START2_FULL_TEST.md). Older pending statements below
are the original test preparation record.

**V6 core VERIFIED BY USER. V7/V8 engineering checked; presentation NOT GAMEPLAY TESTED.**
Use your working normal Steam host P1 + Sandboxie Steam client P2 on one PC.
Keep the known-working c_start2_useselect baseline unchanged. Audio first; test
fade only after audio/core/both directions pass. Report failures before changing
settings or trying further variants. No game DLL or asset modifications.

## Install aliases, with both clients closed

Normal PowerShell:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File '%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\outputs\cry-of-fear-coop\scripts\install-door-audio.ps1'
powershell.exe -NoProfile -ExecutionPolicy Bypass -File '%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\outputs\cry-of-fear-coop\scripts\install-door-fade.ps1'
Get-FileHash -LiteralPath 'D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps\c_start2_dooraudio.bsp' -Algorithm SHA256
Get-FileHash -LiteralPath 'D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps\c_start2_doorfade.bsp' -Algorithm SHA256
```

| Alias | Bytes / entities | Expected SHA256 |
|---|---|---|
| c_start2_dooraudio | 18,700,674 / 453 | 914d62c76c44265fa19076e7b200864e17b3cf06e2dbd0f9688f93049ec91176 |
| c_start2_doorfade | 18,701,626 / 457 | 4a0e1ddb450133d429250bb1d480689f4c9c1dc7949844affd2b541507b76a23 |

The installed paths are the two files in the hash commands above. Each installer
reconstructs a complete BSP from your own original c_start2.bsp; no manual copy
needed. Original source hash must be3933456e6c0e8a449ec17e7829c9d69a8880a1e414b54dd6c0cf2b361483157e.
Installers refuse unknown existing aliases and preserve stock maps and v6.
No Node needed. For another installation pass -MapsDirectory 'ACTUAL_MAPS_PATH'.

Alternatively extract door-presentation-test-v7-v8.zip anywhere. Keep both JSON
files beside its two installers, and run those extracted scripts instead.
Run both hash commands inside your existing Sandboxie box; both file views must
match. If necessary run these installers within that box using its maps folder.
Preserve the existing box/network/Steam configuration; do not clear it.
Generated reference BSPs stay at `%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\work\door-presentation-001\`.
Package contains no game assets/BSP; audio uses your installed original WAVs.

## Experiment A - original audio, direct working relocation

Start normal Steam P1 and the existing Sandboxie Steam P2. Host new coop game
and Join coop game through your known-working native menu procedure. Verify
initial mutual models, then HOST console:

```text
changelevel c_start2_dooraudio
status
```

P2 also runs status. Both must show c_start2_dooraudio. Approach the SAME panel
as the successful Use49 test. Other story doors still have their original logic.

1. P1 waits away from the panel; P2 presses E once and releases it. Only P2
   should relocate immediately. The green marker still appears in both windows.
   Listen for the original opening WAV on arrival and closing about1.20s later.
   The former access beep should be gone. Nearby players may hear positional
   audio, which is not a private-client sound guarantee.
2. Wait3s. P1 follows independently. Both inspect the other's model once in the
   same area; check controls, floor/facing, collision and equipment/ammo.
3. Test the return Use50 separately for each player, with3s between presses.
   Check original opening/closing sounds and mutual visibility again. Repeat
   outward once to test reset; no automatic/duplicate playback or crash expected.
4. Stop if any sound/core direction fails or visibility regresses. Report alias,
   actor order, which WAV was audible, repeats/overlap/cutoff and console errors.
   Do not count fade as tested here: A has no fade. A keeps instantaneous
   relocation, so opening on arrival is an intentional audio-only compromise.

## Experiment B - sound plus activator-only timed fade

After A passes, HOST starts a fresh map:

```text
changelevel c_start2_doorfade
status
```

P2 also confirms status. Record both file hashes/map names before interpreting
behavior. Initial mutual models must pass. P1 waits still, facing a visible
reference point away from the door; P2 leads. Stand still during the first fade.

| Intended time from accepted E | Event to observe |
|---|---|
| 0.00s | Opening sound at source; only user's screen fades toward black |
| 0.60s | User's screen fully black |
| 1.20s | Only that player relocates using unchanged v6 point teleporter |
| 1.25s | Closing sound at destination |
| 1.35-1.95s | User's screen fades back and becomes clear |

These are adjustable approximations, not measured original Steam door timing.
The waiting player may still see the green HUD marker and hear nearby sounds;
their screen must NOT fade and their position/controls must remain unchanged.

1. P2 presses E once; P1 watches both windows. Record whether full black happens
   before relocation, who moves, both WAVs and clear recovery by about2s.
   A short recording of both windows helps assess timing if convenient.
2. Wait3s, let P1 follow independently. Check each player's screen effect applies
   only to them. Once both arrive, inspect mutual models, collision, movement,
   equipment/ammo, floor and facing. Repeat return separately, then outward once.
3. Try two near-simultaneous E presses at the SAME panel. Shared2.5s cooldown
   means one may be accepted; the other retries after3s. Only the accepted actor
   should fade/move; no player swap, duplicate sequence or stuck black screen.
   Report whether one or both were accepted; both immediate moves are not required.
4. After sequential checks pass, leave one player on EACH side and activate the
   opposite-direction panels together. Each accepted activation should fade and
   move its own player. Reunite after3s and check mutual models. This tests overlapping
   sequences without the same-panel shared cooldown.

Controls remain enabled throughout; no input freeze or player render modification
is used. Shared cooldown is a documented initial limitation. Sound emitters are
positional, not duplicate per-client broadcasts. Stop on wrong actor, waiting
player fade, visible early relocation, crash, unexpected reset or black softlock.

## Recovery, removal and report

If a screen stays black for5s or a core test fails, HOST console:

```text
changelevel c_start2_useselect
```

The console remains usable during screen fade; bring it up and enter the command.
This reloads the verified baseline for both clients. If the game crashes, restart
the known-working session. Do not rejoin/reset models as a claimed test pass.

Close both clients and remove only the known experimental hashes if desired:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File '%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\outputs\cry-of-fear-coop\scripts\install-door-audio.ps1' -Remove
powershell.exe -NoProfile -ExecutionPolicy Bypass -File '%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\outputs\cry-of-fear-coop\scripts\install-door-fade.ps1' -Remove
```

Use the extracted installer paths if you installed from ZIP. Also remove within
the box if installed there. Unknown/modified files are retained. V6 is untouched.

Report separately for A and B: both status names/hashes; E actor order and who
moves; opening/closing WAVs and whether repeated cleanly; both directions/reset;
mutual model visibility, controls/collision/equipment; B fade on each window,
black-before-relocation/recovery, same-panel retry and opposite-door overlap;
any crash/console error. Mark only observed gameplay checks PASSED. Cutscenes,
cross-map progression, locks/puzzles and other door audio are outside this test.
Original cross-map route to c_start is unchanged; returning loads stock c_start2.

Engineering evidence: work/door-presentation-001/verification.json and separate
installer fixtures. All14 other lumps, exact v6 helpers/destinations and439
unrelated original entity records retained. Supported chain and remaining timing/
audio/cooldown limits: docs/DOOR_PRESENTATION.md. No headless test attempted.
