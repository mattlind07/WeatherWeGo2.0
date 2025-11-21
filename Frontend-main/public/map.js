//JS Code to create a map with Leaflet

document.addEventListener("DOMContentLoaded", () => {

    // Create the bounds of the map    
    const usBounds = [
      [24.396308, -124.848974],  
      [49.384358,  -66.885444],  
    ];
  
    
    // Create the Leaflet map object
    const map = L.map("map", {
      maxBounds: usBounds,
      maxBoundsViscosity: 0.8,
      minZoom: 3,
      worldCopyJump: false,
    });
  
    
    // The URL of the tile server
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,                         
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);                         
  
    
    map.fitBounds(usBounds);
  
    
    // Create a variable to hold the current marker
    let currentMarker = null;        

  // Create a click event handler for the map
    map.on("click", (e) => {               
      
  
      // If there’s already a pin, remove it so only one shows at a time
      if (currentMarker) map.removeLayer(currentMarker);
  
      // Create a new draggable marker at the clicked coordinates
    currentMarker = L.marker(e.latlng, { draggable: true })
    .addTo(map)
    .bindPopup(
      `<strong>Selected Location</strong><br>
      Lat: ${e.latlng.lat.toFixed(5)}<br>
      Lng: ${e.latlng.lng.toFixed(5)}`
    )
    .openPopup();

  // When marker is dragged, update the popup content
  currentMarker.on('dragend', function(event) {
    const position = currentMarker.getLatLng();
    currentMarker.setPopupContent(
      `<strong>Selected Location</strong><br>
      Lat: ${position.lat.toFixed(5)}<br>
      Lng: ${position.lng.toFixed(5)}`
    );
  });
});

// Get references to UI elements
const searchButton = document.getElementById("searchButton");
const searchInput = document.getElementById("searchInput");
const geolocateButton = document.getElementById("geolocateButton");

// Function to handle geolocation success
function handleGeolocation(position) {
  const { latitude, longitude } = position.coords;
  
  // Center map on user's location
  map.setView([latitude, longitude], 12);

  // If there's already a pin, remove it
  if (currentMarker) map.removeLayer(currentMarker);

  // Create a new marker at the user's location
  currentMarker = L.marker([latitude, longitude])
    .addTo(map)
    .bindPopup(
      `<strong>Your Location</strong><br>
      Lat: ${latitude.toFixed(5)}<br>
      Lng: ${longitude.toFixed(5)}`
    )
    .openPopup();
}

// Function to handle address search
async function handleAddressSearch(address) {
  try {
    // Show loading overlay if it exists
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
      loadingOverlay.style.display = 'flex';
      const loadingMessage = document.getElementById('loadingMessage');
      if (loadingMessage) {
        loadingMessage.textContent = `Searching for "${address}"...`;
      }
    }

    // Use Geoapify API for geocoding
    const apiKey = "8ef9024cc83f4b8c8dfafc430277447f"; // Same key used in main.js
    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&apiKey=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Hide loading overlay
    if (loadingOverlay) {
      loadingOverlay.style.display = 'none';
    }
    
    if (data.features && data.features.length > 0) {
      const { lat, lon } = data.features[0].properties;
      const displayName = data.features[0].properties.formatted || address;
      
      // Center map on found location
      map.setView([lat, lon], 12);
      
      // If there's already a pin, remove it
      if (currentMarker) map.removeLayer(currentMarker);
      
      // Create a new marker at the found location
      currentMarker = L.marker([lat, lon])
        .addTo(map)
        .bindPopup(
          `<strong>${displayName}</strong><br>
          Lat: ${lat.toFixed(5)}<br>
          Lng: ${lon.toFixed(5)}`
        )
        .openPopup();
        
      // Return the coordinates for weather lookup
      return { lat, lon };
    } else {
      alert("Address not found. Please try a different search term.");
      return null;
    }
  } catch (error) {
    console.error("Error searching address:", error);
    alert("Error searching for address. Please try again.");
    
    // Hide loading overlay if there was an error
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
      loadingOverlay.style.display = 'none';
    }
    
    return null;
  }
}

// Connect to search button if it exists
if (searchButton && searchInput) {
  searchButton.addEventListener("click", async () => {
    const address = searchInput.value;
    if (!address) {
      alert("Please enter an address");
      return;
    }
    
    // Search for the address and get coordinates
    const coordinates = await handleAddressSearch(address);
    
    // If coordinates were found, trigger weather lookup
    if (coordinates && typeof getWeather === 'function') {
      try {
        const { lat, lon } = coordinates;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // Call the getWeather function from main.js if it exists
        getWeather(lat, lon, timezone)
          .then(renderWeather)
          .catch(e => {
            console.error("Error rendering weather:", e);
            alert("Error getting weather: " + e.message);
          });
      } catch (error) {
        console.error("Error getting weather data:", error);
      }
    }
  });
  
  // Allow hitting Enter in the search input to trigger search
  searchInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      searchButton.click();
    }
  });
}

// Connect to geolocation button if it exists
if (geolocateButton) {
  geolocateButton.addEventListener("click", function() {
    // Show loading overlay if it exists
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
      loadingOverlay.style.display = 'flex';
      const loadingMessage = document.getElementById('loadingMessage');
      if (loadingMessage) {
        loadingMessage.textContent = "Getting your location...";
      }
    }
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        // Success callback
        function(position) {
          handleGeolocation(position);
          
          // Hide loading overlay
          if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
          }
          
          // If getWeather function exists, get weather data for this location
          if (typeof getWeather === 'function') {
            const { latitude, longitude } = position.coords;
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            
            getWeather(latitude, longitude, timezone)
              .then(renderWeather)
              .catch(e => {
                console.error("Error rendering weather:", e);
                alert("Error getting weather: " + e.message);
              });
          }
        },
        // Error callback
        function(error) {
          console.error("Geolocation error:", error);
          alert("Error getting your location. Please allow location access and try again.");
          
          // Hide loading overlay
          if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
          }
        },
        // Options
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert("Geolocation is not supported by your browser");
      
      // Hide loading overlay
      if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
      }
    }
  });
}

// Export map and marker handling functions for use by other scripts
window.mapFunctions = {
  setMarker: function(lat, lon, popupContent) {
    // If there's already a pin, remove it
    if (currentMarker) map.removeLayer(currentMarker);
    
    // Center map on location
    map.setView([lat, lon], 12);
    
    // Create a new marker
    currentMarker = L.marker([lat, lon])
      .addTo(map)
      .bindPopup(popupContent || `<strong>Selected Location</strong><br>Lat: ${lat.toFixed(5)}<br>Lng: ${lon.toFixed(5)}`)
      .openPopup();
      
    return currentMarker;
  },
  
  getMap: function() {
    return map;
  },
  
  handleAddressSearch: handleAddressSearch
};
});
  