// ═══════════════════════════════════════════════════════════════════
// Location Routes - API endpoints for geolocation services
// ═══════════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');

/**
 * GET /api/location/geocode?q=query
 * Search for locations by query string
 */
router.get('/geocode', locationController.geocode);

/**
 * GET /api/location/reverse?lat=latitude&lon=longitude
 * Reverse geocode coordinates to location name
 */
router.get('/reverse', locationController.reverseGeocode);

module.exports = router;
