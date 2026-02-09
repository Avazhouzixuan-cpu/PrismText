// ITERATION 1-10: ENHANCED TONE CALIBRATOR WITH NLP-STYLE TRANSFORMATIONS
// More sophisticated text transformation engine

class ToneCalibratorV2 {
    constructor() {
        // IMPROVEMENT 1: Extended transformation vocabulary
        this.transformationRules = {
            formality: {
                replacements: [
                    // Casual to Formal
                    { from: /\bgotta\b/gi, to: 'must', level: 'high' },
                    { from: /\bwanna\b/gi, to: 'would like to', level: 'high' },
                    { from: /\bcan\'t\b/gi, to: 'cannot', level: 'high' },
                    { from: /\bunsure\b/gi, to: 'uncertain', level: 'medium' },
                    { from: /\byeah\b/gi, to: 'yes', level: 'high' },
                    { from: /\bokay\b/gi, to: 'understood', level: 'medium' },
                    { from: /\bthanks\b/gi, to: 'I appreciate', level: 'medium' },
                    { from: /\bhey\b/gi, to: 'Hello', level: 'high' }
                ]
            },
            warmth: {
                additions: [
                    { pattern: /^(.*?)$/, addition: (text) => text, level: 'none' },
                    { pattern: /(need|require)/gi, addition: (text) => text.replace(/(need|require)/gi, 'would greatly appreciate your help with'), level: 'high' },
                    { pattern: /(thank)/gi, addition: (text) => text.replace(/(thank)/gi, 'deeply thank'), level: 'medium' }
                ]
            },
            urgency: {
                markers: {
                    low: ['when you have time', 'at your convenience', 'whenever'],
                    medium: ['soon', 'within the week', 'timely'],
                    high: ['as soon as possible', 'urgently', 'please prioritize'],
                    critical: ['immediately', 'critical priority', 'URGENT']
                }
            },
            directness: {
                replacements: [
                    { implicit: 'Perhaps you might consider', explicit: 'You should', suggestion: 'You could consider' },
                    { implicit: 'It might help if', explicit: 'You must', suggestion: 'I recommend' },
                    { implicit: 'There could be a way', explicit: 'This is how to do it', suggestion: 'One approach would be' }
                ]
            }
        };

        // IMPROVEMENT 2: Industry-specific language packs
        this.industryVocabulary = {
            legal: {
                keywords: ['whereas', 'hereinafter', 'party', 'agreement'],
                formality: 'very_high'
            },
            medical: {
                keywords: ['patient', 'treatment', 'protocol', 'clinical'],
                formality: 'high',
                accuracy: 'critical'
            },
            tech: {
                keywords: ['implement', 'scalable', 'optimize', 'infrastructure'],
                formality: 'medium',
                clarity: 'critical'
            },
            sales: {
                keywords: ['opportunity', 'value', 'solution', 'benefit'],
                formality: 'low_to_medium',
                persuasiveness: 'high'
            },
            hr: {
                keywords: ['candidate', 'competency', 'development', 'engagement'],
                formality: 'medium',
                sensitivity: 'high'
            }
        };

        // IMPROVEMENT 3: Emotional intelligence markers
        this.emotionalMarkers = {
            empathy: ['I understand', 'I appreciate', 'I acknowledge', 'I recognize'],
            disappointment: ['unfortunately', 'regrettably', 'sadly', 'I\'m concerned'],
            confidence: ['I\'m confident', 'I assure you', 'I guarantee', 'I\'m certain'],
            uncertainty: ['I think', 'It appears', 'It seems', 'Perhaps']
        };
    }

    // Enhanced calibrate method with industry awareness
    calibrate(originalText, hierarchy = 50, emotional = 50, urgency = 50, directness = 50, industry = 'general') {
        const clampedParams = {
            h: Math.max(0, Math.min(100, hierarchy)),
            e: Math.max(0, Math.min(100, emotional)),
            u: Math.max(0, Math.min(100, urgency)),
            d: Math.max(0, Math.min(100, directness))
        };

        // IMPROVEMENT 4: Generate 5 variations instead of 3
        const versions = [
            this.generateVersion(originalText, clampedParams, 'balanced', industry),
            this.generateVersion(originalText, { h: clampedParams.h + 20, e: clampedParams.e - 10, u: clampedParams.u, d: clampedParams.d }, 'formal', industry),
            this.generateVersion(originalText, { h: clampedParams.h - 15, e: clampedParams.e + 20, u: clampedParams.u - 10, d: clampedParams.d - 10 }, 'warm', industry),
            this.generateVersion(originalText, { h: clampedParams.h, e: clampedParams.e - 20, u: clampedParams.u + 20, d: clampedParams.d + 15 }, 'assertive', industry),
            this.generateVersion(originalText, { h: clampedParams.h + 10, e: clampedParams.e + 10, u: clampedParams.u - 10, d: clampedParams.d - 10 }, 'diplomatic', industry)
        ];

        return {
            originalText,
            versions,
            parameters: clampedParams,
            industry,
            analysisMetadata: {
                formality_level: this.calculateFormalityLevel(clampedParams.h),
                emotional_tone: this.calculateEmotionalTone(clampedParams.e),
                time_sensitivity: clampedParams.u,
                clarity_level: clampedParams.d
            }
        };
    }

    generateVersion(text, params, style, industry) {
        let modified = text;
        const h = params.h;
        const e = params.e;
        const u = params.u;
        const d = params.d;

        console.log(`🔄 [${style}] Starting transformation. Input: "${text.substring(0, 40)}..." (${text.length} chars)`);

        // IMPROVEMENT 5: Apply transformations in sequence
        modified = this.applyFormalityTransforms(modified, h);
        console.log(`  ↳ After formality: ${modified.length} chars, preview: "${modified.substring(0, 40)}..."`);
        
        modified = this.applyEmotionalTransforms(modified, e);
        console.log(`  ↳ After emotional: ${modified.length} chars`);
        
        modified = this.applyUrgencyTransforms(modified, u);
        console.log(`  ↳ After urgency: ${modified.length} chars`);
        
        modified = this.applyDirectnessTransforms(modified, d);
        console.log(`  ↳ After directness: ${modified.length} chars`);
        
        modified = this.applyIndustryLanguage(modified, industry);
        console.log(`  ↳ After industry: ${modified.length} chars`);

        // Safety check: ensure modified text is not empty
        if (!modified || modified.trim().length === 0) {
            console.warn(`⚠️ [${style}] Transformation resulted in empty text. Using original.`);
            modified = text; // Fall back to original text
        }

        const finalQuality = this.calculateQualityScore(text, modified || text, params, style);
        console.log(`✅ [${style}] Complete: ${(modified || text).length} chars, quality: ${finalQuality}`);

        return {
            text: modified || text,
            style,
            parameters: { h, e, u, d },
            qualityScore: finalQuality
        };
    }

    applyFormalityTransforms(text, level) {
        let result = text;

        if (level > 70) {
            // Very formal - significant transformations
            result = result.replace(/I think/gi, 'In my assessment');
            result = result.replace(/I think that/gi, 'It is my assessment that');
            result = result.replace(/but/gi, 'however');
            result = result.replace(/get/gi, 'obtain');
            result = result.replace(/using/gi, 'utilizing');
            result = result.replace(/gonna/gi, 'will');
            result = result.replace(/wanna/gi, 'wish to');
            result = result.replace(/gotta/gi, 'must');
            result = result.replace(/thanks/gi, 'I appreciate your assistance');
            result = result.replace(/okay/gi, 'understood');
        } else if (level > 50) {
            // Moderately formal
            result = result.replace(/thanks/gi, 'I appreciate');
            result = result.replace(/okay/gi, 'understood');
            result = result.replace(/gonna/gi, 'going to');
            result = result.replace(/can't/gi, 'cannot');
            result = result.replace(/don't/gi, 'do not');
            result = result.replace(/won't/gi, 'will not');
        } else if (level < 30) {
            // Casual
            result = result.replace(/I appreciate/gi, 'thanks');
            result = result.replace(/understood/gi, 'okay');
            result = result.replace(/kindly/gi, '');
            result = result.replace(/utili[zs]ing/gi, 'using');
            result = result.replace(/cannot/gi, 'can\'t');
            result = result.replace(/do not/gi, 'don\'t');
            result = result.replace(/will not/gi, 'won\'t');
        }

        return result;
    }

    applyEmotionalTransforms(text, level) {
        let result = text;

        if (level > 70) {
            // Very warm and positive - enhance positive language
            result = result.replace(/good/gi, 'wonderful');
            result = result.replace(/thanks/gi, 'I really appreciate');
            result = result.replace(/need/gi, 'would really appreciate');
            result = result.replace(/help/gi, 'help and support');
            result = result.replace(/problem/gi, 'opportunity to improve');
            result = result.replace(/bad/gi, 'challenging');
            result = result.replace(/okay/gi, 'great');
            // Add warmth with emojis selectively
            if (!text.match(/😊|❤|💙|✨/g)) {
                result = result.replace(/thanks|really appreciate/i, '$& ❤');
            }
        } else if (level < 30) {
            // Cold, detached - remove positive language
            result = result.replace(/!/g, '.');
            result = result.replace(/wonderful/gi, 'good');
            result = result.replace(/really appreciate/gi, 'note');
            result = result.replace(/please/gi, '');
            result = result.replace(/thank you/gi, 'acknowledged');
            result = result.replace(/thanks/gi, 'acknowledged');
            result = result.replace(/great/gi, 'acceptable');
            result = result.replace(/love/gi, 'prefer');
        } else {
            // Neutral - moderate adjustments
            result = result.replace(/great/gi, 'good');
            result = result.replace(/awful/gi, 'difficult');
        }

        return result;
    }

    applyUrgencyTransforms(text, level) {
        let result = text;

        if (level > 70) {
            // Critical urgency - add urgency markers
            if (!text.match(/urgent|asap|immediately|critical/gi)) {
                result = result.replace(/\.$/, '. This requires immediate attention.');
                result = result.replace(/\?$/, '? I need this resolved ASAP.');
                result = result.replace(/!$/, '! This is critical.');
            }
            result = result.replace(/can/gi, 'must urgently');
            result = result.replace(/should/gi, 'must');
        } else if (level < 30) {
            // No urgency - relax timing language
            result = result.replace(/asap|urgent|immediately|critical/gi, 'when possible');
            result = result.replace(/must/gi, 'could');
            result = result.replace(/immediately/gi, 'eventually');
            result = result.replace(/ASAP/gi, 'at your convenience');
        }

        return result;
    }

    applyDirectnessTransforms(text, level) {
        let result = text;

        if (level > 70) {
            // Very direct - be explicit about requirements
            result = result.replace(/perhaps|maybe|might|could/gi, 'should');
            result = result.replace(/I suggest/gi, 'You need to');
            result = result.replace(/it might help/gi, 'you must');
            result = result.replace(/It might be good/gi, 'You should');
            result = result.replace(/Consider/gi, 'Do');
            result = result.replace(/you may want to/gi, 'you must');
        } else if (level < 40) {
            // Indirect - soften directives
            result = result.replace(/should/gi, 'might');
            result = result.replace(/must/gi, 'could consider');
            result = result.replace(/^(\/I recommend)/gi, 'Perhaps you might consider');
            result = result.replace(/You need to/gi, 'You might want to');
            result = result.replace(/Do this/gi, 'Consider this');
            result = result.replace(/This is required/gi, 'This might help');
        }

        return result;
    }

    applyIndustryLanguage(text, industry) {
        if (industry === 'general') return text;

        const pack = this.industryVocabulary[industry];
        if (!pack) return text;

        // Custom industry-specific adjustments
        let result = text;
        
        if (industry === 'legal') {
            result = result.replace(/\byou\b/gi, 'the party');
            result = result.replace(/agree/gi, 'consent');
        } else if (industry === 'medical') {
            result = result.replace(/problem/gi, 'condition');
            result = result.replace(/fix/gi, 'treat');
        } else if (industry === 'sales') {
            result = result.replace(/product/gi, 'solution');
            result = result.replace(/price/gi, 'investment');
        }

        return result;
    }

    addWarmthMarkers(text) {
        const markers = ['😊', '🙏', '👍', '💙'];
        return text.replace(/([.!?])/g, (match) => {
            if (Math.random() > 0.7) {
                return match + ' ' + markers[Math.floor(Math.random() * markers.length)];
            }
            return match;
        });
    }

    calculateFormalityLevel(hierarchy) {
        if (hierarchy > 80) return 'very_formal';
        if (hierarchy > 60) return 'formal';
        if (hierarchy > 40) return 'neutral';
        if (hierarchy > 20) return 'casual';
        return 'very_casual';
    }

    calculateEmotionalTone(emotional) {
        if (emotional > 70) return 'very_warm';
        if (emotional > 55) return 'warm';
        if (emotional > 45) return 'neutral';
        if (emotional > 20) return 'cold';
        return 'very_cold';
    }

    calculateQualityScore(original, modified, params, style) {
        let score = 50;

        // Penalty for no changes
        if (original === modified) score -= 20;

        // Penalty for excessive length increase
        if (modified.length > original.length * 1.5) score -= 10;

        // Bonus for natural phrasing (heuristic)
        if (modified.match(/\b(I|we)\s+(would|could|may)/gi)) score += 15;

        // Style-specific bonuses
        if (style === 'diplomatic' && modified.match(/however|alternatively|perhaps/gi)) score += 10;
        if (style === 'assertive' && modified.match(/must|need to|should/gi)) score += 10;

        return Math.max(0, Math.min(100, score));
    }

    // IMPROVEMENT 6: Generate detailed explanation
    generateDetailedExplanation(original, calibrated, dimensions) {
        const explanations = [];

        explanations.push(`**Calibration Summary**`);
        explanations.push(`Formality: ${this.calculateFormalityLevel(dimensions.h)}`);
        explanations.push(`Emotional Tone: ${this.calculateEmotionalTone(dimensions.e)}`);
        explanations.push(``);
        explanations.push(`**Changes Made:**`);

        if (dimensions.h > 60) {
            explanations.push(`📌 Enhanced formal language, added professional terminology`);
        }
        if (dimensions.e > 60) {
            explanations.push(`❤️ Added warmth through personal touches and appreciation markers`);
        }
        if (dimensions.u > 60) {
            explanations.push(`⚡ Emphasized time-sensitivity with urgency markers`);
        }
        if (dimensions.d > 60) {
            explanations.push(`→ Made requests explicit and actionable`);
        }

        return explanations.join('\n');
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ToneCalibratorV2;
}

// Make available globally for browser
if (typeof window !== 'undefined') {
    window.ToneCalibratorV2 = ToneCalibratorV2;
}
