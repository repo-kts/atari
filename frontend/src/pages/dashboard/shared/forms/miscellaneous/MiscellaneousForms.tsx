import React from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { PrevalentDiseasesForms } from './PrevalentDiseasesForms'
import { NehruYuvaKendraForms } from './NehruYuvaKendraForms'
import { PPVFRASensitizationForms } from './PPVFRASensitizationForms'
import { RAWEFETProgrammeForms } from './RAWEFETProgrammeForms'
import { VIPVisitorsForms } from './VIPVisitorsForms'

interface MiscellaneousFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

export const MiscellaneousForms: React.FC<MiscellaneousFormsProps> = ({
    entityType,
    formData,
    setFormData,
}) => {
    if (!entityType) return null

    // Route to appropriate form based on entity type
    if (
        entityType === ENTITY_TYPES.MISC_DISEASES_CROPS ||
        entityType === ENTITY_TYPES.MISC_DISEASES_LIVESTOCK
    ) {
        return (
            <PrevalentDiseasesForms
                entityType={entityType}
                formData={formData}
                setFormData={setFormData}
            />
        )
    }

    if (entityType === ENTITY_TYPES.MISC_NEHRU_YUVA_KENDRA) {
        return (
            <NehruYuvaKendraForms
                entityType={entityType}
                formData={formData}
                setFormData={setFormData}
            />
        )
    }

    if (
        entityType === ENTITY_TYPES.MISC_PPV_FRA_TRAINING ||
        entityType === ENTITY_TYPES.MISC_PPV_FRA_PLANT_VARIETIES
    ) {
        return (
            <PPVFRASensitizationForms
                entityType={entityType}
                formData={formData}
                setFormData={setFormData}
            />
        )
    }

    if (entityType === ENTITY_TYPES.MISC_RAWE_FET) {
        return (
            <RAWEFETProgrammeForms
                entityType={entityType}
                formData={formData}
                setFormData={setFormData}
            />
        )
    }

    if (entityType === ENTITY_TYPES.MISC_VIP_VISITORS) {
        return (
            <VIPVisitorsForms
                entityType={entityType}
                formData={formData}
                setFormData={setFormData}
            />
        )
    }

    return null
}
