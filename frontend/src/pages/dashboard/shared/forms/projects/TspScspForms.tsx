import React from 'react'
import { ENTITY_TYPES } from '../../../../../constants/entityTypes'
import { FormInput, FormSelect } from '../shared/FormComponents'
import { ExtendedEntityType } from '../../../../../utils/masterUtils'

interface TspScspFormsProps {
    entityType: ExtendedEntityType
    formData: any
    setFormData: (data: any) => void
    YearSelect: React.FC
}

export const TspScspForms: React.FC<TspScspFormsProps> = ({
    entityType,
    formData,
    setFormData,
    YearSelect,
}) => {
    return (
        <>
            {entityType === ENTITY_TYPES.PROJECT_TSP_SCSP && (
                <div className="space-y-8">
                    <div className="space-y-2">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border-b border-[#E8F5E9] pb-2">
                            <h3 className="text-lg font-semibold text-[#487749]">Create SubPlan Activity</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <YearSelect />
                            <FormSelect
                                label="Type"
                                required
                                value={formData.type || ''}
                                options={[
                                    { value: 'TSP', label: 'TSP' },
                                    { value: 'SCSP', label: 'SCSP' }
                                ]}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            />
                            <FormSelect
                                label="Activities"
                                required
                                value={formData.activity || ''}
                                options={[
                                    { value: 'Training', label: 'Training' },
                                    { value: 'Demonstration', label: 'Demonstration' },
                                    { value: 'Extension Activity', label: 'Extension Activity' },
                                    { value: 'Other', label: 'Other' }
                                ]}
                                onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                            />
                            <FormInput
                                label="No. of trainings/demos"
                                type="number"
                                required
                                value={formData.noOfTrainings || ''}
                                onChange={(e) => setFormData({ ...formData, noOfTrainings: e.target.value })}
                            />
                            <FormInput
                                label="No. of beneficiaries"
                                type="number"
                                required
                                value={formData.noOfBeneficiaries || ''}
                                onChange={(e) => setFormData({ ...formData, noOfBeneficiaries: e.target.value })}
                            />
                            <FormInput
                                label="Funds received"
                                type="number"
                                required
                                value={formData.fundsReceived || ''}
                                onChange={(e) => setFormData({ ...formData, fundsReceived: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-md font-bold text-[#2E7D32] border-b pb-1">Achievements of physical outcome</h4>

                        {/* Custom Table Layout for Achievements */}
                        <div className="overflow-x-auto">
                            <div className="min-w-full inline-block align-middle">
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-[#f0fdf4]">
                                            <tr>
                                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[#487749] uppercase tracking-wider w-16">Sl.No.</th>
                                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[#487749] uppercase tracking-wider">Description</th>
                                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[#487749] uppercase tracking-wider w-32">Unit</th>
                                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[#487749] uppercase tracking-wider">Achievements</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {[
                                                { id: 1, label: 'Change in family income', key: 'familyIncome' },
                                                { id: 2, label: 'Change in crop productivity/yield', key: 'cropProductivity' },
                                                { id: 3, label: 'Change/Availability of agricultural implements/tools etc.', key: 'agriImplements' }
                                            ].map((row) => (
                                                <tr key={row.id}>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{row.id}</td>
                                                    <td className="px-4 py-4 text-sm text-gray-900">{row.label}</td>
                                                    <td className="px-4 py-2">
                                                        <FormInput
                                                            label=""
                                                            placeholder="%"
                                                            value={formData[`${row.key}_unit`] || ''}
                                                            onChange={(e) => setFormData({ ...formData, [`${row.key}_unit`]: e.target.value })}
                                                            className="h-10 border-gray-200"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <FormInput
                                                            label=""
                                                            value={formData[`${row.key}_achievement`] || ''}
                                                            onChange={(e) => setFormData({ ...formData, [`${row.key}_achievement`]: e.target.value })}
                                                            className="h-10 border-gray-200"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-md font-bold text-[#2E7D32] border-b pb-1">Location and Beneficiary Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormSelect
                                label="District"
                                required
                                value={formData.district || ''}
                                options={[{ value: 'district1', label: 'District 1' }]}
                                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                            />
                            <FormInput
                                label="Sub-district"
                                required
                                value={formData.subDistrict || ''}
                                onChange={(e) => setFormData({ ...formData, subDistrict: e.target.value })}
                            />
                            <FormInput
                                label="No. of Village covered"
                                type="number"
                                required
                                value={formData.villagesCovered || ''}
                                onChange={(e) => setFormData({ ...formData, villagesCovered: e.target.value })}
                            />
                            <FormInput
                                label="Name of village(s) covered"
                                required
                                value={formData.villageNames || ''}
                                onChange={(e) => setFormData({ ...formData, villageNames: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-md font-bold text-[#2E7D32]">ST population benefitted (No.)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormInput
                                label="M"
                                type="number"
                                value={formData.stMale || ''}
                                onChange={(e) => setFormData({ ...formData, stMale: e.target.value })}
                            />
                            <FormInput
                                label="F"
                                type="number"
                                value={formData.stFemale || ''}
                                onChange={(e) => setFormData({ ...formData, stFemale: e.target.value })}
                            />
                            <FormInput
                                label="Total"
                                type="number"
                                value={formData.stTotal || ''}
                                onChange={(e) => setFormData({ ...formData, stTotal: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
