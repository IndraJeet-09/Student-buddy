require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const questionRoutes = require('./routes/questionRoutes');
const healthRoutes = require('./routes/healthRoutes');
const logger = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration for Chrome Extension
const corsOptions = {
  origin: function (origin, callback) {
    // Allow Chrome extension origins and development
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    const isExtension = origin && origin.startsWith('chrome-extension://');
    const isAllowed = !origin || allowedOrigins.some(allowed => origin?.includes(allowed)) || isExtension;
    
    if (isAllowed) {
      callback(null, true);
    } else {
      logger.warn(`Blocked CORS request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Routes
app.use('/health', healthRoutes);
app.use('/api/v1', questionRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🎓 Student Buddy Backend API',
    version: '1.0.0',
    documentation: '/health',
    endpoints: {
      health: 'GET /health',
      analyzeQuestion: 'POST /api/v1/analyze-question'
    }
  });
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;