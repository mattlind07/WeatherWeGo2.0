

const NOAA_TOKEN = 'bjzcboLuniRNMSaAPoBlhiVZlLCCBQyF'; // Replace with your NOAA API token
const BASE_URL = 'https://www.ncei.noaa.gov/cdo-web/api/v2';

/**
 * Get extreme weather event counts from GSOY data
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} year - Year in YYYY format
 * @returns {Promise<Object>} Extreme weather counts
 */
export async function getExtremeWeather(lat, lng, year) {
  const TIME_LIMIT_MS = 60000; // 1 minute time limit in milliseconds
  const startTime = Date.now();

  try {
    // Find the nearest stations
    const nearestStations = await findNearestStations(lat, lng, year);
    console.log(`Found nearest stations: ${nearestStations}`);

    for (const stationId of nearestStations) {
      // Check if the time limit has been exceeded
      if (Date.now() - startTime > TIME_LIMIT_MS) {
        throw new Error('Time limit exceeded while searching for weather data');
      }

      try {
        // Fetch GSOY data for the specified year
        const response = await fetchWithRetry(() =>
          fetch(`${BASE_URL}/data?datasetid=GSOY&stationid=${stationId}&startdate=${year}-01-01&enddate=${year}-12-31&datatypeid=DYTS,DSNW,DX90,WSFG&limit=10`, {
            headers: { token: NOAA_TOKEN },
          })
        );

        const data = await response.json();

        if (!data.results?.length) {
          console.warn(`No data found for station: ${stationId}`);
          continue; // Try the next station
        }

        // Process results into event counts
        const events = {
          storms: 0,
          snowDays: 0,
          heatwaveDays: 0,
          highWindDays: 0,
        };

        data.results.forEach(record => {
          switch (record.datatype) {
            case 'DYTS': // Days with thunderstorms
              events.storms += record.value;
              break;
            case 'DSNW': // Days with snowfall ≥1"
              events.snowDays += record.value;
              break;
            case 'DX90': // Days with max temp ≥90°F
              events.heatwaveDays += record.value;
              break;
            case 'WSFG': // Peak wind gust speed
              if (record.value >= 35) events.highWindDays++; // Count days with wind gusts ≥35 mph
              break;
          }
        });

        // Return the data if successfully processed
        return {
          year,
          stationId,
          events,
          metadata: {
            source: 'NOAA GSOY',
            units: {
              storms: 'days',
              snowDays: 'days',
              heatwaveDays: 'days',
              highWindDays: 'days ≥35 mph',
            },
          },
        };
      } catch (error) {
        console.warn(`Failed to fetch data for station ${stationId}: ${error.message}`);
        // Continue to the next station if an error occurs
      }
    }

    // If no data is found for any station
    throw new Error('No GSOY data found for any nearby stations');
  } catch (error) {
    console.error('Failed to fetch extreme weather data:', error.message);
    throw error;
  }
}

/**
 * Find the nearest stations with GSOY data
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string[]>} Array of GSOY station IDs
 */
export async function findNearestStations(lat, lng) {
  try {
    const response = await fetchWithRetry(() =>
      fetch(`${BASE_URL}/stations?datatypeid=DYTS,DSNW,DX90,WSFG&datasetid=GSOY&extent=${lat - 1},${lng - 1},${lat + 1},${lng + 1}&sortfield=datacoverage&sortorder=desc&limit=10`, {
        headers: { token: NOAA_TOKEN },
      })
    );

    const data = await response.json();

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
 * Fetch data with retry mechanism and simple 429 error handling
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
        console.warn(`Rate limit exceeded. Retrying after 1 second (Attempt ${attempt + 1}/${retries})...`);
        await sleep(1000); // Wait 1 second before retrying
      } else {
        throw error; // Rethrow if not a 429 or retries are exhausted
      }
    }
  }
  throw new Error(`Failed to fetch after ${retries} retries`);
}

/**
 * Sleep for a specified number of milliseconds
 * @param {number} ms - Number of milliseconds to sleep
 * @returns {Promise<void>} A promise that resolves after the specified delay
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



