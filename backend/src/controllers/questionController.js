const questionService = require('../services/questionService');
const { validateQuestionInput } = require('../validators/questionValidator');
const logger = require('../utils/logger');

const analyzeQuestion = async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = validateQuestionInput(req.body);
    if (error) {
      logger.warn('Validation failed:', error.details);
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        })),
        timestamp: new Date().toISOString()
      });
    }

    const { questionText, difficulty, platform } = value;

    logger.info('Processing question analysis request', {
      platform,
      difficulty,
      questionLength: questionText.length
    });

    // Call service to analyze question
    const analysisResult = await questionService.analyzeQuestion({
      questionText,
      difficulty,
      platform
    });

    logger.info('Question analysis completed successfully');

    res.json({
      success: true,
      data: analysisResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error in analyzeQuestion controller:', error);
    
    // Handle specific service errors
    if (error.name === 'SambanovaServiceError') {
      return res.status(503).json({
        success: false,
        error: 'Unable to generate hints right now',
        message: 'The AI service is temporarily unavailable. Please try again later.',
        timestamp: new Date().toISOString()
      });
    }

    if (error.name === 'QuestionProcessingError') {
      return res.status(400).json({
        success: false,
        error: 'Unable to process question',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }

    // Pass to global error handler
    next(error);
  }
};

module.exports = {
  analyzeQuestion
};