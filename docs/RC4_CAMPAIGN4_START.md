# Install coop-fixes-004 (full co-op campaign)

Close BOTH games first, including the Sandboxie client. Then, in this folder:

1. Double-click **`remove previous RC4.cmd`**. This removes coop-fixes-003, the
   build you tested. If it refuses because an older build is installed instead,
   run **`remove integration RC4.cmd`**. A remover only deletes files whose exact
   hashes it knows; the wrong one refuses and changes nothing.
2. Double-click **`install.cmd`**. It builds 194 maps from your own original map
   files. This takes a few minutes and needs about 2.1 GB of free space on the
   game drive. Wait for it to report success.
3. Double-click **`Host RC4.cmd`**. To continue a save later, close both games and
   use **`Continue RC4 slot1.cmd`**.

For the Sandboxie client, right-click steps 1–2 → **Run Sandboxed**.

Your existing save (slot 1) still loads with this build. Your RC2 maps
(`s2_…`) are not touched.

## Rollback

Close both games, double-click `remove.cmd`, then reinstall coop-fixes-003 from
this package:

~~~powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\baseline\install-story-package.ps1"
~~~

Saves are never deleted.
