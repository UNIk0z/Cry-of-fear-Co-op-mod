# Door presentation design and evidence

V6 c_start2_useselect from759c141 is VERIFIED BY USER for independent P1/P2
Use relocation, both directions and mutual visibility. Audio/fade not tested.
The v6 BSP SHA stays c4a310d5ff2ef72f8794044cbc38b9d3447f836b9a4ce07b02a92c8b245b1566.
No original inter_door path is restored. No player render/model/network writes.

## Original presentation evidence

Selected original entities49/50, brushes*6/*7, both have:

| Field | Exact value / meaning |
|---|---|
| opensound | doors/doormove1.wav |
| closesound | doors/doorstop8.wav |
| doortype | 0; undocumented engine interpretation |
| musicfadein / musicfadeout | 2 / 2; music timing, not screen fade duration |
| music / newlevelsnd | absent on this pair |
| unlockedsnd / lockedsnd | buttons/latchunlocked1.wav / buttons/latchlocked1.wav; not needed for these unlocked doors |
| fade duration/color/alpha, teleport and close delay | not exposed in BSP or inter_door SDK fields |

Original door/destination positions and yaws are retained. WAVs exist in the
snapshot, PCM16mono22050Hz; opening1.1388s, closing0.7651s. Exact hashes/fields:
work/original-door-presentation-001.json and work/presentation-support-001.json.
No asset substitution, edit or redistribution. Internal original timing,
control locks, music stopping, camera and other effects are unmeasured.
The pinned unofficial Xash recreation uses black255, out0.15/hold0.05,
teleport0.15, in0.25. Those values are not the original Steam implementation;
we do not present them as exact fidelity evidence or call its door function.

## Audio A: c_start2_dooraudio

Direct v6 button -> cof_teleport is retained, with message still omitted and
destination pairs unchanged. Access beep is replaced by positional story audio.
Opening ambient is appended after the existing helper and emits at the arrival
position on the same target fan-out; closing is fired1.20s later by a separate
multi_manager. Only audio is delayed, so player selection remains direct.
This deliberately tests audibility with immediate relocation; it cannot reproduce
the original opening-before-relocation timing. B adds that sequence.

ambient_generic flags50 = small radius2 + start silent16 + nonloop32, channel6,
volume10, pitch100. Exactly one emitter/event; no per-client duplicate broadcast.
Nearby players may hear it. No guaranteed private audio mechanism was established:
SDK ambient target names an entity to emit from, not an activator/client receiver.
trigger_command exposes a command only, not a documented private client selector.
We omit target, global Play Everywhere and speculative selector tokens.
Native examples confirm start-silent/nonloop usage; flags/radius and repeated
playback remain Steam gameplay gates. [Valve sound reference](https://github.com/ValveSoftware/halflife/blob/master/dlls/sound.cpp)
supports positional nonloop retriggering but does not prove CoF's implementation.

## Fade B: c_start2_doorfade

Button -> multi_manager (threaded flag1) -> opening sound/out fade at0 -> exact
v6 point helper1.20 -> closing1.25 -> fade-in1.35. Diagnostic marker is moved to
the start target; its existing all-player HUD broadcast is retained.
SDK env_fade flags4 (activator-only out),5 (activator-only in), black255,
out0.60/hold0.90, in0.60/hold0, no Permanent8/Modulate2/FireAtCamera16.
These configure screen effects, not model visibility. Finite hold plus explicit
fade-in reduce black-screen risk; actual recovery must be tested.

[Valve multi_manager reference](https://github.com/ValveSoftware/halflife/blob/master/dlls/triggers.cpp)
stores an activator handle per clone and supplies it to timed FireTargets.
SDK multi-threaded1 matches. Thus this chain is supported, not an assumption
that every delay preserves the actor. No trigger_relay or generic CBaseDelay
delay is inserted in the relocation path. Community reference agrees but is
not Steam proof. [Valve env_fade reference](https://github.com/ValveSoftware/halflife/blob/master/dlls/effects.cpp)
routes flag4 to one activating client. Both classes export from the installed
snapshot. No matching env_fade/threaded manager was present in the three targeted
reference maps; their absence neither proves support failure nor runtime success.
Delayed activator retention/fade independence need actual two-player testing.

## Timing, reset and limits

| Time from accepted E | B event |
|---|---|
| 0.00s | Original opening WAV; fade toward black |
| 0.60s | Intended full black; hold until1.50s |
| 1.20s | Unchanged v6 point teleport |
| 1.25s | Original closing WAV at destination |
| 1.35s | Fade from black begins |
| 1.95s | Intended clear gameplay view |
| 2.50s | Shared button cooldown, allow3s before testing reuse |

Timing is an adjustable approximation based on sample duration, not measured
original choreography. Edit PRESENTATION_TIMING in build-door-presentation.mjs,
then regenerate maps/manifests and fixed-hash installers. Do not hand-edit a
packaged manifest; hash guards reject changes. Never mark timing PASSED from
these configuration checks. Think scheduling/client latency can affect order.

Both variants lengthen the existing shared button wait1 to2.5s to cover audio/
fade and prevent retrigger during the sequence. This is per panel, not per
player: same-panel simultaneous E may accept only one; the other retries after3s.
Threaded sequences protect accepted activations, including opposite-door overlap;
this must be verified. No player input lock is added; stand still during initial
fade tests. Broader per-player cooldown/control-lock behavior is deferred.
If two accepted sequences select the wrong actor or a screen stays black, stop
and use host changelevel c_start2_useselect. No rejoin/model restoration workaround.
General locked/puzzle/story door conversion stays deferred until presentation passes.
