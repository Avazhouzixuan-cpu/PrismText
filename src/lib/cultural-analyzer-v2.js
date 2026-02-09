// ITERATION 1-10 CHECKPOINT
// Enhanced Cultural Analyzer with 20+ countries and dynamic dimensions

class CulturalAnalyzerV2 {
    constructor() {
        // IMPROVEMENT 1: Extended from 5 to 20+ cultural profiles
        this.cultures = {
            de: {
                name: 'Germany',
                region: 'Central Europe',
                languageFamily: 'Germanic',
                dimensions: { powerDistance: 35, individualism: 67, masculinity: 66, uncertaintyAvoidance: 65, longTermOrientation: 83, indulgence: 40 },
                communicationStyle: 'Direct, explicit, task-focused',
                decisionMaking: 'Data-driven, consensus-building',
                timeView: 'Monochronic (sequential)',
                risks: { faceRisk: 'low', ambiguityRisk: 'very low', relationshipRisk: 'medium' }
            },
            jp: {
                name: 'Japan',
                region: 'East Asia',
                languageFamily: 'Japonic',
                dimensions: { powerDistance: 54, individualism: 46, masculinity: 95, uncertaintyAvoidance: 92, longTermOrientation: 88, indulgence: 42 },
                communicationStyle: 'Indirect, implicit, harmony-focused',
                decisionMaking: 'Consensus-driven, group harmony',
                timeView: 'Polychronic (parallel)',
                risks: { faceRisk: 'critical', ambiguityRisk: 'low', relationshipRisk: 'very low' }
            },
            us: {
                name: 'United States',
                region: 'North America',
                languageFamily: 'Germanic',
                dimensions: { powerDistance: 40, individualism: 91, masculinity: 62, uncertaintyAvoidance: 46, longTermOrientation: 26, indulgence: 68 },
                communicationStyle: 'Direct, informal, result-oriented',
                decisionMaking: 'Individual, quick',
                timeView: 'Monochronic (sequential)',
                risks: { faceRisk: 'low', ambiguityRisk: 'medium', relationshipRisk: 'medium' }
            },
            br: {
                name: 'Brazil',
                region: 'South America',
                languageFamily: 'Romance',
                dimensions: { powerDistance: 69, individualism: 38, masculinity: 49, uncertaintyAvoidance: 76, longTermOrientation: 44, indulgence: 59 },
                communicationStyle: 'Warm, expressive, relationship-centered',
                decisionMaking: 'Relationship-based, flexible',
                timeView: 'Polychronic (parallel)',
                risks: { faceRisk: 'medium', ambiguityRisk: 'medium', relationshipRisk: 'very low' }
            },
            cn: {
                name: 'China',
                region: 'East Asia',
                languageFamily: 'Sino-Tibetan',
                dimensions: { powerDistance: 80, individualism: 20, masculinity: 66, uncertaintyAvoidance: 30, longTermOrientation: 87, indulgence: 24 },
                communicationStyle: 'Indirect, hierarchical, relationship-focused',
                decisionMaking: 'Top-down, relationship-driven',
                timeView: 'Polychronic (cyclical)',
                risks: { faceRisk: 'critical', ambiguityRisk: 'medium', relationshipRisk: 'very low' }
            },
            
            // NEW PROFILES (Iterations 1-10)
            fr: {
                name: 'France',
                region: 'Western Europe',
                languageFamily: 'Romance',
                dimensions: { powerDistance: 68, individualism: 71, masculinity: 43, uncertaintyAvoidance: 86, longTermOrientation: 63, indulgence: 48 },
                communicationStyle: 'Intellectual, debate-oriented, nuanced',
                decisionMaking: 'Hierarchical, logic-based',
                timeView: 'Monochronic (sequential)',
                risks: { faceRisk: 'medium', ambiguityRisk: 'low', relationshipRisk: 'medium' }
            },
            uk: {
                name: 'United Kingdom',
                region: 'Western Europe',
                languageFamily: 'Germanic',
                dimensions: { powerDistance: 35, individualism: 89, masculinity: 66, uncertaintyAvoidance: 35, longTermOrientation: 51, indulgence: 69 },
                communicationStyle: 'Indirect politeness, humor, understatement',
                decisionMaking: 'Individual, pragmatic',
                timeView: 'Monochronic (sequential)',
                risks: { faceRisk: 'low', ambiguityRisk: 'very low', relationshipRisk: 'medium' }
            },
            in: {
                name: 'India',
                region: 'South Asia',
                languageFamily: 'Indo-Aryan',
                dimensions: { powerDistance: 77, individualism: 48, masculinity: 56, uncertaintyAvoidance: 40, longTermOrientation: 51, indulgence: 26 },
                communicationStyle: 'Hierarchical, context-sensitive, expressive',
                decisionMaking: 'Hierarchical, relationship-influenced',
                timeView: 'Polychronic (flexible)',
                risks: { faceRisk: 'high', ambiguityRisk: 'medium', relationshipRisk: 'very low' }
            },
            au: {
                name: 'Australia',
                region: 'Oceania',
                languageFamily: 'Germanic',
                dimensions: { powerDistance: 38, individualism: 90, masculinity: 61, uncertaintyAvoidance: 51, longTermOrientation: 21, indulgence: 71 },
                communicationStyle: 'Direct, informal, egalitarian',
                decisionMaking: 'Individual, pragmatic, quick',
                timeView: 'Monochronic (sequential)',
                risks: { faceRisk: 'very low', ambiguityRisk: 'very low', relationshipRisk: 'medium' }
            },
            mx: {
                name: 'Mexico',
                region: 'Central America',
                languageFamily: 'Romance',
                dimensions: { powerDistance: 81, individualism: 30, masculinity: 69, uncertaintyAvoidance: 82, longTermOrientation: 24, indulgence: 97 },
                communicationStyle: 'Hierarchical, warm, respectful',
                decisionMaking: 'Authority-based, relationship-driven',
                timeView: 'Polychronic (flexible)',
                risks: { faceRisk: 'high', ambiguityRisk: 'high', relationshipRisk: 'very low' }
            },
            kr: {
                name: 'South Korea',
                region: 'East Asia',
                languageFamily: 'Koreanic',
                dimensions: { powerDistance: 60, individualism: 18, masculinity: 84, uncertaintyAvoidance: 100, longTermOrientation: 100, indulgence: 29 },
                communicationStyle: 'Hierarchical, formal, relationship-based',
                decisionMaking: 'Hierarchical, consensus-seeking',
                timeView: 'Polychronic (long-term focus)',
                risks: { faceRisk: 'very high', ambiguityRisk: 'high', relationshipRisk: 'very low' }
            },
            se: {
                name: 'Sweden',
                region: 'Northern Europe',
                languageFamily: 'Germanic',
                dimensions: { powerDistance: 31, individualism: 71, masculinity: 5, uncertaintyAvoidance: 29, longTermOrientation: 78, indulgence: 78 },
                communicationStyle: 'Egalitarian, consensus-driven, direct',
                decisionMaking: 'Participatory, long-term focused',
                timeView: 'Monochronic (sequential)',
                risks: { faceRisk: 'very low', ambiguityRisk: 'very low', relationshipRisk: 'low' }
            }
        };
    }

    // IMPROVEMENT 2: Dynamic analysis based on recipient context
    analyze(culturalCode, text, context = {}) {
        const culture = this.cultures[culturalCode] || this.cultures.us;
        
        if (!culture) {
            return { error: 'Culture not found' };
        }

        const analysis = {
            culture: culture.name,
            region: culture.region,
            languageFamily: culture.languageFamily,
            dimensions: culture.dimensions,
            communicationStyle: culture.communicationStyle,
            decisionMaking: culture.decisionMaking,
            timeView: culture.timeView,
            radarData: this.generateRadarData(culture.dimensions),
            recommendations: this.generateRecommendations(culture, text, context),
            risks: this.assessRisks(culture, text),
            recipientProfile: this.buildRecipientProfile(culture, context)
        };

        return analysis;
    }

    // IMPROVEMENT 3: Risk assessment system
    assessRisks(culture, text) {
        const risks = { ...culture.risks };
        
        // Dynamic risk scoring based on text patterns
        const urgencyKeywords = ['urgent', 'asap', 'immediately', 'critical'];
        const criticalityKeywords = ['must', 'have to', 'need to'];
        const emotionalKeywords = ['upset', 'angry', 'frustrated', 'furious'];
        
        const urgencyLevel = urgencyKeywords.filter(kw => text.toLowerCase().includes(kw)).length;
        const criticality = criticalityKeywords.filter(kw => text.toLowerCase().includes(kw)).length;
        const emotionality = emotionalKeywords.filter(kw => text.toLowerCase().includes(kw)).length;
        
        return {
            ...risks,
            urgencyRisk: urgencyLevel > 1 ? 'high' : urgencyLevel > 0 ? 'medium' : 'low',
            criticalityRisk: criticality > 0 ? 'medium' : 'low',
            emotionalRisk: emotionality > 0 ? 'high' : 'low',
            overallRiskScore: (urgencyLevel * 0.3 + criticality * 0.4 + emotionality * 0.3)
        };
    }

    // IMPROVEMENT 4: Recipient personalization
    buildRecipientProfile(culture, context = {}) {
        const profile = {
            culture: culture.name,
            communicationPreference: culture.communicationStyle,
            decisionStyle: culture.decisionMaking,
            expectedResponseTime: culture.timeView === 'Monochronic (sequential)' ? 'Quick & Sequential' : 'Flexible & Relational',
            relationshipImportance: culture.dimensions.individualism < 50 ? 'Very High' : 'Moderate',
            hierarchyRespect: culture.dimensions.powerDistance > 60 ? 'Very Important' : 'Less Important',
            uncertaintyTolerance: culture.dimensions.uncertaintyAvoidance < 50 ? 'High' : 'Low',
            contextPersonalization: context.isFirstContact ? 'formal_respectful' : 'balanced'
        };

        return profile;
    }

    generateRadarData(dimensions) {
        return {
            efficiency: Math.min(100 - dimensions.powerDistance, 100),
            clarity: 100 - dimensions.uncertaintyAvoidance,
            warmth: 100 - dimensions.masculinity,
            directness: dimensions.individualism,
            formality: dimensions.powerDistance,
            harmonyFocus: 100 - dimensions.individualism,
            futureOriented: dimensions.longTermOrientation
        };
    }

    generateRecommendations(culture, text, context = {}) {
        const recommendations = [];
        const dims = culture.dimensions;

        if (dims.powerDistance > 60) {
            recommendations.push('🎩 Emphasize hierarchy recognition and respect for authority');
        } else if (dims.powerDistance < 40) {
            recommendations.push('👥 Use egalitarian language and invite collaboration');
        }

        if (dims.individualism < 50) {
            recommendations.push('👥 Emphasize team/group achievements and collective benefits');
        } else if (dims.individualism > 70) {
            recommendations.push('⭐ Highlight individual contributions and personal benefits');
        }

        if (dims.uncertaintyAvoidance > 70) {
            recommendations.push('✅ Provide detailed procedures, timelines, and clear expectations');
        } else if (dims.uncertaintyAvoidance < 40) {
            recommendations.push('🎲 Emphasize flexibility and adaptive approach');
        }

        if (dims.longTermOrientation > 70) {
            recommendations.push('🌳 Frame decisions in long-term relationship and sustainability context');
        } else if (dims.longTermOrientation < 35) {
            recommendations.push('⚡ Focus on immediate results and quick wins');
        }

        if (dims.masculinity > 70) {
            recommendations.push('🏆 Use achievement and performance metrics');
        } else if (dims.masculinity < 40) {
            recommendations.push('🤝 Emphasize collaboration and quality of life');
        }

        return recommendations;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CulturalAnalyzerV2;
}
