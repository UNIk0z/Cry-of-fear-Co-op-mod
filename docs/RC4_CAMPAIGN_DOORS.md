# Campaign-doors candidate (campaign-doors-001) — 2026-10-10

Experimental build on top of camera-notes-001. Nothing in it is gameplay-verified.
Automated results are listed in QA.json. The full two-client procedure is in
TESTING.md, and install/rollback steps are in START_HERE.md.

## What is in this build

| Area | Change | Status |
|---|---|---|
| Cinematic camera recovery | Unchanged from camera-notes-001 (`camera-runtime.hpp`) | AWAITING GAMEPLAY VERIFICATION |
| Code-note layout | Unchanged from camera-notes-001 (`note-layout.hpp`) | AWAITING GAMEPLAY VERIFICATION |
| Checkpoint diagnostics | Save refusals, RESTORE WAIT and RESTORE FAILED now name the exact failed step. Each save and restore logs one line per player slot with health, stamina, weapon/inventory counts, reserve ammo and equipped weapon. No Steam IDs or profile keys are printed. | AUTOMATED TESTS PASSED |
| `c_apartment1` key-room exit (door 713) | Uses the same conditional relocation as the converted office doors. The scripted unlock (toggle 577) becomes an idempotent shared state, and the key-room scare (trigger 573) runs once per session. | AWAITING GAMEPLAY VERIFICATION |
| `c_apartment1` apartment-key door (door 193) | The native door is kept for its lock, the key use, key consumption and messages. After the native unlock, the adapter removes it and enables the verified fade/teleport relocation in the same place. | AWAITING GAMEPLAY VERIFICATION |

Only `s4_apartment1_e3` and `s4_apartment1_e7` change. The other six overlay maps
are byte-identical to camera-notes-001/integration-001. No original BSP, `hl.dll`,
`client.dll`, liblist, Steam or authentication file is modified or redistributed.

## Native evidence behind the door changes

All of this was read from the pinned `hl.dll` (SHA256 `0036b91c…dde0e63`) with
dumpbin. Nothing was patched or detoured.

- `cof_interdooronoff` Use (`100A6EA0`) finds the first entity named by its
  `message`. On an `inter_door` it toggles `lockedby` (+0x190) between empty and
  `somethinglocked`; on a `func_button` it toggles that button's lock. The
  `newlockedby` key is not used by Use. So toggle conversions are correct, and
  re-entry must use an idempotent ON instead of a second toggle.
- A locked `inter_door` Use (`10048F70`) only prints the locked message and plays
  its sound. It never checks the player's inventory.
- Key use (`100E4630..100E468F`) traces along the player's view. If the hit
  entity is exactly classname `inter_door` and its `lockedby` matches the held
  key, the key is consumed (unless spawnflag 1 is set) and unlock `10048E40` runs.
  That unlock plays the sound and message and clears the lock, but **fires no
  target**. Converting a key door to `func_button` would make the key unusable,
  so key doors need the adapter bridge.
- Campaign census: 399 locked `inter_door`s, of which only **7** are real key
  doors (lock name matches an obtainable `item_key`). 19 are script-toggled and
  373 are permanently locked decor. Key doors: `c_apartment1`#193, `c_asylum1`#71,
  `c_asylum1day`#406, `c_city`#353, `c_park`#222, `c_park2`#142, `c_sewer2`#46.
  Only #193 is inside the current overlay.

## How the key-door bridge works

The map keeps the original `inter_door` (renamed `sc4_keydoor_193`) and adds a
`func_button` on the same brush, gated by the shared state
`sc4.door.c_apartment1.apartment.unlocked`, plus the verified fade/teleport chain.

1. At map activation the adapter hides that button the way `func_wall_toggle`
   does (not solid, not drawn). The native key trace and locked message therefore
   still reach only the original door.
2. Each server frame it reads the door's `lockedby`. The read happens only on the
   verified 0x1B0 `inter_door` allocation with a matching edict serial; anything
   else is treated as still locked.
3. When the native key clears the lock, it fires the authored relay through the
   public DLL Use. The relay sets the shared state and removes the native door.
   The adapter then reveals the button.
4. On revisits or checkpoint loads, a `trigger_auto` that checks the shared state
   removes the door again, and the adapter reveals the button.

A position offset is not used. A DONT_MOVE `func_button` moves back to its spawn
origin when pressed, so a relocated button would slide away.

## Known limits, recorded rather than guessed

- **Apartment return routes are not overlaid.** RC4 reaches `s4_apartment1_e3/e7`
  only from `c_start`. Every exit from `apartment2` returns to the unmodified RC2
  aliases `s2_apartment1_e0…e5`. There the doors stay native (with the old
  visibility loss), and the office and key-room latches do not apply. A future
  stage needs `s4_apartment2_*` overlays whose exits point back to `s4_apartment1_*`.
- The converted 713 and 228/229 buttons are silent while locked: the original
  locked message is not shown. Door 193 keeps its native locked message.
- Door 368 (hiss scene) stays native because it has no closing sound for the
  shared fade plan. Doors 36, 333 and 386 are permanently locked decor.
- Using a native SP `inter_door` still loses mutual player visibility in
  multiplayer. Server-side, native AddToFullPack (`10018870`) only reads
  `effects`, and the door's transition start (`10048CB0`) and teleport step
  (`100482E9..10048513`) change no player render state. The cause is outside
  these paths and needs a runtime trace. The conversions avoid the native path
  instead.
- Saves still cover only `s4_start`, `s4_start_e0` and `s4_start_e2`: two active
  players, four retained identities, recorders 419/421. The full world state is
  not saved.
