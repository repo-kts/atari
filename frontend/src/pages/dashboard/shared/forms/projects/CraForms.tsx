import React from 'react'
import { ENTITY_TYPES } from '../../../../../constants/entityTypes'
import { FormInput, FormSelect } from '../shared/FormComponents'
import { ExtendedEntityType } from '../../../../../utils/masterUtils'

interface CraFormsProps {
    entityType: ExtendedEntityType
    formData: any
    setFormData: (data: any) => void
    YearSelect: React.FC
}

export const CraForms: React.FC<CraFormsProps> = ({
    entityType,
    formData,
    setFormData,
    YearSelect,
}) => {
    return (
        <>
            {/* CRA Details Form */}
            {entityType === ENTITY_TYPES.PROJECT_CRA_DETAILS && (
                <div className="space-y-8">
                    {/* Header Details - 2 Column Layout */}
                    <div className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <YearSelect />
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Technology demonstrated/ interventions"
                            required
                            value={formData.technologyDemonstrated || ''}
                            onChange={(e) => setFormData({ ...formData, technologyDemonstrated: e.target.value })}
                        />
                        <FormInput
                            label="Croping system"
                            required
                            value={formData.croppingSystem || ''}
                            onChange={(e) => setFormData({ ...formData, croppingSystem: e.target.value })}
                        />
                        <FormSelect
                            label="Farming System crop under demonstration"
                            required
                            value={formData.cropUnderDemonstration || ''}
                            options={[
                                { value: 'None', label: 'No record found' },
                                // Add more options as needed or fetch dynamically
                            ]}
                            onChange={(e) => setFormData({ ...formData, cropUnderDemonstration: e.target.value })}
                        />
                        <FormInput
                            label="Area under Demonstration (in acre)"
                            type="number"
                            required
                            value={formData.areaUnderDemonstration || ''}
                            onChange={(e) => setFormData({ ...formData, areaUnderDemonstration: e.target.value })}
                        />
                    </div>

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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Crop Yield (q/ha)"
                            type="number"
                            required
                            value={formData.cropYield || ''}
                            onChange={(e) => setFormData({ ...formData, cropYield: e.target.value })}
                        />
                        <FormInput
                            label="System productivity (q/ha)"
                            type="number"
                            required
                            value={formData.systemProductivity || ''}
                            onChange={(e) => setFormData({ ...formData, systemProductivity: e.target.value })}
                        />
                        <FormInput
                            label="Total return (Rs./ha)"
                            type="number"
                            required
                            value={formData.totalReturn || ''}
                            onChange={(e) => setFormData({ ...formData, totalReturn: e.target.value })}
                        />
                        <FormInput
                            label="Yield obtained under Farmer Practices (q/ha)"
                            type="number"
                            required
                            value={formData.farmerPracticeYield || ''}
                            onChange={(e) => setFormData({ ...formData, farmerPracticeYield: e.target.value })}
                        />
                    </div>
                </div>
            )}

            {/* CRA Extension Activity Form */}
            {entityType === ENTITY_TYPES.PROJECT_CRA_EXTENSION_ACTIVITY && (
                <div className="space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-[#487749] pb-2 border-b border-[#E8F5E9]">Create Extension Activity</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormSelect
                                label="Extension Activity"
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
                                label="Start Date"
                                type="date"
                                required
                                value={formData.startDate || ''}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />
                            <FormInput
                                label="End Date"
                                type="date"
                                required
                                value={formData.endDate || ''}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-[#487749] pb-2 border-b border-[#E8F5E9]">Farmers Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <FormInput
                                label="General_M"
                                type="number"
                                placeholder="0"
                                value={formData.farmersGeneralM || ''}
                                onChange={(e) => setFormData({ ...formData, farmersGeneralM: e.target.value })}
                            />
                            <FormInput
                                label="General_F"
                                type="number"
                                placeholder="0"
                                value={formData.farmersGeneralF || ''}
                                onChange={(e) => setFormData({ ...formData, farmersGeneralF: e.target.value })}
                            />
                            <FormInput
                                label="OBC_M"
                                type="number"
                                placeholder="0"
                                value={formData.farmersOBCM || ''}
                                onChange={(e) => setFormData({ ...formData, farmersOBCM: e.target.value })}
                            />
                            <FormInput
                                label="OBC_F"
                                type="number"
                                placeholder="0"
                                value={formData.farmersOBCF || ''}
                                onChange={(e) => setFormData({ ...formData, farmersOBCF: e.target.value })}
                            />
                            <FormInput
                                label="SC_M"
                                type="number"
                                placeholder="0"
                                value={formData.farmersSCM || ''}
                                onChange={(e) => setFormData({ ...formData, farmersSCM: e.target.value })}
                            />
                            <FormInput
                                label="SC_F"
                                type="number"
                                placeholder="0"
                                value={formData.farmersSCF || ''}
                                onChange={(e) => setFormData({ ...formData, farmersSCF: e.target.value })}
                            />
                            <FormInput
                                label="ST_M"
                                type="number"
                                placeholder="0"
                                value={formData.farmersSTM || ''}
                                onChange={(e) => setFormData({ ...formData, farmersSTM: e.target.value })}
                            />
                            <FormInput
                                label="ST_F"
                                type="number"
                                placeholder="0"
                                value={formData.farmersSTF || ''}
                                onChange={(e) => setFormData({ ...formData, farmersSTF: e.target.value })}
                            />
                        </div>
                        <div className="w-full">
                            <FormInput
                                label="Exposure visit (no.)"
                                type="number"
                                required
                                placeholder="0"
                                value={formData.exposureVisit || ''}
                                onChange={(e) => setFormData({ ...formData, exposureVisit: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
