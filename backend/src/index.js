// ═══════════════════════════════════════════════════════════════════
// Server Entry Point - Initialize & Start Express Server
// ═══════════════════════════════════════════════════════════════════

require('dotenv').config();
const app = require('./app');
const { config, validateConfig } = require('./config');

// Validate configuration
validateConfig();

const PORT = config.PORT;

const server = app.listen(PORT, () => {
  console.log(`\n🌱 KrishiMitra Backend running at http://localhost:${PORT}`);
  console.log(`📡 API Base: http://localhost:${PORT}/api`);
  console.log(`🔗 Frontend URL configured: ${config.FRONTEND_URL}`);
  console.log(`📝 Environment: ${config.NODE_ENV}\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

module.exports = server;
