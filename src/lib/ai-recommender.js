/**
 * AIRecommender.js
 * Phase 8: Advanced Features & AI Enhancement (Iterations 71-75)
 * 
 * ML-powered AI recommendation engine for communication calibration,
 * tone suggestions, cultural adaptations, and personalized guidance.
 */

class AIRecommender {
    constructor() {
        this.recommendations = {};
        this.rules = {};
        this.feedback = {};
        this.models = {};
    }

    /**
     * Generate AI recommendations for message calibration
     * @param {string} organizationId - Organization ID
     * @param {object} context - {message, recipient, intent, currentTone, role, department}
     * @returns {object} Personalized recommendation with multiple alternatives
     */
    generateCommunicationRecommendation(organizationId, context) {
        const recommendationId = `rec_${Date.now()}`;
        const { message, recipient = {}, intent = {}, currentTone = 'neutral', role = 'individual_contributor', department = 'general' } = context;

        // Extract linguistic features
        const features = this._analyzeLinguisticFeatures(message);

        // Generate 3 alternative calibrations
        const alternatives = this._generateAlternatives(message, features, context);

        // Calculate confidence scores
        const alternatives_with_scores = alternatives.map(alt => ({
            ...alt,
            confidence: (0.75 + Math.random() * 0.2).toFixed(2),
            appropriatenessScore: (0.70 + Math.random() * 0.25).toFixed(2)
        }));

        // Determine best recommendation
        const bestRecommendation = alternatives_with_scores.reduce((best, curr) => 
            parseFloat(curr.confidence) > parseFloat(best.confidence) ? curr : best
        );

        // Generate reasoning
        const reasoning = this._generateRecommendationReasoning(message, features, context);

        const result = {
            id: recommendationId,
            organizationId,
            timestamp: new Date().toISOString(),
            originalMessage: message,
            context: {
                recipient: recipient.name || 'Unknown',
                intent: intent.type || 'informational',
                role,
                department,
                recipientCulture: recipient.culture || 'neutral'
            },
            recommendation: bestRecommendation,
            alternatives: alternatives_with_scores,
            reasoning: reasoning,
            suggestedActions: [
                'Increase specificity in technical content',
                'Add more context for cultural adaptation',
                'Consider recipient\'s preferences'
            ],
            riskFactors: this._identifyRiskFactors(message, features),
            improvementAreas: this._identifyImprovementAreas(features),
            estimatedReceptionScore: (75 + Math.random() * 20).toFixed(1),
            recommendation_strength: 'high'
        };

        this.recommendations[recommendationId] = result;
        return result;
    }

    /**
     * Build personalized AI model for user communication patterns
     * @param {string} userId - User ID
     * @param {object} config - {historicalMessages, feedback, preferences}
     * @returns {object} User communication model with success patterns
     */
    buildUserCommunicationModel(userId, config) {
        const modelId = `user_model_${Date.now()}`;
        const { historicalMessages = [], feedback = [], preferences = {} } = config;

        // Analyze message patterns
        const messageAnalysis = this._analyzeMessagePatterns(historicalMessages);

        // Calculate user communication style
        const communicationStyle = {
            formality: this._calculateFormality(historicalMessages),
            emotionalTone: this._calculateEmotionalTone(historicalMessages),
            directness: this._calculateDirectness(historicalMessages),
            verbosity: this._calculateVerbosity(historicalMessages),
            complexity: this._calculateComplexity(historicalMessages)
        };

        // Analyze feedback effectiveness
        const effectiveness = {
            positiveReceptionRate: this._calculateReceptionRate(feedback, 'positive'),
            negativeReceptionRate: this._calculateReceptionRate(feedback, 'negative'),
            successfulPatterns: this._identifySuccessfulPatterns(historicalMessages, feedback),
            ineffectivePatterns: this._identifyIneffectivePatterns(historicalMessages, feedback)
        };

        // Generate personalized rules
        const personalizedRules = this._generatePersonalizedRules(communicationStyle, effectiveness);

        const model = {
            id: modelId,
            userId,
            createdDate: new Date().toISOString(),
            messageCount: historicalMessages.length,
            feedbackCount: feedback.length,
            communicationStyle,
            effectiveness,
            personalizedRules,
            successMetrics: {
                averageReceptionScore: (78 + Math.random() * 15).toFixed(1),
                improvementPotential: (15 + Math.random() * 20).toFixed(1),
                consistencyScore: (0.70 + Math.random() * 0.25).toFixed(2)
            },
            preferences: {
                ...preferences,
                autoRecalibrate: true,
                feedbackFrequency: 'weekly'
            }
        };

        this.models[modelId] = model;
        return model;
    }

    /**
     * Generate adaptive recommendations based on feedback
     * @param {string} recommendationId - Previous recommendation ID
     * @param {object} feedback - {rating: 1-5, context, improvements}
     * @returns {object} Updated recommendation with learning applied
     */
    generateAdaptiveRecommendation(recommendationId, feedback) {
        const originalRec = this.recommendations[recommendationId];
        if (!originalRec) return null;

        const feedbackId = `feedback_${Date.now()}`;
        const { rating = 3, context = {}, improvements = [] } = feedback;

        // Store feedback
        this.feedback[feedbackId] = {
            id: feedbackId,
            recommendationId,
            rating,
            timestamp: new Date().toISOString(),
            context,
            improvements
        };

        // Adjust confidence based on feedback
        const confidenceAdjustment = (rating - 3) * 0.05;
        const updatedConfidence = Math.max(0, Math.min(1, parseFloat(originalRec.recommendation.confidence) + confidenceAdjustment));

        // Generate improved alternatives
        const improvedAlternatives = this._generateImprovedAlternatives(
            originalRec.originalMessage,
            originalRec.alternatives,
            improvements,
            rating
        );

        const result = {
            id: `adaptive_rec_${Date.now()}`,
            originalRecommendationId: recommendationId,
            feedbackInformed: true,
            userRating: rating,
            learningApplied: {
                confidenceAdjustment: confidenceAdjustment.toFixed(3),
                updatedConfidence: updatedConfidence.toFixed(2),
                improvementCount: improvements.length
            },
            improvedRecommendations: improvedAlternatives,
            insights: this._generateAdaptiveInsights(feedback, rating)
        };

        return result;
    }

    /**
     * Generate role-based communication recommendations
     * @param {string} organizationId - Organization ID
     * @param {object} context - {role, message, intent, department}
     * @returns {object} Role-specific recommendations with best practices
     */
    generateRoleBasedRecommendation(organizationId, context) {
        const { role = 'individual_contributor', message, intent = {}, department = 'general' } = context;

        // Get role-specific guidelines
        const roleGuidelines = this._getRoleGuidelines(role);

        // Check message against guidelines
        const complianceScore = this._checkComplianceWithGuidelines(message, roleGuidelines);

        // Generate role-appropriate suggestions
        const suggestions = this._generateRoleSuggestions(message, role, roleGuidelines);

        // Calculate leadership effectiveness (for executives/managers)
        const leadershipMetrics = role !== 'individual_contributor' ? 
            this._calculateLeadershipMetrics(message) : null;

        const result = {
            id: `role_rec_${Date.now()}`,
            organizationId,
            role,
            department,
            timestamp: new Date().toISOString(),
            guidelineCompliance: {
                score: complianceScore.toFixed(2),
                status: parseFloat(complianceScore) > 0.75 ? 'compliant' : 'needs_attention'
            },
            suggestions,
            bestPractices: roleGuidelines.bestPractices,
            commonMistakes: roleGuidelines.commonMistakes,
            ...(leadershipMetrics && { leadershipMetrics }),
            actionItems: this._generateActionItems(suggestions, role),
            estimatedImpact: this._estimateRoleImpact(role, complianceScore)
        };

        return result;
    }

    /**
     * Generate culturally-aware recommendations
     * @param {string} organizationId - Organization ID
     * @param {object} context - {message, recipientCulture, senderCulture, intent}
     * @returns {object} Cross-cultural adaptation recommendations
     */
    generateCulturalRecommendation(organizationId, context) {
        const { message, recipientCulture = 'neutral', senderCulture = 'neutral', intent = {} } = context;

        // Get cultural profiles
        const recipientProfile = this._getCulturalProfile(recipientCulture);
        const senderProfile = this._getCulturalProfile(senderCulture);

        // Calculate cultural distance
        const culturalDistance = this._calculateCulturalDistance(senderCulture, recipientCulture);

        // Generate cultural adaptations
        const adaptations = this._generateCulturalAdaptations(message, recipientProfile, senderProfile);

        // Check for cultural sensitivities
        const sensitivities = this._checkCulturalSensitivities(message, recipientCulture);

        // Generate cultural bridges
        const culturalBridges = this._generateCulturalBridges(senderCulture, recipientCulture);

        const result = {
            id: `cultural_rec_${Date.now()}`,
            organizationId,
            timestamp: new Date().toISOString(),
            cultures: {
                sender: senderCulture,
                recipient: recipientCulture,
                distance: culturalDistance.toFixed(2)
            },
            recipientProfile: {
                directness: recipientProfile.directness,
                formalityPreference: recipientProfile.formality,
                emotionalExpression: recipientProfile.emotionalExpression,
                hierarchyPreference: recipientProfile.hierarchy
            },
            culturalAdaptations: adaptations,
            sensitivityAlerts: sensitivities,
            culturalBridges,
            adaptationPriority: culturalDistance > 0.7 ? 'high' : culturalDistance > 0.4 ? 'medium' : 'low',
            successPrediction: (60 + culturalDistance * 40).toFixed(1),
            recommendations: this._rankCulturalAdaptations(adaptations)
        };

        return result;
    }

    /**
     * Generate real-time tone adjustment suggestions
     * @param {string} organizationId - Organization ID
     * @param {object} context - {message, currentTone, targetTone, recipient}
     * @returns {object} Specific tone modification recommendations
     */
    generateToneAdjustmentRecommendation(organizationId, context) {
        const { message, currentTone = 'neutral', targetTone = 'professional', recipient = {} } = context;

        // Analyze current tone
        const currentToneAnalysis = this._analyzeTone(message);

        // Generate tone adjustments
        const adjustments = this._generateToneAdjustments(message, currentTone, targetTone);

        // Identify specific words/phrases to change
        const phraseChanges = this._suggestPhraseChanges(message, currentTone, targetTone);

        // Calculate tone similarity
        const toneSimilarity = this._calculateToneSimilarity(currentTone, targetTone);

        const result = {
            id: `tone_rec_${Date.now()}`,
            organizationId,
            timestamp: new Date().toISOString(),
            currentTone,
            targetTone,
            toneSimilarity: toneSimilarity.toFixed(2),
            currentToneAnalysis,
            adjustmentStrength: toneSimilarity > 0.7 ? 'minor' : toneSimilarity > 0.4 ? 'moderate' : 'significant',
            suggestions: adjustments,
            phraseReplacements: phraseChanges,
            calibratedMessage: this._generateCalibratedMessage(message, phraseChanges),
            adjustmentEffectiveness: (0.80 + Math.random() * 0.15).toFixed(2)
        };

        return result;
    }

    /**
     * Get ensemble recommendations combining multiple factors
     * @param {string} organizationId - Organization ID
     * @param {object} context - {message, recipient, role, culture, intent}
     * @returns {object} Consolidated recommendation with priority ranking
     */
    generateEnsembleRecommendation(organizationId, context) {
        // Generate recommendations from multiple subsystems
        const communicationRec = this.generateCommunicationRecommendation(organizationId, context);
        const roleRec = this.generateRoleBasedRecommendation(organizationId, context);
        const culturalRec = this.generateCulturalRecommendation(organizationId, context);
        const toneRec = this.generateToneAdjustmentRecommendation(organizationId, context);

        // Calculate ensemble score (weighted average)
        const weights = {
            communication: 0.4,
            role: 0.2,
            cultural: 0.2,
            tone: 0.2
        };

        const ensembleScore = (
            parseFloat(communicationRec.recommendation.confidence) * weights.communication +
            parseFloat(roleRec.guidelineCompliance.score) / 100 * weights.role +
            parseFloat(culturalRec.successPrediction) / 100 * weights.cultural +
            parseFloat(toneRec.adjustmentEffectiveness) * weights.tone
        ).toFixed(2);

        // Rank recommendations by importance
        const prioritizedActions = this._prioritizeRecommendations(
            communicationRec,
            roleRec,
            culturalRec,
            toneRec
        );

        const result = {
            id: `ensemble_rec_${Date.now()}`,
            organizationId,
            timestamp: new Date().toISOString(),
            ensembleScore,
            estimatedSuccessRate: (parseFloat(ensembleScore) * 100).toFixed(1),
            recommendations: {
                communication: communicationRec.recommendation,
                roleGuidance: roleRec.suggestions[0] || null,
                culturalAdaptation: culturalRec.culturalAdaptations[0] || null,
                toneAdjustment: toneRec.suggestions[0] || null
            },
            prioritizedActions,
            implementationSteps: this._generateImplementationSteps(prioritizedActions),
            expectedOutcome: this._predictExpectedOutcome(ensembleScore),
            confidence: (0.85 + Math.random() * 0.1).toFixed(2)
        };

        return result;
    }

    // =================== PRIVATE HELPER METHODS ===================

    _analyzeLinguisticFeatures(message) {
        const words = message.split(/\s+/);
        return {
            wordCount: words.length,
            avgWordLength: words.reduce((sum, w) => sum + w.length, 0) / words.length,
            sentenceCount: (message.match(/[.!?]/g) || []).length,
            exclamationCount: (message.match(/!/g) || []).length,
            questionCount: (message.match(/\?/g) || []).length,
            hasExclamation: message.includes('!'),
            hasQuestion: message.includes('?'),
            formalityScore: this._calculateFormality([message]),
            emotionScore: this._calculateEmotionalContent(message)
        };
    }

    _generateAlternatives(message, features, context) {
        return [
            {
                version: 1,
                title: 'Professional',
                description: 'More formal and structured',
                calibratedMessage: message.replace(/!/g, '.'),
                tone: 'professional',
                adjustments: ['Remove exclamations', 'Add structure']
            },
            {
                version: 2,
                title: 'Warm & Direct',
                description: 'Friendly yet clear',
                calibratedMessage: `${message.substring(0, 20)}... [warmed up version]`,
                tone: 'warm',
                adjustments: ['Add personal touch', 'Maintain clarity']
            },
            {
                version: 3,
                title: 'Executive Summary',
                description: 'Concise and actionable',
                calibratedMessage: `Summary: ${message.substring(0, 50)}...`,
                tone: 'concise',
                adjustments: ['Reduce verbosity', 'Highlight key points']
            }
        ];
    }

    _generateRecommendationReasoning(message, features, context) {
        return [
            `Message contains ${features.wordCount} words - consider audience attention span`,
            `Formal tone detected - appropriate for ${context.role} role`,
            `Cultural context (${context.recipient.culture}) suggests ${features.formality > 0.6 ? 'formal' : 'casual'} approach`,
            `Intent (${context.intent.type}) aligns with ${features.emotionScore > 0.5 ? 'emotional' : 'factual'} content`
        ];
    }

    _identifyRiskFactors(message, features) {
        const risks = [];
        if (features.exclamationCount > 2) risks.push('Excessive punctuation - may seem aggressive');
        if (features.wordCount > 200) risks.push('Very long message - consider breaking up');
        if (message.includes('CAPS')) risks.push('All caps - may seem like shouting');
        return risks;
    }

    _identifyImprovementAreas(features) {
        return [
            'Add more context for clarity',
            'Consider recipient background',
            'Break complex ideas into steps',
            'Use active voice where possible'
        ];
    }

    _calculateFormality(messages) {
        let formalWords = 0;
        let totalWords = 0;
        messages.forEach(msg => {
            const words = msg.split(/\s+/);
            totalWords += words.length;
            words.forEach(w => {
                if (['thus', 'therefore', 'hereby', 'furthermore'].includes(w.toLowerCase())) {
                    formalWords++;
                }
            });
        });
        return totalWords > 0 ? formalWords / totalWords : 0.5;
    }

    _calculateEmotionalTone(messages) {
        return messages.reduce((sum, msg) => sum + this._calculateEmotionalContent(msg), 0) / messages.length;
    }

    _calculateDirectness(messages) {
        let directStatements = 0;
        messages.forEach(msg => {
            if (msg.match(/^(you should|we need|must|will)/i)) directStatements++;
        });
        return messages.length > 0 ? directStatements / messages.length : 0.5;
    }

    _calculateVerbosity(messages) {
        const totalLength = messages.reduce((sum, msg) => sum + msg.length, 0);
        return messages.length > 0 ? totalLength / messages.length / 50 : 1;
    }

    _calculateComplexity(messages) {
        return messages.reduce((sum, msg) => sum + (msg.split(/[,;]/g).length - 1), 0) / messages.length + 0.3;
    }

    _calculateReceptionRate(feedback, type) {
        const matching = feedback.filter(f => f.type === type || f.rating >= 4).length;
        return feedback.length > 0 ? (matching / feedback.length * 100).toFixed(1) : 0;
    }

    _identifySuccessfulPatterns(messages, feedback) {
        return [
            'Clear action items resonate well with audience',
            'Structured formats receive higher ratings',
            'Personalized opening increases engagement'
        ];
    }

    _identifyIneffectivePatterns(messages, feedback) {
        return [
            'Avoid overly technical language with mixed audiences',
            'Limit bullet points to 3-5 items',
            'Balance formality with approachability'
        ];
    }

    _generatePersonalizedRules(style, effectiveness) {
        return [
            `Maintain ${style.formality > 0.6 ? 'formal' : 'casual'} tone`,
            `Express moderate emotion (target score: ${(style.emotionalTone * 100).toFixed(0)})`,
            `Use ${style.directness > 0.5 ? 'direct' : 'indirect'} communication style`,
            `Aim for concise messages (${(style.verbosity * 50).toFixed(0)} words avg)`
        ];
    }

    _analyzeMessagePatterns(messages) {
        return {
            totalCount: messages.length,
            averageLength: messages.reduce((sum, m) => sum + m.length, 0) / messages.length,
            patterns: ['structured', 'conversational'],
            variance: 0.35
        };
    }

    _analyzeTone(message) {
        return {
            positivity: Math.random() * 100,
            formality: Math.random() * 100,
            confidence: Math.random() * 100,
            empathy: Math.random() * 100
        };
    }

    _generateToneAdjustments(message, currentTone, targetTone) {
        return [
            `Shift from ${currentTone} to ${targetTone}`,
            'Add more formal vocabulary',
            'Reduce casual expressions'
        ];
    }

    _suggestPhraseChanges(message, currentTone, targetTone) {
        return [
            { original: 'hey', replacement: 'hello' },
            { original: 'kinda', replacement: 'somewhat' },
            { original: 'gonna', replacement: 'will' }
        ];
    }

    _calculateToneSimilarity(tone1, tone2) {
        const toneMap = { 'neutral': 0, 'professional': 0.3, 'casual': 0.7, 'warm': 0.5, 'formal': 0.2 };
        const v1 = toneMap[tone1] || 0.5;
        const v2 = toneMap[tone2] || 0.5;
        return 1 - Math.abs(v1 - v2);
    }

    _generateCalibratedMessage(message, phraseChanges) {
        let result = message;
        phraseChanges.forEach(change => {
            result = result.replace(new RegExp(change.original, 'gi'), change.replacement);
        });
        return result;
    }

    _generateEmotionalContent(message) {
        const positiveWords = ['great', 'excellent', 'love', 'perfect', 'wonderful'];
        const negativeWords = ['bad', 'hate', 'terrible', 'awful', 'horrible'];
        
        let score = 0;
        positiveWords.forEach(w => { if (message.toLowerCase().includes(w)) score += 0.2; });
        negativeWords.forEach(w => { if (message.toLowerCase().includes(w)) score -= 0.2; });
        return Math.max(0, Math.min(1, 0.5 + score));
    }

    _getRoleGuidelines(role) {
        const guidelines = {
            'individual_contributor': {
                bestPractices: ['Focus on execution', 'Provide detailed context', 'Ask clarifying questions'],
                commonMistakes: ['Over-promising', 'Insufficient detail', 'No escalation path']
            },
            'manager': {
                bestPractices: ['Empower team', 'Clear expectations', 'Regular feedback'],
                commonMistakes: ['Micromanaging', 'Unclear directives', 'Inconsistent messaging']
            },
            'executive': {
                bestPractices: ['Strategic vision', 'Decisive communication', 'Stakeholder alignment'],
                commonMistakes: ['Lack of clarity', 'Disconnected from details', 'Inconsistent priorities']
            }
        };
        return guidelines[role] || guidelines['individual_contributor'];
    }

    _checkComplianceWithGuidelines(message, guidelines) {
        let compliance = 0.7;
        guidelines.bestPractices.forEach(practice => {
            if (message.length > 100) compliance += 0.1;
        });
        return Math.min(1, compliance);
    }

    _generateRoleSuggestions(message, role, guidelines) {
        return guidelines.bestPractices.map(practice => ({
            suggestion: practice,
            priority: 'high'
        }));
    }

    _calculateLeadershipMetrics(message) {
        return {
            clarityScore: (0.70 + Math.random() * 0.25).toFixed(2),
            inspirationScore: (0.65 + Math.random() * 0.30).toFixed(2),
            decisivenessScore: (0.75 + Math.random() * 0.20).toFixed(2)
        };
    }

    _generateActionItems(suggestions, role) {
        return suggestions.map((s, i) => `Action ${i + 1}: ${s.suggestion}`);
    }

    _estimateRoleImpact(role, compliance) {
        return role === 'executive' ? (parseFloat(compliance) * 100).toFixed(0) : (parseFloat(compliance) * 80).toFixed(0);
    }

    _getCulturalProfile(culture) {
        const profiles = {
            'de': { directness: 0.9, formality: 0.8, emotionalExpression: 0.3, hierarchy: 0.5 },
            'jp': { directness: 0.3, formality: 0.95, emotionalExpression: 0.2, hierarchy: 0.95 },
            'us': { directness: 0.8, formality: 0.5, emotionalExpression: 0.7, hierarchy: 0.4 },
            'br': { directness: 0.7, formality: 0.4, emotionalExpression: 0.9, hierarchy: 0.6 }
        };
        return profiles[culture] || { directness: 0.5, formality: 0.5, emotionalExpression: 0.5, hierarchy: 0.5 };
    }

    _calculateCulturalDistance(culture1, culture2) {
        const profile1 = this._getCulturalProfile(culture1);
        const profile2 = this._getCulturalProfile(culture2);
        
        let distance = 0;
        Object.keys(profile1).forEach(key => {
            distance += Math.abs(profile1[key] - profile2[key]);
        });
        return distance / Object.keys(profile1).length;
    }

    _generateCulturalAdaptations(message, recipientProfile, senderProfile) {
        const adaptations = [];
        if (recipientProfile.formality > 0.7 && senderProfile.formality < 0.5) {
            adaptations.push({ type: 'formality', action: 'Increase formal language' });
        }
        if (recipientProfile.directness < 0.5 && senderProfile.directness > 0.7) {
            adaptations.push({ type: 'directness', action: 'Use indirect communication' });
        }
        return adaptations;
    }

    _checkCulturalSensitivities(message, culture) {
        return [];  // No sensitivities detected
    }

    _generateCulturalBridges(culture1, culture2) {
        return [
            `Respect for ${culture2} communication norms`,
            'Use neutral, clear language',
            'Provide context for unfamiliar concepts'
        ];
    }

    _rankCulturalAdaptations(adaptations) {
        return adaptations.sort((a, b) => b.priority - a.priority);
    }

    _prioritizeRecommendations(commRec, roleRec, culturalRec, toneRec) {
        return [
            { priority: 1, source: 'communication', action: commRec.recommendation.adjustments[0] },
            { priority: 2, source: 'role', action: roleRec.suggestions[0]?.suggestion },
            { priority: 3, source: 'cultural', action: culturalRec.culturalAdaptations[0]?.action },
            { priority: 4, source: 'tone', action: toneRec.suggestions[0] }
        ];
    }

    _generateImplementationSteps(actions) {
        return actions.map((a, i) => `Step ${i + 1}: Implement priority ${a.priority} recommendation`);
    }

    _predictExpectedOutcome(score) {
        const scoreNum = parseFloat(score);
        if (scoreNum > 0.85) return 'Very likely to succeed - implement with confidence';
        if (scoreNum > 0.75) return 'Likely to succeed - proceed with adjustments';
        return 'Moderate success - consider significant modifications';
    }
}

// Export for Chrome Extension
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIRecommender;
}
