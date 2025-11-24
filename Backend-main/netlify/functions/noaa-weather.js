/**
 * Netlify Function for NOAA extreme weather data
 * Replaces NOAAadverseweather/noaaService.js Express service
 */
const axios = require('axios');

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

  // Allow GET and POST
  if (!['GET', 'POST'].includes(event.httpMethod)) {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
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

    // Get parameters from query string or body
    let stationId, year, lat, lng;

    if (event.httpMethod === 'GET') {
      stationId = event.queryStringParameters?.stationId;
      year = event.queryStringParameters?.year || new Date().getFullYear() - 1;
      lat = event.queryStringParameters?.lat;
      lng = event.queryStringParameters?.lng;
    } else {
      const body = JSON.parse(event.body || '{}');
      stationId = body.stationId;
      year = body.year || new Date().getFullYear() - 1;
      lat = body.lat;
      lng = body.lng;
    }

    // If lat/lng provided but no stationId, find nearest station
    if ((lat && lng) && !stationId) {
      try {
        const stationResponse = await axios.get(`${BASE_URL}/stations`, {
          headers: { token: NOAA_TOKEN },
          params: {
            datasetid: 'GSOY',
            extent: `${lat - 0.5},${lng - 0.5},${lat + 0.5},${lng + 0.5}`,
            sortfield: 'mindate',
            sortorder: 'desc',
            limit: 1,
          },
        });

        stationId = stationResponse.data?.results?.[0]?.id;

        if (!stationId) {
          return {
            statusCode: 404,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ error: 'No weather station found for the given coordinates' }),
          };
        }
      } catch (error) {
        return {
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ error: `Could not find weather station: ${error.message}` }),
        };
      }
    }

    if (!stationId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Station ID or coordinates (lat/lng) required' }),
      };
    }

    // Fetch GSOY data
    const response = await axios.get(`${BASE_URL}/data`, {
      headers: { token: NOAA_TOKEN },
      params: {
        datasetid: 'GSOY',
        stationid: stationId,
        startdate: `${year}-01-01`,
        enddate: `${year}-12-31`,
        datatypeid: 'DYTS,DSNW,DX90,WSFG', // Thunderstorms, Snow, Heat, Wind
        limit: 1000,
      },
    });

    if (!response.data?.results?.length) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'No GSOY data found for specified parameters' }),
      };
    }

    // Process results into event counts
    const events = {
      storms: 0,
      snowDays: 0,
      heatwaveDays: 0,
      highWindDays: 0,
    };

    response.data.results.forEach(record => {
      switch (record.datatype) {
        case 'DYTS': // Days with thunderstorms
          events.storms = record.value;
          break;
        case 'DSNW': // Days with snowfall ≥1"
          events.snowDays = record.value;
          break;
        case 'DX90': // Days with max temp ≥90°F
          events.heatwaveDays = record.value;
          break;
        case 'WSFG': // Peak wind gust speed
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
  } catch (error) {
    console.error('NOAA API error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Failed to get extreme weather data',
        message: error.message,
      }),
    };
  }
};

