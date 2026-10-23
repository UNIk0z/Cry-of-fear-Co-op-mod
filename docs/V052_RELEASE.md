# Cry of Fear co-op v0.5.2 (2026-10-23)

v0.5.1 with the fixes from Katz's v0.5.1 test (2026-10-23). The maps are
byte-identical to v0.5/v0.5.1; the adapter changed, the join box picture
changed, and Install puts the Create Server entries in order.
**Run solo in the game on Katz's PC with a test copy of the adapter**
(cl_dlls/storycoop_dev.dll, 800x600 windowed); two players not tested.

| Report | Cause (evidence) | Change | Solo run |
|---|---|---|---|
| Join box: a black box with our picture in the middle | The picture was 554x480, black except a small panel; the game draws it over its rust background. | The box is the game's own computer screen (computer_logon.tga) with the co-op texts: "Join Simon's Story", CRY OF FEAR Co-op, Host IP, Port, Join, Cancel. Built by scripts/menu/make-joinbox.py; the package ships an XOR delta and Install rebuilds it from the player's own file. | Seen in game |
| Chapter 2 above the Prologue | GameUI lists maps in folder order. Katz's D: is exFAT, which keeps write order (dir listed Chapter-2 first). | Install writes the entries again, in order, whenever the folder lists them out of order, and says so. | List in order after the rewrite |
| Create Server buttons open a settings menu | The main menu's own buttons (client VGUI) sit under the GameUI window and still take its clicks: a click on the map list at the Join button's height opened the join box, at the Options button's height the Options window. | While GameUI is active the four menu buttons do nothing; a 50 ms timer on the game's main thread checks it (the menu map's server frames stop while GameUI is up). | Reproduced before; no Options/Join after |
| Chapter 3 starts at the boss; chapters do not start where the title card shows | Each chapter card (cof_chapter) was checked in the game's own c_* maps. 1, 2 and 6 fire at the arrival point. 3 (after Mace), 4 (back from the roofs), 5 (arrival from c_subwaysick2) and 7 (after the Doctor dies) fire later in the map. | 3: moved to sew3alt_dest by the exit to the city, sewer door opened as the scene does, card shown. 4: park3roofed fired, moved into the Sophie trigger (the scene and card play). 5: moved into the arrival trigger (its scene, teleport and card play). 7: Doctor removed, his death targets fired (doors, music, weapon drop, objective), moved to deteleport1_des, card shown. | 2-7 started. 3 and 7: card fired (log). 4: Sophie scene ran (log: multiirlsophie, crow.mp3). 5: moved; its card was not confirmed. 6: crash scene ran. |
| Chapter start must give the weapons found so far | - | Phone, switchblade, Glock (2); + shotgun (3); + rifle (4); phone, switchblade, shotgun, rifle, M16 (5); none (6: the train crash takes everything); flashlight, Glock, P345, shotgun, revolver (7). At most five cards so a key still fits in the six slots. | Inventory seen for 3 and 7 |
| (found in Katz's 12:14 log) Crash starting Chapter 7 after Chapter 1 and the menu | hl.dll+0x290C0 in CCoopLevelChangeManager::GivePlayerVariables. CWorld::Precache deletes the manager on a single-player map (the menu) and keeps the pointer; the next co-op map reads freed memory. | After a single-player world spawn the adapter clears that pointer (hl.dll 10222E10). | Chapter 1 -> menu -> Chapter 7: no crash |

Not changed: "< Random Map >" stays at the top of the list (the game adds it).
After Cancel the game's own GameUI menu stays up; Esc or "Resume game" returns
to the co-op menu (game behaviour).
