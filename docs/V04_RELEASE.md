# Cry of Fear co-op v0.4 (2026-10-18)

v0.3 after a full audit of its changes (v0.2 776590b -> v0.3 36ac200). The
maps are byte-identical to v0.2 and v0.3; only the adapter and the launcher
changed. Details, evidence and the review of every v0.3 change:
docs/V04_AUDIT_HANDOFF.md in the source.

| Report (v0.3 playtest 2026-10-17) | Root cause (evidence) | Change | Status |
|---|---|---|---|
| Loading a save crashes (it hangs; Windows logged "not responding") | Reproduced on this PC with Katz's own slot 1 under a debugger: the game executes address 0x70 in CheckDesiredList -> ApplyDesiredSettings (hl.dll 100C4120 / 100C3E50) from the first PlayerPostThink. Katz's Steam dump of 23:17:43 has the same fault. v0.3's map state removed already-fired trigger_autos before ServerActivate; ServerActivate still ran their Activate, which puts them in Spirit's assist/desired list, and the engine then freed them while still listed. Steam's crash handler then hung the game. | A removed entity is made dormant (ServerActivate skips it), its assist/desired flags are cleared and it is unlinked from the list before it is freed. The same applies to every entity the adapter removes. | Fixed. Runtime: Katz's slot 1 now loads on this PC (host), restored player, no exception. |
| The same crash on a revisit (tester, s4_start2 -> s4_start_e0) | Same code path: the revisit restore removes the same entities. | Same fix. | Automated tests pass; revisit not replayed at runtime. |
| P2 in a dark box after the scene behind the door right of the padlock door (s4_start_e0) | Scene `multiscene3`: cof_teleport moves only the activator into the staging room `teleportdes` at 0.5 s and out to `teleportdes2` at 15.4 s, in the frame the cameras end. v0.2's partner follow needed a live camera, so P2 went in with P1 but never came out (log: one SCENE_TELEPORT line). | A partner follows a scene teleport that happens up to 1.5 s after the camera ended, and a partner moved by a scene keeps following that player's teleports while still standing where the scene put them (30 s after the scene). If the activator leaves the game, the partner goes back to where they stood. | Fixed. Automated tests pass; two-player runtime NOT verified. |
| No crash report from the crash | Steam's crash handler acted first; v0.3's report only ran for unhandled exceptions. | The report (log line + dump in storycoop_logs) is now written at the first chance. | Automated tests pass. |
| "Run Co-op Mod.cmd" asks H or J | - | A double-click opens the co-op game. Joining: console `connect <host IP>:27015`, or `"Run Co-op Mod.cmd" join <address>`. | Done. |

## Vote to skip a cutscene (new in v0.4, Katz 2026-10-18)

During a scene camera SPACE (the jump button) is a skip vote; "SPACE to skip
k/N" shows bottom-left to everyone for 3 s when the scene starts and after each
vote, then disappears. N = players in the game (connected, HUD ready, alive),
so 1/1 alone. At N/N the scene is fast-forwarded, not cut: each running
multi_manager of the scene fires every remaining target in order through the
game's own ManagerThink (exit teleports, item and weapon grants, SMS, music,
fades), managers and delayed relays it starts are fast-forwarded the same way,
and the scene's cameras still on are switched off once (the camera's own end
gives every player view and controls back). Partners follow the exit teleport
as in a watched scene. Log: `SKIP offered/not offered/vote/fast-forwarded`.

Not offered (fires something that depends on time; 42 of 195 camera scenes on
the s4 maps): s4_apartment5 balkongscene (monstermaker, scripted_sequence),
s4_attic multiyoudie2 (cof_killplayer) and multidydoc (cof_mdlcutscene),
s4_bridge multikuken/multikuken2 (func_train), s4_ending1c/2c/3c multisd
(cof_strangle) and multicredits, s4_ending4b multiending5/multicredits,
s4_ending5c multiend5 (func_train) and multiendcr (credits), s4_nightmare
openings (passive map anyway), s4_roofs2 multistartitall and s4_sewer3
multisecsene (boss health bar), s4_subway1st1 togscene, s4_subway2st3
multitscene2 and s4_subwaysick2 multiirldoctor (func_train), s4_subway2st1
multitb2 (monstermaker), s4_start (first-visit alias) multiscene3 and
slower_eyes_mm (game_zone_player). The reported s4_start_e0 multiscene3 IS
skippable.

The audit of 142 scene chains on the installed maps found 50+ others with the
same shape (an exit teleport at or after the camera end); they use the same
fixed code. See the handoff for the list.

**Existing saves:** v0.3 saves load (slot files unchanged). A save made while
P2 was stuck in the box puts P2 back in the box: type `stuck` in chat (Y) to
be moved next to the host.

Version text: "Co-op mod v0.4 developed by Anas Sammak (koolkat)".
