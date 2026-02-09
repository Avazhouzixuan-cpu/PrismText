// Tone Calibrator Module
// Adjusts text based on multi-dimensional tone controls

class ToneCalibrator {
    constructor() {
        this.modifications = {
            hierarchy: {
                0: { adjectives: 'informative', formality: 'casual', honorifics: [] },
                25: { adjectives: 'helpful', formality: 'informal', honorifics: ['colleague'] },
                50: { adjectives: 'professional', formality: 'neutral', honorifics: ['Mr./Ms.'] },
                75: { adjectives: 'respectful', formality: 'formal', honorifics: ['Dr.', 'Professor', 'Sir/Madam'] },
                100: { adjectives: 'ceremonial', formality: 'highly formal', honorifics: ['Your Excellency'] }
            },
            emotional: {
                0: ['detached', 'analytical', 'neutral tone'],
                25: ['measured', 'objective', 'calm tone'],
                50: ['balanced', 'professional', 'standard tone'],
                75: ['engaging', 'warm', 'friendly tone'],
                100: ['passionate', 'emotionally invested', 'enthusiastic tone']
            },
            urgency: {
                0: ['no rush', 'flexible timeline', 'whenever you have time'],
                25: ['soon', 'at your earliest convenience', 'within the week'],
                50: ['timely response preferred', 'soon would be appreciated', 'within a few days'],
                75: ['urgent attention needed', 'as soon as possible', 'within 24 hours'],
                100: ['critical priority', 'immediate action required', 'ASAP']
            },
            directness: {
                0: ['might consider', 'perhaps', 'one could say', 'it might be worth reflecting on'],
                25: ['you could consider', 'it might help to', 'one suggestion would be'],
                50: ['you could', 'I suggest', 'it would be good to'],
                75: ['I recommend', 'you should', 'it\'s important to'],
                100: ['you must', 'do this', 'this is required']
            }
        };
    }

    calibrate(originalText, hierarchy, emotional, urgency, directness) {
        const versions = [
            this.generateVersion(originalText, hierarchy, emotional, urgency, directness, 'balanced'),
            this.generateVersion(originalText, hierarchy + 10, emotional - 10, urgency, directness, 'formal'),
            this.generateVersion(originalText, hierarchy - 10, emotional + 10, urgency - 5, directness - 10, 'warm')
        ];

        return {
            originalText,
            versions,
            parameters: { hierarchy, emotional, urgency, directness }
        };
    }

    generateVersion(text, hierarchy, emotional, urgency, directness, style) {
        let modified = text;

        // Apply modifications based on parameters (clamped 0-100)
        const h = Math.max(0, Math.min(100, hierarchy));
        const e = Math.max(0, Math.min(100, emotional));
        const u = Math.max(0, Math.min(100, urgency));
        const d = Math.max(0, Math.min(100, directness));

        // Hierarchy adjustment
        if (h > 70) {
            modified = this.applyFormality(modified, 'formal');
        } else if (h < 30) {
            modified = this.applyCasualness(modified);
        }

        // Emotional saturation
        if (e > 70) {
            modified = this.addWarmth(modified);
        } else if (e < 30) {
            modified = this.makeDetached(modified);
        }

        // Urgency
        if (u > 70) {
            modified = this.addUrgency(modified);
        } else if (u < 30) {
            modified = this.makeRelaxed(modified);
        }

        // Directness
        if (d > 70) {
            modified = this.makeDirect(modified);
        } else if (d < 30) {
            modified = this.makeImplicit(modified);
        }

        return {
            text: modified,
            style,
            parameters: { hierarchy: h, emotional: e, urgency: u, directness: d }
        };
    }

    applyFormality(text, level) {
        const formalizationRules = [
            { from: /\byou\b/gi, to: 'you (formal)' },
            { from: /\bsorry\b/gi, to: 'I apologize' },
            { from: /\bthanks\b/gi, to: 'I appreciate' },
            { from: /\bwanna\b/gi, to: 'would like to' },
            { from: /\bgotta\b/gi, to: 'must' }
        ];

        let result = text;
        formalizationRules.forEach(rule => {
            result = result.replace(rule.from, rule.to);
        });

        return result;
    }

    applyCasualness(text) {
        const causalRules = [
            { from: /I would appreciate/gi, to: 'I\'d appreciate' },
            { from: /I apologize/gi, to: 'Sorry' },
            { from: /would you be able to/gi, to: 'can you' },
            { from: /kindly/gi, to: '' }
        ];

        let result = text;
        causalRules.forEach(rule => {
            result = result.replace(rule.from, rule.to);
        });

        return result;
    }

    addWarmth(text) {
        const warmthPhrases = [
            { from: /^/m, to: '😊 ' },
            { from: /thanks/gi, to: 'thank you so much' },
            { from: /appreciate/gi, to: 'really appreciate' }
        ];

        let result = text;
        result = result.replace(/\.([\s\n]|$)/g, '. Best regards,$1');
        return result;
    }

    makeDetached(text) {
        return text.replace(/!/g, '.').replace(/please/gi, '');
    }

    addUrgency(text) {
        if (!text.includes('urgent') && !text.includes('ASAP') && !text.includes('immediately')) {
            return text.replace(/\.(\s|$)/, '. This needs immediate attention.$1');
        }
        return text;
    }

    makeRelaxed(text) {
        return text.replace(/ASAP|urgent|immediately/gi, 'when you have time').replace(/must/gi, 'could');
    }

    makeDirect(text) {
        return text.replace(/might|perhaps|could consider/gi, 'should')
                   .replace(/I would suggest/gi, 'I recommend')
                   .replace(/it might be helpful/gi, 'you need');
    }

    makeImplicit(text) {
        return text.replace(/^(.*?)should/m, 'perhaps $1could')
                   .replace(/you need/gi, 'it might help if you')
                   .replace(/you must/gi, 'you may want to consider');
    }

    generateExplanation(original, calibrated, dimensions) {
        const explanations = [];

        if (dimensions.hierarchy > 60) {
            explanations.push('📌 Enhanced formal language and honorifics to show respect for hierarchy');
        } else if (dimensions.hierarchy < 40) {
            explanations.push('💬 Used casual, peer-to-peer language for egalitarian communication');
        }

        if (dimensions.emotional > 60) {
            explanations.push('❤️ Added warmth and personal touches to strengthen relationship');
        } else if (dimensions.emotional < 40) {
            explanations.push('🧊 Maintained objective, professional tone focused on facts');
        }

        if (dimensions.urgency > 60) {
            explanations.push('⚡ Emphasized time-sensitivity without appearing panic-stricken');
        } else if (dimensions.urgency < 40) {
            explanations.push('🎋 Softened urgency markers to show respect for recipient\'s autonomy');
        }

        if (dimensions.directness > 60) {
            explanations.push('→ Made requests explicit and clear to avoid ambiguity');
        } else if (dimensions.directness < 40) {
            explanations.push('↪️ Used indirect phrasing to preserve recipient\'s autonomy and face');
        }

        return explanations.join('\n');
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ToneCalibrator;
}
