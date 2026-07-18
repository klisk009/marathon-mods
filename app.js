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

function formatValue(stat, value) {
  const meta = statMeta[stat];
  if (!meta) return String(value);
  const decimals = Number.isInteger(value) ? 0 : 2;
  return `${value.toFixed(decimals)}${meta.unit}`;
}

function calculateScore(baseStats, effects) {
  let score = 0;
  const details = [];

  for (const effect of effects) {
    const meta = statMeta[effect.stat];
    const base = baseStats[effect.stat];
    if (!meta || !meta.weight || typeof base !== "number") continue;

    const isImprovement = meta.lowerIsBetter ? effect.delta < 0 : effect.delta > 0;
    if (!isImprovement) continue;

    const relative = Math.abs(effect.delta) / Math.abs(base);
    const contribution = relative * meta.weight * 100;
    score += contribution;
    details.push(`${meta.label}: +${contribution.toFixed(1)} score`);
  }

  return { score: Math.round(score * 10) / 10, details };
}

function recommendationFor(score, verified = true) {
  if (!verified) return { label: "VERIFY", className: "verify" };
  if (score >= 30) return { label: "HIGH KEEP", className: "high" };
  if (score >= 15) return { label: "KEEP", className: "keep" };
  if (score >= 7) return { label: "SITUATIONAL", className: "situational" };
  return { label: "LOW PRIORITY", className: "low" };
}

function renderBaseStats() {
  const base = data.weapon.baseStats;
  const keys = ["damage", "rpm", "range", "magazineSize", "recoil", "movingInaccuracy", "adsSpread", "reloadSpeed"];
  document.getElementById("base-stats").innerHTML = keys.map(key => `
    <div class="stat">
      <span>${statMeta[key].label}</span>
      <strong>${formatValue(key, base[key])}</strong>
    </div>
  `).join("");

  const precisionDamage = base.damage * base.precisionMultiplier;
  document.getElementById("precision-damage").textContent = precisionDamage.toFixed(1);
  document.getElementById("weapon-name").textContent = data.weapon.name;
  document.getElementById("verified-date").textContent = data.lastVerified;
}

function populateSelects() {
  const modSelect = document.getElementById("mod-select");
  modSelect.innerHTML = data.mods.map((mod, index) =>
    `<option value="${index}">${mod.rarity} ${mod.name}</option>`
  ).join("");

  const statOptions = Object.entries(statMeta)
    .filter(([, meta]) => meta.weight > 0)
    .map(([key, meta]) => `<option value="${key}">${meta.label}</option>`)
    .join("");

  document.getElementById("manual-stat-1").innerHTML = statOptions;
  document.getElementById("manual-stat-2").innerHTML = statOptions;
  document.getElementById("manual-stat-1").value = "recoil";
  document.getElementById("manual-stat-2").value = "equipSpeed";
}

function renderMod(index) {
  const mod = data.mods[index];
  const base = data.weapon.baseStats;
  const result = calculateScore(base, mod.effects);
  const rec = recommendationFor(result.score, mod.verified);

  document.getElementById("selected-mod").innerHTML = `
    <span class="badge">${mod.rarity} · ${mod.slot}</span>
    <h3>${mod.name}</h3>
    <p class="muted">${mod.note}</p>
    <ul>
      ${mod.effects.map(effect => `
        <li>${statMeta[effect.stat].label}: ${effect.delta > 0 ? "+" : ""}${effect.delta}${effect.unit}</li>
      `).join("")}
    </ul>
  `;

  document.getElementById("score-number").textContent = result.score.toFixed(1);
  document.getElementById("recommendation").textContent = rec.label;
  document.getElementById("score-meter").style.width = `${Math.min(result.score, 50) / 50 * 100}%`;
  document.getElementById("score-explanation").textContent =
    result.details.length ? result.details.join(" · ") : "No weighted improvement detected.";

  renderComparison(mod.effects);
}

function renderComparison(effects) {
  const base = data.weapon.baseStats;
  const affected = new Set(effects.map(effect => effect.stat));
  const rows = [...affected].map(stat => {
    const effect = effects.find(item => item.stat === stat);
    const before = base[stat];
    const after = before + effect.delta;
    const meta = statMeta[stat];
    const improvement = meta.lowerIsBetter ? after < before : after > before;
    return `
      <div class="comparison-row">
        <strong>${meta.label}</strong>
        <span>${formatValue(stat, before)}</span>
        <span class="${improvement ? "positive" : "neutral"}">${formatValue(stat, after)}</span>
        <span>${effect.delta > 0 ? "+" : ""}${effect.delta}${effect.unit}</span>
      </div>
    `;
  }).join("");

  document.getElementById("comparison-table").innerHTML = `
    <div class="comparison-row header">
      <span>Stat</span><span>Base</span><span>Modified</span><span>Delta</span>
    </div>
    ${rows}
  `;
}

function evaluateManual() {
  const effects = [
    {
      stat: document.getElementById("manual-stat-1").value,
      delta: Number(document.getElementById("manual-delta-1").value)
    },
    {
      stat: document.getElementById("manual-stat-2").value,
      delta: Number(document.getElementById("manual-delta-2").value)
    }
  ].filter(effect => effect.delta !== 0);

  const result = calculateScore(data.weapon.baseStats, effects);
  const rec = recommendationFor(result.score, false);
  document.getElementById("manual-result").innerHTML = `
    <strong>${rec.label}</strong> · provisional score ${result.score.toFixed(1)}.
    ${result.details.length ? result.details.join(" · ") : "No weighted improvement detected."}
    Confirm the exact values in game before recycling another copy.
  `;
}

async function init() {
  const response = await fetch("data/verified-data.json");
  if (!response.ok) throw new Error("Could not load verified data.");
  data = await response.json();

  renderBaseStats();
  populateSelects();
  renderMod(0);

  document.getElementById("mod-select").addEventListener("change", event => renderMod(Number(event.target.value)));
  document.getElementById("manual-evaluate").addEventListener("click", evaluateManual);
}

init().catch(error => {
  document.body.innerHTML = `<main class="shell"><div class="panel"><h1>Load error</h1><p>${error.message}</p><p>Open this project through GitHub Pages or a local web server rather than double-clicking index.html.</p></div></main>`;
});
