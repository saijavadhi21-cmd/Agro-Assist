// ═══════════════════════════════════════════════════════════════════
// Crop Service - Business Logic for Crop Recommendations & Budget
// ═══════════════════════════════════════════════════════════════════

const { CROPS, FERTILIZER_PRICES } = require('../utils/constants');

/**
 * Classify NPK levels as Low, Medium, or High
 */
function classifyNPK(n, p, k) {
  return {
    N: n < 30 ? 'Low' : n < 70 ? 'Medium' : 'High',
    P: p < 15 ? 'Low' : p < 40 ? 'Medium' : 'High',
    K: k < 20 ? 'Low' : k < 50 ? 'Medium' : 'High'
  };
}

/**
 * Classify pH and provide advisory
 */
function classifyPH(ph) {
  if (ph < 5.5) return { label: 'Acidic', advice: 'Apply lime to raise pH before sowing.' };
  if (ph <= 7.5) return { label: 'Neutral (Ideal)', advice: 'pH is in optimal range for most crops.' };
  return { label: 'Alkaline', advice: 'Apply gypsum or sulfur to lower pH.' };
}

/**
 * Recommend suitable crops based on soil parameters
 */
function recommendCrops(n, p, k, ph, avgTemp, avgRainfall, soilType = 'any') {
  if (![n, p, k, ph, avgTemp, avgRainfall].every(Number.isFinite)) {
    return [];
  }

  const normalizedSoilType = String(soilType || 'any').trim().toLowerCase();
  const scored = [];
  const rainfall_level = avgRainfall > 4 ? 'high' : avgRainfall > 1 ? 'medium' : 'low';

  for (const [key, crop] of Object.entries(CROPS)) {
    let score = 0;
    let reasons = [];

    // pH score (most critical)
    if (ph >= crop.pH[0] && ph <= crop.pH[1]) {
      score += 35;
      reasons.push(`pH ${ph} is ideal`);
    } else {
      score -= 20;
    }

    // N compatibility
    if (n >= crop.N[0] && n <= crop.N[1]) {
      score += 20;
      reasons.push('Nitrogen level suitable');
    } else if (n < crop.N[0]) {
      score += 10;
      reasons.push('Low N — fertilizer needed');
    }

    // P compatibility
    if (p >= crop.P[0] && p <= crop.P[1]) { score += 15; }

    // K compatibility
    if (k >= crop.K[0] && k <= crop.K[1]) { score += 15; }

    // Temperature match
    if (avgTemp >= crop.tempRange[0] && avgTemp <= crop.tempRange[1]) {
      score += 10;
      reasons.push('Temperature suits this crop');
    }

    // Rainfall match
    if (crop.rainfall === rainfall_level) {
      score += 5;
      reasons.push('Rainfall conditions match');
    } else if (
      (crop.rainfall === 'medium' && rainfall_level !== 'low') ||
      (crop.rainfall === 'low')
    ) {
      score += 2;
    }

    // Soil type compatibility (optional input)
    if (normalizedSoilType === 'any') {
      score += 3;
    } else if (crop.soilTypes.includes('any') || crop.soilTypes.includes(normalizedSoilType)) {
      score += 5;
      reasons.push('Soil type is compatible');
    } else {
      score -= 8;
    }

    scored.push({ key, ...crop, score, reasons });
  }

  return scored
    .filter(c => c.score > 30)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

/**
 * Calculate fertilizer & seed budget for a crop
 */
function calculateFertilizer(cropKey, area, soilN, soilP, soilK) {
  const crop = CROPS[cropKey];
  if (!crop) return null;

  const base = crop.fertilizer;

  // Adjust based on existing soil nutrients
  const adjustFactor = (soilLevel, cropMin) => {
    const deficit = Math.max(0, (cropMin - soilLevel) / cropMin);
    return 1 + deficit * 0.3;
  };

  const ureaQty = Math.round(base.urea * area * adjustFactor(soilN, crop.N[0]));
  const dapQty = Math.round(base.dap * area * adjustFactor(soilP, crop.P[0]));
  const mopQty = Math.round(base.mop * area * adjustFactor(soilK, crop.K[0]));
  const seedQty = Math.round(crop.seedRate * area);

  const fertCost = {
    urea: { qty: ureaQty, price: FERTILIZER_PRICES.urea, total: ureaQty * FERTILIZER_PRICES.urea },
    dap: { qty: dapQty, price: FERTILIZER_PRICES.dap, total: dapQty * FERTILIZER_PRICES.dap },
    mop: { qty: mopQty, price: FERTILIZER_PRICES.mop, total: mopQty * FERTILIZER_PRICES.mop }
  };

  const seedCost = seedQty * crop.seedPricePerKg;
  const totalFertCost = fertCost.urea.total + fertCost.dap.total + fertCost.mop.total;
  const totalCost = totalFertCost + seedCost;

  return {
    crop: { key: cropKey, ...crop },
    area,
    seed: { qty: seedQty, pricePerKg: crop.seedPricePerKg, total: seedCost },
    fertilizer: fertCost,
    totalFertCost,
    seedCost,
    totalCost,
    costPerAcre: Math.round(totalCost / area)
  };
}

/**
 * Get all available crops (metadata only)
 */
function getCropsList() {
  return Object.entries(CROPS).map(([key, c]) => ({
    key,
    name: c.name,
    icon: c.icon,
    season: c.season
  }));
}

module.exports = {
  classifyNPK,
  classifyPH,
  recommendCrops,
  calculateFertilizer,
  getCropsList
};
