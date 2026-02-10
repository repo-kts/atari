import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../../stores/authStore'
import { useKvkEquipments } from '../../../../hooks/useAboutKvkData'
import { ENTITY_PATHS } from '../../../../constants/entityTypes'
import { ChevronLeft } from 'lucide-react'

// Generate Years (Current + past 20 years)
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 21 }, (_, i) => currentYear - i);

export default function AddEquipment() {
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const { create, isLoading } = useKvkEquipments()

    const [formData, setFormData] = useState({
        equipmentName: '',
        yearOfPurchase: '',
        totalCost: '',
        presentStatus: '',
        sourceOfFund: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!user?.kvkId) {
            alert('User session not found')
            return
        }

        try {
            // Validate required fields
            if (!formData.equipmentName) {
                alert('Please enter Name of Equipment')
                return
            }
            if (!formData.yearOfPurchase) {
                alert('Please select Year of Purchase')
                return
            }
            if (!formData.totalCost) {
                alert('Please enter Total Cost')
                return
            }
            if (!formData.presentStatus) {
                alert('Please enter Present Status')
                return
            }
            if (!formData.sourceOfFund) {
                alert('Please enter Source of find')
                return
            }

            const payload = {
                kvkId: user.kvkId,
                equipmentName: formData.equipmentName,
                yearOfPurchase: parseInt(formData.yearOfPurchase),
                totalCost: parseFloat(formData.totalCost),
                presentStatus: formData.presentStatus, // String in UI, adapt if backend needs enum
                sourceOfFund: formData.sourceOfFund
            }

            await create(payload as any)
            alert('Equipment added successfully')
            navigate(ENTITY_PATHS.KVK_EQUIPMENTS)
        } catch (error: any) {
            console.error('Error creating equipment:', error)
            alert(error.message || 'Failed to add equipment')
        }
    }

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    return (
        <div className="bg-white rounded-2xl p-6 relative pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white flex justify-between items-center mb-8 pb-4 border-b border-[#E0E0E0]">
                <h2 className="text-xl font-semibold text-[#2F3A4B]">Create Equipments</h2>
                <button
                    onClick={() => navigate(ENTITY_PATHS.KVK_EQUIPMENTS)}
                    className="flex items-center gap-1 px-4 py-2 bg-[#F39C12] text-white rounded-lg text-sm font-medium hover:bg-[#e67e22] transition-colors shadow-sm"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                </button>
            </div>

            <h3 className="text-lg font-medium text-[#2F3A4B] mb-6">Equipment Details</h3>

            {/* Form */}
            <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                    {/* Name of Equipment */}
                    <div className="space-y-1.5 md:col-span-3">
                        <label className="text-sm font-medium text-[#374151]">
                            Name of Equipment <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.equipmentName}
                            onChange={(e) => handleChange('equipmentName', e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-[#D1D5DB] rounded-lg text-[#374151] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#487749] focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Year of Purchase */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[#374151]">
                            Year of Purchase <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                value={formData.yearOfPurchase}
                                onChange={(e) => handleChange('yearOfPurchase', e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-[#D1D5DB] rounded-lg text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#487749] focus:border-transparent appearance-none"
                                required
                            >
                                <option value="">Select</option>
                                {YEARS.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Total Cost */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[#374151]">
                            Total Cost <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.totalCost}
                            onChange={(e) => handleChange('totalCost', e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-[#D1D5DB] rounded-lg text-[#374151] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#487749] focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Present Status */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[#374151]">
                            Present Status <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.presentStatus}
                            onChange={(e) => handleChange('presentStatus', e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-[#D1D5DB] rounded-lg text-[#374151] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#487749] focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Source of fund */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[#374151]">
                            Source of fund <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.sourceOfFund}
                            onChange={(e) => handleChange('sourceOfFund', e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-[#D1D5DB] rounded-lg text-[#374151] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#487749] focus:border-transparent"
                            required
                        />
                    </div>
                </div>

                <div className="flex justify-center mt-12">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-2.5 bg-[#487749] text-white rounded-lg text-sm font-medium hover:bg-[#3d6540] transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                    >
                        {isLoading ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </form>
        </div>
    )
}
