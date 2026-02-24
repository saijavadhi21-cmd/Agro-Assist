/* ========== KRISHIMITRA — Frontend App Logic ========== */
/* Updated to use config.js for API endpoints */

// ── State ──────────────────────────────────────────────
const state = {
  lat: null,
  lon: null,
  soilData: null,
  recommendations: [],
  selectedCrop: null
};

// ── DOM Helpers ───────────────────────────────────────
const $ = id => document.getElementById(id);
const loading = (show, text = 'Analyzing...') => {
  $('loadingOverlay').style.display = show ? 'block' : 'none';
  $('loadingText').textContent = text;
};
const getNumber = value => {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};
const showFormError = message => {
  const el = $('formError');
  if (!el) return;
  el.textContent = message || '';
  el.style.display = message ? 'block' : 'none';
};

// ── Location Search ───────────────────────────────────
let locationTimeout;

$('locationQuery').addEventListener('input', () => {
  clearTimeout(locationTimeout);
  const q = $('locationQuery').value.trim();
  if (q.length < 3) { hideSuggestions(); return; }
  locationTimeout = setTimeout(() => searchLocation(q), 500);
});

$('searchLocationBtn').addEventListener('click', () => {
  const q = $('locationQuery').value.trim();
  if (q) searchLocation(q);
});

$('detectLocationBtn').addEventListener('click', () => {
  if (!navigator.geolocation) {
    alert('Geolocation not supported by your browser.');
    return;
  }
  navigator.geolocation.getCurrentPosition(async pos => {
    const { latitude: lat, longitude: lon } = pos.coords;
    setCoords(lat, lon);
    try {
      const res = await fetch(`${API_ENDPOINTS.location.reverse}?lat=${lat}&lon=${lon}`);
      const data = await res.json();
      $('locationQuery').value = data.city + (data.state ? `, ${data.state}` : '');
    } catch (_) {}
  }, () => alert('Could not detect location. Please enter manually.'));
});

async function searchLocation(q) {
  try {
    const res = await fetch(`${API_ENDPOINTS.location.geocode}?q=${encodeURIComponent(q)}`);
    if (!res.ok) { hideSuggestions(); return; }
    const data = await res.json();
    showSuggestions(data);
  } catch (_) { hideSuggestions(); }
}

function showSuggestions(results) {
  const box = $('locationSuggestions');
  box.innerHTML = '';
  if (!results.length) { box.style.display = 'none'; return; }
  results.forEach(r => {
    const div = document.createElement('div');
    div.className = 'suggestion-item';
    div.textContent = r.name;
    div.addEventListener('click', () => {
      $('locationQuery').value = r.name;
      setCoords(r.lat, r.lon);
      hideSuggestions();
    });
    box.appendChild(div);
  });
  box.style.display = 'block';
}

function hideSuggestions() {
  const el = $('locationSuggestions'); if (el) el.style.display = 'none';
}

function setCoords(lat, lon) {
  state.lat = lat;
  state.lon = lon;
  const latEl = $('lat'); const lonEl = $('lon');
  if (latEl) latEl.value = lat;
  if (lonEl) lonEl.value = lon;
  const coords = $('coordsDisplay'); if (coords) coords.style.display = 'block';
  const coordText = $('coordText'); if (coordText) coordText.textContent = `📍 ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
}

document.addEventListener('click', e => {
  if (!e.target.closest('.location-input')) hideSuggestions();
});

// ── Form Submit ───────────────────────────────────────
$('farmForm').addEventListener('submit', async e => {
  e.preventDefault();
  await runAnalysis();
});

async function runAnalysis() {
  showFormError('');
  const quickInput = $('quickInput') ? $('quickInput').value.trim() : '';
  const n = getNumber($('nitrogen').value);
  const p = getNumber($('phosphorus').value);
  const k = getNumber($('potassium').value);
  const ph = getNumber($('ph').value);
  const area = getNumber($('area').value);
  const soilType = $('soilType').value || 'any';

  const hasStructuredInput = [n, p, k, ph].every(v => Number.isFinite(v));
  if (!quickInput && !hasStructuredInput) {
    showFormError('Enter N, P, K, pH values or provide Quick Input text.');
    return;
  }

  $('results').style.display = 'none';
  loading(true, 'Analyzing soil & recommending crops...');
  try {
    const cRes = await fetch(API_ENDPOINTS.crops.recommend, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        n,
        p,
        k,
        ph,
        area,
        soilType,
        inputText: quickInput
      })
    });
    if (!cRes.ok) {
      const err = await cRes.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to analyze inputs.');
    }
    const cData = await cRes.json();
    state.soilData = cData.inputs || { n, p, k, ph, area: area || 1 };
    state.recommendations = cData.recommendations;
    renderSoilHealth(cData.soilHealth);
    renderCrops(cData.recommendations);
    renderCropSelectorBar(cData.recommendations);

    // Auto-load budget for top crop
    if (cData.recommendations.length > 0) {
      await loadBudget(cData.recommendations[0].key);
    }
  } catch (err) {
    showFormError(err.message || 'Something went wrong while analyzing your data.');
    $('results').style.display = 'none';
    return;
  } finally {
    loading(false);
  }

  $('results').style.display = 'block';
  $('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Soil Health Render ────────────────────────────────
function renderSoilHealth(soil) {
  const { npkClass, phClass } = soil;
  const { n, p, k, ph } = state.soilData;
  $('soilReport').innerHTML = `
    <div class="npk-grid">
      <div class="npk-box">
        <div class="npk-label">Nitrogen (N)</div>
        <div class="npk-value">${n}</div>
        <span class="npk-class ${npkClass.N}">${npkClass.N}</span>
      </div>
      <div class="npk-box">
        <div class="npk-label">Phosphorus (P)</div>
        <div class="npk-value">${p}</div>
        <span class="npk-class ${npkClass.P}">${npkClass.P}</span>
      </div>
      <div class="npk-box">
        <div class="npk-label">Potassium (K)</div>
        <div class="npk-value">${k}</div>
        <span class="npk-class ${npkClass.K}">${npkClass.K}</span>
      </div>
      <div class="npk-box">
        <div class="npk-label">Soil pH</div>
        <div class="npk-value">${ph}</div>
        <span class="npk-class ${phClass.label.split(' ')[0]}">${phClass.label}</span>
      </div>
    </div>
    <div class="ph-advice">${phClass.advice}</div>
  `;
}

// Weather rendering removed (feature deprecated)

// ── Crops Render ──────────────────────────────────────
const rankLabels = ['🥇', '🥈', '🥉', '④', '⑤'];

function renderCrops(crops) {
  if (!crops.length) {
    $('cropList').innerHTML = `<p style="color:var(--bark);text-align:center;padding:32px">No suitable crops found for these soil conditions. Try adjusting your values.</p>`;
    return;
  }

  $('cropList').innerHTML = crops.map((c, i) => `
    <div class="crop-card ${i === 0 ? 'active' : ''}" data-key="${c.key}" onclick="selectCropCard(this, '${c.key}')">
      <div class="crop-icon">${c.icon}</div>
      <div>
        <div class="crop-name">${c.name}</div>
        <div class="crop-season">${c.season}</div>
        <div class="crop-notes">${c.notes}</div>
        <div class="crop-meta">
          <div class="crop-meta-item">⏱ <span>${c.duration}</span></div>
          <div class="crop-meta-item">📦 <span>${c.yield}</span></div>
        </div>
        <div class="crop-reasons">
          ${c.reasons.map(r => `<span class="reason-tag">✓ ${r}</span>`).join('')}
        </div>
      </div>
      <div class="crop-score">
        <span style="font-size:22px">${rankLabels[i]}</span>
        <div class="score-bar"><div class="score-fill" style="width:${Math.min(100, c.score)}%"></div></div>
        <div class="score-label">${Math.min(99, c.score)}% match</div>
      </div>
    </div>
  `).join('');
}

function selectCropCard(el, key) {
  document.querySelectorAll('.crop-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  loadBudget(key);
  // sync selector bar
  document.querySelectorAll('.crop-sel-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.key === key);
  });
}

// ── Crop Selector Bar ─────────────────────────────────
function renderCropSelectorBar(crops) {
  $('cropSelectorBar').innerHTML = crops.map((c, i) => `
    <button class="crop-sel-btn ${i === 0 ? 'active' : ''}" data-key="${c.key}"
      onclick="selectBudgetCrop(this, '${c.key}')">
      ${c.icon} ${c.name}
    </button>
  `).join('');
}

function selectBudgetCrop(el, key) {
  document.querySelectorAll('.crop-sel-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  // sync crop cards
  document.querySelectorAll('.crop-card').forEach(c => {
    c.classList.toggle('active', c.dataset.key === key);
  });
  loadBudget(key);
}

// ── Budget Render ─────────────────────────────────────
async function loadBudget(cropKey) {
  if (!cropKey) return;
  const { n, p, k, area } = state.soilData || {};

  $('budgetReport').innerHTML = `<div style="text-align:center;padding:32px"><div class="spinner"></div></div>`;

  try {
    const res = await fetch(API_ENDPOINTS.crops.budget, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cropKey, area, n, p, k })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Budget calculation failed.');
    }
    const data = await res.json();
    renderBudget(data);
  } catch (err) {
    $('budgetReport').innerHTML = `<p style="color:red">${err.message || 'Failed to load budget.'}</p>`;
  }
}

function renderBudget(d) {
  const fmt = n => `₹${n.toLocaleString('en-IN')}`;

  $('budgetReport').innerHTML = `
    <div class="budget-grid">
      <div>
        <div class="budget-section-title">🌾 Fertilizer Requirements (for ${d.area} acre${d.area > 1 ? 's' : ''})</div>
        <table class="budget-table">
          <thead><tr><th>Fertilizer</th><th>Qty (kg)</th><th>Rate</th><th>Cost</th></tr></thead>
          <tbody>
            <tr><td>Urea</td><td>${d.fertilizer.urea.qty}</td><td>${fmt(d.fertilizer.urea.price)}/kg</td><td>${fmt(d.fertilizer.urea.total)}</td></tr>
            <tr><td>DAP</td><td>${d.fertilizer.dap.qty}</td><td>${fmt(d.fertilizer.dap.price)}/kg</td><td>${fmt(d.fertilizer.dap.total)}</td></tr>
            <tr><td>MOP</td><td>${d.fertilizer.mop.qty}</td><td>${fmt(d.fertilizer.mop.price)}/kg</td><td>${fmt(d.fertilizer.mop.total)}</td></tr>
          </tbody>
        </table>
        <div style="text-align:right;font-weight:600;margin-top:8px;color:var(--soil)">Subtotal: ${fmt(d.totalFertCost)}</div>
      </div>
      <div>
        <div class="budget-section-title">🌱 Seed Requirements</div>
        <table class="budget-table">
          <thead><tr><th>Item</th><th>Qty (kg)</th><th>Rate</th><th>Cost</th></tr></thead>
          <tbody>
            <tr>
              <td>${d.crop.icon} ${d.crop.name}</td>
              <td>${d.seed.qty}</td>
              <td>${fmt(d.seed.pricePerKg)}/kg</td>
              <td>${fmt(d.seed.total)}</td>
            </tr>
          </tbody>
        </table>
        <div style="margin-top:16px;padding:12px;background:var(--cream);border-radius:8px;font-size:13px;color:var(--text-muted)">
          <strong>Expected Yield:</strong> ${d.crop.yield}<br>
          <strong>Duration:</strong> ${d.crop.duration}<br>
          <strong>Season:</strong> ${d.crop.season}
        </div>
      </div>
    </div>
    <div class="budget-total">
      <div class="total-label">Total Investment Required</div>
      <div class="total-amount">${fmt(d.totalCost)}</div>
      <div class="total-per-acre">for ${d.area} acre${d.area > 1 ? 's' : ''} &nbsp;|&nbsp; ${fmt(d.costPerAcre)} per acre</div>
    </div>
  `;
}

// ── Reset ─────────────────────────────────────────────
$('resetBtn').addEventListener('click', () => {
  showFormError('');
  $('results').style.display = 'none';
  $('farmForm').reset();
  $('coordsDisplay').style.display = 'none';
  state.lat = null; state.lon = null;
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
