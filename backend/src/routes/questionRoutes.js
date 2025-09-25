const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

// POST /api/v1/analyze-question
router.post('/analyze-question', questionController.analyzeQuestion);

// GET /api/v1/analyze-question (for testing/docs)
router.get('/analyze-question', (req, res) => {
  res.json({
    message: 'Use POST method to analyze a question',
    endpoint: 'POST /api/v1/analyze-question',
    expectedPayload: {
      questionText: 'string (required) - The full problem statement',
      difficulty: 'string (optional) - easy|medium|hard',
      platform: 'string (optional) - leetcode|codeforces|hackerrank|codechef|geeksforgeeks'
    },
    responseFormat: {
      success: 'boolean',
      data: {
        hints: ['array of progressive hints'],
        pseudoCode: 'string - pseudo code solution'
      },
      timestamp: 'ISO string'
    },
    example: {
      questionText: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      difficulty: 'easy',
      platform: 'leetcode'
    }
  });
});

module.exports = router;