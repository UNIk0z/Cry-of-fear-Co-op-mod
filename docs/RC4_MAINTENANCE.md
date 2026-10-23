# RC4 maintenance 001

This candidate preserves the existing RC3/RC4 tools and the user's working shared
computer/padlock code and additional pickups. It changes eight aliases from exact
protected parents. No whole-campaign regeneration, original DLL replacement,
Steam authentication change or liblist modification occurred.

| Change | Evidence and implementation | Status |
|---|---|---|
| Intro waits for P2 movement | Original final `kunitei2` relocation places both actors in exit model141. Its Touch-based exit can wait for movement; that scheduling cause is inferred from the chain/user symptom. The final authored callback now queries occupancy AFTER relocation, requires two players and activates the existing native exit once. | IMPLEMENTED — AUTOMATED TESTS PASSED; AWAITING GAMEPLAY VERIFICATION |
| Missing title vehicle | Native TrackTrain Find starts all four authored brushes at map initialization, before readiness. `startspeed=0` now holds their original paths until the existing ready-gated cinematic Use; original speed300/geometry/title/rain/lighting/timings remain. Premature movement is established statically; its responsibility for the actual missing rendered vehicle is unverified. | IMPLEMENTED — AUTOMATED TESTS PASSED; AWAITING GAMEPLAY VERIFICATION |
| Missing padlock audio | Native Rotate and successful Check already emit `items/padl_turn.wav` and `items/padl_unlock.wav`. The panel prop is offstage. Only those original events inside the validated owner context are emitted from that actor, exactly once with original parameters. Spatial attenuation is a likely cause, without an observed audio trace. | IMPLEMENTED — AUTOMATED TESTS PASSED; AWAITING GAMEPLAY VERIFICATION |
| Padlock door713 | Original `sd_door1` is bound to the shared solved flag. The retained brush becomes the verified E/audio/fade/actor teleport/fade chain with a shared master, rechecked at delayed relocation. Original destination/message/music retained. | IMPLEMENTED — AUTOMATED TESTS PASSED; AWAITING GAMEPLAY VERIFICATION |
| Apartment office228/229 | Original helper toggles change existing doors, without creating replacements. Original manager621 locks; manager280 unlocks both directions. Explicit shared Off/On gates preserve these stages; original scene343 becomes one-time after280 completes. Converted actor transitions retain original destinations. This is the identified office-pair candidate; exact user door location was not supplied. | IMPLEMENTED — AUTOMATED TESTS PASSED; AWAITING GAMEPLAY VERIFICATION |
| Recorder saving | Native recorder sends SaveLoad byte0/location followed by a black ScreenFade. The adapter consumes that exact UI request, commits host-owned checkpoint files and suppresses its adjacent UI black hold. Success appears only after disk commit. Other native UI passes through. | IMPLEMENTED — AUTOMATED TESTS PASSED; AWAITING GAMEPLAY VERIFICATION |
| Fresh Continue | Existing Steam launcher selects the saved map/slot; adapter validates the file, restores native globals, canonical puzzle/journal and identity-matched guarded player state. Inventory grants use actual SDK entities and are read back. | IMPLEMENTED — AUTOMATED TESTS PASSED; AWAITING GAMEPLAY VERIFICATION |

The static implementation evidence identifies specific defects/dependencies; it
does not prove every observed symptom's exact runtime cause or its repair.
Use the ordered guide, including real audio, rendering and restarted inventory.

## Modified aliases

| Alias | Original map / protected parent |
|---|---|
| cof_campaign_story4 | c_intro / delivered RC4 hotfix |
| s4_nightmare | c_nightmare / delivered RC4 hotfix; byte-identical retained map |
| s4_start | c_start / delivered RC4 hotfix |
| s4_start_e0 | c_start / delivered RC4 hotfix |
| s4_start2 | c_start2 / delivered RC4 hotfix |
| s4_apartment1_e3 | c_apartment1 / exact RC2 e3 |
| s4_apartment1_e7 | c_apartment1 / exact RC2 e7 |
| s4_start_e2 | c_start / exact RC2 e2 plus existing RC4 state conversion |

Known routes between these aliases are bridged. Remaining RC2 dependencies stay
in the existing complete prerequisite. Original binary BSP contents after the
header remain intact; changes use existing entity/model-metadata assembly.

## Limits

The candidate runs two active clients. Saving accepts up to four retained stable
identity records, including absent players, but four active-player checkpoints
and saves on other maps are BLOCKED pending proven landing/state plans. Supported
wake-map recorder419/421 interactions resume at two clear Storage Tunnel419
anchors. Dynamic collision, camera/HUD/control and all original grant behavior
still require gameplay verification.

Saving retains native globals and the explicit wake/scare/puzzle/office latches;
it reconstructs the supported map rather than persisting the entire original
world. Enemies, collected physical pickups, arbitrary temporary entities and
unconverted story events can reset. Native weapon modes/other uncaptured private
attributes are not guaranteed. This is not yet a verified whole-campaign save.
Normal map inventory transfer remains the original multiplayer implementation,
including its name-matching limitations; keep names unchanged during that test.
Late cutscene joining and simultaneous padlock Use remain unsupported.

A missing/duplicate stable Steam identity must receive an explicit host-assigned
profile; player slots are never inventory ownership keys. CHECKPOINT.md explains
the save contract and failure behavior. START_HERE.md covers guarded installation
and rollback. QA.json contains the executed evidence.
