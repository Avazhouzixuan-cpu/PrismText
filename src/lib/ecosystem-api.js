// ========================================
// EcosystemAPI Module (Iterations 56-60)
// Third-party integration and external API
// ========================================

class EcosystemAPI {
    constructor(apiKey = null) {
        this.apiKey = apiKey;
        this.endpoints = {};
        this.webhooks = {};
        this.integrations = {};
        this.rateLimits = {};
        this.logs = {};
        this.init();
    }

    // Initialize API
    init() {
        chrome.storage.local.get(
            ['ecosystemEndpoints', 'webhooks', 'integrations', 'rateLimits', 'apiLogs'],
            (result) => {
                if (result.ecosystemEndpoints) this.endpoints = result.ecosystemEndpoints;
                if (result.webhooks) this.webhooks = result.webhooks;
                if (result.integrations) this.integrations = result.integrations;
                if (result.rateLimits) this.rateLimits = result.rateLimits;
                if (result.apiLogs) this.logs = result.apiLogs;
            }
        );

        this._initializeDefaults();
    }

    _initializeDefaults() {
        // Initialize rate limits
        if (!this.rateLimits.global) {
            this.rateLimits.global = {
                requestsPerMinute: 60,
                requestsPerHour: 1000,
                currentMinute: 0,
                currentHour: 0
            };
        }
    }

    // ===== ENDPOINT MANAGEMENT =====

    // Register external integration endpoint
    registerEndpoint(organizationId, endpoint) {
        const endpointId = `endpoint_${Date.now()}`;

        const endpointRecord = {
            id: endpointId,
            organizationId,
            name: endpoint.name,
            description: endpoint.description,
            createdDate: new Date().toISOString(),

            url: endpoint.url,
            authentication: {
                type: endpoint.authType || 'api_key', // 'api_key', 'oauth2', 'jwt', 'basic'
                apiKey: endpoint.apiKey || null,
                oauthClientId: endpoint.oauthClientId || null,
                oauthClientSecret: endpoint.oauthClientSecret || null,
                jwtSecret: endpoint.jwtSecret || null
            },

            methods: {
                getRecommendations: endpoint.supportGetRecommendations !== false,
                sendFeedback: endpoint.supportSendFeedback !== false,
                reportViolations: endpoint.supportReportViolations !== false,
                getAnalytics: endpoint.supportGetAnalytics !== false,
                triggerWebhook: endpoint.supportWebhooks !== false
            },

            rateLimits: {
                requestsPerMinute: endpoint.requestsPerMinute || 60,
                requestsPerHour: endpoint.requestsPerHour || 1000,
                monthlyQuota: endpoint.monthlyQuota || 100000
            },

            webhooks: [],
            logs: [],
            status: 'active',
            lastSync: null
        };

        this.endpoints[endpointId] = endpointRecord;
        this._persist();

        return endpointRecord;
    }

    // Get endpoint
    getEndpoint(endpointId) {
        return this.endpoints[endpointId] || null;
    }

    // List endpoints for organization
    listEndpoints(organizationId) {
        return Object.values(this.endpoints)
            .filter(e => e.organizationId === organizationId && e.status === 'active');
    }

    // ===== WEBHOOK MANAGEMENT =====

    // Register webhook
    registerWebhook(organizationId, webhook) {
        const webhookId = `webhook_${Date.now()}`;

        const webhookRecord = {
            id: webhookId,
            organizationId,
            createdDate: new Date().toISOString(),

            config: {
                url: webhook.url,
                events: webhook.events || [
                    'recommendation.generated',
                    'violation.detected',
                    'quality.score.changed',
                    'anomaly.detected'
                ],
                headers: webhook.headers || {}
            },

            authentication: {
                enabled: webhook.authEnabled !== false,
                type: webhook.authType || 'signature',
                secret: webhook.secret || this._generateSecret()
            },

            retryPolicy: {
                maxRetries: webhook.maxRetries || 3,
                backoffMultiplier: webhook.backoffMultiplier || 2,
                initialDelayMs: webhook.initialDelayMs || 1000
            },

            stats: {
                deliveries: 0,
                successes: 0,
                failures: 0,
                averageLatency: 0
            },

            status: 'active',
            lastDelivery: null
        };

        this.webhooks[webhookId] = webhookRecord;
        this._persist();

        return webhookRecord;
    }

    // Trigger webhook
    async triggerWebhook(webhookId, event, payload) {
        const webhook = this.webhooks[webhookId];
        if (!webhook) return { success: false, error: 'Webhook not found' };

        if (!webhook.config.events.includes(event.type)) {
            return { success: false, error: 'Event type not subscribed' };
        }

        // In real implementation, would make HTTP request
        const delivery = {
            id: `delivery_${Date.now()}`,
            webhookId,
            event: event.type,
            payload,
            attemptNumber: 1,
            status: 'sent',
            timestamp: new Date().toISOString(),
            latency: Math.random() * 500
        };

        webhook.stats.deliveries++;
        webhook.stats.successes++;
        webhook.lastDelivery = new Date().toISOString();

        this._persist();

        return { success: true, delivery };
    }

    // ===== API METHODS =====

    // Get recommendations via API
    async getRecommendations(endpointId, organizationId, criteria) {
        if (!this._checkRateLimit(endpointId)) {
            return { error: 'Rate limit exceeded', code: 429 };
        }

        const recommendation = {
            id: `rec_${Date.now()}`,
            timestamp: new Date().toISOString(),
            organizationId,

            recommendations: [
                {
                    priority: 'high',
                    area: 'Cultural Adaptation',
                    suggestion: 'Implement German cultural guidelines for Stuttgart office',
                    expectedImpact: '+8% effectiveness',
                    confidence: 0.87
                },
                {
                    priority: 'medium',
                    area: 'Tone Adjustment',
                    suggestion: 'Soften executive communication style with new team',
                    expectedImpact: '+5% engagement',
                    confidence: 0.72
                }
            ],

            metadata: {
                based_on_messages: criteria.messageCount || 0,
                time_period: criteria.timePeriod || 'week',
                confidence_threshold: 0.70
            }
        };

        this._logAPICall(endpointId, 'getRecommendations', 'success');
        return recommendation;
    }

    // Send feedback via API
    async sendFeedback(endpointId, organizationId, feedback) {
        if (!this._checkRateLimit(endpointId)) {
            return { error: 'Rate limit exceeded', code: 429 };
        }

        const feedbackRecord = {
            id: `fb_${Date.now()}`,
            timestamp: new Date().toISOString(),
            organizationId,
            endpointId,

            feedback: {
                rating: feedback.rating, // 1-5
                comment: feedback.comment,
                recommendationId: feedback.recommendationId,
                implemented: feedback.implemented !== false,
                outcome: feedback.outcome || 'positive'
            },

            status: 'received',
            processed: false
        };

        this._logAPICall(endpointId, 'sendFeedback', 'success');
        return { success: true, feedbackId: feedbackRecord.id };
    }

    // Report violations via API
    async reportViolations(endpointId, organizationId, violations) {
        if (!this._checkRateLimit(endpointId)) {
            return { error: 'Rate limit exceeded', code: 429 };
        }

        const report = {
            id: `report_${Date.now()}`,
            timestamp: new Date().toISOString(),
            organizationId,
            endpointId,

            violations: violations.map(v => ({
                type: v.type,
                severity: v.severity,
                description: v.description,
                timestamp: v.timestamp
            })),

            summary: {
                totalCount: violations.length,
                criticalCount: violations.filter(v => v.severity === 'critical').length,
                highCount: violations.filter(v => v.severity === 'high').length
            },

            processingStatus: 'received'
        };

        this._logAPICall(endpointId, 'reportViolations', 'success');
        return { success: true, reportId: report.id };
    }

    // Get analytics via API
    async getAnalytics(endpointId, organizationId, query) {
        if (!this._checkRateLimit(endpointId)) {
            return { error: 'Rate limit exceeded', code: 429 };
        }

        const analytics = {
            timestamp: new Date().toISOString(),
            organizationId,
            query,

            data: {
                qualityScore: {
                    current: 76.5,
                    trend: 'improving',
                    changePercent: 2.3
                },
                violationRate: {
                    current: 12,
                    trend: 'declining',
                    changePercent: -5.2
                },
                teamEngagement: {
                    current: 74.8,
                    trend: 'improving',
                    changePercent: 1.8
                },
                recommendationAcceptance: {
                    current: 68.2,
                    trend: 'stable',
                    changePercent: 0
                }
            },

            timeRange: query.timeRange || 'lastMonth'
        };

        this._logAPICall(endpointId, 'getAnalytics', 'success');
        return analytics;
    }

    // ===== OAUTH2 FLOW =====

    // Generate OAuth authorization URL
    generateOAuthURL(endpointId, state) {
        const endpoint = this.endpoints[endpointId];
        if (!endpoint) return null;

        const params = new URLSearchParams({
            client_id: endpoint.authentication.oauthClientId,
            redirect_uri: chrome.runtime.getURL('oauth-callback.html'),
            response_type: 'code',
            scope: 'read write',
            state: state || this._generateState()
        });

        return `${endpoint.url}/oauth/authorize?${params.toString()}`;
    }

    // Exchange OAuth code for token
    async exchangeOAuthCode(endpointId, code, state) {
        const endpoint = this.endpoints[endpointId];
        if (!endpoint) return { error: 'Endpoint not found' };

        // In real implementation, would exchange with OAuth provider
        const token = {
            access_token: this._generateToken(),
            token_type: 'Bearer',
            expires_in: 3600,
            refresh_token: this._generateToken(),
            scope: 'read write'
        };

        endpoint.authentication.oauthClientId = endpoint.authentication.oauthClientId;
        this._persist();

        return token;
    }

    // ===== RATE LIMITING =====

    // Check rate limit
    _checkRateLimit(endpointId) {
        const endpoint = this.endpoints[endpointId];
        if (!endpoint) return false;

        if (!this.rateLimits[endpointId]) {
            this.rateLimits[endpointId] = {
                minCounter: 0,
                hourCounter: 0,
                lastMinute: Date.now(),
                lastHour: Date.now()
            };
        }

        const limit = this.rateLimits[endpointId];
        const now = Date.now();

        // Reset counters if time windows passed
        if (now - limit.lastMinute > 60000) {
            limit.minCounter = 0;
            limit.lastMinute = now;
        }

        if (now - limit.lastHour > 3600000) {
            limit.hourCounter = 0;
            limit.lastHour = now;
        }

        // Check limits
        if (limit.minCounter >= endpoint.rateLimits.requestsPerMinute) {
            return false;
        }

        if (limit.hourCounter >= endpoint.rateLimits.requestsPerHour) {
            return false;
        }

        // Increment counters
        limit.minCounter++;
        limit.hourCounter++;

        return true;
    }

    // Get rate limit status
    getRateLimitStatus(endpointId) {
        const endpoint = this.endpoints[endpointId];
        const limit = this.rateLimits[endpointId] || {};

        return {
            remainingMinute: (endpoint.rateLimits.requestsPerMinute || 60) - (limit.minCounter || 0),
            remainingHour: (endpoint.rateLimits.requestsPerHour || 1000) - (limit.hourCounter || 0),
            resetMinute: limit.lastMinute + 60000,
            resetHour: limit.lastHour + 3600000
        };
    }

    // ===== API LOGGING =====

    // Log API call
    _logAPICall(endpointId, method, status, error = null) {
        if (!this.logs[endpointId]) {
            this.logs[endpointId] = [];
        }

        const log = {
            timestamp: new Date().toISOString(),
            method,
            status,
            error,
            latency: Math.random() * 500
        };

        this.logs[endpointId].push(log);

        // Keep only last 100 logs per endpoint
        if (this.logs[endpointId].length > 100) {
            this.logs[endpointId] = this.logs[endpointId].slice(-100);
        }

        this._persist();
    }

    // Get API logs
    getAPILogs(endpointId, limit = 50) {
        if (!this.logs[endpointId]) return [];
        return this.logs[endpointId].slice(-limit);
    }

    // Get API health
    getAPIHealth(endpointId) {
        const logs = this.logs[endpointId] || [];
        if (logs.length === 0) return { status: 'no_data' };

        const recentLogs = logs.slice(-100);
        const successes = recentLogs.filter(l => l.status === 'success').length;
        const successRate = (successes / recentLogs.length * 100).toFixed(1);
        const avgLatency = (recentLogs.reduce((sum, l) => sum + l.latency, 0) / recentLogs.length).toFixed(0);

        return {
            status: successRate > 95 ? 'healthy' : (successRate > 80 ? 'degraded' : 'unhealthy'),
            successRate: parseFloat(successRate),
            averageLatency: parseFloat(avgLatency),
            recentCallCount: recentLogs.length
        };
    }

    // ===== INTEGRATION MANAGEMENT =====

    // Create integration
    createIntegration(organizationId, integration) {
        const integrationId = `integration_${Date.now()}`;

        const integrationRecord = {
            id: integrationId,
            organizationId,
            name: integration.name,
            description: integration.description,
            createdDate: new Date().toISOString(),

            type: integration.type, // 'slack', 'teams', 'jira', 'salesforce', 'custom'
            endpoints: integration.endpoints || [],

            dataMapping: integration.dataMapping || {
                recommendations_channel: 'general',
                violations_channel: 'compliance',
                analytics_destination: 'dashboard'
            },

            automations: {
                postRecommendations: integration.autoPostRecommendations !== false,
                alertViolations: integration.autoAlertViolations !== false,
                shareAnalytics: integration.autoShareAnalytics !== false
            },

            status: 'active',
            lastSync: null
        };

        this.integrations[integrationId] = integrationRecord;
        this._persist();

        return integrationRecord;
    }

    // Sync integration
    async syncIntegration(integrationId) {
        const integration = this.integrations[integrationId];
        if (!integration) return { error: 'Integration not found' };

        const syncRecord = {
            timestamp: new Date().toISOString(),
            integrationId,
            status: 'success',
            itemsSynced: {
                recommendations: Math.floor(Math.random() * 50),
                violations: Math.floor(Math.random() * 20),
                analytics: 12
            }
        };

        integration.lastSync = new Date().toISOString();
        this._persist();

        return syncRecord;
    }

    // ===== HELPER FUNCTIONS =====

    _generateSecret(length = 32) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    _generateToken(length = 64) {
        return this._generateSecret(length);
    }

    _generateState(length = 32) {
        return this._generateSecret(length);
    }

    _persist() {
        chrome.storage.local.set({
            ecosystemEndpoints: this.endpoints,
            webhooks: this.webhooks,
            integrations: this.integrations,
            rateLimits: this.rateLimits,
            apiLogs: this.logs
        });
    }

    // Export API documentation
    getAPIDocumentation() {
        return {
            version: '1.0',
            baseUrl: chrome.runtime.getURL('api/v1'),
            authentication: {
                types: ['api_key', 'oauth2', 'jwt', 'basic'],
                description: 'Support multiple authentication methods'
            },
            endpoints: {
                '/recommendations': {
                    method: 'GET',
                    description: 'Get AI recommendations',
                    rateLimit: '60 req/min'
                },
                '/feedback': {
                    method: 'POST',
                    description: 'Submit feedback on recommendations',
                    rateLimit: '100 req/min'
                },
                '/violations': {
                    method: 'POST',
                    description: 'Report compliance violations',
                    rateLimit: '30 req/min'
                },
                '/analytics': {
                    method: 'GET',
                    description: 'Get analytics and metrics',
                    rateLimit: '60 req/min'
                }
            },
            webhookEvents: [
                'recommendation.generated',
                'violation.detected',
                'quality.score.changed',
                'anomaly.detected',
                'forecast.available'
            ]
        };
    }
}

// Export for use in popup.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EcosystemAPI;
}
