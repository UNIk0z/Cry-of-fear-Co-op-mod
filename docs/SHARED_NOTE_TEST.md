# Single shared note experiment v11

Update: user reports both players receive the note and both readers open.
The unwanted remote reader is tracked in QUIET_NOTE_TEST.md (separate v12).
Manual journal reopening, actor reversal and duplicate counts were not
separately reported. The detailed rows below remain gates for those checks.

Test the cafe-only v10 first using CAFE_DOOR_TEST.md. This second alias,
`c_start2_coop_note`, contains the identical cafe candidate plus ONE experimental
shared username note, original entity243 (`c_start2:N0243`). Password note242 and
all other original objects remain unchanged. No full-map note conversion yet.
Later readable journal access still requires explicit verification; a popup
alone does not certify that check.

## Install

Close both clients. Paste this full command into PowerShell or Command Prompt:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\outputs\cry-of-fear-coop\scripts\install-shared-note.ps1"
```

Installed path:
`D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps\c_start2_coop_note.bsp`.
It reconstructs your own complete map; originals and earlier aliases stay intact.
Installer reads and checks the existing CoF 1.6 game DLL hash; it never changes
that DLL. A version mismatch stops installation. Do not bypass that guard.
For another game path append `-MapsDirectory "YOUR_FULL_MAPS_DIRECTORY"`.
ZIP users keep the JSON beside the extracted installer. No Node or game assets
are distributed in the package.

Verify the file in normal PowerShell and then inside your existing Sandboxie box:

```powershell
Get-FileHash -LiteralPath "D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps\c_start2_coop_note.bsp" -Algorithm SHA256
```

Both must match `ef1c8f26a0c359d17a5b082813751a171f3e52cb86516317a21e3ff200468b95`.
18,707,551 bytes;493entities. If the box sees a different file, run the installer
inside that box. Preserve your working Steam/Sandboxie setup.

## Load and locate

Start a fresh native cooperative session through normal Steam P1 and Sandboxie
P2 (Host new coop game / Join coop game), with BOTH connected before pickup.
HOST console:

```text
changelevel c_start2_coop_note
status
```

Both clients confirm the exact alias. Locate the original username credential
note near world `(27,2069,-518)`, facing approximately yaw -53, along normal
progression before using the cafe computer. Use the paper that supplies the
computer USERNAME. The separate PASSWORD paper near `(-600,1086,-602)` is still
stock and is not this experiment. Do not pick up both and confuse their results.

The visible original note model is retained. A transparent, non-solid E proxy
covers a24x24x28 area centered8units above the original note origin; it should
not block walking or grant anything on touch. Stand close, look directly at the
paper and press E once. Input reach/placement still needs gameplay proof.

## Run A: P2 collects, P1 waits elsewhere

1. In both clients open the normal notes collection with your existing binding.
   Record pre-pickup entries and ordinary inventory/ammo/healing counts. Do not
   erase saves or force journal state through console commands.
2. Keep P1 away from the note, stationary. P2 presses E once. Record whether the
   note disappears and whether BOTH clients show their normal native note
   notification. There is no green debug text or replacement HUD message.
3. Open the ORIGINAL notes collection on BOTH clients. Each must have a readable
   username entry from this pickup, with matching actual credential/content.
   Record the title/text or screenshots. A popup without the journal entry does
   not pass. Existing entries from earlier sessions must be distinguished from
   newly granted content; a fresh native session avoids that ambiguity.
4. Walk to the collected spot and press E several times in both clients. Expect
   no extra notifications or duplicate entries. Try nearly simultaneous E on a
   fresh run after the sequential check passes. There must be one entry per
   eligible player, not four copies on the collector or host-only sharing.
5. Confirm ordinary inventory, ammo, healing and controls match the baseline.
   Check mutual character models and repeat the ordinary door; then follow the
   cafe enable/removal test. Note delivery must not alter those systems.

## Run B: P1 collects

Start a fresh native session and load the same alias again. Have P1 collect this
username note while P2 waits elsewhere. Repeat BOTH notification/journal/content/
duplicate/inventory checks. Do not use the unchanged password note as Run B.
No reconnect or model-reset workaround is part of a pass.

## Optional 1,3,4-player coverage

The native dispatcher iterates occupied, non-free player slots; four counters
route successive callbacks to four distinct native note helpers. Static routing
checks cover1..4 and gaps in player slots. Actual multiplayer coverage is pending.
If legitimate additional clients are available, repeat with3/4 connected before
pickup; every connected player's own journal and notification must pass. Do not
change authentication or Sandboxie configuration to obtain extra clients.
Solo host coverage may also be reported. Late join after pickup is outside this
experiment: there is no catch-up system, and the pickup stays consumed.

## Failure, reporting and removal

If E does nothing, report exact map/hash, collector, paper location, visible
model and any console error. If E consumes the note, distinguish popup-only,
empty/unreadable journal, wrong recipient, mismatching content and duplicates.
Stop that run after capturing the first failure. HOST can recover with:

```text
changelevel c_start2_doorfade
```

Send Run A and B results for: collector, each client's notification, actual
journal title/readable content, equality, repeated E/duplicates, inventory,
visibility and door/story regression. Use SHARED_NOTE_MATRIX.csv. Report checks
you did not perform as NOT TESTED. Full-map synchronization stays gated on your
confirmation of readable entries in BOTH journals.

With clients closed, guarded removal:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\outputs\cry-of-fear-coop\scripts\install-shared-note.ps1" -Remove
```

Only this known-hash alias is removed. Actual game assets, DLLs, original maps,
working references and player configuration remain intact.
