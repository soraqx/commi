/**
 * deviceController.js
 * 
 * Handles logic for receiving GPS POST requests from the NEO-6M module
 * and formatting responses for the frontend dashboard.
 * 
 * Expected GPS data format from NEO-6M:
 * {
 *   latitude: number,
 *   longitude: number,
 *   altitude: number (optional),
 *   speed: number (optional, in km/h),
 *   timestamp: string (ISO 8601 format)
 * }
 */

const aiPassengerService = require('../services/aiPassengerService');

/**
 * Handles POST /api/location
 * Receives GPS data from the NEO-6M module and returns passenger count
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.receiveLocation = async (req, res) => {
    try {
        // Extract GPS data from request body
        const { latitude, longitude, altitude, speed, timestamp } = req.body;

        // Validate required fields
        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: latitude and longitude are required'
            });
        }

        // Validate latitude and longitude ranges
        if (latitude < -90 || latitude > 90) {
            return res.status(400).json({
                success: false,
                message: 'Invalid latitude value. Must be between -90 and 90'
            });
        }

        if (longitude < -180 || longitude > 180) {
            return res.status(400).json({
                success: false,
                message: 'Invalid longitude value. Must be between -180 and 180'
            });
        }

        // Format the GPS data for storage/response
        const gpsData = {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            altitude: altitude ? parseFloat(altitude) : null,
            speed: speed ? parseFloat(speed) : null,
            timestamp: timestamp || new Date().toISOString()
        };

        // Fetch passenger count from AI service
        const passengerData = await aiPassengerService.fetchPassengerCount(gpsData);

        // Return combined GPS and passenger data
        return res.status(200).json({
            success: true,
            message: 'Location data received successfully',
            data: {
                gps: gpsData,
                passengers: passengerData
            }
        });

    } catch (error) {
        console.error('Error processing location data:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to process location data',
            error: error.message
        });
    }
};

/**
 * Handles GET /api/dashboard-data
 * Returns current/latest GPS data and passenger count for the dashboard
 * 
 * Note: This is a placeholder implementation. In production, you would
 * store GPS data in a database and retrieve the latest entry here.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getDashboardData = async (req, res) => {
    try {
        // Placeholder: In production, fetch from database
        const mockGpsData = {
            latitude: 14.5995,  // Example: Manila coordinates
            longitude: 120.9842,
            altitude: 15.5,
            speed: 45.3,
            timestamp: new Date().toISOString()
        };

        // Fetch passenger count from AI service
        const passengerData = await aiPassengerService.fetchPassengerCount(mockGpsData);

        return res.status(200).json({
            success: true,
            data: {
                gps: mockGpsData,
                passengers: passengerData,
                lastUpdated: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard data:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data',
            error: error.message
        });
    }
};

module.exports = exports;