# 🚀 Netlify Deployment Checklist

## ✅ Pre-Deployment Status: **READY**

### Frontend-main ✅
- [x] All endpoints updated to use Netlify Functions
- [x] Config.js configured with `/api` endpoints
- [x] netlify.toml configured
- [x] NOAA Functions created (with Open-Meteo fallback)
- [x] All HTML pages include config.js
- [x] No hardcoded Azure URLs remaining

### Backend-main ✅
- [x] All Express routes converted to Netlify Functions
- [x] Auth functions (login, register, verify) created
- [x] FMR function created
- [x] NOAA weather function created
- [x] netlify.toml configured
- [x] package.json updated with dependencies

## 📋 Deployment Steps

### Option 1: Deploy Frontend and Backend Together (Recommended)

If you want everything on one Netlify site:

1. **Copy Backend Functions to Frontend**
   ```bash
   # Copy backend functions to frontend
   cp -r Backend-main/netlify/functions/* Frontend-main/netlify/functions/
   ```

2. **Merge package.json dependencies**
   - Add backend dependencies to Frontend-main/package.json
   - Or create a combined package.json

3. **Deploy Frontend-main**
   ```bash
   cd Frontend-main
   netlify deploy --prod
   ```

### Option 2: Deploy Separately (More Flexible)

**Deploy Backend First:**

1. **Navigate to Backend-main**
   ```bash
   cd Backend-main
   ```

2. **Set Environment Variables in Netlify Dashboard**
   Go to **Site Settings → Environment Variables**:
   ```
   DB_HOST=your-db-host
   DB_USER=your-db-user
   DB_PASSWORD=your-db-password
   DB_NAME=your-db-name
   DB_PORT=3306
   DB_SSL=false
   NOAA_API_TOKEN=your-noaa-token
   HUD_API_KEY=your-hud-api-key
   JWT_SECRET=your-secret-key-change-this
   ```

3. **Deploy Backend**
   ```bash
   netlify login
   netlify init
   netlify deploy --prod
   ```

4. **Note the Backend URL**
   - Example: `https://your-backend-site.netlify.app`

**Deploy Frontend Second:**

1. **Update config.js** (if backend is on different site)
   ```javascript
   BACKEND_URL: 'https://your-backend-site.netlify.app/api'
   ```

2. **Navigate to Frontend-main**
   ```bash
   cd Frontend-main
   ```

3. **Set Environment Variables** (if needed)
   ```
   NOAA_API_TOKEN=your-noaa-token (if using frontend NOAA functions)
   ```

4. **Deploy Frontend**
   ```bash
   netlify login
   netlify init
   netlify deploy --prod
   ```

## 🔧 Environment Variables Required

### Backend Functions Need:
- `DB_HOST` - Database host
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `DB_PORT` - Database port (default: 3306)
- `DB_SSL` - Use SSL? (true/false)
- `NOAA_API_TOKEN` - NOAA API token
- `HUD_API_KEY` - HUD FMR API key
- `JWT_SECRET` - Secret key for JWT tokens

### Frontend Functions Need (if using):
- `NOAA_API_TOKEN` - Only if using frontend NOAA functions

## ✅ Post-Deployment Testing

After deployment, test:

1. **Authentication**
   - [ ] User registration works
   - [ ] User login works
   - [ ] JWT token is stored
   - [ ] Logout clears session

2. **Weather Data**
   - [ ] Weather forecast loads
   - [ ] Walkability score calculates
   - [ ] NOAA data fetches (or falls back to Open-Meteo)

3. **FMR Data** (if used)
   - [ ] FMR data fetches correctly

4. **General**
   - [ ] All pages load correctly
   - [ ] Navigation works
   - [ ] No console errors

## 🐛 Troubleshooting

### Functions Not Working
- Check Netlify Function logs in Dashboard
- Verify environment variables are set
- Check function names match endpoints

### CORS Errors
- Verify CORS headers in netlify.toml
- Check function response headers

### Database Connection Errors
- Verify database credentials
- Check DB_SSL setting
- Ensure database allows connections from Netlify IPs

### 404 Errors on Functions
- Verify functions are in `netlify/functions/` directory
- Check function file names match endpoint paths
- Ensure netlify.toml has correct functions directory

## 📝 Quick Deploy Commands

```bash
# Install Netlify CLI (if not installed)
npm install -g netlify-cli

# Login
netlify login

# Deploy (from project root)
cd Frontend-main  # or Backend-main
netlify deploy --prod
```

## 🎯 Current Status

**✅ READY FOR DEPLOYMENT**

All code is updated, functions are created, and configuration is complete. Just need to:
1. Set environment variables
2. Run deployment command
3. Test functionality

Good luck! 🚀

