// ========================================
// PrismText Popup Script
// ========================================

// ===========================================
// MODULE INITIALIZATION
// ===========================================

const intentDetector = new IntentDetectorV2();
const culturalAnalyzer = new CulturalAnalyzerV2();
const toneCalibrator = new ToneCalibratorV2();
const contextualIntelligence = new ContextualIntelligence();
const semanticAnalyzer = new SemanticAnalyzerV3();
const entityRecognizer = new EntityRecognizerV3();
const languageDetector = new LanguageDetectorV3();
const sentimentAnalyzer = new SentimentAnalyzerV3();

let geminiClient = null;

async function initializeGeminiClient() {
    try {
        const result = await chrome.storage.local.get(['geminiApiKey']);
        if (result.geminiApiKey && result.geminiApiKey.trim()) {
            geminiClient = new GeminiClient(result.geminiApiKey);
            return true;
        } else {
            geminiClient = new GeminiClient(null);
            return false;
        }
    } catch (error) {
        console.error('Failed to initialize Gemini client:', error);
        geminiClient = new GeminiClient(null);
        return false;
    }
}

const EXTENDED_RECIPIENTS = {
    'de': { code: 'de', name: 'Germany', region: 'Western Europe' },
    'fr': { code: 'fr', name: 'France', region: 'Western Europe' },
    'uk': { code: 'uk', name: 'United Kingdom', region: 'Northern Europe' },
    'jp': { code: 'jp', name: 'Japan', region: 'East Asia' },
    'kr': { code: 'kr', name: 'Korea', region: 'East Asia' },
    'us': { code: 'us', name: 'United States', region: 'North America' },
    'br': { code: 'br', name: 'Brazil', region: 'South America' },
    'mx': { code: 'mx', name: 'Mexico', region: 'Central America' },
    'cn': { code: 'cn', name: 'China', region: 'East Asia' },
    'in': { code: 'in', name: 'India', region: 'South Asia' },
    'au': { code: 'au', name: 'Australia', region: 'Oceania' },
    'se': { code: 'se', name: 'Sweden', region: 'Northern Europe' }
};

// ===========================================
// DOM ELEMENTS
// ===========================================

const apiKeyAlert = document.getElementById('apiKeyAlert');
const quickApiKey = document.getElementById('quickApiKey');
const quickSaveApiBtn = document.getElementById('quickSaveApiBtn');
const textInput = document.getElementById('textInput');
const clearMessage = document.getElementById('clearMessage');
const recipientSelect = document.getElementById('recipient');
const hierarchySlider = document.getElementById('hierarchySlider');
const emotionalSlider = document.getElementById('emotionalSlider');
const urgencySlider = document.getElementById('urgencySlider');
const directnessSlider = document.getElementById('directnessSlider');
const analyzeBtn = document.getElementById('analyzeBtn');
const copyIcon = document.getElementById('copyIcon');
const settingsBtn = document.getElementById('settingsBtn');
const outputText = document.getElementById('outputText');
const radarCanvas = document.getElementById('radarCanvas');
const loadingSpinner = document.getElementById('loadingSpinner');
const realtimeIndicator = document.getElementById('realtimeIndicator');
const identityBtn = document.getElementById('identityBtn');
const advancedBtn = document.getElementById('advancedBtn');
const intentFeedback = document.getElementById('intentFeedback');
const audienceMonologue = document.getElementById('audienceMonologue');

// ===========================================
// APPLICATION STATE
// ===========================================

let appState = {
    currentCulture: 'us',
    currentVersions: [],
    currentSelectedVersion: 0,
    analysisHistory: [],
    userPreferences: {}
};

let isAnalyzing = false;

const iconHtml = (type) => `<span class="icon icon-${type}" aria-hidden="true"></span>`;
const statusLine = (type, text) => `<p class="status-line">${iconHtml(type)}<span>${text}</span></p>`;

// ===========================================
// REALTIME CALIBRATION (slider-driven)
// ===========================================

let realtimeTimer = null;
let realtimeRequestId = 0;
let _realtimeCalibrating = false;

function _showRealtimeLoading(show) {
    if (realtimeIndicator) realtimeIndicator.style.display = show ? 'inline' : 'none';
    if (outputText) {
        if (show) outputText.classList.add('calibrating');
        else outputText.classList.remove('calibrating');
    }
}

function scheduleRealtimeCalibration() {
    if (!textInput || !geminiClient?.isConfigured()) return;
    const text = textInput.value.trim();
    if (!text) return;
    if (realtimeTimer) clearTimeout(realtimeTimer);
    const requestId = ++realtimeRequestId;
    _showRealtimeLoading(true);
    // Increased debounce time to reduce API calls (1500ms instead of immediate)
    realtimeTimer = setTimeout(async () => {
        if (requestId !== realtimeRequestId) return;
        _realtimeCalibrating = true;
        try {
            const params = {
                hierarchy: parseInt(hierarchySlider.value),
                emotional: parseInt(emotionalSlider.value),
                urgency: parseInt(urgencySlider.value),
                directness: parseInt(directnessSlider.value)
            };
            const apiResult = await geminiClient.calibrateSingle(
                text, appState.currentCulture,
                params.hierarchy, params.emotional, params.urgency, params.directness
            );
            if (requestId !== realtimeRequestId) return;
            const calibrated = apiResult?.text;
            if (calibrated) {
                if (outputText) outputText.value = calibrated;
                appState.currentVersions = [{ style: 'calibrated', text: calibrated }];
                appState.currentSelectedVersion = 0;
                saveUiStateNow();
            }
        } catch (e) {
            if (requestId !== realtimeRequestId) return;
            console.warn('Realtime calibration error:', e.message);
            try {
                const params = {
                    hierarchy: parseInt(hierarchySlider.value),
                    emotional: parseInt(emotionalSlider.value),
                    urgency: parseInt(urgencySlider.value),
                    directness: parseInt(directnessSlider.value)
                };
                const local = toneCalibrator.calibrate(text, params.hierarchy, params.emotional, params.urgency, params.directness);
                const localVersions = Array.isArray(local) ? local : (local?.versions || []);
                if (localVersions.length > 0 && localVersions[0]?.text) {
                    if (outputText) outputText.value = localVersions[0].text;
                    appState.currentVersions = localVersions;
                    saveUiStateNow();
                }
            } catch (_) { /* silent */ }
        } finally {
            if (requestId === realtimeRequestId) {
                _realtimeCalibrating = false;
                _showRealtimeLoading(false);
            }
        }
    }, 1500); // Increased from 500ms to 1500ms to reduce API call frequency
}

// ===========================================
// STATE PERSISTENCE
// ===========================================

const STATE_KEY = 'uiState';
const IDENTITY_KEY = 'identityConsistency';
let draftSaveTimer = null;

function saveUiStateNow() {
    const state = {
        message: textInput?.value || '',
        hierarchy: hierarchySlider?.value || 50,
        emotional: emotionalSlider?.value || 50,
        urgency: urgencySlider?.value || 50,
        directness: directnessSlider?.value || 50,
        recipient: recipientSelect?.value || '',
        outputText: outputText?.value || '',
        selectedVersion: appState.currentSelectedVersion || 0
    };
    chrome.storage.local.set({ [STATE_KEY]: state });
}

function scheduleDraftSave() {
    if (!textInput) return;
    if (draftSaveTimer) clearTimeout(draftSaveTimer);
    draftSaveTimer = setTimeout(() => {
        saveUiStateNow();
        chrome.storage.local.get([IDENTITY_KEY], (result) => {
            const state = result[IDENTITY_KEY];
            if (!state?.enabled) return;
            const message = (textInput.value || '').trim();
            if (message.length < 20) return;
            const samples = Array.isArray(state.samples) ? state.samples : [];
            const nextSamples = [message, ...samples.filter(s => s !== message)].slice(0, 50);
            chrome.storage.local.set({ [IDENTITY_KEY]: { ...state, samples: nextSamples } });
        });
    }, 300);
}

// ===========================================
// EVENT LISTENERS - INPUT & SLIDERS
// ===========================================

if (textInput) {
    textInput.addEventListener('input', scheduleDraftSave);
}

if (clearMessage) {
    clearMessage.addEventListener('click', () => {
        if (textInput) textInput.value = '';
        if (recipientSelect) recipientSelect.value = '';
        if (hierarchySlider) hierarchySlider.value = 50;
        if (emotionalSlider) emotionalSlider.value = 50;
        if (urgencySlider) urgencySlider.value = 50;
        if (directnessSlider) directnessSlider.value = 50;
        ['hierarchyValue', 'emotionalValue', 'urgencyValue', 'directnessValue'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '50';
        });
        if (outputText) outputText.value = '';
        if (intentFeedback) intentFeedback.innerHTML = '<p class="placeholder-text">Analyzing your intent...</p>';
        if (audienceMonologue) audienceMonologue.innerHTML = '<p class="placeholder-text">Generating audience inner reaction...</p>';
        updateRecipientPlaceholder();
        updateRadar({ hierarchy: 50, emotional: 50, urgency: 50, directness: 50 });
        chrome.storage.local.remove(STATE_KEY);
    });
}

window.addEventListener('beforeunload', () => saveUiStateNow());

function updateRadarFromSliders() {
    updateRadar({
        hierarchy: parseInt(hierarchySlider.value),
        emotional: parseInt(emotionalSlider.value),
        urgency: parseInt(urgencySlider.value),
        directness: parseInt(directnessSlider.value)
    });
}

function updateRecipientPlaceholder() {
    if (!recipientSelect) return;
    recipientSelect.classList.toggle('select-placeholder', !recipientSelect.value);
}

hierarchySlider.addEventListener('input', (e) => {
    document.getElementById('hierarchyValue').textContent = e.target.value;
    updateRadarFromSliders();
    scheduleDraftSave();
    scheduleRealtimeCalibration();
});

emotionalSlider.addEventListener('input', (e) => {
    document.getElementById('emotionalValue').textContent = e.target.value;
    updateRadarFromSliders();
    scheduleDraftSave();
    scheduleRealtimeCalibration();
});

urgencySlider.addEventListener('input', (e) => {
    document.getElementById('urgencyValue').textContent = e.target.value;
    updateRadarFromSliders();
    scheduleDraftSave();
    scheduleRealtimeCalibration();
});

directnessSlider.addEventListener('input', (e) => {
    document.getElementById('directnessValue').textContent = e.target.value;
    updateRadarFromSliders();
    scheduleDraftSave();
    scheduleRealtimeCalibration();
});

// ===========================================
// EVENT LISTENERS - BUTTONS
// ===========================================

recipientSelect.addEventListener('change', (e) => {
    appState.currentCulture = e.target.value || 'us';
    updateRecipientPlaceholder();
    scheduleDraftSave();
});

analyzeBtn.addEventListener('click', () => {
    performAnalysis().catch(error => {
        console.error('Analysis error:', error);
        isAnalyzing = false;
        showLoading(false);
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = 'Analyze Message';
    });
});

if (copyIcon) {
    copyIcon.addEventListener('click', () => {
        if (!outputText) return;
        outputText.select();
        document.execCommand('copy');
    });
}

settingsBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/popup/options.html') });
});

if (advancedBtn) {
    advancedBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('src/popup/prismtext-pro.html') });
    });
}

if (identityBtn) {
    identityBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('src/popup/identity.html') });
    });
}

// ===========================================
// QUICK API KEY SETUP
// ===========================================

if (quickSaveApiBtn) {
    quickSaveApiBtn.addEventListener('click', async () => {
        const apiKey = quickApiKey.value.trim();
        if (!apiKey) { alert('Please enter your API key.'); return; }
        if (!apiKey.startsWith('AIza')) { alert('API key should start with "AIza".'); return; }

        try {
            await chrome.storage.local.set({ geminiApiKey: apiKey });
            const result = await chrome.storage.local.get(['geminiApiKey']);
            if (result.geminiApiKey) {
                alert('API key saved successfully. Reinitializing...');
                quickApiKey.value = '';
                await initializeGeminiClient();
                if (apiKeyAlert) apiKeyAlert.style.display = 'none';
                if (analyzeBtn) { analyzeBtn.disabled = false; analyzeBtn.textContent = 'Analyze Message'; }
            } else {
                alert('Failed to save API key.');
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });

    if (quickApiKey) {
        quickApiKey.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') quickSaveApiBtn.click();
        });
    }
}

// ===========================================
// ANALYSIS
// ===========================================

function normalizeApiVersions(apiResult) {
    if (!apiResult || !Array.isArray(apiResult.versions)) return [];
    return apiResult.versions.slice(0, 3).map((v, idx) => ({
        style: ['balance', 'formal', 'warm'][idx],
        text: v?.text || ''
    })).filter(v => v.text);
}

async function performAnalysis() {
    const text = textInput.value.trim();
    if (!text) { alert('Please enter some text to analyze'); return; }
    if (isAnalyzing) { alert('Analysis is already running. Please wait...'); return; }
    if (!geminiClient?.isConfigured()) { alert('Gemini API key not configured. Please go to Settings.'); return; }

    isAnalyzing = true;
    showLoading(true);
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'Analyzing...';
    const startTime = Date.now();

    // Reset analysis sections to loading state
    if (intentFeedback) intentFeedback.innerHTML = '<p class="placeholder-text">Analyzing your intent...</p>';
    if (audienceMonologue) audienceMonologue.innerHTML = '<p class="placeholder-text">Generating inner monologue...</p>';

    const analysisTimeout = setTimeout(() => {
        isAnalyzing = false;
        showLoading(false);
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = 'Analyze Message';
    }, 30000);

    try {
        const params = {
            hierarchy: parseInt(hierarchySlider.value),
            emotional: parseInt(emotionalSlider.value),
            urgency: parseInt(urgencySlider.value),
            directness: parseInt(directnessSlider.value)
        };

        // Run all analysis steps
        const intentAnalysis = intentDetector.analyze(text);
        const languageAnalysis = languageDetector.detect(text);
        const semanticAnalysis = semanticAnalyzer.analyzeSemantic(text);
        const entities = entityRecognizer.recognizeEntities(text);
        const entitySummary = entityRecognizer.getEntitySummary(entities);
        const aspectSentiments = sentimentAnalyzer.analyzeAspectSentiment(text);
        const culturalAnalysis = culturalAnalyzer.analyze(appState.currentCulture, text, params);
        const context = buildContextualData();
        const contextualRecommendations = contextualIntelligence.getAdaptiveRecommendations(text, context);

        // Tone calibration (local fallback)
        const calibratedVersions = toneCalibrator.calibrate(text, params.hierarchy, params.emotional, params.urgency, params.directness);

        // Gemini API calibration (single version for slider-driven output)
        let outputVersion = '';
        try {
            const apiResult = await geminiClient.calibrateSingle(
                text, appState.currentCulture,
                params.hierarchy, params.emotional, params.urgency, params.directness
            );
            if (apiResult?.text) outputVersion = apiResult.text;
        } catch (e) {
            console.warn('Gemini calibration fallback to local:', e.message);
        }

        // Fallback to local calibration if API didn't return
        if (!outputVersion) {
            const localVersions = Array.isArray(calibratedVersions) ? calibratedVersions : (calibratedVersions?.versions || []);
            if (localVersions.length > 0 && localVersions[0]?.text) {
                outputVersion = localVersions[0].text;
            }
        }

        if (outputVersion) {
            if (outputText) outputText.value = outputVersion;
            appState.currentVersions = [{ style: 'calibrated', text: outputVersion }];
            appState.currentSelectedVersion = 0;
        }

        // Generate Intent & Rationale and Inner Monologue in parallel for better performance
        if (geminiClient?.isConfigured()) {
            const [intentRationaleResult, innerMonologueResult] = await Promise.allSettled([
                intentFeedback ? geminiClient.generateIntentRationale(
                    text, 
                    appState.currentCulture, 
                    intentAnalysis,
                    outputVersion,
                    params
                ) : Promise.resolve(null),
                audienceMonologue ? geminiClient.generateInnerMonologue(
                    text, 
                    appState.currentCulture,
                    outputVersion,
                    params
                ) : Promise.resolve(null)
            ]);

            // Update Intent & Rationale
            if (intentFeedback) {
                if (intentRationaleResult.status === 'fulfilled' && intentRationaleResult.value) {
                    const formatted = intentRationaleResult.value
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n\n/g, '</p><p>')
                        .replace(/\n/g, '<br>');
                    intentFeedback.innerHTML = `<p>${formatted}</p>`;
                } else {
                    console.warn('Intent rationale generation failed:', intentRationaleResult.reason?.message);
                    intentFeedback.innerHTML = '<p class="placeholder-text">Unable to generate intent analysis.</p>';
                }
            }

            // Update Inner Monologue
            if (audienceMonologue) {
                if (innerMonologueResult.status === 'fulfilled' && innerMonologueResult.value) {
                    audienceMonologue.innerHTML = `<p>${innerMonologueResult.value}</p>`;
                } else {
                    console.warn('Inner monologue generation failed:', innerMonologueResult.reason?.message);
                    audienceMonologue.innerHTML = '<p class="placeholder-text">Unable to generate inner monologue.</p>';
                }
            }
        }

        updateRadar(params);
        saveUiStateNow();

        // Log analysis history
        appState.analysisHistory.push({
            text, culture: appState.currentCulture, parameters: params,
            intent: intentAnalysis, semantic: semanticAnalysis,
            entities: entitySummary, language: languageAnalysis,
            timestamp: new Date().toISOString()
        });
        if (appState.analysisHistory.length > 20) appState.analysisHistory.shift();

    } catch (error) {
        console.error('Analysis error:', error);
    } finally {
        clearTimeout(analysisTimeout);
        console.log(`Analysis completed in ${Date.now() - startTime}ms`);
        isAnalyzing = false;
        showLoading(false);
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = 'Analyze Message';
    }
}

// ===========================================
// RADAR CHART
// ===========================================

function updateRadar(params) {
    if (!radarCanvas) return;
    const ctx = radarCanvas.getContext('2d');
    if (!ctx) return;

    let rect = radarCanvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
        radarCanvas.style.display = 'block';
        document.body.offsetHeight;
        rect = radarCanvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) rect = { width: 320, height: 220 };
    }

    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(rect.width, 320);
    const height = Math.max(rect.height, 220);
    radarCanvas.width = width * dpr;
    radarCanvas.height = height * dpr;
    radarCanvas.style.width = width + 'px';
    radarCanvas.style.height = height + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 42;

    ctx.clearRect(0, 0, width, height);

    const labels = ['Power Distance (Hierarchy)', 'Emotional\nSaturation', 'Urgency Level', 'Directness'];
    const values = [params.hierarchy || 50, params.emotional || 50, params.urgency || 50, params.directness || 50];

    // Grid circles
    ctx.strokeStyle = '#ABABAB';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, (radius / 5) * i, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Axes (dashed)
    ctx.setLineDash([4, 4]);
    for (let i = 0; i < labels.length; i++) {
        const angle = (Math.PI * 2 / labels.length) * i - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
        ctx.stroke();
    }
    ctx.setLineDash([]);

    // Data polygon
    ctx.fillStyle = 'rgba(167, 205, 184, 0.35)';
    ctx.strokeStyle = '#2E2E2E';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i < labels.length; i++) {
        const angle = (Math.PI * 2 / labels.length) * i - Math.PI / 2;
        const v = values[i] / 100;
        const x = centerX + Math.cos(angle) * (radius * v);
        const y = centerY + Math.sin(angle) * (radius * v);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Data points
    for (let i = 0; i < labels.length; i++) {
        const angle = (Math.PI * 2 / labels.length) * i - Math.PI / 2;
        const v = values[i] / 100;
        const x = centerX + Math.cos(angle) * (radius * v);
        const y = centerY + Math.sin(angle) * (radius * v);
        ctx.fillStyle = '#ECECEC';
        ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#2E2E2E';
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
    }

    // Labels
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#2E2E2E';
    const labelOffsets = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 0 }, { x: -8, y: 0 }];
    for (let i = 0; i < labels.length; i++) {
        const angle = (Math.PI * 2 / labels.length) * i - Math.PI / 2;
        const off = labelOffsets[i];
        const lx = centerX + Math.cos(angle) * (radius + 28) + off.x;
        const ly = centerY + Math.sin(angle) * (radius + 28) + off.y;
        const lines = labels[i].split('\n');
        const startY = ly - ((lines.length - 1) * 12) / 2;
        lines.forEach((line, idx) => ctx.fillText(line, lx, startY + idx * 12));
    }

    // Center dot
    ctx.fillStyle = '#ABABAB';
    ctx.beginPath(); ctx.arc(centerX, centerY, 2, 0, Math.PI * 2); ctx.fill();
}

// ===========================================
// HELPERS
// ===========================================

let loadingTimeoutId = null;

function showLoading(show) {
    loadingSpinner.classList.toggle('hidden', !show);
    if (show) {
        if (loadingTimeoutId) clearTimeout(loadingTimeoutId);
        loadingTimeoutId = setTimeout(() => {
            loadingSpinner.classList.add('hidden');
            loadingTimeoutId = null;
        }, 30000);
    } else if (loadingTimeoutId) {
        clearTimeout(loadingTimeoutId);
        loadingTimeoutId = null;
    }
}

function buildContextualData() {
    return {
        recipient: appState.currentCulture,
        threadHistory: appState.analysisHistory.slice(-5),
        userPreferences: appState.userPreferences,
        parameters: {
            hierarchy: parseInt(hierarchySlider.value),
            emotional: parseInt(emotionalSlider.value),
            urgency: parseInt(urgencySlider.value),
            directness: parseInt(directnessSlider.value)
        }
    };
}

// ===========================================
// INITIALIZATION
// ===========================================

async function initializeUI() {
    // Initialize Gemini Client
    const geminiConfigured = await initializeGeminiClient();

    if (!geminiConfigured || !geminiClient.isConfigured()) {
        analyzeBtn.disabled = true;
        analyzeBtn.title = 'Gemini API key not configured';
        analyzeBtn.textContent = 'Configure API Key First';
        if (apiKeyAlert) apiKeyAlert.style.display = 'block';
    } else {
        analyzeBtn.disabled = false;
        analyzeBtn.title = 'Click to analyze your message';
        analyzeBtn.textContent = 'Analyze Message';
        if (apiKeyAlert) apiKeyAlert.style.display = 'none';
    }

    // Verify required modules
    const required = [
        { name: 'intentDetector', obj: intentDetector },
        { name: 'culturalAnalyzer', obj: culturalAnalyzer },
        { name: 'toneCalibrator', obj: toneCalibrator },
        { name: 'semanticAnalyzer', obj: semanticAnalyzer },
        { name: 'entityRecognizer', obj: entityRecognizer },
        { name: 'languageDetector', obj: languageDetector },
        { name: 'sentimentAnalyzer', obj: sentimentAnalyzer }
    ];
    const missing = required.filter(m => !m.obj).map(m => m.name);
    if (missing.length > 0) {
        console.error('Missing modules:', missing.join(', '));
        analyzeBtn.disabled = true;
        return;
    }

    // Populate recipient dropdown
    recipientSelect.innerHTML = '<option value="">Select recipient country...</option>';
    Object.values(EXTENDED_RECIPIENTS)
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(r => {
            const opt = document.createElement('option');
            opt.value = r.code;
            opt.textContent = `${r.name} (${r.region})`;
            recipientSelect.appendChild(opt);
        });
    updateRecipientPlaceholder();

    // Load saved preferences
    chrome.storage.local.get(['userPreferences'], (result) => {
        if (result.userPreferences) appState.userPreferences = result.userPreferences;
    });

    // Restore saved UI state
    chrome.storage.local.get([STATE_KEY], (result) => {
        const state = result[STATE_KEY];
        if (state) {
            if (textInput) textInput.value = state.message || '';
            if (recipientSelect && state.recipient !== undefined) recipientSelect.value = state.recipient;
            if (hierarchySlider && state.hierarchy !== undefined) hierarchySlider.value = state.hierarchy;
            if (emotionalSlider && state.emotional !== undefined) emotionalSlider.value = state.emotional;
            if (urgencySlider && state.urgency !== undefined) urgencySlider.value = state.urgency;
            if (directnessSlider && state.directness !== undefined) directnessSlider.value = state.directness;
            ['hierarchyValue', 'emotionalValue', 'urgencyValue', 'directnessValue'].forEach(id => {
                const el = document.getElementById(id);
                if (!el) return;
                const map = {
                    hierarchyValue: hierarchySlider?.value,
                    emotionalValue: emotionalSlider?.value,
                    urgencyValue: urgencySlider?.value,
                    directnessValue: directnessSlider?.value
                };
                if (map[id] !== undefined) el.textContent = map[id];
            });
            if (outputText && state.outputText !== undefined) outputText.value = state.outputText;
            if (state.selectedVersion !== undefined) appState.currentSelectedVersion = state.selectedVersion;
            updateRecipientPlaceholder();
            updateRadarFromSliders();
            return;
        }

        // Default state
        [hierarchySlider, emotionalSlider, urgencySlider, directnessSlider].forEach(s => { if (s) s.value = 50; });
        ['hierarchyValue', 'emotionalValue', 'urgencyValue', 'directnessValue'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '50';
        });
        updateRadar({ hierarchy: 50, emotional: 50, urgency: 50, directness: 50 });
    });

    // Listen for API key changes from settings page
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName !== 'local' || !changes.geminiApiKey) return;
        const newKey = changes.geminiApiKey.newValue;
        if (newKey) {
            geminiClient = new GeminiClient(newKey);
            if (geminiClient.isConfigured()) {
                analyzeBtn.disabled = false;
                analyzeBtn.textContent = 'Analyze Message';
                if (apiKeyAlert) apiKeyAlert.style.display = 'none';
            }
        } else {
            geminiClient = new GeminiClient(null);
            analyzeBtn.disabled = true;
            analyzeBtn.textContent = 'Configure API Key First';
        }
    });
}

// ===========================================
// BOOT
// ===========================================

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initializeUI();
    } catch (error) {
        console.error('Fatal error during initialization:', error);
        const container = document.querySelector('.container');
        if (container) {
            container.innerHTML = `
                <div style="color: #2E2E2E; padding: 20px; text-align: center;">
                    <h2>${iconHtml('error')} Extension Error</h2>
                    <p>Failed to initialize PrismText. Please refresh.</p>
                    <details style="text-align: left; margin-top: 20px;">
                        <summary>Error Details</summary>
                        <pre style="font-size: 12px; background: #ECECEC; padding: 10px; border-radius: 8px; border: 1px solid #ABABAB;">${error.message}</pre>
                    </details>
                </div>
            `;
        }
    }
});
