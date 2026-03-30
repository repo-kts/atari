import React from 'react';
import { Input } from '../ui/Input';
import { Calendar, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface TimelineFilterProps {
    filterType: 'none' | 'dateRange' | 'year';
    onFilterTypeChange: (type: 'none' | 'dateRange' | 'year') => void;
    startDate: string;
    onStartDateChange: (date: string) => void;
    endDate: string;
    onEndDateChange: (date: string) => void;
    year: number;
    onYearChange: (year: number) => void;
    onApplySelection?: () => void;
    disabled?: boolean;
}

export const TimelineFilter: React.FC<TimelineFilterProps> = ({
    filterType,
    onFilterTypeChange,
    startDate,
    onStartDateChange,
    endDate,
    onEndDateChange,
    year,
    onYearChange,
    onApplySelection,
    disabled = false,
}) => {
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 30 }, (_, i) => currentYear - i);

    return (
        <div className="bg-white border border-[#EEEEEE] rounded-[24px] px-4 sm:px-6 py-3 shadow-sm">
            <h3 className="text-[15px] font-bold text-[#212121] mb-3 flex items-center gap-3">
                <div className="p-1.5 bg-[#487749]/10 rounded-lg text-[#487749]">
                    <Calendar className="w-4 h-4" />
                </div>
                Timeline Filter
            </h3>
            <div className="space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4 pb-2 border-b border-[#F5F5F5]">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2 w-full">
                        <label className="flex items-center gap-2.5 cursor-pointer group">
                            <input
                                type="radio"
                                name="filterType"
                                value="none"
                                checked={filterType === 'none'}
                                onChange={() => onFilterTypeChange('none')}
                                disabled={disabled}
                                className="w-4 h-4 text-[#487749] focus:ring-[#487749] border-[#E0E0E0] cursor-pointer"
                            />
                            <span className={`text-sm font-medium tracking-tight transition-all duration-300 ${filterType === 'none' ? 'text-[#487749]' : 'text-[#757575] hover:text-[#487749]'}`}>No Filter (All Data)</span>
                        </label>
                        <label className="flex items-center gap-2.5 cursor-pointer group">
                            <input
                                type="radio"
                                name="filterType"
                                value="dateRange"
                                checked={filterType === 'dateRange'}
                                onChange={() => onFilterTypeChange('dateRange')}
                                disabled={disabled}
                                className="w-4 h-4 text-[#487749] focus:ring-[#487749] border-[#E0E0E0] cursor-pointer"
                            />
                            <span className={`text-sm font-medium tracking-tight transition-all duration-300 ${filterType === 'dateRange' ? 'text-[#487749]' : 'text-[#757575] hover:text-[#487749]'}`}>Date Range</span>
                        </label>
                        <label className="flex items-center gap-2.5 cursor-pointer group">
                            <input
                                type="radio"
                                name="filterType"
                                value="year"
                                checked={filterType === 'year'}
                                onChange={() => onFilterTypeChange('year')}
                                disabled={disabled}
                                className="w-4 h-4 text-[#487749] focus:ring-[#487749] border-[#E0E0E0] cursor-pointer"
                            />
                            <span className={`text-sm font-medium tracking-tight transition-all duration-300 ${filterType === 'year' ? 'text-[#487749]' : 'text-[#757575] hover:text-[#487749]'}`}>Year Selection</span>
                        </label>
                    </div>

                    {onApplySelection && (
                        <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={onApplySelection}
                            disabled={disabled}
                            className="w-full sm:w-auto rounded-lg px-3 h-8 font-semibold uppercase tracking-[0.12em] text-[10px] inline-flex items-center justify-center gap-1.5 shrink-0 leading-none whitespace-nowrap"
                        >
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            Apply Selection
                        </Button>
                    )}
                </div>

                {filterType === 'dateRange' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
                        <Input
                            label="Start Date"
                            type="date"
                            value={startDate}
                            onChange={e => onStartDateChange(e.target.value)}
                            disabled={disabled}
                            className="rounded-xl h-10 text-sm"
                        />
                        <Input
                            label="End Date"
                            type="date"
                            value={endDate}
                            onChange={e => onEndDateChange(e.target.value)}
                            min={startDate}
                            disabled={disabled}
                            className="rounded-xl h-10 text-sm"
                        />
                    </div>
                )}

                {filterType === 'year' && (
                    <div className="w-full pb-2 sm:max-w-xs">
                        <label className="block text-[10px] font-bold text-[#487749] mb-1.5 uppercase tracking-wider">
                            Select Year
                        </label>
                        <select
                            value={year}
                            onChange={e => onYearChange(Number(e.target.value))}
                            disabled={disabled}
                            className="w-full h-10 px-4 py-2 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-4 focus:ring-[#487749]/10 focus:border-[#487749] bg-[#FAF9F6] text-[#212121] font-bold text-sm transition-all"
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
        </div>
    );
};
