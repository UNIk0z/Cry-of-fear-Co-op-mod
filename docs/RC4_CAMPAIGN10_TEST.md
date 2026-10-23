# Test for coop-fixes-010

Run `INSTALL co-op.cmd` on **both** PCs first. Logs are kept automatically in
`...\Cry of Fear\cryoffear\storycoop_logs\rc4-<date-time>.log` on the host.
Claude reads them directly; you only need to say what you saw and roughly
where.

1. **Main menu:** start with `Start co-op menu.cmd`. The title reads "CRY OF FEAR" with "CO-OP" under it. The bottom-left corner
   says "Co-op mod developed by koolkat". Custom Campaign lists
   "Co-op Story: New Game" and "Co-op Story: Continue", not cut off.
2. **Simon everywhere:** in the intro and the nightmare (camera scenes) both
   players look like Simon, as on s4_start. The log has `MODEL` lines for
   `cof_campaign_story4` and `s4_nightmare` too.
3. **Dual wield, seen by the other player:** one player dual wields (knife +
   phone) and walks and runs around; the other player watches. The model
   should move smoothly, not stand still and jump.
4. **Pause:** each player in turn opens the ESC menu. Both screens show
   `*paused*` while it is open, and it disappears when the game resumes.
5. **Still from 008:** saving (sound for the host, the message for the
   partner), reconnecting during a camera scene, both players dying after
   a save on the same map, and the quick keys after Continue.
6. **Hitboxes / ladder:** if they still feel wrong, note the map and the
   enemy, and whether it was the same before 007.
7. **Anything odd:** note the map (or a screenshot) and roughly when.

Log lines that matter: `MODEL`, `POSE`, `PAUSE`, `MENU`, `DUAL`, `LIGHT`,
`CAMERA join`, `GAME OVER`, `CHECKPOINT`, `REJOIN`, `RESTORE`.
