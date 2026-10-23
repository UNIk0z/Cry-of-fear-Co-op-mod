# One consolidated two-client test (campaign-doors-001)

Use the existing Steam host + Sandboxie client setup and the full RC2 campaign.
Install this package in BOTH environments with both games closed (START_HERE.md).
Write PASS, FAIL or INTERRUPTED for each lettered step. Nothing here has been
observed in a real game yet, and fixture results are not gameplay evidence.

**Logs.** As soon as each console opens, type `condebug` in BOTH consoles. After
the session, close the games and copy each log with the bundled collector.
Use `-Client P2 -LogPath "<boxed qconsole.log>"` for the Sandboxie copy:

~~~powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\collect-story-log.ps1 -Client P1
~~~

Keep the logs private: they contain identities. Report the map, the step letter,
which player did what, and any `[STORYCOOP]` line containing `refused`, `WAIT`
or `FAILED`. The text in parentheses on those lines is the exact failed step.

## 0. Start

Run `Host RC4.cmd` on the host. P2 joins through the usual Sandboxie client.
Both players join before either readies.

## R. Regression of already working features (quick)

Check, without stopping to retest in depth:

- ready gate, opening and nightmare;
- automatic wake;
- E doors with fade and audio, relocation and mutual visibility;
- computer and padlock with sounds, in that order;
- both players receive and can open the story notes;
- extra pickups.

Any failure here is a regression. Record it first.

## A. Camera with P1 down

Near a story cutscene with enemies, let P1 become down/revivable. P2 starts the
scene. When it ends, P1 keeps the native down view. Revive P1. Both players must
move, look, use E and open the inventory. The host log should show
`CAMERA recovered player=… state=down`.

## B. Reverse roles

Repeat A with P2 down and P1 starting the scene. If you can, also let a player
go down *during* a scene and be revived before it ends. The scene must still
complete normally.

## C. Code note

Acquire the computer/padlock code. Both players must see the same complete code
inside the original notebook page. Close and reopen it several times, change maps,
then reopen it. The padlock must accept the code.

## D. Save and full restart

1. Give the two players different health and inventories, and note them.
2. In the host console run `status`. If identities need binding, run
   `sc_checkpoint_bind USERID p1` and `sc_checkpoint_bind USERID p2` with the
   real numeric user IDs.
3. Run `sc_checkpoint_slot 2`, but only if slot 2 is unused. Otherwise pick
   another free slot from 1–3.
4. Use the Sewer Store tape recorder. Expect `Checkpoint slot2 COMMITTED`.
   Before it, the log should show one `CHECKPOINT save player=N health=…` line
   per player; compare these with your notes.
5. Close BOTH games completely, then run:

~~~powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\host-story-coop.ps1 -ContinueSlot 2
~~~

6. Type `condebug` again, reconnect P2, and rebind the same keys if you used them.
7. Expect `LOAD staged`, then per player `CHECKPOINT restored player=N …` and
   `Player checkpoint restored and inventory read back`. Verify:
   - Sewer Store location;
   - each player's own health, ammo, items and equipped weapon;
   - notes, with the code correctly positioned;
   - the padlock and door state is still solved;
   - controls and mutual visibility.

If you see `RESTORE WAIT (…)` or `RESTORE FAILED (…)`, copy that whole line.

## E. Apartment doors (continue from the restored session)

Leave `c_start` by its apartment exit. The served map must be `s4_apartment1_e3`
or `s4_apartment1_e7`; check the host's `status` line.

1. **Key room (door 713).** Enter the room where the apartment key lies. The
   scare must play once. About 35 s after entering, its exit unlocks. Before then
   that exit button is silent, which is a known limit. Afterwards, both players
   use E on it: fade, audio, correct landing and mutual visibility.
2. **Pick up the apartment key.**
3. **Apartment-key door (door 193).** Before using the key, E must show "The door
   is locked." Select the key and use it on the door: you should see "You unlocked
   the door.", the key leaves the inventory, and the host log shows
   `KEYDOOR sc4_keydoor_193 unlocked by native key; verified relocation enabled`.
   Then BOTH players use E: fade, audio, landing inside and mutual visibility.
   The second player must not need a key.
4. **Revisit.** Return to `c_start` and re-enter the apartment through the other
   entrance. Expect:
   - the key door already open (`KEYDOOR … already unlocked (shared state)`);
   - the scare does not replay;
   - door 713 is usable.
5. **Known limit, record only.** Going `apartment2` → back lands on RC2 aliases
   `s2_apartment1_e*`. Doors there are native and can lose visibility; this
   package does not cover that route.

## Report template

~~~text
Build: campaign-doors-001  Host env: unboxed  Client env: Sandboxie
R: PASS/FAIL (details)
A: PASS/FAIL/INTERRUPTED (map, scene, roles)
B: ...
C: ...
D: PASS/FAIL/INTERRUPTED (slot, map, copied RESTORE line if any)
E1: ...  E3: ...  E4: ...
Logs: P1 and P2 copied with collect-story-log.ps1
~~~
