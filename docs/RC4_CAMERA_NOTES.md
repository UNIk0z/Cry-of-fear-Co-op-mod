# Camera and note candidate — 2026-10-10

Implementation completed; real Steam/Sandboxie validation is still required.
Latest USER gameplay evidence confirms computer/padlock validation, padlock sounds,
shared note acquisition/access, tested E doors/audio/fade/relocation and player
model visibility. Save/load verification was INTERRUPTED by the camera bug; this
is not a failure report for the integrated checkpoint implementation.

## Root causes and correction

The pinned server's trigger_camera Use (10113B60) assigns all clients a view.
Timed completion (1010B2D8–1010B333) and explicit stop (10113BF3–10113C4E)
guard SetView, control release and takedamage restoration with IsAlive. Both paths
subsequently clear m_hCurrentCamera (+2348) even for down players. Multiplayer
revival (100E9AB0 onwards) restores health/deadflag/weapons, but does not SetView.
This is a native game-logic mismatch consistent with the supplied reproduction.
It is not an independently reproduced real-client trace.

camera-runtime.hpp tracks each player's owned camera, previous native view,
serial and pre-scene control flags through SDK SetView92 and PreThink23.
It waits for native camera active flag entvars+248 to clear (no replacement
cutscene timer), then restores only a stranded client's view. Both engine SetView
and native registered ViewEntity/ModelAttach messages are synchronized; the native
view cache +2038/+203C is updated. Dead health/deadflag/view offsets/observer flags
remain native. Control and damage restoration waits for native revival, respects
other interactive view handles and restores only camera control bits 0x1080.
Native living-player cleanup takes priority. Chained/alternate views, freed camera
references, player serial reuse, disconnect and map reset are guarded. Original
SP and passive intro/nightmare paths remain excluded. Four slots are fixture-tested;
actual four-player gameplay, every campaign cinematic and reconnect timing are not.

The pinned client AddNote handler (1006F668–1006F793) reads the first digit's current
x, adds the code-label width, then positions four original digit images. Repeating
a positive code/type packet repeats this relative translation. Native HUD sends
zero-metadata archival records; the prior adapter replayed canonical metadata,
which could repeat that layout branch. This explains rightward drift without any
modified text resource, line break or font. HUD_VidInit calls 10098930: existing
viewport is reused; journal reset 1002B0D0 only hides it, not resetting coordinates.

note-layout.hpp buffers native AddNote to retain exact original records and grant
metadata. It sends the original code/type layout once per connection/slot, after
client readiness. Later identical registrations preserve codeFlag=1 and the full
codeValue, but type=0 skips only the already-completed client layout branch. Native
zero-metadata refreshes are replaced with known canonical metadata. The journal,
save schema, code validation, original TGA glyphs/labels and native scaling are
unchanged. A new client connection gets its own first layout. Install with BOTH
client processes closed to discard positions already corrupted by the old build.
Live resolution changes, reconnect without process restart, and client panel
recreation need explicit gameplay observation; server-only layout tracking cannot
inspect client widget memory. Do not claim these are verified.

## Independent verification by Claude (2026-10-10)

The rest of the client AddNote handler was disassembled
(`1006F320..1006F870`, client.dll from runtime-baseline-001):
- codeValue 0 or codeType 0 jumps to `1006F7F9`, skipping label SetImage, digit
  SetImage, GetPos/GetSize, all four SetPos calls and SetVisible.
- The per-slot code flag `+0xBC` is written from codeFlag before that branch, so
  a `codeFlag=1, codeType=0` packet keeps code-note mode and leaves the already
  positioned digits untouched.
- The journal list click (`1002AFB0`) uses that flag.
- Journal reset `1002B0D0` is only `SetVisible(false)` on the parent panel.

This confirms the once-per-connection layout design. Native death/revive
(`100E9AB0`) never calls the engine SetView (`102230B8`), so the camera lease
cannot be bypassed by a down-time view change. No code change was needed.

## Changed files and preserved artifacts

Changed: native/rc4/adapter.cpp, new camera-runtime.hpp and note-layout.hpp,
build.ps1/test.ps1, adapter fixture and new test-camera-notes.cpp;
scripts/package-state-rc4.mjs adds an exact pinned native-only update profile.
All eight maps/plans remain byte-identical to integration-001. No 195-map rebuild,
new assets, original DLL modifications, private calls, camera fanout or scene
rewiring. Native journal/puzzle/checkpoint implementation files are unchanged.
This candidate includes the exact integration-001 plans/DLL for rollback.

## Validation and remaining work

Seven owned native suites and 66 applicable Node tests pass. Native build verifies
x86 API140, all 846 export names/ordinals and 843 preserving tail jumps. Fixtures
cover down-before/during, revive-before/after end, reverse roles/four slots,
observer/alternate view, camera chaining, serial/free guards, code layout replay,
map registration, per-client metadata and checkpoint round-trip/reconstruction.
The numeric scaling fixture checks no cumulative offset at six widths; it is NOT
rendered UI verification. Two historical environment-only staging suites remain
excluded. Installer/rollback and final package results are recorded in QA.json.

Run TESTING.md A/B/C/D once. Save scope remains two active/four retained identities,
three c_start aliases, separate recorder419/421 fixed checkpoints; no full-world
snapshot. No real game was installed or launched during this implementation.
