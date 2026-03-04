# Troubleshooting & Testing Guide

## 🧪 Testing Checklist

### Pre-Installation Testing
- [ ] All 6 required files present in folder
- [ ] manifest.json is valid JSON (no syntax errors)
- [ ] popup.html file exists and is readable

### Installation Testing
- [ ] Extension appears in `chrome://extensions/`
- [ ] Extension name shows as "Code Complexity Analyzer"
- [ ] Version shows as "1.0.0"
- [ ] Extension has an icon in toolbar

### Functionality Testing

#### Test on LeetCode
1. [ ] Go to https://www.leetcode.com
2. [ ] Choose any problem (e.g., "Two Sum")
3. [ ] Write or paste code in the editor
4. [ ] Click extension icon
5. [ ] Click "Analyze Code" button
6. [ ] Wait for result (should show complexity)
7. [ ] Verify result is displayed correctly

#### Test on HackerRank
1. [ ] Go to https://www.hackerrank.com
2. [ ] Open any coding challenge
3. [ ] Write or paste code
4. [ ] Click extension icon
5. [ ] Click "Analyze Code" button
6. [ ] Wait for result
7. [ ] Verify result displays

#### Test Error Handling
1. [ ] Navigate to a website NOT LeetCode/HackerRank
2. [ ] Click extension icon
3. [ ] Click "Analyze Code"
4. [ ] Should show: "Unable to detect code editor"
5. [ ] Retry button should work

### API Testing

#### Verify API Connectivity
```javascript
// Open console and run:
fetch("https://daleseo-bigocalc.web.val.run/", {
  method: "POST",
  headers: {
    "accept": "*/*",
    "content-type": "application/json",
    "origin": "https://www.bigocalc.com",
    "referer": "https://www.bigocalc.com/"
  },
  body: JSON.stringify({
    code: "function test() { return 1; }"
  })
}).then(r => r.json()).then(d => console.log(d))
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Extension Icon Not Appearing

**Symptoms:**
- Extension not visible in toolbar
- Not listed in extensions

**Solutions:**
1. Verify extension loaded:
   - Go to `chrome://extensions/`
   - Search for "Code Complexity Analyzer"
   - Should show enabled status

2. Reload extension:
   - Find extension in list
   - Click the reload 🔄 icon

3. Restart Chrome:
   - Close all Chrome windows
   - Reopen Chrome
   - Check if icon appears

4. Re-add extension:
   - Remove extension in `chrome://extensions/`
   - Load unpacked again from folder

**Preventative Steps:**
- Pin extension to toolbar: Click puzzle icon → Click pin next to extension
- Keep extension folder in accessible location

---

### Issue 2: "Unable to Detect Code Editor" Error

**Symptoms:**
- Always shows error message
- Code extraction fails

**Causes & Solutions:**

| Cause | Solution |
|-------|----------|
| Wrong website | Make sure you're on LeetCode or HackerRank |
| Page not fully loaded | Refresh page (F5) and wait 2 seconds |
| Empty editor | Write some code in the editor first |
| Content script not loaded | Open browser console (F12) and check for errors |
| Supported platform issue | Try a different problem on the same platform |

**Debug Steps:**
1. Open DevTools: Right-click page → Inspect (or F12)
2. Go to Console tab
3. Look for error messages
4. Check if content script is running:
   ```javascript
   // Type in console:
   console.log("Content script loaded")
   ```

---

### Issue 3: API Analysis Failed

**Symptoms:**
- "Complexity analysis failed" error message
- API seems unreachable

**Causes & Solutions:**

| Cause | Solution |
|-------|----------|
| No internet | Check WiFi connection |
| API is down | Try again in a few minutes |
| Firewall blocking | Check if API is accessible: https://daleseo-bigocalc.web.val.run/ |
| Large code | Try with simpler/shorter code |
| Invalid code syntax | API may require valid code |

**Debug Steps:**
1. Check internet connection:
   ```bash
   ping google.com
   ```

2. Test API directly:
   - Open browser console (F12)
   - Paste and run the test code from "API Testing" section above
   - Check response

3. Check for CORS errors:
   - Open DevTools Network tab
   - Analyze the request/response
   - Look for CORS error messages

4. Try later:
   - API server might be temporarily down
   - Wait 5-10 minutes and try again

---

### Issue 4: Popup Appears but Buttons Don't Work

**Symptoms:**
- Click "Analyze Code" but nothing happens
- Popup is unresponsive

**Causes & Solutions:**

| Cause | Solution |
|-------|----------|
| Content script not loaded | Refresh webpage |
| popup.js error | Check console for errors |
| Message passing issue | Verify content.js is on the page |
| Extension reloading | Reload extension in extensions settings |

**Debug Steps:**
1. Right-click popup → Inspect
2. Go to Console tab
3. Look for JavaScript errors
4. Check if popup.js is loaded
5. Reload extension in `chrome://extensions/`

---

### Issue 5: Incorrect Complexity Results

**Symptoms:**
- Results seem wrong
- Doesn't match expected complexity

**Notes:**
- API provides automatic analysis
- Results depend on algorithm implementation
- Some algorithms can have multiple valid complexities
- Very complex code might timeout

**How to Verify:**
1. Use simple test code:
   ```python
   def linear_search(arr, target):
       for item in arr:
           if item == target:
               return True
       return False
   ```
   Expected: O(n) time, O(1) space

2. Use well-known algorithms
3. Check if code is correctly extracted

---

## 🔍 Debugging Guide

### Enable Logging

Add this to popup.js to see detailed logs:

```javascript
const DEBUG = true;

function log(message) {
    if (DEBUG) console.log(`[Code Analyzer] ${message}`);
}

function logError(message, error) {
    if (DEBUG) console.error(`[Code Analyzer] ${message}`, error);
}
```

Then replace `console.log` and `console.error` with `log()` and `logError()`

### Check Content Script

1. Open DevTools on LeetCode (F12)
2. Go to Console tab
3. Run:
   ```javascript
   // Check if content script is running
   chrome.runtime.onMessage.addListener
   // Should return the function reference
   ```

4. Check if code extraction works:
   ```javascript
   // Type in console to test extraction
   const monacoEditor = document.querySelector('.monaco-editor');
   console.log("Monaco editor found:", !!monacoEditor);
   ```

### Monitor Network Requests

1. Open DevTools (F12)
2. Go to Network tab
3. Click extension button
4. Watch for request to `daleseo-bigocalc.web.val.run`
5. Check request details and response

### Inspect Service Worker

1. Go to `chrome://extensions/`
2. Find extension
3. Click "Details"
4. Under "Service Worker", click "Inspect"
5. View service worker console logs

---

## ✅ Validation Checklist

### Code Quality
- [ ] All JS files have proper comments
- [ ] No console errors when running
- [ ] Message passing works correctly
- [ ] Error handling covers edge cases

### Performance
- [ ] Popup opens within 1 second
- [ ] Code extraction completes instantly
- [ ] API response usually < 3 seconds
- [ ] UI remains responsive

### Compatibility
- [ ] Works on LeetCode.com
- [ ] Works on HackerRank.com
- [ ] Works on Chrome 88+
- [ ] Works on Edge 88+

### Security
- [ ] No sensitive data stored
- [ ] API calls use HTTPS
- [ ] User code not exposed
- [ ] Headers match requirements

---

## 🚀 Performance Optimization Tips

### If Extension Feels Slow

1. **Reduce API calls:** Add debouncing to analyze button
2. **Optimize extraction:** Cache editor reference
3. **Minimize permissions:** Only request needed permissions
4. **Reduce popup size:** Simplify UI if needed

### Code for optimization (optional):

```javascript
// Add debouncing to reduce API calls
let lastAnalyzeTime = 0;
const ANALYZE_COOLDOWN = 1000; // 1 second

async function handleAnalyzeClick() {
    const now = Date.now();
    if (now - lastAnalyzeTime < ANALYZE_COOLDOWN) {
        return; // Ignore rapid clicks
    }
    lastAnalyzeTime = now;
    // ... rest of code
}
```

---

## 📝 Test Cases

### Test Case 1: Simple Function
```python
def add(a, b):
    return a + b
```
Expected: O(1) time, O(1) space

### Test Case 2: Linear Search
```python
def search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1
```
Expected: O(n) time, O(1) space

### Test Case 3: Merge Sort
```python
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)
```
Expected: O(n log n) time, O(n) space

### Test Case 4: Empty Editor
- Don't write any code
- Click analyze
- Should show error

### Test Case 5: Non-code Website
- Go to google.com
- Click extension
- Should show error

---

## 🔧 Advanced Debugging

### Chrome Extensions Remote Debugging

1. **For Popup:**
   - Right-click popup → Inspect
   - Open DevTools with popup visible

2. **For Content Script:**
   - F12 on the webpage
   - Look for content script in Sources tab
   - Set breakpoints

3. **For Service Worker:**
   - `chrome://extensions/`
   - Click "Inspect" under service worker
   - View worker console

### Common Console Errors

| Error | Meaning | Fix |
|-------|---------|-----|
| `Unchecked runtime.lastError` | Message recipient not found | Reload page |
| `CORS error` | API request blocked | Check headers |
| `Content script not found` | Script not injected | Reload extension |

---

## 📞 Getting Help

If you still have issues:

1. **Check Console Errors:** F12 → Console tab
2. **Verify Installation:** `chrome://extensions/`
3. **Test API Directly:** Use curl or Postman
4. **Try Simple Code:** Start with basic examples
5. **Restart Everything:** Browser, reload extension
6. **Clear Cache:** Hard refresh (Ctrl+Shift+R)

---

**Last Updated**: March 2026
**Extension Version**: 1.0.0
