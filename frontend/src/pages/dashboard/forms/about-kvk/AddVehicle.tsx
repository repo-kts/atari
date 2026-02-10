import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../../stores/authStore'
import { useKvkVehicles } from '../../../../hooks/useAboutKvkData'
import { ENTITY_PATHS } from '../../../../constants/entityTypes'
import { ChevronLeft } from 'lucide-react'

export default function AddVehicle() {
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const { create, isLoading } = useKvkVehicles()

    // Form State
    const [formData, setFormData] = useState({
        vehicleName: '',
        registrationNo: '',
        yearOfPurchase: '',
        totalCost: '',
        totalRun: '',
        presentStatus: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!user?.kvkId) {
            alert('User session not found')
            return
        }

        try {
            // Validate required fields
            if (!formData.vehicleName) {
                alert('Please enter Vehicle Name')
                return
            }
            if (!formData.yearOfPurchase) {
                alert('Please enter Year of Purchase')
                return
            }
            if (!formData.presentStatus) {
                alert('Please enter Present Status')
                return
            }

            const payload = {
                kvkId: user.kvkId,
                vehicleName: formData.vehicleName,
                registrationNo: formData.registrationNo,
                yearOfPurchase: parseInt(formData.yearOfPurchase),
                totalCost: formData.totalCost ? parseFloat(formData.totalCost) : 0,
                totalRun: formData.totalRun,
                presentStatus: formData.presentStatus as "WORKING" | "GOOD_CONDITION" | "NEW",
            }

            await create(payload)
            alert('Vehicle details added successfully')
            navigate(ENTITY_PATHS.KVK_VEHICLES)
        } catch (error: any) {
            console.error('Error creating vehicle:', error)
            alert(error.message || 'Failed to add vehicle details')
        }
    }

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    return (
        <div className="bg-white rounded-2xl p-6 relative pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white flex justify-between items-center mb-8 pb-4 border-b border-[#E0E0E0]">
                <h2 className="text-xl font-semibold text-[#2F3A4B]">Create Vehicle</h2>
                <button
                    onClick={() => navigate(ENTITY_PATHS.KVK_VEHICLES)}
                    className="flex items-center gap-1 px-4 py-2 bg-[#F39C12] text-white rounded-lg text-sm font-medium hover:bg-[#e67e22] transition-colors shadow-sm"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                </button>
            </div>

            <h3 className="text-lg font-medium text-[#2F3A4B] mb-6">Vehicle Details</h3>

            {/* Form */}
            <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                    {/* Name of Vehicle */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[#374151]">
                            Name of Vehicle <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.vehicleName}
                            onChange={(e) => handleChange('vehicleName', e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-[#D1D5DB] rounded-lg text-[#374151] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#487749] focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Registration Number */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[#374151]">
                            Registration Number
                        </label>
                        <input
                            type="text"
                            value={formData.registrationNo}
                            onChange={(e) => handleChange('registrationNo', e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-[#D1D5DB] rounded-lg text-[#374151] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#487749] focus:border-transparent"
                        />
                    </div>

                    {/* Year of Purchase */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[#374151]">
                            Year of Purchase <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={formData.yearOfPurchase}
                            onChange={(e) => handleChange('yearOfPurchase', e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-[#D1D5DB] rounded-lg text-[#374151] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#487749] focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Total Cost */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[#374151]">
                            Total Cost
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.totalCost}
                            onChange={(e) => handleChange('totalCost', e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-[#D1D5DB] rounded-lg text-[#374151] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#487749] focus:border-transparent"
                        />
                    </div>

                    {/* Total Run */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[#374151]">
                            Total Run(km/hrs)
                        </label>
                        <input
                            type="text"
                            value={formData.totalRun}
                            onChange={(e) => handleChange('totalRun', e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-[#D1D5DB] rounded-lg text-[#374151] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#487749] focus:border-transparent"
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
