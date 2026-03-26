import React from 'react'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { useSeasons, useYears, useExtensionActivityTypes, useNariActivities, useNariCropCategories, useNariNutritionGardenTypes, useNicraCategories, useNicraSubCategories, useNicraSeedBankFodderBanks, useNicraDignitaryTypes, useNicraPiTypes, useStaffCategories } from '@/hooks/useOtherMastersData'
import { useAgriDroneDemonstrationsOn, useAryaEnterprises, useCraCroppingSystems, useCraFarmingSystems, useNaturalFarmingActivities, useNaturalFarmingSoilParameters, useTspScspActivities, useTspScspTypes } from '@/hooks/useProductionProjectsData'
import { useMasterData } from '@/hooks/useMasterData'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'
import { useProjectData } from '@/hooks/useProjectData'

// Project-specific form components
import { CfldForms } from './projects/CfldForms'
import { CraForms } from './projects/CraForms'
import { AryaForms } from './projects/AryaForms'
import { NicraForms } from './projects/NicraForms'
import { NariForms } from './projects/NariForms'
import { FpoForms } from './projects/FpoForms'
import { DrmrForms } from './projects/DrmrForms'
import { CsisaForms } from './projects/CsisaForms'
import { TspScspForms } from './projects/TspScspForms'
import { AgriDroneForms } from './projects/AgriDroneForms'
import { SeedHubForms } from './projects/SeedHubForms'
import { NaturalFarmingForms } from './projects/NaturalFarmingForms'
import { OtherProjectForms } from './projects/OtherProjectForms'

interface ProjectFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

export const ProjectForms: React.FC<ProjectFormsProps> = ({
    entityType,
    formData,
    setFormData,
}) => {
    const { user } = useAuth()

    // Automatically sync kvkId from user session if it's missing in formData
    useEffect(() => {
        if (user?.kvkId && !formData.kvkId && !formData.id) {
            setFormData((prev: any) => ({ ...prev, kvkId: user.kvkId }))
        }
    }, [user?.kvkId, formData.kvkId, formData.id, setFormData])
    const { data: seasons = [] } = useSeasons()
    const { data: years = [] } = useYears()
    const { data: aryaEnterprises = [] } = useAryaEnterprises()
    const { data: craFarmingSystems = [], isLoading: craFarmingSystemsLoading } = useCraFarmingSystems()
    const { data: craCroppingSystems = [], isLoading: craCroppingSystemsLoading } = useCraCroppingSystems()
    const { data: extensionActivityTypes = [] } = useExtensionActivityTypes()
    const { data: states = [] } = useMasterData('states')
    const { data: districts = [] } = useMasterData('districts')
    const { data: kvks = [] } = useMasterData('organizations')

    const { data: nicraCategories = [] } = useNicraCategories()
    const { data: nicraSubcategories = [] } = useNicraSubCategories()
    const { data: nicraSeedBankFodderBanks = [] } = useNicraSeedBankFodderBanks()
    const { data: nicraDignitaryTypes = [] } = useNicraDignitaryTypes()
    const { data: nicraPiTypes = [] } = useNicraPiTypes()

    const { data: nariActivities = [] } = useNariActivities()
    const { data: nariCropCategories = [] } = useNariCropCategories()
    const { data: nariNutritionGardenTypes = [] } = useNariNutritionGardenTypes()
    const { data: tspScspTypes = [] } = useTspScspTypes()
    const { data: tspScspActivities = [] } = useTspScspActivities()
    const { data: agriDroneDemonstrationsOn = [] } = useAgriDroneDemonstrationsOn()
    const { data: naturalFarmingActivities = [] } = useNaturalFarmingActivities()
    const { data: naturalFarmingSoilParameters = [] } = useNaturalFarmingSoilParameters()
    const { data: agriDroneIntros = [] } = useProjectData(ENTITY_TYPES.PROJECT_AGRI_DRONE)

    if (!entityType) return null

    // Determine which project section this entity type belongs to
    const isCFLD = entityType.includes('cfld')
    const isNICRA = entityType.includes('nicra')
    const isCRA = entityType.includes('cra') && !isNICRA
    const isARYA = entityType.includes('arya')
    const isNARI = entityType.includes('nari')
    const isFPO = entityType.includes('fpo')
    const isDRMR = entityType.includes('drmr')
    const isCSISA = entityType.includes('csisa')
    const isTSPSCSP = entityType.includes('tsp-scsp')
    const isAgriDrone = entityType.includes('agri-drone')
    const isSeedHub = entityType.includes('seed-hub')
    const isNaturalFarming = entityType.includes('natural-farming')
    const isOther = entityType.includes('other')
    const { data: staffCategories = [] } = useStaffCategories()
    return (
        <>

            {isCFLD && (
                <CfldForms
                    entityType={entityType}
                    formData={formData}
                    setFormData={setFormData}
                />
            )}

            {isCRA && (
                <CraForms
                    entityType={entityType}
                    formData={formData}
                    setFormData={setFormData}
                    years={years}
                    seasons={seasons}
                    farmingSystems={craFarmingSystems}
                    farmingSystemsLoading={craFarmingSystemsLoading}
                    croppingSystems={craCroppingSystems}
                    croppingSystemsLoading={craCroppingSystemsLoading}
                    extensionActivityTypes={extensionActivityTypes}
                />
            )}

            {isARYA && (
                <AryaForms
                    entityType={entityType}
                    formData={formData}
                    setFormData={setFormData}
                    years={years}
                    aryaEnterprises={aryaEnterprises}
                />
            )}



            {isNICRA && (
                <NicraForms
                    entityType={entityType}
                    formData={formData}
                    setFormData={setFormData}
                    years={years}
                    seasons={seasons}
                    categories={nicraCategories}
                    subCategories={nicraSubcategories}
                    seedBankFodderBanks={nicraSeedBankFodderBanks}
                    dignitaryTypes={nicraDignitaryTypes}
                    piTypes={nicraPiTypes}
                />
            )}

            {isNARI && (
                <NariForms
                    entityType={entityType}
                    formData={formData}
                    setFormData={setFormData}
                    years={years}
                    seasons={seasons}
                    nariActivities={nariActivities}
                    nariCropCategories={nariCropCategories}
                    nariNutritionGardenTypes={nariNutritionGardenTypes}
                />
            )}

            {isFPO && (
                <FpoForms
                    entityType={entityType}
                    formData={formData}
                    setFormData={setFormData}
                    years={years}
                />
            )}

            {isDRMR && (
                <DrmrForms
                    entityType={entityType}
                    formData={formData}
                    setFormData={setFormData}
                    years={years}
                    states={states}
                    districts={districts}
                    kvks={kvks}
                />
            )}

            {isCSISA && (
                <CsisaForms
                    entityType={entityType}
                    formData={formData}
                    setFormData={setFormData}
                    years={years}
                    seasons={seasons}
                />
            )}

            {isTSPSCSP && (
                <TspScspForms
                    entityType={entityType}
                    formData={formData}
                    setFormData={setFormData}
                    years={years}
                    districts={districts}
                    tspScspTypes={tspScspTypes}
                    tspScspActivities={tspScspActivities}
                />
            )}

            {isAgriDrone && (
                <AgriDroneForms
                    entityType={entityType}
                    formData={formData}
                    setFormData={setFormData}
                    years={years}
                    districts={districts}
                    demonstrationsOnMasters={agriDroneDemonstrationsOn}
                    agriDroneIntros={agriDroneIntros}
                />
            )}

            {isSeedHub && (
                <SeedHubForms
                    entityType={entityType}
                    formData={formData}
                    setFormData={setFormData}
                    years={years}
                    seasons={seasons}
                />
            )}

            {isNaturalFarming && (
                <NaturalFarmingForms
                    entityType={entityType}
                    formData={formData}
                    setFormData={setFormData}
                    years={years}
                    states={states}
                    seasons={seasons}
                    staffCategories={staffCategories}
                    naturalFarmingActivities={naturalFarmingActivities}
                    naturalFarmingSoilParameters={naturalFarmingSoilParameters}
                />
            )}

            {isOther && (
                <OtherProjectForms
                    entityType={entityType}
                    formData={formData}
                    setFormData={setFormData}
                />
            )}
        </>
    )
}
