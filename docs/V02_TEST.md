# v0.2 test run (two players)

Run "Install or Update.cmd" on both PCs first, with the game closed. Afterwards
send the HOST's newest `cryoffear\storycoop_logs\rc4-*.log` (the host PC has
the log) and any screenshots, with the map name from the console (`status`).

1. **Staged actors (s4_apartment1, new game):** at the start and in the
   hallways, before any scene: no Simon, no kids, no ghosts, no elevator figures
   standing anywhere. Handgun scene (button in the office): no Simon with a gun
   standing there before you press it. The scene itself still shows its actors.
2. **Revisit (s4_apartment1 again, from s4_apartment2):** same as step 1. No
   Simon at the start point, the lamp sparks are not looping, the kids are not
   standing in the key room before their scene.
3. **Other maps with staged scenes:** s4_asylum1 (doctor, sick Simon, camera
   models), s4_attic, s4_start (Simon before the wake-up / hammer scenes),
   s4_stad, s4_subway2st1. Nothing should stand idle before its scene.
4. **Elevator (s4_apartment1, ground floor → fourth floor):**
   a) P1 enters the elevator, P2 stays outside. Expect: the ride scene for both,
      then both on the fourth floor next to each other, both visible to each
      other, both able to move. Log: `SCENE_TELEPORT player=1 ... partners moved=1`.
   b) Both enter together. Expect: not inside each other (`aside=1`), both move.
5. **Door music:** in s4_apartment1, open a hallway door that changes the music
   (the stairwell/hall doors). Test once with P1 opening it and once with P2.
   Both hear the new music; when the second player takes the same door it does
   not restart. Log: `MUSIC door aphall2.mp3 ...: changed for 2 player(s)`, then
   `... 2 already on it`. A level-change door (s4_apartment3 → s4_apartment4)
   arrives with its music. Save at a recorder after a music change, quit, load
   the slot: the same music plays.
6. **Ladders (P2):** s4_start (the ladders near the start and in the sewer
   rooms) and a tall one, s4_subway2st3 or s4_subtunnel1. As P2: climb up,
   stop, go back down, climb again to the top; then from the top go down to the
   bottom. Meanwhile P1 presses E on the same ladder: P1 must not take it over
   (log `LADDER ... reserved by player=2` until the climb ends). Expect no stuck
   pose and a smooth view. P1 then climbs normally.
7. **P2 standing still:** P2 stands still on flat ground for 20 s (s4_start_e0
   start room), then walks, stops, turns, crouches and steps on and off a
   ladder. Report whether the jitter is still there. The log has
   `IDLE_DIAG player=2 ...` lines; send them either way.
8. **Recorder:** P2 walks up to and looks at a recorder: no message. P2 presses
   E on it: "Only host can save the game" on P2's screen only. Host: recorder,
   then 1/2/3 saves as before.
9. **Still working from v0.1:** Steam names, no train in the lower left of the
   title shot, the Glock for both players after the handgun scene, inventory
   kept across map changes, Load Slot 1..3.

Not covered: the other player sees a climber's body stand at the ladder base
(the player models have no climbing animation; native co-op behaviour). The
staged-actor rule covers actors that single player hides at load. An actor a
scene leaves visible on purpose (a body, a dropped key) shows its default state
on a revisit, as before.
