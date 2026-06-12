import React from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { FormInput, FormSelect, FormSection } from '../shared/FormComponents'
import { CasteGenderTotals } from '@/components/common/CasteGenderTotals'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { DependentDropdown } from '@/components/common/DependentDropdown'
import { SpecifyOtherInput } from '@/components/common/SpecifyOtherInput'
import { useOtherSpecify } from '@/hooks/useOtherSpecify'
import { createMasterDataOptions } from '@/utils/formHelpers'

interface CraFormsProps {
    entityType: string
    formData: any
    setFormData: (data: any) => void
    seasons: any[]
    farmingSystems: any[]
    farmingSystemsLoading?: boolean
    croppingSystems: any[]
    croppingSystemsLoading?: boolean
    extensionActivityTypes: any[]
}

export const CraForms: React.FC<CraFormsProps> = ({
    entityType,
    formData,
    setFormData,
    seasons,
    farmingSystems,
    farmingSystemsLoading = false,
    croppingSystems,
    croppingSystemsLoading = false,
    extensionActivityTypes
}) => {
    const todayYmd = React.useMemo(() => new Date().toISOString().slice(0, 10), [])

    const croppingSystemOptions = React.useMemo(
        () => (croppingSystems || [])
            .filter((cs: any) => !formData.seasonId || Number(cs.seasonId ?? cs.SeasonId ?? cs.season?.seasonId) === Number(formData.seasonId))
            .map((cs: any) => ({ value: cs.craCropingSystemId ?? cs.id, label: cs.cropName ?? cs.croppingSystemName ?? cs.name, isOther: Boolean(cs.isOther) })),
        [croppingSystems, formData.seasonId]
    )
    const farmingSystemOptions = React.useMemo(
        () => (farmingSystems || [])
            .filter((fs: any) => !formData.seasonId || fs.seasonId === parseInt(formData.seasonId))
            .map((fs: any) => ({ value: fs.craFarmingSystemId, label: fs.farmingSystemName, isOther: Boolean(fs.isOther) })),
        [farmingSystems, formData.seasonId]
    )
    const { isOtherSelected: isOtherCropping, otherResetPatch: croppingResetPatch } = useOtherSpecify(croppingSystemOptions, formData.croppingSystemId)
    const { isOtherSelected: isOtherFarming, otherResetPatch: farmingResetPatch } = useOtherSpecify(farmingSystemOptions, formData.farmingSystemId)

    React.useEffect(() => {
        // Backfill croppingSystemId during edit for legacy rows that only have text.
        if (entityType !== ENTITY_TYPES.PROJECT_CRA_DETAILS) return
        if (!formData?.seasonId) return
        if (formData?.croppingSystemId) return

        const selectedText = String(formData?.croppingSystem || formData?.cropingSystem || '').trim().toLowerCase()
        if (!selectedText) return

        const matched = (croppingSystems || []).find((cs: any) => {
            const csSeasonId = Number(cs.seasonId ?? cs.SeasonId ?? cs.season?.seasonId)
            if (csSeasonId !== Number(formData.seasonId)) return false
            const label = String(cs.cropName ?? cs.croppingSystemName ?? cs.name ?? '').trim().toLowerCase()
            return label === selectedText
        })

        if (!matched) return

        const matchedId = matched.craCropingSystemId ?? matched.id
        if (matchedId === undefined || matchedId === null || matchedId === '') return

        setFormData({ ...formData, croppingSystemId: matchedId })
    }, [entityType, formData, setFormData, croppingSystems])

    return (
        <>
            {entityType === ENTITY_TYPES.PROJECT_CRA_DETAILS && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            label="Reporting Year"
                            required
                            type="date"
                            value={formData.reportingYear ?? ''}
                            onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
                        />
                        <MasterDataDropdown
                            label="Season"
                            required
                            value={formData.seasonId ?? ''}
                            onChange={(value) =>
                                setFormData({
                                    ...formData,
                                    seasonId: value,
                                    // reset dependents
                                    croppingSystemId: '',
                                    farmingSystemId: '',
                                    croppingSystemOther: '',
                                    farmingSystemOther: '',
                                })
                            }
                            options={createMasterDataOptions(seasons, 'seasonId', 'seasonName')}
                            emptyMessage="No seasons available"
                        />
                        <FormInput
                            label="Technology demonstrated/ interventions"
                            required
                            value={formData.interventions ?? ''}
                            onChange={(e) => setFormData({ ...formData, interventions: e.target.value })}
                        />
                        <DependentDropdown
                            label="Croping system"
                            required
                            value={formData.croppingSystemId ?? ''}
                            options={croppingSystemOptions}
                            dependsOn={{ value: formData.seasonId || '', field: 'seasonId' }}
                            isLoading={croppingSystemsLoading}
                            loadingMessage="Loading cropping systems..."
                            emptyMessage="No cropping systems available for selected season"
                            onOptionsLoad={async (parentSeasonId: any) => {
                                const seasonId = Number(parentSeasonId)
                                if (!Number.isFinite(seasonId)) return []
                                return (croppingSystems || [])
                                    .filter((cs: any) => Number(cs.seasonId ?? cs.SeasonId ?? cs.season?.seasonId) === seasonId)
                                    .map((cs: any) => ({
                                        value: cs.craCropingSystemId ?? cs.id,
                                        label: cs.cropName ?? cs.croppingSystemName ?? cs.name,
                                        isOther: Boolean(cs.isOther),
                                    }))
                            }}
                            cacheKey="cra-cropping-systems-by-season"
                            onChange={(value) => {
                                const selected = (croppingSystems || []).find(
                                    (cs: any) => Number(cs.craCropingSystemId ?? cs.id) === Number(value)
                                )
                                const selectedLabel =
                                    selected?.cropName ?? selected?.croppingSystemName ?? selected?.name ?? ''

                                setFormData({
                                    ...formData,
                                    croppingSystemId: value,
                                    croppingSystem: selectedLabel,
                                    ...croppingResetPatch(value, 'croppingSystemOther'),
                                })
                            }}
                        />
                        {isOtherCropping && (
                            <SpecifyOtherInput
                                label="Please specify other cropping system"
                                required
                                value={formData.croppingSystemOther}
                                onChange={(e) => setFormData({ ...formData, croppingSystemOther: e.target.value })}
                            />
                        )}
                        <MasterDataDropdown
                            label="Farming System crop under demonstration"
                            required
                            value={formData.farmingSystemId ?? ''}
                            onChange={(value) => setFormData({ ...formData, farmingSystemId: value, ...farmingResetPatch(value, 'farmingSystemOther') })}
                            isLoading={farmingSystemsLoading}
                            options={farmingSystemOptions}
                            placeholder="Select Farming System crop under demonstration"
                            emptyMessage={formData.seasonId ? "No systems found for this season" : "Please select a season first"}
                        />
                        {isOtherFarming && (
                            <SpecifyOtherInput
                                label="Please specify other farming system"
                                required
                                value={formData.farmingSystemOther}
                                onChange={(e) => setFormData({ ...formData, farmingSystemOther: e.target.value })}
                            />
                        )}
                        <FormInput
                            label="Area under Demonstration (in acre)"
                            required
                            type="number"
                            step="0.01"
                            value={formData.areaInAcre ?? ''}
                            onChange={(e) => setFormData({ ...formData, areaInAcre: e.target.value })}
                        />
                    </div>

                    <FormSection title="Farmers Details">
                        <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormInput label="General_M" required type="number" value={formData.genM ?? ''} onChange={e => setFormData({ ...formData, genM: e.target.value })} />
                            <FormInput label="General_F" required type="number" value={formData.genF ?? ''} onChange={e => setFormData({ ...formData, genF: e.target.value })} />
                            <FormInput label="OBC_M" required type="number" value={formData.obcM ?? ''} onChange={e => setFormData({ ...formData, obcM: e.target.value })} />
                            <FormInput label="OBC_F" required type="number" value={formData.obcF ?? ''} onChange={e => setFormData({ ...formData, obcF: e.target.value })} />

                            <FormInput label="SC_M" required type="number" value={formData.scM ?? ''} onChange={e => setFormData({ ...formData, scM: e.target.value })} />
                            <FormInput label="SC_F" required type="number" value={formData.scF ?? ''} onChange={e => setFormData({ ...formData, scF: e.target.value })} />
                            <FormInput label="ST_M" required type="number" value={formData.stM ?? ''} onChange={e => setFormData({ ...formData, stM: e.target.value })} />
                            <FormInput label="ST_F" required type="number" value={formData.stF ?? ''} onChange={e => setFormData({ ...formData, stF: e.target.value })} />
                        </div>
                        <CasteGenderTotals
                            values={formData}
                            maleFields={['genM', 'obcM', 'scM', 'stM']}
                            femaleFields={['genF', 'obcF', 'scF', 'stF']}
                        />
                    </FormSection>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            label="Crop Yield (q/ha)"
                            required
                            type="number"
                            step="0.01"
                            value={formData.cropYield ?? ''}
                            onChange={(e) => setFormData({ ...formData, cropYield: e.target.value })}
                        />
                        <FormInput
                            label="System productivity (q/ha)"
                            required
                            type="number"
                            step="0.01"
                            value={formData.systemProductivity ?? ''}
                            onChange={(e) => setFormData({ ...formData, systemProductivity: e.target.value })}
                        />
                        <FormInput
                            label="Total return (Rs./ha)"
                            required
                            type="number"
                            step="0.01"
                            value={formData.totalReturn ?? ''}
                            onChange={(e) => setFormData({ ...formData, totalReturn: e.target.value })}
                        />
                        <FormInput
                            label="Yield obtained under Farmer Practices (q/ha)"
                            required
                            type="number"
                            step="0.01"
                            value={formData.farmerPracticeYield ?? ''}
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
                            value={formData.extensionActivityId ?? ''}
                            onChange={(e) => setFormData({ ...formData, extensionActivityId: parseInt(e.target.value) })}
                            options={extensionActivityTypes.map((ext: any) => ({ value: ext.activityId, label: ext.activityName }))}
                        />
                        <FormInput
                            label="Start Date"
                            required
                            type="date"
                            value={formData.startDate ?? ''}
                            max={todayYmd}
                            onChange={(e) => {
                                const nextStartDate = e.target.value
                                const currentEndDate = formData.endDate ? String(formData.endDate) : ''

                                setFormData({
                                    ...formData,
                                    startDate: nextStartDate,
                                    endDate:
                                        currentEndDate &&
                                        (currentEndDate < nextStartDate || currentEndDate > todayYmd)
                                            ? nextStartDate
                                            : currentEndDate,
                                })
                            }}
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
                    </div>

                    <FormSection title="Farmers Details">
                        <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormInput label="General_M" required type="number" wholeNumberOnly value={formData.genM || ''} onChange={e => setFormData({ ...formData, genM: e.target.value })} />
                            <FormInput label="General_F" required type="number" wholeNumberOnly value={formData.genF || ''} onChange={e => setFormData({ ...formData, genF: e.target.value })} />
                            <FormInput label="OBC_M" required type="number" wholeNumberOnly value={formData.obcM || ''} onChange={e => setFormData({ ...formData, obcM: e.target.value })} />
                            <FormInput label="OBC_F" required type="number" wholeNumberOnly value={formData.obcF || ''} onChange={e => setFormData({ ...formData, obcF: e.target.value })} />

                            <FormInput label="SC_M" required type="number" wholeNumberOnly value={formData.scM || ''} onChange={e => setFormData({ ...formData, scM: e.target.value })} />
                            <FormInput label="SC_F" required type="number" wholeNumberOnly value={formData.scF || ''} onChange={e => setFormData({ ...formData, scF: e.target.value })} />
                            <FormInput label="ST_M" required type="number" wholeNumberOnly value={formData.stM || ''} onChange={e => setFormData({ ...formData, stM: e.target.value })} />
                            <FormInput label="ST_F" required type="number" wholeNumberOnly value={formData.stF || ''} onChange={e => setFormData({ ...formData, stF: e.target.value })} />
                        </div>
                        <CasteGenderTotals
                            values={formData}
                            maleFields={['genM', 'obcM', 'scM', 'stM']}
                            femaleFields={['genF', 'obcF', 'scF', 'stF']}
                        />
                    </FormSection>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            label="Exposure visit (no.)"
                            required
                            type="number"
                            wholeNumberOnly
                            value={formData.exposureVisit || ''}
                            onChange={(e) => setFormData({ ...formData, exposureVisit: e.target.value })}
                        />
                    </div>
                </div>
            )}
        </>
    )
}
