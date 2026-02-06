import React, { useState } from 'react'
import { useAuthStore } from '../../../stores/authStore'
import { localStorageService } from '../../../utils/localStorageService'
import { Training } from '../../../types/training'
import { Input } from '../../ui/Input'
import { Button } from '../../ui/Button'

interface AddTrainingProps {
    onSuccess: () => void
    onCancel: () => void
}

export const AddTraining: React.FC<AddTrainingProps> = ({ onSuccess, onCancel }) => {
    const { user } = useAuthStore()
    const [formData, setFormData] = useState<Partial<Training>>({
        reporting_year: '2024',
        training_program: 'Farmers',
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    const trainingPrograms = [
        "Farmers",
        "Rural Youth",
        "Extension Personnel",
        "Vocational Training",
        "Sponsored Training"
    ]

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {}
        if (!formData.reporting_year) newErrors.reporting_year = 'Reporting year is required'
        if (!formData.start_date) newErrors.start_date = 'Start date is required'
        if (!formData.end_date) newErrors.end_date = 'End date is required'
        if (!formData.training_program) newErrors.training_program = 'Training program is required'
        if (!formData.training_title) newErrors.training_title = 'Training title is required'
        if (!formData.venue) newErrors.venue = 'Venue is required'
        if (!formData.training_discipline) newErrors.training_discipline = 'Training discipline is required'
        if (!formData.thematic_area) newErrors.thematic_area = 'Thematic area is required'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate() || !user?.kvkId) return

        const newTraining: Training = {
            id: Date.now(),
            kvk_id: user.kvkId,
            kvk_name: user.name || 'Unknown KVK',
            reporting_year: formData.reporting_year || '',
            start_date: formData.start_date || '',
            end_date: formData.end_date || '',
            training_program: formData.training_program || '',
            training_title: formData.training_title || '',
            venue: formData.venue || '',
            training_discipline: formData.training_discipline || '',
            thematic_area: formData.thematic_area || '',
        }

        localStorageService.saveTraining(newTraining)
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

                <div>
                    <label className="block text-sm font-medium text-[#487749] mb-2">
                        Training Program
                    </label>
                    <select
                        value={formData.training_program}
                        onChange={e => setFormData({ ...formData, training_program: e.target.value })}
                        className="w-full h-12 px-4 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white text-[#212121]"
                        required
                    >
                        {trainingPrograms.map(prog => (
                            <option key={prog} value={prog}>{prog}</option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-2">
                    <Input
                        label="Training Title"
                        value={formData.training_title || ''}
                        onChange={e => setFormData({ ...formData, training_title: e.target.value })}
                        placeholder="Enter training title"
                        error={errors.training_title}
                        required
                    />
                </div>

                <div>
                    <Input
                        label="Start Date"
                        type="date"
                        value={formData.start_date || ''}
                        onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                        error={errors.start_date}
                        required
                    />
                </div>

                <div>
                    <Input
                        label="End Date"
                        type="date"
                        value={formData.end_date || ''}
                        onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                        error={errors.end_date}
                        required
                    />
                </div>

                <div>
                    <Input
                        label="Venue"
                        value={formData.venue || ''}
                        onChange={e => setFormData({ ...formData, venue: e.target.value })}
                        placeholder="Enter venue"
                        error={errors.venue}
                        required
                    />
                </div>

                <div>
                    <Input
                        label="Training Discipline"
                        value={formData.training_discipline || ''}
                        onChange={e => setFormData({ ...formData, training_discipline: e.target.value })}
                        placeholder="Enter training discipline"
                        error={errors.training_discipline}
                        required
                    />
                </div>

                <div className="md:col-span-2">
                    <Input
                        label="Thematic Area"
                        value={formData.thematic_area || ''}
                        onChange={e => setFormData({ ...formData, thematic_area: e.target.value })}
                        placeholder="Enter thematic area"
                        error={errors.thematic_area}
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
                    Add Training Details
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
