# One controlled two-client test

Install the patch in both actual Steam/Sandboxie environments with games closed.
Keep names/identities stable. P1 hosts via the supplied Steam launcher; P2 joins
before either readies. Enable `developer 1` and `condebug` on both clients, and
keep their separate qconsole logs. Do not concatenate or truncate them.

| Row | Exact map/action | Pass evidence from BOTH clients |
|---|---|---|
|1|`cof_campaign_story4`: join both, ready both, observe title reveal|Ready gates the intro; record whether the moving vehicle is visible. Keep `VEHICLE_STATE`, `VIEW_PVS`, `NATIVE_THINK` lines even if it fails.|
|2|Let intro finish without P2 movement|Automatic `s4_nightmare` load; both cameras/equipment/control. Continue naturally through nightmare to `s4_start` wake.|
|3|Reach café naturally at `s4_start2`; P1 collects password paper, original242, near `-600 1086 -602`|Both original readers open. Both CLOSE them normally. Wait1s; both have the paper in original notes UI, with shared archival notice.|
|4|Both read password through journal, close and re-open twice|Actual original text/page reads each time; no missing-resource error. Note `JOURNAL delivered` full ID/page and any `recall resource` lines.|
|5|P2 collects username paper, original243, near `27 2069 -518`|Both original readers open; both close normally. Both have username AND password. This assigns a precise second paper to the test; the old log did not identify collection order.|
|6|Both read each paper twice, including password after username pickup|Full content, stable IDs and two entries; no unreadable paper, duplicate grant or rejection loop. Touch/use the old pickup positions again; no new duplicate.|
|7|Use the normal E door to return from café to `s4_start_e0`, then revisit `s4_start2`|Both journals retain and re-read both papers. Canonical username/password still work at the café computer. Do not use manual `map` to simulate the round trip.|
|8|Normal E/audio/fade door; shared padlock at `s4_start`/`s4_start_e0`; ordinary item pickup|Both visible/controllable, correct static code, padlock sounds and unlocked door, inventory/pickups as before.|

Report the first failed note/progression row and P1/P2 symptoms. The vehicle row
is an evidence-collection row: if it remains missing but progression works,
continue rows3–8 so one run answers both problems. Keep exact client reader
errors, newly emitted full filenames/pages and the complete host vehicle trace.
The patch does not claim to repair vehicle visibility before this observation.

The preserved recorder/checkpoint candidate is described in CHECKPOINT.md; this
focused regression test is not a replacement for its fresh restarted-save test.
