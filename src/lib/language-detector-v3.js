// ========================================
// LANGUAGE DETECTOR V3 (Iterations 21-30)
// Multi-language Support: 20+ Language Detection & Analysis
// ========================================

class LanguageDetectorV3 {
    constructor() {
        // Language signatures and patterns
        this.languages = {
            // European languages
            'en': { name: 'English', family: 'Germanic', script: 'Latin' },
            'de': { name: 'German', family: 'Germanic', script: 'Latin' },
            'fr': { name: 'French', family: 'Romance', script: 'Latin' },
            'es': { name: 'Spanish', family: 'Romance', script: 'Latin' },
            'it': { name: 'Italian', family: 'Romance', script: 'Latin' },
            'pt': { name: 'Portuguese', family: 'Romance', script: 'Latin' },
            'nl': { name: 'Dutch', family: 'Germanic', script: 'Latin' },
            'pl': { name: 'Polish', family: 'Slavic', script: 'Latin' },
            'ru': { name: 'Russian', family: 'Slavic', script: 'Cyrillic' },
            'sv': { name: 'Swedish', family: 'Germanic', script: 'Latin' },
            'no': { name: 'Norwegian', family: 'Germanic', script: 'Latin' },
            'da': { name: 'Danish', family: 'Germanic', script: 'Latin' },
            'el': { name: 'Greek', family: 'Hellenic', script: 'Greek' },

            // Asian languages
            'ja': { name: 'Japanese', family: 'Japonic', script: 'Kanji/Hiragana/Katakana' },
            'zh': { name: 'Chinese', family: 'Sino-Tibetan', script: 'Chinese', charLimit: 3 },
            'ko': { name: 'Korean', family: 'Koreanic', script: 'Hangul' },
            'th': { name: 'Thai', family: 'Tai-Kadai', script: 'Thai' },
            'vi': { name: 'Vietnamese', family: 'Austroasiatic', script: 'Latin' },

            // Other languages
            'ar': { name: 'Arabic', family: 'Semitic', script: 'Arabic' },
            'hi': { name: 'Hindi', family: 'Indo-Aryan', script: 'Devanagari' },
            'tr': { name: 'Turkish', family: 'Turkic', script: 'Latin' }
        };

        // Common words in different languages (for detection)
        this.commonWords = {
            'en': ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i'],
            'de': ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich'],
            'fr': ['le', 'de', 'un', 'et', 'à', 'être', 'en', 'que', 'avoir', 'je'],
            'es': ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se'],
            'it': ['il', 'di', 'da', 'che', 'e', 'a', 'un', 'in', 'si', 'non'],
            'ja': ['の', 'に', 'は', 'を', 'た', 'が', 'で', 'て', 'と', 'し'],
            'zh': ['的', '一', '是', '在', '不', '了', '有', '和', '人', '这'],
            'ko': ['의', '이', '가', '은', '는', '을', '를', '에', '가', '하'],
            'ru': ['и', 'в', 'во', 'не', 'что', 'он', 'на', 'я', 'с', 'со']
        };

        // Character patterns for detection
        this.characterPatterns = {
            'ja': /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g,
            'zh': /[\u4E00-\u9FFF]/g,
            'ko': /[\uAC00-\uD7AF]/g,
            'ru': /[\u0400-\u04FF]/g,
            'ar': /[\u0600-\u06FF]/g,
            'el': /[\u0370-\u03FF]/g,
            'th': /[\u0E00-\u0E7F]/g,
            'hi': /[\u0900-\u097F]/g
        };

        // Language formality levels
        this.formalityPatterns = {
            'en': {
                formal: ['hereby', 'regarding', 'pursuant', 'moreover', 'furthermore'],
                informal: ['gonna', 'wanna', 'hey', 'yo', 'cool']
            },
            'de': {
                formal: ['jedoch', 'ferner', 'daher', 'somit'],
                informal: ['tschüss', 'ey', 'cool']
            },
            'fr': {
                formal: ['néanmoins', 'toutefois', 'au demeurant'],
                informal: ['salut', 'ça va', 'ouais']
            }
        };
    }

    /**
     * Detect language of input text
     * Returns language code and confidence
     */
    detect(text) {
        if (!text || text.trim().length === 0) {
            return {
                detected: 'en',
                confidence: 0,
                error: 'Empty text'
            };
        }

        const scores = {};
        
        // Score each language
        for (const [langCode, langInfo] of Object.entries(this.languages)) {
            scores[langCode] = this.scoreLanguage(text, langCode);
        }

        // Get highest scoring language
        const detected = Object.keys(scores).reduce((a, b) => 
            scores[a] > scores[b] ? a : b
        );

        const confidence = Math.min(100, Math.round(scores[detected]));

        return {
            detected,
            detectedName: this.languages[detected].name,
            confidence,
            scores: scores,
            scriptFamily: this.languages[detected].script,
            languageFamily: this.languages[detected].family,
            primaryScript: this.getPrimaryScript(text, detected)
        };
    }

    /**
     * Score how likely text is in a specific language
     */
    scoreLanguage(text, langCode) {
        let score = 0;

        // Check for common words
        if (this.commonWords[langCode]) {
            const commonWords = this.commonWords[langCode];
            const lowerText = text.toLowerCase();
            
            const matchedWords = commonWords.filter(word => 
                new RegExp(`\\b${word}\\b`).test(lowerText)
            );
            score += matchedWords.length * 10;
        }

        // Check for character patterns
        if (this.characterPatterns[langCode]) {
            const pattern = this.characterPatterns[langCode];
            const matches = text.match(pattern) || [];
            const charPercentage = (matches.length / text.length) * 100;
            
            if (charPercentage > 5) {
                score += charPercentage * 2;
            }
        }

        return score;
    }

    /**
     * Get primary script used in text
     */
    getPrimaryScript(text, langCode) {
        if (this.characterPatterns[langCode]) {
            const pattern = this.characterPatterns[langCode];
            const matches = text.match(pattern) || [];
            return {
                script: this.languages[langCode].script,
                percentage: Math.round((matches.length / text.length) * 100)
            };
        }

        return {
            script: this.languages[langCode].script,
            percentage: 100
        };
    }

    /**
     * Detect language formality level within detected language
     */
    detectFormality(text, langCode = null) {
        // First detect language if not provided
        if (!langCode) {
            const detection = this.detect(text);
            langCode = detection.detected;
        }

        if (!this.formalityPatterns[langCode]) {
            return {
                formality: 'neutral',
                score: 50,
                language: langCode
            };
        }

        const patterns = this.formalityPatterns[langCode];
        const lowerText = text.toLowerCase();

        let formalScore = 0;
        let informalScore = 0;

        // Count formal markers
        for (const word of patterns.formal) {
            if (lowerText.includes(word)) {
                formalScore += 10;
            }
        }

        // Count informal markers
        for (const word of patterns.informal) {
            if (lowerText.includes(word)) {
                informalScore += 10;
            }
        }

        // Determine overall formality
        let formality = 'neutral';
        if (formalScore > informalScore + 10) {
            formality = 'formal';
        } else if (informalScore > formalScore + 10) {
            formality = 'informal';
        }

        return {
            formality,
            formalScore,
            informalScore,
            language: langCode,
            languageName: this.languages[langCode].name
        };
    }

    /**
     * Analyze code-switching (mixing of languages)
     */
    analyzeCodeSwitching(text) {
        const languages = [];
        const words = text.split(/\s+/);
        
        // Try to detect language of each word/phrase
        let currentLang = null;
        let currentPhrase = [];
        const switches = [];

        for (const word of words) {
            const detected = this.detect(word);
            
            if (detected.detected !== currentLang) {
                if (currentPhrase.length > 0) {
                    switches.push({
                        from: currentLang,
                        to: detected.detected,
                        words: currentPhrase,
                        position: words.indexOf(currentPhrase[0])
                    });
                }
                currentLang = detected.detected;
                currentPhrase = [word];
            } else {
                currentPhrase.push(word);
            }
        }

        return {
            hasCodeSwitching: switches.length > 1,
            switchCount: switches.length,
            switches: switches,
            primaryLanguage: languages.length > 0 ? languages[0] : null,
            multilingualRating: Math.min(100, switches.length * 25)
        };
    }

    /**
     * Get language-specific communication style
     */
    getLanguageStyle(langCode) {
        const styles = {
            'en': {
                directness: 'high',
                formality: 'medium',
                contextDependency: 'low',
                emotionalExpression: 'medium',
                indirectness: 'low'
            },
            'de': {
                directness: 'very high',
                formality: 'high',
                contextDependency: 'low',
                emotionalExpression: 'low',
                indirectness: 'very low'
            },
            'ja': {
                directness: 'low',
                formality: 'very high',
                contextDependency: 'very high',
                emotionalExpression: 'very low',
                indirectness: 'very high'
            },
            'fr': {
                directness: 'high',
                formality: 'high',
                contextDependency: 'medium',
                emotionalExpression: 'medium',
                indirectness: 'medium'
            },
            'zh': {
                directness: 'low',
                formality: 'high',
                contextDependency: 'very high',
                emotionalExpression: 'low',
                indirectness: 'high'
            },
            'ko': {
                directness: 'low',
                formality: 'very high',
                contextDependency: 'very high',
                emotionalExpression: 'low',
                indirectness: 'very high'
            },
            'ar': {
                directness: 'medium',
                formality: 'high',
                contextDependency: 'high',
                emotionalExpression: 'high',
                indirectness: 'medium'
            }
        };

        return styles[langCode] || {
            directness: 'medium',
            formality: 'medium',
            contextDependency: 'medium',
            emotionalExpression: 'medium',
            indirectness: 'medium'
        };
    }

    /**
     * Suggest calibration adjustments for detected language
     */
    suggestCalibrationsForLanguage(langCode) {
        const suggestions = {
            'en': { directness: 70, formality: 65, indirectness: 30 },
            'de': { directness: 85, formality: 80, indirectness: 15 },
            'ja': { directness: 30, formality: 90, indirectness: 85 },
            'fr': { directness: 70, formality: 75, indirectness: 35 },
            'zh': { directness: 40, formality: 85, indirectness: 70 },
            'ko': { directness: 35, formality: 90, indirectness: 80 },
            'es': { directness: 70, formality: 70, indirectness: 35 },
            'it': { directness: 75, formality: 65, indirectness: 30 }
        };

        return suggestions[langCode] || {
            directness: 60,
            formality: 60,
            indirectness: 40
        };
    }

    /**
     * Get all supported languages
     */
    getSupportedLanguages() {
        return Object.entries(this.languages).map(([code, info]) => ({
            code,
            name: info.name,
            family: info.family,
            script: info.script
        }));
    }

    /**
     * Get language count
     */
    getLanguageCount() {
        return Object.keys(this.languages).length;
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LanguageDetectorV3;
}
