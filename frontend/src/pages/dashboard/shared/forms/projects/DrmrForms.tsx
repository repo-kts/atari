import React from 'react'
import { ENTITY_TYPES } from '../../../../../constants/entityTypes'
import { FormInput, FormSelect } from '../shared/FormComponents'

interface DrmrFormsProps {
    entityType: string
    formData: any
    setFormData: (data: any) => void
    years: any[]
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
                label="Members_M"
                type="number"
                value={formData[`${prefix}members_m`] || ''}
                onChange={(e) => handleChange('members_m', e.target.value)}
            />
            <FormInput
                label="Members_F"
                type="number"
                value={formData[`${prefix}members_f`] || ''}
                onChange={(e) => handleChange('members_f', e.target.value)}
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
            <FormInput
                label="OB_M"
                type="number"
                value={formData[`${prefix}ob_m`] || ''}
                onChange={(e) => handleChange('ob_m', e.target.value)}
            />
            <FormInput
                label="OB_F"
                type="number"
                value={formData[`${prefix}ob_f`] || ''}
                onChange={(e) => handleChange('ob_f', e.target.value)}
            />
            <FormInput
                label="GE_M"
                type="number"
                value={formData[`${prefix}ge_m`] || ''}
                onChange={(e) => handleChange('ge_m', e.target.value)}
            />
            <FormInput
                label="GE_F"
                type="number"
                value={formData[`${prefix}ge_f`] || ''}
                onChange={(e) => handleChange('ge_f', e.target.value)}
            />
        </div>
    )
}

export const DrmrForms: React.FC<DrmrFormsProps> = ({
    entityType,
    formData,
    setFormData,
    years,
    states,
    districts,
    kvks
}) => {
    return (
        <>
            {entityType === ENTITY_TYPES.PROJECT_DRMR_DETAILS && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect
                            label="Reporting Year"
                            required
                            value={formData.yearId || ''}
                            onChange={(e) => setFormData({ ...formData, yearId: parseInt(e.target.value) })}
                            options={years.map((y: any) => ({ value: y.id || y.yearId, label: y.yearName }))}
                        />
                        <FormInput
                            label="Varieties/Technology Demonstrated in Improved Practice"
                            required
                            value={formData.varietiesTechImproved || ''}
                            onChange={(e) => setFormData({ ...formData, varietiesTechImproved: e.target.value })}
                        />
                        <FormInput
                            label="Situations (Irrigated/Rainfed)"
                            required
                            value={formData.situations || ''}
                            onChange={(e) => setFormData({ ...formData, situations: e.target.value })}
                        />
                        <FormInput
                            label="Varieties used in Farmer Practise"
                            required
                            value={formData.varietiesFarmerPractise || ''}
                            onChange={(e) => setFormData({ ...formData, varietiesFarmerPractise: e.target.value })}
                        />
                        <FormInput
                            label="Yield Improved Practice(Kg/ha)"
                            required
                            type="number"
                            value={formData.yieldImproved || ''}
                            onChange={(e) => setFormData({ ...formData, yieldImproved: e.target.value })}
                        />
                        <FormInput
                            label="Yield Farmer Practise(Kg/ha)"
                            required
                            type="number"
                            value={formData.yieldFarmerPractise || ''}
                            onChange={(e) => setFormData({ ...formData, yieldFarmerPractise: e.target.value })}
                        />
                        <FormInput
                            label="Yield Increase(%)"
                            required
                            type="number"
                            value={formData.yieldIncreasePercent || ''}
                            onChange={(e) => setFormData({ ...formData, yieldIncreasePercent: e.target.value })}
                        />
                        <FormInput
                            label="Cost of Cultivation Improved Practice(Rs./ha)"
                            required
                            type="number"
                            value={formData.costImproved || ''}
                            onChange={(e) => setFormData({ ...formData, costImproved: e.target.value })}
                        />
                        <FormInput
                            label="Cost of Cultivation Farmer Practice(Rs./ha)"
                            required
                            type="number"
                            value={formData.costFarmerPractise || ''}
                            onChange={(e) => setFormData({ ...formData, costFarmerPractise: e.target.value })}
                        />
                        <FormInput
                            label="Gross Return Improved Practice(Rs./ha)"
                            required
                            type="number"
                            value={formData.grossReturnImproved || ''}
                            onChange={(e) => setFormData({ ...formData, grossReturnImproved: e.target.value })}
                        />
                        <FormInput
                            label="Gross Return Farmer Practice(Rs./ha)"
                            required
                            type="number"
                            value={formData.grossReturnFarmerPractise || ''}
                            onChange={(e) => setFormData({ ...formData, grossReturnFarmerPractise: e.target.value })}
                        />
                        <FormInput
                            label="Net Return Improved Practice(Rs./ha)"
                            required
                            type="number"
                            value={formData.netReturnImproved || ''}
                            onChange={(e) => setFormData({ ...formData, netReturnImproved: e.target.value })}
                        />
                        <FormInput
                            label="Net Return Farmer Practice(Rs./ha)"
                            required
                            type="number"
                            value={formData.netReturnFarmerPractise || ''}
                            onChange={(e) => setFormData({ ...formData, netReturnFarmerPractise: e.target.value })}
                        />
                        <FormInput
                            label="B:C ratio Improved Practice"
                            required
                            type="number"
                            step="0.01"
                            value={formData.bcRatioImproved || ''}
                            onChange={(e) => setFormData({ ...formData, bcRatioImproved: e.target.value })}
                        />
                        <FormInput
                            label="B:C ratio Farmer Practice"
                            required
                            type="number"
                            step="0.01"
                            value={formData.bcRatioFarmerPractise || ''}
                            onChange={(e) => setFormData({ ...formData, bcRatioFarmerPractise: e.target.value })}
                        />
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_DRMR_ACTIVITY && (
                <div className="space-y-12">
                    {/* Header Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6 border-b border-gray-100">
                        <FormSelect
                            label="Reporting Year"
                            required
                            value={formData.yearId || ''}
                            onChange={(e) => setFormData({ ...formData, yearId: parseInt(e.target.value) })}
                            options={years.map((y: any) => ({ value: y.id || y.yearId, label: y.yearName }))}
                        />
                        <FormSelect
                            label="KVK State"
                            required
                            value={formData.stateId || ''}
                            onChange={(e) => setFormData({ ...formData, stateId: parseInt(e.target.value) })}
                            options={states.map((s: any) => ({ value: s.id, label: s.stateName }))}
                        />
                        <FormSelect
                            label="District"
                            required
                            value={formData.districtId || ''}
                            onChange={(e) => setFormData({ ...formData, districtId: parseInt(e.target.value) })}
                            options={districts.map((d: any) => ({ value: d.id, label: d.districtName }))}
                        />
                        <FormSelect
                            label="KVK Name"
                            required
                            value={formData.orgId || ''}
                            onChange={(e) => setFormData({ ...formData, orgId: parseInt(e.target.value) })}
                            options={kvks.map((k: any) => ({ value: k.id, label: k.orgName }))}
                        />
                        <FormSelect
                            label="Month"
                            required
                            value={formData.month || ''}
                            onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                            options={[
                                { value: 'January', label: 'January' },
                                { value: 'February', label: 'February' },
                                { value: 'March', label: 'March' },
                                { value: 'April', label: 'April' },
                                { value: 'May', label: 'May' },
                                { value: 'June', label: 'June' },
                                { value: 'July', label: 'July' },
                                { value: 'August', label: 'August' },
                                { value: 'September', label: 'September' },
                                { value: 'October', label: 'October' },
                                { value: 'November', label: 'November' },
                                { value: 'December', label: 'December' },
                            ]}
                        />
                    </div>

                    {/* Training Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Training</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Title"
                                required
                                value={formData.training_title || ''}
                                onChange={(e) => setFormData({ ...formData, training_title: e.target.value })}
                            />
                            <FormInput
                                label="Unit (Days)"
                                required
                                value={formData.training_unit || ''}
                                onChange={(e) => setFormData({ ...formData, training_unit: e.target.value })}
                            />
                        </div>
                        <DemographicFields prefix="training_" formData={formData} setFormData={setFormData} />
                    </div>

                    {/* FLD Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Frontline Demonstration (FLD) and other Demonstrations</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Crop/Varieties"
                                required
                                value={formData.fld_crop || ''}
                                onChange={(e) => setFormData({ ...formData, fld_crop: e.target.value })}
                            />
                            <FormInput
                                label="Unit (Hectare)"
                                required
                                value={formData.fld_unit || ''}
                                onChange={(e) => setFormData({ ...formData, fld_unit: e.target.value })}
                            />
                        </div>
                        <DemographicFields prefix="fld_" formData={formData} setFormData={setFormData} />
                    </div>

                    {/* Awareness Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Awareness Camps</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Activity"
                                required
                                value={formData.awareness_activity || ''}
                                onChange={(e) => setFormData({ ...formData, awareness_activity: e.target.value })}
                            />
                            <FormInput
                                label="Unit (No)"
                                required
                                value={formData.awareness_unit || ''}
                                onChange={(e) => setFormData({ ...formData, awareness_unit: e.target.value })}
                            />
                        </div>
                        <DemographicFields prefix="awareness_" formData={formData} setFormData={setFormData} />
                    </div>

                    {/* Input Demonstrations Header */}
                    <div className="pt-4">
                        <h2 className="text-xl font-bold">Input Demonstrations</h2>
                    </div>

                    {/* Seeds Section */}
                    <div className="space-y-4 pl-4 border-l-2 border-blue-100">
                        <h3 className="text-lg font-semibold border-b pb-2">Seeds (qtl and amount)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Quantity"
                                required
                                type="number"
                                value={formData.seeds_quantity || ''}
                                onChange={(e) => setFormData({ ...formData, seeds_quantity: e.target.value })}
                            />
                            <FormInput
                                label="Unit (Kg)"
                                required
                                value={formData.seeds_unit || ''}
                                onChange={(e) => setFormData({ ...formData, seeds_unit: e.target.value })}
                            />
                        </div>
                        <DemographicFields prefix="seeds_" formData={formData} setFormData={setFormData} />
                    </div>

                    {/* Small Implements Section */}
                    <div className="space-y-4 pl-4 border-l-2 border-blue-100">
                        <h3 className="text-lg font-semibold border-b pb-2">Small implements (upto Rs. 2000)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Quantity"
                                required
                                type="number"
                                value={formData.smallImplements_quantity || ''}
                                onChange={(e) => setFormData({ ...formData, smallImplements_quantity: e.target.value })}
                            />
                            <FormInput
                                label="Unit (Number)"
                                required
                                value={formData.smallImplements_unit || ''}
                                onChange={(e) => setFormData({ ...formData, smallImplements_unit: e.target.value })}
                            />
                        </div>
                        <DemographicFields prefix="smallImplements_" formData={formData} setFormData={setFormData} />
                    </div>

                    {/* Large Implements Section */}
                    <div className="space-y-4 pl-4 border-l-2 border-blue-100">
                        <h3 className="text-lg font-semibold border-b pb-2">Large Implements (more than Rs. 2000)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Quantity"
                                required
                                type="number"
                                value={formData.largeImplements_quantity || ''}
                                onChange={(e) => setFormData({ ...formData, largeImplements_quantity: e.target.value })}
                            />
                            <FormInput
                                label="Unit (Number)"
                                required
                                value={formData.largeImplements_unit || ''}
                                onChange={(e) => setFormData({ ...formData, largeImplements_unit: e.target.value })}
                            />
                        </div>
                        <DemographicFields prefix="largeImplements_" formData={formData} setFormData={setFormData} />
                    </div>

                    {/* Fertilizer Section */}
                    <div className="space-y-4 pl-4 border-l-2 border-blue-100">
                        <h3 className="text-lg font-semibold border-b pb-2">Fertilizer / Micro / Secondary Plant Nutrient</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Quantity"
                                required
                                type="number"
                                value={formData.fertilizer_quantity || ''}
                                onChange={(e) => setFormData({ ...formData, fertilizer_quantity: e.target.value })}
                            />
                            <FormInput
                                label="Unit (Kg)"
                                required
                                value={formData.fertilizer_unit || ''}
                                onChange={(e) => setFormData({ ...formData, fertilizer_unit: e.target.value })}
                            />
                        </div>
                        <DemographicFields prefix="fertilizer_" formData={formData} setFormData={setFormData} />
                    </div>

                    {/* Plant Protection Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Plant Protection Chemicals</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Quantity"
                                required
                                type="number"
                                value={formData.plantProtection_quantity || ''}
                                onChange={(e) => setFormData({ ...formData, plantProtection_quantity: e.target.value })}
                            />
                            <FormInput
                                label="Unit (Kg)"
                                required
                                value={formData.plantProtection_unit || ''}
                                onChange={(e) => setFormData({ ...formData, plantProtection_unit: e.target.value })}
                            />
                        </div>
                        <DemographicFields prefix="plantProtection_" formData={formData} setFormData={setFormData} />
                    </div>

                    {/* Literature Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Distribution of Literature</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Number"
                                required
                                type="number"
                                value={formData.literature_number || ''}
                                onChange={(e) => setFormData({ ...formData, literature_number: e.target.value })}
                            />
                            <FormInput
                                label="Unit (No)"
                                required
                                value={formData.literature_unit || ''}
                                onChange={(e) => setFormData({ ...formData, literature_unit: e.target.value })}
                            />
                        </div>
                        <DemographicFields prefix="literature_" formData={formData} setFormData={setFormData} />
                    </div>

                    {/* Kisan Mela Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Kisan Mela</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Number"
                                required
                                type="number"
                                value={formData.kisanMela_number || ''}
                                onChange={(e) => setFormData({ ...formData, kisanMela_number: e.target.value })}
                            />
                            <FormInput
                                label="Unit (No)"
                                required
                                value={formData.kisanMela_unit || ''}
                                onChange={(e) => setFormData({ ...formData, kisanMela_unit: e.target.value })}
                            />
                        </div>
                        <DemographicFields prefix="kisanMela_" formData={formData} setFormData={setFormData} />
                    </div>

                    {/* Any Other Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Any other (Specify)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Activity"
                                required
                                value={formData.anyOther_activity || ''}
                                onChange={(e) => setFormData({ ...formData, anyOther_activity: e.target.value })}
                            />
                            <FormInput
                                label="Unit"
                                required
                                value={formData.anyOther_unit || ''}
                                onChange={(e) => setFormData({ ...formData, anyOther_unit: e.target.value })}
                            />
                        </div>
                        <DemographicFields prefix="anyOther_" formData={formData} setFormData={setFormData} />
                    </div>
                </div>
            )}
        </>
    )
}
