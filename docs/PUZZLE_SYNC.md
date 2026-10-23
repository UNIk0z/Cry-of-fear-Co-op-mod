# Current validator versus note content — 2026-10-10

Canonical computer/padlock validation was user verified in the earlier RC4 hotfix;
preserve it. Latest real test: after map change P1 has padlock-note text but no
numeric digits, P2 has digits. This is a separate asymmetric dynamic-note failure,
not proof canonical server validation failed or note grant failed.

Current authorized native/rc4/puzzle.cpp/.hpp maintains the shared tuple and owned
padlock cleanup; adapter.cpp captures AddNote codeFlag/value/type and handles HUD
replay. Compare those metadata and native content initialization across the real
transition. The actual host slot1 payload includes canonical digits/credentials and
a nerds note with codeFlag1/type1/nonzero value, but real restoration failed and
correct client display is unproved. See NOTE_COMPATIBILITY and RC4_CHECKPOINT.
Exact new screenshot/log evidence arrives next session; do not infer root cause.

---

# Puzzle authority

Latest requirement: one host/server-authoritative accepted solution, usable by
either player; matching displayed digits are desirable but no longer sufficient
or mandatory. Prefer native randomization; do not silently unlock story gates.

Existing evidence: computer digits are private player235C..2368. New bounded
native validation inspection100E5890 compares keypad input against player+2040,
then fires the original cof_keypad target on success. Altering clues/display
alone does not establish shared acceptance. No supported map setter for this
accepted solution has been verified. State: BLOCKED, no new puzzle workaround.

SDK cof_keypadnew exposes iuser1 Number, model, target and sounds, but replacing
the old UI requires proven input behavior and a consistent clue/solution source.
A classname swap or fixed bypass is not shipped. Original clue/code-note entities
and success targets are retained. Native gameplay journals/keys/global state
across alias transitions also require verification; capture/save calls alone do
not prove restoration. Do not replace closed Steam binaries with public Xash code.
