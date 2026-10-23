# Cry of Fear co-op v0.1 (2026-10-16)

coop-fixes-014 plus the v0.1 pass. Every map is byte-identical to 013/014; the
adapter and the package changed. Automated tests passed; **nothing in this
list has been played yet** (see TESTING.md for the smallest test run).

| Area | Change | Evidence so far |
|---|---|---|
| Title train in the lower left | Cause: since coop-fixes-001 the adapter forced the title train past the PVS check in every camera view. Since 003 the train waits at the station during the title shot (as in single player), and the station is outside the title camera's PVS (0 of its leaves visible, c_intro vis data). The client drew the parked train alone in the lower left. The forced send and the flag/groupinfo retry are gone. | User logs 2026-10-15 (speed 0 at the station, packed=1 only in camera views); static PVS check |
| Missing meshes (014) | Unchanged: players still packed with EF_NODRAW in scene cameras | user-confirmed in 014 |
| Simon standing in the apartment | Simon cutscene models (player3, simon_talk*, sicksimon*, booksimon, simon_door, badkarscenesim) are drawn only for a client whose view is a scene view, never in first person. Entities, scripts and scenes are untouched. | automated |
| Story weapons | Still given to every living player who lacks the weapon; a dead player is owed it and gets it once after the revive | automated |
| Inventory carry | Read for every player at the engine ChangeLevel call (all transition types), including a player frozen in a scene; a dead player keeps the last record | automated |
| Steam names | Host reads names from Steam (game's steam_api.dll, SteamFriends013); launcher sc_name fallback; saves stay keyed by Steam ID | automated (no Steam in tests) |
| Saving | Only the host saves; a slot choice (1/2/3) for every save; partner sees "Only host can save the game" at a recorder for as long as they stand there; save sound on every client; nothing on cancel/failure | automated |
| Locked doors | Story-locked co-op doors play buttons/latchlocked1.wav; key doors keep the native locked sound | automated |
| Menu isolation | No game file is replaced. client.dll and menu_logo.tga go back to the game's own; the adapter (loaded only by "Host a game" / "Join a game") changes the menu in memory; the CO-OP title is gfx/vgui/sc_logo.tga; entries are maps/storycoop_*.coopm | automated |
| Credits/version | "Co-op mod v0.1 developed by Anas Sammak (koolkat)", "Special thanks: Mesilll, Michal Eminov, caixa" | automated |

Install: run "Install or Update.cmd" on both PCs (game closed). Host: "Host a
game.cmd". Friend: "Join a game.cmd". A normal Steam launch shows the game's
own menu.
