# Adding a Verified Mod

Use this process for each new Magnum MC mod.

## 1. Capture a clean screenshot

The screenshot should show:

- Mod name
- Rarity
- Slot
- Exact stat deltas
- Magnum MC in the compatible weapon list
- No ambiguity about which rarity variant is shown

Prefer a weapon with no other mods attached when validating resulting weapon stats.

## 2. Use the website generator

Open the **Generate a new verified mod record** section.

Enter:

- Name
- Rarity
- Slot
- Verification date
- Up to three exact stat deltas
- A concise verification note

Select **Generate JSON**, then **Copy JSON**.

## 3. Add the record to the dataset

Open:

```text
data/verified-data.json
```

Find the `mods` array. Add a comma after the previous mod object, then paste the new object.

Example:

```json
"mods": [
  {
    "slug": "existing-mod-enhanced",
    "name": "Existing Mod"
  },
  {
    "slug": "new-mod-deluxe",
    "name": "New Mod"
  }
]
```

Also update the top-level `lastVerified` date.

## 4. Validate before committing

Use a JSON validator or GitHub's editor warning. A missing comma or extra comma will prevent the
site from loading.

After committing, open the GitHub Pages site and confirm:

- The verified mod count increased
- The new mod appears in both comparison selectors
- The effects are displayed correctly
- The resulting stat values are correct
- The score and recommendation are plausible

## Verification statuses

Public data should use:

```json
"verified": true
```

Do not publish uncertain community values as verified. Keep those in a private research file until
they are checked in game.
