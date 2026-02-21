import React from 'react'
import { ENTITY_TYPES } from '../../../../../constants/entityTypes'
import { FormInput, FormSelect, FormSection, FormTextArea } from '../shared/FormComponents'
import { ExtendedEntityType } from '../../../../../utils/masterUtils'

interface CfldFormsProps {
    entityType: ExtendedEntityType
    formData: any
    setFormData: (data: any) => void
    YearSelect: React.FC
}

export const CfldForms: React.FC<CfldFormsProps> = ({
    entityType,
    formData,
    setFormData,
    YearSelect,
}) => {
    return (
        <>
            {/* CFLD Technical Parameter Form */}
            {entityType === ENTITY_TYPES.PROJECT_CFLD_TECHNICAL_PARAM && (
                <div className="space-y-8">
                    {/* Header Details - 3 Column Layout */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#487749] pb-2 border-b border-[#E8F5E9]">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <YearSelect />
                            <FormSelect
                                label="Type"
                                required
                                value={formData.type || ''}
                                options={[
                                    { value: 'Oilseeds', label: 'Oilseeds' },
                                    { value: 'Pulses', label: 'Pulses' }
                                ]}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            />
                            <FormSelect
                                label="Season"
                                required
                                value={formData.season || ''}
                                options={[
                                    { value: 'Kharif', label: 'Kharif' },
                                    { value: 'Rabi', label: 'Rabi' },
                                    { value: 'Summer', label: 'Summer' }
                                ]}
                                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                            />
                        </div>
                    </div>

                    <FormSection title="Crop Details">
                        <FormSelect
                            label="Crop"
                            required
                            value={formData.crop || ''}
                            options={[
                                { value: 'Mustard', label: 'Mustard' },
                                { value: 'Chickpea', label: 'Chickpea' },
                                { value: 'Groundnut', label: 'Groundnut' },
                                { value: 'Soybean', label: 'Soybean' },
                                { value: 'Blackgram', label: 'Blackgram' },
                                { value: 'Greengram', label: 'Greengram' },
                                { value: 'Lentil', label: 'Lentil' },
                                { value: 'Fieldpea', label: 'Fieldpea' }
                            ]}
                            onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                        />
                        <FormInput
                            label="Name of Variety"
                            required
                            value={formData.variety || ''}
                            onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                        />
                        <FormInput
                            label="Area (ha)"
                            type="number"
                            required
                            value={formData.area || ''}
                            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        />
                        <FormInput
                            label="Technology Demonstrated"
                            required
                            value={formData.technologyDemonstrated || ''}
                            onChange={(e) => setFormData({ ...formData, technologyDemonstrated: e.target.value })}
                        />
                        <FormTextArea
                            label="Detail of existing farmer practice"
                            required
                            value={formData.existingFarmerPractice || ''}
                            onChange={(e) => setFormData({ ...formData, existingFarmerPractice: e.target.value })}
                        />
                        <FormInput
                            label="Yield (q/ha) in farmer field (demo)"
                            type="number"
                            required
                            value={formData.yieldFarmerPractice || ''}
                            onChange={(e) => setFormData({ ...formData, yieldFarmerPractice: e.target.value })}
                        />
                    </FormSection>

                    <FormSection title="Yield obtained in demonstration (q/ha)">
                        <FormInput
                            label="Maximum"
                            type="number"
                            required
                            value={formData.demoYieldMax || ''}
                            onChange={(e) => setFormData({ ...formData, demoYieldMax: e.target.value })}
                        />
                        <FormInput
                            label="Minimum"
                            type="number"
                            required
                            value={formData.demoYieldMin || ''}
                            onChange={(e) => setFormData({ ...formData, demoYieldMin: e.target.value })}
                        />
                        <FormInput
                            label="Average"
                            type="number"
                            required
                            value={formData.demoYieldAvg || ''}
                            onChange={(e) => setFormData({ ...formData, demoYieldAvg: e.target.value })}
                        />
                        <FormInput
                            label="% Increase in yield"
                            type="number"
                            required
                            value={formData.yieldIncreasePct || ''}
                            onChange={(e) => setFormData({ ...formData, yieldIncreasePct: e.target.value })}
                        />
                    </FormSection>

                    <FormSection title="Yield gap (q/ha)">
                        <FormInput
                            label="District yield (D)"
                            type="number"
                            required
                            value={formData.districtYield || ''}
                            onChange={(e) => setFormData({ ...formData, districtYield: e.target.value })}
                        />
                        <FormInput
                            label="State yield (S)"
                            type="number"
                            required
                            value={formData.stateYield || ''}
                            onChange={(e) => setFormData({ ...formData, stateYield: e.target.value })}
                        />
                        <FormInput
                            label="Potential yield (P)"
                            type="number"
                            required
                            value={formData.potentialYield || ''}
                            onChange={(e) => setFormData({ ...formData, potentialYield: e.target.value })}
                        />
                    </FormSection>

                    <FormSection title="Yield gap minimized (%)">
                        <FormInput
                            label="District yield (D)"
                            type="number"
                            required
                            value={formData.gapDistrict || ''}
                            onChange={(e) => setFormData({ ...formData, gapDistrict: e.target.value })}
                        />
                        <FormInput
                            label="State yield (S)"
                            type="number"
                            required
                            value={formData.gapState || ''}
                            onChange={(e) => setFormData({ ...formData, gapState: e.target.value })}
                        />
                        <FormInput
                            label="Potential yield (P)"
                            type="number"
                            required
                            value={formData.gapPotential || ''}
                            onChange={(e) => setFormData({ ...formData, gapPotential: e.target.value })}
                        />
                    </FormSection>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-[#487749] pb-2 border-b border-[#E8F5E9]">Farmers Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                label="General (M)"
                                type="number"
                                placeholder="0"
                                value={formData.farmersGeneralM || ''}
                                onChange={(e) => setFormData({ ...formData, farmersGeneralM: e.target.value })}
                            />
                            <FormInput
                                label="General (F)"
                                type="number"
                                placeholder="0"
                                value={formData.farmersGeneralF || ''}
                                onChange={(e) => setFormData({ ...formData, farmersGeneralF: e.target.value })}
                            />
                            <FormInput
                                label="OBC (M)"
                                type="number"
                                placeholder="0"
                                value={formData.farmersOBCM || ''}
                                onChange={(e) => setFormData({ ...formData, farmersOBCM: e.target.value })}
                            />
                            <FormInput
                                label="OBC (F)"
                                type="number"
                                placeholder="0"
                                value={formData.farmersOBCF || ''}
                                onChange={(e) => setFormData({ ...formData, farmersOBCF: e.target.value })}
                            />
                            <FormInput
                                label="SC (M)"
                                type="number"
                                placeholder="0"
                                value={formData.farmersSCM || ''}
                                onChange={(e) => setFormData({ ...formData, farmersSCM: e.target.value })}
                            />
                            <FormInput
                                label="SC (F)"
                                type="number"
                                placeholder="0"
                                value={formData.farmersSCF || ''}
                                onChange={(e) => setFormData({ ...formData, farmersSCF: e.target.value })}
                            />
                            <FormInput
                                label="ST (M)"
                                type="number"
                                placeholder="0"
                                value={formData.farmersSTM || ''}
                                onChange={(e) => setFormData({ ...formData, farmersSTM: e.target.value })}
                            />
                            <FormInput
                                label="ST (F)"
                                type="number"
                                placeholder="0"
                                value={formData.farmersSTF || ''}
                                onChange={(e) => setFormData({ ...formData, farmersSTF: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-[#E8F5E9]">
                        <h3 className="text-lg font-semibold text-[#487749]">Uploads</h3>
                        <FormInput
                            label="Relevant farming photographs"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) setFormData({ ...formData, photo1: file })
                            }}
                        />
                        <FormInput
                            label="Quality Action Photographs of field visits/Field days and technology demonstrated"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) setFormData({ ...formData, photo2: file })
                            }}
                        />
                    </div>
                </div>
            )}

            {/* CFLD Extension Activity Form */}
            {entityType === ENTITY_TYPES.PROJECT_CFLD_EXTENSION_ACTIVITY && (
                <div className="space-y-8">
                    <FormSection title="Activity Details">
                        <FormSelect
                            label="Season"
                            required
                            value={formData.season || ''}
                            options={[
                                { value: 'Kharif', label: 'Kharif' },
                                { value: 'Rabi', label: 'Rabi' },
                                { value: 'Summer', label: 'Summer' }
                            ]}
                            onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                        />
                        <FormSelect
                            label="Extension Activities organized"
                            required
                            value={formData.activityType || ''}
                            options={[
                                { value: 'Field Days', label: 'Field Days' },
                                { value: 'Kisan Goshties', label: 'Kisan Goshties' },
                                { value: 'Training', label: 'Training' },
                                { value: 'Demonstrations', label: 'Demonstrations' },
                                { value: 'Exhibitions', label: 'Exhibitions' },
                                { value: 'Film Shows', label: 'Film Shows' },
                                { value: 'Other', label: 'Other' }
                            ]}
                            onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
                        />
                        <FormInput
                            label="Date"
                            type="date"
                            required
                            value={formData.date || ''}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                        <FormInput
                            label="Place of activity"
                            required
                            value={formData.placeOfActivity || ''}
                            onChange={(e) => setFormData({ ...formData, placeOfActivity: e.target.value })}
                        />
                    </FormSection>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-[#487749] pb-2 border-b border-[#E8F5E9]">Farmers Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <FormInput
                                label="General (M)"
                                type="number"
                                required
                                placeholder="0"
                                value={formData.farmersGeneralM || ''}
                                onChange={(e) => setFormData({ ...formData, farmersGeneralM: e.target.value })}
                            />
                            <FormInput
                                label="General (F)"
                                type="number"
                                required
                                placeholder="0"
                                value={formData.farmersGeneralF || ''}
                                onChange={(e) => setFormData({ ...formData, farmersGeneralF: e.target.value })}
                            />
                            <FormInput
                                label="OBC (M)"
                                type="number"
                                required
                                placeholder="0"
                                value={formData.farmersOBCM || ''}
                                onChange={(e) => setFormData({ ...formData, farmersOBCM: e.target.value })}
                            />
                            <FormInput
                                label="OBC (F)"
                                type="number"
                                required
                                placeholder="0"
                                value={formData.farmersOBCF || ''}
                                onChange={(e) => setFormData({ ...formData, farmersOBCF: e.target.value })}
                            />
                            <FormInput
                                label="SC (M)"
                                type="number"
                                required
                                placeholder="0"
                                value={formData.farmersSCM || ''}
                                onChange={(e) => setFormData({ ...formData, farmersSCM: e.target.value })}
                            />
                            <FormInput
                                label="SC (F)"
                                type="number"
                                required
                                placeholder="0"
                                value={formData.farmersSCF || ''}
                                onChange={(e) => setFormData({ ...formData, farmersSCF: e.target.value })}
                            />
                            <FormInput
                                label="ST (M)"
                                type="number"
                                required
                                placeholder="0"
                                value={formData.farmersSTM || ''}
                                onChange={(e) => setFormData({ ...formData, farmersSTM: e.target.value })}
                            />
                            <FormInput
                                label="ST (F)"
                                type="number"
                                required
                                placeholder="0"
                                value={formData.farmersSTF || ''}
                                onChange={(e) => setFormData({ ...formData, farmersSTF: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* CFLD Budget Utilization Form */}
            {entityType === ENTITY_TYPES.PROJECT_CFLD_BUDGET && (
                <div className="space-y-8">
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-[#487749] pb-2 border-b border-[#E8F5E9]">Budget Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormSelect
                                label="Reporting Year"
                                required
                                placeholder="Select Reporting"
                                value={formData.reportingYear || ''}
                                options={[
                                    { value: '2023-24', label: '2023-24' },
                                    { value: '2024-25', label: '2024-25' },
                                    { value: '2025-26', label: '2025-26' },
                                ]}
                                onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
                            />
                            <FormSelect
                                label="Season"
                                required
                                placeholder="Select Season"
                                value={formData.season || ''}
                                options={[
                                    { value: 'Kharif', label: 'Kharif' },
                                    { value: 'Rabi', label: 'Rabi' },
                                    { value: 'Summer', label: 'Summer' }
                                ]}
                                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                            />
                            <FormSelect
                                label="Crop"
                                required
                                placeholder="Select Crop"
                                value={formData.crop || ''}
                                options={[
                                    { value: 'Mustard', label: 'Mustard' },
                                    { value: 'Chickpea', label: 'Chickpea' },
                                    { value: 'Groundnut', label: 'Groundnut' },
                                    { value: 'Soybean', label: 'Soybean' },
                                    { value: 'Blackgram', label: 'Blackgram' },
                                    { value: 'Greengram', label: 'Greengram' },
                                    { value: 'Lentil', label: 'Lentil' },
                                    { value: 'Fieldpea', label: 'Fieldpea' }
                                ]}
                                onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                            />
                            <FormInput
                                label="Overall Crop wise fund allocation"
                                type="number"
                                required
                                value={formData.fundAllocation || ''}
                                onChange={(e) => setFormData({ ...formData, fundAllocation: e.target.value })}
                            />
                            <FormInput
                                label="Area (ha) allotted"
                                type="number"
                                required
                                value={formData.areaAllotted || ''}
                                onChange={(e) => setFormData({ ...formData, areaAllotted: e.target.value })}
                            />
                            <FormInput
                                label="Area (ha) achieved"
                                type="number"
                                required
                                value={formData.areaAchieved || ''}
                                onChange={(e) => setFormData({ ...formData, areaAchieved: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="border border-[#E0E0E0] rounded-xl overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-[#757575] uppercase bg-[#F5F5F5] border-b border-[#E0E0E0]">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Items</th>
                                    <th className="px-6 py-4 font-semibold w-1/3">Budget Received (Rs.)</th>
                                    <th className="px-6 py-4 font-semibold w-1/3">Budget Utilization (Rs.)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E0E0E0]">
                                {[
                                    { label: 'Critical input', key: 'criticalInput' },
                                    { label: 'TA/DA/POL etc. for monitoring', key: 'monitoring' },
                                    { label: 'Extension Activities (Field Day)', key: 'extensionActivities' },
                                    { label: 'Publication of literature', key: 'publication' }
                                ].map((item) => (
                                    <tr key={item.key} className="bg-white hover:bg-[#F9FAFB]">
                                        <td className="px-6 py-4 font-medium text-[#212121]">{item.label}</td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#487749] focus:border-[#487749]"
                                                placeholder="0.00"
                                                value={formData[`${item.key}_received`] || ''}
                                                onChange={(e) => setFormData({ ...formData, [`${item.key}_received`]: e.target.value })}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#487749] focus:border-[#487749]"
                                                placeholder="0.00"
                                                value={formData[`${item.key}_utilized`] || ''}
                                                onChange={(e) => setFormData({ ...formData, [`${item.key}_utilized`]: e.target.value })}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    )
}
