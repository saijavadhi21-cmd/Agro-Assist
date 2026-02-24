// ═══════════════════════════════════════════════════════════════════
// Location Service - Geolocation & Reverse Geocoding
// Uses OpenStreetMap Nominatim API
// ═══════════════════════════════════════════════════════════════════

/**
 * Search for location by query string using Nominatim API
 * @param {string} q - Location query (city, village, etc.)
 * @returns {Promise<Array>} Array of location results
 */
async function searchLocation(q) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=in`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'KrishiMitra/1.0' }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data.length) {
      return [];
    }

    return data.map(item => ({
      name: item.display_name.split(',').slice(0, 3).join(', '),
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon)
    }));
  } catch (err) {
    console.error('Location search error:', err.message);
    throw new Error('Geocoding failed');
  }
}

/**
 * Reverse geocode coordinates to location name
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Location details (city, state, country)
 */
async function reverseGeocode(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'KrishiMitra/1.0' }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const address = data.address || {};

    return {
      city: address.city || address.town || address.village || 'Unknown',
      state: address.state || 'Unknown',
      country: address.country || 'India',
      display: data.display_name
    };
  } catch (err) {
    console.error('Reverse geocoding error:', err.message);
    throw new Error('Reverse geocoding failed');
  }
}

module.exports = {
  searchLocation,
  reverseGeocode
};
