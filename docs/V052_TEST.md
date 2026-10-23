# v0.5.2 test run

Close the game, run "Install.cmd" from the v0.5.2 folder, then "Run Co-op
Mod.cmd". Send the newest cryoffear\storycoop_logs\rc4-*.log.

1. **List order.** Host Simon's Story, open the map list. Expect Prologue,
   Chapter 1 ... 7, then Load-Save-Slot-1..3.
2. **No settings window.** In Create Server click around the list and the
   Game tab. Expect no Options window and no join box. Log:
   `MENU buttons paused while a game window is open`.
3. **Chapter 3.** Start Chapter-3. Expect the "Chapter 3" card by the sewer
   exit (not the Mace fight) and phone, switchblade, Glock and shotgun in the
   inventory. Walk to the city. Log: `CHAPTER Chapter 3 ... moved to the title card spot`.
4. **Other chapters.** Back to the menu each time (this also checks the
   second-game crash), then 2, 4, 5, 6, 7. Expect each title card at the start
   (4: after a short Sophie scene; 7: in the attic after the Doctor).
5. **Join box.** Esc back to the menu, click Join Simon's Story. Expect the
   game's computer screen with "Join Simon's Story", Host IP and Port.
6. **Co-op.** A friend joins a chapter start. Expect the same weapons for them.
