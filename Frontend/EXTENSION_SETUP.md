# Student Buddy Extension Setup Guide

## Overview
This Chrome extension automatically extracts coding problems from platforms like LeetCode, HackerRank, and Codeforces, then sends them to your backend API to get progressive hints and pseudo-code solutions.

## Features
- ✅ **Auto-extraction** from popular coding platforms
- ✅ **Real-time problem detection** when navigating between problems
- ✅ **Backend API integration** with your existing server
- ✅ **Progressive hints system** (up to 3 hints per problem)
- ✅ **Pseudo-code solutions** on demand
- ✅ **Configurable API settings** with connection testing

## Supported Platforms
- LeetCode (leetcode.com)
- HackerRank (hackerrank.com) 
- Codeforces (codeforces.com)

## Installation

### 1. Build the Extension
```bash
npm run build
# or
yarn build
```

### 2. Load in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked" 
4. Select the `dist` folder from your build

### 3. Configure API Settings
1. Click the extension icon in Chrome toolbar
2. Click the Settings button (gear icon)
3. Enter your backend API URL (e.g., `http://localhost:3000/api`)
4. Add API key if your backend requires authentication
5. Click "Test Connection" to verify
6. Save settings

## Backend API Requirements

Your backend needs to implement these endpoints:

### POST /api/hints
Get progressive hints for a coding problem.

**Request:**
```json
{
  "problem": {
    "title": "Two Sum",
    "description": "Given an array of integers...",
    "difficulty": "Easy",
    "platform": "LeetCode",
    "tags": ["Array", "Hash Table"]
  },
  "hintIndex": 0
}
```

**Response:**
```json
{
  "hint": "Think about using a hash map to store previously seen numbers...",
  "hintsRemaining": 2
}
```

### POST /api/pseudocode  
Get pseudo-code solution for a problem.

**Request:**
```json
{
  "problem": {
    "title": "Two Sum",
    "description": "Given an array of integers...",
    "difficulty": "Easy", 
    "platform": "LeetCode",
    "tags": ["Array", "Hash Table"]
  }
}
```

**Response:**
```json
{
  "pseudoCode": "function twoSum(nums, target):\n    seen = {}\n    for i in range(len(nums)):\n        complement = target - nums[i]\n        if complement in seen:\n            return [seen[complement], i]\n        seen[nums[i]] = i\n    return []"
}
```

### GET /api/health
Health check endpoint for connection testing.

**Response:** `200 OK`

## Usage

1. **Navigate to a coding problem** on any supported platform
2. **Open the extension** by clicking its icon
3. **Problem auto-extracted** - you'll see the problem details populated
4. **Get hints** - click "Get Hint" for progressive assistance
5. **Reveal solution** - click "Reveal Code" when ready for pseudo-code
6. **Manual extraction** - click the "Extract" button if auto-detection fails

## Development Mode

When testing locally (not as an extension), the app will show a sample "Two Sum" problem for development purposes.

## Files Structure

```
public/
├── manifest.json           # Extension manifest
├── background.js          # Background script
└── content-scripts/       # Platform-specific extractors
    ├── leetcode.js
    ├── hackerrank.js
    └── codeforces.js

src/
├── components/
│   ├── ExtensionPopup.tsx # Main popup UI
│   └── SettingsPage.tsx   # API configuration
├── services/
│   └── api.ts            # Backend API client
└── types/
    └── extension.ts      # TypeScript definitions
```

## Troubleshooting

### Extension not detecting problems
- Make sure you're on a supported platform
- Try clicking the "Extract" button manually
- Check if the page has fully loaded

### API connection issues  
- Verify your API URL is correct
- Test the `/health` endpoint in your browser
- Check CORS settings on your backend
- Ensure your backend is running and accessible

### No hints/code appearing
- Check browser console for errors
- Verify your backend implements the required endpoints
- Test API endpoints directly with tools like Postman

## Security Notes

- API keys are stored locally in browser storage
- All communication is between the extension and your backend
- No data is sent to external services without your backend integration