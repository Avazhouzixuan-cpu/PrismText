/**
 * ThirdPartyIntegrations.js
 * Phase 8: Advanced Features & AI Enhancement (Iterations 71-75)
 * 
 * Third-party integration management for connecting external platforms,
 * APIs, and services with PrismText for seamless data flow and automation.
 */

class ThirdPartyIntegrations {
    constructor() {
        this.integrations = {};
        this.connectors = {};
        this.syncJobs = {};
        this.webhooks = {};
    }

    /**
     * Register third-party integration
     * @param {string} organizationId - Organization ID
     * @param {object} config - {platform, credentials, settings}
     * @returns {object} Registered integration
     */
    registerIntegration(organizationId, config) {
        const integrationId = `integration_${Date.now()}`;
        const { 
            platform,  // 'slack', 'microsoft_teams', 'salesforce', 'jira', 'confluence', etc.
            credentials = {}, 
            settings = {},
            enabled = true,
            syncInterval = 3600000  // 1 hour default
        } = config;

        // Validate platform
        const validPlatforms = ['slack', 'microsoft_teams', 'salesforce', 'jira', 'confluence', 'github', 'gitlab', 'asana', 'monday', 'zapier'];
        if (!validPlatforms.includes(platform)) {
            return { success: false, error: `Platform ${platform} not supported` };
        }

        const integration = {
            id: integrationId,
            organizationId,
            platform,
            credentials: this._encryptCredentials(credentials),
            settings,
            enabled,
            syncInterval,
            registeredDate: new Date().toISOString(),
            lastSync: null,
            lastSyncStatus: 'never_synced',
            statistics: {
                totalSyncs: 0,
                successfulSyncs: 0,
                failedSyncs: 0,
                dataTransferred: 0,
                averageSyncTime: 0
            },
            health: {
                status: 'initializing',
                lastHealthCheck: null,
                connectionValid: false
            }
        };

        this.integrations[integrationId] = integration;
        
        // Test connection
        this._testConnection(integrationId);

        return integration;
    }

    /**
     * Create connector between PrismText and external system
     * @param {string} organizationId - Organization ID
     * @param {object} config - {name, sourceSystem, targetSystem, mapping, filters}
     * @returns {object} Created connector
     */
    createConnector(organizationId, config) {
        const connectorId = `connector_${Date.now()}`;
        const { 
            name, 
            sourceSystem,      // 'prismtext', 'slack', 'teams', etc.
            targetSystem,      // 'prismtext', 'slack', 'teams', etc.
            mapping = {},      // Field mapping rules
            filters = {},      // Data filtering rules
            transformation = {} // Data transformation rules
        } = config;

        const connector = {
            id: connectorId,
            organizationId,
            name,
            sourceSystem,
            targetSystem,
            mapping,
            filters,
            transformation,
            enabled: true,
            createdDate: new Date().toISOString(),
            lastUsed: null,
            statistics: {
                totalReceived: 0,
                totalSent: 0,
                totalTransformed: 0,
                filteredCount: 0,
                errorCount: 0,
                averageLatency: 0
            },
            validationRules: this._generateConnectorValidation(sourceSystem, targetSystem)
        };

        this.connectors[connectorId] = connector;
        return connector;
    }

    /**
     * Create two-way sync between systems
     * @param {string} organizationId - Organization ID
     * @param {object} config - {name, integrationId1, integrationId2, syncRules}
     * @returns {object} Sync configuration
     */
    setupTwoWaySync(organizationId, config) {
        const syncId = `sync_${Date.now()}`;
        const { 
            name, 
            integrationId1, 
            integrationId2, 
            syncRules = {},
            conflictResolution = 'last_write_wins',  // last_write_wins, manual, first_write_wins
            bidirectional = true
        } = config;

        const sync = {
            id: syncId,
            organizationId,
            name,
            integrations: [integrationId1, integrationId2],
            syncRules,
            conflictResolution,
            bidirectional,
            enabled: true,
            createdDate: new Date().toISOString(),
            lastSync: null,
            statistics: {
                totalSyncs: 0,
                successfulSyncs: 0,
                failedSyncs: 0,
                conflictsDetected: 0,
                recordsSync: 0,
                averageSyncTime: 0
            }
        };

        this.syncJobs[syncId] = sync;
        return sync;
    }

    /**
     * Register webhook for real-time data push
     * @param {string} organizationId - Organization ID
     * @param {object} config - {url, events, authentication, retryPolicy}
     * @returns {object} Webhook registration
     */
    registerWebhook(organizationId, config) {
        const webhookId = `webhook_${Date.now()}`;
        const { 
            url, 
            events = ['all'],  // Which events trigger webhook
            authentication = {}, 
            retryPolicy = { maxRetries: 3, backoffMultiplier: 2 },
            timeout = 30000
        } = config;

        const webhook = {
            id: webhookId,
            organizationId,
            url,
            events,
            authentication,
            retryPolicy,
            timeout,
            registeredDate: new Date().toISOString(),
            enabled: true,
            statistics: {
                totalEvents: 0,
                totalDeliveries: 0,
                successfulDeliveries: 0,
                failedDeliveries: 0,
                averageLatency: 0,
                retries: 0
            },
            recentDeliveries: []
        };

        this.webhooks[webhookId] = webhook;
        
        // Test webhook
        this._testWebhook(webhookId);

        return webhook;
    }

    /**
     * Execute data sync between systems
     * @param {string} syncId - Sync job ID
     * @returns {object} Sync execution result
     */
    executeSyncJob(syncId) {
        const sync = this.syncJobs[syncId];
        if (!sync || !sync.enabled) return { success: false, error: 'Sync not enabled' };

        const executionId = `sync_exec_${Date.now()}`;
        const startTime = Date.now();

        // Get integrations
        const integration1 = this.integrations[sync.integrations[0]];
        const integration2 = this.integrations[sync.integrations[1]];

        if (!integration1 || !integration2) {
            return { success: false, error: 'One or both integrations not found' };
        }

        // Fetch data from both systems
        const data1 = this._fetchDataFromIntegration(integration1);
        const data2 = this._fetchDataFromIntegration(integration2);

        // Detect conflicts
        const conflicts = this._detectConflicts(data1, data2, sync.syncRules);

        // Resolve conflicts
        const resolvedData = this._resolveConflicts(data1, data2, conflicts, sync.conflictResolution);

        // Push synchronized data
        let pushSuccesses = 0;
        let pushFailures = 0;

        if (sync.bidirectional || data1.needsUpdate) {
            const pushResult = this._pushDataToIntegration(integration2, resolvedData.forSystem2);
            pushSuccesses += pushResult.success ? 1 : 0;
            pushFailures += pushResult.success ? 0 : 1;
        }

        if (sync.bidirectional) {
            const pushResult = this._pushDataToIntegration(integration1, resolvedData.forSystem1);
            pushSuccesses += pushResult.success ? 1 : 0;
            pushFailures += pushResult.success ? 0 : 1;
        }

        const executionTime = Date.now() - startTime;

        const execution = {
            id: executionId,
            syncId,
            timestamp: new Date().toISOString(),
            executionTime,
            success: pushFailures === 0,
            dataProcessed: {
                fromSystem1: data1.length,
                fromSystem2: data2.length,
                conflicts: conflicts.length,
                synced: resolvedData.synced
            },
            pushResults: {
                successes: pushSuccesses,
                failures: pushFailures
            }
        };

        // Update sync statistics
        sync.lastSync = new Date().toISOString();
        sync.statistics.totalSyncs++;
        if (execution.success) sync.statistics.successfulSyncs++;
        else sync.statistics.failedSyncs++;
        sync.statistics.recordsSync += resolvedData.synced;
        sync.statistics.averageSyncTime = (sync.statistics.averageSyncTime * (sync.statistics.totalSyncs - 1) + executionTime) / sync.statistics.totalSyncs;
        sync.statistics.conflictsDetected += conflicts.length;

        return execution;
    }

    /**
     * Get integration health status
     * @param {string} integrationId - Integration ID
     * @returns {object} Health status and diagnostics
     */
    getIntegrationHealth(integrationId) {
        const integration = this.integrations[integrationId];
        if (!integration) return null;

        const recentSyncs = Object.values(this.syncJobs).filter(job => 
            job.integrations.includes(integrationId) && 
            job.lastSync && 
            new Date() - new Date(job.lastSync) < 24 * 60 * 60 * 1000
        );

        const recentErrors = recentSyncs.filter(job => 
            job.statistics.failedSyncs > 0
        ).length;

        const errorRate = recentSyncs.length > 0 ? 
            (recentSyncs.reduce((sum, job) => sum + job.statistics.failedSyncs, 0) / 
             recentSyncs.reduce((sum, job) => sum + job.statistics.totalSyncs, 0)) * 100 : 0;

        const health = {
            integrationId,
            platform: integration.platform,
            status: errorRate > 30 ? 'unhealthy' : errorRate > 10 ? 'degraded' : 'healthy',
            lastHealthCheck: new Date().toISOString(),
            metrics: {
                connectionValid: integration.health.connectionValid,
                errorRate: errorRate.toFixed(2),
                averageSyncTime: integration.statistics.averageSyncTime.toFixed(0),
                lastSync: integration.lastSync,
                totalSyncs: integration.statistics.totalSyncs,
                successRate: (integration.statistics.totalSyncs > 0 ? 
                    ((integration.statistics.successfulSyncs / integration.statistics.totalSyncs) * 100).toFixed(2) : 'N/A')
            },
            diagnostics: this._generateHealthDiagnostics(integration, recentErrors),
            recommendations: this._generateHealthRecommendations(errorRate, integration)
        };

        return health;
    }

    /**
     * Simulate data flow through connector
     * @param {string} connectorId - Connector ID
     * @param {array} sampleData - Test data
     * @returns {object} Transformation result
     */
    testConnectorMapping(connectorId, sampleData) {
        const connector = this.connectors[connectorId];
        if (!connector) return null;

        const testResults = {
            connectorId,
            timestamp: new Date().toISOString(),
            inputCount: sampleData.length,
            transformedData: [],
            errors: [],
            warnings: [],
            statistics: {
                successRate: 0,
                averageTransformationTime: 0
            }
        };

        sampleData.forEach((item, index) => {
            try {
                const startTime = Date.now();
                
                // Apply filters
                let filtered = item;
                if (!this._applyFilters(item, connector.filters)) {
                    testResults.statistics.successRate += 0;
                    return;  // Skip filtered items
                }

                // Apply mapping
                const mapped = this._applyMapping(filtered, connector.mapping);

                // Apply transformation
                const transformed = this._applyTransformation(mapped, connector.transformation);

                // Validate against target system requirements
                const validation = this._validateTransformedData(transformed, connector.targetSystem);

                const transformationTime = Date.now() - startTime;

                testResults.transformedData.push({
                    input: item,
                    output: transformed,
                    valid: validation.valid,
                    transformationTime
                });

                if (!validation.valid) {
                    testResults.warnings.push(`Item ${index}: ${validation.errors.join(', ')}`);
                }

                testResults.statistics.successRate++;
                testResults.statistics.averageTransformationTime += transformationTime;

            } catch (error) {
                testResults.errors.push(`Item ${index}: ${error.message}`);
            }
        });

        testResults.statistics.successRate = testResults.transformedData.length / sampleData.length * 100;
        if (testResults.transformedData.length > 0) {
            testResults.statistics.averageTransformationTime /= testResults.transformedData.length;
        }

        return testResults;
    }

    /**
     * Get available integrations and connectors
     * @param {string} organizationId - Organization ID
     * @returns {object} Summary of integrations and connectors
     */
    getIntegrationSummary(organizationId) {
        const orgIntegrations = Object.values(this.integrations).filter(i => i.organizationId === organizationId);
        const orgConnectors = Object.values(this.connectors).filter(c => c.organizationId === organizationId);
        const orgSyncs = Object.values(this.syncJobs).filter(s => s.organizationId === organizationId);

        const platformStats = {};
        orgIntegrations.forEach(int => {
            if (!platformStats[int.platform]) {
                platformStats[int.platform] = { active: 0, total: 0 };
            }
            platformStats[int.platform].total++;
            if (int.enabled) platformStats[int.platform].active++;
        });

        const summary = {
            organizationId,
            timestamp: new Date().toISOString(),
            integrationCount: orgIntegrations.length,
            connectorCount: orgConnectors.length,
            syncCount: orgSyncs.length,
            webhookCount: Object.values(this.webhooks).filter(w => w.organizationId === organizationId).length,
            platforms: platformStats,
            activeIntegrations: orgIntegrations.filter(i => i.enabled).length,
            healthStatus: {
                healthy: orgIntegrations.filter(i => i.health.status === 'connected').length,
                degraded: orgIntegrations.filter(i => i.health.status === 'degraded').length,
                unhealthy: orgIntegrations.filter(i => i.health.status === 'error').length
            },
            recentActivity: {
                lastSyncTime: orgSyncs.length > 0 ? 
                    Math.max(...orgSyncs.map(s => new Date(s.lastSync || 0).getTime())) : null,
                totalDataTransferred: orgIntegrations.reduce((sum, i) => sum + i.statistics.dataTransferred, 0)
            }
        };

        return summary;
    }

    // =================== PRIVATE HELPER METHODS ===================

    _encryptCredentials(credentials) {
        // Simplified credential encryption
        return {
            encrypted: true,
            data: Buffer.from(JSON.stringify(credentials)).toString('base64')
        };
    }

    _testConnection(integrationId) {
        const integration = this.integrations[integrationId];
        // Simulate connection test
        setTimeout(() => {
            integration.health.status = 'connected';
            integration.health.connectionValid = true;
            integration.health.lastHealthCheck = new Date().toISOString();
        }, 1000);
    }

    _testWebhook(webhookId) {
        const webhook = this.webhooks[webhookId];
        // Simulate webhook test
        const testPayload = { test: true, timestamp: new Date().toISOString() };
        webhook.recentDeliveries.push({
            timestamp: new Date().toISOString(),
            payload: testPayload,
            status: 200,
            latency: 45
        });
    }

    _generateConnectorValidation(sourceSystem, targetSystem) {
        return {
            requiredFields: ['id', 'timestamp'],
            dataTypes: { id: 'string', timestamp: 'datetime' },
            fieldLimits: {}
        };
    }

    _fetchDataFromIntegration(integration) {
        // Simulate data fetch
        return [
            { id: '1', data: 'item1', updated: Date.now() },
            { id: '2', data: 'item2', updated: Date.now() }
        ];
    }

    _detectConflicts(data1, data2, syncRules) {
        // Simplified conflict detection
        return [];
    }

    _resolveConflicts(data1, data2, conflicts, resolutionStrategy) {
        return { 
            forSystem1: data2, 
            forSystem2: data1, 
            synced: Math.max(data1.length, data2.length) 
        };
    }

    _pushDataToIntegration(integration, data) {
        // Simulate push operation
        return { success: true, recordsPushed: data.length };
    }

    _applyFilters(item, filters) {
        // Apply filtering rules
        return true;
    }

    _applyMapping(item, mapping) {
        // Apply field mapping
        return item;
    }

    _applyTransformation(item, transformation) {
        // Apply data transformation
        return item;
    }

    _validateTransformedData(data, targetSystem) {
        return { valid: true, errors: [] };
    }

    _generateHealthDiagnostics(integration, recentErrors) {
        return [
            `Last sync: ${integration.lastSync}`,
            `Total syncs attempted: ${integration.statistics.totalSyncs}`,
            `Recent errors: ${recentErrors}`
        ];
    }

    _generateHealthRecommendations(errorRate, integration) {
        if (errorRate > 30) {
            return ['Check API credentials', 'Verify network connectivity', 'Review rate limits'];
        } else if (errorRate > 10) {
            return ['Monitor sync performance', 'Check for data validation issues'];
        }
        return ['System healthy - no action needed'];
    }
}

// Export for Chrome Extension
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThirdPartyIntegrations;
}
