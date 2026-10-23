# Test for coop-fixes-004

Host logs are kept automatically in
`D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\storycoop_logs`, and the
current session is `D:\SteamLibrary\steamapps\common\Cry of Fear\qconsole.log`.
Claude reads both directly; you only need to say what you saw.

1. **Prologue rain.** During the prologue, rain streaks should fall in the
   street shot (Simon below the camera) and in the rooftop/cat shots. Both
   windows should show the same rain.
2. **Cutscene light.** Hold the phone with its light on (or the flashlight) when
   a cutscene starts. No lit circle should appear in the cutscene; the light
   must be back afterwards.
3. **Subtitles and objectives.** P2 should see the same subtitles and
   objective texts as P1.
4. **Notes.** Every note on the floor or a table should have the red glow.
5. **Doors everywhere.** Play on past the sewers. Every door that moves you
   (fade to black, then you are in the next room) should keep both players
   visible to each other afterwards. Locked doors that a script or a key opens
   should open for both players once one player has opened them.
6. **Keypads.** Wherever a code note or keypad appears (apartments, sewers,
   asylum, basement), BOTH players should be able to enter the note's code.
7. **Boat (lake).** One player rows; the other should appear at the far dock.
8. **Save/Continue anywhere.** Save at a later tape recorder, close both games,
   run `Continue RC4 slot1.cmd`: both players come back at their spots, opened
   doors stay open and the keypad code still works.

Lines in the log that matter contain `CINEMATIC`, `STORYTEXT`, `OBJECTIVE`, `KEYPAD`, `KEYDOOR`,
`CHECKPOINT`, `RESTORE`, `WORLD`, `BOAT` or `CODE_LAYOUT`.
