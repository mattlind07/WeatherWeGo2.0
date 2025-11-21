import React from "react";

class Sigma extends React.Component {
  render() {
    return (
      <div className="sigma--body blurred">
        {/* Loading Overlay */}
        <div className="loading-overlay" id="loadingOverlay">
          <div className="throbber"></div>
          <div className="loading-message" id="loadingMessage">Getting your location...</div>
        </div>

        {/* Search UI */}
        <div className="search">
          <div className="search__container">
            <input type="text" id="searchInput" placeholder="Enter address..." />
            <button id="searchButton">Search</button>
            <button
              id="geolocateButton"
              className="geolocation-button"
              title="Use my current location"
            >
              <img
                src="icons/geolocator.svg"
                alt="Current location"
                className="geo-icon"
              />
            </button>
          </div>
        </div>

        {/* App Container */}
        <div className="app-container">
          {/* Weather Display */}
          <div className="weather" id="weather">
            <div className="weather-container">
              <div className="current-weather">
                <div className="icon-and-temp">
                  <div className="weather-icon" id="weather-icon">☀️</div>
                  <div className="temperature" id="temperature">72°F</div>
                </div>
                <div className="weather-description" id="weather-description">Clear sky</div>
              </div>
              <div className="location-name" id="location-name">San Francisco, CA</div>
              <div className="feels-like" id="feels-like">Feels like 70°F</div>
              <div className="additional-info">
                <div className="humidity" id="humidity">Humidity: 60%</div>
                <div className="wind" id="wind">Wind: 5 mph</div>
              </div>
            </div>
          </div>

          {/* Map Display */}
          <div className="map" id="map">
            {/* Map content will go here, likely rendered by Leaflet or another library */}
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="bottom-banner">
          <div className="bottom-text">
            Powered by OpenWeatherMap, Leaflet, and Nominatim
          </div>
        </div>
      </div>
    );
  }
}

export default Sigma;
