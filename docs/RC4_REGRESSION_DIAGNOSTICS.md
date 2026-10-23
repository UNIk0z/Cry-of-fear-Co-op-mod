# Latest gameplay supersedes pending status — final handoff 2026-10-10

The older host log analysis below remains evidence for the previous maintenance
run. It is not the new log/screenshots promised to Astra. Latest user confirms
shared grants/access BOTH, but P1 white inventory after second PASSWORD paper242,
P1 missing dynamic padlock digits after transition/P2 retains, invisible bus,
scripted unlock door regression and failed recorder/Continue restore. See
PROJECT_HANDOFF/BUG_TRACKER. Earlier collection order was unknown; latest actual
password-second report supersedes the proposed username-second focused test.

Actual unboxed slot1/backup is preserved privately and current native decoder
accepted its inventory/note/puzzle/global records. This does not resolve gameplay
restoration; RC4_CHECKPOINT documents exact content, scope and identity/load gates.
No new runtime root cause is inferred from these older diagnostic lines.

---

# RC4 note regression and title vehicle — 2026-10-10

The complete supplied host log was read before project modifications: 461 lines,
17954 bytes, SHA256 `c36e2e30d90901445366edb9ac07e45950c94050328e12cdab54103354a98305`.
It contains overlapping café output and ends mid-line. It is one host log; no
independent P2 console or the reported client note-reader error appears in it.
The exact second note collected, credential indices and failing filename cannot
be identified from this log. Both original café papers are therefore inspected
and included in the controlled test.

| Observed message / evidence | Meaning and correction | Uncertainty |
|---|---|---|
| Four `VEHICLE_SPAWN skittag/skittag22 nativeResult=0` lines | All four original brush vehicles reached native Spawn. Inline models56/57/58/149 and original path/camera managers exist. | Spawn is not rendering evidence; position, alpha/effects and PVS acceptance were not logged. |
| `NATIVE_THINK sc3_timeline_multiintroduct ... time=68.89`, another at73.89; `multikattej`, `multiintro1`, `multiintro2`, `kunitei2 time=248.92` | Original root has separate native managers with the same targetname; different first-Think times are consistent with their first scheduled actions. No double-ready conclusion follows. | First-Think alone does not prove every action executed or the vehicle reached the intended camera. |
| `Spawn Server s4_nightmare`, then `s4_start`, `s4_start2` | Consistent with user's real observation that automatic intro progression works. The occupancy barrier is preserved byte-for-byte. | This does not establish every effect/inventory/late-join behavior. |
| `JOURNAL acquired=1 codeType=0`, followed by repeated `JOURNAL rejected invalid/conflicting/full record; original collection retained` | The old collector rejected a record. Contrary to its wording, the immediately following restore zeroed the bank and copied only accepted shared records. That is an established destructive rejection path. The patch validates the whole bank before any write and suppresses identical warning spam. | Old messages omit IDs/reason and cannot prove the exact rejected paper. |
| Native archive100DA9A5..100DA9E9 copies note1 to slot+40 then clears note2 at+50; original fields are16 bytes apart | A16-character ID terminates in the next field's first byte. The old `<16` capture/validator rejects this native representation. The patch permits a bounded17-byte read, keeping the288-byte layout. | This explains the failure path for affected credentials; selected indices were not logged. |
| Native credential tables10213F14/102141E8; actual original text resources | Three IDs are exactly16 characters: `jillusername.txt`, `confuseduser.txt`, `thebeatles54.txt`. Three longer ones are truncated by native adjacent-field clearing: `leatherhoff45.txt`, `unforgettable.txt`, `marriageinapril.txt` (19). | Native long-ID truncation predates RC4. Prior V11 first-open success did not establish every journal re-open. |
| Native archive retains the complete credential title at slot+B0; native recall100F0AA0 sends NoteDoc with pages before IDs | For authored pass/user pages and hidden-note labels only, the patch checks the exact16-byte ID prefix and recovers the original title+.txt. AddNote resync and original NoteDoc recall send that full original filename. No resource or generic note ID is invented. | Actual client re-reading still needs the focused test. |
| `ERROR: env_model: unknown sequence ""`; `Dead end link kukstopp4`; missing `plats/ttrain_*` audio; Steam connection warning | Retained diagnostic findings, without attributing them to note IDs or brush-vehicle invisibility. The env_model warning is a different entity class; missing audio is not a missing brush model. | These can be investigated separately if a controlled trace links them to a failure. No Steam/auth changes. |

## Exact café entities and preserved baseline

Original `c_start2`242: `cof_passwordnote`, `usertype=1`, origin `-600 1086 -602`
(password). Original243: `cof_passwordnote`, default usertype0, origin
`27 2069 -518` (username). Both have no original targetname or fixed note1 ID;
the native computer's canonical index selects their page/text resource.

`s4_start2` retains the V11/RC2 proxies and fresh hidden native grants:
`cof_note242_grant1..4` (500/502/504/506) and
`cof_note243_grant1..4` (486/488/490/492). First-use proxies select recipients,
open original UserDoc readers and remove the world visual/button/counters after
0.1s. Native generated documents remain responsible for their original reader
handles and closedocument archival. Reusing one cached password helper would
omit later recipients' document handles; these four separate helpers remain.
The patch does not add removal or change any pickup entity. The established
world-paper cleanup does not justify losing journal content.

The regression relative to V11 is the later shared-journal collector/restore,
not a changed café grant chain. The new adapter retains closedocument behavior,
canonical puzzle generation, code-note metadata and native16-slot capacity.
It sends original AddNote entries through the original journal, adds one shared
TextMsg archival notice per newly delivered entry/client, and corrects only the
truncated café resource field in original NoteDoc packets. Native initial-reader
and console archival messages remain forwarded. No quiet-close experiment is
revived. No live reader EHANDLE is persisted or replaced.

## Campaign audit

`NOTE_AUDIT.json` validates all81 original story sources and195 existing aliases:
14 static `cof_document`, two generated `cof_passwordnote`, two virtual
`cof_addcodenote`; notes occur in27 converted aliases. Static documents retain
their individual note/page/label/sound content and per-activator native reader
fan-out. Virtual `nerds` entries retain flag/value/type identity, not a generic
text-file assumption. Duplicate static IDs require identical content. Missing,
unsafe or unsupported IDs/pages/resources fail validation before output. All14
possible café text resources, matching titles, pages and labels exist. The six
full-width/truncated credential prefixes are distinct. No195-map rebuild occurs.

## Vehicle evidence collection

Original SP, RC3 build007 and current maps retain the four inline brush models,
paths, title/camera timings and run speed300. The existing maintenance startspeed0
change did not repair visibility in the user's test. This patch preserves it and
all camera/path data rather than making another speculative edit.

New bounded `VEHICLE_STATE` and `VIEW_PVS` lines record actual model/index,
origin/speed, effects, render mode/amount, requested view origin, native PVS
presence and native AddToFullPack result per client and cinematic phase. Exact
backend callbacks37/39 are forwarded once, with unchanged arguments/results.
Entvars offsets are read from its own native save metadata. TITLE_WINDOW16..44s
after the first root Think is a diagnostic sampling label only; it controls no
game event. A packed result1 still does not prove visual rendering; result0 must
be interpreted with the state/PVS trace. A view/PVS or render intervention is
deferred until that evidence identifies the failing branch. No static substitute
or technically proven interface limitation is asserted yet.

## Verification boundary

Automated owned fixtures exercise native-layout archival, both collector order,
four recipients, repeat reader packets, two notes, map replacement, code types,
corrupt/conflicting-bank retention, bounded logs, native visibility forwarding
and existing checkpoint/inventory contracts. They do not execute the original
game DLL or prove actual journal UI, sound, cutscene or rendering behavior.
Vehicle correction remains unresolved pending the fresh focused trace. Older
maintenance, RC4 hotfix, RC3 and RC2 packages remain available for rollback.
