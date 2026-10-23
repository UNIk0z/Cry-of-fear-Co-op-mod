# coop-fixes-007 — 2026-10-12

This updates coop-fixes-006. The maps are byte-identical to 006; the adapter
changed, and the package now has a one-step installer for both PCs. Nothing
new here has been seen in a real game yet.

## Your report → cause → change

| Your report | Cause (read from the game's own code and your log) | Change |
|---|---|---|
| After the prologue, P2 got a "channel overflow" kick when joining s4_start | Your log shows `reliable overflow for (1)Unknown` both times s4_start loaded, and never on 004. The game's own player-info handler forces each player's model back to the world's per-player model (police1, police2). The Simon-model code from 005 set "simon" again every frame. Each change makes the server send a full player-info update to everyone once a second. While P2 was still loading the map, those piled up until P2's buffer overflowed. That is also why P2 still looked like a police officer. | The world's own per-player model fields now say "simon", so the game keeps Simon by itself. Each player's model is set once per map and never fought over, so no flood. |
| After rejoining, the inventory was empty | A player who joins in the middle of a map gets neither the level-change carry nor the wake-up scene's phone and knife. Those go only to players who are present when they fire, and P2 had just been kicked. | A player who leaves or is kicked is remembered. When they come back they get their inventory back, and any wake-up items they missed are given to them (only what they lack). |
| The intro credit text got stuck for P2 | The game's client builds a new label for every credit message and forgets the previous one without hiding it. If the next credit arrives while the last one is still showing (about 3.3 s), the last one stays on screen. | The server sends each player at most one credit per 4 s: a later one waits, and a repeat is dropped. The log shows a `CREDIT` line for each one. |
| The train lags behind the paper effect; the cars too | The paper effect is drawn immediately, but moving trains and cars are drawn about 0.1 s in the past. The host also received only 20 updates a second (`cl_updaterate 20` in every host log). | On the co-op maps each player is switched to 100 updates a second, with a shorter delay: 0.01 s for the host and 0.03 s for the partner over the network. The game remembers these settings. |
| Remove what is not needed; one installer to play with a friend | Your game folder held 194 RC2 maps (2.2 GB), the RC1/RC3 maps, 17 early test maps and an old menu entry. | `INSTALL co-op.cmd` finds the game through Steam on any PC. It moves only files that an earlier build of this project installed (checked by hash) into `Cry of Fear - removed co-op files`, then installs and verifies 007. `JOIN a co-op game.cmd` is for your friend. |

## Note on hitching

Both games running on one PC slow the host. The log showed server frames up
to 250 ms apart during the intro, which also makes the train stutter. With
your friend on their own PC this goes away.

## Still open

The P2 phone beam texture, and the pause case where the partner opens the
menu while the host's game is already paused.
