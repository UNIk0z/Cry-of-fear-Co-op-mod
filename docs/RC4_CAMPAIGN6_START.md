# Install coop-fixes-006

Close BOTH games first, including the Sandboxie client. Then, in this folder:

1. Double-click **`remove previous RC4.cmd`**. It removes coop-fixes-005, the
   previous build. If you never installed 005, run **`remove previous RC4.cmd`**
   from the 005 folder instead to remove 004, or **`remove integration
   RC4.cmd`** for an older build. A remover only deletes files whose exact
   hashes it knows; the wrong one refuses and changes nothing.
2. Double-click **`install.cmd`**. It rebuilds the 194 co-op maps from your own
   original map files (a few minutes, about 2.1 GB on the game drive). It also
   adds the two "Simon Story co-op" entries to the main menu and copies Simon's
   model for the players. Wait for it to report success.
3. Start the game one of two ways:
   - **From the real main menu:** double-click **`Start co-op menu.cmd`**. In
     the main menu choose **Custom Campaign → "Simon Story co-op: host new
     game"** (or **"… continue save"**), then pick the difficulty.
   - **As before:** **`Host RC4.cmd`** (new game) or **`Continue RC4 slot1.cmd`**.

The Sandboxie client needs nothing installed: it reads the same game folder.
P2 joins exactly as before.

## Starting from Steam instead of a .cmd file

If you already pasted the launch options for 005, nothing changes. Otherwise,
open Steam Library → right-click **Cry of Fear** → **Properties** → **Launch
Options**, and paste:

```
-dll cl_dlls/storycoop_rc4.dll -num_edicts 4096 -heapsize 1024000 -condebug
```

Single player stays normal with this set. Delete the text to go back to the
plain game. Set it only on the HOST's Steam account.

Your saves still load. New saves are written in a newer format that also keeps
the ending choices. Your RC2 maps (`s2_…`) are not touched.

## Rollback

Close both games and double-click `remove.cmd`. It also removes the two menu
entries and the Simon model folder; saves are never deleted. To go back to
coop-fixes-005, install it again from its own folder. Saves made with 006 do
not load in 005; older saves still do.
