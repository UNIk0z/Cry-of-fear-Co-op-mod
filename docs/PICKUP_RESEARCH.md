# Current inventory boundary — final handoff 2026-10-10

Earlier hotfix real user test verified additional ammo/weapon/syringe pickups;
preserve those grants. This does not implement independent per-location claims
or per-client hiding. Historical map-only extension restriction below has changed:
user authorized isolated version-pinned own -dll adapter, original DLL unchanged.

Latest P1 inventory UI/icons become white after second PASSWORD paper242. Exact
malformed-item/render/resource/HUD/memory mechanism is unknown; use forthcoming
screenshots/log, compare original/native replay state, do not rewrite grant chain.
Shared story notes/access are verified working BOTH and must survive a fix.

Checkpoint-specific inventory capture/restore is in native/rc4/checkpoint-runtime.hpp:
native6 names+weapon list, active252C, reserve2540, items22C8, health entvars164,
stamina21F0, tapes1EF4, battery22A8, usedSyringe226C. SDK cof_clearitems/giveitems/
weaponswitch synchronizes fresh state and reads back. Actual slot1 contains3
weapons/nonempty names for each player; real Continue nonetheless yields empty
inventories. Identity gate, native initialization and partial-failure latch must
be traced. See RC4_CHECKPOINT; fixture pass is not game restore success.

---

# Per-player ground pickups: current technical boundary

Requested behavior: one placed pickup, independent entitlement for each player;
successful collection hides/disables it for that player while preserving it for
unclaimed players. Inventory grants remain server-authoritative. No extra placed
weapon is required per player. A failed grant (full inventory/ammo/health) must
not consume entitlement. Shared story conditions must not fire repeatedly.

No weapon/ammo/healing pickup entities were found in the original c_start2 BSP;
the relevant placed pickups there are credential notes242/243. A first failing
weapon/item map and location has been requested. Map-spawned loot is the initial
scope; dropped weapons, death drops, reconnect persistence and transitions need
explicit policies rather than cloning every newly spawned object automatically.

Read-only native research used the existing Steam hl.dll snapshot, SHA256
0036b91c01e92ed205513f52563053a55a66a32d257efb5f476b8f1f3dde0e63.
Raw evidence remains in work/note-source-001; no compiled code changed.

- Weapon `DefaultUse` at VA10017AC0 simply calls `DefaultTouch` at1011C7D0.
  Touch validates player, checks game rules, attempts native AddPlayerItem,
  follows normal weapon handling, and fires its use targets. Changing Use versus
  Touch alone therefore does not create independent pickup instances.
- AddPlayerItem at100DAF10 uses the player's weapon inventory and calls the
  game-rules respawn decision through1011C040. This is the existing shared-world
  inventory/respawn path, not a demonstrated per-location claim ledger.
- The native registered `mp_weaponstay` cvar exists at10214660 (value+0x0C).
  Its two value references are100C6F50 and100C8850. The first scans existing
  inventory weapon IDs to reject a weapon type already owned when stay is on;
  the second chooses a respawn time. This is **weapon-type ownership plus
  respawn**, not once-per-player-per-location visibility. The 32-entry array
  written near1011CC0C also contains weapon IDs; do not mistake it for unique
  map-pickup IDs or proof of per-client instancing.
- Native CItem::ItemTouch at100B4F00 clears interaction after a successful grant
  and asks the rules to respawn or remove the shared item. Weapon-stay does not
  establish the requested ammo/healing/key behavior.
- Native AddToFullPack callback is at10018870, identified through the native
  DLL_FUNCTIONS table102119F8, callback index39. Inspected body ends10018CA9.
  It has ordinary visibility/effects/group filtering; no verified BSP key was
  found for player-specific per-pickup claims. Static inspection does not prove
  that no other native mechanism exists.
- SDK WeaponBase has an item-lock master and clip/custom-model fields, but no
  documented per-player pickup flag. Button flag1024 belongs to func_button;
  it must not be assigned to weapon entities as an invented pickup fix.

**Full pickup instancing is not implemented.** Under the current map-only
approach, independent per-entity claims and recipient-specific hiding have no
verified native interface. A supported, Steam-compatible game/client extension
could implement those functions; none is available in this repository. The
previous public Xash reconstruction is not a native Steam drop-in. Existing
project restrictions exclude binary patches/injection/replacement, so those
are not a substitute. Do not generalize a weapon-stay test to all pickups.

For a bounded, reversible native weapon test on the user's identified map:

```text
mp_weaponstay
```

Record its current value, then, HOST ONLY in the already working co-op session:

```text
mp_weaponstay 1
mp_weaponstay
```

Have P1 and P2 (neither initially owning that weapon type) try the SAME placed
weapon with available inventory slots. Record acquisition and whether the item
remains visible independently. Then try repeating while already owning it and
after dropping it. Ammo and healing need separate tests; this cvar does not
implement them. Do not spawn duplicates or treat respawn as a silent conversion.
Restore the recorded previous value afterward with `mp_weaponstay <old value>`;
do not edit server.cfg or assume the default. This optional native experiment
does not change the v12 note BSP or satisfy full pickup instancing.
