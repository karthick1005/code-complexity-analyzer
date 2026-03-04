/**
 * background.js - Service Worker for Code Complexity Analyzer
 * Handles background tasks and event listeners for the extension
 */

// Debug logging
const DEBUG = true;

function log(message, data = '') {
    if (DEBUG) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] [ServiceWorker] ${message}`, data);
    }
}

log('Service worker initialized');

/**
 * Listen for extension installation
 */
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        log('Extension installed');
    } else if (details.reason === 'update') {
        log('Extension updated');
    }
});

/**
 * Handle extension icon click
 * Opens the complexity analyzer modal on the current page
 */
function triggerAnalyzer(tab) {
    log('Triggering complexity analyzer on tab:', tab.id);
    
    // Send message to content script to show modal
    chrome.tabs.sendMessage(tab.id, {
        action: 'showAnalyzerModal'
    }).catch((error) => {
        log('Could not reach content script, injecting it now...');
        
        // If content script not loaded, inject it
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        }).then(() => {
            // After injection, try again
            chrome.tabs.sendMessage(tab.id, {
                action: 'showAnalyzerModal'
            });
        }).catch(err => {
            log('Failed to inject content script or send message:', err.message);
        });
    });
}

chrome.action.onClicked.addListener((tab) => {
    log('Extension icon clicked on tab:', tab.id);
    triggerAnalyzer(tab);
});

/**
 * Check if URL is on a supported coding platform
 */
function isSupportedPlatform(url) {
    const supportedDomains = [
        'leetcode.com',
        'hackerrank.com'
    ];
    
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;
        
        // Check if hostname matches any supported domain
        const isSupported = supportedDomains.some(domain => 
            hostname.includes(domain)
        );
        
        log('URL check:', { url: hostname, isSupported });
        return isSupported;
    } catch (error) {
        log('Error checking URL:', error.message);
        return false;
    }
}

/**
 * Listen for keyboard command
 */
chrome.commands.onCommand.addListener((command) => {
    if (command === 'analyze-code') {
        log('Keyboard command "analyze-code" triggered');
        
        // Get the active tab and check if it's a supported platform
        chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
            if (tabs.length > 0) {
                const tab = tabs[0];
                
                // Only trigger on supported platforms
                if (isSupportedPlatform(tab.url)) {
                    log('Platform is supported, triggering analyzer');
                    triggerAnalyzer(tab);
                } else {
                    log('Platform is not supported, ignoring command');
                }
            } else {
                log('No active tab found');
            }
        }).catch((error) => {
            log('Error getting active tab:', error.message);
        });
    }
});

/**
 * Listen for messages from other parts of the extension
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // You can add background processing logic here if needed
    // For now, this serves as a placeholder for future enhancements
    
    log('Message received in service worker:', request.action);
    
    if (request.action === 'complexityAnalysis') {
        // Handle any background processing needed for complexity analysis
        log('Processing complexity analysis request');
        sendResponse({ status: 'processed' });
    }
});

/**
 * Listen for tab activation
 */
chrome.tabs.onActivated.addListener((activeInfo) => {
    // You can add logic here to enable/disable the extension icon based on the current tab
    log('Tab activated:', activeInfo.tabId);
});

log('Background service worker ready for requests');
