# Cry of Fear wiki reference for the co-op story campaign

**Source:** the Cry of Fear Fandom wiki, https://cry-of-fear.fandom.com, read
on 2026-10-16 through its API after the user passed the bot check in the
Browser pane. The text is a paraphrase. The wiki content is CC-BY-SA.

**Do not confuse:** cryoffear.fandom.com (no hyphens) is an unrelated wiki.

**Pages read:**
- Cry of Fear (chapters)
- Puzzles, Items, Notes
- Nightmare Sequences
- Co-op Campaign
- Bugs and Glitches
- Unlockables
- Locations: Apartments, Roped Off Apartment, Sewers, City, Forest, Asylum,
  Subways, Harbor College, Lake, Kirkville, Waspet Gardens, Saxon Avenue,
  Gustav-Dahl Park, TL Trading AB, Simon's House, Town Square
- Characters: Unknown Caller, Doctor Purnell, Book Simon, Sick Simon
- Bosses and enemies: Sawer, Carcass, Mace, Drowned
- Equipment: Mobile Phone, Tape Recorder

**To re-read a page:** open the wiki in the Browser pane. If a bot check
appears, the user passes it. Then fetch
`/api.php?action=parse&prop=wikitext&format=json&page=<title>`. The full
list of 160 titles comes from `action=query&list=allpages&aplimit=500`.

The wiki is a coverage guide. It is never proof of what the served maps do:
check every claim in the maps (`scripts/audit-v03.mjs`) and the decomp.
"Co-op note" lines are ours.

## Game rules that matter for co-op

- **Inventory:** 6 slots (3 pocket, 3 bag). Keys, cards and fuses take slots.
  - A used key disappears.
  - Items can be combined; this is how the plate and the scissors are built.
  - Co-op note: the game's own co-op mode has **no** combining, dual wield,
    unlocks or tape saving. Our story co-op keeps all of them, so every
    two-part item needs the handover in `half_frame`.
- **Saves:** tape recorders only; no autosave. Nightmare difficulty needs a
  cassette (5 uses, takes a slot).
- **Phone:** works as a light, gets SMS and calls, and later makes calls with
  Z.
  - Its battery dies in the subway tunnels. **One** replacement battery
    lies by the Doctor's locked gate.
  - The phone is lost later in the story.
- **Native co-op behaviour (reference only):**
  - revive by CPR (E on the body) or by syringe;
  - a game over restarts the map from the last level change;
  - no saving.
- **Train crash (chapter 5 → 6):** Simon loses his bag and pocket items. The
  forest bunker room gives back unlock items.

## Chapters and what each needs (story order)

| Chapter | Places (map families) | Puzzles, items, choices | Co-op notes |
|---|---|---|---|
| Prologue / Prelude | train, street, Simon's room (camera nightmare) | camera flash on X marks | passive opening (not saved) |
| 1 Lost in a City | alley, town square, café, apartments, sick apartments | padlock code from the café computer (random user/password, 1 of 16 each); apartments maze; landlord office weapon; 4th floor body; basement key in the water; **videotape** in the basement → TV in the Predator's 2nd-floor flat → random elevator code (last digit always 9); Sawer boss (eye on his back) | padlock owner context; tape card name has a capital V (fixed v0.3); keypad code shared; apartments revisited later (map state) |
| 2 Who is that Doctor? | sewers (city), caves, maintenance | magazine phone number → call (Z) → code **5247** (fixed); sewer note 279X (last digit random); **lighter** on the oil trail burns the rope → key; shotgun; Mace (turn valves to electrify the water, stand on dry ground; the number of generators depends on difficulty) → **saw** → cut the key out of Mace; "You Will Die" nightmare | the code is written to player 1 → shared keypad; item locks (lighter, saw) now credit the user |
| 3 The City is not Safe | city, Ronald Street, alleys (first Sawrunner), park, Waspet Gardens, roofs | Gustav-Dahl park statues (fixed solution: Eagle → ↑, Owl ↓, Horse ↑ ←, Lion ← ←) → shed key + hunting rifle; Sophie on the roof; **Carcass fight is optional: killing it is an ending condition** | ending flags are saved (checkpoint schema 4) |
| 4 Drowned in Sorrow | Sophie's keycard → TL Trading → subway, Harbor College (**screwdriver** → fuse box → **fuse**, lights out, Faceless), Saxon Avenue, service tunnels (timed doors, train vs Human Flower), dead phone → flares, Doctor's gate (needs **2 fuses**; phone **battery** + Ronald Street key there), backtrack: Ronald Street sewers → apartments (**ladder** item in, ladder out) → roped-off apartment nightmare → fuse 2; sledgehammer wall → "..." nightmare, door order Car → Wheelchair → Pistol → Book, Hangmen maze | the heaviest backtracking in the game: fuses are used, then fetched again (map state); one battery only (phone break not fanned out); ladders are item locks |
| 5 Leaving this for Good | train ride, crash | **loses the bag and pocket items** | cof_clearitems: make sure every player loses them (story fan-out / rejoin fan-out) |
| 6 It's not Over Yet | forest (branch + lantern), bunker (unlock room), doorknob before Sawrunner, **scissors halves** → cut the rope → TV drops, tree maze, forest door nightmare; asylum: generator rods (AB, BC, CD, DE), **Ruger P345 in the bowling alley: give it to the Doctor or not (ending condition)**, Doctor shoots Simon in the shoulder (permanent health cap), staff key → **number plate halves** (3 random phone numbers) → phone room → telescope → random attic code; Doctor boss in the attic | scissors and plate handover (v0.3 `half_frame`); doctor weapon choice is stored on player 1 and read from player 1 (consistent); health cap saved (schema 4) |
| 7 Only Safe at Home | lake (boat), forest sewers (long swim, key), Kirkville, Simon's house | the ending plays in Simon's room. Package → post box near Harbor College → ending 5 | boat: partners join the rower at the dock (existing) |
| 8 / endings | ending 4: real Simon in a wheelchair vs Book Simon (Glock, shotgun, MP9, sledgehammer); endings 1-3: Sick Simon, 4 Faceless waves, each dropping one **valve**, 4 valves in the corners → bars rise → strangle | **risk:** cof_strangle, monster_booksimon and the wheelchair target player 1 (documented, needs an endings playtest) |

**Ending conditions (wiki):**
- Ending 4 ("good"): Carcass killed **and** the gun given to the Doctor.
- Endings 1-3: otherwise.
- Ending 5: the package mailed (it unlocks after ending 4).

## Known single-player bugs worth knowing for co-op

- You can leave the 4th-floor apartment without the basement key if your
  inventory is full. That breaks progress; in co-op the key goes to the
  first player with a free slot.
- Using the last syringe and opening the inventory before the animation ends
  crashes the game.
- At a Harbor College map change, a dual-wielded pistol plus phone drops back
  to the phone only.
- 1.1 fixed a "num_edicts crash in the sewers". Map state recreates
  play-time monsters only, so the edict count stays close to single player.

## Enemy notes

- **Drowned:** the gun attack needs at least one bullet in the equipped
  weapon (melee only: no effect). The victim breaks free by clicking quickly.
  She can attack across door-separated parts of the same map. A baby with a
  knife attacks up close.
  - Native co-op maps replace her with other enemies.
  - Our v0.3 victim is her live player enemy.
- **Sawer:** a chainsaw hit is instant death; only the eye on his back takes
  damage while he kneels.
- **Mace:** immune to weapons; killed only by the electrified water.
- **Carcass:** optional; fleeing through the window is the other choice.
