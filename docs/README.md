# Cry of Fear Co-op: Simon's story for two players

**Version v0.3. This mod is unfinished.** Only a few early two-player test
sessions have been played, and there will be bugs. Please report them (see
[Reporting bugs](#reporting-bugs)).

Cry of Fear's own co-op mode is a separate campaign. This mod lets two
players play **Simon's single-player story** together instead.

Co-op mod developed by Anas Sammak (koolkat). Special thanks: Mesilll, Michal
Eminov, caixa.

## How it works

- **The story maps are adapted for two players.** Both players spawn
  together, and doors and level changes take both of you along. Cutscenes
  play for both, and story weapons and items are given to both.
- **Shared progress.** Codes, notes and objectives are shared, so either
  player can enter a keypad code.
- **Two-half items.** When the two halves of an item are picked up by
  different players, the halves go to one player so they can be combined.
- **Maps keep their state.** A map you go back to stays as you left it:
  taken items, dead enemies, opened doors and solved puzzles.
- **Saving.** Only the host can save. The host uses a tape recorder and picks
  slot 1, 2 or 3. Saves are kept on the host's PC.
- **Nothing in the game is permanently changed.** The mod runs only when you
  start the game with "Run Co-op Mod.cmd". Starting Cry of Fear normally
  gives you the original game. Uninstall puts everything back and keeps your
  co-op saves.

## What you need

- Cry of Fear from Steam, on both PCs.
- A way to reach each other's PC, for example Radmin VPN or a forwarded port
  27015.

## Install

Do this on both PCs, with Cry of Fear closed.

1. Download the latest `Cry of Fear Co-op v0.3.zip` from the Releases page
   and unzip it anywhere.
2. Run **Install or Update.cmd**. It finds the game through Steam, moves any
   older version of this mod aside and installs this one.

## Play

Both players double-click **Run Co-op Mod.cmd**. Cry of Fear opens with the
co-op main menu (Steam may ask once to allow the launch options).

- **Host:** in the main menu choose "Host Simon's Story", then
  "Simon's Story: New Game" (or "Load Slot 1/2/3"), and pick a difficulty.
  Give your friend your address (for example your Radmin VPN IP).
- **Friend:** **to connect**, open the game console with the **~** key and
  type `connect`, the host's IP address and `:27015` (or run
  `"Run Co-op Mod.cmd" join 192.168.1.1` from a command prompt), for
  example:

  ```
  connect 192.168.1.1:27015
  ```

**Skip a cutscene:** press **Space** during it to vote ("SPACE to skip 1/2"
bottom-left). When every player has voted, the scene jumps to its end and
still does everything it would have done (teleports, items, music). Scenes that
depend on timing (trains, boss fights, the endings) cannot be skipped.

**Stuck somewhere?** Press **Y** (chat) and type `stuck`. You are moved next
to the other player.

## Uninstall

Close the game and run **Uninstall.cmd**.
- Files are moved to "Cry of Fear - removed co-op files", next to the game
  folder; nothing is deleted.
- Your co-op saves are kept.

## Reporting bugs

Join the Discord: **https://discord.gg/hgEGSf9MFZ**

Every bug report needs the log file. That's how we can see what happened.

1. In Steam, right-click **Cry of Fear** > **Manage** > **Browse local files**.
2. Open the folder **`cryoffear\storycoop_logs`**.
3. Sort by **Date modified** and take the **newest** `rc4-<date>-<time>.log`
   from the session where the bug happened.
   - **The host's log is the most important one.**
   - If you can, also send the friend's log from the same session.
4. Post it in the Discord bug-report channel, with:
   - the place or map (open the console with `~` and type `status`; the
     map name is shown there);
   - what you did;
   - what went wrong, and a screenshot if you have one.

## Known limits (v0.3)

- Built and tested only with automated tests and a few early two-player
  sessions. Most of the campaign has not been played through in co-op yet.
- The endings (the strangle scenes and the final wheelchair boss) are
  still designed around player 1.
- Some particle effects may only show for the host.
- Two players only.
