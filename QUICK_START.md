# Quick Setup Guide - Code Complexity Analyzer

## 🚀 Get Started in 3 Minutes

### Prerequisites
- Google Chrome (version 88+) or any Chromium-based browser
- Code you want to analyze on LeetCode or HackerRank

### Installation Steps

#### 1️⃣ Prepare Extension Files
Make sure you have all 6 files in one folder:
```
✓ manifest.json
✓ popup.html
✓ popup.js
✓ content.js
✓ background.js
✓ styles.css
```

#### 2️⃣ Open Extensions Page
```
chrome://extensions/
```
**Or**: Click Menu (☰) → More Tools → Extensions

#### 3️⃣ Enable Developer Mode
Look for the toggle in the **top right corner** → Switch it ON (blue)

#### 4️⃣ Load Extension
Click **"Load unpacked"** button → Select your extension folder → Click "Open"

#### 5️⃣ Start Using
- Go to [LeetCode](https://www.leetcode.com) or [HackerRank](https://www.hackerrank.com)
- Write some code
- Click the extension icon in your toolbar
- Click "Analyze Code"
- See your complexity analysis!

---

## 🎯 What It Does

| Step | Action |
|------|--------|
| 1 | Click extension icon on LeetCode/HackerRank |
| 2 | Extension extracts code from the editor |
| 3 | Sends code to analysis API |
| 4 | Shows Time & Space Complexity in popup |

---

## 📊 Example Result

```
Time Complexity: O(n log n)
Space Complexity: O(n)
```

---

## ❓ Common Issues

### "Unable to detect code editor"
- ✓ Refresh the page
- ✓ Make sure code is visible in the editor
- ✓ Try on a supported platform (LeetCode/HackerRank)

### Extension icon not showing
- ✓ Enable the extension in `chrome://extensions/`
- ✓ Restart Chrome

### API Analysis Failed
- ✓ Check internet connection
- ✓ Try again after a few seconds
- ✓ Supported sites: LeetCode, HackerRank

---

## 🔧 Uninstall

1. Go to `chrome://extensions/`
2. Find "Code Complexity Analyzer"
3. Click **Remove** button
4. Confirm removal

---

## 📝 Notes

- ✅ Works offline for code extraction
- ✅ Requires internet for complexity analysis
- ✅ Your code is only sent to the analysis API
- ✅ No data is stored locally

---

**Need help?** Check README.md for detailed documentation.
