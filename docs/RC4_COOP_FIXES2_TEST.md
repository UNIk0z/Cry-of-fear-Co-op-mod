# Test for coop-fixes-002

The host log is now saved automatically. Earlier host logs are kept in
`D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\storycoop_logs`.
In P2's console, type once:
`cl_updaterate 100; cl_cmdrate 100; rate 100000; condebug`.

1. **Opening.** Does the train appear during the title reveal?
2. **Code note.** After the computer event, change maps (`c_start2` and back)
   and reopen the notebook on both clients. Is the code inside the page? Is
   there still a duplicate "Hidden note #1" row?
3. **First enemy (blur/zoom).** Do BOTH players get the effect at the same time?
4. **Cutscenes.** Turn on the flashlight before a cutscene. The beam must not
   show during it, and the flashlight must be back on afterwards.
5. **Ladders.** P2 climbs alone: still laggy? P2 movement and camera shake:
   still jittery?
6. **Save and restore (no console commands).**
   - Give the two players different health and items, and note them.
   - Save at a tape recorder.
   - Fully close both games, then run `Continue RC4 slot1.cmd`. P2 joins.
   - Expect a `CHECKPOINT restored player=1 …` line and a `player=2` line.
     `RESTORE soft differences` lines are fine.
   - Both players must land at the recorder area with their own inventory.

Send this report plus the newest log from `storycoop_logs` (and P2's
`qconsole.log` if you can). The lines that matter contain `VEHICLE`,
`CODE_LAYOUT`, `POSTPROCESS`, `RESTORE`, `NET` or `SERVER_FRAME`.
