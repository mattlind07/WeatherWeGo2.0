import { calculateScore } from "./Scoring/scoreCalculator.js";

 //Dropdown menu for mobile view
const menu = document.querySelector('#mobile-menu')
const menuLinks = document.querySelector('.navbar__menu')

menu.addEventListener('click', function() {
    menu.classList.toggle('is-active')
    menuLinks.classList.toggle('active')
});

// Check if user is logged in
function isLoggedIn() {
  return sessionStorage.getItem('currentUser') !== null;
}

// Function to update UI based on login status
function updateUIForLogin() {
  const loginButton = document.querySelector('.navbar__btn .button');
  const currentUser = sessionStorage.getItem('currentUser');
  
  if (currentUser) {
      const user = JSON.parse(currentUser);
      // Change "Log In" button to show username
      if (loginButton) {
          loginButton.textContent = `Welcome, ${user.username}`;
          loginButton.href = '#'; // Change where this points as needed
      }
      
      // Add logout functionality
      const logoutElement = document.createElement('li');
      logoutElement.className = 'navbar__btn';
      logoutElement.innerHTML = '<a href="#" class="button" id="logoutButton">Logout</a>';
      
      // Insert logout button after login button
      loginButton.parentNode.parentNode.appendChild(logoutElement);
      
      // Add event listener for logout
      document.getElementById('logoutButton').addEventListener('click', function(e) {
          e.preventDefault();
          sessionStorage.removeItem('currentUser');
          window.location.reload();
      });
  }
}

// Call this function when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  updateUIForLogin();
});

// Scroll animation
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        console.log(entry)
        if (entry.isIntersecting) {
            entry.target.classList.add('show')
        }
        else {
            entry.target.classList.remove('show')
        }
    })
})
const hiddenElements = document.querySelectorAll('.hidden')
hiddenElements.forEach((el) => observer.observe(el))

// This is the main JavaScript file
document.addEventListener("DOMContentLoaded", function() {
  console.log("main.js loaded");
  console.log("Interactive weather app loaded");

    // Check if this is a weather page by looking for essential weather elements
    const isWeatherPage = document.querySelector('.header') !== null && 
    document.querySelector('[data-day-section]') !== null &&
    document.querySelector('[data-hour-section]') !== null;

    //making sure webpage is "weather related"
    if (isWeatherPage) {
      console.log("Interactive weather app loaded");
      initializeWeatherApp();
    } else {
      console.log("Not a weather page, skipping weather functionality");
    }
  });
  function initializeWeatherApp() {

  // Store hourly data globally for filtering
  let allHourlyData = [];
  let selectedDayTimestamp = null;
  const selectedDayElement = document.querySelector('[data-selected-day]');

  // icon mapping (my old iconMap.js)
  // TODO:
  // create more icons that are related to the score shown
  // remove weather icons and replace with said 'walking icons'
  // ------------------------------------------------
  const ICON_MAP = new Map();

  function addMapping(values, icon) {
    values.forEach(value => {
      ICON_MAP.set(value, icon);
    });
  }

  addMapping([0, 1], "sun");
  addMapping([2], "cloud-sun");
  addMapping([3], "cloud");
  addMapping([45, 48], "smog");
  addMapping([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82], "cloud-showers-heavy");
  addMapping([71, 73, 75, 77, 85, 86], "snowflake");
  addMapping([95, 96, 99], "cloud-bolt");


  // weather functions (used from weather.js)
  // TODO: 
  // add more NOAA data api endpoints to use
  // fix the GET/ errors when using wrong addresses that wont convert to lat/long for some reason
  // ------------------------------------------------ 
  async function getWeather(lat, lon, timezone) {
    console.log("Getting weather for:", lat, lon, timezone);
    updateLoadingMessage("Fetching weather data...");
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&timezone=${timezone}&hourly=temperature_2m,apparent_temperature,precipitation,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timeformat=unixtime`
      );
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Weather data received:", data);
      
      return {
        current: parseCurrentWeather(data),
        daily: parseDailyWeather(data),
        hourly: parseHourlyWeather(data),
      };
    } catch (error) {
      console.error("Error fetching weather:", error);
      throw error;
    }
  }
  async function updateWalkabilityScore(lat, lon) {
    const year = new Date().getFullYear()-1; // Use the previous year for the score calculation
    try {
        const score = await calculateScore(lat, lon, year);
        const walkabilityScoreElement = document.getElementById('walkabilityScore');
        if (walkabilityScoreElement) {
            walkabilityScoreElement.textContent = 'Score: ' + score;
        }
    } catch (error) {
        console.error('Error calculating walkability score:', error);
    }
}
  
  function parseCurrentWeather({ current_weather, daily }) {
    const {
      temperature: currentTemp,
      windspeed: windSpeed,
      weathercode: iconCode,
    } = current_weather;
    
    const {
      temperature_2m_max: [maxTemp],
      temperature_2m_min: [minTemp],
      apparent_temperature_max: [maxFeelsLike],
      apparent_temperature_min: [minFeelsLike],
      precipitation_sum: [precip],
    } = daily;

    return {
      currentTemp: Math.round(currentTemp),
      highTemp: Math.round(maxTemp),
      lowTemp: Math.round(minTemp),
      highFeelsLike: Math.round(maxFeelsLike),
      lowFeelsLike: Math.round(minFeelsLike),
      windSpeed: Math.round(windSpeed),
      precip: Math.round(precip * 100) / 100,
      iconCode,
    };
  }

  function parseDailyWeather({ daily }) {
    return daily.time.map((time, index) => {
      return {
        timestamp: time * 1000,
        iconCode: daily.weathercode[index],
        maxTemp: Math.round(daily.temperature_2m_max[index]),
      };
    });
  }

  function parseHourlyWeather({ hourly, current_weather }) {
    return hourly.time
      .map((time, index) => {
        return {
          timestamp: time * 1000,
          iconCode: hourly.weathercode[index],
          temp: Math.round(hourly.temperature_2m[index]),
          feelsLike: Math.round(hourly.apparent_temperature[index]),
          windSpeed: Math.round(hourly.windspeed_10m[index]),
          precip: Math.round(hourly.precipitation[index] * 100) / 100,
        };
      })
      .filter(({ timestamp }) => timestamp >= current_weather.time * 1000);
  }

      // useful helper functions for looks and stuff  
      // ------------------------------------------------
      
      // date formatters for day and hour
      const DAY_FORMATTER = new Intl.DateTimeFormat(undefined, { weekday: "long" });
      const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
      const HOUR_FORMATTER = new Intl.DateTimeFormat(undefined, { hour: "numeric" });
      
      // helper function to check if two timestamps are on the same day
      function isSameDay(timestamp1, timestamp2) {
        const date1 = new Date(timestamp1);
        const date2 = new Date(timestamp2);
        return date1.getDate() === date2.getDate() && 
               date1.getMonth() === date2.getMonth() && 
               date1.getFullYear() === date2.getFullYear();
      }
      
      // function to filter hourly data for a specific day
      function filterHourlyDataForDay(hourlyData, dayTimestamp) {
        return hourlyData.filter(hour => isSameDay(hour.timestamp, dayTimestamp));
      }

 // Add these functions to main.js after your other helper functions

// Update loading message
function updateLoadingMessage(message) {
  const loadingMessage = document.getElementById('loadingMessage');
  if (loadingMessage) {
    loadingMessage.textContent = message;
  }
}

// Show/hide loading overlay
function showLoading() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
    loadingOverlay.style.display = 'flex';
  }
  // Remove the blur class since we're using the overlay instead
  document.body.classList.remove("blurred");
}

function hideLoading() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
    loadingOverlay.style.display = 'none';
  }
}

      // the big logic stuff that acutally looks for the weather (and hopefully more to display later)
      // ------------------------------------------------
      
      function positionSuccess({ coords }) {
        console.log("Location obtained:", coords.latitude, coords.longitude);
        updateWalkabilityScore(coords.latitude, coords.longitude);
        getWeather(
          coords.latitude,
          coords.longitude,
          Intl.DateTimeFormat().resolvedOptions().timeZone
        )
          .then(renderWeather)
          .catch(e => {
            console.error("Error rendering weather:", e);
            hideLoading();
            alert("Error getting weather: " + e.message);
          });
      }
      

      function positionError(error) {
        function positionError(error) {
          console.error("Geolocation error:", error ? error.message : "Unknown error");
          hideLoading();
          alert(
            "There was an error getting your location. Please allow us to use your location and refresh the page."
          );
        }
      }

      function renderWeather({ current, daily, hourly }) {
        console.log("Rendering weather data");
        // store the hourly data globally
        allHourlyData = hourly;
        
        renderCurrentWeather(current);
        renderDailyWeather(daily);
        
        // set the first day as selected by default
        if (daily && daily.length > 0) {
          selectedDayTimestamp = daily[0].timestamp;
          const todayFormatted = `${DAY_FORMATTER.format(selectedDayTimestamp)} (${DATE_FORMATTER.format(selectedDayTimestamp)})`;
          selectedDayElement.textContent = `${todayFormatted}'s Hourly Forecast`;
          
          // filter hourly data for the selected day
          const filteredHourly = filterHourlyDataForDay(hourly, selectedDayTimestamp);
          renderHourlyWeather(filteredHourly);
        }
        
        document.body.classList.remove("blurred");
        hideLoading();
      }
    

      function setValue(selector, value, { parent = document } = {}) {
        const element = parent.querySelector(`[data-${selector}]`);
        if (element) {
          element.textContent = value;
        } else {
          console.warn(`Element with data-${selector} not found`);
        }
      }

      function getIconUrl(iconCode) {
        const iconName = ICON_MAP.get(iconCode) || "cloud"; // default to cloud if weather code id thingy is not found
        return `icons/${iconName}.svg`;
      }

      const currentIcon = document.querySelector("[data-current-icon]");
      function renderCurrentWeather(current) {
        console.log("Rendering current weather");
        if (currentIcon) {
          currentIcon.src = getIconUrl(current.iconCode);
        } else {
          console.warn("Current icon element not found");
        }
        setValue("current-temp", current.currentTemp);
        setValue("current-high", current.highTemp);
        setValue("current-low", current.lowTemp);
        setValue("current-fl-high", current.highFeelsLike);
        setValue("current-fl-low", current.lowFeelsLike);
        setValue("current-wind", current.windSpeed);
        setValue("current-precip", current.precip);
      }

      const dailySection = document.querySelector("[data-day-section]");
      const dayCardTemplate = document.getElementById("day-card-template");
      
      function renderDailyWeather(daily) {
        console.log("Rendering daily weather");
        if (!dailySection || !dayCardTemplate) {
          console.warn("Daily section or template not found");
          return;
        }
        
        dailySection.innerHTML = "";
        daily.forEach((day, index) => {
          const element = dayCardTemplate.content.cloneNode(true);
          
          // this is just nice to have as to add timestamp attribute to each card
          const dayCard = element.querySelector(".day-card");
          dayCard.setAttribute("data-day-timestamp", day.timestamp);
        
          // add selected class to the first day by default
          if (index === 0) {
            dayCard.classList.add("selected");
          }
          
          setValue("temp", day.maxTemp, { parent: element });
          
          // format the date differently for today and future days
          const today = new Date();
          const dayDate = new Date(day.timestamp);
          let dateText = "";
          
          if (isSameDay(today, dayDate)) {
            dateText = "Today";
          } else {
            dateText = DAY_FORMATTER.format(day.timestamp);
          }
          
          setValue("date", dateText, { parent: element });
          
          const iconImg = element.querySelector("[data-icon]");
          if (iconImg) {
            iconImg.src = getIconUrl(day.iconCode);
          }
          
          // when clicked it will update the hourly forecast for the selected day
          dayCard.addEventListener("click", function() {
            // this will remove selected class from all cards
            document.querySelectorAll(".day-card").forEach(card => {
              card.classList.remove("selected");
            });
            
            // add selected 'day' class to clicked card
            this.classList.add("selected");
            
            // get the timestamp from the clicked card
            const timestamp = parseInt(this.getAttribute("data-day-timestamp"));
            selectedDayTimestamp = timestamp;
            
            // update the day title
            const dayFormatted = DAY_FORMATTER.format(timestamp);
            const dateFormatted = DATE_FORMATTER.format(timestamp);
            selectedDayElement.textContent = `${dayFormatted} (${dateFormatted})'s Hourly Forecast`;
            
            // filter and render hourly data for the selected day just to not have it look ugly
            const filteredHourly = filterHourlyDataForDay(allHourlyData, timestamp);
            renderHourlyWeather(filteredHourly);
          });
          
          dailySection.append(element);
        });
      }

      const hourlySection = document.querySelector("[data-hour-section]");
      const hourRowTemplate = document.getElementById("hour-row-template");
      
      function renderHourlyWeather(hourly) {
        console.log("Rendering hourly weather for selected day");
        if (!hourlySection || !hourRowTemplate) {
          console.warn("Hourly section or template not found");
          return;
        }
        
        hourlySection.innerHTML = "";
        
        if (hourly.length === 0) {
          hourlySection.innerHTML = "<tr><td colspan='6' style='text-align:center;padding:20px;'>No hourly data available for this day</td></tr>";
          return;
        }
        
        hourly.forEach(hour => {
          const element = hourRowTemplate.content.cloneNode(true);
          setValue("temp", hour.temp, { parent: element });
          setValue("fl-temp", hour.feelsLike, { parent: element });
          setValue("wind", hour.windSpeed, { parent: element });
          setValue("precip", hour.precip, { parent: element });
          setValue("day", DAY_FORMATTER.format(hour.timestamp), { parent: element });
          setValue("time", HOUR_FORMATTER.format(hour.timestamp), { parent: element });
          
          const iconImg = element.querySelector("[data-icon]");
          if (iconImg) {
            iconImg.src = getIconUrl(hour.iconCode);
          }
          
          hourlySection.append(element);
        });
      }
  
      showLoading();
      updateLoadingMessage("Getting your location...");
      // our website now begins the app by requesting geolocation
      console.log("Requesting geolocation...");
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          positionSuccess,
          positionError,
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        console.error("Geolocation not supported by this browser");
        hideLoading();
        alert("Geolocation is not supported by your browser");
      }
      
      // TEMPORARY: adding a search functionality that still kinda works
      const searchButton = document.getElementById("searchButton");
      const searchInput = document.getElementById("searchInput");
      
      if (searchButton && searchInput) {
        const apiKey = "8ef9024cc83f4b8c8dfafc430277447f";
        
        searchButton.addEventListener("click", async () => {
          const address = searchInput.value;
          if (!address) {
            alert("Please enter an address");
            return;
          }
          showLoading();
          updateLoadingMessage(`Searching for "${address}"...`);
          try {
            const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&apiKey=${apiKey}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.features && data.features.length > 0) {
              const { lat, lon } = data.features[0].properties;
              console.log(`Found coordinates for "${address}": ${lat}, ${lon}`);
              updateWalkabilityScore(lat, lon);
              getWeather(
                lat,
                lon,
                Intl.DateTimeFormat().resolvedOptions().timeZone
              )
                .then(renderWeather)
                .catch(e => {
                  console.error("Error rendering weather:", e);
                  alert("Error getting weather: " + e.message);
                });
            } else {
              alert("Address not found. Please try a different search term.");
            }
          } catch (error) {
            console.error("Error searching address:", error);
            hideLoading();
            alert("Error searching for address. Please try again.");
          }
        });
        
        
        // this just allows you to press Enter in the search input
        searchInput.addEventListener("keypress", function(event) {
          if (event.key === "Enter") {
            searchButton.click();
          }
        });
      }
      // TEMP: adding a geolocation button functionality
const geolocateButton = document.getElementById("geolocateButton");
if (geolocateButton) {
  geolocateButton.addEventListener("click", function() {
    // showing the overlay and loading message
    showLoading();
    updateLoadingMessage("Getting your location...");
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        positionSuccess,
        positionError,
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      console.error("Geolocation not supported by this browser");
      hideLoading();
      alert("Geolocation is not supported by your browser");
    }
  });
}
  
}