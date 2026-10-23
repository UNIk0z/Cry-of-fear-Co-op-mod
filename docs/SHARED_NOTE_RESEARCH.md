# Native note grant and one-note adapter

Update: user reports v11 delivery/readers on both players; both readers opening
is now the UX defect. See QUIET_NOTE_RESEARCH for the traced native UserDoc
opener and separate v12 candidate. Earlier untested statements below describe
the preparation checkpoint; manual journal reopening remains unreported.

The actual c_start2 has two cof_passwordnote entities:242 password (usertype1)
at(-600,1086,-602),243 username (usertype absent/default0) at(27,2069,-518).
They have no fixed journal-ID key or downstream target in the original records.
Computer244 is cof_computer named computeron. cof_document is the SDK readable
document entity (page1..4/note1..4/label). cof_addcodenote selects PC/video/window
codes and is not a documented arbitrary story-note grant to all players.

## Evidence from the installed Steam DLL

Read-only Microsoft dumpbin inspection used bounded function ranges on the
existing work snapshot, then actual Steam hl.dll hash matched the snapshot:
`0036b91c01e92ed205513f52563053a55a66a32d257efb5f476b8f1f3dde0e63`.
Image base10000000; no debugger, injection, replacement or patch was used.
Raw bytes/disassembly/research copies remain in work/note-source-001, outside Git.

Export `CPasswordNote::NoteUse(CBaseEntity*, CBaseEntity*, USE_TYPE, float)` is
RVA83120 (bounded body83120..83410). Observed flow:

- Rejects null/non-player activator; obtains its player object and finds
  cof_computer. Valid computer credential indices are required.
- When the note's created flag at object+100 and cached-document pointer at+104
  are both clear, creates a native cof_document, configures its username/password
  text and original page art from that computer's credential indices, calls its
  Spawn, and caches the document pointer on the NOTE instance.
- Only this first-creation branch assigns the document handle on the activating
  player at object+630 through VA10017740. A follow-up check of17740..17776
  identifies an EHANDLE-style assignment (edict pointer and serial), NOT a
  journal-list insertion. The same helper stores the multi_manager activator.
  Client-side persistent journal storage was not traced; readable-journal proof
  remains mandatory. An earlier interim collection-insertion inference was
  corrected before delivery.
- Both first and later paths send the existing recipient-specific engine user
  message: MSG_ONE, original registered message ID, type1 username/type2 password
  and corresponding computer index. Client notification/display must be tested.
- The cached branch bypasses document-handle assignment for a second player. No
  SUB_UseTargets downstream callback appears in this complete function body.

Thus reusing one note's Use can notify another player without setting their
document handle. Whether that alone prevents journal storage is unproven. A
fresh helper per recipient preserves the entire native first-use path and avoids
that shared state. The reported original pickup is player-specific and does not
invoke the note handler for other players; that already explains absent packets.
These findings are limited to the two credential notes, not every document class.

Native Note Spawn (VA10083510..835E5) sets the small original note bounds,
solid state, drops to floor, and installs NoteUse. It does not add an
all-player loop. Private cache fields are not mapped SDK keyvalues; no attempt
was made to change object memory or reset them through invented BSP keys.

Native game_zone_player is exported. Its factory resolves to vtable101D406C;
Use at VA100BB3F0..BB57A loops slots1..maxClients, gets each valid player,
chooses IN or OUT branch, and passes that player as the FireTargets activator.
Lookup10119680..196B2 rejects invalid indices/free edicts and returns private
player data; zone skips null results. This establishes an existing native
enumerator, beyond generic SDK assumptions. Both branch targets are identical
in the experiment, so players need not stand near the collector or zone brush.
[Valve maprules.cpp](https://github.com/ValveSoftware/halflife/blob/master/dlls/maprules.cpp)
also describes player-zone and counter dispatch. CoF registration confirmed for
game_counter, env_model and func_button. Counter Use at VA100BB160..BB220 was
also checked: Toggle/On increments frags, exact equality with health fires
SUB_UseTargets with the SAME player activator, flag1 schedules removal, flag2
would reset (not set here). Thus a fired counter cannot grant again on later
iterations even before deferred removal, as its count no longer equals its limit.
Their full runtime behavior and button interaction remain explicit test gates;
export names alone are not gameplay proof.

## Implemented smallest experiment

Original username243 becomes an env_model visual using its original model,
origin/angles. A compact *19 brush copied by reference from the existing computer
button is translated to the note, rendered transparent, made non-solid (SDK
flags129=Don't move+Not Solid), and accepts E once (wait-1). No geometry is compiled
or added. This is an interaction proxy, not the original NoteUse object: input
reach, placement, visual floor position and duplicate arbitration require testing.

E -> threaded multi_manager -> native game_zone_player -> four game_counter
entities sharing an intentional dispatch targetname. Their initial frags0 and
limits1/2/3/4 select exactly one fresh helper on the Nth player callback. Each
helper is a native cof_passwordnote with usertype0. It therefore takes its FIRST
native document-create/handle branch for its own recipient and sends the original
notification. Credential text comes from the same existing computer; no filenames,
note content, notification strings, journal packets or generic inventory slots
are recreated. Helpers live hidden at(0,0,-3000), outside player reach but within
engine coordinate limits; actual helper survival/grant must be checked in game.

The E proxy cannot reset; after0.1s original visual, proxy and all dispatch
counters are killed. Counters also remove on their threshold fire. Cleanup
prevents replay through leftover unused counters; near-simultaneous E before
cleanup relies on native button state and is a required gameplay check. Four
hidden note helpers are distinct; native cached-document state is never reused
between recipients. Unused helpers remain hidden; no late-join grant is added.

build-shared-note.mjs is pinned to the cafe output SHA and original source, and
only N0243. All479 cafe candidate records except243 remain verbatim;14 new
helpers,493entities total. Against original source:12 modified records,431 raw
records verbatim,50helpers,14 other lumps/source bytes12..EOF unchanged.
MapSHA ef1c8f26a0c359d17a5b082813751a171f3e52cb86516317a21e3ff200468b95;
18,707,551bytes. The installer also pins the actual game-DLL SHA because this
experiment relies on the inspected native behavior. No DLL is distributed.

## Public source and decision

Reused prior provenance/license/build review of milo-src/cry-of-fear-src commit
2971dbbd0059eedfc8ef9cb9c9fb149bb84b36a3; no repeat clone/build survey. Its README
describes an unofficial Xash3D/HLSDK recreation. Targeted newly read cof_pickups.cpp
maps cof_passwordnote to generic COF_GiveInventoryItem, while cof_addcodenote in
cof_script_points.cpp only forwards targets. The inspected inventory/UI files
provide no corresponding native credential-document journal implementation.
[Pinned pickup implementation](https://github.com/milo-src/cry-of-fear-src/blob/2971dbbd0059eedfc8ef9cb9c9fb149bb84b36a3/src/cof/dlls/cof_pickups.cpp)
is not a compatible native grant function to wrap or a drop-in Steam DLL.

There is no need to patch compiled code for this first experiment: existing
native per-player dispatch plus fresh note helpers is a concrete BSP-only
candidate. Static tests prove scope, routing under documented semantics and
installer guards, not actual journal insertion. If native counter/proxy/helper
behavior defeats the experiment, investigate that specific failure. If no map
adapter can call a valid first-use grant for each player, a supported source/API
from the original developers would be the small-wrapper route; the reconstruction
would require a separate engine/journal port and exceeds this milestone. Do not
replace the real journal with HUD text or claim synchronization from popups alone.
No further note conversion until the user's real two-client acceptance result.
