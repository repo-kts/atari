import React, { useEffect, useCallback } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput, FormSelect, FormSection } from './shared/FormComponents'
import { DependentDropdown } from '@/components/common/DependentDropdown'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
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
    useExtensionActivityTypes,
    useOtherExtensionActivityTypes,
    useImportantDays,
} from '@/hooks/useOtherMastersData'
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

    // Master data hooks
    const { data: trainingTypes = [] } = useTrainingTypes()
    const { data: trainingAreas = [] } = useTrainingAreas()
    const { data: trainingClientele = [] } = useTrainingClientele()
    const { data: fundingSources = [] } = useFundingSources()
    const { data: extensionActivityTypes = [] } = useExtensionActivityTypes()
    const { data: otherExtensionActivityTypes = [] } = useOtherExtensionActivityTypes()
    const { data: importantDays = [] } = useImportantDays()

    // KVK Staff dropdown - depends on kvkId
    const activeKvkId = user?.kvkId || formData.kvkId
    const { data: kvkStaffData = [], isLoading: isLoadingKvkStaff } = useKvkStaffForDropdown(activeKvkId)

    // Training Thematic Areas - depends on trainingAreaId
    const { data: trainingThematicAreasData = [], isLoading: isLoadingTrainingThematicAreas } = useTrainingThematicAreasByArea(
        formData.trainingAreaId ? parseInt(formData.trainingAreaId) : null
    )

    // Memoized onOptionsLoad functions to prevent infinite re-renders
    const loadTrainingAreasByType = useCallback(async (trainingTypeId: any) => {
        const response = await trainingExtensionEventsApi.getTrainingAreasByType(trainingTypeId as number);
        return response.data.map((area: any) => ({
            value: area.trainingAreaId,
            label: area.trainingAreaName
        }));
    }, []);

    const loadTrainingThematicAreasByArea = useCallback(async (trainingAreaId: any) => {
        const response = await trainingExtensionEventsApi.getTrainingThematicAreasByArea(trainingAreaId as number);
        return response.data.map((thematicArea: any) => ({
            value: thematicArea.trainingThematicAreaId,
            label: thematicArea.trainingThematicAreaName
        }));
    }, []);

    // Memoized onChange handlers
    const handleTrainingTypeChange = useCallback((value: string | number) => {
        setFormData((prev: any) => ({
            ...prev,
            trainingTypeId: value as number,
            trainingAreaId: '', // Reset training area when type changes
            trainingThematicAreaId: '', // Reset thematic area when type changes
        }));
    }, [setFormData]);

    const handleTrainingAreaChange = useCallback((value: string | number) => {
        setFormData((prev: any) => ({
            ...prev,
            trainingAreaId: value as number,
            trainingThematicAreaId: '', // Reset thematic area when area changes
        }));
    }, [setFormData]);

    const handleTrainingThematicAreaChange = useCallback((value: string | number) => {
        const selectedThematicArea = trainingThematicAreasData?.find((t: any) => t.trainingThematicAreaId === value);
        setFormData((prev: any) => ({
            ...prev,
            trainingThematicAreaId: value as number,
            thematicArea: selectedThematicArea?.trainingThematicAreaName || '',
        }));
    }, [trainingThematicAreasData, setFormData]);

    const handleClienteleChange = useCallback((value: string | number) => {
        const selectedClientele = trainingClientele.find((c: any) => c.clienteleId === value);
        setFormData((prev: any) => ({
            ...prev,
            clienteleId: value as number,
            clientele: selectedClientele?.name || '',
        }));
    }, [trainingClientele, setFormData]);

    const handleFundingSourceChange = useCallback((value: string | number) => {
        const selectedFundingSource = fundingSources.find((f: any) => f.fundingSourceId === value);
        setFormData((prev: any) => ({
            ...prev,
            fundingSourceId: value as number,
            fundingSource: selectedFundingSource?.name || '',
        }));
    }, [fundingSources, setFormData]);

    const handleExtensionActivityTypeChange = useCallback((value: string | number) => {
        const selectedActivity = extensionActivityTypes.find((a: any) => a.activityId === value);
        setFormData((prev: any) => ({
            ...prev,
            extensionActivityTypeId: value as number,
            extensionActivityType: selectedActivity?.activityName || '',
        }));
    }, [extensionActivityTypes, setFormData]);

    const handleOtherExtensionActivityTypeChange = useCallback((value: string | number) => {
        const selectedActivity = otherExtensionActivityTypes.find((a: any) => a.activityTypeId === value);
        setFormData((prev: any) => ({
            ...prev,
            otherExtensionActivityTypeId: value as number,
            extensionActivityType: selectedActivity?.activityName || '',
        }));
    }, [otherExtensionActivityTypes, setFormData]);

    const handleImportantDayChange = useCallback((value: string | number) => {
        const selectedDay = importantDays.find((d: any) => d.importantDayId === value);
        setFormData((prev: any) => ({
            ...prev,
            importantDayId: value as number,
            importantDay: selectedDay?.dayName || '',
        }));
    }, [importantDays, setFormData]);

    if (!entityType) return null

    return (
        <>
            {/* ALL Masters forms-------------- */}
            {entityType === ENTITY_TYPES.TRAINING_TYPES && (
                <FormInput
                    label="Training Type Name"
                    required
                    value={formData.trainingTypeName || ''}
                    onChange={(e) => setFormData({ ...formData, trainingTypeName: e.target.value })}
                    placeholder="Enter training type name"
                />
            )}

            {entityType === ENTITY_TYPES.TRAINING_AREAS && (
                <div className="space-y-4">
                    <MasterDataDropdown
                        label="Training Type"
                        required
                        value={formData.trainingTypeId || ''}
                        onChange={handleTrainingTypeChange}
                        options={createMasterDataOptions(trainingTypes, 'trainingTypeId', 'trainingTypeName')}
                        emptyMessage="No training types available"
                    />
                    <FormInput
                        label="Training Area Name"
                        required
                        value={formData.trainingAreaName || ''}
                        onChange={(e) => setFormData({ ...formData, trainingAreaName: e.target.value })}
                        placeholder="Enter training area name"
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.TRAINING_THEMATIC_AREAS && (
                <div className="space-y-4">
                    <MasterDataDropdown
                        label="Training Area"
                        required
                        value={formData.trainingAreaId || ''}
                        onChange={handleTrainingAreaChange}
                        options={createMasterDataOptions(trainingAreas, 'trainingAreaId', 'trainingAreaName')}
                        emptyMessage="No training areas available"
                    />
                    <FormInput
                        label="Thematic Area Name"
                        required
                        value={formData.trainingThematicAreaName || ''}
                        onChange={(e) => setFormData({ ...formData, trainingThematicAreaName: e.target.value })}
                        placeholder="Enter thematic area name"
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.TRAINING_CLIENTELE && (
                <FormInput
                    label="Training Clientele Name"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter training clientele name"
                />
            )}

            {entityType === ENTITY_TYPES.FUNDING_SOURCE && (
                <FormInput
                    label="Funding Source Name"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter funding source name"
                />
            )}

            {entityType === ENTITY_TYPES.EXTENSION_ACTIVITIES && (
                <FormInput
                    label="Extension Activity Name"
                    required
                    value={formData.extensionName || ''}
                    onChange={(e) => setFormData({ ...formData, extensionName: e.target.value })}
                    placeholder="Enter extension activity name"
                />
            )}

            {entityType === ENTITY_TYPES.OTHER_EXTENSION_ACTIVITIES && (
                <FormInput
                    label="Other Extension Activity Name"
                    required
                    value={formData.otherExtensionName || ''}
                    onChange={(e) => setFormData({ ...formData, otherExtensionName: e.target.value })}
                    placeholder="Enter other extension activity name"
                />
            )}

            {entityType === ENTITY_TYPES.EVENTS && (
                <FormInput
                    label="Event Name"
                    required
                    value={formData.eventName || ''}
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
                            options={createMasterDataOptions(trainingClientele, 'clienteleId', 'name')}
                            emptyMessage="No clientele available"
                        />

                        {/* Training Type - From Training Type Master */}
                        <MasterDataDropdown
                            label="Training Type"
                            required
                            value={formData.trainingTypeId || ''}
                            onChange={handleTrainingTypeChange}
                            options={createMasterDataOptions(trainingTypes, 'trainingTypeId', 'trainingTypeName' as any)}
                            emptyMessage="No training types available"
                        />

                        {/* On Campus/Off Campus - Static options */}
                        <FormSelect
                            label="On Campus/Off Campus"
                            required
                            value={formData.campusType || ''}
                            onChange={(e) => setFormData({ ...formData, campusType: e.target.value })}
                            options={[
                                { value: 'On Campus', label: 'On Campus' },
                                { value: 'Off Campus', label: 'Off Campus' },
                            ]}
                        />

                        {/* Training Area - Dependent on Training Type */}
                        <DependentDropdown
                            label="Training Area"
                            required
                            value={formData.trainingAreaId || ''}
                            onChange={handleTrainingAreaChange}
                            options={filterByParentId(trainingAreas, 'trainingTypeId', formData.trainingTypeId)
                                .map((a: any) => ({
                                    value: a.trainingAreaId,
                                    label: a.trainingAreaName || a.name || ''
                                }))}
                            dependsOn={{
                                value: formData.trainingTypeId,
                                field: 'trainingTypeId',
                            }}
                            onOptionsLoad={loadTrainingAreasByType}
                            cacheKey="training-areas-by-type"
                            emptyMessage="No training areas available for this training type"
                            loadingMessage="Loading training areas..."
                        />

                        {/* Thematic Area - Dependent on Training Area */}
                        <DependentDropdown
                            label="Thematic Area"
                            required
                            value={formData.trainingThematicAreaId || formData.thematicAreaId || formData.thematicArea || ''}
                            onChange={handleTrainingThematicAreaChange}
                            options={trainingThematicAreasData?.map((t: any) => ({
                                value: t.trainingThematicAreaId,
                                label: t.trainingThematicAreaName
                            })) || []}
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

                        <FormInput
                            label="Title of Training"
                            required
                            value={formData.title || ''}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                        <FormInput
                            label="Start Date"
                            required
                            type="date"
                            value={formData.startDate || ''}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                        <FormInput
                            label="End Date"
                            required
                            type="date"
                            value={formData.endDate || ''}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />

                        {/* Course Co-ordinator - From KVK Staff */}
                        <DependentDropdown
                            label="Course Co-ordinator"
                            required
                            value={formData.staffId || formData.coordinatorId || formData.coordinator || ''}
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
                            value={formData.venue || ''}
                            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                        />

                        {/* Funding Source - From Funding Source Master */}
                        <MasterDataDropdown
                            label="Funding Source"
                            value={formData.fundingSourceId || formData.fundingSource || ''}
                            onChange={handleFundingSourceChange}
                            options={createMasterDataOptions(fundingSources, 'fundingSourceId', 'name')}
                            emptyMessage="No funding sources available"
                        />

                        <FormInput
                            label="Funding Agency Name"
                            value={formData.fundingAgency || ''}
                            onChange={(e) => setFormData({ ...formData, fundingAgency: e.target.value })}
                        />
                    </div>

                    <FormSection title="Farmers Details">
                        <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormInput label="General_M" required type="number" value={formData.gen_m || ''} onChange={e => setFormData({ ...formData, gen_m: e.target.value })} />
                            <FormInput label="General_F" required type="number" value={formData.gen_f || ''} onChange={e => setFormData({ ...formData, gen_f: e.target.value })} />
                            <FormInput label="OBC_M" required type="number" value={formData.obc_m || ''} onChange={e => setFormData({ ...formData, obc_m: e.target.value })} />
                            <FormInput label="OBC_F" required type="number" value={formData.obc_f || ''} onChange={e => setFormData({ ...formData, obc_f: e.target.value })} />

                            <FormInput label="SC_M" required type="number" value={formData.sc_m || ''} onChange={e => setFormData({ ...formData, sc_m: e.target.value })} />
                            <FormInput label="SC_F" required type="number" value={formData.sc_f || ''} onChange={e => setFormData({ ...formData, sc_f: e.target.value })} />
                            <FormInput label="ST_M" required type="number" value={formData.st_m || ''} onChange={e => setFormData({ ...formData, st_m: e.target.value })} />
                            <FormInput label="ST_F" required type="number" value={formData.st_f || ''} onChange={e => setFormData({ ...formData, st_f: e.target.value })} />
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

                        {/* Nature of Extension Activity - From Extension Activity Type Master */}
                        <MasterDataDropdown
                            label="Nature of Extension Activity"
                            required
                            value={formData.extensionActivityTypeId || formData.extensionActivityType || ''}
                            onChange={handleExtensionActivityTypeChange}
                            options={createMasterDataOptions(extensionActivityTypes, 'activityId', 'activityName')}
                            emptyMessage="No extension activity types available"
                        />

                        <FormInput
                            label="No. of activities"
                            required
                            type="number"
                            value={formData.activityCount || ''}
                            onChange={(e) => setFormData({ ...formData, activityCount: e.target.value })}
                        />
                        <div className="hidden md:block"></div> {/* Spacer */}

                        <FormInput
                            label="Start Date"
                            required
                            type="date"
                            value={formData.startDate || ''}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                        <FormInput
                            label="End Date"
                            required
                            type="date"
                            value={formData.endDate || ''}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                    </div>

                    <FormSection title="Farmers">
                        <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormInput label="General_M" required type="number" value={formData.gen_m || ''} onChange={e => setFormData({ ...formData, gen_m: e.target.value })} />
                            <FormInput label="General_F" required type="number" value={formData.gen_f || ''} onChange={e => setFormData({ ...formData, gen_f: e.target.value })} />
                            <FormInput label="OBC_M" required type="number" value={formData.obc_m || ''} onChange={e => setFormData({ ...formData, obc_m: e.target.value })} />
                            <FormInput label="OBC_F" required type="number" value={formData.obc_f || ''} onChange={e => setFormData({ ...formData, obc_f: e.target.value })} />

                            <FormInput label="SC_M" required type="number" value={formData.sc_m || ''} onChange={e => setFormData({ ...formData, sc_m: e.target.value })} />
                            <FormInput label="SC_F" required type="number" value={formData.sc_f || ''} onChange={e => setFormData({ ...formData, sc_f: e.target.value })} />
                            <FormInput label="ST_M" required type="number" value={formData.st_m || ''} onChange={e => setFormData({ ...formData, st_m: e.target.value })} />
                            <FormInput label="ST_F" required type="number" value={formData.st_f || ''} onChange={e => setFormData({ ...formData, st_f: e.target.value })} />
                        </div>
                    </FormSection>

                    <FormSection title="Extension Officials">
                        <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormInput label="General_M" required type="number" value={formData.ext_gen_m || ''} onChange={e => setFormData({ ...formData, ext_gen_m: e.target.value })} />
                            <FormInput label="General_F" required type="number" value={formData.ext_gen_f || ''} onChange={e => setFormData({ ...formData, ext_gen_f: e.target.value })} />
                            <FormInput label="OBC_M" required type="number" value={formData.ext_obc_m || ''} onChange={e => setFormData({ ...formData, ext_obc_m: e.target.value })} />
                            <FormInput label="OBC_F" required type="number" value={formData.ext_obc_f || ''} onChange={e => setFormData({ ...formData, ext_obc_f: e.target.value })} />

                            <FormInput label="SC_M" required type="number" value={formData.ext_sc_m || ''} onChange={e => setFormData({ ...formData, ext_sc_m: e.target.value })} />
                            <FormInput label="SC_F" required type="number" value={formData.ext_sc_f || ''} onChange={e => setFormData({ ...formData, ext_sc_f: e.target.value })} />
                            <FormInput label="ST_M" required type="number" value={formData.ext_st_m || ''} onChange={e => setFormData({ ...formData, ext_st_m: e.target.value })} />
                            <FormInput label="ST_F" required type="number" value={formData.ext_st_f || ''} onChange={e => setFormData({ ...formData, ext_st_f: e.target.value })} />
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

                        {/* Nature of Extension Activity - From Other Extension Activity Type Master */}
                        <MasterDataDropdown
                            label="Nature of Extension Activity"
                            required
                            value={formData.otherExtensionActivityTypeId || formData.extensionActivityType || ''}
                            onChange={handleOtherExtensionActivityTypeChange}
                            options={createMasterDataOptions(otherExtensionActivityTypes, 'activityTypeId', 'activityName')}
                            emptyMessage="No other extension activity types available"
                        />

                        <FormInput
                            label="No. of activities"
                            required
                            type="number"
                            value={formData.activityCount || ''}
                            onChange={(e) => setFormData({ ...formData, activityCount: e.target.value })}
                        />
                        <div className="hidden md:block"></div> {/* Spacer */}

                        <FormInput
                            label="Start Date"
                            required
                            type="date"
                            value={formData.startDate || ''}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                        <FormInput
                            label="End Date"
                            required
                            type="date"
                            value={formData.endDate || ''}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                    </div>

                    <FormSection title="Farmers">
                        <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormInput label="General_M" required type="number" value={formData.gen_m || ''} onChange={e => setFormData({ ...formData, gen_m: e.target.value })} />
                            <FormInput label="General_F" required type="number" value={formData.gen_f || ''} onChange={e => setFormData({ ...formData, gen_f: e.target.value })} />
                            <FormInput label="OBC_M" required type="number" value={formData.obc_m || ''} onChange={e => setFormData({ ...formData, obc_m: e.target.value })} />
                            <FormInput label="OBC_F" required type="number" value={formData.obc_f || ''} onChange={e => setFormData({ ...formData, obc_f: e.target.value })} />

                            <FormInput label="SC_M" required type="number" value={formData.sc_m || ''} onChange={e => setFormData({ ...formData, sc_m: e.target.value })} />
                            <FormInput label="SC_F" required type="number" value={formData.sc_f || ''} onChange={e => setFormData({ ...formData, sc_f: e.target.value })} />
                            <FormInput label="ST_M" required type="number" value={formData.st_m || ''} onChange={e => setFormData({ ...formData, st_m: e.target.value })} />
                            <FormInput label="ST_F" required type="number" value={formData.st_f || ''} onChange={e => setFormData({ ...formData, st_f: e.target.value })} />
                        </div>
                    </FormSection>

                    <FormSection title="Extension Officials">
                        <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormInput label="General_M" required type="number" value={formData.ext_gen_m || ''} onChange={e => setFormData({ ...formData, ext_gen_m: e.target.value })} />
                            <FormInput label="General_F" required type="number" value={formData.ext_gen_f || ''} onChange={e => setFormData({ ...formData, ext_gen_f: e.target.value })} />
                            <FormInput label="OBC_M" required type="number" value={formData.ext_obc_m || ''} onChange={e => setFormData({ ...formData, ext_obc_m: e.target.value })} />
                            <FormInput label="OBC_F" required type="number" value={formData.ext_obc_f || ''} onChange={e => setFormData({ ...formData, ext_obc_f: e.target.value })} />

                            <FormInput label="SC_M" required type="number" value={formData.ext_sc_m || ''} onChange={e => setFormData({ ...formData, ext_sc_m: e.target.value })} />
                            <FormInput label="SC_F" required type="number" value={formData.ext_sc_f || ''} onChange={e => setFormData({ ...formData, ext_sc_f: e.target.value })} />
                            <FormInput label="ST_M" required type="number" value={formData.ext_st_m || ''} onChange={e => setFormData({ ...formData, ext_st_m: e.target.value })} />
                            <FormInput label="ST_F" required type="number" value={formData.ext_st_f || ''} onChange={e => setFormData({ ...formData, ext_st_f: e.target.value })} />
                        </div>
                    </FormSection>
                </div>
            )}

            {entityType === ENTITY_TYPES.ACHIEVEMENT_TECHNOLOGY_WEEK && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            label="Start Date"
                            required
                            type="date"
                            value={formData.startDate || ''}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                        <FormInput
                            label="End Date"
                            required
                            type="date"
                            value={formData.endDate || ''}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                        <FormInput
                            label="Type of activities"
                            required
                            value={formData.activityType || ''}
                            onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
                        />
                        <FormInput
                            label="No. of activities"
                            required
                            type="number"
                            value={formData.activityCount || ''}
                            onChange={(e) => setFormData({ ...formData, activityCount: e.target.value })}
                        />
                        <div className="md:col-span-2">
                            <FormInput
                                label="Related crop/livestock technology"
                                required
                                value={formData.relatedTechnology || ''}
                                onChange={(e) => setFormData({ ...formData, relatedTechnology: e.target.value })}
                            />
                        </div>
                    </div>

                    <FormSection title="Farmers Details">
                        <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormInput label="General_M" required type="number" value={formData.gen_m || ''} onChange={e => setFormData({ ...formData, gen_m: e.target.value })} />
                            <FormInput label="General_F" required type="number" value={formData.gen_f || ''} onChange={e => setFormData({ ...formData, gen_f: e.target.value })} />
                            <FormInput label="OBC_M" required type="number" value={formData.obc_m || ''} onChange={e => setFormData({ ...formData, obc_m: e.target.value })} />
                            <FormInput label="OBC_F" required type="number" value={formData.obc_f || ''} onChange={e => setFormData({ ...formData, obc_f: e.target.value })} />

                            <FormInput label="SC_M" required type="number" value={formData.sc_m || ''} onChange={e => setFormData({ ...formData, sc_m: e.target.value })} />
                            <FormInput label="SC_F" required type="number" value={formData.sc_f || ''} onChange={e => setFormData({ ...formData, sc_f: e.target.value })} />
                            <FormInput label="ST_M" required type="number" value={formData.st_m || ''} onChange={e => setFormData({ ...formData, st_m: e.target.value })} />
                            <FormInput label="ST_F" required type="number" value={formData.st_f || ''} onChange={e => setFormData({ ...formData, st_f: e.target.value })} />
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
                            value={formData.eventDate || ''}
                            onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                        />
                        {/* Important Days - From Important Days Master */}
                        <MasterDataDropdown
                            label="Important days"
                            required
                            value={formData.importantDayId || formData.importantDay || ''}
                            onChange={handleImportantDayChange}
                            options={createMasterDataOptions(importantDays, 'importantDayId', 'dayName')}
                            emptyMessage="No important days available"
                        />
                        <div className="md:col-span-2">
                            <FormInput
                                label="No. of activities"
                                required
                                type="number"
                                value={formData.activityCount || ''}
                                onChange={(e) => setFormData({ ...formData, activityCount: e.target.value })}
                            />
                        </div>
                    </div>

                    <FormSection title="Farmers">
                        <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormInput label="General_M" required type="number" value={formData.gen_m || ''} onChange={e => setFormData({ ...formData, gen_m: e.target.value })} />
                            <FormInput label="General_F" required type="number" value={formData.gen_f || ''} onChange={e => setFormData({ ...formData, gen_f: e.target.value })} />
                            <FormInput label="OBC_M" required type="number" value={formData.obc_m || ''} onChange={e => setFormData({ ...formData, obc_m: e.target.value })} />
                            <FormInput label="OBC_F" required type="number" value={formData.obc_f || ''} onChange={e => setFormData({ ...formData, obc_f: e.target.value })} />

                            <FormInput label="SC_M" required type="number" value={formData.sc_m || ''} onChange={e => setFormData({ ...formData, sc_m: e.target.value })} />
                            <FormInput label="SC_F" required type="number" value={formData.sc_f || ''} onChange={e => setFormData({ ...formData, sc_f: e.target.value })} />
                            <FormInput label="ST_M" required type="number" value={formData.st_m || ''} onChange={e => setFormData({ ...formData, st_m: e.target.value })} />
                            <FormInput label="ST_F" required type="number" value={formData.st_f || ''} onChange={e => setFormData({ ...formData, st_f: e.target.value })} />
                        </div>
                    </FormSection>

                    <FormSection title="Extension Officials">
                        <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormInput label="General_M" required type="number" value={formData.ext_gen_m || ''} onChange={e => setFormData({ ...formData, ext_gen_m: e.target.value })} />
                            <FormInput label="General_F" required type="number" value={formData.ext_gen_f || ''} onChange={e => setFormData({ ...formData, ext_gen_f: e.target.value })} />
                            <FormInput label="OBC_M" required type="number" value={formData.ext_obc_m || ''} onChange={e => setFormData({ ...formData, ext_obc_m: e.target.value })} />
                            <FormInput label="OBC_F" required type="number" value={formData.ext_obc_f || ''} onChange={e => setFormData({ ...formData, ext_obc_f: e.target.value })} />

                            <FormInput label="SC_M" required type="number" value={formData.ext_sc_m || ''} onChange={e => setFormData({ ...formData, ext_sc_m: e.target.value })} />
                            <FormInput label="SC_F" required type="number" value={formData.ext_sc_f || ''} onChange={e => setFormData({ ...formData, ext_sc_f: e.target.value })} />
                            <FormInput label="ST_M" required type="number" value={formData.ext_st_m || ''} onChange={e => setFormData({ ...formData, ext_st_m: e.target.value })} />
                            <FormInput label="ST_F" required type="number" value={formData.ext_st_f || ''} onChange={e => setFormData({ ...formData, ext_st_f: e.target.value })} />
                        </div>
                    </FormSection>
                </div>
            )}
        </>
    )
}
