const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  // Default error
  let error = {
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  };

  // Validation errors (Joi)
  if (err.isJoi) {
    error.error = 'Validation failed';
    error.details = err.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    return res.status(400).json(error);
  }

  // OpenAI API errors
  if (err.response?.status) {
    const status = err.response.status;
    if (status === 401) {
      error.error = 'OpenAI API authentication failed';
    } else if (status === 429) {
      error.error = 'Rate limit exceeded. Please try again later';
    } else if (status >= 500) {
      error.error = 'OpenAI service temporarily unavailable';
    }
    return res.status(503).json(error);
  }

  // Custom application errors
  if (err.statusCode) {
    error.error = err.message;
    return res.status(err.statusCode).json(error);
  }

  // Network/timeout errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    error.error = 'Unable to connect to external service';
    return res.status(503).json(error);
  }

  // Default to 500 server error
  res.status(500).json(error);
};

const notFoundHandler = (req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.path}`,
    availableEndpoints: {
      root: 'GET /',
      health: 'GET /health',
      analyzeQuestion: 'POST /api/v1/analyze-question',
      hint: 'POST /api/v1/analyze-question/hints',
      pseudocode: 'POST /api/v1/analyze-question/pseudocode'
    },
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};