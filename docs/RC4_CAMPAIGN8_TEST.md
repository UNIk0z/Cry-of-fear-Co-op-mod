# Test for coop-fixes-008

Run `INSTALL co-op.cmd` on **both** PCs first (it builds the Simon model on
each). Logs are kept automatically in
`...\Cry of Fear\cryoffear\storycoop_logs\rc4-<date-time>.log` on the host.
Claude reads them directly; you only need to say what you saw and roughly
where.

1. **Simon:** both players look like Simon (hoodie and bag), walking, running
   and holding weapons. The host log has `MODEL player=1 now simon` or
   `is simon`, and the same for player 2.
2. **Dual wield:** with knife + phone, and with a pistol + phone, for both
   players. The weapon ends up in your hands together with the phone
   (`DUAL ... holding=dual`).
3. **Lights:** turn on the phone light, then both players at once. Each
   player keeps the textured centre of their own light (`LIGHT` lines).
4. **Saving:** the host saves at a tape recorder and hears the recorder
   sound. The partner uses a recorder and sees "Only the host can save the
   game."
5. **Reconnect during a camera scene** (the intro or a cutscene): the
   returning player sees the same camera within a second, then gets their
   own view back. On a story map they come back where they stood.
6. **Both players die after a save on the same map:** the restart puts both
   back where the save was made, with the inventory and the key binds
   (`GAME OVER` lines).
7. **Key binds:** bind items to the quick keys, save, then Continue (and die
   once): the keys still select the same items.
8. **Hitboxes / ladder:** if they still feel wrong, note the map and the
   enemy, and whether it was the same before 007.
9. **Anything odd:** a door that won't open, a cutscene that freezes,
   missing items, someone stuck. Note the map (or a screenshot) and roughly
   when it happened.

Log lines that matter: `MODEL`, `DUAL`, `LIGHT`, `CAMERA join`, `GAME OVER`,
`CHECKPOINT`, `REJOIN`,
`CREDIT`, `POSE`, `ENDING`, `STORY`, `RESTORE`, `PAUSE`.
