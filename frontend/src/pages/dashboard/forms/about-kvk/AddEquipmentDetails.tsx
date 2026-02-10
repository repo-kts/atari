import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../../stores/authStore'
import { useKvkEquipmentDetails } from '../../../../hooks/useAboutKvkData'
import { ENTITY_PATHS } from '../../../../constants/entityTypes'
import { ChevronLeft } from 'lucide-react'

// Generate Reporting Years (Current + past 5 years)
const currentYear = new Date().getFullYear();
const REPORTING_YEARS = Array.from({ length: 6 }, (_, i) => {
    const year = currentYear - i;
    return `${year}-${String(year + 1).slice(-2)}`;
});

const EQUIPMENT_LIST = [
    "Ph Meter",
    "Atomic Absorption Spectro Photometer",
    "Flame Photometer",
    "Spectro Photometer",
    "AV Aids (i) Podium",
    "Audio aid",
    "Photostat Copier machine with accessories",
    "Desktop Computer + Laptop HP",
    "CCTV",
    "LED flood light with stand",
    "Sound System",
    "Handy Cam"
];

export default function AddEquipmentDetails() {
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const { create, isLoading } = useKvkEquipmentDetails()

    const [formData, setFormData] = useState({
        reportingYear: '',
        equipmentName: '',
        presentStatus: 'Working'
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!user?.kvkId) {
            alert('User session not found')
            return
        }

        try {
            // Validate required fields
            if (!formData.reportingYear) {
                alert('Please select Reporting Year')
                return
            }
            if (!formData.equipmentName) {
                alert('Please select Equipment')
                return
            }
            if (!formData.presentStatus) {
                alert('Please select Present Status')
                return
            }

            // Note: The UI only asks for Reporting Year, Equipment Name, and Status.
            // However, the backend type KvkEquipmentFormData might expect other fields.
            // We send what we have. If backend fails, we might need to add defaults.
            const payload = {
                kvkId: user.kvkId,
                reportingYear: formData.reportingYear,
                equipmentName: formData.equipmentName,
                presentStatus: formData.presentStatus as any,
                // Providing defaults for hidden fields if they are mandatory in schema
                yearOfPurchase: currentYear,
                totalCost: 0,
                sourceOfFunding: 'N/A',
                type: 'EQUIPMENT'
            }

            await create(payload as any)
            alert('Equipment details added successfully')
            navigate(ENTITY_PATHS.KVK_EQUIPMENT_DETAILS)
        } catch (error: any) {
            console.error('Error creating equipment details:', error)
            alert(error.message || 'Failed to add equipment details')
        }
    }

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    return (
        <div className="bg-white rounded-2xl p-6 relative pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white flex justify-between items-center mb-8 pb-4 border-b border-[#E0E0E0]">
                <h2 className="text-xl font-semibold text-[#2F3A4B]">Create Equipment Details</h2>
                <button
                    onClick={() => navigate(ENTITY_PATHS.KVK_EQUIPMENT_DETAILS)}
                    className="flex items-center gap-1 px-4 py-2 bg-[#F39C12] text-white rounded-lg text-sm font-medium hover:bg-[#e67e22] transition-colors shadow-sm"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                </button>
            </div>

            <h3 className="text-lg font-medium text-[#2F3A4B] mb-6">Create Equipment Details</h3>

            {/* Form */}
            <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                    {/* Reporting Year */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[#374151]">
                            Reporting Year <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                value={formData.reportingYear}
                                onChange={(e) => handleChange('reportingYear', e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-[#D1D5DB] rounded-lg text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#487749] focus:border-transparent appearance-none"
                                required
                            >
                                <option value="">Select</option>
                                {REPORTING_YEARS.map(year => (
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

                    {/* Equipment */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[#374151]">
                            Equipment <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                value={formData.equipmentName}
                                onChange={(e) => handleChange('equipmentName', e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-[#D1D5DB] rounded-lg text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#487749] focus:border-transparent appearance-none"
                                required
                            >
                                <option value="">Select</option>
                                {EQUIPMENT_LIST.map((name) => (
                                    <option key={name} value={name}>
                                        {name}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Present Status */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[#374151]">
                            Present Status <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                value={formData.presentStatus}
                                onChange={(e) => handleChange('presentStatus', e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-[#D1D5DB] rounded-lg text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#487749] focus:border-transparent appearance-none"
                                required
                            >
                                <option value="Working">Working</option>
                                <option value="Not Working">Not Working</option>
                                <option value="Condemned">Condemned</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
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
