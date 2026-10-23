# Verified map comparison — 2026-10-08

All eight actual Steam BSPs parse as classic version 30. Current exports/reports:
workspace work/map-reports/baseline-002/. Original hashes are recorded in
work/map-samples-001/staging-manifest.json. No gameplay root cause is established.

| Map | Entities | Player starts | Numbered co-op spawns | Changelevel type/count | cof_teleport | Cameras |
|---|---:|---:|---:|---|---:|---:|
| c_start | 1024 | 2 | 0 | story / 4 | 6 | 25 |
| c_start2 | 443 | 1 | 0 | story / 1 | 0 | 0 |
| c_village2 | 321 | 2 | 0 | story / 2 | 2 | 0 |
| c_cof_village2 | 396 | 1 | 4 | co-op / 1 | 0 | 0 |
| c_city | 759 | 1 | 0 | story / 4 | 5 | 4 |
| c_cof_city | 451 | 1 | 4 | co-op / 1 | 0 | 0 |
| c_bridge | 386 | 1 | 0 | story / 2 | 2 | 2 |
| c_cof_bridge | 230 | 1 | 4 | co-op / 1 | 0 | 1 |

Player start = info_player_start; story gate = trigger_changelevel; co-op gate =
trigger_coop_changelevel. Native spawn slots are cof_coop_spawn1–4, one each.
All co-op references retain an ordinary player start and have info_simon_spawnpoint
entities (7 village / 4 city / 3 bridge); the latter's role is not verified.
None has info_player_deathmatch. Spawn behavior still requires SDK/runtime evidence.

## Native progression (zero-based entity indices)

- Village 257/258: trigger_coop_changelevel named coopchangelevel and
  inter_door_coop_changelevel targeting it, with message c_cof_village1.
- City 377/378: same gate/door pattern, message cof_campaign_01_p4. Its campaign
  token differs from a BSP filename; semantics require SDK/runtime confirmation.
- Bridge 173/174/210: gate coopchangelevel; func_coopallplayersbutton with message
  coopchangelevel and target multitrain; cof_changelevel with message
  cof_campaign_01_p3. A native trigger_camera remains: don't remove all cinematics.

All 14 non-entity hashes differ in every map pair. Unchanged entity multiset sizes:
179 village, 315 city, 0 bridge. Shared content does not make these equivalent map
containers. Don't copy brush indices or whole entity lumps between variants.
Native maps retain ordinary inter_door entities (7 village / 4 city / 2 bridge).
Later targeted inspection found no inter_door_exit or matching target destinations
for those remaining ordinary doors in the three native references. Presence alone
does not prove active same-map story relocation support; see TRANSITION_VISIBILITY.

## Controlled starting section

c_start has 1024 entities and extensive cameras/teleports. c_start2 has 443,
no camera/cof_teleport and one spawn at 2428 -883 -728, angles 0 90 0. It is a
smaller spawn test section, not a replacement for the actual campaign beginning.

c_start2's return chain:
- 19: inter_door model *5 targets lolexit2.
- 16: inter_door_exit lolexit2 at 2424 -940 -767.
- 15: trigger_multiple *3 targets haehecl.
- 17: trigger_changelevel haehecl, landmark hahaland, map c_start.
- 18: matching info_landmark hahaland.

The door exit is near the trigger driving the cross-BSP transition. Fixing only
the visible door can miss the second stage. Whether inter_door teleports a single
player or changes rendering is unproven until SDK/runtime observation.
c_start2 env_customize 336/337 target followme, a named story object. The inspected
c_start/city customize target keys also refer to scripted actors/objects, not an
explicit generic player. This doesn't establish an engine visibility cause.

Additional native entry cof_campaign_01: 348 entities; native slots at indices
249–252, info_player_start 313 and co-op gate 289. No cof_customiseplayer exists.
SDK confirms the numbered spawns' roles and bounds; info_simon_spawnpoint is a
Book Simon spawn, not an ordinary player respawn. The FGD describes message on
inter_door_coop_changelevel/cof_changelevel as the destination map; actual
cof_campaign_01_p3/p4 BSP files exist. They are map names, resolving the earlier
concern about needing a separate campaign-token resolver.

Shipped maps sometimes repeat identical classname/worldspawn pairs. The reader
now classifies these correctly while retaining original pairs and warnings.
c_start worldspawn also has unusual bytes in its WAD value; nothing is normalized.
