# Data Model

Version 0.3 separates identity, compatibility, observations, and scoring.

## `weapons.json`

One record per weapon.

Required fields:

- `slug`
- `name`
- `category`
- `ammoType`
- `verificationStatus`
- `verifiedOn`
- `baseStats`

## `mods.json`

One record per rarity variant.

Required fields:

- `slug`
- `name`
- `familySlug`
- `rarity`
- `slot`
- `verificationStatus`

The rarity is part of the mod identity. Enhanced and Deluxe versions must have different slugs.

## `compatibility.json`

One record per weapon/mod pairing.

Required fields:

- `weaponSlug`
- `modSlug`
- `verificationStatus`
- `verifiedOn`
- `effects`

This is where weapon-specific deltas belong.

Example:

```json
{
  "weaponSlug": "magnum-mc",
  "modSlug": "ironhold-barrel-deluxe",
  "verificationStatus": "live_verified",
  "verifiedOn": "2026-07-18",
  "sourceType": "in_game_screenshot",
  "effects": [
    {
      "stat": "recoil",
      "delta": -44.1,
      "unit": "percent"
    }
  ]
}
```

## `observations.json`

Stores provenance and historical evidence without overwriting current records.

A later patch can add a new observation and update the current compatibility record while
preserving the older observation.

## `scoring-profiles.json`

Contains user-input or playstyle-specific stat weights.

The current profile is:

```text
Mouse & Keyboard — Balanced
```

Future profiles could include:

- Controller
- Precision-focused
- Close-quarters
- Economy/loot value
- Weapon-specific profiles

## Verification statuses

- `live_verified`
- `community_verified`
- `community_unverified`
- `stale`
- `partial`

Current public records use `live_verified`.


## Schema-derived weapon records

Weapons captured from the in-game Schemas area use:

```json
{
  "sourceContext": "schema",
  "schemaCost": 2800
}
```

`schemaCost` is kept separate from `purchaseCost` because the displayed schema cost may
not represent the ordinary shop price. Missing values, such as a magazine stat that is not
shown on a schema screen, remain absent rather than being inferred.


## Inventory mod observations

A live mod tooltip may show a value that varies by weapon while the selected weapon is not
visible in the screenshot. These records use:

```json
{
  "verificationStatus": "live_observed",
  "observedEffectContext": "weapon_unresolved"
}
```

The values may be displayed as evidence, but they are not scored against a weapon until an
exact `compatibility.json` pairing is confirmed.

Exact pairings continue to use:

```json
{
  "verificationStatus": "live_verified"
}
```
