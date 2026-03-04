# Code Complexity Analyzer - Chrome Extension

A powerful Chrome Extension (Manifest V3) that automatically analyzes the time and space complexity of your code on popular coding platforms like LeetCode and HackerRank.

## Features

✨ **Automatic Code Detection** - Detects code from Monaco Editor (LeetCode), HackerRank, and other coding platforms
📊 **Complexity Analysis** - Uses the BigO Calculator API to analyze time and space complexity
🎯 **Simple UI** - Clean, intuitive popup interface showing analysis results
⚡ **Fast & Reliable** - Instant analysis with proper error handling
🔒 **Privacy Focused** - No data is stored; only sent to the analysis API

## Extension Structure

```
Extension/
├── manifest.json          # Manifest V3 configuration
├── popup.html            # Popup UI structure
├── popup.js              # Popup logic and API communication
├── content.js            # Code extraction from web pages
├── background.js         # Service worker for background tasks
├── styles.css            # Popup styling
└── README.md            # This file
```

## Installation Instructions

### Step 1: Download the Extension Files
Ensure all extension files are in a single directory:
- manifest.json
- popup.html
- popup.js
- content.js
- background.js
- styles.css

### Step 2: Open Chrome Extensions Page
1. Open Google Chrome
2. Navigate to `chrome://extensions/` in the address bar
3. Or go to **Menu (☰) → More Tools → Extensions**

### Step 3: Enable Developer Mode
1. Toggle the **Developer mode** switch in the top right corner of the Extensions page
2. The switch should now show blue/enabled

### Step 4: Load the Extension
1. Click the **"Load unpacked"** button that appears
2. Navigate to the folder containing your extension files
3. Select the folder and click **"Open"**

### Step 5: Verify Installation
1. You should see "Code Complexity Analyzer" in your extensions list
2. Look for the extension icon in your browser toolbar
3. The extension is now ready to use!

## Usage

### How to Use

1. **Navigate to a Coding Platform**
   - Go to LeetCode, HackerRank, or similar coding platform
   - Write or paste your code in the editor

2. **Open the Extension**
   - Click the "Code Complexity Analyzer" extension icon in your toolbar
   - A popup window will appear

3. **Analyze Code**
   - Click the "Analyze Code" button
   - The extension will extract the code from the editor
   - It sends the code to the BigO Calculator API

4. **View Results**
   - Wait for the API response (usually < 2 seconds)
   - View the Time Complexity and Space Complexity results
   - Click "Analyze Again" to analyze different code

## Supported Platforms

- **LeetCode** (https://leetcode.com)
- **HackerRank** (hackerrank.com)
- Other platforms with code editors (fallback support)

## API Details

**Endpoint:** `https://daleseo-bigocalc.web.val.run/`

**Request Format:**
```json
{
  "code": "your_code_here"
}
```

**Response Format:**
```json
{
  "time": "O(n log n)",
  "space": "O(n)"
}
```

## File Descriptions

### manifest.json
- Manifest V3 configuration file
- Defines permissions, content scripts, and background service worker
- Specifies host permissions for supported platforms

### popup.html
- UI structure for the extension popup
- Contains the layout for results display and loading states
- Responsive design for various screen sizes

### popup.js
- Main business logic for the extension
- Handles button clicks and user interactions
- Communicates with content script via Chrome messaging API
- Makes API calls to analyze code complexity
- Manages UI state changes (loading, results, error)

### content.js
- Runs on the target websites
- Extracts code from Monaco Editor (LeetCode)
- Extracts code from HackerRank's code editor
- Handles fallback code extraction for other platforms
- Responds to messages from popup.js

### background.js
- Service worker for Manifest V3
- Handles extension lifecycle events (install, update)
- Available for future background tasks and optimization

### styles.css
- Modern styling with gradient background
- Smooth animations and transitions
- Responsive design for different screen sizes
- Dark mode friendly colors

## Error Handling

The extension handles various error scenarios:

| Error | Message | Solution |
|-------|---------|----------|
| Content script not loaded | "Unable to detect code editor" | Refresh the page and try again |
| API failure | "Complexity analysis failed" | Check internet connection and retry |
| No code found | "Unable to detect code editor" | Ensure you are on a supported platform |

## Technical Details

### Permissions
- **activeTab** - Required to access the current active tab
- **scripting** - Required to inject content scripts
- **Host Permissions** - Required for specific domains and API access

### Message Passing
The extension uses Chrome's message passing API for communication:
- Popup sends `{action: 'extractCode'}` to content script
- Content script responds with `{code: '...'}` or `{error: '...'}`

### API Communication
- Uses Fetch API to communicate with the BigO Calculator
- Includes proper headers matching the original BigO Calc website
- Handles CORS by using all (*) accept header

## Troubleshooting

### Extension icon not appearing
- Toggle the extension off and on in `chrome://extensions/`
- Restart Chrome browser

### Code not being extracted
- Ensure you're on a supported platform (LeetCode or HackerRank)
- Reload the page and try again
- Check the browser console for error messages (right-click → Inspect)

### API errors
- Check your internet connection
- Verify the API endpoint is accessible: https://daleseo-bigocalc.web.val.run/
- Try again after a few seconds

### Popup not opening
- Check if the extension is enabled in `chrome://extensions/`
- Clear browser cache and reload the extension
- Try reopening Chrome

## Development Notes

### Modular Code Structure
- Each file has a single responsibility
- Code is well-commented for maintainability
- Follows Chrome Extension best practices

### Security Considerations
- No code is stored locally
- API calls made directly without intermediary
- User data only sent to analysis API when explicitly requested

### Future Enhancements
- Support for more coding platforms
- Local code analysis without API calls
- Code visualization and explanation
- Analytics and history tracking
- Dark mode support

## Browser Compatibility

- **Chrome** - v88 and above (Manifest V3 support)
- **Edge** - v88 and above
- **Chromium-based browsers** - v88 and above

## License

This extension is provided as-is for educational and personal use.

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the console logs (F12 → Console tab)
3. Verify all files are in the correct directory
4. Ensure the extension is properly loaded

---

**Created:** March 2026
**Version:** 1.0.0
**Manifest Version:** 3
