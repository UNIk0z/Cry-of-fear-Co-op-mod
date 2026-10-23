# Test for coop-fixes-006

Logs are kept automatically in
`D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\storycoop_logs\rc4-<date-time>.log`.
Claude reads them directly; you only need to say what you saw.

1. **Dual wield.** Each player picks up two weapons that can be paired (for
   example the knife and the phone, or a pistol and the phone) and chooses dual
   wield in the inventory. Both hands should appear on screen and work. Try it
   as P1 and as P2.
2. **How the other player looks.** While one player dual wields, the other
   watches: the model should hold the weapon (knife + phone → knife pose) and
   play its attack when the dual wielder attacks, not stand empty-handed.
   Crouch, walk and get revived while dual wielding as well.
3. **Dual wield across a map change and a save.** Go through a door to the next
   map while dual wielding: both weapons should still be in the inventory.
   Save at a tape recorder while dual wielding, then Continue: both weapons
   should be back, holding the weapon.
4. **Endings.** These are only reachable late in the game. When you get there,
   the ending should match your choices. The log shows each choice the moment
   it happens as an `ENDING flags=` line, for example after the roof boss, at
   the doctor in the asylum, and at the harbour package.
5. **Everything from 005 still works:** menu hosting, lights, pause, Simon
   models.

Log lines that matter contain `DUAL`, `POSE`, `ENDING`, `STORY`, `CHECKPOINT`,
`RESTORE`, `MENU`, `LIGHT`, `PAUSE` or `MODEL`.
