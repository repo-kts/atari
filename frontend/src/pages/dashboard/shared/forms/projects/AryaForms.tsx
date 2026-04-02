import React from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { FormInput } from '../shared/FormComponents'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { createMasterDataOptions } from '@/utils/formHelpers'

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
    aryaEnterprises
}) => {
    const todayYmd = new Date().toISOString().slice(0, 10)
    const handleFileChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({
                    ...formData,
                    [field]: reader.result as string
                })
            };
            reader.readAsDataURL(file);
        } else {
            setFormData({ ...formData, [field]: null })
        }
    }

    return (
        <>
            {entityType === ENTITY_TYPES.PROJECT_ARYA_CURRENT && (
                <div className="space-y-10">
                    {/* Basic Details */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Basic Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Reporting Year"
                                required
                                type="date"
                                value={formData.reportingYear ?? ''}
                                onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
                            />
                            <MasterDataDropdown
                                label="Name of enterprises"
                                required
                                value={formData.enterpriseId ?? ''}
                                onChange={(value) => setFormData({ ...formData, enterpriseId: value })}
                                options={createMasterDataOptions(aryaEnterprises, 'enterpriseId', 'enterpriseName')}
                                emptyMessage="No enterprises available. Please add them in Master Data > ARYA Enterprises first."
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
                                value={formData.unitsMale ?? ''}
                                onChange={(e) => setFormData({ ...formData, unitsMale: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="Female"
                                required
                                type="number"
                                value={formData.unitsFemale ?? ''}
                                onChange={(e) => setFormData({ ...formData, unitsFemale: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="Viable units"
                                required
                                type="number"
                                value={formData.viableUnits ?? ''}
                                onChange={(e) => setFormData({ ...formData, viableUnits: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="Closed units"
                                required
                                type="number"
                                value={formData.closedUnits ?? ''}
                                onChange={(e) => setFormData({ ...formData, closedUnits: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="No. of Training conducted"
                                required
                                type="number"
                                value={formData.trainingsConducted ?? ''}
                                onChange={(e) => setFormData({ ...formData, trainingsConducted: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="Start Date"
                                required
                                type="date"
                                value={formData.startDate ?? ''}
                                max={todayYmd}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />
                            <FormInput
                                label="End Date"
                                required
                                type="date"
                                value={formData.endDate ?? ''}
                                min={formData.startDate || undefined}
                                max={todayYmd}
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
                                value={formData.youthMale ?? ''}
                                onChange={(e) => setFormData({ ...formData, youthMale: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="Female"
                                required
                                type="number"
                                value={formData.youthFemale ?? ''}
                                onChange={(e) => setFormData({ ...formData, youthFemale: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="No. of Groups Formed"
                                required
                                type="number"
                                value={formData.groupsFormed ?? ''}
                                onChange={(e) => setFormData({ ...formData, groupsFormed: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="No. of Groups active"
                                required
                                type="number"
                                value={formData.groupsActive ?? ''}
                                onChange={(e) => setFormData({ ...formData, groupsActive: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="No. of person left the group"
                                required
                                type="number"
                                value={formData.personsLeftGroup ?? ''}
                                onChange={(e) => setFormData({ ...formData, personsLeftGroup: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="No. of Members in each Group"
                                required
                                type="number"
                                value={formData.membersPerGroup ?? ''}
                                onChange={(e) => setFormData({ ...formData, membersPerGroup: parseInt(e.target.value) || 0 })}
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
                                value={formData.avgSizeOfUnit ?? ''}
                                onChange={(e) => setFormData({ ...formData, avgSizeOfUnit: parseFloat(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="Total Production unit/year"
                                required
                                type="number"
                                value={formData.totalProductionPerYear ?? ''}
                                onChange={(e) => setFormData({ ...formData, totalProductionPerYear: parseFloat(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="Per unit cost of Production"
                                required
                                type="number"
                                value={formData.perUnitCostOfProduction ?? ''}
                                onChange={(e) => setFormData({ ...formData, perUnitCostOfProduction: parseFloat(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="Sale value of Produce"
                                required
                                type="number"
                                value={formData.saleValueOfProduce ?? ''}
                                onChange={(e) => setFormData({ ...formData, saleValueOfProduce: parseFloat(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="Employment generated (man-days)"
                                required
                                type="number"
                                value={formData.employmentGeneratedMandays ?? ''}
                                onChange={(e) => setFormData({ ...formData, employmentGeneratedMandays: parseFloat(e.target.value) || 0 })}
                            />
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-[#212121]">
                                    Images
                                </label>

                                {formData.imagePath && (
                                    <div className="mb-4">
                                        <p className="text-xs font-semibold text-[#487749] mb-2">Existing/Selected Image:</p>
                                        <div className="relative group w-32 h-32">
                                            <img
                                                src={formData.imagePath.startsWith('data:')
                                                    ? formData.imagePath
                                                    : `${import.meta.env.VITE_API_URL || ''}${formData.imagePath.startsWith('/') ? '' : '/'}${formData.imagePath}`}
                                                className="w-full h-full object-cover rounded-xl border-2 border-[#487749]/20 shadow-md transition-transform group-hover:scale-105"
                                                alt="Preview"
                                                onError={(e) => {
                                                    const img = e.target as HTMLImageElement;
                                                    img.style.display = 'none';
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, imagePath: null })}
                                                className="absolute -top-2 -right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 shadow-sm transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange('imagePath')}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-[#487749]/10 file:text-[#487749] hover:file:bg-[#487749]/20 transition-all border border-dashed border-[#487749]/30 p-4 rounded-2xl"
                                />
                                <p className="text-[11px] text-gray-400 italic">
                                    Supported formats: JPG, PNG, GIF. Max file size: 5MB.
                                </p>
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
                            <FormInput
                                label="Reporting Year"
                                required
                                type="date"
                                value={formData.reportingYear ?? ''}
                                onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
                            />
                            <MasterDataDropdown
                                label="Name of enterprises"
                                required
                                value={formData.enterpriseId ?? ''}
                                onChange={(value) => setFormData({ ...formData, enterpriseId: value })}
                                options={createMasterDataOptions(aryaEnterprises, 'enterpriseId', 'enterpriseName')}
                                emptyMessage="No enterprises available. Please add them in Master Data > ARYA Enterprises first."
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
                                value={formData.unitsMale ?? ''}
                                onChange={(e) => setFormData({ ...formData, unitsMale: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="Female"
                                required
                                type="number"
                                value={formData.unitsFemale ?? ''}
                                onChange={(e) => setFormData({ ...formData, unitsFemale: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="No. of non-functional entrepreneurial unit closed"
                                required
                                type="number"
                                value={formData.nonFunctionalUnitsClosed ?? ''}
                                onChange={(e) => setFormData({ ...formData, nonFunctionalUnitsClosed: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="Date of Closing"
                                required
                                type="date"
                                value={formData.dateOfClosing ?? ''}
                                onChange={(e) => setFormData({ ...formData, dateOfClosing: e.target.value })}
                            />
                            <FormInput
                                label="No. of non-functional entrepreneurial unit restarted (i.e. Previously closed)"
                                required
                                type="number"
                                value={formData.nonFunctionalUnitsRestarted ?? ''}
                                onChange={(e) => setFormData({ ...formData, nonFunctionalUnitsRestarted: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="Date of restart"
                                required
                                type="date"
                                value={formData.dateOfRestart ?? ''}
                                onChange={(e) => setFormData({ ...formData, dateOfRestart: e.target.value })}
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
                                value={formData.numberOfUnits ?? ''}
                                onChange={(e) => setFormData({ ...formData, numberOfUnits: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="Unit Capacity"
                                required
                                type="number"
                                value={formData.unitCapacity ?? ''}
                                onChange={(e) => setFormData({ ...formData, unitCapacity: parseFloat(e.target.value) || 0 })}
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
                                value={formData.fixedCost ?? ''}
                                onChange={(e) => setFormData({ ...formData, fixedCost: parseFloat(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="Variable cost"
                                required
                                type="number"
                                value={formData.variableCost ?? ''}
                                onChange={(e) => setFormData({ ...formData, variableCost: parseFloat(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="total production/unit/year"
                                required
                                type="number"
                                value={formData.totalProductionPerUnitYear ?? ''}
                                onChange={(e) => setFormData({ ...formData, totalProductionPerUnitYear: parseFloat(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="Gross cost of production/unit/ year (Rs.)"
                                required
                                type="number"
                                value={formData.grossCostPerUnitYear ?? ''}
                                onChange={(e) => setFormData({ ...formData, grossCostPerUnitYear: parseFloat(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="gross values of production/unit/ year (Rs.)"
                                required
                                type="number"
                                value={formData.grossReturnPerUnitYear ?? ''}
                                onChange={(e) => setFormData({ ...formData, grossReturnPerUnitYear: parseFloat(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="net benefit / unit/ year (Rs.)"
                                required
                                type="number"
                                value={formData.netBenefitPerUnitYear ?? ''}
                                onChange={(e) => setFormData({ ...formData, netBenefitPerUnitYear: parseFloat(e.target.value) || 0 })}
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
                                value={formData.employmentFamilyMandays ?? ''}
                                onChange={(e) => setFormData({ ...formData, employmentFamilyMandays: parseFloat(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="Other than family"
                                required
                                type="number"
                                value={formData.employmentOtherMandays ?? ''}
                                onChange={(e) => setFormData({ ...formData, employmentOtherMandays: parseFloat(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="No. of persons visited entrepreneur unit"
                                required
                                type="number"
                                value={formData.personsVisitedUnit ?? ''}
                                onChange={(e) => setFormData({ ...formData, personsVisitedUnit: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
