import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, FileBarChart, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Card, CardContent } from '../../components/ui/Card';
import { ReportConfigurator } from '../../components/reports/ReportConfigurator';
import { ReportScopeSelector } from '../../components/reports/ReportScopeSelector';
import { reportApi } from '../../services/reportApi';
import { useAuth } from '../../contexts/AuthContext';
import { getBreadcrumbsForPath, getRouteConfig } from '../../config/routeConfig';
import { useReportConfig } from '../../hooks/report/useReportScope';
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

    // Load report configuration using TanStack Query
    const reportConfigQuery = useReportConfig();

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
        <div className="bg-white rounded-2xl p-1">
            {/* Back + Breadcrumbs */}
            <div className="mb-6 flex items-center gap-4 px-6 pt-4">
                <button
                    onClick={() => {
                        if (routeConfig?.parent) {
                            navigate(routeConfig.parent);
                        } else {
                            navigate('/dashboard');
                        }
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#487749] border border-[#E0E0E0] rounded-xl hover:bg-[#F5F5F5] transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                </button>
                {breadcrumbs.length > 0 && (
                    <Breadcrumbs items={breadcrumbs.map((b, i) => ({ ...b, level: i }))} showHome={false} />
                )}
            </div>

            <Card className="bg-[#FAF9F6]">
                <CardContent className="p-6">
                    <div className="mb-6 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-semibold text-[#487749] flex items-center gap-2">
                                <FileBarChart className="w-6 h-6" />
                                KVK Comprehensive Report
                            </h2>
                            <p className="text-sm text-[#757575] mt-1">
                                Generate comprehensive PDF reports containing all About KVK form data
                            </p>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="mb-6 flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>{success}</span>
                        </div>
                    )}

                    {/* Loading State */}
                    {reportConfigQuery.isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-8 h-8 border-4 border-[#487749] border-t-transparent rounded-full animate-spin" />
                                <p className="text-sm text-[#757575]">Loading report configuration...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Scope Selector - Component handles its own loading and scope options */}
                            <ReportScopeSelector
                                onScopeChange={setSelectedScope}
                                disabled={isGenerating}
                            />

                            <ReportConfigurator
                                sections={reportConfigQuery.data?.sections || []}
                                onGenerate={handleGenerate}
                                isGenerating={isGenerating}
                                scope={selectedScope}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
