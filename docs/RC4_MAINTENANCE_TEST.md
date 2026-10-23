# One ordered two-client regression

Install using START_HERE.md in both actual Steam/Sandboxie environments. Keep
RC3 build007 and the delivered hotfix for comparison. Start NEW through
`Host RC4.cmd`; both clients join before either readies. Enable `condebug` once
on each client if disabled (it toggles logging); note its response. Enter
`echo STORYCOOP_RC4_MAINT_BEGIN` in each console. Keep player names unchanged.

At the FIRST failed row, stop the run, record row/map/P1/P2 symptoms and save both
logs. Preserve any save plus backup before continuing independent tests later.
BOOT/MAP/COMMITTED/readback messages alone do not prove rendered/playable state.

| Order | Action | Required actual result |
|---|---|---|
| 1 — ready | Both joined; only P1 ready, wait75s. Then P2 ready. | Intro waits for P2; both receive original scenes/effects. |
| 2 — title | Watch original title sequence on both clients. | Original animated vehicle present, rain retained, no static-rain warning; record any brightness glitch. |
| 3 — final intro | At final camera release, both remain still; let automatic progression run. | Transition to s4_nightmare without either player moving or a manual map command. If stalled20s, record evidence before trying one P2 movement to confirm old symptom. |
| 4 — nightmare/wake | Complete nightmare normally. | Both have camera equipment/control; automatic s4_start wake; visible player models, usable HUD/control and required inventory. |
| 5 — shared state | Collect notes/clues and extras normally. Record each player's health/weapons/clip/reserve/healing/equipped plus both journals. Cafe round trip s4_start2 → s4_start_e0 normally. | Native inventories retained, shared note contents/code retained without duplicates, completed wake/scare do not replay. Phase A prerequisite for saving. |
| 6 — padlock/audio | Both stand near lock; use sequentially. P2 changes wheels, tries wrong code, then canonical clue code; P1 stays out of UI. | Original wheel sounds, original unlock sound only on real success; no doubled playback; P2 recovers view/HUD/control. Canonical code remains valid. |
| 7 — padlock door | Before solve confirm locked. After solve each uses sd_door1 separately; repeat/return if originally permitted. | E → original audio → black fade → individual intended room → fade back. Other player stays put; both visible; no map change, progression intact. |
| 8 — apartment event | Follow natural route to s4_apartment1_e3/e7, office door228/229 near original3b_exit2/1. Trigger original mini-scene. | Intended temporary lock at scene start; original completion unlocks both directions. Each independently gets verified door sequence/destination/visibility. Return works; completed scene stays completed on re-entry. If different door, give location/map. |
| 9 — A/B save | Return to supported s4_start_e2/e0; wait for actions to finish. Give P1/P2 different health/weapons/ammo/healing/equipped. Record exact values/journals/code. Host assigns profiles if required; selects slot1 and uses Storage Tunnel recorder. | Host COMMITTED only after file exists; both records captured. P2 Use does not write/claim save or leave black/frozen UI. First presentation may need second Use. |
| 10 — C/D restart | Close BOTH entire games. Host runs Continue RC4 slot1.cmd (custom path/slot in CHECKPOINT.md). Rejoin P2; rebind same person/profile from current status IDs if needed. | Each own saved health/weapons/loaded/reserve/healing/equipped, notes/code/door/event progression restored, clear checkpoint landing, control/HUD/models visible; no extra story grants. |
| 11 — E repeat/reconnect | P2 disconnects normally; host saves alone to slot2. Continue slot2; P2 rejoins. Change ammo/health and save again at supported recorder421; restart again. | Absent P2 record retained. Latest connected/absent states restored correctly; no duplicates/corruption, valid backup made. Recorder421 resumes at same Storage Tunnel419 anchor. |
| 12 — F original SP | Close games. Launch normal original single-player WITHOUT adapter/-dll through usual Steam menu. Use original recorder/save/load. | Original single-player saving/presentation remains normal. |

Two-player listen-server host stays P1, so a complete reversed live slot order
test is BLOCKED by current two-player checkpoint scope. Automated fixtures
reverse saved-record order and restore by identity; that is not a runtime Test D
pass. Different guest order/four active players require additional safe landing
and state plans. Do not infer those results from rows9–11.

Checkpoint world reconstruction has explicit limits in CHECKPOINT.md: ordinary
physical pickups/enemies/temporary entities can reset. Report any such effect
separately from inventory restoration; whole-campaign save completeness remains
BLOCKED. Save creation or a one-player restart cannot verify the full system.

Host diagnostics retained: VEHICLE_SPAWN/NATIVE_THINK record native acceptance/
dispatch, not visibility. Opening maps show scope0/OPENING_PASSIVE; wake maps
scope1. Save/load: retain COMMITTED/LOAD staged/RESTORE FAILED lines and the
host-owned slot/backup. Existing collect-story-log.ps1 is included.

Rollback: close both games, run this package's remove.cmd in both environments,
then reinstall the retained hotfix or launch preserved RC3 build007 without-dll.
Never force an unknown-hash overwrite/removal. Checkpoint files remain retained.
