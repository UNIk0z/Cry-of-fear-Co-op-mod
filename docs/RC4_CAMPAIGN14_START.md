# Install coop-fixes-014 (developer package)

Players get the clean folder made by `scripts/player-package.mjs`
(`Cry of Fear Co-op`: `Install or Update.cmd`, `Host a game.cmd`,
`Join a game.cmd`, `Uninstall.cmd`, `READ ME.txt`, `files\`). This
developer package carries the same files plus rollbacks, sources and test
reports.

1. **Close Cry of Fear** (every copy, including one in Sandboxie).
2. Double-click **`INSTALL co-op.cmd`** and wait for `DONE`. Over 013 it only
   replaces `cl_dlls\storycoop_rc4.dll`; the 013 adapter is moved aside
   (nothing is deleted). Maps, menu and title stay as they are.

## Playing

**Host:** `Start co-op menu.cmd`, then **Host Simon's Story → "Simon's
Story: New Game"** or **"Simon's Story: Load Slot 1/2/3"**, and the difficulty.

**Friend:** `JOIN a co-op game.cmd` and the host's address.

## Uninstall

```
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\setup-coop.ps1 -Uninstall
```
