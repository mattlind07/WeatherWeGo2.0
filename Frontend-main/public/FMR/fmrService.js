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

    // Step 2: Make an API request to the HUD FMR API using the FIPS code
    const response = await fetch(
      `https://www.huduser.gov/hudapi/public/fmr/data/${fipsCode}`,
      {
        headers: {
          // Authorization header with the API key 
          Authorization: `Bearer ${'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI2IiwianRpIjoiYzA1YWVmZmUwNmIyN2UxNzJlMWZiZjYxOTlkYzEyZGYwZTE4YWFjZTUxODI5NGE4YTU1ZTY5N2EzYzQ0MjcwMDhlMWRhYjJjNDlhZmZkNGEiLCJpYXQiOjE3NDY0MDI0NTEuMDQyMTcyLCJuYmYiOjE3NDY0MDI0NTEuMDQyMTc0LCJleHAiOjIwNjE5MzUyNTEuMDM4MzA3LCJzdWIiOiI5NTUzNyIsInNjb3BlcyI6W119.e4aFQIsWS-FhEUqXtzKqGZsIF8Jmv0gXhv0uHk7a38378jil9ajbX-RTXKVaMuxDFHEe24CW0P54g_YVRfGAxg'}`, // needs to be in .env file or azure key vault
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




