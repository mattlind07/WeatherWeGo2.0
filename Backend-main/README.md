# ☁️ Weather We Go – Backend

Weather We Go is a web application that allows users to explore destinations based on weather, climate, and walkability. The backend handles data aggregation, processing, and API interactions to power features such as extreme weather analysis, walkability indexing, and housing affordability.

## 🧩 Features

- 🌪️ **Extreme Weather Analysis**  
  Uses NOAA’s GSOY data to identify areas with high counts of adverse weather events.

- 🏘️ **Housing Affordability**  
  Fetches Fair Market Rent (FMR) data by FIPS code using HUD’s FMR API.

- 🚶 **Walkability Scoring**  
  Processes and merges geographic and EPA Smart Location data for walkability evaluations.

- 🔐 **User Authentication**  
  Node.js and MySQL-based backend supporting registration, login, and session management.

## 📝 Notable Files

- `FMR/fmrService.js`
  - Fetches 2025 HUD Fair Market Rent data by FIPS code, categorized by number of bedrooms.

- `NOAAadverseweather/noaaService.js`  
  - Retrieves historical weather data (e.g., thunderstorms, heat, wind, snow) from NOAA’s GSOY dataset and maps it to locations.

- `Walkability/datasets.py`  
  - Merges Census and EPA Smart Location data using spatial joins to create usable walkability datasets.

## ⚙️ Technologies & Resources

- Node.js / Express
- MySQL
- NOAA GSOY API
- HUD FMR API
- EPA Smart Location Database
- Python (Pandas, GeoPandas, Shapely)
