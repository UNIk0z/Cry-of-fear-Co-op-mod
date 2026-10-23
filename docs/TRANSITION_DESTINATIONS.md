# Transition destination evidence

Same-map adapters preserve each unique original targetname -> inter_door_exit
origin and angles. Native door Think10048070 adds -player.mins.z+1 to that feet
position. RC2 uses the existing cof_teleport convention with that original origin;
it does not invent a reverse door or choose a nearby empty room.

scripts/campaign-destinations.mjs checks standing support and a connected local
walkable neighborhood. Dynamic brushes and intended story-room correctness still
require gameplay. Static clearance is not permission to call a destination fixed.

Cross-map candidates use original source position minus source landmark plus
destination landmark. Source positions come from original door exits (+37) or
touch-volume centers, whose actual touching coordinate varies. Slots are separated,
follow clear/static stair paths and avoid standing hull overlap with return
transition volumes. c_intro starts at its original initial spawn, not its incoming
return landmark. c_nightmare first entry has only2 validated static slots.

c_apartment1 has no destination marker named land2b or land4 although incoming
edges request them. These stay BLOCKED instead of falling back to its default
start. Other blocked entries and all destination evidence are in the package JSON.

RC1 ready-zone failure: native Think1010BB40 sends local pev.mins/maxs to
EntitiesInBox10118390, then Intersects10017D80 uses world absmin/absmax. Translating
origin170 separated these regions. RC2 clones model metadata bounds at origin0.
Original model records and13 other nonentity lumps remain exact. No custom
brush faces or collision trees are generated; this is an AABB-query candidate.
Native group door1004C100 checks target.iuser1; eligible count1010A400 excludes
dead/ineligible clients. Success still requires both clients to change BSP.

Private native evidence: work/campaign-rc2-research plus existing RC1 research.
No binary is patched or redistributed.
