import React, { useState } from 'react'
import { useAuthStore } from '../../../stores/authStore'
import { localStorageService } from '../../../utils/localStorageService'
import { FLD } from '../../../types/fld'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'

interface AddFLDProps {
    onSuccess: () => void
    onCancel: () => void
}

export const AddFLD: React.FC<AddFLDProps> = ({ onSuccess, onCancel }) => {
    const { user } = useAuthStore()
    const [formData, setFormData] = useState<Partial<FLD>>({
        year: new Date().getFullYear().toString(),
        status: 'Ongoing',
        start_date: '',
        end_date: ''
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {}
        if (!formData.year) newErrors.year = 'Reporting year is required'
        if (!formData.category) newErrors.category = 'Category is required'
        if (!formData.sub_category) newErrors.sub_category = 'Sub category is required'
        if (!formData.technology_name) newErrors.technology_name = 'Technology name is required'
        if (!formData.start_date) newErrors.start_date = 'Start date is required'
        if (!formData.end_date) newErrors.end_date = 'End date is required'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate() || !user?.kvkId) return

        const newFLD: FLD = {
            id: Date.now(),
            kvk_id: user.kvkId,
            kvk_name: user.name || 'Unknown KVK',
            year: formData.year || '',
            category: formData.category || '',
            sub_category: formData.sub_category || '',
            technology_name: formData.technology_name || '',
            start_date: formData.start_date || '',
            end_date: formData.end_date || '',
            status: formData.status as 'Ongoing' | 'Completed',
        }

        localStorageService.saveFLD(newFLD)
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
                        value={formData.year}
                        onChange={e => setFormData({ ...formData, year: e.target.value })}
                        className={`w-full h-12 px-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white text-[#212121] ${errors.year ? 'border-red-300' : 'border-[#E0E0E0]'}`}
                        required
                    >
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                    </select>
                    {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#487749] mb-2">
                        Status
                    </label>
                    <select
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full h-12 px-4 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white text-[#212121]"
                    >
                        <option value="Ongoing">Ongoing</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>

                <div>
                    <Input
                        label="Category"
                        value={formData.category || ''}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        placeholder="e.g. Oilseeds"
                        error={errors.category}
                        required
                    />
                </div>

                <div>
                    <Input
                        label="Sub Category"
                        value={formData.sub_category || ''}
                        onChange={e => setFormData({ ...formData, sub_category: e.target.value })}
                        placeholder="e.g. Mustard"
                        error={errors.sub_category}
                        required
                    />
                </div>

                <div className="md:col-span-2">
                    <Input
                        label="Name of Technology Demonstrated"
                        value={formData.technology_name || ''}
                        onChange={e => setFormData({ ...formData, technology_name: e.target.value })}
                        placeholder="Enter technology name"
                        error={errors.technology_name}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#487749] mb-2">
                        Start Date
                    </label>
                    <input
                        type="date"
                        value={formData.start_date}
                        onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                        className={`w-full h-12 px-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white text-[#212121] ${errors.start_date ? 'border-red-300' : 'border-[#E0E0E0]'}`}
                        required
                    />
                    {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#487749] mb-2">
                        End Date
                    </label>
                    <input
                        type="date"
                        value={formData.end_date}
                        onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                        className={`w-full h-12 px-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white text-[#212121] ${errors.end_date ? 'border-red-300' : 'border-[#E0E0E0]'}`}
                        required
                    />
                    {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                >
                    Add FLD Details
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
