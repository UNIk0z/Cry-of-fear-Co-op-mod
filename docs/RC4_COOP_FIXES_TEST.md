# One consolidated two-client test (coop-fixes-001)

Use your Steam host + Sandboxie client and the full RC2 campaign. Install in BOTH
environments with both games closed (START_HERE.md).

**Logs.** The host log now records itself from boot. For the Sandboxie client,
type `condebug` in its console as soon as it opens. Afterwards, close both games
and run `collect-story-log.ps1` (P1 = host, P2 = boxed log path). Write PASS,
FAIL or INTERRUPTED per step. Copy any `[STORYCOOP]` line that says `WAIT`,
`FAILED`, `refused`, `CODE_LAYOUT`, `LADDER`, `NET`, `SERVER_FRAME` or `VEHICLE`.

## Part A — Opening

1. Double-click `Host RC4.cmd`. P2 joins, and both ready.
2. Confirm the original intro plays. **Does the train appear during the title
   reveal?** Note yes or no, and whether its lighting looks normal.
3. Confirm automatic progression, the nightmare, and both players waking with
   their intended equipment.

## Part B — Notes and padlock

1. Both collect the shared notes. Both open the notebook: the code must sit
   inside the page.
2. Change maps (go through a door to `c_start2` and back). Reopen the notebook
   on both clients. **Is the code still inside the page?** If not, note which
   player and after which map change.
3. The padlock accepts the code with its original sounds, and the unlocked door
   works for both players.

## Part C — Ladders (`c_start` has three)

1. P1 climbs alone. Then P2 climbs alone, and you note whether it lags.
2. P1 starts climbing. P2 presses E on the same ladder (bottom and top). Nothing
   may happen for P2, who must still move and look freely.
3. After P1 finishes, P2 climbs that ladder normally.
4. Both climb different ladders at the same time.
5. If feasible, let a player die while climbing. The ladder must free itself
   when the climb's timer ends.
6. Expect log lines `LADDER … reserved by player=N` and `LADDER … released`.

**Optional jitter A/B (only if P2 jitters):** note the jitter, then type in P2's
console `rate 100000; cl_updaterate 100; cl_cmdrate 100` and in the host console
`sv_maxupdaterate 100; sv_maxrate 100000`. Say whether it changes. The `NET` line
records the settings used.

## Part D — Saving (no console commands)

1. Give the two players clearly different health and inventories, and note them.
2. Do **not** type `sc_checkpoint_bind`. The host uses the Sewer Store tape
   recorder. Expect `CHECKPOINT save player=1 …`, `CHECKPOINT save player=2 …`
   and `Checkpoint slot1 COMMITTED`.
3. Fully close BOTH games, then double-click `Continue RC4 slot1.cmd`. P2 joins.
4. Expect:
   - `PREPARE accepted` (from the command or the Continue request file);
   - `LOAD staged`;
   - one `CHECKPOINT restored player=N` per player.
   A line containing "matched by role" is fine.
5. Verify:
   - the location;
   - each player's own health, weapons, ammo and equipped item;
   - notes, the code position, the solved padlock and doors;
   - that both can continue the story.

If you see `RESTORE WAIT (…)`, `RESTORE FAILED (…)` or `PREPARE REFUSED`, copy
those lines.

## Part E — Map revisit

1. Return to the first padlock map (`c_start`) from `c_start2`.
2. **The black box near the original spawn must be gone.**
3. Completed events must not reset; doors and player visibility must be correct.

## Report

~~~text
Build coop-fixes-001
A train visible: yes/no; lighting:
B code position after map change: P1 ok/wrong, P2 ok/wrong (which change)
C1-C5: ...   jitter A/B: ...
D: PASS/FAIL (copied lines)
E: black box gone yes/no
Logs: collected P1 / P2
~~~
