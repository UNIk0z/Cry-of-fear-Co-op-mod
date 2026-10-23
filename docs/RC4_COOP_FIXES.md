# Co-op fixes candidate (coop-fixes-001) — 2026-10-10

Built on campaign-doors-001, the build you tested. Everything still working from
that test is preserved:

- E/Use doors, padlock and computer;
- notes and pickups;
- death/revival cutscene camera recovery;
- ready gate, opening and nightmare.

Nothing new here has been seen in a real game. Automated results are in
QA.json, the one test procedure is TESTING.md, and install/rollback is in
START_HERE.md.

## What changed and why

| Issue | Root cause (evidence) | Change | Status |
|---|---|---|---|
| Ladder: P1 stuck when P2 uses the same ladder | **Confirmed in native code.** `CCoFLadderManager::Use` (`1004FB50`) stores ONE climber at manager+0x114 with no "already busy" check. It freezes that player and switches their view to a climbing camera model. `LadderThink` (`1004ED40`) ends the climb on a timer and clears the player's camera, but never the slot. A second Use overwrites the slot, so the first climber is never released. | Adapter reserves each ladder while its climber is still on it: its two use brushes get a never-true "master", so nothing happens when anyone else presses E there. The original master returns when the climb ends, the climber disconnects or the map changes. Separate ladders are independent. Works on every converted map without rebuilding maps. | AWAITING GAMEPLAY VERIFICATION |
| P2 ladder lag / movement jitter | Not established. Native climbing moves no player each frame. The climb is a timer plus an animated camera model; its animation start (`1000F3E0`) looks like the standard sequence reset, which animates client-side, but that is not verified. The adapter changes no movement or prediction. | Evidence only: one `NET` line per client per map with rate, update rate, weapon prediction and lag compensation, plus the server caps. A `SERVER_FRAME` line if the host had frame gaps over 100 ms in the last minute. Optional A/B settings in TESTING. | DIAGNOSTICS |
| Save/restore without binding | **Your actual save** holds two distinct valid Steam IDs, so binding was never needed for it. The failed Continue session was not logged, so its exact failure point is unknown. | 1) Same-account/LAN IDs now resolve to `auto:host` and a single `auto:guest`; two or more unidentified guests are still refused, never guessed. 2) Restore matches by exact identity first, else host gets the owner record and the single unmatched guest the single unmatched record. 3) The launcher now always logs the host console from boot (`-condebug`). It also writes a one-shot Continue request that the adapter uses at the exact saved map, even if the old `+sc_checkpoint_prepare` command ran too early. | AWAITING GAMEPLAY VERIFICATION |
| Padlock code right of the page after a map change | Not established. The client keeps its journal widgets across map changes: the viewport is reused, and its teardown `100988F0` has no direct caller. The one-layout-per-connection rule matches the native client. Some extra layout packet must still reach the client. | Evidence only: a `CODE_LAYOUT` line for every code packet that re-runs the client layout (source native/replay, player, connection, slot, map), and for code notes that reach a client with zeroed metadata. | DIAGNOSTICS |
| Black box near the original spawn on revisit | **Confirmed.** `c_start` `func_wall_toggle` #119 `block` (brush `*33`, 63×66×166 units) stands on `info_player_start` #55. The wake cutscene's first action toggles it away. On revisits the wake is deliberately skipped, and the revisit restore replayed only five other hides. | The completed-wake restore now also toggles `block` once, on `s4_start`, `s4_start_e0` and `s4_start_e2`. Every other entity is unchanged. | AWAITING GAMEPLAY VERIFICATION |
| Title train invisible | **Three-way BSP comparison** (original `c_intro`, RC2 `cof_campaign_story2`, RC3, current): see below. The vehicles spawn and move on their path during the title shot, but your log shows the server never transmits them to either client (`packed=0` in every phase). | One extra transmission attempt for the four title brushes only, during camera views on the title map, after native `AddToFullPack` refused them. The two remaining refusal reasons (an entity flag and `groupinfo`) are cleared for that one call and restored immediately. The log now also records those fields. | AWAITING GAMEPLAY VERIFICATION |

## The train: what the three-way comparison shows

- **Original → RC2** (visible but overbright): the vehicle entities are
  identical. Only three cameras gained an unskippable flag.
- **RC2 → RC3**: this was the "lighting fix". The duplicate start of the intro
  timeline was removed and the timeline was gated behind the ready barrier.
  That stopped the double toggle of the headlight dynamic lights (#339/#340,
  attached to `skittag22`). But the train brushes kept `startspeed 300`, so they
  began moving at map load and finished their path during the lobby wait.
  This is why the train disappeared right after the lighting fix.
- **Later builds**: Codex set `startspeed 0`, so the train now waits and moves
  during the title window. Your log confirms the new timing (speed 300,
  positions advancing), yet the brushes are never sent to clients.
- **Current map**: the whole chain matches the original except that hold. This
  is now a regression test: models, path_track nodes, the timeline starts and
  the headlight lights.
- **Transmission**: native `AddToFullPack` (`10018870`) rejects an entity for
  `effects=NODRAW` (logged 0), no model (present), entity flag `0x4000000`, PVS
  (already overridden for these brushes) or a `groupinfo` mismatch. The retry
  covers the last two. If the train still doesn't appear, the new
  `VEHICLE_PACK`/`VEHICLE_STATE` lines show which value blocked it.

## Unchanged and still limited

- Saves still cover only the `c_start` aliases and recorders 419/421 (Storage
  Tunnel, Sewer Store), with two active players and four retained identities.
  The full world is not saved.
- Apartment return routes are not overlaid; the six other key doors stay native.
- Four players, every cinematic and late join are not verified.
