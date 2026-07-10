import React, { useEffect, useMemo, useCallback } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput, FormSelect, FormTextArea } from './shared/FormComponents'
import { DependentDropdown } from '@/components/common/DependentDropdown'
import { EntitySearchSelect } from '@/components/common/EntitySearchSelect'
import { Zone, State, Organization } from '@/types/masterData'
import { useMasterData } from '@/hooks/useMasterData'
import { masterDataApi } from '@/services/masterDataApi'
import { cleanIndianMobileInput } from '@/utils/indianPhone'

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

    if (entityType === ENTITY_TYPES.UNIVERSITIES) {
        // Institute is an independent master now — Host only needs its own
        // orgId (the absolute link to Institute), no geography to derive.
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
    // Determine which data needs to be fetched. Institute/Host are
    // independent masters now — they no longer need Zone options.
    const needsZones = entityType === ENTITY_TYPES.STATES ||
                      entityType === ENTITY_TYPES.DISTRICTS

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
        if (entityType && (entityType === ENTITY_TYPES.UNIVERSITIES ||
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
                    value={formData.zoneName ?? ''}
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
                        value={formData.stateName ?? ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev: any) => ({ ...prev, stateName: e.target.value }))
                        }, [setFormData])}
                        placeholder="Enter state name"
                    />
                    <FormSelect
                        label="Zone"
                        required
                        value={formData.zoneId ?? ''}
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
                        value={formData.districtName ?? ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev: any) => ({ ...prev, districtName: e.target.value }))
                        }, [setFormData])}
                        placeholder="Enter district name"
                    />
                    <FormSelect
                        label="Zone"
                        required
                        value={formData.zoneId ?? ''}
                        onChange={(e) => {
                            const zoneId = parseInt(e.target.value)
                            setFormData((prev: any) => ({ ...prev, zoneId, stateId: '' }))
                        }}
                        options={zoneOptions}
                    />
                    <DependentDropdown
                        label="State"
                        required
                        value={formData.stateId ?? ''}
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
                        label="Institute Name"
                        required
                        value={formData.orgName ?? ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev: any) => ({ ...prev, orgName: e.target.value }))
                        }, [setFormData])}
                        placeholder="Enter institute name"
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.UNIVERSITIES && (
                <div className="space-y-4">
                    <FormInput
                        label="Host Name"
                        required
                        value={formData.universityName ?? ''}
                        onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                            setFormData((prev: any) => ({ ...prev, universityName: e.target.value }))
                        }, [setFormData])}
                        placeholder="Enter host name"
                    />
                    <EntitySearchSelect
                        label="Institute"
                        required
                        value={formData.orgId ?? ''}
                        onSelect={(option) => {
                            setFormData((prev: any) => ({ ...prev, orgId: option ? option.value : '' }))
                        }}
                        search={useCallback(async (query: string, signal?: AbortSignal) => {
                            const response = await masterDataApi.getOrganizations({ search: query, limit: 20 }, signal)
                            return response.data.map((org: Organization) => ({
                                value: org.orgId,
                                label: org.orgName || 'Unknown',
                                record: org,
                            }))
                        }, [])}
                        placeholder="Search institute…"
                        emptyMessage="No institutes found"
                        initialLabel={formData.organization?.orgName || formData.org?.orgName}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            label="Mobile Number"
                            value={formData.hostMobile ?? ''}
                            onChange={(e) =>
                                setFormData((prev: any) => ({
                                    ...prev,
                                    hostMobile: cleanIndianMobileInput(e.target.value),
                                }))
                            }
                            placeholder="10-digit mobile"
                            inputMode="numeric"
                            autoComplete="tel"
                        />
                        <FormInput
                            label="Landline"
                            value={formData.hostLandline ?? ''}
                            onChange={(e) => setFormData((prev: any) => ({ ...prev, hostLandline: e.target.value }))}
                            placeholder="Enter landline number"
                        />
                        <FormInput
                            label="Fax"
                            value={formData.hostFax ?? ''}
                            onChange={(e) => setFormData((prev: any) => ({ ...prev, hostFax: e.target.value }))}
                            placeholder="Enter fax number"
                        />
                        <FormInput
                            label="E-mail"
                            type="email"
                            value={formData.hostEmail ?? ''}
                            onChange={(e) => setFormData((prev: any) => ({ ...prev, hostEmail: e.target.value }))}
                            placeholder="Enter email address"
                        />
                    </div>
                    <FormTextArea
                        label="Host Address"
                        rows={3}
                        value={formData.hostAddress ?? ''}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, hostAddress: e.target.value }))}
                        placeholder="Enter host address"
                    />
                </div>
            )}
        </>
    )
}
