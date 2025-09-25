const Joi = require('joi');

const questionSchema = Joi.object({
  questionText: Joi.string()
    .min(10)
    .max(10000)
    .required()
    .messages({
      'string.base': 'Question text must be a string',
      'string.empty': 'Question text cannot be empty',
      'string.min': 'Question text must be at least 10 characters long',
      'string.max': 'Question text must be less than 10,000 characters',
      'any.required': 'Question text is required'
    }),

  difficulty: Joi.string()
    .valid('easy', 'medium', 'hard', 'beginner', 'intermediate', 'advanced')
    .optional()
    .messages({
      'any.only': 'Difficulty must be one of: easy, medium, hard, beginner, intermediate, advanced'
    }),

  platform: Joi.string()
    .valid('leetcode', 'codeforces', 'hackerrank', 'codechef', 'geeksforgeeks', 'atcoder', 'topcoder', 'spoj', 'cses')
    .optional()
    .messages({
      'any.only': 'Platform must be one of the supported coding platforms'
    }),

  includeExplanation: Joi.boolean()
    .default(true)
    .optional(),

  requestPseudoCode: Joi.boolean()
    .default(true)
    .optional()
});

const validateQuestionInput = (data) => {
  return questionSchema.validate(data, {
    abortEarly: false, // Return all validation errors
    stripUnknown: true, // Remove unknown fields
    convert: true // Convert string 'true'/'false' to boolean
  });
};

module.exports = {
  validateQuestionInput,
  questionSchema
};