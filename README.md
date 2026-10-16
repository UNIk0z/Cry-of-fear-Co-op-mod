<div align="center">

# Cry of Fear Co-op

Play Simon's single-player story in Cry of Fear with a friend.

[![Discord](https://img.shields.io/badge/Discord-report%20bugs-5865F2?logo=discord&logoColor=white)](https://discord.gg/hgEGSf9MFZ)

</div>

The game's built-in co-op is its own separate campaign. This mod is for the
main story: two players go through Simon's campaign together, start to finish.

It's an early test build (v0.3). I've only played a few two-player sessions on
it so far, so expect bugs, and please report them on the
[Discord](https://discord.gg/hgEGSf9MFZ).

## Download

**[Cry of Fear Co-op v0.3 (ZIP)](https://github.com/UNIk0z/Cry-of-fear-Co-op-mod/releases/download/v0.3/Cry.of.Fear.Co-op.v0.3.zip)**

If that link doesn't start a download, go to the
[v0.3 release page](https://github.com/UNIk0z/Cry-of-fear-Co-op-mod/releases/tag/v0.3)
and grab `Cry.of.Fear.Co-op.v0.3.zip` under Assets. Don't use the green Code
button or "Download ZIP" on this page. That gets you the source of this repo,
not the mod.

## What you need

- Cry of Fear from Steam, on both PCs.
- A way to connect to each other, like Radmin VPN or port 27015 forwarded on
  the host's router.

## Install

Both players do this:

1. Extract the ZIP anywhere (right-click, Extract All).
2. Close Cry of Fear and run `Install or Update.cmd`. It finds the game through
   Steam, moves any older version of the mod out of the way and installs this
   one.

You only need to run it again when a new version comes out.

## Play

Both players start the game with `Run Co-op Mod.cmd`, every time. Launching
Cry of Fear normally from Steam still gives you the original game.

- **Host:** press H. In the main menu pick *Host Simon's Story*, then
  *Simon's Story: New Game* (or *Load Slot 1/2/3*) and a difficulty. Send your
  friend your address, for example your Radmin VPN IP.
- **Friend:** once the game is open, press `~` to open the console and type
  `connect`, then the host's IP address and `:27015`. For example:

  ```
  connect 192.168.1.1:27015
  ```

  This is the only way to join.

If one of you gets stuck somewhere, press Y to open chat and type `stuck`. It
moves you next to the other player.

## What the mod changes

- You both spawn together, and doors and level changes take both players
  along.
- Cutscenes play for both of you, and both get the story weapons and items.
- Codes, notes and objectives are shared, so either player can punch in a
  keypad code.
- Items that come in two halves (like the number plate and the scissors) get
  combined automatically, even if each of you picked up one half.
- Maps remember their state. If you go back to one, the items you took, the
  enemies you killed, the doors you opened and the puzzles you solved stay that
  way.
- Only the host can save. Use a tape recorder and pick slot 1, 2 or 3. Saves
  live on the host's PC.

## Uninstall

Close the game and run `Uninstall.cmd`. It moves the mod's files into a folder
called *Cry of Fear - removed co-op files* next to the game folder. Nothing gets
deleted, and your co-op saves stay.

## Reporting bugs

Post bugs in the bug-report channel on the
[Discord](https://discord.gg/hgEGSf9MFZ), and always attach the log file. I
can't tell what went wrong without it.

To find the log:

1. In Steam, right-click Cry of Fear > Manage > Browse local files.
2. Open `cryoffear\storycoop_logs`.
3. Sort by Date modified and take the newest `rc4-<date>-<time>.log` from the
   session where the bug happened.

The host's log matters most. If the friend can send theirs from the same
session too, even better.

Also say which map you were on (open the console with `~` and type `status`),
what you were doing, and what went wrong. A screenshot helps.

## Known issues in v0.3

- Most of the campaign hasn't been played through in co-op yet, only tested
  with automated tests and a few sessions.
- The endings (the strangle scenes and the final wheelchair boss) still only
  really work for player 1.
- Some particle effects might only show up for the host.
- Two players max.

## Credits

Made by Anas Sammak (koolkat). Thanks to Mesilll, Michal Eminov and caixa.

Cry of Fear is by Team Psykskallar. This is an unofficial fan mod and you need
the original game from Steam to play it.
