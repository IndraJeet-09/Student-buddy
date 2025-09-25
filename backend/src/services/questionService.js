const openAIService = require('./openAIService');
const logger = require('../utils/logger');

class QuestionProcessingError extends Error {
  constructor(message) {
    super(message);
    this.name = 'QuestionProcessingError';
  }
}

const analyzeQuestion = async ({ questionText, difficulty, platform }) => {
  try {
    // Clean and preprocess the question text
    const cleanedQuestion = preprocessQuestion(questionText);
    
    // Validate cleaned question
    if (cleanedQuestion.length < 10) {
      throw new QuestionProcessingError('Question text is too short after preprocessing');
    }

    // Extract metadata from question if available
    const questionMetadata = extractQuestionMetadata(cleanedQuestion, platform);

    // Generate analysis using OpenAI
    const analysis = await openAIService.generateHintsAndPseudoCode({
      questionText: cleanedQuestion,
      difficulty: difficulty || questionMetadata.detectedDifficulty,
      platform: platform || questionMetadata.detectedPlatform,
      metadata: questionMetadata
    });

    // Post-process and validate the analysis
    const processedAnalysis = postProcessAnalysis(analysis);

    logger.info('Question analysis completed', {
      hintsCount: processedAnalysis.hints.length,
      hasPseudoCode: !!processedAnalysis.pseudoCode,
      platform,
      difficulty
    });

    return processedAnalysis;

  } catch (error) {
    logger.error('Error in question analysis service:', error);
    throw error;
  }
};

const preprocessQuestion = (questionText) => {
  return questionText
    .trim()
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove HTML tags if any
    .replace(/<[^>]*>/g, '')
    // Clean up common formatting issues
    .replace(/\n+/g, '\n')
    // Limit length to prevent token overflow
    .substring(0, 8000);
};

const extractQuestionMetadata = (questionText, platform) => {
  const metadata = {
    detectedDifficulty: null,
    detectedPlatform: platform || null,
    hasExamples: false,
    hasConstraints: false,
    estimatedComplexity: null
  };

  const lowerText = questionText.toLowerCase();

  // Detect difficulty from text patterns
  if (lowerText.includes('easy') || lowerText.includes('beginner')) {
    metadata.detectedDifficulty = 'easy';
  } else if (lowerText.includes('medium') || lowerText.includes('intermediate')) {
    metadata.detectedDifficulty = 'medium';
  } else if (lowerText.includes('hard') || lowerText.includes('advanced') || lowerText.includes('difficult')) {
    metadata.detectedDifficulty = 'hard';
  }

  // Check for examples and constraints
  metadata.hasExamples = lowerText.includes('example') || lowerText.includes('input') && lowerText.includes('output');
  metadata.hasConstraints = lowerText.includes('constraint') || lowerText.includes('limit') || lowerText.includes('≤') || lowerText.includes('<=');

  // Detect platform from URL patterns or mentions
  if (!metadata.detectedPlatform) {
    if (lowerText.includes('leetcode') || lowerText.includes('leetcode.com')) {
      metadata.detectedPlatform = 'leetcode';
    } else if (lowerText.includes('codeforces') || lowerText.includes('codeforces.com')) {
      metadata.detectedPlatform = 'codeforces';
    } else if (lowerText.includes('hackerrank')) {
      metadata.detectedPlatform = 'hackerrank';
    } else if (lowerText.includes('codechef')) {
      metadata.detectedPlatform = 'codechef';
    } else if (lowerText.includes('geeksforgeeks') || lowerText.includes('gfg')) {
      metadata.detectedPlatform = 'geeksforgeeks';
    }
  }

  return metadata;
};

const postProcessAnalysis = (analysis) => {
  // Ensure hints are properly formatted and progressive
  const processedHints = analysis.hints
    .filter(hint => hint && hint.trim().length > 0)
    .map((hint, index) => {
      // Add step numbers if not present
      const trimmedHint = hint.trim();
      if (!trimmedHint.match(/^\d+\./)) {
        return `${index + 1}. ${trimmedHint}`;
      }
      return trimmedHint;
    });

  // Ensure we have at least 3 hints
  if (processedHints.length < 3) {
    logger.warn('Analysis returned fewer than 3 hints, this may indicate poor AI response');
  }

  // Clean up pseudo code
  let processedPseudoCode = analysis.pseudoCode || '';
  if (processedPseudoCode) {
    processedPseudoCode = processedPseudoCode
      .trim()
      // Remove markdown code block markers if present
      .replace(/^```[\w]*\n?/, '')
      .replace(/\n?```$/, '');
  }

  return {
    hints: processedHints.slice(0, 6), // Limit to max 6 hints
    pseudoCode: processedPseudoCode,
    metadata: {
      hintsGenerated: processedHints.length,
      timestamp: new Date().toISOString()
    }
  };
};

module.exports = {
  analyzeQuestion,
  QuestionProcessingError
};