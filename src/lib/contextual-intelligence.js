// ITERATION 11-20: CONTEXTUAL INTELLIGENCE & USER LEARNING
// Email thread awareness, communication history, user preferences

class ContextualIntelligence {
    // NEW: Email thread and communication history analysis
    constructor() {
        this.communicationHistory = [];
        this.userPreferences = {};
        this.organizationalPatterns = {};
    }

    // ITERATION 11: Email thread context analysis
    analyzeEmailThread(currentMessage, previousMessages = [], recipientProfile = {}) {
        const context = {
            threadLength: previousMessages.length,
            threadTone: this.analyzeThreadTone(previousMessages),
            recipientHistory: this.buildRecipientHistory(previousMessages, recipientProfile),
            conversationPhase: this.determineConversationPhase(previousMessages),
            emotionalTrajectory: this.trackEmotionalTrajectory(previousMessages),
            recommendedTone: this.recommendToneAdjustment(previousMessages, currentMessage)
        };

        return context;
    }

    // ITERATION 12: Thread tone analysis
    analyzeThreadTone(messages) {
        if (messages.length === 0) return { tone: 'neutral', consistency: 0 };

        const tones = messages.map(msg => this.detectTone(msg));
        const toneFrequency = {};

        tones.forEach(tone => {
            toneFrequency[tone] = (toneFrequency[tone] || 0) + 1;
        });

        const dominantTone = Object.keys(toneFrequency).reduce((a, b) =>
            toneFrequency[a] > toneFrequency[b] ? a : b
        );

        return {
            dominantTone,
            toneConsistency: (toneFrequency[dominantTone] / messages.length) * 100,
            allTones: tones,
            distribution: toneFrequency
        };
    }

    // ITERATION 13: Recipient history building
    buildRecipientHistory(previousMessages, recipientProfile) {
        if (previousMessages.length === 0) return { isFirstContact: true, interactionCount: 0 };

        const recipientHistory = {
            isFirstContact: false,
            interactionCount: previousMessages.length,
            preferredFormality: this.detectPreferredFormality(previousMessages),
            responsePatterns: this.analyzeResponsePatterns(previousMessages),
            commonTopics: this.extractCommonTopics(previousMessages),
            relationshipStrength: this.scoreRelationshipStrength(previousMessages),
            trustLevel: this.assessTrustLevel(previousMessages),
            communicationStyle: recipientProfile.communicationPreference || 'unknown'
        };

        return recipientHistory;
    }

    // ITERATION 14: Conversation phase detection
    determineConversationPhase(messages) {
        const messageCount = messages.length;

        if (messageCount === 0) return 'initiation';
        if (messageCount === 1) return 'response';
        if (messageCount < 5) return 'early_stage';
        if (messageCount < 10) return 'development';
        return 'established_relationship';
    }

    // ITERATION 15: Emotional trajectory tracking
    trackEmotionalTrajectory(messages) {
        if (!messages || messages.length === 0) {
            return { trajectory: [], overallTrend: 'neutral', volatility: 0, lastMessageSentiment: 0 };
        }
        const emotionalScores = messages.map((msg, idx) => {
            const text = typeof msg === 'string' ? msg : (msg?.text || msg?.content || '');
            return {
                index: idx,
                sentiment: this.scoreSentiment(text),
                intensityChange: idx > 0 ? this.scoreSentiment(text) - this.scoreSentiment(typeof messages[idx - 1] === 'string' ? messages[idx - 1] : (messages[idx - 1]?.text || messages[idx - 1]?.content || '')) : 0
            };
        });
        const last = emotionalScores[emotionalScores.length - 1];
        const first = emotionalScores[0];
        return {
            trajectory: emotionalScores,
            overallTrend: last.sentiment > first.sentiment ? 'improving' : last.sentiment < first.sentiment ? 'declining' : 'neutral',
            volatility: this.calculateVolatility(emotionalScores),
            lastMessageSentiment: last.sentiment
        };
    }

    // ITERATION 16: Tone adjustment recommendations
    recommendToneAdjustment(previousMessages, currentMessage) {
        const threadTone = this.analyzeThreadTone(previousMessages);
        const currentTone = this.detectTone(currentMessage);
        const mismatch = this.calculateToneMismatch(threadTone.dominantTone, currentTone);

        return {
            shouldMatch: mismatch > 0.5,
            recommendedTone: threadTone.dominantTone,
            currentMismatch: mismatch,
            advice: mismatch > 0.5 ? 'Consider adjusting tone to match conversation thread' : 'Tone is well-aligned'
        };
    }

    // ITERATION 17: User preference learning system
    recordUserChoice(originalText, selectedVersion, contextData) {
        const preference = {
            timestamp: new Date().toISOString(),
            original: originalText,
            selectedVersion: selectedVersion,
            context: contextData,
            recipient: contextData.recipient || 'unknown',
            culture: contextData.culture || 'unknown',
            parameters: contextData.parameters || {},
            feedback: null // Will be filled in later
        };

        this.userPreferences[contextData.recipient] = preference;
        return preference;
    }

    // ITERATION 18: Recipient preference extraction
    getRecipientPreferences(recipientName) {
        const allPreferences = Object.values(this.userPreferences)
            .filter(pref => pref.recipient === recipientName);

        if (allPreferences.length === 0) return null;

        const avgHierarchy = allPreferences.reduce((sum, pref) => sum + (pref.parameters.h || 50), 0) / allPreferences.length;
        const avgEmotion = allPreferences.reduce((sum, pref) => sum + (pref.parameters.e || 50), 0) / allPreferences.length;
        const avgUrgency = allPreferences.reduce((sum, pref) => sum + (pref.parameters.u || 50), 0) / allPreferences.length;
        const avgDirectness = allPreferences.reduce((sum, pref) => sum + (pref.parameters.d || 50), 0) / allPreferences.length;

        return {
            interactionCount: allPreferences.length,
            preferredParameters: {
                hierarchy: Math.round(avgHierarchy),
                emotion: Math.round(avgEmotion),
                urgency: Math.round(avgUrgency),
                directness: Math.round(avgDirectness)
            },
            mostUsedStyle: this.getMostCommonStyle(allPreferences),
            trends: this.analyzeTrends(allPreferences)
        };
    }

    // ITERATION 19: Organizational pattern recognition
    identifyOrganizationPattern(messages) {
        const patterns = {
            decisionMakingSpeed: this.analyzeDecisionSpeed(messages),
            responseTime: this.analyzeResponseTime(messages),
            formalityTrend: this.analyzeFormalityTrend(messages),
            collaborationStyle: this.analyzeCollaborationStyle(messages),
            communicationFrequency: messages.length
        };

        return patterns;
    }

    // ITERATION 20: Adaptive recommendation engine
    getAdaptiveRecommendations(currentMessage, context) {
        const userHistory = this.getRecipientPreferences(context.recipient);
        const orgPattern = this.identifyOrganizationPattern(context.threadHistory || []);
        const threadContext = this.analyzeEmailThread(currentMessage, context.threadHistory || []);

        const recommendations = {
            preferredParameters: userHistory?.preferredParameters || { hierarchy: 50, emotion: 50, urgency: 50, directness: 50 },
            organizationalAlignment: this.calculateOrganizationalAlignment(orgPattern, context),
            threadAlignment: threadContext.recommendedTone,
            mlPrediction: this.predictBestVersion(currentMessage, context),
            confidence: userHistory ? ((userHistory.interactionCount / 10) * 100) : 30
        };

        return recommendations;
    }

    // ===== HELPER METHODS =====

    detectTone(message) {
        const exclamations = (message.match(/!/g) || []).length;
        const questions = (message.match(/\?/g) || []).length;
        const softMarkers = (message.match(/perhaps|maybe|could|might/gi) || []).length;
        const directMarkers = (message.match(/must|should|need to/gi) || []).length;

        if (directMarkers > softMarkers) return 'direct';
        if (softMarkers > directMarkers) return 'indirect';
        if (exclamations > questions) return 'enthusiastic';
        if (questions > 0) return 'inquisitive';
        return 'neutral';
    }

    scoreSentiment(message) {
        const text = typeof message === 'string' ? message : (message?.text || message?.content || '');
        const positiveWords = ['good', 'great', 'excellent', 'happy', 'pleased', 'agree'];
        const negativeWords = ['bad', 'poor', 'unfortunately', 'concerned', 'problem'];
        
        const posCount = positiveWords.filter(w => text.toLowerCase().includes(w)).length;
        const negCount = negativeWords.filter(w => text.toLowerCase().includes(w)).length;

        return (posCount - negCount) / Math.max((text.split(' ').length || 1) / 10, 1);
    }

    calculateVolatility(emotionalScores) {
        if (emotionalScores.length < 2) return 0;
        
        const diffs = emotionalScores.slice(1).map((score, idx) =>
            Math.abs(score.intensityChange)
        );

        return diffs.reduce((a, b) => a + b, 0) / diffs.length;
    }

    calculateToneMismatch(threadTone, currentTone) {
        const mismatchScore = threadTone !== currentTone ? 1 : 0;
        return mismatchScore;
    }

    getMostCommonStyle(preferences) {
        // Cluster preferences by similar parameters to find common style
        return preferences.length > 0 ? preferences[0].selectedVersion : 'balanced';
    }

    analyzeTrends(preferences) {
        if (preferences.length < 2) return { hasTrend: false };

        const first = preferences[Math.floor(preferences.length / 3)].parameters;
        const last = preferences[preferences.length - 1].parameters;

        return {
            hasTrend: true,
            hierarchyTrend: last.h - first.h,
            emotionTrend: last.e - first.e
        };
    }

    analyzeDecisionSpeed(messages) {
        if (messages.length < 2) return 'unknown';
        
        const times = messages.map(m => new Date(m.timestamp || m.date).getTime());
        const avgInterval = (times[times.length - 1] - times[0]) / (times.length - 1);

        if (avgInterval < 3600000) return 'fast'; // < 1 hour
        if (avgInterval < 86400000) return 'normal'; // < 1 day
        return 'slow';
    }

    analyzeResponseTime(messages) {
        if (messages.length < 2) return 0;
        
        const times = messages.map(m => new Date(m.timestamp || m.date).getTime());
        const intervals = [];

        for (let i = 1; i < times.length; i++) {
            intervals.push(times[i] - times[i - 1]);
        }

        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        return Math.round(avgInterval / 1000 / 60); // Convert to minutes
    }

    analyzeFormalityTrend(messages) {
        const formalities = messages.map(m => this.estimateFormality(m));
        const trend = formalities[formalities.length - 1] - formalities[0];

        return {
            direction: trend > 5 ? 'increasing' : trend < -5 ? 'decreasing' : 'stable',
            magnitude: Math.abs(trend)
        };
    }

    analyzeCollaborationStyle(messages) {
        const inclusiveLanguage = messages.filter(m =>
            m.toLowerCase().includes('we') || m.toLowerCase().includes('our')
        ).length;

        return (inclusiveLanguage / messages.length) * 100 > 50 ? 'collaborative' : 'individualistic';
    }

    calculateOrganizationalAlignment(pattern, context) {
        // Score how well current context aligns with detected organizational patterns
        return 65; // Placeholder: would calculate based on pattern matching
    }

    predictBestVersion(message, context) {
        // ML prediction placeholder
        return {
            predictedVersion: 'balanced',
            confidence: 0.65,
            reasoning: 'Based on similar past messages'
        };
    }

    estimateFormality(message) {
        const formalMarkers = ['respectfully', 'hereby', 'kindly', 'regarding'];
        const casualMarkers = ['hey', 'gonna', 'wanna', 'cool'];

        const formalCount = formalMarkers.filter(m => message.toLowerCase().includes(m)).length;
        const casualCount = casualMarkers.filter(m => message.toLowerCase().includes(m)).length;

        return (formalCount * 10 - casualCount * 10);
    }

    detectPreferredFormality(messages) {
        if (messages.length === 0) return 'unknown';
        
        const formalityScores = messages.map(m => this.estimateFormality(m));
        const avgFormality = formalityScores.reduce((a, b) => a + b, 0) / formalityScores.length;

        if (avgFormality > 10) return 'formal';
        if (avgFormality < -10) return 'casual';
        return 'neutral';
    }

    analyzeResponsePatterns(messages) {
        return {
            averageLength: messages.reduce((sum, m) => sum + m.length, 0) / messages.length,
            responseStyle: 'established',
            typicalTopics: []
        };
    }

    extractCommonTopics(messages) {
        // Placeholder for topic extraction
        return [];
    }

    scoreRelationshipStrength(messages) {
        return Math.min(100, (messages.length / 10) * 100);
    }

    assessTrustLevel(messages) {
        // Placeholder: would calculate trust based on patterns
        return Math.min(100, (messages.length / 5) * 100);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContextualIntelligence;
}

// Make available globally for browser
if (typeof window !== 'undefined') {
    window.ContextualIntelligence = ContextualIntelligence;
}
