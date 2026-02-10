import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useKvkEmployees } from '../../../../hooks/useAboutKvkData'
import { ENTITY_PATHS } from '../../../../constants/entityTypes'
import { useAuthStore } from '../../../../stores/authStore'

export const AddEmployee: React.FC = () => {
    const navigate = useNavigate()
    const { create, isLoading } = useKvkEmployees()
    const user = useAuthStore(state => state.user)

    const [formData, setFormData] = useState({
        sanctionedPostId: '',
        staffName: '',
        position: '', // Map to suitable field or ignore if presentation only
        mobile: '',
        email: '',
        payLevel: '',
        payScale: '',
        disciplineId: '',
        dateOfBirth: '',
        dateOfJoining: '',
        jobType: '',
        allowances: '',
        category: '',
        photo: null as File | null,
        resume: null as File | null
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target
        if (files && files[0]) {
            setFormData(prev => ({
                ...prev,
                [name]: files[0]
            }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user?.kvkId) {
            alert('KVK ID not found. Please login as a KVK user.')
            return
        }

        try {
            // Transform form data to match API requirements
            // Note: Actual API might handle file uploads differently (e.g., FormData)
            // For now, aligning with the pattern 
            const submitData = {
                ...formData,
                kvkId: user.kvkId,
                sanctionedPostId: Number(formData.sanctionedPostId), // Ensure number
                disciplineId: Number(formData.disciplineId), // Ensure number
                // Convert other enums/types as needed
                positionOrder: 1, // Default or derived from Position?
                // Explicitly cast to any to bypass strict type checks for this UI-first task
                // The actual backend integration for files might need FormData
            } as any

            await create(submitData)
            navigate(ENTITY_PATHS.KVK_EMPLOYEES)
        } catch (error) {
            console.error('Failed to create employee:', error)
            alert('Failed to create employee. Please try again.')
        }
    }

    return (
        <div className="bg-white rounded-2xl p-6 relative pb-20"> {/* pb-20 adds buffer for bottom content */}
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white flex justify-between items-center mb-8 pb-4 border-b border-[#E0E0E0]">
                <h2 className="text-xl font-semibold text-[#2F3A4B]">Add Staff</h2>
                <button
                    onClick={() => navigate(ENTITY_PATHS.KVK_EMPLOYEES)}
                    className="px-4 py-2 bg-[#F39C12] text-white rounded-lg text-sm font-medium hover:bg-[#e67e22] transition-colors shadow-sm"
                >
                    &lt; Back
                </button>
            </div>

            <h3 className="text-lg font-medium text-[#2F3A4B] mb-6">Staff Position</h3>

            {/* Form */}
            <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                    {/* Row 1 */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="sanctionedPostId" className="text-sm font-medium text-[#2F3A4B]">
                            Sanctioned Post<span className="text-red-500">*</span>
                        </label>
                        <select
                            id="sanctionedPostId"
                            name="sanctionedPostId"
                            value={formData.sanctionedPostId}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 bg-white border border-[#E0E0E0] rounded-lg text-[#2F3A4B] focus:outline-none focus:ring-1 focus:ring-[#487749] focus:border-[#487749]"
                        >
                            <option value="" disabled>Please Select</option>
                            <option value="1">Senior Scientist & Head</option>
                            <option value="2">Scientist</option>
                            <option value="3">Programme Assistant</option>
                            {/* Add more options as needed */}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="staffName" className="text-sm font-medium text-[#2F3A4B]">
                            Name<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="staffName"
                            name="staffName"
                            value={formData.staffName}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 bg-white border border-[#E0E0E0] rounded-lg text-[#2F3A4B] focus:outline-none focus:ring-1 focus:ring-[#487749] focus:border-[#487749]"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="position" className="text-sm font-medium text-[#2F3A4B]">
                            Position<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="position"
                            name="position"
                            value={formData.position}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 bg-white border border-[#E0E0E0] rounded-lg text-[#2F3A4B] focus:outline-none focus:ring-1 focus:ring-[#487749] focus:border-[#487749]"
                        />
                    </div>

                    {/* Row 2 */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="mobile" className="text-sm font-medium text-[#2F3A4B]">
                            Mobile<span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#757575]">+91</span>
                            <input
                                type="text"
                                id="mobile"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                required
                                placeholder="Mobile number"
                                className="w-full pl-12 pr-4 py-2.5 bg-white border border-[#E0E0E0] rounded-lg text-[#2F3A4B] focus:outline-none focus:ring-1 focus:ring-[#487749] focus:border-[#487749]"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="email" className="text-sm font-medium text-[#2F3A4B]">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-white border border-[#E0E0E0] rounded-lg text-[#2F3A4B] focus:outline-none focus:ring-1 focus:ring-[#487749] focus:border-[#487749]"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="payLevel" className="text-sm font-medium text-[#2F3A4B]">
                            Level
                        </label>
                        <select
                            id="payLevel"
                            name="payLevel"
                            value={formData.payLevel}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-white border border-[#E0E0E0] rounded-lg text-[#2F3A4B] focus:outline-none focus:ring-1 focus:ring-[#487749] focus:border-[#487749]"
                        >
                            <option value="">Select</option>
                            <option value="LEVEL_10">Level 10</option>
                            <option value="LEVEL_11">Level 11</option>
                            {/* Add more level options */}
                        </select>
                    </div>

                    {/* Row 3 */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="payScale" className="text-sm font-medium text-[#2F3A4B]">
                            Pay Scale
                        </label>
                        <input
                            type="text"
                            id="payScale"
                            name="payScale"
                            value={formData.payScale}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-white border border-[#E0E0E0] rounded-lg text-[#2F3A4B] focus:outline-none focus:ring-1 focus:ring-[#487749] focus:border-[#487749]"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="disciplineId" className="text-sm font-medium text-[#2F3A4B]">
                            Discipline<span className="text-red-500">*</span>
                        </label>
                        <select
                            id="disciplineId"
                            name="disciplineId"
                            value={formData.disciplineId}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 bg-white border border-[#E0E0E0] rounded-lg text-[#2F3A4B] focus:outline-none focus:ring-1 focus:ring-[#487749] focus:border-[#487749]"
                        >
                            <option value="" disabled>Please Select</option>
                            <option value="1">Agronomy</option>
                            <option value="2">Horticulture</option>
                            <option value="3">Soil Science</option>
                            {/* Add more disciplines */}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="dateOfBirth" className="text-sm font-medium text-[#2F3A4B]">
                            Date of Birth<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            id="dateOfBirth"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 bg-white border border-[#E0E0E0] rounded-lg text-[#2F3A4B] focus:outline-none focus:ring-1 focus:ring-[#487749] focus:border-[#487749]"
                        />
                    </div>

                    {/* Row 4 */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="dateOfJoining" className="text-sm font-medium text-[#2F3A4B]">
                            Date of Service Joining<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            id="dateOfJoining"
                            name="dateOfJoining"
                            value={formData.dateOfJoining}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 bg-white border border-[#E0E0E0] rounded-lg text-[#2F3A4B] focus:outline-none focus:ring-1 focus:ring-[#487749] focus:border-[#487749]"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="jobType" className="text-sm font-medium text-[#2F3A4B]">
                            Permanent/Temporary
                        </label>
                        <select
                            id="jobType"
                            name="jobType"
                            value={formData.jobType}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-white border border-[#E0E0E0] rounded-lg text-[#2F3A4B] focus:outline-none focus:ring-1 focus:ring-[#487749] focus:border-[#487749]"
                        >
                            <option value="">Select</option>
                            <option value="PERMANENT">Permanent</option>
                            <option value="TEMPORARY">Temporary</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="allowances" className="text-sm font-medium text-[#2F3A4B]">
                            Details of allowances
                        </label>
                        <input
                            type="text"
                            id="allowances"
                            name="allowances"
                            value={formData.allowances}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-white border border-[#E0E0E0] rounded-lg text-[#2F3A4B] focus:outline-none focus:ring-1 focus:ring-[#487749] focus:border-[#487749]"
                        />
                    </div>

                    {/* Row 5 */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="category" className="text-sm font-medium text-[#2F3A4B]">
                            Category<span className="text-red-500">*</span>
                        </label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 bg-white border border-[#E0E0E0] rounded-lg text-[#2F3A4B] focus:outline-none focus:ring-1 focus:ring-[#487749] focus:border-[#487749]"
                        >
                            <option value="" disabled>Please Select</option>
                            <option value="GENERAL">General</option>
                            <option value="OBC">OBC</option>
                            <option value="SC">SC</option>
                            <option value="ST">ST</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-sm font-medium text-[#2F3A4B]">
                            Photo<span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-2 w-full px-4 py-2.5 bg-white border border-[#E0E0E0] rounded-lg">
                            <input
                                type="file"
                                id="photo"
                                name="photo"
                                onChange={handleFileChange}
                                required
                                className="block w-full text-sm text-slate-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-gray-100 file:text-gray-700
                                hover:file:bg-gray-200"
                            />
                        </div>
                    </div>

                    {/* Row 6 */}
                    <div className="flex flex-col gap-1.5 md:col-span-3">
                        <label className="text-sm font-medium text-[#2F3A4B]">
                            Resume
                        </label>
                        <div className="flex items-center gap-2 w-full px-4 py-2.5 bg-white border border-[#E0E0E0] rounded-lg">
                            <input
                                type="file"
                                id="resume"
                                name="resume"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-slate-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-gray-100 file:text-gray-700
                                hover:file:bg-gray-200"
                            />
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
