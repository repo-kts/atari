import React, { useState } from 'react'
import { useAuthStore } from '../../../stores/authStore'
import { localStorageService } from '../../../utils/localStorageService'
import { OFT } from '../../../types/oft'
import { Input } from '../../ui/Input'
import { Button } from '../../ui/Button'

interface AddOFTProps {
    onSuccess: () => void
    onCancel: () => void
}

export const AddOFT: React.FC<AddOFTProps> = ({
    onSuccess,
    onCancel,
}) => {
    const { user } = useAuthStore()
    const [formData, setFormData] = useState<Partial<OFT>>({
        year: new Date().getFullYear().toString(),
        staff: '',
        title: '',
        problem_diagnosed: '',
        status: 'Ongoing',
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.year) newErrors.year = 'Reporting year is required'
        if (!formData.staff) newErrors.staff = 'Staff name is required'
        if (!formData.title) newErrors.title = 'Title is required'
        if (!formData.problem_diagnosed) newErrors.problem_diagnosed = 'Problem diagnosed is required'
        if (!formData.status) newErrors.status = 'Status is required'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate() || !user?.kvkId) return

        const newOFT: OFT = {
            id: Date.now(),
            kvk_id: user.kvkId,
            kvk_name: user.name || 'Unknown KVK', // Assuming user.name is KVK name for KVK users
            year: formData.year || '',
            staff: formData.staff || '',
            title: formData.title || '',
            problem_diagnosed: formData.problem_diagnosed || '',
            status: formData.status as 'Ongoing' | 'Completed',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
        }

        localStorageService.saveOFT(newOFT)
        onSuccess()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-[#487749] mb-2">
                    Reporting Year
                </label>
                <select
                    value={formData.year}
                    onChange={e => setFormData({ ...formData, year: e.target.value })}
                    className={`w-full h-12 px-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white text-[#212121] ${errors.year ? 'border-red-300' : 'border-[#E0E0E0]'
                        }`}
                >
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                </select>
                {errors.year && (
                    <p className="mt-1 text-sm text-red-600">{errors.year}</p>
                )}
            </div>

            <Input
                label="Staff"
                value={formData.staff || ''}
                onChange={e => setFormData({ ...formData, staff: e.target.value })}
                error={errors.staff}
                required
            />

            <Input
                label="Title of On Farm Trial (OFT)"
                value={formData.title || ''}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                error={errors.title}
                required
            />

            <div>
                <label className="block text-sm font-medium text-[#487749] mb-2">
                    Problem Diagnosed
                </label>
                <textarea
                    value={formData.problem_diagnosed || ''}
                    onChange={e => setFormData({ ...formData, problem_diagnosed: e.target.value })}
                    className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white text-[#212121] min-h-[100px] ${errors.problem_diagnosed ? 'border-red-300' : 'border-[#E0E0E0]'
                        }`}
                />
                {errors.problem_diagnosed && (
                    <p className="mt-1 text-sm text-red-600">{errors.problem_diagnosed}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-[#487749] mb-2">
                    Status
                </label>
                <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as 'Ongoing' | 'Completed' })}
                    className={`w-full h-12 px-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white text-[#212121] ${errors.status ? 'border-red-300' : 'border-[#E0E0E0]'
                        }`}
                >
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                </select>
            </div>

            <div className="flex gap-3 pt-4">
                <Button type="submit" variant="primary" className="flex-1">
                    Add OFT Details
                </Button>
                <Button type="button" variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </form>
    )
}
