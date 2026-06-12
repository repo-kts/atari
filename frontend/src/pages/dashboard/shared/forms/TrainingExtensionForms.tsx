import React, { useEffect, useCallback, useMemo } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput, FormSelect, FormSection } from './shared/FormComponents'
import { DependentDropdown } from '@/components/common/DependentDropdown'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { IsOtherCheckbox } from '@/components/common/IsOtherCheckbox'
import { SpecifyOtherInput } from '@/components/common/SpecifyOtherInput'
import { useOtherSpecify } from '@/hooks/useOtherSpecify'
import {
    useTrainingTypes,
    useTrainingAreas,
    useTrainingThematicAreasByArea,
} from '@/hooks/useTrainingExtensionEventsData'
import { useAuth } from '@/contexts/AuthContext'
import { useKvkStaffForDropdown } from '@/hooks/forms/useAboutKvkData'
import {
    useTrainingClientele,
    useFundingSources,
    useImportantDays,
} from '@/hooks/useOtherMastersData'
import {
    useExtensionActivities,
    useOtherExtensionActivities,
} from '@/hooks/useTrainingExtensionEventsData'
import { trainingExtensionEventsApi } from '@/services/trainingExtensionEventsApi'
import {
    createStaffOptions,
    handleStaffChange,
    createMasterDataOptions,
    filterByParentId,
} from '@/utils/formHelpers'

interface TrainingExtensionFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

export const TrainingExtensionForms: React.FC<TrainingExtensionFormsProps> = ({
    entityType,
    formData,
    setFormData,
}) => {
    const { user } = useAuth()

    // Automatically sync kvkId from user session if it's missing in formData
    useEffect(() => {
        if (user?.kvkId && !formData.kvkId && !formData.id) {
            setFormData((prev: any) => ({ ...prev, kvkId: user.kvkId }))
        }
    }, [user?.kvkId, formData.kvkId, formData.id, setFormData])

    // Sync activityId to extensionActivityTypeId for edit mode compatibility
    useEffect(() => {
        if (formData.activityId && !formData.extensionActivityTypeId && entityType === ENTITY_TYPES.ACHIEVEMENT_EXTENSION) {
            setFormData((prev: any) => ({ ...prev, extensionActivityTypeId: prev.activityId }))
        }
    }, [formData.activityId, formData.extensionActivityTypeId, entityType, setFormData])

    // Sync activityTypeId to otherExtensionActivityTypeId for edit mode compatibility
    useEffect(() => {
        if (formData.activityTypeId && !formData.otherExtensionActivityTypeId && entityType === ENTITY_TYPES.ACHIEVEMENT_OTHER_EXTENSION) {
            setFormData((prev: any) => ({ ...prev, otherExtensionActivityTypeId: prev.activityTypeId }))
        }
    }, [formData.activityTypeId, formData.otherExtensionActivityTypeId, entityType, setFormData])

    // Sync thematicAreaId to trainingThematicAreaId for edit mode compatibility
    // Backend now returns trainingThematicAreaId, but we still sync if only thematicAreaId is present
    useEffect(() => {
        if (entityType === ENTITY_TYPES.ACHIEVEMENT_TRAINING) {
            // If we have thematicAreaId but no trainingThematicAreaId, use thematicAreaId as fallback
            if (formData.thematicAreaId && !formData.trainingThematicAreaId) {
                setFormData((prev: any) => ({ ...prev, trainingThematicAreaId: prev.thematicAreaId }))
            }
            // Also ensure trainingThematicAreaId is set if we have it from backend
            if (formData.trainingThematicAreaId && !formData.thematicAreaId) {
                setFormData((prev: any) => ({ ...prev, thematicAreaId: prev.trainingThematicAreaId }))
            }
        }
    }, [formData.thematicAreaId, formData.trainingThematicAreaId, entityType, setFormData])

    // Master data hooks
    const { data: trainingTypes = [] } = useTrainingTypes()
    const { data: trainingAreas = [] } = useTrainingAreas()
    const { data: trainingClientele = [] } = useTrainingClientele()
    const { data: fundingSources = [] } = useFundingSources()
    const { data: extensionActivities = [] } = useExtensionActivities()
    const { data: otherExtensionActivities = [] } = useOtherExtensionActivities()
    const { data: importantDays = [] } = useImportantDays()

    // KVK Staff dropdown - depends on kvkId
    const activeKvkId = user?.kvkId || formData.kvkId
    const { data: kvkStaffData = [], isLoading: isLoadingKvkStaff } = useKvkStaffForDropdown(activeKvkId)

    // Sync coordinatorId/coordinator to staffId for edit mode compatibility
    // Backend now returns staffId, but we still sync if only coordinatorId/coordinator is present
    useEffect(() => {
        if (entityType === ENTITY_TYPES.ACHIEVEMENT_TRAINING && kvkStaffData && kvkStaffData.length > 0) {
            // If we have coordinatorId or coordinator name but no staffId, try to find matching staff
            if ((formData.coordinatorId || formData.coordinator) && !formData.staffId) {
                const coordinatorName = formData.coordinator || formData.coordinatorName || formData.staffName;
                if (coordinatorName) {
                    // Find staff by name (case-insensitive)
                    const matchingStaff = kvkStaffData.find((staff: any) =>
                        staff.staffName &&
                        staff.staffName.toLowerCase() === coordinatorName.toLowerCase()
                    );
                    if (matchingStaff) {
                        setFormData((prev: any) => ({
                            ...prev,
                            staffId: matchingStaff.kvkStaffId,
                            staffName: matchingStaff.staffName
                        }));
                    }
                }
            }
        }
    }, [formData.coordinatorId, formData.coordinator, formData.staffId, entityType, kvkStaffData, setFormData])

    // Sync field name variations for participant counts (handle field name mismatches)
    useEffect(() => {
        if (entityType === ENTITY_TYPES.ACHIEVEMENT_TECHNOLOGY_WEEK ||
            entityType === ENTITY_TYPES.ACHIEVEMENT_TRAINING ||
            entityType === ENTITY_TYPES.ACHIEVEMENT_EXTENSION ||
            entityType === ENTITY_TYPES.ACHIEVEMENT_CELEBRATION_DAYS) {
            setFormData((prev: any) => {
                const updates: any = {};
                // Sync st_F (capital F) to st_f (lowercase) if present
                if (prev.st_F !== undefined && prev.st_f === undefined) {
                    updates.st_f = prev.st_F;
                }
                if (prev.stF !== undefined && prev.st_f === undefined) {
                    updates.st_f = prev.stF;
                }
                // Sync obc_F (capital F) to obc_f (lowercase) if present
                if (prev.obc_F !== undefined && prev.obc_f === undefined) {
                    updates.obc_f = prev.obc_F;
                }
                if (prev.obcF !== undefined && prev.obc_f === undefined) {
                    updates.obc_f = prev.obcF;
                }
                // Sync sc_F (capital F) to sc_f (lowercase) if present
                if (prev.sc_F !== undefined && prev.sc_f === undefined) {
                    updates.sc_f = prev.sc_F;
                }
                if (prev.scF !== undefined && prev.sc_f === undefined) {
                    updates.sc_f = prev.scF;
                }
                if (Object.keys(updates).length === 0) return prev;
                return { ...prev, ...updates };
            });
        }
    }, [formData.st_F, formData.stF, formData.st_f, formData.obc_F, formData.obcF, formData.obc_f, formData.sc_F, formData.scF, formData.sc_f, entityType, setFormData])

    // Training Thematic Areas - depends on trainingAreaId
    const { data: trainingThematicAreasData = [], isLoading: isLoadingTrainingThematicAreas } = useTrainingThematicAreasByArea(
        formData.trainingAreaId ? parseInt(formData.trainingAreaId) : null
    )

    // Master-controlled "Other → specify" for the training achievement chain.
    const trainingClienteleOptions = useMemo(
        () => createMasterDataOptions(trainingClientele, 'clienteleId', 'name', { flagKey: 'isOther' }),
        [trainingClientele]
    )
    const trainingTypeOptions = useMemo(
        () => createMasterDataOptions(trainingTypes, 'trainingTypeId', 'trainingTypeName', { flagKey: 'isOther' }),
        [trainingTypes]
    )
    const trainingAreaOptions = useMemo(
        () => filterByParentId(trainingAreas, 'trainingTypeId', formData.trainingTypeId)
            .map((a: any) => ({ value: a.trainingAreaId, label: a.trainingAreaName || a.name || '', isOther: Boolean(a.isOther) })),
        [trainingAreas, formData.trainingTypeId]
    )
    const trainingThematicOptions = useMemo(
        () => (trainingThematicAreasData as any[]).map((t: any) => ({
            value: t.trainingThematicAreaId,
            label: t.trainingThematicAreaName,
            isOther: Boolean(t.isOther),
        })),
        [trainingThematicAreasData]
    )
    const trainingFundingOptions = useMemo(
        () => createMasterDataOptions(fundingSources, 'fundingSourceId', 'name', { flagKey: 'isOther' }),
        [fundingSources]
    )
    const { isOtherSelected: isOtherClientele, otherResetPatch: clienteleResetPatch } = useOtherSpecify(trainingClienteleOptions, formData.clienteleId)
    const { isOtherSelected: isOtherTrainingType, otherResetPatch: trainingTypeResetPatch } = useOtherSpecify(trainingTypeOptions, formData.trainingTypeId)
    const { isOtherSelected: isOtherTrainingArea, otherResetPatch: trainingAreaResetPatch } = useOtherSpecify(trainingAreaOptions, formData.trainingAreaId)
    const { isOtherSelected: isOtherTrainingThematic, otherResetPatch: trainingThematicResetPatch } = useOtherSpecify(trainingThematicOptions, formData.trainingThematicAreaId || formData.thematicAreaId)
    const { isOtherSelected: isOtherTrainingFunding, otherResetPatch: trainingFundingResetPatch } = useOtherSpecify(trainingFundingOptions, formData.fundingSourceId)

    // Memoized onOptionsLoad functions to prevent infinite re-renders
    const loadTrainingAreasByType = useCallback(async (trainingTypeId: any) => {
        const response = await trainingExtensionEventsApi.getTrainingAreasByType(trainingTypeId as number);
        return response.data.map((area: any) => ({
            value: area.trainingAreaId,
            label: area.trainingAreaName,
            isOther: Boolean(area.isOther)
        }));
    }, []);

    const loadTrainingThematicAreasByArea = useCallback(async (trainingAreaId: any) => {
        const response = await trainingExtensionEventsApi.getTrainingThematicAreasByArea(trainingAreaId as number);
        return response.data.map((thematicArea: any) => ({
            value: thematicArea.trainingThematicAreaId,
            label: thematicArea.trainingThematicAreaName,
            isOther: Boolean(thematicArea.isOther)
        }));
    }, []);

    // Memoized onChange handlers
    const handleTrainingTypeChange = useCallback((value: string | number) => {
        setFormData((prev: any) => ({
            ...prev,
            trainingTypeId: value as number,
            trainingAreaId: '', // Reset training area when type changes
            trainingThematicAreaId: '', // Reset thematic area when type changes
            // Child specify-other texts reset with their dropdowns.
            trainingAreaOther: '',
            thematicAreaOther: '',
            ...trainingTypeResetPatch(value, 'trainingTypeOther'),
        }));
    }, [setFormData, trainingTypeResetPatch]);

    const handleTrainingAreaChange = useCallback((value: string | number) => {
        setFormData((prev: any) => ({
            ...prev,
            trainingAreaId: value as number,
            trainingThematicAreaId: '', // Reset thematic area when area changes
            thematicAreaOther: '',
            ...trainingAreaResetPatch(value, 'trainingAreaOther'),
        }));
    }, [setFormData, trainingAreaResetPatch]);

    const handleTrainingThematicAreaChange = useCallback((value: string | number) => {
        const selectedThematicArea = trainingThematicAreasData?.find((t: any) => t.trainingThematicAreaId === value);
        setFormData((prev: any) => ({
            ...prev,
            trainingThematicAreaId: value as number,
            thematicArea: selectedThematicArea?.trainingThematicAreaName || '',
            ...trainingThematicResetPatch(value, 'thematicAreaOther'),
        }));
    }, [trainingThematicAreasData, setFormData, trainingThematicResetPatch]);

    const handleClienteleChange = useCallback((value: string | number) => {
        const selectedClientele = trainingClientele.find((c: any) => c.clienteleId === value);
        setFormData((prev: any) => ({
            ...prev,
            clienteleId: value as number,
            clientele: selectedClientele?.name || '',
            ...clienteleResetPatch(value, 'clienteleOther'),
        }));
    }, [trainingClientele, setFormData, clienteleResetPatch]);

    const handleFundingSourceChange = useCallback((value: string | number) => {
        const selectedFundingSource = fundingSources.find((f: any) => f.fundingSourceId === value);
        setFormData((prev: any) => ({
            ...prev,
            fundingSourceId: value as number,
            fundingSource: selectedFundingSource?.name || '',
            ...trainingFundingResetPatch(value, 'fundingSourceOther'),
        }));
    }, [fundingSources, setFormData, trainingFundingResetPatch]);

    const extensionActivityOptions = useMemo(
        () => createMasterDataOptions(extensionActivities, 'extensionActivityId', 'extensionName', { flagKey: 'isOther' }),
        [extensionActivities]
    )
    const otherExtensionActivityOptions = useMemo(
        () => createMasterDataOptions(otherExtensionActivities, 'otherExtensionActivityId', 'otherExtensionName', { flagKey: 'isOther' }),
        [otherExtensionActivities]
    )
    const { isOtherSelected: isOtherExtensionActivity, otherResetPatch: extensionActivityResetPatch } = useOtherSpecify(
        extensionActivityOptions,
        formData.extensionActivityTypeId || formData.activityId
    )
    const { isOtherSelected: isOtherOtherExtension, otherResetPatch: otherExtensionResetPatch } = useOtherSpecify(
        otherExtensionActivityOptions,
        formData.otherExtensionActivityTypeId || formData.activityTypeId
    )

    const handleExtensionActivityTypeChange = useCallback((value: string | number) => {
        const selectedActivity = extensionActivities.find((a: any) => a.extensionActivityId === value);
        setFormData((prev: any) => ({
            ...prev,
            extensionActivityTypeId: value as number,
            extensionActivityType: selectedActivity?.extensionName || '',
            ...extensionActivityResetPatch(value, 'activityOther'),
        }));
    }, [extensionActivities, setFormData, extensionActivityResetPatch]);

    const handleOtherExtensionActivityTypeChange = useCallback((value: string | number) => {
        const selectedActivity = otherExtensionActivities.find((a: any) => a.otherExtensionActivityId === value);
        setFormData((prev: any) => ({
            ...prev,
            otherExtensionActivityTypeId: value as number,
            extensionActivityType: selectedActivity?.otherExtensionName || '',
            ...otherExtensionResetPatch(value, 'activityTypeOther'),
        }));
    }, [otherExtensionActivities, setFormData, otherExtensionResetPatch]);

    const importantDayOptions = useMemo(
        () => createMasterDataOptions(importantDays, 'importantDayId', 'dayName', { flagKey: 'isOther' }),
        [importantDays]
    )
    const { isOtherSelected: isOtherImportantDay, otherResetPatch: importantDayResetPatch } = useOtherSpecify(
        importantDayOptions,
        formData.importantDayId
    )
    const handleImportantDayChange = useCallback((value: string | number) => {
        const selectedDay = importantDays.find((d: any) => d.importantDayId === value);
        setFormData((prev: any) => ({
            ...prev,
            importantDayId: value as number,
            importantDay: selectedDay?.dayName || '',
            ...importantDayResetPatch(value, 'importantDayOther'),
        }));
    }, [importantDays, setFormData, importantDayResetPatch]);

    if (!entityType) return null

    return (
        <>
            {/* ALL Masters forms-------------- */}
            {entityType === ENTITY_TYPES.TRAINING_TYPES && (
                <div className="space-y-4">
                    <FormInput
                        label="Training Type Name"
                        required
                        value={formData.trainingTypeName ?? ''}
                        onChange={(e) => setFormData({ ...formData, trainingTypeName: e.target.value })}
                        placeholder="Enter training type name"
                    />
                    <IsOtherCheckbox
                        checked={Boolean(formData.isOther)}
                        onChange={(checked) => setFormData({ ...formData, isOther: checked })}
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.TRAINING_AREAS && (
                <div className="space-y-4">
                    <MasterDataDropdown
                        label="Training Type"
                        required
                        value={formData.trainingTypeId ?? ''}
                        onChange={handleTrainingTypeChange}
                        options={createMasterDataOptions(trainingTypes, 'trainingTypeId', 'trainingTypeName')}
                        emptyMessage="No training types available"
                    />
                    <FormInput
                        label="Training Area Name"
                        required
                        value={formData.trainingAreaName ?? ''}
                        onChange={(e) => setFormData({ ...formData, trainingAreaName: e.target.value })}
                        placeholder="Enter training area name"
                    />
                    <IsOtherCheckbox
                        checked={Boolean(formData.isOther)}
                        onChange={(checked) => setFormData({ ...formData, isOther: checked })}
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.TRAINING_THEMATIC_AREAS && (
                <div className="space-y-4">
                    <MasterDataDropdown
                        label="Training Area"
                        required
                        value={formData.trainingAreaId ?? ''}
                        onChange={handleTrainingAreaChange}
                        options={createMasterDataOptions(trainingAreas, 'trainingAreaId', 'trainingAreaName')}
                        emptyMessage="No training areas available"
                    />
                    <FormInput
                        label="Thematic Area Name"
                        required
                        value={formData.trainingThematicAreaName ?? ''}
                        onChange={(e) => setFormData({ ...formData, trainingThematicAreaName: e.target.value })}
                        placeholder="Enter thematic area name"
                    />
                    <IsOtherCheckbox
                        checked={Boolean(formData.isOther)}
                        onChange={(checked) => setFormData({ ...formData, isOther: checked })}
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.TRAINING_CLIENTELE && (
                <div className="space-y-4">
                    <FormInput
                        label="Training Clientele Name"
                        required
                        value={formData.name ?? ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter training clientele name"
                    />
                    <IsOtherCheckbox
                        checked={Boolean(formData.isOther)}
                        onChange={(checked) => setFormData({ ...formData, isOther: checked })}
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.FUNDING_SOURCE && (
                <div className="space-y-4">
                    <FormInput
                        label="Funding Source Name"
                        required
                        value={formData.name ?? ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter funding source name"
                    />
                    <IsOtherCheckbox
                        checked={Boolean(formData.isOther)}
                        onChange={(checked) => setFormData({ ...formData, isOther: checked })}
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.EXTENSION_ACTIVITIES && (
                <div className="space-y-4">
                    <FormInput
                        label="Extension Activity Name"
                        required
                        value={formData.extensionName ?? ''}
                        onChange={(e) => setFormData({ ...formData, extensionName: e.target.value })}
                        placeholder="Enter extension activity name"
                    />
                    <IsOtherCheckbox
                        checked={Boolean(formData.isOther)}
                        onChange={(checked) => setFormData({ ...formData, isOther: checked })}
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.OTHER_EXTENSION_ACTIVITIES && (
                <div className="space-y-4">
                    <FormInput
                        label="Other Extension Activity Name"
                        required
                        value={formData.otherExtensionName ?? ''}
                        onChange={(e) => setFormData({ ...formData, otherExtensionName: e.target.value })}
                        placeholder="Enter other extension activity name"
                    />
                    <IsOtherCheckbox
                        checked={Boolean(formData.isOther)}
                        onChange={(checked) => setFormData({ ...formData, isOther: checked })}
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.EVENTS && (
                <FormInput
                    label="Event Name"
                    required
                    value={formData.eventName ?? ''}
                    onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                    placeholder="Enter event name"
                />
            )}

            {/* Achievement Training forms-------------- */}
            {entityType === ENTITY_TYPES.ACHIEVEMENT_TRAINING && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Clientele - From Training Clientele Master */}
                        <MasterDataDropdown
                            label="Clientele"
                            required
                            value={formData.clienteleId || formData.clientele || ''}
                            onChange={handleClienteleChange}
                            options={trainingClienteleOptions}
                            emptyMessage="No clientele available"
                        />
                        {isOtherClientele && (
                            <SpecifyOtherInput
                                label="Please specify other clientele"
                                required
                                value={formData.clienteleOther}
                                onChange={(e) => setFormData({ ...formData, clienteleOther: e.target.value })}
                            />
                        )}

                        {/* Training Type - From Training Type Master */}
                        <MasterDataDropdown
                            label="Training Type"
                            required
                            value={formData.trainingTypeId ?? ''}
                            onChange={handleTrainingTypeChange}
                            options={trainingTypeOptions}
                            emptyMessage="No training types available"
                        />
                        {isOtherTrainingType && (
                            <SpecifyOtherInput
                                label="Please specify other training type"
                                required
                                value={formData.trainingTypeOther}
                                onChange={(e) => setFormData({ ...formData, trainingTypeOther: e.target.value })}
                            />
                        )}


                        {/* Training Area - Dependent on Training Type */}
                        <DependentDropdown
                            label="Training Area"
                            required
                            value={formData.trainingAreaId ?? ''}
                            onChange={handleTrainingAreaChange}
                            options={trainingAreaOptions}
                            dependsOn={{
                                value: formData.trainingTypeId,
                                field: 'trainingTypeId',
                            }}
                            onOptionsLoad={loadTrainingAreasByType}
                            cacheKey="training-areas-by-type"
                            emptyMessage="No training areas available for this training type"
                            loadingMessage="Loading training areas..."
                        />
                        {isOtherTrainingArea && (
                            <SpecifyOtherInput
                                label="Please specify other training area"
                                required
                                value={formData.trainingAreaOther}
                                onChange={(e) => setFormData({ ...formData, trainingAreaOther: e.target.value })}
                            />
                        )}

                        {/* Thematic Area - Dependent on Training Area */}
                        <DependentDropdown
                            label="Training Thematic Area"
                            required
                            value={formData.trainingThematicAreaId ? parseInt(formData.trainingThematicAreaId) : (formData.thematicAreaId ? parseInt(formData.thematicAreaId) : '')}
                            onChange={handleTrainingThematicAreaChange}
                            options={trainingThematicOptions}
                            dependsOn={{
                                value: formData.trainingAreaId ? parseInt(formData.trainingAreaId) : null,
                                field: 'trainingAreaId',
                            }}
                            onOptionsLoad={loadTrainingThematicAreasByArea}
                            cacheKey="training-thematic-areas-by-area"
                            emptyMessage="No thematic areas available for this training area"
                            loadingMessage="Loading thematic areas..."
                            isLoading={isLoadingTrainingThematicAreas}
                        />
                        {isOtherTrainingThematic && (
                            <SpecifyOtherInput
                                label="Please specify other thematic area"
                                required
                                value={formData.thematicAreaOther}
                                onChange={(e) => setFormData({ ...formData, thematicAreaOther: e.target.value })}
                            />
                        )}


                        {/* On Campus/Off Campus - Static options */}
                        <FormSelect
                            label="On Campus/Off Campus"
                            required
                            value={formData.campusType ?? ''}
                            onChange={(e) => setFormData({ ...formData, campusType: e.target.value })}
                            options={[
                                { value: 'On Campus', label: 'On Campus' },
                                { value: 'Off Campus', label: 'Off Campus' },
                            ]}
                        />

                        <FormInput
                            label="Title of Training"
                            required
                            value={formData.title ?? ''}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                        <FormInput
                            label="Start Date"
                            required
                            type="date"
                            value={formData.startDate ?? ''}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                        <FormInput
                            label="End Date"
                            required
                            type="date"
                            value={formData.endDate ?? ''}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />

                        {/* Course Co-ordinator - From KVK Staff */}
                        <DependentDropdown
                            label="Course Co-ordinator"
                            required
                            value={formData.staffId ? parseInt(formData.staffId) : (formData.coordinatorId ? parseInt(formData.coordinatorId) : '')}
                            onChange={(value) => handleStaffChange(value, kvkStaffData || [], setFormData, formData)}
                            options={createStaffOptions(kvkStaffData || [])}
                            dependsOn={{
                                value: activeKvkId,
                                field: 'kvkId',
                            }}
                            cacheKey="kvk-staff-dropdown"
                            emptyMessage="No staff available for this KVK"
                            loadingMessage="Loading staff..."
                            isLoading={isLoadingKvkStaff}
                        />

                        <FormInput
                            label="Venue"
                            required
                            value={formData.venue ?? ''}
                            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                        />

                        {/* Funding Source - From Funding Source Master */}
                        <MasterDataDropdown
                            label="Funding Source"
                            value={formData.fundingSourceId || formData.fundingSource || ''}
                            onChange={handleFundingSourceChange}
                            options={trainingFundingOptions}
                            emptyMessage="No funding sources available"
                        />
                        {isOtherTrainingFunding && (
                            <SpecifyOtherInput
                                label="Please specify other funding source"
                                required
                                value={formData.fundingSourceOther}
                                onChange={(e) => setFormData({ ...formData, fundingSourceOther: e.target.value })}
                            />
                        )}

                        <FormInput
                            label="Funding Agency Name"
                            value={formData.fundingAgency ?? ''}
                            onChange={(e) => setFormData({ ...formData, fundingAgency: e.target.value })}
                        />
                    </div>

                    <FormSection title="Farmers Details">
                        <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormInput label="General_M" required type="number" wholeNumberOnly value={formData.gen_m || ''} onChange={e => setFormData({ ...formData, gen_m: e.target.value })} />
                            <FormInput label="General_F" required type="number" wholeNumberOnly value={formData.gen_f || ''} onChange={e => setFormData({ ...formData, gen_f: e.target.value })} />
                            <FormInput label="OBC_M" required type="number" wholeNumberOnly value={formData.obc_m || ''} onChange={e => setFormData({ ...formData, obc_m: e.target.value })} />
                            <FormInput label="OBC_F" required type="number" wholeNumberOnly value={formData.obc_f || ''} onChange={e => setFormData({ ...formData, obc_f: e.target.value })} />

                            <FormInput label="SC_M" required type="number" wholeNumberOnly value={formData.sc_m || ''} onChange={e => setFormData({ ...formData, sc_m: e.target.value })} />
                            <FormInput label="SC_F" required type="number" wholeNumberOnly value={formData.sc_f || ''} onChange={e => setFormData({ ...formData, sc_f: e.target.value })} />
                            <FormInput label="ST_M" required type="number" wholeNumberOnly value={formData.st_m || ''} onChange={e => setFormData({ ...formData, st_m: e.target.value })} />
                            <FormInput label="ST_F" required type="number" wholeNumberOnly value={formData.st_f || ''} onChange={e => setFormData({ ...formData, st_f: e.target.value })} />
                        </div>

                        <div className="flex flex-wrap gap-3 pt-4">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E8F5E9] border border-[#C8E6C9]">
                                <span className="text-xs font-semibold text-[#2E7D32] uppercase">Total Male</span>
                                <span className="text-sm font-bold text-[#1B5E20] tabular-nums">
                                    {(Number(formData.gen_m) || 0) +
                                        (Number(formData.obc_m) || 0) +
                                        (Number(formData.sc_m) || 0) +
                                        (Number(formData.st_m) || 0)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#FCE4EC] border border-[#F8BBD0]">
                                <span className="text-xs font-semibold text-[#AD1457] uppercase">Total Female</span>
                                <span className="text-sm font-bold text-[#880E4F] tabular-nums">
                                    {(Number(formData.gen_f) || 0) +
                                        (Number(formData.obc_f) || 0) +
                                        (Number(formData.sc_f) || 0) +
                                        (Number(formData.st_f) || 0)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E3F2FD] border border-[#BBDEFB]">
                                <span className="text-xs font-semibold text-[#1565C0] uppercase">Overall Total</span>
                                <span className="text-sm font-bold text-[#0D47A1] tabular-nums">
                                    {(Number(formData.gen_m) || 0) +
                                        (Number(formData.gen_f) || 0) +
                                        (Number(formData.obc_m) || 0) +
                                        (Number(formData.obc_f) || 0) +
                                        (Number(formData.sc_m) || 0) +
                                        (Number(formData.sc_f) || 0) +
                                        (Number(formData.st_m) || 0) +
                                        (Number(formData.st_f) || 0)}
                                </span>
                            </div>
                        </div>
                    </FormSection>
                </div>
            )}

            {entityType === ENTITY_TYPES.ACHIEVEMENT_EXTENSION && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name of SMS/KVK Head - From KVK Staff API */}
                        <DependentDropdown
                            label="Name of SMS/KVK Head"
                            required
                            value={formData.staffId || formData.staffName || ''}
                            onChange={(value) => handleStaffChange(value, kvkStaffData || [], setFormData, formData)}
                            options={createStaffOptions(kvkStaffData || [])}
                            dependsOn={{
                                value: activeKvkId,
                                field: 'kvkId',
                            }}
                            cacheKey="kvk-staff-dropdown"
                            emptyMessage="No SMS/KVK Head staff available for this KVK"
                            loadingMessage="Loading staff..."
                            isLoading={isLoadingKvkStaff}
                        />

                        {/* Nature of Extension Activity - From Extension Activity Master */}
                        <MasterDataDropdown
                            label="Nature of Extension Activity"
                            required
                            value={formData.extensionActivityTypeId || formData.activityId || formData.extensionActivityType || ''}
                            onChange={handleExtensionActivityTypeChange}
                            options={extensionActivityOptions}
                            emptyMessage="No extension activities available"
                        />
                        {isOtherExtensionActivity && (
                            <SpecifyOtherInput
                                label="Please specify other extension activity"
                                required
                                value={formData.activityOther}
                                onChange={(e) => setFormData({ ...formData, activityOther: e.target.value })}
                            />
                        )}

                        <FormInput
                            label="No. of activities"
                            required
                            type="number"
                            wholeNumberOnly
                            value={formData.activityCount || ''}
                            onChange={(e) => setFormData({ ...formData, activityCount: e.target.value })}
                        />
                        <div className="hidden md:block"></div> {/* Spacer */}

                        <FormInput
                            label="Start Date"
                            required
                            type="date"
                            value={formData.startDate ?? ''}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                        <FormInput
                            label="End Date"
                            required
                            type="date"
                            value={formData.endDate ?? ''}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                    </div>

                    <FormSection title="Farmers">
                        <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormInput label="General_M" required type="number" value={formData.gen_m ?? ''} onChange={e => setFormData({ ...formData, gen_m: e.target.value })} />
                            <FormInput label="General_F" required type="number" value={formData.gen_f ?? ''} onChange={e => setFormData({ ...formData, gen_f: e.target.value })} />
                            <FormInput label="OBC_M" required type="number" value={formData.obc_m ?? ''} onChange={e => setFormData({ ...formData, obc_m: e.target.value })} />
                            <FormInput label="OBC_F" required type="number" value={formData.obc_f ?? ''} onChange={e => setFormData({ ...formData, obc_f: e.target.value })} />

                            <FormInput label="SC_M" required type="number" value={formData.sc_m ?? ''} onChange={e => setFormData({ ...formData, sc_m: e.target.value })} />
                            <FormInput label="SC_F" required type="number" value={formData.sc_f ?? ''} onChange={e => setFormData({ ...formData, sc_f: e.target.value })} />
                            <FormInput label="ST_M" required type="number" value={formData.st_m ?? ''} onChange={e => setFormData({ ...formData, st_m: e.target.value })} />
                            <FormInput label="ST_F" required type="number" value={formData.st_f ?? ''} onChange={e => setFormData({ ...formData, st_f: e.target.value })} />
                        </div>

                        <div className="flex flex-wrap gap-3 pt-4">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E8F5E9] border border-[#C8E6C9]">
                                <span className="text-xs font-semibold text-[#2E7D32] uppercase">Total Male</span>
                                <span className="text-sm font-bold text-[#1B5E20] tabular-nums">
                                    {(Number(formData.gen_m) || 0) +
                                        (Number(formData.obc_m) || 0) +
                                        (Number(formData.sc_m) || 0) +
                                        (Number(formData.st_m) || 0)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#FCE4EC] border border-[#F8BBD0]">
                                <span className="text-xs font-semibold text-[#AD1457] uppercase">Total Female</span>
                                <span className="text-sm font-bold text-[#880E4F] tabular-nums">
                                    {(Number(formData.gen_f) || 0) +
                                        (Number(formData.obc_f) || 0) +
                                        (Number(formData.sc_f) || 0) +
                                        (Number(formData.st_f) || 0)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E3F2FD] border border-[#BBDEFB]">
                                <span className="text-xs font-semibold text-[#1565C0] uppercase">Overall Total</span>
                                <span className="text-sm font-bold text-[#0D47A1] tabular-nums">
                                    {(Number(formData.gen_m) || 0) +
                                        (Number(formData.gen_f) || 0) +
                                        (Number(formData.obc_m) || 0) +
                                        (Number(formData.obc_f) || 0) +
                                        (Number(formData.sc_m) || 0) +
                                        (Number(formData.sc_f) || 0) +
                                        (Number(formData.st_m) || 0) +
                                        (Number(formData.st_f) || 0)}
                                </span>
                            </div>
                        </div>
                    </FormSection>

                    <FormSection title="Extension Officials">
                        <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormInput label="General_M" required type="number" wholeNumberOnly value={formData.ext_gen_m || ''} onChange={e => setFormData({ ...formData, ext_gen_m: e.target.value })} />
                            <FormInput label="General_F" required type="number" wholeNumberOnly value={formData.ext_gen_f || ''} onChange={e => setFormData({ ...formData, ext_gen_f: e.target.value })} />
                            <FormInput label="OBC_M" required type="number" wholeNumberOnly value={formData.ext_obc_m || ''} onChange={e => setFormData({ ...formData, ext_obc_m: e.target.value })} />
                            <FormInput label="OBC_F" required type="number" wholeNumberOnly value={formData.ext_obc_f || ''} onChange={e => setFormData({ ...formData, ext_obc_f: e.target.value })} />

                            <FormInput label="SC_M" required type="number" wholeNumberOnly value={formData.ext_sc_m || ''} onChange={e => setFormData({ ...formData, ext_sc_m: e.target.value })} />
                            <FormInput label="SC_F" required type="number" wholeNumberOnly value={formData.ext_sc_f || ''} onChange={e => setFormData({ ...formData, ext_sc_f: e.target.value })} />
                            <FormInput label="ST_M" required type="number" wholeNumberOnly value={formData.ext_st_m || ''} onChange={e => setFormData({ ...formData, ext_st_m: e.target.value })} />
                            <FormInput label="ST_F" required type="number" wholeNumberOnly value={formData.ext_st_f || ''} onChange={e => setFormData({ ...formData, ext_st_f: e.target.value })} />
                        </div>

                        <div className="flex flex-wrap gap-3 pt-4">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E8F5E9] border border-[#C8E6C9]">
                                <span className="text-xs font-semibold text-[#2E7D32] uppercase">Total Male</span>
                                <span className="text-sm font-bold text-[#1B5E20] tabular-nums">
                                    {(Number(formData.ext_gen_m) || 0) +
                                        (Number(formData.ext_obc_m) || 0) +
                                        (Number(formData.ext_sc_m) || 0) +
                                        (Number(formData.ext_st_m) || 0)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#FCE4EC] border border-[#F8BBD0]">
                                <span className="text-xs font-semibold text-[#AD1457] uppercase">Total Female</span>
                                <span className="text-sm font-bold text-[#880E4F] tabular-nums">
                                    {(Number(formData.ext_gen_f) || 0) +
                                        (Number(formData.ext_obc_f) || 0) +
                                        (Number(formData.ext_sc_f) || 0) +
                                        (Number(formData.ext_st_f) || 0)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E3F2FD] border border-[#BBDEFB]">
                                <span className="text-xs font-semibold text-[#1565C0] uppercase">Overall Total</span>
                                <span className="text-sm font-bold text-[#0D47A1] tabular-nums">
                                    {(Number(formData.ext_gen_m) || 0) +
                                        (Number(formData.ext_gen_f) || 0) +
                                        (Number(formData.ext_obc_m) || 0) +
                                        (Number(formData.ext_obc_f) || 0) +
                                        (Number(formData.ext_sc_m) || 0) +
                                        (Number(formData.ext_sc_f) || 0) +
                                        (Number(formData.ext_st_m) || 0) +
                                        (Number(formData.ext_st_f) || 0)}
                                </span>
                            </div>
                        </div>
                    </FormSection>
                </div>
            )}

            {entityType === ENTITY_TYPES.ACHIEVEMENT_OTHER_EXTENSION && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name of SMS/KVK Head - From KVK Staff API */}
                        <DependentDropdown
                            label="Name of SMS/KVK Head"
                            required
                            value={formData.staffId || formData.staffName || ''}
                            onChange={(value) => handleStaffChange(value, kvkStaffData || [], setFormData, formData)}
                            options={createStaffOptions(kvkStaffData || [])}
                            dependsOn={{
                                value: activeKvkId,
                                field: 'kvkId',
                            }}
                            cacheKey="kvk-staff-dropdown"
                            emptyMessage="No SMS/KVK Head staff available for this KVK"
                            loadingMessage="Loading staff..."
                            isLoading={isLoadingKvkStaff}
                        />

                        {/* Nature of Extension Activity - From Other Extension Activity Master */}
                        <MasterDataDropdown
                            label="Nature of Extension Activity"
                            required
                            value={formData.otherExtensionActivityTypeId || formData.activityTypeId || formData.extensionActivityType || ''}
                            onChange={handleOtherExtensionActivityTypeChange}
                            options={otherExtensionActivityOptions}
                            emptyMessage="No other extension activities available"
                        />
                        {isOtherOtherExtension && (
                            <SpecifyOtherInput
                                label="Please specify other extension activity"
                                required
                                value={formData.activityTypeOther}
                                onChange={(e) => setFormData({ ...formData, activityTypeOther: e.target.value })}
                            />
                        )}

                        <FormInput
                            label="No. of activities"
                            required
                            type="number"
                            wholeNumberOnly
                            value={formData.activityCount || ''}
                            onChange={(e) => setFormData({ ...formData, activityCount: e.target.value })}
                        />
                        <div className="hidden md:block"></div> {/* Spacer */}

                        <FormInput
                            label="Start Date"
                            required
                            type="date"
                            value={formData.startDate ?? ''}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                        <FormInput
                            label="End Date"
                            required
                            type="date"
                            value={formData.endDate ?? ''}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.ACHIEVEMENT_TECHNOLOGY_WEEK && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            label="Start Date"
                            required
                            type="date"
                            value={formData.startDate ?? ''}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                        <FormInput
                            label="End Date"
                            required
                            type="date"
                            value={formData.endDate ?? ''}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                        <FormInput
                            label="Type of activities"
                            required
                            value={formData.activityType ?? ''}
                            onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
                        />
                        <FormInput
                            label="No. of activities"
                            required
                            type="number"
                            wholeNumberOnly
                            value={formData.activityCount || ''}
                            onChange={(e) => setFormData({ ...formData, activityCount: e.target.value })}
                        />
                        <div className="md:col-span-2">
                            <FormInput
                                label="Related crop/livestock technology"
                                required
                                value={formData.relatedTechnology ?? ''}
                                onChange={(e) => setFormData({ ...formData, relatedTechnology: e.target.value })}
                            />
                        </div>
                    </div>

                    <FormSection title="Farmers Details">
                        <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormInput label="General_M" required type="number" value={formData.gen_m ?? ''} onChange={e => setFormData({ ...formData, gen_m: e.target.value })} />
                            <FormInput label="General_F" required type="number" value={formData.gen_f ?? ''} onChange={e => setFormData({ ...formData, gen_f: e.target.value })} />
                            <FormInput label="OBC_M" required type="number" value={formData.obc_m ?? ''} onChange={e => setFormData({ ...formData, obc_m: e.target.value })} />
                            <FormInput label="OBC_F" required type="number" value={formData.obc_f ?? ''} onChange={e => setFormData({ ...formData, obc_f: e.target.value })} />

                            <FormInput label="SC_M" required type="number" value={formData.sc_m ?? ''} onChange={e => setFormData({ ...formData, sc_m: e.target.value })} />
                            <FormInput label="SC_F" required type="number" value={formData.sc_f ?? ''} onChange={e => setFormData({ ...formData, sc_f: e.target.value })} />
                            <FormInput label="ST_M" required type="number" value={formData.st_m ?? ''} onChange={e => setFormData({ ...formData, st_m: e.target.value })} />
                            <FormInput label="ST_F" required type="number" value={formData.st_f ?? ''} onChange={e => setFormData({ ...formData, st_f: e.target.value })} />
                        </div>

                        <div className="flex flex-wrap gap-3 pt-4">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E8F5E9] border border-[#C8E6C9]">
                                <span className="text-xs font-semibold text-[#2E7D32] uppercase">Total Male</span>
                                <span className="text-sm font-bold text-[#1B5E20] tabular-nums">
                                    {(Number(formData.gen_m) || 0) +
                                        (Number(formData.obc_m) || 0) +
                                        (Number(formData.sc_m) || 0) +
                                        (Number(formData.st_m) || 0)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#FCE4EC] border border-[#F8BBD0]">
                                <span className="text-xs font-semibold text-[#AD1457] uppercase">Total Female</span>
                                <span className="text-sm font-bold text-[#880E4F] tabular-nums">
                                    {(Number(formData.gen_f) || 0) +
                                        (Number(formData.obc_f) || 0) +
                                        (Number(formData.sc_f) || 0) +
                                        (Number(formData.st_f) || 0)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E3F2FD] border border-[#BBDEFB]">
                                <span className="text-xs font-semibold text-[#1565C0] uppercase">Overall Total</span>
                                <span className="text-sm font-bold text-[#0D47A1] tabular-nums">
                                    {(Number(formData.gen_m) || 0) +
                                        (Number(formData.gen_f) || 0) +
                                        (Number(formData.obc_m) || 0) +
                                        (Number(formData.obc_f) || 0) +
                                        (Number(formData.sc_m) || 0) +
                                        (Number(formData.sc_f) || 0) +
                                        (Number(formData.st_m) || 0) +
                                        (Number(formData.st_f) || 0)}
                                </span>
                            </div>
                        </div>
                    </FormSection>
                </div>
            )}

            {entityType === ENTITY_TYPES.ACHIEVEMENT_CELEBRATION_DAYS && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            label="Event Date"
                            required
                            type="date"
                            value={formData.eventDate ?? ''}
                            onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                        />
                        {/* Important Days - From Important Days Master */}
                        <MasterDataDropdown
                            label="Important days"
                            required
                            value={formData.importantDayId || formData.importantDay || ''}
                            onChange={handleImportantDayChange}
                            options={importantDayOptions}
                            emptyMessage="No important days available"
                        />
                        {isOtherImportantDay && (
                            <SpecifyOtherInput
                                label="Please specify other important day"
                                required
                                value={formData.importantDayOther}
                                onChange={(e) => setFormData({ ...formData, importantDayOther: e.target.value })}
                            />
                        )}
                        <div className="md:col-span-2">
                            <FormInput
                                label="No. of activities"
                                required
                                type="number"
                                value={formData.activityCount ?? ''}
                                onChange={(e) => setFormData({ ...formData, activityCount: e.target.value })}
                            />
                        </div>
                    </div>

                    <FormSection title="Farmers">
                        <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormInput label="General_M" required type="number" value={formData.gen_m ?? ''} onChange={e => setFormData({ ...formData, gen_m: e.target.value })} />
                            <FormInput label="General_F" required type="number" value={formData.gen_f ?? ''} onChange={e => setFormData({ ...formData, gen_f: e.target.value })} />
                            <FormInput label="OBC_M" required type="number" value={formData.obc_m ?? ''} onChange={e => setFormData({ ...formData, obc_m: e.target.value })} />
                            <FormInput label="OBC_F" required type="number" value={formData.obc_f ?? ''} onChange={e => setFormData({ ...formData, obc_f: e.target.value })} />

                            <FormInput label="SC_M" required type="number" value={formData.sc_m ?? ''} onChange={e => setFormData({ ...formData, sc_m: e.target.value })} />
                            <FormInput label="SC_F" required type="number" value={formData.sc_f ?? ''} onChange={e => setFormData({ ...formData, sc_f: e.target.value })} />
                            <FormInput label="ST_M" required type="number" value={formData.st_m ?? ''} onChange={e => setFormData({ ...formData, st_m: e.target.value })} />
                            <FormInput label="ST_F" required type="number" value={formData.st_f ?? ''} onChange={e => setFormData({ ...formData, st_f: e.target.value })} />
                        </div>

                        <div className="flex flex-wrap gap-3 pt-4">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E8F5E9] border border-[#C8E6C9]">
                                <span className="text-xs font-semibold text-[#2E7D32] uppercase">Total Male</span>
                                <span className="text-sm font-bold text-[#1B5E20] tabular-nums">
                                    {(Number(formData.gen_m) || 0) +
                                        (Number(formData.obc_m) || 0) +
                                        (Number(formData.sc_m) || 0) +
                                        (Number(formData.st_m) || 0)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#FCE4EC] border border-[#F8BBD0]">
                                <span className="text-xs font-semibold text-[#AD1457] uppercase">Total Female</span>
                                <span className="text-sm font-bold text-[#880E4F] tabular-nums">
                                    {(Number(formData.gen_f) || 0) +
                                        (Number(formData.obc_f) || 0) +
                                        (Number(formData.sc_f) || 0) +
                                        (Number(formData.st_f) || 0)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E3F2FD] border border-[#BBDEFB]">
                                <span className="text-xs font-semibold text-[#1565C0] uppercase">Overall Total</span>
                                <span className="text-sm font-bold text-[#0D47A1] tabular-nums">
                                    {(Number(formData.gen_m) || 0) +
                                        (Number(formData.gen_f) || 0) +
                                        (Number(formData.obc_m) || 0) +
                                        (Number(formData.obc_f) || 0) +
                                        (Number(formData.sc_m) || 0) +
                                        (Number(formData.sc_f) || 0) +
                                        (Number(formData.st_m) || 0) +
                                        (Number(formData.st_f) || 0)}
                                </span>
                            </div>
                        </div>
                    </FormSection>

                    <FormSection title="Extension Officials">
                        <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormInput label="General_M" required type="number" wholeNumberOnly value={formData.ext_gen_m || ''} onChange={e => setFormData({ ...formData, ext_gen_m: e.target.value })} />
                            <FormInput label="General_F" required type="number" wholeNumberOnly value={formData.ext_gen_f || ''} onChange={e => setFormData({ ...formData, ext_gen_f: e.target.value })} />
                            <FormInput label="OBC_M" required type="number" wholeNumberOnly value={formData.ext_obc_m || ''} onChange={e => setFormData({ ...formData, ext_obc_m: e.target.value })} />
                            <FormInput label="OBC_F" required type="number" wholeNumberOnly value={formData.ext_obc_f || ''} onChange={e => setFormData({ ...formData, ext_obc_f: e.target.value })} />

                            <FormInput label="SC_M" required type="number" wholeNumberOnly value={formData.ext_sc_m || ''} onChange={e => setFormData({ ...formData, ext_sc_m: e.target.value })} />
                            <FormInput label="SC_F" required type="number" wholeNumberOnly value={formData.ext_sc_f || ''} onChange={e => setFormData({ ...formData, ext_sc_f: e.target.value })} />
                            <FormInput label="ST_M" required type="number" wholeNumberOnly value={formData.ext_st_m || ''} onChange={e => setFormData({ ...formData, ext_st_m: e.target.value })} />
                            <FormInput label="ST_F" required type="number" wholeNumberOnly value={formData.ext_st_f || ''} onChange={e => setFormData({ ...formData, ext_st_f: e.target.value })} />
                        </div>

                        <div className="flex flex-wrap gap-3 pt-4">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E8F5E9] border border-[#C8E6C9]">
                                <span className="text-xs font-semibold text-[#2E7D32] uppercase">Total Male</span>
                                <span className="text-sm font-bold text-[#1B5E20] tabular-nums">
                                    {(Number(formData.ext_gen_m) || 0) +
                                        (Number(formData.ext_obc_m) || 0) +
                                        (Number(formData.ext_sc_m) || 0) +
                                        (Number(formData.ext_st_m) || 0)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#FCE4EC] border border-[#F8BBD0]">
                                <span className="text-xs font-semibold text-[#AD1457] uppercase">Total Female</span>
                                <span className="text-sm font-bold text-[#880E4F] tabular-nums">
                                    {(Number(formData.ext_gen_f) || 0) +
                                        (Number(formData.ext_obc_f) || 0) +
                                        (Number(formData.ext_sc_f) || 0) +
                                        (Number(formData.ext_st_f) || 0)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E3F2FD] border border-[#BBDEFB]">
                                <span className="text-xs font-semibold text-[#1565C0] uppercase">Overall Total</span>
                                <span className="text-sm font-bold text-[#0D47A1] tabular-nums">
                                    {(Number(formData.ext_gen_m) || 0) +
                                        (Number(formData.ext_gen_f) || 0) +
                                        (Number(formData.ext_obc_m) || 0) +
                                        (Number(formData.ext_obc_f) || 0) +
                                        (Number(formData.ext_sc_m) || 0) +
                                        (Number(formData.ext_sc_f) || 0) +
                                        (Number(formData.ext_st_m) || 0) +
                                        (Number(formData.ext_st_f) || 0)}
                                </span>
                            </div>
                        </div>
                    </FormSection>
                </div>
            )}
        </>
    )
}
