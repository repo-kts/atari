import React, { useCallback, useMemo } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput, FormSection } from '../shared/FormComponents'
import { useYears, usePpvFraTrainingTypes } from '@/hooks/useOtherMastersData'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { createMasterDataOptions } from '@/utils/formHelpers'
import { cleanIndianMobileInput } from '@/utils/indianPhone'
import { FormAttachmentSection } from '@/components/common/FormAttachmentSection'

interface PPVFRASensitizationFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

export const PPVFRASensitizationForms: React.FC<PPVFRASensitizationFormsProps> = ({
    entityType,
    formData,
    setFormData,
}) => {
    const { data: years = [], isLoading: isLoadingYears } = useYears()
    const { data: trainingTypes = [], isLoading: isLoadingTypes } = usePpvFraTrainingTypes()

    const yearOptions = useMemo(
        () => {
            // For Plant Varieties, we might want the year name/value if the backend expects an Int (parseInt will handle "2023-24" as 2023)
            // But usually IDs are preferred if relations exist. Since no relation here, let's keep IDs but be mindful.
            return createMasterDataOptions(years, 'reportingYear', 'yearName')
        },
        [years]
    )

    const trainingTypeOptions = useMemo(
        () => createMasterDataOptions(trainingTypes, 'typeId', 'typeName'),
        [trainingTypes]
    )

    const handleFieldChange = useCallback(
        (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const value = e.target.value
            setFormData({ ...formData, [field]: value })
        },
        [formData, setFormData]
    )

    const handleNumberChange = useCallback(
        (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value === '' ? '' : parseInt(e.target.value)
            setFormData({ ...formData, [field]: value })
        },
        [formData, setFormData]
    )

    const handleDateChange = useCallback(
        (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setFormData({ ...formData, [field]: value ? new Date(value).toISOString() : null })
        },
        [formData, setFormData]
    )


    const handleAttachmentIds = useCallback(
        (ids: number[]) => setFormData((prev: any) => ({ ...prev, attachmentIds: ids })),
        [setFormData],
    )

    if (!entityType) return null

    return (
        <div className="space-y-4">
            {/* 1. PPV & FRA Sensitization training Programme */}
            {entityType === ENTITY_TYPES.MISC_PPV_FRA_TRAINING && (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="Date of Training/Awareness Programme"
                            required
                            type="date"
                            value={formData.programmeDate ? new Date(formData.programmeDate).toISOString().split('T')[0] : ''}
                            onChange={handleDateChange('programmeDate')}
                        />

                        <MasterDataDropdown
                            label="Type"
                            required
                            value={formData.typeId ?? ''}
                            onChange={(val) => setFormData({ ...formData, typeId: val })}
                            options={trainingTypeOptions}
                            isLoading={isLoadingTypes}
                            emptyMessage="No training types available"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="Title"
                            required
                            value={formData.title ?? ''}
                            onChange={handleFieldChange('title')}
                            placeholder="Enter title"
                        />

                        <FormInput
                            label="Venue"
                            required
                            value={formData.venue ?? ''}
                            onChange={handleFieldChange('venue')}
                            placeholder="Enter venue"
                        />
                    </div>

                    <FormInput
                        label="Resource Person"
                        required
                        value={formData.resourcePerson ?? ''}
                        onChange={handleFieldChange('resourcePerson')}
                        placeholder="Enter resource person"
                    />

                    <FormSection title="No. of the Participant" noGrid>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <FormInput
                                label="General_M"
                                required
                                type="number"
                                value={formData.generalM || ''}
                                onChange={handleNumberChange('generalM')}
                                placeholder="0"
                            />

                            <FormInput
                                label="General_F"
                                required
                                type="number"
                                value={formData.generalF || ''}
                                onChange={handleNumberChange('generalF')}
                                placeholder="0"
                            />

                            <FormInput
                                label="OBC_M"
                                required
                                type="number"
                                value={formData.obcM || ''}
                                onChange={handleNumberChange('obcM')}
                                placeholder="0"
                            />

                            <FormInput
                                label="OBC_F"
                                required
                                type="number"
                                value={formData.obcF || ''}
                                onChange={handleNumberChange('obcF')}
                                placeholder="0"
                            />

                            <FormInput
                                label="SC_M"
                                required
                                type="number"
                                value={formData.scM || ''}
                                onChange={handleNumberChange('scM')}
                                placeholder="0"
                            />

                            <FormInput
                                label="SC_F"
                                required
                                type="number"
                                value={formData.scF || ''}
                                onChange={handleNumberChange('scF')}
                                placeholder="0"
                            />

                            <FormInput
                                label="ST_M"
                                required
                                type="number"
                                value={formData.stM || ''}
                                onChange={handleNumberChange('stM')}
                                placeholder="0"
                            />

                            <FormInput
                                label="ST_F"
                                required
                                type="number"
                                value={formData.stF || ''}
                                onChange={handleNumberChange('stF')}
                                placeholder="0"
                            />
                        </div>
                    </FormSection>
                </div>
            )}

            {/* 2. PPV & FRA Sensitization Farmer Details */}
            {entityType === ENTITY_TYPES.MISC_PPV_FRA_PLANT_VARIETIES && (
                <div className="space-y-3">
                    <MasterDataDropdown
                        label="Reporting Year"
                        required
                        value={formData.reportingYear ?? ''}
                        onChange={(val) => {
                            const selectedYear = years.find(y => y.reportingYear === val || y.yearName === val);
                            setFormData({
                                ...formData,
                                reportingYear: selectedYear ? (selectedYear.reportingYear || val) : val
                            });
                        }}
                        options={yearOptions}
                        isLoading={isLoadingYears}
                        emptyMessage="No reporting years available"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="Name of Crop Registered"
                            required
                            value={formData.cropName ?? ''}
                            onChange={handleFieldChange('cropName')}
                            placeholder="Enter crop name"
                        />

                        <FormInput
                            label="Registration No."
                            value={formData.registrationNo ?? ''}
                            onChange={handleFieldChange('registrationNo')}
                            placeholder="e.g. REG/2024/0732"
                        />

                        <FormInput
                            label="Farmer Name"
                            required
                            value={formData.farmerName ?? ''}
                            onChange={handleFieldChange('farmerName')}
                            placeholder="Enter farmer name"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <FormInput
                            label="Mobile No."
                            required
                            value={formData.mobile ?? ''}
                            onChange={(e) =>
                                setFormData({ ...formData, mobile: cleanIndianMobileInput(e.target.value) })
                            }
                            placeholder="10-digit mobile"
                            inputMode="numeric"
                            autoComplete="tel"
                        />

                        <FormInput
                            label="Village"
                            required
                            value={formData.village ?? ''}
                            onChange={handleFieldChange('village')}
                            placeholder="Enter village"
                        />

                        <FormInput
                            label="Block"
                            required
                            value={formData.block ?? ''}
                            onChange={handleFieldChange('block')}
                            placeholder="Enter block"
                        />
                    </div>

                    <FormInput
                        label="District"
                        required
                        value={formData.district ?? ''}
                        onChange={handleFieldChange('district')}
                        placeholder="Enter district"
                    />

                    <FormInput
                        label="Characteristics"
                        required
                        value={formData.characteristics ?? ''}
                        onChange={handleFieldChange('characteristics')}
                        placeholder="Enter characteristics"
                    />

                    <FormAttachmentSection
                        title="Images"
                        formCode="ppv_fra"
                        kind="PHOTO"
                        kvkId={formData.kvkId ?? null}
                        recordId={formData.ppvFraPlantVarietiesID ?? formData.id ?? null}
                        showCaption
                        initialAttachments={formData?.photos}
                        onAttachmentIdsChange={handleAttachmentIds}
                    />
                </div>
            )}
        </div>
    )
}
