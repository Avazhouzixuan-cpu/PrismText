// ========================================
// SENTIMENT ANALYZER V3 (Iterations 21-30)
// Aspect-Based Sentiment Analysis (ABSA)
// Emotions tied to specific topics/aspects
// ========================================

class SentimentAnalyzerV3 {
    constructor() {
        // Aspect categories that can be discussed
        this.aspects = {
            'product': ['product', 'service', 'solution', 'tool', 'feature', 'system'],
            'performance': ['speed', 'efficiency', 'productivity', 'quality', 'reliability'],
            'price': ['cost', 'price', 'budget', 'expense', 'rate', 'fee'],
            'support': ['support', 'help', 'assistance', 'service', 'team', 'customer care'],
            'design': ['design', 'interface', 'ui', 'ux', 'appearance', 'layout'],
            'usability': ['easy', 'difficult', 'intuitive', 'user-friendly', 'usable', 'accessible'],
            'collaboration': ['teamwork', 'collaboration', 'communication', 'cooperation', 'coordination'],
            'work_environment': ['office', 'workplace', 'culture', 'environment', 'atmosphere'],
            'management': ['manager', 'leadership', 'management', 'direction', 'guidance'],
            'career': ['growth', 'career', 'opportunity', 'progression', 'advancement']
        };

        // Sentiment lexicon for different aspects
        this.sentimentLexicon = {
            'product': {
                positive: ['innovative', 'excellent', 'powerful', 'reliable', 'robust', 'scalable'],
                negative: ['buggy', 'limited', 'outdated', 'inferior', 'unreliable'],
                neutral: ['functional', 'standard', 'basic', 'adequate']
            },
            'performance': {
                positive: ['fast', 'efficient', 'smooth', 'responsive', 'snappy'],
                negative: ['slow', 'sluggish', 'laggy', 'cumbersome', 'inefficient'],
                neutral: ['moderate', 'average', 'acceptable']
            },
            'price': {
                positive: ['affordable', 'competitive', 'reasonable', 'value', 'worth'],
                negative: ['expensive', 'overpriced', 'costly', 'exorbitant', 'unreasonable'],
                neutral: ['market-rate', 'standard pricing']
            },
            'support': {
                positive: ['helpful', 'responsive', 'knowledgeable', 'professional', 'attentive'],
                negative: ['slow', 'unhelpful', 'unresponsive', 'ignorant', 'dismissive'],
                neutral: ['available', 'present', 'adequate']
            },
            'collaboration': {
                positive: ['collaborative', 'cooperative', 'united', 'harmonious', 'aligned'],
                negative: ['siloed', 'disconnected', 'conflictual', 'misaligned', 'fragmented'],
                neutral: ['separate', 'independent', 'distinct']
            }
        };

        // Intensity modifiers
        this.intensifiers = {
            'strong': ['very', 'extremely', 'incredibly', 'absolutely', 'truly', 'deeply'],
            'medium': ['quite', 'fairly', 'rather', 'somewhat', 'relatively'],
            'weak': ['slightly', 'a bit', 'kind of', 'sort of', 'somewhat']
        };

        // Negation words
        this.negations = ['not', 'no', 'never', 'neither', 'nobody', 'nothing'];
    }

    /**
     * Analyze sentiment by aspect
     */
    analyzeAspectSentiment(text) {
        const aspectSentiments = {};
        const words = text.toLowerCase().split(/\s+/);

        // For each aspect, find mentions and their sentiment
        for (const [aspect, keywords] of Object.entries(this.aspects)) {
            const mentions = this.findAspectMentions(text, keywords);
            
            if (mentions.length > 0) {
                const sentiments = mentions.map(mention => 
                    this.analyzeSentimentAroundMention(text, mention)
                );

                const averageSentiment = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
                
                aspectSentiments[aspect] = {
                    mentioned: true,
                    mentions: mentions.length,
                    sentiment: this.classifySentiment(averageSentiment),
                    score: Math.round(averageSentiment),
                    details: sentiments,
                    confidence: Math.round(100 - Math.abs(averageSentiment) / 2)
                };
            } else {
                aspectSentiments[aspect] = {
                    mentioned: false,
                    sentiment: 'not_mentioned',
                    score: 0
                };
            }
        }

        return {
            aspectSentiments,
            dominantAspects: this.findDominantAspects(aspectSentiments),
            overallSentimentProfile: this.generateProfile(aspectSentiments),
            sentimentConsistency: this.calculateConsistency(aspectSentiments)
        };
    }

    /**
     * Find mentions of a specific aspect in text
     */
    findAspectMentions(text, keywords) {
        const mentions = [];
        const lowerText = text.toLowerCase();

        for (const keyword of keywords) {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            let match;
            
            while ((match = regex.exec(lowerText)) !== null) {
                mentions.push({
                    keyword: keyword,
                    position: match.index,
                    context: this.getContext(text, match.index, keyword.length, 20)
                });
            }
        }

        return mentions;
    }

    /**
     * Get context around a mention
     */
    getContext(text, position, wordLength, contextLength) {
        const start = Math.max(0, position - contextLength);
        const end = Math.min(text.length, position + wordLength + contextLength);
        return text.substring(start, end).trim();
    }

    /**
     * Analyze sentiment around a specific mention
     */
    analyzeSentimentAroundMention(text, mention) {
        const context = mention.context;
        const words = context.toLowerCase().split(/\s+/);

        let sentimentScore = 0;

        // Look for sentiment words around the mention
        for (let i = 0; i < words.length; i++) {
            const word = words[i];

            // Check for intensifiers
            let intensity = 1;
            if (i > 0 && this.intensifiers.strong.includes(words[i - 1])) {
                intensity = 1.5;
            } else if (i > 0 && this.intensifiers.weak.includes(words[i - 1])) {
                intensity = 0.7;
            }

            // Check for negation
            let negation = 1;
            if (i > 0 && this.negations.includes(words[i - 1])) {
                negation = -1;
            }

            // Check for sentiment words
            const lexicon = this.sentimentLexicon[mention.keyword] || {};
            if (lexicon.positive && lexicon.positive.includes(word)) {
                sentimentScore += 20 * intensity * negation;
            } else if (lexicon.negative && lexicon.negative.includes(word)) {
                sentimentScore -= 20 * intensity * negation;
            }
        }

        return sentimentScore;
    }

    /**
     * Classify sentiment score into categories
     */
    classifySentiment(score) {
        if (score > 30) return 'very_positive';
        if (score > 10) return 'positive';
        if (score > -10) return 'neutral';
        if (score > -30) return 'negative';
        return 'very_negative';
    }

    /**
     * Find which aspects are most talked about (dominant)
     */
    findDominantAspects(aspectSentiments) {
        const mentioned = Object.entries(aspectSentiments)
            .filter(([_, data]) => data.mentioned)
            .sort((a, b) => (b[1].mentions || 0) - (a[1].mentions || 0))
            .slice(0, 3)
            .map(([aspect, _]) => aspect);

        return mentioned;
    }

    /**
     * Generate overall sentiment profile
     */
    generateProfile(aspectSentiments) {
        const mentioned = Object.entries(aspectSentiments)
            .filter(([_, data]) => data.mentioned)
            .map(([aspect, data]) => ({ aspect, ...data }));

        if (mentioned.length === 0) {
            return { profile: 'no_specific_aspects', overallTone: 'neutral' };
        }

        const positive = mentioned.filter(a => 
            a.sentiment === 'positive' || a.sentiment === 'very_positive'
        ).length;
        
        const negative = mentioned.filter(a => 
            a.sentiment === 'negative' || a.sentiment === 'very_negative'
        ).length;

        let profile = 'balanced';
        let overallTone = 'neutral';

        if (positive > negative * 1.5) {
            profile = 'predominantly_positive';
            overallTone = 'positive';
        } else if (negative > positive * 1.5) {
            profile = 'predominantly_negative';
            overallTone = 'negative';
        }

        return { profile, overallTone, positiveAspects: positive, negativeAspects: negative };
    }

    /**
     * Calculate sentiment consistency across aspects
     */
    calculateConsistency(aspectSentiments) {
        const sentiments = Object.values(aspectSentiments)
            .filter(a => a.mentioned)
            .map(a => a.score);

        if (sentiments.length < 2) return 100;

        const avg = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
        const variance = sentiments.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / sentiments.length;
        const stdDev = Math.sqrt(variance);

        // Higher stddev = lower consistency
        const consistency = Math.max(0, 100 - stdDev);
        return Math.round(consistency);
    }

    /**
     * Generate recommendations based on aspect sentiment
     */
    generateRecommendationsFromAspects(aspectSentiments) {
        const recommendations = [];

        for (const [aspect, data] of Object.entries(aspectSentiments)) {
            if (!data.mentioned) continue;

            if (data.sentiment === 'very_negative' || data.sentiment === 'negative') {
                recommendations.push({
                    aspect: aspect,
                    priority: 'high',
                    suggestion: `Address concerns about ${aspect}`,
                    action: `Propose solution or discussion about ${aspect}`
                });
            } else if (data.sentiment === 'very_positive') {
                recommendations.push({
                    aspect: aspect,
                    priority: 'medium',
                    suggestion: `Acknowledge positive feedback on ${aspect}`,
                    action: `Reinforce or expand on ${aspect}`
                });
            }
        }

        return recommendations.sort((a, b) => 
            (b.priority === 'high' ? 1 : 0) - (a.priority === 'high' ? 1 : 0)
        );
    }

    /**
     * Detect emotion intensity
     */
    detectEmotionIntensity(text) {
        const emotionIndicators = {
            excitement: ['!', '!!!', 'amazing', 'fantastic', 'thrilled', 'excited'],
            frustration: ['!!', '...', 'ugh', 'frustrated', 'annoyed', 'fed up'],
            concern: ['worry', 'concerned', 'worried', 'anxious', 'fear'],
            gratitude: ['thank', 'grateful', 'appreciate', 'thanks', 'grateful']
        };

        const emotions = {};
        const lowerText = text.toLowerCase();

        for (const [emotion, indicators] of Object.entries(emotionIndicators)) {
            let count = 0;
            for (const indicator of indicators) {
                count += (lowerText.match(new RegExp(`\\b${indicator}\\b`, 'gi')) || []).length;
            }
            emotions[emotion] = {
                detected: count > 0,
                intensity: Math.min(100, count * 25),
                count: count
            };
        }

        return {
            emotions,
            dominantEmotion: Object.entries(emotions)
                .filter(([_, e]) => e.detected)
                .sort((a, b) => b[1].intensity - a[1].intensity)[0]?.[0] || 'neutral'
        };
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SentimentAnalyzerV3;
}
