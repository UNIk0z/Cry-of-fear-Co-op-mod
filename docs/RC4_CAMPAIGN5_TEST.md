# Test for coop-fixes-005

Logs are kept automatically. Every co-op session now also writes its own file
`D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\storycoop_logs\rc4-<date-time>.log`
(the last 20 are kept), next to the archived `qconsole-*.log` files. Claude
reads them directly; you only need to say what you saw.

1. **Main menu.** Start with `Start co-op menu.cmd`. In the main menu open
   **Custom Campaign** and pick **"Simon Story co-op: host new game"**, then a
   difficulty. After the white fade the game should load the prologue as a
   two-player server, and P2 can join as usual. Later, try **"Simon Story
   co-op: continue save"**: it should load your newest save.
2. **Cutscene light.** Turn the phone light on before a cutscene starts. No lit
   circle should appear in any cutscene, and the light should come back after.
3. **Lights.** Pressing the flashlight key now only shows "use the phone or the
   lantern". The phone light (and later the lantern) works for both players.
   Please say whether P2 sees the phone's beam texture on P2's own screen, and
   whether each of you sees the other's light.
4. **Pause.** P1 opens the ESC menu (game pauses). P2 opens and closes the ESC
   menu: the game must STAY paused until P1 closes theirs. Then try it the other
   way round: P2 pauses first, P1 opens and closes, and the game should stay
   paused until P2 closes.
5. **Simon.** Both players should look like Simon instead of police officers.
   Watch walking, running, crouching, ladders and weapons for broken
   animations.
6. **Prologue.** The rain I added last time is gone.

Log lines that matter contain `MENU`, `LIGHT`, `PAUSE`, `MODEL`, `CINEMATIC`,
`STORYTEXT`, `OBJECTIVE`, `KEYPAD`, `CHECKPOINT`, `RESTORE`, `WORLD` or `BOAT`.
