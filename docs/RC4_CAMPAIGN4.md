# Full co-op campaign (coop-fixes-004) — 2026-10-11

Update to coop-fixes-003, the build you tested. Your report confirmed the title
train now works; nothing here changes it. Nothing new in this build has been
seen in a real game yet.

## Your report → cause → change

| Your report | Cause found (read from the game's own code) | Change |
|---|---|---|
| Cutscenes still show a light, "maybe a post-process texture" | It is the **client spotlight**: a projected `gfx/flashlight.tga` pass drawn from the current view. There are three (phone, Glock light, flashlight). Each draws only while the server's `FlashFlags` bit is on **and** the client thinks it is not looking through a camera. The old fix only turned off the flashlight; your log shows `light=0`, so the beam was the **phone's** light. | During a cutscene every spotlight bit is cleared (phone, Glock light, flashlight) and exactly those come back afterwards. The camera ("view entity") is re-sent to each client when the scene starts, every 0.5 s and after any HUD reset. |
| Rain in the prologue that works in co-op | The game's own rain is drawn around **each player's body**, which waits in the lobby during the prologue. The street shot is ~2,000 units away and the rooftop shots are higher than the rain starts, so almost no rain was ever visible. The prologue's heavy-rain switch is refused by the game in multiplayer. | Three server-side rain volumes (`env_rain`, the game's own entity) cover the street and rooftop shots; every client sees the same streaks. The constant rain now uses the prologue's authored heavy value (3000 drops). The train interior and title shots look at sky/backdrop and get no world rain. |
| Notes glow — apply to every note | Real notes get the pickup glow from their own code; some note props did not. | Every note-model prop without its own effect now glows, on every co-op map. |
| Apply doors, events, codes, everything to all maps | Only the first eight maps used the RC4 fixes. The other co-op maps still had native doors that move you inside a map (the kind that makes players invisible to each other), plus the apartment return gap. | **Every map is now part of the RC4 campaign** (194 maps, `s4_` names). See below. |

## The whole campaign (194 maps)

- Every RC2 map gets an `s4_` twin built from its exact RC2 map. Every exit
  stays inside the RC4 campaign, so the apartment returns, sewers, city, park,
  asylum, forest, lake and endings all run with the adapter's fixes (saves at any
  tape recorder, shared notes, cutscene handling, ladders, post effects, boat).
  Your installed RC2 maps are not touched.
- Doors that teleport you inside a map now use the relocation you already
  verified (fade → move → fade back), so both players stay visible:
  - **Plain doors** (with names only removed by scripts, missing sounds or
    narrow landings such as stairs or closets): 37 doors.
  - **Doors locked/unlocked by scripts** (`cof_interdooronoff`), **doors that
    start disabled** (`inter_door_disable`) and **"locked from the other side"**
    pairs: 32 doors. 18 keep their authored state as a shared switch that
    checkpoints save; 14 that the story locks and unlocks in sequence toggle
    exactly like the original door on each visit.
  - **Key doors** (staff key, back-door key, package, sewer key): 4 doors, plus
    the apartment key door. The native key use still works; after it unlocks,
    the shared relocation appears.
- In total 73 such doors are converted by this build and 6 more by the
  first-map stages; only one stays native (see below).
- Kept native on purpose:
  - Doors that lead to another map (70): one player triggers the level change
    for both, so nobody is left invisible.
  - Permanently locked scenery doors (22) and decor doors without a destination.
  - Doors whose exit swaps at runtime, and one door with no floor at its exit
    (`c_buscity` #100).

## Subtitles and objectives

The game looks up "the first player" for subtitles (85 subtitle changes in 15
maps) and objectives (24 in 19 maps), so in co-op only the host saw them. A
subtitle sent right after such a lookup is now copied to every player
(`STORYTEXT` in the log); texts meant for the acting player ("It's locked",
pickups) stay private. A new objective is handed to every player once
(`OBJECTIVE shared`). Model-camera cutscenes and music stops already reach all
players in the game's own code.

## Codes

Keypad codes are stored on each player. The game gives a new code to the
activating player or to the first player only, and checks each player's own
copy. A shared code note could therefore show digits the other player's keypad
refuses, and the code was lost on a map change. The adapter now keeps **one
session code** for everyone (`KEYPAD shared code=…` in the log). Saves carry it
(checkpoint schema 3; older saves still load).

## Still open

- **Ladder hitches** on P2 come from the host's server-frame stalls (both games
  on one PC). They are only measured, not fixed.
- **Code drawn right of the page** after a map change is still open.
- **Locked converted doors are silent:** they don't show the original
  "It's locked" text.
- **Four players** has not been tested.
