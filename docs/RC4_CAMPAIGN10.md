# coop-fixes-010 — 2026-10-13

This updates coop-fixes-009 with your CO-OP main menu title. The maps, the
adapter, the Simon model and the Custom Campaign entries are identical to
009.

## What changed

| Your request | Change |
|---|---|
| Use my new logo ("CRY OF FEAR" with "CO-OP" under it) in the main menu | The installer replaces `gfx\vgui\menu_logo.tga` with your title. The package does not contain the image itself: it carries only the difference between the game's title and yours (25 KB). Each PC rebuilds your title from its own copy of the game's title and checks the result by SHA256. The game's title is kept beside it as `menu_logo.tga.storycoop-original`, and `remove.cmd` puts it back. If a PC has a different version of the game's title, the CO-OP title is skipped there and the game's own title stays. |
| Installer texts | The installer and `Start co-op menu.cmd` now name the "Co-op Story: New Game" / "Co-op Story: Continue" entries. |

Still from 009 (not yet seen in a real game): Simon on the intro and
nightmare, the moving dual-wield model, `*paused*`, the bottom-left credit,
the short Custom Campaign entries.

## Still open

Enemy hitboxes and the ladder stall (no log of them yet), the intro train,
the pause case where the partner opens the menu while the host's game is
already paused, ladder hitches, four players.
