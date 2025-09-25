// LeetCode problem extractor
(function() {
  'use strict';

  function extractProblemData() {
    try {
      // Extract problem title
      const titleElement = document.querySelector('[data-cy="question-title"]') || 
                          document.querySelector('.css-v3d350') ||
                          document.querySelector('h1');
      
      // Extract problem description
      const descriptionElement = document.querySelector('[data-track-load="description_content"]') ||
                                document.querySelector('.content__u3I1') ||
                                document.querySelector('.question-content');

      // Extract difficulty
      const difficultyElement = document.querySelector('[diff]') ||
                              document.querySelector('.difficulty') ||
                              document.querySelector('[data-degree]');

      // Extract tags
      const tagElements = document.querySelectorAll('[class*="tag"]') ||
                         document.querySelectorAll('.topic-tag');

      const title = titleElement?.textContent?.trim() || '';
      const description = descriptionElement?.textContent?.trim() || '';
      let difficulty = difficultyElement?.textContent?.trim().toLowerCase() || '';
      // Normalize difficulty to match backend expectations
      if (difficulty === 'easy' || difficulty === 'medium' || difficulty === 'hard') {
        // Already in correct format
      } else if (difficulty.includes('easy')) {
        difficulty = 'easy';
      } else if (difficulty.includes('medium')) {
        difficulty = 'medium';
      } else if (difficulty.includes('hard')) {
        difficulty = 'hard';
      } else {
        difficulty = 'medium'; // Default to medium if unrecognized
      }
      
      const tags = Array.from(tagElements).map(tag => tag.textContent?.trim()).filter(Boolean);

      return {
        platform: 'leetcode', // Lowercase to match backend expectation
        url: window.location.href,
        title: title,
        description: description,
        difficulty: difficulty,
        tags: tags,
        extractedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error extracting LeetCode problem:', error);
      return null;
    }
  }

  function sendProblemData() {
    const problemData = extractProblemData();
    
    if (problemData && problemData.title) {
      // Send to background script
      chrome.runtime.sendMessage({
        type: 'PROBLEM_EXTRACTED',
        data: problemData
      });
    }
  }

  // Extract immediately
  sendProblemData();

  // Also extract when DOM changes (for SPA navigation)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(sendProblemData, 2000); // Wait for content to load
    }
  }).observe(document, { subtree: true, childList: true });

  // Listen for extraction requests from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'EXTRACT_PROBLEM') {
      // Add a small delay to ensure the page is fully loaded
      setTimeout(() => {
        try {
          const problemData = extractProblemData();
          sendResponse(problemData);
        } catch (error) {
          console.error('Error extracting problem data:', error);
          sendResponse(null);
        }
      }, 500);
      return true; // Will respond asynchronously
    }
  });

})();