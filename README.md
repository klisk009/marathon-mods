# Marathon Companion Lab — v0.5.0-dev

This development release pivots the project from a single-page mod evaluator into a clickable companion-app foundation.

## What works

- Desktop sidebar and mobile bottom navigation
- Clickable weapon cards and mod-family cards
- Weapon and mod detail drawer
- Rarity-family grouping
- Local “owned mod” tracking
- Build Lab using exact, weapon-specific verified effects only
- Saved builds using browser local storage
- Configurable Cradle XP and Matter conversion calculator
- Inventory screenshot upload and preview
- Local scan-draft metadata history
- Installable PWA and offline cache foundation

## Deliberately not automated yet

- Inventory OCR, tile detection, and icon recognition
- Permanent screenshot storage
- Complete Cradle XP progression table
- Shells, cores, Cradle skill nodes, maps, and guides
- Community accounts or Discord submissions

The scanner screen is the workflow foundation. It never pretends that an image has been recognized when OCR has not run.

## Upload to GitHub

Use the `v0.5-dev` branch. Extract the ZIP first, then upload everything inside the extracted folder to the repository root. Preserve the `data`, `docs`, `icons`, and `tools` folders.

Suggested commit message:

```text
Start v0.5 clickable companion foundation
```

This branch does not change the public GitHub Pages site while Pages continues to deploy from `main`.

## Local preview on Windows

Download the `v0.5-dev` branch or extract this package, open PowerShell inside the project folder, and run:

```powershell
py -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Do not open `index.html` through `file:///`; browsers block the JSON fetches in that mode.

## Data additions in this development package

The package preserves v0.4 data and adds recent exact screenshots for Stryder M1T, BR33 Volley Rifle, Twin Tap HBR, M77 Assault Rifle, Misriah 2442, and Magnum MC. It also adds Superior Combat Mag, pistol lenses, CQC Precision Barrel variants, and firing-cycle metadata for the three precision rifles.
