# Deploy to Railway

Follow these steps to deploy your backend to Railway:

## **Step 1: Initialize Git Repository**
```bash
cd ~/Desktop/Developer/Learnings/Extension
git init
git add .
git commit -m "Initial commit - Code Complexity Analyzer backend"
```

## **Step 2: Create GitHub Repository**
1. Go to **github.com** and create a new repository
2. Name it `code-complexity-analyzer` (or similar)
3. Follow GitHub's instructions to push your local repo:
```bash
git remote add origin https://github.com/YOUR_USERNAME/code-complexity-analyzer.git
git branch -M main
git push -u origin main
```

## **Step 3: Deploy to Railway**
1. Go to **railway.app**
2. Sign up or log in with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Select your `code-complexity-analyzer` repository
6. Choose Node.js environment
7. Configure:
   - **Environment**: Node.js
   - **Start command**: `node server.js` (Railway auto-detects from Procfile)
   - Leave other settings as default

8. Click **"Deploy"**

## **Step 4: Get Your Railway URL**
1. Once deployed, go to your project dashboard
2. Click on your app
3. Go to **Settings** → **Domains**
4. Copy your Railway URL (looks like: `https://your-app-name.railway.app`)

## **Step 5: Update Extension Code**
Open `content.js` and update the proxy server URL:

```javascript
// Change this:
const PROXY_SERVER = 'http://localhost:3000';

// To this (replace with your Railway URL):
const PROXY_SERVER = 'https://your-railway-url.railway.app';
```

## **Step 6: Test Your Deployment**
1. Visit your Railway URL in browser: `https://your-railway-url.railway.app/`
2. You should see the API documentation
3. Test the health check: `https://your-railway-url.railway.app/health`

## **Step 7: Reload Extension**
1. Go to `chrome://extensions`
2. Find **Code Complexity Analyzer**
3. Click the **Reload** button
4. Go to a LeetCode/HackerRank problem
5. Press `Ctrl+Shift+C` (or your keyboard shortcut)
6. Test the analysis - it now uses your Cloud backend!

---

## **Troubleshooting**

### **Deployment fails**
- Check that `package.json`, `server.js`, and `Procfile` are in the root directory
- Ensure all dependencies are in `package.json`

### **CORS errors**
- The server already has CORS enabled, should work fine

### **Slow responses**
- Railway free tier may have slight delays
- Upgrade to Railway Pro for better performance

---

**Great! Your backend is now hosted in the cloud and your extension works everywhere!** 🚀
