import React, { useState, useEffect } from 'react'
import { FLD } from '../../../types/fld'
import { localStorageService } from '../../../utils/localStorageService'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'

interface EditFLDProps {
    fld: FLD
    onSuccess: () => void
    onCancel: () => void
}

export const EditFLD: React.FC<EditFLDProps> = ({ fld, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState<FLD>(fld)

    useEffect(() => {
        setFormData(fld)
    }, [fld])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        localStorageService.updateFLD(fld.id, formData)
        onSuccess()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reporting Year
                    </label>
                    <select
                        value={formData.year}
                        onChange={e => setFormData({ ...formData, year: e.target.value })}
                        className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                    >
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                    </label>
                    <select
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="Ongoing">Ongoing</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                    </label>
                    <Input
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        placeholder="e.g. Oilseeds"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sub Category
                    </label>
                    <Input
                        value={formData.sub_category}
                        onChange={e => setFormData({ ...formData, sub_category: e.target.value })}
                        placeholder="e.g. Mustard"
                        required
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name of Technology Demonstrated
                    </label>
                    <Input
                        value={formData.technology_name}
                        onChange={e => setFormData({ ...formData, technology_name: e.target.value })}
                        placeholder="Enter technology name"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                    </label>
                    <input
                        type="date"
                        value={formData.start_date}
                        onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                        className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                    </label>
                    <input
                        type="date"
                        value={formData.end_date}
                        onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                        className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                >
                    Update Details
                </Button>
            </div>
        </form>
    )
}
