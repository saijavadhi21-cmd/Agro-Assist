// ═══════════════════════════════════════════════════════════════════
// Crop Controller - Handle crop recommendation & budget requests
// ═══════════════════════════════════════════════════════════════════

const cropService = require('../services/crop.service');
const { buildRecommendationInput, validateRecommendationInput, validateBudgetInput, coerceNumber } = require('../utils/helpers');
const { CROPS } = require('../utils/constants');

/**
 * POST /api/crops/recommend
 * Get crop recommendations based on soil parameters
 */
async function recommendCrops(req, res) {
  try {
    const input = buildRecommendationInput(req.body || {});
    const validationError = validateRecommendationInput(input);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const npkClass = cropService.classifyNPK(input.n, input.p, input.k);
    const phClass = cropService.classifyPH(input.ph);
    const recommendations = cropService.recommendCrops(
      input.n, input.p, input.k, input.ph,
      input.avgTemp, input.avgRainfall, input.soilType
    );

    res.json({
      inputs: input,
      soilHealth: { npkClass, phClass },
      recommendations: recommendations.map(r => ({
        key: r.key,
        name: r.name,
        icon: r.icon,
        season: r.season,
        score: r.score,
        reasons: r.reasons,
        duration: r.duration,
        yield: r.yield,
        notes: r.notes
      }))
    });
  } catch (err) {
    console.error('Recommend crops error:', err);
    res.status(500).json({ error: 'Failed to process recommendation' });
  }
}

/**
 * POST /api/crops/budget
 * Calculate fertilizer & seed budget for a specific crop
 */
async function calculateBudget(req, res) {
  try {
    const cropKey = req.body?.cropKey;
    const area = coerceNumber(req.body?.area);
    const n = coerceNumber(req.body?.n);
    const p = coerceNumber(req.body?.p);
    const k = coerceNumber(req.body?.k);

    const validationError = validateBudgetInput(cropKey, area, n, p, k);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    if (!CROPS[cropKey]) {
      return res.status(404).json({ error: 'Crop not found' });
    }

    const result = cropService.calculateFertilizer(cropKey, area, n, p, k);
    if (!result) {
      return res.status(404).json({ error: 'Failed to calculate budget' });
    }

    res.json(result);
  } catch (err) {
    console.error('Calculate budget error:', err);
    res.status(500).json({ error: 'Failed to calculate budget' });
  }
}

/**
 * GET /api/crops/list
 * Get list of all available crops (metadata only)
 */
async function getCropsList(req, res) {
  try {
    const crops = cropService.getCropsList();
    res.json(crops);
  } catch (err) {
    console.error('Get crops list error:', err);
    res.status(500).json({ error: 'Failed to fetch crops list' });
  }
}

module.exports = {
  recommendCrops,
  calculateBudget,
  getCropsList
};
