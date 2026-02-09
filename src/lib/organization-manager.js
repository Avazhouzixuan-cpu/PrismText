// ========================================
// OrganizationManager Module (Iterations 41-45)
// Manages organization profiles, members, roles, and team structures
// ========================================

class OrganizationManager {
    constructor() {
        this.organizations = {}; // { orgId: { name, industry, domain, members, settings } }
        this.currentOrgId = null;
        this.userRole = 'individual_contributor'; // Default role
        this.init();
    }

    // Initialize from Chrome Storage
    init() {
        chrome.storage.local.get(['organizations', 'currentOrgId', 'userRole'], (result) => {
            if (result.organizations) {
                this.organizations = result.organizations;
            }
            if (result.currentOrgId) {
                this.currentOrgId = result.currentOrgId;
            }
            if (result.userRole) {
                this.userRole = result.userRole;
            }
        });
    }

    // ===== ORGANIZATION MANAGEMENT =====

    // Create new organization
    createOrganization(name, industry, domain) {
        const orgId = `org_${Date.now()}`;
        
        this.organizations[orgId] = {
            id: orgId,
            name: name,
            industry: industry, // e.g., 'tech', 'finance', 'healthcare', 'retail'
            domain: domain, // e.g., '@company.com'
            createdDate: new Date().toISOString(),
            createdBy: 'user',
            
            // Organization settings
            settings: {
                communicationStyle: 'professional', // 'professional', 'casual', 'diplomatic'
                primaryLanguages: ['en'],
                culturalAdaptation: 'on', // 'on' or 'off'
                formalityLevel: 'high', // 'low', 'medium', 'high'
                directnessPreference: 'high', // 'low', 'medium', 'high'
                enforceStandards: false
            },
            
            // Members and roles
            members: [
                {
                    id: 'user',
                    email: 'user@company.com',
                    name: 'User',
                    role: 'admin',
                    joinDate: new Date().toISOString(),
                    department: 'Management'
                }
            ],
            
            // Departments
            departments: [
                {
                    id: 'dept_mgmt',
                    name: 'Management',
                    leads: [],
                    communicationStyle: 'professional'
                },
                {
                    id: 'dept_eng',
                    name: 'Engineering',
                    leads: [],
                    communicationStyle: 'casual'
                },
                {
                    id: 'dept_sales',
                    name: 'Sales',
                    leads: [],
                    communicationStyle: 'warm'
                }
            ],
            
            // Team-level statistics
            stats: {
                totalCommunications: 0,
                averageQualityScore: 0,
                topCultures: {},
                commonIntents: {},
                successRate: 0
            }
        };

        this.currentOrgId = orgId;
        this._persist();
        return this.organizations[orgId];
    }

    // Get current organization
    getCurrentOrg() {
        if (!this.currentOrgId || !this.organizations[this.currentOrgId]) {
            return null;
        }
        return this.organizations[this.currentOrgId];
    }

    // Switch organization
    switchOrganization(orgId) {
        if (!this.organizations[orgId]) {
            console.error('Organization not found:', orgId);
            return false;
        }
        this.currentOrgId = orgId;
        this._persist();
        return true;
    }

    // Update organization settings
    updateOrgSettings(orgId, newSettings) {
        if (!this.organizations[orgId]) {
            return false;
        }

        this.organizations[orgId].settings = {
            ...this.organizations[orgId].settings,
            ...newSettings
        };

        this._persist();
        return true;
    }

    // ===== MEMBER MANAGEMENT =====

    // Add member to organization
    addMember(organizationId, email, name, role, department) {
        if (!this.organizations[organizationId]) {
            return null;
        }

        const member = {
            id: `member_${Date.now()}`,
            email: email,
            name: name,
            role: role, // 'admin', 'manager', 'individual_contributor', 'executive'
            department: department,
            joinDate: new Date().toISOString(),
            communicationPreferences: {},
            feedback: { submitted: 0, received: 0 }
        };

        this.organizations[organizationId].members.push(member);
        this._persist();
        return member;
    }

    // Update member role
    updateMemberRole(organizationId, memberId, newRole) {
        if (!this.organizations[organizationId]) {
            return false;
        }

        const member = this.organizations[organizationId].members.find(m => m.id === memberId);
        if (!member) {
            return false;
        }

        member.role = newRole;
        this._persist();
        return true;
    }

    // Get member profile
    getMemberProfile(organizationId, memberId) {
        if (!this.organizations[organizationId]) {
            return null;
        }

        return this.organizations[organizationId].members.find(m => m.id === memberId);
    }

    // Get all members
    getMembers(organizationId) {
        if (!this.organizations[organizationId]) {
            return [];
        }

        return this.organizations[organizationId].members;
    }

    // Get members by department
    getMembersByDepartment(organizationId, department) {
        if (!this.organizations[organizationId]) {
            return [];
        }

        return this.organizations[organizationId].members.filter(m => m.department === department);
    }

    // Get members by role
    getMembersByRole(organizationId, role) {
        if (!this.organizations[organizationId]) {
            return [];
        }

        return this.organizations[organizationId].members.filter(m => m.role === role);
    }

    // ===== DEPARTMENT MANAGEMENT =====

    // Create department
    createDepartment(organizationId, name, communicationStyle = 'professional') {
        if (!this.organizations[organizationId]) {
            return null;
        }

        const department = {
            id: `dept_${Date.now()}`,
            name: name,
            leads: [],
            communicationStyle: communicationStyle, // 'professional', 'casual', 'diplomatic', 'warm'
            members: [],
            stats: {
                totalCommunications: 0,
                averageQualityScore: 0,
                successRate: 0
            }
        };

        this.organizations[organizationId].departments.push(department);
        this._persist();
        return department;
    }

    // Add department lead
    addDepartmentLead(organizationId, departmentId, memberId) {
        if (!this.organizations[organizationId]) {
            return false;
        }

        const dept = this.organizations[organizationId].departments.find(d => d.id === departmentId);
        if (!dept || dept.leads.includes(memberId)) {
            return false;
        }

        dept.leads.push(memberId);
        this._persist();
        return true;
    }

    // Get department
    getDepartment(organizationId, departmentId) {
        if (!this.organizations[organizationId]) {
            return null;
        }

        return this.organizations[organizationId].departments.find(d => d.id === departmentId);
    }

    // Get all departments
    getDepartments(organizationId) {
        if (!this.organizations[organizationId]) {
            return [];
        }

        return this.organizations[organizationId].departments;
    }

    // ===== ORGANIZATION STATISTICS =====

    // Record communication analysis (called from performAnalysis)
    recordOrgCommunication(organizationId, analysisData, qualityScore) {
        if (!this.organizations[organizationId]) {
            return false;
        }

        const org = this.organizations[organizationId];

        // Update org-level stats
        org.stats.totalCommunications++;
        org.stats.averageQualityScore = 
            (org.stats.averageQualityScore * (org.stats.totalCommunications - 1) + qualityScore) / 
            org.stats.totalCommunications;

        // Track cultures used
        if (analysisData.culture) {
            org.stats.topCultures[analysisData.culture] = 
                (org.stats.topCultures[analysisData.culture] || 0) + 1;
        }

        // Track intents
        if (analysisData.intent) {
            org.stats.commonIntents[analysisData.intent] = 
                (org.stats.commonIntents[analysisData.intent] || 0) + 1;
        }

        // Calculate success rate (rough: quality > 70 = success)
        const successCount = Object.entries(org.stats).filter(([k, v]) => v > 70).length;
        org.stats.successRate = Math.round((successCount / org.stats.totalCommunications) * 100);

        this._persist();
        return true;
    }

    // Get organization statistics
    getOrgStatistics(organizationId) {
        if (!this.organizations[organizationId]) {
            return null;
        }

        const org = this.organizations[organizationId];
        return {
            totalCommunications: org.stats.totalCommunications,
            averageQuality: org.stats.averageQualityScore.toFixed(2),
            successRate: org.stats.successRate,
            topCultures: this._sortStats(org.stats.topCultures).slice(0, 5),
            commonIntents: this._sortStats(org.stats.commonIntents).slice(0, 5)
        };
    }

    // Get department statistics
    getDepartmentStatistics(organizationId, departmentId) {
        const dept = this.getDepartment(organizationId, departmentId);
        if (!dept) {
            return null;
        }

        return {
            name: dept.name,
            communicationStyle: dept.communicationStyle,
            totalCommunications: dept.stats.totalCommunications,
            averageQuality: dept.stats.averageQualityScore.toFixed(2),
            successRate: dept.stats.successRate,
            memberCount: this.getMembersByDepartment(organizationId, dept.name).length
        };
    }

    // ===== COMPLIANCE & STANDARDS =====

    // Get organization compliance policy
    getCompliancePolicy(organizationId) {
        if (!this.organizations[organizationId]) {
            return null;
        }

        const org = this.organizations[organizationId];
        return {
            organizationId: organizationId,
            organizationName: org.name,
            industry: org.industry,
            
            // Communication Standards
            standards: {
                communicationStyle: org.settings.communicationStyle,
                formalityLevel: org.settings.formalityLevel,
                directnessPreference: org.settings.directnessPreference,
                allowedLanguages: org.settings.primaryLanguages,
                culturalAdaptation: org.settings.culturalAdaptation === 'on'
            },
            
            // Role-based permissions
            rolePermissions: this._getRolePermissions(org),
            
            // Enforcement status
            enforced: org.settings.enforceStandards,
            warnings: this._validateCompliance(org)
        };
    }

    // Validate message against compliance
    validateCompliance(organizationId, analysisData) {
        const policy = this.getCompliancePolicy(organizationId);
        if (!policy) {
            return { compliant: true, violations: [] };
        }

        const violations = [];

        // Check communication style
        if (policy.enforced && analysisData.style) {
            if (analysisData.style !== policy.standards.communicationStyle) {
                violations.push({
                    type: 'style_mismatch',
                    expected: policy.standards.communicationStyle,
                    actual: analysisData.style,
                    severity: 'warning'
                });
            }
        }

        // Check formality level
        if (policy.enforced && analysisData.formalityLevel) {
            const expectedFormality = policy.standards.formalityLevel === 'high' ? 70 : 
                                     policy.standards.formalityLevel === 'medium' ? 50 : 30;
            if (Math.abs(analysisData.formalityLevel - expectedFormality) > 20) {
                violations.push({
                    type: 'formality_mismatch',
                    expected: expectedFormality,
                    actual: analysisData.formalityLevel,
                    severity: 'warning'
                });
            }
        }

        // Check language
        const language = analysisData.language?.detected || 'en';
        if (!policy.standards.allowedLanguages.includes(language)) {
            violations.push({
                type: 'language_not_allowed',
                language: language,
                severity: 'info'
            });
        }

        return {
            compliant: violations.length === 0 || !policy.enforced,
            violations: violations,
            policy: policy
        };
    }

    // ===== HELPER FUNCTIONS =====

    // Get role-based permissions
    _getRolePermissions(org) {
        return {
            'admin': {
                canCreateOrg: true,
                canManageMembers: true,
                canUpdateSettings: true,
                canViewAllAnalytics: true,
                canEnforceStandards: true
            },
            'manager': {
                canCreateOrg: false,
                canManageMembers: false,
                canUpdateSettings: false,
                canViewAllAnalytics: true,
                canEnforceStandards: false
            },
            'individual_contributor': {
                canCreateOrg: false,
                canManageMembers: false,
                canUpdateSettings: false,
                canViewAllAnalytics: false,
                canEnforceStandards: false
            },
            'executive': {
                canCreateOrg: true,
                canManageMembers: true,
                canUpdateSettings: true,
                canViewAllAnalytics: true,
                canEnforceStandards: true
            }
        };
    }

    // Validate organization compliance
    _validateCompliance(org) {
        const warnings = [];

        if (org.settings.enforceStandards && org.members.length < 2) {
            warnings.push('Enforcement enabled but organization has minimal members');
        }

        if (org.stats.successRate < 60 && org.stats.totalCommunications > 20) {
            warnings.push('Organization-wide success rate below 60% - consider reviewing standards');
        }

        return warnings;
    }

    // Sort statistics object
    _sortStats(obj) {
        return Object.entries(obj)
            .map(([key, value]) => ({ key, value, label: `${key}: ${value}` }))
            .sort((a, b) => b.value - a.value);
    }

    // Persist to Chrome Storage
    _persist() {
        chrome.storage.local.set({
            organizations: this.organizations,
            currentOrgId: this.currentOrgId,
            userRole: this.userRole
        });
    }

    // Export organization data
    exportOrgData(organizationId) {
        if (!this.organizations[organizationId]) {
            return null;
        }

        const org = this.organizations[organizationId];
        return {
            organization: org,
            statistics: this.getOrgStatistics(organizationId),
            departments: this.getDepartments(organizationId).map(d => 
                this.getDepartmentStatistics(organizationId, d.id)
            ),
            members: this.getMembers(organizationId),
            compliancePolicy: this.getCompliancePolicy(organizationId),
            exportDate: new Date().toISOString()
        };
    }

    // Get all organizations
    getAllOrganizations() {
        return Object.values(this.organizations);
    }

    // Get organization by domain
    getOrganizationByDomain(domain) {
        return Object.values(this.organizations).find(org => org.domain === domain);
    }

    // Delete organization (admin only)
    deleteOrganization(organizationId) {
        if (!this.organizations[organizationId]) {
            return false;
        }

        delete this.organizations[organizationId];
        if (this.currentOrgId === organizationId) {
            this.currentOrgId = null;
        }

        this._persist();
        return true;
    }
}

// Export for use in popup.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OrganizationManager;
}
