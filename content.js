/**
 * content.js - Content script for Code Complexity Analyzer
 * Runs on the webpage and extracts code from various coding platforms
 */

// Debug logging
const DEBUG = true;

function log(message, data = '') {
    if (DEBUG) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] [ContentScript] ${message}`, data);
    }
}

function logError(message, error = '') {
    if (DEBUG) {
        const timestamp = new Date().toLocaleTimeString();
        console.error(`[${timestamp}] [ContentScript - ERROR] ${message}`, error);
    }
}

log('Content script initialized on URL:', window.location.href);
log('Content script loaded at:', new Date().toLocaleTimeString());
log('Waiting for messages from popup...');

// Create modal overlay styles on page load
function injectModalStyles() {
    if (document.getElementById('code-analyzer-styles')) {
        return; // Already injected
    }
    
    const styleElement = document.createElement('style');
    styleElement.id = 'code-analyzer-styles';
    styleElement.textContent = `
        /* Dark theme (default) */
        :root {
            --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --primary-color: #667eea;
            --secondary-color: #764ba2;
            --success-color: #10b981;
            --warning-color: #f59e0b;
            --error-color: #ef4444;
            --bg-light: #323232;
            --bg-white: #262626;
            --text-primary: #f3f4f6;
            --text-secondary: #d1d5db;
            --border-color: #404040;
            --overlay-bg: rgba(0, 0, 0, 0.7);
            --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
        }
        
        /* Light theme */
        @media (prefers-color-scheme: light) {
            :root {
                --bg-light: #f8fafc;
                --bg-white: #ffffff;
                --text-primary: #1f2937;
                --text-secondary: #6b7280;
                --border-color: #e5e7eb;
                --overlay-bg: rgba(0, 0, 0, 0.5);
                --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
            }
        }
        
        .code-analyzer-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: var(--overlay-bg);
            z-index: 999998;
            animation: code-analyzer-fadeIn 0.2s ease-out;
        }
        
        @keyframes code-analyzer-fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .code-analyzer-modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--bg-white);
            border-radius: 16px;
            padding: 0;
            box-shadow: var(--shadow-lg);
            width: 90vw;
            max-width: 700px;
            max-height: 90vh;
            overflow-y: auto;
            z-index: 999999;
            animation: code-analyzer-slideIn 0.3s ease-out;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        }
        
        @keyframes code-analyzer-slideIn {
            from {
                opacity: 0;
                transform: translate(-50%, -48%);
            }
            to {
                opacity: 1;
                transform: translate(-50%, -50%);
            }
        }
        
        .code-analyzer-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 28px;
            border-bottom: 1px solid var(--border-color);
            flex-shrink: 0;
        }
        
        .code-analyzer-header-content {
            flex: 1;
        }
        
        .code-analyzer-header h1 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 4px;
            color: var(--text-primary);
            margin: 0;
        }
        
        .code-analyzer-subtitle {
            font-size: 13px;
            color: var(--text-secondary);
            margin: 0;
        }
        
        .code-analyzer-close-btn {
            background: none;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: var(--text-secondary);
            padding: 0;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            transition: all 0.2s ease;
        }
        
        .code-analyzer-close-btn:hover {
            background: var(--bg-light);
            color: var(--text-primary);
        }
        
        .code-analyzer-content {
            padding: 28px;
            flex: 1;
            overflow-y: auto;
        }
        
        .code-analyzer-loading {
            text-align: center;
            padding: 40px 20px;
        }
        
        .code-analyzer-spinner {
            width: 48px;
            height: 48px;
            border: 4px solid #f0f0f0;
            border-top: 4px solid var(--primary-color);
            border-radius: 50%;
            animation: code-analyzer-spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        
        @keyframes code-analyzer-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .code-analyzer-loading p {
            color: var(--text-secondary);
            font-size: 15px;
            margin: 0;
        }
        
        .code-analyzer-results {
            animation: code-analyzer-fadeIn 0.3s ease-out;
        }
        
        .code-analyzer-complexity-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 20px;
        }
        
        .code-analyzer-complexity-card {
            background: var(--bg-light);
            border: 2px solid var(--border-color);
            border-radius: 12px;
            padding: 16px;
            transition: all 0.2s ease;
        }
        
        .code-analyzer-complexity-card:hover {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
        }
        
        .code-analyzer-complexity-card.time-card {
            border-left: 4px solid #f59e0b;
        }
        
        .code-analyzer-complexity-card.space-card {
            border-left: 4px solid #10b981;
        }
        
        .code-analyzer-complexity-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 10px;
        }
        
        .code-analyzer-complexity-icon {
            font-size: 18px;
        }
        
        .code-analyzer-complexity-header h3 {
            font-size: 13px;
            font-weight: 600;
            color: var(--text-secondary);
            margin: 0;
        }
        
        .code-analyzer-complexity-value {
            font-size: 22px;
            font-weight: 700;
            font-family: 'Courier New', 'Monaco', monospace;
            background: var(--bg-white);
            padding: 10px 12px;
            border-radius: 6px;
            border: 1px solid var(--border-color);
            color: var(--primary-color);
            margin: 0;
            word-break: break-all;
        }
        
        .code-analyzer-explanation-section {
            background: var(--bg-light);
            border-radius: 12px;
            padding: 12px;
            border: 1px solid var(--border-color);
            margin-bottom: 20px;
        }
        
        .code-analyzer-explanation-toggle-btn {
            width: 100%;
            background: transparent;
            border: none;
            padding: 10px 12px;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 14px;
            font-weight: 600;
            color: var(--primary-color);
            transition: all 0.2s ease;
        }
        
        .code-analyzer-explanation-toggle-btn:hover {
            background: rgba(102, 126, 234, 0.1);
        }
        
        .code-analyzer-toggle-icon {
            display: inline-block;
            transition: transform 0.3s ease;
            font-size: 12px;
        }
        
        .code-analyzer-explanation-toggle-btn[aria-expanded="true"] .code-analyzer-toggle-icon {
            transform: rotate(180deg);
        }
        
        .code-analyzer-explanation-content {
            display: none;
            padding: 12px 0 0 0;
            border-top: 1px solid var(--border-color);
            margin-top: 12px;
            max-height: 300px;
            overflow-y: auto;
        }
        
        .code-analyzer-explanation-content.show {
            display: block;
        }
        
        .code-analyzer-explanation-text {
            font-size: 13px;
            line-height: 1.7;
            color: var(--text-primary);
            white-space: pre-wrap;
            word-wrap: break-word;
            margin: 0;
            padding: 12px 0;
        }
        
        .code-analyzer-error {
            text-align: center;
            padding: 40px 20px;
        }
        
        .code-analyzer-error-icon {
            font-size: 48px;
            margin-bottom: 16px;
        }
        
        .code-analyzer-error-text {
            color: var(--error-color);
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        
        .code-analyzer-btn {
            padding: 12px 20px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            outline: none;
            display: inline-block;
            text-align: center;
        }
        
        .code-analyzer-btn:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
        }
        
        .code-analyzer-btn-primary {
            background: var(--primary-gradient);
            color: white;
            width: 100%;
        }
        
        .code-analyzer-btn-secondary {
            background: var(--bg-light);
            color: var(--text-primary);
            border: 2px solid var(--border-color);
            width: 100%;
            margin-top: 12px;
        }
        
        .code-analyzer-btn-secondary:hover {
            border-color: var(--primary-color);
            background: rgba(102, 126, 234, 0.05);
        }
        
        .code-analyzer-hidden {
            display: none !important;
        }
        
        @media (max-width: 640px) {
            .code-analyzer-modal {
                width: 95vw;
                max-width: 100%;
                max-height: 95vh;
                border-radius: 12px;
            }
            
            .code-analyzer-header {
                padding: 16px 20px;
            }
            
            .code-analyzer-header h1 {
                font-size: 20px;
            }
            
            .code-analyzer-content {
                padding: 20px;
            }
            
            .code-analyzer-complexity-grid {
                grid-template-columns: 1fr;
            }
            
            .code-analyzer-complexity-value {
                font-size: 20px;
            }
            
            .code-analyzer-close-btn {
                width: 36px;
                height: 36px;
                font-size: 24px;
            }
        }
    `;
    
    document.head.appendChild(styleElement);
    log('Modal styles injected into page');
}

// Create the modal HTML structure
function createModalHTML() {
    const container = document.createElement('div');
    container.id = 'code-analyzer-container';
    container.innerHTML = `
        <div class="code-analyzer-modal-overlay"></div>
        <div class="code-analyzer-modal">
            <div class="code-analyzer-header">
                <div class="code-analyzer-header-content">
                    <h1>⚙️ Complexity Analyzer</h1>
                    <p class="code-analyzer-subtitle">Analyze code complexity</p>
                </div>
                <button class="code-analyzer-close-btn" id="code-analyzer-close-btn" aria-label="Close popup">&times;</button>
            </div>
            
            <div class="code-analyzer-content">
                <div id="code-analyzer-loading" class="code-analyzer-loading code-analyzer-hidden">
                    <div class="code-analyzer-spinner"></div>
                    <p>Analyzing code...</p>
                </div>
                
                <div id="code-analyzer-results" class="code-analyzer-results code-analyzer-hidden">
                    <div class="code-analyzer-complexity-grid">
                        <div class="code-analyzer-complexity-card time-card">
                            <div class="code-analyzer-complexity-header">
                                <span class="code-analyzer-complexity-icon">⏱️</span>
                                <h3>Time Complexity</h3>
                            </div>
                            <p class="code-analyzer-complexity-value" id="code-analyzer-time-complexity">—</p>
                        </div>
                        <div class="code-analyzer-complexity-card space-card">
                            <div class="code-analyzer-complexity-header">
                                <span class="code-analyzer-complexity-icon">💾</span>
                                <h3>Space Complexity</h3>
                            </div>
                            <p class="code-analyzer-complexity-value" id="code-analyzer-space-complexity">—</p>
                        </div>
                    </div>
                    
                    <div class="code-analyzer-explanation-section">
                        <button class="code-analyzer-explanation-toggle-btn" id="code-analyzer-toggle-btn" aria-expanded="false">
                            Details <span class="code-analyzer-toggle-icon">▼</span>
                        </button>
                        <div class="code-analyzer-explanation-content" id="code-analyzer-explanation-content">
                            <p class="code-analyzer-explanation-text" id="code-analyzer-explanation-text"></p>
                        </div>
                    </div>
                    
                    <button class="code-analyzer-btn code-analyzer-btn-secondary" id="code-analyzer-analyze-again">Analyze Another Code</button>
                </div>
                
                <div id="code-analyzer-error" class="code-analyzer-error code-analyzer-hidden">
                    <div class="code-analyzer-error-icon">❌</div>
                    <p class="code-analyzer-error-text" id="code-analyzer-error-message">An error occurred</p>
                    <button class="code-analyzer-btn code-analyzer-btn-primary" id="code-analyzer-retry-btn">Try Again</button>
                </div>
            </div>
        </div>
    `;
    
    return container;
}

// Show modal on page
function showModal() {
    if (!document.getElementById('code-analyzer-container')) {
        injectModalStyles();
        const modal = createModalHTML();
        document.body.appendChild(modal);
        
        // Attach event listeners
        document.getElementById('code-analyzer-close-btn').addEventListener('click', closeModal);
        document.querySelector('.code-analyzer-modal-overlay').addEventListener('click', closeModal);
        document.getElementById('code-analyzer-toggle-btn').addEventListener('click', toggleModalExplanation);
        document.getElementById('code-analyzer-analyze-again').addEventListener('click', closeModal);
        document.getElementById('code-analyzer-retry-btn').addEventListener('click', analyzeModalCode);
        
        log('Modal created and attached to page');
    }
    document.getElementById('code-analyzer-container').style.display = 'block';
}

function closeModal() {
    const container = document.getElementById('code-analyzer-container');
    if (container) {
        container.style.display = 'none';
    }
    log('Modal closed');
}

function toggleModalExplanation() {
    const content = document.getElementById('code-analyzer-explanation-content');
    const btn = document.getElementById('code-analyzer-toggle-btn');
    
    if (content.classList.contains('show')) {
        content.classList.remove('show');
        btn.setAttribute('aria-expanded', 'false');
    } else {
        content.classList.add('show');
        btn.setAttribute('aria-expanded', 'true');
    }
}

function showModalLoading() {
    document.getElementById('code-analyzer-loading').classList.remove('code-analyzer-hidden');
    document.getElementById('code-analyzer-results').classList.add('code-analyzer-hidden');
    document.getElementById('code-analyzer-error').classList.add('code-analyzer-hidden');
}

function showModalResults(data) {
    document.getElementById('code-analyzer-time-complexity').textContent = data.time || '—';
    document.getElementById('code-analyzer-space-complexity').textContent = data.space || '—';
    document.getElementById('code-analyzer-explanation-text').textContent = data.explanation || '';
    
    document.getElementById('code-analyzer-loading').classList.add('code-analyzer-hidden');
    document.getElementById('code-analyzer-results').classList.remove('code-analyzer-hidden');
    document.getElementById('code-analyzer-error').classList.add('code-analyzer-hidden');
    
    // Reset explanation toggle
    document.getElementById('code-analyzer-explanation-content').classList.remove('show');
    document.getElementById('code-analyzer-toggle-btn').setAttribute('aria-expanded', 'false');
}

function showModalError(message) {
    document.getElementById('code-analyzer-error-message').textContent = message;
    document.getElementById('code-analyzer-loading').classList.add('code-analyzer-hidden');
    document.getElementById('code-analyzer-results').classList.add('code-analyzer-hidden');
    document.getElementById('code-analyzer-error').classList.remove('code-analyzer-hidden');
}

async function analyzeModalCode() {
    showModal();
    showModalLoading();
    
    const code = extractCode();
    if (!code) {
        showModalError('Could not extract code from this page. Make sure you are on LeetCode or HackerRank.');
        return;
    }
    
    try {
        const response = await analyzeCodeViaAPI(code);
        const { time, space, explanation } = extractComplexityData(response);
        showModalResults({ time, space, explanation });
    } catch (error) {
        logError('Analysis failed', error.message);
        showModalError(`Error: ${error.message}`);
    }
}

function extractComplexityData(response) {
    log('Extracting complexity data from response', response);
    
    let explanation = '';
    let time = 'Unknown';
    let space = 'Unknown';
    
    // Handle both response.result and response.data.result formats
    const resultText = response?.data?.result || response?.result;
    
    if (resultText) {
        explanation = resultText;
        log('Explanation text extracted, length:', explanation.length);
        
        // Extract Time Complexity section and find the O(...) notation
        const timeSection = explanation.match(/Time Complexity[:\s]+([^]*?)(?=Space Complexity|In summary|$)/i);
        if (timeSection) {
            const timeText = timeSection[1];
            // Look for O(...) pattern
            const timeMatch = timeText.match(/O\([^)]*\)/);
            if (timeMatch) {
                time = timeMatch[0].trim();
            }
        }
        log('Time complexity found:', time);
        
        // Extract Space Complexity section and find the O(...) notation
        const spaceSection = explanation.match(/Space Complexity[:\s]+([^]*?)(?=In summary|$)/i);
        if (spaceSection) {
            const spaceText = spaceSection[1];
            // Look for O(...) pattern
            const spaceMatch = spaceText.match(/O\([^)]*\)/);
            if (spaceMatch) {
                space = spaceMatch[0].trim();
            }
        }
        log('Space complexity found:', space);
    } else {
        log('No result found in response');
    }
    
    log('Extracted data:', { time, space, explanationLength: explanation.length });
    return { time, space, explanation };
}

/**
 * Extract code from the current editor
 * Supports LeetCode, HackerRank, and other platforms
 * @returns {string|null} Extracted code or null if not found
 */
function extractCode() {
    log('=== Starting code extraction ===');
    
    // Try LeetCode Monaco editor first
    log('Attempting LeetCode Monaco editor extraction...');
    const monacoEditor = document.querySelector('.monaco-editor');
    if (monacoEditor) {
        log('Monaco editor found! Attempting to extract...');
        const code = extractLeetCodeCode();
        if (code) {
            log('LeetCode extraction successful! Code length:', code.length);
            return code;
        }
        log('LeetCode extraction failed, trying next method...');
    }
    log('Monaco editor not found');

    // Try HackerRank code editor
    log('Attempting HackerRank code editor extraction...');
    const hackerRankEditor = document.querySelector('[id*="rce"]');
    if (hackerRankEditor) {
        log('HackerRank editor element found! Attempting to extract...');
        const code = extractHackerRankCode();
        if (code) {
            log('HackerRank extraction successful! Code length:', code.length);
            return code;
        }
        log('HackerRank extraction failed, trying next method...');
    }
    log('HackerRank editor not found');

    // Fallback: Try to find any textarea with code
    log('Attempting textarea extraction...');
    const codeTextarea = document.querySelector('textarea[data-testid="code-input"]');
    if (codeTextarea && codeTextarea.value) {
        log('Textarea with code found! Code length:', codeTextarea.value.length);
        return codeTextarea.value.trim();
    }
    log('No textarea with code found');

    // Fallback: Try any contenteditable div
    log('Attempting contenteditable div extraction...');
    const editableDiv = document.querySelector('[contenteditable="true"][class*="code"], [contenteditable="true"][class*="editor"]');
    if (editableDiv && editableDiv.textContent) {
        log('Contenteditable div found! Code length:', editableDiv.textContent.length);
        return editableDiv.textContent.trim();
    }
    log('No contenteditable div found');

    // Generic fallback: search for common code editor patterns
    log('Attempting generic code editor extraction...');
    const genericCode = extractFromGenericEditor();
    if (genericCode) {
        log('Generic extraction successful! Code length:', genericCode.length);
        return genericCode;
    }
    
    logError('=== Code extraction failed - no code found ===');
    return null;
}

/**
 * Extract code from LeetCode's Monaco editor
 * @returns {string|null} Code from LeetCode editor or null
 */
function extractLeetCodeCode() {
    try {
        log('[LeetCode] Starting extraction...');
        const monacoEditor = document.querySelector('.monaco-editor');
        if (!monacoEditor) {
            log('[LeetCode] Monaco editor element not found');
            return null;
        }

        // Try to access Monaco's editor instance
        if (window.monaco && window.monaco.editor) {
            log('[LeetCode] Accessing Monaco global instance...');
            const editors = window.monaco.editor.getEditors();
            log('[LeetCode] Found', editors.length, 'editor instances');
            if (editors.length > 0) {
                const code = editors[0].getValue();
                log('[LeetCode] Code extracted from Monaco instance, length:', code.length);
                return code || null;
            }
        } else {
            log('[LeetCode] window.monaco not available');
        }

        // Fallback: Extract text content from the editor
        log('[LeetCode] Trying DOM-based extraction...');
        const editorContent = document.querySelector('.view-lines');
        if (editorContent) {
            let code = '';
            const lines = editorContent.querySelectorAll('.view-line');
            log('[LeetCode] Found', lines.length, 'line elements');
            lines.forEach(line => {
                code += line.textContent + '\n';
            });
            const trimmedCode = code.trim();
            log('[LeetCode] DOM-based extraction successful, length:', trimmedCode.length);
            return trimmedCode || null;
        } else {
            log('[LeetCode] .view-lines not found');
        }

        return null;
    } catch (error) {
        logError('[LeetCode] Exception during extraction:', error);
        return null;
    }
}

/**
 * Extract code from HackerRank's code editor
 * @returns {string|null} Code from HackerRank editor or null
 */
function extractHackerRankCode() {
    try {
        log('[HackerRank] Starting extraction...');
        
        // Approach 1: Look for contenteditable divs with code
        log('[HackerRank] Searching contenteditable elements...');
        const editableElements = document.querySelectorAll('[contenteditable="true"]');
        log('[HackerRank] Found', editableElements.length, 'contenteditable elements');
        for (let elem of editableElements) {
            const text = elem.textContent;
            if (text && (text.includes('function') || text.includes('class') || text.includes('def'))) {
                log('[HackerRank] Code found in contenteditable element, length:', text.length);
                return text.trim();
            }
        }
        log('[HackerRank] No contenteditable elements with code found');

        // Approach 2: Look for hidden textareas
        log('[HackerRank] Searching textarea elements...');
        const textareas = document.querySelectorAll('textarea');
        log('[HackerRank] Found', textareas.length, 'textarea elements');
        for (let textarea of textareas) {
            const code = textarea.value;
            if (code && (code.includes('function') || code.includes('class') || code.includes('def'))) {
                log('[HackerRank] Code found in textarea, length:', code.length);
                return code.trim();
            }
        }
        log('[HackerRank] No textarea with code found');

        // Approach 3: Look for code containers
        log('[HackerRank] Searching code containers...');
        const codeContainers = document.querySelectorAll('[class*="code"], [id*="code"]');
        log('[HackerRank] Found', codeContainers.length, 'code container elements');
        for (let container of codeContainers) {
            const text = container.textContent;
            if (text && text.length > 10) {
                log('[HackerRank] Code found in container, length:', text.length);
                return text.trim();
            }
        }
        log('[HackerRank] No code containers found');

        return null;
    } catch (error) {
        logError('[HackerRank] Exception during extraction:', error);
        return null;
    }
}

/**
 * Generic fallback to extract code from common editor patterns
 * @returns {string|null} Extracted code or null
 */
function extractFromGenericEditor() {
    try {
        log('[Generic] Starting generic extraction...');
        
        // Look for pre tags with code
        log('[Generic] Searching pre elements...');
        const preElements = document.querySelectorAll('pre');
        log('[Generic] Found', preElements.length, 'pre elements');
        for (let pre of preElements) {
            const text = pre.textContent;
            if (text && text.length > 20) {
                log('[Generic] Code found in pre element, length:', text.length);
                return text.trim();
            }
        }
        log('[Generic] No suitable pre elements found');

        // Look for code tags
        log('[Generic] Searching code elements...');
        const codeElements = document.querySelectorAll('code');
        log('[Generic] Found', codeElements.length, 'code elements');
        for (let code of codeElements) {
            const text = code.textContent;
            if (text && text.length > 20) {
                log('[Generic] Code found in code element, length:', text.length);
                return text.trim();
            }
        }
        log('[Generic] No suitable code elements found');

        // Look for any element with class containing "editor" or "code"
        log('[Generic] Searching editor/code class elements...');
        const allElements = document.querySelectorAll('[class*="editor"], [class*="code"]');
        log('[Generic] Found', allElements.length, 'editor/code class elements');
        for (let elem of allElements) {
            const text = elem.textContent;
            if (text && text.length > 20 && (text.includes('function') || text.includes('class') || text.includes('def'))) {
                log('[Generic] Code found, length:', text.length);
                return text.trim();
            }
        }
        log('[Generic] No suitable elements found');

        return null;
    } catch (error) {
        logError('[Generic] Exception during extraction:', error);
        return null;
    }
}

/**
 * Listen for messages from popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    log('Message received from popup:', request.action);
    
    if (request.action === 'extractCode') {
        try {
            log('Processing "extractCode" request...');
            const code = extractCode();
            
            if (code) {
                log('Successfully extracted code, length:', code.length);
                log('Sending response to popup with code');
                sendResponse({ code: code });
            } else {
                logError('Failed to extract code');
                log('Sending error response to popup');
                sendResponse({ error: 'Unable to extract code from the editor.' });
            }
        } catch (error) {
            logError('Exception in message listener:', error);
            log('Sending error response to popup');
            sendResponse({ error: 'Error extracting code.' });
        }
    } 
    else if (request.action === 'analyzeCode') {
        try {
            log('Processing "analyzeCode" request...');
            log('Code to analyze, length:', request.code.length);
            
            // Call API from content script context
            analyzeCodeViaAPI(request.code).then(result => {
                log('API analysis complete, sending result to popup');
                sendResponse(result);
            }).catch(error => {
                logError('API analysis failed:', error.message);
                sendResponse({ 
                    success: false, 
                    error: error.message 
                });
            });
            
            // Return true to indicate we'll send response asynchronously
            return true;
        } catch (error) {
            logError('Exception in analyzeCode handler:', error);
            sendResponse({ 
                success: false, 
                error: 'Error analyzing code.' 
            });
        }
    }
    else if (request.action === 'showAnalyzerModal') {
        try {
            log('Processing "showAnalyzerModal"request...');
            analyzeModalCode();
            sendResponse({ success: true });
        } catch (error) {
            logError('Exception in showAnalyzerModal handler:', error);
            sendResponse({ 
                success: false, 
                error: 'Error showing analyzer modal.' 
            });
        }
    }
});

/**
 * Send code to API for complexity analysis via proxy server
 * @param {string} code - The code to analyze
 * @returns {Promise} Promise that resolves with analysis results
 */
async function analyzeCodeViaAPI(code) {
    // IMPORTANT: Replace this with your proxy server URL
    // Examples:
    // - Local development: http://localhost:3000
    // - Railway (Production): https://your-app-name.railway.app
    // - Render: https://your-app-name.onrender.com
    // 
    // See RAILWAY_DEPLOYMENT.md for full deployment instructions
    const PROXY_SERVER = 'http://localhost:3000';
    const PROXY_ENDPOINT = PROXY_SERVER + '/analyze';
    
    try {
        log('[API] Starting complexity analysis via proxy server...');
        log('[API] Code length:', code.length);
        log('[API] Proxy server:', PROXY_SERVER);
        
        const requestPayload = {
            code: code
        };
        log('[API] Request payload prepared');

        log('[API] Sending POST request to proxy server:', PROXY_ENDPOINT);
        const response = await fetch(PROXY_ENDPOINT, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(requestPayload)
        });

        log('[API] Proxy response received', { status: response.status, statusText: response.statusText });

        if (!response.ok) {
            logError('[API] Error response', `Status ${response.status}: ${response.statusText}`);
            throw new Error(`Proxy server responded with status ${response.status}`);
        }

        log('[API] Parsing JSON response...');
        const data = await response.json();
        log('[API] JSON parsed successfully:', data);
        
        if (data.success && data.data) {
            log('[API] Analysis successful via proxy server');
            return {
                success: true,
                data: data.data
            };
        } else {
            throw new Error(data.error || 'Unknown error from proxy server');
        }
        
    } catch (error) {
        logError('[API] Exception during analysis:', error.message);
        // Provide helpful error message
        if (error.message.includes('Failed to fetch')) {
            logError('[API] Failed to connect to proxy server. Make sure it is running at:', PROXY_SERVER);
        }
        throw error;
    }
}

log('Message listener registered - ready to receive requests from popup');
