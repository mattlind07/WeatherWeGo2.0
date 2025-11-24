/**
 * Netlify Function for Fair Market Rent (FMR) data
 * Replaces FMR/fmrService.js Express service
 * Uses native fetch (Node.js 18+)
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
    // Get FIPS code from query string or body
    let fipsCode;
    if (event.httpMethod === 'GET') {
      fipsCode = event.queryStringParameters?.fipsCode;
    } else {
      const body = JSON.parse(event.body || '{}');
      fipsCode = body.fipsCode;
    }

    if (!fipsCode) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'FIPS code is required' }),
      };
    }

    // Validate FIPS code format (10 digits)
    if (!/^\d{10}$/.test(fipsCode)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Invalid FIPS: Must be 10 digits (e.g., "0801499999")' }),
      };
    }

    const HUD_API_KEY = process.env.HUD_API_KEY;

    if (!HUD_API_KEY) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'HUD API key not configured' }),
      };
    }

    // Fetch FMR data from HUD API
    const response = await fetch(
      `https://www.huduser.gov/hudapi/public/fmr/data/${fipsCode}`,
      {
        headers: {
          Authorization: `Bearer ${HUD_API_KEY}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: data.message || `HTTP ${response.status}` }),
      };
    }

    if (!data?.data?.basicdata?.['One-Bedroom']) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Unexpected API response format' }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        oneBedroom: data.data.basicdata['One-Bedroom'],
        twoBedroom: data.data.basicdata['Two-Bedroom'],
        areaName: data.data.area_name,
        year: data.data.basicdata.year,
      }),
    };
  } catch (error) {
    console.error('FMR API error:', error);
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

