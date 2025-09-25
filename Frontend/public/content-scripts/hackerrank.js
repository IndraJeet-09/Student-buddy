// HackerRank problem extractor
(function() {
  'use strict';

  function extractProblemData() {
    try {
      // Extract problem title
      const titleElement = document.querySelector('.challenge-page-title') ||
                          document.querySelector('h1.ui-icon-label') ||
                          document.querySelector('.problem-statement h1');

      // Extract problem description
      const descriptionElement = document.querySelector('.challenge-body-html') ||
                                document.querySelector('.problem-statement') ||
                                document.querySelector('.challenge-text');

      // Extract difficulty
      const difficultyElement = document.querySelector('.difficulty') ||
                              document.querySelector('[class*="difficulty"]');

      // Extract tags/topics
      const tagElements = document.querySelectorAll('.tag') ||
                         document.querySelectorAll('[class*="tag"]');

      const title = titleElement?.textContent?.trim() || '';
      const description = descriptionElement?.textContent?.trim() || '';
      let difficulty = difficultyElement?.textContent?.trim().toLowerCase() || '';
      
      // Normalize difficulty to match backend expectations
      if (difficulty.includes('easy') || difficulty === 'basic') {
        difficulty = 'easy';
      } else if (difficulty.includes('medium') || difficulty.includes('intermediate')) {
        difficulty = 'medium';
      } else if (difficulty.includes('hard') || difficulty.includes('advanced')) {
        difficulty = 'hard';
      } else {
        difficulty = 'medium'; // Default to medium if unrecognized
      }
      
      const tags = Array.from(tagElements).map(tag => tag.textContent?.trim()).filter(Boolean);

      return {
        platform: 'hackerrank', // Lowercase to match backend expectation
        url: window.location.href,
        title: title,
        description: description,
        difficulty: difficulty,
        tags: tags,
        extractedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error extracting HackerRank problem:', error);
      return null;
    }
  }

  function sendProblemData() {
    const problemData = extractProblemData();
    
    if (problemData && problemData.title) {
      chrome.runtime.sendMessage({
        type: 'PROBLEM_EXTRACTED',
        data: problemData
      });
    }
  }

  // Extract immediately
  setTimeout(sendProblemData, 1000); // HackerRank needs more time to load

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