# Cry of Fear co-op v0.2 (2026-10-16)

v0.1 plus a map pass (113 of 194 maps, entity lump only, built by
`scripts/build-v02-maps.mjs` on the delivered v0.1 maps) and adapter changes.
Automated checks passed; **nothing below has been played yet**. Test steps
are in TESTING.md (docs/V02_TEST.md).

Source of truth for every change below: the read-only decompilation
(`%USERPROFILE%/Documents/Codex/cof-decompiled`) and the original `c_*` maps.

| Report | Root cause | Change |
|---|---|---|
| Staged cutscene models stand idle before their scene (several scenes; the handgun scene's actor is `scene1_1`, tauruss.mdl) | Single player hides every staged actor when a level starts. The arriving player stands in, or is teleported into, a start trigger whose chain hides them at 0 s: c_apartment1 trigger_once 343 → multispawnhe, c_asylum1 2 → multistartas, c_start 120, c_attic 56, and so on. The env_customize uses m_iVisible 2. Co-op players arrive on cof_coop_spawn points, a revisit is a fresh map load, and apartment1's chain was gated to the first visit. As a result 65 aliases of 25 maps showed staged actors at load. v0.1 hid a list of Simon models in first person; that list never covered tauruss.mdl and hid nothing else. | Every actor such a chain hides, and that a scene later shows (named env_customize m_iVisible 1), gets an unnamed env_customize m_iVisible 2. That is the game's own spawn-time path (PostSpawn → DesiredAction). The hides are idempotent, so a first visit that still runs the chain is unchanged. The v0.1 Simon model hiding is removed. |
| Apartment lamp sparks loop; kids static (013 report) | The same start chain switches the sparks off at 0 s (env_spark toggles on any Use). | Those sparks start off, and that one toggle is removed from the chain. The end state is the same with or without the chain. |
| Simon stands at the apartment start on later visits | The intro chain (gated to the first visit) hides `fuckingplayer` (player3.mdl) only at 10 s. | It is hidden at load and shown again by the chain at 0.1 s, so the first visit plays as before. |
| Elevator (s4_apartment1, ground floor → fourth floor) did not teleport the players; players invisible | trigger_once *126 starts cameras hisskam1/2 for every client. trigger_cofteleport *127 (CTriggerCofTeleport::Touch) moves only a player whose hull touches it to `hiss1_land1`. A partner outside the car stayed below; two players in the car were put on one point. | When a player watching a scene camera jumps more than 256 units in one frame, every other living player watching the same camera is moved beside them (find_landing + teleport_to). A player left inside the jumper is moved aside. Log: `SCENE_TELEPORT`. This applies to every scene-driven teleport of one activator; door relocations and arrivals have no scene camera and are not touched. |
| Doors that change music/ambience are silent when opened through the co-op door | CInterDoor::EndSequence plays the door's music (loop = spawnflags 2); `silentroom` stops it; `propertarget` fires. The converted doors only set the `sv_coop_music` cvar, which the game reads in PlayerSpawn and nowhere else. Converted level-change doors had lost their `music` key. | Doors now run `sc_door_music <track> <loop> 0`: every player gets the track, and a player who already has it is not restarted. This is the multiplayer trigger_mp3 rule through the PlayerSetMP3 fields (+0x2310..0x2320). 254 door music commands, 26 silent rooms, 2 propertargets and 112 level-change doors carry their music again. The music is saved with a checkpoint (schema 7) and set before players spawn on load. A reconnecting player gets `sv_coop_music` from the game's own PlayerSpawn. |
| P2 stuck in the ladder animation going down; ladder jitter | Only one climber slot exists (CCoFLadderManager, decomp CoF_Ladder.cpp). Our lock counted the climb camera only within 384 units of the manager, but ladders reach 528 units. Mid-climb the lock dropped and the other player's E took the slot, stranding the climber frozen. The camera moves in 48-unit steps that a remote client interpolated while the restarted sequence already played. | The lock holds while the climb camera carries the ladder's own model (within 1024 units). The climb camera gets EF_NOINTERP. The other player seeing the climber's body stand at the base is native: the player models have no climb sequence, and no third-person tricks are used. |
| P2's camera jitters while standing still | Not found statically. The adapter writes no movement or view field every frame. The native PreThink/PostThink has no idle write to view_ofs or punchangle. | Read-only diagnostics: for a still non-host player, the predicted fields (origin, velocity, view_ofs, punchangle, flags, fuser/iuser/vuser, ...) are compared between the stages of each command. A line `IDLE_DIAG player=2 field=... at <stage>` names any change outside pmove (every 10 s). No smoothing or prediction change is made without that evidence. |
| P2 sees "Only P1 can save" just by looking at a recorder | The v0.1 proximity notice. | Removed. Only an actual recorder Use by the partner prints "Only host can save the game", to that partner only. Host saving is unchanged. |

Unchanged and to be kept: Steam names, the train fix, the Glock for every
player, inventory carry and co-op saves.

Version text: "Co-op mod v0.2 developed by Anas Sammak (koolkat)".

Built from commit c62556c plus the uncommitted v0.2 working tree (see
`git status`; not committed without the user's permission).
