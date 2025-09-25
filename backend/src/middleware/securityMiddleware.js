const rateLimit = require('express-rate-limit');
const cors = require('cors');
const logger = require('../utils/logger');

// Rate limiting configuration
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: 'Too many requests, please try again later.'
        });
    }
});

// CORS configuration
const corsOptions = {
    origin: [
        'chrome-extension://*', // Allow all Chrome extensions
        'http://localhost:3000',
        'http://localhost:5173'
    ],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400 // Cache preflight requests for 24 hours
};

// Export middleware functions
module.exports = {
    rateLimiter: limiter,
    corsHandler: cors(corsOptions)
};