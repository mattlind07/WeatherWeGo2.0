/**
 * Fetch the FIPS (Federal Information Processing Standards) code for a given latitude and longitude.
 * The FIPS code is used to identify geographic areas in this case for FMR (Fair Market Rent) data.
 * 
 * @param {number} lat - Latitude of the location
 * @param {number} lon - Longitude of the location
 * @returns {Promise<string|null>} - The 10-digit FIPS code in HUD format, or null if not found
 */
export async function getFIPSCode(lat, lon) {
  // Construct the URL for the Census Bureau's geocoding API
  const url = `https://geocoding.geo.census.gov/geocoder/geographies/coordinates?x=${lon}&y=${lat}&benchmark=Public_AR_Current&vintage=Current_Current&format=json`;

  try {
    // Make the API request
    const response = await fetch(url);
    const data = await response.json();

    // Extract geographies data from the API response
    const geographies = data.result?.geographies;

    // Check if the geographies data contains valid county information
    if (!geographies || !geographies["Counties"] || geographies["Counties"].length === 0) {
      console.error("No county data found in geographies:", geographies);
      return null; // Return null if no valid county data is found
    }

    // Extract the first county from the geographies data
    const county = geographies["Counties"][0];
    console.log("County data:", county); // Debugging log to inspect the county data

    // Ensure STATE and COUNTY codes are padded correctly
    const stateFIPS = county.STATE.padStart(2, '0'); // Ensure the state code is 2 digits
    const countyFIPS = county.COUNTY.padStart(3, '0'); // Ensure the county code is 3 digits

    // Validate the FIPS codes
    if (!stateFIPS || !countyFIPS) {
      console.error("Invalid FIPS data:", county);
      return null; // Return null if FIPS data is invalid
    }

    // Construct the 10-digit FIPS code in HUD format
    // HUD format appends '99999' to the state and county FIPS codes to create a 10-digit code (works for all counties)
    const fips10Digit = `${stateFIPS}${countyFIPS}99999`;
    console.log("Generated FIPS Code:", fips10Digit); // Debugging log to inspect the generated FIPS code

    return fips10Digit; // Return the generated FIPS code
  } catch (error) {
    // Handle any errors that occur during the API request or data processing
    console.error("Error fetching FIPS code:", error);
    return null; // Return null if an error occurs
  }
}


