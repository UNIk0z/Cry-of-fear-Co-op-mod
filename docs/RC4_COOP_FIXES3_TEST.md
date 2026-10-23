# Test for coop-fixes-003

Host logs are kept automatically in
`D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\storycoop_logs`.
P2 keeps `cl_updaterate 100; cl_cmdrate 100; rate 100000` (already typed once).

1. **Opening train.** During the opening, after the title, a train should
   leave the station and pass the camera with its sound and headlights.
2. **Cutscenes.** Hold the phone (or later the flashlight) when a cutscene
   starts. Neither the light nor the phone should show during the cutscene;
   both must be back afterwards.
3. **Shared notes.** The two notes on the c_start2 street now glow red like
   other pickups.
4. **Tape recorder after Continue.** Save, close both games, run
   `Continue RC4 slot1.cmd`, then use a recorder again: the FIRST press must
   save (no "Huh? What's this doing here?" line). An item you picked up before
   saving (for example the cassette tape) must not be lying there again.
5. **Saving later in the campaign (new).** At any later tape recorder
   (apartments, sewers, and beyond), save. Close both games and Continue. Both
   players must come back at the spots where they stood, with their items;
   picked-up items stay gone and key-unlocked doors stay unlocked.
6. **Boat (lake, late game).** One player rows the boat. The other gets a
   message, and when the boat docks on the far side, they appear next to the
   rower.

Send this report plus the newest log from `storycoop_logs`. Lines that matter
contain `CINEMATIC`, `CHECKPOINT`, `RESTORE`, `WORLD`, `BOAT`, `VEHICLE` or
`CODE_LAYOUT`.
