// ═══════════════════════════════════════════════════════════════════
// Utility Helpers - Input Parsing & Validation
// ═══════════════════════════════════════════════════════════════════

/**
 * Coerce value to a finite number or null
 */
function coerceNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const match = value.match(/-?\d+(?:\.\d+)?/);
    if (!match) return null;
    const parsed = Number(match[0]);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/**
 * Normalize soil type to allowed values
 */
function normalizeSoilType(value) {
  if (!value) return 'any';
  const key = String(value).trim().toLowerCase();
  const allowed = new Set(['any', 'loamy', 'clay', 'sandy loam', 'black cotton', 'clay loam']);
  return allowed.has(key) ? key : 'any';
}

/**
 * Parse soil parameters from natural language text
 */
function parseInputText(inputText) {
  const text = String(inputText || '').toLowerCase();
  if (!text) return {};

  const fieldPatterns = {
    n: /\b(?:n|nitrogen)\b\s*[:=\-]?\s*(-?\d+(?:\.\d+)?)/,
    p: /\b(?:p|phosphorus)\b\s*[:=\-]?\s*(-?\d+(?:\.\d+)?)/,
    k: /\b(?:k|potassium)\b\s*[:=\-]?\s*(-?\d+(?:\.\d+)?)/,
    ph: /\b(?:ph)\b\s*[:=\-]?\s*(-?\d+(?:\.\d+)?)/,
    area: /\b(?:area|acre|acres)\b\s*[:=\-]?\s*(-?\d+(?:\.\d+)?)/,
    avgTemp: /\b(?:temp|temperature)\b\s*[:=\-]?\s*(-?\d+(?:\.\d+)?)/,
    avgRainfall: /\b(?:rain|rainfall)\b\s*[:=\-]?\s*(-?\d+(?:\.\d+)?)/,
    soilType: /\b(?:soil|soil\s*type)\b\s*[:=\-]?\s*(loamy|clay loam|sandy loam|black cotton|clay|any)\b/
  };

  const parsed = {};
  for (const [key, pattern] of Object.entries(fieldPatterns)) {
    const match = text.match(pattern);
    if (!match) continue;
    parsed[key] = key === 'soilType' ? match[1] : Number(match[1]);
  }
  return parsed;
}

/**
 * Build recommendation input from request body (prioritize direct values over parsed text)
 */
function buildRecommendationInput(body = {}) {
  const parsedText = parseInputText(body.inputText);

  const preferBodyValue = (primary, fallback) => {
    if (primary === null || primary === undefined || primary === '') return fallback;
    return primary;
  };

  const n = coerceNumber(preferBodyValue(body.n, parsedText.n));
  const p = coerceNumber(preferBodyValue(body.p, parsedText.p));
  const k = coerceNumber(preferBodyValue(body.k, parsedText.k));
  const ph = coerceNumber(preferBodyValue(body.ph, parsedText.ph));
  const area = coerceNumber(preferBodyValue(body.area, parsedText.area)) ?? 1;
  const avgTemp = coerceNumber(preferBodyValue(body.avgTemp, parsedText.avgTemp)) ?? 28;
  const avgRainfall = coerceNumber(preferBodyValue(body.avgRainfall, parsedText.avgRainfall)) ?? 3;
  const soilType = normalizeSoilType(preferBodyValue(body.soilType, parsedText.soilType));

  return { n, p, k, ph, area, avgTemp, avgRainfall, soilType };
}

/**
 * Validate recommendation input
 * @returns {string|null} Error message or null if valid
 */
function validateRecommendationInput(input) {
  if (![input.n, input.p, input.k, input.ph].every(Number.isFinite)) {
    return 'N, P, K, and pH are required (numbers only)';
  }
  if (input.n < 0 || input.n > 400 || input.p < 0 || input.p > 400 || input.k < 0 || input.k > 400) {
    return 'N, P, K values must be between 0 and 400';
  }
  if (input.ph < 3 || input.ph > 10) return 'pH must be between 3 and 10';
  if (!Number.isFinite(input.area) || input.area <= 0 || input.area > 10000) return 'Area must be greater than 0';
  if (!Number.isFinite(input.avgTemp) || input.avgTemp < -10 || input.avgTemp > 60) return 'Temperature is out of valid range';
  if (!Number.isFinite(input.avgRainfall) || input.avgRainfall < 0 || input.avgRainfall > 50) return 'Rainfall is out of valid range';
  return null;
}

/**
 * Validate budget request input
 */
function validateBudgetInput(cropKey, area, n, p, k) {
  if (!cropKey) return 'cropKey is required';
  if (!Number.isFinite(area) || area <= 0 || area > 10000) {
    return 'Area must be a number between 0 and 10000';
  }
  if (!Number.isFinite(n) || !Number.isFinite(p) || !Number.isFinite(k)) {
    return 'N, P, K values are required and must be numbers';
  }
  if (n < 0 || n > 400 || p < 0 || p > 400 || k < 0 || k > 400) {
    return 'N, P, K values must be between 0 and 400';
  }
  return null;
}

module.exports = {
  coerceNumber,
  normalizeSoilType,
  parseInputText,
  buildRecommendationInput,
  validateRecommendationInput,
  validateBudgetInput
};
