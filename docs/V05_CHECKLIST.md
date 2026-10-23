# v0.5 checklist (persistent; Claude, started 2026-10-22)

Baseline: Claude v0.4 = commit 13a7390 (tag `v0.4-claude-baseline`), shipped ZIP
"Cry of Fear Co-op v0.4.zip" SHA256 2f8fe58d..., adapter 6eb58299.... Work branch
`claude/v0.5` (worktree silly-swanson-df4fa6). Codex v0.4.1 (a67ef5a, 662b43c,
tag `v0.4.1-codex-evidence`) is evidence only, never merged.

Status words: OPEN, FIXED-AWAITING-RUNTIME (code + automated checks, no game run),
VERIFIED-HOST (seen in the game on this PC, host only), VERIFIED (two players),
BLOCKED (reason given), KEEP (already works; preserve).

Evidence: playtest folder %USERPROFILE%\Desktop\New folder\Playtest (videos, logs, dumps); summaries in the root-cause table.

## Cross-cutting root causes found

| ID | Cause | Evidence | Affects |
|---|---|---|---|
| RC-2048 | The engine frees every BSP entity with spawnflags 2048 when `deathmatch` is non-zero (Quake's NOT_DEATHMATCH; hw.dll has "%i entities inhibited"). Co-op runs with deathmatch 1 (multiplayer game rules). CoF uses 2048 on func_button as "unlock fires the button" and on 8 trigger_cameras. 86 item-lock buttons on 15 base maps never exist in co-op. | Every ITEMUSE on a button lock (lighter, saw, spade, screwdriver, fuse, rope, ladder1, foot, doorknob, scissors3) in 3 host logs: lock record "removed", native inventory_no, player within 64 u of the button centre. Key doors (inter_door, no 2048) work. | A1 A3 A4 A6 (all item buttons), subway2st3 cameras |
| RC-SPAWN | Co-op spawn slots overlap a trigger that leads back to the previous map, so the 2nd+ player changes level again on arrival (endless ping-pong). | s4_park2_e1 slots 2/4 (208,-2215/-2179) inside trigger_multiple *4 -> chsw1ea -> s4_park_e1; caixa log: 40+ park/park2 loops with "1 player record read now, 1 kept". Also ending2/2b, fsewer1, subway2st1/subwaysick2 loops. | B (loops), V2 |
| RC-SOLO | Alone, the prologue lobby (cof_campaign_story4) never starts: game_counter sc3_ready_count (and sc4_final_count) wait for 2 players. Testers then typed `changelevel` into the ORIGINAL single-player maps (c_intro, c_start, c_nightmare), not the co-op s4_* maps. Those have no cof_coop_spawn1, so the host lands on info_player_start (decomp player.cpp EntSelectSpawnPoint): on c_start that spot is inside func_wall_toggle "block" #119 (the known revisit black box, fixed only in s4_start*). The renderer draws the world only from the eye's BSP leaf (decomp gl_renderer.cpp DrawBump: curvisframe = leaf->visframe), so an eye in solid shows models but no world. | All 4 solo logs: caixalogs rc4-20261018-153528 (cof_campaign_story4, paused, -> c_intro), caixalogs2/3 rc4-20261019-201341 (-> c_nightmare), oldjoahlogs rc4-20261019-145814 (cof_campaign_story4 -> c_start -> c_start2 -> c_apartment*). No solo log ever reached an s4_* map. | B1 B2 |
| RC-ADDON | Testers run RebuiltSimon 1.2.5 (cryoffear\addons\RebuiltSimonCoFManager.dll + fastrun.dll). All 7 CRASH lines are inside RebuiltSimonCoFManager.dll; its HUD shows speeds up to ~500. Not ours; Katz: only warn. | 6 dumps (module lists), rc4 CRASH lines | G5 |

## Requirements

No item was run in the game: the game cannot start from the build shell ("Failed to initialize authentication interface").

| ID | Status | Files / evidence | Validation |
|---|---|---|---|
| A1 rope | FIXED-AWAITING-RUNTIME (partial) | RC-2048: ropebutton #268 sf 2209 now exists; touch area is the map's own, not enlarged | world-runtime deathmatch_open/close; test-world RC-2048 fixture |
| A2 skip | FIXED-AWAITING-RUNTIME | game_counter scenes, cameras without a manager, prologue (kunitei2); SPACE or E | coop-runtime skip_*, prologue_skip_*; test-world |
| A3 saw on Sawer | FIXED-AWAITING-RUNTIME | RC-2048 (s4_sewer3 #876 sf 2209) | test-world RC-2048 |
| A4 lighter (shotgun map) | FIXED-AWAITING-RUNTIME | RC-2048 (s4_sewer2 #212/#434) | test-world RC-2048 |
| A5 Sawer first encounter / M4 | OPEN | no cause found in logs/videos; unchanged |  |
| A6 progression items all maps | FIXED-AWAITING-RUNTIME | RC-2048 covers 86 item buttons on 15 base maps; sounds/state are the game's own | test-world |
| A7 puzzle codes | KEEP | shared keypad (v0.4); not changed | existing fixtures |
| A8 extras-room door locked | DONE (map) | s4_start* unlockablesdoor lockedby sc5_extras_later | tests/v05 extras test; map build claude-s25-maps-001 |
| B1 solo play | FIXED-AWAITING-RUNTIME | RC-SOLO: party_counters_frame; coop_version_redirect (c_X -> s4_X) | test-world prologue counters; test-session redirect |
| B2 black box after changelevel | FIXED-AWAITING-RUNTIME | s4_start slot 2 inside func_wall_toggle block #119 -> moved to 639 -3001 -728 | tests/v05 black box test; boxscan of all maps = 0 |
| B3 c_bridge carriage | OPEN | not reproduced from the evidence; unchanged |  |
| B4 one-way teleports bring partners | FIXED-AWAITING-RUNTIME (partial) | find_landing wider rings (0..240, 16 directions); v0.4 scene follow kept | test-world |
| B5 apartment exits strand party | OPEN | exits not identified in the evidence; park exit loops fixed (RC-SPAWN) |  |
| B6 leaving in ending house | OPEN | not reproduced; unchanged |  |
| B7 teleport doors one at a time | FIXED-AWAITING-RUNTIME | door panel wait 2.5 -> 0.5 s (109 maps) | tests/v05 |
| B8 fall death kills others | FIXED-AWAITING-RUNTIME | 8 cof_killplayer zones -> trigger_hurt 1000; fall_frame moves body to partner | tests/v05; test-world fall fixture |
| C1 Doctor targeting | FIXED-AWAITING-RUNTIME (partial) | doctor weapon choice shared and saved (m_iDoctorWeapon 0x5b0); targeting/killable not changed | test-story, test-checkpoint |
| C2 ch8 strangle player | FIXED-AWAITING-RUNTIME | strangle_activator: last valve user | test-world |
| C3 endings / wheelchair | FIXED-AWAITING-RUNTIME | cof_wheelchairmode fan-out, wheelchairs 48 u apart | test-pp |
| C4 intro logos for everyone | FIXED-AWAITING-RUNTIME | cof_logo MSG_ONE to first player -> every player on the opening | test-story |
| C5 house camera only for trigger player | FIXED-AWAITING-RUNTIME | cof_lookat only for the last toucher | test-pp |
| C6 end stats | FIXED-AWAITING-RUNTIME | stats message byte 10 (IsMultiplayer) -> 0 | test-world credits byte |
| C7 rowing text | FIXED-AWAITING-RUNTIME | two short lines | code |
| D1 difficulty from save | FIXED-AWAITING-RUNTIME | Checkpoint.difficulty; load uses it | test-checkpoint schema 8; test-session |
| D2 host options persisted | FIXED-AWAITING-RUNTIME | SessionOptions saved (schema 8), set by the lobby setup | test-checkpoint; test-session setup |
| D3 weapons/dual wield | FIXED-AWAITING-RUNTIME | equip_want retries; dual_rebuild | test-checkpoint-runtime, test-story |
| D4 keybinds / inventory display | FIXED-AWAITING-RUNTIME | QSlotUpdate after a load | test-story |
| D5 quick dual wield | FIXED-AWAITING-RUNTIME | quick_dual_command (m_sQuickSel 0x204C..) | test-story |
| D6 morphine trip | FIXED-AWAITING-RUNTIME | morphine_frame per player | test-world |
| D7 limping | FIXED-AWAITING-RUNTIME | limp_frame (physics key "low") | test-world |
| D8 nightmare + stamina | FIXED-AWAITING-RUNTIME | unlock bit 0x20; nightmare_frame | test-world |
| D9 Simon hands | FIXED-AWAITING-RUNTIME | client.dll police hands/sleeve textures skipped (2 in-memory sites) | test-session; byte check on this PC's client.dll |
| E1 join dialog | FIXED-AWAITING-RUNTIME | Join button -> chat-line prompt IP then port (27015 after 15 s); Katz chose in-game text over new windows | test-session |
| E2 host setup dialog | FIXED-AWAITING-RUNTIME (friendly fire: BLOCKED by game code, left alone per Katz) | lobby HUD setup: players 2-4, collision, chapter starts 0-7 | test-session |
| E3 settings saved/enforced | FIXED-AWAITING-RUNTIME | maxplayers from options; collision off = SOLID_NOT during other moves + packets; capacity 2 allows solo | test-session |
| F1 objectives on B | FIXED-AWAITING-RUNTIME | objective_share | test-world |
| F2 blood/shooting effects | NO DEFECT FOUND | server broadcasts decals (UTIL_CustomDecal MSG_BROADCAST) and blood (MSG_PVS/MSG_ALL) | decomp combat.cpp, util.cpp |
| F3 rain | FIXED-AWAITING-RUNTIME | named rain_modify ignored in multiplayer -> fan-out writes every player's rain fields | test-pp |
| F4 extra ammo 2x2 | FIXED-AWAITING-RUNTIME | 455 copies placed in squares | tests/v05 |
| G1 "not installed" | FIXED-AWAITING-RUNTIME | find-cof prefers appmanifest library; mismatch = warning | manual script runs |
| G2 installer fresh install | FIXED-AWAITING-RUNTIME | Install.cmd naming, add-on warning; fresh install not run | tests/v03 |
| G3 direct launcher | KEEP (v0.4) |  |  |
| G4 separate updater | DONE (manual runs) | update-coop.ps1; current/newer/offline checked | manual |
| G5 crash dumps | ANALYSED: RC-ADDON | all CRASH lines in RebuiltSimonCoFManager.dll; warning added | logs + dumps |
