import React from 'react'
import { ENTITY_TYPES } from '../../../../../constants/entityTypes'
import { FormInput, FormSelect } from '../shared/FormComponents'

interface CsisaFormsProps {
    entityType: string
    formData: any
    setFormData: (data: any) => void
    years: any[]
}

export const CsisaForms: React.FC<CsisaFormsProps> = ({
    entityType,
    formData,
    setFormData,
    years
}) => {
    return (
        <>
            {entityType === ENTITY_TYPES.PROJECT_CSISA && (
                <div className="space-y-10">
                    {/* Header Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormSelect
                            label="Reporting Year"
                            required
                            value={formData.yearId || ''}
                            onChange={(e) => setFormData({ ...formData, yearId: parseInt(e.target.value) })}
                            options={years.map((y: any) => ({ value: y.id || y.yearId, label: y.yearName }))}
                        />
                        <FormInput
                            label="Season"
                            required
                            value={formData.season || ''}
                            onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                        />
                        <FormInput
                            label="Village Covered(no.)"
                            required
                            type="number"
                            value={formData.villageCovered || ''}
                            onChange={(e) => setFormData({ ...formData, villageCovered: e.target.value })}
                        />
                        <FormInput
                            label="Block Covered(no.)"
                            required
                            type="number"
                            value={formData.blockCovered || ''}
                            onChange={(e) => setFormData({ ...formData, blockCovered: e.target.value })}
                        />
                        <FormInput
                            label="District Covered(no.)"
                            required
                            type="number"
                            value={formData.districtCovered || ''}
                            onChange={(e) => setFormData({ ...formData, districtCovered: e.target.value })}
                        />
                        <FormInput
                            label="Respondent(no.)"
                            required
                            type="number"
                            value={formData.respondent || ''}
                            onChange={(e) => setFormData({ ...formData, respondent: e.target.value })}
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
                            value={formData.areaCovered || ''}
                            onChange={(e) => setFormData({ ...formData, areaCovered: e.target.value })}
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
                                value={formData.techOptions || ''}
                                onChange={(e) => setFormData({ ...formData, techOptions: e.target.value })}
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
                                onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
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
                                onChange={(e) => setFormData({ ...formData, daysOfMaturity: e.target.value })}
                            />
                            <FormInput
                                label="Grain Yield(q/ha)"
                                required
                                type="number"
                                value={formData.grainYield || ''}
                                onChange={(e) => setFormData({ ...formData, grainYield: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FormInput
                                label="Cost of Cultivation(Rs/ha)"
                                required
                                type="number"
                                value={formData.costOfCultivation || ''}
                                onChange={(e) => setFormData({ ...formData, costOfCultivation: e.target.value })}
                            />
                            <FormInput
                                label="Gross Return(Rs/ha)"
                                required
                                type="number"
                                value={formData.grossReturn || ''}
                                onChange={(e) => setFormData({ ...formData, grossReturn: e.target.value })}
                            />
                            <FormInput
                                label="Net Return(Rs/ha)"
                                required
                                type="number"
                                value={formData.netReturn || ''}
                                onChange={(e) => setFormData({ ...formData, netReturn: e.target.value })}
                            />
                            <FormInput
                                label="BCR"
                                required
                                type="number"
                                step="0.01"
                                value={formData.bcr || ''}
                                onChange={(e) => setFormData({ ...formData, bcr: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
