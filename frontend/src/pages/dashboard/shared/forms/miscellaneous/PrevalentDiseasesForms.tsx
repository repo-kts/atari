import React, { useCallback } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput } from '../shared/FormComponents'

interface PrevalentDiseasesFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

export const PrevalentDiseasesForms: React.FC<PrevalentDiseasesFormsProps> = ({
    entityType,
    formData,
    setFormData,
}) => {
    const handleFieldChange = useCallback(
        (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const value = e.target.value
            setFormData({ ...formData, [field]: value })
        },
        [formData, setFormData]
    )

    const handleNumberChange = useCallback(
        (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value === '' ? '' : parseFloat(e.target.value)
            setFormData({ ...formData, [field]: value })
        },
        [formData, setFormData]
    )

    const handleDateChange = useCallback(
        (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData({ ...formData, [field]: new Date(e.target.value).toISOString() })
        },
        [formData, setFormData]
    )

    if (!entityType) return null

    return (
        <div className="space-y-4">
            {/* 1. Prevalent diseases in crop */}
            {entityType === ENTITY_TYPES.MISC_PREVALENT_DISEASES_CROPS && (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="Name of the Disease"
                            required
                            value={formData.diseaseName ?? ''}
                            onChange={handleFieldChange('diseaseName')}
                            placeholder="Enter disease name"
                        />

                        <FormInput
                            label="Crop"
                            required
                            value={formData.crop ?? ''}
                            onChange={handleFieldChange('crop')}
                            placeholder="Enter crop name"
                        />
                    </div>

                    <FormInput
                        label="Date of Outbreak"
                        required
                        type="date"
                        value={formData.dateOfOutbreak ? new Date(formData.dateOfOutbreak).toISOString().split('T')[0] : ''}
                        onChange={handleDateChange('dateOfOutbreak')}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <FormInput
                            label="Area Affected (in ha)"
                            required
                            type="number"
                            step="0.01"
                            value={formData.areaAffected ?? ''}
                            onChange={handleNumberChange('areaAffected')}
                            placeholder="Enter area"
                        />

                        <FormInput
                            label="% Commodity Loss"
                            required
                            type="number"
                            step="0.01"
                            value={formData.commodityLossPercent ?? ''}
                            onChange={handleNumberChange('commodityLossPercent')}
                            placeholder="Enter percentage"
                        />

                        <FormInput
                            label="Preventive Measures Taken for Area (in ha)"
                            required
                            type="number"
                            step="0.01"
                            value={formData.preventiveMeasuresArea ?? ''}
                            onChange={handleNumberChange('preventiveMeasuresArea')}
                            placeholder="Enter area"
                        />
                    </div>
                </div>
            )}

            {/* 2. Prevalent diseases in livestock */}
            {entityType === ENTITY_TYPES.MISC_PREVALENT_DISEASES_LIVESTOCK && (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="Name of the Disease"
                            required
                            value={formData.diseaseName ?? ''}
                            onChange={handleFieldChange('diseaseName')}
                            placeholder="Enter disease name"
                        />

                        <FormInput
                            label="Livestock Type"
                            required
                            value={formData.livestockType ?? ''}
                            onChange={handleFieldChange('livestockType')}
                            placeholder="Enter species/type"
                        />
                    </div>

                    <FormInput
                        label="Date of Outbreak"
                        required
                        type="date"
                        value={formData.dateOfOutbreak ? new Date(formData.dateOfOutbreak).toISOString().split('T')[0] : ''}
                        onChange={handleDateChange('dateOfOutbreak')}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <FormInput
                            label="Mortality Count"
                            required
                            type="number"
                            step="0.01"
                            value={formData.mortalityCount ?? ''}
                            onChange={handleNumberChange('mortalityCount')}
                            placeholder="Enter count"
                        />

                        <FormInput
                            label="Animals Treated"
                            required
                            type="number"
                            value={formData.animalsTreated ?? ''}
                            onChange={handleNumberChange('animalsTreated')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Preventive Measures Taken"
                            required
                            value={formData.preventiveMeasures ?? ''}
                            onChange={handleFieldChange('preventiveMeasures')}
                            placeholder="Enter measures"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
