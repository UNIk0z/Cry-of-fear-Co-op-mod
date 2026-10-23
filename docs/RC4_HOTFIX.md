# RC4 opening hotfix investigation — candidate 001

User-observed RC4 build010 opening regression: first cinematic stuck, title
vehicle missing, static-rain warning. RC3 build007 previously completed the
tested two-client opening/nightmare/wake progression. RC4 persistence is NOT
gameplay verified. This candidate requires the single test in TESTING.md.

## Established differences and correction

RC4 intro versus RC3: all 599 parent entities and model/geometry/light lumps
match, except entity573's destination `s3_nightmare` becomes `s4_nightmare`.
RC4 appended13 isolated global-state reset entities. Nightmare differs only at
two route strings, including the verified raw `changelevel s4_start` handoff.
The host startup differs by the authorized separate `-dll` component and RC4
entry name; maxplayers2/mp_footsteps1/order are preserved.

RC4 erroneously enabled journal/puzzle restoration during the opening maps,
despite those maps having no persistence requirement. Hotfix excludes
`cof_campaign_story4` and `s4_nightmare` from that scope: no allocation tracking,
journal writes/replays, puzzle digit writes or input interception there.
Native Spawn/Think/ClientPutInServer/ClientCommand/PreThink and changelevel remain
forwarded, retaining native return values. Original factory exports and the
function/name bridge remain necessary for the separate DLL. Fresh lobby resets
only the host bank. State code resumes at `s4_start`; later maps are unchanged.
Bounded observational Spawn/first-Think logs identify vehicle acceptance and
which authored manager actually runs. No timer, camera or forced exit was added.

**Bus/stall causal limit:** inappropriate opening writes are an identified RC4
behavior difference, not proof of the reported missing vehicle or stalled
transition. No failing game log was available in the inspected unboxed log
locations; no direct two-client session was observed by Codex. The exact runtime
failure stage remains unestablished until the diagnostic opening test. Do not
report either symptom fixed solely from compilation/fixtures.

## Vehicle and original progression

The map's opening moving vehicle is brush geometry, not a removed bus MDL.
`func_tracktrain` entities99/102/142 (`skittag`, models*56/*57/*58) follow
instop1/2instop1/3instop1. Entity341 (`skittag22`, model*149, target kollie) is
the accompanying transparent train brush. All their origins, start speeds300,
paths, render fields and geometry are identical to original/RC3.
`buske.mdl` entries are vegetation, not vehicles. No duplicate vehicle is added.

Ready gate -> original one-shot `multiintroduct` -> original managers489/550.
Vehicle actions fire at0; title at9; fade/camera boundary at44; multikattej at52.
Original multikattej423 dispatches multiintro1 at38, then multiintro1's multiintro2
at65; multiintro2 retains multiintro3 at30. The authored kunitei2 relocation
dispatch at133 and trigger_once291 -> cof_changelevel573 -> s4_nightmare remain.
RC3 camera, per-player effects/equipment and party movement helpers are intact.
The timing branches overlap; these are original delays, not summed deadlines.

## Exact rain cause

Pinned original DLL string101C2DF4: `Rain error: only static rain in multiplayer`.
CRainModify::Use100A99A0 checks native deathmatch at globals+14; its multiplayer
branch100A99C9..100A99DA prints that warning and returns. It neither deletes the
vehicle nor fires/suppresses a cinematic completion target. Consequently the
warning alone is not evidence of the bus/hang cause.

Intro multi_manager277 invokes dynamic rain_modify217 (`kakelae`) at0 and30.
Those unsupported two actions are omitted. Original static rain_settings100/216
and rain_modify101/217 and their distance/wind/drip parameters remain unchanged;
static initialization retains the first compatible settings. Dynamic second-shot
wind/drip changes cannot run in native multiplayer. No global render setting or
weather entity is removed. Both-client rain appearance still needs observation.

## Changed files and verification

Installed changes relative to failed RC4: `maps/cof_campaign_story4.bsp` (only
two unsupported rain Uses removed), `cl_dlls/storycoop_rc4.dll` (opening scope
isolation plus bounded diagnostics). The other four RC4 BSPs are byte-identical
to the failed candidate. Original binaries/liblist/auth and RC3 remain untouched.

Source changes: native/rc4/adapter.cpp, test-adapter.cpp;
scripts/build-state-rc4.mjs, package-state-rc4.mjs;
tests/state-rc4.test.mjs, install-state-rc4-fixture.ps1;
this report/test/start guide and active handoff/status documents.

60 applicable Node checks pass; all4 owned native suites pass, including opening
memory/message/callback isolation and wake reactivation. x86 /W4/WX build checks
all846 export names/ordinals and843 tail-jump slots. Original game DLL is never
loaded in the fixtures. Installer/rollback and archive evidence are in QA.json.
Real opening, vehicle visibility, transition and persistence remain pending.

Install: remove exact build010 using bundled previous remover, then install this
candidate in both environments. Rollback: remove hotfix, then launch retained
RC3 build007 without `-dll`. See START_HERE.md and TESTING.md for exact commands.
