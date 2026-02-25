import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Calendar } from 'lucide-react';
import type { ReportSection, ReportFilters } from '../../types/reports';
import type { ReportScope } from '../../types/reportScope';

interface ReportConfiguratorProps {
    sections: ReportSection[];
    onGenerate: (sectionIds: string[], filters: ReportFilters, scope?: ReportScope | null) => void;
    isGenerating?: boolean;
    scope?: ReportScope | null;
}

export const ReportConfigurator: React.FC<ReportConfiguratorProps> = ({
    sections,
    onGenerate,
    isGenerating = false,
    scope = null,
}) => {
    const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set());
    const [filterType, setFilterType] = useState<'none' | 'dateRange' | 'year'>('none');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [year, setYear] = useState<number>(new Date().getFullYear());

    // Select all sections by default
    useEffect(() => {
        if (sections.length > 0 && selectedSections.size === 0) {
            setSelectedSections(new Set(sections.map(s => s.id)));
        }
    }, [sections]);

    const handleSectionToggle = (sectionId: string) => {
        const newSelected = new Set(selectedSections);
        if (newSelected.has(sectionId)) {
            newSelected.delete(sectionId);
        } else {
            newSelected.add(sectionId);
        }
        setSelectedSections(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedSections.size === sections.length) {
            setSelectedSections(new Set());
        } else {
            setSelectedSections(new Set(sections.map(s => s.id)));
        }
    };

    const handleGenerate = () => {
        if (selectedSections.size === 0) {
            alert('Please select at least one section');
            return;
        }

        const filters: ReportFilters = {};
        if (filterType === 'dateRange') {
            if (startDate && endDate) {
                filters.startDate = startDate;
                filters.endDate = endDate;
            }
        } else if (filterType === 'year') {
            filters.year = year;
        }

        onGenerate(Array.from(selectedSections), filters, scope);
    };

    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 30 }, (_, i) => currentYear - i);

    return (
        <div className="space-y-6">
            {/* Timeline Filter Section */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#487749] mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Timeline Filter
                    </h3>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="filterType"
                                    value="none"
                                    checked={filterType === 'none'}
                                    onChange={() => setFilterType('none')}
                                    className="w-4 h-4 text-[#487749] focus:ring-[#487749]"
                                />
                                <span className="text-sm text-[#212121]">No Filter (All Data)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="filterType"
                                    value="dateRange"
                                    checked={filterType === 'dateRange'}
                                    onChange={() => setFilterType('dateRange')}
                                    className="w-4 h-4 text-[#487749] focus:ring-[#487749]"
                                />
                                <span className="text-sm text-[#212121]">Date Range</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="filterType"
                                    value="year"
                                    checked={filterType === 'year'}
                                    onChange={() => setFilterType('year')}
                                    className="w-4 h-4 text-[#487749] focus:ring-[#487749]"
                                />
                                <span className="text-sm text-[#212121]">Year</span>
                            </label>
                        </div>

                        {filterType === 'dateRange' && (
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Start Date"
                                    type="date"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                />
                                <Input
                                    label="End Date"
                                    type="date"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    min={startDate}
                                />
                            </div>
                        )}

                        {filterType === 'year' && (
                            <div className="w-full max-w-xs">
                                <label className="block text-sm font-medium text-[#487749] mb-2">
                                    Year
                                </label>
                                <select
                                    value={year}
                                    onChange={e => setYear(Number(e.target.value))}
                                    className="w-full h-12 px-4 py-3 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-[#FAF9F6] text-[#212121]"
                                >
                                    {yearOptions.map(y => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Section Selection */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-[#487749]">Select Sections</h3>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSelectAll}
                            type="button"
                        >
                            {selectedSections.size === sections.length ? 'Deselect All' : 'Select All'}
                        </Button>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {sections.map(section => (
                            <label
                                key={section.id}
                                className="flex items-start gap-3 p-3 rounded-xl border border-[#E0E0E0] hover:bg-[#F5F5F5] cursor-pointer transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedSections.has(section.id)}
                                    onChange={() => handleSectionToggle(section.id)}
                                    className="mt-1 w-4 h-4 text-[#487749] focus:ring-[#487749] rounded"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-[#487749]">
                                            {section.id}
                                        </span>
                                        <span className="font-semibold text-[#212121]">
                                            {section.title}
                                        </span>
                                    </div>
                                    {section.description && (
                                        <p className="text-sm text-[#757575] mt-1">
                                            {section.description}
                                        </p>
                                    )}
                                </div>
                            </label>
                        ))}
                    </div>
                    <p className="text-sm text-[#757575] mt-4">
                        {selectedSections.size} of {sections.length} sections selected
                    </p>
                </CardContent>
            </Card>

            {/* Generate Button */}
            <div className="flex justify-end">
                <Button
                    variant="primary"
                    size="lg"
                    onClick={handleGenerate}
                    disabled={isGenerating || selectedSections.size === 0}
                    className="min-w-[200px]"
                >
                    {isGenerating ? (
                        <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Generating...
                        </span>
                    ) : (
                        'Generate Report'
                    )}
                </Button>
            </div>
        </div>
    );
};
