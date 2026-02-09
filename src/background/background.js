// Background Service Worker
// Handles API calls and cross-module communication

let geminiApiKey = null;

// Load API key from storage on startup
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(['geminiApiKey'], (result) => {
        if (result.geminiApiKey) {
            geminiApiKey = result.geminiApiKey;
        }
    });
});

// Listen for API key updates
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'SET_API_KEY') {
        geminiApiKey = request.apiKey;
        chrome.storage.local.set({ geminiApiKey });
        sendResponse({ success: true });
        return;
    }

    if (request.type === 'GET_API_KEY') {
        sendResponse({ apiKey: geminiApiKey });
        return;
    }

    if (request.type === 'ANALYZE_INTENT') {
        analyzeIntent(request.text).then(result => {
            sendResponse(result);
        }).catch(error => {
            sendResponse({ error: error.message });
        });
        return true;
    }

    if (request.type === 'CALIBRATE_TEXT') {
        calibrateText(
            request.text,
            request.culture,
            request.hierarchy,
            request.emotional,
            request.urgency,
            request.directness
        ).then(result => {
            sendResponse(result);
        }).catch(error => {
            sendResponse({ error: error.message });
        });
        return true;
    }

    if (request.type === 'GET_EXPLANATION') {
        getExplanation(request.original, request.calibrated, request.culture)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ error: error.message }));
        return true;
    }
});

async function analyzeIntent(text) {
    // This is a mock implementation
    // In production, this would call Gemini API
    return new Promise(resolve => {
        const keywords = {
            reject: ['no', 'unfortunately', 'cannot', 'unable'],
            request: ['please', 'could', 'would', 'can you'],
            approve: ['yes', 'agree', 'approve'],
            urgent: ['urgent', 'asap', 'immediately'],
            feedback: ['feedback', 'suggestion', 'comment'],
            negotiate: ['perhaps', 'alternative', 'consider']
        };

        const lowerText = text.toLowerCase();
        let intentType = 'GENERAL';
        let score = 0;

        for (const [intent, words] of Object.entries(keywords)) {
            const count = words.filter(w => lowerText.includes(w)).length;
            if (count > score) {
                score = count;
                intentType = intent.toUpperCase();
            }
        }

        resolve({
            intent: intentType,
            confidence: Math.min(100, 60 + score * 10),
            analysis: `Detected ${intentType} intent with high confidence.`
        });
    });
}

async function calibrateText(text, culture, hierarchy, emotional, urgency, directness) {
    // Mock implementation - generates three versions
    return new Promise(resolve => {
        const base = text;
        
        // Generate variations
        const formal = hierarchy > 70 
            ? base.replace(/^(\w)/, '$1 - Respectfully, ')
            : base;
        
        const warm = emotional > 70
            ? base.replace(/\.$/, '. Best wishes!')
            : base;
        
        const direct = directness > 70
            ? base.replace(/could/, 'should').replace(/might/, 'must')
            : base;

        resolve({
            versions: [
                { text: base, label: 'Balanced' },
                { text: formal, label: 'Formal' },
                { text: warm, label: 'Warm' }
            ]
        });
    });
}

async function getExplanation(original, calibrated, culture) {
    return new Promise(resolve => {
        const explanation = `Text adapted for ${culture} audience with emphasis on cultural appropriateness and maximum impact.`;
        resolve({ explanation });
    });
}

// Context menu integration
chrome.contextMenus.create({
    id: 'prismtext-analyze',
    title: 'Analyze with PrismText',
    contexts: ['selection']
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'prismtext-analyze') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'ANALYZE_SELECTION',
                text: info.selectionText
            });
        });
    }
});

console.log('PrismText background service worker ready');
