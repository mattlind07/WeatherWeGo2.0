const fetch = require('node-fetch');
require('dotenv').config();

/**
 * Fetches 2025 FMR data by FIPS code
 * @param {string} fipsCode - 10-digit HUD FIPS (e.g., "0801499999")- check with chuck/ZOE to see if thye have fips yet
 * @returns {Promise<{oneBedroom: number, twoBedroom: number, areaName: string, year: string}>}
 */
async function getFmrByFips(fipsCode) {
  if (!/^\d{10}$/.test(fipsCode)) {
    throw new Error('Invalid FIPS: Must be 10 digits (e.g., "0801499999")');
  }

  const response = await fetch(
    `https://www.huduser.gov/hudapi/public/fmr/data/${fipsCode}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.HUD_API_KEY}`
      }
    }
  );

  const data = await response.json();
  
  // Debug: Uncomment to see full response
  // console.log('API Response:', JSON.stringify(data, null, 2));

  if (!response.ok) {
    throw new Error(data.message || `HTTP ${response.status}`);
  }

  if (!data?.data?.basicdata?.['One-Bedroom']) {
    throw new Error('Unexpected API response format');
  }

  return {
    oneBedroom: data.data.basicdata['One-Bedroom'],
    twoBedroom: data.data.basicdata['Two-Bedroom'],
    areaName: data.data.area_name,
    year: data.data.basicdata.year
  };
}

// Test with Broomfield County, CO (2025 data) *this is just for vscode testing purposes**
(async () => {
  try {
    const fmr = await getFmrByFips('0801499999'); // Example FIPS
    console.log(`${fmr.areaName} (${fmr.year})`);
    console.log(`1-Bedroom: $${fmr.oneBedroom}`);
    console.log(`2-Bedroom: $${fmr.twoBedroom}`);
  } catch (error) {
    console.error('Error:', error.message);
  }
})();

module.exports = { getFmrByFips };