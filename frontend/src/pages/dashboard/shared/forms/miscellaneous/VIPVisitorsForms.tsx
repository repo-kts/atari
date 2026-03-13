import React, { useCallback } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput, FormTextArea, FormSelect } from '../shared/FormComponents'

interface VIPVisitorsFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

// Dignitary type options as shown in the Type of Dignitaries dropdown
const DIGNITARY_TYPE_OPTIONS = [
    { value: 'Minister', label: 'Minister' },
    { value: 'MP', label: 'MP' },
    { value: 'MLA', label: 'MLA' },
    { value: 'DM', label: 'DM' },
    { value: 'VC', label: 'VC' },
    { value: 'Zila Sabhadipati', label: 'Zila Sabhadipati' },
    { value: 'Other Head of Organization', label: 'Other Head of Organization' },
    { value: 'Foreigners', label: 'Foreigners' },
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
            setFormData({ ...formData, [field]: e.target.value ? new Date(e.target.value).toISOString() : null })
        },
        [formData, setFormData]
    )

    if (!entityType) return null

    // Resolve dignitary type: API returns { name: '...' } object on edit, plain string on create
    const dignitaryTypeValue = (() => {
        const dt = formData.dignitaryType
        if (dt && typeof dt === 'object' && dt.name) return dt.name
        if (typeof dt === 'string') return dt
        return ''
    })()

    // Resolve date: API returns dateOfVisit ISO string; form uses visitDate key during create
    const dateOfVisitValue = (() => {
        const d = formData.visitDate || formData.dateOfVisit
        if (!d) return ''
        try { return new Date(d).toISOString().split('T')[0] } catch { return '' }
    })()

    // Resolve observations/salientPoints: API returns salientPoints on edit
    const observationsValue = formData.observations || formData.salientPoints || ''

    return (
        <div className="space-y-4">
            {entityType === ENTITY_TYPES.MISC_VIP_VISITORS && (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="Date of Visit"
                            required
                            type="date"
                            value={dateOfVisitValue}
                            onChange={handleDateChange('visitDate')}
                        />

                        <FormSelect
                            label="Type of Dignitaries"
                            required
                            value={dignitaryTypeValue}
                            onChange={handleFieldChange('dignitaryType')}
                            options={DIGNITARY_TYPE_OPTIONS}
                            placeholder="Select"
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
                        label="Salient points in his/ her observation"
                        required
                        value={observationsValue}
                        onChange={handleFieldChange('observations')}
                        rows={4}
                        placeholder="Enter salient points"
                    />
                </div>
            )}
        </div>
    )
}
