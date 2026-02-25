import React from 'react'
import { ENTITY_TYPES } from '../../../../../constants/entityTypes'
import { FormInput, FormSelect, FormSection } from '../shared/FormComponents'

interface CfldFormsProps {
    entityType: string
    formData: any
    setFormData: (data: any) => void
    seasons: any[]
    cropTypes: any[]
    cfldCrops: any[]
    years: any[]
}

export const CfldForms: React.FC<CfldFormsProps> = ({
    entityType,
    formData,
    setFormData,
    seasons,
    cropTypes,
    cfldCrops,
    years
}) => {
    return (
        <>
            {entityType === ENTITY_TYPES.PROJECT_CFLD_TECHNICAL_PARAM && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        <FormSelect
                            label="Type"
                            required
                            value={formData.cropTypeId || ''}
                            onChange={(e) => {
                                const selectedType = cropTypes.find((ct: any) => (ct.id || ct.typeId) === parseInt(e.target.value));
                                setFormData({
                                    ...formData,
                                    cropTypeId: parseInt(e.target.value),
                                    type: selectedType ? selectedType.typeName.toUpperCase() : ''
                                });
                            }}
                            options={cropTypes.map((ct: any) => ({ value: ct.id || ct.typeId, label: ct.typeName }))}
                        />
                        <FormSelect
                            label="Season"
                            required
                            value={formData.seasonId || ''}
                            onChange={(e) => setFormData({ ...formData, seasonId: parseInt(e.target.value) })}
                            options={seasons.map((s: any) => ({ value: s.seasonId, label: s.seasonName }))}
                        />
                        <FormSelect
                            label="Crop"
                            required
                            value={formData.cropId || ''}
                            onChange={(e) => setFormData({ ...formData, cropId: parseInt(e.target.value) })}
                            options={cfldCrops.map((c: any) => ({ value: c.id || c.cfldId, label: c.cropName }))}
                            disabled={!formData.seasonId || !formData.cropTypeId}
                        />
                        <FormInput
                            label="Name of Variety"
                            required
                            value={formData.varietyName || ''}
                            onChange={(e) => setFormData({ ...formData, varietyName: e.target.value })}
                        />
                        <FormInput
                            label="Area (in ha)"
                            required
                            type="number"
                            step="0.01"
                            value={formData.areaInHa || formData.areaHectare || ''}
                            onChange={(e) => setFormData({ ...formData, areaInHa: e.target.value })}
                        />
                        <FormInput
                            label="Technology demonstrated"
                            required
                            value={formData.technologyDemonstrated || ''}
                            onChange={(e) => setFormData({ ...formData, technologyDemonstrated: e.target.value })}
                        />
                        <FormInput
                            label="Yield (q/ha) in farmer field (local check)"
                            required
                            type="number"
                            step="0.01"
                            value={formData.yieldFarmerField || ''}
                            onChange={(e) => setFormData({ ...formData, yieldFarmerField: e.target.value })}
                        />
                        <FormInput
                            label="% increase in yield"
                            type="number"
                            step="0.01"
                            value={formData.yieldIncreasePercent || ''}
                            onChange={(e) => setFormData({ ...formData, yieldIncreasePercent: e.target.value })}
                        />
                    </div>

                    <FormSection title="Yield obtained in demonstration (q/ha)">
                        <FormInput label="Minimum" required type="number" step="0.01" value={formData.yieldMin || ''} onChange={e => setFormData({ ...formData, yieldMin: e.target.value })} />
                        <FormInput label="Maximum" required type="number" step="0.01" value={formData.yieldMax || ''} onChange={e => setFormData({ ...formData, yieldMax: e.target.value })} />
                        <FormInput label="Average" required type="number" step="0.01" value={formData.yieldAvg || ''} onChange={e => setFormData({ ...formData, yieldAvg: e.target.value })} />
                    </FormSection>

                    <FormSection title="Yield gap (q/ha)">
                        <FormInput label="District yield (D)" required type="number" step="0.01" value={formData.yieldGapDistrict || ''} onChange={e => setFormData({ ...formData, yieldGapDistrict: e.target.value })} />
                        <FormInput label="State yield (S)" required type="number" step="0.01" value={formData.yieldGapState || ''} onChange={e => setFormData({ ...formData, yieldGapState: e.target.value })} />
                        <FormInput label="Potential yield (P)" required type="number" step="0.01" value={formData.yieldGapPotential || ''} onChange={e => setFormData({ ...formData, yieldGapPotential: e.target.value })} />
                    </FormSection>

                    <FormSection title="Yield gap minimized (%)">
                        <FormInput label="District yield (D)" required type="number" step="0.01" value={formData.yieldGapMinimisedDistrict || ''} onChange={e => setFormData({ ...formData, yieldGapMinimisedDistrict: e.target.value })} />
                        <FormInput label="State yield (S)" required type="number" step="0.01" value={formData.yieldGapMinimisedState || ''} onChange={e => setFormData({ ...formData, yieldGapMinimisedState: e.target.value })} />
                        <FormInput label="Potential yield (P)" required type="number" step="0.01" value={formData.yieldGapMinimisedPotential || ''} onChange={e => setFormData({ ...formData, yieldGapMinimisedPotential: e.target.value })} />
                    </FormSection>

                    <FormSection title="Farmers Details">
                        <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormInput label="General_M" required type="number" value={formData.genM || ''} onChange={e => setFormData({ ...formData, genM: e.target.value })} />
                            <FormInput label="General_F" required type="number" value={formData.genF || ''} onChange={e => setFormData({ ...formData, genF: e.target.value })} />
                            <FormInput label="OBC_M" required type="number" value={formData.obcM || ''} onChange={e => setFormData({ ...formData, obcM: e.target.value })} />
                            <FormInput label="OBC_F" required type="number" value={formData.obcF || ''} onChange={e => setFormData({ ...formData, obcF: e.target.value })} />

                            <FormInput label="SC_M" required type="number" value={formData.scM || ''} onChange={e => setFormData({ ...formData, scM: e.target.value })} />
                            <FormInput label="SC_F" required type="number" value={formData.scF || ''} onChange={e => setFormData({ ...formData, scF: e.target.value })} />
                            <FormInput label="ST_M" required type="number" value={formData.stM || ''} onChange={e => setFormData({ ...formData, stM: e.target.value })} />
                            <FormInput label="ST_F" required type="number" value={formData.stF || ''} onChange={e => setFormData({ ...formData, stF: e.target.value })} />
                        </div>
                    </FormSection>
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_CFLD_EXTENSION_ACTIVITY && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormSelect
                            label="Season"
                            required
                            value={formData.seasonId || ''}
                            onChange={(e) => setFormData({ ...formData, seasonId: parseInt(e.target.value) })}
                            options={seasons.map((s: any) => ({ value: s.seasonId, label: s.seasonName }))}
                        />
                        <FormSelect
                            label="Extension Activities organized"
                            required
                            value={formData.activityType || ''}
                            onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
                            options={[
                                { value: 'Field Day', label: 'Field Day' },
                                { value: 'Farmers Training', label: 'Farmers Training' },
                                { value: 'Method Demonstration', label: 'Method Demonstration' },
                                { value: 'Awareness Camp', label: 'Awareness Camp' },
                            ]}
                        />
                        <FormInput
                            label="Date"
                            required
                            type="date"
                            value={formData.date || ''}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                        <FormInput
                            label="Place of activity"
                            required
                            value={formData.placeOfActivity || ''}
                            onChange={(e) => setFormData({ ...formData, placeOfActivity: e.target.value })}
                        />
                    </div>

                    <FormSection title="Farmers Details">
                        <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormInput label="General_M" required type="number" value={formData.genM || ''} onChange={e => setFormData({ ...formData, genM: e.target.value })} />
                            <FormInput label="General_F" required type="number" value={formData.genF || ''} onChange={e => setFormData({ ...formData, genF: e.target.value })} />
                            <FormInput label="OBC_M" required type="number" value={formData.obcM || ''} onChange={e => setFormData({ ...formData, obcM: e.target.value })} />
                            <FormInput label="OBC_F" required type="number" value={formData.obcF || ''} onChange={e => setFormData({ ...formData, obcF: e.target.value })} />

                            <FormInput label="SC_M" required type="number" value={formData.scM || ''} onChange={e => setFormData({ ...formData, scM: e.target.value })} />
                            <FormInput label="SC_F" required type="number" value={formData.scF || ''} onChange={e => setFormData({ ...formData, scF: e.target.value })} />
                            <FormInput label="ST_M" required type="number" value={formData.stM || ''} onChange={e => setFormData({ ...formData, stM: e.target.value })} />
                            <FormInput label="ST_F" required type="number" value={formData.stF || ''} onChange={e => setFormData({ ...formData, stF: e.target.value })} />
                        </div>
                    </FormSection>
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_CFLD_BUDGET && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormSelect
                            label="Year"
                            required
                            value={formData.yearId || ''}
                            onChange={(e) => setFormData({ ...formData, yearId: parseInt(e.target.value) })}
                            options={years.map((y: any) => ({ value: String(y.id || y.yearId), label: y.yearName || y.year || y.name }))}
                        />
                        <FormSelect
                            label="Season"
                            required
                            value={formData.seasonId || ''}
                            onChange={(e) => setFormData({ ...formData, seasonId: parseInt(e.target.value) })}
                            options={seasons.map((s: any) => ({ value: s.seasonId, label: s.seasonName }))}
                        />
                        <FormSelect
                            label="Crop"
                            required
                            value={formData.cropId || ''}
                            onChange={(e) => setFormData({ ...formData, cropId: parseInt(e.target.value) })}
                            options={cfldCrops.map((c: any) => ({ value: c.id || c.cfldId, label: c.cropName }))}
                            disabled={!formData.seasonId}
                        />
                        <FormInput
                            label="Overall Crop wise fund allocation"
                            required
                            type="number"
                            step="0.01"
                            value={formData.overallFundAllocation || ''}
                            onChange={(e) => setFormData({ ...formData, overallFundAllocation: e.target.value })}
                        />
                        <FormInput
                            label="Area (ha) allotted"
                            required
                            type="number"
                            step="0.01"
                            value={formData.areaAllotted || ''}
                            onChange={(e) => setFormData({ ...formData, areaAllotted: e.target.value })}
                        />
                        <FormInput
                            label="Area (ha) achieved"
                            required
                            type="number"
                            step="0.01"
                            value={formData.areaAchieved || ''}
                            onChange={(e) => setFormData({ ...formData, areaAchieved: e.target.value })}
                        />
                    </div>

                    <div className="overflow-x-auto border border-[#E0E0E0] rounded-xl mt-6">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-[#757575] uppercase border-b border-[#E0E0E0] bg-[#FAF9F6]">
                                <tr>
                                    <th className="px-4 py-3 font-medium border-r border-[#E0E0E0]">Items</th>
                                    <th className="px-4 py-3 font-medium border-r border-[#E0E0E0]">Budget Received (Rs.)</th>
                                    <th className="px-4 py-3 font-medium">Budget Utilization (Rs.)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E0E0E0]">
                                <tr>
                                    <td className="px-4 py-3 text-[#212121] font-medium border-r border-[#E0E0E0]">Critical input</td>
                                    <td className="px-4 py-3 border-r border-[#E0E0E0]"><FormInput label="" type="number" step="0.01" value={formData.criticalInputReceived || ''} onChange={(e) => setFormData({ ...formData, criticalInputReceived: e.target.value })} /></td>
                                    <td className="px-4 py-3"><FormInput label="" type="number" step="0.01" value={formData.criticalInputUtilized || ''} onChange={(e) => setFormData({ ...formData, criticalInputUtilized: e.target.value })} /></td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 text-[#212121] font-medium border-r border-[#E0E0E0]">TA/DA/POL etc. for monitoring</td>
                                    <td className="px-4 py-3 border-r border-[#E0E0E0]"><FormInput label="" type="number" step="0.01" value={formData.taDaReceived || ''} onChange={(e) => setFormData({ ...formData, taDaReceived: e.target.value })} /></td>
                                    <td className="px-4 py-3"><FormInput label="" type="number" step="0.01" value={formData.taDaUtilized || ''} onChange={(e) => setFormData({ ...formData, taDaUtilized: e.target.value })} /></td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 text-[#212121] font-medium border-r border-[#E0E0E0]">Extension Activities (Field Day)</td>
                                    <td className="px-4 py-3 border-r border-[#E0E0E0]"><FormInput label="" type="number" step="0.01" value={formData.extensionActivitiesReceived || ''} onChange={(e) => setFormData({ ...formData, extensionActivitiesReceived: e.target.value })} /></td>
                                    <td className="px-4 py-3"><FormInput label="" type="number" step="0.01" value={formData.extensionActivitiesUtilized || ''} onChange={(e) => setFormData({ ...formData, extensionActivitiesUtilized: e.target.value })} /></td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 text-[#212121] font-medium border-r border-[#E0E0E0]">Publication of literature</td>
                                    <td className="px-4 py-3 border-r border-[#E0E0E0]"><FormInput label="" type="number" step="0.01" value={formData.publicationReceived || ''} onChange={(e) => setFormData({ ...formData, publicationReceived: e.target.value })} /></td>
                                    <td className="px-4 py-3"><FormInput label="" type="number" step="0.01" value={formData.publicationUtilized || ''} onChange={(e) => setFormData({ ...formData, publicationUtilized: e.target.value })} /></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    )
}
