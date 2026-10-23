# v0.1 test run (two players: Steam + Sandboxie)

Run "Install or Update.cmd" in both environments first (game closed). After the
run, send the newest `cryoffear\storycoop_logs\rc4-*.log` and screenshots.

1. **Normal launch:** start Cry of Fear from Steam. Expect the game's own menu
   and title, no "Simon's Story" entries in Custom Campaign. Quit.
2. **Co-op menu:** "Host a game.cmd". Expect Host/Join Simon's Story, the CO-OP
   title, bottom-left credit "Co-op mod v0.1 ... Special thanks: Mesilll,
   Michal Eminov, caixa". Log: `MENU co-op main menu set up in memory`.
3. **Join:** friend runs "Join a game.cmd". Expect both names to be the Steam
   names (log `NAME player=N shown as ...`), not "Unknown".
4. **Intro:** do not move P2. Title shot: no train in the lower left; the train
   drives past later (camera by the tracks). Intro ends by itself.
5. **Apartment (s4_apartment1):** no Simon standing at the start point, before
   or after the scene. Handgun scene: both players get the handgun once (log
   `STORYITEM weapon_glock also given`).
6. **Doors:** use a story-locked door before its event (latch locked sound) and
   after (normal fade/teleport). Use the hall key door with and without the key.
7. **Map change during a scene / right after a pickup:** both keep everything
   (log `CARRY level change to ...`).
8. **Saving:** P2 at a recorder: "Only host can save the game" stays while
   standing there. Host: recorder, press 1 -> both hear the save sound, "Game
   saved in slot 1". Repeat for slots 2 and 3, overwrite slot 1, cancel by
   walking away (no sound, no message).
9. **Full restart:** quit both games, host "Load Slot 1..3"; friend joins.
   Check each player's inventory, position, notes, codes.
10. **Leave the session and relaunch normally:** the game's own menu again.

Not covered by v0.1 (known limit): a save restores env_global latches, taken
pickups, key-unlocked doors, notes, codes, endings and inventories, but not
every scripted trigger; a scene before a recorder can replay after loading.
