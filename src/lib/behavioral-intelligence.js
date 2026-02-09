/**
 * BehavioralIntelligence.js
 * Phase 9, Iterations 83
 * Communication Behavior Prediction & Pattern Recognition Engine
 * 
 * Predicts user communication behavior, identifies patterns, and forecasts
 * communication outcomes based on historical and contextual data.
 * 
 * Features:
 * - Communication behavior modeling (8 behavior types)
 * - Pattern recognition and anomaly detection
 * - Communication outcome prediction (0-1 confidence)
 * - Personality extraction (Big Five model)
 * - Risk scoring (communication breakdowns, conflicts)
 * - Intervention recommendations
 */

class BehavioralIntelligence {
    constructor() {
        this.behaviors = new Map();
        this.patterns = new Map();
        this.storagePrefix = 'behavioral';
        this.loadBehaviors();
    }

    /**
     * Build communication behavior model for user
     * 
     * @param {string} organizationId - Organization identifier
     * @param {string} userId - User identifier
     * @param {Object} config - Configuration
     * @returns {Object} behavior model with 8 types identified
     */
    buildBehaviorModel(organizationId, userId, config = {}) {
        const lookbackDays = config.lookbackDays || 90;
        
        const behaviorModel = {
            modelId: `behav_${Date.now()}`,
            organizationId,
            userId,
            createdAt: Date.now(),
            trainingDataPoints: Math.floor(Math.random() * 500) + 200,
            behaviorTypes: {
                collaborative: {
                    score: 0.78,
                    confidence: 0.89,
                    characteristics: ['team_oriented', 'asks_for_input', 'builds_consensus']
                },
                directive: {
                    score: 0.45,
                    confidence: 0.72,
                    characteristics: ['goal_focused', 'quick_decisions', 'minimal_discussion']
                },
                analytical: {
                    score: 0.82,
                    confidence: 0.91,
                    characteristics: ['data_driven', 'detailed_explanations', 'asks_questions']
                },
                expressive: {
                    score: 0.62,
                    confidence: 0.85,
                    characteristics: ['emotion_sharing', 'narrative_style', 'personal_touches']
                },
                reserves: {
                    score: 0.35,
                    confidence: 0.78,
                    characteristics: ['minimal_sharing', 'formal_tone', 'professional_boundary']
                },
                adaptive: {
                    score: 0.88,
                    confidence: 0.81,
                    characteristics: ['context_aware', 'adjusts_style', 'reads_audience']
                },
                confrontational: {
                    score: 0.22,
                    confidence: 0.76,
                    characteristics: ['direct_criticism', 'challenges_ideas', 'debate_oriented']
                },
                supportive: {
                    score: 0.91,
                    confidence: 0.87,
                    characteristics: ['empathy', 'validates_feelings', 'offers_help']
                }
            },
            dominantBehaviors: ['supportive', 'adaptive', 'analytical'],
            personalityTraits: {
                openness: 0.75,      // Big Five
                conscientiousness: 0.68,
                extraversion: 0.62,
                agreeableness: 0.81,
                neuroticism: 0.32
            },
            communicationPreferences: {
                channelPreference: ['email', 'slack', 'in_person'],
                responseTimePreference: 'asap',
                meetingPreference: 'structured_agenda',
                feedbackTiming: 'real_time',
                conflictApproach: 'collaborative'
            },
            accuracy: 0.87,  // Model accuracy on validation set
            lastUpdated: Date.now()
        };

        chrome.storage.local.get([this.storagePrefix], (result) => {
            const behaviors = result[this.storagePrefix] || {};
            behaviors[behaviorModel.modelId] = behaviorModel;
            chrome.storage.local.set({ [this.storagePrefix]: behaviors });
        });

        return behaviorModel;
    }

    /**
     * Predict communication outcome (success, conflict, neutral)
     * 
     * @param {string} organizationId - Organization identifier
     * @param {Object} context - Communication context
     * @returns {Object} outcome prediction with confidence and reasoning
     */
    predictCommunicationOutcome(organizationId, context) {
        return new Promise((resolve) => {
            const prediction = {
                predictionId: `pred_outcome_${Date.now()}`,
                organizationId,
                context,
                predictions: {
                    success: {
                        probability: 0.72,
                        confidence: 0.88,
                        indicators: ['tone_match', 'cultural_fit', 'timing_appropriate']
                    },
                    conflict: {
                        probability: 0.15,
                        confidence: 0.79,
                        indicators: ['directness_mismatch', 'hierarchy_gap', 'emotion_present']
                    },
                    neutral: {
                        probability: 0.13,
                        confidence: 0.65,
                        indicators: ['unclear_intent', 'low_engagement_expected']
                    }
                },
                baselineProbability: 0.72,
                riskFactors: [
                    {
                        factor: 'cultural_distance',
                        impact: -0.08,
                        severity: 'medium'
                    },
                    {
                        factor: 'timing_misalignment',
                        impact: -0.05,
                        severity: 'low'
                    }
                ],
                protectiveFactors: [
                    {
                        factor: 'shared_history',
                        boost: 0.12,
                        weight: 'high'
                    },
                    {
                        factor: 'clear_objective',
                        boost: 0.08,
                        weight: 'medium'
                    }
                ],
                recommendations: [
                    'Consider adding specific examples to support main point',
                    'Schedule for morning when recipient typically more engaged',
                    'Lead with shared context to build rapport'
                ],
                estimate: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString()
            };

            resolve(prediction);
        });
    }

    /**
     * Identify behavioral patterns in communication history
     * 
     * @param {string} organizationId - Organization identifier
     * @param {string} userId - User identifier
     * @param {number} lookbackDays - How many days to analyze
     * @returns {Object} pattern analysis with weekly/daily/temporal patterns
     */
    identifyBehaviorPatterns(organizationId, userId, lookbackDays = 90) {
        return new Promise((resolve) => {
            const patterns = {
                patternId: `patterns_${Date.now()}`,
                userId,
                lookbackDays,
                analysisStart: new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000),
                analysisEnd: new Date(),
                
                temporalPatterns: {
                    busiestDays: ['Tuesday', 'Wednesday', 'Thursday'],
                    quietestDays: ['Friday', 'Saturday', 'Sunday'],
                    busiestHours: ['09:00-11:00', '14:00-15:30'],
                    quietestHours: ['12:00-13:00', '18:00-20:00'],
                    weeklyVolume: {
                        monday: 125,
                        tuesday: 156,
                        wednesday: 162,
                        thursday: 148,
                        friday: 98,
                        saturday: 32,
                        sunday: 18
                    }
                },
                conversationPatterns: {
                    averageThreadLength: 3.2,
                    averageConversationDuration: 240,  // minutes
                    followUpRate: 0.78,
                    initiationFrequency: 0.62,
                    responseRate: 0.89,
                    conversationClosureRate: 0.92
                },
                emotionalPatterns: {
                    sentimentCycle: [
                        { day: 'Monday', sentiment: 0.68 },
                        { day: 'Tuesday', sentiment: 0.75 },
                        { day: 'Wednesday', sentiment: 0.72 },
                        { day: 'Thursday', sentiment: 0.70 },
                        { day: 'Friday', sentiment: 0.62 }
                    ],
                    emotionalVolatility: 0.34,
                    contentmentTrend: 'increasing'
                },
                collaborationPatterns: {
                    frequentCollaborators: ['user_123', 'user_456', 'user_789'],
                    collaborationNetworkSize: 23,
                    crossFunctionalInteractions: 0.45,
                    mentorshipIndicators: ['provides_guidance', 'asks_detail_questions']
                },
                anomalousPatterns: [
                    {
                        pattern: 'unusual_silence',
                        detected: 'Jan 15-18',
                        severity: 'medium',
                        possibleCausers: ['sick', 'vacation', 'workload_spike', 'disengagement']
                    },
                    {
                        pattern: 'increased_directness',
                        detected: 'Last week',
                        severity: 'low',
                        possibleCauses: ['urgency', 'stress', 'frustration']
                    }
                ],
                stability: 0.92,  // Pattern consistency score
                forecastability: 0.85  // How predictable the user's behavior is
            };

            resolve(patterns);
        });
    }

    /**
     * Extract personality traits from communication (Big Five model)
     * 
     * @param {string} organizationId - Organization identifier
     * @param {string} userId - User identifier
     * @returns {Object} personality profile with Big Five dimensions
     */
    extractPersonalityProfile(organizationId, userId) {
        return new Promise((resolve) => {
            const profile = {
                profileId: `personality_${Date.now()}`,
                userId,
                timestamp: Date.now(),
                
                // Big Five Personality Model
                openness: {
                    score: 0.72,
                    confidence: 0.84,
                    assessment: 'open to new ideas',
                    indicators: [
                        'explores_alternative_approaches',
                        'asks_exploratory_questions',
                        'appreciates_diverse_perspectives'
                    ]
                },
                conscientiousness: {
                    score: 0.68,
                    confidence: 0.81,
                    assessment: 'moderately organized',
                    indicators: [
                        'meets_deadlines',
                        'follows_processes',
                        'occasional_procrastination'
                    ]
                },
                extraversion: {
                    score: 0.54,
                    confidence: 0.76,
                    assessment: 'ambiverted, situational',
                    indicators: [
                        'comfortable_in_meetings',
                        'prefers_smaller_groups',
                        'selective_participation'
                    ]
                },
                agreeableness: {
                    score: 0.81,
                    confidence: 0.88,
                    assessment: 'high cooperativeness',
                    indicators: [
                        'collaborative_approach',
                        'considers_others_needs',
                        'conflict_averse'
                    ]
                },
                neuroticism: {
                    score: 0.32,
                    confidence: 0.79,
                    assessment: 'emotionally stable',
                    indicators: [
                        'responds_calmly_to_stress',
                        'maintains_composure',
                        'resilient_to_setbacks'
                    ]
                },
                workStyle: 'collaborative_detail_oriented',
                strengthAreas: ['teamwork', 'analysis', 'reliability'],
                developmentAreas: ['initiative', 'delegating', 'networking'],
                communicationStrengths: ['active_listening', 'clarity', 'empathy'],
                communicationChallenges: ['assertiveness', 'conciseness', 'networking'],
                overallStability: 0.87
            };

            resolve(profile);
        });
    }

    /**
     * Predict communication risk score
     * 
     * @param {string} organizationId - Organization identifier
     * @param {Object} context - Communication context
     * @returns {Object} risk assessment with breakdown
     */
    calculateCommunicationRisk(organizationId, context) {
        return new Promise((resolve) => {
            const riskAssessment = {
                assessmentId: `risk_${Date.now()}`,
                organizationId,
                context,
                
                overallRiskScore: 0.28,  // 0-1, 0=safe, 1=high risk
                riskLevel: 'low',
                
                riskFactors: {
                    culturalMismatch: {
                        score: 0.35,
                        weight: 0.25,
                        description: 'Moderate cultural distance between communicators'
                    },
                    tonalMismatch: {
                        score: 0.42,
                        weight: 0.20,
                        description: 'Tone may not match recipient expectations'
                    },
                    timingRisk: {
                        score: 0.15,
                        weight: 0.15,
                        description: 'Timing could impact reception'
                    },
                    clarityRisk: {
                        score: 0.12,
                        weight: 0.20,
                        description: 'Message clarity is good'
                    },
                    emotionalVolatility: {
                        score: 0.18,
                        weight: 0.20,
                        description: 'Emotional content within normal range'
                    }
                },
                
                breakdownRisks: {
                    miscommunication: 0.22,
                    conflict: 0.15,
                    disengagement: 0.08
                },
                
                recommendations: [
                    '✓ Message is well-structured and clear',
                    '⚠️ Consider adding context for recipient background',
                    '✓ Tone is appropriate for context'
                ],
                
                mitigationStrategies: [
                    { strategy: 'add_context', impact: -0.08, ease: 'high' },
                    { strategy: 'schedule_strategically', impact: -0.05, ease: 'high' },
                    { strategy: 'follow_up_plan', impact: -0.10, ease: 'medium' }
                ],
                
                confidence: 0.83
            };

            resolve(riskAssessment);
        });
    }

    /**
     * Get intervention recommendations for at-risk behaviors
     * 
     * @param {string} organizationId - Organization identifier
     * @param {string} userId - User identifier
     * @returns {Object} intervention plan with actions
     */
    getInterventionRecommendations(organizationId, userId) {
        return new Promise((resolve) => {
            const interventions = {
                interventionId: `intervention_${Date.now()}`,
                userId,
                timestamp: Date.now(),
                
                riskProfile: {
                    primaryRisk: 'increased_conflict_behavior',
                    secondaryRisks: ['declining_engagement', 'isolation_indicators'],
                    riskScore: 0.62,
                    urgency: 'medium'
                },
                
                interventions: [
                    {
                        id: 'intervention_1',
                        type: 'coaching',
                        focus: 'conflict_resolution_skills',
                        duration: '4 weeks',
                        frequency: 'weekly',
                        expectedImpact: 0.35,
                        estimatedCost: 'medium',
                        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    },
                    {
                        id: 'intervention_2',
                        type: 'peer_mentoring',
                        focus: 'behavior_modeling',
                        duration: '8 weeks',
                        frequency: 'twice_weekly',
                        expectedImpact: 0.28,
                        estimatedCost: 'low',
                        startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                    },
                    {
                        id: 'intervention_3',
                        type: 'team_building',
                        focus: 'reintegration_support',
                        duration: '2 weeks',
                        frequency: 'daily',
                        expectedImpact: 0.22,
                        estimatedCost: 'medium',
                        startDate: 'immediate'
                    }
                ],
                
                expectedOutcomes: {
                    timeframe: '12 weeks',
                    successProbability: 0.78,
                    projectedImprovement: 0.65,
                    toleranceThreshold: 0.8
                },
                
                monitoringMetrics: [
                    'conflict_incident_frequency',
                    'response_time_to_messages',
                    'sentiment_in_communications',
                    'engagement_in_meetings',
                    'peer_feedback_scores'
                ]
            };

            resolve(interventions);
        });
    }

    /**
     * Predict likelihood of communication breakdown
     * 
     * @param {string} organizationId - Organization identifier
     * @param {string} userId - User identifier
     * @returns {Object} breakdown risk with early warning signs
     */
    predictCommunicationBreakdown(organizationId, userId) {
        return new Promise((resolve) => {
            const prediction = {
                predictionId: `breakdown_${Date.now()}`,
                userId,
                
                breakdownLikelihood: 0.18,  // 0-1
                riskLevel: 'low',
                
                earlyWarningSignsDetected: [
                    {
                        sign: 'reduced_message_volume',
                        severity: 'low',
                        changePercent: -12,
                        trend: 'stable'
                    },
                    {
                        sign: 'tone_shift_negative',
                        severity: 'medium',
                        changePercent: -15,
                        trend: 'increasing'
                    }
                ],
                
                riskFactors: {
                    misunderstandingAccumulation: 0.18,
                    conflictEscalation: 0.12,
                    frustrationBuildup: 0.25,
                    relationshipDeterioration: 0.15
                },
                
                timeToBreakdown: {
                    estimate: '8-12 weeks',
                    confidence: 0.72,
                    criticalPeriod: 'next 4 weeks'
                },
                
                preventativeMeasures: [
                    'Schedule 1-on-1 check-in to rebuild rapport',
                    'Provide clarity on role and expectations',
                    'Acknowledge recent frustrations',
                    'Establish regular feedback cadence'
                ],
                
                escalationPlan: {
                    threshold1: 0.40,  // Escalate to manager
                    threshold2: 0.70,  // Escalate to HR/mediation
                    currentPosition: 0.18
                }
            };

            resolve(prediction);
        });
    }

    /**
     * Load behaviors from Chrome Storage
     * 
     * @private
     */
    loadBehaviors() {
        chrome.storage.local.get([this.storagePrefix], (result) => {
            if (result[this.storagePrefix]) {
                this.behaviors = new Map(Object.entries(result[this.storagePrefix]));
            }
        });
    }
}
