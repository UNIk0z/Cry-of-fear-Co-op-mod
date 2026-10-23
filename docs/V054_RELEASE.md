# Cry of Fear co-op v0.5.4 (2026-10-23)

v0.5.3 with two fixes from Katz's v0.5.3 test (2026-10-23 17:39 and 17:44
logs). Maps byte-identical; adapter only. Not run in the game by Claude
(Katz tests). 14 native fixture suites pass.

| Report | Cause (evidence) | Change |
|---|---|---|
| "Hort precache error" and back to the main menu | Both logs end with `Host_Error: EV_Precache: 'low' Precache can only be done in spawn functions`. The v0.5 limp (limp_frame) set the physics key "low" below 25 health through engine slots 121/122. Those are GetPhysicsInfoString and PrecacheEvent: hl.dll calls SetPhysicsKeyValue at slot 120 (g_engfuncs 10222F48, copied 144 entries by GiveFnptrsToDll 100B4AA0; 31 call sites with 0x10223128) and PrecacheEvent at 122 (push 1, "events/..."). So any player dropping below 25 health ended the game. | GetPhysicsKeyValue 119, SetPhysicsKeyValue 120. |
| Quick slot 3 does not work | Logs: `DUAL quick player=1 keys 2+3 ... asked` again and again: pressing 3 within 0.25 s of 2 (a quick weapon switch) made a dual wield instead. | The two quick keys must come within 0.12 s (pressed together). |
