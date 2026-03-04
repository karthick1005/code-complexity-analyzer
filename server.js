/**
 * CORS Proxy Server for Code Complexity Analyzer
 * Handles requests from the Chrome extension and forwards them to the BigO Calculator API
 * Can be deployed to: Heroku, Railway, Render, or any Node.js hosting
 */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Target API endpoint
const TARGET_API = 'https://daleseo-bigocalc.web.val.run/';

console.log('[Server] Code Complexity Analyzer Proxy Server');
console.log('[Server] Target API:', TARGET_API);

/**
 * POST /analyze - Forward code analysis request to BigO Calculator API
 * Body: { code: "user_code_here" }
 * Returns: { time: "O(n)", space: "O(n)" }
 */
app.post('/analyze', async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ 
                error: 'Code is required',
                success: false 
            });
        }

        console.log('[Server] Received analysis request, code length:', code.length);

        // Forward request to target API
        console.log('[Server] Forwarding to target API...');
        const response = await fetch(TARGET_API, {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'content-type': 'application/json',
                'origin': 'https://www.bigocalc.com',
                'referer': 'https://www.bigocalc.com/'
            },
            body: JSON.stringify({ code: code })
        });

        console.log('[Server] Target API response:', response.status, response.statusText);

        if (!response.ok) {
            throw new Error(`Target API responded with ${response.status}`);
        }

        const data = await response.json();
        console.log('[Server] Analysis result:', data);

        // Forward the response
        res.json({
            success: true,
            data: data
        });

    } catch (error) {
        console.error('[Server] Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /health - Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Code Complexity Analyzer Proxy is running' });
});

/**
 * GET / - Root endpoint with instructions
 */
app.get('/', (req, res) => {
    res.json({
        name: 'Code Complexity Analyzer Proxy',
        version: '1.0.0',
        description: 'CORS proxy for Code Complexity Analyzer Chrome Extension',
        endpoints: {
            'POST /analyze': 'Analyze code complexity',
            'GET /health': 'Health check'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('[Server] Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[Server] Proxy server running on http://localhost:${PORT}`);
    console.log(`[Server] Health check: http://localhost:${PORT}/health`);
});
