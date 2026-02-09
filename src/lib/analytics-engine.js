// ========================================
// AnalyticsEngine Module (Iterations 51-55)
// Advanced analytics with trend analysis and anomaly detection
// ========================================

class AnalyticsEngine {
    constructor() {
        this.analyticsData = {}; // { analyticsId: analytics records }
        this.trends = {}; // { trendId: trend data }
        this.anomalies = {}; // { anomalyId: anomaly records }
        this.dashboards = {}; // { dashboardId: dashboard config }
        this.init();
    }

    // Initialize from Chrome Storage
    init() {
        chrome.storage.local.get(
            ['analyticsData', 'trends', 'anomalies', 'dashboards'],
            (result) => {
                if (result.analyticsData) this.analyticsData = result.analyticsData;
                if (result.trends) this.trends = result.trends;
                if (result.anomalies) this.anomalies = result.anomalies;
                if (result.dashboards) this.dashboards = result.dashboards;
            }
        );
    }

    // ===== ANALYTICS TRACKING =====

    // Record analytics event
    recordAnalyticsEvent(organizationId, eventType, eventData) {
        const key = `${organizationId}_${eventType}`;
        
        if (!this.analyticsData[key]) {
            this.analyticsData[key] = {
                organizationId,
                eventType,
                events: [],
                summary: {}
            };
        }

        const event = {
            id: `event_${Date.now()}`,
            timestamp: new Date().toISOString(),
            data: eventData,
            metadata: {
                dayOfWeek: new Date().getDay(),
                hour: new Date().getHours(),
                week: this._getWeekNumber(new Date())
            }
        };

        this.analyticsData[key].events.push(event);

        // Keep only recent 1000 events
        if (this.analyticsData[key].events.length > 1000) {
            this.analyticsData[key].events = this.analyticsData[key].events.slice(-1000);
        }

        this._updateAnalyticsSummary(key);
        this._detectAnomalies(key);
        this._persist();

        return event;
    }

    // Get analytics summary
    getAnalyticsSummary(organizationId, eventType) {
        const key = `${organizationId}_${eventType}`;
        if (!this.analyticsData[key]) {
            return null;
        }

        const data = this.analyticsData[key];
        return {
            organizationId,
            eventType,
            totalEvents: data.events.length,
            summary: data.summary,
            recentTrend: this._calculateTrend(data.events.slice(-50)),
            anomalies: this._getAnomaliesForKey(key)
        };
    }

    // Update analytics summary
    _updateAnalyticsSummary(key) {
        const data = this.analyticsData[key];
        const events = data.events;

        data.summary = {
            totalCount: events.length,
            averageValue: events.reduce((sum, e) => sum + (e.data.value || 0), 0) / events.length,
            maxValue: Math.max(...events.map(e => e.data.value || 0)),
            minValue: Math.min(...events.map(e => e.data.value || 0)),
            stdDev: this._calculateStdDev(events.map(e => e.data.value || 0)),
            dayOfWeekPattern: this._analyzeDayPattern(events),
            hourPattern: this._analyzeHourPattern(events),
            weekTrend: this._analyzeWeekTrend(events)
        };
    }

    // ===== TREND ANALYSIS =====

    // Analyze trends over time periods
    analyzeTrend(organizationId, eventType, timeWindow = 'week') {
        const key = `${organizationId}_${eventType}`;
        if (!this.analyticsData[key]) {
            return null;
        }

        const events = this.analyticsData[key].events;
        const now = new Date();
        const windowMs = this._getTimeWindowMs(timeWindow);
        const cutoff = new Date(now.getTime() - windowMs);

        const recentEvents = events.filter(e => new Date(e.timestamp) > cutoff);

        const trend = {
            organizationId,
            eventType,
            timeWindow,
            period: { start: cutoff.toISOString(), end: now.toISOString() },
            
            metrics: {
                count: recentEvents.length,
                average: recentEvents.length > 0 
                    ? recentEvents.reduce((sum, e) => sum + (e.data.value || 0), 0) / recentEvents.length
                    : 0,
                trend: this._calculateTrend(recentEvents),
                volatility: this._calculateVolatility(recentEvents),
                growthRate: this._calculateGrowthRate(recentEvents, windowMs)
            },

            breakdown: {
                byDayOfWeek: this._groupByDayOfWeek(recentEvents),
                byHour: this._groupByHour(recentEvents),
                byWeek: this._groupByWeek(recentEvents)
            },

            predictions: this._predictNextPeriod(recentEvents, timeWindow)
        };

        const trendId = `trend_${Date.now()}`;
        this.trends[trendId] = trend;
        this._persist();

        return trend;
    }

    // Get trend forecast
    predictTrend(organizationId, eventType, periods = 4) {
        const key = `${organizationId}_${eventType}`;
        if (!this.analyticsData[key]) {
            return null;
        }

        const events = this.analyticsData[key].events;
        if (events.length < 10) {
            return { status: 'insufficient_data', message: 'Need more data points' };
        }

        const values = events.map(e => e.data.value || 0);
        const forecast = [];

        // Simple exponential smoothing
        let smoothed = values[0];
        const alpha = 0.3; // Smoothing factor

        for (let i = 0; i < periods; i++) {
            forecast.push({
                period: i + 1,
                predictedValue: Math.round(smoothed),
                confidence: Math.max(60, 95 - (i * 10)) // Declining confidence
            });

            smoothed = alpha * values[values.length - 1] + (1 - alpha) * smoothed;
        }

        return {
            organizationId,
            eventType,
            lastKnownValue: values[values.length - 1],
            forecast: forecast,
            trend: values[values.length - 1] > values[Math.max(0, values.length - 10)]
                ? 'upward' : 'downward',
            confidence: 'moderate'
        };
    }

    // ===== ANOMALY DETECTION =====

    // Detect anomalies
    _detectAnomalies(key) {
        const data = this.analyticsData[key];
        const events = data.events.slice(-50); // Last 50 events

        if (events.length < 10) return;

        const values = events.map(e => e.data.value || 0);
        const mean = values.reduce((a, b) => a + b) / values.length;
        const stdDev = this._calculateStdDev(values);

        events.forEach((event, idx) => {
            const value = event.data.value || 0;
            const zScore = Math.abs((value - mean) / (stdDev || 1));

            if (zScore > 2.5) { // More than 2.5 standard deviations
                const anomalies = this.anomalies[key] || [];
                anomalies.push({
                    id: `anomaly_${Date.now()}`,
                    timestamp: event.timestamp,
                    value: value,
                    zScore: zScore.toFixed(2),
                    type: value > mean ? 'spike' : 'dip',
                    severity: zScore > 3.5 ? 'critical' : 'warning'
                });

                this.anomalies[key] = anomalies.slice(-100); // Keep last 100 anomalies
            }
        });
    }

    // Get anomalies
    getAnomalies(organizationId, eventType, severity = null) {
        const key = `${organizationId}_${eventType}`;
        const anomalies = this.anomalies[key] || [];

        if (severity) {
            return anomalies.filter(a => a.severity === severity);
        }

        return anomalies;
    }

    // ===== DASHBOARD CREATION =====

    // Create custom dashboard
    createDashboard(organizationId, name, metrics = []) {
        const dashboardId = `dashboard_${Date.now()}`;

        this.dashboards[dashboardId] = {
            id: dashboardId,
            organizationId,
            name,
            createdDate: new Date().toISOString(),
            metrics: metrics.map(m => ({
                id: m.id,
                eventType: m.eventType,
                visualization: m.visualization || 'line_chart',
                timeWindow: m.timeWindow || 'week',
                compareWith: m.compareWith || null
            })),
            refreshRate: 'real_time',
            isActive: true
        };

        this._persist();
        return this.dashboards[dashboardId];
    }

    // Get dashboard data
    getDashboardData(dashboardId) {
        const dashboard = this.dashboards[dashboardId];
        if (!dashboard) return null;

        return {
            dashboard,
            metrics: dashboard.metrics.map(m => ({
                ...m,
                data: this.getAnalyticsSummary(dashboard.organizationId, m.eventType),
                trend: this.analyzeTrend(dashboard.organizationId, m.eventType, m.timeWindow)
            }))
        };
    }

    // ===== COMPARISON ANALYTICS =====

    // Compare metrics across time periods
    compareMetrics(organizationId, eventType, period1Start, period1End, period2Start, period2End) {
        const key = `${organizationId}_${eventType}`;
        if (!this.analyticsData[key]) return null;

        const getMetricsForPeriod = (start, end) => {
            const events = this.analyticsData[key].events.filter(e => {
                const date = new Date(e.timestamp);
                return date >= start && date <= end;
            });

            return {
                count: events.length,
                average: events.length > 0 
                    ? events.reduce((sum, e) => sum + (e.data.value || 0), 0) / events.length
                    : 0,
                max: events.length > 0 ? Math.max(...events.map(e => e.data.value || 0)) : 0,
                min: events.length > 0 ? Math.min(...events.map(e => e.data.value || 0)) : 0
            };
        };

        const period1 = getMetricsForPeriod(period1Start, period1End);
        const period2 = getMetricsForPeriod(period2Start, period2End);

        return {
            eventType,
            period1: { start: period1Start, end: period1End, metrics: period1 },
            period2: { start: period2Start, end: period2End, metrics: period2 },
            comparison: {
                countChange: ((period2.count - period1.count) / Math.max(1, period1.count) * 100).toFixed(1),
                averageChange: ((period2.average - period1.average) / Math.max(0.1, period1.average) * 100).toFixed(1),
                improvement: period2.average > period1.average ? 'positive' : 'negative'
            }
        };
    }

    // ===== HELPER FUNCTIONS =====

    _getTimeWindowMs(timeWindow) {
        const windows = {
            'day': 24 * 60 * 60 * 1000,
            'week': 7 * 24 * 60 * 60 * 1000,
            'month': 30 * 24 * 60 * 60 * 1000,
            'quarter': 90 * 24 * 60 * 60 * 1000,
            'year': 365 * 24 * 60 * 60 * 1000
        };
        return windows[timeWindow] || windows['week'];
    }

    _calculateTrend(values) {
        if (values.length < 2) return 'stable';
        
        const recent = values.slice(-10);
        const older = values.slice(Math.max(0, values.length - 20), -10);

        if (older.length === 0) return 'stable';

        const recentAvg = recent.reduce((a, b) => a + b.data?.value || 0, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b.data?.value || 0, 0) / older.length;

        if (recentAvg > olderAvg + 5) return 'improving';
        if (recentAvg < olderAvg - 5) return 'declining';
        return 'stable';
    }

    _calculateStdDev(values) {
        if (values.length === 0) return 0;
        const avg = values.reduce((a, b) => a + b) / values.length;
        const squareDiffs = values.map(v => Math.pow(v - avg, 2));
        return Math.sqrt(squareDiffs.reduce((a, b) => a + b) / values.length);
    }

    _calculateVolatility(events) {
        const values = events.map(e => e.data.value || 0);
        return this._calculateStdDev(values);
    }

    _calculateGrowthRate(events, timeWindowMs) {
        if (events.length < 2) return 0;
        const first = events[0].data.value || 0;
        const last = events[events.length - 1].data.value || 0;
        return ((last - first) / Math.max(1, first) * 100).toFixed(1);
    }

    _analyzeDayPattern(events) {
        const pattern = {};
        events.forEach(e => {
            const day = e.metadata.dayOfWeek;
            pattern[day] = (pattern[day] || 0) + 1;
        });
        return pattern;
    }

    _analyzeHourPattern(events) {
        const pattern = {};
        events.forEach(e => {
            const hour = e.metadata.hour;
            pattern[hour] = (pattern[hour] || 0) + 1;
        });
        return pattern;
    }

    _analyzeWeekTrend(events) {
        const pattern = {};
        events.forEach(e => {
            const week = e.metadata.week;
            pattern[week] = (pattern[week] || 0) + 1;
        });
        return pattern;
    }

    _groupByDayOfWeek(events) {
        const grouped = {};
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        events.forEach(e => {
            const day = days[e.metadata.dayOfWeek];
            grouped[day] = (grouped[day] || 0) + 1;
        });

        return grouped;
    }

    _groupByHour(events) {
        const grouped = {};
        events.forEach(e => {
            const hour = e.metadata.hour;
            grouped[`${hour}:00`] = (grouped[`${hour}:00`] || 0) + 1;
        });
        return grouped;
    }

    _groupByWeek(events) {
        const grouped = {};
        events.forEach(e => {
            const week = `W${e.metadata.week}`;
            grouped[week] = (grouped[week] || 0) + 1;
        });
        return grouped;
    }

    _predictNextPeriod(events, timeWindow) {
        if (events.length < 5) return null;

        const values = events.map(e => e.data.value || 0);
        const lastValue = values[values.length - 1];
        const avgChange = (lastValue - values[0]) / values.length;

        return {
            predictedValue: Math.round(lastValue + avgChange),
            direction: avgChange > 0 ? 'increase' : 'decrease',
            confidence: 'low' // Limited data
        };
    }

    _getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    _getAnomaliesForKey(key) {
        return (this.anomalies[key] || []).slice(-5); // Last 5 anomalies
    }

    // Persist to Chrome Storage
    _persist() {
        chrome.storage.local.set({
            analyticsData: this.analyticsData,
            trends: this.trends,
            anomalies: this.anomalies,
            dashboards: this.dashboards
        });
    }

    // Export analytics
    exportAnalytics(organizationId, eventType) {
        return {
            summary: this.getAnalyticsSummary(organizationId, eventType),
            trend: this.analyzeTrend(organizationId, eventType),
            forecast: this.predictTrend(organizationId, eventType),
            anomalies: this.getAnomalies(organizationId, eventType),
            exportDate: new Date().toISOString()
        };
    }
}

// Export for use in popup.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsEngine;
}
