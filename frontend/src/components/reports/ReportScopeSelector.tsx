import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { MapPin, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import {
    useScopeOptions,
    useFilteredChildren,
    useFilteredKvks,
} from '../../hooks/report/useReportScope';
import type { ReportScope, ScopeOption } from '../../types/reportScope';

interface ReportScopeSelectorProps {
    onScopeChange: (scope: ReportScope | null) => void;
    disabled?: boolean;
}

export const ReportScopeSelector: React.FC<ReportScopeSelectorProps> = ({
    onScopeChange,
    disabled = false,
}) => {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const [selectedScope, setSelectedScope] = useState<ReportScope>({});

    // Fetch scope options
    const { data: scopeOptions, isLoading: isLoadingScopeOptions } = useScopeOptions();

    // Fetch filtered states when zones are selected
    const filteredStatesQuery = useFilteredChildren(
        'zones',
        selectedScope.zoneIds,
        { enabled: scopeOptions?.canSelectStates || false }
    );

    // Fetch filtered districts when states are selected
    const filteredDistrictsByStatesQuery = useFilteredChildren(
        'states',
        selectedScope.stateIds,
        { enabled: scopeOptions?.canSelectDistricts || false }
    );

    // Fetch filtered districts when zones are selected (but states are not)
    // First get states from zones, then districts from those states
    const statesByZonesQuery = useFilteredChildren(
        'zones',
        selectedScope.zoneIds,
        {
            enabled:
                (scopeOptions?.canSelectDistricts || false) &&
                !!selectedScope.zoneIds &&
                selectedScope.zoneIds.length > 0 &&
                (!selectedScope.stateIds || selectedScope.stateIds.length === 0),
        }
    );

    const filteredDistrictsByZonesQuery = useFilteredChildren(
        'states',
        statesByZonesQuery.data?.map(s => s.id),
        {
            enabled:
                (scopeOptions?.canSelectDistricts || false) &&
                !!statesByZonesQuery.data &&
                statesByZonesQuery.data.length > 0 &&
                (!selectedScope.stateIds || selectedScope.stateIds.length === 0),
        }
    );

    // Fetch filtered orgs when districts are selected
    const filteredOrgsByDistrictsQuery = useFilteredChildren(
        'districts',
        selectedScope.districtIds,
        { enabled: scopeOptions?.canSelectOrgs || false }
    );

    // Fetch filtered orgs when states are selected (but districts are not)
    const districtsByStatesForOrgsQuery = useFilteredChildren(
        'states',
        selectedScope.stateIds,
        {
            enabled:
                (scopeOptions?.canSelectOrgs || false) &&
                !!selectedScope.stateIds &&
                selectedScope.stateIds.length > 0 &&
                (!selectedScope.districtIds || selectedScope.districtIds.length === 0),
        }
    );

    const filteredOrgsByStatesQuery = useFilteredChildren(
        'districts',
        districtsByStatesForOrgsQuery.data?.map(d => d.id),
        {
            enabled:
                (scopeOptions?.canSelectOrgs || false) &&
                !!districtsByStatesForOrgsQuery.data &&
                districtsByStatesForOrgsQuery.data.length > 0 &&
                (!selectedScope.districtIds || selectedScope.districtIds.length === 0),
        }
    );

    // Fetch filtered orgs when zones are selected (but states/districts are not)
    const statesByZonesForOrgsQuery = useFilteredChildren(
        'zones',
        selectedScope.zoneIds,
        {
            enabled:
                (scopeOptions?.canSelectOrgs || false) &&
                !!selectedScope.zoneIds &&
                selectedScope.zoneIds.length > 0 &&
                (!selectedScope.stateIds || selectedScope.stateIds.length === 0) &&
                (!selectedScope.districtIds || selectedScope.districtIds.length === 0),
        }
    );

    const districtsByZonesForOrgsQuery = useFilteredChildren(
        'states',
        statesByZonesForOrgsQuery.data?.map(s => s.id),
        {
            enabled:
                (scopeOptions?.canSelectOrgs || false) &&
                !!statesByZonesForOrgsQuery.data &&
                statesByZonesForOrgsQuery.data.length > 0 &&
                (!selectedScope.stateIds || selectedScope.stateIds.length === 0) &&
                (!selectedScope.districtIds || selectedScope.districtIds.length === 0),
        }
    );

    const filteredOrgsByZonesQuery = useFilteredChildren(
        'districts',
        districtsByZonesForOrgsQuery.data?.map(d => d.id),
        {
            enabled:
                (scopeOptions?.canSelectOrgs || false) &&
                !!districtsByZonesForOrgsQuery.data &&
                districtsByZonesForOrgsQuery.data.length > 0 &&
                (!selectedScope.stateIds || selectedScope.stateIds.length === 0) &&
                (!selectedScope.districtIds || selectedScope.districtIds.length === 0),
        }
    );

    // Fetch filtered KVKs when any parent is selected
    const filteredKvksQuery = useFilteredKvks(
        {
            zoneIds: selectedScope.zoneIds,
            stateIds: selectedScope.stateIds,
            districtIds: selectedScope.districtIds,
            orgIds: selectedScope.orgIds,
        },
        { enabled: scopeOptions?.canSelectKvks || false }
    );

    // Compute effective filtered options
    const filteredStates = useMemo(() => {
        if (selectedScope.zoneIds && selectedScope.zoneIds.length > 0) {
            return filteredStatesQuery.data || scopeOptions?.availableStates || [];
        }
        return scopeOptions?.availableStates || [];
    }, [selectedScope.zoneIds, filteredStatesQuery.data, scopeOptions?.availableStates]);

    const filteredDistricts = useMemo(() => {
        if (selectedScope.stateIds && selectedScope.stateIds.length > 0) {
            return filteredDistrictsByStatesQuery.data || scopeOptions?.availableDistricts || [];
        }
        if (selectedScope.zoneIds && selectedScope.zoneIds.length > 0) {
            return filteredDistrictsByZonesQuery.data || scopeOptions?.availableDistricts || [];
        }
        return scopeOptions?.availableDistricts || [];
    }, [
        selectedScope.stateIds,
        selectedScope.zoneIds,
        filteredDistrictsByStatesQuery.data,
        filteredDistrictsByZonesQuery.data,
        scopeOptions?.availableDistricts,
    ]);

    const filteredOrgs = useMemo(() => {
        if (selectedScope.districtIds && selectedScope.districtIds.length > 0) {
            return filteredOrgsByDistrictsQuery.data || scopeOptions?.availableOrgs || [];
        }
        if (selectedScope.stateIds && selectedScope.stateIds.length > 0) {
            return filteredOrgsByStatesQuery.data || scopeOptions?.availableOrgs || [];
        }
        if (selectedScope.zoneIds && selectedScope.zoneIds.length > 0) {
            return filteredOrgsByZonesQuery.data || scopeOptions?.availableOrgs || [];
        }
        return scopeOptions?.availableOrgs || [];
    }, [
        selectedScope.districtIds,
        selectedScope.stateIds,
        selectedScope.zoneIds,
        filteredOrgsByDistrictsQuery.data,
        filteredOrgsByStatesQuery.data,
        filteredOrgsByZonesQuery.data,
        scopeOptions?.availableOrgs,
    ]);

    const filteredKvks = useMemo(() => {
        const hasFilters =
            (selectedScope.zoneIds && selectedScope.zoneIds.length > 0) ||
            (selectedScope.stateIds && selectedScope.stateIds.length > 0) ||
            (selectedScope.districtIds && selectedScope.districtIds.length > 0) ||
            (selectedScope.orgIds && selectedScope.orgIds.length > 0);

        if (hasFilters && filteredKvksQuery.data) {
            return filteredKvksQuery.data;
        }
        return scopeOptions?.availableKvks || [];
    }, [selectedScope, filteredKvksQuery.data, scopeOptions?.availableKvks]);

    // Loading states
    const loadingStates = filteredStatesQuery.isLoading;
    const loadingDistricts =
        filteredDistrictsByStatesQuery.isLoading || filteredDistrictsByZonesQuery.isLoading;
    const loadingOrgs =
        filteredOrgsByDistrictsQuery.isLoading ||
        filteredOrgsByStatesQuery.isLoading ||
        filteredOrgsByZonesQuery.isLoading;
    const loadingKvks = filteredKvksQuery.isLoading;

    // Initialize with default KVK if user is KVK admin
    useEffect(() => {
        if (scopeOptions?.defaultKvkId && !scopeOptions.canSelectKvks) {
            setSelectedScope({ kvkIds: [scopeOptions.defaultKvkId] });
            onScopeChange({ kvkIds: [scopeOptions.defaultKvkId] });
        }
    }, [scopeOptions?.defaultKvkId, scopeOptions?.canSelectKvks, onScopeChange]);

    const toggleSection = (section: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(section)) {
            newExpanded.delete(section);
        } else {
            newExpanded.add(section);
        }
        setExpandedSections(newExpanded);
    };

    const handleOptionToggle = (
        type: 'zoneIds' | 'stateIds' | 'districtIds' | 'orgIds' | 'kvkIds',
        optionId: number
    ) => {
        const newScope = { ...selectedScope };
        const currentIds = newScope[type] || [];

        if (currentIds.includes(optionId)) {
            newScope[type] = currentIds.filter(id => id !== optionId);
        } else {
            newScope[type] = [...currentIds, optionId];
        }

        // Clear child selections when parent is deselected
        if (type === 'zoneIds' && !newScope.zoneIds?.includes(optionId)) {
            delete newScope.stateIds;
            delete newScope.districtIds;
            delete newScope.orgIds;
            delete newScope.kvkIds;
        } else if (type === 'stateIds' && !newScope.stateIds?.includes(optionId)) {
            delete newScope.districtIds;
            delete newScope.orgIds;
            delete newScope.kvkIds;
        } else if (type === 'districtIds' && !newScope.districtIds?.includes(optionId)) {
            delete newScope.orgIds;
            delete newScope.kvkIds;
        } else if (type === 'orgIds' && !newScope.orgIds?.includes(optionId)) {
            delete newScope.kvkIds;
        }

        // Remove empty arrays
        Object.keys(newScope).forEach(key => {
            const k = key as keyof ReportScope;
            if (Array.isArray(newScope[k]) && newScope[k]!.length === 0) {
                delete newScope[k];
            }
        });

        setSelectedScope(newScope);
        onScopeChange(Object.keys(newScope).length > 0 ? newScope : null);
    };

    const handleSelectAll = (type: 'zones' | 'states' | 'districts' | 'orgs' | 'kvks') => {
        if (!scopeOptions) return;

        const newScope = { ...selectedScope };
        const typeMap = {
            zones: { key: 'zoneIds' as const, options: scopeOptions.availableZones },
            states: { key: 'stateIds' as const, options: filteredStates },
            districts: { key: 'districtIds' as const, options: filteredDistricts },
            orgs: { key: 'orgIds' as const, options: filteredOrgs },
            kvks: { key: 'kvkIds' as const, options: filteredKvks },
        };

        const { key, options } = typeMap[type];
        const currentIds = newScope[key] || [];
        const allIds = options.map(o => o.id);

        if (currentIds.length === allIds.length) {
            delete newScope[key];
        } else {
            newScope[key] = allIds;
        }

        setSelectedScope(newScope);
        onScopeChange(Object.keys(newScope).length > 0 ? newScope : null);
    };

    const renderMultiSelect = (
        type: 'zones' | 'states' | 'districts' | 'orgs' | 'kvks',
        options: ScopeOption[],
        canSelect: boolean,
        selectedIds: number[] = [],
        isLoading: boolean = false
    ) => {
        if (!canSelect) {
            return null;
        }

        const typeMap = {
            zones: { key: 'zoneIds' as const, label: 'Zones' },
            states: { key: 'stateIds' as const, label: 'States' },
            districts: { key: 'districtIds' as const, label: 'Districts' },
            orgs: { key: 'orgIds' as const, label: 'Organizations' },
            kvks: { key: 'kvkIds' as const, label: 'KVKs' },
        };

        const { key, label } = typeMap[type];
        const isExpanded = expandedSections.has(type);
        const allSelected = selectedIds.length === options.length && options.length > 0;

        return (
            <div className="border border-[#E0E0E0] rounded-xl overflow-hidden">
                <button
                    type="button"
                    onClick={() => toggleSection(type)}
                    disabled={disabled}
                    className="w-full flex items-center justify-between p-4 bg-[#FAF9F6] hover:bg-[#F5F5F5] transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#487749]" />
                        <span className="font-medium text-[#212121]">{label}</span>
                        {selectedIds.length > 0 && (
                            <span className="text-sm text-[#757575]">
                                ({selectedIds.length} selected)
                            </span>
                        )}
                    </div>
                    {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#757575]" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-[#757575]" />
                    )}
                </button>

                {isExpanded && (
                    <div className="p-4 bg-white border-t border-[#E0E0E0]">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-[#757575]">
                                {options.length} {label.toLowerCase()} available
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSelectAll(type)}
                                disabled={disabled}
                                type="button"
                            >
                                {allSelected ? 'Deselect All' : 'Select All'}
                            </Button>
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-2">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-5 h-5 text-[#487749] animate-spin" />
                                    <span className="ml-2 text-sm text-[#757575]">Loading {label.toLowerCase()}...</span>
                                </div>
                            ) : options.length === 0 ? (
                                <div className="text-center py-8 text-sm text-[#757575]">
                                    No {label.toLowerCase()} available for selected parent(s)
                                </div>
                            ) : (
                                options.map(option => (
                                    <label
                                        key={option.id}
                                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#F5F5F5] cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(option.id)}
                                            onChange={() => handleOptionToggle(key, option.id)}
                                            disabled={disabled}
                                            className="w-4 h-4 text-[#487749] focus:ring-[#487749] rounded"
                                        />
                                        <span className="text-sm text-[#212121]">{option.name}</span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Loading state
    if (isLoadingScopeOptions) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 text-[#487749] animate-spin" />
                        <span className="ml-2 text-sm text-[#757575]">Loading scope options...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // If no scope options, don't render
    if (!scopeOptions) {
        return null;
    }

    // If user can only access their KVK, show read-only info
    if (scopeOptions.defaultKvkId && !scopeOptions.canSelectKvks) {
        const kvk = scopeOptions.availableKvks.find(k => k.id === scopeOptions.defaultKvkId);
        return (
            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#487749] mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Report Scope
                    </h3>
                    <div className="p-4 bg-[#F5F5F5] rounded-xl border border-[#E0E0E0]">
                        <p className="text-sm text-[#757575] mb-2">Your KVK:</p>
                        <p className="font-medium text-[#212121]">{kvk?.name || 'Your KVK'}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-[#487749] mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Report Scope Selection
                </h3>
                <p className="text-sm text-[#757575] mb-4">
                    Select the scope for your aggregated report. You can select multiple options at each level.
                </p>

                <div className="space-y-3">
                    {renderMultiSelect(
                        'zones',
                        scopeOptions.availableZones,
                        scopeOptions.canSelectZones,
                        selectedScope.zoneIds,
                        false
                    )}
                    {renderMultiSelect(
                        'states',
                        filteredStates,
                        scopeOptions.canSelectStates,
                        selectedScope.stateIds,
                        loadingStates
                    )}
                    {renderMultiSelect(
                        'districts',
                        filteredDistricts,
                        scopeOptions.canSelectDistricts,
                        selectedScope.districtIds,
                        loadingDistricts
                    )}
                    {renderMultiSelect(
                        'orgs',
                        filteredOrgs,
                        scopeOptions.canSelectOrgs,
                        selectedScope.orgIds,
                        loadingOrgs
                    )}
                    {renderMultiSelect(
                        'kvks',
                        filteredKvks,
                        scopeOptions.canSelectKvks,
                        selectedScope.kvkIds,
                        loadingKvks
                    )}
                </div>

                {Object.keys(selectedScope).length === 0 && (
                    <p className="text-sm text-[#757575] mt-4 italic">
                        No scope selected. Report will be generated for your default scope.
                    </p>
                )}
            </CardContent>
        </Card>
    );
};
