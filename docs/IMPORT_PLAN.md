# Full Database Import Plan

The application is ready for a larger dataset. The public import remains blocked until permission
or a suitably licensed source is available.

## When permission is granted

1. Import weapon identities into `weapons.json`.
2. Import each rarity variant into `mods.json`.
3. Import weapon/mod links into `compatibility.json`.
4. Preserve source verification flags.
5. Put source and patch history into `observations.json`.
6. Run `tools/validate_data.py`.
7. Review hidden, legacy, partial, and unverified records before publishing.
8. Add attribution required by the source owner.

## Conflict precedence

Use this order:

1. Current clean in-game screenshot
2. Current officially documented value
3. Current community-verified value
4. Community-unverified value
5. Historical or stale value

Never overwrite a newer live observation with a lower-confidence source.

## Public status handling

Community values should appear with visible status labels. They should not drive an irreversible
recycle recommendation until confirmed in game.
