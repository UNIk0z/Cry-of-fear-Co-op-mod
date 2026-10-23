# v0.4 test run (two players)

Both PCs: close the game, run "Install or Update.cmd" from the v0.4 folder.
Both double-click "Run Co-op Mod.cmd". The host picks Host Simon's Story >
New Game or Load Slot; the friend types in the console (~):
connect <host IP>:27015. Afterwards send the host's newest
`cryoffear\storycoop_logs\rc4-*.log` (and any `crash-*.dmp` there).

1. **The scene behind the padlock door (s4_start_e0, the reported box).**
   Play from the start to s4_start2 and back to s4_start (s4_start_e0). The
   host opens the padlock door, then walks into the room to the right. Both
   players watch the scene (Simon reads "Look to the right.").
   Expect both players next to the door afterwards, able to move.
   Log: `SCENE_TELEPORT player=N moved during scene camera ...` then
   `SCENE_TELEPORT player=N moved as its scene ended, camera ...` (or
   `after its scene,`), both with `partners moved=1`.
   Repeat with the FRIEND walking in first.
2. **Save and load before and after that scene.** Save at a recorder before
   the scene (slot 1) and after it (slot 2). Quit to the menu, load slot 1,
   play the scene, then load slot 2. Expect no freeze; log `CHECKPOINT
   restored player=1` and later `player=2`.
3. **Save, exit, relaunch, load.** Save, close the game completely, start it
   again with "Run Co-op Mod.cmd", Load Slot. Same expectation.
4. **Overwrite.** Save to the same slot three times at different places,
   load it each time. Expect the latest place every time.
5. **Return loop.** Carry the phone and a weapon to s4_start2 and back;
   pick something up on the way. Expect the inventory kept, taken pickups
   gone, killed enemies still dead. Log: `MAPSTATE restored ... removed=`.
6. **Another scene of the same kind.** s4_park3 (Sophie: staging at 1 s,
   exit at 11 s) or s4_subway2st1 (tbteleport1h at 0 s, exit at 24 s):
   expect both players out of the scene together.
7. **Launcher.** Double-click "Run Co-op Mod.cmd" with the game closed:
   Cry of Fear opens at the co-op main menu without any question (Steam may
   ask once to allow the launch options). Rename the "files" folder and
   double-click: a clear message says the files are missing.

If anything freezes or crashes: the host's rc4 log now ends with a
`CRASH code=...` line (first chance) and `storycoop_logs\crash-*.dmp`.
