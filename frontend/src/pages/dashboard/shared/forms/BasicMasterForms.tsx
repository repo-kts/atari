import React, { useEffect, useMemo, useCallback } from 'react'
import { ENTITY_TYPES } from '@/constants/entityTypes'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput, FormSelect } from './shared/FormComponents'
import { DependentDropdown } from '@/components/common/DependentDropdown'
import { Zone, State, District, Organization } from '@/types/masterData'
import { useMasterData } from '@/hooks/useMasterData'
import { masterDataApi } from '@/services/masterDataApi'

interface BasicMasterFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

// Note: useFilteredDistricts and useFilteredOrganizations hooks removed
// as we're now using DependentDropdown which handles loading and caching internally

/**
 * Helper function to extract nested IDs from related objects
 */
function extractNestedIds(prev: any, entityType: ExtendedEntityType): any {
    const updates: any = {}

    if (entityType === ENTITY_TYPES.ORGANIZATIONS) {
        // Extract zoneId from nested zone object (organization -> district -> state -> zone)
        if (!prev.zoneId) {
            updates.zoneId = prev.district?.state?.zone?.zoneId || prev.district?.zone?.zoneId || prev.zone?.zoneId
        }
        // Extract stateId from nested state object
        if (!prev.stateId) {
            updates.stateId = prev.district?.state?.stateId || prev.state?.stateId
        }
        // Extract districtId from nested district object
        if (!prev.districtId) {
            updates.districtId = prev.district?.districtId
        }
    } else if (entityType === ENTITY_TYPES.UNIVERSITIES) {
        // Extract zoneId from nested zone object (university -> organization -> district -> state -> zone)
        if (!prev.zoneId) {
            updates.zoneId = prev.organization?.district?.state?.zone?.zoneId ||
                           prev.district?.state?.zone?.zoneId ||
                           prev.district?.zone?.zoneId ||
                           prev.zone?.zoneId
        }
        // Extract stateId from nested state object
        if (!prev.stateId) {
            updates.stateId = prev.organization?.district?.state?.stateId ||
                            prev.district?.state?.stateId ||
                            prev.state?.stateId
        }
        // Extract districtId from nested district object
        if (!prev.districtId) {
            updates.districtId = prev.organization?.district?.districtId || prev.district?.districtId
        }
        // Extract orgId from nested org object
        if (!prev.orgId) {
            updates.orgId = prev.organization?.orgId || prev.org?.orgId
        }
    } else if (entityType === ENTITY_TYPES.DISTRICTS) {
        // Extract zoneId from nested zone object
        if (!prev.zoneId) {
            updates.zoneId = prev.state?.zone?.zoneId || prev.zone?.zoneId
        }
        // Extract stateId from nested state object
        if (!prev.stateId) {
            updates.stateId = prev.state?.stateId
        }
    } else if (entityType === ENTITY_TYPES.STATES) {
        // Extract zoneId from nested zone object
        if (!prev.zoneId) {
            updates.zoneId = prev.zone?.zoneId
        }
    }

    return Object.keys(updates).length > 0 ? { ...prev, ...updates } : prev
}


export const BasicMasterForms: React.FC<BasicMasterFormsProps> = ({
    entityType,
    formData,
    setFormData,
}) => {
    // Determine which data needs to be fetched
    const needsZones = entityType === ENTITY_TYPES.STATES ||
                      entityType === ENTITY_TYPES.DISTRICTS ||
                      entityType === ENTITY_TYPES.ORGANIZATIONS ||
                      entityType === ENTITY_TYPES.UNIVERSITIES

    // Fetch master data - only zones needed as other data loads dynamically via DependentDropdown
    const { data: zones = [] } = useMasterData<Zone>('zones', { enabled: needsZones })

    // Memoize options
    const zoneOptions = useMemo(() =>
        zones.map(z => ({ value: z.zoneId, label: z.zoneName })),
        [zones]
    )

    // Note: stateOptions, districtOptions, and organizationOptions are no longer needed
    // as we're using DependentDropdown which loads options dynamically

    // Extract nested IDs from related objects when editing
    useEffect(() => {
        if (entityType && (entityType === ENTITY_TYPES.ORGANIZATIONS ||
                          entityType === ENTITY_TYPES.UNIVERSITIES ||
                          entityType === ENTITY_TYPES.DISTRICTS ||
                          entityType === ENTITY_TYPES.STATES)) {
            setFormData((prev: any) => extractNestedIds(prev, entityType))
        }
    }, [entityType, setFormData])

    if (!entityType) return null

    return (
        <>
            {entityType === ENTITY_TYPES.ZONES && (
                <FormInput
                    label="Zone Name"
                    required
                    value={formData.zoneName || ''}
                    onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev: any) => ({ ...prev, zoneName: e.target.value }))
                    }, [setFormData])}
                    placeholder="Enter zone name"
                />
            )}

            {entityType === ENTITY_TYPES.STATES && (
                <div className="space-y-4">
                    <FormInput
                        label="State Name"
                        required
                        value={formData.stateName || ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev: any) => ({ ...prev, stateName: e.target.value }))
                        }, [setFormData])}
                        placeholder="Enter state name"
                    />
                    <FormSelect
                        label="Zone"
                        required
                        value={formData.zoneId || ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
                            setFormData((prev: any) => ({ ...prev, zoneId: parseInt(e.target.value) }))
                        }, [setFormData])}
                        options={zoneOptions}
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.DISTRICTS && (
                <div className="space-y-4">
                    <FormInput
                        label="District Name"
                        required
                        value={formData.districtName || ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev: any) => ({ ...prev, districtName: e.target.value }))
                        }, [setFormData])}
                        placeholder="Enter district name"
                    />
                    <FormSelect
                        label="Zone"
                        required
                        value={formData.zoneId || ''}
                        onChange={(e) => {
                            const zoneId = parseInt(e.target.value)
                            setFormData((prev: any) => ({ ...prev, zoneId, stateId: '' }))
                        }}
                        options={zoneOptions}
                    />
                    <DependentDropdown
                        label="State"
                        required
                        value={formData.stateId || ''}
                        onChange={(value) => {
                            setFormData((prev: any) => ({ ...prev, stateId: value }))
                        }}
                        options={[]}
                        dependsOn={{
                            value: formData.zoneId,
                            field: 'zoneId',
                        }}
                        onOptionsLoad={async (zoneId, signal) => {
                            const response = await masterDataApi.getStatesByZone(zoneId as number, signal)
                            return response.data.map((s: State) => ({
                                value: s.stateId,
                                label: s.stateName,
                            }))
                        }}
                        cacheKey="states-by-zone"
                        emptyMessage="No states available for this zone"
                        loadingMessage="Loading states..."
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.ORGANIZATIONS && (
                <div className="space-y-4">
                    <FormInput
                        label="Organization Name"
                        required
                        value={formData.orgName || ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev: any) => ({ ...prev, orgName: e.target.value }))
                        }, [setFormData])}
                        placeholder="Enter organization name"
                    />
                    <FormSelect
                        label="Zone"
                        required
                        value={formData.zoneId || ''}
                        onChange={(e) => {
                            const zoneId = parseInt(e.target.value)
                            setFormData((prev: any) => ({ ...prev, zoneId, stateId: '', districtId: '' }))
                        }}
                        options={zoneOptions}
                    />
                    <DependentDropdown
                        label="State"
                        required
                        value={formData.stateId || ''}
                        onChange={(value) => {
                            setFormData((prev: any) => ({ ...prev, stateId: value, districtId: '' }))
                        }}
                        options={[]}
                        dependsOn={{
                            value: formData.zoneId,
                            field: 'zoneId',
                        }}
                        onOptionsLoad={async (zoneId, signal) => {
                            const response = await masterDataApi.getStatesByZone(zoneId as number, signal)
                            return response.data.map((s: State) => ({
                                value: s.stateId,
                                label: s.stateName,
                            }))
                        }}
                        cacheKey="states-by-zone"
                        emptyMessage="No states available for this zone"
                        loadingMessage="Loading states..."
                    />
                    <DependentDropdown
                        label="District"
                        required
                        value={formData.districtId || ''}
                        onChange={(value) => {
                            setFormData((prev: any) => ({ ...prev, districtId: value }))
                        }}
                        options={[]}
                        dependsOn={{
                            value: formData.stateId,
                            field: 'stateId',
                        }}
                        onOptionsLoad={async (stateId, signal) => {
                            const response = await masterDataApi.getDistrictsByState(stateId as number, signal)
                            return response.data.map((d: District) => ({
                                value: d.districtId,
                                label: d.districtName,
                            }))
                        }}
                        cacheKey="districts-by-state"
                        emptyMessage="No districts available for this state"
                        loadingMessage="Loading districts..."
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.UNIVERSITIES && (
                <div className="space-y-4">
                    <FormInput
                        label="University Name"
                        required
                        value={formData.universityName || ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev: any) => ({ ...prev, universityName: e.target.value }))
                        }, [setFormData])}
                        placeholder="Enter university name"
                    />
                    <FormSelect
                        label="Zone"
                        required
                        value={formData.zoneId || ''}
                        onChange={(e) => {
                            const zoneId = parseInt(e.target.value)
                            setFormData((prev: any) => ({ ...prev, zoneId, stateId: '', districtId: '', orgId: '' }))
                        }}
                        options={zoneOptions}
                    />
                    <DependentDropdown
                        label="State"
                        required
                        value={formData.stateId || ''}
                        onChange={(value) => {
                            setFormData((prev: any) => ({ ...prev, stateId: value, districtId: '', orgId: '' }))
                        }}
                        options={[]}
                        dependsOn={{
                            value: formData.zoneId,
                            field: 'zoneId',
                        }}
                        onOptionsLoad={async (zoneId, signal) => {
                            const response = await masterDataApi.getStatesByZone(zoneId as number, signal)
                            return response.data.map((s: State) => ({
                                value: s.stateId,
                                label: s.stateName,
                            }))
                        }}
                        cacheKey="states-by-zone"
                        emptyMessage="No states available for this zone"
                        loadingMessage="Loading states..."
                    />
                    <DependentDropdown
                        label="District"
                        required
                        value={formData.districtId || ''}
                        onChange={(value) => {
                            setFormData((prev: any) => ({ ...prev, districtId: value, orgId: '' }))
                        }}
                        options={[]}
                        dependsOn={{
                            value: formData.stateId,
                            field: 'stateId',
                        }}
                        onOptionsLoad={async (stateId, signal) => {
                            const response = await masterDataApi.getDistrictsByState(stateId as number, signal)
                            return response.data.map((d: District) => ({
                                value: d.districtId,
                                label: d.districtName,
                            }))
                        }}
                        cacheKey="districts-by-state"
                        emptyMessage="No districts available for this state"
                        loadingMessage="Loading districts..."
                    />
                    <DependentDropdown
                        label="Organization"
                        required
                        value={formData.orgId || ''}
                        onChange={(value) => {
                            setFormData((prev: any) => ({ ...prev, orgId: value }))
                        }}
                        options={[]}
                        dependsOn={{
                            value: formData.districtId,
                            field: 'districtId',
                        }}
                        onOptionsLoad={async (districtId, signal) => {
                            const response = await masterDataApi.getOrganizationsByDistrict(districtId as number, signal)
                            return response.data.map((org: Organization) => ({
                                value: org.orgId,
                                label: org.orgName,
                            }))
                        }}
                        cacheKey="organizations-by-district"
                        emptyMessage="No organizations available for this district"
                        loadingMessage="Loading organizations..."
                    />
                </div>
            )}
        </>
    )
}
