# One two-client regression

Close BOTH processes before installing this candidate in their actual environments.
Keep both complete console logs. Use the existing full RC2 installation and this
package's NativeRC4 launcher. Do not overwrite an existing known-good save.

A. Near a story cutscene and enemies, let P1 become revivable/down. P2 starts the
scene. Let it finish; check P1's native down view, then revive P1. Both players
must move/look/use E/open inventory normally. Record map, scene and CAMERA log.

B. Repeat with P2 down and P1 starting the scene. If feasible also check death
during the scene and revival before it finishes: an active scene must remain
intact. Extra players/reconnect behavior are not gameplay-verified.

C. Acquire the computer/padlock code. Both players must see the SAME complete code
inside the original notebook page. Close/reopen it several times, change maps
and reopen. Confirm the padlock accepts it and sounds/doors/player visibility
still work. Check each supported resolution you use; a live resolution change
and reconnect without restarting deserve separate observations. Do not count a
synthetic scaling test as rendering proof.

D. Continue immediately to Sewer Store recorder421. Give players different health
and inventories and record them. In host console use status; if native identities
require binding, sc_checkpoint_bind USERID p1 and sc_checkpoint_bind USERID p2,
using the actual IDs. Select sc_checkpoint_slot 2 ONLY if slot2 is unused; use
another unused supported slot1–3 otherwise. Save at Sewer Store and confirm the
successful checkpoint message. Fully close BOTH games. Run:

~~~powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\host-story-coop.ps1 -ContinueSlot 2
~~~

Reconnect both players; rebind the same person/profile keys if required. Verify
Sewer Store location, distinct inventories/health/ammo/equipped items, notes,
complete correctly positioned code, puzzle/door state and controls. Report PASS
only after this actual full restart. If interrupted, record INTERRUPTED, not FAIL.
