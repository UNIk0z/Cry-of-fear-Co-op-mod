# RC4 — install and two-client test

Experimental. RC3 build007's tested files are retained. RC4 requires a first real
SDK bootstrap and round-trip gameplay test; fixtures are not a gameplay pass.

1. Close both games. Keep the complete existing RC2/RC3 installation and extracted
   RC3 package. Extract the whole RC4 ZIP. On BOTH actual game environments run
   install.cmd. It adds five s4/cof_campaign_story4 aliases and
   cl_dlls/storycoop_rc4.dll. It verifies original sources, dependencies, backend
   DLL and every output before writing. A missing dependency means install the
   unchanged complete RC2 prerequisite from the previous bundle first.
2. Custom/boxed location: in this extracted folder run Windows PowerShell:

   powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\install-story-package.ps1 -MapsDirectory "YOUR_GAME\cryoffear\maps"

   Apply this to the actual Steam/Sandboxie environment used by each client.
   Do not bypass a hash refusal. Our source component is not the original DLL.
3. P1 runs Host RC4.cmd. The supplied Steam launcher uses app223710, exactly two
   players, mp_footsteps1 before map, and -dll cl_dlls/storycoop_rc4.dll. P2 joins
   normally through the existing Steam/Sandboxie setup. Both join BEFORE either
   readies. Do not use manual changelevel commands during this run.
4. First confirm host console contains:

   [STORYCOOP_RC4] BOOT backend SHA256 verified; API140 forwarding probe ready
   [STORYCOOP_RC4] GameInit forwarded; native inventory unchanged
   [STORYCOOP_RC4] MAP cof_campaign_story4 ... scope=1

   Missing BOOT, load error, unexpected map, or a hash/unsafe-input refusal is a
   failed bootstrap. Stop that run and preserve logs. No silent fallback to the
   original DLL should be reported as an RC4 pass.
5. Play the opening normally. Recheck the tested RC3 readiness, both cutscenes,
   nightmare cameras/progression, automatic wake-up and waiting for both joins.
   Record the small intro pause without changing timing or bypassing the scene.

## A — retained shared notes

Collect each relevant note normally; close its native reader. On BOTH clients
open the journal with the configured native control and read its exact content.
Record note titles/pages. Enter s4_start2 normally, then return to s4_start_e0.
Wait2s for queued journal reconstruction. Both journals must retain the same
notes; no duplicate rows or unsolicited reader/archive notification. The host
MAP line after transition must retain journal count. Check the computer code
receipt too: it must still render its actual code, not the literal nerds sentinel.

## B — actual computer and padlock

Obtain the computer login clues legitimately. Have each player use the computer
sequentially and record the four-digit clue on each client. Return to the padlock
through the normal group exit. P2 solves it first; P1 stays out of the lock UI.
The recorded code must work, the normal wheel interaction must remain, and P2
must regain view/HUD/control. Both must use the unlocked progression door.
Leave and return: lock stays solved, button remains removed and door remains
unlocked. Revisit the cafe: old login clues/code remain valid. In a fresh campaign
repeat B with P1 as solver; a new session may legitimately generate a new code.
Do not open the padlock simultaneously in this prototype.

## C — completed scare

Trigger the moving black figure once and allow at least3s for completion. Leave
and return through the cafe route. At the original scare location there must be
no standing figure and no replay. Check the never-triggered case in a fresh
campaign as well. The separate unrelated static figure was not removed. Record
the location if the observed figure is different from this chain.

## D — separate inventories

Record P1/P2 health, weapon classes, active weapon, loaded and reserve ammunition,
syringes and story equipment before exiting. Enter cafe and return. Compare both
players separately. No unexplained loss/duplication or replay of wake equipment
grants is allowed. Native health/stamina integer rounding is expected. Keep
connections and player names unchanged. Test death/respawn/reconnect separately;
they are not established inventory-continuity cases.

## E — longer progression

Only after A-D pass, progress naturally through the next original campaign maps.
Recheck journals/inventory after each boundary. Native journal support extends
to s2_ aliases; this package does not repair all later world events/doors.
Stop at the first failure. Record status alias, first failed row, player roles,
actual code, journal contents, inventory differences and transition time. Keep
both fresh console logs using the included collect-story-log.ps1. A missing BOOT
or lost host journal/puzzle count distinguishes component loading/lifetime from
client reconstruction failure. Do not repeat unsupported headless runs.

## Rollback

Close both games and run remove.cmd in each installed environment, or the same
PowerShell command above with -Remove. It refuses modified aliases/component
before deleting anything. Launch the existing RC3 Host Coop Game.cmd afterward
without -dll. Original DLLs, liblist.gam, RC2 and RC3 remain installed and intact.
This candidate has no disk save; closing/restarting the host starts a new session.
