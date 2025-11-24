# Backend-main Netlify Migration

This directory has been migrated from Express.js to Netlify Functions.

## 📁 Structure

```
Backend-main/
├── netlify/
│   └── functions/
│       ├── auth-login.js      # User login endpoint
│       ├── auth-register.js   # User registration endpoint
│       ├── auth-verify.js     # JWT token verification
│       ├── fmr.js              # Fair Market Rent data
│       └── noaa-weather.js     # NOAA extreme weather data
├── netlify.toml               # Netlify configuration
└── package.json               # Dependencies
```

## 🚀 Deployment

### 1. Set Environment Variables in Netlify Dashboard

Go to **Site Settings → Environment Variables** and add:

```
# Database
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
DB_PORT=3306
DB_SSL=false  # Set to 'true' if using SSL

# API Keys
NOAA_API_TOKEN=your-noaa-token
HUD_API_KEY=your-hud-api-key
JWT_SECRET=your-jwt-secret-key
```

### 2. Deploy

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

## 📡 API Endpoints

After deployment, your functions will be available at:

- `https://your-site.netlify.app/api/auth-login` (POST)
- `https://your-site.netlify.app/api/auth-register` (POST)
- `https://your-site.netlify.app/api/auth-verify` (GET)
- `https://your-site.netlify.app/api/fmr` (GET/POST)
- `https://your-site.netlify.app/api/noaa-weather` (GET/POST)

## 🔄 Migration Notes

### Express Routes → Netlify Functions

**Before (Express):**
```javascript
app.post('/login', (req, res) => { ... });
```

**After (Netlify Function):**
```javascript
exports.handler = async (event, context) => { ... };
```

### Key Changes:

1. **Request Body**: `req.body` → `JSON.parse(event.body)`
2. **Query Params**: `req.query` → `event.queryStringParameters`
3. **Response**: `res.json()` → Return object with `statusCode` and `body`
4. **CORS**: Handled in function response headers
5. **Database**: Connection created per request (no persistent connection)

## 🧪 Testing Locally

```bash
# Install dependencies
npm install

# Run Netlify Dev (simulates production)
netlify dev
```

Functions will be available at `http://localhost:8888/api/[function-name]`

## 📝 Function Details

### auth-login.js
- **Method**: POST
- **Body**: `{ username, password }`
- **Returns**: JWT token and user info

### auth-register.js
- **Method**: POST
- **Body**: `{ username, password }`
- **Returns**: JWT token and user info
- **Validation**: Password must be 8+ characters

### auth-verify.js
- **Method**: GET
- **Headers**: `Authorization: Bearer <token>`
- **Returns**: User info if token is valid

### fmr.js
- **Method**: GET or POST
- **Query/Body**: `{ fipsCode: "0801499999" }`
- **Returns**: FMR data (oneBedroom, twoBedroom, areaName, year)

### noaa-weather.js
- **Method**: GET or POST
- **Query/Body**: `{ stationId: "GHCND:USW00014768", year: 2022 }` OR `{ lat: 43.16, lng: -77.61, year: 2022 }`
- **Returns**: Extreme weather event counts

## ⚠️ Important Notes

1. **Database Connections**: Each function creates a new connection. Consider connection pooling for high traffic.
2. **Cold Starts**: First request may be slower (1-2 seconds). Subsequent requests are fast.
3. **Timeout**: Netlify Functions have a 10-second timeout (free) or 26 seconds (paid).
4. **Environment Variables**: Must be set in Netlify Dashboard, not in `.env` files.

## 🔐 Security

- All API keys stored in Netlify environment variables
- Passwords hashed with bcrypt
- JWT tokens for authentication
- CORS configured for your frontend domain

## 📚 Original Files

The original Express.js files are preserved:
- `WeatherWeGo-auth/server.js` (replaced by auth functions)
- `FMR/fmrService.js` (replaced by fmr.js function)
- `NOAAadverseweather/noaaService.js` (replaced by noaa-weather.js function)

These can be removed after confirming the Netlify Functions work correctly.

