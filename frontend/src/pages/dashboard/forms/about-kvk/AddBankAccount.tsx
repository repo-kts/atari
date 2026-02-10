import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useKvkBankAccounts } from '../../../../hooks/useAboutKvkData'
import { ENTITY_PATHS } from '../../../../constants/entityTypes'
import { useAuthStore } from '../../../../stores/authStore'

export const AddBankAccount: React.FC = () => {
    const navigate = useNavigate()
    const { create, isLoading } = useKvkBankAccounts()
    const user = useAuthStore(state => state.user)

    const [formData, setFormData] = useState({
        accountType: '',
        accountName: '',
        bankName: '',
        location: '',
        accountNumber: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user?.kvkId) {
            alert('KVK ID not found. Please login as a KVK user.')
            return
        }

        try {
            await create({
                ...formData,
                kvkId: user.kvkId,
                // Cast accountType to match strict union type if needed, or let validation handle it
                accountType: formData.accountType as any
            })
            navigate(ENTITY_PATHS.KVK_BANK_ACCOUNT)
        } catch (error) {
            console.error('Failed to create bank account:', error)
            alert('Failed to create bank account. Please try again.')
        }
    }

    return (
        <div className="bg-white rounded-2xl p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#E0E0E0]">
                <h2 className="text-xl font-semibold text-[#2F3A4B]">Create Bank Account Details</h2>
                <button
                    onClick={() => navigate(ENTITY_PATHS.KVK_BANK_ACCOUNT)}
                    className="px-4 py-2 bg-[#487749] text-white rounded-lg text-sm font-medium hover:bg-[#3d6540] transition-colors"
                >
                    Back
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Row 1 */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="accountType" className="text-sm font-medium text-[#2F3A4B]">
                            Account type<span className="text-red-500">*</span>
                        </label>
                        <select
                            id="accountType"
                            name="accountType"
                            value={formData.accountType}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 bg-white border border-[#E0E0E0] rounded-lg text-[#2F3A4B] focus:outline-none focus:ring-1 focus:ring-[#487749] focus:border-[#487749]"
                        >
                            <option value="" disabled>Select</option>
                            <option value="Savings">Savings</option>
                            <option value="Current">Current</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="accountName" className="text-sm font-medium text-[#2F3A4B]">
                            Account Name<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="accountName"
                            name="accountName"
                            value={formData.accountName}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 bg-white border border-[#E0E0E0] rounded-lg text-[#2F3A4B] focus:outline-none focus:ring-1 focus:ring-[#487749] focus:border-[#487749]"
                        />
                    </div>

                    {/* Row 2 */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="bankName" className="text-sm font-medium text-[#2F3A4B]">
                            Bank Name<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="bankName"
                            name="bankName"
                            value={formData.bankName}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 bg-white border border-[#E0E0E0] rounded-lg text-[#2F3A4B] focus:outline-none focus:ring-1 focus:ring-[#487749] focus:border-[#487749]"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="location" className="text-sm font-medium text-[#2F3A4B]">
                            Location<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 bg-white border border-[#E0E0E0] rounded-lg text-[#2F3A4B] focus:outline-none focus:ring-1 focus:ring-[#487749] focus:border-[#487749]"
                        />
                    </div>

                    {/* Row 3 */}
                    <div className="flex flex-col gap-1.5 md:col-span-1">
                        <label htmlFor="accountNumber" className="text-sm font-medium text-[#2F3A4B]">
                            Account Number<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="accountNumber"
                            name="accountNumber"
                            value={formData.accountNumber}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 bg-white border border-[#E0E0E0] rounded-lg text-[#2F3A4B] focus:outline-none focus:ring-1 focus:ring-[#487749] focus:border-[#487749]"
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
