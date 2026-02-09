// Cultural Analyzer Module
// Based on Hofstede's Cultural Dimensions Theory

class CulturalAnalyzer {
    constructor() {
        // Hofstede's Cultural Dimensions by country
        this.cultures = {
            de: {
                name: 'Germany',
                dimensions: {
                    powerDistance: 35,      // Low - flatter hierarchies
                    individualism: 67,      // High - individual focus
                    masculinity: 66,        // High - achievement oriented
                    uncertaintyAvoidance: 65, // High - rule-based
                    longTermOrientation: 83, // High - long-term planning
                    indulgence: 40          // Low - restrained
                },
                traits: ['Direct', 'Efficient', 'Rule-based', 'Achievement-focused', 'Task-oriented'],
                riskFactors: {
                    offenseRisk: 'EXTREME if disrespectful to hierarchy',
                    ambiguityRisk: 'LOW - directness preferred',
                    relationshipRisk: 'MEDIUM - formal distance maintained'
                }
            },
            jp: {
                name: 'Japan',
                dimensions: {
                    powerDistance: 54,
                    individualism: 46,
                    masculinity: 95,
                    uncertaintyAvoidance: 92,
                    longTermOrientation: 88,
                    indulgence: 42
                },
                traits: ['Hierarchical', 'Consensus-seeking', 'Long-term focused', 'Harmony-oriented', 'Context-sensitive'],
                riskFactors: {
                    offenseRisk: 'EXTREME if direct criticism',
                    ambiguityRisk: 'LOW - high context communication',
                    relationshipRisk: 'LOW - relationship maintenance is crucial'
                }
            },
            us: {
                name: 'United States',
                dimensions: {
                    powerDistance: 40,
                    individualism: 91,
                    masculinity: 62,
                    uncertaintyAvoidance: 46,
                    longTermOrientation: 26,
                    indulgence: 68
                },
                traits: ['Direct', 'Individualistic', 'Informal', 'Action-oriented', 'Result-focused'],
                riskFactors: {
                    offenseRisk: 'MEDIUM - casual language acceptable',
                    ambiguityRisk: 'MEDIUM - clarity important',
                    relationshipRisk: 'MEDIUM - transactional focus'
                }
            },
            br: {
                name: 'Brazil',
                dimensions: {
                    powerDistance: 69,
                    individualism: 38,
                    masculinity: 49,
                    uncertaintyAvoidance: 76,
                    longTermOrientation: 44,
                    indulgence: 59
                },
                traits: ['Warm', 'Relationship-focused', 'Hierarchical', 'Social', 'Expressive'],
                riskFactors: {
                    offenseRisk: 'MEDIUM - personal warmth expected',
                    ambiguityRisk: 'MEDIUM - flexibility acceptable',
                    relationshipRisk: 'LOW - relationships are foundation'
                }
            },
            cn: {
                name: 'China',
                dimensions: {
                    powerDistance: 80,
                    individualism: 20,
                    masculinity: 66,
                    uncertaintyAvoidance: 30,
                    longTermOrientation: 87,
                    indulgence: 24
                },
                traits: ['Hierarchical', 'Collective', 'Long-term', 'Face-conscious', 'Relationship-based'],
                riskFactors: {
                    offenseRisk: 'EXTREME if causing loss of face',
                    ambiguityRisk: 'MEDIUM - implicit communication normal',
                    relationshipRisk: 'LOW - guanxi (relationships) paramount'
                }
            }
        };
    }

    analyze(culturalCode, text) {
        const culture = this.cultures[culturalCode] || this.createCustomProfile(culturalCode);
        
        if (!culture) {
            return { error: 'Culture not found' };
        }

        const analysis = {
            culture: culture.name,
            dimensions: culture.dimensions,
            traits: culture.traits,
            riskFactors: culture.riskFactors,
            radarData: this.generateRadarData(culture.dimensions),
            recommendations: this.generateRecommendations(culture, text)
        };

        return analysis;
    }

    generateRadarData(dimensions) {
        return {
            efficiency: Math.min(100 - dimensions.powerDistance, 100),
            clarity: 100 - dimensions.uncertaintyAvoidance,
            warmth: 100 - dimensions.masculinity,
            directness: dimensions.individualism,
            formality: dimensions.powerDistance,
            harmonyFocus: 100 - dimensions.individualism
        };
    }

    generateRecommendations(culture, text) {
        const recommendations = [];
        const dims = culture.dimensions;

        if (dims.powerDistance > 60) {
            recommendations.push('🎩 Consider formal language and clear respect for hierarchy');
        } else {
            recommendations.push('👤 More casual and egalitarian tone acceptable');
        }

        if (dims.individualism < 50) {
            recommendations.push('👥 Emphasize team/collective benefits over personal gain');
        } else {
            recommendations.push('⭐ Individual achievements and benefits are motivating');
        }

        if (dims.uncertaintyAvoidance > 70) {
            recommendations.push('✅ Provide clear procedures, rules, and structured approach');
        } else {
            recommendations.push('🎲 Flexibility and informal approaches are acceptable');
        }

        if (dims.longTermOrientation > 70) {
            recommendations.push('🌳 Frame decisions in long-term relationship context');
        } else {
            recommendations.push('⚡ Focus on immediate results and quick wins');
        }

        return recommendations;
    }

    createCustomProfile(code) {
        // Return neutral middle-ground dimensions for custom profiles
        return {
            name: 'Custom Profile',
            dimensions: {
                powerDistance: 50,
                individualism: 50,
                masculinity: 50,
                uncertaintyAvoidance: 50,
                longTermOrientation: 50,
                indulgence: 50
            },
            traits: ['Balanced approach'],
            riskFactors: {
                offenseRisk: 'MEDIUM',
                ambiguityRisk: 'MEDIUM',
                relationshipRisk: 'MEDIUM'
            }
        };
    }

    getAudienceMonologue(culture, originalText, calibrationType) {
        const monologues = {
            de: {
                formal: `This is clear and efficient. The writer respects professional boundaries. I appreciate the directness.`,
                informal: `Good, no wasted words. Gets straight to the point. Professional.`
            },
            jp: {
                formal: `This message shows consideration for hierarchy and harmony. The writer understands our context.`,
                informal: `This respects our relationships and shows cultural awareness. Good.`
            },
            us: {
                formal: `Clear and straightforward. I appreciate the confidence.`,
                informal: `Good, no corporate fluff. I like it.`
            },
            br: {
                formal: `Respectful but warm. This shows the person cares about relationship.`,
                informal: `Friendly and genuine. I feel the warmth in this message.`
            },
            cn: {
                formal: `The writer shows respect for hierarchy and group harmony. Subtle and wise.`,
                informal: `Balanced approach - respects relationships while being clear.`
            }
        };

        const cultureName = culture.name.split(' ')[0].toLowerCase();
        const typeKey = calibrationType.includes('formal') ? 'formal' : 'informal';
        return monologues[cultureName]?.[typeKey] || 'This shows cultural awareness.';
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CulturalAnalyzer;
}
