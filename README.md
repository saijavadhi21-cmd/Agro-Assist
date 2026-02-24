# KrishiMitra — Smart Crop & Fertilizer Recommendation System

A full-stack web application for helping farmers get personalized crop recommendations, fertilizer guidance, and investment budgeting based on soil analysis and location-based insights.

## 🎯 Features

- 🌾 **Smart Crop Recommendations** - AI-powered recommendations based on soil parameters (N, P, K, pH)
- 📍 **Location-Based Insights** - GPS detection or manual location search with geolocation
- 💰 **Budget Calculator** - Calculate fertilizer and seed investment for each crop
- 📊 **Soil Analysis** - Detailed soil health reports with nutrient classifications and pH advisory
- 🗣️ **Natural Language Input** - Parse soil parameters from natural language text
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices
- ⚡ **Modern Architecture** - Clean separation of concerns with services, controllers, and routes

## 🛠️ Tech Stack

### Backend
- **Framework**: Express.js (Node.js)
- **Language**: JavaScript (ES6+)
- **API Communication**: REST with JSON
- **Geolocation**: OpenStreetMap Nominatim API
- **Port**: 3000 (default)

### Frontend
- **HTML/CSS/JavaScript** - Vanilla (no build tool)
- **Design**: Custom CSS with responsive layout
- **API Communication**: Fetch API
- **Port**: 5500 (with Live Server) or any static server

## 📁 Project Structure

```
KrishiMitra/
├── backend/                         # Backend application
│   ├── src/
│   │   ├── index.js                # Server entry point
│   │   ├── app.js                  # Express app configuration
│   │   ├── config/
│   │   │   └── index.js            # Configuration & environment
│   │   ├── controllers/
│   │   │   ├── crop.controller.js  # Crop recommendation logic
│   │   │   └── location.controller.js # Geolocation handling
│   │   ├── routes/
│   │   │   ├── crop.route.js       # Crop endpoints
│   │   │   └── location.route.js   # Location endpoints
│   │   ├── services/
│   │   │   ├── crop.service.js     # Business logic for crops
│   │   │   └── location.service.js # Geolocation services
│   │   ├── utils/
│   │   │   ├── constants.js        # Crop data & prices
│   │   │   └── helpers.js          # Input parsing & validation
│   │   └── middleware/             # (Future: auth, logging)
│   ├── package.json
│   ├── .env                        # Environment variables
│   └── .env.example                # Example environment file
│
├── frontend/                       # Frontend application
│   ├── index.html                 # Landing page
│   ├── pages/
│   │   └── farm-advisor.html      # Main application page
│   ├── js/
│   │   ├── config.js              # API endpoints configuration
│   │   └── app.js                 # Application logic
│   ├── css/
│   │   └── index.css              # Styling
│   └── assets/
│       ├── logo.png
│       └── hero.png
│
├── package.json                   # Root package.json
├── README.md                      # This file
└── .gitignore
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js 14+ and npm
- Modern web browser
- Internet connection (for Nominatim geolocation API)

### Backend Setup

#### 1. Navigate to backend folder
```bash
cd backend
```

#### 2. Install dependencies
```bash
npm install
```

#### 3. Create environment file
Create `.env` file in `backend/` folder:
```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5500
```

#### 4. Start the backend
```bash
npm run dev          # With auto-reload (requires nodemon)
# or
npm start            # Standard start
```

Backend runs at: `http://localhost:3000`

### Frontend Setup

The frontend is a static site. Use any of these methods:

#### Option 1: VS Code Live Server (Recommended)
1. Install "Live Server" extension in VS Code
2. Right-click `frontend/index.html` → "Open with Live Server"
3. Opens at `http://localhost:5500` (default port)

#### Option 2: Python HTTP Server
```bash
cd frontend
python -m http.server 5500
```

#### Option 3: Node http-server
```bash
npm install --global http-server
cd frontend
http-server -p 5500
```

## 🔌 API Reference

### Base URL
**Development**: `http://localhost:3000/api`

### 🌾 Crop Endpoints

#### POST `/api/crops/recommend`
Get crop recommendations based on soil parameters

**Request Body**:
```json
{
  "n": 45,              // Nitrogen (mg/kg)
  "p": 35,              // Phosphorus (mg/kg)
  "k": 150,             // Potassium (mg/kg)
  "ph": 7.0,            // Soil pH
  "area": 2.5,          // Farm area (acres) - optional, default: 1
  "soilType": "loamy",  // optional, default: "any"
  "avgTemp": 28,        // Average temperature (°C) - optional, default: 28
  "avgRainfall": 3,     // Average rainfall (mm) - optional, default: 3
  "inputText": ""       // Natural language input - optional
}
```

**Response**:
```json
{
  "inputs": { ... },
  "soilHealth": {
    "npkClass": { "N": "Medium", "P": "Medium", "K": "High" },
    "phClass": { "label": "Neutral (Ideal)", "advice": "..." }
  },
  "recommendations": [
    {
      "key": "wheat",
      "name": "Wheat",
      "icon": "🌿",
      "season": "Rabi (Nov–Apr)",
      "score": 85,
      "reasons": [...],
      "duration": "100-120 days",
      "yield": "18-25 quintals/acre",
      "notes": "..."
    }
  ]
}
```

#### POST `/api/crops/budget`
Calculate fertilizer and seed budget for a crop

**Request Body**:
```json
{
  "cropKey": "wheat",   // Crop identifier
  "area": 2.5,          // Farm area (acres)
  "n": 45,              // Soil nitrogen
  "p": 35,              // Soil phosphorus
  "k": 150              // Soil potassium
}
```

**Response**:
```json
{
  "crop": { "key": "wheat", "name": "Wheat", ... },
  "area": 2.5,
  "seed": {
    "qty": 100,
    "pricePerKg": 30,
    "total": 3000
  },
  "fertilizer": {
    "urea": { "qty": 200, "price": 25, "total": 5000 },
    "dap": { "qty": 150, "price": 45, "total": 6750 },
    "mop": { "qty": 75, "price": 40, "total": 3000 }
  },
  "totalFertCost": 14750,
  "totalCost": 17750,
  "costPerAcre": 7100
}
```

#### GET `/api/crops/list`
Get list of all available crops

**Response**:
```json
[
  { "key": "rice", "name": "Rice (Paddy)", "icon": "🌾", "season": "Kharif" },
  { "key": "wheat", "name": "Wheat", "icon": "🌿", "season": "Rabi" },
  ...
]
```

### 📍 Location Endpoints

#### GET `/api/location/geocode?q=query`
Search for locations by query string

**Query Parameters**:
- `q` (string, required) - Location name (city, village, etc.)

**Response**:
```json
[
  {
    "name": "Tirupporur, Tamil Nadu, India",
    "lat": 12.8275,
    "lon": 80.0742
  }
]
```

#### GET `/api/location/reverse?lat=latitude&lon=longitude`
Reverse geocode coordinates to location name

**Query Parameters**:
- `lat` (number, required) - Latitude (-90 to 90)
- `lon` (number, required) - Longitude (-180 to 180)

**Response**:
```json
{
  "city": "Tirupporur",
  "state": "Tamil Nadu",
  "country": "India",
  "display": "Full display name from OSM"
}
```

## 📊 Database Models

### Crop Model (Constants)
```javascript
{
  key: "wheat",              // Unique identifier
  name: "Wheat",             // Display name
  icon: "🌿",                // Emoji icon
  season: "Rabi (Nov–Apr)",  // Growing season
  pH: [6.0, 7.5],            // pH range
  N: [40, 80],               // Nitrogen range (mg/kg)
  P: [20, 60],               // Phosphorus range (mg/kg)
  K: [20, 50],               // Potassium range (mg/kg)
  soilTypes: [...],          // Compatible soil types
  tempRange: [12, 25],       // Temperature range (°C)
  rainfall: "medium",        // Rainfall requirement
  seedRate: 40,              // kg/acre
  seedPricePerKg: 30,        // ₹/kg
  fertilizer: {              // Base requirements per acre
    urea: 80,
    dap: 60,
    mop: 30
  },
  duration: "100-120 days",  // Growing duration
  yield: "18-25 quintals/acre",
  notes: "Cool weather crop. Ideal in North India during winter."
}
```

## 🧮 Available Crops

1. **Rice** (🌾) - Kharif season
2. **Wheat** (🌿) - Rabi season
3. **Maize/Corn** (🌽) - Kharif/Rabi
4. **Groundnut** (🥜) - Kharif
5. **Cotton** (🌸) - Kharif
6. **Sugarcane** (🎋) - Year-round
7. **Tomato** (🍅) - All seasons
8. **Pulses** (🫘) - Kharif/Rabi
9. **Banana** (🍌) - Year-round
10. **Onion** (🧅) - Rabi

## 🔄 Frontend Workflow

### 1. User Enters Soil Data
- Manual input via form fields (N, P, K, pH, Area, Soil Type)
- OR natural language input (e.g., "N 45 P 35...")

### 2. Location Search
- Manual location search with auto-suggestions
- GPS-based detection with reverse geocoding

### 3. API Call to Backend
```javascript
// POST /api/crops/recommend
const recommendations = await apiCall(API_ENDPOINTS.crops.recommend, {
  method: 'POST',
  body: JSON.stringify({ n, p, k, ph, area, soilType })
});
```

### 4. Display Results
- Soil health report (NPK classification, pH advisory)
- Top 5 crop recommendations with scores
- Interactive crop selector

### 5. Budget Calculation
```javascript
// POST /api/crops/budget
const budget = await apiCall(API_ENDPOINTS.crops.budget, {
  method: 'POST',
  body: JSON.stringify({ cropKey, area, n, p, k })
});
```

### 6. Display Budget
- Fertilizer requirements and costs
- Seed requirements and costs
- Total investment and per-acre cost

## 🎛️ Configuration

### Frontend Config (frontend/js/config.js)
```javascript
// API endpoints
const API_ENDPOINTS = {
  crops: {
    recommend: `${API_BASE_URL}/crops/recommend`,
    budget: `${API_BASE_URL}/crops/budget`,
    list: `${API_BASE_URL}/crops/list`
  },
  location: {
    geocode: `${API_BASE_URL}/location/geocode`,
    reverse: `${API_BASE_URL}/location/reverse`
  }
};
```

### Backend Config (backend/.env)
```env
PORT=3000                           # Server port
NODE_ENV=development                # Environment
FRONTEND_URL=http://localhost:5500  # CORS origin
```

## 🔗 Running the Full Stack

### Terminal 1: Backend
```bash
cd backend
npm run dev
# Backend ready at http://localhost:3000
```

### Terminal 2: Frontend
```bash
cd frontend
# Use Live Server or:
python -m http.server 5500
# Frontend ready at http://localhost:5500
```

Then open: `http://localhost:5500` in your browser

## 📝 Input Validation

### Crop Recommendation Input
- **N, P, K**: 0-400 mg/kg (required)
- **pH**: 3-10 (required)
- **Area**: 0-10000 acres (optional, default: 1)
- **Temperature**: -10 to 60 °C (optional, default: 28)
- **Rainfall**: 0-50 mm (optional, default: 3)
- **Soil Type**: loamy | clay | sandy loam | black cotton | clay loam | any

### Quick Input Parsing
Natural language patterns recognized:
- `N 45` or `nitrogen: 45`
- `P 35` or `phosphorus = 35`
- `K 150` or `potassium - 150`
- `pH 7.0`
- `area 2.5 acres`
- `soil type loamy`
- `temp 28` or `temperature 28`
- `rainfall 3`

## 🐛 Troubleshooting

### Frontend won't connect to backend
- Ensure backend runs on configured PORT (default 3000)
- Check `FRONTEND_URL` in backend `.env` matches frontend origin
- Verify CORS `credentials: true` in fetch requests
- Check `API_BASE_URL` in `frontend/js/config.js` matches backend URL

### 404 errors on API calls
- Verify backend is running: `http://localhost:3000/health`
- Check API endpoint paths in `frontend/js/config.js`
- Verify request method (POST vs GET)

### Geolocation services not working
- Check internet connection (needs Nominatim API access)
- Verify browser allows geolocation permission
- Check browser console for specific error messages

### Natural language input not parsing
- Use recognized keywords: n, p, k, ph, area, soil, temp, rain
- Use separators: `:`, `=`, or `-`
- Example: `"nitrogen = 45, phosphorus: 35, K-150, pH 7"`

## 🚢 Deployment

### Backend Deployment
Options: Render, Railway, Heroku, AWS, DigitalOcean

### Frontend Deployment
Options: Vercel, Netlify, GitHub Pages, static hosting

### Production Environment Variables
```env
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

## 📝 Project Architecture

The project follows the **MVC (Model-View-Controller)** pattern similar to Event Management System:

### Backend Layers
- **Routes** - Define API endpoints and HTTP methods
- **Controllers** - Handle requests/responses and call services
- **Services** - Contain business logic for crops and location
- **Utils** - Helper functions for validation and parsing
- **Config** - Environment configuration and constants

### Frontend Structure
- **index.html** - Landing page
- **pages/** - Feature pages (farm-advisor.html)
- **js/config.js** - Centralized API configuration
- **js/app.js** - Main application logic
- **css/** - Styling

## 🔒 Error Handling

All endpoints return appropriate HTTP status codes:
- `200 OK` - Successful request
- `400 Bad Request` - Invalid input parameters
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server-side error

Error responses include a descriptive `error` field.

---

**KrishiMitra** — Empowering Farmers with Data-Driven Agriculture 🌾

For questions or support, refer to the project documentation or create an issue.


### 3. Start the Server
```bash
npm start
# or for development with auto-reload:
npm install -g nodemon && npm run dev
```

### 4. Open in Browser
```
http://localhost:3000
```

---

## 🔌 FREE APIs Used

| API | Purpose | Cost |
|-----|---------|------|
| [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org) | Location → lat/lon geocoding | FREE, no key needed |

---

## 📡 REST API Endpoints

### Location
- `GET /api/location/geocode?q=Tirupporur` — Search location → coordinates
- `GET /api/location/reverse?lat=12.7&lon=80.2` — Coordinates → city name

### Crops
- `GET /api/crops/list` — All supported crops
- `POST /api/crops/recommend` — Get crop recommendations
  ```json
  { "n": 45, "p": 32, "k": 28, "ph": 6.8, "area": 2, "avgTemp": 28, "avgRainfall": 3 }
  ```
- `POST /api/crops/budget` — Get fertilizer + seed cost breakdown
  ```json
  { "cropKey": "rice", "area": 2, "n": 45, "p": 32, "k": 28 }
  ```

---

## 🌾 Supported Crops (10)

Rice, Wheat, Maize, Groundnut, Cotton, Sugarcane, Tomato, Pulses, Banana, Onion

---

## 🗂 Project Structure

```
smart-crop/
├── server.js              # Express server entry point
├── .env                   # Your API keys (create from .env.example)
├── routes/
│   ├── location.js        # OpenStreetMap Nominatim integration
│   └── crops.js           # Crop recommendation & budget API
├── utils/
│   └── cropLogic.js       # All crop rules, fertilizer data (ICAR-based)
└── public/
    ├── index.html         # Main UI
    ├── css/style.css      # All styles
    └── js/app.js          # Frontend logic
```

---

## 💡 How It Works

1. **User enters** soil NPK values, pH, area, and location
2. **Location** is geocoded via OpenStreetMap → gets lat/lon
3. **Weather API** fetches 7-day forecast for that location
4. **Crop engine** scores all 10 crops by soil pH match, NPK suitability, temperature range, and rainfall
5. **Budget calculator** adjusts fertilizer quantities based on soil deficit from standard ICAR doses
6. **Results displayed** with soil health report, weather forecast, ranked crops, and full cost breakdown

---

## 🖨 Print Report
Click **"🖨 Print Report"** button — the page is print-optimized with CSS.

---

## ✅ No Database Required
This version uses in-memory rule-based logic. All knowledge is in `utils/cropLogic.js`.
