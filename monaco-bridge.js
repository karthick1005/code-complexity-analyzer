/**
 * monaco-bridge.js - Injected into page to access Monaco editor
 * This file runs in the main page context and can access window.monaco
 */

// Handle requests for Monaco code
window.addEventListener('__monacoCodeRequest', () => {
    let code = null;
    
    try {
        if (window.monaco && window.monaco.editor) {
            const editors = window.monaco.editor.getEditors();
            if (editors.length > 0) {
                code = editors[0].getValue();
            }
        }
    } catch (error) {
        console.error('[Monaco Bridge] Error accessing Monaco:', error);
    }
    
    // Send response back to content script
    window.dispatchEvent(new CustomEvent('__monacoCodeResponse', {
        detail: { code: code }
    }));
});

console.log('[Monaco Bridge] Injected and listening for code requests');
