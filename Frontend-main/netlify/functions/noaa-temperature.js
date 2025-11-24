/**
 * Netlify Function to fetch average temperature data from NOAA API
 * Falls back to Open-Meteo if NOAA is unavailable
 */
exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { lat, lng, year } = event.queryStringParameters || {};
    
    if (!lat || !lng || !year) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Missing required parameters: lat, lng, year' }),
      };
    }

    const NOAA_TOKEN = process.env.NOAA_API_TOKEN;
    const BASE_URL = 'https://www.ncei.noaa.gov/cdo-web/api/v2';

    // Try NOAA first
    if (NOAA_TOKEN) {
      try {
        // Find nearest stations
        const stationsResponse = await fetch(
          `${BASE_URL}/stations?datatypeid=TAVG&extent=${lat - 1},${lng - 1},${lat + 1},${lng + 1}&sortfield=datacoverage&sortorder=desc&limit=10`,
          {
            headers: { token: NOAA_TOKEN },
          }
        );

        if (stationsResponse.ok) {
          const stationsData = await stationsResponse.json();
          const stationIds = stationsData.results?.map(station => station.id) || [];

          for (const stationId of stationIds) {
            try {
              const dataResponse = await fetch(
                `${BASE_URL}/data?datasetid=GSOM&stationid=${stationId}&startdate=${year}-01-01&enddate=${year}-12-31&datatypeid=TAVG&limit=10`,
                {
                  headers: { token: NOAA_TOKEN },
                }
              );

              if (dataResponse.ok) {
                const data = await dataResponse.json();

                if (data.results?.length) {
                  const totalTemp = data.results.reduce((sum, record) => sum + record.value, 0);
                  const averageTemperature = totalTemp / data.results.length;

                  return {
                    statusCode: 200,
                    headers: {
                      'Access-Control-Allow-Origin': '*',
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      year,
                      stationId,
                      averageTemperature,
                      metadata: {
                        source: 'NOAA GSOM',
                        units: 'tenths of degrees Celsius',
                      },
                    }),
                  };
                }
              }
            } catch (error) {
              console.warn(`Failed to fetch data for station ${stationId}:`, error);
              continue;
            }
          }
        }
      } catch (error) {
        console.warn('NOAA API failed, falling back to Open-Meteo:', error);
      }
    }

    // Fallback to Open-Meteo historical data
    try {
      const openMeteoResponse = await fetch(
        `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${year}-01-01&end_date=${year}-12-31&daily=temperature_2m_mean&temperature_unit=celsius`
      );

      if (openMeteoResponse.ok) {
        const data = await openMeteoResponse.json();
        const temperatures = data.daily?.temperature_2m_mean || [];
        
        if (temperatures.length > 0) {
          const totalTemp = temperatures.reduce((sum, temp) => sum + (temp || 0), 0);
          const averageTemperature = (totalTemp / temperatures.length) * 10; // Convert to tenths of degrees

          return {
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              year,
              averageTemperature,
              metadata: {
                source: 'Open-Meteo Archive (fallback)',
                units: 'tenths of degrees Celsius',
              },
            }),
          };
        }
      }
    } catch (error) {
      console.error('Open-Meteo fallback also failed:', error);
    }

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Unable to fetch temperature data from any source' }),
    };
  } catch (error) {
    console.error('Error fetching temperature data:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};

