# Marathon Mod Evaluator

A public-safe, static web application for evaluating live-verified Marathon weapon mods.

## Current version

**0.2.0**

Current scope:

- Weapon: Magnum MC
- Input: Mouse and keyboard
- Season: 2
- Side-by-side mod comparison
- Before-and-after stat matrix
- Transparent impact score
- JSON generator for adding the next live-verified mod

## Included verified mods

- Enhanced Weighted Barrel
- Deluxe Ironhold Barrel

Only values confirmed from current in-game screenshots are included in the public dataset.

## Repository structure

```text
marathon-mods/
├── data/
│   ├── verified-data.json
│   └── new-mod-template.json
├── docs/
│   └── ADDING_MODS.md
├── index.html
├── styles.css
├── app.js
├── README.md
├── LICENSE
└── .gitignore
```

## Updating the website

Replace the existing copies of:

```text
index.html
styles.css
app.js
README.md
```

Upload these new files:

```text
data/new-mod-template.json
docs/ADDING_MODS.md
```

Replace:

```text
data/verified-data.json
```

Then commit the changes. GitHub Pages will redeploy automatically.

## Scoring model

The score measures relative improvement against the Magnum MC's verified base stats.

Current emphasis:

1. Recoil
2. Moving inaccuracy
3. ADS spread
4. Range
5. ADS and equip speed
6. Reload and magazine size
7. Aim assist
8. Zoom and weight

The score is a heuristic for inventory decisions. It is not Bungie's unpublished Firepower,
Accuracy, or Handling formula.

## Data policy

Bulk third-party databases are not included. Community data may be used privately as a lead,
but a public record is added only after the current Magnum-specific values are confirmed in game.
