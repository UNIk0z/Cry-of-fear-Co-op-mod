# Test for coop-fixes-013

Run `Install or Update.cmd` on **both** PCs first (game closed). The host's
logs are in `...\Cry of Fear\cryoffear\storycoop_logs\rc4-<date-time>.log`;
send the newest one from the **host's** PC. Say what you saw and roughly where.

1. **Menu:** `Host a game.cmd` → the main menu shows Host Simon's Story,
   Join Simon's Story, Options and Quit. Host Simon's Story lists only the
   four "Simon's Story" entries. The credit and thanks lines stay bottom-left,
   also after quitting a game back to the menu.
2. **Names:** the ping/health/name list shows your Steam names, on every
   map (not only the prologue).
3. **Inventory:** pick up the morphine, the handgun and a tape, go through a
   map change: both players still have everything, ammo included. The phone
   still shows the last SMS.
4. **Handgun scene (apartments):** after the scene both players have the
   handgun. No Simon model stands inside the scene camera.
5. **Recorder:** the first recorder shows the slot list at once. Save while
   the other player is on a ladder: it saves. If it can't, the screen says why.
6. **Doors:** the hallway door (hall key) and the basement door work the new
   way: after unlocking, both players fade through.
7. **Stuck:** press Y, type `stuck`: you move next to your partner.
8. **Nightmare camera rooms:** photograph an X while your partner is in
   another room: they are moved to you.
9. **Jitter (friend):** standing still in a scene camera or on a ladder looks
   smooth.
10. **Uninstall:** `Uninstall.cmd` puts the game's own menu (client.dll) and
    title back; saves stay.

Log lines that matter: `CARRY`, `STORYITEM`, `SAVE`, `STUCK`, `REGROUP`,
`KEYDOOR`, `CHECKPOINT`, `MENU`, `NET`.
