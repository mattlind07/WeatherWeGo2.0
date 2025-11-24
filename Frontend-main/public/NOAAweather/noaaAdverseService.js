/**
 * Get extreme weather event counts - Now uses Netlify Functions
 * Falls back to alternative APIs if NOAA is unavailable
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} year - Year in YYYY format
 * @returns {Promise<Object>} Extreme weather counts
 */
export async function getExtremeWeather(lat, lng, year) {
  try {
    // Try Netlify Function first (which uses NOAA)
    const netlifyFunctionUrl = `/api/noaa-adverse-weather?lat=${lat}&lng=${lng}&year=${year}`;
    
    try {
      const response = await fetch(netlifyFunctionUrl);
      
      if (response.ok) {
        const data = await response.json();
        return {
          year,
          stationId: data.stationId,
          events: data.events,
          metadata: data.metadata,
        };
      }
    } catch (error) {
      console.warn('Netlify Function failed, trying fallback:', error);
    }

    // Fallback: Use Open-Meteo for basic weather data
    // Note: Open-Meteo doesn't have the same granular extreme weather data,
    // but we can estimate based on temperature and precipitation
    const fallbackResponse = await fetch(
      `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${year}-01-01&end_date=${year}-12-31&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&temperature_unit=celsius`
    );

    if (fallbackResponse.ok) {
      const data = await fallbackResponse.json();
      const maxTemps = data.daily?.temperature_2m_max || [];
      const precip = data.daily?.precipitation_sum || [];

      // Estimate extreme weather events
      const events = {
        storms: Math.floor(precip.filter(p => p > 20).length / 10), // Heavy rain days
        snowDays: 0, // Would need additional data
        heatwaveDays: maxTemps.filter(t => t >= 32.2).length, // Days ≥90°F (32.2°C)
        highWindDays: 0, // Would need additional data
      };

      return {
        year,
        events,
        metadata: {
          source: 'Open-Meteo Archive (fallback)',
          units: {
            storms: 'estimated days',
            snowDays: 'days',
            heatwaveDays: 'days',
            highWindDays: 'days',
          },
        },
      };
    }

    throw new Error('Unable to fetch extreme weather data from any source');
  } catch (error) {
    console.error('Failed to fetch extreme weather data:', error.message);
    // Return default values to prevent app crash
    return {
      year,
      events: {
        storms: 0,
        snowDays: 0,
        heatwaveDays: 0,
        highWindDays: 0,
      },
      metadata: {
        source: 'Default (no data available)',
      },
    };
  }
}
