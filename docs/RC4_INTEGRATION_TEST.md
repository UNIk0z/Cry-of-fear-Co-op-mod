# One integrated two-client regression

Use the single installation procedure in START_HERE.md in both real environments.
Preserve prior logs/saves. Start a NEW campaign first; do not use an old slot419
to judge whether the new Sewer Store421 selection is correct. Use slot2 or3 if
slot1 contains a checkpoint you wish to retain. This guide is for the user after
the unattended development session; no gameplay result below is asserted.

1. Close both clients completely. Launch Host RC4.cmd through Steam. Confirm
   BOOT backend SHA verified, correct MAP scope and that both clients join before
   either selects ready. Check only P1 ready cannot start; P2 ready begins normally.
2. Watch original intro, title vehicle and automatic final transition without
   moving P2. Record whether vehicle is visible and VEHICLE_STATE packed values.
   Complete nightmare and automatic wake. Confirm both models and equipment.
3. Collect username paper243 then PASSWORD paper242. After each, open/close both
   inventories and read both notes. Photograph any white display; verify phone,
   knife, selection and normal gameplay still work. Capture full P1 AND P2 logs.
4. Use the computer. Both journals must show the same actual four digits. Change
   maps and reopen both journals after CLIENT active commands. Reopen inventory;
   check digits survived without duplicate notes or missing equipment.
5. Each player sequentially uses the padlock. Wrong code must fail; correct code
   must open it. Re-test original sound, fade, independent travel and visibility.
6. Follow the original story through the “look right” scene and unlocked door.
   Before its intended event the door must stay locked; after it both players
   must use E independently with finite fade/audio and correct destinations.
   Door204 now has a traced gated conversion, but record the map/door location
   if the reported blocker is a different door. Continue into sewer normally.
7. Give players DIFFERENT health, ammo and inventories; write down both. Use
   host console status. If identities need profiles: sc_checkpoint_bind USERID
   uni and sc_checkpoint_bind USERID partner, using actual current user IDs.
   Reuse these person-specific keys after restarting; never swap by join order.
8. Select sc_checkpoint_slot 2. Host uses the SEWER STORE tape. Log must state
   COMMITTED map=s4_start_e0 (or matching current c_start alias) recorder=421.
   Storage Tunnel must record419. A refusal is a failed save, not success.
9. Close BOTH clients fully. In PowerShell run host-story-coop.ps1 -ContinueSlot 2.
   Expect PREPARE accepted, then LOAD staged before map entities. Any unknown
   command/REFUSED/FAILED is a failed load. Keep the entire launch log.
10. Rejoin both players; rebind profiles to their current USERIDs if necessary.
    Expect each restore readback message AFTER native HUD readiness. Verify each
    player's own health, weapons, loaded/reserve ammo, consumables and equipped
    weapon. Confirm both are at the SEWER STORE anchor, not Storage Tunnel/entrance.
11. Reopen both journals: all collected notes and actual code must be readable.
    Padlock stays solved; completed supported scenes/scare cleanup remain applied.
    Check cameras/control, models, interactions and continue the story normally.
12. Save again, fully restart and repeat. Reverse guest join timing where possible;
    confirm profiles still match their own inventories. Test return visits, native
    fullupdate/HUD reset and original SP using its normal launcher without adapter.

At any failed step, preserve both complete console logs, map name, screenshot,
selected slot and its .bak privately. Do not overwrite the only good save trying
to force a pass. The supplied collect-story-log.ps1 helps collect logs; account
IDs/save payloads must not enter Git or public reports. One consolidated result
should list the first failure and which subsequent independent checks ran.
