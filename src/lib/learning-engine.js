// ========================================
// LearningEngine Module (Iterations 31-35)
// Learns from user feedback to improve system recommendations
// ========================================

class LearningEngine {
    constructor() {
        this.feedbackHistory = [];
        this.learningPatterns = {};
        this.abTests = {};
        this.insights = {
            culturesLearned: 0,
            intentsLearned: 0,
            activeABTests: 0
        };
        this.init();
    }

    // Initialize by loading learning data from Chrome Storage
    init() {
        chrome.storage.local.get(['learningPatterns', 'abTests', 'insights'], (result) => {
            if (result.learningPatterns) {
                this.learningPatterns = result.learningPatterns;
            }
            if (result.abTests) {
                this.abTests = result.abTests;
            }
            if (result.insights) {
                this.insights = result.insights;
            }
        });
    }

    // Learn from positive feedback
    learnFromPositive(feedback, analysisData) {
        this.feedbackHistory.push({ feedback, analysisData, type: 'positive' });

        // Update learning patterns
        const culture = analysisData.culture;
        const intent = analysisData.intent?.primaryIntent || 'unknown';

        if (!this.learningPatterns[culture]) {
            this.learningPatterns[culture] = { positive: 0, negative: 0, patterns: {} };
        }
        this.learningPatterns[culture].positive++;

        if (!this.learningPatterns[culture].patterns[intent]) {
            this.learningPatterns[culture].patterns[intent] = { positive: 0, negative: 0 };
        }
        this.learningPatterns[culture].patterns[intent].positive++;

        this.insights.culturesLearned = Object.keys(this.learningPatterns).length;
        this.insights.intentsLearned = Object.values(this.learningPatterns).reduce((sum, c) => sum + Object.keys(c.patterns).length, 0);

        this.persistLearningData();
    }

    // Learn from negative feedback
    learnFromNegative(feedback, analysisData) {
        this.feedbackHistory.push({ feedback, analysisData, type: 'negative' });

        // Update learning patterns
        const culture = analysisData.culture;
        const intent = analysisData.intent?.primaryIntent || 'unknown';

        if (!this.learningPatterns[culture]) {
            this.learningPatterns[culture] = { positive: 0, negative: 0, patterns: {} };
        }
        this.learningPatterns[culture].negative++;

        if (!this.learningPatterns[culture].patterns[intent]) {
            this.learningPatterns[culture].patterns[intent] = { positive: 0, negative: 0 };
        }
        this.learningPatterns[culture].patterns[intent].negative++;

        this.persistLearningData();
    }

    // Get learning insights
    getLearningInsights() {
        return this.insights;
    }

    // Export learning data
    exportLearningData() {
        return {
            feedbackHistory: this.feedbackHistory,
            learningPatterns: this.learningPatterns,
            abTests: this.abTests,
            insights: this.insights,
            exportDate: new Date().toISOString()
        };
    }

    // Persist learning data to Chrome Storage
    persistLearningData() {
        chrome.storage.local.set({
            learningPatterns: this.learningPatterns,
            abTests: this.abTests,
            insights: this.insights,
            lastUpdated: new Date().toISOString()
        });
    }
}

// Export for use in popup.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LearningEngine;
}

// Make available globally for browser
if (typeof window !== 'undefined') {
    window.LearningEngine = LearningEngine;
}
