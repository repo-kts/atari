import React, { useMemo } from 'react'
import { ENTITY_TYPES } from '../../../../constants/entityTypes'
import { ExtendedEntityType } from '../../../../utils/masterUtils'
import { FormInput, FormSelect } from './shared/FormComponents'
import { useYears } from '../../../../hooks/useOtherMastersData'
import { useSoilWaterAnalysisMasters } from '../../../../hooks/useSoilWaterData'

interface SoilWaterTestingProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

export const SoilWaterTesting: React.FC<SoilWaterTestingProps> = ({
    entityType,
    formData,
    setFormData,
}) => {
    const { data: years = [] } = useYears();
    const { data: analysisMasters = [] } = useSoilWaterAnalysisMasters();

    const yearOptions = useMemo(() => {
        return years.map((y: any) => {
            let label = y.yearName || y.year || y.name;
            // If the label is just a 4-digit number (e.g. "2024"), format it to "2024-25"
            if (label && /^\d{4}$/.test(String(label))) {
                const startYear = parseInt(label);
                label = `${startYear}-${(startYear + 1).toString().slice(2)}`;
            }
            return { value: label, label: label };
        });
    }, [years]);

    const analysisOptions = useMemo(() =>
        analysisMasters.map((a: any) => ({ value: String(a.soilWaterAnalysisId), label: a.analysisName })),
        [analysisMasters]);

    if (!entityType) return null

    return (
        <>
            {/* Equipment Details Form */}
            {entityType === ENTITY_TYPES.ACHIEVEMENT_SOIL_EQUIPMENT && (
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800">Soil and Water Testing - Equipment Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect
                            label="Reporting Year"
                            required
                            value={formData.reportingYear || ''}
                            onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
                            options={yearOptions}
                        />
                        <FormSelect
                            label="Analysis Type"
                            required
                            value={formData.soilWaterAnalysisId || ''}
                            onChange={(e) => setFormData({ ...formData, soilWaterAnalysisId: e.target.value })}
                            options={analysisOptions}
                        />
                        <FormInput
                            label="Name of the Equipment"
                            required
                            value={formData.equipmentName || ''}
                            onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
                            placeholder="Enter equipment name"
                        />
                        <FormInput
                            label="Qty."
                            type="number"
                            required
                            value={formData.quantity || ''}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            placeholder="Enter quantity"
                        />
                    </div>
                </div>
            )}

            {/* Analysis Details Form */}
            {entityType === ENTITY_TYPES.ACHIEVEMENT_SOIL_ANALYSIS && (
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800">Detail of Soil, Water and Plant analysis at KVK</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            label="Start Date"
                            type="date"
                            required
                            value={formData.startDate ? formData.startDate.split('T')[0] : ''}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                        <FormInput
                            label="End Date"
                            type="date"
                            required
                            value={formData.endDate ? formData.endDate.split('T')[0] : ''}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                        <FormSelect
                            label="Analysis"
                            required
                            value={formData.analysisId || ''}
                            onChange={(e) => setFormData({ ...formData, analysisId: e.target.value })}
                            options={analysisOptions}
                        />
                        <FormSelect
                            label="Samples analyzed Through"
                            required
                            value={formData.samplesAnalysedThrough || ''}
                            onChange={(e) => setFormData({ ...formData, samplesAnalysedThrough: e.target.value })}
                            options={[
                                { value: 'Mini soil testing kit', label: 'Mini soil testing kit' },
                                { value: 'Soil testing laboratory', label: 'Soil testing laboratory' },
                                { value: 'Other', label: 'Other' },
                            ]}
                        />
                        <FormInput
                            label="No. of Samples analyzed"
                            type="number"
                            required
                            value={formData.samplesAnalysed || ''}
                            onChange={(e) => setFormData({ ...formData, samplesAnalysed: e.target.value })}
                            placeholder="Enter number of samples"
                        />
                        <FormInput
                            label="No. of Villages"
                            type="number"
                            required
                            value={formData.villagesNumber || ''}
                            onChange={(e) => setFormData({ ...formData, villagesNumber: e.target.value })}
                            placeholder="Enter number of villages"
                        />
                        <FormInput
                            label="Amount realized (Rs.)"
                            type="number"
                            required
                            value={formData.amountRealized || ''}
                            onChange={(e) => setFormData({ ...formData, amountRealized: e.target.value })}
                            placeholder="Enter amount"
                        />
                        <FormSelect
                            label="Reporting Year"
                            required
                            value={formData.reportingYear || ''}
                            onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
                            options={yearOptions}
                        />
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200/60 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Farmers Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <FormInput label="General_M" type="number" required value={formData.generalM || ''} onChange={(e) => setFormData({ ...formData, generalM: e.target.value })} />
                            <FormInput label="General_F" type="number" required value={formData.generalF || ''} onChange={(e) => setFormData({ ...formData, generalF: e.target.value })} />
                            <FormInput label="OBC_M" type="number" required value={formData.obcM || ''} onChange={(e) => setFormData({ ...formData, obcM: e.target.value })} />
                            <FormInput label="OBC_F" type="number" required value={formData.obcF || ''} onChange={(e) => setFormData({ ...formData, obcF: e.target.value })} />
                            <FormInput label="SC_M" type="number" required value={formData.scM || ''} onChange={(e) => setFormData({ ...formData, scM: e.target.value })} />
                            <FormInput label="SC_F" type="number" required value={formData.scF || ''} onChange={(e) => setFormData({ ...formData, scF: e.target.value })} />
                            <FormInput label="ST_M" type="number" required value={formData.stM || ''} onChange={(e) => setFormData({ ...formData, stM: e.target.value })} />
                            <FormInput label="ST_F" type="number" required value={formData.stF || ''} onChange={(e) => setFormData({ ...formData, stF: e.target.value })} />
                        </div>
                    </div>
                </div>
            )}

            {/* World Soil Day */}
            {entityType === ENTITY_TYPES.ACHIEVEMENT_WORLD_SOIL_DAY && (
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800">Details of World Soil Day Celebration</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect
                            label="Reporting Year"
                            required
                            value={formData.reportingYear || ''}
                            onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
                            options={yearOptions}
                        />
                        <FormInput
                            label="No. of Activity conducted"
                            type="number"
                            required
                            value={formData.activitiesConducted || ''}
                            onChange={(e) => setFormData({ ...formData, activitiesConducted: e.target.value })}
                            placeholder="Enter number of activities"
                        />
                        <FormInput
                            label="Soil Health Cards distributed"
                            type="number"
                            required
                            value={formData.soilHealthCardDistributed || ''}
                            onChange={(e) => setFormData({ ...formData, soilHealthCardDistributed: e.target.value })}
                            placeholder="Enter number distributed"
                        />
                        <div className="space-y-1">
                            <FormInput
                                label="Name (s) of VIP(s) involved if any"
                                required
                                value={formData.vipNames || ''}
                                onChange={(e) => setFormData({ ...formData, vipNames: e.target.value })}
                                placeholder="Enter VIP names"
                            />
                            <p className="text-xs text-gray-500">For multiple VIP entries, please add data separated by commas, like: abc, xyz.</p>
                        </div>
                        <FormInput
                            label="Total No. of Participants attended the program"
                            type="number"
                            required
                            value={formData.participants || ''}
                            onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                            placeholder="Enter number of participants"
                        />
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200/60 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Farmers Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <FormInput label="General_M" type="number" required value={formData.generalM || ''} onChange={(e) => setFormData({ ...formData, generalM: e.target.value })} />
                            <FormInput label="General_F" type="number" required value={formData.generalF || ''} onChange={(e) => setFormData({ ...formData, generalF: e.target.value })} />
                            <FormInput label="OBC_M" type="number" required value={formData.obcM || ''} onChange={(e) => setFormData({ ...formData, obcM: e.target.value })} />
                            <FormInput label="OBC_F" type="number" required value={formData.obcF || ''} onChange={(e) => setFormData({ ...formData, obcF: e.target.value })} />
                            <FormInput label="SC_M" type="number" required value={formData.scM || ''} onChange={(e) => setFormData({ ...formData, scM: e.target.value })} />
                            <FormInput label="SC_F" type="number" required value={formData.scF || ''} onChange={(e) => setFormData({ ...formData, scF: e.target.value })} />
                            <FormInput label="ST_M" type="number" required value={formData.stM || ''} onChange={(e) => setFormData({ ...formData, stM: e.target.value })} />
                            <FormInput label="ST_F" type="number" required value={formData.stF || ''} onChange={(e) => setFormData({ ...formData, stF: e.target.value })} />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
