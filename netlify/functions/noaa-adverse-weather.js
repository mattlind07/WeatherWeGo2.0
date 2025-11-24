/**
 * Netlify Function to fetch adverse weather data from NOAA API
 * This hides the API token and handles CORS properly
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

  // Only allow GET requests
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

    if (!NOAA_TOKEN) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'NOAA API token not configured' }),
      };
    }

    // Find nearest stations
    const stationsResponse = await fetch(
      `${BASE_URL}/stations?datatypeid=DYTS,DSNW,DX90,WSFG&datasetid=GSOY&extent=${lat - 1},${lng - 1},${lat + 1},${lng + 1}&sortfield=datacoverage&sortorder=desc&limit=10`,
      {
        headers: { token: NOAA_TOKEN },
      }
    );

    if (!stationsResponse.ok) {
      throw new Error(`NOAA API error: ${stationsResponse.status}`);
    }

    const stationsData = await stationsResponse.json();
    const stationIds = stationsData.results?.map(station => station.id) || [];

    if (stationIds.length === 0) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'No stations found in the region' }),
      };
    }

    // Try to fetch data from the first available station
    let events = {
      storms: 0,
      snowDays: 0,
      heatwaveDays: 0,
      highWindDays: 0,
    };

    for (const stationId of stationIds) {
      try {
        const dataResponse = await fetch(
          `${BASE_URL}/data?datasetid=GSOY&stationid=${stationId}&startdate=${year}-01-01&enddate=${year}-12-31&datatypeid=DYTS,DSNW,DX90,WSFG&limit=10`,
          {
            headers: { token: NOAA_TOKEN },
          }
        );

        if (!dataResponse.ok) continue;

        const data = await dataResponse.json();

        if (data.results?.length) {
          data.results.forEach(record => {
            switch (record.datatype) {
              case 'DYTS':
                events.storms += record.value;
                break;
              case 'DSNW':
                events.snowDays += record.value;
                break;
              case 'DX90':
                events.heatwaveDays += record.value;
                break;
              case 'WSFG':
                if (record.value >= 35) events.highWindDays++;
                break;
            }
          });

          return {
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
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
            }),
          };
        }
      } catch (error) {
        console.warn(`Failed to fetch data for station ${stationId}:`, error);
        continue;
      }
    }

    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'No GSOY data found for any nearby stations' }),
    };
  } catch (error) {
    console.error('Error fetching adverse weather data:', error);
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

