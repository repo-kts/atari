import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ENTITY_TYPES } from '@/constants/entityConstants';
import { MONTHS } from '@/constants/monthConstants';
import { FormInput, FormSelect, FormSection } from '../shared/FormComponents';
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown';
import { DependentDropdown } from '@/components/common/DependentDropdown';
import { createMasterDataOptions } from '@/utils/formHelpers';
import { useSeasons, useCropTypes, useCfldExtensionActivityTypes } from '@/hooks/useOtherMastersData';
import { useCfldCrops } from '@/hooks/useOftFldData';

interface CfldFormsProps {
    entityType: string;
    formData: any;
    setFormData: (data: any) => void;
}

/**
 * Highly optimized and reusable CFLD Forms component
 * - Uses TanStack Query for data fetching
 * - All handlers extracted outside component using useCallback
 * - Memoized options for performance
 * - Clean separation of concerns
 */
export const CfldForms: React.FC<CfldFormsProps> = ({
    entityType,
    formData,
    setFormData,
}) => {
    type CfldSection = 'technical' | 'economic' | 'socio' | 'perception'
    const [cfldSection, setCfldSection] = useState<CfldSection>('technical')

    useEffect(() => {
        const active = (formData?.cfldActiveSection || '').toString().toLowerCase()
        if (active === 'economic') setCfldSection('economic')
        else if (active === 'socio') setCfldSection('socio')
        else if (active === 'perception') setCfldSection('perception')
        else setCfldSection('technical')
    }, [formData?.cfldActiveSection])

    // Normalize incoming formData when editing so that all alias fields are populated
    useEffect(() => {
        if (!formData || !entityType) return;

        // Only normalize for CFLD project entities
        if (!entityType.includes('cfld')) return;

        setFormData((prev: any) => {
            if (!prev) return prev;

            const next: any = { ...prev };
            let changed = false;

            // Month: convert stored value (Date or ISO string) to month name once for the select
            if (next.month) {
                if (next.month instanceof Date) {
                    const monthName = next.month.toLocaleString('default', { month: 'long' });
                    if (monthName && monthName !== next.month) {
                        next.month = monthName;
                        changed = true;
                    }
                } else if (typeof next.month === 'string') {
                    // If it's already a month name, keep as is
                    const lower = next.month.toLowerCase();
                    const monthNames = MONTHS.map((m) => m.label.toLowerCase());
                    if (!monthNames.includes(lower)) {
                        const parsed = new Date(next.month);
                        if (!Number.isNaN(parsed.getTime())) {
                            const monthName = parsed.toLocaleString('default', { month: 'long' });
                            next.month = monthName;
                            changed = true;
                        }
                    }
                }
            }

            // Area aliases
            if (next.areaInHa == null && next.areaHectare != null) {
                next.areaInHa = next.areaHectare;
                changed = true;
            }

            // Yield aliases (demo vs UI field names)
            if (next.yieldMin == null && next.demoYieldMin != null) {
                next.yieldMin = next.demoYieldMin;
                changed = true;
            }
            if (next.yieldMax == null && next.demoYieldMax != null) {
                next.yieldMax = next.demoYieldMax;
                changed = true;
            }
            if (next.yieldAvg == null && next.demoYieldAvg != null) {
                next.yieldAvg = next.demoYieldAvg;
                changed = true;
            }

            // Yield gap aliases
            if (next.yieldGapDistrict == null && next.districtYield != null) {
                next.yieldGapDistrict = next.districtYield;
                changed = true;
            }
            if (next.yieldGapState == null && next.stateYield != null) {
                next.yieldGapState = next.stateYield;
                changed = true;
            }
            if (next.yieldGapPotential == null && next.potentialYield != null) {
                next.yieldGapPotential = next.potentialYield;
                changed = true;
            }

            if (next.yieldGapMinimisedDistrict == null && next.yieldGapDistrictMinimized != null) {
                next.yieldGapMinimisedDistrict = next.yieldGapDistrictMinimized;
                changed = true;
            }
            if (next.yieldGapMinimisedState == null && next.yieldGapStateMinimized != null) {
                next.yieldGapMinimisedState = next.yieldGapStateMinimized;
                changed = true;
            }
            if (next.yieldGapMinimisedPotential == null && next.yieldGapPotentialMinimized != null) {
                next.yieldGapMinimisedPotential = next.yieldGapPotentialMinimized;
                changed = true;
            }

            // Crop: backend sends cropName, form uses crop
            if (next.crop == null && next.cropName != null) {
                next.crop = next.cropName;
                changed = true;
            }

            // Farmer category aliases (generalM -> genM, etc.)
            if (next.genM == null && next.generalM != null) {
                next.genM = next.generalM;
                changed = true;
            }
            if (next.genF == null && next.generalF != null) {
                next.genF = next.generalF;
                changed = true;
            }

            // Keep OBC / SC / ST as-is (field names already match backend)

            return changed ? next : prev;
        });
    }, [entityType, formData, setFormData]);
    // Data fetching hooks - only fetch when needed
    const { data: seasons = [] } = useSeasons();
    const { data: cropTypes = [] } = useCropTypes();
    const { data: extensionActivityTypes = [] } = useCfldExtensionActivityTypes();
    const { data: cfldCrops = [] } = useCfldCrops();

    // Memoized options for dropdowns
    const seasonOptions = useMemo(
        () => createMasterDataOptions(seasons, 'seasonId', 'seasonName'),
        [seasons]
    );


    // Function to load CFLD crops by crop type ID
    const loadCfldCropsByType = useCallback(
        async (compositeValue: number | string, signal?: AbortSignal): Promise<Array<{ value: string | number; label: string }>> => {
            try {
                const parsed = String(compositeValue || '')
                const [seasonIdRaw, typeIdRaw] = parsed.split('-')
                const seasonId = Number(seasonIdRaw)
                const typeId = Number(typeIdRaw)

                if (!Number.isFinite(seasonId) || !Number.isFinite(typeId)) return []

                // Filter crops by typeId from already loaded data
                const filteredCrops = cfldCrops.filter((crop: any) => {
                    const cropTypeId = crop.typeId || crop.cropType?.typeId || crop.CropTypeId
                    const cropSeasonId = crop.seasonId ?? crop.SeasonId ?? crop.season?.seasonId
                    return Number(cropTypeId) === Number(typeId) && Number(cropSeasonId) === Number(seasonId)
                });

                // If no crops found in loaded data, try fetching from API
                if (filteredCrops.length === 0) {
                    // Note: The API endpoint requires both seasonId and typeId, but we can pass a dummy seasonId
                    // For now, we'll just return empty array if not found in loaded data
                    // In the future, we could add a dedicated endpoint for filtering by type only
                    return [];
                }

                return filteredCrops.map((crop: any) => ({
                    value: crop.CropName || crop.cropName,
                    label: crop.CropName || crop.cropName,
                }));
            } catch (error) {
                if (signal?.aborted) {
                    return [];
                }
                console.error('Error loading CFLD crops by type:', error);
                return [];
            }
        },
        [cfldCrops]
    );

    const extensionActivityOptions = useMemo(
        () => extensionActivityTypes.map((ext: any) => ({
            value: ext.extensionActivityId ?? ext.activityId ?? ext.id,
            label: ext.extensionName ?? ext.activityName ?? ext.name,
        })),
        [extensionActivityTypes]
    );

    // Generic field update handler
    const handleFieldChange = useCallback(
        (field: string, value: any) => {
            setFormData((prev: any) => ({ ...prev, [field]: value }));
        },
        [setFormData]
    );

    // Month change handler
    const handleMonthChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            handleFieldChange('month', e.target.value);
        },
        [handleFieldChange]
    );

    const handleCropTypeChangeFromValue = useCallback(
        (value: string | number) => {
            const parsed = Number(value)
            const selectedType = cropTypes.find((ct: any) => (ct.id || ct.typeId) === parsed)
            setFormData((prev: any) => ({
                ...prev,
                cropTypeId: parsed,
                type: selectedType ? selectedType.typeName.toUpperCase() : '',
                // Reset CFLD crop because it depends on crop type (+ season) via DependentDropdown
                crop: '',
                cropName: '',
            }))
        },
        [cropTypes, setFormData]
    )

    // Season change handler
    const handleSeasonChange = useCallback(
        (value: string | number) => {
            handleFieldChange('seasonId', value);
        },
        [handleFieldChange]
    );

    // Crop change handler (for DependentDropdown)
    const handleCropChange = useCallback(
        (value: string | number) => {
            handleFieldChange('crop', value);
        },
        [handleFieldChange]
    );

    // Crop change handler for FormSelect (budget form)
    const handleCropChangeFormSelect = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            handleFieldChange('crop', e.target.value);
        },
        [handleFieldChange]
    );

    // Extension activity change handler
    const handleExtensionActivityChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            handleFieldChange('extensionActivityId', parseInt(e.target.value));
        },
        [handleFieldChange]
    );

    const handleReportingYearChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            handleFieldChange('reportingYear', e.target.value);
        },
        [handleFieldChange]
    );

    const setActiveSection = useCallback(
        (next: CfldSection) => {
            setCfldSection(next)
            setFormData((prev: any) => ({
                ...prev,
                cfldActiveSection: next,
            }))
        },
        [setFormData]
    )

    // File upload handlers
    const handleFileChange = useCallback(
        (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
            handleFieldChange(field, e.target.files?.[0]);
        },
        [handleFieldChange]
    );

    const renderEconomicParametersForm = () => (
        <div className="space-y-8">
            <h2 className="text-xl font-semibold text-[#487749]">Economic Parameters of CFLD</h2>

            <FormSection title="Farmer’s Existing plot">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="Gross Cost (Rs/ha)" required type="number" step="0.01" value={formData.existingPlotGrossCost ?? ''} onChange={(e) => handleFieldChange('existingPlotGrossCost', e.target.value)} />
                    <FormInput label="Gross return (Rs/ha)" required type="number" step="0.01" value={formData.existingPlotGrossReturn ?? ''} onChange={(e) => handleFieldChange('existingPlotGrossReturn', e.target.value)} />
                    <FormInput label="Net Return (Rs/ha)" required type="number" step="0.01" value={formData.existingPlotNetReturn ?? ''} onChange={(e) => handleFieldChange('existingPlotNetReturn', e.target.value)} />
                    <FormInput label="B:C ratio" required type="number" step="0.01" value={formData.existingPlotBcr ?? ''} onChange={(e) => handleFieldChange('existingPlotBcr', e.target.value)} />
                </div>
            </FormSection>

            <FormSection title="Demonstration plot">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="Gross Cost (Rs/ha)" required type="number" step="0.01" value={formData.demonstrationPlotGrossCost ?? ''} onChange={(e) => handleFieldChange('demonstrationPlotGrossCost', e.target.value)} />
                    <FormInput label="Gross return (Rs/ha)" required type="number" step="0.01" value={formData.demonstrationPlotGrossReturn ?? ''} onChange={(e) => handleFieldChange('demonstrationPlotGrossReturn', e.target.value)} />
                    <FormInput label="Net Return (Rs/ha)" required type="number" step="0.01" value={formData.demonstrationPlotNetReturn ?? ''} onChange={(e) => handleFieldChange('demonstrationPlotNetReturn', e.target.value)} />
                    <FormInput label="B:C ratio" required type="number" step="0.01" value={formData.demonstrationPlotBcr ?? ''} onChange={(e) => handleFieldChange('demonstrationPlotBcr', e.target.value)} />
                </div>
            </FormSection>

            <FormSection title="Additional income">
                <FormInput
                    label="Additional Income (Rs/ha)"
                    required
                    type="number"
                    step="0.01"
                    value={formData.additionalIncome ?? ''}
                    onChange={(e) => handleFieldChange('additionalIncome', e.target.value)}
                />
            </FormSection>
        </div>
    )

    const renderSocioEconomicForm = () => (
        <div className="space-y-8">
            <h2 className="text-xl font-semibold text-[#487749]">Update Socio Economic Parameters of CFLD</h2>

            <FormSection title="Socio Economic Parameters">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="Total Produce Obtained (kg)" required type="number" step="0.01" value={formData.totalProduceObtainedKg ?? ''} onChange={(e) => handleFieldChange('totalProduceObtainedKg', e.target.value)} />
                    <FormInput label="Produce sold (kg/ household)" required type="number" step="0.01" value={formData.produceSoldKgPerHousehold ?? ''} onChange={(e) => handleFieldChange('produceSoldKgPerHousehold', e.target.value)} />
                    <FormInput label="Selling Rate (Rs/Kg)" required type="number" step="0.01" value={formData.sellingRateRsPerKg ?? ''} onChange={(e) => handleFieldChange('sellingRateRsPerKg', e.target.value)} />
                    <FormInput label="Produce used for own sowing (Kg)" required type="number" step="0.01" value={formData.produceUsedForOwnSowingKg ?? ''} onChange={(e) => handleFieldChange('produceUsedForOwnSowingKg', e.target.value)} />
                    <FormInput label="Produce distributed to other farmers (Kg)" required type="number" step="0.01" value={formData.produceDistributedToOtherFarmersKg ?? ''} onChange={(e) => handleFieldChange('produceDistributedToOtherFarmersKg', e.target.value)} />
                    <FormInput label="Purpose for which income gained was utilized" required value={formData.incomeUtilizationPurpose ?? ''} onChange={(e) => handleFieldChange('incomeUtilizationPurpose', e.target.value)} />
                    <div className="md:col-span-2">
                        <FormInput label="Employment Generated (Mandays/ house hold)" required type="number" step="0.01" value={formData.employmentGeneratedMandaysPerHousehold ?? ''} onChange={(e) => handleFieldChange('employmentGeneratedMandaysPerHousehold', e.target.value)} />
                    </div>
                </div>
            </FormSection>
        </div>
    )

    const renderFarmersPerceptionForm = () => (
        <div className="space-y-8">
            <h2 className="text-xl font-semibold text-[#487749]">Farmers Perception parameters of CFLD</h2>

            <FormSection title="Farmers Perception Parameters">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="Suitability to their farming system" required value={formData.suitabilityToFarmingSystem ?? ''} onChange={(e) => handleFieldChange('suitabilityToFarmingSystem', e.target.value)} />
                    <FormInput label="Likings (Preference)" required value={formData.likingPreference ?? ''} onChange={(e) => handleFieldChange('likingPreference', e.target.value)} />
                    <FormInput label="Affordability" required value={formData.affordability ?? ''} onChange={(e) => handleFieldChange('affordability', e.target.value)} />
                    <FormInput label="Any negative effect" required value={formData.anyNegativeEffect ?? ''} onChange={(e) => handleFieldChange('anyNegativeEffect', e.target.value)} />
                    <FormInput label="Is Technology acceptable to all in the group/village" required value={formData.technologyAcceptableToAllGroupVillage ?? ''} onChange={(e) => handleFieldChange('technologyAcceptableToAllGroupVillage', e.target.value)} />
                    <FormInput label="Suggestions, for change/improvement, if any" required value={formData.suggestionsForChangeOrImprovementIfAny ?? ''} onChange={(e) => handleFieldChange('suggestionsForChangeOrImprovementIfAny', e.target.value)} />
                    <div className="md:col-span-2">
                        <FormInput label="Farmer feedback" required value={formData.farmerFeedback ?? ''} onChange={(e) => handleFieldChange('farmerFeedback', e.target.value)} />
                    </div>
                </div>
            </FormSection>
        </div>
    )

    // Render Technical Parameter Form
    const renderTechnicalParamForm = () => (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormInput
                    label="Reporting Year"
                    required
                    type="date"
                    value={formData.reportingYear ?? ''}
                    onChange={handleReportingYearChange}
                />
                <FormSelect
                    label="Month"
                    required
                    value={formData.month ?? ''}
                    onChange={handleMonthChange}
                    options={MONTHS}
                />
                <MasterDataDropdown
                    label="Season"
                    required
                    value={formData.seasonId ?? ''}
                    onChange={handleSeasonChange}
                    options={seasonOptions}
                    emptyMessage="No seasons available"
                />
                <DependentDropdown
                    label="CFLD Crop Type"
                    required
                    value={formData.cropTypeId ?? ''}
                    onChange={(v) => handleCropTypeChangeFromValue(v)}
                    options={[]}
                    dependsOn={{
                        value: formData.seasonId ?? '',
                        field: 'seasonId',
                    }}
                    onOptionsLoad={async (parentSeasonId: any) => {
                        const seasonId = Number(parentSeasonId)
                        if (!Number.isFinite(seasonId)) return []

                        const allowedTypeIds = new Set(
                            (cfldCrops as any[])
                                .filter((crop: any) => Number(crop.seasonId ?? crop.SeasonId ?? crop.season?.seasonId) === seasonId)
                                .map((crop: any) => Number(crop.typeId ?? crop.cropType?.typeId ?? crop.CropTypeId))
                                .filter((id: number) => Number.isFinite(id))
                        )

                        return cropTypes
                            .filter((ct: any) => allowedTypeIds.has(Number(ct.id ?? ct.typeId)))
                            .map((ct: any) => ({
                                value: ct.id ?? ct.typeId,
                                label: ct.typeName,
                            }))
                    }}
                    cacheKey="cfld-crop-types-by-season"
                    emptyMessage="No crop types available for selected season"
                    loadingMessage="Loading crop types..."
                />
                <DependentDropdown
                    label="CFLD Crop"
                    required
                    value={formData.crop ?? formData.cropName ?? ''}
                    onChange={handleCropChange}
                    options={[]}
                    dependsOn={{
                        value: formData.seasonId && formData.cropTypeId ? `${formData.seasonId}-${formData.cropTypeId}` : '',
                        field: 'seasonId',
                    }}
                    onOptionsLoad={loadCfldCropsByType}
                    cacheKey="cfld-crops-by-season-and-type"
                    emptyMessage="No crops available for selected crop type"
                    loadingMessage="Loading crops..."
                />
                <FormInput
                    label="Name of Variety"
                    required
                    value={formData.varietyName ?? ''}
                    onChange={(e) => handleFieldChange('varietyName', e.target.value)}
                />
                <FormInput
                    label="Area (in ha)"
                    required
                    type="number"
                    step="0.01"
                    value={formData.areaInHa ?? formData.areaHectare ?? ''}
                    onChange={(e) => handleFieldChange('areaInHa', e.target.value)}
                />
                <FormInput
                    label="Technology demonstrated"
                    required
                    value={formData.technologyDemonstrated ?? ''}
                    onChange={(e) => handleFieldChange('technologyDemonstrated', e.target.value)}
                />
                <FormInput
                    label="Detail of existing farmer practice"
                    required
                    value={formData.existingFarmerPractice ?? ''}
                    onChange={(e) => handleFieldChange('existingFarmerPractice', e.target.value)}
                />
                <FormInput
                    label="Yield (q/ha) in farmer field Local"
                    type="number"
                    step="0.01"
                    value={formData.farmerYield ?? ''}
                    onChange={(e) => handleFieldChange('farmerYield', e.target.value)}
                    required
                />
            </div>

            <FormSection title="Yield obtained in demonstration (q/ha)" className="mb-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormInput
                        label="Minimum"
                        required
                        type="number"
                        step="0.01"
                        value={formData.yieldMin ?? ''}
                        onChange={(e) => handleFieldChange('yieldMin', e.target.value)}
                    />
                    <FormInput
                        label="Maximum"
                        required
                        type="number"
                        step="0.01"
                        value={formData.yieldMax ?? ''}
                        onChange={(e) => handleFieldChange('yieldMax', e.target.value)}
                    />
                    <FormInput
                        label="Average"
                        required
                        type="number"
                        step="0.01"
                        value={formData.yieldAvg ?? ''}
                        onChange={(e) => handleFieldChange('yieldAvg', e.target.value)}
                    />
                    <FormInput
                        label="% increase in yield"
                        required
                        type="number"
                        step="0.01"
                        value={formData.percentIncrease ?? ''}
                        onChange={(e) => handleFieldChange('percentIncrease', e.target.value)}
                    />
                </div>
            </FormSection>

            <FormSection title="Yield gap (q/ha)" className="mb-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <FormInput
                        label="District yield (D)"
                        required
                        type="number"
                        step="0.01"
                        value={formData.yieldGapDistrict ?? ''}
                        onChange={(e) => handleFieldChange('yieldGapDistrict', e.target.value)}
                    />
                    <FormInput
                        label="State yield (S)"
                        required
                        type="number"
                        step="0.01"
                        value={formData.yieldGapState ?? ''}
                        onChange={(e) => handleFieldChange('yieldGapState', e.target.value)}
                    />
                    <FormInput
                        label="Potential yield (P)"
                        required
                        type="number"
                        step="0.01"
                        value={formData.yieldGapPotential ?? ''}
                        onChange={(e) => handleFieldChange('yieldGapPotential', e.target.value)}
                    />
                </div>
            </FormSection>

            <FormSection title="Yield gap minimized (%)" className="mb-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <FormInput
                        label="District yield (D)"
                        required
                        type="number"
                        step="0.01"
                        value={formData.yieldGapMinimisedDistrict ?? ''}
                        onChange={(e) => handleFieldChange('yieldGapMinimisedDistrict', e.target.value)}
                    />
                    <FormInput
                        label="State yield (S)"
                        required
                        type="number"
                        step="0.01"
                        value={formData.yieldGapMinimisedState ?? ''}
                        onChange={(e) => handleFieldChange('yieldGapMinimisedState', e.target.value)}
                    />
                    <FormInput
                        label="Potential yield (P)"
                        required
                        type="number"
                        step="0.01"
                        value={formData.yieldGapMinimisedPotential ?? ''}
                        onChange={(e) => handleFieldChange('yieldGapMinimisedPotential', e.target.value)}
                    />
                </div>
            </FormSection>

            <FormSection title="Farmers Details">
                <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FormInput
                        label="General_M"
                        required
                        type="number"
                        value={formData.genM ?? ''}
                        onChange={(e) => handleFieldChange('genM', e.target.value)}
                    />
                    <FormInput
                        label="General_F"
                        required
                        type="number"
                        value={formData.genF ?? ''}
                        onChange={(e) => handleFieldChange('genF', e.target.value)}
                    />
                    <FormInput
                        label="OBC_M"
                        required
                        type="number"
                        value={formData.obcM ?? ''}
                        onChange={(e) => handleFieldChange('obcM', e.target.value)}
                    />
                    <FormInput
                        label="OBC_F"
                        required
                        type="number"
                        value={formData.obcF ?? ''}
                        onChange={(e) => handleFieldChange('obcF', e.target.value)}
                    />
                    <FormInput
                        label="SC_M"
                        required
                        type="number"
                        value={formData.scM ?? ''}
                        onChange={(e) => handleFieldChange('scM', e.target.value)}
                    />
                    <FormInput
                        label="SC_F"
                        required
                        type="number"
                        value={formData.scF ?? ''}
                        onChange={(e) => handleFieldChange('scF', e.target.value)}
                    />
                    <FormInput
                        label="ST_M"
                        required
                        type="number"
                        value={formData.stM ?? ''}
                        onChange={(e) => handleFieldChange('stM', e.target.value)}
                    />
                    <FormInput
                        label="ST_F"
                        required
                        type="number"
                        value={formData.stF ?? ''}
                        onChange={(e) => handleFieldChange('stF', e.target.value)}
                    />
                </div>
                <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormInput
                        label="Farmers' training photographs"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange('trainingPhotos')}
                    />
                    <FormInput
                        label="Quality Action Photographs of field visits/field days and technology demonstrated"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange('actionPhotos')}
                    />
                </div>
            </FormSection>
        </div>
    );

    // Render Extension Activity Form
    const renderExtensionActivityForm = () => (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MasterDataDropdown
                    label="Season"
                    required
                    value={formData.seasonId ?? ''}
                    onChange={handleSeasonChange}
                    options={seasonOptions}
                    emptyMessage="No seasons available"
                />
                <FormSelect
                    label="Extension Activities organized"
                    required
                    value={formData.extensionActivityId ?? ''}
                    onChange={handleExtensionActivityChange}
                    options={extensionActivityOptions}
                />
                <FormInput
                    label="Date"
                    required
                    type="date"
                    value={formData.date ?? ''}
                    onChange={(e) => handleFieldChange('date', e.target.value)}
                />
                <FormInput
                    label="Place of activity"
                    required
                    value={formData.placeOfActivity ?? ''}
                    onChange={(e) => handleFieldChange('placeOfActivity', e.target.value)}
                />
            </div>

            <FormSection title="Farmers Details">
                <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FormInput
                        label="General_M"
                        required
                        type="number"
                        value={formData.genM ?? ''}
                        onChange={(e) => handleFieldChange('genM', e.target.value)}
                    />
                    <FormInput
                        label="General_F"
                        required
                        type="number"
                        value={formData.genF ?? ''}
                        onChange={(e) => handleFieldChange('genF', e.target.value)}
                    />
                    <FormInput
                        label="OBC_M"
                        required
                        type="number"
                        value={formData.obcM ?? ''}
                        onChange={(e) => handleFieldChange('obcM', e.target.value)}
                    />
                    <FormInput
                        label="OBC_F"
                        required
                        type="number"
                        value={formData.obcF ?? ''}
                        onChange={(e) => handleFieldChange('obcF', e.target.value)}
                    />
                    <FormInput
                        label="SC_M"
                        required
                        type="number"
                        value={formData.scM ?? ''}
                        onChange={(e) => handleFieldChange('scM', e.target.value)}
                    />
                    <FormInput
                        label="SC_F"
                        required
                        type="number"
                        value={formData.scF ?? ''}
                        onChange={(e) => handleFieldChange('scF', e.target.value)}
                    />
                    <FormInput
                        label="ST_M"
                        required
                        type="number"
                        value={formData.stM ?? ''}
                        onChange={(e) => handleFieldChange('stM', e.target.value)}
                    />
                    <FormInput
                        label="ST_F"
                        required
                        type="number"
                        value={formData.stF ?? ''}
                        onChange={(e) => handleFieldChange('stF', e.target.value)}
                    />
                </div>
            </FormSection>
        </div>
    );

    // Render Budget Form
    const renderBudgetForm = () => (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormInput
                    label="Reporting Year"
                    required
                    type="date"
                    value={formData.reportingYear ?? ''}
                    onChange={handleReportingYearChange}
                />
                <MasterDataDropdown
                    label="Season"
                    required
                    value={formData.seasonId ?? ''}
                    onChange={handleSeasonChange}
                    options={seasonOptions}
                    emptyMessage="No seasons available"
                />
                <FormSelect
                    label="Crop"
                    required
                    value={formData.crop ?? formData.cropName ?? ''}
                    onChange={handleCropChangeFormSelect}
                    options={useMemo(
                        () => cfldCrops.map((crop: any) => ({
                            value: crop.CropName || crop.cropName,
                            label: crop.CropName || crop.cropName,
                        })),
                        [cfldCrops]
                    )}
                />
                <FormInput
                    label="Overall Crop wise fund allocation"
                    required
                    type="number"
                    step="0.01"
                    value={formData.overallFundAllocation || ''}
                    onChange={(e) => handleFieldChange('overallFundAllocation', e.target.value)}
                />
                <FormInput
                    label="Area (ha) allotted"
                    required
                    type="number"
                    step="0.01"
                    value={formData.areaAllotted || ''}
                    onChange={(e) => handleFieldChange('areaAllotted', e.target.value)}
                />
                <FormInput
                    label="Area (ha) achieved"
                    required
                    type="number"
                    step="0.01"
                    value={formData.areaAchieved || ''}
                    onChange={(e) => handleFieldChange('areaAchieved', e.target.value)}
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
                            <td className="px-4 py-3 border-r border-[#E0E0E0]">
                                <FormInput
                                    label=""
                                    type="number"
                                    step="0.01"
                                    value={formData.criticalInputReceived || ''}
                                    onChange={(e) => handleFieldChange('criticalInputReceived', e.target.value)}
                                />
                            </td>
                            <td className="px-4 py-3">
                                <FormInput
                                    label=""
                                    type="number"
                                    step="0.01"
                                    value={formData.criticalInputUtilized || ''}
                                    onChange={(e) => handleFieldChange('criticalInputUtilized', e.target.value)}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="px-4 py-3 text-[#212121] font-medium border-r border-[#E0E0E0]">TA/DA/POL etc. for monitoring</td>
                            <td className="px-4 py-3 border-r border-[#E0E0E0]">
                                <FormInput
                                    label=""
                                    type="number"
                                    step="0.01"
                                    value={formData.taDaReceived || ''}
                                    onChange={(e) => handleFieldChange('taDaReceived', e.target.value)}
                                />
                            </td>
                            <td className="px-4 py-3">
                                <FormInput
                                    label=""
                                    type="number"
                                    step="0.01"
                                    value={formData.taDaUtilized || ''}
                                    onChange={(e) => handleFieldChange('taDaUtilized', e.target.value)}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="px-4 py-3 text-[#212121] font-medium border-r border-[#E0E0E0]">Extension Activities (Field Day)</td>
                            <td className="px-4 py-3 border-r border-[#E0E0E0]">
                                <FormInput
                                    label=""
                                    type="number"
                                    step="0.01"
                                    value={formData.extensionActivitiesReceived || ''}
                                    onChange={(e) => handleFieldChange('extensionActivitiesReceived', e.target.value)}
                                />
                            </td>
                            <td className="px-4 py-3">
                                <FormInput
                                    label=""
                                    type="number"
                                    step="0.01"
                                    value={formData.extensionActivitiesUtilized || ''}
                                    onChange={(e) => handleFieldChange('extensionActivitiesUtilized', e.target.value)}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="px-4 py-3 text-[#212121] font-medium border-r border-[#E0E0E0]">Publication of literature</td>
                            <td className="px-4 py-3 border-r border-[#E0E0E0]">
                                <FormInput
                                    label=""
                                    type="number"
                                    step="0.01"
                                    value={formData.publicationReceived || ''}
                                    onChange={(e) => handleFieldChange('publicationReceived', e.target.value)}
                                />
                            </td>
                            <td className="px-4 py-3">
                                <FormInput
                                    label=""
                                    type="number"
                                    step="0.01"
                                    value={formData.publicationUtilized || ''}
                                    onChange={(e) => handleFieldChange('publicationUtilized', e.target.value)}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );

    // Main render logic
    if (entityType === ENTITY_TYPES.PROJECT_CFLD_TECHNICAL_PARAM) {
        const isEditMode = Boolean(formData?.id || formData?.cfldTechId)
        const tabButtonClass = (active: boolean) =>
            active
                ? 'px-4 py-2 bg-[#487749] text-white rounded-xl text-sm font-medium hover:bg-[#3d6540] transition-all'
                : 'px-4 py-2 bg-white border border-[#E0E0E0] rounded-xl text-sm font-medium text-[#487749] hover:bg-[#F5F5F5] transition-all'

        if (!isEditMode) {
            // Create mode: only show the main Technical Parameter form (no tabs)
            return <div className="space-y-6">{renderTechnicalParamForm()}</div>
        }

        return (
            <div className="space-y-6">
                {/* Desktop tabs */}
                <div className="hidden sm:flex flex-wrap gap-2 w-fit rounded-2xl p-1 bg-[#F5F5F5]">
                    <button type="button" className={tabButtonClass(cfldSection === 'technical')} onClick={() => setActiveSection('technical')}>
                        Edit CfldTechnicalParameter
                    </button>
                    <button type="button" className={tabButtonClass(cfldSection === 'economic')} onClick={() => setActiveSection('economic')}>
                        Economic Parameters of CFLD
                    </button>
                    <button type="button" className={tabButtonClass(cfldSection === 'socio')} onClick={() => setActiveSection('socio')}>
                        Update Socio Economic Parameters of CFLD
                    </button>
                    <button type="button" className={tabButtonClass(cfldSection === 'perception')} onClick={() => setActiveSection('perception')}>
                        Farmers Perception parameters of CFLD
                    </button>
                </div>

                {/* Mobile dropdown */}
                <div className="sm:hidden">
                    <div className="relative inline-flex max-w-[90vw]">
                        <select
                            value={cfldSection}
                            onChange={(e) => setActiveSection(e.target.value as any)}
                            className="appearance-none w-full min-w-[240px] pr-10 pl-3 py-3 border border-[#E0E0E0] rounded-xl bg-white text-sm text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749]"
                        >
                            <option value="technical">Edit CfldTechnicalParameter</option>
                            <option value="economic">Economic Parameters of CFLD</option>
                            <option value="socio">Update Socio Economic Parameters of CFLD</option>
                            <option value="perception">Farmers Perception parameters of CFLD</option>
                        </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#757575]">
                            <ChevronDown className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                {cfldSection === 'economic' ? renderEconomicParametersForm() : null}
                {cfldSection === 'socio' ? renderSocioEconomicForm() : null}
                {cfldSection === 'perception' ? renderFarmersPerceptionForm() : null}
                {cfldSection === 'technical' ? renderTechnicalParamForm() : null}
            </div>
        )
    }

    if (entityType === ENTITY_TYPES.PROJECT_CFLD_EXTENSION_ACTIVITY) {
        return renderExtensionActivityForm();
    }

    if (entityType === ENTITY_TYPES.PROJECT_CFLD_BUDGET) {
        return renderBudgetForm();
    }

    return null;
};
