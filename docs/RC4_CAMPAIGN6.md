# coop-fixes-006 — 2026-10-12

This updates coop-fixes-005. Only the co-op adapter changed: all 194 maps,
the menu entries and the Simon model are byte-identical to 005. Nothing new
here has been seen in a real game yet.

## Your request → cause → change

| Your request | Cause (read from the game's own code) | Change |
|---|---|---|
| Patch dual wield | The inventory sends its dual-wield command in multiplayer too. The server's handler returns at once when the game is multiplayer; otherwise it calls the player's own dual-wield routine. That routine and the combined weapon it gives have no multiplayer checks, and the two weapons stay owned. | In co-op the adapter now makes that same dual-wield call for the player who chose it. Slots must be 1 to 6 (the game reads the slot before checking it). This is the project's only direct call into the game's code, made because you asked for it. The address is safe because the adapter only loads with the exact `hl.dll` it was built for. |
| If the co-op model needs an animation, use the weapon hand's one (knife + phone → knife) | The player model's upper body follows the active weapon's number, and the dual-wield weapon has a number the game maps to the empty-handed idle. So your partner saw you unarmed and never attacking. The player model has no dual-wield animations of its own. | While dual wielding, the model now shows the weapon hand's own idle and plays that weapon's attack when you attack. The light (phone, lantern) never decides the pose; with two weapons the right hand does. Revive, damage and other game animations still take over normally. |
| Save the ending flags so the correct ending plays | The ending door in the last village house sends the player to one of five endings using three flags kept on the player: roof boss killed, P345 given to the doctor, package delivered. The game sets them on every connected player, but the co-op level change rebuilds both players without them. So after the next map everyone was on ending 1. | The adapter keeps the three flags for the whole session as soon as any player gets one, writes them back to every player after each map change, saves them in your checkpoints and clears them for a new game. |
| Patch other bugs found | The same level change also dropped two other things kept on the player: the reduced maximum health after Simon is shot in the asylum story, and the night-vision pickup. | Both are kept for each player across map changes and in checkpoints. The health bar is updated when the reduced maximum comes back. |
| (found while doing the above) | A checkpoint saved while dual wielding would have stored the combined weapon as an item. It cannot be given back on load. | The combined weapon is not saved. A dual wielder is saved with both weapons, holding the weapon hand. |

## Saves

- Checkpoints now use **schema 4**, which adds the ending flags, maximum health
  and night vision.
- Your existing saves (schema 3 and older) still load. They have no ending
  flags, so a choice made **before** this update is not in them. Playing on from
  such a save keeps every choice made **from now on**.

## Still open (unchanged from 005)

- The P2 phone beam texture.
- The pause edge case where the partner opens the menu while the host has
  already paused.
- Ladder hitches, the code drawn right of the page after a map change, silent
  locked converted doors, and four players.

## Technical notes

- New file `native/rc4/story-runtime.hpp`, the 17th pinned source:
  - **Dual wield.** `inventorydualwield A B` goes to `CBasePlayer::DualWield`
    at backend RVA `0xDE990` as a `__thiscall` call. The handler is at
    `1001B6B9`, and its multiplayer gate at `1001B6DB` is not used.
  - **Pose.** The idle table is `100E04B4`. Light ids are `{1, 2, 10, 13}`
    (`100E4BF0`). Hand ids are `+0x1E70`/`+0x1E74`. Sequences come by name
    from the player's own model file. The fields set are
    `ResetSequenceInfo`'s (`+0xEC`..`+0xFC`, entvars `+0x12C`..`+0x13C`).
    Attacks set the lock `+0x4F4` the way `PlayAnim` does (`100EA240`). The
    idle never holds that lock, because it also gates revive (`100EFD25`).
  - **Endings.** `+0x4CD`/`+0x4CE`/`+0x4CF` are read by `endingcheck`
    (`10048070`) and set by `cof_ending` (`100A3C80`). The co-op level change
    (`1002A480`) does not carry them.
  - **Story wound and night vision.** `+0x60C` (sent to the HUD as
    `HealthCap`) and `+0x434`, kept per identity.
- `checkpoint.cpp`: schema 4 appendix. `checkpoint-runtime.hpp`: dual weapon
  skipped on capture; story fields saved and restored.
- Package profile `campaign6`: native-only over the delivered 005 catalog
  (`bf459ed1…`), reusing the campaign5 map stage.
