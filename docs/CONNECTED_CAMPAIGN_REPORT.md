# Connected original-story campaign RC2

This is a connected experimental conversion, **not a completed playable campaign**.
No RC2 gameplay has been performed. Original maps, binaries, V8/V11 and RC1 aliases
are preserved. Both players install the same text-only package; its installer
reconstructs complete BSPs from their own matching Steam installation.

| Item | Result and limit |
|---|---|
| Maps examined | 235 installed maps previously audited; 81 reachable original-story maps used |
| Converted output | 195 complete BSP entry variants from those81 originals |
| Connected routes | 197 original directed exits;576 generated routes;195 aliases reachable in the static graph |
| Same-map doors | 159 new conversions use the existing E/actor teleport/audio/fade sequence;4 prior c_start2 chains preserved |
| Remaining doors | 172 destination-bearing story doors retained:102 same-map and70 cross-map; locks/scripts remain progression blockers |
| Notes | 18 audited:2 user-verified credential papers preserved,14 static documents adapted,2 player-specific code notes retained |
| Puzzle changes | No new shared-solution implementation; original conditions preserved. Native keypad validation remains player-specific |
| Scenes | 311 native cameras get the documented Unskippable flag; original timelines retained; native view dispatch already loops clients |
| Intro/lobby | Original c_intro plus native ready completion -> one-shot original multiintroduct; gameplay pending |
| Host Coop Game | RC1 menu insertion FAILED. RC2 provides a separate Steam launcher; successful hosting/lobby operation unverified |
| Pickups | 537 physical extra copies at220 plain resource locations; some locations have fewer than3 extras. No per-client entitlement/hiding |
| Save/load | NOT IMPLEMENTED; reliable shared checkpoint restoration BLOCKED; deprioritized |
| Arrival slots | 182 variants have at least2 static positions;13 remain BLOCKED. Use2 players for this RC |

The corrected readiness candidate addresses a specific native-code mismatch:
RC1 moved the brush origin, but native Think queries local mins/maxs before a
world-bounds intersection. RC2 appends a model-metadata clone whose local/world
ready bounds agree at zero origin. Original model records, render faces and
collision geometry remain unchanged. This still needs an actual map-change test.

Arrival positions follow source position minus source landmark plus destination
landmark. Original door exits or touch-volume centers provide the source anchor.
Nearby slots require static standing support, clear paths and no overlap with
return-changelevel volumes. Stair searches follow connected standing positions.
Dynamic brushes, exact touch positions, story state and room correctness remain
runtime questions. Two source landmark names are absent from c_apartment1;
those entries are blocked instead of silently using its default third-floor start.

Other blockers: cafe accepted code differs between players; quiet note archival
and late-join journal catch-up are unavailable; late joins may interrupt scenes;
original map-name checks/global-state persistence may differ under aliases.
One user reliable overflow remains unresolved and is not the current priority.
Detail-texture/overview sidecars are not generated for aliases; missing-sidecar
warnings do not establish map-load failure, but visual parity is not claimed.

See TESTING.md for one continuous test, campaign-summary.json for exact counts,
CAMPAIGN_ROUTES.md for every alias/entry/outgoing route, and campaign-routes.json
for per-door destination evidence, note adapters, pickup positions and blockers.
No standalone map or an ending has been declared gameplay verified.

The package pins its implementation commit in release.json. QA evidence and
final commit hashes are recorded in the implementation repository's TEST_RESULTS
and PROGRESS documents. Installation does not require Node or development tools.
