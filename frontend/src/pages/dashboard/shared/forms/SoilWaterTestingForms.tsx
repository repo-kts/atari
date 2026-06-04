import React, { useMemo } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput, FormSelect } from './shared/FormComponents'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { useYears, useSoilWaterAnalyses } from '@/hooks/useOtherMastersData'
import { useAuth } from '@/contexts/AuthContext'
import { createMasterDataOptions } from '@/utils/formHelpers'

interface SoilWaterTestingProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

export const SoilWaterTestingForms: React.FC<SoilWaterTestingProps> = ({
    entityType,
    formData,
    setFormData,
}) => {
    const todayYmd = new Date().toISOString().slice(0, 10)
    const { user } = useAuth()
    const { data: years = [] } = useYears();
    const { data: soilWaterAnalyses = [] } = useSoilWaterAnalyses();

    // Automatically sync kvkId from user session if it's missing in formData
    React.useEffect(() => {
        if (user?.kvkId && !formData.kvkId && !formData.id) {
            setFormData({ ...formData, kvkId: user.kvkId })
        }
    }, [user?.kvkId, formData.kvkId, formData.id, setFormData])

    const yearOptions = useMemo(() =>
        createMasterDataOptions(years, 'reportingYear', 'yearName'),
        [years]
    );

    const analysisOptions = useMemo(() =>
        createMasterDataOptions(soilWaterAnalyses, 'soilWaterAnalysisId', 'analysisName'),
        [soilWaterAnalyses]);

    if (!entityType) return null

    return (
        <>
            {/* Equipment Details Form */}
            {entityType === ENTITY_TYPES.ACHIEVEMENT_SOIL_EQUIPMENT && (
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800">Soil and Water Testing - Equipment Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <MasterDataDropdown
                            label="Reporting Year"
                            required
                            value={formData.reportingYear ?? ''}
                            onChange={(value) => setFormData({ ...formData, reportingYear: value })}
                            options={yearOptions}
                            emptyMessage="No reporting years available. Add them from All Masters."
                        />
                        <MasterDataDropdown
                            label="Soil Water Analysis Type"
                            required
                            value={formData.soilWaterAnalysisId ?? ''}
                            onChange={(value) => setFormData({ ...formData, soilWaterAnalysisId: value })}
                            options={analysisOptions}
                            emptyMessage="No soil water analysis types available. Add them from All Masters."
                        />
                        <FormInput
                            label="Name of the Equipment"
                            required
                            value={formData.equipmentName ?? ''}
                            onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
                            placeholder="Enter equipment name"
                        />
                        <FormInput
                            label="Qty."
                            type="number"
                            required
                            value={formData.quantity ?? ''}
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
                            max={todayYmd}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                        <FormInput
                            label="End Date"
                            type="date"
                            required
                            value={formData.endDate ? formData.endDate.split('T')[0] : ''}
                            min={formData.startDate ? formData.startDate.split('T')[0] : undefined}
                            max={todayYmd}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                        <MasterDataDropdown
                            label="Analysis"
                            required
                            value={formData.analysisId || formData.soilWaterAnalysisId || ''}
                            onChange={(value) => setFormData({ ...formData, analysisId: value, soilWaterAnalysisId: value })}
                            options={analysisOptions}
                            emptyMessage="No soil water analysis types available. Add them from All Masters."
                        />
                        {/* hard coded options for samples analyzed through */}
                        <FormSelect
                            label="Samples analyzed Through"
                            required
                            value={formData.samplesAnalysedThrough ?? ''}
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
                            value={formData.samplesAnalysed ?? ''}
                            onChange={(e) => setFormData({ ...formData, samplesAnalysed: e.target.value })}
                            placeholder="Enter number of samples"
                        />
                        <FormInput
                            label="No. of Villages"
                            type="number"
                            required
                            value={formData.villagesNumber ?? ''}
                            onChange={(e) => setFormData({ ...formData, villagesNumber: e.target.value })}
                            placeholder="Enter number of villages"
                        />
                        <FormInput
                            label="Amount realized (Rs.)"
                            type="number"
                            required
                            value={formData.amountRealized ?? ''}
                            onChange={(e) => setFormData({ ...formData, amountRealized: e.target.value })}
                            placeholder="Enter amount"
                        />
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200/60 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Farmers Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <FormInput label="General_M" type="number" required value={formData.generalM ?? ''} onChange={(e) => setFormData({ ...formData, generalM: e.target.value })} />
                            <FormInput label="General_F" type="number" required value={formData.generalF ?? ''} onChange={(e) => setFormData({ ...formData, generalF: e.target.value })} />
                            <FormInput label="OBC_M" type="number" required value={formData.obcM ?? ''} onChange={(e) => setFormData({ ...formData, obcM: e.target.value })} />
                            <FormInput label="OBC_F" type="number" required value={formData.obcF ?? ''} onChange={(e) => setFormData({ ...formData, obcF: e.target.value })} />
                            <FormInput label="SC_M" type="number" required value={formData.scM ?? ''} onChange={(e) => setFormData({ ...formData, scM: e.target.value })} />
                            <FormInput label="SC_F" type="number" required value={formData.scF ?? ''} onChange={(e) => setFormData({ ...formData, scF: e.target.value })} />
                            <FormInput label="ST_M" type="number" required value={formData.stM ?? ''} onChange={(e) => setFormData({ ...formData, stM: e.target.value })} />
                            <FormInput label="ST_F" type="number" required value={formData.stF ?? ''} onChange={(e) => setFormData({ ...formData, stF: e.target.value })} />
                        </div>

                        <div className="flex flex-wrap gap-3 pt-4">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E8F5E9] border border-[#C8E6C9]">
                                <span className="text-xs font-semibold text-[#2E7D32] uppercase">Total Male</span>
                                <span className="text-sm font-bold text-[#1B5E20] tabular-nums">
                                    {(Number(formData.generalM) || 0) +
                                        (Number(formData.obcM) || 0) +
                                        (Number(formData.scM) || 0) +
                                        (Number(formData.stM) || 0)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#FCE4EC] border border-[#F8BBD0]">
                                <span className="text-xs font-semibold text-[#AD1457] uppercase">Total Female</span>
                                <span className="text-sm font-bold text-[#880E4F] tabular-nums">
                                    {(Number(formData.generalF) || 0) +
                                        (Number(formData.obcF) || 0) +
                                        (Number(formData.scF) || 0) +
                                        (Number(formData.stF) || 0)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E3F2FD] border border-[#BBDEFB]">
                                <span className="text-xs font-semibold text-[#1565C0] uppercase">Overall Total</span>
                                <span className="text-sm font-bold text-[#0D47A1] tabular-nums">
                                    {(Number(formData.generalM) || 0) +
                                        (Number(formData.generalF) || 0) +
                                        (Number(formData.obcM) || 0) +
                                        (Number(formData.obcF) || 0) +
                                        (Number(formData.scM) || 0) +
                                        (Number(formData.scF) || 0) +
                                        (Number(formData.stM) || 0) +
                                        (Number(formData.stF) || 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* World Soil Day */}
            {entityType === ENTITY_TYPES.ACHIEVEMENT_WORLD_SOIL_DAY && (
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800">Details of World Soil Day Celebration</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <MasterDataDropdown
                            label="Reporting Year"
                            required
                            value={formData.reportingYear ?? ''}
                            onChange={(value) => setFormData({ ...formData, reportingYear: value })}
                            options={yearOptions}
                            emptyMessage="No reporting years available. Add them from All Masters."
                        />
                        <FormInput
                            label="No. of Activity conducted"
                            type="number"
                            required
                            value={formData.activitiesConducted ?? ''}
                            onChange={(e) => setFormData({ ...formData, activitiesConducted: e.target.value })}
                            placeholder="Enter number of activities"
                        />
                        <FormInput
                            label="Soil Health Cards distributed"
                            type="number"
                            required
                            value={formData.soilHealthCardDistributed ?? ''}
                            onChange={(e) => setFormData({ ...formData, soilHealthCardDistributed: e.target.value })}
                            placeholder="Enter number distributed"
                        />
                        <div className="space-y-1">
                            <FormInput
                                label="Name (s) of VIP(s) involved if any"
                                required
                                value={formData.vipNames ?? ''}
                                onChange={(e) => setFormData({ ...formData, vipNames: e.target.value })}
                                placeholder="Enter VIP names"
                            />
                            <p className="text-xs text-gray-500">For multiple VIP entries, please add data separated by commas, like: abc, xyz.</p>
                        </div>
                        <FormInput
                            label="Total No. of Participants attended the program"
                            type="number"
                            required
                            value={formData.participants ?? ''}
                            onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                            placeholder="Enter number of participants"
                        />
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200/60 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Farmers Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <FormInput label="General_M" type="number" required value={formData.generalM ?? ''} onChange={(e) => setFormData({ ...formData, generalM: e.target.value })} />
                            <FormInput label="General_F" type="number" required value={formData.generalF ?? ''} onChange={(e) => setFormData({ ...formData, generalF: e.target.value })} />
                            <FormInput label="OBC_M" type="number" required value={formData.obcM ?? ''} onChange={(e) => setFormData({ ...formData, obcM: e.target.value })} />
                            <FormInput label="OBC_F" type="number" required value={formData.obcF ?? ''} onChange={(e) => setFormData({ ...formData, obcF: e.target.value })} />
                            <FormInput label="SC_M" type="number" required value={formData.scM ?? ''} onChange={(e) => setFormData({ ...formData, scM: e.target.value })} />
                            <FormInput label="SC_F" type="number" required value={formData.scF ?? ''} onChange={(e) => setFormData({ ...formData, scF: e.target.value })} />
                            <FormInput label="ST_M" type="number" required value={formData.stM ?? ''} onChange={(e) => setFormData({ ...formData, stM: e.target.value })} />
                            <FormInput label="ST_F" type="number" required value={formData.stF ?? ''} onChange={(e) => setFormData({ ...formData, stF: e.target.value })} />
                        </div>

                        <div className="flex flex-wrap gap-3 pt-4">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E8F5E9] border border-[#C8E6C9]">
                                <span className="text-xs font-semibold text-[#2E7D32] uppercase">Total Male</span>
                                <span className="text-sm font-bold text-[#1B5E20] tabular-nums">
                                    {(Number(formData.generalM) || 0) +
                                        (Number(formData.obcM) || 0) +
                                        (Number(formData.scM) || 0) +
                                        (Number(formData.stM) || 0)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#FCE4EC] border border-[#F8BBD0]">
                                <span className="text-xs font-semibold text-[#AD1457] uppercase">Total Female</span>
                                <span className="text-sm font-bold text-[#880E4F] tabular-nums">
                                    {(Number(formData.generalF) || 0) +
                                        (Number(formData.obcF) || 0) +
                                        (Number(formData.scF) || 0) +
                                        (Number(formData.stF) || 0)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E3F2FD] border border-[#BBDEFB]">
                                <span className="text-xs font-semibold text-[#1565C0] uppercase">Overall Total</span>
                                <span className="text-sm font-bold text-[#0D47A1] tabular-nums">
                                    {(Number(formData.generalM) || 0) +
                                        (Number(formData.generalF) || 0) +
                                        (Number(formData.obcM) || 0) +
                                        (Number(formData.obcF) || 0) +
                                        (Number(formData.scM) || 0) +
                                        (Number(formData.scF) || 0) +
                                        (Number(formData.stM) || 0) +
                                        (Number(formData.stF) || 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
