// ═══════════════════════════════════════════════════════════════════
// Frontend Configuration - Backend API URL & Constants
// ═══════════════════════════════════════════════════════════════════

// Detect environment and set API base URL
const isDevelopment = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3000/api'  // Development backend URL
  : `${location.origin}/api`;     // Production - same origin as frontend

// API Endpoints
const API_ENDPOINTS = {
  // Crop endpoints
  crops: {
    recommend: `${API_BASE_URL}/crops/recommend`,
    budget: `${API_BASE_URL}/crops/budget`,
    list: `${API_BASE_URL}/crops/list`
  },
  // Location endpoints
  location: {
    geocode: `${API_BASE_URL}/location/geocode`,
    reverse: `${API_BASE_URL}/location/reverse`
  }
};

// Helper function to make API calls with error handling
async function apiCall(url, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    credentials: 'include'
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error('API Error:', err.message);
    throw err;
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API_BASE_URL, API_ENDPOINTS, apiCall };
}
