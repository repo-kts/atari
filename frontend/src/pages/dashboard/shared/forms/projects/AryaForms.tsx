import React from 'react'
import { ENTITY_TYPES } from '../../../../../constants/entityTypes'
import { FormInput, FormSelect } from '../shared/FormComponents'

interface AryaFormsProps {
    entityType: string
    formData: any
    setFormData: (data: any) => void
    years: any[]
    aryaEnterprises: any[]
}

export const AryaForms: React.FC<AryaFormsProps> = ({
    entityType,
    formData,
    setFormData,
    years,
    aryaEnterprises
}) => {
    return (
        <>
            {entityType === ENTITY_TYPES.PROJECT_ARYA_CURRENT && (
                <div className="space-y-10">
                    {/* Basic Details */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Basic Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormSelect
                                label="Reporting Year"
                                required
                                value={formData.yearId || ''}
                                onChange={(e) => setFormData({ ...formData, yearId: parseInt(e.target.value) })}
                                options={years.map((y: any) => ({ value: String(y.id || y.yearId), label: y.yearName || y.year || y.name }))}
                            />
                            <FormSelect
                                label="Name of enterprises"
                                required
                                value={formData.enterpriseId || ''}
                                onChange={(e) => setFormData({ ...formData, enterpriseId: parseInt(e.target.value) })}
                                options={aryaEnterprises.map((e: any) => ({ value: e.id || e.enterpriseId, label: e.enterpriseName }))}
                            />
                        </div>
                    </div>

                    {/* No. of entrepreneurial units established */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">No. of entrepreneurial units established</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Male"
                                required
                                type="number"
                                value={formData.unitsEstablishedMale || ''}
                                onChange={(e) => setFormData({ ...formData, unitsEstablishedMale: e.target.value })}
                            />
                            <FormInput
                                label="Female"
                                required
                                type="number"
                                value={formData.unitsEstablishedFemale || ''}
                                onChange={(e) => setFormData({ ...formData, unitsEstablishedFemale: e.target.value })}
                            />
                            <FormInput
                                label="Viable units"
                                required
                                type="number"
                                value={formData.viableUnits || ''}
                                onChange={(e) => setFormData({ ...formData, viableUnits: e.target.value })}
                            />
                            <FormInput
                                label="Closed units"
                                required
                                type="number"
                                value={formData.closedUnits || ''}
                                onChange={(e) => setFormData({ ...formData, closedUnits: e.target.value })}
                            />
                            <FormInput
                                label="No. of Training conducted"
                                required
                                type="number"
                                value={formData.trainingConducted || ''}
                                onChange={(e) => setFormData({ ...formData, trainingConducted: e.target.value })}
                            />
                            <FormInput
                                label="Start Date"
                                required
                                type="date"
                                value={formData.startDate || ''}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />
                            <FormInput
                                label="End Date"
                                required
                                type="date"
                                value={formData.endDate || ''}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* No. of rural youth trained */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">No. of rural youth trained</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Male"
                                required
                                type="number"
                                value={formData.youthTrainedMale || ''}
                                onChange={(e) => setFormData({ ...formData, youthTrainedMale: e.target.value })}
                            />
                            <FormInput
                                label="Female"
                                required
                                type="number"
                                value={formData.youthTrainedFemale || ''}
                                onChange={(e) => setFormData({ ...formData, youthTrainedFemale: e.target.value })}
                            />
                            <FormInput
                                label="No. of Groups Formed"
                                required
                                type="number"
                                value={formData.groupsFormed || ''}
                                onChange={(e) => setFormData({ ...formData, groupsFormed: e.target.value })}
                            />
                            <FormInput
                                label="No. of Groups active"
                                required
                                type="number"
                                value={formData.groupsActive || ''}
                                onChange={(e) => setFormData({ ...formData, groupsActive: e.target.value })}
                            />
                            <FormInput
                                label="No. of person left the group"
                                required
                                type="number"
                                value={formData.personsLeftGroup || ''}
                                onChange={(e) => setFormData({ ...formData, personsLeftGroup: e.target.value })}
                            />
                            <FormInput
                                label="No. of Members in each Group"
                                required
                                type="number"
                                value={formData.membersPerGroup || ''}
                                onChange={(e) => setFormData({ ...formData, membersPerGroup: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Financial Impact */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Financial Impact</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Average size of each unit (agro rental unit)"
                                required
                                type="number"
                                value={formData.avgUnitSize || ''}
                                onChange={(e) => setFormData({ ...formData, avgUnitSize: e.target.value })}
                            />
                            <FormInput
                                label="Total Production unit/year"
                                required
                                type="number"
                                value={formData.totalProduction || ''}
                                onChange={(e) => setFormData({ ...formData, totalProduction: e.target.value })}
                            />
                            <FormInput
                                label="Per unit cost of Production"
                                required
                                type="number"
                                value={formData.perUnitCost || ''}
                                onChange={(e) => setFormData({ ...formData, perUnitCost: e.target.value })}
                            />
                            <FormInput
                                label="Sale value of Produce"
                                required
                                type="number"
                                value={formData.saleValue || ''}
                                onChange={(e) => setFormData({ ...formData, saleValue: e.target.value })}
                            />
                            <FormInput
                                label="Employment generated (man-days)"
                                required
                                type="number"
                                value={formData.employmentGenerated || ''}
                                onChange={(e) => setFormData({ ...formData, employmentGenerated: e.target.value })}
                            />
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-[#212121]">
                                    Images
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-[#487749]/10 file:text-[#487749] hover:file:bg-[#487749]/20 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_ARYA_EVALUATION && (
                <div className="space-y-10">
                    {/* Basic Details */}
                    <div>
                        <h3 className="text-xl font-bold text-[#487749] mb-6">Basic Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormSelect
                                label="Reporting Year"
                                required
                                value={formData.yearId || ''}
                                onChange={(e) => setFormData({ ...formData, yearId: parseInt(e.target.value) })}
                                options={years.map((y: any) => ({ value: String(y.id || y.yearId), label: y.yearName || y.year || y.name }))}
                            />
                            <FormSelect
                                label="Name of enterprises"
                                required
                                value={formData.enterpriseId || ''}
                                onChange={(e) => setFormData({ ...formData, enterpriseId: parseInt(e.target.value) })}
                                options={aryaEnterprises.map((e: any) => ({ value: e.id || e.enterpriseId, label: e.enterpriseName }))}
                            />
                        </div>
                    </div>

                    {/* No. of entrepreneurial units established */}
                    <div>
                        <h3 className="text-xl font-bold text-[#487749] mb-6">No. of entrepreneurial units established</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormInput
                                label="Male"
                                required
                                type="number"
                                value={formData.unitsEstablishedMale || ''}
                                onChange={(e) => setFormData({ ...formData, unitsEstablishedMale: e.target.value })}
                            />
                            <FormInput
                                label="Female"
                                required
                                type="number"
                                value={formData.unitsEstablishedFemale || ''}
                                onChange={(e) => setFormData({ ...formData, unitsEstablishedFemale: e.target.value })}
                            />
                            <FormInput
                                label="No. of non-functional entrepreneurial unit closed"
                                required
                                type="number"
                                value={formData.unitsClosed || ''}
                                onChange={(e) => setFormData({ ...formData, unitsClosed: e.target.value })}
                            />
                            <FormInput
                                label="Date of Closing"
                                required
                                type="date"
                                value={formData.closingDate || ''}
                                onChange={(e) => setFormData({ ...formData, closingDate: e.target.value })}
                            />
                            <FormInput
                                label="No. of non-functional entrepreneurial unit restarted (i.e. Previously closed)"
                                required
                                type="number"
                                value={formData.unitsRestarted || ''}
                                onChange={(e) => setFormData({ ...formData, unitsRestarted: e.target.value })}
                            />
                            <FormInput
                                label="Date of restart"
                                required
                                type="date"
                                value={formData.restartDate || ''}
                                onChange={(e) => setFormData({ ...formData, restartDate: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Entrepreneurial Unit Size related to production capacity/ year (Production (Kg/unit)) */}
                    <div>
                        <h3 className="text-xl font-bold text-[#487749] mb-6">Entrepreneurial Unit Size related to production capacity/ year (Production (Kg/unit))</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormInput
                                label="No. of unit"
                                required
                                type="number"
                                value={formData.noOfUnit || ''}
                                onChange={(e) => setFormData({ ...formData, noOfUnit: e.target.value })}
                            />
                            <FormInput
                                label="Unit Capacity"
                                required
                                type="number"
                                value={formData.unitCapacity || ''}
                                onChange={(e) => setFormData({ ...formData, unitCapacity: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Entrepreneurial Establishment Cost/unit (Rs.) */}
                    <div>
                        <h3 className="text-xl font-bold text-[#487749] mb-6">Entrepreneurial Establishment Cost/unit (Rs.)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormInput
                                label="Fixed cost"
                                required
                                type="number"
                                value={formData.fixedCost || ''}
                                onChange={(e) => setFormData({ ...formData, fixedCost: e.target.value })}
                            />
                            <FormInput
                                label="Variable cost"
                                required
                                type="number"
                                value={formData.variableCost || ''}
                                onChange={(e) => setFormData({ ...formData, variableCost: e.target.value })}
                            />
                            <FormInput
                                label="total production/unit/year"
                                required
                                type="number"
                                value={formData.totalProductionPerUnit || ''}
                                onChange={(e) => setFormData({ ...formData, totalProductionPerUnit: e.target.value })}
                            />
                            <FormInput
                                label="Gross cost of production/unit/ year (Rs.)"
                                required
                                type="number"
                                value={formData.grossCost || ''}
                                onChange={(e) => setFormData({ ...formData, grossCost: e.target.value })}
                            />
                            <FormInput
                                label="gross values of production/unit/ year (Rs.)"
                                required
                                type="number"
                                value={formData.grossValue || ''}
                                onChange={(e) => setFormData({ ...formData, grossValue: e.target.value })}
                            />
                            <FormInput
                                label="net benefit / unit/ year (Rs.)"
                                required
                                type="number"
                                value={formData.netBenefit || ''}
                                onChange={(e) => setFormData({ ...formData, netBenefit: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Employment generated/ year (man-day @ 8 hrs/ day) */}
                    <div>
                        <h3 className="text-xl font-bold text-[#487749] mb-6">Employment generated/ year (man-day @ 8 hrs/ day)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormInput
                                label="Family"
                                required
                                type="number"
                                value={formData.employmentFamily || ''}
                                onChange={(e) => setFormData({ ...formData, employmentFamily: e.target.value })}
                            />
                            <FormInput
                                label="Other than family"
                                required
                                type="number"
                                value={formData.employmentOther || ''}
                                onChange={(e) => setFormData({ ...formData, employmentOther: e.target.value })}
                            />
                            <FormInput
                                label="No. of persons visited entrepreneur unit"
                                required
                                type="number"
                                value={formData.personsVisited || ''}
                                onChange={(e) => setFormData({ ...formData, personsVisited: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
