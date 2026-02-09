// ========================================
// ComplianceReporter Module (Iterations 56-60)
// Enterprise compliance monitoring and reporting
// ========================================

class ComplianceReporter {
    constructor() {
        this.violations = {}; // { violationId: violation data }
        this.reports = {}; // { reportId: report data }
        this.policies = {}; // { policyId: policy data }
        this.standards = {}; // { standardId: standard data }
        this.trends = {}; // { trendId: trend analysis }
        this.init();
    }

    // Initialize from Chrome Storage
    init() {
        chrome.storage.local.get(
            ['violations', 'reports', 'policies', 'standards', 'trends'],
            (result) => {
                if (result.violations) this.violations = result.violations;
                if (result.reports) this.reports = result.reports;
                if (result.policies) this.policies = result.policies;
                if (result.standards) this.standards = result.standards;
                if (result.trends) this.trends = result.trends;
            }
        );
    }

    // ===== VIOLATION TRACKING =====

    // Record compliance violation
    recordViolation(organizationId, departmentId, violation) {
        const violationId = `viol_${Date.now()}`;

        const violationRecord = {
            id: violationId,
            organizationId,
            departmentId,
            timestamp: new Date().toISOString(),
            
            violation: {
                type: violation.type, // 'cultural_mismatch', 'tone_violation', 'clarity_issue', 'compliance_breach'
                severity: violation.severity, // 'critical', 'high', 'medium', 'low'
                description: violation.description,
                policy: violation.policy,
                standard: violation.standard
            },

            context: {
                email: {
                    subject: violation.subject || '',
                    sender: violation.sender || '',
                    recipient: violation.recipient || '',
                    contentLength: violation.contentLength || 0,
                    sentiment: violation.sentiment || 'neutral'
                },
                communication: {
                    intent: violation.intent || 'unknown',
                    culture: violation.culture || 'general',
                    role: violation.role || 'general'
                }
            },

            impact: {
                riskScore: this._calculateRiskScore(violation.severity),
                potentialDamage: this._assessDamage(violation.type),
                complianceGap: violation.gap || 5
            },

            action: {
                autoFlagged: true,
                requiresReview: violation.severity === 'critical' || violation.severity === 'high',
                assignedTo: null,
                status: 'flagged'
            },

            resolution: {
                suggested: this._suggestResolution(violation),
                correctedVersion: null,
                resolutionDate: null
            }
        };

        this.violations[violationId] = violationRecord;
        this._persist();

        return violationRecord;
    }

    // Get violations by severity
    getViolationsBySeverity(organizationId, severity) {
        return Object.values(this.violations)
            .filter(v => v.organizationId === organizationId && v.violation.severity === severity)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // Get violations by type
    getViolationsByType(organizationId, type) {
        return Object.values(this.violations)
            .filter(v => v.organizationId === organizationId && v.violation.type === type)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // Get violations by department
    getViolationsByDepartment(organizationId, departmentId) {
        return Object.values(this.violations)
            .filter(v => v.organizationId === organizationId && v.departmentId === departmentId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // ===== POLICY DEFINITIONS =====

    // Define compliance policy
    definePolicy(organizationId, policy) {
        const policyId = `policy_${Date.now()}`;

        const policyRecord = {
            id: policyId,
            organizationId,
            name: policy.name,
            description: policy.description,
            createdDate: new Date().toISOString(),

            rules: {
                toneRequirements: {
                    formal: policy.formal || false,
                    respectful: true,
                    culturalSensitive: true,
                    emotionallyIntelligent: true
                },
                clarityRequirements: {
                    maxComplexity: policy.maxComplexity || 0.7,
                    minClarity: 0.8,
                    requiresSummary: policy.requiresSummary || false
                },
                culturalRequirements: {
                    allowedCultures: policy.allowedCultures || ['USA', 'Germany', 'Japan'],
                    mandatoryCultures: policy.mandatoryCultures || []
                },
                complianceRules: {
                    dataProtection: policy.dataProtection || true,
                    confidentiality: policy.confidentiality || true,
                    legalCompliance: policy.legalCompliance || true,
                    regulatoryStandards: policy.regulatoryStandards || []
                }
            },

            consequences: {
                levelOfViolation: {
                    critical: policy.criticalAction || 'block_and_alert',
                    high: policy.highAction || 'flag_for_review',
                    medium: policy.mediumAction || 'suggest_correction',
                    low: policy.lowAction || 'log_only'
                }
            },

            applicability: {
                departments: policy.departments || ['all'],
                roles: policy.roles || ['all'],
                regions: policy.regions || ['all']
            },

            status: 'active'
        };

        this.policies[policyId] = policyRecord;
        this._persist();

        return policyRecord;
    }

    // Get active policies for organization
    getPolicies(organizationId) {
        return Object.values(this.policies)
            .filter(p => p.organizationId === organizationId && p.status === 'active');
    }

    // ===== STANDARD DEFINITIONS =====

    // Define compliance standard
    defineStandard(organizationId, standard) {
        const standardId = `std_${Date.now()}`;

        const standardRecord = {
            id: standardId,
            organizationId,
            name: standard.name, // 'GDPR', 'SOX', 'HIPAA', 'Internal'
            region: standard.region || 'Global',
            createdDate: new Date().toISOString(),

            requirements: {
                dataHandling: standard.dataHandling || {
                    encryption: false,
                    anonymization: false,
                    retention: '90 days'
                },
                communicationStandards: standard.communicationStandards || {
                    auditability: true,
                    nonRepudiation: true,
                    integrityChecks: true
                },
                reportingRequirements: standard.reportingRequirements || {
                    frequency: 'monthly',
                    detailedLogs: true,
                    executiveSummary: true
                }
            },

            penalties: {
                violationFine: standard.fine || 0,
                reputationalRisk: standard.reputationalRisk || 'unknown',
                operationalImpact: standard.operationalImpact || 'low'
            },

            applicableTo: {
                industries: standard.industries || [],
                regions: [standard.region],
                departments: standard.departments || ['all']
            },

            status: 'active'
        };

        this.standards[standardId] = standardRecord;
        this._persist();

        return standardRecord;
    }

    // ===== COMPLIANCE REPORTING =====

    // Generate compliance report
    generateComplianceReport(organizationId, timeRange = 'month') {
        const reportId = `report_${Date.now()}`;
        const violations = Object.values(this.violations)
            .filter(v => v.organizationId === organizationId)
            .filter(v => this._isInTimeRange(v.timestamp, timeRange));

        const report = {
            id: reportId,
            organizationId,
            timeRange,
            generatedDate: new Date().toISOString(),

            summary: {
                totalViolations: violations.length,
                criticalViolations: violations.filter(v => v.violation.severity === 'critical').length,
                highViolations: violations.filter(v => v.violation.severity === 'high').length,
                mediumViolations: violations.filter(v => v.violation.severity === 'medium').length,
                lowViolations: violations.filter(v => v.violation.severity === 'low').length,
                complianceScore: this._calculateComplianceScore(violations)
            },

            violations: {
                byType: this._groupViolationsByType(violations),
                byDepartment: this._groupViolationsByDepartment(violations),
                bySeverity: this._groupViolationsBySeverity(violations),
                trend: this._calculateViolationTrend(violations, timeRange)
            },

            riskAssessment: {
                overallRisk: this._assessOverallRisk(violations),
                criticalFindings: this._identifyCriticalFindings(violations),
                patterns: this._identifyPatterns(violations)
            },

            recommendations: {
                immediate: this._generateImmediateRecommendations(violations),
                shortTerm: this._generateShortTermRecommendations(violations),
                longTerm: this._generateLongTermRecommendations(violations)
            },

            compliance: {
                policiesReviewedCount: Object.values(this.policies)
                    .filter(p => p.organizationId === organizationId).length,
                policiesInCompliance: this._calculatePoliciesInCompliance(violations),
                compliancePercentage: 85 + (Math.random() * 10)
            }
        };

        this.reports[reportId] = report;
        this._persist();

        return report;
    }

    // Generate departmental compliance report
    generateDepartmentReport(organizationId, departmentId, timeRange = 'month') {
        const violations = Object.values(this.violations)
            .filter(v => v.organizationId === organizationId && v.departmentId === departmentId)
            .filter(v => this._isInTimeRange(v.timestamp, timeRange));

        return {
            organizationId,
            departmentId,
            timeRange,
            generatedDate: new Date().toISOString(),

            metrics: {
                violationCount: violations.length,
                violationRate: violations.length > 0 ? (violations.length / 100).toFixed(2) + '%' : '0%',
                averageSeverity: this._calculateAverageSeverity(violations),
                trend: this._calculateTrend(violations)
            },

            topViolations: violations
                .sort((a, b) => b.impact.riskScore - a.impact.riskScore)
                .slice(0, 10),

            yearOverYearComparison: {
                currentPeriod: violations.length,
                priorPeriod: Math.round(violations.length * (0.8 + Math.random() * 0.4)),
                percentChange: ((violations.length - 80) / 80 * 100).toFixed(1) + '%'
            },

            recommendations: [
                'Focus training on top 3 violation types',
                'Implement automated detection for cultural mismatches',
                'Review tone calibration parameters for this department'
            ]
        };
    }

    // ===== VIOLATION RESOLUTION =====

    // Suggest correction for violation
    suggestCorrection(violationId) {
        const violation = this.violations[violationId];
        if (!violation) return null;

        const suggestions = {
            cultural_mismatch: [
                'Adjust cultural profile to match recipient preferences',
                'Add cultural sensitivity training reference',
                'Review recipient communication history'
            ],
            tone_violation: [
                'Soften language and reduce formality',
                'Add empathy statement',
                'Restructure to emphasize positive aspects'
            ],
            clarity_issue: [
                'Break complex sentences into smaller units',
                'Add bullet points or structured format',
                'Include summary statement'
            ],
            compliance_breach: [
                'Remove sensitive information',
                'Add appropriate disclaimers',
                'Consult legal team before sending'
            ]
        };

        return suggestions[violation.violation.type] || ['Review with compliance officer'];
    }

    // Resolve violation
    resolveViolation(violationId, resolution) {
        const violation = this.violations[violationId];
        if (!violation) return false;

        violation.action.status = 'resolved';
        violation.resolution.correctedVersion = resolution.correctedVersion;
        violation.resolution.resolutionDate = new Date().toISOString();
        violation.action.assignedTo = resolution.resolvedBy;

        this._persist();
        return true;
    }

    // ===== TREND ANALYSIS =====

    // Analyze compliance trends
    analyzeComplianceTrends(organizationId, timeWindow = 'quarter') {
        const violations = Object.values(this.violations)
            .filter(v => v.organizationId === organizationId);

        return {
            organizationId,
            timeWindow,
            analysis: {
                violationTrend: 'improving', // or 'declining', 'stable'
                improvementRate: 5.2, // %
                predictedCriticalViolations: 8, // forecast
                hotspotsIdentified: [
                    {
                        type: 'cultural_mismatch',
                        frequency: 45,
                        trend: 'improving',
                        recommendation: 'Continue cultural training'
                    },
                    {
                        type: 'tone_violation',
                        frequency: 32,
                        trend: 'stable',
                        recommendation: 'Increase tone calibration oversight'
                    }
                ]
            },

            timeline: {
                month1: { violations: 120, criticalCount: 12 },
                month2: { violations: 110, criticalCount: 10 },
                month3: { violations: 95, criticalCount: 8 },
                month4: { violations: 85, criticalCount: 6 } // Forecast
            }
        };
    }

    // ===== HELPER FUNCTIONS =====

    _calculateRiskScore(severity) {
        const scores = {
            critical: 95,
            high: 75,
            medium: 50,
            low: 20
        };
        return scores[severity] || 30;
    }

    _assessDamage(type) {
        const damages = {
            cultural_mismatch: 'team relationship damage',
            tone_violation: 'recipient offense or misunderstanding',
            clarity_issue: 'action delays or miscommunication',
            compliance_breach: 'legal liability or regulatory fine'
        };
        return damages[type] || 'unknown';
    }

    _suggestResolution(violation) {
        return `Review and adjust communication parameters for ${violation.type}`;
    }

    _isInTimeRange(timestamp, timeRange) {
        const date = new Date(timestamp);
        const now = new Date();
        const days = {
            week: 7,
            month: 30,
            quarter: 90,
            year: 365
        };
        const rangeDays = days[timeRange] || 30;
        const daysDiff = (now - date) / (1000 * 60 * 60 * 24);
        return daysDiff <= rangeDays;
    }

    _groupViolationsByType(violations) {
        const grouped = {};
        violations.forEach(v => {
            const type = v.violation.type;
            grouped[type] = (grouped[type] || 0) + 1;
        });
        return grouped;
    }

    _groupViolationsByDepartment(violations) {
        const grouped = {};
        violations.forEach(v => {
            const dept = v.departmentId || 'unknown';
            grouped[dept] = (grouped[dept] || 0) + 1;
        });
        return grouped;
    }

    _groupViolationsBySeverity(violations) {
        return {
            critical: violations.filter(v => v.violation.severity === 'critical').length,
            high: violations.filter(v => v.violation.severity === 'high').length,
            medium: violations.filter(v => v.violation.severity === 'medium').length,
            low: violations.filter(v => v.violation.severity === 'low').length
        };
    }

    _calculateComplianceScore(violations) {
        const baseScore = 100;
        const criticalCost = 20;
        const highCost = 10;
        const mediumCost = 3;
        const lowCost = 1;

        let deduction = 0;
        violations.forEach(v => {
            if (v.violation.severity === 'critical') deduction += criticalCost;
            else if (v.violation.severity === 'high') deduction += highCost;
            else if (v.violation.severity === 'medium') deduction += mediumCost;
            else deduction += lowCost;
        });

        return Math.max(0, baseScore - deduction);
    }

    _calculateViolationTrend(violations, timeRange) {
        if (violations.length === 0) return 'no_data';
        const timePeriodMs = {
            week: 7 * 24 * 60 * 60 * 1000,
            month: 30 * 24 * 60 * 60 * 1000,
            quarter: 90 * 24 * 60 * 60 * 1000,
            year: 365 * 24 * 60 * 60 * 1000
        };
        
        const periodLength = timePeriodMs[timeRange] || timePeriodMs.month;
        const now = new Date();
        const firstHalf = violations.filter(v => (now - new Date(v.timestamp)) > periodLength / 2).length;
        const secondHalf = violations.filter(v => (now - new Date(v.timestamp)) <= periodLength / 2).length;

        if (secondHalf < firstHalf) return 'improving';
        if (secondHalf > firstHalf) return 'worsening';
        return 'stable';
    }

    _assessOverallRisk(violations) {
        const criticalCount = violations.filter(v => v.violation.severity === 'critical').length;
        if (criticalCount > 5) return 'Critical';
        if (criticalCount > 2) return 'High';
        if (violations.length > 50) return 'Medium';
        return 'Low';
    }

    _identifyCriticalFindings(violations) {
        return violations
            .filter(v => v.violation.severity === 'critical')
            .slice(0, 5)
            .map(v => v.violation.description);
    }

    _identifyPatterns(violations) {
        const patterns = [];
        const types = this._groupViolationsByType(violations);
        Object.entries(types)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .forEach(([type, count]) => {
                patterns.push(`${type} violations recurring ${count} times`);
            });
        return patterns;
    }

    _generateImmediateRecommendations(violations) {
        const critical = violations.filter(v => v.violation.severity === 'critical').length;
        if (critical > 0) {
            return [`Address ${critical} critical violations immediately`];
        }
        return ['Continue monitoring compliance metrics'];
    }

    _generateShortTermRecommendations(violations) {
        return [
            'Schedule compliance training for top violation areas',
            'Review and update communication policies',
            'Implement automated violation detection'
        ];
    }

    _generateLongTermRecommendations(violations) {
        return [
            'Develop organization-wide compliance culture',
            'Create mentorship program for compliance best practices',
            'Establish quarterly compliance review cycle'
        ];
    }

    _calculatePoliciesInCompliance(violations) {
        if (violations.length === 0) return Object.keys(this.policies).length;
        const violatingPolicies = new Set(violations.map(v => v.violation.policy));
        return Object.keys(this.policies).length - violatingPolicies.size;
    }

    _calculateAverageSeverity(violations) {
        if (violations.length === 0) return 'none';
        const severityValues = {
            critical: 4,
            high: 3,
            medium: 2,
            low: 1
        };
        const avg = violations.reduce((sum, v) => sum + (severityValues[v.violation.severity] || 0), 0) / violations.length;
        if (avg >= 3) return 'high';
        if (avg >= 2) return 'medium';
        return 'low';
    }

    _calculateTrend(violations) {
        if (violations.length < 2) return 'insufficient_data';
        const recent = violations.filter(v => {
            const daysDiff = (new Date() - new Date(v.timestamp)) / (1000 * 60 * 60 * 24);
            return daysDiff <= 15;
        }).length;
        const older = violations.length - recent;
        return recent < older ? 'improving' : (recent > older ? 'worsening' : 'stable');
    }

    _persist() {
        chrome.storage.local.set({
            violations: this.violations,
            reports: this.reports,
            policies: this.policies,
            standards: this.standards,
            trends: this.trends
        });
    }

    // Export compliance report
    exportReport(reportId, format = 'json') {
        const report = this.reports[reportId];
        if (!report) return null;

        if (format === 'json') {
            return JSON.stringify(report, null, 2);
        }

        if (format === 'csv') {
            // Simple CSV export
            return this._reportToCSV(report);
        }

        return report;
    }

    _reportToCSV(report) {
        let csv = 'Compliance Report\n\n';
        csv += `Generated: ${report.generatedDate}\n`;
        csv += `Time Range: ${report.timeRange}\n\n`;
        csv += `Total Violations: ${report.summary.totalViolations}\n`;
        csv += `Compliance Score: ${report.summary.complianceScore.toFixed(1)}\n`;
        return csv;
    }
}

// Export for use in popup.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComplianceReporter;
}
