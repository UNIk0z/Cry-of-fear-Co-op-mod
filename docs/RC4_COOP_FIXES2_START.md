# Install coop-fixes-002

Close BOTH games first, including the Sandboxie client. Then, in this folder:

1. Double-click **`remove previous RC4.cmd`**. This removes coop-fixes-001, the
   build you tested. If it refuses because the older integration build is
   installed instead, run **`remove integration RC4.cmd`**. A remover only deletes
   files whose exact hashes it knows; the wrong one refuses and changes nothing.
2. Double-click **`install.cmd`**. Wait for it to report success.
3. Double-click **`Host RC4.cmd`**. To continue a save later, close both games and
   use **`Continue RC4 slot1.cmd`**.

For the Sandboxie client, right-click steps 1–2 → **Run Sandboxed**.

## Rollback

Close both games, double-click `remove.cmd`, then reinstall coop-fixes-001 from
this package:

~~~powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\baseline\install-story-package.ps1"
~~~

Saves are never deleted.
