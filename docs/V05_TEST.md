# v0.5 test run (solo, two players, four players)

Every PC: close the game, move `cryoffear\addons` out (RebuiltSimon), run
"Install.cmd" from the v0.5 folder, then double-click "Run Co-op Mod.cmd".
Afterwards send the host's newest `cryoffear\storycoop_logs\rc4-*.log` (and any
`crash-*.dmp`), plus the friends' logs if you can. Mark each line yes or no.

## A. Solo (host alone)

1. Host Simon's Story > New Game. In the first room the setup list shows
   (top left). Press 3 until "Chapter 1", then E. Expect s4_start loading.
   Log: `SETUP applied: players=2 collision=on start=s4_start (server restarts)`.
2. New Game again, leave the setup, ready up. Expect the intro to start alone
   (log `PROLOGUE ready and final counts wait for 1 player(s)`), the skip
   text "SPACE or E to skip 1/1", and SPACE skipping it.
3. In the console type `changelevel c_start`. Expect the game to switch to
   s4_start at once (log `is the single-player map; co-op continues on s4_start`),
   with the world visible.
4. Progression items alone: balcony rope, lighter on the shotgun map, saw on
   Sawer's body, spade, screwdriver/fuse. Log per map: `SPAWNFLAGS kept N
   entities`; per use: an `ITEMUSE player=1 ...` line and the item gone.
5. Rain: s4_city or s4_hamn after walking into the rain area. Expect rain.
   Log `RAIN ... for 1 player(s)`.
6. Save at a recorder, quit, Load Slot: same difficulty, weapon in hand,
   quick keys shown in the inventory (log `QUICKKEYS player=1 ... shown`).

## B. Two players

1. Friend: Join in the co-op menu, type the host IP, Enter, then wait 15 s.
   Expect "Joining <IP>:27015". Repeat typing a port. Log (friend's PC):
   `JOIN connecting to`. If the chat line does not open, note it and use the
   console `connect <IP>:27015`.
2. Intro logos on both screens; the black box at s4_start gone for the friend.
3. Collision off (set at New Game): walk through each other; on: you bump.
4. Teleport doors: the second player follows within a second.
5. A fall zone (s4_subwaysick1): only the faller dies, body beside the partner.
6. House camera (s4_village3): only the player who walks in.
7. Weather, objectives (B on both), wheelchair ending (both in a chair),
   strangle (the player who turned the last valve), stats at the end.
8. Quick dual wield: bind phone to 1 and knife to 2 in the inventory, press 1
   and 2 together. Log `DUAL quick player=N keys ... asked`.

## C. Four players

1. Setup: press 1 until "Players: 4", E (the lobby restarts with 4 slots).
2. Three friends join. Park maps: no level-change loop for slots 2-4.
3. Extra ammo lies in squares, not falling off ledges.

Four-slot fixtures in the tests do not prove four-player gameplay.
