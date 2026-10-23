# Cry of Fear co-op v0.5.5 (2026-10-23)

v0.5.4 with the cutscene skip fixed (Katz 2026-10-23: "FIX THE SKIP BUTTON
AND TEXT ON ALL OF THE CUTSCENES"). Maps byte-identical; adapter only.
**Run solo in the game by Claude** (dev copy cl_dlls/storycoop_dev.dll,
800x600): the prologue, the nightmare intro, the Chapter 2 scene and the
Chapter 4 Sophie scene were each skipped with R (logs `SKIP vote (R) ... 1/1`,
`fast-forwarded`; screenshots show the prompt and the player in control
afterwards). Two players not tested.

| Report | Cause (evidence) | Change |
|---|---|---|
| R does nothing in cutscenes | In a dev run a per-command log in CmdStart stayed empty for the whole Chapter 2 scene while R, SPACE and E were pressed: the server never saw a usercmd button during the camera, so no vote was ever counted (since v0.4). | R is read in each player's own game (GetAsyncKeyState on the game's main-thread timer, only while the game window has the focus and its console/menu is closed) and sent as the client command `sc_skip`, which the server counts for the scene or the prologue. |
| No skip on many scenes | Scenes that started a train, a scripted sequence, a boss bar or the Doctor's weapon trigger were never offered (log: `SKIP not offered for multidadoc: docweaponsec (cof_doctorweapontrigger)`). | Every scene is offered. Everything the scene still fires runs in order at once; trains and sequences then run on by themselves (named in the log). A camera of the skipped scene that comes on again within 2 s is ended once. |
| Nightmare map: no skip, and alone a black screen | s4_nightmare is the opening's passive map (no camera tracking, no client tracking), so neither the skip nor the 5 s wait for players could see the player. | There the scene camera is read from the player's own view and the wait starts from the game's own player count. |
