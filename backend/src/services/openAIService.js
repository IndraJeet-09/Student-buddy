const axios = require('axios');
const logger = require('../utils/logger');

class SambanovaServiceError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'SambanovaServiceError';
    this.statusCode = statusCode;
  }
}

// System prompt for DSA mentoring
const SYSTEM_PROMPT = `You are an expert DSA (Data Structures & Algorithms) mentor and coding interview coach. Your role is to guide students through problem-solving by providing progressive hints without giving away the complete solution immediately.

Your expertise covers:
- Algorithm design and optimization
- Data structure selection and implementation
- Time and space complexity analysis
- Problem pattern recognition
- Step-by-step problem breakdown

When analyzing a coding problem, you should:
1. Identify the core problem type and patterns
2. Suggest relevant data structures or algorithms
3. Guide the student's thinking process progressively
4. Provide clean, readable pseudo code
5. Focus on learning rather than just getting the answer

Always structure your response as JSON with "hints" array and "pseudoCode" string.`;

const generateHintsAndPseudoCode = async ({ questionText, difficulty, platform, metadata }) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new SambanovaServiceError('Sambanova API key not configured', 500);
    }

    const userPrompt = buildUserPrompt({ questionText, difficulty, platform, metadata });

    logger.debug('Sending request to Sambanova', {
      platform,
      difficulty,
      questionLength: questionText.length
    });

    const response = await axios.post(
      'https://api.sambanova.ai/v1/chat/completions',
      {
        model: process.env.MODEL,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.7,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    const aiResponse = response.data.choices[0].message.content;
    
    logger.debug('Received response from Sambanova', {
      tokensUsed: response.data.usage?.total_tokens
    });

    // Parse and validate the JSON response
    const parsedResponse = parseAIResponse(aiResponse);
    
    return parsedResponse;

  } catch (error) {
    logger.error('Sambanova service error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    // Handle different types of errors
    if (error.response?.status === 401) {
      throw new SambanovaServiceError('Invalid Sambanova API key', 503);
    } else if (error.response?.status === 429) {
      throw new SambanovaServiceError('Sambanova rate limit exceeded', 503);
    } else if (error.response?.status >= 500) {
      throw new SambanovaServiceError('Sambanova service temporarily unavailable', 503);
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      throw new SambanovaServiceError('Unable to connect to Sambanova service', 503);
    }

    throw new SambanovaServiceError('Failed to generate analysis', 503);
  }
};

const buildUserPrompt = ({ questionText, difficulty, platform, metadata }) => {
  let prompt = `Analyze this DSA problem and provide progressive hints + pseudo code:

**Problem Statement:**
${questionText}

**Context:**`;
  
  if (platform) {
    prompt += `\nPlatform: ${platform}`;
  }
  
  if (difficulty) {
    prompt += `\nDifficulty: ${difficulty}`;
  }

  if (metadata?.hasExamples) {
    prompt += `\nNote: Problem includes examples`;
  }

  if (metadata?.hasConstraints) {
    prompt += `\nNote: Problem includes constraints`;
  }

  prompt += `

**Instructions:**
Generate exactly 4-5 progressive hints that guide the student's thinking process:
1. First hint: Help identify the problem type/pattern
2. Second hint: Suggest relevant data structures or approach
3. Third hint: Guide toward the optimal solution strategy
4. Fourth hint: Implementation considerations
5. Fifth hint (optional): Optimization tips

Then provide clean pseudo code that demonstrates the solution approach.

**Required JSON Response Format:**
{
  "hints": [
    "Hint 1: Problem identification...",
    "Hint 2: Data structure suggestion...",
    "Hint 3: Algorithm approach...",
    "Hint 4: Implementation guidance...",
    "Hint 5: Optimization considerations..."
  ],
  "pseudoCode": "function solveProblem(input) {\n  // Step 1: Initialize\n  // Step 2: Process\n  // Step 3: Return result\n}"
}

Focus on teaching problem-solving methodology rather than just providing the answer.`;

  return prompt;
};

const parseAIResponse = (aiResponse) => {
  try {
    const parsed = JSON.parse(aiResponse);
    
    // Validate response structure
    if (!parsed.hints || !Array.isArray(parsed.hints)) {
      logger.warn('AI response missing or invalid hints array');
      throw new Error('Invalid response format: missing hints array');
    }

    if (!parsed.pseudoCode || typeof parsed.pseudoCode !== 'string') {
      logger.warn('AI response missing or invalid pseudoCode');
      // Set default pseudo code if missing
      parsed.pseudoCode = 'function solve() {\n  // Implementation needed\n  return result;\n}';
    }

    // Filter out empty hints
    const validHints = parsed.hints.filter(hint => 
      hint && typeof hint === 'string' && hint.trim().length > 0
    );

    if (validHints.length === 0) {
      throw new Error('No valid hints in AI response');
    }

    return {
      hints: validHints,
      pseudoCode: parsed.pseudoCode.trim()
    };

  } catch (error) {
    logger.error('Failed to parse AI response:', {
      error: error.message,
      response: aiResponse?.substring(0, 200) + '...'
    });

    // Return fallback response
    return {
      hints: [
        "1. Read the problem carefully and identify the input/output format",
        "2. Look for patterns - is this a search, sort, or optimization problem?",
        "3. Consider what data structures might be helpful for this problem",
        "4. Think about the time complexity requirements based on constraints"
      ],
      pseudoCode: "function solve(input) {\n  // Analyze the problem step by step\n  // Choose appropriate data structure\n  // Implement the solution\n  return result;\n}"
    };
  }
};

// Health check function for OpenAI API
const checkAPIHealth = async () => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return { status: 'error', message: 'API key not configured' };
    }

    const response = await axios.post(
      'https://api.sambanova.ai/v1/chat/completions',
      {
        model: process.env.MODEL,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      }
    );

    return { status: 'healthy', message: 'API accessible' };
  } catch (error) {
    return { 
      status: 'error', 
      message: error.response?.status === 401 ? 'Invalid API key' : 'API unreachable' 
    };
  }
};

module.exports = {
  generateHintsAndPseudoCode,
  checkAPIHealth,
  SambanovaServiceError
};