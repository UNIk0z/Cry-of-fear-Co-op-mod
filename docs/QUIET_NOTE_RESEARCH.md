# Native reader opening and popup suppression v12

## 2026-10-09 - failed remote receipt; archival handshake traced

USER clarification: P2 collected and got the note; P1 got no notification or
note addition. V12 withdrawn; don't classify this as neither player collecting.
The rendered-menu workaround is not a working grant implementation.

Native server ClientCommand compares `closedocument` at1001A061, validates the
player's current-document EHANDLE+630, calls100DA6D0 at1001A0B3, then clears the
handle at1001A0B8..1001A0C0. The called function checks16 existing document
records for duplicates, copies document metadata into the player's collection,
prints the native Archived message and sends recipient-only AddNote via
global10226648. AddNote registration100E67AB..100E67C4 establishes that message
identity. This is now a traced archival path, unlike earlier EHANDLE inference.
Native client document close-button branch1004AAA5..1004AAB5 hides its menu and
sends `closedocument` through the engine server-command function. Raw new bounded
evidence is saved in work/note-source-001/native-close-document-command.txt,
native-document-journal-add{,-tail}.txt, native-addnote-registration.txt and
native-client-document-close-button.txt.

The native menu closer100F4050 only sends VGUIMenu(200); it does not explicitly
call that archival handler. Client reactions may differ, so the missing
handshake remains a concrete hypothesis rather than measured runtime causality.
P1 issuing `closedocument` once immediately after the failed pickup tests whether
its grant left a pending native document. See NOTE_FAILURE_DIAGNOSTIC.md.

Native relay factory101087F0 -> vtable101E04D4 -> Use10115680..101159E3
PRESERVES incoming activator EBX into SUB_UseTargets10102930 at101159AF.
Saved native-relay-use{,-tail}.txt. The public Xash reconstruction's relay sends
`this` instead, which is NOT native Steam behavior; don't assume relay actor loss.
Native trigger_command factory10108190 -> vtable101E3F04 -> Use101147E0
ignores its activator and invokes engine pfnServerCommand at10222FE4. It does not
call the per-client closedocument handler. Native cof_giveitems Use100A6BC0
provides key/weapon branches and no observed100DA6D0 archival call. No supported
map entry to automatic per-recipient document archival was established.

No new timing/relay/classname variant or headless test issued. Preserve v11
working shared-delivery reference; do not revive v12 before diagnostic evidence.

## Earlier v12 preparation (historical; runtime failure supersedes it)

V11 delivery now works by user report, but both players' readers automatically
open. Separate journal reopening, exact content equality, role reversal,
duplicates and door/story regression are still explicit test gates.

Native client snapshot matched the actual installed client.dll via read-only
Get-FileHash: d2a04641b301804f6f449aa68265042b13adc360925b80033d417ec9f38c9c00.
Server hl.dll remains the previously verified0036b91c...e0e63. Native read-only
function evidence is in work/note-source-001. No client or server DLL was edited.

The server credential note packet is registered as **UserDoc**, two bytes,
identified by the registration at100E65BC..100E65D5. The native client hooks it
at1004ADC0 to handler1004AC60..1004ADB7. That handler reads type/index, configures
the credential panel's displayed value and calls the native menu opener
100AA7F0 with ID0x22 (34). It does this on cached-note packets too. Consequently
reusing the same note cache does not suppress remote reader opening. There is
no inspected/documented silent flag in the native two-byte packet/entity.

Native cof_closeallvgui resolves through factory1008F800/vtable101C7460 to
Use100A2010..100A2046. It validates its player activator and calls that player's
100F4050 with menu ID200. The latter sends **MSG_ONE** with that player's edict
and the native VGUIMenu message. It is not a broadcast close and contains no
document-handle/inventory mutation. The SDK description names its menu-close
purpose. Actual client-side journal retention remains a gameplay requirement.

V12 preserves all original and door records from v11. Only its collection
manager and four native note helper names change; eight helpers are appended.
Each counter grant name now resolves to a trigger_relay followed by an
activator-specific cof_closeallvgui. Relay calls the renamed note synchronously,
without a delayed manager; close follows in the same FireTargets dispatch.
The original collector's threaded collection manager retains its own activator
and sends a cached read through note1 at0.05s. The collector already received
their own first-use document handle during the zone enumeration.

This deliberately retains the four user-tested first-use grant paths, not a
new journal implementation. It does not send fabricated notifications or
client commands. Correct edict enumeration/message ordering, no visible flash,
later journal reading, collector duplicates and unrelated-menu interference
are NOT proven by the graph tests. Because native UserDoc opens internally,
this is a **popup suppression candidate**, not strict silent registration.
cof_closeallvgui may also close a remote player's inventory already open; that
known behavior prevents claiming a full noninterrupting UX fix without a
supported client-side quiet receipt path.

Generated complete map SHA256:
6ccca5777cfa39c002d765bb0c9859f209693a945fd70382575cde1898041967.
18,708,552bytes/501entities. All14 nonentity lumps and original bytes12..EOF
remain unchanged. No loot conversion or extra native note instance is added.
