import React from 'react'
import { ENTITY_TYPES } from '../../../../../constants/entityTypes'
import { FormInput, FormSelect } from '../shared/FormComponents'
import { ExtendedEntityType } from '../../../../../utils/masterUtils'

interface DrmrFormsProps {
    entityType: ExtendedEntityType
    formData: any
    setFormData: (data: any) => void
    YearSelect: React.FC
}

export const DrmrForms: React.FC<DrmrFormsProps> = ({
    entityType,
    formData,
    setFormData,
    YearSelect,
}) => {
    return (
        <>
            {entityType === ENTITY_TYPES.PROJECT_DRMR_DETAILS && (
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-[#487749] pb-2 border-b border-[#E8F5E9]">
                        Create Augmenting Rapeseed- Mustard Production of Tribal Farmers of Jharkhand state for Sustainable Livelihood Security under Scheduled Tribe Component
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <YearSelect />
                        <FormInput
                            label="Varieties/Technology Demonstrated in Improved Practice"
                            required
                            value={formData.varietiesDemonstrated || ''}
                            onChange={(e) => setFormData({ ...formData, varietiesDemonstrated: e.target.value })}
                        />

                        <FormSelect
                            label="Situations (Irrigated/Rainfed)"
                            required
                            value={formData.situation || ''}
                            options={[
                                { value: 'Irrigated', label: 'Irrigated' },
                                { value: 'Rainfed', label: 'Rainfed' }
                            ]}
                            onChange={(e) => setFormData({ ...formData, situation: e.target.value })}
                        />
                        <FormInput
                            label="Varieties used in Farmer Practise"
                            required
                            value={formData.varietiesFarmerPractice || ''}
                            onChange={(e) => setFormData({ ...formData, varietiesFarmerPractice: e.target.value })}
                        />

                        {/* Yield Section */}
                        <FormInput
                            label="Yield Improved Practice(Kg/ha)"
                            type="number"
                            required
                            value={formData.yieldImproved || ''}
                            onChange={(e) => setFormData({ ...formData, yieldImproved: e.target.value })}
                        />
                        <FormInput
                            label="Yield Farmer Practise(kg/ha)"
                            type="number"
                            required
                            value={formData.yieldFarmer || ''}
                            onChange={(e) => setFormData({ ...formData, yieldFarmer: e.target.value })}
                        />
                        <FormInput
                            label="Yield Increase(%)"
                            type="number"
                            required
                            value={formData.yieldIncrease || ''}
                            onChange={(e) => setFormData({ ...formData, yieldIncrease: e.target.value })}
                        />

                        {/* Cost Section */}
                        <FormInput
                            label="Cost of Cultivation Improved Practice(Rs./ha)"
                            type="number"
                            required
                            value={formData.costCultivationImproved || ''}
                            onChange={(e) => setFormData({ ...formData, costCultivationImproved: e.target.value })}
                        />
                        <FormInput
                            label="Cost of Cultivation Farmer Practice(Rs./ha)"
                            type="number"
                            required
                            value={formData.costCultivationFarmer || ''}
                            onChange={(e) => setFormData({ ...formData, costCultivationFarmer: e.target.value })}
                        />
                        <FormInput
                            label="Gross Return Improved Practice(Rs./ha)"
                            type="number"
                            required
                            value={formData.grossReturnImproved || ''}
                            onChange={(e) => setFormData({ ...formData, grossReturnImproved: e.target.value })}
                        />
                        <FormInput
                            label="Gross Return Farmer Practice(Rs./ha)"
                            type="number"
                            required
                            value={formData.grossReturnFarmer || ''}
                            onChange={(e) => setFormData({ ...formData, grossReturnFarmer: e.target.value })}
                        />
                        <FormInput
                            label="Net Return Improved Practice(Rs./ha)"
                            type="number"
                            required
                            value={formData.netReturnImproved || ''}
                            onChange={(e) => setFormData({ ...formData, netReturnImproved: e.target.value })}
                        />
                        <FormInput
                            label="Net Return Farmer Practice(Rs./ha)"
                            type="number"
                            required
                            value={formData.netReturnFarmer || ''}
                            onChange={(e) => setFormData({ ...formData, netReturnFarmer: e.target.value })}
                        />
                        <FormInput
                            label="B:C ratio Improved Practice"
                            type="number"
                            step="0.01"
                            required
                            value={formData.bcRatioImproved || ''}
                            onChange={(e) => setFormData({ ...formData, bcRatioImproved: e.target.value })}
                        />
                        <FormInput
                            label="B:C ratio Farmer Practice"
                            type="number"
                            step="0.01"
                            required
                            value={formData.bcRatioFarmer || ''}
                            onChange={(e) => setFormData({ ...formData, bcRatioFarmer: e.target.value })}
                        />
                    </div>
                </div>
            )}

            {/* DRMR Activity Form */}
            {entityType === ENTITY_TYPES.PROJECT_DRMR_ACTIVITY && (
                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border-b border-[#E8F5E9] pb-2">
                            <h3 className="text-lg font-semibold text-[#487749]">Add DRMR Activity</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <YearSelect />
                            <FormInput
                                label="Total Budget Utilized"
                                type="number"
                                value={formData.totalBudgetUtilized || ''}
                                onChange={(e) => setFormData({ ...formData, totalBudgetUtilized: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Helper to render rows */}
                    {(() => {
                        const ActivityRow = ({ label, prefix }: { label: string, prefix: string }) => (
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 mb-4">
                                <h4 className="font-medium text-gray-700 mb-3">{label}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <FormInput
                                        label="Number/Quantity"
                                        type="number"
                                        placeholder="No."
                                        value={formData[`${prefix}_physical`] || ''}
                                        onChange={(e) => setFormData({ ...formData, [`${prefix}_physical`]: e.target.value })}
                                        className="bg-white"
                                    />
                                    <FormInput
                                        label="Beneficiaries (SC)"
                                        type="number"
                                        placeholder="SC"
                                        value={formData[`${prefix}_sc`] || ''}
                                        onChange={(e) => setFormData({ ...formData, [`${prefix}_sc`]: e.target.value })}
                                        className="bg-white"
                                    />
                                    <FormInput
                                        label="Beneficiaries (ST)"
                                        type="number"
                                        placeholder="ST"
                                        value={formData[`${prefix}_st`] || ''}
                                        onChange={(e) => setFormData({ ...formData, [`${prefix}_st`]: e.target.value })}
                                        className="bg-white"
                                    />
                                    <FormInput
                                        label="Beneficiaries (Gen/Others)"
                                        type="number"
                                        placeholder="Gen/Other"
                                        value={formData[`${prefix}_other`] || ''}
                                        onChange={(e) => setFormData({ ...formData, [`${prefix}_other`]: e.target.value })}
                                        className="bg-white"
                                    />
                                </div>
                            </div>
                        )

                        return (
                            <div className="space-y-6">
                                <ActivityRow label="Training" prefix="training" />
                                <ActivityRow label="Frontline Demonstrations (FLD) and other Demonstrations" prefix="fld" />
                                <ActivityRow label="Awareness Camps" prefix="awarenessCamps" />

                                <div className="mt-8">
                                    <h3 className="text-md font-bold text-[#2E7D32] mb-4 border-b pb-1">Input Demonstration</h3>
                                    <ActivityRow label="Improved Seeds" prefix="input_seeds" />
                                    <ActivityRow label="Small Equipment (less than Rs 2000)" prefix="input_smallEquip" />
                                    <ActivityRow label="Large Equipment (more than Rs 2000)" prefix="input_largeEquip" />
                                    <ActivityRow label="Fertilizers / Bio-fertilizers / Bio-pesticides" prefix="input_fertilizers" />
                                    <ActivityRow label="Pesticides / Insecticides / Fungicides" prefix="input_pesticides" />
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 mb-4">
                                        <FormInput
                                            label="Any other (specify name)"
                                            className="mb-2 bg-white"
                                            value={formData.input_other_name || ''}
                                            onChange={(e) => setFormData({ ...formData, input_other_name: e.target.value })}
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                                            <FormInput label="Number/Quantity" type="number" value={formData.input_other_physical || ''} onChange={(e) => setFormData({ ...formData, input_other_physical: e.target.value })} className="bg-white" />
                                            <FormInput label="Beneficiaries (SC)" type="number" value={formData.input_other_sc || ''} onChange={(e) => setFormData({ ...formData, input_other_sc: e.target.value })} className="bg-white" />
                                            <FormInput label="Beneficiaries (ST)" type="number" value={formData.input_other_st || ''} onChange={(e) => setFormData({ ...formData, input_other_st: e.target.value })} className="bg-white" />
                                            <FormInput label="Beneficiaries (Gen/Others)" type="number" value={formData.input_other_other || ''} onChange={(e) => setFormData({ ...formData, input_other_other: e.target.value })} className="bg-white" />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <h3 className="text-md font-bold text-[#2E7D32] mb-4 border-b pb-1">Extension Activities</h3>
                                    <ActivityRow label="Field Visit / Diagnostic Visits" prefix="ext_fieldVisit" />
                                    <ActivityRow label="Farmer Scientist Interaction" prefix="ext_interaction" />
                                    <ActivityRow label="Distribution of Literature" prefix="ext_literature" />
                                    <ActivityRow label="Kisan Mela" prefix="ext_kisanMela" />
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 mb-4">
                                        <FormInput
                                            label="Any other (specify name)"
                                            className="mb-2 bg-white"
                                            value={formData.ext_other_name || ''}
                                            onChange={(e) => setFormData({ ...formData, ext_other_name: e.target.value })}
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                                            <FormInput label="Number/Quantity" type="number" value={formData.ext_other_physical || ''} onChange={(e) => setFormData({ ...formData, ext_other_physical: e.target.value })} className="bg-white" />
                                            <FormInput label="Beneficiaries (SC)" type="number" value={formData.ext_other_sc || ''} onChange={(e) => setFormData({ ...formData, ext_other_sc: e.target.value })} className="bg-white" />
                                            <FormInput label="Beneficiaries (ST)" type="number" value={formData.ext_other_st || ''} onChange={(e) => setFormData({ ...formData, ext_other_st: e.target.value })} className="bg-white" />
                                            <FormInput label="Beneficiaries (Gen/Others)" type="number" value={formData.ext_other_other || ''} onChange={(e) => setFormData({ ...formData, ext_other_other: e.target.value })} className="bg-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })()}
                </div>
            )}
        </>
    )
}
