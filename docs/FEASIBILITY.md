# Feasibility and architecture

Reuse native Cry of Fear multiplayer with map/config compatibility changes.
Actual BSPs and installed FGD are accessible; no symptom root cause or two-player
fix is verified. Source/binary changes are not justified.

## Verified SDK interfaces

FGD: D:\CryOfFear_SDK_1.3\FGD\cry_of_fear.fgd, copied into workspace work/ only.
- Lines 4552–4585: cof_coop_spawn1–4, character-specific spawn areas, bounds
  +/-16 X/Y and +/-36 Z, default iuser1=0 enabled. Native maps omit this default key.
- Lines 4597–4608: cof_spawnpointonoff selects a named spawn point, enables/disables
  it, and exposes flag 1 to teleport players. A native interface for later shared
  same-map tests; exact target selection and multiplayer effects need observation.
- Lines 4640–4649: cof_customiseplayer supports player-slot models and sleeve,
  fingers/gloves fields, default models police1–4. Native entry map has none;
  this is not a proven initialization requirement or visibility fix.
- Lines 4309+, 4350+, 4364+, 4406: brush inter_door, co-op changelevel brush door,
  point-model inter_door_coop and ordinary exit. Point/brush classes cannot be
  safely interchanged by merely replacing their classnames.
- Lines 1901+ / 3851+: all-player-nearby button and cooperative changelevel field.
- Lines 5347–5351: cof_teleport destination and optional named entity; blank means
  player. How that operates with two clients is still unverified.
- Line 5727: info_simon_spawnpoint is associated with Book Simon, not an ordinary
  co-op player spawn; it is not a missing player-respawn requirement.

SDK copyright restricts assets to Cry of Fear content creation. Original resources
are outside Git and aren't redistributed. No leaked source or injected code is used.

## Implementation decisions

Nine actual maps parse as classic BSP30. Structural fields follow
[Valve's SDK header](https://github.com/ValveSoftware/halflife/blob/master/utils/common/bspfile.h);
literal backslashes follow its
[token reader](https://github.com/ValveSoftware/halflife/blob/master/utils/common/scriplib.c).
No Valve code is copied. Unsupported formats/ranges/overlaps fail closed. Reports
retain ordered duplicate pairs, raw text and hashes. Named matches/target analysis
are heuristic, not confirmed logical equivalence.

The selected smallest experiment appends four documented native spawn slots to
c_start2, preserving all original entities and non-entity bytes. Static hull and
conventional spawn-bound checks narrow positions without simulating CoF gameplay.
Exact source SHA prevents application to another map. It is deterministic and
doesn't overwrite Steam. c_start's 1024 entities and extensive scripts make
c_start2 a more controlled test section, not a replacement story beginning.
Node is verified available; Python aliases failed. No dependency downloads required.

## Runtime limits

The complete snapshot has independent copied assets and critical/config hashes.
Its HLDS probe initialized console but warned about fonts.wad and produced no
map evidence before termination. Steam client/listen-server launch, authentication,
two clients, visibility and restored controls remain unverified. Don't fabricate
assets or bypass Steam. Investigate the supported authenticated client route next.
