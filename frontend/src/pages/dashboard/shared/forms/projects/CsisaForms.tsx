import React from 'react'
import { ENTITY_TYPES } from '../../../../../constants/entityTypes'
import { FormInput } from '../shared/FormComponents'
import { ExtendedEntityType } from '../../../../../utils/masterUtils'

interface CsisaFormsProps {
    entityType: ExtendedEntityType
    formData: any
    setFormData: (data: any) => void
    YearSelect: React.FC
}

export const CsisaForms: React.FC<CsisaFormsProps> = ({
    entityType,
    formData,
    setFormData,
    YearSelect,
}) => {
    return (
        <>
            {entityType === ENTITY_TYPES.PROJECT_CSISA && (
                <div className="space-y-8">
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#487749] pb-2 border-b border-[#E8F5E9]">Create CSISA</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <YearSelect />
                            <FormInput
                                label="Season"
                                required
                                value={formData.season || ''}
                                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                            />
                            <FormInput
                                label="Village Covered(no.)"
                                type="number"
                                required
                                value={formData.villagesCovered || ''}
                                onChange={(e) => setFormData({ ...formData, villagesCovered: e.target.value })}
                            />
                            <FormInput
                                label="Block Covered(no.)"
                                type="number"
                                required
                                value={formData.blocksCovered || ''}
                                onChange={(e) => setFormData({ ...formData, blocksCovered: e.target.value })}
                            />
                            <FormInput
                                label="District Covered(no.)"
                                type="number"
                                required
                                value={formData.districtsCovered || ''}
                                onChange={(e) => setFormData({ ...formData, districtsCovered: e.target.value })}
                            />
                            <FormInput
                                label="Respondent(no.)"
                                type="number"
                                required
                                value={formData.respondents || ''}
                                onChange={(e) => setFormData({ ...formData, respondents: e.target.value })}
                            />
                            <FormInput
                                label="Trail Name"
                                required
                                value={formData.trailName || ''}
                                onChange={(e) => setFormData({ ...formData, trailName: e.target.value })}
                            />
                            <FormInput
                                label="Area Covered(ha)"
                                type="number"
                                step="0.01"
                                required
                                value={formData.areaCovered || ''}
                                onChange={(e) => setFormData({ ...formData, areaCovered: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-[#2E7D32]">Crop Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <FormInput
                                label="Name of Crop"
                                required
                                value={formData.cropName || ''}
                                onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                            />
                            <FormInput
                                label="Technology Options"
                                required
                                value={formData.technologyOptions || ''}
                                onChange={(e) => setFormData({ ...formData, technologyOptions: e.target.value })}
                            />
                            <FormInput
                                label="Variety Name"
                                required
                                value={formData.varietyName || ''}
                                onChange={(e) => setFormData({ ...formData, varietyName: e.target.value })}
                            />
                            <FormInput
                                label="Duration(Days)"
                                type="number"
                                required
                                value={formData.durationDays || ''}
                                onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                            />
                            <FormInput
                                label="Sowing Date"
                                type="date"
                                required
                                value={formData.sowingDate || ''}
                                onChange={(e) => setFormData({ ...formData, sowingDate: e.target.value })}
                            />
                            <FormInput
                                label="Harvesting Date"
                                type="date"
                                required
                                value={formData.harvestingDate || ''}
                                onChange={(e) => setFormData({ ...formData, harvestingDate: e.target.value })}
                            />
                            <FormInput
                                label="Days of Maturity"
                                type="number"
                                required
                                value={formData.daysOfMaturity || ''}
                                onChange={(e) => setFormData({ ...formData, daysOfMaturity: e.target.value })}
                            />
                            <FormInput
                                label="Grain Yield(q/ha)"
                                type="number"
                                step="0.01"
                                required
                                value={formData.grainYield || ''}
                                onChange={(e) => setFormData({ ...formData, grainYield: e.target.value })}
                            />
                            <FormInput
                                label="Cost of Cultivation(Rs/ha)"
                                type="number"
                                required
                                value={formData.costOfCultivation || ''}
                                onChange={(e) => setFormData({ ...formData, costOfCultivation: e.target.value })}
                            />
                            <FormInput
                                label="Gross Return(Rs/ha)"
                                type="number"
                                required
                                value={formData.grossReturn || ''}
                                onChange={(e) => setFormData({ ...formData, grossReturn: e.target.value })}
                            />
                            <FormInput
                                label="Net Return(Rs/ha)"
                                type="number"
                                required
                                value={formData.netReturn || ''}
                                onChange={(e) => setFormData({ ...formData, netReturn: e.target.value })}
                            />
                            <FormInput
                                label="BCR"
                                type="number"
                                step="0.01"
                                required
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
