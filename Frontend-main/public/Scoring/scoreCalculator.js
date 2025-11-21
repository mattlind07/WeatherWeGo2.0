// Import necessary services for fetching data
import { getFmr } from "../FMR/fmrService.js";
import { getExtremeWeather } from "../NOAAweather/noaaAdverseService.js";
import { getAverageTemperature } from "../NOAAweather/noaaTemperatureService.js";

/**
 * Calculate a 1-10 score for a location based on user preferences and weather data.
 * @param {number} lat - Latitude of the location
 * @param {number} lng - Longitude of the location
 * @param {number} year - Year for weather data
 * @returns {Promise<number>} - Final score out of 10
 */
export async function calculateScore(lat, lng, year) {
    let scale = 10; // Maximum score for each category

    // User preferences (example values, replace with actual quiz data)
    // These weights determine the user's preferences for cost and weather conditions
    let Cheap = 0, Moderate = 1, Costly = 0, Luxury = 0;
    let thunderStorm = 1, highWind = 1, snowStorm = 1, heatWave = 1, adverse = .75;
    let userCold = 0, userCool = 1, userWarm = 0, userHot = 0;

    // Average Fair Market Rent (FMR) values for different cost categories
    // let avgCheap = 500, avgModerate = 1000, avgCostly = 1500, avgLuxury = 2000;
    // let FMRlimit = 1000; // Maximum difference in rent for scaling the score

    // Temperature preferences (in degrees Celsius)
    let cold = 0, cool = 10, warm = 23, hot = 35;

    try {
        // Fetch data from external services
        // const fmr = await getFmr(lat, lng); // Fetch Fair Market Rent data
        const extremeWeather = await getExtremeWeather(lat, lng, year); // Fetch adverse weather data
        const NOAATavg = await getAverageTemperature(lat, lng, year); // Fetch average temperature data
        console.log('averageTemperature:', NOAATavg.averageTemperature);

        // Calculate the average rent from the FMR data
        // const averageRent = (fmr.oneBedroom + fmr.twoBedroom) / 2;

        // // Calculate the user's desired FMR based on their preferences
        // const totalWeight = Costly + Moderate + Cheap + Luxury;
        // const userFMR = totalWeight > 0
        //     ? (Costly * avgCheap + Moderate * avgModerate + Cheap * avgCostly + Luxury * avgLuxury) / totalWeight
        //     : 0;

        // // Calculate the FMR score (out of 10)
        // // The score decreases as the difference between userFMR and averageRent increases
        // // const difference = Math.abs(userFMR - averageRent);
        // //  const FMRscore = Math.max(0, scale - ((difference / FMRlimit) * scale));
        // // console.log('FMR Score:', FMRscore);

        // Calculate the adverse weather score (out of 10)
        // Check if the user's preferred weather condition is present in the location
        const NOAAthunderStorm = extremeWeather.events.storms;
        const NOAAhighWind = extremeWeather.events.highWindDays;
        const NOAAsnowStorm = extremeWeather.events.snowDays;
        const NOAAheatWave = extremeWeather.events.heatwaveDays;

        const chosenWeatherValue =
            thunderStorm && NOAAthunderStorm > 0 ? 1 :
                highWind && NOAAhighWind > 0 ? 1 :
                    snowStorm && NOAAsnowStorm > 0 ? 1 :
                        heatWave && NOAAheatWave > 0 ? 1 :
                            0;

        // Scale the adverse weather score to be out of 10
        const adverseScore = chosenWeatherValue * adverse * 10;
        console.log('Adverse Weather Score:', adverseScore);

        // Determine the user's preferred temperature
        let selectedTemp;
        if (userCold === 1) {
            selectedTemp = cold;
        } else if (userCool === 1) {
            selectedTemp = cool;
        } else if (userWarm === 1) {
            selectedTemp = warm;
        } else if (userHot === 1) {
            selectedTemp = hot;
        } else {
            selectedTemp = null; // Default value if no preference is selected
        }

        // Calculate the temperature score (out of 10)
        // The score decreases as the difference between the user's preferred temperature
        // and the NOAA average temperature increases
        const tempScore = scale - (Math.abs((NOAATavg.averageTemperature - selectedTemp) / selectedTemp) * scale);
        console.log('Temperature Score:', tempScore);

        // Calculate the final average score (out of 10)
        // The final score is the average of the adverse weather score, and temperature score
        const score = (adverseScore + tempScore) / 2; // Adjusted to include only the relevant scores
        console.log('Final Score:', score);

        return Math.round(score); // Return the rounded final score
    } catch (error) {
        console.error('Score calculation failed:', error.message);
        throw error; // Rethrow the error for debugging
    }
}
