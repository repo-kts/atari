import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, FileBarChart, AlertCircle, CheckCircle2, Layout, MapPin, Calendar, Loader2 } from 'lucide-react';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Card, CardContent } from '../../components/ui/Card';
import { ReportScopeSelector } from '../../components/reports/ReportScopeSelector';
import { TimelineFilter } from '../../components/reports/TimelineFilter';
import { ReportModuleSelector } from '../../components/reports/ReportModuleSelector';
import { ReportPreview } from '../../components/reports/ReportPreview';
import { reportApi } from '../../services/reportApi';
import { useAuth } from '../../contexts/AuthContext';
import { getBreadcrumbsForPath, getRouteConfig } from '../../config/route';
import { useReportConfig } from '../../hooks/report/useReportScope';
import { Button } from '../../components/ui/Button';
import type { ReportFilters } from '../../types/reports';
import type { ReportScope } from '../../types/reportScope';

export const KvkReportPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const routeConfig = getRouteConfig(location.pathname);
    const breadcrumbs = getBreadcrumbsForPath(location.pathname);

    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [selectedScope, setSelectedScope] = useState<ReportScope | null>(null);

    // Filter states
    const [filterType, setFilterType] = useState<'none' | 'dateRange' | 'year'>('none');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set());
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);

    // Load report configuration using TanStack Query
    const reportConfigQuery = useReportConfig();

    // Initialize all sections as selected by default
    useEffect(() => {
        if (reportConfigQuery.data?.sections && selectedSections.size === 0) {
            // Select only functional sections (those with a data source) by default
            const functionalSections = reportConfigQuery.data.sections
                .filter(s => !!s.dataSource)
                .map(s => s.id);
            setSelectedSections(new Set(functionalSections));
        }
    }, [reportConfigQuery.data?.sections]);

    const handleSectionToggle = (sectionId: string) => {
        const newSelected = new Set(selectedSections);
        if (newSelected.has(sectionId)) {
            newSelected.delete(sectionId);
        } else {
            newSelected.add(sectionId);
        }
        setSelectedSections(newSelected);
    };

    const handleCategorySelectAll = (sectionIds: string[]) => {
        const newSelected = new Set(selectedSections);
        const allInCategorySelected = sectionIds.every(id => newSelected.has(id));

        if (allInCategorySelected) {
            // Deselect all in category
            sectionIds.forEach(id => newSelected.delete(id));
        } else {
            // Select all in category
            sectionIds.forEach(id => newSelected.add(id));
        }
        setSelectedSections(newSelected);
    };

    // Handle errors
    useEffect(() => {
        if (reportConfigQuery.error) {
            setError(
                reportConfigQuery.error instanceof Error
                    ? reportConfigQuery.error.message
                    : 'Failed to load report configuration'
            );
        }
    }, [reportConfigQuery.error]);

    const handleApplySelection = () => {
        setIsLeftPanelCollapsed(true);
        setSuccess('Selection applied. Previewing report data...');
        setTimeout(() => setSuccess(null), 3000);
    };

    const handleGenerate = async (
        sectionIds: string[],
        filters: ReportFilters,
        scope?: ReportScope | null
    ) => {
        try {
            setIsGenerating(true);
            setError(null);
            setSuccess(null);

            const request: any = {
                sectionIds,
                filters,
            };

            // If scope is provided, use aggregated report
            if (scope && Object.keys(scope).length > 0) {
                request.scope = scope;
                const blob = await reportApi.generateAggregatedReport(request);
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `Aggregated_Report_${Date.now()}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } else {
                // Single KVK report
                const kvkId = user?.kvkId || undefined;
                request.kvkId = kvkId;
                await reportApi.downloadReport(
                    request,
                    `KVK_Report_${kvkId || 'All'}_${Date.now()}.pdf`
                );
            }

            setSuccess('Report generated and downloaded successfully!');
        } catch (err) {
            console.error('Error generating report:', err);
            setError(err instanceof Error ? err.message : 'Failed to generate report');
        } finally {
            setIsGenerating(false);
        }
    };


    return (
        <div className="bg-white rounded-2xl p-1 min-h-screen">
            {/* Back + Breadcrumbs + Focus Mode */}
            <div className="mb-4 flex items-center justify-between px-6 pt-4 shrink-0">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#487749] border border-[#E0E0E0] rounded-xl hover:bg-[#F5F5F5] transition-colors"
                        onClick={() => {
                            if (routeConfig?.parent) {
                                navigate(routeConfig.parent);
                            } else {
                                navigate('/dashboard');
                            }
                        }}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                    </Button>
                    {breadcrumbs.length > 0 && (
                        <div className="text-[15px] font-medium">
                            <Breadcrumbs items={breadcrumbs.map((b, i) => ({ ...b, level: i }))} showHome={false} />
                        </div>
                    )}
                </div>
                <Button
                    variant="outline"
                    size="md"
                    onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
                    className={`rounded-2xl px-5 py-2.5 h-12 flex items-center gap-3 border-[#E0E0E0] shadow-sm transition-all hover:border-[#487749] hover:bg-[#487749]/5 ${isLeftPanelCollapsed ? 'text-[#487749] border-[#487749]' : 'text-[#757575]'}`}
                >
                    <Layout className={`w-5 h-5 transition-transform duration-500 ${isLeftPanelCollapsed ? 'rotate-180' : ''}`} />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">{isLeftPanelCollapsed ? 'Show Options' : 'Focus Mode'}</span>
                </Button>
            </div>

            <Card className="bg-[#FAF9F6] border-none shadow-none">
                <CardContent className="p-6">
                    {/* Header with title and main actions */}
                    <div className="mb-4 flex justify-between items-center bg-white p-4 rounded-2xl border border-[#EEEEEE] shadow-sm">
                        <div className="flex-1">
                            <h2 className="text-xl font-semibold text-[#487749] flex items-center gap-2">
                                <FileBarChart className="w-6 h-6" />
                                KVK Comprehensive Report
                                <span className="ml-2 px-3 py-1 bg-[#487749]/10 text-[#487749] text-[10px] font-black uppercase rounded-full border border-[#487749]/20">
                                    {selectedSections.size} Modules
                                </span>
                            </h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="md"
                                onClick={() => {
                                    setSelectedSections(new Set());
                                    setSelectedScope({});
                                }}
                                className="rounded-full px-6 hover:bg-red-50 hover:text-red-600 border-[#E0E0E0] h-10 text-xs font-bold"
                            >
                                Reset
                            </Button>
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={() => {
                                    const filters: ReportFilters = {};
                                    if (filterType === 'dateRange' && startDate && endDate) {
                                        filters.startDate = startDate;
                                        filters.endDate = endDate;
                                    } else if (filterType === 'year') {
                                        filters.year = year;
                                    }
                                    handleGenerate(Array.from(selectedSections), filters, selectedScope);
                                }}
                                disabled={isGenerating || selectedSections.size === 0}
                                className="rounded-full px-10 h-10 shadow-lg shadow-[#487749]/20 text-sm font-bold"
                            >
                                {isGenerating ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    "Generate Report"
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Error/Success Messages */}
                    <div>
                        {error && (
                            <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm animate-in slide-in-from-top-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                        {success && (
                            <div className="mb-6 flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm animate-in slide-in-from-top-2">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <span>{success}</span>
                            </div>
                        )}
                    </div>

                    {reportConfigQuery.isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-10 h-10 border-4 border-[#487749] border-t-transparent rounded-full animate-spin" />
                                <p className="text-base font-medium text-[#757575]">Preparing your report workspace...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-10 items-start relative min-h-[700px]">
                            {/* Left Side: Configuration Sidebar */}
                            <div className={`transition-all duration-700 ease-in-out shrink-0 ${isLeftPanelCollapsed ? 'w-full lg:w-[80px]' : 'w-full lg:w-[300px]'}`}>
                                {isLeftPanelCollapsed ? (
                                    <div className="flex flex-col items-center gap-6 py-6 bg-white border border-[#E0E0E0] rounded-2xl shadow-sm">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsLeftPanelCollapsed(false)}
                                            className="w-12 h-12 rounded-xl flex items-center justify-center border-[#487749] text-[#487749] hover:bg-[#487749] hover:text-white transition-all shadow-sm"
                                            title="Expand Configuration"
                                        >
                                            <Layout className="w-6 h-6 rotate-90" />
                                        </Button>

                                        <div className="h-px w-8 bg-[#E0E0E0]" />

                                        <div className="flex flex-col items-center gap-8">
                                            {[
                                                { icon: <MapPin className="w-5 h-5" />, count: selectedScope?.kvkIds?.length || selectedScope?.districtIds?.length || selectedScope?.stateIds?.length || selectedScope?.zoneIds?.length || 0 },
                                                { icon: <Layout className="w-5 h-5" />, count: selectedSections.size },
                                                { icon: <Calendar className="w-5 h-5" />, count: filterType === 'none' ? 'All' : (filterType === 'year' ? year : 'Date') }
                                            ].map((item, i) => (
                                                <div key={i} className="flex flex-col items-center">
                                                    <div className="p-3 bg-[#487749]/5 text-[#487749] rounded-xl mb-1 border border-[#487749]/10">
                                                        {item.icon}
                                                    </div>
                                                    <span className="text-[10px] font-black text-[#487749]">{item.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        <ReportScopeSelector
                                            onScopeChange={setSelectedScope}
                                            disabled={isGenerating}
                                        />
                                        <ReportModuleSelector
                                            sections={reportConfigQuery.data?.sections || []}
                                            selectedSections={selectedSections}
                                            onSectionToggle={handleSectionToggle}
                                            onCategorySelectAll={handleCategorySelectAll}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Right Side: Filters and Content Area */}
                            <div className={`transition-all duration-500 ease-in-out min-w-0 ${isLeftPanelCollapsed ? 'flex-1' : 'flex-1'}`}>
                                <div className="flex flex-col gap-8">
                                    {/* Timeline Filter Area */}
                                    <TimelineFilter
                                        filterType={filterType}
                                        onFilterTypeChange={setFilterType}
                                        startDate={startDate}
                                        onStartDateChange={setStartDate}
                                        endDate={endDate}
                                        onEndDateChange={setEndDate}
                                        year={year}
                                        onYearChange={setYear}
                                        onApplySelection={handleApplySelection}
                                        disabled={isGenerating}
                                    />

                                    {/* Summary Banner for collapsed state or quick overview */}
                                    <div className="bg-white border border-[#EEEEEE] rounded-[32px] p-8 shadow-sm">
                                        <div className="flex items-center justify-between mb-6 pb-6 border-b border-[#F5F5F5]">
                                            <h4 className="text-sm font-black text-[#212121] uppercase tracking-[0.1em]">Configuration Summary</h4>
                                            {isLeftPanelCollapsed && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setIsLeftPanelCollapsed(false)}
                                                    className="text-[11px] font-black uppercase text-[#487749] border-[#487749]/30 rounded-full h-10 px-6"
                                                >
                                                    Edit Configuration
                                                </Button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                                            {[
                                                { label: 'Zones', val: selectedScope?.zoneIds?.length || 0 },
                                                { label: 'States', val: selectedScope?.stateIds?.length || 0 },
                                                { label: 'Districts', val: selectedScope?.districtIds?.length || 0 },
                                                { label: 'Orgs', val: selectedScope?.orgIds?.length || 0 },
                                                { label: 'KVKs', val: selectedScope?.kvkIds?.length || 0 },
                                                { label: 'Modules', val: selectedSections.size, highlight: true },
                                            ].map((item, idx) => (
                                                <div key={idx} className={`p-4 rounded-[20px] flex flex-col items-center justify-center transition-all duration-300 ${item.highlight ? 'bg-[#487749] text-white shadow-lg lg:scale-105' : 'bg-[#FAF9F6] border border-[#EEEEEE] hover:border-[#487749]/30'}`}>
                                                    <span className={`text-[10px] font-black mb-1 uppercase tracking-wider ${item.highlight ? 'text-white/80' : 'text-[#9E9E9E]'}`}>{item.label}</span>
                                                    <span className={`text-xl font-black ${item.highlight ? 'text-white' : 'text-[#212121]'}`}>{item.val}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <ReportPreview
                                        isGenerating={isGenerating}
                                        hasData={false}
                                        onDownload={() => {
                                            const filters: ReportFilters = {};
                                            if (filterType === 'dateRange' && startDate && endDate) {
                                                filters.startDate = startDate;
                                                filters.endDate = endDate;
                                            } else if (filterType === 'year') {
                                                filters.year = year;
                                            }
                                            handleGenerate(Array.from(selectedSections), filters, selectedScope);
                                        }}
                                        selectedScopeCount={selectedScope ? 1 : 0}
                                        selectedSectionsCount={selectedSections.size}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
