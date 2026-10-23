# Username note popup suppression candidate v12

**WITHDRAWN 2026-10-09:** user confirms P2 collected/retained the note while P1
got no notification or addition. Do not install this as a fix. See
NOTE_FAILURE_DIAGNOSTIC.md for one native archival check in the existing failed
session, then return to v11. Instructions below are the historical issued test.

Your report confirms that v11 delivers the username note to both players and
opens both readers. Reader opening on the non-collector is the new defect.
Role reversal, later journal reopening, duplicate counts and cafe gates were
not separately reported as passing.

This separate alias, `c_start2_notequiet`, preserves v11 and the door chains.
It grants through the same native helpers, immediately closes each recipient's
VGUI, then reopens the reader for the original collector after 0.05 seconds.
**This is a test workaround, not a silent grant API:** the native reader still
opens internally before the close message. A visible flash, lost journal entry,
lost notification or closure of an unrelated menu means it fails the requirement.
The collector receives another native read packet; check duplicate notifications.
Weapons, ammo and healing pickups have not been converted.

Close both game clients, then paste this complete command into Command Prompt
or PowerShell. It reconstructs a complete BSP from your own original assets.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\outputs\cry-of-fear-coop\scripts\install-quiet-note.ps1"
```

Destination:
`D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps\c_start2_notequiet.bsp`.
Expected SHA256:
`6ccca5777cfa39c002d765bb0c9859f209693a945fd70382575cde1898041967`.
Original map, v11 and other aliases remain untouched. On a separate friend's
PC, install the same package using that PC's own game; keep its JSON beside the
extracted script. For your existing Sandboxie setup, ensure the sandbox sees
this same alias and hash; do not change Steam/Sandboxie authentication/settings.
The installer only reads both DLLs to check versions; it never changes them.
If using the ZIP on another PC, extract all files to `C:\CoF-Coop-Test`, then:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\CoF-Coop-Test\install-quiet-note.ps1"
```

For a different Steam library append `-MapsDirectory "ACTUAL_FULL_MAPS_PATH"`.
Verify from normal PowerShell and your existing sandbox view:

```powershell
Get-FileHash -LiteralPath "D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps\c_start2_notequiet.bsp" -Algorithm SHA256
```

Launch Cry of Fear from Steam. Use your working **Host coop game / Create server**
procedure and have P2 join a stock native cooperative campaign such as
`cof_campaign_01`. Once both are alive and mutually visible, HOST ONLY:

```text
changelevel c_start2_notequiet
status
```

Confirm the alias and two clients in `status`. Keep native multiplayer
initialization; do not force game-mode cvars or use a single-player `map` launch.

Run these checks on the username note at original origin `(27,2069,-518)`:

1. Close both menus. P2 approaches the same tested username paper and presses E
   once; P1 stays elsewhere. Only P2 should finish with a reader open. P1 should
   receive the native notification and continue moving, with **no visible flash**.
2. P1 manually opens their normal note collection afterward. Confirm the entry
   exists and is readable, with the same content as P2. Record the notification
   and entry counts; popup closure alone is not a pass.
3. Repeat with P1 collecting and P2 waiting in a fresh native session. Report
   collector name, remote popup/flash, notification, later readable entry and
   duplicates separately for each player.
4. In another fresh run, leave the remote player's inventory/menu open when the
   collector takes the note. Report whether that menu is closed or changed.
   The native closer can close unrelated VGUI, so this is a known limitation,
   not an assumed pass. Do not adopt this workaround as final silent delivery
   if uninterrupted remote menus are required.
5. Check repeated/simultaneous E, both character models, and the ordinary doors.
   Record cafe enable/removal gates separately; earlier note success does not
   certify those gates. Password note242 remains stock and is outside this test.

Short video from the waiting player's view is useful for the flash check.
This candidate supports connected players at collection, not late-join catch-up.
Cross-map routing remains the earlier alias limitation: inspect `status` after
leaving this map before attributing later failures to the candidate.

Rollback after closing clients:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\outputs\cry-of-fear-coop\scripts\install-quiet-note.ps1" -Remove
```

Only the known-hash v12 alias is removed; changed files and originals are retained.
