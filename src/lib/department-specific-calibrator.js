// ========================================
// DepartmentSpecificCalibrator Module (Iterations 41-45)
// Applies department-specific communication standards and calibrations
// ========================================

class DepartmentSpecificCalibrator {
    constructor() {
        this.departmentProfiles = this._initializeDepartmentProfiles();
        this.customDepartmentSettings = {}; // { deptId: custom settings }
        this.departmentHistory = {}; // { deptId: performance history }
        this.init();
    }

    // Initialize standard department communication profiles
    _initializeDepartmentProfiles() {
        return {
            'Engineering': {
                displayName: 'Engineering',
                description: 'Technical, precise, implementation-focused communication',
                industry: 'tech',
                communicationStyle: 'technical',
                keyCharacteristics: ['precise', 'data-driven', 'structured', 'logical'],
                
                parameters: {
                    precision: { value: 90, importance: 'critical' },
                    technical_accuracy: { value: 95, importance: 'critical' },
                    clarity: { value: 85, importance: 'high' },
                    directness: { value: 80, importance: 'high' },
                    formality: { value: 65, importance: 'medium' },
                    emotional_intelligence: { value: 55, importance: 'low' }
                },

                commonIntents: ['technical_discussion', 'bug_report', 'feature_request', 'code_review', 'problem_solving'],
                preferredTones: ['professional', 'technical', 'direct'],
                preferredLanguages: ['English'],
                documentationRequirement: 'high',

                rolesProfile: {
                    'engineering_manager': { directness: 75, leadership: 80, technical: 85 },
                    'senior_engineer': { technical: 95, precision: 92, mentoring: 70 },
                    'engineer': { technical: 88, precision: 90, collaboration: 80 },
                    'intern': { learning: 90, precision: 80, questioning: 85 }
                },

                communicationRules: [
                    'Provide technical specifications when discussing features',
                    'Use code snippets or diagrams for complex explanations',
                    'Be specific about metrics and performance requirements',
                    'Share reproducible test cases for issues',
                    'Estimate effort and provide trade-off analysis'
                ],

                tabooTopics: ['Vague requirements', 'Unfounded claims', 'Missing context'],
                customParameters: {
                    code_review_focus: 'maintainability',
                    documentation_format: 'markdown',
                    estimation_method: 'story_points'
                }
            },

            'Sales': {
                displayName: 'Sales',
                description: 'Client-focused, opportunity-driven, relationship-building communication',
                industry: 'business',
                communicationStyle: 'relationship',
                keyCharacteristics: ['persuasive', 'empathetic', 'confident', 'results-oriented'],
                
                parameters: {
                    persuasion: { value: 95, importance: 'critical' },
                    emotional_intelligence: { value: 90, importance: 'critical' },
                    confidence: { value: 85, importance: 'high' },
                    urgency: { value: 80, importance: 'high' },
                    formality: { value: 75, importance: 'medium' },
                    precision: { value: 65, importance: 'medium' }
                },

                commonIntents: ['sales_pitch', 'client_engagement', 'negotiation', 'follow_up', 'objection_handling'],
                preferredTones: ['warm', 'professional', 'confident'],
                preferredLanguages: ['English'],
                relationshipFocus: 'high',

                rolesProfile: {
                    'sales_manager': { leadership: 85, urgency: 85, emotional_intelligence: 85 },
                    'account_executive': { persuasion: 95, emotional_intelligence: 88, negotiation: 85 },
                    'sales_representative': { persuasion: 90, confidence: 85, persistence: 85 },
                    'sales_development': { outreach: 90, qualification: 80, persistence: 85 }
                },

                communicationRules: [
                    'Lead with value proposition',
                    'Build rapport before pitching',
                    'Use data to support claims',
                    'Listen more than you talk',
                    'Create sense of urgency without pressure',
                    'Follow up persistently but respectfully'
                ],

                tabooTopics: ['Aggressive tactics', 'Misleading claims', 'Ignoring client concerns'],
                customParameters: {
                    follow_up_cadence: 'weekly',
                    presentation_style: 'visual',
                    pitch_duration: '15_minutes'
                }
            },

            'Human_Resources': {
                displayName: 'Human Resources',
                description: 'Employee-centric, policy-aware, supportive communication',
                industry: 'operations',
                communicationStyle: 'supportive',
                keyCharacteristics: ['empathetic', 'compliant', 'confidential', 'supportive'],
                
                parameters: {
                    emotional_intelligence: { value: 95, importance: 'critical' },
                    compliance: { value: 90, importance: 'critical' },
                    empathy: { value: 88, importance: 'critical' },
                    confidentiality: { value: 95, importance: 'critical' },
                    formality: { value: 80, importance: 'high' },
                    directness: { value: 70, importance: 'medium' }
                },

                commonIntents: ['compensation_discussion', 'conflict_resolution', 'performance_review', 'employee_support', 'policy_communication'],
                preferredTones: ['supportive', 'professional', 'empathetic'],
                preferredLanguages: ['English'],
                confidentialityRequired: true,

                rolesProfile: {
                    'hr_director': { strategic: 85, policy: 90, emotional_intelligence: 85 },
                    'hr_manager': { emotional_intelligence: 90, compliance: 90, mediation: 85 },
                    'recruiter': { persuasion: 80, assessment: 85, empathy: 80 },
                    'hr_specialist': { compliance: 90, process: 85, support: 85 }
                },

                communicationRules: [
                    'Maintain strict confidentiality',
                    'Follow all legal/compliance requirements',
                    'Provide clear policy references',
                    'Listen with empathy to concerns',
                    'Document all interactions',
                    'Offer support resources'
                ],

                tabooTopics: ['Breach of confidentiality', 'Discriminatory language', 'Policy violations', 'Unfounded promises'],
                customParameters: {
                    documentation_requirement: 'detailed',
                    privacy_level: 'maximum',
                    escalation_path: 'legal_review'
                }
            },

            'Finance': {
                displayName: 'Finance',
                description: 'Accurate, compliant, fiscally-responsible communication',
                industry: 'operations',
                communicationStyle: 'analytical',
                keyCharacteristics: ['accurate', 'precise', 'cautious', 'compliant'],
                
                parameters: {
                    accuracy: { value: 98, importance: 'critical' },
                    compliance: { value: 95, importance: 'critical' },
                    precision: { value: 95, importance: 'critical' },
                    formality: { value: 85, importance: 'high' },
                    clarity: { value: 80, importance: 'high' },
                    technical_depth: { value: 85, importance: 'high' }
                },

                commonIntents: ['budget_review', 'financial_reporting', 'audit_prep', 'forecasting', 'policy_compliance'],
                preferredTones: ['professional', 'analytical', 'cautious'],
                preferredLanguages: ['English'],
                documentationRequirement: 'maximum',

                rolesProfile: {
                    'cfo': { strategic: 90, governance: 95, accuracy: 95 },
                    'finance_manager': { accuracy: 95, compliance: 90, analysis: 85 },
                    'accountant': { accuracy: 98, precision: 95, process: 90 },
                    'financial_analyst': { analysis: 90, modeling: 85, communication: 75 }
                },

                communicationRules: [
                    'Use precise numbers with sources',
                    'Reference all policies and regulations',
                    'Include disclaimers and assumptions',
                    'Show audit trails for decisions',
                    'Forecast with conservative estimates',
                    'Document business justifications'
                ],

                tabooTopics: ['Estimates without backing', 'Non-compliant practices', 'Unsubstantiated claims'],
                customParameters: {
                    reporting_frequency: 'monthly',
                    audit_trail_requirement: 'complete',
                    approval_levels: 'strict'
                }
            },

            'Marketing': {
                displayName: 'Marketing',
                description: 'Creative, brand-focused, audience-aware communication',
                industry: 'business',
                communicationStyle: 'creative',
                keyCharacteristics: ['creative', 'brand-aware', 'strategic', 'audience-focused'],
                
                parameters: {
                    creativity: { value: 90, importance: 'critical' },
                    brand_alignment: { value: 95, importance: 'critical' },
                    audience_awareness: { value: 85, importance: 'high' },
                    persuasion: { value: 85, importance: 'high' },
                    emotional_appeal: { value: 80, importance: 'high' },
                    precision: { value: 70, importance: 'medium' }
                },

                commonIntents: ['campaign_planning', 'brand_messaging', 'audience_segmentation', 'market_analysis', 'creative_pitch'],
                preferredTones: ['compelling', 'professional', 'engaging'],
                preferredLanguages: ['English'],
                brandGuidelinesRequired: true,

                rolesProfile: {
                    'marketing_director': { strategy: 90, creativity: 85, brand: 95 },
                    'campaign_manager': { creativity: 88, planning: 85, execution: 85 },
                    'content_marketer': { creativity: 85, audience: 85, writing: 90 },
                    'brand_specialist': { brand: 95, consistency: 90, guidelines: 95 }
                },

                communicationRules: [
                    'Always align with brand guidelines',
                    'Consider target audience demographics',
                    'Support claims with market data',
                    'Use compelling storytelling',
                    'A/B test messaging when possible',
                    'Track engagement metrics'
                ],

                tabooTopics: ['Brand guideline violations', 'Off-brand messaging', 'Unsubstantiated claims'],
                customParameters: {
                    campaign_approval_level: 'director',
                    brand_consistency_check: 'required',
                    audience_testing: 'recommended'
                }
            },

            'Customer_Support': {
                displayName: 'Customer Support',
                description: 'Customer-centric, solution-focused, empathetic communication',
                industry: 'customer_service',
                communicationStyle: 'supportive',
                keyCharacteristics: ['empathetic', 'patient', 'resourceful', 'customer-focused'],
                
                parameters: {
                    empathy: { value: 95, importance: 'critical' },
                    patience: { value: 90, importance: 'critical' },
                    problem_solving: { value: 85, importance: 'high' },
                    clarity: { value: 85, importance: 'high' },
                    responsiveness: { value: 90, importance: 'high' },
                    technical_knowledge: { value: 75, importance: 'medium' }
                },

                commonIntents: ['issue_resolution', 'customer_support', 'troubleshooting', 'escalation', 'follow_up'],
                preferredTones: ['supportive', 'professional', 'warm'],
                preferredLanguages: ['English'],
                responseSLARequired: true,

                rolesProfile: {
                    'support_manager': { leadership: 85, empathy: 85, process: 85 },
                    'support_lead': { troubleshooting: 85, empathy: 85, coaching: 80 },
                    'support_specialist': { empathy: 90, problem_solving: 80, patience: 90 },
                    'support_intern': { learning: 85, empathy: 85, adherence: 85 }
                },

                communicationRules: [
                    'Acknowledge customer frustration',
                    'Provide clear next steps',
                    'Offer multiple solution paths',
                    'Follow up to ensure resolution',
                    'Collect feedback on support quality',
                    'Escalate appropriately when needed'
                ],

                tabooTopics: ['Dismissing concerns', 'Making excuses', 'Over-promising'],
                customParameters: {
                    response_time_sla: '2_hours',
                    escalation_criteria: 'complex_technical',
                    feedback_collection: 'mandatory'
                }
            }
        };
    }

    // Initialize from Chrome Storage
    init() {
        chrome.storage.local.get(
            ['customDepartmentSettings', 'departmentHistory'],
            (result) => {
                if (result.customDepartmentSettings) {
                    this.customDepartmentSettings = result.customDepartmentSettings;
                }
                if (result.departmentHistory) {
                    this.departmentHistory = result.departmentHistory;
                }
            }
        );
    }

    // ===== DEPARTMENT PROFILE MANAGEMENT =====

    // Get department profile
    getDepartmentProfile(depName) {
        // Normalize department name (underscores for lookup)
        const key = depName.replace(/\s+/g, '_');
        return this.departmentProfiles[key] || this._createGenericProfile(depName);
    }

    // Get calibrated parameters for department
    getDepartmentParameters(departmentName, role = 'general') {
        const profile = this.getDepartmentProfile(departmentName);
        
        let parameters = { ...profile.parameters };

        // Apply role-specific adjustments if available
        if (profile.rolesProfile && profile.rolesProfile[role]) {
            parameters = this._applyRoleAdjustments(parameters, profile.rolesProfile[role]);
        }

        return parameters;
    }

    // Get communication rules for department
    getDepartmentRules(departmentName) {
        const profile = this.getDepartmentProfile(departmentName);
        
        return {
            rules: profile.communicationRules || [],
            tabooTopics: profile.tabooTopics || [],
            preferredTones: profile.preferredTones || ['professional'],
            keyCharacteristics: profile.keyCharacteristics || []
        };
    }

    // Get customized parameters for specific department instance
    getCustomizedParameters(organizationId, departmentId, role = 'general') {
        const customKey = `${organizationId}_${departmentId}`;
        
        if (this.customDepartmentSettings[customKey]) {
            return this.customDepartmentSettings[customKey].parameters;
        }

        // Fall back to standard profile
        const dept = this.departmentProfiles[departmentId] || 
                    this.getDepartmentProfile(departmentId);
        
        let params = { ...dept.parameters };
        
        if (dept.rolesProfile && dept.rolesProfile[role]) {
            params = this._applyRoleAdjustments(params, dept.rolesProfile[role]);
        }

        return params;
    }

    // ===== CALIBRATION & CUSTOMIZATION =====

    // Calibrate message for department
    calibrateForDepartment(organizationId, departmentName, analysisData, calibratedVersions) {
        const profile = this.getDepartmentProfile(departmentName);
        const calibrated = { ...calibratedVersions };

        // Apply department-specific tone adjustments
        if (profile.preferredTones) {
            calibrated.toneAdjustment = {
                preferredTones: profile.preferredTones,
                currentTone: analysisData.tone,
                suggestion: this._suggestTonAdjustment(
                    analysisData.tone,
                    profile.preferredTones
                )
            };
        }

        // Check against department rules
        calibrated.complianceCheck = this._checkDepartmentCompliance(
            analysisData,
            profile
        );

        // Apply precision requirements
        if (profile.parameters.precision && profile.parameters.precision.value > 80) {
            calibrated.precisionLevel = 'high';
            calibrated.precisionSuggestion = 'Ensure technical accuracy and specific details';
        }

        // Record calibration
        this._recordCalibration(organizationId, departmentName, analysisData, calibrated);

        return calibrated;
    }

    // Create custom department settings
    customizeDepartmentSettings(organizationId, departmentId, departmentName, customSettings) {
        const customKey = `${organizationId}_${departmentId}`;
        
        const baseProfile = this.getDepartmentProfile(departmentName);
        
        this.customDepartmentSettings[customKey] = {
            organizationId: organizationId,
            departmentId: departmentId,
            departmentName: departmentName,
            baseProfile: departmentName,
            createdDate: new Date().toISOString(),
            
            parameters: {
                ...baseProfile.parameters,
                ...customSettings.parameters
            },
            
            communicationStyle: customSettings.communicationStyle || baseProfile.communicationStyle,
            customRules: customSettings.customRules || [],
            roleOverrides: customSettings.roleOverrides || {},
            preferences: customSettings.preferences || {}
        };

        this._persist();
        return this.customDepartmentSettings[customKey];
    }

    // ===== COMPLIANCE & VALIDATION =====

    // Check message compliance with department standards
    checkCompliance(departmentName, analysisData) {
        const profile = this.getDepartmentProfile(departmentName);
        
        const compliance = {
            compliant: true,
            violations: [],
            warnings: []
        };

        // Check tone appropriateness
        if (profile.preferredTones && !profile.preferredTones.includes(analysisData.tone)) {
            compliance.warnings.push({
                type: 'tone_mismatch',
                message: `Tone "${analysisData.tone}" is not typical for ${departmentName}. Preferred: ${profile.preferredTones.join(', ')}`
            });
        }

        // Check for taboo topics
        if (profile.tabooTopics) {
            const text = (analysisData.text || '').toLowerCase();
            for (const topic of profile.tabooTopics) {
                if (text.includes(topic.toLowerCase())) {
                    compliance.violations.push({
                        type: 'taboo_topic',
                        message: `Message mentions taboo topic: "${topic}"`
                    });
                    compliance.compliant = false;
                }
            }
        }

        // Check precision requirements
        if (profile.parameters.precision?.value > 85 && !analysisData.hasTechnicalDetails) {
            compliance.warnings.push({
                type: 'precision_missing',
                message: `${departmentName} communication typically requires more technical precision or quantifiable details`
            });
        }

        // Check documentation requirement
        if (profile.documentationRequirement === 'high' && analysisData.length < 100) {
            compliance.warnings.push({
                type: 'insufficient_documentation',
                message: 'Consider providing more detailed documentation for this communication'
            });
        }

        return compliance;
    }

    // Validate role-department combination
    validateRoleDepartmentFit(role, departmentName) {
        const profile = this.getDepartmentProfile(departmentName);
        
        if (!profile.rolesProfile || !profile.rolesProfile[role]) {
            return {
                valid: true,
                message: 'Role is not specifically defined for this department',
                defaultParameters: profile.parameters
            };
        }

        return {
            valid: true,
            message: `Role "${role}" is well-suited for ${departmentName}`,
            optimizedParameters: profile.rolesProfile[role],
            baseParameters: profile.parameters
        };
    }

    // ===== PERFORMANCE TRACKING =====

    // Record department communication
    recordDepartmentCommunication(organizationId, departmentName, analysisData, qualityScore) {
        const key = `${organizationId}_${departmentName}`;
        
        if (!this.departmentHistory[key]) {
            this.departmentHistory[key] = {
                departmentName: departmentName,
                organizationId: organizationId,
                communications: [],
                stats: {
                    totalCommunications: 0,
                    averageQuality: 0,
                    complianceRate: 100,
                    toneConsistency: 0
                }
            };
        }

        const record = this.departmentHistory[key];
        record.communications.push({
            timestamp: new Date().toISOString(),
            analysiData: analysisData,
            qualityScore: qualityScore
        });

        // Update stats
        record.stats.totalCommunications++;
        const prevAvg = record.stats.averageQuality;
        record.stats.averageQuality = 
            (prevAvg * (record.stats.totalCommunications - 1) + qualityScore) / 
            record.stats.totalCommunications;

        // Keep only recent 200 communications
        if (record.communications.length > 200) {
            record.communications = record.communications.slice(-200);
        }

        this._persist();
        return record;
    }

    // Get department performance statistics
    getDepartmentStats(organizationId, departmentName) {
        const key = `${organizationId}_${departmentName}`;
        const record = this.departmentHistory[key];

        if (!record) {
            return null;
        }

        return {
            departmentName: departmentName,
            totalCommunications: record.stats.totalCommunications,
            averageQuality: Math.round(record.stats.averageQuality),
            complianceRate: record.stats.complianceRate,
            trend: this._calculateTrend(record.communications),
            topCharacteristics: this._analyzeCommunicationCharacteristics(record.communications),
            lastUpdated: new Date().toISOString()
        };
    }

    // ===== HELPER FUNCTIONS =====

    // Create generic profile for unknown departments
    _createGenericProfile(depName) {
        return {
            displayName: depName,
            description: `Standard communication profile for ${depName} department`,
            industry: 'general',
            communicationStyle: 'professional',
            keyCharacteristics: ['professional', 'clear', 'respectful'],
            
            parameters: {
                clarity: { value: 80, importance: 'high' },
                professionalism: { value: 75, importance: 'high' },
                precision: { value: 70, importance: 'medium' },
                emotional_intelligence: { value: 70, importance: 'medium' },
                formality: { value: 70, importance: 'medium' }
            },
            
            commonIntents: ['communication', 'discussion', 'update'],
            preferredTones: ['professional', 'neutral'],
            preferredLanguages: ['English'],
            communicationRules: [
                'Be clear and concise',
                'Maintain professional tone',
                'Provide context when needed',
                'Follow up on action items'
            ]
        };
    }

    // Apply role-specific adjustments
    _applyRoleAdjustments(baseParams, roleAdjustments) {
        const adjusted = { ...baseParams };
        
        for (const [key, value] of Object.entries(roleAdjustments)) {
            if (adjusted[key]) {
                if (typeof adjusted[key] === 'object') {
                    adjusted[key].value = value;
                    adjusted[key].roleAdjusted = true;
                }
            }
        }

        return adjusted;
    }

    // Suggest tone adjustment
    _suggestTonAdjustment(currentTone, preferredTones) {
        if (preferredTones.includes(currentTone)) {
            return { suggestion: 'optimal', current: currentTone };
        }

        return {
            suggestion: 'adjustment_recommended',
            current: currentTone,
            preferred: preferredTones[0],
            alternatives: preferredTones
        };
    }

    // Check department compliance
    _checkDepartmentCompliance(analysisData, profile) {
        const compliance = {
            compliant: true,
            issues: []
        };

        // Add compliance checks here
        
        return compliance;
    }

    // Record calibration for learning
    _recordCalibration(organizationId, departmentName, analysisData, calibrated) {
        const key = `${organizationId}_${departmentName}_calibrations`;
        
        chrome.storage.local.get([key], (result) => {
            const calibrations = result[key] || [];
            calibrations.push({
                timestamp: new Date().toISOString(),
                input: analysisData,
                output: calibrated
            });

            // Keep only recent 100
            if (calibrations.length > 100) {
                calibrations.shift();
            }

            chrome.storage.local.set({ [key]: calibrations });
        });
    }

    // Calculate trend
    _calculateTrend(communications) {
        if (communications.length < 2) return 'insufficient_data';

        const recent = communications.slice(-10);
        const older = communications.slice(Math.max(0, communications.length - 20), -10);

        if (older.length === 0) return 'insufficient_data';

        const recentAvg = recent.reduce((sum, c) => sum + (c.qualityScore || 0), 0) / recent.length;
        const olderAvg = older.reduce((sum, c) => sum + (c.qualityScore || 0), 0) / older.length;

        if (recentAvg > olderAvg + 5) return 'improving';
        if (recentAvg < olderAvg - 5) return 'declining';
        return 'stable';
    }

    // Analyze communication characteristics
    _analyzeCommunicationCharacteristics(communications) {
        const tones = {};
        
        communications.forEach(c => {
            const tone = c.analysisData?.tone || 'neutral';
            tones[tone] = (tones[tone] || 0) + 1;
        });

        return Object.entries(tones)
            .map(([tone, count]) => ({ tone, frequency: count }))
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 3);
    }

    // Persist to Chrome Storage
    _persist() {
        chrome.storage.local.set({
            customDepartmentSettings: this.customDepartmentSettings,
            departmentHistory: this.departmentHistory
        });
    }

    // Export department calibrations
    exportDepartmentCalibrations(departmentName) {
        return {
            departmentName: departmentName,
            profile: this.getDepartmentProfile(departmentName),
            rules: this.getDepartmentRules(departmentName),
            exportDate: new Date().toISOString()
        };
    }

    // Get all departments
    getAllDepartments() {
        return Object.keys(this.departmentProfiles).map(key => ({
            key: key,
            name: this.departmentProfiles[key].displayName,
            description: this.departmentProfiles[key].description
        }));
    }
}

// Export for use in popup.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DepartmentSpecificCalibrator;
}
