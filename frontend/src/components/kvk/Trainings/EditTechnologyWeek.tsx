import React, { useState, useEffect } from 'react'
import { localStorageService } from '../../../utils/localStorageService'
import { Button } from '../../ui/Button'
import { TechnologyWeek } from '../../../types/technologyWeek'

interface EditTechnologyWeekProps {
    activity: TechnologyWeek
    onSuccess: () => void
    onCancel: () => void
}

export const EditTechnologyWeek: React.FC<EditTechnologyWeekProps> = ({ activity, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState<Partial<TechnologyWeek>>({})
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        setFormData(activity)
    }, [activity])

    const validate = () => {
        const newErrors: Record<string, string> = {}
        if (!formData.reporting_year) newErrors.reporting_year = 'Reporting year is required'
        if (!formData.start_date) newErrors.start_date = 'Start date is required'
        if (!formData.end_date) newErrors.end_date = 'End date is required'
        if (!formData.type_of_activity) newErrors.type_of_activity = 'Type of activity is required'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return

        localStorageService.updateTechnologyWeek(activity.id, {
            reporting_year: formData.reporting_year,
            start_date: formData.start_date,
            end_date: formData.end_date,
            type_of_activity: formData.type_of_activity,
            no_of_activities: Number(formData.no_of_activities),
            related_technology: formData.related_technology,
            no_of_participants: Number(formData.no_of_participants)
        })
        onSuccess()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reporting Year *</label>
                    <select
                        value={formData.reporting_year}
                        onChange={(e) => setFormData({ ...formData, reporting_year: e.target.value })}
                        className={`w-full h-11 px-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] ${errors.reporting_year ? 'border-red-500' : 'border-[#E0E0E0]'
                            }`}
                    >
                        <option value="2026">2026</option>
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                    </select>
                    {errors.reporting_year && <p className="mt-1 text-xs text-red-500">{errors.reporting_year}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type of activities *</label>
                    <input
                        type="text"
                        value={formData.type_of_activity}
                        onChange={(e) => setFormData({ ...formData, type_of_activity: e.target.value })}
                        className={`w-full h-11 px-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] ${errors.type_of_activity ? 'border-red-500' : 'border-[#E0E0E0]'
                            }`}
                    />
                    {errors.type_of_activity && <p className="mt-1 text-xs text-red-500">{errors.type_of_activity}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                    <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        className={`w-full h-11 px-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] ${errors.start_date ? 'border-red-500' : 'border-[#E0E0E0]'
                            }`}
                    />
                    {errors.start_date && <p className="mt-1 text-xs text-red-500">{errors.start_date}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                    <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        className={`w-full h-11 px-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] ${errors.end_date ? 'border-red-500' : 'border-[#E0E0E0]'
                            }`}
                    />
                    {errors.end_date && <p className="mt-1 text-xs text-red-500">{errors.end_date}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">No. of activities</label>
                    <input
                        type="number"
                        value={formData.no_of_activities}
                        onChange={(e) => setFormData({ ...formData, no_of_activities: parseInt(e.target.value) || 0 })}
                        className="w-full h-11 px-4 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749]"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of participants</label>
                    <input
                        type="number"
                        value={formData.no_of_participants}
                        onChange={(e) => setFormData({ ...formData, no_of_participants: parseInt(e.target.value) || 0 })}
                        className="w-full h-11 px-4 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749]"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Related crop/livestock technology</label>
                    <textarea
                        value={formData.related_technology}
                        onChange={(e) => setFormData({ ...formData, related_technology: e.target.value })}
                        className="w-full p-4 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] min-h-[100px]"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button variant="outline" type="button" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="primary" type="submit" className="bg-[#487749] hover:bg-[#3A613B]">
                    Update Record
                </Button>
            </div>
        </form>
    )
}
