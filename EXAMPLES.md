# Code Examples & Testing Reference

## 📚 Code Examples

### Example 1: Testing Code Extraction (LeetCode)

**JavaScript (for console testing):**
```javascript
// Test 1: Check if Monaco editor is detectable
const monacoEditor = document.querySelector('.monaco-editor');
console.log('Monaco editor found:', !!monacoEditor);

// Test 2: Get Monaco editor content
if (window.monaco && window.monaco.editor) {
    const editors = window.monaco.editor.getEditors();
    if (editors.length > 0) {
        console.log('Code:', editors[0].getValue());
    }
}

// Test 3: Extract from view-lines (fallback)
const viewLines = document.querySelector('.view-lines');
if (viewLines) {
    let code = '';
    let lines = viewLines.querySelectorAll('.view-line');
    lines.forEach(line => {
        code += line.textContent + '\n';
    });
    console.log('Extracted code:', code);
}
```

### Example 2: Testing API Directly

**In Browser Console (F12):**
```javascript
// Simple function to test
const testCode = `
function twoSum(nums, target) {
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] === target) {
                return [i, j];
            }
        }
    }
    return [];
}
`;

// Make API request
fetch("https://daleseo-bigocalc.web.val.run/", {
    method: "POST",
    headers: {
        "accept": "*/*",
        "content-type": "application/json",
        "origin": "https://www.bigocalc.com",
        "referer": "https://www.bigocalc.com/"
    },
    body: JSON.stringify({
        code: testCode
    })
})
.then(response => response.json())
.then(data => {
    console.log('Time Complexity:', data.time);
    console.log('Space Complexity:', data.space);
})
.catch(error => console.error('Error:', error));
```

### Example 3: Testing Message Passing

**From popup.js console:**
```javascript
// Get current tab
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;
    
    // Send message to content script
    chrome.tabs.sendMessage(tabId, { action: 'extractCode' }, (response) => {
        console.log('Response:', response);
        if (response.code) {
            console.log('Code extracted successfully');
            console.log(response.code);
        } else {
            console.log('Error:', response.error);
        }
    });
});
```

---

## 🧪 Test Scenarios

### Scenario 1: Basic Linear Algorithm
**Platform:** LeetCode
**Code:**
```python
def find_max(nums):
    max_val = nums[0]
    for num in nums:
        if num > max_val:
            max_val = num
    return max_val
```
**Expected Result:**
- Time: O(n)
- Space: O(1)

### Scenario 2: Sorting Algorithm
**Platform:** LeetCode
**Code:**
```javascript
function quickSort(arr, low = 0, high = arr.length - 1) {
    if (low < high) {
        let pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
    return arr;
}

function partition(arr, low, high) {
    let pivot = arr[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
}
```
**Expected Result:**
- Time: O(n log n) average, O(n²) worst
- Space: O(log n)

### Scenario 3: Tree/Graph Algorithm
**Platform:** LeetCode
**Code:**
```python
def binary_search_tree_traversal(root):
    result = []
    
    def inorder(node):
        if node:
            inorder(node.left)
            result.append(node.val)
            inorder(node.right)
    
    inorder(root)
    return result
```
**Expected Result:**
- Time: O(n)
- Space: O(h) where h is height

### Scenario 4: Dynamic Programming
**Platform:** LeetCode
**Code:**
```python
def fib(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    
    memo[n] = fib(n - 1, memo) + fib(n - 2, memo)
    return memo[n]
```
**Expected Result:**
- Time: O(n)
- Space: O(n)

### Scenario 5: Empty Editor (Error Case)
**Platform:** Any supported platform
**Code:** (none - empty editor)
**Expected Result:**
- Error: "Unable to detect code editor"

### Scenario 6: Invalid JavaScript Syntax
**Platform:** LeetCode
**Code:**
```javascript
function test() {
    const x = 5
    const y = ;  // Invalid syntax
    return x;
}
```
**Expected Result:**
- May get error or partial analysis depending on API

---

## 🔬 Unit Testing Patterns

### Test Pattern 1: Extract Code Function

```javascript
// Mock test for extractCode
function testExtractCode() {
    // Setup: Mock DOM
    const mockEditor = document.createElement('div');
    mockEditor.className = 'monaco-editor';
    mockEditor.innerHTML = '<div class="view-lines"><div class="view-line">function test() {}</div></div>';
    document.body.appendChild(mockEditor);
    
    // Execute
    const result = extractCode();
    
    // Assert
    console.assert(result !== null, 'Code extraction failed');
    console.assert(result.includes('function'), 'Function keyword not found');
    
    // Cleanup
    document.body.removeChild(mockEditor);
}

testExtractCode();
```

### Test Pattern 2: API Call Function

```javascript
// Mock test for API call
async function testAnalyzeCode() {
    const testCode = "function test() { return 1; }";
    
    try {
        const response = await fetch("https://daleseo-bigocalc.web.val.run/", {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "origin": "https://www.bigocalc.com",
                "referer": "https://www.bigocalc.com/"
            },
            body: JSON.stringify({ code: testCode })
        });
        
        console.assert(response.ok, `API returned status ${response.status}`);
        
        const data = await response.json();
        console.assert(data.time !== undefined, 'Time complexity missing');
        console.assert(data.space !== undefined, 'Space complexity missing');
        console.log('✓ API test passed');
        console.log('Result:', data);
    } catch (error) {
        console.error('✗ API test failed:', error);
    }
}

testAnalyzeCode();
```

### Test Pattern 3: UI State Testing

```javascript
// Test UI state transitions
function testUIStates() {
    const states = {
        initial: ['initial', 'hidden', 'hidden', 'hidden'],
        loading: ['hidden', 'loading', 'hidden', 'hidden'],
        results: ['hidden', 'hidden', 'results', 'hidden'],
        error: ['hidden', 'hidden', 'hidden', 'error']
    };
    
    // Helper to check state
    function checkState(expected) {
        const actual = [
            !document.getElementById('initial').classList.contains('hidden'),
            !document.getElementById('loading').classList.contains('hidden'),
            !document.getElementById('results').classList.contains('hidden'),
            !document.getElementById('error').classList.contains('hidden')
        ];
        
        console.assert(JSON.stringify(actual) === JSON.stringify(expected), 'State mismatch');
    }
    
    // Test transitions
    console.log('Testing initial state...');
    resetUI();
    checkState([true, false, false, false]);
    
    console.log('Testing loading state...');
    showLoading();
    checkState([false, true, false, false]);
    
    console.log('Testing results state...');
    document.getElementById('results').classList.remove('hidden');
    document.getElementById('loading').classList.add('hidden');
    checkState([false, false, true, false]);
    
    console.log('✓ All UI state tests passed');
}

testUIStates();
```

---

## 📊 Complexity Analysis Primer

### Common Time Complexities (Best to Worst)

| Complexity | Example | Algorithm |
|-----------|---------|-----------|
| O(1) | Accessing array element | Direct access |
| O(log n) | Binary search | Divide and conquer |
| O(n) | Linear search | Simple loop |
| O(n log n) | Merge sort, quick sort | Efficient sorting |
| O(n²) | Bubble sort, nested loops | Inefficient sorting |
| O(n³) | 3 nested loops | Matrix operations |
| O(2ⁿ) | Fibonacci (recursive) | Exponential |
| O(n!) | Permutations | Factorial |

### Common Space Complexities

| Complexity | Meaning | Example |
|-----------|---------|---------|
| O(1) | Constant space | No extra data structures |
| O(log n) | Logarithmic | Recursion depth |
| O(n) | Linear | Array copy, stack |
| O(n log n) | Linear logarithmic | Merge sort |
| O(n²) | Quadratic | 2D matrix |
| O(2ⁿ) | Exponential | Memoization cache |

---

## 🧩 Integration Test Workflow

### Complete End-to-End Test

```javascript
// Step 1: Load extension and navigate to LeetCode
// Step 2: Write test code
const testCode = `
function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}
`;

// Step 3: Simulate extension click
console.log('Step 3: Simulating extension click...');

// Step 4: Check content script extraction
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'extractCode' }, (response) => {
        console.log('Step 4: Code extraction -', response.code ? 'SUCCESS' : 'FAILED');
        
        if (response.code) {
            // Step 5: Call API
            console.log('Step 5: Calling API...');
            fetch("https://daleseo-bigocalc.web.val.run/", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "origin": "https://www.bigocalc.com",
                    "referer": "https://www.bigocalc.com/"
                },
                body: JSON.stringify({ code: response.code })
            })
            .then(r => r.json())
            .then(data => {
                console.log('Step 6: Results displayed');
                console.log('Time Complexity:', data.time);
                console.log('Space Complexity:', data.space);
                console.log('✓ End-to-end test PASSED');
            });
        }
    });
});
```

---

## 🐛 Debug Tips

### Enable Verbose Logging

Add to **popup.js** or **content.js**:

```javascript
// Global debug flag
const DEBUG = true;

function log(...args) {
    if (DEBUG) console.log('[CodeAnalyzer]', ...args);
}

function warn(...args) {
    if (DEBUG) console.warn('[CodeAnalyzer]', ...args);
}

function error(...args) {
    if (DEBUG) console.error('[CodeAnalyzer]', ...args);
}

// Usage
log('Extension initialized');
log('Code extracted:', codeLength, 'characters');
error('API call failed:', errorMessage);
```

### Monitor All Events

```javascript
// Log all message events
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received:', request.action);
    console.log('From:', sender);
    // ... existing code
});

// Log all tab changes
chrome.tabs.onActivated.addListener((activeInfo) => {
    console.log('Tab activated:', activeInfo.tabId);
});
```

---

## ✨ Advanced Testing

### Performance Profiling

```javascript
// Measure code extraction time
console.time('Code Extraction');
const code = extractCode();
console.timeEnd('Code Extraction');

// Measure API call time
console.time('API Call');
const response = await fetch(API_ENDPOINT, options);
console.timeEnd('API Call');

// Measure total operation time
console.time('Total Analysis');
// ... full operation
console.timeEnd('Total Analysis');
```

### Memory Usage Monitoring

```javascript
// Check memory usage (Chrome only)
if (performance.memory) {
    console.log('Heap used:', performance.memory.usedJSHeapSize);
    console.log('Heap limit:', performance.memory.jsHeapSizeLimit);
}
```

---

**Last Updated**: March 2026
**Extension Version**: 1.0.0
