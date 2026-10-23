# v0.5.1 test run

Both PCs: close the game, run "Install.cmd" from the v0.5.1 folder, then
"Run Co-op Mod.cmd". Send the host's newest cryoffear\storycoop_logs\rc4-*.log
(and the friend's for the Join test).

1. **Host window.** Click "Host Simon's Story". Expect the game's Create Server
   window with only Chapter-0-Prologue ... Chapter-7-Only-Safe-at-Home and
   Load-Save-Slot-1/2/3 in the list, and on its second page Difficulty, Player
   collision and Pausable. Log: `HOST Create Server window lists the story chapters`.
   Pick Chapter-1, players 2, Start. Expect s4_start. Log: `HOST Chapter-1-Lost-in-a-City: players=2 ...`.
2. **Load from the window.** After saving at a recorder: quit to the menu, Host,
   pick Load-Save-Slot-1, Start. Expect the saved place.
3. **Skip.** In the prologue intro press **R**. Expect "Press R to skip 1/1" and
   the scene jumping to its end. Log: `SKIP vote player=1`.
4. **Join box.** Friend: click "Join Simon's Story". Expect a box "JOIN SIMON'S
   STORY" with Host IP and Port fields. Type the host IP, leave Port empty,
   click Join. Log (friend): `JOIN box open`, `JOIN connecting to <IP>:27015`.
   Also try Cancel (log `JOIN box closed`), and a wrong address (the fields
   say "That is not an IP address.").
5. **Computer puzzle unchanged.** In the story (s4_apartment computer) the
   login screen still shows the game's own picture and "Enter a username...".
6. **Collision off.** Host window: Player collision off. Expect walking through
   each other.
7. **Saw on the corpse** (s4_sewer3, after the sewer boss): use the saw on the
   corpse. Expect the key.
