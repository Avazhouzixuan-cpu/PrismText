// ========================================
// SEMANTIC ANALYZER V3 (Iterations 21-30)
// Advanced NLP: Semantic Understanding & Similarity Analysis
// ========================================

class SemanticAnalyzerV3 {
    constructor() {
        // Semantic word embeddings (simplified version)
        // In production, use pre-trained models like Word2Vec or GloVe
        this.semanticSimilarityThreshold = 0.7;
        
        // Word relationship mappings
        this.semanticRelationships = {
            'reject': ['refuse', 'decline', 'deny', 'disapprove', 'negate'],
            'approve': ['accept', 'confirm', 'agree', 'endorse', 'ratify'],
            'urgent': ['asap', 'critical', 'priority', 'immediate', 'emergency'],
            'appreciate': ['grateful', 'thankful', 'valuable', 'respect', 'admire'],
            'concern': ['worry', 'issue', 'problem', 'challenge', 'difficulty'],
            'understand': ['comprehend', 'grasp', 'recognize', 'perceive', 'acknowledge'],
            'collaborate': ['cooperate', 'work together', 'partner', 'unite', 'coordinate'],
            'flexible': ['adaptable', 'open', 'adjustable', 'malleable', 'resilient']
        };

        // Context-dependent meanings
        this.contextMeanings = {
            'bank': {
                financial: ['deposit', 'withdraw', 'money', 'account', 'loan'],
                nature: ['river', 'landscape', 'terrain', 'ecosystem']
            },
            'right': {
                correct: ['accurate', 'true', 'valid', 'proper'],
                direction: ['east', 'clockwise', 'starboard']
            },
            'plant': {
                factory: ['manufacturing', 'facility', 'industry', 'production'],
                vegetation: ['flower', 'leaf', 'root', 'grow']
            }
        };

        // Paraphrase patterns (for understanding alternative expressions)
        this.paraphrasePatterns = {
            'cannot approve': ['unable to approve', 'not able to approve', 'not in position to approve'],
            'need help': ['require assistance', 'could use help', 'need support'],
            'looking forward': ['anticipating', 'excited about', 'keen on', 'eager to'],
            'let me know': ['inform me', 'tell me', 'keep me posted', 'update me']
        };
    }

    /**
     * Calculate semantic similarity between two words
     * Returns 0-100 similarity score
     */
    calculateWordSimilarity(word1, word2) {
        word1 = word1.toLowerCase();
        word2 = word2.toLowerCase();

        // Exact match
        if (word1 === word2) return 100;

        // Check if words are related
        for (const [key, synonyms] of Object.entries(this.semanticRelationships)) {
            if (key === word1 && synonyms.includes(word2)) return 85;
            if (key === word2 && synonyms.includes(word1)) return 85;
            if (synonyms.includes(word1) && synonyms.includes(word2)) return 78;
        }

        // Levenshtein distance-based similarity
        const maxLen = Math.max(word1.length, word2.length);
        const distance = this.levenshteinDistance(word1, word2);
        const similarity = ((maxLen - distance) / maxLen) * 100;

        return Math.max(0, Math.round(similarity));
    }

    /**
     * Levenshtein distance algorithm
     * Measures edit distance between two strings
     */
    levenshteinDistance(s1, s2) {
        if (s1.length === 0) return s2.length;
        if (s2.length === 0) return s1.length;

        const matrix = [];
        for (let i = 0; i <= s2.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= s1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= s2.length; i++) {
            for (let j = 1; j <= s1.length; j++) {
                if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[s2.length][s1.length];
    }

    /**
     * Analyze semantic meaning of entire text
     */
    analyzeSemantic(text) {
        const words = text.toLowerCase().split(/\s+/);
        const semanticProfile = {
            primaryMeanings: [],
            paraphrases: [],
            semanticDensity: 0,
            uniqueSemanticConcepts: 0,
            semanticCoherence: 0,
            meaningStrength: 0
        };

        // Identify key semantic units
        let semanticConcepts = new Set();
        for (const word of words) {
            // Check if word is a key concept
            if (this.isSemanticConcept(word)) {
                semanticConcepts.add(word);
                semanticProfile.primaryMeanings.push({
                    concept: word,
                    relatedTerms: this.getRelatedTerms(word),
                    implication: this.inferSemanticsImplication(word)
                });
            }
        }

        // Detect paraphrases
        semanticProfile.paraphrases = this.detectParaphrases(text);

        // Calculate semantic density (how much meaningful content vs filler)
        semanticProfile.semanticDensity = Math.round(
            (semanticConcepts.size / words.length) * 100
        );

        // Unique semantic concepts
        semanticProfile.uniqueSemanticConcepts = semanticConcepts.size;

        // Semantic coherence (do concepts relate logically?)
        semanticProfile.semanticCoherence = this.calculateSemanticCoherence(
            Array.from(semanticConcepts)
        );

        // Meaning strength (confidence in semantic analysis)
        semanticProfile.meaningStrength = Math.round(
            (semanticConcepts.size * 10) + (semanticProfile.semanticDensity / 2)
        );

        return semanticProfile;
    }

    /**
     * Check if a word is a semantic concept (not just filler)
     */
    isSemanticConcept(word) {
        // Exclude common filler words
        const fillerWords = [
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'from',
            'is', 'are', 'be', 'been', 'being', 'have', 'has', 'do', 'does', 'did',
            'would', 'could', 'should', 'will', 'shall', 'may', 'might', 'can',
            'with', 'by', 'for', 'of', 'as', 'about', 'that', 'this', 'which', 'who'
        ];

        if (fillerWords.includes(word)) return false;
        if (word.length < 3) return false;

        // Check if word is in semantic relationships
        return Object.keys(this.semanticRelationships).includes(word) ||
               Object.values(this.semanticRelationships).flat().includes(word);
    }

    /**
     * Get related terms (synonyms/related concepts)
     */
    getRelatedTerms(word) {
        word = word.toLowerCase();
        
        if (this.semanticRelationships[word]) {
            return this.semanticRelationships[word];
        }

        // Find if word is in any relationship group
        for (const [key, synonyms] of Object.entries(this.semanticRelationships)) {
            if (synonyms.includes(word)) {
                return [key, ...synonyms.filter(s => s !== word)];
            }
        }

        return [];
    }

    /**
     * Infer semantic implications
     */
    inferSemanticsImplication(concept) {
        const implications = {
            'reject': { tone: 'negative', strength: 'high', requires: 'alternative' },
            'approve': { tone: 'positive', strength: 'high', requires: 'follow-up' },
            'urgent': { tone: 'stressed', strength: 'critical', requires: 'immediate action' },
            'appreciate': { tone: 'positive', strength: 'medium', requires: 'acknowledgment' },
            'concern': { tone: 'worried', strength: 'high', requires: 'solution' },
            'collaborate': { tone: 'positive', strength: 'medium', requires: 'engagement' }
        };

        return implications[concept] || { tone: 'neutral', strength: 'low', requires: 'clarification' };
    }

    /**
     * Detect paraphrases in text
     */
    detectParaphrases(text) {
        const paraphrases = [];
        const lowerText = text.toLowerCase();

        for (const [pattern, alternatives] of Object.entries(this.paraphrasePatterns)) {
            if (lowerText.includes(pattern.toLowerCase())) {
                paraphrases.push({
                    detected: pattern,
                    alternatives: alternatives,
                    confidence: 100
                });
            } else {
                // Check for similar paraphrases
                for (const alt of alternatives) {
                    if (lowerText.includes(alt.toLowerCase())) {
                        paraphrases.push({
                            detected: alt,
                            standardForm: pattern,
                            alternatives: alternatives,
                            confidence: 95
                        });
                        break;
                    }
                }
            }
        }

        return paraphrases;
    }

    /**
     * Calculate semantic coherence
     * How well do the semantic concepts relate to each other?
     */
    calculateSemanticCoherence(concepts) {
        if (concepts.length < 2) return 50;

        let totalSimilarity = 0;
        let pairCount = 0;

        for (let i = 0; i < concepts.length; i++) {
            for (let j = i + 1; j < concepts.length; j++) {
                const similarity = this.calculateWordSimilarity(concepts[i], concepts[j]);
                totalSimilarity += similarity;
                pairCount++;
            }
        }

        return Math.round(totalSimilarity / Math.max(pairCount, 1));
    }

    /**
     * Detect ambiguous/unclear expressions
     */
    detectAmbiguity(text) {
        const ambiguities = [];
        const words = text.split(/\s+/);

        for (const word of words) {
            if (this.contextMeanings[word.toLowerCase()]) {
                ambiguities.push({
                    word: word,
                    possibleMeanings: Object.keys(this.contextMeanings[word.toLowerCase()]),
                    ambiguityScore: 75,
                    requiresClarification: true
                });
            }
        }

        return ambiguities;
    }

    /**
     * Suggest semantic improvements
     */
    suggestSemanticImprovements(text) {
        const suggestions = [];
        const semanticProfile = this.analyzeSemantic(text);

        // Suggest improving semantic density if too low
        if (semanticProfile.semanticDensity < 30) {
            suggestions.push({
                issue: 'Low semantic density',
                suggestion: 'Add more meaningful content and reduce filler words',
                priority: 'medium',
                impact: 'Clarity improvement +20%'
            });
        }

        // Suggest addressing ambiguities
        const ambiguities = this.detectAmbiguity(text);
        if (ambiguities.length > 0) {
            suggestions.push({
                issue: `${ambiguities.length} ambiguous term(s) detected`,
                suggestion: 'Clarify meaning of: ' + ambiguities.map(a => a.word).join(', '),
                priority: 'high',
                impact: 'Understanding improvement +30%'
            });
        }

        // Suggest improving coherence if low
        if (semanticProfile.semanticCoherence < 60) {
            suggestions.push({
                issue: 'Low semantic coherence',
                suggestion: 'Ensure concepts relate logically throughout message',
                priority: 'medium',
                impact: 'Logic improvement +25%'
            });
        }

        return suggestions;
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SemanticAnalyzerV3;
}
