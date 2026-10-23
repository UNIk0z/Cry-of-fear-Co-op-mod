# Install coop-fixes-009 (host PC and friend's PC)

Both players need this same folder (send your friend the ZIP). Each player
does this on their own PC:

1. **Close Cry of Fear** (every copy, including one in Sandboxie).
2. Double-click **`INSTALL co-op.cmd`** and wait for `DONE`.
   - It finds Cry of Fear through Steam by itself.
   - It moves every file older co-op builds left in the game folder (old
     maps, old adapter, the old "Host Coop Game" menu entry) into a folder
     next to the game called `Cry of Fear - removed co-op files`. Nothing is
     deleted; delete that folder yourself once you are happy.
   - It then builds the 194 co-op maps from your own original maps (a few
     minutes the first time) and checks every file.
   - It builds Simon's player model on your PC from your own game files
     (`models\player\police1\police1.mdl` and
     `models\cutscene\simon_clothes.mdl`), so the friend must run it too.
   - Saves and the game's own files are not touched.

## Playing

**Host:** double-click **`Start co-op menu.cmd`**, then in the main menu
choose **Custom Campaign → "Co-op Story: New Game"** (or
**"Co-op Story: Continue"**) and pick the difficulty. `Host RC4.cmd` and
`Continue RC4 slot1.cmd` still work too.

**Friend:** double-click **`JOIN a co-op game.cmd`** and type the host's
address (for Radmin VPN, the host's 26.x.x.x address). Or start Cry of Fear
normally and type `connect <address>` in the console.

The host needs UDP port 27015 reachable by the friend (Radmin VPN or a
similar LAN tool makes this simple).

Only the host can save at a tape recorder (the partner sees a message).

If someone is kicked or loses connection, just join again: the inventory
comes back.

## Starting from Steam instead of a .cmd file (host only)

Steam Library → right-click **Cry of Fear** → **Properties** → **Launch
Options**:

```
-dll cl_dlls/storycoop_rc4.dll -num_edicts 4096 -heapsize 1024000 -condebug
```

## Rollback

Close the game and run `remove.cmd` (removes 009; saves are kept). The old
files are in `Cry of Fear - removed co-op files` until you delete them.
