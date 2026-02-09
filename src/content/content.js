// Content Script
// Manages interactions with page content

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'ANALYZE_SELECTION') {
        handleAnalyzeSelection(request.text);
    }
});

function handleAnalyzeSelection(text) {
    // Create a floating analysis panel
    const panel = createAnalysisPanel(text);
    document.body.appendChild(panel);

    // Request analysis from background
    chrome.runtime.sendMessage({
        type: 'ANALYZE_INTENT',
        text: text
    }, (response) => {
        updateAnalysisPanel(panel, response);
    });
}

function createAnalysisPanel(text) {
    const panel = document.createElement('div');
    panel.id = 'prismtext-panel';
    panel.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 400px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        padding: 20px;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-height: 80vh;
        overflow-y: auto;
    `;

    panel.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="margin: 0; color: #667eea; font-size: 16px;">PrismText Analysis</h3>
            <button id="prismtext-close" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #999;">×</button>
        </div>
        <div style="margin-bottom: 16px; padding: 12px; background: #f5f7fa; border-radius: 8px; font-size: 13px; color: #555;">
            <p style="margin: 0;"><strong>Selected Text:</strong></p>
            <p style="margin: 8px 0 0 0; max-height: 60px; overflow: hidden; word-wrap: break-word;">${text}</p>
        </div>
        <div id="prismtext-analysis" style="padding: 12px; background: #f0f4ff; border-left: 4px solid #667eea; border-radius: 4px; font-size: 13px; color: #333;">
            <p style="margin: 0;">Analyzing intent...</p>
        </div>
        <div style="margin-top: 16px;">
            <button id="prismtext-open" style="
                width: 100%;
                padding: 10px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                font-size: 13px;
            ">Open Full Editor</button>
        </div>
    `;

    panel.querySelector('#prismtext-close').addEventListener('click', () => {
        panel.remove();
    });

    panel.querySelector('#prismtext-open').addEventListener('click', () => {
        // Open popup with selected text
        chrome.runtime.sendMessage({
            type: 'OPEN_WITH_TEXT',
            text: text
        });
        panel.remove();
    });

    return panel;
}

function updateAnalysisPanel(panel, analysis) {
    const analysisDiv = panel.querySelector('#prismtext-analysis');
    analysisDiv.innerHTML = `
        <p style="margin: 0;"><strong>Intent:</strong> ${analysis.intent || 'General'}</p>
        <p style="margin: 8px 0 0 0;"><strong>Confidence:</strong> ${analysis.confidence || 0}%</p>
        ${analysis.analysis ? `<p style="margin: 8px 0 0 0;">${analysis.analysis}</p>` : ''}
    `;
}

console.log('PrismText content script loaded');
