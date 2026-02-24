# KrishiMitra Backend API

Express.js backend for KrishiMitra crop recommendation system.

## Project Structure

```
src/
├── index.js              # Server entry point
├── app.js                # Express app setup with middleware
├── config/
│   └── index.js          # Configuration & environment variables
├── controllers/
│   ├── crop.controller.js      # Crop recommendation controller
│   └── location.controller.js  # Geolocation controller
├── routes/
│   ├── crop.route.js           # Crop API routes
│   └── location.route.js       # Location API routes
├── services/
│   ├── crop.service.js         # Crop business logic
│   └── location.service.js     # Location business logic
├── utils/
│   ├── constants.js            # Crops database & prices
│   └── helpers.js              # Input parsing & validation
└── middleware/                 # (Reserved for auth, logging, etc.)
```

## Architecture Pattern

Following the **Service-Controller-Route** pattern:

1. **Routes** - Define API endpoints
2. **Controllers** - Handle HTTP requests/responses, call services
3. **Services** - Contain pure business logic
4. **Utils** - Helper functions for parsing and validation
5. **Config** - Environment setup and constants

## Environment Setup

Create `.env` file:
```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5500
```

## Available Scripts

```bash
npm run dev      # Start with auto-reload (nodemon)
npm start        # Start server
npm test         # Run tests (placeholder)
```

## API Documentation

See [../README.md](../README.md) for full API documentation.

### Key Endpoints

**Crops:**
- `POST /api/crops/recommend` - Get crop recommendations
- `POST /api/crops/budget` - Calculate fertilizer budget
- `GET /api/crops/list` - List all crops

**Location:**
- `GET /api/location/geocode?q=query` - Search locations
- `GET /api/location/reverse?lat=X&lon=Y` - Reverse geocode

## Key Features

✅ Service Layer Separation - Business logic isolated from routes
✅ Input Validation - Comprehensive parameter validation
✅ Error Handling - Consistent error responses
✅ CORS Configuration - Configurable per environment
✅ Health Check Endpoint - `/health` for monitoring
✅ Graceful Shutdown - Signal handlers for clean exit

## Dependencies

- **express** 4.18.2 - Web framework
- **cors** 2.8.5 - CORS middleware
- **dotenv** 16.3.1 - Environment variables

## Development Dependencies

- **nodemon** 3.1.14 - Auto-reload during development

## Adding New Endpoints

1. **Create Service** (`services/feature.service.js`)
   ```javascript
   function doSomething(params) {
     // Business logic
   }
   module.exports = { doSomething };
   ```

2. **Create Controller** (`controllers/feature.controller.js`)
   ```javascript
   async function handleRequest(req, res) {
     try {
       const result = await featureService.doSomething(req.body);
       res.json(result);
     } catch (err) {
       res.status(500).json({ error: err.message });
     }
   }
   ```

3. **Create Route** (`routes/feature.route.js`)
   ```javascript
   const express = require('express');
   const router = express.Router();
   const controller = require('../controllers/feature.controller');
   
   router.post('/action', controller.handleRequest);
   module.exports = router;
   ```

4. **Register in `app.js`**
   ```javascript
   const featureRoutes = require('./routes/feature.route');
   app.use(`${config.API_BASE_PATH}/feature`, featureRoutes);
   ```

## Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure `FRONTEND_URL` for production domain
- [ ] Install dependencies: `npm install`
- [ ] Start server: `npm start`
- [ ] Test `/health` endpoint
- [ ] Set up logging/monitoring

---

Happy farming! 🌾
