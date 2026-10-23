# Install coop-fixes-005

Close BOTH games first, including the Sandboxie client. Then, in this folder:

1. Double-click **`remove previous RC4.cmd`**. It removes coop-fixes-004, the
   build you tested. (If it refuses because an older build is installed, run
   **`remove integration RC4.cmd`** instead. A remover only deletes files whose
   exact hashes it knows; the wrong one refuses and changes nothing.)
2. Double-click **`install.cmd`**. It rebuilds the 194 co-op maps from your own
   original map files (a few minutes, about 2.1 GB on the game drive), adds the
   two "Simon Story co-op" entries to the main menu, and copies Simon's model
   for the players. Wait for it to report success.
3. Start the game one of two ways:
   - **From the real main menu (new):** double-click **`Start co-op menu.cmd`**.
     In the main menu choose **Custom Campaign → "Simon Story co-op: host new
     game"** (or **"… continue save"**), pick the difficulty, and the game
     restarts as a two-player co-op server.
   - **As before:** **`Host RC4.cmd`** (new game) or **`Continue RC4 slot1.cmd`**.

The Sandboxie client needs nothing installed: it reads the same game folder.
P2 joins exactly as before.

## Starting from Steam instead of a .cmd file

The co-op entries in the main menu only work when Cry of Fear starts with the
co-op adapter. To get that from the normal Steam Play button, set it once:
Steam Library → right-click **Cry of Fear** → **Properties** → **Launch
Options**, and paste:

```
-dll cl_dlls/storycoop_rc4.dll -num_edicts 4096 -heapsize 1024000 -condebug
```

With this set, single player stays normal (the adapter only acts on the co-op
maps). Delete the text to go back to the plain game. If a future Cry of Fear
update changes the game's own `hl.dll`, the adapter refuses to load and the game
will not start with this option: just delete the launch options again. Set it only on the HOST's
Steam account; the Sandboxie client does not need it.

Your save in slot 1 still loads. Your RC2 maps (`s2_…`) are not touched.

## Rollback

Close both games and double-click `remove.cmd`. It also removes the two menu
entries and the Simon model folder; saves are never deleted. To go back to
coop-fixes-004, install it again from its own folder.
