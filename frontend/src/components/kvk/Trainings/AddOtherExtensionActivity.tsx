import React, { useState } from 'react'
import { useAuthStore } from '../../../stores/authStore'
import { localStorageService } from '../../../utils/localStorageService'
import { OtherExtensionActivity } from '../../../types/otherExtensionActivity'
import { Input } from '../../ui/Input'
import { Button } from '../../ui/Button'

interface AddOtherExtensionActivityProps {
    onSuccess: () => void
    onCancel: () => void
}

export const AddOtherExtensionActivity: React.FC<AddOtherExtensionActivityProps> = ({ onSuccess, onCancel }) => {
    const { user } = useAuthStore()
    const [formData, setFormData] = useState<Partial<OtherExtensionActivity>>({
        reporting_year: '2024',
        no_of_activities: 0,
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {}
        if (!formData.reporting_year) newErrors.reporting_year = 'Reporting year is required'
        if (!formData.nature_of_activity) newErrors.nature_of_activity = 'Nature of activity is required'
        if (formData.no_of_activities === undefined || formData.no_of_activities < 0)
            newErrors.no_of_activities = 'Valid number of activities is required'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate() || !user?.kvkId) return

        const newActivity: OtherExtensionActivity = {
            id: Date.now(),
            kvk_id: user.kvkId,
            kvk_name: user.name || 'Unknown KVK',
            reporting_year: formData.reporting_year || '',
            nature_of_activity: formData.nature_of_activity || '',
            no_of_activities: Number(formData.no_of_activities) || 0,
        }

        localStorageService.saveOtherExtensionActivity(newActivity)
        onSuccess()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-[#487749] mb-2">
                        Reporting Year
                    </label>
                    <select
                        value={formData.reporting_year}
                        onChange={e => setFormData({ ...formData, reporting_year: e.target.value })}
                        className="w-full h-12 px-4 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white text-[#212121]"
                        required
                    >
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                    </select>
                </div>

                <div className="md:col-span-2">
                    <Input
                        label="Nature of Extension Activity"
                        value={formData.nature_of_activity || ''}
                        onChange={e => setFormData({ ...formData, nature_of_activity: e.target.value })}
                        placeholder="Enter nature of activity"
                        error={errors.nature_of_activity}
                        required
                    />
                </div>

                <div>
                    <Input
                        label="Number of Activities"
                        type="number"
                        min="0"
                        value={formData.no_of_activities ?? ''}
                        onChange={e => setFormData({ ...formData, no_of_activities: parseInt(e.target.value) })}
                        error={errors.no_of_activities}
                        required
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button
                    type="submit"
                    variant="primary"
                    className="flex-1 bg-[#487749] hover:bg-[#3A613B]"
                >
                    Add Other Extension Activity
                </Button>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    className="flex-1"
                >
                    Cancel
                </Button>
            </div>
        </form>
    )
}
