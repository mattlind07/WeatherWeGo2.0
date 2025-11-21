
// NOAA API token and base URL
const NOAA_TOKEN = 'bjzcboLuniRNMSaAPoBlhiVZlLCCBQyF'; // Replace with your NOAA API token
const BASE_URL = 'https://www.ncei.noaa.gov/cdo-web/api/v2';

/**
 * Get average temperature (TAVG) data from GSOM
 * @param {number} lat - Latitude of the location
 * @param {number} lng - Longitude of the location
 * @param {number} year - Year for which the temperature data is required
 * @returns {Promise<Object>} Average temperature data
 */
export async function getAverageTemperature(lat, lng, year) {
  const TIME_LIMIT_MS = 60000; // 1 minute time limit for the operation
  const startTime = Date.now(); // Start time to track the time limit

  try {
    // Find the nearest stations that support TAVG (average temperature)
    const nearestStations = await findNearestStations(lat, lng);
    console.log(`Found nearest stations: ${nearestStations}`);

    // Iterate through the nearest stations to fetch temperature data
    for (const stationId of nearestStations) {
      // Check if the time limit has been exceeded
      if (Date.now() - startTime > TIME_LIMIT_MS) {
        throw new Error('Time limit exceeded while searching for temperature data');
      }

      try {
        // Fetch GSOM (Global Summary of the Month) data for the specified year
        const response = await fetchWithRetry(() =>
          fetch(`${BASE_URL}/data?datasetid=GSOM&stationid=${stationId}&startdate=${year}-01-01&enddate=${year}-12-31&datatypeid=TAVG&limit=10`, {
            headers: { token: NOAA_TOKEN },
          })
        );

        const data = await response.json();

        // Check if the response contains valid results
        if (!data.results?.length) {
          console.warn(`No TAVG data found for station: ${stationId}`);
          continue; // Try the next station
        }

        // Calculate the average temperature from the results
        const totalTemperature = data.results.reduce((sum, record) => sum + record.value, 0);
        const averageTemperature = totalTemperature / data.results.length;

        // Return the processed data
        return {
          year,
          stationId,
          averageTemperature,
          metadata: {
            source: 'NOAA GSOM',
            units: 'tenths of degrees Celsius',
          },
        };
      } catch (error) {
        console.warn(`Failed to fetch data for station ${stationId}: ${error.message}`);
        // Continue to the next station
      }
    }

    // If no data is found for any station, throw an error
    throw new Error('No TAVG data found for any nearby stations');
  } catch (error) {
    console.error('Failed to fetch average temperature data:', error.message);
    throw error;
  }
}

/**
 * Retry logic with a fixed 100 ms delay for API requests after a 429 error
 * @param {Function} requestFn - The request function to execute
 * @param {number} retries - Number of retries (default: 3)
 * @returns {Promise<any>} The response from the request
 */
async function fetchWithRetry(requestFn, retries = 3) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await requestFn();
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response;
    } catch (error) {
      if (error.message.includes('429') && attempt < retries) {
        console.warn(`Rate limit exceeded. Retrying after 100 ms (Attempt ${attempt + 1}/${retries})...`);
        await sleep(100); // Wait 100 ms before retrying
      } else {
        throw error; // Rethrow the error if not a 429 or retries are exhausted
      }
    }
  }
  throw new Error(`Failed to fetch after ${retries} retries`);
}

/**
 * Find the nearest stations with specific data types
 * @param {number} lat - Latitude of the location
 * @param {number} lng - Longitude of the location
 * @returns {Promise<string[]>} Array of station IDs
 */
export async function findNearestStations(lat, lng) {
  try {
    // Validate latitude and longitude values
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new Error('Invalid latitude or longitude values');
    }

    // Construct the query parameters for the API request
    const url = `${BASE_URL}/stations?datatypeid=TAVG&extent=${lat - 1},${lng - 1},${lat + 1},${lng + 1}&sortfield=datacoverage&sortorder=desc&limit=10`;

    // Make the API request to fetch station data
    const response = await fetchWithRetry(() =>
      fetch(url, {
        headers: { token: NOAA_TOKEN },
      })
    );

    const data = await response.json();

    // Check if the response contains valid results
    if (!data.results?.length) {
      throw new Error('No stations found in the region');
    }

    // Return an array of station IDs
    return data.results.map(station => station.id);
  } catch (error) {
    console.error('Failed to find nearest stations:', error.message);
    throw new Error(`Could not find nearest weather stations: ${error.message}`);
  }
}

/**
 * Sleep for a specified number of milliseconds
 * @param {number} ms - Number of milliseconds to sleep
 * @returns {Promise<void>} A promise that resolves after the specified delay
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


