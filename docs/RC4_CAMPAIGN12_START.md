# Install coop-fixes-012 (developer package)

Players get the clean folder made by `scripts/player-package.mjs`
(`Cry of Fear Co-op`: `Install or Update.cmd`, `Host a game.cmd`,
`Join a game.cmd`, `Uninstall.cmd`, `READ ME.txt`, `files\`). This
developer package carries the same files plus rollbacks, sources and test
reports.

1. **Close Cry of Fear** (every copy, including one in Sandboxie).
2. Double-click **`INSTALL co-op.cmd`** and wait for `DONE`. It names the
   co-op version installed now, moves every file older co-op builds left in
   the game folder to `Cry of Fear - removed co-op files` (nothing is
   deleted), builds the 194 co-op maps and Simon's model from this PC's own
   game files, puts the CO-OP title in place (the original is kept as
   `menu_logo.tga.storycoop-original`) and checks every file.

## Playing

**Host:** `Start co-op menu.cmd`, then **Custom Campaign → "Simon's Story:
New Game"** or **"Simon's Story: Load Slot 1/2/3"**, and the difficulty.

**Friend:** `JOIN a co-op game.cmd` and the host's address (Radmin VPN:
26.x.x.x). The host needs UDP port 27015 reachable.

**Saving:** use a tape recorder, then press 1, 2 or 3 (or use it again for
the last slot). Either player can save; saves are on the host's PC.

## Uninstall

```
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\setup-coop.ps1 -Uninstall
```

Saves are kept. `remove.cmd` (this build's own guarded remover) still works
too.
