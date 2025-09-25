// Background script for Student Buddy extension
let currentProblemData = null;

// Helper function to check if URL is from a supported platform
function isSupportedPlatform(url) {
  const supportedDomains = [
    'leetcode.com',
    'www.leetcode.com',
    'hackerrank.com',
    'www.hackerrank.com',
    'codeforces.com',
    'www.codeforces.com'
  ];
  
  try {
    const urlObj = new URL(url);
    return supportedDomains.some(domain => urlObj.hostname === domain);
  } catch {
    return false;
  }
}

// Helper function to send message to tab with retry
async function sendMessageToTab(tabId, message, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await chrome.tabs.sendMessage(tabId, message);
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

// Listen for problem extractions from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'PROBLEM_EXTRACTED') {
    currentProblemData = request.data;
    console.log('Problem extracted:', currentProblemData);
    
    // Store in chrome storage for popup access
    chrome.storage.session.set({ 
      currentProblem: currentProblemData 
    }).catch(error => {
      console.error('Error storing problem data:', error);
    });
  }
  
  // Handle requests from popup for current problem
  if (request.type === 'GET_CURRENT_PROBLEM') {
    sendResponse(currentProblemData);
  }
  
  // Handle manual extraction requests from popup
  if (request.type === 'MANUAL_EXTRACT') {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      try {
        const tab = tabs[0];
        if (!tab) {
          console.error('No active tab found');
          sendResponse(null);
          return;
        }

        // Check if we're on a supported platform
        if (!isSupportedPlatform(tab.url)) {
          console.log('Not a supported platform:', tab.url);
          sendResponse(null);
          return;
        }

        // Try to extract problem data
        const response = await sendMessageToTab(tab.id, { type: 'EXTRACT_PROBLEM' });
        if (response) {
          currentProblemData = response;
          await chrome.storage.session.set({ 
            currentProblem: currentProblemData 
          });
          sendResponse(response);
        } else {
          sendResponse(null);
        }
      } catch (error) {
        console.error('Error extracting problem:', error);
        sendResponse(null);
      }
    });
    return true; // Will respond asynchronously
  }
});