import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '../ui/Card';
import { 
    MapPin, 
    Loader2, 
    Check,
} from 'lucide-react';
import {
    useScopeOptions,
    useFilteredChildren,
    useFilteredKvks,
} from '../../hooks/report/useReportScope';
import type { ReportScope } from '../../types/reportScope';

interface ReportScopeSelectorProps {
    onScopeChange: (scope: ReportScope | null) => void;
    disabled?: boolean;
}

export const ReportScopeSelector: React.FC<ReportScopeSelectorProps> = ({
    onScopeChange,
    disabled = false,
}) => {
    const [activeTab, setActiveTab] = useState<'zones' | 'states' | 'districts' | 'orgs' | 'kvks'>('zones');
    const [selectedScope, setSelectedScope] = useState<ReportScope>({});

    // Fetch scope options
    const { data: scopeOptions, isLoading: isLoadingScopeOptions } = useScopeOptions();

    // Filtering queries (Preserving original logic)
    const filteredStatesQuery = useFilteredChildren('zones', selectedScope.zoneIds, { enabled: scopeOptions?.canSelectStates || false });
    const filteredDistrictsByStatesQuery = useFilteredChildren('states', selectedScope.stateIds, { enabled: scopeOptions?.canSelectDistricts || false });
    const statesByZonesQuery = useFilteredChildren('zones', selectedScope.zoneIds, {
        enabled: (scopeOptions?.canSelectDistricts || false) && !!selectedScope.zoneIds && selectedScope.zoneIds.length > 0 && (!selectedScope.stateIds || selectedScope.stateIds.length === 0),
    });
    const filteredDistrictsByZonesQuery = useFilteredChildren('states', statesByZonesQuery.data?.map(s => s.id), {
        enabled: (scopeOptions?.canSelectDistricts || false) && !!statesByZonesQuery.data && statesByZonesQuery.data.length > 0 && (!selectedScope.stateIds || selectedScope.stateIds.length === 0),
    });
    const filteredOrgsByDistrictsQuery = useFilteredChildren('districts', selectedScope.districtIds, { enabled: scopeOptions?.canSelectOrgs || false });
    const districtsByStatesForOrgsQuery = useFilteredChildren('states', selectedScope.stateIds, {
        enabled: (scopeOptions?.canSelectOrgs || false) && !!selectedScope.stateIds && selectedScope.stateIds.length > 0 && (!selectedScope.districtIds || selectedScope.districtIds.length === 0),
    });
    const filteredOrgsByStatesQuery = useFilteredChildren('districts', districtsByStatesForOrgsQuery.data?.map(d => d.id), {
        enabled: (scopeOptions?.canSelectOrgs || false) && !!districtsByStatesForOrgsQuery.data && districtsByStatesForOrgsQuery.data.length > 0 && (!selectedScope.districtIds || selectedScope.districtIds.length === 0),
    });
    const statesByZonesForOrgsQuery = useFilteredChildren('zones', selectedScope.zoneIds, {
        enabled: (scopeOptions?.canSelectOrgs || false) && !!selectedScope.zoneIds && selectedScope.zoneIds.length > 0 && (!selectedScope.stateIds || selectedScope.stateIds.length === 0) && (!selectedScope.districtIds || selectedScope.districtIds.length === 0),
    });
    const districtsByZonesForOrgsQuery = useFilteredChildren('states', statesByZonesForOrgsQuery.data?.map(s => s.id), {
        enabled: (scopeOptions?.canSelectOrgs || false) && !!statesByZonesForOrgsQuery.data && statesByZonesForOrgsQuery.data.length > 0 && (!selectedScope.stateIds || selectedScope.stateIds.length === 0) && (!selectedScope.districtIds || selectedScope.districtIds.length === 0),
    });
    const filteredOrgsByZonesQuery = useFilteredChildren('districts', districtsByZonesForOrgsQuery.data?.map(d => d.id), {
        enabled: (scopeOptions?.canSelectOrgs || false) && !!districtsByZonesForOrgsQuery.data && districtsByZonesForOrgsQuery.data.length > 0 && (!selectedScope.stateIds || selectedScope.stateIds.length === 0) && (!selectedScope.districtIds || selectedScope.districtIds.length === 0),
    });
    const filteredKvksQuery = useFilteredKvks({
        zoneIds: selectedScope.zoneIds,
        stateIds: selectedScope.stateIds,
        districtIds: selectedScope.districtIds,
        orgIds: selectedScope.orgIds,
    }, { enabled: scopeOptions?.canSelectKvks || false });

    // Effective options (Preserving original logic)
    const filteredStates = useMemo(() => (selectedScope.zoneIds?.length ? filteredStatesQuery.data || [] : scopeOptions?.availableStates || []), [selectedScope.zoneIds, filteredStatesQuery.data, scopeOptions]);
    const filteredDistricts = useMemo(() => {
        if (selectedScope.stateIds?.length) return filteredDistrictsByStatesQuery.data || [];
        if (selectedScope.zoneIds?.length) return filteredDistrictsByZonesQuery.data || [];
        return scopeOptions?.availableDistricts || [];
    }, [selectedScope, filteredDistrictsByStatesQuery.data, filteredDistrictsByZonesQuery.data, scopeOptions]);
    const filteredOrgs = useMemo(() => {
        if (selectedScope.districtIds?.length) return filteredOrgsByDistrictsQuery.data || [];
        if (selectedScope.stateIds?.length) return filteredOrgsByStatesQuery.data || [];
        if (selectedScope.zoneIds?.length) return filteredOrgsByZonesQuery.data || [];
        return scopeOptions?.availableOrgs || [];
    }, [selectedScope, filteredOrgsByDistrictsQuery.data, filteredOrgsByStatesQuery.data, filteredOrgsByZonesQuery.data, scopeOptions]);
    const filteredKvks = useMemo(() => {
        const hasFilters = (selectedScope.zoneIds?.length || selectedScope.stateIds?.length || selectedScope.districtIds?.length || selectedScope.orgIds?.length);
        return (hasFilters && filteredKvksQuery.data) ? filteredKvksQuery.data : scopeOptions?.availableKvks || [];
    }, [selectedScope, filteredKvksQuery.data, scopeOptions]);

    const isLoadingOptions = filteredStatesQuery.isLoading || filteredDistrictsByStatesQuery.isLoading || filteredDistrictsByZonesQuery.isLoading || filteredOrgsByDistrictsQuery.isLoading || filteredOrgsByStatesQuery.isLoading || filteredOrgsByZonesQuery.isLoading || filteredKvksQuery.isLoading;

    useEffect(() => {
        if (scopeOptions?.defaultKvkId && !scopeOptions.canSelectKvks) {
            setSelectedScope({ kvkIds: [scopeOptions.defaultKvkId] });
            onScopeChange({ kvkIds: [scopeOptions.defaultKvkId] });
        }
    }, [scopeOptions, onScopeChange]);

    const handleOptionToggle = (type: keyof ReportScope, optionId: number) => {
        const newScope = { ...selectedScope };
        const currentIds = newScope[type] || [];
        if (currentIds.includes(optionId)) {
            newScope[type] = currentIds.filter(id => id !== optionId);
        } else {
            newScope[type] = [...currentIds, optionId];
        }

        // Parent-child clearing logic
        if (type === 'zoneIds' && !newScope.zoneIds?.includes(optionId)) {
            delete newScope.stateIds; delete newScope.districtIds; delete newScope.orgIds; delete newScope.kvkIds;
        } else if (type === 'stateIds' && !newScope.stateIds?.includes(optionId)) {
            delete newScope.districtIds; delete newScope.orgIds; delete newScope.kvkIds;
        } else if (type === 'districtIds' && !newScope.districtIds?.includes(optionId)) {
            delete newScope.orgIds; delete newScope.kvkIds;
        } else if (type === 'orgIds' && !newScope.orgIds?.includes(optionId)) {
            delete newScope.kvkIds;
        }

        // Clean empty
        Object.keys(newScope).forEach(k => { if (Array.isArray(newScope[k as keyof ReportScope]) && newScope[k as keyof ReportScope]!.length === 0) delete newScope[k as keyof ReportScope]; });
        setSelectedScope(newScope);
        onScopeChange(Object.keys(newScope).length > 0 ? newScope : null);
    };

    const handleSelectAll = (type: 'zones' | 'states' | 'districts' | 'orgs' | 'kvks') => {
        if (!scopeOptions) return;
        const typeMap = {
            zones: { key: 'zoneIds' as const, options: scopeOptions.availableZones },
            states: { key: 'stateIds' as const, options: filteredStates },
            districts: { key: 'districtIds' as const, options: filteredDistricts },
            orgs: { key: 'orgIds' as const, options: filteredOrgs },
            kvks: { key: 'kvkIds' as const, options: filteredKvks },
        };
        const { key, options } = typeMap[type];
        const currentIds = selectedScope[key] || [];
        const allIds = options.map(o => o.id);
        const newScope = { ...selectedScope };
        if (currentIds.length === allIds.length) delete newScope[key];
        else newScope[key] = allIds;
        setSelectedScope(newScope);
        onScopeChange(Object.keys(newScope).length > 0 ? newScope : null);
    };

    if (isLoadingScopeOptions) return <Card><CardContent className="p-6 flex items-center justify-center py-4"><Loader2 className="w-5 h-5 text-[#487749] animate-spin" /><span className="ml-2 text-xs text-[#757575]">Loading options...</span></CardContent></Card>;
    if (!scopeOptions) return null;

    if (scopeOptions.defaultKvkId && !scopeOptions.canSelectKvks) {
        const kvkName = scopeOptions.availableKvks.find(k => k.id === scopeOptions.defaultKvkId)?.name || 'Your KVK';
        return <div className="p-4 bg-white rounded-2xl border border-[#E0E0E0] shadow-sm"><h3 className="text-sm font-bold text-[#487749] mb-2 flex items-center gap-2"><MapPin className="w-4 h-4" />Report Scope</h3><p className="text-[11px] text-[#757575] font-medium uppercase tracking-tight mb-1">Your assigned KVK:</p><p className="font-bold text-[#212121] text-xs underline decoration-[#487749]/30">{kvkName}</p></div>;
    }

    const tabsData = [
        { id: 'zones' as const, label: 'Zone', parentKey: 'zoneIds' as const, canSelect: scopeOptions.canSelectZones, options: scopeOptions.availableZones },
        { id: 'states' as const, label: 'State', parentKey: 'stateIds' as const, canSelect: scopeOptions.canSelectStates, options: filteredStates },
        { id: 'districts' as const, label: 'District', parentKey: 'districtIds' as const, canSelect: scopeOptions.canSelectDistricts, options: filteredDistricts },
        { id: 'orgs' as const, label: 'Org', parentKey: 'orgIds' as const, canSelect: scopeOptions.canSelectOrgs, options: filteredOrgs },
        { id: 'kvks' as const, label: 'KVK', parentKey: 'kvkIds' as const, canSelect: scopeOptions.canSelectKvks, options: filteredKvks },
    ];

    const currentTab = tabsData.find(t => t.id === activeTab) || tabsData[0];
    const selectedCount = selectedScope[currentTab.parentKey]?.length || 0;
    const isAllSelected = selectedCount === currentTab.options.length && currentTab.options.length > 0;

    return (
        <div className="space-y-1 bg-white p-3 rounded-2xl border border-[#E0E0E0] shadow-sm animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-2 px-1">
                <div className="p-1.5 bg-[#487749]/10 rounded-lg">
                    <MapPin className="w-4 h-4 text-[#487749]" />
                </div>
                <h3 className="text-sm font-bold text-[#212121]">Report Scope</h3>
            </div>

            {/* Green Tab Bar - Very Compact */}
            <div className="bg-[#487749] p-1 rounded-[12px] flex items-center gap-0.5 overflow-x-auto no-scrollbar shadow-sm mb-3">
                {tabsData.filter(t => t.canSelect).map(t => {
                    const isActive = activeTab === t.id;
                    const count = selectedScope[t.parentKey]?.length || 0;
                    return (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] text-[10px] font-bold whitespace-nowrap transition-all duration-300
                            ${isActive ? 'bg-white text-[#487749] shadow-sm' : 'text-white hover:bg-white/10'}`}
                        >
                            {t.label}
                            {count > 0 && <span className={`flex items-center justify-center min-w-[14px] h-[14px] px-0.5 text-[8px] font-black rounded-full ${isActive ? 'bg-[#487749] text-white' : 'bg-white text-[#487749]'}`}>{count}</span>}
                        </button>
                    );
                })}
            </div>

            <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0">
                    <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-[#F0F0F0] px-1">
                        <span className="text-[9px] font-black text-[#9E9E9E] uppercase tracking-tighter">
                            {currentTab.options.length} {currentTab.id} available
                        </span>
                        <div className="flex items-center gap-2">
                            {isLoadingOptions && <Loader2 className="w-3 h-3 text-[#487749] animate-spin" />}
                            <button
                                onClick={() => handleSelectAll(currentTab.id)}
                                disabled={disabled || currentTab.options.length === 0}
                                className={`text-[9px] font-bold uppercase tracking-tight underline-offset-2 hover:underline ${isAllSelected ? 'text-red-500' : 'text-[#487749]'}`}
                            >
                                {isAllSelected ? 'Reset All' : 'Select All'}
                            </button>
                        </div>
                    </div>

                    <div className="max-h-[95px] overflow-y-auto pr-1 custom-scrollbar px-1">
                        <div className="flex flex-col gap-0.5">
                            {currentTab.options.map(option => {
                                const isSelected = selectedScope[currentTab.parentKey]?.includes(option.id);
                                return (
                                    <label
                                        key={option.id}
                                        className="flex items-center gap-2 py-1 px-1 rounded transition-all cursor-pointer hover:bg-[#F5F5F5] group"
                                    >
                                        <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-all flex-shrink-0
                                            ${isSelected ? 'bg-[#487749] border-[#487749]' : 'border-[#D1D1D1] bg-white group-hover:border-[#487749]'}`}>
                                            {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={5} />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={isSelected} onChange={() => handleOptionToggle(currentTab.parentKey, option.id)} />
                                        <span className={`text-[11.5px] font-medium truncate ${isSelected ? 'text-[#212121] font-bold' : 'text-[#757575]'}`}>{option.name}</span>
                                    </label>
                                );
                            })}
                        </div>
                        {currentTab.options.length === 0 && (
                            <div className="py-4 text-center">
                                <p className="text-[10px] text-[#9E9E9E] italic">Select a {tabsData.find(t => t.canSelect && (tabsData.indexOf(t) < tabsData.indexOf(currentTab)))?.id || 'parent'} first</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

