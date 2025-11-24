require('dotenv').config();
const axios = require('axios');

const NOAA_TOKEN = process.env.NOAA_API_TOKEN;
const BASE_URL = 'https://www.ncei.noaa.gov/cdo-web/api/v2';

module.exports = {
  /**
   * Get extreme weather event counts from GSOY data
   * @param {string} stationId - GHCND station ID (e.g. 'GHCND:USW00014768')
   * @param {string} year - Year in YYYY format
   * @returns {Promise<Object>} Extreme weather counts
   */
  async getExtremeWeather(stationId, year = new Date().getFullYear() - 1) {
    try {
      // Fetch GSOY data for the specified year
      const response = await axios.get(`${BASE_URL}/data`, {
        headers: { 'token': NOAA_TOKEN },
        params: {
          datasetid: 'GSOY',
          stationid: stationId,
          startdate: `${year}-01-01`,
          enddate: `${year}-12-31`,
          datatypeid: 'DYTS,DSNW,DX90,WSFG', // Thunderstorms, Snow, Heat, Wind
          limit: 1000
        }
      });

      if (!response.data?.results?.length) {
        throw new Error('No GSOY data found for specified parameters');
      }

      // Process results into event counts
      const events = {
        storms: 0,
        snowDays: 0,
        heatwaveDays: 0,
        highWindDays: 0
      };

      response.data.results.forEach(record => {
        switch(record.datatype) {
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
            // Count as high wind if ≥35 mph 
            if (record.value >= 35) events.highWindDays++;
            break;
        }
      });

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
            highWindDays: 'days ≥35 mph'
          }
        }
      };

    } catch (error) {
      console.error('GSOY API Error:', {
        status: error.response?.status,
        message: error.message,
        url: error.config?.url
      });
      throw new Error(`Failed to get extreme weather data: ${error.message}`);
    }
  },

  /**
   * Find nearest station with GSOY data
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<string>} GHCND station ID
   */
  async findNearestStation(lat, lng) {
    try {
      const response = await axios.get(`${BASE_URL}/stations`, {
        headers: { 'token': NOAA_TOKEN },
        params: {
          datasetid: 'GSOY',
          extent: `${lat-0.5},${lng-0.5},${lat+0.5},${lng+0.5}`,
          sortfield: 'mindate',
          sortorder: 'desc',
          limit: 1
        }
      });

      return response.data?.results?.[0]?.id;
    } catch (error) {
      console.error('Station lookup failed:', error.message);
      throw new Error(`Could not find weather station: ${error.message}`);
    }
  }
};