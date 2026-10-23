# coop-fixes-009 — 2026-10-13

This updates coop-fixes-008. The maps and the Simon model are identical to
008. The adapter changed, and so did the two Custom Campaign entries.
Nothing new here has been seen in a real game yet.

Confirmed working in the 008 test: the phone/flashlight light, dual wield
(the weapons are in the hands), and Simon on s4_start.

## Your report → cause → change

| Your report | Cause | Change |
|---|---|---|
| The player model is not Simon on the camera level | The nightmare map (`s4_nightmare`, the one with the camera scenes) and the intro are "passive" maps the adapter leaves alone, and the Simon model step was switched off there too. Your screenshot from 00:28 shows the police model in that scene, and the log has no `MODEL` line for those maps. | The Simon step needs nothing from the passive part. It now runs on the intro and the nightmare too, so every co-op map uses Simon. |
| When a player dual wields, their model doesn't move for the other player until they switch back or attack | While dual wielding, the adapter plays the weapon hand's animation on the player model. It kept the animation's timestamp fixed at the moment the idle started. The other player's game only takes a new position for a model when that timestamp changes, so the model stood still. An attack or a weapon switch sets a new timestamp, which is why it jumped then. | The timestamp is now the current time every frame, with the animation frame advanced to match, the same way the game does it. The model moves normally. |
| Show *paused* when one player is in the pause menu | Nothing on screen said why the game had frozen. | While the game is paused, every player sees `*paused*` in the centre of the screen. It is cleared when the game resumes (`PAUSE *paused* shown` / `PAUSE resumed` lines). |
| Credits bottom left: "Developed by koolkat" | — | The main menu shows "Co-op mod developed by koolkat" in the bottom-left corner. It uses the same on-screen text that maps use, so it only appears while the adapter is running (started through `Start co-op menu.cmd` or the Steam launch options), and a `MENU credit shown` line is logged. |
| The Custom Campaign entries don't look clean (cut off: "host ne", "continu") | The Custom Campaign list cuts each name after 26 characters. | The entries are now **"Co-op Story: New Game"** and **"Co-op Story: Continue"**. A separate button on the main menu is not possible: the main menu buttons (New Game, Host Server, Join Server, ...) are fixed images wired up inside the game's `client.dll`, which this project does not change. |
| Extract the Cry of Fear title so "CO-OP" can be added | The title is `cryoffear\gfx\vgui\menu_logo.tga` (512 × 66, transparent). | Exported from your game to `outputs\menu-title-for-editing` (PNG to edit, a dark preview, and an untouched copy). It is not in the co-op package. Send the edited PNG back and the installer will put it in place on both PCs, with `remove.cmd` restoring the original. |

## Still open

Enemy hitboxes and the ladder stall (no log of them yet), the intro train,
the pause case where the partner opens the menu while the host's game is
already paused, ladder hitches, four players.
