// ========================================
// TeamCommunicationAnalyzer Module (Iterations 41-45)
// Analyzes team communication patterns and provides aggregated insights
// ========================================

class TeamCommunicationAnalyzer {
    constructor() {
        this.teamData = {}; // { teamId: { communications, patterns, insights } }
        this.teamMetrics = {}; // { teamId: aggregated metrics }
        this.init();
    }

    // Initialize from Chrome Storage
    init() {
        chrome.storage.local.get(['teamData', 'teamMetrics'], (result) => {
            if (result.teamData) {
                this.teamData = result.teamData;
            }
            if (result.teamMetrics) {
                this.teamMetrics = result.teamMetrics;
            }
        });
    }

    // ===== TEAM ANALYSIS =====

    // Record individual communication in team context
    recordTeamCommunication(teamId, memberId, analysisData, qualityScore, feedback = null) {
        if (!this.teamData[teamId]) {
            this.teamData[teamId] = {
                teamId: teamId,
                createdDate: new Date().toISOString(),
                communications: [],
                memberParticipation: {},
                patterns: {}
            };
        }

        const communication = {
            id: `comm_${Date.now()}`,
            memberId: memberId,
            timestamp: new Date().toISOString(),
            analysis: analysisData,
            qualityScore: qualityScore,
            feedback: feedback,
            tone: analysisData.tone || 'neutral',
            intent: analysisData.intent || 'general',
            culture: analysisData.culture || 'USA',
            language: analysisData.language?.detected || 'en'
        };

        this.teamData[teamId].communications.push(communication);

        // Track member participation
        if (!this.teamData[teamId].memberParticipation[memberId]) {
            this.teamData[teamId].memberParticipation[memberId] = {
                count: 0,
                totalQuality: 0,
                averageQuality: 0,
                tones: {},
                intents: {},
                positiveCount: 0
            };
        }

        const memberData = this.teamData[teamId].memberParticipation[memberId];
        memberData.count++;
        memberData.totalQuality += qualityScore;
        memberData.averageQuality = memberData.totalQuality / memberData.count;

        // Track tone usage
        memberData.tones[communication.tone] = (memberData.tones[communication.tone] || 0) + 1;

        // Track intent usage
        memberData.intents[communication.intent] = (memberData.intents[communication.intent] || 0) + 1;

        // Track positive feedback
        if (feedback === 'positive' || qualityScore > 70) {
            memberData.positiveCount++;
        }

        // Update team patterns
        this._updateTeamPatterns(teamId, communication);

        // Clean old data (keep last 500 comm per team)
        if (this.teamData[teamId].communications.length > 500) {
            this.teamData[teamId].communications = 
                this.teamData[teamId].communications.slice(-500);
        }

        this._persist();
        return communication;
    }

    // Update team-level patterns
    _updateTeamPatterns(teamId, communication) {
        const patterns = this.teamData[teamId].patterns;

        // Track tone popularity
        patterns.commonTones = patterns.commonTones || {};
        patterns.commonTones[communication.tone] = 
            (patterns.commonTones[communication.tone] || 0) + 1;

        // Track intent popularity
        patterns.commonIntents = patterns.commonIntents || {};
        patterns.commonIntents[communication.intent] = 
            (patterns.commonIntents[communication.intent] || 0) + 1;

        // Track culture usage
        patterns.cultureUsage = patterns.cultureUsage || {};
        patterns.cultureUsage[communication.culture] = 
            (patterns.cultureUsage[communication.culture] || 0) + 1;

        // Track language usage
        patterns.languageUsage = patterns.languageUsage || {};
        patterns.languageUsage[communication.language] = 
            (patterns.languageUsage[communication.language] || 0) + 1;

        // Detect trends
        this._detectTeamTrends(teamId);
    }

    // Detect team communication trends
    _detectTeamTrends(teamId) {
        const teamComms = this.teamData[teamId].communications;
        if (teamComms.length < 5) return;

        const recent = teamComms.slice(-20);
        const older = teamComms.slice(-40, -20);

        const patterns = this.teamData[teamId].patterns;
        patterns.trends = patterns.trends || {};

        // Analyze tone trend
        const recentTones = recent.map(c => c.tone);
        const olderTones = older.map(c => c.tone);
        
        const recentToneScore = this._calculateToneScore(recentTones);
        const olderToneScore = this._calculateToneScore(olderTones);

        patterns.trends.toneDirection = recentToneScore > olderToneScore ? 'improving' : 
                                       recentToneScore < olderToneScore ? 'declining' : 'stable';
        patterns.trends.toneMomentum = Math.abs(recentToneScore - olderToneScore);

        // Calculate quality trend
        const recentQuality = recent.reduce((sum, c) => sum + c.qualityScore, 0) / recent.length;
        const olderQuality = older.reduce((sum, c) => sum + c.qualityScore, 0) / older.length;

        patterns.trends.qualityDirection = recentQuality > olderQuality ? 'improving' : 
                                          recentQuality < olderQuality ? 'declining' : 'stable';
        patterns.trends.qualityDelta = recentQuality - olderQuality;
    }

    // Calculate tone quality score
    _calculateToneScore(tones) {
        const toneScores = {
            'professional': 90,
            'supportive': 85,
            'collaborative': 80,
            'confident': 75,
            'neutral': 50,
            'passive': 40,
            'hostile': 20
        };

        return tones.reduce((sum, tone) => sum + (toneScores[tone] || 50), 0) / tones.length;
    }

    // ===== TEAM INSIGHTS =====

    // Get comprehensive team dashboard
    getTeamDashboard(teamId) {
        if (!this.teamData[teamId]) {
            return null;
        }

        const data = this.teamData[teamId];
        const metrics = this._calculateTeamMetrics(teamId);

        return {
            teamId: teamId,
            summary: {
                totalCommunications: data.communications.length,
                activeMembersCount: Object.keys(data.memberParticipation).length,
                createdDate: data.createdDate
            },
            metrics: metrics,
            patterns: this._summarizePatterns(data.patterns),
            memberInsights: this._getRankedMembers(teamId),
            recommendations: this._generateTeamRecommendations(teamId),
            trends: data.patterns.trends || {}
        };
    }

    // Get team metrics
    _calculateTeamMetrics(teamId) {
        const comms = this.teamData[teamId].communications;
        if (comms.length === 0) {
            return { totalQuality: 0, successRate: 0 };
        }

        const totalQuality = comms.reduce((sum, c) => sum + c.qualityScore, 0) / comms.length;
        const successCount = comms.filter(c => c.qualityScore > 70).length;
        const successRate = (successCount / comms.length) * 100;

        const feedbackStats = this._calculateFeedbackStats(comms);

        return {
            averageQuality: Math.round(totalQuality),
            successRate: Math.round(successRate),
            totalCommunications: comms.length,
            averageFeedback: feedbackStats.average,
            positiveRate: feedbackStats.positiveRate,
            teamHealthScore: this._calculateHealthScore(totalQuality, successRate)
        };
    }

    // Calculate feedback statistics
    _calculateFeedbackStats(communications) {
        const withFeedback = communications.filter(c => c.feedback);
        
        if (withFeedback.length === 0) {
            return { average: 0, positiveRate: 0 };
        }

        const positiveCount = withFeedback.filter(c => c.feedback === 'positive').length;
        
        return {
            average: (positiveCount / withFeedback.length) * 100,
            positiveRate: Math.round((positiveCount / withFeedback.length) * 100)
        };
    }

    // Calculate team health score (0-100)
    _calculateHealthScore(quality, successRate) {
        return Math.round((quality * 0.6 + successRate * 0.4));
    }

    // Summarize team patterns
    _summarizePatterns(patterns) {
        if (!patterns) {
            return { topTones: [], topIntents: [], topCultures: [] };
        }

        return {
            topTones: this._getTopItems(patterns.commonTones, 3),
            topIntents: this._getTopItems(patterns.commonIntents, 3),
            topCultures: this._getTopItems(patterns.cultureUsage, 3),
            preferredLanguages: this._getTopItems(patterns.languageUsage, 2)
        };
    }

    // Get top items from frequency map
    _getTopItems(frequencyMap, limit = 3) {
        if (!frequencyMap) return [];

        return Object.entries(frequencyMap)
            .map(([key, count]) => ({ name: key, count: count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }

    // Get ranked member profiles
    _getRankedMembers(teamId) {
        const memberData = this.teamData[teamId].memberParticipation;
        
        return Object.entries(memberData)
            .map(([memberId, data]) => ({
                memberId: memberId,
                communicationCount: data.count,
                averageQuality: Math.round(data.averageQuality),
                positiveRatio: Math.round((data.positiveCount / Math.max(1, data.count)) * 100),
                primaryTone: this._getMostFrequent(data.tones),
                commonIntent: this._getMostFrequent(data.intents),
                performanceLevel: this._getPerformanceLevel(data.averageQuality)
            }))
            .sort((a, b) => b.averageQuality - a.averageQuality);
    }

    // Get most frequent item
    _getMostFrequent(frequencyMap) {
        const entries = Object.entries(frequencyMap);
        if (entries.length === 0) return 'neutral';
        return entries.reduce((a, b) => b[1] > a[1] ? b : a)[0];
    }

    // Get performance level descriptor
    _getPerformanceLevel(quality) {
        if (quality >= 85) return 'excellent';
        if (quality >= 70) return 'good';
        if (quality >= 55) return 'average';
        return 'needs_improvement';
    }

    // ===== TEAM RECOMMENDATIONS =====

    // Generate team-level recommendations
    _generateTeamRecommendations(teamId) {
        const dashboard = this.getTeamDashboard(teamId);
        const recommendations = [];

        // Quality-based recommendations
        if (dashboard.metrics.averageQuality < 60) {
            recommendations.push({
                type: 'quality',
                priority: 'high',
                title: 'Improve Overall Communication Quality',
                description: 'Team quality score is below target. Consider team training on communication standards.',
                action: 'Review top issues and provide targeted coaching'
            });
        }

        // Engagement-based recommendations
        const activeMembers = dashboard.metrics.activeMembersCount;
        const totalComms = dashboard.metrics.totalCommunications;
        if (totalComms > 0) {
            const avgPerMember = totalComms / activeMembers;
            if (avgPerMember < 3) {
                recommendations.push({
                    type: 'engagement',
                    priority: 'medium',
                    title: 'Increase Team Communication',
                    description: 'Some team members have low participation. Encourage more team interactions.',
                    action: 'Identify quiet members and create participation opportunities'
                });
            }
        }

        // Consistency-based recommendations
        const tones = dashboard.patterns.topTones;
        if (tones.length > 2 && tones[0].count / tones[1].count > 3) {
            recommendations.push({
                type: 'consistency',
                priority: 'medium',
                title: 'Standardize Communication Tone',
                description: `Team heavily favors ${tones[0].name} tone. Encourage more variety for different contexts.`,
                action: 'Provide guidance on when to use different communication styles'
            });
        }

        // Trend-based recommendations
        const trends = dashboard.trends || {};
        if (trends.qualityDirection === 'declining' && trends.qualityDelta < -5) {
            recommendations.push({
                type: 'trend',
                priority: 'high',
                title: 'Address Declining Quality Trend',
                description: 'Team communication quality has been declining recently.',
                action: 'Investigate causes and provide support'
            });
        } else if (trends.qualityDirection === 'improving') {
            recommendations.push({
                type: 'trend',
                priority: 'low',
                title: 'Great Progress!',
                description: '✓ Team communication quality is improving.',
                action: 'Maintain current practices and celebrate wins'
            });
        }

        return recommendations;
    }

    // Get team best practices
    getTeamBestPractices(teamId) {
        const dashboard = this.getTeamDashboard(teamId);
        const members = dashboard.memberInsights || [];

        const topPerformers = members.filter(m => m.performanceLevel === 'excellent').slice(0, 3);
        
        const practices = {
            topCommunicationTones: dashboard.patterns.topTones,
            topIntents: dashboard.patterns.topIntents,
            topPerformers: topPerformers.map(m => ({
                memberId: m.memberId,
                averageQuality: m.averageQuality,
                primaryApproach: m.primaryTone
            })),
            successPatterns: this._extractSuccessPatterns(teamId, topPerformers),
            culturalStrengths: dashboard.patterns.topCultures
        };

        return practices;
    }

    // Extract success patterns from top performers
    _extractSuccessPatterns(teamId, topPerformers) {
        if (topPerformers.length === 0) return [];

        const patterns = [];
        const topPerformerIds = topPerformers.map(m => m.memberId);
        const allComms = this.teamData[teamId].communications;
        const topComms = allComms.filter(c => topPerformerIds.includes(c.memberId) && c.qualityScore > 75);

        if (topComms.length > 0) {
            const commonTone = this._getMostFrequent(
                Object.fromEntries(topComms.map(c => [c.tone, 1]))
            );
            const commonCulture = this._getMostFrequent(
                Object.fromEntries(topComms.map(c => [c.culture, 1]))
            );

            patterns.push({
                pattern: `Use ${commonTone} tone`,
                frequency: `Found in ${Math.round((topComms.filter(c => c.tone === commonTone).length / topComms.length) * 100)}% of top communications`
            });

            patterns.push({
                pattern: `Reference ${commonCulture} cultural context`,
                frequency: `Found in ${Math.round((topComms.filter(c => c.culture === commonCulture).length / topComms.length) * 100)}% of top communications`
            });
        }

        return patterns;
    }

    // ===== TEAM COMPARISON =====

    // Compare two team periods (before/after)
    compareTeamPeriods(teamId, startIndex = -50, endIndex = -25) {
        const comms = this.teamData[teamId]?.communications || [];
        if (comms.length < 50) {
            return null;
        }

        const periodBefore = comms.slice(startIndex, endIndex);
        const periodAfter = comms.slice(endIndex);

        const getMetrics = (period) => ({
            count: period.length,
            avgQuality: period.reduce((sum, c) => sum + c.qualityScore, 0) / period.length,
            successRate: (period.filter(c => c.qualityScore > 70).length / period.length) * 100,
            topTone: this._getMostFrequent(Object.fromEntries(period.map(c => [c.tone, 1])))
        });

        const metricsBefore = getMetrics(periodBefore);
        const metricsAfter = getMetrics(periodAfter);

        return {
            period1: {
                label: 'Previous Period',
                metrics: metricsBefore
            },
            period2: {
                label: 'Recent Period',
                metrics: metricsAfter
            },
            improvement: {
                qualityChange: metricsAfter.avgQuality - metricsBefore.avgQuality,
                successRateChange: metricsAfter.successRate - metricsBefore.successRate,
                trend: metricsAfter.avgQuality > metricsBefore.avgQuality ? 'improving' : 'declining'
            }
        };
    }

    // ===== MEMBER SPECIFIC ANALYSIS =====

    // Get member profile within team
    getMemberProfile(teamId, memberId) {
        if (!this.teamData[teamId]?.memberParticipation[memberId]) {
            return null;
        }

        const memberData = this.teamData[teamId].memberParticipation[memberId];
        const memberComms = this.teamData[teamId].communications.filter(c => c.memberId === memberId);

        return {
            memberId: memberId,
            teamId: teamId,
            stats: {
                totalCommunications: memberData.count,
                averageQuality: Math.round(memberData.averageQuality),
                positiveRate: Math.round((memberData.positiveCount / memberData.count) * 100)
            },
            communication: {
                preferredTones: this._getTopItems(memberData.tones, 2),
                commonIntents: this._getTopItems(memberData.intents, 2)
            },
            recentActivity: memberComms.slice(-5).map(c => ({
                timestamp: c.timestamp,
                tone: c.tone,
                intent: c.intent,
                quality: c.qualityScore
            })),
            recommendations: this._getMemberRecommendations(teamId, memberId)
        };
    }

    // Get personalized member recommendations
    _getMemberRecommendations(teamId, memberId) {
        const profile = this.getMemberProfile(teamId, memberId);
        if (!profile) return [];

        const recommendations = [];
        const quality = profile.stats.averageQuality;

        if (quality < 60) {
            recommendations.push({
                type: 'quality_improvement',
                message: 'Focus on improving message clarity and relevance',
                priority: 'high'
            });
        }

        if (profile.stats.positiveRate < 50) {
            recommendations.push({
                type: 'feedback_response',
                message: 'Work on incorporating feedback into communications',
                priority: 'medium'
            });
        }

        if (profile.communication.preferredTones[0]?.name === 'hostile') {
            recommendations.push({
                type: 'tone_adjustment',
                message: 'Consider adopting a more professional tone',
                priority: 'high'
            });
        }

        return recommendations;
    }

    // ===== DATA MANAGEMENT =====

    // Clear old team data
    clearOldData(teamId, daysOld = 90) {
        if (!this.teamData[teamId]) {
            return false;
        }

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const before = this.teamData[teamId].communications.length;
        this.teamData[teamId].communications = 
            this.teamData[teamId].communications.filter(c => 
                new Date(c.timestamp) > cutoffDate
            );
        const after = this.teamData[teamId].communications.length;

        this._persist();
        return { removed: before - after, remaining: after };
    }

    // Export team data
    exportTeamData(teamId) {
        if (!this.teamData[teamId]) {
            return null;
        }

        return {
            dashboard: this.getTeamDashboard(teamId),
            bestPractices: this.getTeamBestPractices(teamId),
            memberProfiles: Object.keys(this.teamData[teamId].memberParticipation)
                .map(memberId => this.getMemberProfile(teamId, memberId)),
            exportDate: new Date().toISOString(),
            dataPoints: this.teamData[teamId].communications.length
        };
    }

    // Persist to Chrome Storage
    _persist() {
        chrome.storage.local.set({
            teamData: this.teamData,
            teamMetrics: this.teamMetrics
        });
    }

    // Get all teams
    getAllTeams() {
        return Object.keys(this.teamData).map(teamId => ({
            teamId: teamId,
            createdDate: this.teamData[teamId].createdDate,
            communicationCount: this.teamData[teamId].communications.length,
            memberCount: Object.keys(this.teamData[teamId].memberParticipation).length
        }));
    }

    // Delete team
    deleteTeam(teamId) {
        if (!this.teamData[teamId]) {
            return false;
        }

        delete this.teamData[teamId];
        delete this.teamMetrics[teamId];
        this._persist();
        return true;
    }
}

// Export for use in popup.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TeamCommunicationAnalyzer;
}
