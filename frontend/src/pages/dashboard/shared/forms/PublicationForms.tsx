import React from 'react'
import { ENTITY_TYPES } from '../../../../constants/entityTypes'
import { ExtendedEntityType } from '../../../../utils/masterUtils'
import { FormInput, FormSelect } from './shared/FormComponents'

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

            {entityType === ENTITY_TYPES.ACHIEVEMENT_PUBLICATION_DETAILS && (
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800">Add Publication</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect
                            label="Year"
                            required
                            value={formData.year || ''}
                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                            options={[
                                { value: '2023-24', label: '2023-24' },
                                { value: '2024-25', label: '2024-25' },
                                { value: '2025-26', label: '2025-26' },
                            ]}
                        />
                        <FormSelect
                            label="Publication"
                            required
                            value={formData.publication || ''}
                            onChange={(e) => setFormData({ ...formData, publication: e.target.value })}
                            options={[
                                { value: 'Research Paper', label: 'Research Paper' },
                                { value: 'Technical Bulletins', label: 'Technical Bulletins' },
                                { value: 'Newsletter', label: 'Newsletter' },
                                { value: 'Books', label: 'Books' },
                            ]}
                        />
                        <FormInput
                            label="Title"
                            required
                            value={formData.title || ''}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                        <FormInput
                            label="Author Name"
                            required
                            value={formData.authorName || ''}
                            onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                        />
                        <FormInput
                            label="Journal Name"
                            required
                            value={formData.journalName || ''}
                            onChange={(e) => setFormData({ ...formData, journalName: e.target.value })}
                        />
                    </div>
                </div>
            )}
        </>
    )
}
