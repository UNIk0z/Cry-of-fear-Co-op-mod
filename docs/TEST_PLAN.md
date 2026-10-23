# Test plan

## Current next run

The user now has working local Steam + Sandboxie clients; no second PC needed.
DOOR_TEST.md supersedes the spawn-package next step below. Compare the SAME
door pair 49/50 in c_start2_doorctrl and c_start2_doorbypass, with a fresh session
between runs. Check visibility while co-located on both sides, movement/control/
collision/items, no map change, and asymmetric P2 rejoin recovery on control.
Full Use/audio-preserving acceptance remains separate from this touch bypass.

Earlier package procedure (historical):

Use GAMEPLAY_TEST.md and the asset-free gameplay-test-v1.zip. The alias installer
has passed actual-file reconstruction and safety checks. Both PCs install from
their own original maps; start native co-op through Steam, prove native visibility,
then host uses `changelevel c_start2_cooptest`. Record both views before events,
at doors/computer and during the return chain. Re-create native session before
original c_start2 control. No further headless launch or generic tooling needed.

The investigation tasks below are already completed where PROGRESS says so;
do not repeat them as prerequisites for this run.

## Tool milestone

Run the Node tests from README. Verify malformed-file rejection, preserved
duplicate keys/bytes, order-independent entity comparison, candidate-match
ambiguity, non-entity hashes, source immutability, output refusal, incomplete-map
status, and sample staging hashes. Fixtures are synthetic and contain no game data.
Environment-probe syntax can be checked without reading game files. Do not retry
the live library probe under the current access blocker.

## Baseline gate (requires restored game access)

Access is now available through approved read commands. Static/SDK investigation
is completed and must not be repeated. Reuse work/runtime-baseline-001 and the
saved map reports. The first copied HLDS attempt is recorded and incomplete;
don't repeat it without new evidence. Establish the Steam client/listen-server
baseline next. No experiment is deployed into the runtime snapshot yet.

1. Read the real manifest/layout; locate executable, game DLLs, configs, SDK/FGD,
   BSPs, models, and launch settings. Record hashes only of relevant originals.
2. Launch through the confirmed Steam configuration without modifications. Log
   startup/errors and quit normally. Merely starting a process is insufficient.
3. Start a native co-op reference map; verify two authenticated clients join,
   spawn, move, see each other, interact, fight, and respawn.
4. Record executable arguments, cvars, map hashes, client versions, accounts,
   and separate host/client logs. Verify console commands from the actual game.
5. Test whether a non-overwriting map/config overlay is supported. If it is not,
   design and verify explicit backups and hash-guarded restore before deployment.

## Vertical-slice matrix

Record PASSED (direct evidence), FAILED (observed failure), BLOCKED (unavailable
environment), or NOT TESTED (not attempted) per scenario and per client.

| Scenario | Required observations |
|---|---|
| Fresh story-map spawn | Both clients visible and controllable, valid starts |
| One failing door | Original purpose preserved; both players can progress |
| Same-map teleport | Both arrive correctly; visible, controls and inventory intact |
| Cross-BSP transition | Both synchronized; valid spawn/state; no stranded player |
| Original cinematic | Both receive intended event; no unwanted repeat; controls restored |
| Story item/puzzle | Shared progression; no double-fire or pickup deadlock |
| Death/reconnect | Native respawn works; essential event state remains viable |
| Native-map regression | Visibility, interactions, enemies and transition still work |

Select the earliest suitable original section only after c_start/c_start2 evidence.
Keep each experiment narrow; record hypothesis, exact patch/hash, command, logs,
both client observations, outcome, and revert result. Do not strip cinematics.

## Two-computer fallback

If same-machine independent clients fail, record the exact tested configuration
and failure once. Use two legitimate Steam accounts/computers running the same
game/patch versions. Start a native co-op session through its supported menu,
join using the game's verified interface, establish the reference baseline, then
load the story test map using a verified command. Record both client views/logs
at spawn, door use, and before/after each transition. Preserve the native co-op
configuration. Do not bypass Steam ownership, authentication, or security.

No two-client configuration has been attempted or proven unavailable yet. Native
UI observation is disabled here; an actual observation/log mechanism or manual
two-client verification is needed. A single screenshot cannot establish success.
