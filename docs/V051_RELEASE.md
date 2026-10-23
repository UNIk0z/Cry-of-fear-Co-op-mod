# Cry of Fear co-op v0.5.1 (2026-10-23)

v0.5 with the fixes from Katz's first v0.5 test (2026-10-23). The maps are
byte-identical to v0.5; the adapter changed and Install adds a few files.
**Not run in the game yet** (the game cannot start from the build shell).

| Report | Cause (evidence) | Change |
|---|---|---|
| Skip still does not register | Log 11:30: "SKIP offered for the prologue", no vote. In a cutscene the server's fuser3 reaches the client as vuser4.x; client.dll then drops jump, use, attack and duck presses (decomp input.cpp IN_JumpDown/IN_UseDown/IN_AttackDown). IN_ReloadDown has no such check. | **R** votes to skip; the text says "Press R to skip". |
| Host setup must be a main menu window, with chapters instead of maps | The game has its own Create Server window (GameUI.dll, opened by "optionshack 1"). | "Host Simon's Story" opens it. Its list shows only maps/\*-\*bsp (in-memory GameUI change): Chapter-0-Prologue ... Chapter-7-Only-Safe-at-Home and Load-Save-Slot-1/2/3, copies of the game's own small c_difficulty_settings.bsp made by Install. Its options come from cryoffear/sc_setup.scr (players 2-4, Difficulty, Player collision, Pausable). On Start the adapter restarts the server on the real chapter map (or loads the slot with its saved settings). Friendly fire: not offered (Katz). |
| Join must open a box with two fields, Join and Cancel | The Join button's "optionshack 0" is handled inside the engine and never reached the mod (v0.5's chat prompt could not run). | Join now sends "sc_joinbox" to the main menu's own server (the adapter), which opens the game's computer login panel with our picture ("JOIN SIMON'S STORY", Host IP, Port, Join, Cancel). Join connects to IP:port (empty port = 27015); Cancel closes. The game's computer puzzle texts and picture come back when the box closes. |
| Lobby setup text not persistent | - | The lobby setup is removed (the Create Server window replaces it). |
| Saw on the corpse for the key | s4_sewer3 func_button #876 ("I'm going to need something to cut free that key", lockedby saw) has spawnflags 2048; the engine deleted it in multiplayer until v0.5. | Already in v0.5 (RC-2048). Needs a v0.5 log if it still fails. |

Files Install adds: maps/Chapter-*.bsp and maps/Load-Save-Slot-*.bsp (11),
gfx/vgui/sc_joinbox.tga, sc_setup.scr (the game rewrites it with the last
choices; Install keeps it, Uninstall sets it aside). No game file is changed.
