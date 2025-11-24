/**
 * Get average temperature data - Now uses Netlify Functions
 * Falls back to Open-Meteo if NOAA is unavailable
 * @param {number} lat - Latitude of the location
 * @param {number} lng - Longitude of the location
 * @param {number} year - Year for which the temperature data is required
 * @returns {Promise<Object>} Average temperature data
 */
export async function getAverageTemperature(lat, lng, year) {
  try {
    // Try Netlify Function first (which uses NOAA with Open-Meteo fallback)
    const netlifyFunctionUrl = `/api/noaa-temperature?lat=${lat}&lng=${lng}&year=${year}`;
    
    try {
      const response = await fetch(netlifyFunctionUrl);
      
      if (response.ok) {
        const data = await response.json();
        return {
          year,
          stationId: data.stationId,
          averageTemperature: data.averageTemperature,
          metadata: data.metadata,
        };
      }
    } catch (error) {
      console.warn('Netlify Function failed, trying direct fallback:', error);
    }

    // Direct fallback to Open-Meteo if Netlify Function fails
    const fallbackResponse = await fetch(
      `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${year}-01-01&end_date=${year}-12-31&daily=temperature_2m_mean&temperature_unit=celsius`
    );

    if (fallbackResponse.ok) {
      const data = await fallbackResponse.json();
      const temperatures = data.daily?.temperature_2m_mean || [];
      
      if (temperatures.length > 0) {
        const totalTemp = temperatures.reduce((sum, temp) => sum + (temp || 0), 0);
        const averageTemperature = (totalTemp / temperatures.length) * 10; // Convert to tenths of degrees

        return {
          year,
          averageTemperature,
          metadata: {
            source: 'Open-Meteo Archive (direct fallback)',
            units: 'tenths of degrees Celsius',
          },
        };
      }
    }

    throw new Error('Unable to fetch temperature data from any source');
  } catch (error) {
    console.error('Failed to fetch average temperature data:', error.message);
    // Return a default value to prevent app crash
    // Use a reasonable default based on latitude
    const defaultTemp = lat > 0 ? 15 * 10 : 10 * 10; // 15°C for northern hemisphere, 10°C for southern
    return {
      year,
      averageTemperature: defaultTemp,
      metadata: {
        source: 'Default (no data available)',
        units: 'tenths of degrees Celsius',
      },
    };
  }
}
