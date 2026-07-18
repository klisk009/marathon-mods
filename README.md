# Marathon Mod Database

A public-safe static web application for searching, filtering, comparing, and scoring
weapon-specific Marathon mod records.

## Version

**0.3.1**

## What changed in v0.3.1

- Added the live-verified Misriah 2442 weapon profile
- Added support for weapon-specific display stat lists
- Added Firepower, Handling, and Spread Angle fields
- Added shotgun spread weighting for future mod comparisons

## What changed in v0.3

- Split the data into linked database files
- Added a weapon selector
- Added catalog search and filters
- Added slot, rarity, and verification-status filters
- Added weapon-aware compatibility records
- Added configurable scoring profiles
- Added a reusable compatibility-record generator
- Added a Python data validator
- Preserved the public-data restriction while permission is pending

## Public data currently included

- Magnum MC
- Misriah 2442
- Enhanced Weighted Barrel
- Deluxe Ironhold Barrel
- Two live-verified Magnum compatibility records

No bulk third-party database is included.

## Repository structure

```text
marathon-mods/
├── data/
│   ├── metadata.json
│   ├── weapons.json
│   ├── mods.json
│   ├── compatibility.json
│   ├── observations.json
│   └── scoring-profiles.json
├── docs/
│   ├── DATA_MODEL.md
│   └── IMPORT_PLAN.md
├── tools/
│   └── validate_data.py
├── index.html
├── styles.css
├── app.js
├── README.md
├── LICENSE
└── .gitignore
```

## Deploying v0.3

Replace the existing application files with the contents of this package.

Upload or replace:

```text
index.html
styles.css
app.js
README.md
.gitignore
data/
docs/
tools/
```

Commit directly to `main`. GitHub Pages should redeploy automatically.

## Validate the data locally

From the repository folder:

```powershell
python .\tools\validate_data.py
```

Expected result:

```text
Validation passed.
```

## Local preview

```powershell
python -m http.server 8000
```

Open:

```text
http://localhost:8000
```

## Data policy

Only current live-verified or user-created records are published while permission for a
broader external dataset is pending. Community records can later be imported with explicit
status labels and provenance if permission is granted.
