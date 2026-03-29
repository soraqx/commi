/**
 * server.js
 * 
 * Main entry point for the GPS tracking backend.
 * Configures Express, CORS, JSON parsing, and mounts the API routes.
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const routes = require('./routes');

// Initialize Express application
const app = express();

// Get port from environment variables or default to 5000
const PORT = process.env.PORT || 5000;

/**
 * Middleware Configuration
 */

// CORS - Enable Cross-Origin Resource Sharing
// Allow requests from any origin (adjust for production if needed)
app.use(cors({
    origin: '*',  // In production, replace with specific domain(s)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// JSON Parsing - Parse incoming JSON requests
app.use(express.json());

// URL-encoded parsing (optional, for form data)
app.use(express.urlencoded({ extended: true }));

/**
 * Request Logging Middleware
 * Logs incoming requests to the console
 */
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

/**
 * Health Check Endpoint
 * Returns a simple status message
 */
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'GPS Tracking Backend is running',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

/**
 * Mount API Routes
 * All routes are prefixed with /api
 */
app.use('/api', routes);

/**
 * 404 Handler
 * Handles requests to undefined routes
 */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path
    });
});

/**
 * Global Error Handler
 * Catches and handles errors throughout the application
 */
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

/**
 * Start the Server
 */
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   GPS Tracking Backend Server                            ║
║                                                           ║
║   Server running on port: ${PORT}                          ║
║   Environment: ${process.env.NODE_ENV || 'development'}                         ║
║                                                           ║
║   Endpoints:                                              ║
║   - POST /api/location       (Receive GPS data)          ║
║   - GET  /api/dashboard-data (Get dashboard data)        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;