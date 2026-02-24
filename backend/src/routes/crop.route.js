// ═══════════════════════════════════════════════════════════════════
// Crop Routes - API endpoints for crop recommendations & budget
// ═══════════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const cropController = require('../controllers/crop.controller');

/**
 * POST /api/crops/recommend
 * Get crop recommendations based on soil parameters
 * Body: { n, p, k, ph, area, avgTemp, avgRainfall, soilType } OR { inputText }
 */
router.post('/recommend', cropController.recommendCrops);

/**
 * POST /api/crops/budget
 * Calculate fertilizer & seed budget for a specific crop
 * Body: { cropKey, area, n, p, k }
 */
router.post('/budget', cropController.calculateBudget);

/**
 * GET /api/crops/list
 * Get list of all available crops
 */
router.get('/list', cropController.getCropsList);

module.exports = router;
