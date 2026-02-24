// ═══════════════════════════════════════════════════════════════════
// Location Controller - Handle geolocation requests
// ═══════════════════════════════════════════════════════════════════

const locationService = require('../services/location.service');

/**
 * GET /api/location/geocode?q=query
 * Search for locations by query string
 */
async function geocode(req, res) {
  try {
    const { q } = req.query;

    if (!q || String(q).trim().length === 0) {
      return res.status(400).json({ error: 'Provide location query' });
    }

    const results = await locationService.searchLocation(q);

    if (!results.length) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json(results);
  } catch (err) {
    console.error('Geocode error:', err);
    res.status(500).json({ error: 'Geocoding failed' });
  }
}

/**
 * GET /api/location/reverse?lat=latitude&lon=longitude
 * Reverse geocode coordinates to location name
 */
async function reverseGeocode(req, res) {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'lat and lon are required' });
    }

    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

    if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) {
      return res.status(400).json({ error: 'lat and lon must be valid numbers' });
    }

    if (latNum < -90 || latNum > 90) {
      return res.status(400).json({ error: 'Latitude must be between -90 and 90' });
    }

    if (lonNum < -180 || lonNum > 180) {
      return res.status(400).json({ error: 'Longitude must be between -180 and 180' });
    }

    const result = await locationService.reverseGeocode(latNum, lonNum);
    res.json(result);
  } catch (err) {
    console.error('Reverse geocode error:', err);
    res.status(500).json({ error: 'Reverse geocoding failed' });
  }
}

module.exports = {
  geocode,
  reverseGeocode
};
