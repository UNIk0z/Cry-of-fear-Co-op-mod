# Bug status — coop-fixes-012 (2026-10-13)

| Issue | Status |
|---|---|
| Glock light / Maglite blocked | Allowed again (user: only F off); awaiting gameplay |
| Only the host could save | Either player saves now; file on the host's PC; awaiting gameplay |
| Save slot choice | Recorder slot list + 1/2/3; awaiting gameplay |
| Two-button main menu | NOT POSSIBLE without editing client.dll (left as is, per user) |
| Police model on s4_nightmare | Fixed in 011; awaiting gameplay |
| Enemy hitboxes, ladder stall | OPEN: no log |

---

# Bug status — coop-fixes-011 (2026-10-13)

| Issue | Status |
|---|---|
| Police model on s4_nightmare | ROOT CAUSE: worldspawn player1..4=police1..4 kept as "map's own"; replaced in 011; awaiting gameplay |
| Light notice cut off | Shortened; awaiting gameplay |
| Enemy hitboxes, ladder stall | OPEN: no log |

---

# Bug status — coop-fixes-009 (2026-10-13)

| Issue | Status |
|---|---|
| Phone light centre texture | USER-CONFIRMED FIXED (008) |
| Dual wield never in the hands | USER-CONFIRMED FIXED (008) |
| Players look like police officers | FIXED on s4_start (008, user); 009 extends it to cof_campaign_story4/s4_nightmare; awaiting gameplay |
| Dual wielder frozen for the partner | ROOT CAUSE: pose pinned animtime (client position history keys on animtime); awaiting gameplay |
| No pause notice | *paused* centre text; awaiting gameplay |
| Custom Campaign labels cut off | Shortened; awaiting gameplay |
| Enemy hitboxes, ladder stall | OPEN: no log |
| Intro train trails its effect | OPEN (skipped by request) |

---

# Bug status — coop-fixes-008 (2026-10-13)

| Issue | Status |
|---|---|
| Players look like police officers | ROOT CAUSE: models/player.mdl is police; 008 builds Simon from police1 + cutscene/simon_clothes; awaiting gameplay |
| Dual wield never in the hands | ROOT CAUSE: MP FShouldSwitchWeapon weight compare; weight lifted while given; awaiting gameplay |
| Phone light centre texture lost (both lights on) | ROOT CAUSE: client light key collision; per-viewer flags; trade-off: no plain patch of the host light for P2 while both are on; awaiting gameplay |
| No save sound / partner can't tell why nothing saved | Sound + on-screen notice; awaiting gameplay |
| Rejoin during a camera scene: black box | camera_join + rejoin pose; awaiting gameplay |
| Game-over restart without saved position | Reload of the session save on the same map; awaiting gameplay |
| Quick keys lost on load/death | Schema 5; awaiting gameplay |
| Enemy hitboxes, ladder stall | OPEN: no log |
| Intro train trails its effect | OPEN (skipped by request) |

---

# Bug status — coop-fixes-007 (2026-10-12)

| Issue | Status |
|---|---|
| P2 kicked "reliable overflow" joining s4_start (both loads in the 006 log, never on 004) | ROOT CAUSE: 005 model_frame vs game ClientUserInfoChanged 100C79E0 (forces world +0xE0.. / police1..4) -> userinfo update every second; world fields now simon; awaiting gameplay |
| Players still looked like police officers in 006 | Same cause; MODEL log was silent because player edicts keep serial 0 |
| Empty inventory after a rejoin | Rejoin restore + missed fan-out replay; awaiting gameplay |
| Intro credit stuck on P2 | Client orphans a visible CoFLogo label on a new message; 4 s spacing per player; awaiting gameplay |
| Intro train/cars trail the paper effect | Interpolation (0.1 s) + host cl_updaterate 20; tuned per client; awaiting gameplay |
| Old builds' files in the game folder | setup-coop.ps1 sets them aside (moved, not deleted) |

---

# Bug status — coop-fixes-006 (2026-10-12)

| Issue | Status |
|---|---|
| Dual wield in co-op | ENABLED: handler 1001B6B9 returns on IsMultiplayer (1001B6DB); adapter calls DualWield 100DE990 directly (user request); awaiting gameplay |
| Dual wielder looks unarmed to the partner | Weapon hand's pose/attack re-applied after PostThink; anim lock +0x4F4 only for attacks (it gates revive 100EFD25); awaiting gameplay |
| Ending always 1 in co-op | ROOT CAUSE CONFIRMED statically: endingcheck 10048070 reads +0x4CD/4CE/4CF; cof_ending 100A3C80 sets them on all players; co-op level change 1002A480 drops them. Shared + schema 4; awaiting gameplay |
| Story wound / night vision lost at map change | Kept per identity (+0x60C, +0x434); awaiting gameplay |
| Save while dual wielding | weapon_dualweapon skipped; equipped = weapon hand |

---

# Bug status — coop-fixes-005 (2026-10-12)

| Issue | Status |
|---|---|
| Lit circle in cutscenes (004: spot=0) | ROOT CAUSE CONFIRMED statically: client 10065260 draws a spot for every player whose ScoreInfo frags has bit 1/8/0x20, aimed from that player's eyes, without the camera-view check; the MP "flashlight" command (1001C363) sets frags 32 (police flashlight). Refused in co-op; hold forces FlashFlags/ScoreInfo resend; awaiting gameplay |
| P2 phone: small light only, no beam texture | OPEN: the beam pass (100AEA10) is per-client; the server sends P2 the same FlashFlags. LIGHT evidence lines added |
| P2 closing the menu unpauses while P1 is in it | Engine applies the last setpause/unpause (hw.dll 01D859C1/01D85A25). Host menu (IGameUI slot 11) + sv.paused attribution; host re-pauses; awaiting gameplay. Limitation: partner opening during a host pause is invisible |
| Players look like police | Simon model via SetClientKeyValue; awaiting gameplay (animations) |
| Main menu host | Custom Campaign entries + adapter host sequence; needs -dll launch (Start co-op menu.cmd or Steam launch options); awaiting gameplay |
| Dual wield in co-op | NOT ENABLED: inventorydualwield returns when IsMultiplayer (1001B6DB); DualWield 100DE990 is private |
| Prologue rain | Removed (user request) |

---

# Bug status — coop-fixes-004 (2026-10-11)

| Issue | Status |
|---|---|
| Lit circle in cutscenes ("post-process flashlight") | ROOT CAUSE CONFIRMED statically: client spotlight passes 100AEA10 (phone, FlashFlags 1/2), 100AEE70 (Glock, 4), 100AE540 (Maglite, 8) draw while the bit is set and 10072710 sees no view entity (gHUD+0x31C0, reset by ResetHUD/InitHUD). Log showed light=0: phone light. All bits cleared during holds and restored; ViewEntity re-sent; awaiting gameplay |
| No rain in co-op prologue | ROOT CAUSE CONFIRMED: client rain centered on lobby bodies (client 10085980, cl_entity origin), 1000 drops over 6000x6000; rooftop shots above rain height; kakelae refused in MP (100A99C9) and overwritten by the constant rain_modify (100F8150). Fixed with env_rain streak volumes; awaiting gameplay |
| Keypad code works for one player only | ROOT CAUSE CONFIRMED: per-player +0x2040/+0x2044; generators write activator/first player only. Shared session code; awaiting gameplay |
| Subtitles/objectives only on P1 | ROOT CAUSE CONFIRMED: subtitle_main/cof_objective use the first player. Mirrored/shared; awaiting gameplay |
| RC2 maps: native doors lose visibility; apartment return gap | Full s4_ overlay with converted doors; awaiting gameplay |
| Title train | USER VERIFIED FIXED (coop-fixes-003) |

---

# Bug status — coop-fixes-003 (2026-10-10)

| Issue | Status |
|---|---|
| Recorder says first-encounter line after Continue, no save | ROOT CAUSE CONFIRMED (CTapeRecorder::TapeUse 1007C987, player+0x21D8 m_bTapeReminder); set on restore; awaiting gameplay |
| No title train | ROOT CAUSE CONFIRMED statically: original startspeed 300 + t=0 toggle = stop at station; maintenance startspeed 0 + same toggle = early start. Toggle removed (stage coop-fixes3); awaiting gameplay |
| Light/phone visible in cutscenes | Screenshots: phone beam + phone model in camera shots. Flashlight (+0x1EA8) and entvars viewmodel (+0xBC) held every frame during a lease; awaiting gameplay |
| Shared notes without pickup glow | ROOT CAUSE CONFIRMED (CPasswordNote::Spawn 100835A6 sets renderfx 100); applied to cof_noteN_visual; awaiting gameplay |
| Saves only at c_start recorders | Generalized to every scoped alias; awaiting gameplay |
| Boat strands the partner (c_lake) | CBoat single driver (10022690/10022750); partner gather at boat_exit; awaiting gameplay |
| Small ladder hitches on P2 | Host SERVER_FRAME stalls (6-18 per minute, max 250 ms) with both games on one PC; diagnostic only |
| Code right of page after map change | OPEN, user-deprioritized |

---

# Bug status — coop-fixes-002 (2026-10-10)

| Issue | Status |
|---|---|
| P2 restore / landing | ROOT CAUSE CONFIRMED from the user log (card paths, equipped hard failure latched globally); fixed; awaiting gameplay |
| Post-processing on one player | ROOT CAUSE CONFIRMED (native activator-only effects); fan-out implemented; awaiting gameplay |
| Flashlight in cutscenes | Mechanism confirmed (player+0x1EA8, +0x5D0 bit 8); hold implemented; awaiting gameplay |
| Ladder reservation registered 192x | ROOT CAUSE CONFIRMED (engine returns world, not null); fixed |
| P2 jitter / ladder lag | Server cap 30 found; raised to 100; re-measure |
| Duplicate journal row | Native re-send at another slot suppressed; awaiting gameplay |
| Code right of page after map change | Cause unknown (log lost); host logs now archived |
| Train | Unresolved; retry and evidence pending a logged intro |
| Ladder lock, black box, P1 restore | USER VERIFIED WORKING on coop-fixes-001 |

---

# Bug status — coop-fixes-001 (2026-10-10)

| Issue | Status |
|---|---|
| Ladder softlock | ROOT CAUSE CONFIRMED (native single climber slot); per-ladder reservation implemented; awaiting gameplay |
| P2 ladder lag / jitter | CAUSE UNKNOWN; NET/SERVER_FRAME diagnostics plus optional A/B |
| Save without binding | The user's save already held distinct Steam IDs; the failing Continue was unlogged. Auto identities, Continue request file and -condebug added; awaiting gameplay |
| Code right of the page after a map change | CAUSE UNKNOWN; CODE_LAYOUT diagnostics |
| Black box on revisit | ROOT CAUSE CONFIRMED (c_start block wall 119); fixed in s4_start*; awaiting gameplay |
| Title train missing | Chain intact; never transmitted (packed=0); pack retry plus evidence; awaiting gameplay |
| Death/revival camera | USER VERIFIED FIXED — preserve |

---

# Bug status — Claude campaign-doors-001 (2026-10-10)

| ID | Status | Evidence / next |
|---|---|---|
| CAMERA after a downed-player cinematic | FIX IMPLEMENTED (camera-notes-001); inspected again, no new defect found | Needs real test A/B |
| Code layout drift | FIX IMPLEMENTED; client AddNote branch independently verified | Needs real test C; a reconnect without a process restart can drift once |
| SAVE-05 restore | INTERRUPTED last time; restore failures are now reason-coded | Needs real test D; copy the exact RESTORE line |
| c_apartment1 door 713 / 193 | NEW CONVERSIONS, untested | Real test E |
| Apartment return routes | GAP: apartment2 exits load RC2 s2_apartment1_e0..e5 with native doors and no latches | Next stage: overlay apartment2 and the apartment1 return aliases |
| Native inter_door visibility loss | ROOT CAUSE STILL UNKNOWN; server-side render and pack paths ruled out | Needs a runtime trace; keep converting doors |
| Converted locked buttons are silent | KNOWN LIMIT for 713/228/229 | Could add an activator-only locked text later |
| Title vehicle | UNRESOLVED; not investigated this session | Use the existing VEHICLE_STATE/VIEW_PVS logs |

---

# Current camera/note milestone and Claude handoff — 2026-10-10

Same physical repository: `%USERPROFILE%/Documents/Codex/2026-10-08/token-efficiency-and-context-management-this/outputs/cry-of-fear-coop`; branch main. Implementation commit
d3fc20f9a4a3d3b604a9664b60c4797d36316db4. The final handoff commit is the commit
containing this section; resolve the exact current hash with git rev-parse HEAD.
No repository relocation or Claude-only fork. User docs/DOOR_TEST.md edit remains
intentionally uncommitted and untouched.

Latest USER two-client evidence: computer/padlock, sounds, shared note acquisition
and access, tested E/audio/fade/relocation doors and player visibility WORKING.
Camera after downed-player cinematic FAILED; code layout drifts right. This
candidate implements both corrections; gameplay still pending. Latest save test
INTERRUPTED by camera, not failed. Historical failures below describe older builds.

Candidate: `%USERPROFILE%\Documents\Codex\2026-10-10\files-mentioned-by-the-user-consolelog-2/outputs/rc4-camera-notes-candidate.zip`.
Native002 SHA256 9de26b8b61581ff88ac3fa49f0ef21017097b2d97869f0c649780d4054a543f3,
512512 bytes. All eight map plans/BSPs unchanged from integration-001. Prior
`%USERPROFILE%\Documents\Codex\2026-10-10\files-mentioned-by-the-user-consolelog-2/outputs/rc4-integrated-candidate` is preserved and bundled for rollback.
7 native suites,66 Node,146 installer,9 Continue,8 PS parses and9 exact bundled
rollback artifacts PASS. Campaign audit203 aliases/0 missing routes,854 camera
occurrences,816 within scope. No real game installed/launched by Codex.

Read RC4_CAMERA_NOTES.md for native evidence, source changes, limitations and
RC4_CAMERA_NOTES_TEST.md for A/B camera roles, C note page/map changes, D fresh
Sewer Store slot/full restart. Save implementation unchanged:2active/4retained,
three c_start aliases,419/421 fixed checkpoints, not full world persistence.
Next task: run that one real two-client test; fix any failure from its exact map,
scene, roles and complete logs. Do not regenerate195 maps or revisit unrelated
network overflow. Four players and every cinematic are NOT gameplay verified.

Claude entrypoint CLAUDE.md references PROJECT_HANDOFF, NEXT_SESSION,
DEVELOPMENT_ENVIRONMENT, ARTIFACT_INVENTORY, SAVE_SYSTEM and KNOWN_BUGS.
Tool/path inventory verified locally; D:/E: metadata required approved reads.
Claude has its own permissions. Claude CLI is NOT FOUND in current PATH/standard
checked locations; installation/model availability not changed or assumed.

---

# Integrated candidate status — 2026-10-10

UI-01 white inventory: unresolved root cause; readiness/dedup correction supplied,
NOT a verified visual fix. NOTE-02 missing digits: native HUD resets code metadata;
post-readiness correction tested in fixtures, gameplay pending. DOOR-04: additional
scripted204 converted with original master+lock timing; reported door ID uncertain.
SAVE-05: hardcoded recorder and late staging corrected; placeholder action readiness
fixed; actual restarted restore still UNVERIFIED and full-world/full-campaign
support incomplete. INTRO-03: moving train never packed in provided log; narrow
cinematic PVS candidate implemented, actual visibility unverified. See release guide.

---

# Latest confirmed gameplay regressions — 2026-10-10

Shared note grants/access to BOTH players now WORKING. Preserve them.
The latest real two-client Steam/Sandboxie report is authoritative:

| Failure | Latest real two-client evidence | Established boundary / next evidence |
|---|---|---|
| RC4-UI-01 | P1 inventory UI/icons become white or corrupted after the second collected paper, containing the computer password. | Original password entity242, not username243. Cause unknown; compare forthcoming screenshots and full log against native inventory, AddNote/NoteDoc packets and resources. |
| RC4-NOTE-02 | After map change P1 sees padlock-note text but no numeric code; P2 sees the digits. Both own the note. | Shared validator digits do not prove client dynamic note content. Compare metadata and client initialization across the actual transition. |
| RC4-INTRO-03 | Title-reveal bus/vehicle still invisible. | Native Spawn succeeded in older log; rendering/PVS/position cause unknown. Existing observational callbacks37/39 must supply evidence before another edit. |
| RC4-DOOR-04 | After padlock and the scene/message approximately “Look to the right,” unlocked door uses the incompatible SP transition and loses visibility/teleport behavior. PROGRESSION BLOCKER. | Exact served alias and entity are not supplied. Door713 sd_door1 is a converted candidate, not a proven identification of this failed door. Trace runtime enable callers and retained doors on the served alias. |
| RC4-SAVE-05 | Sewer recorder E reports saving; fully closing both clients and custom Continue returns to padlock map/wrong location, empty inventories, missing notes/triggers/completed events. | SAVE/RESTORE FAILED. Existing writer and fixture passes do not prove restoration. Scope is three c_start aliases and fixed anchor; no position or whole-world serialization. Inspect preserved actual save and identity/load timeline. |

Exact new screenshots/log have not arrived; older logs cannot establish these
root causes. RC4_CHECKPOINT records actual valid save payload inspection, which
does not change RC4-SAVE-05 FAILED status. Next order: UI → dynamic note content →
scripted progression blocker → actual restore → bus. Prior GAME/ENV entries below
retain history; current authorized own -dll adapter supersedes map-only boundaries.

---

# Bug tracker — latest state

| ID | Issue | Evidence | Status / next action |
|---|---|---|---|
| ENV-001 | Game-library reads denied | Normal reads fail; approved fallback now succeeds | RESOLVED for authorized read commands; do not redo broad discovery |
| ENV-002 | Python aliases cannot execute | Both alias commands failed | Workaround: verified Node runtime |
| ENV-003 | Child environment probe stalled | Earlier bounded attempts timed out | Do not repeat; targeted approved reads already provide required data |
| ENV-004 | Copied native HLDS startup incomplete | Console initialized, fonts.wad warning, no map evidence, killed at 15 s | No retry; warning likely nonfatal by comparative ReHLDS source. Steam user-assisted procedure ready in GAMEPLAY_TEST |
| GAME-001 | Original same-map door loses mutual models | USER: original/control/v3 fail; v2 touch outward passes; v6 Use BOTH directions and actors preserve visibility | RESOLVED on selected unlocked49/50 pair by user-verified v6; broader story doors remain unconverted. Preserve omitted selector and exact point destinations |
| GAME-002 | Some doors/objects fail | Earlier general report; latest selected story section door opens and relocates both players | Door operation passes in reported route; broader compatibility not tested. Do not globally replace functioning doors |
| GAME-003 | Broader teleports/transitions malfunction | User report; selected same-map v6 path now passes both directions | Selected path VERIFIED BY USER; other doors/cross-map transitions remain untested |
| GAME-004 | Cutscenes inconsistent | User report; native bridge retains a camera | NOT TESTED; synchronize original events, don't delete cameras globally |
| ENV-005 | Transient second-client loading crash/unknown(1) overflowed | User's first attempt failed; restart/rejoin succeeded | RECOVERED by user; relationship to reproducible visibility failure UNKNOWN; preserve Sandboxie |
| ENV-006 | Child PowerShell staging cannot resolve Get-FileHash | 2026-10-09 full Node suite:34 pass,2 staging failures; direct withdrawal/rollback checks work | Environment limitation recorded, no repeated attempts or staging infrastructure changes. Quiet-specific2 tests pass |
| GAME-006 | Use dispatch succeeds but explicit-empty-selector relocation fails | V5 marker/cue for both, no move; v6 omits message and USER confirms both actors/both directions/mutual models pass | RESOLVED for selected pair; internal null/empty cause not measured. Preserve v6 baseline |
| GAME-007 | Door presentation missing | USER: V7 audio and V8 full fade49/50 pass both actors/directions/mutual models | RESOLVED for reference pair. Production derivative removes probes; new alias runtime NOT TESTED |
| GAME-008 | Cafe same-map transitions require story-condition adaptation | USER latest V9 cafe failure;204 kill345,206 disabled4/enable414 via413/kill412 | V10 candidate ready: original names/killtargets, shared enable/life masters and load reset; actor/gates/removal/pending fade/reload require gameplay. No complete-map claim |
| GAME-009 | Native note pickup grants only collector | USER now reports v11 delivers to both and both readers open | Delivery/reader behavior confirmed in reported run; manual journal reopening, content equality, role reversal and duplicates not separately reported. No full note generalization |
| GAME-010 | Shared note opens non-collector reader | V11 both readers; USER v12 clarification: P2 gets note, P1 no notification/addition | V12 FAILED/WITHDRAWN. Normal closedocument archives through100DA6D0 and sends AddNote; immediate menu close does not explicitly do that. Missing handshake hypothesis pending one P1 closedocument check. V11 preserved; no further speculative timing variants |
| GAME-011 | Ground loot must be independently collectible per player | USER request; c_start2 contains no placed weapons/ammo/healing. Native weapon-stay checks weapon type and respawn, CItem consumes shared object | NOT IMPLEMENTED: no verified native BSP per-entity claim/recipient-hide interface. First map/pickup/location requested. See PICKUP_RESEARCH; supported native extension absent |

Internal game-DLL causes remain unmeasured. FGD confirms native spawn/model/teleport interfaces,
but isn't evidence of a successful runtime fix. A missing-WAD warning doesn't prove
why startup stalled. Static target warnings are not confirmed game bugs.
