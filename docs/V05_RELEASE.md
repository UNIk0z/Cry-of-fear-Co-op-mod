# Cry of Fear co-op v0.5 (2026-10-23)

Built on the working Claude v0.4 (commit 13a7390, tag `v0.4-claude-baseline`).
Codex v0.4.1 was read as evidence only. Branch `claude/v0.5`.

**Nothing in this release was run in the game.** The game could not be started
from the build shell ("Failed to initialize authentication interface"), so
every item below is checked by code, by the 14 native fixture suites and the
Node tests, and by scans of all 194 maps. Each status says which.
docs/V05_TEST.md is the manual test run (solo, two players, four players).

## Root causes found

| ID | Cause | Fix |
|---|---|---|
| RC-2048 | The engine frees every map entity with spawnflags 2048 while `deathmatch` is set (co-op runs with it). Cry of Fear uses 2048 on the buttons that items unlock (rope, lighter, saw, spade, screwdriver, fuse, scissors...): 86 item locks on 15 base maps never existed in co-op. | `deathmatch` is held at 0 only while the world's entities load, so those buttons exist; game rules stay multiplayer. |
| RC-SPAWN | Co-op start spots inside exit triggers (park: endless level-change loop) or inside solid walls (s4_start: the second player's black box, func_wall_toggle "block"). | The v0.5 map pass moves those spots to free floor reachable from the first spot. A scan of all maps now finds none. |
| RC-SOLO | Alone, the prologue waits for two players; testers then typed `changelevel` into the original single-player maps (c_start, c_intro, c_nightmare), which have no co-op spots: black box and an invisible world (the eye starts inside a wall). | The prologue counts follow the number of players; a single-player story map in a co-op game switches to its co-op version at once. |
| RC-ADDON | Every crash report in the playtest logs is inside RebuiltSimon (cryoffear\addons). Not part of the game or this mod. | Install and launch name the add-on and say to move it out for co-op. Nothing is moved. |

## Changes

| Area | Change | Status |
|---|---|---|
| Items, puzzles | Item locks exist (RC-2048): rope, lighter (shotgun map), saw on Sawer, spade, screwdriver, fuse, scissors... | Code + fixture; not run in game |
| Skip | SPACE or E votes; game_counter scenes and the prologue can be skipped | Fixture |
| Extras room door (first map) | Locked ("It's locked.") | Map pass + test |
| Solo | Prologue counts = players; typed c_* maps go to their co-op map | Fixture |
| Start spots | Out of exits and walls (park loop, s4_start black box) | Map scan |
| Teleports | Partners land on wider rings around the target | Fixture |
| Doors | Co-op door panels let the next player through after 0.5 s (was 2.5 s) | Map pass |
| Falls | A fall zone kills only who falls; the body is moved beside a living partner for revival | Map pass + fixture |
| Doctor | His weapon choice survives level changes and saves | Fixture |
| Strangle (chapter 8) | Hits the player who turned the last valve | Fixture |
| Wheelchair ending | Every player gets a wheelchair, set side by side | Fixture |
| Intro logos | Every player sees them (they went to the first player only) | Fixture |
| House camera | Only for the player who walked in | Fixture |
| Stats | End stats show (the stats message was told "multiplayer") | Fixture |
| Boat text | Shorter, two lines | Code |
| Saves | Difficulty, setup, objective, doctor choice, dual wield saved (save format 8; older saves load) | Fixture |
| Weapons | Equipped weapon and dual wield come back after level changes and loads | Fixture |
| Quick keys | Two quick-slot keys pressed together dual wield; restored quick keys show in the inventory | Fixture |
| Effects | Morphine trip and limping per player; nightmare unlocked with its stamina rule | Fixture |
| Hands | Simon's own first-person hands (co-op swapped in police textures) | Byte check on this PC's client.dll |
| Objectives (B) | Shared with every player, kept across level changes and saves | Fixture |
| Rain and snow | Weather switched on by a trigger (21 map variants) reaches every player; the game skipped it in multiplayer | Fixture |
| Extra ammo | Copies for more players in a 2x2 square, not a line | Map pass |
| Host setup | In the lobby after New Game: 1 players (2-4), 2 collision, 3 start (prologue or chapter 1-7), E applies; saved with the game | Fixture |
| Join | The Join button asks for the IP, then the port (27015 after 15 s) | Fixture |
| Launcher | Uses Steam's own copy of the game; a different installed version is a warning, not "not installed" | Manual script run |
| Updater | "Check for Updates.cmd": GitHub releases, says COULD NOT CHECK on any failure, downloads only after asking, never installs | Manual runs: current, newer, offline |

## Not done or limited

- Friendly fire: left alone (Katz 2026-10-22). The game's own code refuses any
  damage from a player and bullets pass through players.
- Real dialog windows for Join and Host setup: not built; the in-game text and
  chat line are used instead (Katz's choice, 2026-10-22).
- Chapter 8 start: not offered (it depends on the ending).
- B3 (falling carriage), B5 (two apartment exits), B6 (leaving the ending house),
  A5 (Sawer's first encounter, M4): no cause found in the evidence; unchanged.
- A1: the rope now exists, but its touch area is the map's own (not enlarged).
- F2 blood and shot effects: the game already sends them to every player
  (decals broadcast, blood to everyone in view); no change.
- Collision off, the setup and the join prompt need a game run to confirm.
