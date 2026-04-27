import React from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { FormInput } from '../shared/FormComponents'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { createMasterDataOptions } from '@/utils/formHelpers'
import { FormAttachmentSection } from '@/components/common/FormAttachmentSection'

const ARYA_CURRENT_FORM_CODE = 'arya_current_year'

interface AryaFormsProps {
    entityType: string
    formData: any
    setFormData: (data: any) => void
    aryaEnterprises: any[]
}

export const AryaForms: React.FC<AryaFormsProps> = ({
    entityType,
    formData,
    setFormData,
    aryaEnterprises,
}) => {
    const handleAttachmentIds = React.useCallback(
        (ids: number[]) => setFormData((prev: any) => ({ ...prev, attachmentIds: ids })),
        [setFormData],
    )

    const recordId = formData?.aryaCurrentYearId ?? formData?.id ?? null
    const kvkId = formData?.kvkId ?? null

    const renderPhotoSection = () => (
        <FormAttachmentSection
            title="Images"
            formCode={ARYA_CURRENT_FORM_CODE}
            kind="PHOTO"
            kvkId={kvkId}
            recordId={recordId}
            showCaption
            initialAttachments={formData?.photos}
            onAttachmentIdsChange={handleAttachmentIds}
        />
    )

    return (
        <>
            {entityType === ENTITY_TYPES.PROJECT_ARYA_CURRENT && (
                <div className="space-y-10">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Basic Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Reporting Year"
                                required
                                type="date"
                                value={formData.reportingYear || ''}
                                onChange={(e) => setFormData((prev: any) => ({ ...prev, reportingYear: e.target.value }))}
                            />
                            <MasterDataDropdown
                                label="Name of enterprises"
                                required
                                value={formData.enterpriseId || ''}
                                onChange={(value) => setFormData((prev: any) => ({ ...prev, enterpriseId: value }))}
                                options={createMasterDataOptions(aryaEnterprises, 'enterpriseId', 'enterpriseName')}
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">No. of entrepreneurial units established</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput label="Male" type="number" required value={formData.unitsMale || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, unitsMale: parseInt(e.target.value) || 0 }))} />
                            <FormInput label="Female" type="number" required value={formData.unitsFemale || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, unitsFemale: parseInt(e.target.value) || 0 }))} />
                            <FormInput label="Viable units" type="number" required value={formData.viableUnits || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, viableUnits: parseInt(e.target.value) || 0 }))} />
                            <FormInput label="Closed units" type="number" required value={formData.closedUnits || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, closedUnits: parseInt(e.target.value) || 0 }))} />
                            <FormInput label="No. of Training conducted" type="number" required value={formData.trainingsConducted || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, trainingsConducted: parseInt(e.target.value) || 0 }))} />
                            <FormInput label="Start Date" type="date" required value={formData.startDate || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, startDate: e.target.value }))} />
                            <FormInput label="End Date" type="date" required value={formData.endDate || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, endDate: e.target.value }))} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">No. of rural youth trained</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput label="Male" type="number" required value={formData.youthMale || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, youthMale: parseInt(e.target.value) || 0 }))} />
                            <FormInput label="Female" type="number" required value={formData.youthFemale || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, youthFemale: parseInt(e.target.value) || 0 }))} />
                            <FormInput label="No. of Groups Formed" type="number" required value={formData.groupsFormed || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, groupsFormed: parseInt(e.target.value) || 0 }))} />
                            <FormInput label="No. of Groups active" type="number" required value={formData.groupsActive || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, groupsActive: parseInt(e.target.value) || 0 }))} />
                            <FormInput label="No. of person left the group" type="number" required value={formData.personsLeftGroup || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, personsLeftGroup: parseInt(e.target.value) || 0 }))} />
                            <FormInput label="No. of Members in each Group" type="number" required value={formData.membersPerGroup || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, membersPerGroup: parseInt(e.target.value) || 0 }))} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Financial Impact</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput label="Average size of each unit (agro rental unit)" type="number" required value={formData.avgSizeOfUnit || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, avgSizeOfUnit: parseFloat(e.target.value) || 0 }))} />
                            <FormInput label="Total Production unit/year" type="number" required value={formData.totalProductionPerYear || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, totalProductionPerYear: parseFloat(e.target.value) || 0 }))} />
                            <FormInput label="Per unit cost of Production" type="number" required value={formData.perUnitCostOfProduction || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, perUnitCostOfProduction: parseFloat(e.target.value) || 0 }))} />
                            <FormInput label="Sale value of Produce" type="number" required value={formData.saleValueOfProduce || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, saleValueOfProduce: parseFloat(e.target.value) || 0 }))} />
                            <FormInput label="Employment generated (man-days)" type="number" required value={formData.employmentGeneratedMandays || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, employmentGeneratedMandays: parseFloat(e.target.value) || 0 }))} />
                        </div>
                        <div className="mt-6">{renderPhotoSection()}</div>
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_ARYA_EVALUATION && (
                <div className="space-y-10">
                    <div>
                        <h3 className="text-xl font-bold text-[#487749] mb-6">Basic Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormInput
                                label="Reporting Year"
                                required
                                type="date"
                                value={formData.reportingYear || ''}
                                onChange={(e) => setFormData((prev: any) => ({ ...prev, reportingYear: e.target.value }))}
                            />
                            <MasterDataDropdown
                                label="Name of enterprises"
                                required
                                value={formData.enterpriseId || ''}
                                onChange={(value) => setFormData((prev: any) => ({ ...prev, enterpriseId: value }))}
                                options={createMasterDataOptions(aryaEnterprises, 'enterpriseId', 'enterpriseName')}
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-[#487749] mb-6">No. of entrepreneurial units established</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormInput label="Male" type="number" required value={formData.unitsMale || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, unitsMale: parseInt(e.target.value) || 0 }))} />
                            <FormInput label="Female" type="number" required value={formData.unitsFemale || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, unitsFemale: parseInt(e.target.value) || 0 }))} />
                            <FormInput label="No. of non-functional entrepreneurial unit closed" type="number" required value={formData.nonFunctionalUnitsClosed || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, nonFunctionalUnitsClosed: parseInt(e.target.value) || 0 }))} />
                            <FormInput label="Date of Closing" type="date" required value={formData.dateOfClosing || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, dateOfClosing: e.target.value }))} />
                            <FormInput label="No. of non-functional entrepreneurial unit restarted (i.e. Previously closed)" type="number" required value={formData.nonFunctionalUnitsRestarted || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, nonFunctionalUnitsRestarted: parseInt(e.target.value) || 0 }))} />
                            <FormInput label="Date of restart" type="date" required value={formData.dateOfRestart || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, dateOfRestart: e.target.value }))} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-[#487749] mb-6">Entrepreneurial Unit Size related to production capacity/ year (Production (Kg/unit))</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormInput label="No. of unit" type="number" required value={formData.numberOfUnits || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, numberOfUnits: parseInt(e.target.value) || 0 }))} />
                            <FormInput label="Unit Capacity" type="number" required value={formData.unitCapacity || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, unitCapacity: parseFloat(e.target.value) || 0 }))} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-[#487749] mb-6">Entrepreneurial Establishment Cost/unit (Rs.)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormInput label="Fixed cost" type="number" required value={formData.fixedCost || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, fixedCost: parseFloat(e.target.value) || 0 }))} />
                            <FormInput label="Variable cost" type="number" required value={formData.variableCost || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, variableCost: parseFloat(e.target.value) || 0 }))} />
                            <FormInput label="total production/unit/year" type="number" required value={formData.totalProductionPerUnitYear || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, totalProductionPerUnitYear: parseFloat(e.target.value) || 0 }))} />
                            <FormInput label="Gross cost of production/unit/ year (Rs.)" type="number" required value={formData.grossCostPerUnitYear || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, grossCostPerUnitYear: parseFloat(e.target.value) || 0 }))} />
                            <FormInput label="gross values of production/unit/ year (Rs.)" type="number" required value={formData.grossReturnPerUnitYear || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, grossReturnPerUnitYear: parseFloat(e.target.value) || 0 }))} />
                            <FormInput label="net benefit / unit/ year (Rs.)" type="number" required value={formData.netBenefitPerUnitYear || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, netBenefitPerUnitYear: parseFloat(e.target.value) || 0 }))} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-[#487749] mb-6">Employment generated/ year (man-day @ 8 hrs/ day)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormInput label="Family" type="number" required value={formData.employmentFamilyMandays || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, employmentFamilyMandays: parseFloat(e.target.value) || 0 }))} />
                            <FormInput label="Other than family" type="number" required value={formData.employmentOtherMandays || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, employmentOtherMandays: parseFloat(e.target.value) || 0 }))} />
                            <FormInput label="No. of persons visited entrepreneur unit" type="number" required value={formData.personsVisitedUnit || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, personsVisitedUnit: parseInt(e.target.value) || 0 }))} />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
