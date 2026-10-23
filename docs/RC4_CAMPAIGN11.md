# coop-fixes-011 — 2026-10-13

This updates coop-fixes-010. Only the adapter changed. The maps, the Simon
model, the CO-OP title and the Custom Campaign entries are identical to 010.
Nothing new here has been seen in a real game yet.

## Your report → cause → change

| Your report | Cause | Change |
|---|---|---|
| The camera section (the nightmare) still shows the cop model | The nightmare map's own settings name the four players' models `police1`–`police4`. The adapter treated any model a map names as a deliberate choice and kept it: the 010 log says `MODEL player=1 keeps the map's model police1`. Those four names are just the game's default co-op police models. | `police1`–`police4` are now replaced by Simon like an empty setting. Any other model a map names still wins. On the nightmare, the log should say `MODEL world player models -> simon` and `MODEL player=N now simon` or `is simon`. |
| The flashlight message is cut off | The messages were one long line ("Co-op: the flashlight stays off. Use the phone or the lantern."). | Two short lines now: "No flashlight in co-op. / Use the phone or lantern." (and "No gun light in co-op." for the gun light). |

## Still open

Enemy hitboxes and the ladder stall (no log of them yet), the intro train,
the pause case where the partner opens the menu while the host's game is
already paused, ladder hitches, four players.
