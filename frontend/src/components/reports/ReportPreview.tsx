import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/button';
import { 
    FileText, 
    Download, 
    File as FileIcon, 
    Layers, 
    Printer,
    Loader2,
    Search
} from 'lucide-react';

interface ReportPreviewProps {
    isGenerating: boolean;
    hasData: boolean;
    onDownload: (format: 'pdf' | 'excel' | 'doc') => void;
    selectedScopeCount: number;
    selectedSectionsCount: number;
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({
    isGenerating,
    hasData,
    onDownload,
    selectedScopeCount,
    selectedSectionsCount,
}) => {
    return (
        <Card className="flex-1 min-w-0 flex flex-col min-h-[600px] border-[#E0E0E0] shadow-sm overflow-hidden bg-white">
            <div className="p-4 sm:p-6 border-b border-[#E0E0E0] bg-[#FAF9F6] flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <div className="p-3 bg-[#487749]/10 rounded-xl">
                        <FileText className="w-6 h-6 text-[#487749]" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-base font-bold text-[#212121] truncate">Report Preview</h3>
                        <p className="text-xs text-[#757575] font-medium mt-0.5 break-words">
                            {selectedSectionsCount} sections • {selectedScopeCount} KVKs targeted
                        </p>
                    </div>
                </div>
                <div className="flex w-full flex-wrap items-center gap-1.5 sm:gap-2 lg:w-auto lg:justify-end">
                    <Button 
                        variant="outline" 
                        size="md" 
                        className="h-7 px-2.5 rounded-lg border-[#487749] text-[#487749] hover:bg-[#487749]/5 inline-flex items-center justify-center gap-1 transition-colors font-medium text-[12px] leading-none whitespace-nowrap"
                    >
                        <Search className="w-3 h-3 shrink-0" />
                        Zoom
                    </Button>
                    <Button 
                        variant="outline" 
                        size="md" 
                        className="h-7 px-2.5 rounded-lg border-[#487749] text-[#487749] hover:bg-[#487749]/5 inline-flex items-center justify-center gap-1 transition-colors font-medium text-[12px] leading-none whitespace-nowrap"
                    >
                        <Printer className="w-3 h-3 shrink-0" />
                        Print
                    </Button>
                </div>
            </div>

            <CardContent className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 bg-[#F5F5F5] flex flex-col items-center justify-center relative">
                {isGenerating ? (
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-[#487749]/20 border-t-[#487749] rounded-full animate-spin" />
                            <Loader2 className="w-8 h-8 text-[#487749] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-[#2d4a2f]">Compiling Report...</p>
                            <p className="text-sm text-[#757575] max-w-[250px] mx-auto">
                                Gathering data and generating the preview. This may take a few seconds.
                            </p>
                        </div>
                    </div>
                ) : !hasData ? (
                    <div className="flex flex-col items-center gap-6 text-center max-w-[400px]">
                        <div className="w-24 h-24 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-[#E0E0E0]">
                            <Layers className="w-12 h-12 text-[#E0E0E0]" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-xl font-bold text-[#212121]">Ready to Generate</h4>
                            <p className="text-sm text-[#757575] leading-relaxed">
                                Select your reporting scope, timeline, and modules on the left to generate a preview of your comprehensive report.
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-3">
                            <div className="px-3 py-1.5 bg-[#FAF9F6] border border-[#E0E0E0] rounded-full text-[11px] text-[#757575] font-bold uppercase tracking-wider">
                                PDF Version
                            </div>
                            <div className="px-3 py-1.5 bg-[#FAF9F6] border border-[#E0E0E0] rounded-full text-[11px] text-[#757575] font-bold uppercase tracking-wider">
                                Data Visuals
                            </div>
                            <div className="px-3 py-1.5 bg-[#FAF9F6] border border-[#E0E0E0] rounded-full text-[11px] text-[#757575] font-bold uppercase tracking-wider">
                                Table Views
                            </div>
                        </div>
                    </div>
                ) : (
                    // Mock Preview Content
                    <div className="w-full max-w-[800px] bg-white shadow-xl border border-[#E0E0E0] rounded-sm p-5 sm:p-8 lg:p-12 space-y-6 sm:space-y-8 animate-in fade-in zoom-in duration-300">
                        {/* Header Mock */}
                        <div className="border-b-2 border-[#487749] pb-6 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
                            <div className="space-y-1">
                                <h1 className="text-xl sm:text-2xl font-black text-[#2d4a2f] uppercase tracking-tighter">KVK COMPREHENSIVE REPORT</h1>
                                <p className="text-xs sm:text-sm text-[#757575] font-bold uppercase break-words">Zone: Multizone • State: Kerala • District: Ernakulam</p>
                            </div>
                            <div className="text-left sm:text-right">
                                <p className="text-[11px] text-[#757575] font-bold uppercase tracking-widest">Generated On</p>
                                <p className="text-sm font-black text-[#212121]">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>

                        {/* Content Body Mock */}
                        <div className="space-y-6">
                            <div className="h-4 w-1/3 bg-[#F5F5F5] rounded animate-pulse" />
                            <div className="space-y-3">
                                <div className="h-3 w-full bg-[#FAF9F6] rounded" />
                                <div className="h-3 w-full bg-[#FAF9F6] rounded" />
                                <div className="h-3 w-4/5 bg-[#FAF9F6] rounded" />
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                <div className="h-32 bg-[#FAF9F6] rounded-lg border border-dashed border-[#E0E0E0] flex items-center justify-center">
                                    <span className="text-[10px] text-[#9E9E9E] font-medium uppercase tracking-widest">Statistical Graph Area</span>
                                </div>
                                <div className="h-32 bg-[#FAF9F6] rounded-lg border border-dashed border-[#E0E0E0] flex items-center justify-center">
                                    <span className="text-[10px] text-[#9E9E9E] font-medium uppercase tracking-widest">Data Distribution Map</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-[#F5F5F5] flex flex-col gap-2 sm:flex-row sm:justify-between">
                            <span className="text-[10px] text-[#9E9E9E] font-bold uppercase">Confidential Internal Use Only</span>
                            <span className="text-[10px] text-[#9E9E9E] font-bold uppercase">Page 1 of 42</span>
                        </div>
                    </div>
                )}
            </CardContent>

            {/* Action Footer */}
            <div className="p-4 sm:p-6 border-t border-[#E0E0E0] bg-white flex flex-wrap items-start justify-between gap-4">
                <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-[#757575] uppercase tracking-wider mb-1">Export Options</span>
                    <div className="flex flex-wrap items-center gap-2">
                         <div className="p-1.5 bg-[#487749]/5 border border-[#487749]/10 rounded flex items-center gap-2">
                             <FileIcon className="w-3 h-3 text-[#487749]" />
                             <span className="text-[10px] font-bold text-[#487749] uppercase">PDF Standard</span>
                         </div>
                         <div className="p-1.5 bg-blue-50 border border-blue-100 rounded flex items-center gap-2">
                             <FileIcon className="w-3 h-3 text-blue-600" />
                             <span className="text-[10px] font-bold text-blue-600 uppercase">Excel Summary</span>
                         </div>
                    </div>
                </div>

                <div className="flex w-full flex-wrap items-center gap-1.5 lg:w-auto lg:justify-end">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <Button 
                            variant="primary" 
                            className="bg-[#487749] hover:bg-[#3d6540] text-white shadow-sm shadow-[#487749]/15 font-medium px-2.5 py-1 h-7 rounded-lg inline-flex items-center gap-1 transition-colors whitespace-nowrap text-[10px] leading-none"
                            onClick={() => onDownload('pdf')}
                            disabled={isGenerating || !hasData}
                        >
                            <Download className="w-3 h-3 text-[#C1FF72] shrink-0" />
                            Download PDF
                        </Button>
                        <Button 
                            variant="outline" 
                            className="border-[#E0E0E0] hover:bg-[#FAF9F6] text-[#212121] font-medium px-2.5 py-1 h-7 rounded-lg transition-colors whitespace-nowrap text-[10px] leading-none"
                            onClick={() => onDownload('excel')}
                            disabled={isGenerating || !hasData}
                        >
                            Excel
                        </Button>
                        <Button 
                            variant="outline" 
                            className="border-[#E0E0E0] hover:bg-[#FAF9F6] text-[#212121] font-medium px-2.5 py-1 h-7 rounded-lg transition-colors whitespace-nowrap text-[10px] leading-none"
                            onClick={() => onDownload('doc')}
                            disabled={isGenerating || !hasData}
                        >
                            Word
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};
