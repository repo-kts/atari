import React from 'react'
import { ENTITY_TYPES } from '../../../../constants/entityTypes'
import { ExtendedEntityType } from '../../../../utils/masterUtils'
import { FormInput } from './shared/FormComponents'

interface PublicationFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

export const PublicationForms: React.FC<PublicationFormsProps> = ({
    entityType,
    formData,
    setFormData,
}) => {
    if (!entityType) return null

    return (
        <>
            {entityType === ENTITY_TYPES.PUBLICATION_ITEMS && (
                <FormInput
                    label="Publication Item"
                    required
                    value={formData.publicationName || ''}
                    onChange={(e) => setFormData({ ...formData, publicationName: e.target.value })}
                    placeholder="Enter publication item"
                />
            )}
        </>
    )
}
