// ═══════════════════════════════════════════════════════════════════
// Configuration Module - Environment & App Settings
// ═══════════════════════════════════════════════════════════════════

require('dotenv').config();

const config = {
  // Server
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // CORS
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5500',

  // API Configuration
  API_BASE_PATH: '/api',
};

// Validate required env variables
const validateConfig = () => {
  const required = [];
  if (!config.PORT) required.push('PORT');
  if (required.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${required.join(', ')}`);
  }
};

module.exports = { config, validateConfig };
