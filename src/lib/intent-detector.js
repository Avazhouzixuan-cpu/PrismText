// Intent Detector Module
// Utilizes Chain-of-Thought analysis to identify user intent

class IntentDetector {
    constructor() {
        this.intents = {
            REJECT: 'Rejection or Disagreement',
            REQUEST: 'Request or Question',
            APPROVAL: 'Approval or Agreement',
            URGENT: 'Urgent Escalation',
            FEEDBACK: 'Feedback or Critique',
            NEGOTIATION: 'Negotiation or Compromise',
            RELATIONSHIP: 'Relationship Building',
            CONFLICT: 'Conflict Resolution'
        };

        this.keywords = {
            REJECT: ['unfortunately', 'cannot', 'unable', 'reject', 'disagree', 'no', 'not possible', 'impossible'],
            REQUEST: ['please', 'could you', 'would you', 'can you', 'need', 'require', 'ask', 'question'],
            APPROVAL: ['agree', 'approve', 'yes', 'absolutely', 'agree', 'confirmed', 'accepted'],
            URGENT: ['urgent', 'asap', 'immediately', 'critical', 'emergency', 'priority', 'right now'],
            FEEDBACK: ['feedback', 'suggestion', 'comment', 'note', 'remark', 'point out', 'notice'],
            NEGOTIATION: ['however', 'perhaps', 'alternative', 'option', 'consider', 'what if'],
            RELATIONSHIP: ['appreciate', 'thank', 'great working', 'look forward', 'excited', 'pleasure'],
            CONFLICT: ['concern', 'issue', 'problem', 'mismatch', 'disagreement', 'challenge']
        };
    }

    analyze(text) {
        const lowerText = text.toLowerCase();
        const scores = {};

        // Score each intent category
        for (const [intent, keywords] of Object.entries(this.keywords)) {
            scores[intent] = keywords.filter(kw => lowerText.includes(kw)).length;
        }

        // Find top intent
        const topIntent = Object.keys(scores).reduce((a, b) =>
            scores[a] > scores[b] ? a : b
        );

        // Detect conflicting intents
        const topScores = Object.entries(scores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2);

        const hasConflict = topScores[0][1] > 0 && topScores[1][1] > 0 &&
            Math.abs(topScores[0][1] - topScores[1][1]) <= 1;

        return {
            primaryIntent: topIntent,
            intentName: this.intents[topIntent],
            confidence: (topScores[0][1] / Math.max(...Object.values(scores))) * 100,
            allScores: scores,
            conflictDetected: hasConflict,
            conflictingIntents: hasConflict ? [topScores[0][0], topScores[1][0]] : [],
            suggestion: this.generateSuggestion(topIntent, hasConflict)
        };
    }

    generateSuggestion(intent, hasConflict) {
        const suggestions = {
            REJECT: 'You\'re expressing a rejection while trying to maintain the relationship. Consider clarifying alternative options.',
            REQUEST: 'You\'re making a request. Ensure the tone respects hierarchy and urgency level.',
            APPROVAL: 'You\'re expressing agreement. Consider showing enthusiasm without overstating commitment.',
            URGENT: 'You\'re flagging urgency. Be careful not to sound aggressive in hierarchical cultures.',
            FEEDBACK: 'You\'re providing feedback. Use diplomatic language to avoid face-loss in high-context cultures.',
            NEGOTIATION: 'You\'re proposing alternatives. Frame these as collaborative, not conflicting.',
            RELATIONSHIP: 'You\'re building relationship. Ensure sincerity comes through in formal contexts.',
            CONFLICT: 'You\'re addressing conflict. Approach carefully to preserve long-term relationships.'
        };

        let base = suggestions[intent];
        if (hasConflict) {
            base += ' ⚠️ Detected mixed intents - ensure clarity of purpose.';
        }
        return base;
    }
}

// Export for use in popup and background
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IntentDetector;
}
