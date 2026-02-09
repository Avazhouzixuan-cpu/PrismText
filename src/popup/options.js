// Store original API key to detect changes
let originalApiKey = null;

// Load settings on page load
document.addEventListener('DOMContentLoaded', loadSettings);

function loadSettings() {
    chrome.storage.local.get([
        'geminiApiKey',
        'enableAnalytics',
        'enableContextMenu',
        'enableNotifications'
    ], (result) => {
        console.log('📂 Loading settings from storage...');
        
        if (result.geminiApiKey) {
            originalApiKey = result.geminiApiKey; // Store original
            console.log('✅ Loaded existing API key:', result.geminiApiKey.substring(0, 4) + '****');
            
            // Show masked API key
            const maskedKey = result.geminiApiKey.substring(0, 4) + 
                            '*'.repeat(Math.max(0, result.geminiApiKey.length - 8)) + 
                            result.geminiApiKey.substring(Math.max(0, result.geminiApiKey.length - 4));
            document.getElementById('apiKey').value = maskedKey;
            document.getElementById('apiKey').placeholder = '(Already configured - enter new key to change)';
        } else {
            console.log('⚠️ No API key found in storage');
            document.getElementById('apiKey').placeholder = 'AIza... (get from https://ai.google.dev)';
        }
        
        document.getElementById('enableAnalytics').checked = result.enableAnalytics !== false;
        document.getElementById('enableContextMenu').checked = result.enableContextMenu !== false;
        document.getElementById('enableNotifications').checked = result.enableNotifications !== false;
        
        console.log('📋 All settings loaded');
    });
}

function saveSettings() {
    const apiKeyInput = document.getElementById('apiKey').value.trim();
    console.log('💾 Saving settings...');
    console.log('   API Key input:', apiKeyInput.substring(0, 4) + '****');
    console.log('   Original API Key:', originalApiKey ? originalApiKey.substring(0, 4) + '****' : 'none');
    
    const settings = {
        enableAnalytics: document.getElementById('enableAnalytics').checked,
        enableContextMenu: document.getElementById('enableContextMenu').checked,
        enableNotifications: document.getElementById('enableNotifications').checked
    };

    // Determine if user entered a new API key (no asterisks = new key)
    const isNewApiKey = !apiKeyInput.includes('*');
    const isEmptyInput = apiKeyInput.length === 0;
    
    if (!originalApiKey && isEmptyInput) {
        // First time setup and nothing entered
        showStatus('❌ Please enter your Gemini API key', 'error');
        return;
    }
    
    if (isNewApiKey && apiKeyInput) {
        // User entered a new key (no asterisks)
        // Support both Gemini API format (AIza...) and legacy formats
        if (!apiKeyInput.startsWith('AIza') && !apiKeyInput.startsWith('sk-')) {
            console.warn('⚠️ API key format might be incorrect. Should start with AIza or sk-');
        }
        settings.geminiApiKey = apiKeyInput;
        console.log('✅ New API key will be saved:', apiKeyInput.substring(0, 4) + '****');
    } else if (!isEmptyInput && !isNewApiKey) {
        // User didn't change the masked key, keep the original
        if (originalApiKey) {
            settings.geminiApiKey = originalApiKey;
            console.log('ℹ️ Keeping existing API key unchanged');
        } else {
            showStatus('⚠️ Enter a valid API key', 'error');
            return;
        }
    } else if (isEmptyInput && originalApiKey) {
        // User cleared the field but had previous key
        settings.geminiApiKey = originalApiKey;
        console.log('ℹ️ Field was cleared, keeping existing key');
    }

    chrome.storage.local.set(settings, () => {
        if (chrome.runtime.lastError) {
            showStatus('❌ Error saving: ' + chrome.runtime.lastError.message, 'error');
            console.error('Storage error:', chrome.runtime.lastError);
            return;
        }
        
        // Re-load to confirm saved
        chrome.storage.local.get(['geminiApiKey'], (result) => {
            if (result.geminiApiKey) {
                console.log('✅ Verified saved API key:', result.geminiApiKey.substring(0, 4) + '****');
                showStatus('✅ Settings saved successfully!', 'success');
                originalApiKey = result.geminiApiKey; // Update for next session
                
                // Close after a brief delay so user sees the message
                setTimeout(() => window.close(), 1500);
            } else {
                showStatus('❌ Save verification failed', 'error');
                console.error('API key not found after save');
            }
        });
    });
}

function resetForm() {
    loadSettings();
    showStatus('✅ Form reset to last saved settings', 'success');
}

function clearAllData() {
    if (confirm('Are you sure? This will delete ALL saved settings and cannot be undone.')) {
        chrome.storage.local.clear(() => {
            showStatus('✅ All data cleared. Refreshing...', 'success');
            setTimeout(() => window.location.reload(), 1500);
        });
    }
}

function showStatus(message, type) {
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.textContent = message;
    statusDiv.className = `status-message ${type}`;
    
    if (type === 'error') {
        setTimeout(() => {
            statusDiv.classList.remove('error');
        }, 5000);
    }
}

// Attach event listeners - MUST happen after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 Attaching event listeners to buttons...');
    
    // Find and bind Save button
    const saveBtns = document.querySelectorAll('.btn-save');
    console.log('Found Save buttons:', saveBtns.length);
    saveBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('💾 Save button clicked');
            saveSettings();
        });
    });
    
    // Find and bind Reset button
    const resetBtns = document.querySelectorAll('.btn-reset');
    console.log('Found Reset buttons:', resetBtns.length);
    resetBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('↻ Reset button clicked');
            resetForm();
        });
    });
    
    // Find and bind Clear button (specific ID)
    const clearBtn = document.querySelector('button[onclick*="clearAllData"]');
    if (clearBtn) {
        clearBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🗑️ Clear button clicked');
            clearAllData();
        });
    }
    
    console.log('✅ Event listeners attached');
});
