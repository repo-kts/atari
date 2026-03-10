import React, { useCallback } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput, FormTextArea, FormSelect } from '../shared/FormComponents'

interface VIPVisitorsFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

// Dummy dignitary type options
const DIGNITARY_TYPE_OPTIONS = [
    { value: 'Minister', label: 'Minister' },
    { value: 'Secretary', label: 'Secretary' },
    { value: 'Director', label: 'Director' },
    { value: 'Other', label: 'Other' },
]

export const VIPVisitorsForms: React.FC<VIPVisitorsFormsProps> = ({
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

    const handleDateChange = useCallback(
        (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData({ ...formData, [field]: new Date(e.target.value).toISOString() })
        },
        [formData, setFormData]
    )

    if (!entityType) return null

    return (
        <div className="space-y-4">
            {entityType === ENTITY_TYPES.MISC_VIP_VISITORS && (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="Date of Visit"
                            required
                            type="date"
                            value={formData.visitDate ? new Date(formData.visitDate).toISOString().split('T')[0] : ''}
                            onChange={handleDateChange('visitDate')}
                        />

                        <FormSelect
                            label="Type of Dignitaries"
                            required
                            value={formData.dignitaryType || ''}
                            onChange={handleFieldChange('dignitaryType')}
                            options={DIGNITARY_TYPE_OPTIONS}
                            placeholder="Select type"
                        />
                    </div>

                    <FormInput
                        label="Name of Hon'ble Minister"
                        required
                        value={formData.ministerName || ''}
                        onChange={handleFieldChange('ministerName')}
                        placeholder="Enter minister name"
                    />

                    <FormTextArea
                        label="Salient Points in his/her Observation"
                        required
                        value={formData.observations || ''}
                        onChange={handleFieldChange('observations')}
                        rows={4}
                        placeholder="Enter observations"
                    />
                </div>
            )}
        </div>
    )
}
