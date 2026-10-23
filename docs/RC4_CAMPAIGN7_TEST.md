# Test for coop-fixes-007: the whole game, start to finish, with a friend

Logs are kept automatically in
`...\Cry of Fear\cryoffear\storycoop_logs\rc4-<date-time>.log` on the host.
Claude reads them directly; you only need to say what you saw and roughly
where.

1. **Joining s4_start.** After the prologue and the nightmare, the friend
   should not be kicked. The host log has `MODEL player=1 now simon` and
   `MODEL player=2 now simon`, and both players look like Simon.
2. **Kicked or disconnected?** Rejoin. The inventory should be back, and on
   s4_start the phone and the knife too (`REJOIN` lines in the log).
3. **Intro credits:** each name appears and fades on both screens; none stays.
4. **Intro train and cars:** they should move smoothly, together with the
   paper effect.
5. **Everything from 006:** dual wield (knife + phone, pistol + phone) for
   both players, the other player's model holding the weapon, saves at tape
   recorders and Continue, and the ending matching your choices (`ENDING`
   lines).
6. **Anything odd:** a door that won't open, a cutscene that freezes,
   missing items, someone stuck. Note the map (or a screenshot) and roughly
   when it happened.

Log lines that matter: `MODEL`, `REJOIN`, `CREDIT`, `NET tuned`, `DUAL`,
`POSE`, `ENDING`, `STORY`, `CHECKPOINT`, `RESTORE`, `PAUSE`, `LIGHT`.
