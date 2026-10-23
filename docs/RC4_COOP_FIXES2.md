# Co-op fixes 2 (coop-fixes-002) — 2026-10-10

Adapter and launcher update to coop-fixes-001, the build you tested. All eight
maps are byte-identical to coop-fixes-001. Your report confirmed these as
working, and nothing here changes them:

- auto progression, padlock and sounds;
- ladder lock;
- black-box removal;
- notes and events restored for P1.

Nothing new has been seen in a real game.

| Your report | Cause found | Change |
|---|---|---|
| P2 not restored; nobody's location restored | Your log: the restore tried to give inventory **card paths** (`inventoryitems/weapons/weapon_mobile.txt`) as items, and the game refused them ("NULL Ent in GiveNamedItem"). Then an equipped-weapon mismatch counted as a hard failure. That failure stopped all further restores (P2) and skipped the teleport to the checkpoint. | Weapon cards are skipped; they come with the weapon. Other cards, such as keys, are given through the game's own item path. Equipped weapon and inventory list are now "soft differences" (logged, not failures), because the game finishes weapon switching a moment later. The checkpoint landing is always applied. One player's problem no longer blocks other players; it only blocks saving, so the good save can't be overwritten. |
| Post-processing only on one player | The game's blur, camera zoom, grey fade and breathing effects apply only to the player who triggered them; black-and-white already applies to everyone. | On every converted map, those effects now apply to every connected player, with the original trigger timing. |
| Flashlight visible in cutscenes | The flashlight is a per-player on/off state. | Turned off silently while that player is in a cutscene, and back on afterwards (after revival if the player was down). |
| P1 duplicate "Hidden note #1" that can't be opened | The game re-sent a shared note into a different journal slot. | That duplicate row is no longer sent. The code note sat in that slot, so this may also be what pushed the code to the right; it's not confirmed. |
| P2 ladder lag and movement jitter | Your log: the server capped P2 at 30 updates per second although P2 asked for 100. Also, my ladder lock registered the same ladders 192 times on a 3-ladder map, adding server work every frame. | The host now allows up to 100 updates per second, and ladders are registered once. P2 should keep `cl_updaterate 100; cl_cmdrate 100; rate 100000` (typed once in P2's console; the game remembers it). |
| Code drawn to the right after a map change | Not confirmed. The first session's log was overwritten when the game was relaunched. | The launcher now keeps every previous host log in `cryoffear\storycoop_logs`. The `CODE_LAYOUT` lines will show the cause next time. |
| No train | Unchanged: still diagnostic. The intro wasn't in the logged session. | The archived log will contain the `VEHICLE_PACK` lines from the retry. |
| Host crashed when the build wasn't installed | The adapter file was missing. | `Host RC4.cmd` now says "Run install.cmd first" instead of starting a broken game. |

Not done yet: the red pickup glow on shared notes, the apartment return
routes, the six other key doors, and four-player testing.
