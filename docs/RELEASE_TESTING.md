# One ordered two-player RC1 test session

Use disposable native test sessions. No persistent campaign save/reconnect recovery
is implemented. Keep original saves/configurations and the working Steam/Sandboxie
setup. Installation/rollback are in README. Both players need the same maps/DLLs.
Optional3/4-player cases follow the same sequence after P1/P2 pass.

## 1. Native initialization and logging

Launch through Steam normally. Start native cof_campaign_01, join P2 and complete
its ready-up/introduction until both are alive and mutually visible. New Host
Coop Game menu entry should open the native host dialog; choose native campaign
initialization, not a converted story alias as the initial server map.

On EACH client's console:

```text
condebug
```

Read its response. If it says disabled, run it once more to enable logging.
Keep the original state and restore it when finished. Preserve old qconsole.log
first if needed. Native engine names that log; its effective path must be checked
at runtime. Collector checks the game root and cryoffear folder and picks newest.
P2 in Sandboxie needs its boxed file, not the normal client's file: Explore
Contents in Sandboxie and supply that actual full file path with -LogPath.

Record current cl_updaterate, cl_cmdrate and rate by entering each without a
value. Retain them for the initial comparison. Do not force game-mode cvars.
Mark a case on both consoles, then status on host:

```text
echo [STORYCOOP] CASE INITIAL_JOIN 01
status
```

Record initial connection success/errors, both identities and models. Screenshot
each inventory, loaded/reserve ammo, health and journal before transitions.

## 2. Local story doors and both credential papers

HOST:

```text
echo [STORYCOOP] CASE STORY_LOCAL 01
changelevel c_start2_story_rc1
status
```

Both should spawn without overlapping/stuck players. Check ordinary doors49/50
(stairway passage before cafe): each player presses E in both directions while
the other observes their model. Record sound, finite black/reveal, relocation and
visibility. Test independent crossings and near-simultaneous Use.

Username paper243 remains near(27,2069,-518). Password242 remains near
(-600,1086,-602). Collector presses E; both players should receive the correct
native reader. Both close normally, reopen their actual journals, compare exact
credential content and count entries. Repeated E must not grant duplicates.
Both readers opening is expected; quiet delivery is not in RC1.

Use the cafe terminal around(1304,1711,-554). Compare credentials and try the
same valid username/password with each player. Record each displayed four-digit
PC code: its synchronization is unresolved, and different digits are expected
from the inspected native per-player path. Do not report this as fixed.

Cafe panels204/206 are near(1009/1032,1986,-547). Follow original story conditions:
restricted direction must stay disabled before its enable event; after enabling,
each player can Use it. Correct terminal login should trigger original progression
and panel removal, without stranded players. Reload this alias once to check
the enable state resets. Reverse collector roles on the fresh map and retest both
papers. Return to V11 with changelevel c_start2_coop_note if RC1 regresses.

## 3. Apartment resource fallback

HOST:

```text
echo [STORYCOOP] CASE APARTMENT_RESOURCE 01
changelevel c_apartment1_story_rc1
status
```

Four spawn candidates surround(-819,-160,321). Exact converted door location is
in map-summary.json/testLocations; one ordinary door was converted. Other story
scripts remain original and may require further adapters.

Selected Glock ammo near(601,242,-40) has extras at(649,242,-40),
(553,242,-40),(601,290,-40). Selected syringe near(1120,1200,141) has extras at
(1072,1200,141),(1120,1152,141),(1072,1152,141). Count four of each including the
original. Check accessibility/placement, native pickup validation and amounts.
Each player takes one copy; verify that uncollected copies remain available.
Test full inventory/ammo rejection without losing the world item. These are
physical copies, not ownership-protected client pickups; one player can hoard.
Original key342 at(1091,1116,177) must remain a single unchanged story item.

## 4. Repeated map-change comparison

Use the SAME players/rates and wait until both are alive/visible after each load.
No rapid scripted changelevel/wait loop. Log every transition attempt, including
failed loads/reconnects; never discard failed attempts from the denominator.

First compare ten manual stock-native transitions, alternating host commands:

```text
echo [STORYCOOP] CASE NATIVE_MANUAL 01
changelevel c_cof_city
status
echo [STORYCOOP] CASE NATIVE_MANUAL 02
changelevel c_cof_village2
status
```

Repeat with markers03..10, issuing each change only after both clients finish
loading. These commands test unmodified map traffic, not natural route order.
Record any HUD/visible entity/reliable/datagram/authentication warnings separately.

Then start the native portal pair:

```text
echo [STORYCOOP] CASE STORY_PORTAL 01
changelevel c_start2_link_rc1
status
```

Players spawn in the entrance hall near(2424,-870,-728). The original story exit
panel spans X2399..2447 at Y-907 (c_start side Y-912). Face it and press E. The
native group waiting area spans approximately X2377..2463,Y-909..-836,Z-764..-642.
First leave P2 outside that area and try E: it must wait for players, not change
the map. Bring both into the area, pause about a second for native ready polling,
then E: both should fade/load c_start_link_rc1 together. HOST status must show it.

On the c_start side use only the nearby portal to return to c_start2_link_rc1.
Its other SP same-map doors remain incompatible; they are outside this test.
Alternate P1/P2 as the Use initiator. Repeat at least ten natural door changes,
marking STORY_PORTAL02..10 on both consoles before each Use. Confirm both maps,
models, independent inputs, health, exact inventory/ammo and acquired journal
entries after EVERY load. Native portal state handling is invoked but retention
is unverified. The two-map ring tests the original route independently; other
campaign transitions are not converted.

Also test one client joining just after a completed change, and one disconnect/
reconnect. Record exact retained/lost state under the same identity. Recovery
is not promised; screenshots provide evidence, not a checkpoint restore. If an
overflow disconnect occurs, preserve that attempt/logs before restarting. No
single successful transition establishes a fix. Additional3/4-player sessions
must test native group readiness, all note recipients, and all four spawns.

The optional cl_updaterate10 community workaround is not applied by the package.
Only after baseline evidence, record the old value, test10 in a fresh repeated
comparison, and restore the exact old value. Do not mix changed rates into the
baseline series or treat a workaround as a permanent repair.

## 5. Collect one report

After the sequence, copy the normal P1 log using PowerShell:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\outputs\story-coop-experimental-rc1\collect-story-log.ps1" -Client P1
```

For P2, use the same collector with -Client P2 and -LogPath followed by its actual
quoted full boxed log path; a second PC can use its own normal GameDirectory.
Keep logs private: they may contain Steam identities/IP addresses. Supply both
logs plus a single summary: map/case/attempt, initiating player, success/failure,
exact console error, model visibility, note entry counts/content, PC digits,
cafe gates, pickup counts/amounts and state before/after transitions/reconnect.
Restore logging/rates to recorded originals, close both clients, and use README
rollback if needed. New aliases/menu can be removed without deleting V11.
