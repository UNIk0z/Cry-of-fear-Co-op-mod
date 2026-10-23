# v0.5.3 test run

Close the game, run "Install.cmd" from the v0.5.3 folder, then "Run Co-op
Mod.cmd". Send the newest cryoffear\storycoop_logs\rc4-*.log.

1. **Chapter 1 alone.** Host, Chapter-1, Start. Expect "Waiting for players 5"
   counting down, then the wake-up scene. Log: `JOINWAIT s4_start: scene started with 1 player(s)`.
2. **Prologue alone.** Same on the nightmare map after the prologue.
3. **Chapter 2 skip.** Start Chapter-2. Expect "Press R to skip 0/1" bottom
   left during the scene; press R. Log: `SKIP vote`, `SKIP ... fast-forwarded`.
4. **Chapter 6.** Start Chapter-6. Expect the inventory to show 3 slots after
   the crash. Log: `BAG`. With a friend: both lose the bag and have 3 slots.
5. **Chapter 7.** Start Chapter-7. Expect 3 slots with the flashlight and the shotgun.
