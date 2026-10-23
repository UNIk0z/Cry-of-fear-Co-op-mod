# Original scenes and ready lobby

USER: P2 misses some scenes and joining can interrupt ongoing scenes. FAILED.
Native trigger_camera factory10115DF0 ->10107FB0/vtable101E4170;
Use10113B60 already loops all clients and uses SetView10117180. Re-triggering it
per client risks toggling it off, so no per-player fan-out is introduced.

311 existing cameras retain paths, targets, timings and controls. RC2 adds only
SDK flag1024 Unskippable. IMPLEMENTED — AWAITING GAMEPLAY VERIFICATION; this is
a skip guard, not a P2/join repair. Camera termination and player join restoration
still need a supported lifecycle adapter or precise runtime evidence.

Original c_intro world.iuser1=1 plus native cof_lobby_start -> one-shot relay ->
original multiintroduct is the entry candidate. GameRules readiness completion
100C9EBF activates cof_lobby_start; Use100A4500 fires its message target. Full
initialization, both-client intro and control restoration are runtime pending.

The inspected late-camera100F7836 path is only for c_video_stress_test. It is not
evidence for ordinary late joins. Do not claim that analysis found the join cause.
RC1 Host Coop Game resource insertion FAILED; RC2 supplies a separate Steam
launcher without modifying GameMenu.res. Its actual launch/lobby is unverified.
