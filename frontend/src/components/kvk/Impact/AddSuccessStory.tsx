import React, { useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { useAuthStore } from '../../../stores/authStore'
import { localStorageService } from '../../../utils/localStorageService'
import { SuccessStory } from '../../../types/impact'

interface AddSuccessStoryProps {
    onSuccess: () => void
    onCancel: () => void
}

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
    'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
    'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Delhi', 'Jammu and Kashmir', 'Ladakh'
]

export const AddSuccessStory: React.FC<AddSuccessStoryProps> = ({ onSuccess, onCancel }) => {
    const { user } = useAuthStore()
    const [formData, setFormData] = useState<Partial<SuccessStory>>({
        reporting_year: '2026',
        kvk_id: user?.kvkId || 1,
        kvk_name: user?.name || 'Demo KVK',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const newItem: SuccessStory = {
            ...formData as SuccessStory,
            id: Date.now(),
            farmer_name: formData.farmer_name || 'Unknown Farmer',
            title: formData.title || 'Success Story',
        }
        localStorageService.saveSuccessStory(newItem)
        onSuccess()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 p-1">

            {/* Personal Information */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-[#487749] border-b pb-2">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Reporting Year <span className="text-red-500">*</span></label>
                        <select
                            name="reporting_year"
                            value={formData.reporting_year}
                            onChange={handleChange}
                            className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white"
                        >
                            <option value="2026">2026</option>
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Name of the Farmer/Entrepreneur <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="farmer_name"
                            value={formData.farmer_name || ''}
                            onChange={handleChange}
                            className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749]"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">State of farmer <span className="text-red-500">*</span></label>
                        <select
                            name="state_of_farmer"
                            value={formData.state_of_farmer || ''}
                            onChange={handleChange}
                            className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white"
                        >
                            <option value="">Select State</option>
                            {INDIAN_STATES.map(state => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Education <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="education"
                            value={formData.education || ''}
                            onChange={handleChange}
                            className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749]"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Farming Experience/Experience in Enterprise <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="farming_experience"
                            value={formData.farming_experience || ''}
                            onChange={handleChange}
                            className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749]"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Mobile Number <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="mobile_number"
                            value={formData.mobile_number || ''}
                            onChange={handleChange}
                            className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749]"
                        />
                    </div>

                    <div className="col-span-1 md:col-span-2 space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Full Address <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address || ''}
                            onChange={handleChange}
                            className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749]"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Professional Membership <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="professional_membership"
                            value={formData.professional_membership || ''}
                            onChange={handleChange}
                            className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749]"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Major Achievement of the Farmers <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="major_achievement"
                            value={formData.major_achievement || ''}
                            onChange={handleChange}
                            className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749]"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Awards Received <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="awards_received"
                            value={formData.awards_received || ''}
                            onChange={handleChange}
                            className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749]"
                        />
                    </div>
                </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-[#487749] border-b pb-2">Professional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="col-span-1 md:col-span-2 space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Title of the Success Story/Case Study <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title || ''}
                            onChange={handleChange}
                            className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749]"
                        />
                    </div>
                    <div className="col-span-1 md:col-span-2 space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Situation Analysis/Problem Statement <span className="text-red-500">*</span></label>
                        <textarea
                            name="situation_analysis"
                            rows={3}
                            value={formData.situation_analysis || ''}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749]"
                        />
                    </div>
                    <div className="col-span-1 md:col-span-2 space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Plan, Implement and Support/KVK Intervention <span className="text-red-500">*</span></label>
                        <textarea
                            name="plan_implement_support"
                            rows={3}
                            value={formData.plan_implement_support || ''}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749]"
                        />
                    </div>
                    <div className="col-span-1 md:col-span-2 space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Details of Technology/Practice Followed by the Farmer <span className="text-red-500">*</span></label>
                        <textarea
                            name="technology_details"
                            rows={3}
                            value={formData.technology_details || ''}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749]"
                        />
                    </div>
                    <div className="col-span-1 md:col-span-2 space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Results/Output(Economic & Social Impact) <span className="text-red-500">*</span></label>
                        <textarea
                            name="results_output"
                            rows={3}
                            value={formData.results_output || ''}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749]"
                        />
                    </div>
                    <div className="col-span-1 md:col-span-2 space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Impact/Outcome <span className="text-red-500">*</span></label>
                        <textarea
                            name="impact_outcome"
                            rows={3}
                            value={formData.impact_outcome || ''}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749]"
                        />
                    </div>
                    <div className="col-span-1 md:col-span-2 space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Future Plans <span className="text-red-500">*</span></label>
                        <textarea
                            name="future_plans"
                            rows={2}
                            value={formData.future_plans || ''}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749]"
                        />
                    </div>

                    <div className="col-span-1 md:col-span-2 space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Supporting Images</label>
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="sm" type="button" className="text-gray-600 border-gray-300">Choose Files</Button>
                            <span className="text-sm text-gray-500">No file chosen</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">File size must be less than 2MB</p>
                    </div>
                </div>
            </div>

            {/* Economic Information */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-[#487749] border-b pb-2">Economic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Enterprise <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="enterprise"
                            value={formData.enterprise || ''}
                            onChange={handleChange}
                            className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749]"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Gross Income (Annual) <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="gross_income"
                            value={formData.gross_income || ''}
                            onChange={handleChange}
                            className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749]"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Net Income <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="net_income"
                            value={formData.net_income || ''}
                            onChange={handleChange}
                            className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749]"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Cost Benefit Ratio <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="cost_benefit_ratio"
                            value={formData.cost_benefit_ratio || ''}
                            onChange={handleChange}
                            className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749]"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-center gap-4 pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={onCancel} className="px-8 h-10 border-gray-300 text-gray-700 hover:bg-gray-50">
                    Cancel
                </Button>
                <Button type="submit" className="px-8 h-10 bg-[#487749] hover:bg-[#3A613B] text-white">
                    Submit
                </Button>
            </div>
        </form>
    )
}
