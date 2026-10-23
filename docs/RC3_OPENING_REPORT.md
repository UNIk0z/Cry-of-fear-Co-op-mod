# RC3 original-story opening candidate

This three-map overlay repairs identified RC2 entity-chain defects and tests a
new nightmare exit. **Actual two-client gameplay remains unverified. The host
hang's cause is not established.** Install the full RC2 package first and retain
it. No new 195-map conversion batch was made.

Current revision is build007. Build005 remains preserved in the previous workspace.
Only the intro BSP changes: its native ready callback now synchronously counts
players with native USE_SET, requiring two before firing the existing one-shot timeline. A solo
callback cannot be stored and combined with a later unready join. Nightmare and
waking BSP hashes are exactly the build005 hashes. The updated Steam launcher
sets `mp_footsteps 1` before `+map`, disabling the native forced lobby deadline.

| Original | RC2 parent retained | New alias |
|---|---|---|
| c_intro | cof_campaign_story2 | cof_campaign_story3 |
| c_nightmare | s2_nightmare_e0 | s3_nightmare |
| c_start | s2_start_e1 | s3_start |

After the waking map, existing RC2 routes continue. Unresolved RC2 campaign
blockers remain; this is not a completed campaign release. Verified c_start2
door/audio/visibility and credential-note implementations are unchanged.

## Findings and changes

| Reported defect | Evidence / confidence | RC3 change |
|---|---|---|
| Intro before readiness | Confirmed competing touch/native starts; native callback permits solo completion and has an optional forced deadline | Retire touch start; require two players at native callback; consume original timeline once; launcher disables forced deadline |
| P2 misses camera | Native camera Use already loops all clients; early start and duplicate activation can explain failure, but runtime cause is not proven | Keep global camera instances and original timelines; ready gate and one-shot roots; no per-player camera duplication |
| P2 stranded without camera | Confirmed actor-only scripted teleport and native cof_giveitems | Enumerate both native players, use original destination plus checked second landing, give camera once to each through native inventory code |
| P2 lacks effects | Native blur/zoom/logo operate on activating player; intro text already broadcasts | Dispatch those actor-only effects to both at original event times; retain global fades, fog, lighting and camera effects |
| Brief overbright vehicle shot | Original dynamic lights are retained in RC2; duplicate timeline can toggle lights twice. Specific visual cause remains unproven | Remove duplicate scene start; preserve authored light values, timing and lightmaps; no global brightness adjustment |
| Nightmare->wake hang | User confirms host hangs, P2 times out. Actual log reaches next server initialization. No RC2 overflow/fatal stack | Candidate stops cameras, removes obsolete camera from both, queues one native engine changelevel; avoids native inventory capture at this first new story-unit boundary |
| Waking equipment | Native camera removal, phone and switchblade grants are actor-only | Both-player native dispatch; grants and removal consumed once; original times and item definitions retained |
| Late join disrupts scene | Initial startup now consumed once; native in-flight camera catch-up remains unresolved | Following maps wait for two native first-join events before starting; ordinary respawns cannot satisfy this twice. No claim of reconnect recovery |

The native ready loop inspects existing eligible player slots and their ready
flags; empty slots are skipped. Build007 counts player entities at callback time
through the existing game_zone_player adapter. With fewer than two, the original
intro remains stopped. Native UI may nevertheless close on solo completion:
**restart that lobby; both players must join before either readies**. This is a
fail-closed guard, not solo-ready recovery. A later join never starts the intro.

Bounded native evidence establishes an additional forced-start path at100C9DAD
through100C9EBF. Worldspawn10121083..101210D3 sets its deadline only for a value
greater than1. The string at101CD9DC is `mp_footsteps`, despite the separately
registered `sv_lobby_time` default60. The launcher pins the actual read to1 before
worldspawn initialization. Changing sv_lobby_time or setting the value after load
does not change that initialization. This is static native-code evidence; no
claim that a deadline caused the user's observed RC2 failure. No DLL is changed.

Nightmare and waking scenes start after two native game_playerjoin events, with
0.1 seconds solely to leave the native Spawn call stack. This is not a timed
substitute for readiness. Native player+24D0 guards that join event; the ordinary
game_playerspawn hook is deliberately not used. A slow client, reconnect or
server-side join event preceding client view readiness still needs runtime testing.

Story teleports use existing game_zone_player enumeration and resettable native
slot counters. Original feet/orientation are retained for the first recipient.
Playable destinations have separated supported standing candidates from BSP
collision. Intro's final locked cinematic holding point has only one location:
the short overlap is explicitly a gameplay risk, not a validated playable spawn.
Original first spawn entities98/104/55 anchor the opening positions. Collision
checks cover static world hulls, not moving brushes or other players.

Nightmare's original temporary offstage teleport428 has a solid standing hull.
RC3 leaves both players at the preceding valid position during the same black
hold, then original final event at5 seconds invokes the handoff. It avoids the
single-slot SP map-change staging position. The original nightmare puzzle and
20 camera-spot triggers are preserved: one player's progress advances the shared
scene; both should have cameras. This interaction still requires gameplay.

The original waking scene removes camera at0 seconds, gives phone at2 and
switchblade at4. RC3 preserves this, with both-player delivery. Other inventory
is not captured by the experimental nightmare handoff: this is limited to the
first new-unit boundary and must not be generalized to later campaign exits.
Native inventory capacity/duplicate rules remain active; AlwaysGive is not added.
World pickups retain RC2 behavior; true per-client pickup ownership is not fixed.

## Hang evidence and limits

Actual RC2 route is s2_nightmare_e0 -> s2_start_e1 (original c_start), from original
exit101. Private host qconsole.log reaches Server#4 and prints camera inventory
cleanup after destination initialization. Node graph rebuild and a stuck monster
warning are present; neither proves the hang's cause. Older overflow text belongs
to an earlier run and is not evidence for this failure.

Direct destination loading: **NOT OBSERVED**. Natural RC3 progression: **NOT
OBSERVED**. Two-client RC3 progression: **NOT OBSERVED**. Native GUI observation
is unavailable in this environment. No unsupported HLDS retry was made. Use the
bounded natural/direct A/B steps in TESTING.md instead of another headless test.

No speculative alias node cache is shipped. Original c_start.nod exists, but
compatibility with renamed map caches is not established; .nrp is a text graph
report. Missing alias cache can cause rebuilding, not automatically a fatal error.
All original BSP bodies, 13 nonentity lumps and RC2 model records are retained.
These are complete reconstructed BSP30 files, not entity-only exports.

## Engineering verification

Build005 verification was52 Node tests and33 Windows PowerShell fixture assertions;
its196 resource paths were checked in actual Steam. Build007 execution results
are recorded in VERIFICATION.json. It adds the occupancy guard and launcher
deadline setting; no new media or equipment references. Install full RC2 in the
same game environment first; an older boxed installation does not populate it.

See VERIFICATION.json for final executed checks. Tests cover complete-BSP
reconstruction and deterministic hashes, intro start authority, guarded join
hooks, unchanged global cameras/lights/fades/timeline times, once-only native
grants, actual static spawn/landing clearance, repeatable relocation counters,
camera release and handoff ordering, plus existing door/note/RC2 regressions.
PowerShell fixture checks exercise dependency/source/plan/DLL/output guards,
repeat install and guarded rollback; generated output must match Node byte-for-byte.

Release contains text plans/scripts/docs only. Installer reconstructs from the
user's pinned Steam originals and checks the pinned native DLL; it does not patch
any executable. RC2 direct continuation dependencies are hash-checked before any
write. Full RC2 installation remains required for later transitive routes.
Remove deletes only unchanged RC3 aliases. Originals, RC2 and other releases stay.
If build005 is installed, use `remove-build005.cmd` before the new installer.
It reuses the old catalog with the existing guarded remover and refuses changed
or newer files before deleting anything. The new installer also refuses an old
intro rather than overwriting it. Keep the game closed for installation/removal.

Known blockers: observed gameplay acceptance; hang diagnosis; late-join camera,
effect and equipment catch-up; connected campaign's existing locked-door,
destination, private puzzle and save-state defects. No mass propagation until
this opening test supplies evidence.

## Evidence for future sessions

Private work/rc3-opening-001 holds bounded native disassembly, host log and checks.
New private evidence is in the current chat's work/rc3-resume-001. Previous build005
and its ZIP remain unchanged. The minimum-player guard needs native gameplay,
including a separate solo-ready negative test followed by a fresh main run.
Native addresses: camera Use10113B60; lobby completion100C9EBF/100CA025;
ready condition100C9C20..100C9DAD; blur100A5BB0; zoom100A5F30;
logo100A7370; introduction100A4240; give100A6BC0; clear100A60C0;
first-join guard100F76A4 and FireTargets100F7709. USE_SET=2, USE_TOGGLE=3.
The public unofficial Xash source review is retained from earlier work and is
not treated as a compatible native Steam DLL source/build. No binaries modified.
