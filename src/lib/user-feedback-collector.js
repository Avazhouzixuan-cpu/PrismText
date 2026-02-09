// ========================================
// UserFeedbackCollector Module (Iterations 31-35)
// Collects user ratings and feedback to improve system
// ========================================

class UserFeedbackCollector {
    constructor() {
        this.feedbackHistory = [];
        this.feedbackRatings = {
            thumbsUp: 0,
            thumbsDown: 0,
            neutral: 0
        };
        this.versionPreferences = {}; // Track which versions users prefer
        this.aspectFeedback = {}; // Feedback specific to aspects (product, support, etc.)
        this.init();
    }

    // Initialize by loading feedback from Chrome Storage
    init() {
        chrome.storage.local.get(['feedbackHistory', 'feedbackRatings', 'versionPreferences', 'aspectFeedback'], (result) => {
            if (result.feedbackHistory) {
                this.feedbackHistory = result.feedbackHistory;
            }
            if (result.feedbackRatings) {
                this.feedbackRatings = result.feedbackRatings;
            }
            if (result.versionPreferences) {
                this.versionPreferences = result.versionPreferences;
            }
            if (result.aspectFeedback) {
                this.aspectFeedback = result.aspectFeedback;
            }
        });
    }

    // Record thumbs up/down feedback
    recordFeedback(versionIndex, rating, context = {}) {
        const feedback = {
            versionIndex,
            rating, // 'up', 'down', 'neutral'
            timestamp: new Date().toISOString(),
            culture: context.culture || 'unknown',
            intent: context.intent || 'unknown',
            textLength: context.textLength || 0,
            parameters: context.parameters || {},
            comment: context.comment || '',
            selectedText: context.selectedText || '', // The message text that was analyzed
            resultText: context.resultText || '', // The version that was chosen
            language: context.language || 'unknown'
        };

        // Add to history
        this.feedbackHistory.push(feedback);

        // Keep only last 500 feedback items
        if (this.feedbackHistory.length > 500) {
            this.feedbackHistory = this.feedbackHistory.slice(-500);
        }

        // Update ratings
        if (rating === 'up') {
            this.feedingRatings.thumbsUp++;
        } else if (rating === 'down') {
            this.feedingRatings.thumbsDown++;
        } else {
            this.feedingRatings.neutral++;
        }

        // Track version preference
        if (!this.versionPreferences[versionIndex]) {
            this.versionPreferences[versionIndex] = { up: 0, down: 0, total: 0 };
        }
        if (rating === 'up') {
            this.versionPreferences[versionIndex].up++;
        } else if (rating === 'down') {
            this.versionPreferences[versionIndex].down++;
        }
        this.versionPreferences[versionIndex].total++;

        // Persist to Chrome Storage
        this.persistFeedback();

        return feedback;
    }

    // Record aspect-specific feedback
    recordAspectFeedback(aspect, sentiment, accuracy, context = {}) {
        const aspectFeedbackItem = {
            aspect, // 'product', 'support', 'price', etc.
            sentiment, // 'positive', 'negative', 'neutral'
            accuracy, // 0-100: how accurate was the detection?
            correct: accuracy >= 70, // Boolean: was system correct?
            timestamp: new Date().toISOString(),
            culture: context.culture || 'unknown',
            comment: context.comment || '',
            correctedSentiment: context.correctedSentiment || null // If user corrected it
        };

        // Track aspect accuracy
        if (!this.aspectFeedback[aspect]) {
            this.aspectFeedback[aspect] = {
                correct: 0,
                incorrect: 0,
                totalFeedback: 0,
                accuracyHistory: []
            };
        }

        if (accuracy >= 70) {
            this.aspectFeedback[aspect].correct++;
        } else {
            this.aspectFeedback[aspect].incorrect++;
        }
        this.aspectFeedback[aspect].totalFeedback++;
        this.aspectFeedback[aspect].accuracyHistory.push(accuracy);

        // Keep only last 100 accuracy samples per aspect
        if (this.aspectFeedback[aspect].accuracyHistory.length > 100) {
            this.aspectFeedback[aspect].accuracyHistory = 
                this.aspectFeedback[aspect].accuracyHistory.slice(-100);
        }

        this.persistFeedback();

        return aspectFeedbackItem;
    }

    // Get feedback statistics
    getStatistics() {
        const total = this.feedbackRatings.thumbsUp + this.feedbackRatings.thumbsDown + this.feedbackRatings.neutral;
        const positiveRate = total > 0 ? (this.feedbackRatings.thumbsUp / total * 100).toFixed(2) : 0;

        return {
            totalFeedback: total,
            ratings: this.feedbackRatings,
            positiveRate: parseFloat(positiveRate),
            versionStats: this.getVersionStats(),
            aspectStats: this.getAspectStats(),
            recentTrend: this.calculateRecentTrend(20) // Last 20 feedbacks
        };
    }

    // Get version-specific statistics
    getVersionStats() {
        const stats = {};
        for (let versionIdx in this.versionPreferences) {
            const pref = this.versionPreferences[versionIdx];
            const total = pref.up + pref.down;
            stats[versionIdx] = {
                thumbsUp: pref.up,
                thumbsDown: pref.down,
                total: total,
                successRate: total > 0 ? (pref.up / total * 100).toFixed(2) : 0,
                recommendation: pref.up > pref.down ? '✅ Preferred' : '⚠️ Review'
            };
        }
        return stats;
    }

    // Get aspect accuracy statistics
    getAspectStats() {
        const stats = {};
        for (let aspect in this.aspectFeedback) {
            const data = this.aspectFeedback[aspect];
            const total = data.correct + data.incorrect;
            const avgAccuracy = data.accuracyHistory.length > 0 
                ? (data.accuracyHistory.reduce((a, b) => a + b, 0) / data.accuracyHistory.length).toFixed(2)
                : 0;

            stats[aspect] = {
                correct: data.correct,
                incorrect: data.incorrect,
                total: total,
                accuracy: parseFloat(avgAccuracy),
                hitRate: total > 0 ? (data.correct / total * 100).toFixed(2) : 0
            };
        }
        return stats;
    }

    // Calculate trend from recent feedbacks
    calculateRecentTrend(count = 20) {
        const recent = this.feedbackHistory.slice(-count);
        if (recent.length === 0) return { trend: 'insufficient_data', direction: '📊' };

        const positives = recent.filter(f => f.rating === 'up').length;
        const negatives = recent.filter(f => f.rating === 'down').length;
        const positiveRate = (positives / recent.length * 100).toFixed(2);

        let trend = 'stable';
        let direction = '➡️';
        
        if (positiveRate >= 70) {
            trend = 'improving';
            direction = '📈';
        } else if (positiveRate <= 30) {
            trend = 'declining';
            direction = '📉';
        }

        return {
            trend,
            direction,
            positiveRate: parseFloat(positiveRate),
            recentCount: recent.length
        };
    }

    // Find patterns in feedback (which intents, cultures, parameters get positive feedback?)
    findSuccessPatterns() {
        const patterns = {
            byIntent: {},
            byCulture: {},
            byParameter: {},
            byLanguage: {}
        };

        const positiveFeedbacks = this.feedbackHistory.filter(f => f.rating === 'up');

        positiveFeedbacks.forEach(feedback => {
            // By intent
            if (!patterns.byIntent[feedback.intent]) {
                patterns.byIntent[feedback.intent] = { count: 0, samples: [] };
            }
            patterns.byIntent[feedback.intent].count++;
            if (patterns.byIntent[feedback.intent].samples.length < 3) {
                patterns.byIntent[feedback.intent].samples.push(feedback);
            }

            // By culture
            if (!patterns.byCulture[feedback.culture]) {
                patterns.byCulture[feedback.culture] = { count: 0, samples: [] };
            }
            patterns.byCulture[feedback.culture].count++;
            if (patterns.byCulture[feedback.culture].samples.length < 3) {
                patterns.byCulture[feedback.culture].samples.push(feedback);
            }

            // By language
            if (!patterns.byLanguage[feedback.language]) {
                patterns.byLanguage[feedback.language] = { count: 0, samples: [] };
            }
            patterns.byLanguage[feedback.language].count++;
            if (patterns.byLanguage[feedback.language].samples.length < 3) {
                patterns.byLanguage[feedback.language].samples.push(feedback);
            }
        });

        return patterns;
    }

    // Get recommendation for system improvement based on feedback
    getImprovementRecommendations() {
        const stats = this.getStatistics();
        const recommendations = [];

        // Check aspect accuracy
        for (let aspect in this.aspectFeedback) {
            const data = this.aspectFeedback[aspect];
            const accuracy = data.correct + data.incorrect;
            const hitRate = accuracy > 0 ? (data.correct / accuracy * 100) : 0;

            if (hitRate < 75 && accuracy > 10) {
                recommendations.push({
                    priority: 'HIGH',
                    area: `Aspect: ${aspect}`,
                    current: `${hitRate.toFixed(2)}% accuracy`,
                    suggestion: `Review ${aspect} detection patterns (${data.incorrect} recent errors)`,
                    impact: 'Improve recommendation accuracy'
                });
            }
        }

        // Check version performance
        const versionStats = stats.versionStats;
        for (let versionIdx in versionStats) {
            const vStats = versionStats[versionIdx];
            const successRate = parseFloat(vStats.successRate);

            if (successRate < 60 && vStats.total > 5) {
                recommendations.push({
                    priority: 'MEDIUM',
                    area: `Version ${versionIdx} (${this.getVersionName(versionIdx)})`,
                    current: `${successRate.toFixed(2)}% success rate`,
                    suggestion: `Review version ${versionIdx} calibration`,
                    impact: 'Improve version quality'
                });
            }
        }

        // Check overall trend
        if (stats.positiveRate < 60) {
            recommendations.push({
                priority: 'HIGH',
                area: 'Overall System Performance',
                current: `${stats.positiveRate.toFixed(2)}% positive feedback`,
                suggestion: 'Conduct comprehensive analysis of low-performing cultures/intents',
                impact: 'System-wide accuracy improvement'
            });
        }

        return recommendations.sort((a, b) => {
            const priorityMap = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 };
            return priorityMap[a.priority] - priorityMap[b.priority];
        });
    }

    // Helper: get version name
    getVersionName(index) {
        const versionNames = ['Professional', 'Casual', 'Diplomatic', 'Direct', 'Warm'];
        return versionNames[index] || `Version ${index}`;
    }

    // Get feedback for a specific analysis (for comparison)
    getFeedbackForAnalysis(analysisId) {
        return this.feedbackHistory.filter(f => f.analysisId === analysisId);
    }

    // Clear old feedback (auto-maintenance)
    clearOldFeedback(daysOld = 90) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const originalLength = this.feedbackHistory.length;
        this.feedbackHistory = this.feedbackHistory.filter(f => {
            return new Date(f.timestamp) > cutoffDate;
        });

        if (this.feedbackHistory.length < originalLength) {
            this.persistFeedback();
            return originalLength - this.feedbackHistory.length;
        }
        return 0;
    }

    // Persist feedback to Chrome Storage
    persistFeedback() {
        chrome.storage.local.set({
            feedbackHistory: this.feedbackHistory,
            feedbackRatings: this.feedbackRatings,
            versionPreferences: this.versionPreferences,
            aspectFeedback: this.aspectFeedback,
            lastUpdated: new Date().toISOString()
        });
    }

    // Export feedback data (for analysis, backup)
    exportFeedbackData() {
        return {
            feedbackHistory: this.feedbackHistory,
            statistics: this.getStatistics(),
            patterns: this.findSuccessPatterns(),
            recommendations: this.getImprovementRecommendations(),
            exportDate: new Date().toISOString()
        };
    }

    // Get feedback summary for display
    getFeedbackSummary() {
        const stats = this.getStatistics();
        const recentTrend = stats.recentTrend;

        return {
            totalFeedback: stats.totalFeedback,
            positiveRate: `${stats.positiveRate}%`,
            trend: `${recentTrend.direction} ${recentTrend.trend}`,
            trendDetails: recentTrend,
            topPerformingVersion: this.getTopPerformingVersion(),
            needsAttention: this.getVersionsNeedingAttention(),
            improvementAreas: this.getImprovementRecommendations().slice(0, 3)
        };
    }

    // Find best performing version
    getTopPerformingVersion() {
        const stats = this.getVersionStats();
        let topVersion = null;
        let topRate = -1;

        for (let idx in stats) {
            const rate = parseFloat(stats[idx].successRate);
            if (rate > topRate && stats[idx].total > 0) {
                topRate = rate;
                topVersion = {
                    index: idx,
                    name: this.getVersionName(idx),
                    rate: rate.toFixed(2),
                    samples: stats[idx].total
                };
            }
        }

        return topVersion;
    }

    // Find versions that need attention (low scores)
    getVersionsNeedingAttention() {
        const stats = this.getVersionStats();
        const needingAttention = [];

        for (let idx in stats) {
            const rate = parseFloat(stats[idx].successRate);
            if (rate < 50 && stats[idx].total > 5) {
                needingAttention.push({
                    index: idx,
                    name: this.getVersionName(idx),
                    rate: rate.toFixed(2),
                    samples: stats[idx].total
                });
            }
        }

        return needingAttention.sort((a, b) => parseFloat(a.rate) - parseFloat(b.rate));
    }
}

// Export for use in popup.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserFeedbackCollector;
}
