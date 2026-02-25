import React from 'react'
import { ENTITY_TYPES } from '../../../../../constants/entityTypes'
import { FormInput, FormSelect } from '../shared/FormComponents'

interface TspScspFormsProps {
    entityType: string
    formData: any
    setFormData: (data: any) => void
    years: any[]
    districts: any[]
}

export const TspScspForms: React.FC<TspScspFormsProps> = ({
    entityType,
    formData,
    setFormData,
    years,
    districts
}) => {
    return (
        <>
            {entityType === ENTITY_TYPES.PROJECT_TSP_SCSP && (
                <div className="space-y-10">
                    {/* Header Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormSelect
                            label="Reporting Year"
                            required
                            value={formData.yearId || ''}
                            onChange={(e) => setFormData({ ...formData, yearId: parseInt(e.target.value) })}
                            options={years.map((y: any) => ({ value: String(y.id || y.yearId), label: y.yearName || y.year || y.name }))}
                        />
                        <FormSelect
                            label="Type"
                            required
                            value={formData.type || ''}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            options={[
                                { value: 'TSP', label: 'TSP' },
                                { value: 'SCSP', label: 'SCSP' }
                            ]}
                        />
                        <FormSelect
                            label="Activities"
                            required
                            value={formData.activityId || ''}
                            onChange={(e) => setFormData({ ...formData, activityId: e.target.value })}
                            options={[
                                { value: '1', label: 'Activity 1' },
                                { value: '2', label: 'Activity 2' }
                            ]}
                        />
                        <FormInput
                            label="No. of Trainings/Demos"
                            required
                            type="number"
                            value={formData.noOfTrainings || ''}
                            onChange={(e) => setFormData({ ...formData, noOfTrainings: e.target.value })}
                        />
                        <FormInput
                            label="No. of beneficiaries"
                            required
                            type="number"
                            value={formData.noOfBeneficiaries || ''}
                            onChange={(e) => setFormData({ ...formData, noOfBeneficiaries: e.target.value })}
                        />
                        <FormInput
                            label="Funds received"
                            required
                            type="number"
                            value={formData.fundsReceived || ''}
                            onChange={(e) => setFormData({ ...formData, fundsReceived: e.target.value })}
                        />
                    </div>

                    {/* Achievements of physical outcome Section */}
                    <div className="space-y-6 pt-4">
                        <h3 className="text-xl font-bold text-gray-800">Achievements of physical outcome</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="text-left border-b border-gray-200">
                                        <th className="pb-4 font-bold text-gray-700 w-16">Sl. No.</th>
                                        <th className="pb-4 font-bold text-gray-700">Description</th>
                                        <th className="pb-4 font-bold text-gray-700 w-1/4">Unit</th>
                                        <th className="pb-4 font-bold text-gray-700 w-1/4">Achievements</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-6 text-gray-500">1.</td>
                                        <td className="py-6 text-gray-700 font-medium">Change in family income</td>
                                        <td className="py-6 px-2">
                                            <input
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#487749] text-base"
                                                value={formData.outcome1_unit || ''}
                                                onChange={(e) => setFormData({ ...formData, outcome1_unit: e.target.value })}
                                                placeholder="%"
                                            />
                                        </td>
                                        <td className="py-6 px-2">
                                            <input
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#487749] text-base"
                                                value={formData.outcome1_achievement || ''}
                                                onChange={(e) => setFormData({ ...formData, outcome1_achievement: e.target.value })}
                                            />
                                        </td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-6 text-gray-500">2.</td>
                                        <td className="py-6 text-gray-700 font-medium">Change in family consumption level</td>
                                        <td className="py-6 px-2">
                                            <input
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#487749] text-base"
                                                value={formData.outcome2_unit || ''}
                                                onChange={(e) => setFormData({ ...formData, outcome2_unit: e.target.value })}
                                                placeholder="%"
                                            />
                                        </td>
                                        <td className="py-6 px-2">
                                            <input
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#487749] text-base"
                                                value={formData.outcome2_achievement || ''}
                                                onChange={(e) => setFormData({ ...formData, outcome2_achievement: e.target.value })}
                                            />
                                        </td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-6 text-gray-500">3.</td>
                                        <td className="py-6 text-gray-700 font-medium">Change in availability of agricultural implements/ tools etc.</td>
                                        <td className="py-6 px-2">
                                            <input
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#487749] text-base"
                                                value={formData.outcome3_unit || ''}
                                                onChange={(e) => setFormData({ ...formData, outcome3_unit: e.target.value })}
                                                placeholder="%"
                                            />
                                        </td>
                                        <td className="py-4 px-2">
                                            <input
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#487749] text-base"
                                                value={formData.outcome3_achievement || ''}
                                                onChange={(e) => setFormData({ ...formData, outcome3_achievement: e.target.value })}
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Location and Beneficiary Details Section */}
                    <div className="p-8 border border-gray-100 rounded-2xl bg-white shadow-sm space-y-8">
                        <h3 className="text-xl font-bold text-[#487749]">Location and Beneficiary Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormSelect
                                label="District"
                                required
                                value={formData.districtId || ''}
                                onChange={(e) => setFormData({ ...formData, districtId: parseInt(e.target.value) })}
                                options={districts.map((d: any) => ({ value: d.id || d.districtId, label: d.districtName }))}
                            />
                            <FormInput
                                label="Sub-district"
                                required
                                value={formData.subDistrict || ''}
                                onChange={(e) => setFormData({ ...formData, subDistrict: e.target.value })}
                            />
                            <FormInput
                                label="No. of Village covered"
                                required
                                type="number"
                                value={formData.villagesCount || ''}
                                onChange={(e) => setFormData({ ...formData, villagesCount: e.target.value })}
                            />
                            <FormInput
                                label="Name of village(s) covered"
                                required
                                value={formData.villageNames || ''}
                                onChange={(e) => setFormData({ ...formData, villageNames: e.target.value })}
                            />
                        </div>

                        {/* ST population sub-section */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-gray-700">ST population benefitted(No.)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <FormInput
                                    label="M"
                                    required
                                    type="number"
                                    value={formData.beneficiaryMale || ''}
                                    onChange={(e) => setFormData({ ...formData, beneficiaryMale: e.target.value })}
                                />
                                <FormInput
                                    label="F"
                                    required
                                    type="number"
                                    value={formData.beneficiaryFemale || ''}
                                    onChange={(e) => setFormData({ ...formData, beneficiaryFemale: e.target.value })}
                                />
                                <FormInput
                                    label="T"
                                    required
                                    type="number"
                                    value={formData.beneficiaryTotal || ''}
                                    onChange={(e) => setFormData({ ...formData, beneficiaryTotal: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
