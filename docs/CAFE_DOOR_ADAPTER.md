# Current scope — 2026-10-10

This canonical lifecycle example remains retained by RC2/RC4. Shared note grants/
access are now verified BOTH, but host UI/content regressions are separate. New
post-padlock scripted-door failure is NOT established as cafe204/206: exact alias/
ID unknown. Preserve authored enable/kill conditions and use this adapter as a
reference, not an assumption that every scripted door is already covered.

---

# Cafe lifecycle adapter

Source is pinned original c_start2 SHA3933456e...157e; reference V8 SHA4a0e1d...6a23.
The general converter remains conservative. build-cafe-doors.mjs applies a
separate guarded map-specific profile; unexpected hashes/dependencies reject.

| Original dependency | Adaptation |
|---|---|
| 204 cafedoors -> exit205 | Named func_button, original *14, Use + V8 presentation |
| 206 cafedoors2 -> exit203, flags4 disabled | Named func_button, original *15, shared enable master |
| trigger_once413 -> cafedoors2en | Unmodified trigger/brush/target |
| inter_door_disable414 frags1 | env_global with SAME targetname, explicit On (idempotent) |
| relay345/412 killtarget cafedoors/cafedoors2 | Original killtargets retained; each additionally turns life state Off |
| computer244/button245 -> multimystery339 | All original records/events/delays unmodified |
| accepted move pending when panel is removed | Delayed helper is a threaded multi_manager with life master; native cof_teleport only called while alive |
| repeated alias loading | trigger_auto -> reset manager forces alive On and return-enable Off |

Each multisource is read as a global-state master with NO registered inputs;
no target or manager event targets the master itself. Thus its globalstate
controls IsTriggered without toggling its input list. Master checks do not
substitute the E activator. Original enable is shared/idempotent; life is separate
so a late enable cannot restore a removed door's pending relocation. Accepted
fade-in continues to clear the screen after cancellation. Audio may still finish.

All helpers have unique names and native point cof_teleport OMIT message. No
render flags or player state are changed. 11 original records change, 432 raw
records remain verbatim, 36 helpers are added; original bytes12..EOF and all14
other lump offsets/lengths/hashes remain intact. Notes242/243 are unmodified.

SDK evidence: staged cry_of_fear.fgd env_global1484, multisource3227,
multi_manager3243 base Master, trigger_relay4045, inter_door_disable4408.
Installed Steam snapshot exports env_global/multisource/trigger_auto and existing
button/manager/fade/teleport classes. Export presence proves registration only.
[Valve buttons.cpp](https://github.com/ValveSoftware/halflife/blob/master/dlls/buttons.cpp)
supports master/global-state lifecycle; Steam CoF semantics still require testing.
In particular env_global initialstate does not reset an existing table entry,
which is why explicit load reset is necessary. FGD describes Spirit manager
masters; the public Xash recreation lacks equivalent checks and is not native
Steam behavior evidence.

Static test models check generated state wiring, enable idempotence, delayed
removal refusal, finite reveal and reload reset. They do not execute game-DLL
Use callbacks. Initial disabled return, accepted actor, timing, concurrent removal
and full cafe story sequence are explicit gameplay gates. Original lock messages
and built-in inter_door music fades remain limitations; the proven presentation
chain is deliberately not rebuilt. No other map or binary is modified.
