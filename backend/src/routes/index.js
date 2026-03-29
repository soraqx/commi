/**
 * routes/index.js
 * 
 * Defines the API routes for the GPS tracking backend.
 * Routes:
 *   - POST /api/location - Receive GPS data from NEO-6M module
 *   - GET /api/dashboard-data - Get current dashboard data (GPS + passenger count)
 */

const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

/**
 * POST /api/location
 * 
 * Endpoint to receive GPS data from the NEO-6M module.
 * Expected body:
 * {
 *   latitude: number (required),
 *   longitude: number (required),
 *   altitude: number (optional),
 *   speed: number (optional),
 *   timestamp: string (optional, ISO 8601 format)
 * }
 * 
 * Returns:
 * {
 *   success: boolean,
 *   message: string,
 *   data: {
 *     gps: object,
 *     passengers: object
 *   }
 * }
 */
router.post('/location', deviceController.receiveLocation);

/**
 * GET /api/dashboard-data
 * 
 * Endpoint to fetch current dashboard data including GPS location
 * and passenger count from the AI service.
 * 
 * Returns:
 * {
 *   success: boolean,
 *   data: {
 *     gps: object,
 *     passengers: object,
 *     lastUpdated: string
 *   }
 * }
 */
router.get('/dashboard-data', deviceController.getDashboardData);

module.exports = router;