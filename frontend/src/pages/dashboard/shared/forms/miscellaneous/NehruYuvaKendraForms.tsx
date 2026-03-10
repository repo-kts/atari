import React, { useCallback } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput, FormSection } from '../shared/FormComponents'

interface NehruYuvaKendraFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

// Financial Year Note
const FINANCIAL_YEAR_NOTE = 'Please select Financial Year Wise Date Range i.e Date Range would be from 01st of April - 31st of March'

export const NehruYuvaKendraForms: React.FC<NehruYuvaKendraFormsProps> = ({
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
            const value = e.target.value === '' ? '' : parseInt(e.target.value)
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
            {entityType === ENTITY_TYPES.MISC_NYK_TRAINING && (
                <div className="space-y-3">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-700 font-medium">{FINANCIAL_YEAR_NOTE}</p>
                    </div>

                    <FormInput
                        label="Title of the Training Programme"
                        required
                        value={formData.title || ''}
                        onChange={handleFieldChange('title')}
                        placeholder="Enter programme title"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="Start Date"
                            required
                            type="date"
                            value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''}
                            onChange={handleDateChange('startDate')}
                        />

                        <FormInput
                            label="End Date"
                            required
                            type="date"
                            value={formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : ''}
                            onChange={handleDateChange('endDate')}
                        />
                    </div>

                    <FormSection title="No. of the Participant">
                        <FormInput
                            label="General_M"
                            required
                            type="number"
                            value={formData.generalM || ''}
                            onChange={handleNumberChange('generalM')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="General_F"
                            required
                            type="number"
                            value={formData.generalF || ''}
                            onChange={handleNumberChange('generalF')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="OBC_M"
                            required
                            type="number"
                            value={formData.obcM || ''}
                            onChange={handleNumberChange('obcM')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="OBC_F"
                            required
                            type="number"
                            value={formData.obcF || ''}
                            onChange={handleNumberChange('obcF')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="SC_M"
                            required
                            type="number"
                            value={formData.scM || ''}
                            onChange={handleNumberChange('scM')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="SC_F"
                            required
                            type="number"
                            value={formData.scF || ''}
                            onChange={handleNumberChange('scF')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="ST_M"
                            required
                            type="number"
                            value={formData.stM || ''}
                            onChange={handleNumberChange('stM')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="ST_F"
                            required
                            type="number"
                            value={formData.stF || ''}
                            onChange={handleNumberChange('stF')}
                            placeholder="Enter number"
                        />
                    </FormSection>

                    <FormInput
                        label="Amount of Fund Received (Rs)"
                        required
                        type="number"
                        step="0.01"
                        value={formData.fundReceived || ''}
                        onChange={(e) => setFormData({ ...formData, fundReceived: parseFloat(e.target.value) || 0 })}
                        placeholder="Enter amount"
                    />
                </div>
            )}
        </div>
    )
}
