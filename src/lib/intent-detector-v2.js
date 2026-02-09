// ITERATION ANALYSIS - V2 (Iterations 1-10)
// Enhanced Intent Detector with ML-like scoring

class IntentDetectorV2 {
    constructor() {
        // Extended intent categories with confidence thresholds
        this.intents = {
            REJECT: { name: 'Rejection', severity: 'high', expectsAlternative: true },
            REQUEST: { name: 'Request', severity: 'medium', expectsCompleteness: true },
            APPROVAL: { name: 'Approval', severity: 'low', expectsConfirmation: false },
            URGENT: { name: 'Urgent', severity: 'critical', timeframe: 'immediate' },
            FEEDBACK: { name: 'Feedback', severity: 'medium', expectsDiplomacy: true },
            NEGOTIATION: { name: 'Negotiation', severity: 'high', expectsFlexibility: true },
            RELATIONSHIP: { name: 'Relationship', severity: 'low', expectsWarmth: true },
            CONFLICT: { name: 'Conflict', severity: 'critical', expectsDiplomacy: true },
            INQUIRY: { name: 'Inquiry', severity: 'low', expectsClarity: true },
            COMMITMENT: { name: 'Commitment', severity: 'high', expectsFollowup: true }
        };

        // Enhanced keyword scoring with weights
        this.keywordWeights = {
            REJECT: {
                strong: ['unfortunately', 'cannot', 'unable', 'reject', 'disagree', 'impossible', 'won\'t'],
                medium: ['no', 'not possible', 'declined', 'unavailable'],
                weak: ['perhaps not', 'may not', 'difficult']
            },
            REQUEST: {
                strong: ['please', 'could you', 'would you', 'can you', 'need', 'require'],
                medium: ['ask', 'need', 'request', 'help'],
                weak: ['might', 'could', 'perhaps']
            },
            APPROVAL: {
                strong: ['agree', 'approve', 'yes', 'absolutely', 'confirmed', 'accepted'],
                medium: ['okay', 'fine', 'understand'],
                weak: ['maybe', 'probably', 'likely']
            },
            URGENT: {
                strong: ['urgent', 'asap', 'immediately', 'critical', 'emergency'],
                medium: ['priority', 'right now', 'quickly'],
                weak: ['soon', 'shortly', 'soon as']
            },
            FEEDBACK: {
                strong: ['feedback', 'suggestion', 'comment', 'note', 'remark'],
                medium: ['point out', 'notice', 'observe'],
                weak: ['think', 'feel', 'believe']
            },
            NEGOTIATION: {
                strong: ['however', 'alternative', 'option', 'consider', 'negotiate'],
                medium: ['perhaps', 'maybe', 'what if'],
                weak: ['flexibility', 'possible', 'consider']
            },
            RELATIONSHIP: {
                strong: ['appreciate', 'thank', 'look forward', 'excited', 'pleasure', 'value'],
                medium: ['good working', 'respect', 'honor'],
                weak: ['nice', 'good', 'fine']
            },
            CONFLICT: {
                strong: ['concern', 'issue', 'problem', 'dispute', 'conflict', 'challenging'],
                medium: ['difficulty', 'mismatch', 'concern'],
                weak: ['differently', 'question', 'doubt']
            },
            INQUIRY: {
                strong: ['what', 'when', 'where', 'how', 'why', 'question'],
                medium: ['wondering', 'curious', 'information'],
                weak: ['find out', 'learn', 'discover']
            },
            COMMITMENT: {
                strong: ['promise', 'commit', 'guarantee', 'assure', 'pledge'],
                medium: ['will', 'shall', 'planned'],
                weak: ['likely', 'probably', 'expected']
            }
        };

        // NEW: Emotional signal detection
        this.emotionalSignals = {
            positive: ['!', 'happy', 'excited', 'glad', 'wonderful', 'excellent'],
            negative: ['very sorry', 'unfortunately', 'regret', 'disappointed'],
            neutral: ['regarding', 'concerning', 'about', 'the']
        };

        // NEW: Intent conflict patterns
        this.conflictPatterns = [
            { intents: ['REJECT', 'RELATIONSHIP'], name: 'Soft Rejection', risk: 'high' },
            { intents: ['FEEDBACK', 'APPROVAL'], name: 'Mixed Feedback', risk: 'medium' },
            { intents: ['URGENT', 'NEGOTIATION'], name: 'Pressured Negotiation', risk: 'high' }
        ];
    }

    analyze(text) {
        const safeText = typeof text === 'string' ? text : (text?.text || text?.content || '');
        const lowerText = safeText.toLowerCase();
        const sentences = safeText.split(/[.!?]+/).filter(s => s.trim().length > 0);
        
        // IMPROVEMENT 1: Multi-level scoring
        const scores = this.scoreIntents(lowerText);
        
        // IMPROVEMENT 2: Emotion detection
        const emotions = this.detectEmotions(safeText);
        console.log('🎭 detectEmotions returned:', emotions);
        
        // IMPROVEMENT 3: Sentence-level analysis
        const sentenceAnalysis = sentences.map(s => this.analyzeSegment(s));
        
        // IMPROVEMENT 4: Conflict detection improved
        const conflicts = this.detectConflicts(scores);
        
        // IMPROVEMENT 5: Context awareness
        const context = this.extractContext(sentences);

        const topIntents = Object.entries(scores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2);

        const result = {
            primaryIntent: topIntents[0][0],
            intentName: this.intents[topIntents[0][0]].name,
            confidence: Math.min(100, (topIntents[0][1] / Math.max(...Object.values(scores), 1)) * 100),
            allScores: scores,
            secondaryIntents: topIntents.slice(1).map(([intent, score]) => ({ 
                intent, 
                score, 
                confidence: (score / Math.max(...Object.values(scores), 1)) * 100 
            })),
            conflictDetected: conflicts.length > 0,
            conflicts,
            emotionalTone: emotions,
            sentenceAnalysis,
            context,
            riskLevel: this.calculateRiskLevel(topIntents[0][0], conflicts, emotions),
            suggestion: this.generateSmartSuggestion(topIntents[0][0], conflicts, emotions, lowerText)
        };
        
        console.log('📤 analyze() returning:', {
            emotionalTone: result.emotionalTone,
            emotionalTone_keys: Object.keys(result.emotionalTone || {})
        });
        
        return result;
    }

    scoreIntents(text) {
        const scores = {};

        for (const [intent, keywords] of Object.entries(this.keywordWeights)) {
            let score = 0;
            
            // Strong keywords: 3 points
            score += keywords.strong.filter(kw => text.includes(kw)).length * 3;
            
            // Medium keywords: 2 points
            score += keywords.medium.filter(kw => text.includes(kw)).length * 2;
            
            // Weak keywords: 1 point
            score += keywords.weak.filter(kw => text.includes(kw)).length * 1;

            scores[intent] = score;
        }

        return scores;
    }

    detectEmotions(text) {
        try {
            if (!text || typeof text !== 'string') {
                return { sentiment: 'neutral', intensityScore: 0, interrogative: false, emphatic: false };
            }

            const signals = {};

            console.log('🎭 detectEmotions called');
            console.log('   this.emotionalSignals:', this.emotionalSignals);

            let positiveCount = this.emotionalSignals.positive.filter(sig => text.toLowerCase().includes(sig)).length;
            let negativeCount = this.emotionalSignals.negative.filter(sig => text.toLowerCase().includes(sig)).length;
            let exclamationMarks = (text.match(/!/g) || []).length;
            let questionMarks = (text.match(/\?/g) || []).length;

            console.log('   Counts - positive:', positiveCount, 'negative:', negativeCount, 'exclamation:', exclamationMarks, 'question:', questionMarks);

            const result = {
                sentiment: positiveCount > negativeCount ? 'positive' : negativeCount > 0 ? 'negative' : 'neutral',
                intensityScore: (positiveCount * 0.8 + negativeCount * 1.2 + exclamationMarks * 0.5) / Math.max(text.split(' ').length / 10, 1),
                interrogative: questionMarks > 0,
                emphatic: exclamationMarks > text.split(' ').length / 20
            };

            console.log('   Returning:', result);

            return result;
        } catch (error) {
            console.error('Error in detectEmotions:', error);
            return { sentiment: 'neutral', intensityScore: 0, interrogative: false, emphatic: false };
        }
    }

    analyzeSegment(segment) {
        const scores = this.scoreIntents(segment.toLowerCase());
        const topIntent = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
        
        return {
            text: segment.trim(),
            primaryIntent: topIntent[0],
            intentScore: topIntent[1],
            wordCount: segment.split(/\s+/).length
        };
    }

    detectConflicts(scores) {
        const conflicts = [];
        const topTwo = Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 2);

        if (topTwo.length === 2 && topTwo[0][1] > 0 && topTwo[1][1] > 0) {
            const diff = Math.abs(topTwo[0][1] - topTwo[1][1]);
            const threshold = Math.max(topTwo[0][1] * 0.25, 2);
            
            if (diff <= threshold) {
                const conflictPattern = this.conflictPatterns.find(p => 
                    (p.intents.includes(topTwo[0][0]) && p.intents.includes(topTwo[1][0])) ||
                    (p.intents.includes(topTwo[1][0]) && p.intents.includes(topTwo[0][0]))
                );

                conflicts.push({
                    intents: [topTwo[0][0], topTwo[1][0]],
                    severity: conflictPattern?.risk || 'medium',
                    pattern: conflictPattern?.name || 'Mixed Intent'
                });
            }
        }

        return conflicts;
    }

    extractContext(sentences) {
        return {
            sentenceCount: sentences.length,
            averageLength: sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / Math.max(sentences.length, 1),
            complexity: sentences.length > 3 ? 'complex' : sentences.length > 1 ? 'compound' : 'simple',
            tone: sentences.some(s => s.includes('?')) ? 'interrogative' : 
                  sentences.some(s => s.includes('!')) ? 'emphatic' : 'neutral'
        };
    }

    calculateRiskLevel(primaryIntent, conflicts, emotions) {
        let riskScore = 0;

        // Intent severity
        const intentSeverity = { high: 2, critical: 3, medium: 1, low: 0 };
        riskScore += intentSeverity[this.intents[primaryIntent].severity] || 0;

        // Conflicts
        riskScore += conflicts.length * 1.5;

        // Negative emotions
        if (emotions.sentiment === 'negative') riskScore += 1;

        // Emphatic tone
        if (emotions.emphatic) riskScore += 0.5;

        if (riskScore >= 4) return 'critical';
        if (riskScore >= 2.5) return 'high';
        if (riskScore >= 1.5) return 'medium';
        return 'low';
    }

    generateSmartSuggestion(intent, conflicts, emotions, text) {
        let suggestion = '';

        const suggestions = {
            REJECT: 'You\'re expressing rejection. Consider including reasons and alternative options.',
            REQUEST: 'Your request is clear. Ensure you\'ve explained the urgency and context.',
            APPROVAL: 'You\'re expressing agreement. Make sure the scope and conditions are clear.',
            URGENT: 'Your message conveys urgency. Be careful not to come across as panicked.',
            FEEDBACK: 'You\'re providing feedback. Use diplomatic language to maintain relationships.',
            NEGOTIATION: 'You\'re proposing alternatives. Frame these as collaborative, not oppositional.',
            RELATIONSHIP: 'You\'re building relationship. Ensure your sincerity is evident.',
            CONFLICT: 'You\'re addressing conflict. Approach with care to preserve long-term relationships.',
            INQUIRY: 'You\'re asking questions. Consider providing context for what you\'re seeking.',
            COMMITMENT: 'You\'re making a commitment. Ensure you can deliver on what you promise.'
        };

        suggestion = suggestions[intent];

        if (conflicts.length > 0) {
            suggestion += ` ⚠️ Detected mixed intent (${conflicts[0].pattern}). Your message may be confusing - clarify your primary goal.`;
        }

        if (emotions.sentiment === 'negative' && intent !== 'FEEDBACK') {
            suggestion += ' 😟 Negative emotional tone detected. Consider softening your language.';
        }

        return suggestion;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IntentDetectorV2;
}

// Make available globally for browser
if (typeof window !== 'undefined') {
    window.IntentDetectorV2 = IntentDetectorV2;
}
