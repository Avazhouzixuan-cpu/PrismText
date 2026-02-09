// ========================================
// DashboardEngine Module (Iterations 61-70)
// Real-time metrics visualization and widget system
// ========================================

class DashboardEngine {
    constructor() {
        this.dashboards = {}; // { dashboardId: dashboard config }
        this.widgets = {}; // { widgetId: widget definition }
        this.charts = {}; // { chartId: chart data }
        this.layouts = {}; // { layoutId: layout config }
        this.customizations = {}; // { customizationId: user preferences }
        this.init();
    }

    // Initialize from Chrome Storage
    init() {
        chrome.storage.local.get(
            ['engineDashboards', 'engineWidgets', 'engineCharts', 'layouts', 'customizations'],
            (result) => {
                if (result.engineDashboards) this.dashboards = result.engineDashboards;
                if (result.engineWidgets) this.widgets = result.engineWidgets;
                if (result.engineCharts) this.charts = result.engineCharts;
                if (result.layouts) this.layouts = result.layouts;
                if (result.customizations) this.customizations = result.customizations;
            }
        );
    }

    // ===== DASHBOARD CREATION =====

    // Create new dashboard
    createDashboard(organizationId, config) {
        const dashboardId = `dashboard_${Date.now()}`;

        const dashboard = {
            id: dashboardId,
            organizationId,
            name: config.name,
            description: config.description,
            createdDate: new Date().toISOString(),
            lastModified: new Date().toISOString(),

            layout: {
                columns: config.columns || 3,
                rowHeight: config.rowHeight || 300,
                theme: config.theme || 'light'
            },

            widgets: [],
            
            refreshRate: config.refreshRate || 5000, // 5 seconds
            autoRefresh: config.autoRefresh !== false,
            
            categories: config.categories || [
                'communication_quality',
                'team_engagement',
                'compliance_metrics',
                'forecast_trends'
            ],

            permissions: {
                viewers: config.viewers || [],
                editors: config.editors || [],
                owner: config.owner
            },

            status: 'active',
            isPublic: config.isPublic || false
        };

        this.dashboards[dashboardId] = dashboard;
        this._persist();

        return dashboard;
    }

    // Add widget to dashboard
    addWidget(dashboardId, widgetConfig) {
        const dashboard = this.dashboards[dashboardId];
        if (!dashboard) return null;

        const widgetId = `widget_${Date.now()}`;
        const widget = this._createWidget(widgetId, widgetConfig);

        dashboard.widgets.push({
            id: widgetId,
            position: {
                x: widgetConfig.x || 0,
                y: widgetConfig.y || 0,
                width: widgetConfig.width || 1,
                height: widgetConfig.height || 1
            }
        });

        this.widgets[widgetId] = widget;
        this._persist();

        return widget;
    }

    // Create widget with specific configuration
    _createWidget(widgetId, config) {
        return {
            id: widgetId,
            type: config.type, // 'line', 'bar', 'gauge', 'heatmap', 'kpi', 'table'
            title: config.title,
            description: config.description,

            dataSource: {
                metric: config.metric,
                timeWindow: config.timeWindow || 'day',
                refreshInterval: config.refreshInterval || 5000
            },

            visualization: {
                chartType: config.chartType || 'line',
                colorScheme: config.colorScheme || 'default',
                showLegend: config.showLegend !== false,
                showGrid: config.showGrid !== false,
                animated: config.animated !== false
            },

            thresholds: {
                critical: config.criticalThreshold || 50,
                warning: config.warningThreshold || 70,
                success: config.successThreshold || 85
            },

            actions: config.actions || []
        };
    }

    // ===== WIDGET MANAGEMENT =====

    // Get widget data for rendering
    getWidgetData(widgetId, organizationId, timeRange = 'day') {
        const widget = this.widgets[widgetId];
        if (!widget) return null;

        // Simulate data based on metric type
        const data = this._generateChartData(widget, timeRange);

        return {
            widget,
            data,
            metadata: {
                lastUpdated: new Date().toISOString(),
                dataPoints: data.length || 0,
                timeRange
            }
        };
    }

    // Generate chart data based on widget configuration
    _generateChartData(widget, timeRange) {
        const metrics = {
            line: this._generateLineChartData(widget, timeRange),
            bar: this._generateBarChartData(widget, timeRange),
            gauge: this._generateGaugeData(widget),
            heatmap: this._generateHeatmapData(widget, timeRange),
            kpi: this._generateKPIData(widget),
            table: this._generateTableData(widget, timeRange)
        };

        return metrics[widget.visualization.chartType] || metrics.line;
    }

    _generateLineChartData(widget, timeRange) {
        const points = timeRange === 'day' ? 24 : (timeRange === 'week' ? 7 : 30);
        const data = [];
        
        for (let i = 0; i < points; i++) {
            data.push({
                label: this._getTimeLabel(i, timeRange),
                value: 60 + Math.random() * 40,
                trend: Math.random() > 0.5 ? 'up' : 'down'
            });
        }
        
        return data;
    }

    _generateBarChartData(widget, timeRange) {
        return [
            { label: 'Quality', value: 78, color: '#667eea' },
            { label: 'Engagement', value: 72, color: '#764ba2' },
            { label: 'Compliance', value: 85, color: '#32c787' },
            { label: 'Forecast', value: 76, color: '#f5a623' }
        ];
    }

    _generateGaugeData(widget) {
        return {
            current: 75,
            min: 0,
            max: 100,
            critical: widget.thresholds.critical,
            warning: widget.thresholds.warning,
            success: widget.thresholds.success,
            status: 'good'
        };
    }

    _generateHeatmapData(widget, timeRange) {
        const data = [];
        const hours = 24;
        const days = timeRange === 'week' ? 7 : 30;

        for (let d = 0; d < days; d++) {
            for (let h = 0; h < hours; h++) {
                data.push({
                    day: d,
                    hour: h,
                    value: Math.random() * 100,
                    intensity: Math.random()
                });
            }
        }

        return data;
    }

    _generateKPIData(widget) {
        return {
            current: 76.5,
            previous: 74.2,
            change: 2.3,
            changePercent: 3.1,
            trend: 'improving',
            target: 80,
            unit: '%'
        };
    }

    _generateTableData(widget, timeRange) {
        return [
            { metric: 'Quality Score', value: 78, trend: 'up', change: '+2.3%' },
            { metric: 'Team Engagement', value: 72, trend: 'down', change: '-1.5%' },
            { metric: 'Compliance Rate', value: 85, trend: 'up', change: '+5.2%' },
            { metric: 'Forecast Accuracy', value: 82, trend: 'up', change: '+3.1%' }
        ];
    }

    _getTimeLabel(index, timeRange) {
        if (timeRange === 'day') {
            return `${index}:00`;
        } else if (timeRange === 'week') {
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            return days[index];
        } else {
            return `Day ${index + 1}`;
        }
    }

    // ===== LAYOUT MANAGEMENT =====

    // Create dashboard layout template
    createLayout(name, config) {
        const layoutId = `layout_${Date.now()}`;

        const layout = {
            id: layoutId,
            name,
            description: config.description,
            
            grid: {
                columns: config.columns || 3,
                rows: config.rows || 4,
                gap: config.gap || 16
            },

            widgetTemplates: config.widgetTemplates || [],

            responsive: {
                tablet: config.tablet || { columns: 2 },
                mobile: config.mobile || { columns: 1 }
            },

            status: 'active'
        };

        this.layouts[layoutId] = layout;
        this._persist();

        return layout;
    }

    // Get responsive layout for device
    getResponsiveLayout(layoutId, deviceType = 'desktop') {
        const layout = this.layouts[layoutId];
        if (!layout) return null;

        const config = {
            desktop: layout.grid,
            tablet: layout.responsive.tablet,
            mobile: layout.responsive.mobile
        };

        return config[deviceType] || config.desktop;
    }

    // ===== CHART STYLING =====

    // Get color scheme
    getColorScheme(schemeType = 'default') {
        const schemes = {
            default: {
                primary: '#667eea',
                secondary: '#764ba2',
                success: '#32c787',
                warning: '#f5a623',
                danger: '#e74c3c'
            },
            pastel: {
                primary: '#a8d8ea',
                secondary: '#aa96da',
                success: '#fcbad3',
                warning: '#ffffd2',
                danger: '#ffcccb'
            },
            contrast: {
                primary: '#000000',
                secondary: '#ffffff',
                success: '#00c000',
                warning: '#ffff00',
                danger: '#ff0000'
            }
        };

        return schemes[schemeType] || schemes.default;
    }

    // Apply custom styling
    applyCustomization(dashboardId, customization) {
        const customId = `custom_${Date.now()}`;

        const customConfig = {
            id: customId,
            dashboardId,
            colors: customization.colors || {},
            fonts: customization.fonts || { family: 'sans-serif', size: 12 },
            spacing: customization.spacing || { padding: 16, margin: 8 },
            borders: customization.borders || { width: 1, radius: 4 },
            shadows: customization.shadows || { blur: 8, spread: 0 }
        };

        this.customizations[customId] = customConfig;
        this._persist();

        return customConfig;
    }

    // ===== DASHBOARD TEMPLATES =====

    // Get predefined dashboard template
    getDashboardTemplate(templateName) {
        const templates = {
            executive_summary: {
                name: 'Executive Summary',
                columns: 2,
                widgets: [
                    { type: 'gauge', title: 'Overall Health', metric: 'health_score', height: 2 },
                    { type: 'kpi', title: 'Quality Trend', metric: 'quality_score' },
                    { type: 'bar', title: 'Team Performance', metric: 'team_metrics', height: 2 },
                    { type: 'line', title: 'Forecast', metric: 'forecast_trend', height: 2 }
                ]
            },
            operations: {
                name: 'Operations Dashboard',
                columns: 3,
                widgets: [
                    { type: 'table', title: 'Active Alerts', metric: 'alerts' },
                    { type: 'kpi', title: 'Violations', metric: 'violation_count' },
                    { type: 'gauge', title: 'Compliance', metric: 'compliance_score' },
                    { type: 'line', title: 'Quality Trend', metric: 'quality_time_series', height: 2, width: 2 },
                    { type: 'heatmap', title: 'Activity Heatmap', metric: 'activity_heatmap', height: 2, width: 2 }
                ]
            },
            team_analytics: {
                name: 'Team Analytics',
                columns: 3,
                widgets: [
                    { type: 'bar', title: 'Team Scores', metric: 'team_comparison', height: 2, width: 2 },
                    { type: 'gauge', title: 'Engagement', metric: 'engagement_score' },
                    { type: 'line', title: 'Communication Trend', metric: 'communication_trend', width: 3, height: 2 },
                    { type: 'table', title: 'Team Members', metric: 'member_stats' }
                ]
            }
        };

        return templates[templateName] || null;
    }

    // Create dashboard from template
    createFromTemplate(organizationId, templateName, config) {
        const template = this.getDashboardTemplate(templateName);
        if (!template) return null;

        const dashboard = this.createDashboard(organizationId, {
            name: config.name || template.name,
            description: config.description || '',
            columns: template.columns,
            widgets: template.widgets
        });

        // Add default widgets
        template.widgets.forEach(widgetConfig => {
            this.addWidget(dashboard.id, widgetConfig);
        });

        return dashboard;
    }

    // ===== REAL-TIME UPDATES =====

    // Update dashboard data
    updateDashboardData(dashboardId, updates) {
        const dashboard = this.dashboards[dashboardId];
        if (!dashboard) return false;

        dashboard.lastModified = new Date().toISOString();
        
        if (updates.name) dashboard.name = updates.name;
        if (updates.refreshRate) dashboard.refreshRate = updates.refreshRate;
        if (updates.autoRefresh !== undefined) dashboard.autoRefresh = updates.autoRefresh;

        this._persist();
        return true;
    }

    // Get live dashboard data
    getLiveDashboardData(dashboardId, organizationId) {
        const dashboard = this.dashboards[dashboardId];
        if (!dashboard) return null;

        const widgetData = dashboard.widgets.map(w => ({
            ...w,
            data: this.getWidgetData(w.id, organizationId)
        }));

        return {
            dashboard,
            widgets: widgetData,
            lastUpdate: new Date().toISOString(),
            nextRefresh: new Date(Date.now() + dashboard.refreshRate).toISOString()
        };
    }

    // ===== HELPER FUNCTIONS =====

    _persist() {
        chrome.storage.local.set({
            engineDashboards: this.dashboards,
            engineWidgets: this.widgets,
            engineCharts: this.charts,
            layouts: this.layouts,
            customizations: this.customizations
        });
    }

    // List all dashboards for organization
    listDashboards(organizationId, filter = {}) {
        return Object.values(this.dashboards)
            .filter(d => d.organizationId === organizationId)
            .filter(d => {
                if (filter.status && d.status !== filter.status) return false;
                if (filter.name && !d.name.toLowerCase().includes(filter.name.toLowerCase())) return false;
                return true;
            });
    }

    // Get dashboard statistics
    getDashboardStats(dashboardId) {
        const dashboard = this.dashboards[dashboardId];
        if (!dashboard) return null;

        return {
            widgetCount: dashboard.widgets.length,
            lastModified: dashboard.lastModified,
            createdDate: dashboard.createdDate,
            daysOld: Math.floor((Date.now() - new Date(dashboard.createdDate)) / (1000 * 60 * 60 * 24)),
            refreshRate: dashboard.refreshRate,
            autoRefresh: dashboard.autoRefresh
        };
    }

    // Export dashboard configuration
    exportDashboard(dashboardId) {
        const dashboard = this.dashboards[dashboardId];
        if (!dashboard) return null;

        return JSON.stringify({
            name: dashboard.name,
            description: dashboard.description,
            layout: dashboard.layout,
            widgets: dashboard.widgets.map(w => this.widgets[w.id]),
            exportDate: new Date().toISOString(),
            version: '1.0'
        }, null, 2);
    }

    // Share dashboard
    shareDashboard(dashboardId, recipientId, permission = 'view') {
        const dashboard = this.dashboards[dashboardId];
        if (!dashboard) return false;

        const targetList = permission === 'view' ? dashboard.permissions.viewers : dashboard.permissions.editors;
        
        if (!targetList.includes(recipientId)) {
            targetList.push(recipientId);
            this._persist();
        }

        return true;
    }
}

// Export for use in popup.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardEngine;
}
