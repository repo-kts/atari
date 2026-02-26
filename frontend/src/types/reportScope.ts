/**
 * Report Scope Types
 * Type definitions for hierarchical report scope selection
 */

export interface ScopeOption {
    id: number;
    name: string;
}

export interface ReportScope {
    zoneIds?: number[];
    stateIds?: number[];
    districtIds?: number[];
    orgIds?: number[];
    kvkIds?: number[];
}

export interface ScopeOptions {
    role: string;
    roleLevel: number;
    canSelectZones: boolean;
    canSelectStates: boolean;
    canSelectDistricts: boolean;
    canSelectOrgs: boolean;
    canSelectKvks: boolean;
    defaultKvkId: number | null;
    availableZones: ScopeOption[];
    availableStates: ScopeOption[];
    availableDistricts: ScopeOption[];
    availableOrgs: ScopeOption[];
    availableKvks: ScopeOption[];
}
