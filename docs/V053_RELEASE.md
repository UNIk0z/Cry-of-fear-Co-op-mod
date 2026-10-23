# Cry of Fear co-op v0.5.3 (2026-10-23)

v0.5.2 with Katz's next reports (2026-10-23). Maps byte-identical; adapter only.
**Not run in the game by Claude** (Katz tests; Katz asked Claude not to launch
it). Built and checked by the 14 native fixture suites.

| Report | Cause (evidence) | Change |
|---|---|---|
| Chapter 1 alone: black box, the scene never starts | s4_start (and s4_nightmare) start the opening scene from game_counter "game_playerjoin", limit 2 (RC3 map build). The game Uses it once per player when that player's HUD starts (decomp player.cpp UpdateClientData). Alone it stops at 1. | Once the first player is in, everyone sees "Waiting for players 5 ... 1" in the middle of the screen; then the scene starts with whoever is there (the counter's own targets, first player as activator; its limit is raised so a late join never starts it twice). Two players in time: the counter fires on its own as before. Log: `JOINWAIT`. |
| Chapter 6 on: Simon has lost his bag, every player must have 3 slots | c_bridge's cof_clearitems "bagremove" (spawnflags 5) clears the activator's items and sets m_bThreeSlots for the activator only; a co-op map change builds every player again with six slots. | bagremove is now Used for every player the frame after the map fires it (log `BAG bagremove: every player lost the bag`). On c_bridge and every map after it (forest, village, asylum, attic, lake, forest sewer, endings: all maps reachable from c_bridge, none reachable from c_start without it) each player gets three slots through the game's own path (cof_clearitems spawnflags 4: m_bThreeSlots, slots 1-3 sent). Log `BAG player=N has three slots`. Chapter 7 now gives the flashlight and the shotgun (a slot stays free; the Doctor drops a gun). |
| Chapter 2 scene: no skip option, could not skip | The offer ("Press R to skip") was sent once, when the scene started, before the arriving player's HUD was ready (Claude's run: `SKIP offered for multiirlap` logged before `CHAPTER ... ready`); it reached nobody. | The prompt is shown again every 2.5 s for as long as a skippable scene runs. R votes as before; alone, one press skips. |
