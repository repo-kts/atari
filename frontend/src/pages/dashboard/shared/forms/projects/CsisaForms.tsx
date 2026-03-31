import React from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { FormInput } from '../shared/FormComponents'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { createMasterDataOptions } from '@/utils/formHelpers'

interface CsisaFormsProps {
    entityType: string
    formData: any
    setFormData: (data: any) => void
    seasons: any[]
}

export const CsisaForms: React.FC<CsisaFormsProps> = ({
    entityType,
    formData,
    setFormData,
    seasons = []
}) => {
    return (
        <>
            {entityType === ENTITY_TYPES.PROJECT_CSISA && (
                <div className="space-y-10">
                    {/* Header Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Reporting Year"
                            required
                            type="date"
                            value={formData.reportingYear || ''}
                            onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
                        />
                        <MasterDataDropdown
                            label="Season"
                            required
                            value={formData.seasonId || ''}
                            onChange={(value) => setFormData({ ...formData, seasonId: value })}
                            options={createMasterDataOptions(seasons, 'seasonId', 'seasonName')}
                            emptyMessage="No seasons available"
                        />
                        <FormInput
                            label="Village Covered(no.)"
                            required
                            type="number"
                            value={formData.villagesCovered || ''}
                            onChange={(e) => setFormData({ ...formData, villagesCovered: parseInt(e.target.value) || 0 })}
                        />
                        <FormInput
                            label="Block Covered(no.)"
                            required
                            type="number"
                            value={formData.blocksCovered || ''}
                            onChange={(e) => setFormData({ ...formData, blocksCovered: parseInt(e.target.value) || 0 })}
                        />
                        <FormInput
                            label="District Covered(no.)"
                            required
                            type="number"
                            value={formData.districtsCovered || ''}
                            onChange={(e) => setFormData({ ...formData, districtsCovered: parseInt(e.target.value) || 0 })}
                        />
                        <FormInput
                            label="Respondent(no.)"
                            required
                            type="number"
                            value={formData.respondents || ''}
                            onChange={(e) => setFormData({ ...formData, respondents: parseInt(e.target.value) || 0 })}
                        />
                        <FormInput
                            label="Trall Name"
                            required
                            value={formData.trialName || ''}
                            onChange={(e) => setFormData({ ...formData, trialName: e.target.value })}
                        />
                        <FormInput
                            label="Area Covered(ha)"
                            required
                            type="number"
                            value={formData.areaCoveredHa || ''}
                            onChange={(e) => setFormData({ ...formData, areaCoveredHa: parseFloat(e.target.value) || 0 })}
                        />
                    </div>

                    {/* Crop Details Section */}
                    <div className="p-8 border border-gray-100 rounded-2xl bg-white shadow-sm space-y-8">
                        <h3 className="text-xl font-bold text-[#487749]">Crop Details</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FormInput
                                label="Name of Crop"
                                required
                                value={formData.cropName || ''}
                                onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                            />
                            <FormInput
                                label="Technology Options"
                                required
                                value={formData.technologyOption || ''}
                                onChange={(e) => setFormData({ ...formData, technologyOption: e.target.value })}
                            />
                            <FormInput
                                label="Variety Name"
                                required
                                value={formData.varietyName || ''}
                                onChange={(e) => setFormData({ ...formData, varietyName: e.target.value })}
                            />
                            <FormInput
                                label="Duration(Days)"
                                required
                                type="number"
                                value={formData.durationDays || ''}
                                onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) || 0 })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FormInput
                                label="Sowing Date"
                                required
                                type="date"
                                value={formData.sowingDate || ''}
                                onChange={(e) => setFormData({ ...formData, sowingDate: e.target.value })}
                            />
                            <FormInput
                                label="Harvesting Date"
                                required
                                type="date"
                                value={formData.harvestingDate || ''}
                                onChange={(e) => setFormData({ ...formData, harvestingDate: e.target.value })}
                            />
                            <FormInput
                                label="Days of Maturity"
                                required
                                type="number"
                                value={formData.daysOfMaturity || ''}
                                onChange={(e) => setFormData({ ...formData, daysOfMaturity: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="Grain Yield(q/ha)"
                                required
                                type="number"
                                value={formData.grainYieldQPerHa || ''}
                                onChange={(e) => setFormData({ ...formData, grainYieldQPerHa: parseFloat(e.target.value) || 0 })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FormInput
                                label="Cost of Cultivation(Rs/ha)"
                                required
                                type="number"
                                value={formData.costOfCultivation || ''}
                                onChange={(e) => setFormData({ ...formData, costOfCultivation: parseFloat(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="Gross Return(Rs/ha)"
                                required
                                type="number"
                                value={formData.grossReturn || ''}
                                onChange={(e) => setFormData({ ...formData, grossReturn: parseFloat(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="Net Return(Rs/ha)"
                                required
                                type="number"
                                value={formData.netReturn || ''}
                                onChange={(e) => setFormData({ ...formData, netReturn: parseFloat(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="BCR"
                                required
                                type="number"
                                step="0.01"
                                value={formData.bcr || ''}
                                onChange={(e) => setFormData({ ...formData, bcr: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
