# Test for coop-fixes-012

Run `Install or Update.cmd` on **both** PCs first (game closed). Logs are kept
automatically in `...\Cry of Fear\cryoffear\storycoop_logs\rc4-<date-time>.log`
on the host. Say what you saw and roughly where.

1. **Updater:** on a PC with 011 installed, `Install or Update.cmd` says
   "Found co-op coop-fixes-011. Updating it to coop-fixes-012." and ends with
   `DONE`. Running it again says it is already installed.
2. **Menu:** `Host a game.cmd` → Custom Campaign lists "Simon's Story: New
   Game" and "Simon's Story: Load Slot 1/2/3", not cut off. An empty slot
   returns to the menu.
3. **Saving (host):** use a tape recorder. A list of the three slots appears.
   Press 2. Both screens show "Game saved in slot 2 / on the host's PC."
4. **Saving (friend):** the friend uses a recorder and presses 3. Same
   message on both screens; the file is on the host's PC.
5. **Recorder again:** use a recorder twice: it saves in the last slot.
   Walk away from the list, or wait 15 s: nothing is saved.
6. **Loading:** quit, `Host a game.cmd` → "Load Slot 2", the friend joins:
   both players are back where slot 2 was saved, with their items.
7. **Lights:** the Glock light and the Maglite turn on for both players. F
   (the police flashlight) shows "No F flashlight in co-op."
8. **Uninstall:** `Uninstall.cmd` moves the co-op files aside and puts the
   original title back; `storycoop_saves` is still there. Then run
   `Install or Update.cmd` again to keep testing.

Log lines that matter: `SAVE`, `CHECKPOINT`, `MENU`, `LIGHT`, `PREPARE`,
`RESTORE`.
