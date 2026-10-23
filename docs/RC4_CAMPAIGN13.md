# coop-fixes-013 — 2026-10-13

coop-fixes-012 plus fixes for the user's test of 2026-10-13 (the friend's PC
hosted) and the requested main-menu edit. Nothing in it is gameplay-verified.
Automated results are in `QA.json`.

| Area | Change | Status |
|---|---|---|
| Inventory across map changes | Every player's record (weapons, clips, reserve ammo, items, tapes, health, stamina, quick keys, phone screen) is refreshed each second and at map end, and applied on the next story map without a teleport. Weapons the new map gave are kept. A game over goes back to what everyone had on arrival. | AUTOMATED TESTS PASSED |
| Phone screen | Checkpoint schema 6 saves `m_iPhoneMessage` (+0x5CC) and `m_iPhoneDisabled` (+0x1F14). Schema 1–5 saves still load. | AUTOMATED TESTS PASSED |
| Story weapons | A weapon a scene gives (`cof_giveitems weapon_*`, e.g. the apartment handgun) also reaches every other living player who lacks it. Keys and removals stay with the activator. | AUTOMATED TESTS PASSED |
| Scene cameras | No player model is sent to a client while that client watches a `trigger_camera`. | AUTOMATED TESTS PASSED |
| Tape recorders | The first recorder offers the save at once. A save while the partner is busy keeps their last good record. Failures are shown on screen. | AUTOMATED TESTS PASSED |
| Softlocks | `stuck` in chat moves a player next to the other player. In s4_nightmare, after a correct photo, a partner far away is moved next to the photographer. | AUTOMATED TESTS PASSED |
| Jitter | Partner: `rate 100000`, `ex_interp 0.06` (was 0.03 at the default rate). | AUTOMATED TESTS PASSED |
| Main menu | client.dll patched: Host Simon's Story, Join Simon's Story, Options, Quit. Host opens the Simon's Story list, which shows only the four Simon's Story entries. Shipped as an XOR delta; the original is kept and restored by Uninstall. | AUTOMATED TESTS PASSED |
| Player list | The ping/health/name list (prologue only before) shows on every co-op map. The launchers pass the Steam display name. | AUTOMATED TESTS PASSED |
| Credit | "Co-op mod developed by Anas Sammak (koolkat)" and "Special thanks to Michael Eminov", re-sent every 5 s on the train menu. | AUTOMATED TESTS PASSED |
| Key doors | The hall key door (`s4_apartment1` #36) and basement key door (`s4_apartment4` #190) use the key-door bridge. Keys handed out by scripts now count as keys. | AUTOMATED TESTS PASSED |

Not done: the player list is not drawn over the inventory screen (a separate,
fully opaque panel; it needs new drawing code in client.dll). The apartment
kids/sparks scene and other scene-specific issues need the host's log of a run
through them.
