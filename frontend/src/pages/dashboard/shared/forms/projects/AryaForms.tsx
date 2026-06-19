import React from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { FormInput } from '../shared/FormComponents'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { SpecifyOtherInput } from '@/components/common/SpecifyOtherInput'
import { useOtherSpecify } from '@/hooks/useOtherSpecify'
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

    // --- ARYA Current Year: Financial Impact labels vary by enterprise --------
    // The three quantity/rate fields below reuse generic DB columns
    // (avgSizeOfUnit, totalProductionPerYear, saleValueOfProduce); only their
    // labels change per selected enterprise. Unmapped enterprises (incl. the
    // "Others" catch-all) fall back to the generic default labels.
    const selectedEnterpriseName = React.useMemo(() => {
        const match = (aryaEnterprises as any[]).find(
            (e: any) => String(e.enterpriseId) === String(formData.enterpriseId ?? ''),
        )
        return String(match?.enterpriseName || '').trim()
    }, [aryaEnterprises, formData.enterpriseId])

    const DEFAULT_FINANCIAL_LABELS = {
        sizeLabel: 'Average size of each unit (agro rental unit)',
        productionLabel: 'Total Production unit/year',
        saleLabel: 'Sale value of Produce',
    }
    const ENTERPRISE_FINANCIAL_LABELS: Record<
        string,
        { sizeLabel: string; productionLabel: string; saleLabel: string }
    > = {
        'Pig Farming': {
            sizeLabel: 'No. of Sow+Boar',
            productionLabel: 'Adult or Piglet or Pork',
            saleLabel: 'Rs/Pig , Rs/Piglet , Rs./ Kg Meat',
        },
        'Goat Farming': {
            sizeLabel: 'No. of Goat',
            productionLabel: 'No. of Goat or Young Goat or Meat or Manure',
            saleLabel: 'Rs/Goat , Rs/Young Goat , Rs/Kg Meat',
        },
        'Poultry Farming': {
            sizeLabel: 'No. of Birds or chicks',
            productionLabel: 'Birds or Kg or Eggs',
            saleLabel: 'Rs/Kg,Rs/Egg,Rs/Bird',
        },
        'Quail Farming': {
            sizeLabel: 'No. of Birds or chicks',
            productionLabel: 'Birds or Kg or Eggs',
            saleLabel: 'Rs/Kg,Rs/Egg,Rs/Bird',
        },
        'Duck Farming': {
            sizeLabel: 'No. of Birds or chicks',
            productionLabel: 'Birds or Kg or Eggs',
            saleLabel: 'Rs/Kg,Rs/Egg,Rs/Bird',
        },
        'Fish Farming': {
            sizeLabel: 'Kg or No. of Finerlings',
            productionLabel: 'Kg or No. of Finerlings',
            saleLabel: 'Rs/Kg or Rs/Fingerling',
        },
        'Bee keeping': {
            sizeLabel: 'No. of Boxes',
            productionLabel: 'Honey or wax',
            saleLabel: 'Rs/Kg',
        },
        'Mushroom Production': {
            sizeLabel: 'No. of Bags',
            productionLabel: 'Kg',
            saleLabel: 'Rs/Kg',
        },
        'Banana Fibre Extraction': {
            sizeLabel: 'Kg/Saplings',
            productionLabel: 'Kg/Saplings',
            saleLabel: 'Rs/Kg',
        },
        'Seed Production': {
            sizeLabel: 'Kg/Saplings',
            productionLabel: 'Kg/Saplings',
            saleLabel: 'Rs/Kg',
        },
        'Nursery Management': {
            sizeLabel: 'No. of Seedlings/Saplings',
            productionLabel: 'No. of Seedlings/Saplings',
            saleLabel: 'Rs/Seedlings or Rs/Saplings',
        },
        'Processing and Value Addition(Product Name)': {
            sizeLabel: 'Kg or Lit',
            productionLabel: 'Kg or Lit',
            saleLabel: 'Rs/Kg or Rs/lit',
        },
        'Food Processing': {
            sizeLabel: 'Kg or Lit',
            productionLabel: 'Kg or Lit',
            saleLabel: 'Rs/Kg or Rs/lit',
        },
        'Lac Farming': {
            sizeLabel: 'No. of Trees',
            productionLabel: 'Brood Lac or Stick Lac',
            saleLabel: 'Rs/Kg Brood or Rs./Stick Lac',
        },
    }
    const financialLabels =
        ENTERPRISE_FINANCIAL_LABELS[selectedEnterpriseName] ?? DEFAULT_FINANCIAL_LABELS

    const enterpriseOptions = React.useMemo(
        () => createMasterDataOptions(aryaEnterprises, 'enterpriseId', 'enterpriseName', { flagKey: 'isOther' }),
        [aryaEnterprises]
    )
    const { isOtherSelected: isOtherEnterprise, otherResetPatch: enterpriseResetPatch } = useOtherSpecify(
        enterpriseOptions,
        formData.enterpriseId
    )

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
                                value={formData.reportingYear ?? ''}
                                onChange={(e) => setFormData((prev: any) => ({ ...prev, reportingYear: e.target.value }))}
                            />
                            <MasterDataDropdown
                                label="Name of enterprises"
                                required
                                value={formData.enterpriseId ?? ''}
                                onChange={(value) => setFormData((prev: any) => ({ ...prev, enterpriseId: value, ...enterpriseResetPatch(value, 'enterpriseOther') }))}
                                options={enterpriseOptions}
                            />
                            {isOtherEnterprise && (
                                <SpecifyOtherInput
                                    label="Please specify other enterprise"
                                    required
                                    value={formData.enterpriseOther}
                                    onChange={(e) => setFormData((prev: any) => ({ ...prev, enterpriseOther: e.target.value }))}
                                />
                            )}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">No. of entrepreneurial units established</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput label="Male" type="number" required value={formData.unitsMale ?? ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, unitsMale: e.target.value }))} />
                            <FormInput label="Female" type="number" required value={formData.unitsFemale ?? ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, unitsFemale: e.target.value }))} />
                            <FormInput label="Viable units" type="number" required value={formData.viableUnits ?? ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, viableUnits: e.target.value }))} />
                            <FormInput label="Closed units" type="number" required value={formData.closedUnits ?? ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, closedUnits: e.target.value }))} />
                            <FormInput label="No. of Training conducted" type="number" required value={formData.trainingsConducted ?? ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, trainingsConducted: e.target.value }))} />
                            <FormInput label="Start Date" type="date" required value={formData.startDate ?? ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, startDate: e.target.value }))} />
                            <FormInput label="End Date" type="date" required value={formData.endDate ?? ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, endDate: e.target.value }))} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">No. of rural youth trained</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput label="Male" type="number" required value={formData.youthMale ?? ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, youthMale: e.target.value }))} />
                            <FormInput label="Female" type="number" required value={formData.youthFemale ?? ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, youthFemale: e.target.value }))} />
                            <FormInput label="No. of Groups Formed" type="number" required value={formData.groupsFormed ?? ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, groupsFormed: e.target.value }))} />
                            <FormInput label="No. of Groups active" type="number" required value={formData.groupsActive ?? ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, groupsActive: e.target.value }))} />
                            <FormInput label="No. of person left the group" type="number" required value={formData.personsLeftGroup ?? ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, personsLeftGroup: e.target.value }))} />
                            <FormInput label="No. of Members in each Group" type="number" required value={formData.membersPerGroup ?? ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, membersPerGroup: e.target.value }))} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Financial Impact</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput label={financialLabels.sizeLabel} type="number" required value={formData.avgSizeOfUnit ?? ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, avgSizeOfUnit: e.target.value }))} />
                            <FormInput label={financialLabels.productionLabel} type="number" required value={formData.totalProductionPerYear ?? ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, totalProductionPerYear: e.target.value }))} />
                            <FormInput label="Per unit cost of Production" type="number" required value={formData.perUnitCostOfProduction ?? ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, perUnitCostOfProduction: e.target.value }))} />
                            <FormInput label={financialLabels.saleLabel} type="number" required value={formData.saleValueOfProduce ?? ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, saleValueOfProduce: e.target.value }))} />
                            <FormInput label="Employment generated (mandays)" type="number" required value={formData.employmentGeneratedMandays ?? ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, employmentGeneratedMandays: e.target.value }))} />
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
                                value={formData.reportingYear ?? ''}
                                onChange={(e) => setFormData((prev: any) => ({ ...prev, reportingYear: e.target.value }))}
                            />
                            <MasterDataDropdown
                                label="Name of enterprises"
                                required
                                value={formData.enterpriseId ?? ''}
                                onChange={(value) => setFormData((prev: any) => ({ ...prev, enterpriseId: value, ...enterpriseResetPatch(value, 'enterpriseOther') }))}
                                options={enterpriseOptions}
                            />
                            {isOtherEnterprise && (
                                <SpecifyOtherInput
                                    label="Please specify other enterprise"
                                    required
                                    value={formData.enterpriseOther}
                                    onChange={(e) => setFormData((prev: any) => ({ ...prev, enterpriseOther: e.target.value }))}
                                />
                            )}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-[#487749] mb-6">No. of entrepreneurial units established</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormInput label="Male" type="number" required value={formData.unitsMale ?? ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, unitsMale: e.target.value }))} />
                            <FormInput label="Female" type="number" required value={formData.unitsFemale ?? ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, unitsFemale: e.target.value }))} />
                            <FormInput label="No. of non-functional entrepreneurial unit closed" type="number" required value={formData.nonFunctionalUnitsClosed ?? ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, nonFunctionalUnitsClosed: e.target.value }))} />
                            <FormInput label="Date of Closing" type="date" required value={formData.dateOfClosing ?? ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, dateOfClosing: e.target.value }))} />
                            <FormInput label="No. of non-functional entrepreneurial unit restarted (i.e. Previously closed)" type="number" required value={formData.nonFunctionalUnitsRestarted ?? ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, nonFunctionalUnitsRestarted: e.target.value }))} />
                            <FormInput label="Date of restart" type="date" required value={formData.dateOfRestart ?? ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, dateOfRestart: e.target.value }))} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-[#487749] mb-6">Entrepreneurial Unit Size related to production capacity/ year (Production (Kg/unit))</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormInput label="No. of unit" type="number" required value={formData.numberOfUnits ?? ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, numberOfUnits: e.target.value }))} />
                            <FormInput label="Unit Capacity" type="number" required value={formData.unitCapacity ?? ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, unitCapacity: e.target.value }))} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-[#487749] mb-6">Entrepreneurial Establishment Cost/unit (Rs.)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormInput label="Fixed cost" type="number" required value={formData.fixedCost ?? ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, fixedCost: e.target.value }))} />
                            <FormInput label="Variable cost" type="number" required value={formData.variableCost ?? ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, variableCost: e.target.value }))} />
                            <FormInput label="total production/unit/year" type="number" required value={formData.totalProductionPerUnitYear ?? ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, totalProductionPerUnitYear: e.target.value }))} />
                            <FormInput label="Gross cost of production/unit/ year (Rs.)" type="number" required value={formData.grossCostPerUnitYear ?? ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, grossCostPerUnitYear: e.target.value }))} />
                            <FormInput label="gross values of production/unit/ year (Rs.)" type="number" required value={formData.grossReturnPerUnitYear ?? ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, grossReturnPerUnitYear: e.target.value }))} />
                            <FormInput label="net benefit / unit/ year (Rs.)" type="number" required value={formData.netBenefitPerUnitYear ?? ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, netBenefitPerUnitYear: e.target.value }))} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-[#487749] mb-6">Employment generated/ year (man-day @ 8 hrs/ day)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormInput label="Family" type="number" required value={formData.employmentFamilyMandays ?? ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, employmentFamilyMandays: e.target.value }))} />
                            <FormInput label="Other than family" type="number" required value={formData.employmentOtherMandays ?? ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, employmentOtherMandays: e.target.value }))} />
                            <FormInput label="No. of persons visited entrepreneur unit" type="number" required value={formData.personsVisitedUnit ?? ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, personsVisitedUnit: e.target.value }))} />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
