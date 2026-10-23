# v0.3 audit -> v0.4 (Claude, 2026-10-18) - handoff

Branch `claude/serene-bouman-7ab372` (worktree serene-bouman-7ab372), on top of
the v0.3 tip 36ac200 (fast-forwarded from claude/agitated-murdock-88baf2).
Baseline before v0.3: v0.2 = 776590b (code) / e4e251e (docs + DOOR_TEST.md edit).
Reviewed: `git diff 776590b 36ac200` (40 files, +1793/-91): every native file,
the scripts and tests listed under "v0.3 change review". Nothing was pushed.

Paths: W = %USERPROFILE%/Documents/Codex/2026-10-10/files-mentioned-by-the-user-consolelog-2

## Final status (2026-10-18)
- FINAL PLAYER ZIP: `W/outputs/Cry of Fear Co-op v0.4.zip` (215 entries,
  983,295 bytes, SHA256 2f8fe58db572ab3dff1e60c3a15e5fd27d4ad5b9febbdcc768673378598f3974),
  adapter 6eb5829924dcb6d2fada3cc67ef80348a6668c474f00cca95acf638d9dbc8ee2
  (work/claude-s24-native-005), catalog f610774e..., source 9127aa3. The
  "Deliverables" numbers below are the first v0.4 build (now outputs/superseded/*-a).
- Installed on D: and verified (205 files). Laptop NOT shut down (Katz 12:01Z).
- Evidence kinds, per Katz's section 6:
  1. Reported scene, both players: code + map chain + automated fixture only.
     NOT two-player runtime (the Sandboxie P2 Steam is logged off; I did not log in).
  2. Save/load around the scene: Katz's own post-scene slot 1 loads at runtime
     (host, debugger, no exception); pre-scene save not available.
  3. Exit, relaunch, load: runtime host (separate processes each time).
  4. Repeated overwrite: automated (checkpoint/mapstate fixtures) only.
  5. Return loop with partner: Katz's 23:02 log (pre-fix) shows the carry; not re-run.
  6. Other scenes on the same handler: map audit (50+ chains) + fixtures; not runtime.
  7. Launcher: runtime (double-click path from the player folder, spaces in
     path, missing-files message, co-op menu reached, no CoFLaunchApp click).
  Vote to skip: fixtures only; a solo runtime attempt could not reach a scene
  (the s4_start wake waits for the second player).

## Deliverables
- PLAYER ZIP: `W/outputs/Cry of Fear Co-op v0.4.zip` (215 entries, 971,480 bytes,
  SHA256 f4072930cfda0fa0659c92f78944e4f71c2ea07b566dad055f7bf2f8eb75d4ee);
  folder W/outputs/coop-v04-player. Order on each PC: close the game ->
  "Install or Update.cmd" -> double-click "Run Co-op Mod.cmd".
- Developer package W/outputs/v04-candidate, catalog d76f33d0...; adapter
  e53a9948ce24f58ee551340b7c97154833feb23f362e6e299fcba3f12f81f181
  (W/work/claude-s24-native-003), source commit 3dbc1d6. Packaged with
  `package-state-rc4.mjs W/work/claude-s17-maps-001 <2026-10-09>/cry-of-fear-story-co-op/outputs/rc3-two-client-test/rc2 <dll> <out> <commit> W/outputs/v02-candidate v04`,
  env COF_GAME_DIRECTORY, COF_MENU_LOGO (W/outputs/menu-title-for-editing/menu_logo_coop.png),
  COF_KNOWN_CATALOGS = the 29 catalogs of v03-candidate/known-builds.json (found
  by hash under %USERPROFILE%/Documents/Codex) + W/outputs/v03-candidate/release.json.
- Installed on this PC (D:): setup-coop "Found co-op v0.3. Updating it to v0.4",
  205 files verified; the v0.3 adapter was set aside in
  "Cry of Fear - removed co-op files/20261018-072120". Saves untouched.

## Evidence (copied before any test; originals untouched)
- W/work/claude-s23-evidence-002: every storycoop_logs file, storycoop_saves
  (slot1.cofsave/.cofmap/.bak), SAVE/, the 23:16 screenshot, SHA256.txt.
- W/work/claude-s23-evidence (Katz's copy + the other session's dumps; see below).
- Debugger logs (scratchpad dbgwatch.exe, a 32-bit attach/create debugger that
  logs first-chance exceptions and debug strings): reproduced crash and the
  fixed load, summarised below. Screenshot of the fixed load:
  W/work/claude-s24-runtime-001/load-slot1-fixed.png.

## Root causes (supported by evidence)

### Save/load "crash" (and the revisit crash)
- Katz 23:17: Load Slot 1 (s4_start_e0) -> log ends at `RESTORE WAIT`; Windows
  Application log: AppHangTransient cof.exe 23:19:03; Steam dump
  crash_cof.exe_20261017231743_1.dmp: access violation executing 0x00000070.
- Reproduced here (Continue slot 1, host only), same hang. Debugger: EIP 0x70,
  return address hl.dll 100C3E7F in ApplyDesiredSettings (100C3E50), called by
  CheckDesiredList (100C4120) from PlayerPostThink (via our postthink). Bytes
  checked in hl.dll: m_iLFlags at CBaseEntity +0x60 (test 0x80 LF_DODESIRED,
  clear 0x800 LF_DESIRED_ACTION, `call [vtable+0]` = DesiredAction),
  m_pAssistLink at +0x3C.
- Mechanism: v0.3 map state removes "gone" entities (incl. fire-once
  trigger_autos) with FL_KILLME BEFORE ServerActivate. The game's
  ServerActivate (client.cpp 2474) still calls Activate on them;
  CAutoTrigger::Activate (triggers.cpp 191) calls UTIL_DesiredAction, which
  links the entity into Spirit's assist/desired list. The engine frees it at the
  end of the first physics frame while it is still linked; the first
  PlayerPostThink walks the list into freed memory. Use-after-free: it hangs or
  survives depending on heap reuse (the first revisit in that session survived).
- Then Steam's crashhandler.dll handles the first-chance fault and starts
  steamerrorreporter.exe; hw.dll unloads and the process deadlocks in DLL
  detach (stack sample: all threads 0 CPU, mss32 in the loader) = "not
  responding". v0.3's unhandled-exception report never ran.
- Fix (9fff58d): entity_retire (world-runtime.hpp) for every adapter removal:
  FL_DORMANT (ServerActivate skips Activate), assist/desired bits cleared in
  m_iLFlags after checking private+4 == pev, assist_unlink (adapter.cpp, from
  the agitated-murdock session's parallel fix fe8ad2e), then FL_KILLME. Helper
  entities removed with REMOVE_ENTITY are unlinked first.
- Runtime (host only): the same slot 1 now loads: `MAPSTATE restored ...
  restored=901 removed=37`, `CHECKPOINT restored player=1 health=100 ...
  weapons=2 inventory=2`, journal and code note replayed, zero first-chance
  access violations under the debugger, game responsive, closed normally.

### P2 in the dark box (s4_start_e0, "door to the right after the padlock door")
- Host log rc4-20261017-230225: s4_start -> s4_start2 -> s4_start_e0 (revisit);
  one `SCENE_TELEPORT player=1 moved by camera 158's scene; partners moved=1`
  and no return line. Camera 158 = ckamera1.
- Map chain (served s4_start_e0): trigger_once *35 (master
  sc4_scene3_pending) -> multi_manager multiscene3 (two entities): 0.5 s
  mainteleport (cof_teleport -> teleportdes -135,-2720,-830, a closed staging
  room) + ckamera1 (wait 14.9); 6.5 s sms3hehe (trigger_cofmobile: "Look to the
  right."); 15.4 s 2teleport (-> teleportdes2 3085,-2408,-775 at the door), the
  same moment ckamera1/ckamera3 end.
- Decomp effects.cpp CCofTeleport::Use moves only pActivator. v0.2's
  scene_teleport_frame followed a jump only while the jumper held a LIVE camera
  lease, so P2 followed into the room but not out of it.
- Origin: v0.2 (776590b), surfaced in v0.3 testing.
- Fix (9fff58d, coop-runtime.hpp): partners who watched the scene camera up to
  1.5 s ago follow a jump; a partner moved by a scene follows that activator's
  jumps while still within 96 u of where it was put, until 30 s after the
  activator's scene camera ended; if the activator leaves the game the partner
  goes back to where it stood (return-home and the grace idea from fe8ad2e).
- Campaign audit (scratchpad scene-teleports.mjs over the installed maps): 142
  multi_manager scenes fire cof_teleport + trigger_camera; 86 have a teleport at
  or after the camera end. Story-campaign (s4_*) chains of the reported shape
  (staging, then exit at/after the end): s4_start_e0/e2 multiscene3 and
  sc4_wake_original (exit 44 s), s4_city_e0..e3 multikatteh2 (15 s), s4_park3
  multiirlsophie (11 s), s4_roofs multiroofscene (357.9 s), s4_roofs2
  multikill2 (5 s), s4_subway2st1 multitban1 (24 s) and multitb2 (11 s),
  s4_subway2st3 multitscene2 (exit 16 s AFTER the cameras: covered by the 30 s
  follow). Exit-only at the end: s4_asylum1 multits2, s4_attic multidadoc,
  s4_city2 multisawrun2, s4_ending5 multistartis, s4_roofs2 multistartitall/
  multiescape, s4_sewer2 multismoke2, s4_sewer3 multibutton2246,
  s4_subwaysick2 differentmult; after the end: s4_apartmentsick (1 s),
  s4_broscene (0.5 s), s4_trainscene (0.5 s) (within the 1.5 s window);
  s4_bridge multikuken (62 s after; not a scene exit, not followed, as before).
  trigger_cofteleport (brush) scenes are not in this list.

### Exit fault introduced by the v0.4 crash report (found and fixed the same day)
Under the debugger, a normal quit of a 62b332f build raised 286 access
violations at storycoop_rc4.dll+0x2D180: the engine unloads the game DLL on quit
while the new vectored handler (and v0.3's unhandled filter) still pointed into
it. Fixed: DllMain DLL_PROCESS_DETACH -> crash_uninstall (session-runtime.hpp)
removes both. Session fixture checks it.

## Vote to skip (added 2026-10-18 at Katz's request through the coordinator)
coop-runtime.hpp skip_*: SPACE (IN_JUMP edge in CmdStart) = vote while a scene
camera holds the player (lease, or the running camera given to a late joiner);
"SPACE to skip k/N" bottom-left for 3 s at scene start and after each vote; N =
connected, HUD-ready, alive players. At N/N: fast-forward of every running
multi_manager of the scene (m_startTime +0xE8 moved back, then the game's own
ManagerThink via DispatchThink fires the remaining targets in order), plus
managers/DelayedUse relays it starts (up to 6 rounds), then one toggle per scene
camera still on. Offsets checked in hl.dll (m_iState +0xDC GetState 1010B5A0,
m_sMaster +0x174 ManagerUse 1010E190, size 0x190). Allowlist of state-change
classes; 42 of 195 s4 camera scenes not offered (V04_RELEASE.md lists them).

## v0.3 change review (776590b..36ac200)
| Change | Verdict | Notes |
|---|---|---|
| state-runtime.hpp map state (DispatchSave/Restore per visit, slotN.cofmap) | Repaired | Removal bug above. Identity keys, exit/transition/movewith keep rules, layout gate, CRC pairing, .bak fallback read correct. Known limits stay: restore runs on already-spawned entities (m_activated restored, so PostSpawn is skipped like a SP restore); EHANDLE/CLASSPTR references to players restore as NULL (table has no players). |
| checkpoint.cpp card() mixed-case | Kept | Videotape.txt. |
| rejoin_departing (own state, then carry record) | Kept | Matches log evidence. |
| carry_seed, menu_reset, server_command_hook changelevel | Kept | |
| Drowned INDEXENT(1) (forwardEngine[72]) | Kept | Answer changes only inside monster_crazybitch think. Runtime untested. |
| acting player (inventoryuse, puzzle bars, roof boss, pp fan-out) | Kept | Only first-player lookups with start==null. |
| two-half items (half_frame) | Kept | Uses helper removal (now unlinked). |
| evidence logging, Use/Touch breadcrumbs | Kept | Read-only. |
| crash report (unhandled filter) | Repaired (62b332f) | Never ran in the real crash; now a first-chance vectored handler for AV/illegal/priv/div0/bounds, once per process. |
| pp name strip "__sc4pp" | Kept | |
| scripts: find-cof elevation, setup-coop, join/host | Kept | Elevation probes correct on this PC (Steam not elevated, folder writable). |
| Run Co-op Mod.cmd H/J | Changed (b839418) | Double-click = host (unchanged host script); join via argument or console. |

## Tests
- Native: 14 suites PASS (W/work/claude-s24-tests-003.log) incl. new mapstate
  (desired-list removal), world (multiscene3 shape, late return, walk-away,
  activator leaves) and session (first-chance report) cases.
- Node: 53 pass / 0 fail / 65 skipped (W/work/claude-s24-node-004.log; skipped
  ones need older build environments).
- Runtime on this PC (host only, no second player): Katz's slot 1 load (see
  above); launcher (see Katz's section 7 list below).
- NOT runtime-verified: anything with two players (scene follow, P2 restore,
  return loop with a partner), the revisit path in a live game, Drowned.

## Existing saves
Format unchanged; v0.3 slot files load. Katz's slot 1 was saved while P2 was in
the staging room: P2 will be restored there; `stuck` in chat (Y) moves them
next to the host.

## Other session (agitated-murdock-88baf2, stood down 2026-10-18 ~04:10Z)
A second session ran the same audit in parallel; it stopped on request. Its WIP
is commit fe8ad2e on claude/agitated-murdock-88baf2 (assist_unlink, 5 s scene
follow, tests; its world suite was red). Its notes: copies and Steam dumps in
W/work/claude-s23-evidence (hang-load-*.dmp are 64-bit WoW dumps, not useful;
hang2-x86-*.dmp show only hw.dll during loading), work/claude-s23-native-001/002
and claude-s23-tests-001..003 are its builds; Katz's save globals show
wake.done ON (no wake replay); Steam -applaunch with custom arguments can wait
for a Steam confirmation dialog.

## Next steps
Run docs/V04_TEST.md with two players and send the host's rc4 log (and any
crash-*.dmp). Look for SCENE_TELEPORT lines on s4_start_e0 scene 3.
