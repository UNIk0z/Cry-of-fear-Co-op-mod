# Reliable-channel overflow

Status: **investigation implemented; no network fix demonstrated**.
No game process, packet capture, debugger or binary change was used this session.

The supplied [2021 Steam report](https://steamcommunity.com/app/223710/discussions/0/3106890881980220448/)
describes co-op level-change disconnects with reliable-buffer warnings and visible
entity warnings. Proposed updaterate/host-motion workarounds have conflicting
reports. This is user testimony, not packet-level attribution or a permanent fix.
The [2025 Steam report](https://steamcommunity.com/app/223710/discussions/0/600768722043433197/)
also describes loading-screen disconnects and inventory loss after reconnecting.
Neither discussion supplies a reproducible source patch. The user's initial
unknown(1) overflow remains a separate observation until equivalent logs connect it.

## Installed engine evidence

Bounded read-only inspection of the existing native hw.dll snapshot identifies:

| Native address | Observation |
|---|---|
| 01D8EFF0..F0A8 | Netchan setup; message name netchan->message; limit0F96=3990 bytes at channel+68 |
| 01D4842x..485xx | Size-buffer overflow warning/reset/overflow-flag path |
| 01DDE91C..E9C4 | Client flag2 tested at+80; overflowing channel cleared, warning emitted, client dropped |
| 01D8EECE vicinity | Clear diagnostic distinguishes unacknowledged reliable data |
| Mod1001D830 | Native ClientPutInServer invokes player setup/Spawn |
| Mod10018870 | AddToFullPack callback already inspected previously |

DLL callback addresses were resolved through native table102119F8, not assumed
from public engine source. Raw disassembly/strings: work/cafe-code-001/engine-*.txt
and *.json. These observations establish the buffer/failure path. They do NOT
identify a duplicate HUD/inventory/baseline/resource producer, incoming ACK timing,
or the runtime packet sequence. Entity count is not a reliable-message byte count.

No buffer increase, rate change, networking validation/authentication change or
source replacement is included. The previously reviewed public source at
2971dbbd0059eedfc8ef9cb9c9fb149bb84b36a3 is an unofficial Xash reconstruction;
its engine behavior is not proof of native Steam behavior or a compatible repair.

## Diagnostic implementation

analyze-network-log.mjs retains P1..P4 label, line number, latest status map and
[STORYCOOP] CASE markers. It separately counts reliable-sizebuf/reliable-overflow,
clear-with-pending-data, DLL message overflow, visible entity limit, unreliable
datagrams, generic client-overflowed and authentication failures. Repeated console
lines are not inferred duplicate sends. An empty log never establishes a fix.

Native condebug and qconsole.log strings are present in the engine. Enable console
logging for each client before tests; preserve both clients' existing logs. The
guide describes repeated native/manual-changelevel/native-portal tests with the
same player count and recorded rates. No automated wait/changelevel loop is sent.

Required next evidence: P1/P2 logs around initial join, repeated native and linked
map changes, reconnect and actual inventory/journal observations. Native portal
state handling may preserve ordinary transitions; disconnected identity recovery
and host checkpoints remain unimplemented. Recovery does not fix the overflow.
