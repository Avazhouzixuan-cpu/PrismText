// ========================================
// AlertingSystem Module (Iterations 61-70)
// Real-time alerts and escalation management
// ========================================

class AlertingSystem {
    constructor() {
        this.alerts = {}; // { alertId: alert data }
        this.triggers = {}; // { triggerId: alert trigger configs }
        this.policies = {}; // { policyId: escalation policy }
        this.notifications = {}; // { notificationId: sent notification }
        this.history = {}; // { historyId: alert history }
        this.init();
    }

    // Initialize from Chrome Storage
    init() {
        chrome.storage.local.get(
            ['systemAlerts', 'alertTriggers', 'alertPolicies', 'notifications', 'alertHistory'],
            (result) => {
                if (result.systemAlerts) this.alerts = result.systemAlerts;
                if (result.alertTriggers) this.triggers = result.alertTriggers;
                if (result.alertPolicies) this.policies = result.alertPolicies;
                if (result.notifications) this.notifications = result.notifications;
                if (result.alertHistory) this.history = result.alertHistory;
            }
        );
    }

    // ===== ALERT CREATION =====

    // Create alert
    createAlert(organizationId, alertConfig) {
        const alertId = `alert_${Date.now()}`;

        const alert = {
            id: alertId,
            organizationId,
            title: alertConfig.title,
            description: alertConfig.description,
            createdDate: new Date().toISOString(),

            severity: alertConfig.severity, // 'critical', 'high', 'medium', 'low'
            category: alertConfig.category, // 'compliance', 'quality', 'performance', 'security'
            source: alertConfig.source,

            status: 'active', // 'active', 'acknowledged', 'resolved', 'ignored'
            
            condition: {
                metric: alertConfig.metric,
                operator: alertConfig.operator, // '>', '<', '==', '!='
                threshold: alertConfig.threshold,
                duration: alertConfig.duration || 5 // minutes
            },

            affected: {
                teams: alertConfig.teams || [],
                departments: alertConfig.departments || [],
                users: alertConfig.users || []
            },

            escalation: {
                level: 1,
                attempts: 0,
                maxAttempts: 3,
                nextEscalationTime: null
            },

            actions: {
                suggested: this._generateSuggestedActions(alertConfig.category),
                taken: []
            }
        };

        this.alerts[alertId] = alert;
        this._addToHistory(alertId, 'created', 'Alert created');
        this._persist();

        return alert;
    }

    // ===== TRIGGER MANAGEMENT =====

    // Create alert trigger
    createTrigger(organizationId, config) {
        const triggerId = `trigger_${Date.now()}`;

        const trigger = {
            id: triggerId,
            organizationId,
            name: config.name,
            description: config.description,
            createdDate: new Date().toISOString(),

            condition: {
                metric: config.metric,
                operator: config.operator, // '>', '<', '==', '!='
                threshold: config.threshold,
                evaluationWindow: config.evaluationWindow || 300 // seconds
            },

            alert: {
                title: config.alertTitle,
                description: config.alertDescription,
                severity: config.severity,
                category: config.category
            },

            actions: {
                createAlert: config.createAlert !== false,
                notifyUsers: config.notifyUsers !== false,
                webhookUrl: config.webhookUrl || null,
                runScript: config.scriptId || null
            },

            schedule: {
                enabled: config.enabled !== false,
                timezone: config.timezone || 'UTC',
                quietHours: config.quietHours || []
            },

            statistics: {
                triggered: 0,
                lastTriggered: null,
                alertsGenerated: 0
            }
        };

        this.triggers[triggerId] = trigger;
        this._persist();

        return trigger;
    }

    // Evaluate trigger
    evaluateTrigger(triggerId, currentValue) {
        const trigger = this.triggers[triggerId];
        if (!trigger) return false;

        let conditionMet = false;

        switch (trigger.condition.operator) {
            case '>':
                conditionMet = currentValue > trigger.condition.threshold;
                break;
            case '<':
                conditionMet = currentValue < trigger.condition.threshold;
                break;
            case '==':
                conditionMet = currentValue === trigger.condition.threshold;
                break;
            case '!=':
                conditionMet = currentValue !== trigger.condition.threshold;
                break;
        }

        if (conditionMet) {
            trigger.statistics.triggered++;
            trigger.statistics.lastTriggered = new Date().toISOString();

            if (trigger.actions.createAlert) {
                const alert = this.createAlert(trigger.organizationId, {
                    title: trigger.alert.title,
                    description: trigger.alert.description,
                    severity: trigger.alert.severity,
                    category: trigger.alert.category,
                    source: `trigger:${triggerId}`,
                    metric: trigger.condition.metric,
                    threshold: trigger.condition.threshold
                });

                trigger.statistics.alertsGenerated++;

                if (trigger.actions.notifyUsers) {
                    this.notifyUsers(alert.id, trigger.organizationId);
                }
            }
        }

        this._persist();
        return conditionMet;
    }

    // ===== ESCALATION POLICIES =====

    // Create escalation policy
    createEscalationPolicy(organizationId, config) {
        const policyId = `policy_${Date.now()}`;

        const policy = {
            id: policyId,
            organizationId,
            name: config.name,
            description: config.description,
            createdDate: new Date().toISOString(),

            levels: [
                {
                    level: 1,
                    waitTime: config.level1Wait || 5, // minutes
                    notifyGroups: config.level1Groups || ['on_call'],
                    action: 'notify'
                },
                {
                    level: 2,
                    waitTime: config.level2Wait || 10,
                    notifyGroups: config.level2Groups || ['managers'],
                    action: 'notify_escalate'
                },
                {
                    level: 3,
                    waitTime: config.level3Wait || 15,
                    notifyGroups: config.level3Groups || ['executives'],
                    action: 'notify_escalate_block'
                }
            ],

            conditions: {
                appliesTo: {
                    severities: config.severities || ['critical', 'high'],
                    categories: config.categories || ['security', 'compliance']
                }
            },

            suppressDuplicates: config.suppressDuplicates !== false,
            suppressWindow: config.suppressWindow || 300 // seconds
        };

        this.policies[policyId] = policy;
        this._persist();

        return policy;
    }

    // Apply escalation policy
    applyEscalationPolicy(alertId, policyId) {
        const alert = this.alerts[alertId];
        const policy = this.policies[policyId];

        if (!alert || !policy) return false;

        const applies = policy.conditions.appliesTo.severities.includes(alert.severity) &&
                       policy.conditions.appliesTo.categories.includes(alert.category);

        if (!applies) return false;

        alert.escalation.policy = policyId;

        // Schedule first escalation
        const firstLevel = policy.levels[0];
        alert.escalation.nextEscalationTime = new Date(Date.now() + firstLevel.waitTime * 60 * 1000);

        this._persist();
        return true;
    }

    // Process escalation
    processEscalation(alertId) {
        const alert = this.alerts[alertId];
        if (!alert || !alert.escalation.policy) return false;

        const policy = this.policies[alert.escalation.policy];
        if (!policy) return false;

        const currentLevel = Math.min(alert.escalation.level, policy.levels.length - 1);
        const nextLevel = currentLevel + 1;

        if (nextLevel >= policy.levels.length) {
            return false; // Already at max escalation
        }

        const level = policy.levels[nextLevel];
        alert.escalation.level = nextLevel;
        alert.escalation.attempts++;
        alert.escalation.nextEscalationTime = new Date(Date.now() + level.waitTime * 60 * 1000);

        // Send notifications to escalation groups
        this._notifyGroups(alertId, level.notifyGroups);

        this._addToHistory(alertId, 'escalated', `Escalated to level ${nextLevel}`);
        this._persist();

        return true;
    }

    // ===== NOTIFICATIONS =====

    // Notify users
    notifyUsers(alertId, organizationId) {
        const alert = this.alerts[alertId];
        if (!alert) return false;

        const notificationId = `notif_${Date.now()}`;

        const notification = {
            id: notificationId,
            alertId,
            organizationId,
            timestamp: new Date().toISOString(),
            
            recipients: {
                email: alert.affected.users.map(u => `${u}@company.com`),
                inApp: alert.affected.users,
                slack: alert.affected.users
            },

            message: {
                title: alert.title,
                body: alert.description,
                severity: alert.severity,
                actionUrl: `/alerts/${alertId}`
            },

            delivery: {
                email: { sent: false, timestamp: null },
                inApp: { sent: true, timestamp: new Date().toISOString() },
                slack: { sent: false, timestamp: null }
            },

            status: 'sent'
        };

        this.notifications[notificationId] = notification;
        this._addToHistory(alertId, 'notified', `Users notified: ${alert.affected.users.join(', ')}`);
        this._persist();

        return notification;
    }

    // Get notifications for user
    getNotificationsForUser(userId, unreadOnly = true) {
        return Object.values(this.notifications)
            .filter(n => n.recipients.inApp.includes(userId))
            .filter(n => !unreadOnly || n.status === 'sent')
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // Mark notification as read
    markNotificationAsRead(notificationId) {
        const notification = this.notifications[notificationId];
        if (!notification) return false;

        notification.status = 'read';
        this._persist();
        return true;
    }

    // ===== ALERT MANAGEMENT =====

    // Acknowledge alert
    acknowledgeAlert(alertId, userId) {
        const alert = this.alerts[alertId];
        if (!alert) return false;

        alert.status = 'acknowledged';
        alert.acknowledgedBy = userId;
        alert.acknowledgedDate = new Date().toISOString();

        this._addToHistory(alertId, 'acknowledged', `Acknowledged by ${userId}`);
        this._persist();

        return true;
    }

    // Resolve alert
    resolveAlert(alertId, resolution) {
        const alert = this.alerts[alertId];
        if (!alert) return false;

        alert.status = 'resolved';
        alert.resolvedDate = new Date().toISOString();
        alert.resolution = resolution;

        this._addToHistory(alertId, 'resolved', resolution);
        this._persist();

        return true;
    }

    // Snooze alert
    snoozeAlert(alertId, durationMinutes) {
        const alert = this.alerts[alertId];
        if (!alert) return false;

        alert.status = 'snoozed';
        alert.snoozedUntil = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();

        this._addToHistory(alertId, 'snoozed', `Snoozed for ${durationMinutes} minutes`);
        this._persist();

        return true;
    }

    // Ignore alert
    ignoreAlert(alertId, reason) {
        const alert = this.alerts[alertId];
        if (!alert) return false;

        alert.status = 'ignored';
        alert.ignoreReason = reason;

        this._addToHistory(alertId, 'ignored', reason);
        this._persist();

        return true;
    }

    // ===== ALERT INSPECTION =====

    // Get active alerts
    getActiveAlerts(organizationId, filter = {}) {
        return Object.values(this.alerts)
            .filter(a => a.organizationId === organizationId)
            .filter(a => {
                if (filter.status && !filter.status.includes(a.status)) return false;
                if (filter.severity && !filter.severity.includes(a.severity)) return false;
                if (filter.category && !filter.category.includes(a.category)) return false;
                return true;
            })
            .sort((a, b) => {
                const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                return severityOrder[a.severity] - severityOrder[b.severity];
            });
    }

    // Get alert statistics
    getAlertStatistics(organizationId, timeRange = 'day') {
        const allAlerts = Object.values(this.alerts)
            .filter(a => a.organizationId === organizationId);

        const rangeMs = {
            hour: 60 * 60 * 1000,
            day: 24 * 60 * 60 * 1000,
            week: 7 * 24 * 60 * 60 * 1000,
            month: 30 * 24 * 60 * 60 * 1000
        };

        const cutoff = new Date(Date.now() - (rangeMs[timeRange] || rangeMs.day));
        const recentAlerts = allAlerts.filter(a => new Date(a.createdDate) > cutoff);

        return {
            total: recentAlerts.length,
            bySeverity: {
                critical: recentAlerts.filter(a => a.severity === 'critical').length,
                high: recentAlerts.filter(a => a.severity === 'high').length,
                medium: recentAlerts.filter(a => a.severity === 'medium').length,
                low: recentAlerts.filter(a => a.severity === 'low').length
            },
            byCategory: {
                compliance: recentAlerts.filter(a => a.category === 'compliance').length,
                quality: recentAlerts.filter(a => a.category === 'quality').length,
                performance: recentAlerts.filter(a => a.category === 'performance').length,
                security: recentAlerts.filter(a => a.category === 'security').length
            },
            byStatus: {
                active: recentAlerts.filter(a => a.status === 'active').length,
                acknowledged: recentAlerts.filter(a => a.status === 'acknowledged').length,
                resolved: recentAlerts.filter(a => a.status === 'resolved').length
            }
        };
    }

    // Get alert history
    getAlertHistory(alertId) {
        return Object.values(this.history)
            .filter(h => h.alertId === alertId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // ===== HELPER FUNCTIONS =====

    _generateSuggestedActions(category) {
        const actions = {
            compliance: [
                'Review compliance policy',
                'Check violation details',
                'Generate compliance report'
            ],
            quality: [
                'Analyze quality metrics',
                'Check communication patterns',
                'Generate improvement recommendations'
            ],
            performance: [
                'Review performance trends',
                'Check team productivity',
                'Run diagnostics'
            ],
            security: [
                'Review security logs',
                'Check access patterns',
                'Notify security team'
            ]
        };

        return actions[category] || [];
    }

    _notifyGroups(alertId, groups) {
        // In real implementation, would send to group notification channels
        const alert = this.alerts[alertId];
        groups.forEach(group => {
            this._addToHistory(alertId, 'group_notified', `Notified group: ${group}`);
        });
    }

    _addToHistory(alertId, action, details) {
        const historyId = `hist_${Date.now()}`;
        this.history[historyId] = {
            id: historyId,
            alertId,
            action,
            details,
            timestamp: new Date().toISOString()
        };
    }

    _persist() {
        chrome.storage.local.set({
            systemAlerts: this.alerts,
            alertTriggers: this.triggers,
            alertPolicies: this.policies,
            notifications: this.notifications,
            alertHistory: this.history
        });
    }
}

// Export for use in popup.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AlertingSystem;
}
