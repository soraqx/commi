/**
 * aiPassengerService.js
 * 
 * Contains async function to fetch passenger count data from an external AI API.
 * This is a placeholder implementation - replace with actual API calls when ready.
 * 
 * Uses Axios for HTTP requests.
 */

const axios = require('axios');

// Load environment variables
require('dotenv').config();

/**
 * Fetches passenger count from the external AI API.
 * 
 * @param {Object} gpsData - GPS data to send to the AI API
 * @param {number} gpsData.latitude - Current latitude
 * @param {number} gpsData.longitude - Current longitude
 * @param {number} [gpsData.altitude] - Current altitude (optional)
 * @param {number} [gpsData.speed] - Current speed in km/h (optional)
 * @param {string} [gpsData.timestamp] - Timestamp of the GPS reading
 * 
 * @returns {Promise<Object>} - Passenger count data
 * 
 * Expected response format:
 * {
 *   count: number,
 *   confidence: number,
 *   timestamp: string
 * }
 */
async function fetchPassengerCount(gpsData) {
    try {
        // Check if AI_API_KEY is configured
        const apiKey = process.env.AI_API_KEY;

        if (!apiKey || apiKey === 'your_ai_api_key_here') {
            console.log('AI_API_KEY not configured, returning mock passenger data');
            return getMockPassengerData();
        }

        // Configuration for the external AI API
        const apiUrl = process.env.AI_API_URL || 'https://api.example.com/v1/passenger-count';

        // Make request to external AI API
        const response = await axios.post(
            apiUrl,
            {
                location: {
                    latitude: gpsData.latitude,
                    longitude: gpsData.longitude,
                    altitude: gpsData.altitude,
                    speed: gpsData.speed
                },
                timestamp: gpsData.timestamp
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                timeout: 10000 // 10 second timeout
            }
        );

        // Return the passenger data from the API response
        return {
            count: response.data.passenger_count || response.data.count || 0,
            confidence: response.data.confidence || 1.0,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        // Log the error for debugging
        console.error('Error fetching passenger data from AI API:', error.message);

        // Fall back to mock data if API call fails
        console.log('Falling back to mock passenger data');
        return getMockPassengerData();
    }
}

/**
 * Returns mock passenger data for prototyping when API is not available.
 * 
 * @returns {Object} - Mock passenger count data
 */
function getMockPassengerData() {
    // Generate a random passenger count between 1 and 20 for prototyping
    const mockCount = Math.floor(Math.random() * 20) + 1;

    return {
        count: mockCount,
        confidence: 0.85,
        timestamp: new Date().toISOString(),
        source: 'mock'
    };
}

module.exports = {
    fetchPassengerCount
};