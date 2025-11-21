# 🌍 Weather We Go – Frontend

**Weather We Go** is a web application that helps users discover travel destinations based on weather, climate, and walkability. It includes a personality quiz that matches users with ideal location types using database-driven logic.

## ✨ Features

- 🌤️ **Weather-Based Recommendations**: Suggests travel destinations using real-time weather and forecast data.
- 🧭 **Interactive Map**: Click, drag, or search for locations via an interactive U.S. map powered by Leaflet.js and Geoapify.
- 🧠 **Personality Quiz**: A 12-question quiz to recommend destination types based on user preferences.

## 🎨 CSS Files

- `map.css`  
  - Controls map size and layout.

- `site.css`  
  - Global stylesheet applied across all pages except `map.html`, including:  
    `index.html`, `login.html`, `register.html`, `personality_test.html`, `profile.html`, and `walkability.html`.

## 🧱 HTML Files

- `index.html`  
  - Homepage with navigation to core app features.

- `login.html` / `register.html`  
  - User authentication pages. Guest login available. Links between each other.

- `map.html`  
  - Hosts the interactive map interface.

- `personality_test.html`  
  - Displays the travel personality quiz with progress tracking.

- `walkability.html`  
  - Shows detailed weather forecasts and compatibility scoring.

## 🧠 JavaScript Files

- `main.js`  
  - Core logic for:
    - Weather and forecast fetching via Open-Meteo API
    - Walkability score integration
    - User location handling (via Geoapify)
    - Loading animations and interactive forecast UI
  - **External APIs/Libraries**:
    - [Open-Meteo API](https://open-meteo.com/): Weather data
    - [Geoapify](https://www.geoapify.com/): Geocoding services
    - [Font Awesome](https://fontawesome.com/): Icons for walkability features

- `map.js`  
  - Leaflet.js-powered map with:
    - Clickable and draggable markers
    - Address search and geolocation support
    - Coordinate export to connect with weather functionality

- `quiz.js`  
  - Implements a 12-question quiz that:
    - Evaluates user preferences for weather, budget, and walkability
    - Updates a visual progress bar
    - Provides options to retake or go back
    - Outputs results based on matched location types
