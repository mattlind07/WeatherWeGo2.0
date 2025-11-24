import { getFIPSCode } from './fipsService.js';

/**
 * Fetches 2025 Fair Market Rent (FMR) data for a given latitude and longitude.
 * The FMR data includes rent estimates for one-bedroom and two-bedroom units.
 * 
 * @param {number} lat - Latitude of the location
 * @param {number} long - Longitude of the location
 * @returns {Promise<{oneBedroom: number, twoBedroom: number, areaName: string, year: string}>} 
 *          - An object containing FMR data or throws an error if the data cannot be retrieved.
 */
export async function getFmr(lat, long) {
  try {
    // Step 1: Fetch the FIPS code for the given latitude and longitude
    const fipsCode = await getFIPSCode(lat, long);
    if (!fipsCode) {
      throw new Error("Failed to retrieve FIPS code."); // Handle missing FIPS code
    }

    // Validate that the FIPS code is a 10-digit number
    if (!/^\d{10}$/.test(fipsCode)) {
      throw new Error('Invalid FIPS: Must be a 10-digit number (e.g., "0801499999")');
    }

    console.log("Using FIPS Code:", fipsCode); // Debugging log to verify the FIPS code

    // Step 2: Use Netlify Function to fetch FMR data (hides API token)
    const fmrEndpoint = window.APP_CONFIG?.API_ENDPOINTS?.FMR || '/api/fmr';
    const response = await fetch(
      `${fmrEndpoint}?fipsCode=${fipsCode}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Step 3: Parse the API response
    const data = await response.json();
    console.log("HUD API Response:", data); // Debugging log to inspect the API response

    // Check if the response is successful
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`); // Handle HTTP errors
    }

    // Validate the structure of the API response
    if (!data?.data?.basicdata?.['One-Bedroom']) {
      throw new Error('Unexpected API response format'); // Handle unexpected response structure
    }

    // Step 4: Extract and return the FMR data
    return {
      oneBedroom: data.data.basicdata['One-Bedroom'], // Rent for a one-bedroom unit
      twoBedroom: data.data.basicdata['Two-Bedroom'], // Rent for a two-bedroom unit
      areaName: data.data.area_name, // Name of the geographic area (used during debugging)
      year: data.data.basicdata.year // Year of the FMR data (used during debugging)
    };
  } catch (error) {
    // Handle any errors that occur during the process
    console.error('Error fetching FMR data:', error.message);
    throw error; // Rethrow the error for further handling (if needed)
  }
}




