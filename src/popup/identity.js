const IDENTITY_KEY = 'identityConsistency';

const identityEnabled = document.getElementById('identityEnabled');
const identityFiles = document.getElementById('identityFiles');
const importSamples = document.getElementById('importSamples');
const clearSamples = document.getElementById('clearSamples');
const identityStatus = document.getElementById('identityStatus');
const sampleCount = document.getElementById('sampleCount');
const analyzeStyle = document.getElementById('analyzeStyle');
const styleSummary = document.getElementById('styleSummary');

function updateStatus(state) {
    const count = state.samples?.length || 0;
    identityStatus.textContent = count > 0 ? 'Samples imported.' : 'No samples imported yet.';
    sampleCount.textContent = `Samples: ${count}`;
}

function analyzeSamples(samples) {
    const text = samples.join(' ').toLowerCase();
    const transitions = ['however', 'therefore', 'because', 'but', 'so', 'meanwhile', 'moreover', 'in addition', 'as a result', 'for example'];
    const transitionHits = transitions.filter(t => text.includes(t));
    const transitionSummary = transitionHits.length ? transitionHits.slice(0, 4).join(', ') : 'Low usage';

    const stop = new Set(['the','and','to','of','a','in','is','it','that','for','on','with','as','this','be','are','or','by','an','from','at','we','you','i','our','your']);
    const words = text.match(/[a-z']+/g) || [];
    const freq = {};
    words.forEach(w => { if (!stop.has(w)) freq[w] = (freq[w] || 0) + 1; });
    const topWords = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([w])=>w).join(', ') || 'Not enough data';

    const warmSignals = ['please', 'thanks', 'appreciate', 'glad', 'happy'];
    const directSignals = ['must', 'need', 'require', 'urgent', 'asap'];
    const warmCount = warmSignals.filter(w => text.includes(w)).length;
    const directCount = directSignals.filter(w => text.includes(w)).length;
    const tone = warmCount >= directCount ? 'warm / polite' : 'direct / decisive';

    return `Logic transitions: ${transitionSummary}. Word preferences: ${topWords}. Tone style: ${tone}.`;
}

function loadState() {
    chrome.storage.local.get([IDENTITY_KEY], (result) => {
        const state = result[IDENTITY_KEY] || { enabled: false, samples: [] };
        if (identityEnabled) identityEnabled.checked = !!state.enabled;
        updateStatus(state);
        if (styleSummary) {
            styleSummary.textContent = state.samples?.length ? analyzeSamples(state.samples) : 'No summary yet. Import samples or enable auto-save to build your profile.';
        }
    });
}

function saveState(update) {
    chrome.storage.local.get([IDENTITY_KEY], (result) => {
        const state = result[IDENTITY_KEY] || { enabled: false, samples: [] };
        const next = { ...state, ...update };
        chrome.storage.local.set({ [IDENTITY_KEY]: next }, () => {
            updateStatus(next);
            if (styleSummary) {
                styleSummary.textContent = next.samples?.length ? analyzeSamples(next.samples) : 'No summary yet. Import samples or enable auto-save to build your profile.';
            }
        });
    });
}

if (identityEnabled) {
    identityEnabled.addEventListener('change', () => {
        saveState({ enabled: identityEnabled.checked });
    });
}

if (importSamples) {
    importSamples.addEventListener('click', async () => {
        if (!identityFiles || !identityFiles.files || identityFiles.files.length === 0) {
            identityStatus.textContent = 'Please select files first.';
            return;
        }
        const files = Array.from(identityFiles.files);
        const texts = await Promise.all(files.map(f => f.text().catch(() => '')));
        const cleaned = texts.map(t => t.trim()).filter(Boolean);
        saveState({ samples: cleaned });
    });
}

if (clearSamples) {
    clearSamples.addEventListener('click', () => {
        saveState({ samples: [] });
    });
}

if (analyzeStyle) {
    analyzeStyle.addEventListener('click', () => {
        chrome.storage.local.get([IDENTITY_KEY], (result) => {
            const state = result[IDENTITY_KEY] || { samples: [] };
            if (styleSummary) {
                styleSummary.textContent = state.samples?.length ? analyzeSamples(state.samples) : 'No summary yet. Import samples or enable auto-save to build your profile.';
            }
        });
    });
}

loadState();
