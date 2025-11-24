const weather = require('./noaaService.js');

// Option 1: Direct station ID lookup
weather.getExtremeWeather('GHCND:USW00014768', 2022)
  .then(data => console.log(data));

// Option 2: Coordinate-based lookup
weather.findNearestStation(43.16, -77.61)
  .then(stationId => weather.getExtremeWeather(stationId))
  .then(data => console.log(data));