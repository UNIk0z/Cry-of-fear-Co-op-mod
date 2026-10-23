# coop-fixes-005 — 2026-10-12

This updates coop-fixes-004, the build you tested. The maps are the same
except the prologue, where the added rain is gone. Nothing new here has been
seen in a real game yet.

## Your report → cause → change

| Your report | Cause (read from the game's own code and your log) | Change |
|---|---|---|
| Cutscenes still show the flashlight | Your log shows the cutscene hold found the phone light already off (`spot=0`). The circle came from a second light system: CoF stores each player's light in that player's score field and the client draws a lit spot for every player whose score has the phone, flashlight or **police flashlight** bit. That pass ignores camera views. In co-op the flashlight key turns on that police flashlight, and the hold never touched it. | The police flashlight is refused in co-op. At the start of every cutscene, and every half second during it, the server resends each player's light state, which clears that score bit. |
| P1's phone light has the beam texture, P2 only gets a small light | The small light is the score-based light everyone sees for other players. The beam texture is drawn only by each client for itself, and the server sends P2 the same phone state as P1. I could not find, from the code alone, why P2's own client skips the texture. | The log now has a `LIGHT` line whenever a player's light changes, with the view the server has for that player. Please answer test 3. |
| Only the phone or the lantern should give light | — | The police flashlight, the Maglite item and the gun light stay off in co-op, and the player is told to use the phone or lantern. The phone and lantern are unchanged. |
| Remove the rain | — | The three rain areas and the heavier constant rain are gone. The prologue is back to the game's own settings. |
| A "Host Simon Story" in the real main menu with Load or Host new game, 2 players and difficulty | The 3D main menu's buttons are fixed in the game's binary. But its **Custom Campaign** page lists `maps/*.custom` files, and picking one opens the game's own difficulty page. | Custom Campaign now lists **"Simon Story co-op: host new game"** and **"Simon Story co-op: continue save"**. After the difficulty choice and the white fade, the co-op adapter starts a two-player server: the prologue, or your newest valid save. It only works when the game was started with the adapter: use `Start co-op menu.cmd` or the Steam launch options in START_HERE.md. |
| P2 closing the ESC menu unpauses the game while P1 is still in it | Each player's menu sends "pause"/"unpause" to the server, and the engine obeys whichever came last. | The host's menu state is read through the game menu's public interface. When an unpause arrives while the host's menu is open, or while the partner who paused has not closed theirs, the host pauses again at once. |
| Players should look like Simon, not police officers | Player models come from each player's model setting (`police1`). Simon's own model has exactly the same 32 bones and 85 animations as the police models. | The installer copies your own `models/player.mdl` to `models/player/simon/simon.mdl`, and on the co-op maps the server sets both players' model to `simon`. |
| Dual wield does not work in co-op | The game's own dual-wield command stops at its first check whenever the game is multiplayer. The dual-wield routine itself is internal to the game's code. | **Not changed.** Turning it on would mean calling the game's internal code or patching its checks, which this project does not do. |

## Still open

- **Pause:** if the partner opens the menu while the game is already paused by
  the host, the server cannot tell. If the host then closes first, the game
  resumes while the partner's menu is still open. Every other order holds the
  pause.
- **P2 phone beam texture:** cause not found yet (see above).
- Ladder hitches, the code drawn right of the page after a map change, silent
  locked converted doors and four players are unchanged from 004.

## Technical notes

- `native/rc4/session-runtime.hpp` holds the new code:
  - light policy: `flashlight` command, `+0x1EA8`/bit 8, bit 4, frags bit 0x20
    cleared via `+0x5D4=-1`;
  - Simon model through `SetClientKeyValue`;
  - pause attribution: `IGameUI` `GameUI007` slot 11 plus the pinned hw.dll
    `sv.paused` at `025203A4`, with hw.dll and GameUI.dll pinned by SHA256;
  - the menu host: `campaign` command, plus the `CLIENT_COMMAND("map …")`
    replacement;
  - the per-session log.
- `camera-runtime.hpp`: the cutscene hold also forces the FlashFlags/ScoreInfo
  resend.
- The map build `build-campaign4-rc4.mjs … --campaign5 <coop-fixes-004>` turns
  the prologue rain off. Only `cof_campaign_story4` differs from 004.
- The installer's catalog `extras` covers two own-text `.custom` files and an
  optional copy of `models/player.mdl` (hash-pinned). They have the same guards
  as maps: changed files block removal, and a different `player.mdl` only skips
  the model.
