# coop-fixes-014 — 2026-10-15

coop-fixes-013 plus one adapter fix. Every map, the client.dll menu, the
title, Simon's model and the menu entries are exactly as in 013. Nothing in
it is gameplay-verified. Automated results are in the developer notes.

| Area | Change | Status |
|---|---|---|
| Scene cameras | 013 left every player entity out of the packet for a client watching a `trigger_camera`, including that client's own player. A client joining into a running camera (P2 on s4_nightmare, 2026-10-15 20:50) never got its own player. Cry of Fear's client renderer picks brush entities by the local player's packet number, so it drew a brush entity with no model and crashed (client.dll `R_DrawBrushModel`, +0x5F5C8). Players are now always sent; inside a scene camera they get `EF_NODRAW`, so no Simon stands in the shot. | AUTOMATED TESTS PASSED |

The same cause can also make doors, walls and other brush objects disappear
while a scene camera is running. This is not verified yet.
