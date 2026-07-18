from __future__ import annotations

import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"


def load_json(name: str) -> Any:
    path = DATA / name
    if not path.exists():
        raise FileNotFoundError(f"Missing {path.relative_to(ROOT)}")
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def require_unique(records: list[dict], field: str, label: str) -> set[str]:
    seen: set[str] = set()
    duplicates: set[str] = set()

    for record in records:
        value = record.get(field)
        if not isinstance(value, str) or not value:
            raise ValueError(f"{label} record is missing a valid {field}: {record}")
        if value in seen:
            duplicates.add(value)
        seen.add(value)

    if duplicates:
        raise ValueError(f"Duplicate {label} {field} values: {sorted(duplicates)}")

    return seen


def main() -> None:
    metadata = load_json("metadata.json")
    weapons = load_json("weapons.json")
    mods = load_json("mods.json")
    compatibility = load_json("compatibility.json")
    observations = load_json("observations.json")
    profiles = load_json("scoring-profiles.json")

    if metadata.get("appVersion") != "0.3.0":
        raise ValueError("metadata.json appVersion must be 0.3.0")

    weapon_slugs = require_unique(weapons, "slug", "weapon")
    mod_slugs = require_unique(mods, "slug", "mod")
    require_unique(observations, "id", "observation")
    require_unique(profiles, "id", "scoring profile")

    compatibility_keys: set[tuple[str, str]] = set()
    allowed_statuses = {
        "live_verified",
        "community_verified",
        "community_unverified",
        "stale",
        "partial",
    }

    for record in compatibility:
        weapon_slug = record.get("weaponSlug")
        mod_slug = record.get("modSlug")
        key = (weapon_slug, mod_slug)

        if weapon_slug not in weapon_slugs:
            raise ValueError(f"Unknown weaponSlug in compatibility: {weapon_slug}")
        if mod_slug not in mod_slugs:
            raise ValueError(f"Unknown modSlug in compatibility: {mod_slug}")
        if key in compatibility_keys:
            raise ValueError(f"Duplicate compatibility record: {key}")
        compatibility_keys.add(key)

        status = record.get("verificationStatus")
        if status not in allowed_statuses:
            raise ValueError(f"Invalid verificationStatus {status!r} in {key}")

        effects = record.get("effects")
        if not isinstance(effects, list) or not effects:
            raise ValueError(f"Compatibility record {key} requires at least one effect")

        for effect in effects:
            if not isinstance(effect.get("stat"), str) or not effect["stat"]:
                raise ValueError(f"Invalid stat in {key}: {effect}")
            if not isinstance(effect.get("delta"), (int, float)):
                raise ValueError(f"Invalid delta in {key}: {effect}")
            if not isinstance(effect.get("unit"), str) or not effect["unit"]:
                raise ValueError(f"Invalid unit in {key}: {effect}")

    counted = metadata.get("dataCounts", {})
    expected_counts = {
        "weapons": len(weapons),
        "mods": len(mods),
        "compatibilityRecords": len(compatibility),
        "observations": len(observations),
        "scoringProfiles": len(profiles),
    }

    if counted != expected_counts:
        raise ValueError(
            "metadata.json dataCounts do not match the files.\n"
            f"Expected: {expected_counts}\n"
            f"Found:    {counted}"
        )

    print("Validation passed.")
    print(f"Weapons: {len(weapons)}")
    print(f"Mods: {len(mods)}")
    print(f"Compatibility records: {len(compatibility)}")
    print(f"Observations: {len(observations)}")
    print(f"Scoring profiles: {len(profiles)}")


if __name__ == "__main__":
    main()
