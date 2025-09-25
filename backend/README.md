# Student Buddy Backend 🎓

A robust Node.js backend API for the Student Buddy Chrome Extension that helps students solve DSA (Data Structures & Algorithms) problems by acting as an AI mentor.

## 🚀 Features

- **AI-Powered Problem Analysis**: Uses OpenAI GPT-4o-mini to analyze coding problems
- **Progressive Hints**: Generates 4-5 step-by-step hints that guide learning
- **Pseudo Code Generation**: Provides clean, educational pseudo code
- **Multi-Platform Support**: Works with LeetCode, Codeforces, HackerRank, CodeChef, etc.
- **Robust Error Handling**: Comprehensive error management and logging
- **Rate Limiting**: Prevents abuse with configurable limits
- **CORS Support**: Optimized for Chrome Extension integration
- **Production Ready**: Structured for easy deployment

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── questionController.js     # Request handling logic
│   ├── routes/
│   │   ├── questionRoutes.js         # API route definitions
│   │   └── healthRoutes.js           # Health check endpoints
│   ├── services/
│   │   ├── questionService.js        # Business logic
│   │   └── openAIService.js          # OpenAI API integration
│   ├── validators/
│   │   └── questionValidator.js      # Input validation schemas
│   ├── middleware/
│   │   └── errorMiddleware.js        # Error handling middleware
│   ├── utils/
│   │   └── logger.js                 # Winston logging configuration
│   ├── app.js                        # Express app configuration
│   └── server.js                     # Server startup
├── logs/                             # Application logs
├── .env                              # Environment variables
├── .env.example                      # Environment template
├── package.json                      # Dependencies and scripts
└── README.md                         # This file
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key

### 1. Clone and Install
```bash
git clone <repository-url>
cd backend
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Origins (comma-separated)
ALLOWED_ORIGINS=chrome-extension://,http://localhost:3000
```

### 3. Start the Server
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## 📡 API Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "version": "1.0.0",
  "services": {
    "openai": "configured"
  }
}
```

### Analyze Question
```http
POST /api/v1/analyze-question
Content-Type: application/json

{
  "questionText": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
  "difficulty": "easy",
  "platform": "leetcode"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hints": [
      "1. This is a classic 'Two Sum' problem - look for pairs that add up to target",
      "2. Consider using a hash map to store values and their indices as you iterate",
      "3. For each element, check if (target - current_element) exists in your hash map",
      "4. Return the indices when you find a match, handling the case where the same element can't be used twice"
    ],
    "pseudoCode": "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}",
    "metadata": {
      "hintsGenerated": 4,
      "timestamp": "2024-01-20T10:30:00.000Z"
    }
  },
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

## 🔧 Configuration Options

### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `questionText` | string | Yes | Full problem statement (10-10,000 chars) |
| `difficulty` | string | No | `easy`\|`medium`\|`hard`\|`beginner`\|`intermediate`\|`advanced` |
| `platform` | string | No | `leetcode`\|`codeforces`\|`hackerrank`\|`codechef`\|`geeksforgeeks` |

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `NODE_ENV` | development | Environment mode |
| `OPENAI_API_KEY` | - | OpenAI API key (required) |
| `RATE_LIMIT_WINDOW_MS` | 900000 | Rate limit window (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | 100 | Max requests per window |
| `ALLOWED_ORIGINS` | - | Comma-separated CORS origins |

## 🚀 Deployment

### Deploy to Render
1. Connect your GitHub repository
2. Add environment variables in Render dashboard
3. Deploy with build command: `npm install`
4. Start command: `npm start`

### Deploy to Railway
```bash
npm install -g @railway/cli
railway login
railway init
railway add
railway deploy
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```

### Deploy to AWS Lambda
Use the Serverless framework or AWS SAM for Lambda deployment.

## 🧪 Testing

### Manual Testing
```bash
# Test health endpoint
curl http://localhost:3000/health

# Test question analysis
curl -X POST http://localhost:3000/api/v1/analyze-question \
  -H "Content-Type: application/json" \
  -d '{
    "questionText": "Find two numbers that add up to target",
    "difficulty": "easy",
    "platform": "leetcode"
  }'
```

### Load Testing
Use tools like Apache Bench or Artillery for load testing:
```bash
# Install artillery
npm install -g artillery

# Run load test
artillery quick --count 10 --num 5 http://localhost:3000/health
```

## 📊 Logging

The application uses Winston for structured logging:
- Console output with colors
- File logging to `logs/combined.log`
- Error-only logging to `logs/error.log`

Log levels:
- `error`: System errors, API failures
- `warn`: Validation failures, rate limits
- `info`: Request/response info, service status
- `debug`: Detailed debugging (dev mode only)

## 🔐 Security Features

- **Helmet.js**: Security headers
- **Rate Limiting**: Prevents API abuse
- **CORS Protection**: Controlled cross-origin access
- **Input Validation**: Joi schema validation
- **Error Sanitization**: No sensitive data in error responses
- **API Key Protection**: Secure OpenAI key handling

## 📈 Scalability Considerations

### Current Architecture
- Stateless design for horizontal scaling
- Configurable rate limiting
- Efficient error handling
- Structured logging for monitoring

### Future Enhancements
- Database integration for user progress
- Redis caching for common problems
- User authentication and sessions
- Analytics and usage tracking
- Problem difficulty classification ML model

## ⚠️ Error Handling

The API returns structured error responses:

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "questionText",
      "message": "Question text is required"
    }
  ],
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

Common HTTP status codes:
- `400`: Bad Request (validation errors)
- `429`: Too Many Requests (rate limit)
- `503`: Service Unavailable (OpenAI issues)
- `500`: Internal Server Error

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes with proper error handling
4. Add logging for important operations
5. Test your changes thoroughly
6. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**OpenAI API Errors:**
- Check API key in `.env` file
- Verify OpenAI account has credits
- Check rate limits on OpenAI dashboard

**CORS Issues:**
- Add your extension ID to `ALLOWED_ORIGINS`
- Ensure extension manifest has correct permissions

**Memory Issues:**
- Monitor logs for memory usage
- Implement response caching if needed
- Consider pagination for large responses

### Support

For issues and questions:
1. Check the logs in `logs/` directory
2. Verify environment configuration
3. Test with `/health` endpoint
4. Review error responses for debugging info

---

Built with ❤️ for helping students learn DSA concepts effectively!