// Configuration file for API endpoints
// Updated to use Netlify Functions endpoints
window.APP_CONFIG = {
  // Backend URL - Now uses Netlify Functions by default
  // If deploying frontend and backend separately, set this to your backend Netlify URL
  BACKEND_URL: '/api', // Use relative path for same-domain Netlify deployment
  // Or if backend is on different Netlify site:
  // BACKEND_URL: 'https://your-backend-site.netlify.app/api',
  
  // API Endpoints (Netlify Functions)
  API_ENDPOINTS: {
    LOGIN: '/api/auth-login',
    REGISTER: '/api/auth-register',
    VERIFY: '/api/auth-verify',
    FMR: '/api/fmr',
    NOAA_WEATHER: '/api/noaa-weather'
  }
};

