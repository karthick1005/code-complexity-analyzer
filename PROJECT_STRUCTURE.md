# Extension Project Structure

## 📁 File Organization

```
Extension/
│
├── 📄 manifest.json              # Extension configuration (Manifest V3)
├── 📄 popup.html                 # Popup UI structure
├── 📄 popup.js                   # Popup logic & API communication
├── 📄 content.js                 # Code extraction from web pages
├── 📄 background.js              # Service worker for background tasks
├── 📄 styles.css                 # Popup styling & animations
│
├── 📋 README.md                  # Full documentation
├── 📋 QUICK_START.md            # Quick setup guide (3 minutes)
├── 📋 PROJECT_STRUCTURE.md      # This file
│
└── 🖼️ images/                    # Extension icons (optional, but recommended)
    ├── icon-16.png              # 16x16 icon
    ├── icon-48.png              # 48x48 icon
    └── icon-128.png             # 128x128 icon
```

## 🔍 File Descriptions

### Core Files

#### manifest.json
- **Purpose**: Extension configuration file for Manifest V3
- **Size**: ~1 KB
- **Contains**:
  - Extension metadata (name, version, description)
  - Permissions and host permissions
  - Background service worker definition
  - Content script configuration
  - Action icon definitions

#### popup.html
- **Purpose**: HTML structure for the popup interface
- **Size**: ~2 KB
- **Contains**:
  - Loading state UI (spinner + text)
  - Results display section (time & space complexity)
  - Error state with retry button
  - Initial state with analyze button
  - Responsive design structure

#### popup.js
- **Purpose**: Main popup logic and API communication
- **Size**: ~4 KB
- **Key Functions**:
  - `handleAnalyzeClick()` - Trigger code extraction
  - `analyzeCode()` - Send code to API
  - `displayResults()` - Show complexity results
  - `showLoading()` / `showError()` - UI state management
- **Communication**: Sends messages to content.js via Chrome messaging API

#### content.js
- **Purpose**: Extract code from web pages
- **Size**: ~6 KB
- **Key Functions**:
  - `extractCode()` - Main extraction function
  - `extractLeetCodeCode()` - LeetCode specific extraction
  - `extractHackerRankCode()` - HackerRank specific extraction
  - `extractFromGenericEditor()` - Fallback extraction
- **Communication**: Listens for messages from popup.js

#### background.js
- **Purpose**: Service worker for background tasks
- **Size**: ~1 KB
- **Contains**:
  - Installation handlers
  - Message listeners
  - Tab activation handlers
- **Note**: Ready for future enhancements

#### styles.css
- **Purpose**: Styling for the popup interface
- **Size**: ~5 KB
- **Features**:
  - Gradient background
  - Smooth animations
  - Responsive design
  - Dark mode compatible colors
  - Loading spinner animation

### Documentation Files

#### README.md
- **Purpose**: Comprehensive documentation
- **Sections**:
  - Features overview
  - Step-by-step installation
  - Usage instructions
  - API details
  - Troubleshooting guide
  - Technical implementation details

#### QUICK_START.md
- **Purpose**: Quick 3-minute setup guide
- **For**: Users who want to get started immediately
- **Includes**: Common issues and solutions

#### PROJECT_STRUCTURE.md
- **Purpose**: This file
- **Contents**: File organization and descriptions

## 📊 Total Size

| Component | Size |
|-----------|------|
| manifest.json | 1 KB |
| popup.html | 2 KB |
| popup.js | 4 KB |
| content.js | 6 KB |
| background.js | 1 KB |
| styles.css | 5 KB |
| Documentation | 15 KB |
| **Total** | ~34 KB |

## 🔄 Data Flow

```
User Action
    ↓
popup.html (UI displayed)
    ↓
popup.js handles click
    ↓
Message sent to content.js
    ↓
content.js extracts code
    ↓
Response sent to popup.js
    ↓
popup.js calls API
    ↓
API returns complexity
    ↓
Results displayed in UI
```

## 🎨 Icons (Optional)

For a complete extension, add icons:

### Icon Directory: `images/`
```
images/
├── icon-16.png      # Taskbar icon (16x16 pixels)
├── icon-48.png      # Extension management page (48x48 pixels)
└── icon-128.png     # Chrome Web Store (128x128 pixels)
```

### How to Create Icons
1. Design a simple icon representing "Code" or "Complexity"
2. Export at sizes: 16x16, 48x48, 128x128
3. Use PNG format with transparency
4. Place in `images/` folder

**Example Icon Design Ideas:**
- Code brackets: `< >`
- Big O symbol: `O(n)`
- Graph/complexity chart
- Calculator or lightbulb

## 🔐 Permissions Breakdown

### Required Permissions

```javascript
"permissions": [
  "activeTab",    // Access current tab
  "scripting"     // Inject content scripts
]
```

### Host Permissions

```javascript
"host_permissions": [
  "https://leetcode.com/*",              // LeetCode support
  "https://*.hackerrank.com/*",          // HackerRank support (all subdomains)
  "https://daleseo-bigocalc.web.val.run/*"  // Analysis API
]
```

## 🚀 Development Workflow

### Step 1: Initial Setup
1. Create the files above
2. Place all in one folder
3. Load in Chrome via `chrome://extensions/`

### Step 2: Testing
1. Navigate to LeetCode or HackerRank
2. Write test code
3. Click extension and analyze
4. Check browser console for errors (F12)

### Step 3: Iteration
1. Make code changes
2. Reload extension (click reload icon in extensions page)
3. Test again

### Step 4: Debugging
- Open DevTools on popup: right-click popup → Inspect
- Content script logs: F12 on webpage → Console
- Background worker: `chrome://extensions/` → Details → Inspect service worker

## 🔄 Update Extension

### To Update Files
1. Edit files locally
2. Go to `chrome://extensions/`
3. Click reload icon next to the extension
4. Changes take effect immediately

### To Update Version
- Edit `manifest.json`
- Increment `"version"` number
- Reload extension

## 📱 Supported Browsers

- ✅ Google Chrome (88+)
- ✅ Microsoft Edge (88+)
- ✅ Brave Browser (Compatible)
- ✅ Opera (Compatible)
- ❌ Firefox (Different manifest format)
- ❌ Safari (Different format)

## 🎯 Extension States

### User Interactions

| State | Trigger | UI Display |
|-------|---------|-----------|
| Initial | Extension loaded | "Analyze Code" button |
| Loading | User clicks analyze | Spinner + "Analyzing..." |
| Success | API returns results | Time & Space complexity |
| Error | Code extraction fails | Error message + retry button |

## 🔗 Message Flow

### popup.js ↔ content.js

**Request (popup → content):**
```javascript
{
  action: "extractCode"
}
```

**Response (content → popup):**
```javascript
{
  code: "function solution() { ... }"
}
// OR
{
  error: "Unable to extract code"
}
```

## 💾 Data Handling

- ✅ **No persistent storage** - Data deleted after each session
- ✅ **No background processing** - Everything happens in real-time
- ✅ **No analytics** - No user tracking
- ✅ **Direct API calls** - Code sent only to analysis API

---

**Last Updated**: March 2026
**Version**: 1.0.0
**Manifest**: V3
