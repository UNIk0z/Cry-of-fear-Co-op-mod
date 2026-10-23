# Co-op fixes 3 (coop-fixes-003) — 2026-10-10

Update to coop-fixes-002, the build you tested. Your report confirmed these,
and nothing here changes them:
- two-player save and restore;
- P2 jitter fix;
- ladder lock;
- padlock;
- black-box removal.

Only the opening map (`cof_campaign_story4`) changes; the other seven maps are
byte-identical. Nothing new has been seen in a real game.

| Your report | Cause found | Change |
|---|---|---|
| After Continue, the recorder only says its first-time line and does not save | `CTapeRecorder::TapeUse` (1007C987) shows the "Huh? What's this doing here?" line while the player's "has seen a recorder" flag (player+0x21D8) is 0, sets it and returns without saving. A fresh map starts with 0, and the checkpoint did not carry it. | Restored players are marked as having seen a recorder (a checkpoint only exists because one was used). |
| No train in the opening | Original intro: the trains have start speed 300, so they move at map load; the intro's first step **toggles** them (= stops them at the station), and `multiintro1` toggles them again 10 s into its shot (pass sound at +19 s, headlights +10…+26 s). An earlier build set start speed 0 so they would not leave during the lobby, but kept the first toggle, which now **starts** them; they reach the end of the line during the title and sit there when their shot comes. | The first toggle is removed (entity 489, only the two train keys). The trains wait at the station and leave at the original moment. The bridge train is now also in the vehicle log. |
| Flashlight still visible in cutscenes (screenshots) | Your screenshots show the phone's beam and the phone itself in camera shots. The light and the held item are drawn from the player's view model, which the old fix did not touch, and it only turned the flashlight off once. | During a cutscene, each player's flashlight **and** held item (view model) are held off every frame; both come back afterwards (after revival for a downed player). Log: `CINEMATIC hold/release`. |
| Shared notes have no red glow | Real notes get the game's pickup glow from their spawn code (render effect 100). The shared-note props are plain models. | The shared-note props get the same glow on every map. |
| "Apply everything we know, campaign-wide" | Saving only worked at the two c_start recorders; everywhere else the recorder said "unavailable". | **Saving now works at any tape recorder in the converted campaign.** Each player's position is saved. On Continue, players land where they stood: if that spot is blocked, the nearest safe spot is chosen, checked against walls, water and floor. Picked-up items (without a story trigger) stay gone, and key-unlocked doors stay unlocked. The c_start save path is unchanged. Older saves still load. |
| Boat section (lake, late game) | The boat takes one rower; disembarking moves only the rower to the far dock. The partner was stranded on the other shore. | When the rower disembarks at a dock, every other living player far away is moved to a safe spot next to them. The partner gets a message while the boat is rowing. Log: `BOAT`. |
| Ladder: still small lag on P2 | Your logs show the host's server frames stalling for up to 250 ms, 6–18 times a minute, with both games on one PC. Each stall delays the climbing camera for P2. | Diagnostic only. The adapter adds no per-frame work; closing other programs on the host PC helps. |
| Code drawn right after a map change | Unchanged and still unexplained. The `CODE_LAYOUT` lines show one layout per connection, as designed. | None (you said it matters less now). |

Still not done:
- the apartment return-route overlay;
- the six other key doors (they stay native: each player uses the key door themselves);
- four-player play.

None of the new behavior has been seen in a real game.
