// ========================================
// RoleBasedRecommender Module (Iterations 41-45)
// Generates role-specific parameter profiles and recommendations
// ========================================

class RoleBasedRecommender {
    constructor() {
        this.roleProfiles = this._initializeRoleProfiles();
        this.customProfiles = {}; // Custom profiles per organization
        this.init();
    }

    // Initialize recommended role profiles
    _initializeRoleProfiles() {
        return {
            'manager': {
                roleName: 'Manager',
                description: 'Leads teams, makes decisions, communicates upward and downward',
                parameters: {
                    hierarchy: { value: 72, rationale: 'Respects organizational structure' },
                    directness: { value: 68, rationale: 'Clear instructions to team' },
                    emotional_intelligence: { value: 78, rationale: 'Motivates and supports team' },
                    urgency: { value: 65, rationale: 'Balances priorities and deadlines' },
                    formality: { value: 70, rationale: 'Professional communication' }
                },
                culturalAdjustments: {
                    'Japan': { hierarchy: 85, emotional_intelligence: 72 },
                    'Germany': { directness: 85, hierarchy: 65 },
                    'USA': { urgency: 75, directness: 75 },
                    'China': { hierarchy: 88, formality: 75 },
                    'Brazil': { emotional_intelligence: 85, formality: 50 },
                    'India': { hierarchy: 80, emotional_intelligence: 75 },
                    'UK': { formality: 75, directness: 70 },
                    'France': { formality: 80, intellectual: 75 }
                },
                departmentAdjustments: {
                    'Engineering': { directness: 80, technical_precision: 85 },
                    'Sales': { urgency: 80, emotional_intelligence: 85 },
                    'HR': { emotional_intelligence: 85, compliance: 90 },
                    'Finance': { precision: 90, compliance: 85 }
                },
                intentPreferences: {
                    'decision_making': 75,
                    'delegation': 80,
                    'feedback': 70,
                    'negotiation': 75,
                    'escalation': 80
                }
            },

            'individual_contributor': {
                roleName: 'Individual Contributor',
                description: 'Executes tasks, collaborates with peers, communicates needs',
                parameters: {
                    hierarchy: { value: 45, rationale: 'Values peer collaboration' },
                    directness: { value: 72, rationale: 'Clear task communication' },
                    emotional_intelligence: { value: 68, rationale: 'Positive team dynamics' },
                    urgency: { value: 58, rationale: 'Manages own priorities' },
                    formality: { value: 55, rationale: 'Professional but collaborative' }
                },
                culturalAdjustments: {
                    'Japan': { hierarchy: 65, emotional_intelligence: 72 },
                    'Germany': { directness: 85, hierarchy: 40 },
                    'USA': { directness: 80, hierarchy: 35 },
                    'China': { hierarchy: 70, formality: 65 },
                    'Brazil': { emotional_intelligence: 80, formality: 45 },
                    'India': { hierarchy: 60, emotional_intelligence: 75 },
                    'UK': { formality: 65, directness: 75 },
                    'France': { intellectual: 75, formality: 60 }
                },
                departmentAdjustments: {
                    'Engineering': { precision: 85, technical_correctness: 90 },
                    'Sales': { urgency: 75, confidence: 80 },
                    'HR': { emotional_intelligence: 80, compliance: 85 },
                    'Finance': { precision: 88, accuracy: 90 }
                },
                intentPreferences: {
                    'clarification': 80,
                    'collaboration': 85,
                    'status_update': 75,
                    'support_request': 70,
                    'problem_solving': 80
                }
            },

            'executive': {
                roleName: 'Executive',
                description: 'Sets vision, communicates strategy, builds external relationships',
                parameters: {
                    hierarchy: { value: 68, rationale: 'Respects board/stakeholder structure' },
                    directness: { value: 75, rationale: 'Clear vision and decisions' },
                    emotional_intelligence: { value: 82, rationale: 'Inspires and influences' },
                    urgency: { value: 72, rationale: 'Drives business objectives' },
                    formality: { value: 78, rationale: 'External-facing communication' }
                },
                culturalAdjustments: {
                    'Japan': { hierarchy: 82, emotional_intelligence: 75, formality: 85 },
                    'Germany': { directness: 85, hierarchy: 65, precision: 85 },
                    'USA': { directness: 80, urgency: 80, confidence: 85 },
                    'China': { hierarchy: 85, formality: 85, diplomatic: 80 },
                    'Brazil': { emotional_intelligence: 85, warmth: 85, formality: 70 },
                    'India': { hierarchy: 80, formality: 80, respect: 85 },
                    'UK': { formality: 80, precision: 80, diplomatic: 75 },
                    'France': { intellectual: 85, formality: 82, logical: 85 }
                },
                departmentAdjustments: {
                    'Engineering': { vision_clarity: 85, technical_understanding: 70 },
                    'Sales': { strategy: 85, market_focus: 90 },
                    'HR': { culture_alignment: 85, values: 90 },
                    'Finance': { fiscal_responsibility: 90, transparency: 85 }
                },
                intentPreferences: {
                    'strategic_direction': 90,
                    'stakeholder_communication': 85,
                    'high_impact_messaging': 90,
                    'crisis_communication': 80,
                    'external_relations': 85
                }
            },

            'team_lead': {
                roleName: 'Team Lead',
                description: 'Bridges individual contributors and management',
                parameters: {
                    hierarchy: { value: 58, rationale: 'Bridges hierarchy gaps' },
                    directness: { value: 70, rationale: 'Clear guidance to team' },
                    emotional_intelligence: { value: 75, rationale: 'Supports team members' },
                    urgency: { value: 62, rationale: 'Balances team and business needs' },
                    formality: { value: 62, rationale: 'Professional yet approachable' }
                },
                culturalAdjustments: {
                    'Japan': { hierarchy: 75, emotional_intelligence: 75 },
                    'Germany': { directness: 80, hierarchy: 55 },
                    'USA': { directness: 78, hierarchy: 50 },
                    'China': { hierarchy: 75, formality: 70 },
                    'Brazil': { emotional_intelligence: 82, warmth: 80 },
                    'India': { hierarchy: 70, emotional_intelligence: 75 },
                    'UK': { formality: 70, directness: 72 },
                    'France': { intellectual: 70, formality: 68 }
                },
                departmentAdjustments: {
                    'Engineering': { directness: 80, precision: 85 },
                    'Sales': { motivation: 85, urgency: 75 },
                    'HR': { emotional_intelligence: 85, policy_knowledge: 80 },
                    'Finance': { accuracy: 85, compliance: 80 }
                },
                intentPreferences: {
                    'team_coordination': 85,
                    'mentoring': 80,
                    'delegation': 78,
                    'team_feedback': 80,
                    'escalation': 72
                }
            }
        };
    }

    // Initialize from Chrome Storage
    init() {
        chrome.storage.local.get(['customRoleProfiles'], (result) => {
            if (result.customRoleProfiles) {
                this.customProfiles = result.customRoleProfiles;
            }
        });
    }

    // ===== ROLE-BASED PARAMETER GENERATION =====

    // Get recommended parameters for a specific role
    getParametersForRole(role, culture = 'USA', department = 'Engineering') {
        const profile = this.roleProfiles[role] || this.roleProfiles['individual_contributor'];
        
        let parameters = { ...profile.parameters };
        
        // Apply cultural adjustments
        if (profile.culturalAdjustments[culture]) {
            parameters = this._applyCulturalAdjustments(parameters, profile.culturalAdjustments[culture]);
        }
        
        // Apply department adjustments
        if (profile.departmentAdjustments[department]) {
            parameters = this._applyDepartmentAdjustments(parameters, profile.departmentAdjustments[department]);
        }

        return this._normalizeParameters(parameters);
    }

    // Get parameters for manager role
    getManagerParameters(culture = 'USA', department = 'Engineering') {
        return this.getParametersForRole('manager', culture, department);
    }

    // Get parameters for individual contributor
    getICParameters(culture = 'USA', department = 'Engineering') {
        return this.getParametersForRole('individual_contributor', culture, department);
    }

    // Get parameters for executive
    getExecutiveParameters(culture = 'USA', department = 'Engineering') {
        return this.getParametersForRole('executive', culture, department);
    }

    // Get parameters for team lead
    getTeamLeadParameters(culture = 'USA', department = 'Engineering') {
        return this.getParametersForRole('team_lead', culture, department);
    }

    // ===== ROLE-SPECIFIC RECOMMENDATIONS =====

    // Get communication recommendations for a role
    getRecommendationsForRole(role, analysisData, cultureContext) {
        const profile = this.roleProfiles[role] || this.roleProfiles['individual_contributor'];
        const recommendations = [];

        // Check tone alignment with role
        const expectedTone = this._getRoleExpectedTone(role);
        if (analysisData.tone && expectedTone.includes(analysisData.tone)) {
            recommendations.push({
                type: 'tone_alignment',
                status: 'optimal',
                message: `✓ Your tone is well-suited for a ${profile.roleName}`,
                strength: 'high'
            });
        } else {
            recommendations.push({
                type: 'tone_alignment',
                status: 'suggestion',
                message: `Consider using a more ${expectedTone[0]?.toLowerCase() || 'professional'} tone for your role`,
                strength: 'medium'
            });
        }

        // Check formality level
        const formalityMatch = this._checkFormalityMatch(role, analysisData, cultureContext);
        if (formalityMatch.matches) {
            recommendations.push({
                type: 'formality',
                status: 'optimal',
                message: '✓ Formality level is appropriate for your role',
                strength: 'high'
            });
        } else {
            recommendations.push({
                type: 'formality',
                status: 'suggestion',
                message: `Adjust formality to ${formalityMatch.suggestion} for better impact`,
                strength: 'medium'
            });
        }

        // Check cultural appropriateness
        const culturalFit = this._checkCulturalFit(role, cultureContext);
        if (culturalFit.appropriate) {
            recommendations.push({
                type: 'cultural_fit',
                status: 'optimal',
                message: `✓ Communication style appropriate for ${cultureContext} culture`,
                strength: 'high'
            });
        } else {
            recommendations.push({
                type: 'cultural_fit',
                status: 'suggestion',
                message: culturalFit.suggestion,
                strength: 'medium',
                adjustments: culturalFit.adjustments
            });
        }

        // Check intent appropriateness
        if (analysisData.intent && profile.intentPreferences[analysisData.intent]) {
            recommendations.push({
                type: 'intent_appropriateness',
                status: 'optimal',
                message: `✓ ${analysisData.intent.replace(/_/g, ' ')} is a common communication for your role`,
                strength: 'high'
            });
        }

        return recommendations;
    }

    // Get cross-role comparison
    getRoleComparison(text, culture = 'USA', department = 'Engineering') {
        const roles = ['manager', 'individual_contributor', 'executive', 'team_lead'];
        const comparison = {
            text: text,
            culture: culture,
            department: department,
            roles: {}
        };

        roles.forEach(role => {
            const params = this.getParametersForRole(role, culture, department);
            comparison.roles[role] = {
                name: this.roleProfiles[role].roleName,
                parameters: params,
                suitability: this._calculateRoleSuitability(role, text),
                recommendations: this._getRoleSpecificTips(role)
            };
        });

        return comparison;
    }

    // ===== ROLE PROFILE CUSTOMIZATION =====

    // Create custom role profile for organization
    createCustomRole(organizationId, roleName, baseRole, customParameters, adjustments = {}) {
        const baseProfile = this.roleProfiles[baseRole];
        if (!baseProfile) {
            return null;
        }

        const customRole = {
            orgId: organizationId,
            id: `role_${Date.now()}`,
            name: roleName,
            baseRole: baseRole,
            createdDate: new Date().toISOString(),
            
            parameters: {
                ...baseProfile.parameters,
                ...customParameters
            },
            
            culturalAdjustments: {
                ...baseProfile.culturalAdjustments,
                ...adjustments.cultural
            },
            
            departmentAdjustments: {
                ...baseProfile.departmentAdjustments,
                ...adjustments.department
            },
            
            intentPreferences: {
                ...baseProfile.intentPreferences,
                ...adjustments.intent
            }
        };

        if (!this.customProfiles[organizationId]) {
            this.customProfiles[organizationId] = [];
        }

        this.customProfiles[organizationId].push(customRole);
        this._persist();

        return customRole;
    }

    // Get custom role for organization
    getCustomRole(organizationId, customRoleName) {
        if (!this.customProfiles[organizationId]) {
            return null;
        }

        return this.customProfiles[organizationId].find(r => r.name === customRoleName);
    }

    // Get all custom roles for organization
    getCustomRoles(organizationId) {
        return this.customProfiles[organizationId] || [];
    }

    // ===== ROLE PROGRESSION =====

    // Get recommended parameter adjustments for role transition
    getRoleTransitionGuidance(currentRole, targetRole, culture = 'USA') {
        const currentParams = this.getParametersForRole(currentRole, culture);
        const targetParams = this.getParametersForRole(targetRole, culture);
        
        const guidance = {
            currentRole: this.roleProfiles[currentRole]?.roleName,
            targetRole: this.roleProfiles[targetRole]?.roleName,
            adjustments: [],
            timeline: '3-6 months'
        };

        // Calculate parameter changes
        for (const [key, targetValue] of Object.entries(targetParams)) {
            if (typeof targetValue === 'object' && targetValue.value) {
                const currentValue = currentParams[key]?.value || 0;
                const diff = targetValue.value - currentValue;

                if (Math.abs(diff) > 5) {
                    guidance.adjustments.push({
                        parameter: key,
                        from: currentValue,
                        to: targetValue.value,
                        change: diff > 0 ? `increase by ${diff}` : `decrease by ${Math.abs(diff)}`,
                        priority: Math.abs(diff) > 15 ? 'high' : 'medium'
                    });
                }
            }
        }

        return guidance;
    }

    // ===== HELPER FUNCTIONS =====

    // Apply cultural adjustments to parameters
    _applyCulturalAdjustments(parameters, culturalAdjustments) {
        const adjusted = { ...parameters };
        
        for (const [paramKey, adjustment] of Object.entries(culturalAdjustments)) {
            if (adjusted[paramKey]) {
                if (typeof adjusted[paramKey] === 'object') {
                    adjusted[paramKey].value = adjustment;
                    adjusted[paramKey].culturallyAdjusted = true;
                } else {
                    adjusted[paramKey] = adjustment;
                }
            }
        }

        return adjusted;
    }

    // Apply department adjustments to parameters
    _applyDepartmentAdjustments(parameters, departmentAdjustments) {
        const adjusted = { ...parameters };
        
        for (const [paramKey, adjustment] of Object.entries(departmentAdjustments)) {
            if (adjusted[paramKey]) {
                if (typeof adjusted[paramKey] === 'object') {
                    adjusted[paramKey].value = Math.round(
                        adjusted[paramKey].value * 0.7 + adjustment * 0.3
                    );
                    adjusted[paramKey].departmentAdjusted = true;
                }
            }
        }

        return adjusted;
    }

    // Normalize parameters to 0-100 scale
    _normalizeParameters(parameters) {
        const normalized = {};
        
        for (const [key, value] of Object.entries(parameters)) {
            if (typeof value === 'object' && value.value !== undefined) {
                normalized[key] = Math.max(0, Math.min(100, value.value));
            } else if (typeof value === 'number') {
                normalized[key] = Math.max(0, Math.min(100, value));
            }
        }

        return normalized;
    }

    // Get expected tones for role
    _getRoleExpectedTone(role) {
        const tones = {
            'manager': ['professional', 'confident', 'supportive'],
            'individual_contributor': ['professional', 'collaborative', 'respectful'],
            'executive': ['professional', 'authoritative', 'inspiring'],
            'team_lead': ['professional', 'supportive', 'clear']
        };

        return tones[role] || ['professional'];
    }

    // Check formality match for role
    _checkFormalityMatch(role, analysisData, cultureContext) {
        const profile = this.roleProfiles[role];
        const targetFormality = profile.parameters.formality.value;
        
        const analysisFormality = analysisData.formalityLevel || 50;
        const difference = Math.abs(targetFormality - analysisFormality);

        return {
            matches: difference < 15,
            suggestion: targetFormality > 70 ? 'higher' : 'lower'
        };
    }

    // Check cultural fit for role
    _checkCulturalFit(role, culture) {
        const profile = this.roleProfiles[role];
        const culturalAdj = profile.culturalAdjustments[culture];

        if (!culturalAdj) {
            return {
                appropriate: true,
                suggestion: 'No specific adjustments needed'
            };
        }

        return {
            appropriate: true,
            suggestion: `Consider emphasizing: ${Object.keys(culturalAdj).join(', ')}`,
            adjustments: culturalAdj
        };
    }

    // Calculate role suitability for given text
    _calculateRoleSuitability(role, text) {
        const profile = this.roleProfiles[role];
        let score = 50; // Base score

        // Simple heuristic-based scoring
        const commandWords = ['must', 'should', 'ensure', 'require'];
        const collaborativeWords = ['let\'s', 'we', 'together', 'collaborate'];
        const visionWords = ['strategy', 'vision', 'direction', 'goal'];

        const textLower = text.toLowerCase();

        if (role === 'manager') {
            score += commandWords.filter(w => textLower.includes(w)).length * 5;
            score += collaborativeWords.filter(w => textLower.includes(w)).length * 3;
        } else if (role === 'individual_contributor') {
            score += collaborativeWords.filter(w => textLower.includes(w)).length * 8;
            score -= commandWords.filter(w => textLower.includes(w)).length * 3;
        } else if (role === 'executive') {
            score += visionWords.filter(w => textLower.includes(w)).length * 7;
            score += commandWords.filter(w => textLower.includes(w)).length * 2;
        }

        return Math.max(0, Math.min(100, score));
    }

    // Get role-specific tips
    _getRoleSpecificTips(role) {
        const tips = {
            'manager': [
                '✓ Use clear language for team clarity',
                '✓ Balance support and accountability',
                '✓ Make decisions visible to team'
            ],
            'individual_contributor': [
                '✓ Collaborate with peers effectively',
                '✓ Ask clarifying questions',
                '✓ Share progress and blockers'
            ],
            'executive': [
                '✓ Connect communications to strategy',
                '✓ Communicate with confidence',
                '✓ Build stakeholder relationships'
            ],
            'team_lead': [
                '✓ Bridge team and management needs',
                '✓ Support individual contributor growth',
                '✓ Escalate appropriately'
            ]
        };

        return tips[role] || [];
    }

    // Persist custom profiles
    _persist() {
        chrome.storage.local.set({
            customRoleProfiles: this.customProfiles
        });
    }

    // Export recommendations
    exportRoleRecommendations(role, culture, department) {
        return {
            role: role,
            roleProfile: this.roleProfiles[role],
            parameters: this.getParametersForRole(role, culture, department),
            recommendations: this.getRecommendationsForRole(role, {}, culture),
            exportDate: new Date().toISOString()
        };
    }

    // Get all available roles
    getAllRoles() {
        return Object.keys(this.roleProfiles).map(key => ({
            key: key,
            name: this.roleProfiles[key].roleName,
            description: this.roleProfiles[key].description
        }));
    }
}

// Export for use in popup.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RoleBasedRecommender;
}
