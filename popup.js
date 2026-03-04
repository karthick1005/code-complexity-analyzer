/**
 * popup.js - Main popup logic for Code Complexity Analyzer
 * Handles user interactions, API communication, and UI updates
 */

// Debug logging enabled
const DEBUG = true;

function log(message, data = '') {
    if (DEBUG) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] [CodeAnalyzer] ${message}`, data);
    }
}

function logError(message, error = '') {
    if (DEBUG) {
        const timestamp = new Date().toLocaleTimeString();
        console.error(`[${timestamp}] [CodeAnalyzer - ERROR] ${message}`, error);
    }
}

log('Popup script loading...');

// DOM Elements
const analyzeBtn = document.getElementById('analyzeBtn');
const analyzeAgainBtn = document.getElementById('analyzeAgain');
const retryBtn = document.getElementById('retryBtn');
const closeBtn = document.getElementById('closeBtn');
const loadingDiv = document.getElementById('loading');
const resultsDiv = document.getElementById('results');
const errorDiv = document.getElementById('error');
const initialDiv = document.getElementById('initial');
const errorMessage = document.getElementById('errorMessage');
const timeComplexityEl = document.getElementById('timeComplexity');
const spaceComplexityEl = document.getElementById('spaceComplexity');
const explanationSection = document.getElementById('explanationSection');
const toggleExplanationBtn = document.getElementById('toggleExplanation');
const explanationContent = document.getElementById('explanationContent');
const detailedExplanationEl = document.getElementById('detailedExplanation');

log('DOM elements loaded');

/**
 * Initialize event listeners
 */
function init() {
    log('Initializing event listeners...');
    analyzeBtn.addEventListener('click', handleAnalyzeClick);
    analyzeAgainBtn.addEventListener('click', resetUI);
    retryBtn.addEventListener('click', handleAnalyzeClick);
    toggleExplanationBtn.addEventListener('click', toggleExplanation);
    closeBtn.addEventListener('click', closeModal);
    
    // Open modal when popup loads
    document.body.classList.add('modal-open');
    
    log('Event listeners attached successfully');
}

/**
 * Toggle detailed explanation visibility
 */
function toggleExplanation() {
    log('Toggling explanation...');
    const isHidden = explanationContent.classList.contains('hidden');
    
    if (isHidden) {
        explanationContent.classList.remove('hidden');
        explanationContent.classList.add('show');
        toggleExplanationBtn.setAttribute('aria-expanded', 'true');
    } else {
        explanationContent.classList.add('hidden');
        explanationContent.classList.remove('show');
        toggleExplanationBtn.setAttribute('aria-expanded', 'false');
    }
}

/**
 * Handle analyze button click
 * Sends message to content script to extract code
 */
async function handleAnalyzeClick() {
    log('=== ANALYZE BUTTON CLICKED ===');
    showLoading();
    
    try {
        log('Step 1: Getting active tab...');
        // Get the active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        log('Step 1 Complete: Active tab found', { tabId: tab.id, url: tab.url });
        
        log('Step 2: Sending message to content script to extract code...');
        // Try to send message to content script
        let response;
        try {
            response = await chrome.tabs.sendMessage(tab.id, {
                action: 'extractCode'
            });
            log('Step 2 Complete: Response received from content script', response);
        } catch (messageError) {
            logError('Step 2 Failed: Could not reach content script', messageError.message);
            log('Step 2b: Attempting to inject content script...');
            
            // Fallback: Inject content script programmatically
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['content.js']
                });
                log('Step 2b Complete: Content script injected successfully');
                
                // Wait a moment for script to load
                await new Promise(resolve => setTimeout(resolve, 500));
                
                log('Step 2c: Re-attempting to send message...');
                response = await chrome.tabs.sendMessage(tab.id, {
                    action: 'extractCode'
                });
                log('Step 2c Complete: Response received after injection', response);
            } catch (injectionError) {
                logError('Step 2b Failed: Could not inject content script', injectionError.message);
                showError('Unable to detect code editor on this page. Please refresh the page (Ctrl+R or Cmd+R) and try again.');
                return;
            }
        }

        if (response.code) {
            log('Step 3: Code extracted successfully, length:', response.code.length);
            log('Code preview:', response.code.substring(0, 100));
            log('Step 4: Sending code to content script for API analysis...');
            // Send code to content script to analyze via API
            const analysisResponse = await chrome.tabs.sendMessage(tab.id, {
                action: 'analyzeCode',
                code: response.code
            });
            
            log('Step 4 Complete: Analysis response received', analysisResponse);
            
            if (analysisResponse.success) {
                log('Step 5: Displaying results...');
                displayResults(analysisResponse.data);
            } else {
                logError('Step 4 Failed: Analysis error', analysisResponse.error);
                showError('Complexity analysis failed: ' + (analysisResponse.error || 'Unknown error'));
            }
        } else {
            logError('Step 3 Failed: No code in response', response.error);
            showError('Unable to detect code editor. Please ensure you are on a coding platform.');
        }
    } catch (error) {
        logError('Exception caught in handleAnalyzeClick', error);
        showError('Unable to detect code editor. Please refresh the page and try again.');
    }
}

/**
 * Extract time and space complexity from result text
 * @param {string} resultText - The explanation text from API
 * @returns {object} Object with time and space complexities
 */
function extractComplexityFromResult(resultText) {
    log('Extracting complexity values from result text...');
    
    // Try to find "Time Complexity:" pattern
    const timeMatch = resultText.match(/Time Complexity[:\s]+([O\(\)a-zA-Z0-9^*+\-\s]+?)(?:\n|\.|-|,|$)/i);
    const spaceMatch = resultText.match(/Space Complexity[:\s]+([O\(\)a-zA-Z0-9^*+\-\s]+?)(?:\n|\.|-|,|$)/i);
    
    let timeComplexity = 'Unable to determine';
    let spaceComplexity = 'Unable to determine';
    
    if (timeMatch && timeMatch[1]) {
        timeComplexity = timeMatch[1].trim();
        log('Extracted time complexity:', timeComplexity);
    }
    
    if (spaceMatch && spaceMatch[1]) {
        spaceComplexity = spaceMatch[1].trim();
        log('Extracted space complexity:', spaceComplexity);
    }
    
    return { timeComplexity, spaceComplexity };
}

/**
 * Display complexity analysis results
 * @param {object} data - API response with complexity analysis
 */
function displayResults(data) {
    log('Displaying results...');
    log('API Response data:', data);
    
    // Handle different response formats
    let timeComplexity = 'Unable to determine';
    let spaceComplexity = 'Unable to determine';
    let explanation = '';
    
    // Format 1: Direct time/space fields
    if (data.time || data.timeComplexity) {
        timeComplexity = data.time || data.timeComplexity;
        spaceComplexity = data.space || data.spaceComplexity || 'Unable to determine';
        explanation = data.result || data.explanation || '';
    } 
    // Format 2: Result field with detailed explanation
    else if (data.result) {
        explanation = data.result;
        const extracted = extractComplexityFromResult(explanation);
        timeComplexity = extracted.timeComplexity;
        spaceComplexity = extracted.spaceComplexity;
    }
    
    log('Extracted time complexity:', timeComplexity);
    log('Extracted space complexity:', spaceComplexity);
    log('Explanation available:', !!explanation);

    // Update UI with complexity values
    timeComplexityEl.textContent = timeComplexity;
    spaceComplexityEl.textContent = spaceComplexity;

    // Update explanation if available
    if (explanation) {
        log('Displaying explanation');
        detailedExplanationEl.textContent = explanation;
        explanationSection.classList.remove('hidden');
        explanationContent.classList.add('hidden');
    } else {
        explanationSection.classList.add('hidden');
    }

    log('UI elements updated');

    // Hide loading and show results
    loadingDiv.classList.add('hidden');
    resultsDiv.classList.remove('hidden');
    
    log('Results display complete');
}

/**
 * Toggle detailed explanation visibility
 */
function toggleExplanation() {
    log('Toggling explanation...');
    const isHidden = explanationContent.classList.contains('hidden');
    
    if (isHidden) {
        explanationContent.classList.remove('hidden');
        explanationContent.classList.add('show');
        toggleExplanationBtn.setAttribute('aria-expanded', 'true');
    } else {
        explanationContent.classList.add('hidden');
        explanationContent.classList.remove('show');
        toggleExplanationBtn.setAttribute('aria-expanded', 'false');
    }
}

/**
 * Show loading state
 */
function showLoading() {
    log('Showing loading state...');
    initialDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');
    resultsDiv.classList.add('hidden');
    loadingDiv.classList.remove('hidden');
    log('Loading state displayed');
}

/**
 * Show error state with message
 * @param {string} message - Error message to display
 */
function showError(message) {
    logError('Showing error to user:', message);
    errorMessage.textContent = message;
    loadingDiv.classList.add('hidden');
    resultsDiv.classList.add('hidden');
    initialDiv.classList.add('hidden');
    errorDiv.classList.remove('hidden');
    log('Error state displayed');
}

/**
 * Close the modal popup
 */
function closeModal() {
    log('Closing modal...');
    document.body.classList.remove('modal-open');
}

/**
 * Reset UI to initial state
 */
function resetUI() {
    log('Resetting UI to initial state...');
    loadingDiv.classList.add('hidden');
    resultsDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');
    initialDiv.classList.remove('hidden');
    explanationContent.classList.add('hidden');
    explanationContent.classList.remove('show');
    if (toggleExplanationBtn) {
        toggleExplanationBtn.setAttribute('aria-expanded', 'false');
    }
    log('UI reset complete');
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    log('=== DOMContentLoaded event fired ===');
    log('Popup page fully loaded, initializing...');
    init();
    log('Initialization complete, popup ready for user interaction');
});

log('popup.js script loaded successfully');
