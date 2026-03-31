import React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, CheckCircle2, CalendarRange, CalendarDays } from 'lucide-react';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';

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
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const todayDayValue = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0, 0, 0, 0
    ).getTime();
    const toDate = (value: string) => {
        // value is expected as 'YYYY-MM-DD' (local date; avoid UTC shifting)
        if (!value) return undefined;
        const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!m) return undefined;
        const y = Number(m[1]);
        const mo = Number(m[2]) - 1;
        const d = Number(m[3]);
        const dt = new Date(y, mo, d, 0, 0, 0, 0);
        return Number.isNaN(dt.getTime()) ? undefined : dt;
    };

    const toYmd = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const startDt = toDate(startDate);
    const endDt = toDate(endDate);
    const toDayValue = (date: Date) =>
        new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).getTime();

    return (
        <div className="bg-white border border-[#EEEEEE] rounded-[24px] px-4 sm:px-6 py-3 shadow-sm">
            <h3 className="text-[15px] font-bold text-[#212121] mb-3 flex items-center gap-3">
                <div className="p-1.5 bg-[#487749]/10 rounded-lg text-[#487749]">
                    <CalendarIcon className="w-4 h-4" />
                </div>
                Timeline Filter
            </h3>
            <div className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4 pb-2 border-b border-[#F5F5F5]">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 w-full">
                        <button
                            type="button"
                            onClick={() => onFilterTypeChange('dateRange')}
                            disabled={disabled}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                                filterType === 'dateRange'
                                    ? 'border-[#487749] bg-[#487749]/10 text-[#487749]'
                                    : 'border-[#E0E0E0] bg-white text-[#757575] hover:text-[#487749]'
                            }`}
                        >
                            <CalendarRange className="w-3.5 h-3.5" />
                            Date Range
                        </button>
                        <button
                            type="button"
                            onClick={() => onFilterTypeChange('year')}
                            disabled={disabled}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                                filterType === 'year'
                                    ? 'border-[#487749] bg-[#487749]/10 text-[#487749]'
                                    : 'border-[#E0E0E0] bg-white text-[#757575] hover:text-[#487749]'
                            }`}
                        >
                            <CalendarDays className="w-3.5 h-3.5" />
                            Year
                        </button>
                        <button
                            type="button"
                            onClick={() => onFilterTypeChange('none')}
                            disabled={disabled}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                                filterType === 'none'
                                    ? 'border-[#487749] bg-[#487749]/10 text-[#487749]'
                                    : 'border-[#E0E0E0] bg-white text-[#757575] hover:text-[#487749]'
                            }`}
                        >
                            All Data
                        </button>
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
                    <div className="space-y-3 pb-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-bold text-[#487749] uppercase tracking-wider">
                                    From Date
                                </label>
                                <Popover.Root>
                                    <Popover.Trigger asChild>
                                        <button
                                            type="button"
                                            disabled={disabled}
                                            className="w-full h-10 px-3 border border-[#E0E0E0] rounded-xl bg-white text-sm text-[#212121] text-left inline-flex items-center justify-between gap-2 hover:border-[#BDBDBD] focus:outline-none focus:ring-4 focus:ring-[#487749]/10 focus:border-[#487749] disabled:opacity-50"
                                        >
                                            <span className={startDate ? 'text-[#212121]' : 'text-[#9E9E9E]'}>
                                                {startDt ? format(startDt, 'dd-MM-yyyy') : 'Select start date'}
                                            </span>
                                            <CalendarIcon className="h-4 w-4 text-[#487749]" />
                                        </button>
                                    </Popover.Trigger>
                                    <Popover.Portal>
                                        <Popover.Content align="start" sideOffset={8} className="z-50 rounded-xl border border-[#E0E0E0] bg-white shadow-lg p-2">
                                            <Calendar
                                                mode="single"
                                                captionLayout="dropdown"
                                                selected={toDate(startDate)}
                                                onSelect={(date) => {
                                                    if (!date) return;
                                                    onStartDateChange(toYmd(date));
                                                }}
                                                endMonth={toDate(endDate)}
                                                disabled={(date) => {
                                                    if (toDayValue(date) > todayDayValue) return true;
                                                    if (endDt && toDayValue(date) > toDayValue(endDt)) return true;
                                                    return false;
                                                }}
                                            />
                                        </Popover.Content>
                                    </Popover.Portal>
                                </Popover.Root>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-bold text-[#487749] uppercase tracking-wider">
                                    To Date
                                </label>
                                <Popover.Root>
                                    <Popover.Trigger asChild>
                                        <button
                                            type="button"
                                            disabled={disabled}
                                            className="w-full h-10 px-3 border border-[#E0E0E0] rounded-xl bg-white text-sm text-[#212121] text-left inline-flex items-center justify-between gap-2 hover:border-[#BDBDBD] focus:outline-none focus:ring-4 focus:ring-[#487749]/10 focus:border-[#487749] disabled:opacity-50"
                                        >
                                            <span className={endDate ? 'text-[#212121]' : 'text-[#9E9E9E]'}>
                                                {endDt ? format(endDt, 'dd-MM-yyyy') : 'Select end date'}
                                            </span>
                                            <CalendarIcon className="h-4 w-4 text-[#487749]" />
                                        </button>
                                    </Popover.Trigger>
                                    <Popover.Portal>
                                        <Popover.Content align="start" sideOffset={8} className="z-50 rounded-xl border border-[#E0E0E0] bg-white shadow-lg p-2">
                                            <Calendar
                                                mode="single"
                                                captionLayout="dropdown"
                                                selected={toDate(endDate)}
                                                onSelect={(date) => {
                                                    if (!date) return;
                                                    onEndDateChange(toYmd(date));
                                                }}
                                                startMonth={toDate(startDate)}
                                                disabled={(date) => {
                                                    if (toDayValue(date) > todayDayValue) return true;
                                                    if (startDt && toDayValue(date) < toDayValue(startDt)) return true;
                                                    return false;
                                                }}
                                            />
                                        </Popover.Content>
                                    </Popover.Portal>
                                </Popover.Root>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    onStartDateChange('');
                                    onEndDateChange('');
                                }}
                                disabled={disabled || (!startDate && !endDate)}
                                className="h-8 rounded-lg px-3 text-xs font-semibold border-[#E0E0E0]"
                            >
                                Clear All
                            </Button>
                        </div>
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
