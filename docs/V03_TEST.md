# v0.3 test run (two players)

Run "Install or Update.cmd" on both PCs first, with the game closed. Then
both run "Run Co-op Mod.cmd": the host presses H, the friend presses J,
then connects from the game console (~): connect <host IP>:27015.
Afterwards send the **host's** newest `cryoffear\storycoop_logs\rc4-*.log`.
The host's PC has the log: the joining PC's server shuts down when it joins.

What the log now records, which the v0.2 logs could not show:
- `MAPSTATE kept <map>: saved=… removed=…` and `MAPSTATE gone on <map>: <names>`:
  what each map looked like when you left it.
- `MAPSTATE restored <map> on <alias>: restored=… removed=… recreated=…
  kept-as-served=… unmatched=…`: what came back on the revisit. A large
  `unmatched` means the identity rule missed entities on that entry.
- `MAPSTATE slotN written` and `MAPSTATE slotN loaded`, or `has no matching
  map-state file`: which timeline a save carries.
- `DROWNED monster N attack victim player=P (its enemy)`: who the Drowned
  chose.
- The v0.2 `ITEMUSE` and `DOOR gate … toggled (n time(s); odd = open)` lines
  are still there, for the rope.

1. **Rope (s4_apartment5).** Pick up the rope, go to the balcony, place it
   ("You have placed the rope.") and climb down. Then return to apartment5
   from apartment3 or apartment1.
   Expect:
   - the rope still hangs there and is not in anyone's inventory;
   - no rope pickup is back;
   - the climb works for both players.

   Log: `MAPSTATE gone on s4_apartment5: ropeheh, ropebutton, …`, then
   `restored s4_apartment5`.
2. **Tape (s4_apartment4 → s4_apartment3).** Pick up the videotape in the
   basement. The host saves at a recorder while someone carries it.
   Expect "Game saved in slot N" and no "could not be written". Then quit,
   load that slot, and check the tape is in the carrier's inventory. Use it on
   the TV ("menhora").
3. **Revisits with backtracking.** Kill the enemies in a room, take its
   pickups and open its doors. Leave, then come back. Expect:
   - dead enemies stay dead;
   - pickups do not return;
   - doors and puzzles stay as you left them;
   - one-time scares do not replay.

   Try at least apartment1 ↔ apartment2 and apartment3 ↔ apartment4.
4. **Saves keep their own timeline.**
   - Save in slot 1, change a map (take items, return), then load slot 1:
     the map is as it was at the slot 1 save.
   - Start a new game: nothing is carried from the earlier run.
5. **Older save.** Load a v0.2 save made after the rope was placed. Expect
   the rope pickup present, with the log line `WORLD older save:
   inventoryitems/rope.txt left in place`. Place it again and climb.
6. **Drowned (s4_apartment4 basement, s4_asylum1, s4_asylum2).** Let her grab
   player 2 while player 1 stands elsewhere. Expect:
   - player 2's gun turns on player 2;
   - player 2 escapes by pressing attack quickly;
   - player 1 moves and shoots freely.

   Killing her ends the attack. Repeat with player 1 as her target. Log:
   `DROWNED … victim player=2`.
7a. **Inventory survives the next door after a save.** The host saves, then a
   player picks something up (a weapon, the tape) and both go through a
   door. Expect the item kept and health unchanged. Log: `REJOIN player=N left;
   kept their state` or `kept their level-change record`, never `the last
   save's record` on a normal door.
7b. **Player-1-only scenes, as player 2:**
   - Place the rope as P2: P2 sees "You have placed the rope."
   - Use the tape on the TV as P2.
   - Solve the s4_asylumb boiler bars as P2: P2's view comes back. Log:
     `PUZZLEBAR player=2`.
   - s4_forest4: P1 picks up one scissors half and P2 the other. Within a
     second one player holds both halves (log `COMBINE`); combine them and cut
     the rope. Same for the s4_asylum1 number plate halves.
   - s4_roofs2 boss: it turns to and attacks whichever player it chases.
7. **Still working:** Steam names, no train in the title shot, the Glock for
   both players, door music, the elevator in apartment1, P2 on ladders,
   inventory across map changes, host-only saving (P2 sees "Only host can save
   the game" only when using a recorder).
8. **If anything breaks after a revisit**, create the empty file
   `cryoffear\storycoop_mapstate.off` on the host. Then repeat the step and
   send both logs. That isolates the map state.

Not covered by these steps: every map of the campaign (80 source maps; see
docs/V03_COVERAGE.md), endings, and four players.
