# coop-fixes-008 — 2026-10-12

This updates coop-fixes-007. The maps are byte-identical to 007. The adapter
changed, saves are now schema 5, and the installer now builds Simon's player
model. Nothing new here
has been seen in a real game yet.

## Your report → cause → change

| Your report | Cause (read from the game's own code and files) | Change |
|---|---|---|
| Players still look like police officers in co-op | The game's own `models\player.mdl` **is** the police model. Since 005, the installer copied it to `models\player\simon\simon.mdl`, so "simon" was a police officer. The real Simon mesh exists only as a cutscene model (`models\cutscene\simon_clothes.mdl`). Its skeleton is the same Biped as the player model. | The installer builds a real player model on each PC from that PC's own files: the police1 skeleton and animations with Simon's mesh, textures and bag, moved onto the matching player bones. Nothing from the game is shipped. The result is checked by SHA256 and is byte-identical on every PC with the same game version. If a PC's files differ, the model is skipped and players keep the map's models. The adapter checks each player's model once a second and sets it at most 3 times per map (`MODEL` lines). |
| Dual wield does not work | In multiplayer, the game puts a newly given weapon in your hands only if it "weighs" more than the one you hold (the multiplayer rules' weapon-switch check). The dual weapon is light, so it stayed in the backpack. | For the instant the dual weapon is given, it weighs more than any other weapon. The game then switches to it itself. A `DUAL ... holding=dual` line shows the result. |
| The centre texture of the phone/flashlight light sometimes disappears, and vanishes when both players use the phone light | The client draws its own light as a textured spot and every other player's light as a plain spot. When the light flags of player 1 or 2 reach another client, its plain spot reuses the slot of that client's own textured spot and replaces it. | The server sends each player their own copy of the light flags. A flag that would replace your own textured spot is left out, so your own light keeps its texture. Trade-off: while both phone lights are on, the partner does not see the plain lit patch from the host's light. `LIGHT` lines show this. |
| Add the save sound; tell P2 only the host can save | The adapter committed the co-op save silently and ignored the partner. | When the host's save is committed, the host hears the game's own recorder sound (`save/save_sequence.wav`). A partner who uses a recorder sees "Only the host can save the game." on screen. |
| The intro train | Skipped for now, as asked. | — |
| Reconnecting during a camera scene: no camera, and you spawn in a closed box | The game's camera sets the view of the players who are connected when it starts. A player who comes back later keeps their own view until the next camera, and is placed at the map's spawn point, which on these maps is a closed room. | A returning player gets the camera the other player is watching after their first second in the map (`CAMERA join` lines), and their own view back when the scene ends. On the story maps they are also put back where they were standing when they left, as well as getting their inventory back (`REJOIN ... back where they left`). |
| Both players die: the map restarts with the inventory but not the saved position | When everyone is dead the game restarts the map by itself and only gives back what each player had when entering the map. The adapter treated this as a new map and forgot the loaded save. | When every player is dead at the end of a map, and this session's last save is on that same map, the restart loads that save exactly like Continue: positions, inventories, quick keys, taken pickups and opened doors (`GAME OVER` lines). If the last save is on an earlier map, the game's own restart is kept. |
| Key binds are not kept after loading or dying | The three quick-select keys (`quickselset1..3`) are stored in the player as an inventory slot plus a weapon name. The save never contained them. | Saves are now schema 5 with the three quick keys per player. They are restored on Continue, after a game-over restart and on rejoin, pointing at whichever slot now holds the same item. Older saves still load (with empty keys). |
| Enemy hitboxes feel off; the ladder animation sometimes stalls until you press up/down again | No log of that session reached this PC (the newest logs are from 16:14 and two menu starts at 20:08/20:11). | Not changed yet. Next time, please note the map and enemy, and say whether the hitboxes were already like this before 007. |

## Still open

Enemy hitboxes and the ladder stall (above), the intro train, the pause case where the partner opens the menu while the
host's game is already paused, ladder hitches, four players.
