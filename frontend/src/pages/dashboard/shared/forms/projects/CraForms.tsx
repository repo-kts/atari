import React from 'react'
import { ENTITY_TYPES } from '../../../../../constants/entityTypes'
import { FormInput, FormSelect, FormSection } from '../shared/FormComponents'

interface CraFormsProps {
    entityType: string
    formData: any
    setFormData: (data: any) => void
    years: any[]
    seasons: any[]
    farmingSystems: any[]
    extensionActivityTypes: any[]
}

export const CraForms: React.FC<CraFormsProps> = ({
    entityType,
    formData,
    setFormData,
    years,
    seasons,
    farmingSystems,
    extensionActivityTypes
}) => {
    return (
        <>
            {entityType === ENTITY_TYPES.PROJECT_CRA_DETAILS && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect
                            label="Reporting Year"
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
                        <FormInput
                            label="Technology demonstrated/ interventions"
                            required
                            value={formData.interventions || ''}
                            onChange={(e) => setFormData({ ...formData, interventions: e.target.value })}
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
                            value={formData.farmingSystemId || ''}
                            onChange={(e) => setFormData({ ...formData, farmingSystemId: parseInt(e.target.value) })}
                            options={farmingSystems.map((fs: any) => ({ value: fs.id || fs.farmingSystemId, label: fs.farmingSystemName }))}
                            placeholder={farmingSystems.length === 0 ? "No record found" : "Select Farming System crop under demonstration"}
                        />
                        <FormInput
                            label="Area under Demonstration (in acre)"
                            required
                            type="number"
                            step="0.01"
                            value={formData.areaInAcre || ''}
                            onChange={(e) => setFormData({ ...formData, areaInAcre: e.target.value })}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            label="Crop Yield (q/ha)"
                            required
                            type="number"
                            step="0.01"
                            value={formData.cropYield || ''}
                            onChange={(e) => setFormData({ ...formData, cropYield: e.target.value })}
                        />
                        <FormInput
                            label="System productivity (q/ha)"
                            required
                            type="number"
                            step="0.01"
                            value={formData.systemProductivity || ''}
                            onChange={(e) => setFormData({ ...formData, systemProductivity: e.target.value })}
                        />
                        <FormInput
                            label="Total return (Rs./ha)"
                            required
                            type="number"
                            step="0.01"
                            value={formData.totalReturn || ''}
                            onChange={(e) => setFormData({ ...formData, totalReturn: e.target.value })}
                        />
                        <FormInput
                            label="Yield obtained under Farmer Practices (q/ha)"
                            required
                            type="number"
                            step="0.01"
                            value={formData.farmerPracticeYield || ''}
                            onChange={(e) => setFormData({ ...formData, farmerPracticeYield: e.target.value })}
                        />
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_CRA_EXTENSION_ACTIVITY && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect
                            label="Extension Activity"
                            required
                            value={formData.extensionActivityId || ''}
                            onChange={(e) => setFormData({ ...formData, extensionActivityId: parseInt(e.target.value) })}
                            options={extensionActivityTypes.map((ext: any) => ({ value: ext.activityId, label: ext.activityName }))}
                        />
                        <FormInput
                            label="Start Date"
                            required
                            type="date"
                            value={formData.startDate || ''}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                        <FormInput
                            label="End Date"
                            required
                            type="date"
                            value={formData.endDate || ''}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            label="Exposure visit (no.)"
                            required
                            type="number"
                            value={formData.exposureVisit || ''}
                            onChange={(e) => setFormData({ ...formData, exposureVisit: e.target.value })}
                        />
                    </div>
                </div>
            )}
        </>
    )
}
