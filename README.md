const statMeta = {
  damage: { label: "Damage", unit: "", lowerIsBetter: false, weight: 0 },
  precisionMultiplier: { label: "Precision multiplier", unit: "×", lowerIsBetter: false, weight: 0 },
  rpm: { label: "RPM", unit: "", lowerIsBetter: false, weight: 0 },
  hipfireSpread: { label: "Hipfire spread", unit: "°", lowerIsBetter: true, weight: 0.45 },
  adsSpread: { label: "ADS spread", unit: "°", lowerIsBetter: true, weight: 0.80 },
  crouchSpreadBonus: { label: "Crouch bonus", unit: "%", lowerIsBetter: false, weight: 0.15 },
  movingInaccuracy: { label: "Moving inaccuracy", unit: "%", lowerIsBetter: true, weight: 0.85 },
  equipSpeed: { label: "Equip speed", unit: "s", lowerIsBetter: true, weight: 0.30 },
  adsSpeed: { label: "ADS speed", unit: "s", lowerIsBetter: true, weight: 0.45 },
  weight: { label: "Weight", unit: "%", lowerIsBetter: true, weight: 0.10 },
  recoil: { label: "Recoil", unit: "%", lowerIsBetter: true, weight: 1.00 },
  aimAssist: { label: "Aim assist", unit: "°", lowerIsBetter: false, weight: 0.25 },
  reloadSpeed: { label: "Reload", unit: "s", lowerIsBetter: true, weight: 0.35 },
  range: { label: "Range", unit: "m", lowerIsBetter: false, weight: 0.75 },
  magazineSize: { label: "Magazine", unit: "", lowerIsBetter: false, weight: 0.35 },
  adsZoom: { label: "ADS zoom", unit: "×", lowerIsBetter: false, weight: 0.10 }
};

let data;
let generatedRecord = null;

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatNumber(value) {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function formatValue(stat, value) {
  const meta = statMeta[stat];
  return `${formatNumber(value)}${meta?.unit || ""}`;
}

function displayDelta(effect) {
  const sign = effect.delta > 0 ? "+" : "";
  return `${sign}${formatNumber(effect.delta)}${effect.unit}`;
}

function calculateScore(baseStats, effects) {
  let score = 0;
  const details = [];

  for (const effect of effects) {
    const meta = statMeta[effect.stat];
    const base = baseStats[effect.stat];
    if (!meta || !meta.weight || typeof base !== "number") continue;

    const isImprovement = meta.lowerIsBetter ? effect.delta < 0 : effect.delta > 0;
    if (!isImprovement) {
      if (effect.delta !== 0) details.push(`${meta.label}: no positive score`);
      continue;
    }

    const relativeChange = Math.abs(effect.delta) / Math.abs(base);
    const contribution = relativeChange * meta.weight * 100;
    score += contribution;
    details.push(`${meta.label}: +${contribution.toFixed(1)}`);
  }

  return {
    score: Math.round(score * 10) / 10,
    details
  };
}

function recommendationFor(score, verified = true) {
  if (!verified) return "VERIFY";
  if (score >= 30) return "HIGH KEEP";
  if (score >= 15) return "KEEP";
  if (score >= 7) return "SITUATIONAL";
  return "LOW PRIORITY";
}

function renderBaseStats() {
  const base = data.weapon.baseStats;
  const keys = [
    "damage", "rpm", "range", "magazineSize",
    "recoil", "movingInaccuracy", "adsSpread", "reloadSpeed"
  ];

  document.getElementById("base-stats").innerHTML = keys.map(stat => `
    <div class="stat">
      <span>${statMeta[stat].label}</span>
      <strong>${formatValue(stat, base[stat])}</strong>
    </div>
  `).join("");

  document.getElementById("weapon-name").textContent = data.weapon.name;
  document.getElementById("verified-date").textContent = data.lastVerified;
  document.getElementById("verified-count").textContent = data.mods.filter(mod => mod.verified).length;
  document.getElementById("precision-damage").textContent =
    (base.damage * base.precisionMultiplier).toFixed(1);
}

function populateModSelectors() {
  const options = data.mods.map((mod, index) =>
    `<option value="${index}">${mod.rarity} ${mod.name}</option>`
  ).join("");

  const a = document.getElementById("mod-a-select");
  const b = document.getElementById("mod-b-select");
  a.innerHTML = options;
  b.innerHTML = options;
  a.value = "0";
  b.value = data.mods.length > 1 ? "1" : "0";
}

function populateStatSelectors() {
  const options = Object.entries(statMeta)
    .filter(([, meta]) => meta.weight > 0)
    .map(([key, meta]) => `<option value="${key}">${meta.label}</option>`)
    .join("");

  for (let i = 1; i <= 3; i++) {
    document.getElementById(`new-stat-${i}`).innerHTML = options;
  }

  document.getElementById("new-stat-1").value = "recoil";
  document.getElementById("new-stat-2").value = "equipSpeed";
  document.getElementById("new-stat-3").value = "movingInaccuracy";
}

function renderModCard(mod, targetId, isLeader) {
  const result = calculateScore(data.weapon.baseStats, mod.effects);
  const recommendation = recommendationFor(result.score, mod.verified);
  const target = document.getElementById(targetId);

  target.className = `mod-card${isLeader ? " leading" : ""}`;
  target.innerHTML = `
    <div class="card-header">
      <div>
        <span class="badge">${mod.rarity} · ${mod.slot}</span>
        <h3>${mod.name}</h3>
      </div>
      <span class="recommendation">${recommendation}</span>
    </div>
    <ul>
      ${mod.effects.map(effect =>
        `<li>${statMeta[effect.stat].label}: <strong>${displayDelta(effect)}</strong></li>`
      ).join("")}
    </ul>
    <p class="source">${mod.source} · ${mod.verifiedOn}</p>
    <p class="source">${mod.note || ""}</p>
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

function getModifiedValue(base, mod, stat) {
  const effect = mod.effects.find(item => item.stat === stat);
  return base[stat] + (effect?.delta || 0);
}

function comparisonClass(baseValue, modifiedValue, stat) {
  if (modifiedValue === baseValue) return "neutral";
  const lowerIsBetter = statMeta[stat].lowerIsBetter;
  const improved = lowerIsBetter ? modifiedValue < baseValue : modifiedValue > baseValue;
  return improved ? "positive" : "negative";
}

function renderComparisonTable(modA, modB) {
  const base = data.weapon.baseStats;
  const affectedStats = [...new Set([
    ...modA.effects.map(effect => effect.stat),
    ...modB.effects.map(effect => effect.stat)
  ])];

  document.getElementById("comparison-table").innerHTML = `
    <div class="comparison-row header">
      <span>Stat</span>
      <span>Base</span>
      <span>${modA.name}</span>
      <span>${modB.name}</span>
    </div>
    ${affectedStats.map(stat => {
      const a = getModifiedValue(base, modA, stat);
      const b = getModifiedValue(base, modB, stat);
      return `
        <div class="comparison-row">
          <strong>${statMeta[stat].label}</strong>
          <span>${formatValue(stat, base[stat])}</span>
          <span class="${comparisonClass(base[stat], a, stat)}">${formatValue(stat, a)}</span>
          <span class="${comparisonClass(base[stat], b, stat)}">${formatValue(stat, b)}</span>
        </div>
      `;
    }).join("")}
  `;
}

function renderComparison() {
  const modA = data.mods[Number(document.getElementById("mod-a-select").value)];
  const modB = data.mods[Number(document.getElementById("mod-b-select").value)];

  const scoreA = calculateScore(data.weapon.baseStats, modA.effects);
  const scoreB = calculateScore(data.weapon.baseStats, modB.effects);

  renderModCard(modA, "mod-a-card", scoreA.score > scoreB.score);
  renderModCard(modB, "mod-b-card", scoreB.score > scoreA.score);
  renderComparisonTable(modA, modB);

  const badge = document.getElementById("winner-badge");
  if (scoreA.score === scoreB.score) {
    badge.textContent = "TIE";
  } else {
    const winner = scoreA.score > scoreB.score ? modA : modB;
    const difference = Math.abs(scoreA.score - scoreB.score).toFixed(1);
    badge.textContent = `${winner.name} +${difference}`;
  }
}

function unitForStat(stat) {
  return statMeta[stat]?.unit || "";
}

function readGeneratedEffects() {
  const effects = [];

  for (let i = 1; i <= 3; i++) {
    const stat = document.getElementById(`new-stat-${i}`).value;
    const delta = Number(document.getElementById(`new-delta-${i}`).value);
    if (!Number.isFinite(delta) || delta === 0) continue;
    effects.push({
      stat,
      delta,
      unit: unitForStat(stat)
    });
  }

  return effects;
}

function generateRecord() {
  const name = document.getElementById("new-name").value.trim();
  const rarity = document.getElementById("new-rarity").value;
  const slot = document.getElementById("new-slot").value;
  const verifiedOn = document.getElementById("new-date").value;
  const note = document.getElementById("new-note").value.trim();
  const effects = readGeneratedEffects();

  if (!name) {
    alert("Enter the mod name.");
    return;
  }
  if (!verifiedOn) {
    alert("Enter the verification date.");
    return;
  }
  if (effects.length === 0) {
    alert("Enter at least one non-zero stat delta.");
    return;
  }

  generatedRecord = {
    slug: `${slugify(name)}-${rarity.toLowerCase()}`,
    name,
    rarity,
    slot,
    verified: true,
    verifiedOn,
    source: "Live in-game screenshot",
    effects,
    note: note || "Current Magnum MC values from a clean in-game tooltip."
  };

  const result = calculateScore(data.weapon.baseStats, effects);
  document.getElementById("json-output").textContent =
    JSON.stringify(generatedRecord, null, 2);
  document.getElementById("generated-score").textContent =
    result.score.toFixed(1);
  document.getElementById("generated-recommendation").textContent =
    `${recommendationFor(result.score, true)} · ${result.details.join(" · ") || "No positive weighted effect detected."}`;
  document.getElementById("copy-json").disabled = false;
}

async function copyGeneratedJson() {
  if (!generatedRecord) return;

  try {
    await navigator.clipboard.writeText(JSON.stringify(generatedRecord, null, 2));
    const button = document.getElementById("copy-json");
    const original = button.textContent;
    button.textContent = "Copied";
    setTimeout(() => button.textContent = original, 1400);
  } catch {
    alert("Clipboard access was blocked. Select and copy the JSON manually.");
  }
}

async function init() {
  const response = await fetch("data/verified-data.json");
  if (!response.ok) throw new Error("Could not load data/verified-data.json.");
  data = await response.json();

  renderBaseStats();
  populateModSelectors();
  populateStatSelectors();
  renderComparison();

  document.getElementById("mod-a-select").addEventListener("change", renderComparison);
  document.getElementById("mod-b-select").addEventListener("change", renderComparison);
  document.getElementById("generate-json").addEventListener("click", generateRecord);
  document.getElementById("copy-json").addEventListener("click", copyGeneratedJson);
}

init().catch(error => {
  document.body.innerHTML = `
    <main class="shell">
      <section class="panel">
        <h1>Load error</h1>
        <p>${error.message}</p>
        <p>Use GitHub Pages or a local web server rather than opening index.html directly.</p>
      </section>
    </main>
  `;
});
