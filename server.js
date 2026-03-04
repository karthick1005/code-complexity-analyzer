/**
 * CORS Proxy Server for Code Complexity Analyzer
 * Handles requests from the Chrome extension and forwards them to multiple analysis APIs
 * Can be deployed to: Heroku, Railway, Render, or any Node.js hosting
 */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Target API endpoints
const BIGOCAL_API = 'https://daleseo-bigocalc.web.val.run/';
const TIMECOMPLEXITY_API = 'https://www.timecomplexity.ai/api/analyze';

console.log('[Server] Code Complexity Analyzer Proxy Server');
console.log('[Server] BigOCalc API:', BIGOCAL_API);
console.log('[Server] TimeComplexity API:', TIMECOMPLEXITY_API);

/**
 * Generate a UUID v4 for session ID
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * POST /analyze - Forward code analysis request to both APIs
 * Body: { code: "user_code_here" }
 * Returns: { success: true, bigocal: {...}, timecomplexity: {...} }
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

        // Generate a session ID for TimeComplexity API
        const sessionId = generateUUID();

        // Call both APIs in parallel
        console.log('[Server] Calling both analysis APIs...');
        const results = await Promise.allSettled([
            // Call BigOCalc API
            fetch(BIGOCAL_API, {
                method: 'POST',
                headers: {
                    'accept': '*/*',
                    'content-type': 'application/json',
                    'origin': 'https://www.bigocalc.com',
                    'referer': 'https://www.bigocalc.com/'
                },
                body: JSON.stringify({ code: code })
            }).then(r => {
                if (!r.ok) throw new Error(`BigOCalc API error: ${r.status}`);
                return r.json().then(data => ({ source: 'bigocal', data }));
            }),
            
            // Call TimeComplexity API
            fetch(TIMECOMPLEXITY_API, {
                method: 'POST',
                headers: {
                    'accept': '*/*',
                    'accept-language': 'en-GB,en;q=0.6',
                    'cache-control': 'no-cache',
                    'content-type': 'application/json',
                    'origin': 'https://www.timecomplexity.ai',
                    'pragma': 'no-cache',
                    'priority': 'u=1, i',
                    'referer': 'https://www.timecomplexity.ai/?id=' + sessionId,
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    'sec-gpc': '1',
                    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
                    'x-session-id': sessionId
                },
                body: JSON.stringify({ inputCode: code })
            }).then(r => {
                if (!r.ok) throw new Error(`TimeComplexity API error: ${r.status}`);
                return r.json().then(data => ({ source: 'timecomplexity', data }));
            })
        ]);

        console.log('[Server] API calls completed');

        // Process results
        const response = {
            success: true,
            bigocal: null,
            timecomplexity: null,
            errors: []
        };

        results.forEach(result => {
            if (result.status === 'fulfilled') {
                const { source, data } = result.value;
                if (source === 'bigocal') {
                    response.bigocal = data;
                    console.log('[Server] BigOCalc result received');
                } else if (source === 'timecomplexity') {
                    response.timecomplexity = data;
                    console.log('[Server] TimeComplexity result received');
                }
            } else {
                const source = result.reason.message.includes('BigOCalc') ? 'bigocal' : 'timecomplexity';
                response.errors.push(`${source}: ${result.reason.message}`);
                console.error(`[Server] ${source} error:`, result.reason.message);
            }
        });

        // If at least one API succeeded, return success
        if (response.bigocal || response.timecomplexity) {
            res.json(response);
        } else {
            res.status(500).json({
                success: false,
                error: 'All analysis APIs failed',
                errors: response.errors
            });
        }

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
