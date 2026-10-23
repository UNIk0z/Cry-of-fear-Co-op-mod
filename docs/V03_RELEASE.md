# Cry of Fear co-op v0.3 (2026-10-16)

v0.2 with a new adapter. The maps are byte-identical to v0.2. The build passed
and the automated tests passed (14 native fixture suites, Node tests). **None
of this has been played yet.** Every runtime result below is untested until the
steps in TESTING.md (docs/V03_TEST.md) are run.

Sources used: the adapter, the served maps, the user's 15:17 v0.2 console log
(this PC joined as player 2, so the host's own adapter log was not available),
and the read-only decompilation. The wiki (cry-of-fear.fandom.com) was read after the user passed its bot check (earlier: HTTP 402 and a bot check, which was not bypassed). The coverage
record (docs/V03_COVERAGE.md) is therefore built from the maps alone, plus an
audit of every first-player lookup in the decomp. The native co-op maps have
no Drowned; their designers replaced her.

| Report | Root cause | Change | Status |
|---|---|---|---|
| "Cannot overwrite savefile" at recorders | That text is our own "the save file could not be written". The basement tape card is `inventoryitems/Videotape.txt`, and it is the only mixed-case card in all 81 original maps. Our checkpoint check only allowed lowercase card names, so every save failed while anyone carried the tape. | Inventory cards may contain A-Z (`checkpoint.cpp` `card()`). Weapon names stay lowercase. The save is still atomic: a failed write keeps the previous file. | implemented, automated passed |
| Rope placed but contradictory (still in inventory, rope invisible, pickup back, use refused, locked climb) | Every visit to a map loaded the BSP fresh. Only env_global latches, taken pickups and key doors (on load only) carried over. The balcony climb lock is a **toggle**: the bath trigger_once (*70 → multibadkars2 → ropelock) and the rope (ropebutton → multiunlockedrope → ropelock) each flip `sc4_cd_142_gate`, as `cof_interdooronoff` does in single player. A fresh revisit re-armed the bath trigger, the rope pickup and ropebutton and hid the rope model, so the toggles and the inventory no longer matched. | Map state (below). After the rope is placed, a revisit keeps the rope model, the removed ropebutton and pickup, the fired bath trigger and the gate as they were. | implemented, automated passed, runtime untested |
| Videotape lost; items, enemies and triggers come back on revisit | The same fresh load. A save after the tape could not be written, so loading an older save lost the tape. | Map state, plus the save fix above. | implemented, automated passed, runtime untested |
| Drowned (monster_crazybitch) always attacks player 1 | `CCrazyBitch::MonsterThink` (hl 10055860) checks the player in `m_hEnemy`, then starts the attack on `CBaseEntity::Instance(INDEXENT(1))`, which is always player 1. | Only while a monster_crazybitch runs its own think, `INDEXENT(1)` (the game's PEntityOfEntIndex call) answers with her enemy if it is a live player. Everything else is unchanged. The victim's own gun counts the victim's own buttons, so the victim resists and the partner keeps control. Killed/StopSuicide clean up natively. Log: `DROWNED monster N attack victim player=P`. | implemented, automated passed, runtime untested |
| Tape, a new weapon and health lost at the next door after a save (user host log rc4-20261016-141912: inventory 5 → "REJOIN player=1 left; kept the state they carried in (weapons=3)" → health 74 again) | The clients drop and reconnect at every level change while frozen. Our rejoin code then could not read the player and fell back to the **last save's** record. | It now keeps the player's own state (frozen allowed), else the record the level-change carry just read, and only then the save's record. The log line names which one. | implemented, automated passed, runtime untested |
| Player-1-only game code across the campaign (user: codes, cutscenes, teleports, hand-outs in later chapters) | 71 decomp sites take "the first player"; 28 entity types are in the campaign (docs/V03_COVERAGE.md). | Item locks (66 maps): the message, sound and activator go to the user. Asylumb bar puzzle: releases the solver. Roof boss: fights its enemy. Look-at and wheelchair stop: fanned out to every player. The phone break is deliberately not fanned out (only one replacement battery exists). The strangle scene, the ending4b boss and particle effects are documented risks, not changed. | implemented, automated passed, runtime untested |
| Wiki puzzle list: the asylum number plate and the forest scissors are two halves to combine in one inventory | Each half is a single pickup. If each player takes one, nobody can combine them, and progress stops. | A half moves to the player who holds its partner, through the game's own give/clear by card path. Pairs come from inventoryitems "combined_with". The move never happens into a full inventory. Both players are told. Log: `COMBINE`. | implemented, build passed, runtime untested |
| Adapter log stopped after the main menu | Not a bug. In that run this PC joined another host, so its local menu server shut down. | none | - |

## Map state (native/rc4/state-runtime.hpp)

Single player keeps a saved copy of every level it leaves. Co-op ChangeLevel
reloads the BSP. v0.3 keeps the same copy with the game's own per-entity save
code (DispatchSave/DispatchRestore, API slots 7/8, the SDK SAVERESTOREDATA):

- **When a campaign map ends**, every entity is saved into a buffer for its
  source map (the alias without `_eN`).
- **On the next visit**, before ServerActivate (where a single-player level
  load restores), each saved entity is read back onto the entity with the same
  identity in the fresh map. Identity is classname, targetname, model and
  spawn origin from the BSP, plus an ordinal. Entities created while the map
  loads are matched by creation order. Monsters created during play
  (monstermakers) are recreated.
- **Gone stays gone.** Taken pickups, dead monsters (the game's save skips
  them, as in single player), fired once-triggers and killtargets are removed
  again with the native killtarget flags.
- **Kept as served** (never restored or removed): player starts, landmarks,
  level-change entities, every trigger that fires a `cof_changelevel` (every
  exit keeps working) and movewith parents and children.
- **Saves:** a save also writes `storycoop_saves/slotN.cofmap`, tied to its
  checkpoint by CRC. If the checkpoint commit fails, the previous pair (`.bak`)
  still matches. Loading a save replaces the kept timeline with that file, or
  with nothing for an older save. A new campaign starts empty. A game over
  does not keep the dying map's state.
- **Kill switch:** create the file `cryoffear/storycoop_mapstate.off`.
- **Log lines:** `MAPSTATE kept / gone on / restored / first visit / slotN
  written / slotN loaded`.

**Old saves (v0.2 and earlier):** they load as before (taken pickups, key doors
and latches only). A narrow migration applies: a taken key item that no saved
player holds stays in place while a lock in that map still needs it. A v0.2
save made after the rope was placed would otherwise strand the players (rope
used, ropebutton back). This gives the players the rope to place again. It
creates no extra item: the rope is not in any inventory.

**Limits:**
- Movewith groups (275 entities) and level-transition entities keep the
  served state.
- Entities that exist only in one entry alias are not matched.
- A monster frozen by a scene camera at the moment the map ends is not saved,
  so it comes back as served.
- Restoring onto an already-spawned entity is how the engine restores over a
  global entity, but it has not been run in this game yet.

Unchanged and kept: Steam names, the train fix, the Glock for every player,
door music, elevators/scene teleports, the P2 ladder lock, inventory carry and
host-only saving.

Version text: "Co-op mod v0.3 developed by Anas Sammak (koolkat)".
