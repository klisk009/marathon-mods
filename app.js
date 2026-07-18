const DATA_FILES = [
  "metadata",
  "weapons",
  "mods",
  "compatibility",
  "observations",
  "scoring-profiles"
];

const statMeta = {
  firepower: { label: "Firepower", unit: "", lowerIsBetter: false },
  handling: { label: "Handling", unit: "", lowerIsBetter: false },
  spreadAngle: { label: "Spread angle", unit: "°", lowerIsBetter: true },
  damage: { label: "Damage", unit: "", lowerIsBetter: false },
  precisionMultiplier: { label: "Precision multiplier", unit: "×", lowerIsBetter: false },
  rpm: { label: "RPM", unit: "", lowerIsBetter: false },
  hipfireSpread: { label: "Hipfire spread", unit: "°", lowerIsBetter: true },
  adsSpread: { label: "ADS spread", unit: "°", lowerIsBetter: true },
  crouchSpreadBonus: { label: "Crouch bonus", unit: "%", lowerIsBetter: false },
  movingInaccuracy: { label: "Moving inaccuracy", unit: "%", lowerIsBetter: true },
  equipSpeed: { label: "Equip speed", unit: "s", lowerIsBetter: true },
  adsSpeed: { label: "ADS speed", unit: "s", lowerIsBetter: true },
  weight: { label: "Weight", unit: "%", lowerIsBetter: true },
  recoil: { label: "Recoil", unit: "%", lowerIsBetter: true },
  aimAssist: { label: "Aim assist", unit: "°", lowerIsBetter: false },
  reloadSpeed: { label: "Reload", unit: "s", lowerIsBetter: true },
  range: { label: "Range", unit: "m", lowerIsBetter: false },
  magazineSize: { label: "Magazine", unit: "", lowerIsBetter: false },
  adsZoom: { label: "ADS zoom", unit: "×", lowerIsBetter: false }
};

const unitMap = {
  percent: "%",
  degrees: "°",
  seconds: "s",
  multiplier: "×",
  flat: ""
};

const state = {
  data: {},
  weaponSlug: null,
  filters: {
    search: "",
    slot: "",
    rarity: "",
    status: ""
  },
  generatedRecord: null,
  effectRowCount: 0
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatNumber(value) {
  if (Number.isInteger(value)) return String(value);
  return Number(value).toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function formatBaseValue(stat, value) {
  const unit = statMeta[stat]?.unit || "";
  return `${formatNumber(value)}${unit}`;
}

function formatEffect(effect) {
  const sign = effect.delta > 0 ? "+" : "";
  return `${sign}${formatNumber(effect.delta)}${unitMap[effect.unit] ?? effect.unit ?? ""}`;
}

function statusLabel(status) {
  return {
    live_verified: "Live verified",
    community_verified: "Community verified",
    community_unverified: "Unverified"
  }[status] || status;
}

function getWeapon(slug = state.weaponSlug) {
  return state.data.weapons.find(weapon => weapon.slug === slug);
}

function getMod(slug) {
  return state.data.mods.find(mod => mod.slug === slug);
}

function getCompatibleRecords(weaponSlug = state.weaponSlug) {
  return state.data.compatibility.filter(record => record.weaponSlug === weaponSlug);
}

function getProfile() {
  const id = document.getElementById("profile-select")?.value;
  return state.data["scoring-profiles"].find(profile => profile.id === id)
    || state.data["scoring-profiles"][0];
}

function scoreRecord(record, profile = getProfile()) {
  const weapon = getWeapon(record.weaponSlug);
  if (!weapon || !profile) return { score: 0, details: [] };

  let score = 0;
  const details = [];

  for (const effect of record.effects || []) {
    const base = weapon.baseStats[effect.stat];
    const meta = statMeta[effect.stat];
    const weight = profile.weights[effect.stat] || 0;

    if (!meta || !weight || typeof base !== "number") continue;

    const improved = meta.lowerIsBetter ? effect.delta < 0 : effect.delta > 0;
    if (!improved) {
      if (effect.delta !== 0) details.push(`${meta.label}: no positive score`);
      continue;
    }

    const contribution = (Math.abs(effect.delta) / Math.abs(base)) * weight * 100;
    score += contribution;
    details.push(`${meta.label}: +${contribution.toFixed(1)}`);
  }

  return {
    score: Math.round(score * 10) / 10,
    details
  };
}

function recommendation(score, status) {
  if (status !== "live_verified") return "VERIFY";
  if (score >= 30) return "HIGH KEEP";
  if (score >= 15) return "KEEP";
  if (score >= 7) return "SITUATIONAL";
  return "LOW PRIORITY";
}

async function loadData() {
  const entries = await Promise.all(DATA_FILES.map(async name => {
    const response = await fetch(`data/${name}.json`);
    if (!response.ok) throw new Error(`Could not load data/${name}.json`);
    return [name, await response.json()];
  }));

  state.data = Object.fromEntries(entries);
  state.weaponSlug = state.data.weapons[0]?.slug || null;
}

function renderMetrics() {
  const liveCount = state.data.compatibility.filter(
    record => record.verificationStatus === "live_verified"
  ).length;

  document.getElementById("app-version").textContent =
    `v${state.data.metadata.appVersion}`;
  document.getElementById("dataset-status").textContent =
    `Season ${state.data.metadata.season} public dataset`;
  document.getElementById("weapon-count").textContent = state.data.weapons.length;
  document.getElementById("mod-count").textContent = state.data.mods.length;
  document.getElementById("compatibility-count").textContent =
    state.data.compatibility.length;
  document.getElementById("verified-count").textContent = liveCount;
}

function populateWeaponSelectors() {
  const options = state.data.weapons.map(weapon =>
    `<option value="${escapeHtml(weapon.slug)}">${escapeHtml(weapon.name)}</option>`
  ).join("");

  for (const id of ["weapon-select", "builder-weapon"]) {
    const element = document.getElementById(id);
    element.innerHTML = options;
    element.value = state.weaponSlug;
  }
}

function renderWeapon() {
  const weapon = getWeapon();
  if (!weapon) return;

  document.getElementById("weapon-select").value = weapon.slug;

  document.getElementById("weapon-profile").innerHTML = `
    <div>
      <p class="eyebrow">${escapeHtml(weapon.category)}</p>
      <h3>${escapeHtml(weapon.name)}</h3>
      <p>${escapeHtml(weapon.description || "")}</p>
      <p>${escapeHtml(weapon.ammoType)} · Season ${escapeHtml(weapon.season)}</p>
    </div>
    <div class="meta-line">
      ${weapon.rarity ? `<span class="badge">${escapeHtml(weapon.rarity)}</span>` : ""}
      ${typeof weapon.purchaseCost === "number" ? `<span class="badge">${weapon.purchaseCost.toLocaleString()} credits</span>` : ""}
      <span class="status-badge ${escapeHtml(weapon.verificationStatus)}">
        ${escapeHtml(statusLabel(weapon.verificationStatus))}
      </span>
      <span class="badge">${escapeHtml(weapon.verifiedOn)}</span>
      <span class="badge">Precision ${formatNumber(
        weapon.baseStats.damage * weapon.baseStats.precisionMultiplier
      )}</span>
    </div>
  `;

  const statOrder = weapon.displayStats || Object.keys(weapon.baseStats);

  document.getElementById("weapon-stats").innerHTML = statOrder
    .filter(stat => typeof weapon.baseStats[stat] === "number" && statMeta[stat])
    .map(stat => `
      <div class="stat">
        <span>${escapeHtml(statMeta[stat].label)}</span>
        <strong>${escapeHtml(formatBaseValue(stat, weapon.baseStats[stat]))}</strong>
      </div>
    `).join("");
}

function populateFilters() {
  const slots = [...new Set(state.data.mods.map(mod => mod.slot))].sort();
  const rarities = [...new Set(state.data.mods.map(mod => mod.rarity))].sort();

  document.getElementById("slot-filter").innerHTML =
    `<option value="">All slots</option>` +
    slots.map(slot => `<option value="${escapeHtml(slot)}">${escapeHtml(slot)}</option>`).join("");

  document.getElementById("rarity-filter").innerHTML =
    `<option value="">All rarities</option>` +
    rarities.map(rarity => `<option value="${escapeHtml(rarity)}">${escapeHtml(rarity)}</option>`).join("");
}

function searchableRecord(record) {
  const mod = getMod(record.modSlug);
  const effects = (record.effects || []).map(effect =>
    `${statMeta[effect.stat]?.label || effect.stat} ${effect.delta} ${effect.unit}`
  ).join(" ");

  return [
    mod?.name,
    mod?.slot,
    mod?.rarity,
    mod?.description,
    statusLabel(record.verificationStatus),
    effects
  ].filter(Boolean).join(" ").toLowerCase();
}

function filteredRecords() {
  return getCompatibleRecords().filter(record => {
    const mod = getMod(record.modSlug);
    if (!mod) return false;

    const matchesSearch = !state.filters.search ||
      searchableRecord(record).includes(state.filters.search);
    const matchesSlot = !state.filters.slot || mod.slot === state.filters.slot;
    const matchesRarity = !state.filters.rarity || mod.rarity === state.filters.rarity;
    const matchesStatus = !state.filters.status ||
      record.verificationStatus === state.filters.status;

    return matchesSearch && matchesSlot && matchesRarity && matchesStatus;
  });
}

function renderCatalog() {
  const records = filteredRecords();
  const catalog = document.getElementById("catalog");
  const empty = document.getElementById("empty-state");
  const profile = state.data["scoring-profiles"][0];

  document.getElementById("result-count").textContent =
    `${records.length} result${records.length === 1 ? "" : "s"}`;

  catalog.innerHTML = records.map(record => {
    const mod = getMod(record.modSlug);
    const result = scoreRecord(record, profile);
    const decision = recommendation(result.score, record.verificationStatus);

    return `
      <article class="catalog-card">
        <div class="card-header">
          <div>
            <span class="badge">${escapeHtml(mod.rarity)} · ${escapeHtml(mod.slot)}</span>
            <h3>${escapeHtml(mod.name)}</h3>
          </div>
          <span class="status-badge ${escapeHtml(record.verificationStatus)}">
            ${escapeHtml(statusLabel(record.verificationStatus))}
          </span>
        </div>
        <p>${escapeHtml(mod.description || "")}</p>
        <ul>
          ${(record.effects || []).map(effect => `
            <li>${escapeHtml(statMeta[effect.stat]?.label || effect.stat)}:
              <strong>${escapeHtml(formatEffect(effect))}</strong>
            </li>
          `).join("")}
        </ul>
        <div class="card-footer">
          <div>
            <span class="score-inline">${result.score.toFixed(1)}</span>
            <span class="muted"> ${escapeHtml(decision)}</span>
          </div>
          <span class="badge">${escapeHtml(record.verifiedOn || "Unknown date")}</span>
        </div>
      </article>
    `;
  }).join("");

  empty.hidden = records.length !== 0;
}

function populateComparisonSelectors() {
  const records = getCompatibleRecords();
  const options = records.map((record, index) => {
    const mod = getMod(record.modSlug);
    return `<option value="${index}">${escapeHtml(mod.rarity)} ${escapeHtml(mod.name)}</option>`;
  }).join("");

  const a = document.getElementById("compare-a");
  const b = document.getElementById("compare-b");
  a.innerHTML = options;
  b.innerHTML = options;
  a.value = "0";
  b.value = records.length > 1 ? "1" : "0";

  const profiles = state.data["scoring-profiles"].map(profile =>
    `<option value="${escapeHtml(profile.id)}">${escapeHtml(profile.name)}</option>`
  ).join("");
  document.getElementById("profile-select").innerHTML = profiles;
}

function modifiedValue(weapon, record, stat) {
  const effect = (record.effects || []).find(item => item.stat === stat);
  return weapon.baseStats[stat] + (effect?.delta || 0);
}

function changeClass(base, value, stat) {
  if (base === value) return "neutral";
  const improved = statMeta[stat].lowerIsBetter ? value < base : value > base;
  return improved ? "positive" : "negative";
}

function renderComparisonCard(record, targetId, leading) {
  const mod = getMod(record.modSlug);
  const result = scoreRecord(record);
  const decision = recommendation(result.score, record.verificationStatus);
  const target = document.getElementById(targetId);

  target.className = `comparison-card${leading ? " leading" : ""}`;
  target.innerHTML = `
    <div class="card-header">
      <div>
        <span class="badge">${escapeHtml(mod.rarity)} · ${escapeHtml(mod.slot)}</span>
        <h3>${escapeHtml(mod.name)}</h3>
      </div>
      <span class="score-label">${escapeHtml(decision)}</span>
    </div>
    <p>${escapeHtml(record.note || mod.description || "")}</p>
    <ul>
      ${(record.effects || []).map(effect => `
        <li>${escapeHtml(statMeta[effect.stat]?.label || effect.stat)}:
          <strong>${escapeHtml(formatEffect(effect))}</strong>
        </li>
      `).join("")}
    </ul>
    <div class="score-box">
      <strong>${result.score.toFixed(1)}</strong>
      <span class="muted">impact score</span>
    </div>
    <div class="meter">
      <div class="meter-fill" style="width:${Math.min(result.score, 50) / 50 * 100}%"></div>
    </div>
  `;

  return result;
}

function renderComparison() {
  const records = getCompatibleRecords();
  if (!records.length) return;

  const recordA = records[Number(document.getElementById("compare-a").value) || 0];
  const recordB = records[Number(document.getElementById("compare-b").value) || 0];
  const weapon = getWeapon();

  const scoreA = scoreRecord(recordA);
  const scoreB = scoreRecord(recordB);

  renderComparisonCard(recordA, "compare-card-a", scoreA.score > scoreB.score);
  renderComparisonCard(recordB, "compare-card-b", scoreB.score > scoreA.score);

  const modA = getMod(recordA.modSlug);
  const modB = getMod(recordB.modSlug);
  const winner = document.getElementById("comparison-winner");

  if (scoreA.score === scoreB.score) {
    winner.textContent = "TIE";
  } else {
    const winningMod = scoreA.score > scoreB.score ? modA : modB;
    winner.textContent = `${winningMod.name} +${Math.abs(scoreA.score - scoreB.score).toFixed(1)}`;
  }

  const affectedStats = [...new Set([
    ...(recordA.effects || []).map(effect => effect.stat),
    ...(recordB.effects || []).map(effect => effect.stat)
  ])];

  document.getElementById("comparison-table").innerHTML = `
    <div class="comparison-row header">
      <span>Stat</span>
      <span>Base</span>
      <span>${escapeHtml(modA.name)}</span>
      <span>${escapeHtml(modB.name)}</span>
    </div>
    ${affectedStats.map(stat => {
      const base = weapon.baseStats[stat];
      const valueA = modifiedValue(weapon, recordA, stat);
      const valueB = modifiedValue(weapon, recordB, stat);

      return `
        <div class="comparison-row">
          <strong>${escapeHtml(statMeta[stat]?.label || stat)}</strong>
          <span>${escapeHtml(formatBaseValue(stat, base))}</span>
          <span class="${changeClass(base, valueA, stat)}">${escapeHtml(formatBaseValue(stat, valueA))}</span>
          <span class="${changeClass(base, valueB, stat)}">${escapeHtml(formatBaseValue(stat, valueB))}</span>
        </div>
      `;
    }).join("")}
  `;
}

function populateBuilderMods() {
  document.getElementById("builder-mod").innerHTML = state.data.mods.map(mod =>
    `<option value="${escapeHtml(mod.slug)}">${escapeHtml(mod.rarity)} ${escapeHtml(mod.name)}</option>`
  ).join("");
}

function statOptions() {
  return Object.entries(statMeta).map(([key, meta]) =>
    `<option value="${escapeHtml(key)}">${escapeHtml(meta.label)}</option>`
  ).join("");
}

function addEffectRow(stat = "recoil", delta = 0) {
  state.effectRowCount += 1;
  const id = state.effectRowCount;
  const row = document.createElement("div");
  row.className = "effect-row";
  row.dataset.rowId = String(id);
  row.innerHTML = `
    <label class="field">
      <span>Stat</span>
      <select class="effect-stat">${statOptions()}</select>
    </label>
    <label class="field">
      <span>Delta</span>
      <input class="effect-delta" type="number" step="0.01" value="${escapeHtml(delta)}">
    </label>
    <button type="button" class="secondary remove-effect">Remove</button>
  `;

  row.querySelector(".effect-stat").value = stat;
  row.querySelector(".remove-effect").addEventListener("click", () => row.remove());
  document.getElementById("effect-rows").appendChild(row);
}

function collectBuilderEffects() {
  return [...document.querySelectorAll(".effect-row")].map(row => {
    const stat = row.querySelector(".effect-stat").value;
    const delta = Number(row.querySelector(".effect-delta").value);
    const displayUnit = statMeta[stat]?.unit || "";
    const unit = {
      "%": "percent",
      "°": "degrees",
      "s": "seconds",
      "×": "multiplier",
      "": "flat",
      "m": "flat"
    }[displayUnit] || "flat";

    return { stat, delta, unit };
  }).filter(effect => Number.isFinite(effect.delta) && effect.delta !== 0);
}

function generateCompatibilityRecord() {
  const weaponSlug = document.getElementById("builder-weapon").value;
  const modSlug = document.getElementById("builder-mod").value;
  const verifiedOn = document.getElementById("builder-date").value;
  const effects = collectBuilderEffects();

  if (!weaponSlug || !modSlug || !verifiedOn) {
    alert("Select a weapon, mod, and verification date.");
    return;
  }
  if (!effects.length) {
    alert("Enter at least one non-zero effect.");
    return;
  }

  state.generatedRecord = {
    weaponSlug,
    modSlug,
    verificationStatus: "live_verified",
    verifiedOn,
    sourceType: "in_game_screenshot",
    effects,
    note: "Current weapon-specific tooltip values."
  };

  const profile = state.data["scoring-profiles"][0];
  const temporaryRecord = state.generatedRecord;
  const currentWeapon = state.weaponSlug;
  state.weaponSlug = weaponSlug;
  const result = scoreRecord(temporaryRecord, profile);
  state.weaponSlug = currentWeapon;

  document.getElementById("record-output").textContent =
    JSON.stringify(state.generatedRecord, null, 2);
  document.getElementById("builder-score").textContent =
    result.score.toFixed(1);
  document.getElementById("builder-recommendation").textContent =
    `${recommendation(result.score, "live_verified")} · ${result.details.join(" · ") || "No positive weighted effect detected."}`;
  document.getElementById("copy-record").disabled = false;
}

async function copyGeneratedRecord() {
  if (!state.generatedRecord) return;

  try {
    await navigator.clipboard.writeText(
      JSON.stringify(state.generatedRecord, null, 2)
    );
    const button = document.getElementById("copy-record");
    const original = button.textContent;
    button.textContent = "Copied";
    setTimeout(() => button.textContent = original, 1400);
  } catch {
    alert("Clipboard access was blocked. Select and copy the JSON manually.");
  }
}

function bindEvents() {
  document.getElementById("weapon-select").addEventListener("change", event => {
    state.weaponSlug = event.target.value;
    document.getElementById("builder-weapon").value = state.weaponSlug;
    renderWeapon();
    renderCatalog();
    populateComparisonSelectors();
    renderComparison();
  });

  document.getElementById("search-input").addEventListener("input", event => {
    state.filters.search = event.target.value.trim().toLowerCase();
    renderCatalog();
  });

  for (const [id, key] of [
    ["slot-filter", "slot"],
    ["rarity-filter", "rarity"],
    ["status-filter", "status"]
  ]) {
    document.getElementById(id).addEventListener("change", event => {
      state.filters[key] = event.target.value;
      renderCatalog();
    });
  }

  for (const id of ["compare-a", "compare-b", "profile-select"]) {
    document.getElementById(id).addEventListener("change", renderComparison);
  }

  document.getElementById("add-effect").addEventListener(
    "click",
    () => addEffectRow("range", 0)
  );
  document.getElementById("generate-record").addEventListener(
    "click",
    generateCompatibilityRecord
  );
  document.getElementById("copy-record").addEventListener(
    "click",
    copyGeneratedRecord
  );
}

async function init() {
  await loadData();
  renderMetrics();
  populateWeaponSelectors();
  populateFilters();
  populateBuilderMods();
  renderWeapon();
  renderCatalog();
  populateComparisonSelectors();
  renderComparison();

  addEffectRow("recoil", 0);
  addEffectRow("equipSpeed", 0);

  bindEvents();
}

init().catch(error => {
  document.body.innerHTML = `
    <main class="shell">
      <section class="panel">
        <h1>Load error</h1>
        <p>${escapeHtml(error.message)}</p>
        <p>Use GitHub Pages or a local web server rather than opening index.html directly.</p>
      </section>
    </main>
  `;
});
