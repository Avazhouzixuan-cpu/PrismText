// ========================================
// TeamBenchmarking Module (Iterations 61-70)
// Team comparisons and industry benchmarks
// ========================================

class TeamBenchmarking {
    constructor() {
        this.teamProfiles = {}; // { teamId: team profile }
        this.benchmarks = {}; // { benchmarkId: benchmark data }
        this.comparisons = {}; // { comparisonId: comparison results }
        this.industryData = {}; // { industryId: industry benchmark }
        this.rankings = {}; // { rankingId: team rankings }
        this.init();
    }

    // Initialize from Chrome Storage
    init() {
        chrome.storage.local.get(
            ['teamProfiles', 'benchmarkData', 'comparisons', 'industryData', 'rankings'],
            (result) => {
                if (result.teamProfiles) this.teamProfiles = result.teamProfiles;
                if (result.benchmarkData) this.benchmarks = result.benchmarkData;
                if (result.comparisons) this.comparisons = result.comparisons;
                if (result.industryData) this.industryData = result.industryData;
                if (result.rankings) this.rankings = result.rankings;
            }
        );
    }

    // ===== TEAM PROFILING =====

    // Create team profile
    createTeamProfile(organizationId, teamConfig) {
        const teamId = `team_${Date.now()}`;

        const profile = {
            id: teamId,
            organizationId,
            name: teamConfig.name,
            description: teamConfig.description,
            department: teamConfig.department,
            createdDate: new Date().toISOString(),

            metadata: {
                size: teamConfig.size || 5,
                location: teamConfig.location || 'USA',
                industry: teamConfig.industry || 'technology',
                roles: teamConfig.roles || ['engineer', 'manager', 'analyst'],
                languages: teamConfig.languages || ['en', 'de']
            },

            currentMetrics: {
                communicationQuality: 76,
                teamEngagement: 72,
                complianceScore: 85,
                responseTime: '2.3 hours',
                errorRate: 0.12
            },

            historicalPerformance: [],
            memberCount: teamConfig.size || 5,
            managerName: teamConfig.manager || 'Unknown'
        };

        this.teamProfiles[teamId] = profile;
        this._persist();

        return profile;
    }

    // Update team metrics
    updateTeamMetrics(teamId, metrics) {
        const team = this.teamProfiles[teamId];
        if (!team) return false;

        // Store historical data point
        team.historicalPerformance.push({
            timestamp: new Date().toISOString(),
            metrics: { ...team.currentMetrics }
        });

        // Keep only last 90 days of history
        if (team.historicalPerformance.length > 90) {
            team.historicalPerformance = team.historicalPerformance.slice(-90);
        }

        // Update current metrics
        team.currentMetrics = metrics;
        this._persist();

        return true;
    }

    // ===== BENCHMARKING =====

    // Create benchmark
    createBenchmark(organizationId, config) {
        const benchmarkId = `benchmark_${Date.now()}`;

        const benchmark = {
            id: benchmarkId,
            organizationId,
            name: config.name,
            description: config.description,
            createdDate: new Date().toISOString(),

            category: config.category, // 'internal', 'industry', 'peer_group'
            
            metrics: {
                communicationQuality: {
                    average: 75,
                    median: 76,
                    stdDev: 8,
                    min: 45,
                    max: 95
                },
                teamEngagement: {
                    average: 72,
                    median: 73,
                    stdDev: 10,
                    min: 40,
                    max: 92
                },
                complianceScore: {
                    average: 82,
                    median: 84,
                    stdDev: 6,
                    min: 55,
                    max: 100
                },
                responseTime: {
                    average: 180, // minutes
                    median: 165,
                    stdDev: 45,
                    min: 30,
                    max: 480
                }
            },

            applicability: {
                industries: config.industries || ['all'],
                teamSizes: config.teamSizes || [10, 50],
                regions: config.regions || ['all']
            },

            percentiles: {
                p10: 65,
                p25: 70,
                p50: 75,
                p75: 82,
                p90: 90
            }
        };

        this.benchmarks[benchmarkId] = benchmark;
        this._persist();

        return benchmark;
    }

    // Get applicable benchmark
    getApplicableBenchmark(teamId, benchmarkType = 'internal') {
        const team = this.teamProfiles[teamId];
        if (!team) return null;

        const benchmarks = Object.values(this.benchmarks)
            .filter(b => b.category === benchmarkType)
            .filter(b => {
                if (b.applicability.industries.includes('all')) return true;
                return b.applicability.industries.includes(team.metadata.industry);
            });

        return benchmarks[0] || null;
    }

    // ===== COMPARISONS =====

    // Compare teams
    compareTeams(organizationId, teamIds, metric = 'communicationQuality') {
        const comparisonId = `comp_${Date.now()}`;

        const teams = teamIds
            .map(id => this.teamProfiles[id])
            .filter(Boolean);

        if (teams.length === 0) return null;

        const comparison = {
            id: comparisonId,
            organizationId,
            teamIds,
            metric,
            timestamp: new Date().toISOString(),

            data: teams.map(team => ({
                teamId: team.id,
                teamName: team.name,
                value: team.currentMetrics[metric],
                percentile: this._calculatePercentile(team.currentMetrics[metric], metric),
                trend: this._calculateTrend(team),
                rank: 0 // Will be calculated below
            })).sort((a, b) => b.value - a.value).map((item, index) => ({
                ...item,
                rank: index + 1
            })),

            statistics: {
                average: teams.reduce((sum, t) => sum + t.currentMetrics[metric], 0) / teams.length,
                median: this._calculateMedian(teams.map(t => t.currentMetrics[metric])),
                highest: Math.max(...teams.map(t => t.currentMetrics[metric])),
                lowest: Math.min(...teams.map(t => t.currentMetrics[metric])),
                variance: this._calculateVariance(teams.map(t => t.currentMetrics[metric]))
            },

            insights: this._generateComparisonInsights(teams, metric)
        };

        this.comparisons[comparisonId] = comparison;
        this._persist();

        return comparison;
    }

    // Compare team vs benchmark
    compareTeamVsBenchmark(teamId, benchmarkId) {
        const team = this.teamProfiles[teamId];
        const benchmark = this.benchmarks[benchmarkId];

        if (!team || !benchmark) return null;

        return {
            teamId,
            teamName: team.name,
            benchmark: benchmark.name,
            timestamp: new Date().toISOString(),

            comparison: {
                communicationQuality: {
                    team: team.currentMetrics.communicationQuality,
                    benchmark: benchmark.metrics.communicationQuality.average,
                    difference: team.currentMetrics.communicationQuality - benchmark.metrics.communicationQuality.average,
                    percentile: this._calculatePercentile(
                        team.currentMetrics.communicationQuality,
                        'communicationQuality',
                        benchmark
                    ),
                    status: team.currentMetrics.communicationQuality >= benchmark.metrics.communicationQuality.average
                        ? 'above' : 'below'
                },
                teamEngagement: {
                    team: team.currentMetrics.teamEngagement,
                    benchmark: benchmark.metrics.teamEngagement.average,
                    difference: team.currentMetrics.teamEngagement - benchmark.metrics.teamEngagement.average,
                    percentile: this._calculatePercentile(
                        team.currentMetrics.teamEngagement,
                        'teamEngagement',
                        benchmark
                    ),
                    status: team.currentMetrics.teamEngagement >= benchmark.metrics.teamEngagement.average
                        ? 'above' : 'below'
                },
                complianceScore: {
                    team: team.currentMetrics.complianceScore,
                    benchmark: benchmark.metrics.complianceScore.average,
                    difference: team.currentMetrics.complianceScore - benchmark.metrics.complianceScore.average,
                    percentile: this._calculatePercentile(
                        team.currentMetrics.complianceScore,
                        'complianceScore',
                        benchmark
                    ),
                    status: team.currentMetrics.complianceScore >= benchmark.metrics.complianceScore.average
                        ? 'above' : 'below'
                }
            },

            summary: {
                metricsAboveBenchmark: 0,
                metricsAtBenchmark: 0,
                metricsBelowBenchmark: 0,
                overallStatus: 'neutral'
            }
        };
    }

    // ===== RANKINGS =====

    // Generate team ranking
    generateTeamRanking(organizationId, metric = 'communicationQuality') {
        const rankingId = `ranking_${Date.now()}`;

        const teams = Object.values(this.teamProfiles)
            .filter(t => t.organizationId === organizationId)
            .sort((a, b) => b.currentMetrics[metric] - a.currentMetrics[metric]);

        const ranking = {
            id: rankingId,
            organizationId,
            metric,
            generatedDate: new Date().toISOString(),

            ranking: teams.map((team, index) => ({
                rank: index + 1,
                teamId: team.id,
                teamName: team.name,
                department: team.department,
                score: team.currentMetrics[metric],
                previousRank: this._getPreviousRank(team.id, metric),
                trend: team.historicalPerformance.length >= 2 ? 'improving' : 'stable',
                changePoints: team.historicalPerformance.length >= 2
                    ? team.currentMetrics[metric] - team.historicalPerformance[team.historicalPerformance.length - 1].metrics[metric]
                    : 0
            })),

            statistics: {
                average: teams.reduce((sum, t) => sum + t.currentMetrics[metric], 0) / teams.length,
                median: this._calculateMedian(teams.map(t => t.currentMetrics[metric])),
                topPerformer: teams[0]?.name || 'N/A',
                needsImprovement: teams[teams.length - 1]?.name || 'N/A'
            }
        };

        this.rankings[rankingId] = ranking;
        this._persist();

        return ranking;
    }

    // Get team rank
    getTeamRank(teamId, metric = 'communicationQuality') {
        const team = this.teamProfiles[teamId];
        if (!team) return null;

        const allTeams = Object.values(this.teamProfiles)
            .filter(t => t.metadata.industry === team.metadata.industry)
            .sort((a, b) => b.currentMetrics[metric] - a.currentMetrics[metric]);

        const rank = allTeams.findIndex(t => t.id === teamId) + 1;

        return {
            teamId,
            teamName: team.name,
            rank,
            total: allTeams.length,
            percentile: Math.round((1 - rank / allTeams.length) * 100),
            score: team.currentMetrics[metric]
        };
    }

    // ===== INDUSTRY BENCHMARKS =====

    // Create industry benchmark
    createIndustryBenchmark(industry, config) {
        const benchmarkId = `industry_${Date.now()}`;

        const benchmark = {
            id: benchmarkId,
            industry,
            source: config.source || 'internal',
            year: config.year || new Date().getFullYear(),
            dataPoints: config.dataPoints || 500,

            metrics: {
                communicationQuality: {
                    average: 74,
                    median: 75,
                    stdDev: 9,
                    min: 42,
                    max: 98
                },
                teamEngagement: {
                    average: 70,
                    median: 71,
                    stdDev: 11,
                    min: 38,
                    max: 95
                },
                complianceScore: {
                    average: 81,
                    median: 83,
                    stdDev: 7,
                    min: 50,
                    max: 100
                }
            },

            percentiles: {
                p10: 63,
                p25: 68,
                p50: 74,
                p75: 80,
                p90: 89
            }
        };

        this.industryData[benchmarkId] = benchmark;
        this._persist();

        return benchmark;
    }

    // Get industry benchmark
    getIndustryBenchmark(industry) {
        const benchmarks = Object.values(this.industryData)
            .filter(b => b.industry === industry)
            .sort((a, b) => new Date(b.year) - new Date(a.year));

        return benchmarks[0] || null;
    }

    // ===== INSIGHTS & RECOMMENDATIONS =====

    // Generate team insights
    generateTeamInsights(teamId) {
        const team = this.teamProfiles[teamId];
        if (!team) return null;

        const benchmark = this.getApplicableBenchmark(teamId, 'industry');

        return {
            teamId,
            teamName: team.name,
            generatedDate: new Date().toISOString(),

            strengths: [
                team.currentMetrics.complianceScore > 85 ? 'Excellent compliance adherence' : null,
                team.currentMetrics.communicationQuality > 80 ? 'High communication quality' : null,
                team.currentMetrics.teamEngagement > 75 ? 'Strong team engagement' : null
            ].filter(Boolean),

            areasForImprovement: [
                team.currentMetrics.teamEngagement < 70 ? 'Team engagement below benchmark' : null,
                team.currentMetrics.communicationQuality < 70 ? 'Communication quality needs improvement' : null,
                team.currentMetrics.errorRate > 0.15 ? 'Error rate higher than expected' : null
            ].filter(Boolean),

            recommendations: [
                'Consider cultural sensitivity training for international team',
                'Implement peer review process for critical communications',
                'Schedule monthly team communication workshops',
                'Review and update communication templates'
            ],

            benchmarkComparison: benchmark ? {
                industry: benchmark.industry,
                aboveAverage: team.currentMetrics.communicationQuality > benchmark.metrics.communicationQuality.average,
                percentile: this._calculatePercentile(
                    team.currentMetrics.communicationQuality,
                    'communicationQuality',
                    benchmark
                )
            } : null
        };
    }

    // ===== HELPER FUNCTIONS =====

    _calculatePercentile(value, metric, benchmark = null) {
        if (!benchmark) {
            // Use internal distribution (simplified)
            return Math.min(99, Math.max(1, value / 100 * 100));
        }

        const metricData = benchmark.metrics[metric];
        if (!metricData) return 50;

        const zScore = (value - metricData.average) / metricData.stdDev;
        const percentile = Math.round((1 / (1 + Math.exp(-zScore))) * 100);

        return Math.min(99, Math.max(1, percentile));
    }

    _calculateTrend(team) {
        if (team.historicalPerformance.length < 2) return 'stable';

        const current = team.currentMetrics;
        const previous = team.historicalPerformance[team.historicalPerformance.length - 1].metrics;

        const improvement = Object.keys(current).filter(key => 
            current[key] > previous[key] && typeof current[key] === 'number'
        ).length;

        if (improvement > 2) return 'improving';
        if (improvement > 0) return 'slightly_improving';
        return 'stable';
    }

    _calculateMedian(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }

    _calculateVariance(values) {
        const mean = values.reduce((a, b) => a + b) / values.length;
        const squareDiffs = values.map(v => Math.pow(v - mean, 2));
        return Math.sqrt(squareDiffs.reduce((a, b) => a + b) / values.length);
    }

    _generateComparisonInsights(teams, metric) {
        const insights = [];
        const values = teams.map(t => t.currentMetrics[metric]);
        const average = values.reduce((a, b) => a + b) / values.length;

        const topTeam = teams[0];
        if (topTeam) {
            insights.push(`${topTeam.name} leads with ${topTeam.currentMetrics[metric]} ${metric}`);
        }

        const gap = Math.max(...values) - Math.min(...values);
        if (gap > 15) {
            insights.push(`Large performance gap detected (${gap} points)`);
        }

        const above = teams.filter(t => t.currentMetrics[metric] > average).length;
        insights.push(`${above} of ${teams.length} teams above average (${Math.round(average)})`);

        return insights;
    }

    _getPreviousRank(teamId, metric) {
        // Simplified: would look up previous ranking snapshot
        return null;
    }

    _persist() {
        chrome.storage.local.set({
            teamProfiles: this.teamProfiles,
            benchmarkData: this.benchmarks,
            comparisons: this.comparisons,
            industryData: this.industryData,
            rankings: this.rankings
        });
    }

    // List team profiles
    listTeamProfiles(organizationId) {
        return Object.values(this.teamProfiles)
            .filter(t => t.organizationId === organizationId)
            .sort((a, b) => b.currentMetrics.communicationQuality - a.currentMetrics.communicationQuality);
    }

    // Get team stats
    getTeamStats(organizationId) {
        const teams = Object.values(this.teamProfiles)
            .filter(t => t.organizationId === organizationId);

        return {
            totalTeams: teams.length,
            avgQuality: teams.reduce((sum, t) => sum + t.currentMetrics.communicationQuality, 0) / teams.length || 0,
            avgEngagement: teams.reduce((sum, t) => sum + t.currentMetrics.teamEngagement, 0) / teams.length || 0,
            avgCompliance: teams.reduce((sum, t) => sum + t.currentMetrics.complianceScore, 0) / teams.length || 0,
            topTeam: teams[0]?.name || 'N/A'
        };
    }
}

// Export for use in popup.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TeamBenchmarking;
}
