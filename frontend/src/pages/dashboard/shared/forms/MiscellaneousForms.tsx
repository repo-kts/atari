import React, { useEffect } from 'react'
import { ENTITY_TYPES } from '../../../../constants/entityConstants'
import { ExtendedEntityType } from '../../../../utils/masterUtils'
import { useAuth } from '@/contexts/AuthContext'
import { PrevalentDiseaseForms } from './miscellaneous/PrevalentDiseaseForms'
import { NykTrainingForm } from './miscellaneous/NykTrainingForm'
import { PpvFraForms } from './miscellaneous/PpvFraForms'
import { RaweFetForms } from './miscellaneous/RaweFetForms'

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
    const { user } = useAuth()

    // Automatically sync kvkId from user session if it's missing in formData
    useEffect(() => {
        if (user?.kvkId && !formData.kvkId && !formData.id) {
            setFormData((prev: any) => ({ ...prev, kvkId: user.kvkId }))
        }
    }, [user?.kvkId, formData.kvkId, formData.id, setFormData])

    if (!entityType) return null

    const isPrevalentDisease = entityType === ENTITY_TYPES.MISC_PREVALENT_DISEASES_CROPS ||
        entityType === ENTITY_TYPES.MISC_PREVALENT_DISEASES_LIVESTOCK

    const isNykTraining = entityType === ENTITY_TYPES.MISC_NYK_TRAINING

    const isPpvFra = entityType === ENTITY_TYPES.MISC_PPV_FRA_TRAINING ||
        entityType === ENTITY_TYPES.MISC_PPV_FRA_PLANT_VARIETIES

    const isRaweFet = entityType === ENTITY_TYPES.MISC_RAWE_FET

    return (
        <>
            {isPrevalentDisease && (
                <PrevalentDiseaseForms
                    entityType={entityType}
                    formData={formData}
                    setFormData={setFormData}
                />
            )}
            {isNykTraining && (
                <NykTrainingForm
                    formData={formData}
                    setFormData={setFormData}
                />
            )}
            {isPpvFra && (
                <PpvFraForms
                    entityType={entityType}
                    formData={formData}
                    setFormData={setFormData}
                />
            )}
            {isRaweFet && (
                <RaweFetForms
                    formData={formData}
                    setFormData={setFormData}
                />
            )}
        </>
    )
}
