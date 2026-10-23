# V12 failed remote delivery: one targeted check

User's clarified result: **P2 collected the note and got it; P1 got no
notification or added note.** This is a failed remote-delivery regression,
not a failure to pick up the paper for both clients. V12 is withdrawn as a fix.
V11 remains the reported working shared-delivery baseline with both readers open.

Native evidence now shows that the menu close used by v12 does not explicitly
perform document archival. The normal `closedocument` server handler validates
that player's current document handle, archives its metadata, sends native
`AddNote`, and clears the handle. That provides a concrete explanation to test,
not a proven runtime trace of the failed session.

If you are **still in the failed v12 session immediately after P2 collected that
username note**, do this one check. Do not collect or read a different document
first, because that can replace the pending document handle.

On **P1's console**, enter:

```text
closedocument
```

This is the existing native command used by the reader's close button. It is a
one-time diagnostic, not the proposed final gameplay interaction. Then check
P1's ordinary journal manually. Report whether a native archival notification
appears and whether the username entry is now present and readable. Include any
console error. Do not repeat the command or run it on the host for P1.

If you already left that session, skip this check and say so; the pending handle
may be gone. Do not reinstall/retest v12 just to perform it.

Interpretation:

- If P1 now receives the note, the native grant left a valid pending document;
  immediate VGUI closure failed to complete the normal archival handshake.
- If nothing happens, pending-document delivery is not established. The grant
  route or client state must be isolated before changing menu timing again.
- If the command is rejected, report the exact console message; do not replace
  it with server commands or scripts guessed from another engine.

After the check, restore the working map in your existing native co-op session.
On the host:

```text
changelevel c_start2_coop_note
status
```

Both readers opening is the known v11 behavior; both players should close their
readers normally and verify their journals. If the v11 alias was removed, close
both clients and reinstall it using:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\outputs\cry-of-fear-coop\scripts\install-shared-note.ps1"
```

When finished with the failed v12 alias, close both clients and remove only its
known-hash file using:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\outputs\cry-of-fear-coop\scripts\install-quiet-note.ps1" -Remove
```

Do not use the old v12 ZIP as a fix. It is retained as
`outputs/quiet-note-test-v12.failed.zip` for reproducing the failed artifact.
The repository installer now refuses installation; its removal mode remains
hash guarded. No original map or game DLL is changed by removal.

No v13 variant is issued. Automatic quiet receipt needs a verified per-recipient
archival path. Native `trigger_command` runs server-console commands and does
not invoke P1's client-command handler with P1's document context. A supported
map/entity entry to the archival operation has not been found. The next result
above distinguishes a missing archival handshake from an earlier grant failure.
Per-player weapon/ammo/healing pickup support remains separately unimplemented.
