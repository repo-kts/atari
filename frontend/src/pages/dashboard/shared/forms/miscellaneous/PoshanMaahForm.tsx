import React from 'react'
import { FormInput, FormSection } from '../shared/FormComponents'

interface PoshanMaahFormProps {
    formData: any
    setFormData: (data: any) => void
}

// Participant categories that make up "Total Participants".
const PARTICIPANT_FIELDS = [
    'girls',
    'farmWomen',
    'farmers',
    'anganwadiWorkers',
    'govtOfficials',
    'publicRepresentatives',
] as const

const toDateInput = (value: any) => {
    if (!value) return ''
    if (typeof value === 'string') return value.split('T')[0]
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0]
}

export const PoshanMaahForm: React.FC<PoshanMaahFormProps> = ({ formData, setFormData }) => {
    const setField = (field: string, value: any) =>
        setFormData({ ...formData, [field]: value })

    // Live total (server recomputes authoritatively on save).
    const totalParticipants = PARTICIPANT_FIELDS.reduce(
        (sum, field) => sum + (Number(formData[field]) || 0),
        0
    )

    const numberField = (label: string, field: string) => (
        <FormInput
            label={label}
            required
            type="number"
            min="0"
            value={formData[field] ?? ''}
            onChange={(e) => setField(field, e.target.value)}
            placeholder="0"
        />
    )

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                    label="Datewise activity (date)"
                    required
                    type="date"
                    value={toDateInput(formData.activityDate)}
                    onChange={(e) => setField('activityDate', e.target.value)}
                />
                <FormInput
                    label="Name of Event/Programme"
                    required
                    value={formData.eventName ?? ''}
                    onChange={(e) => setField('eventName', e.target.value)}
                    placeholder="Enter name of event/programme"
                />
                {numberField('No. of activities conducted', 'activitiesConducted')}
                {numberField('No. of saplings planted', 'saplingsPlanted')}
                {numberField('No. of vegetable kits distributed', 'vegetableKitsDistributed')}
            </div>

            <FormSection title="No. of participants" noGrid>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {numberField('Girls', 'girls')}
                    {numberField('Farm Woman', 'farmWomen')}
                    {numberField('Farmers', 'farmers')}
                    {numberField('Anganwadi Workers', 'anganwadiWorkers')}
                    {numberField('Govt Officials', 'govtOfficials')}
                    {numberField('Public Representatives', 'publicRepresentatives')}
                </div>
                <div className="mt-4 md:w-1/2">
                    <FormInput
                        label="Total Participants"
                        type="number"
                        value={totalParticipants}
                        onChange={() => { }}
                        readOnly
                        disabled
                        helperText="Auto-calculated: sum of all participant categories"
                    />
                </div>
            </FormSection>
        </div>
    )
}
