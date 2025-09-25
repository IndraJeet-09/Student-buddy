// Codeforces problem extractor
(function() {
  'use strict';

  function extractProblemData() {
    try {
      // Extract problem title
      const titleElement = document.querySelector('.problem-statement .title') ||
                          document.querySelector('.header .title') ||
                          document.querySelector('h1');

      // Extract problem description
      const descriptionElement = document.querySelector('.problem-statement') ||
                                document.querySelector('.statement');

      // Extract tags
      const tagElements = document.querySelectorAll('.tag-box') ||
                         document.querySelectorAll('[class*="tag"]');

      // Extract time/memory limits
      const timeLimit = document.querySelector('.time-limit')?.textContent?.trim() || '';
      const memoryLimit = document.querySelector('.memory-limit')?.textContent?.trim() || '';

      const title = titleElement?.textContent?.trim() || '';
      const description = descriptionElement?.textContent?.trim() || '';
      const tags = Array.from(tagElements).map(tag => tag.textContent?.trim()).filter(Boolean);

      // Determine difficulty from problem rating if available
      let difficulty = 'medium'; // Default to medium
      
      // Try to determine difficulty from URL or page content
      const problemRating = document.querySelector('.problem-statement .rated-user')?.textContent?.trim() || '';
      if (problemRating) {
        const rating = parseInt(problemRating);
        if (rating < 1300) difficulty = 'easy';
        else if (rating < 1800) difficulty = 'medium';
        else difficulty = 'hard';
      }

      return {
        platform: 'codeforces', // Lowercase to match backend expectation
        url: window.location.href,
        title: title,
        description: description,
        difficulty: difficulty,
        timeLimit: timeLimit,
        memoryLimit: memoryLimit,
        tags: tags,
        extractedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error extracting Codeforces problem:', error);
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
  setTimeout(sendProblemData, 500);

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