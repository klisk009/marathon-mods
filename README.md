# marathon-mods
Marathon weapon and mod evaluation project
Marathon Mods Starter Dataset
This package was generated from the uploaded `marathondb-mods.html`.
What was found
222 embedded mod records in `window.__MODS_DATA`
139 visible records (`is_active = 1`, `is_hidden = 0`)
83 hidden or legacy records
11 records listing `magnum-mc`
2 Season 2 live screenshot overrides applied
Important data-quality rule
Community values are not treated as authoritative. The files retain verification and
partial-data flags. Current in-game screenshots override community values.
The uploaded HTML's Deluxe Ironhold value for the Magnum was stale. The live Season 2
screenshot replaces it with:
Equip Speed: `-0.07s`
Recoil: `-44.1%`
The Enhanced Weighted Barrel values matched the live screenshot:
Moving Inaccuracy: `-16.4%`
Aim Assist: `+0.05°`
Files
`extract_marathondb.py` — reusable HTML extractor
`data/mods_all.json` — all embedded records, including hidden/legacy entries
`data/mods_active.json` — the 139 visible records
`data/mods.csv` — one row per mod
`data/weapon_effects.csv` — one row per mod/weapon/stat effect
`data/magnum_mods.csv` — initial Magnum-specific keep/verify ranking
`data/live_overrides.json` — current in-game corrections and Magnum base stats
`data/dataset_summary.json` — extraction counts
Run the extractor again
```powershell
python .\extract_marathondb.py "C:\path\to\marathondb-mods.html" --output .\data
```
Interpretation of `magnum_mods.csv`
The impact score is an initial relative-stat model, not a claim about Bungie's hidden
headline score formulas. It emphasizes recoil, moving accuracy, ADS spread, and range.
Records marked `VERIFY` should not drive a recycle decision until checked in game.
Hidden records are marked `EXCLUDE`.
