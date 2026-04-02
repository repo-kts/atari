import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { ReportScopeSelector } from '../../components/reports/ReportScopeSelector';
import { TimelineFilter } from '../../components/reports/TimelineFilter';
import { ReportModuleSelector } from '../../components/reports/ReportModuleSelector';
import { ReportPreview } from '../../components/reports/ReportPreview';
import { reportApi } from '../../services/reportApi';
import { useAuth } from '../../contexts/AuthContext';
import { getBreadcrumbsForPath, getRouteConfig } from '../../config/route';
import { useReportConfig } from '../../hooks/report/useReportScope';
import { Button } from '../../components/ui/button';
import type { ReportFilters } from '../../types/reports';
import type { ReportScope } from '../../types/reportScope';
import { useToast } from '@/hooks/useToast';

const DEFAULT_LEFT_PANEL_PERCENT = 50;
const SPLIT_DIVIDER_WIDTH_PX = 12;
const MIN_LEFT_PANEL_WIDTH_PX = 320;
const MIN_RIGHT_PANEL_WIDTH_PX = 460;

const getSelectedScopeCount = (scope: ReportScope | null): number => {
    if (!scope) return 0;
    if (scope.kvkIds?.length) return scope.kvkIds.length;
    if (scope.orgIds?.length) return scope.orgIds.length;
    if (scope.districtIds?.length) return scope.districtIds.length;
    if (scope.stateIds?.length) return scope.stateIds.length;
    if (scope.zoneIds?.length) return scope.zoneIds.length;
    return 0;
};

export const KvkReportPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const routeConfig = getRouteConfig(location.pathname);
    const breadcrumbs = getBreadcrumbsForPath(location.pathname);
    const { toast, ToastContainer } = useToast();

    const [isGenerating, setIsGenerating] = useState(false);
    const [downloadingFormat, setDownloadingFormat] = useState<'pdf' | 'excel' | 'docx' | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedScope, setSelectedScope] = useState<ReportScope | null>(null);
    const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);

    // Draft filter states (editable in UI)
    const currentYear = new Date().getFullYear();
    const [filterType, setFilterType] = useState<'none' | 'dateRange' | 'year'>('none');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [year, setYear] = useState<number>(currentYear);
    // Applied filter states (used for report generation)
    const [appliedFilterType, setAppliedFilterType] = useState<'none' | 'dateRange' | 'year'>('none');
    const [appliedStartDate, setAppliedStartDate] = useState('');
    const [appliedEndDate, setAppliedEndDate] = useState('');
    const [appliedYear, setAppliedYear] = useState<number>(currentYear);
    const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set());
    const [isScopeCollapsed, setIsScopeCollapsed] = useState(false);
    const [isModuleCollapsed, setIsModuleCollapsed] = useState(false);
    const [leftPanelPercent, setLeftPanelPercent] = useState(DEFAULT_LEFT_PANEL_PERCENT);

    const splitPaneRef = useRef<HTMLDivElement | null>(null);
    const [isResizing, setIsResizing] = useState(false);

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

    useEffect(() => {
        return () => {
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        };
    }, []);

    useEffect(() => {
        return () => {
            if (previewBlobUrl) {
                window.URL.revokeObjectURL(previewBlobUrl);
            }
        };
    }, [previewBlobUrl]);

    const buildFilters = useCallback((): ReportFilters => {
        const filters: ReportFilters = {};
        if (appliedFilterType === 'dateRange' && appliedStartDate && appliedEndDate) {
            filters.startDate = appliedStartDate;
            filters.endDate = appliedEndDate;
        } else if (appliedFilterType === 'year') {
            filters.year = appliedYear;
        }
        return filters;
    }, [appliedFilterType, appliedStartDate, appliedEndDate, appliedYear]);

    const clampSplitPercent = useCallback((rawPercent: number): number => {
        const container = splitPaneRef.current;
        if (!container) {
            return Math.min(90, Math.max(10, rawPercent));
        }

        const availableWidth = container.getBoundingClientRect().width - SPLIT_DIVIDER_WIDTH_PX;
        if (availableWidth <= 0) return DEFAULT_LEFT_PANEL_PERCENT;

        const minLeftPercent = Math.max(10, Math.min(90, (MIN_LEFT_PANEL_WIDTH_PX / availableWidth) * 100));
        const maxLeftPercent = Math.min(90, Math.max(10, 100 - ((MIN_RIGHT_PANEL_WIDTH_PX / availableWidth) * 100)));

        if (minLeftPercent > maxLeftPercent) {
            return DEFAULT_LEFT_PANEL_PERCENT;
        }

        return Math.min(maxLeftPercent, Math.max(minLeftPercent, rawPercent));
    }, []);

    const updateSplitFromClientX = useCallback((clientX: number) => {
        const container = splitPaneRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const availableWidth = rect.width - SPLIT_DIVIDER_WIDTH_PX;
        if (availableWidth <= 0) return;

        const leftWidth = clientX - rect.left;
        const rawPercent = (leftWidth / availableWidth) * 100;
        setLeftPanelPercent(clampSplitPercent(rawPercent));
    }, [clampSplitPercent]);

    useEffect(() => {
        if (!isResizing) return;

        const handlePointerMove = (event: PointerEvent) => {
            updateSplitFromClientX(event.clientX);
        };

        const handlePointerUp = () => {
            setIsResizing(false);
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointercancel', handlePointerUp);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('pointercancel', handlePointerUp);
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        };
    }, [isResizing, updateSplitFromClientX]);

    useEffect(() => {
        const handleResize = () => {
            setLeftPanelPercent(current => clampSplitPercent(current));
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [clampSplitPercent]);

    const splitPaneStyle = useMemo(
        () => ({
            gridTemplateColumns: `minmax(0, ${leftPanelPercent}fr) ${SPLIT_DIVIDER_WIDTH_PX}px minmax(0, ${100 - leftPanelPercent}fr)`,
        }),
        [leftPanelPercent]
    );

    const selectedScopeCount = useMemo(
        () => getSelectedScopeCount(selectedScope),
        [selectedScope]
    );

    const handleSplitterPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        setIsResizing(true);
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'col-resize';
    };

    const handleSplitterKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

        event.preventDefault();
        const delta = event.key === 'ArrowLeft' ? -2 : 2;
        setLeftPanelPercent(current => clampSplitPercent(current + delta));
    };

    const handleApplySelection = () => {
        if (filterType === 'dateRange') {
            if (!startDate || !endDate) {
                setError('Please select both start and end dates.');
                return;
            }
            const parseLocalYmd = (value: string) => {
                const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
                if (!m) return new Date(''); // invalid
                const y = Number(m[1]);
                const mo = Number(m[2]) - 1;
                const d = Number(m[3]);
                return new Date(y, mo, d, 0, 0, 0, 0);
            };

            const start = parseLocalYmd(startDate);
            const end = parseLocalYmd(endDate);
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
                setError('Please select a valid date range.');
                return;
            }
            if (start > today || end > today) {
                setError('Future dates are not allowed for report generation.');
                return;
            }
        }

        if (filterType === 'year' && (!Number.isInteger(year) || year <= 0)) {
            setError('Please select a valid year.');
            return;
        }

        setAppliedFilterType(filterType);
        setAppliedStartDate(startDate);
        setAppliedEndDate(endDate);
        setAppliedYear(year);
        setError(null);
        toast({ title: 'Success', message: 'Filters applied successfully.', variant: 'success', autoCloseDelay: 2000 });
        // Immediately trigger the preview to render in the iframe
        handlePreview(
            Array.from(selectedSections),
            {
                ...(filterType === 'dateRange' && startDate && endDate
                    ? { startDate, endDate }
                    : {}),
                ...(filterType === 'year'
                    ? { year }
                    : {}),
            },
            selectedScope
        );
    };

    // Note: legacy generate merged into direct download to avoid preview flashing

    // Direct download without disturbing preview state
    const handleDownload = async (
        sectionIds: string[],
        filters: ReportFilters,
        scope?: ReportScope | null,
        format: 'pdf' | 'excel' | 'docx' = 'pdf'
    ) => {
        try {
            setDownloadingFormat(format);
            setError(null);
            const request: any = {
                sectionIds,
                filters,
            };
            if (scope && Object.keys(scope).length > 0) {
                request.scope = scope;
                const blob = await reportApi.generateAggregatedReport(request, format);
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                const fname =
                    format === 'excel'
                        ? `Aggregated_Report_${Date.now()}.xlsx`
                        : format === 'docx'
                        ? `Aggregated_Report_${Date.now()}.docx`
                        : `Aggregated_Report_${Date.now()}.pdf`;
                link.download = fname;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } else {
                const kvkId = user?.kvkId || undefined;
                request.kvkId = kvkId;
                const fname =
                    format === 'excel'
                        ? `KVK_Report_${kvkId || 'All'}_${Date.now()}R.xlsx`
                        : format === 'docx'
                        ? `KVK_Report_${kvkId || 'All'}_${Date.now()}.docx`
                        : `KVK_Report_${kvkId || 'All'}_${Date.now()}.pdf`;
                await reportApi.downloadReport(request, fname, format);
            }
            toast({ title: 'Success', message: 'Download started.', variant: 'success', autoCloseDelay: 1500 });
        } catch (err) {
            console.error('Error downloading report:', err);
            setError(err instanceof Error ? err.message : 'Failed to download report');
        } finally {
            setDownloadingFormat(null);
        }
    };

    const handlePreview = async (
        sectionIds: string[],
        filters: ReportFilters,
        scope?: ReportScope | null
    ) => {
        try {
            setIsGenerating(true);
            setError(null);

            const request: any = {
                sectionIds,
                filters,
            };

            if (scope && Object.keys(scope).length > 0) {
                request.scope = scope;
                const blob = await reportApi.generateAggregatedReport(request);
                const url = window.URL.createObjectURL(blob);
                setPreviewBlobUrl(previousUrl => {
                    if (previousUrl) window.URL.revokeObjectURL(previousUrl);
                    return url;
                });
            } else {
                const kvkId = user?.kvkId || undefined;
                request.kvkId = kvkId;
                const blob = await reportApi.generateReport(request);
                const url = window.URL.createObjectURL(blob);
                setPreviewBlobUrl(previousUrl => {
                    if (previousUrl) window.URL.revokeObjectURL(previousUrl);
                    return url;
                });
            }

            toast({ title: 'Success', message: 'Report preview loaded.', variant: 'success', autoCloseDelay: 2000 });
        } catch (err) {
            console.error('Error previewing report:', err);
            setError(err instanceof Error ? err.message : 'Failed to preview report');
        } finally {
            setIsGenerating(false);
        }
    };


    return (
        <div className="bg-white rounded-2xl p-1 min-h-screen w-full max-w-full overflow-x-hidden">
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
            </div>

            <div className="bg-[#FAF9F6] border-none shadow-none rounded-2xl">
                <div className="p-2 md:p-6">
                    {error && (
                        <div className="mb-4 space-y-2">
                            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        </div>
                    )}

                    {reportConfigQuery.isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-10 h-10 border-4 border-[#487749] border-t-transparent rounded-full animate-spin" />
                                <p className="text-base font-medium text-[#757575]">Preparing your report workspace...</p>
                            </div>
                        </div>
                    ) : (
                        <div
                            ref={splitPaneRef}
                            className="relative flex h-full flex-col gap-6 lg:grid lg:gap-0 lg:items-start"
                            style={splitPaneStyle}
                        >
                            {/* Left Side: Configuration Sidebar */}
                            <div className="w-full min-w-0 transition-all duration-300 ease-in-out lg:pr-5">
                                <div className="flex flex-col gap-4">
                                    <ReportScopeSelector
                                        onScopeChange={setSelectedScope}
                                        disabled={isGenerating}
                                        collapsed={isScopeCollapsed}
                                        onToggleCollapse={() => setIsScopeCollapsed(prev => !prev)}
                                    />
                                    <ReportModuleSelector
                                        sections={reportConfigQuery.data?.sections || []}
                                        selectedSections={selectedSections}
                                        onSectionToggle={handleSectionToggle}
                                        onCategorySelectAll={handleCategorySelectAll}
                                        collapsed={isModuleCollapsed}
                                        onToggleCollapse={() => setIsModuleCollapsed(prev => !prev)}
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                aria-label="Resize report panels"
                                aria-orientation="vertical"
                                aria-valuemin={10}
                                aria-valuemax={90}
                                aria-valuenow={Math.round(leftPanelPercent)}
                                role="separator"
                                className={`hidden h-full cursor-col-resize items-center justify-center rounded-md transition-colors lg:flex ${
                                    isResizing ? 'bg-[#487749]/15' : 'hover:bg-[#487749]/10'
                                }`}
                                onPointerDown={handleSplitterPointerDown}
                                onKeyDown={handleSplitterKeyDown}
                            >
                                <div className="flex h-16 items-center justify-center gap-1">
                                    <span className="h-full w-[2px] rounded-full bg-[#487749]/40" />
                                    <span className="h-full w-[2px] rounded-full bg-[#487749]/20" />
                                </div>
                            </button>

                            {/* Right Side: Filters and Content Area */}
                            <div className="min-w-0 w-full overflow-x-hidden transition-all duration-300 ease-in-out lg:pl-5">
                                <div className="flex flex-col gap-8">
                                    {/* Timeline Filter Area */}
                                    <div className="bg-white rounded-2xl border border-[#E0E0E0] p-4 sm:p-5 space-y-4">
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
                                            onDownloadPdf={() => {
                                                handleDownload(
                                                    Array.from(selectedSections),
                                                    buildFilters(),
                                                    selectedScope,
                                                    'pdf'
                                                );
                                            }}
                                            onDownload={(fmt) => {
                                                handleDownload(
                                                    Array.from(selectedSections),
                                                    buildFilters(),
                                                    selectedScope,
                                                    fmt === 'excel' ? 'excel' : 'docx'
                                                );
                                            }}
                                            downloadingFormat={downloadingFormat === 'docx' ? 'doc' : (downloadingFormat as 'pdf' | 'excel' | 'doc' | null)}
                                            hasData={selectedSections.size > 0}
                                            isGenerating={isGenerating}
                                        />
                                        <ReportPreview
                                            embedded
                                            isGenerating={isGenerating}
                                            hasData={selectedSections.size > 0}
                                            previewUrl={previewBlobUrl}
                                            downloadingFormat={downloadingFormat === 'docx' ? 'doc' : (downloadingFormat as 'pdf' | 'excel' | null)}
                                            onDownload={(fmt) => {
                                                handleDownload(
                                                    Array.from(selectedSections),
                                                    buildFilters(),
                                                    selectedScope,
                                                    fmt === 'excel' ? 'excel' : fmt === 'doc' ? 'docx' : 'pdf'
                                                );
                                            }}
                                            selectedScopeCount={selectedScopeCount}
                                            selectedSectionsCount={selectedSections.size}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};
