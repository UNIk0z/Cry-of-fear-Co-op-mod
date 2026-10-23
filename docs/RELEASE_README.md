# Cry of Fear story co-op experimental RC1

This is an experimental compatibility package, not a complete campaign or an
overflow fix. Everything is reconstructed from your own Steam files; no BSP,
DLL, SDK asset, texture, model, sound, note art or original menu file is shipped.
V8/V11 baselines are preserved. Failed V12 is excluded.

Close normal and Sandboxie game clients before installation/removal. On the
development PC the package is already extracted; run this in PowerShell:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\outputs\story-coop-experimental-rc1\install-story-package.ps1"
```

On your friend's PC, extract the complete ZIP to a writable normal folder and
run install.cmd, or the same PowerShell command with that script's actual full
path. Default maps directory:
D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps.
For another Steam library, append -MapsDirectory followed by its quoted actual
full cryoffear\maps path. Keep plans/release.json/scripts together.

Default installation adds four aliases: c_start2_story_rc1 (doors/two credential
papers/four spawn candidates), c_apartment1_story_rc1 (one ordinary door/four
spawns/selected physical ammo and healing copies), c_start_link_rc1 and
c_start2_link_rc1 (native group portal loop). Existing c_start2_coop_note is
left intact. An additional Host Coop Game menu entry opens the native host dialog.
It is not a finished campaign selector/resume interface. Source menu is backed
up locally; -SkipMenu permits map-only installation when you have a custom menu.

Twelve additional ordinary-door/spawn candidates are supplied for advanced
review. Append -AllDoorCandidates to install them. The package contains16 new
map plans total; their scopes/hashes/locations are in map-summary.json/release.json.
They do not form a connected campaign: most exits still load stock names. Never
assume an alias is fully compatible because its BSP passes structural checks.

Launch normally through Steam/Sandboxie. Host native cof_campaign_01, join both
players and finish native ready-up until both are alive/visible. Then HOST console:

```text
changelevel c_start2_story_rc1
status
```

Follow TESTING.md as one ordered session. Both note readers still open; shared
four-digit PC code, quiet remote receipt, late-join journals and host checkpoint
saving are unresolved. The native portal state path is used but inventory/notes
retention and disconnect recovery are not verified. Network diagnostics are
observational; rates/authentication/buffer sizes are retained.

Rollback, with both clients closed:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%USERPROFILE%\Documents\Codex\2026-10-08\token-efficiency-and-context-management-this\outputs\story-coop-experimental-rc1\install-story-package.ps1" -Remove
```

Only known-hash new aliases are removed, including optional candidates. The
known patched menu is restored byte-exactly from its verified original backup.
Unknown/changed maps/menu/backups are retained and reported. Original maps,
DLLs/configs/saves and V11 are retained. baseline contains the old V11 installer
if a friend needs to reconstruct it separately. Re-running installation verifies
existing known maps and fills missing ones; no unknown file is overwritten.
