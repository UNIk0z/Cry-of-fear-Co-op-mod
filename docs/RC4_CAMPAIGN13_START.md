# Install coop-fixes-013 (developer package)

Players get the clean folder made by `scripts/player-package.mjs`
(`Cry of Fear Co-op`: `Install or Update.cmd`, `Host a game.cmd`,
`Join a game.cmd`, `Uninstall.cmd`, `READ ME.txt`, `files\`). This
developer package carries the same files plus rollbacks, sources and test
reports.

1. **Close Cry of Fear** (every copy, including one in Sandboxie).
2. Double-click **`INSTALL co-op.cmd`** and wait for `DONE`. It moves older
   co-op files aside (nothing is deleted), builds the 194 co-op maps and
   Simon's model from this PC's own game files, and puts the CO-OP title and
   the Simon's Story main menu (`cl_dlls\client.dll`) in place. The game's
   own files are kept as `*.storycoop-original`.

## Playing

**Host:** `Start co-op menu.cmd`, then **Host Simon's Story → "Simon's
Story: New Game"** or **"Simon's Story: Load Slot 1/2/3"**, and the difficulty.

**Friend:** `JOIN a co-op game.cmd` and the host's address (Radmin VPN:
26.x.x.x). The host needs UDP port 27015 reachable.

**Saving:** use a tape recorder, then press 1, 2 or 3. **Stuck:** type
`stuck` in chat.

## Uninstall

```
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\setup-coop.ps1 -Uninstall
```

The game's own `client.dll` and title come back; saves are kept.
