# Test for coop-fixes-014

Run `Install or Update.cmd` on **both** PCs first (game closed). Send the
newest `...\Cry of Fear\cryoffear\storycoop_logs\rc4-<date-time>.log` from the
**host's** PC, and say what you saw and where.

1. **Join into the nightmare camera:** the host starts a new game and waits
   until the s4_nightmare opening camera is running. Only then does the friend
   join (`Join a game.cmd`). The friend's game must not crash, and the camera
   must show normally.
2. **Rejoin:** the friend quits to the menu and joins a second time, while a
   camera is running if possible. It must not crash.
3. **Handgun scene (apartments):** no Simon model stands inside the scene
   camera, on either screen. Both players still see each other after the scene.
4. **Missing objects:** if a door, wall, prop or anything else is invisible or
   missing, note the map name (console: `status`) and take a screenshot. Also say whether a scene camera was running at the time.

Log lines that matter: `CAMERA`, `MODEL`, `CARRY`, `NET`.
