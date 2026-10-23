# Route coverage finding — campaign-doors-001 (2026-10-10)

RC4 overlays apartment1 only as s4_apartment1_e3/e7, which are reached from
c_start. Their exits go to RC2 s2_apartment2_e0..e3, and every apartment2 exit
returns to RC2 s2_apartment1_e0/e1/e2/e4/e5, not to the overlay. On those return
aliases the office (228/229), key-room (713) and key door (193) stay native, and
the one-time latches do not apply. The required fix is an apartment2 overlay with
bridged exits plus s4_apartment1 return aliases.

Key-door census across the campaign originals: 7 real key doors.
- apartment1#193 (bridged);
- asylum1#71 staffkey;
- asylum1day#406 backdoorkey (key from c_attic);
- city#353 citysewerkey (key from c_subway2st1);
- park#222 gatekey1;
- park2#142 package (key from c_start);
- sewer2#46 sewerkey.

---

# Current overlay and coverage limits — 2026-10-10

RC2 remains195 aliases/81 original maps/576 resolved generated route records;
235-map audit found197 direct story exits. Static reachability is not campaign
story-state/gameplay compatibility. Do not regenerate the full campaign.

Latest notes package overlays8 unchanged maintenance maps on full RC2:
cof_campaign_story4 → s4_nightmare → s4_start (nightmare exit uses existing engine
changelevel command); plus s4_start_e0, s4_start2, s4_start_e2,
s4_apartment1_e3 and s4_apartment1_e7. Branch/re-entry mapping is in
scripts/build-maintenance-rc4.mjs MAINTENANCE_MAPS and generated per-map plans;
other outgoing destinations remain retained s2_ routes. Need actual served alias
for new post-padlock door failure; do not assume route intent means converted door.

Door713 sd_door1 conversion exists on3s4_start aliases, apartment228/229 on2
apartment aliases; RC2 still has172 retained destination-bearing doors and13
blocked arrivals. Scripted enable/removal and alias coverage must be checked for
the actual failed route. Save whitelist is only3s4_start aliases; full graph is
not covered by world-state or checkpoint restoration. Latest Continue failed.
See PROJECT_HANDOFF/BUG_TRACKER; packages/geometry/baselines remain unchanged.

---

# Connected campaign graph

The existing235-map audit supplies81 original maps reachable from c_intro and197
directed entity exits. RC2 uses195 aliases to distinguish incoming landmarks;
576 generated route records all resolve to generated BSPs. Static traversal
reaches all195 aliases. This is not executable story-state reachability.

Root: cof_campaign_story2 (original c_intro). Initial directed chain includes
the original nightmare and street/cafe sequence. Original conditional/ending
branches remain; they were not replaced with a shortest-path walkthrough.

Package CAMPAIGN_ROUTES.md lists every original, alias, entry landmark, spawn
status and outgoing alias. campaign-routes.json holds per-entity metadata.
No unrelated native cooperative campaign is substituted.13 arrivals are BLOCKED;
172 destination-bearing doors retain incompatible or unresolved original logic.
Map-name-dependent compiled behavior/global state across aliases is unverified.

Private inputs: work/campaign-audit-001; current complete outputs:
work/connected-campaign-005. Builds001–004 are superseded, not releases.
