import React from 'react'
import { ENTITY_TYPES } from '../../../../../constants/entityTypes'
import { FormInput, FormSelect } from '../shared/FormComponents'
import { ExtendedEntityType } from '../../../../../utils/masterUtils'

interface AryaFormsProps {
    entityType: ExtendedEntityType
    formData: any
    setFormData: (data: any) => void
    YearSelect: React.FC
}

export const AryaForms: React.FC<AryaFormsProps> = ({
    entityType,
    formData,
    setFormData,
    YearSelect,
}) => {
    return (
        <>
            {entityType === ENTITY_TYPES.PROJECT_ARYA_CURRENT && (
                <div className="space-y-8">

                    <div className="mb-6">
                        <h3 className="text-xl font-normal text-gray-800">Attracting and Retaining Youth in Agriculture (ARYA)</h3>
                    </div>

                    {/* Basic Details */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-normal text-gray-800">Basic Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <YearSelect />
                            <FormSelect
                                label="Name of enterprises"
                                required
                                value={formData.enterpriseName || ''}
                                options={[
                                    { value: 'Mushroom', label: 'Mushroom' },
                                    { value: 'Apiary', label: 'Apiary' },
                                    { value: 'Poultry', label: 'Poultry' },
                                    { value: 'Goatry', label: 'Goatry' },
                                    { value: 'Dairy', label: 'Dairy' },
                                    { value: 'Vermicompost', label: 'Vermicompost' },
                                    { value: 'Fishery', label: 'Fishery' },
                                    { value: 'Nursery', label: 'Nursery' },
                                    { value: 'Value Addition', label: 'Value Addition' },
                                    { value: 'Other', label: 'Other' }
                                ]}
                                onChange={(e) => setFormData({ ...formData, enterpriseName: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* No. of entrepreneurial units established */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-normal text-gray-800">No. of entrepreneurial units established</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Male"
                                type="number"
                                required
                                value={formData.unitsMale || ''}
                                onChange={(e) => setFormData({ ...formData, unitsMale: e.target.value })}
                            />
                            <FormInput
                                label="Female"
                                type="number"
                                required
                                value={formData.unitsFemale || ''}
                                onChange={(e) => setFormData({ ...formData, unitsFemale: e.target.value })}
                            />
                            <FormInput
                                label="Viable units"
                                type="number"
                                required
                                value={formData.unitsViable || ''}
                                onChange={(e) => setFormData({ ...formData, unitsViable: e.target.value })}
                            />
                            <FormInput
                                label="Closed units"
                                type="number"
                                required
                                value={formData.unitsClosed || ''}
                                onChange={(e) => setFormData({ ...formData, unitsClosed: e.target.value })}
                            />
                            <FormInput
                                label="No. of Training conducted"
                                type="number"
                                required
                                value={formData.trainingConducted || ''}
                                onChange={(e) => setFormData({ ...formData, trainingConducted: e.target.value })}
                            />
                            <FormInput
                                label="Start Date"
                                type="date"
                                required
                                value={formData.startDate || ''}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />
                            <FormInput
                                label="End Date"
                                type="date"
                                required
                                value={formData.endDate || ''}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* No. of rural youth trained */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-normal text-gray-800">No. of rural youth trained</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Male"
                                type="number"
                                required
                                value={formData.trainedMale || ''}
                                onChange={(e) => setFormData({ ...formData, trainedMale: e.target.value })}
                            />
                            <FormInput
                                label="Female"
                                type="number"
                                required
                                value={formData.trainedFemale || ''}
                                onChange={(e) => setFormData({ ...formData, trainedFemale: e.target.value })}
                            />
                            <FormInput
                                label="No. of Groups Formed"
                                type="number"
                                required
                                value={formData.groupsFormed || ''}
                                onChange={(e) => setFormData({ ...formData, groupsFormed: e.target.value })}
                            />
                            <FormInput
                                label="No. of Groups active"
                                type="number"
                                required
                                value={formData.groupsActive || ''}
                                onChange={(e) => setFormData({ ...formData, groupsActive: e.target.value })}
                            />
                            <FormInput
                                label="No. of person left the group"
                                type="number"
                                required
                                value={formData.personsLeftGroup || ''}
                                onChange={(e) => setFormData({ ...formData, personsLeftGroup: e.target.value })}
                            />
                            <FormInput
                                label="No. of Members in each Group"
                                type="number"
                                required
                                value={formData.membersInEachGroup || ''}
                                onChange={(e) => setFormData({ ...formData, membersInEachGroup: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Financial Impact */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-normal text-gray-800">Financial Impact</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Average size of each entrepreneurial unit"
                                required
                                value={formData.avgSizeInfo || ''}
                                onChange={(e) => setFormData({ ...formData, avgSizeInfo: e.target.value })}
                            />
                            <FormInput
                                label="Total production/unit/year"
                                type="number"
                                required
                                value={formData.prodPerUnit || ''}
                                onChange={(e) => setFormData({ ...formData, prodPerUnit: e.target.value })}
                            />
                            <FormInput
                                label="Per unit cost of Production"
                                type="number"
                                required
                                value={formData.costOfProd || ''}
                                onChange={(e) => setFormData({ ...formData, costOfProd: e.target.value })}
                            />
                            <FormInput
                                label="Sale value of Produce"
                                type="number"
                                required
                                value={formData.saleValue || ''}
                                onChange={(e) => setFormData({ ...formData, saleValue: e.target.value })}
                            />
                            <FormInput
                                label="Employment generated (mandays)"
                                type="number"
                                required
                                value={formData.employmentGenerated || ''}
                                onChange={(e) => setFormData({ ...formData, employmentGenerated: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2 relative group mt-2">
                            <input
                                type="file"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#487749] focus:ring-1 focus:ring-[#487749] transition-all bg-white"
                            />
                            <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-[#487749] pointer-events-none font-medium">Images</label>
                        </div>
                    </div>
                </div>
            )}

            {/* ARYA Evaluation (Previous Year) */}
            {entityType === ENTITY_TYPES.PROJECT_ARYA_EVALUATION && (
                <div className="space-y-8">

                    <div className="mb-6">
                        <h3 className="text-xl font-normal text-gray-800">Create ARYA Evaluation</h3>
                    </div>

                    {/* Basic Details */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-normal text-gray-800">Basic Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <YearSelect />
                            <FormSelect
                                label="Name of enterprises"
                                required
                                value={formData.enterpriseName || ''}
                                options={[
                                    { value: 'Mushroom', label: 'Mushroom' },
                                    { value: 'Apiary', label: 'Apiary' },
                                    { value: 'Poultry', label: 'Poultry' },
                                    { value: 'Goatry', label: 'Goatry' },
                                    { value: 'Dairy', label: 'Dairy' },
                                    { value: 'Vermicompost', label: 'Vermicompost' },
                                    { value: 'Fishery', label: 'Fishery' },
                                    { value: 'Nursery', label: 'Nursery' },
                                    { value: 'Value Addition', label: 'Value Addition' },
                                    { value: 'Other', label: 'Other' }
                                ]}
                                onChange={(e) => setFormData({ ...formData, enterpriseName: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* No. of entrepreneurial units established */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-normal text-gray-800">No. of entrepreneurial units established</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Male"
                                type="number"
                                required
                                value={formData.unitsMale || ''}
                                onChange={(e) => setFormData({ ...formData, unitsMale: e.target.value })}
                            />
                            <FormInput
                                label="Female"
                                type="number"
                                required
                                value={formData.unitsFemale || ''}
                                onChange={(e) => setFormData({ ...formData, unitsFemale: e.target.value })}
                            />
                            <FormInput
                                label="No. of Non-Functional Enterpreneurial unit closed"
                                type="number"
                                required
                                value={formData.unitsClosed || ''}
                                onChange={(e) => setFormData({ ...formData, unitsClosed: e.target.value })}
                            />
                            <FormInput
                                label="Date of Closing"
                                type="date"
                                required
                                value={formData.dateClosing || ''}
                                onChange={(e) => setFormData({ ...formData, dateClosing: e.target.value })}
                            />
                            <FormInput
                                label="No. of Non-Functional Enterpreneurial unit Restarted (i.e. Previously closed)"
                                type="number"
                                required
                                value={formData.unitsRestarted || ''}
                                onChange={(e) => setFormData({ ...formData, unitsRestarted: e.target.value })}
                            />
                            <FormInput
                                label="Date of restart"
                                type="date"
                                required
                                value={formData.dateRestart || ''}
                                onChange={(e) => setFormData({ ...formData, dateRestart: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Entrepreneurial Unit Size */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-normal text-gray-800">Entrepreneurial Unit Size related to production capacity/ year (Production Kg/unit)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="No. of unit"
                                type="number"
                                required
                                value={formData.noOfUnit || ''}
                                onChange={(e) => setFormData({ ...formData, noOfUnit: e.target.value })}
                            />
                            <FormInput
                                label="Unit capacity"
                                type="number"
                                required
                                value={formData.unitCapacity || ''}
                                onChange={(e) => setFormData({ ...formData, unitCapacity: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Entrepreneurial Establishment Cost */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-normal text-gray-800">Entrepreneurial Establishment Cost/unit/ year (Rs.)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Fixed cost"
                                type="number"
                                required
                                value={formData.fixedCost || ''}
                                onChange={(e) => setFormData({ ...formData, fixedCost: e.target.value })}
                            />
                            <FormInput
                                label="Variable cost"
                                type="number"
                                required
                                value={formData.variableCost || ''}
                                onChange={(e) => setFormData({ ...formData, variableCost: e.target.value })}
                            />
                            <FormInput
                                label="Total Production/unit/year"
                                type="number"
                                required
                                value={formData.totalProduction || ''}
                                onChange={(e) => setFormData({ ...formData, totalProduction: e.target.value })}
                            />
                            <FormInput
                                label="Gross cost of Production/unit/ year (Rs.)"
                                type="number"
                                required
                                value={formData.grossCost || ''}
                                onChange={(e) => setFormData({ ...formData, grossCost: e.target.value })}
                            />
                            <FormInput
                                label="Gross return of Production/unit/ year (Rs.)"
                                type="number"
                                required
                                value={formData.grossReturn || ''}
                                onChange={(e) => setFormData({ ...formData, grossReturn: e.target.value })}
                            />
                            <FormInput
                                label="Net Benefit / Unit/ year (Rs.)"
                                type="number"
                                required
                                value={formData.netBenefit || ''}
                                onChange={(e) => setFormData({ ...formData, netBenefit: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Employment generated */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-normal text-gray-800">Employment generated/ year (manday @ 8 hr/ day)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Family"
                                type="number"
                                required
                                value={formData.empFamily || ''}
                                onChange={(e) => setFormData({ ...formData, empFamily: e.target.value })}
                            />
                            <FormInput
                                label="Other than Family"
                                type="number"
                                required
                                value={formData.empOther || ''}
                                onChange={(e) => setFormData({ ...formData, empOther: e.target.value })}
                            />
                        </div>
                        <div className="mt-4">
                            <FormInput
                                label="No. of persons started entrepreneurial unit"
                                type="number"
                                required
                                value={formData.personsStartedUnit || ''}
                                onChange={(e) => setFormData({ ...formData, personsStartedUnit: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
