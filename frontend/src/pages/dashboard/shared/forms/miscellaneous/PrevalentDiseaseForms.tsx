import React from 'react'
import { ENTITY_TYPES } from '../../../../../constants/entityConstants'
import { ExtendedEntityType } from '../../../../../utils/masterUtils'
import { FormInput } from '../shared/FormComponents'

interface PrevalentDiseaseFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

export const PrevalentDiseaseForms: React.FC<PrevalentDiseaseFormsProps> = ({
    entityType,
    formData,
    setFormData,
}) => {
    if (!entityType) return null

    const isCrop = entityType === ENTITY_TYPES.MISC_PREVALENT_DISEASES_CROPS
    const isLivestock = entityType === ENTITY_TYPES.MISC_PREVALENT_DISEASES_LIVESTOCK

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
                label="Name of the disease"
                required
                value={formData.nameOfTheDisease || formData.diseaseName || ''}
                onChange={(e) => setFormData({ ...formData, nameOfTheDisease: e.target.value, diseaseName: e.target.value })}
                placeholder="Enter name of the disease"
            />

            {isCrop && (
                <>
                    <FormInput
                        label="Crop"
                        required
                        value={formData.cropName || formData.crop || ''}
                        onChange={(e) => setFormData({ ...formData, cropName: e.target.value, crop: e.target.value })}
                        placeholder="Enter crop name"
                    />
                    <FormInput
                        label="Date of outbreak"
                        required
                        type="date"
                        value={formData.dateOfOutbreak ? (typeof formData.dateOfOutbreak === 'string' ? formData.dateOfOutbreak.split('T')[0] : new Date(formData.dateOfOutbreak).toISOString().split('T')[0]) : ''}
                        onChange={(e) => setFormData({ ...formData, dateOfOutbreak: e.target.value })}
                    />
                    <FormInput
                        label="Area affected (in ha)"
                        required
                        type="number"
                        step="0.01"
                        value={formData.areaAffected || ''}
                        onChange={(e) => setFormData({ ...formData, areaAffected: e.target.value })}
                        placeholder="0.00"
                    />
                    <FormInput
                        label="% Commodity loss"
                        required
                        type="number"
                        step="0.01"
                        value={formData.percentCommodityLoss || formData.commodityLossPercent || ''}
                        onChange={(e) => setFormData({ ...formData, percentCommodityLoss: e.target.value, commodityLossPercent: e.target.value })}
                        placeholder="0.00"
                    />
                    <FormInput
                        label="Preventive measures taken for area (in ha)"
                        required
                        type="number"
                        step="0.01"
                        value={formData.preventiveMeasuresTaken || formData.preventiveMeasuresArea || ''}
                        onChange={(e) => setFormData({ ...formData, preventiveMeasuresTaken: e.target.value, preventiveMeasuresArea: e.target.value })}
                        placeholder="0.00"
                    />
                </>
            )}

            {isLivestock && (
                <>
                    <FormInput
                        label="Species affected"
                        required
                        value={formData.speciesAffected || formData.livestockType || ''}
                        onChange={(e) => setFormData({ ...formData, speciesAffected: e.target.value, livestockType: e.target.value })}
                        placeholder="Enter species affected"
                    />
                    <FormInput
                        label="Date of outbreak"
                        required
                        type="date"
                        value={formData.dateOfOutbreak ? (typeof formData.dateOfOutbreak === 'string' ? formData.dateOfOutbreak.split('T')[0] : new Date(formData.dateOfOutbreak).toISOString().split('T')[0]) : ''}
                        onChange={(e) => setFormData({ ...formData, dateOfOutbreak: e.target.value })}
                    />
                    <FormInput
                        label="Number of death/ Morbidity rate (%)"
                        required
                        type="number"
                        step="0.01"
                        value={formData.numberOfDeath || formData.morbidityRate || formData.mortalityCount || ''}
                        onChange={(e) => setFormData({
                            ...formData,
                            numberOfDeath: e.target.value,
                            morbidityRate: e.target.value,
                            mortalityCount: e.target.value
                        })}
                        placeholder="0.00"
                    />
                    <FormInput
                        label="Number of animals vaccinated"
                        required
                        type="number"
                        value={formData.numberOfAnimalsVaccinated || formData.animalsTreated || ''}
                        onChange={(e) => setFormData({ ...formData, numberOfAnimalsVaccinated: e.target.value, animalsTreated: e.target.value })}
                        placeholder="0"
                    />
                    <FormInput
                        label="Preventive measures taken for area (in ha)"
                        required
                        value={formData.preventiveMeasuresTaken || formData.preventiveMeasures || ''}
                        onChange={(e) => setFormData({ ...formData, preventiveMeasuresTaken: e.target.value, preventiveMeasures: e.target.value })}
                        placeholder="Enter preventive measures"
                    />
                </>
            )}
        </div>
    )
}
