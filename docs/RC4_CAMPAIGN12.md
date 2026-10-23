# coop-fixes-012 — 2026-10-13

This updates coop-fixes-011. The 194 maps, the Simon model and the CO-OP
title are unchanged. The adapter, the Custom Campaign entries, the
install/update/uninstall script and the player folder changed. Nothing new
here has been seen in a real game yet.

## Your request → what is possible → change

| Request | What is possible | Change |
|---|---|---|
| Only two options on the train main menu: "Host Simon's story" and "Join Simon's story"; no Custom Campaign | The main menu buttons are images and actions inside the game's `client.dll`. "Host Server" and "Join Server" open the game's own server dialogs through the engine (`optionshack`) and never reach the co-op adapter. Changing that means editing the game's binaries, which this project does not do. | The main menu stays as it is (your answer: then leave it). Hosting stays under **Custom Campaign**, now named **"Simon's Story: …"**. Joining stays `Join a game.cmd`. |
| Host: new game or load a save; 3 save slots the player can choose | Possible | Custom Campaign lists **"Simon's Story: New Game"** and **"Simon's Story: Load Slot 1"**, **"2"** and **"3"**. An empty slot returns to the menu with "Save slot N is empty." |
| Choose the slot in game too | The game's own save dialog would write over your single-player save labels (`SAVE\saveinfoN.cof`), so it is not used. The keys 1, 2 and 3 send `quicksel 1..3` to the server with the game's default binds. | A tape recorder shows the three slots on the host's PC (with the date and time of each save, or "empty"). Press **1**, **2** or **3** to save there, or use the recorder again to save in the last slot. The list closes after 15 seconds, or if you walk away. |
| "Saved on the host's PC" when a player saves | Possible | **Either player** can save now. Both screens show "Game saved in slot N / on the host's PC." The save is written on the host's PC, as before. |
| The Glock flashlight must work; only the F flashlight must be off | Possible | The Glock light and the Maglite work again. Only the multiplayer police flashlight (the F key) is still refused ("No F flashlight in co-op."). Cutscenes still hide every light until the scene ends. |
| An updater that finds old versions, cleans them and installs the new one | Possible | **`Install or Update.cmd`** says which co-op version is installed ("Found co-op coop-fixes-011. Updating it to coop-fixes-012."), sets aside every file of every older build, then installs and verifies this one. **`Uninstall.cmd`** sets aside this build too and puts the game's own title back; saves are kept. |
| A clean ZIP for the friend | Possible | The player ZIP holds one folder, `Cry of Fear Co-op`, with four .cmd files, `READ ME.txt` and `files\`. The rollbacks, sources and test reports stay in the developer package. |

## Still open

Enemy hitboxes and the ladder stall (no log of them yet), the intro train,
the pause case where the partner opens the menu while the host's game is
already paused, four players. Rebinding 1/2/3 away from `quicksel` leaves
only "use the recorder again" for choosing the last slot.
