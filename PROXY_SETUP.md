# Setting Up the Proxy Server

The Chrome extension needs a backend proxy server to forward API requests, since direct requests from the extension are blocked by the API's CORS policy.

## 🚀 Quick Start (Local Development)

### Option 1: Run Locally (for testing)

**Step 1: Install Node.js**
- Download from https://nodejs.org/
- Install the LTS version
- Verify installation: `node --version`

**Step 2: Install dependencies**
```bash
cd ~/Desktop/Developer/Learnings/Extension
npm install
```

**Step 3: Start the server**
```bash
npm start
```

You should see:
```
[Server] Code Complexity Analyzer Proxy Server
[Server] Target API: https://daleseo-bigocalc.web.val.run/
[Server] Proxy server running on http://localhost:3000
```

**Step 4: Test the server**
Open in browser: http://localhost:3000/health

Should return:
```json
{
  "status": "ok",
  "message": "Code Complexity Analyzer Proxy is running"
}
```

**Step 5: Use the extension**
- Extension will use http://localhost:3000 automatically
- Write code on LeetCode/HackerRank
- Click extension → "Analyze Code"
- Should work now! ✅

---

## 🌐 Deploy to Production (Free Services)

For production use, deploy to one of these free services and update the proxy URL in content.js:

### Option A: Deploy to Railway (Recommended - Easiest)

**Step 1: Create Railway Account**
- Go to https://railway.app
- Sign up with GitHub

**Step 2: Connect Repository**
- Click "New Project"
- Select "Deploy from GitHub"
- Authorize and select your repo

**Step 3: Configure**
- Railway auto-detects Node.js
- Sets PORT from environment
- Auto-deploys on push

**Step 4: Get URL**
- Your URL will be something like: `https://your-app-name.up.railway.app`

**Step 5: Update Extension**
Edit `content.js` line with:
```javascript
const PROXY_SERVER = 'https://your-app-name.up.railway.app';
```

---

### Option B: Deploy to Netlify Functions

**Step 1: Create Netlify Account**
- Go to https://netlify.com
- Sign up

**Step 2: Create Functions**
- Create `netlify/functions/analyze.js`:

```javascript
exports.handler = async (event) => {
    const fetch = require('node-fetch');
    
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method not allowed' };
    }
    
    try {
        const { code } = JSON.parse(event.body);
        
        const response = await fetch('https://daleseo-bigocalc.web.val.run/', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'origin': 'https://www.bigocalc.com',
                'referer': 'https://www.bigocalc.com/'
            },
            body: JSON.stringify({ code })
        });
        
        const data = await response.json();
        
        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, data })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};
```

**Step 3: Connect to Git**
- Push to GitHub
- Netlify auto-deploys

**Step 4: Update Extension**
```javascript
const PROXY_SERVER = 'https://your-site.netlify.app';
```

---

### Option C: Deploy to Heroku (Free tier ended, use Railway instead)

---

## 📝 How to Update the Proxy URL

Once deployed, edit `content.js`:

```javascript
// Find this line (around line 260):
const PROXY_SERVER = 'http://localhost:3000';

// Change to your deployed URL:
const PROXY_SERVER = 'https://your-deployed-server.com';
```

Then reload the extension in Chrome.

---

## 🧪 Testing the Proxy

### Test with curl:
```bash
curl -X POST http://localhost:3000/analyze \
  -H "Content-Type: application/json" \
  -d '{"code":"function test(){return 1;}"}'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "time": "O(1)",
    "space": "O(1)"
  }
}
```

### Test via browser:
Open DevTools on http://localhost:3000 and run:
```javascript
fetch('http://localhost:3000/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'function test(){return 1;}' })
})
.then(r => r.json())
.then(d => console.log(d))
```

---

## ⚠️ Troubleshooting

### "Failed to connect to proxy server"
- Make sure server is running: `npm start`
- Check URL in content.js matches your server

### "Connection refused"
- Is server running? (Should see "Proxy server running on...")
- Is port 3000 in use? Try different port in server.js

### Extension can't reach deployed server
- Check the URL is correct
- Make sure server is deployed and running
- Check browser console for CORS errors

### Server crashes
- Check Node version: `node --version` (needs v14+)
- Check dependencies installed: `npm install`
- Check server.js for errors: `npm start`

---

## 📊 How It Works

```
Chrome Extension (popup)
        ↓
Content Script (on LeetCode)
        ↓
Your Proxy Server
        ↓
BigO Calculator API
        ↓
Response sent back through proxy to extension
```

The proxy server:
1. Receives code from your extension
2. Forwards to BigO Calculator API with proper headers
3. Returns results to your extension
4. Handles CORS so extension can access it

---

## 🔒 Security Notes

- Proxy server doesn't store any data
- Code is only in memory during processing
- Each request is independent
- No user tracking or logging

---

## 🎯 Next Steps

1. **For local testing**: Run `npm start` now
2. **For production**: Deploy to Railway/Netlify
3. **Update extension**: Change PROXY_SERVER URL
4. **Test**: Use the extension on LeetCode
5. **Debug**: Check console logs in DevTools

---

Need help deploying? The easiest is **Railway** - just connect your GitHub repo and it auto-deploys! 🚀
