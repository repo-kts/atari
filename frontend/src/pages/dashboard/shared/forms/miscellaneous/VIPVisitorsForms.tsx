import React, { useCallback } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput, FormTextArea, FormSelect } from '../shared/FormComponents'
import { useDignitaryTypes } from '@/hooks/useOtherMastersData'

interface VIPVisitorsFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

// Legacy options removed

export const VIPVisitorsForms: React.FC<VIPVisitorsFormsProps> = ({
    entityType,
    formData,
    setFormData,
}) => {
    const { data: dignitaryTypes, isLoading: loadingDignitaryTypes } = useDignitaryTypes()

    const dignitaryTypeOptions = React.useMemo(() => {
        return dignitaryTypes.map((type: any) => ({
            value: type.dignitaryTypeId,
            label: type.name,
        }))
    }, [dignitaryTypes])
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

    // Resolve dignitary type
    const dignitaryTypeIdValue = formData.dignitaryTypeId || formData.dignitaryType?.dignitaryTypeId || ''
    
    // Resolve date: API returns dateOfVisit; form uses visitDate
    const dateOfVisitValue = (() => {
        const d = formData.visitDate || formData.dateOfVisit
        if (!d) return ''
        try { return new Date(d).toISOString().split('T')[0] } catch { return '' }
    })()
    
    // Resolve observations: API might return salientPoints
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
                            value={dignitaryTypeIdValue}
                            onChange={(e) => setFormData({ ...formData, dignitaryTypeId: e.target.value })}
                            options={dignitaryTypeOptions}
                            placeholder={loadingDignitaryTypes ? "Loading..." : "Select"}
                            disabled={loadingDignitaryTypes}
                        />
                    </div>

                    <FormInput
                        label="Name of Hon'ble Minister"
                        required
                        value={formData.ministerName ?? ''}
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
