import React from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { FormInput } from '../shared/FormComponents'

interface DrmrFormsProps {
    entityType: string
    formData: any
    setFormData: (data: any) => void
    states: any[]
    districts: any[]
    kvks: any[]
}

const DemographicFields: React.FC<{
    prefix: string
    formData: any
    setFormData: (data: any) => void
}> = ({ prefix, formData, setFormData }) => {
    const handleChange = (field: string, value: string) => {
        setFormData({ ...formData, [`${prefix}${field}`]: value })
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <FormInput
                label="General_M"
                type="number"
                value={formData[`${prefix}general_m`] || ''}
                onChange={(e) => handleChange('general_m', e.target.value)}
            />
            <FormInput
                label="General_F"
                type="number"
                value={formData[`${prefix}general_f`] || ''}
                onChange={(e) => handleChange('general_f', e.target.value)}
            />
            <FormInput
                label="OBC_M"
                type="number"
                value={formData[`${prefix}obc_m`] || ''}
                onChange={(e) => handleChange('obc_m', e.target.value)}
            />
            <FormInput
                label="OBC_F"
                type="number"
                value={formData[`${prefix}obc_f`] || ''}
                onChange={(e) => handleChange('obc_f', e.target.value)}
            />
            <FormInput
                label="SC_M"
                type="number"
                value={formData[`${prefix}sc_m`] || ''}
                onChange={(e) => handleChange('sc_m', e.target.value)}
            />
            <FormInput
                label="SC_F"
                type="number"
                value={formData[`${prefix}sc_f`] || ''}
                onChange={(e) => handleChange('sc_f', e.target.value)}
            />
            <FormInput
                label="ST_M"
                type="number"
                value={formData[`${prefix}st_m`] || ''}
                onChange={(e) => handleChange('st_m', e.target.value)}
            />
            <FormInput
                label="ST_F"
                type="number"
                value={formData[`${prefix}st_f`] || ''}
                onChange={(e) => handleChange('st_f', e.target.value)}
            />
        </div>
    )
}

export const DrmrForms: React.FC<DrmrFormsProps> = ({
    entityType,
    formData,
    setFormData,
}) => {
    const todayYmd = new Date().toISOString().slice(0, 10)
    return (
        <>
            {entityType === ENTITY_TYPES.PROJECT_DRMR_DETAILS && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            label="Reporting Year"
                            required
                            type="date"
                            value={formData.reportingYear ?? ''}
                            onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
                        />
                        <FormInput
                            label="Varieties/Technology Demonstrated in Improved Practice"
                            required
                            value={formData.varietiesTechImproved ?? ''}
                            onChange={(e) => setFormData({ ...formData, varietiesTechImproved: e.target.value })}
                        />
                        <FormInput
                            label="Situations (Irrigated/Rainfed)"
                            required
                            value={formData.situations ?? ''}
                            onChange={(e) => setFormData({ ...formData, situations: e.target.value })}
                        />
                        <FormInput
                            label="Varieties used in Farmer Practise"
                            required
                            value={formData.varietiesFarmerPractise ?? ''}
                            onChange={(e) => setFormData({ ...formData, varietiesFarmerPractise: e.target.value })}
                        />
                        <FormInput
                            label="Yield Improved Practice(Kg/ha)"
                            required
                            type="number"
                            value={formData.yieldImproved ?? ''}
                            onChange={(e) => setFormData({ ...formData, yieldImproved: e.target.value })}
                        />
                        <FormInput
                            label="Yield Farmer Practise(Kg/ha)"
                            required
                            type="number"
                            value={formData.yieldFarmerPractise ?? ''}
                            onChange={(e) => setFormData({ ...formData, yieldFarmerPractise: e.target.value })}
                        />
                        <FormInput
                            label="Yield Increase(%)"
                            required
                            type="number"
                            value={formData.yieldIncreasePercent ?? ''}
                            onChange={(e) => setFormData({ ...formData, yieldIncreasePercent: e.target.value })}
                        />
                        <FormInput
                            label="Cost of Cultivation Improved Practice(Rs./ha)"
                            required
                            type="number"
                            value={formData.costImproved ?? ''}
                            onChange={(e) => setFormData({ ...formData, costImproved: e.target.value })}
                        />
                        <FormInput
                            label="Cost of Cultivation Farmer Practice(Rs./ha)"
                            required
                            type="number"
                            value={formData.costFarmerPractise ?? ''}
                            onChange={(e) => setFormData({ ...formData, costFarmerPractise: e.target.value })}
                        />
                        <FormInput
                            label="Gross Return Improved Practice(Rs./ha)"
                            required
                            type="number"
                            value={formData.grossReturnImproved ?? ''}
                            onChange={(e) => setFormData({ ...formData, grossReturnImproved: e.target.value })}
                        />
                        <FormInput
                            label="Gross Return Farmer Practice(Rs./ha)"
                            required
                            type="number"
                            value={formData.grossReturnFarmerPractise ?? ''}
                            onChange={(e) => setFormData({ ...formData, grossReturnFarmerPractise: e.target.value })}
                        />
                        <FormInput
                            label="Net Return Improved Practice(Rs./ha)"
                            required
                            type="number"
                            value={formData.netReturnImproved ?? ''}
                            onChange={(e) => setFormData({ ...formData, netReturnImproved: e.target.value })}
                        />
                        <FormInput
                            label="Net Return Farmer Practice(Rs./ha)"
                            required
                            type="number"
                            value={formData.netReturnFarmerPractise ?? ''}
                            onChange={(e) => setFormData({ ...formData, netReturnFarmerPractise: e.target.value })}
                        />
                        <FormInput
                            label="B:C ratio Improved Practice"
                            required
                            type="number"
                            step="0.01"
                            value={formData.bcRatioImproved ?? ''}
                            onChange={(e) => setFormData({ ...formData, bcRatioImproved: e.target.value })}
                        />
                        <FormInput
                            label="B:C ratio Farmer Practice"
                            required
                            type="number"
                            step="0.01"
                            value={formData.bcRatioFarmerPractise ?? ''}
                            onChange={(e) => setFormData({ ...formData, bcRatioFarmerPractise: e.target.value })}
                        />
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_DRMR_ACTIVITY && (
                <div className="space-y-12">
                    {/* Header Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
                        <FormInput
                            label="Reporting Year"
                            required
                            type="date"
                            value={formData.reportingYear ?? ''}
                            onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
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
                        <FormInput
                            label="Total Budget Utilized"
                            required
                            type="number"
                            value={formData.totalBudget ?? ''}
                            onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
                        />
                    </div>

                    {/* Training Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b border-gray-100 pb-2">Training</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Days"
                                required
                                type="number"
                                value={formData.training_count ?? ''}
                                onChange={(e) => setFormData({ ...formData, training_count: e.target.value })}
                            />
                            <FormInput
                                label="Unit"
                                required
                                value={formData.training_count_unit || 'Days'}
                                onChange={(e) => setFormData({ ...formData, training_count_unit: e.target.value })}
                                disabled
                            />
                        </div>
                        <DemographicFields prefix="training_count_" formData={formData} setFormData={setFormData} />
                    </div>

                    {/* FLD Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b border-gray-100 pb-2">Frontline Demonstration (FLD) and other Demonstrations</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Area under FLDs(Hectare)"
                                required
                                value={formData.fld_count ?? ''}
                                onChange={(e) => setFormData({ ...formData, fld_count: e.target.value })}
                            />
                            <FormInput
                                label="Unit"
                                required
                                value={formData.fld_count_unit || 'Hectare'}
                                onChange={(e) => setFormData({ ...formData, fld_count_unit: e.target.value })}
                                disabled
                            />
                        </div>
                        <DemographicFields prefix="fld_count_" formData={formData} setFormData={setFormData} />
                    </div>

                    {/* Awareness Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b border-gray-100 pb-2">Awareness Camps</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Names"
                                required
                                value={formData.awareness_count ?? ''}
                                onChange={(e) => setFormData({ ...formData, awareness_count: e.target.value })}
                            />
                            <FormInput
                                label="Unit"
                                required
                                value={formData.awareness_count_unit || 'N/A'}
                                onChange={(e) => setFormData({ ...formData, awareness_count_unit: e.target.value })}
                                disabled
                            />
                        </div>
                        <DemographicFields prefix="awareness_count_" formData={formData} setFormData={setFormData} />
                    </div>

                    {/* Input Demonstrations Header */}
                    <div className="pt-4">
                        <h2 className="text-xl font-bold">Input Demonstrations</h2>
                    </div>

                    {/* Seeds Section */}
                    <div className="space-y-4 pl-4 ">
                        <h3 className="text-lg font-semibold border-b border-gray-100 pb-2">Seeds(field crops)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Quantity"
                                required
                                type="number"
                                value={formData.seeds_qty ?? ''}
                                onChange={(e) => setFormData({ ...formData, seeds_qty: e.target.value })}
                            />
                            <FormInput
                                label="Unit"
                                required
                                value={formData.seeds_qty_unit || 'Kg'}
                                onChange={(e) => setFormData({ ...formData, seeds_qty_unit: e.target.value })}
                                disabled
                            />
                        </div>
                        <DemographicFields prefix="seeds_qty_" formData={formData} setFormData={setFormData} />
                    </div>

                    {/* Small Implements Section */}
                    <div className="space-y-4 pl-4 ">
                        <h3 className="text-lg font-semibold border-b border-gray-100 pb-2">Small Equipments(upto Rs.2000)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Quantity"
                                required
                                type="number"
                                value={formData.small_equip_qty ?? ''}
                                onChange={(e) => setFormData({ ...formData, small_equip_qty: e.target.value })}
                            />
                            <FormInput
                                label="Unit"
                                required
                                value={formData.small_equip_qty_unit || 'Number'}
                                onChange={(e) => setFormData({ ...formData, small_equip_qty_unit: e.target.value })}
                                disabled
                            />
                        </div>
                        <DemographicFields prefix="small_equip_qty_" formData={formData} setFormData={setFormData} />
                    </div>

                    {/* Large Implements Section */}
                    <div className="space-y-4 pl-4 ">
                        <h3 className="text-lg font-semibold border-b border-gray-100 pb-2">Large Equipments(more than Rs.2000)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Quantity"
                                required
                                type="number"
                                value={formData.large_equip_qty ?? ''}
                                onChange={(e) => setFormData({ ...formData, large_equip_qty: e.target.value })}
                            />
                            <FormInput
                                label="Unit"
                                required
                                value={formData.large_equip_qty_unit || 'Number'}
                                onChange={(e) => setFormData({ ...formData, large_equip_qty_unit: e.target.value })}
                                disabled
                            />
                        </div>
                        <DemographicFields prefix="large_equip_qty_" formData={formData} setFormData={setFormData} />
                    </div>

                    {/* Fertilizer Section */}
                    <div className="space-y-4 pl-4 ">
                        <h3 className="text-lg font-semibold border-b border-gray-100 pb-2">Fertilizers(NPK)/Secondary/Micro Fertilizers</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Quantity"
                                required
                                type="number"
                                value={formData.fertilizer_qty ?? ''}
                                onChange={(e) => setFormData({ ...formData, fertilizer_qty: e.target.value })}
                            />
                            <FormInput
                                label="Unit"
                                required
                                value={formData.fertilizer_qty_unit || 'Kg'}
                                onChange={(e) => setFormData({ ...formData, fertilizer_qty_unit: e.target.value })}
                                disabled
                            />
                        </div>
                        <DemographicFields prefix="fertilizer_qty_" formData={formData} setFormData={setFormData} />
                    </div>

                    {/* Plant Protection Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b border-gray-100 pb-2">Plant Protection Chemicals</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Quantity"
                                required
                                type="number"
                                value={formData.pp_chemicals_qty ?? ''}
                                onChange={(e) => setFormData({ ...formData, pp_chemicals_qty: e.target.value })}
                            />
                            <FormInput
                                label="Unit"
                                required
                                value={formData.pp_chemicals_qty_unit || 'Lit.'}
                                onChange={(e) => setFormData({ ...formData, pp_chemicals_qty_unit: e.target.value })}
                                disabled
                            />
                        </div>
                        <DemographicFields prefix="pp_chemicals_qty_" formData={formData} setFormData={setFormData} />
                    </div>

                    {/* Literature Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b border-gray-100 pb-2">Distribution of Literature</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Count"
                                required
                                type="number"
                                value={formData.lecture_count ?? ''}
                                onChange={(e) => setFormData({ ...formData, lecture_count: e.target.value })}
                            />
                            <FormInput
                                label="Unit"
                                required
                                value={formData.lecture_count_unit || 'N/A'}
                                onChange={(e) => setFormData({ ...formData, lecture_count_unit: e.target.value })}
                                disabled
                            />
                        </div>
                        <DemographicFields prefix="lecture_count_" formData={formData} setFormData={setFormData} />
                    </div>

                    {/* Kisan Mela Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b border-gray-100 pb-2">Kisan Mela</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Count"
                                required
                                type="number"
                                value={formData.kisan_mela_count ?? ''}
                                onChange={(e) => setFormData({ ...formData, kisan_mela_count: e.target.value })}
                            />
                            <FormInput
                                label="Unit"
                                required
                                value={formData.kisan_mela_count_unit || 'N/A'}
                                onChange={(e) => setFormData({ ...formData, kisan_mela_count_unit: e.target.value })}
                                disabled
                            />
                        </div>
                        <DemographicFields prefix="kisan_mela_count_" formData={formData} setFormData={setFormData} />
                    </div>

                    {/* Any Other Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b border-gray-100 pb-2">Any other(specify)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Specification"
                                required
                                value={formData.any_other_count ?? ''}
                                onChange={(e) => setFormData({ ...formData, any_other_count: e.target.value })}
                            />
                            <FormInput
                                label="Unit"
                                required
                                value={formData.any_other_count_unit || 'N/A'}
                                onChange={(e) => setFormData({ ...formData, any_other_count_unit: e.target.value })}
                                disabled
                            />
                        </div>
                        <DemographicFields prefix="any_other_count_" formData={formData} setFormData={setFormData} />
                    </div>
                </div>
            )}
        </>
    )
}
