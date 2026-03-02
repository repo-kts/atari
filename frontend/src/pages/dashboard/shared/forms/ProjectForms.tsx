import React from 'react'
import { ExtendedEntityType } from '../../../../utils/masterUtils'
import { useCropTypes, useFldCategories, useFldSubcategories } from '../../../../hooks/useOftFldData'
import { useSeasons, useYears, useExtensionActivityTypes, useCfldExtensionActivityTypes } from '../../../../hooks/useOtherMastersData'
import { useAryaEnterprises, useCraFarmingSystems } from '../../../../hooks/useProductionProjectsData'
import { useMasterData } from '../../../../hooks/useMasterData'

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
    const { data: seasons = [] } = useSeasons()
    const { data: cropTypes = [] } = useCropTypes()
    const { data: years = [] } = useYears()
    const { data: aryaEnterprises = [] } = useAryaEnterprises()
    const { data: craFarmingSystems = [] } = useCraFarmingSystems()
    const { data: extensionActivityTypes = [] } = useExtensionActivityTypes()
    const { data: cfldExtensionActivityTypes = [] } = useCfldExtensionActivityTypes()
    const { data: states = [] } = useMasterData('states')
    const { data: districts = [] } = useMasterData('districts')
    const { data: kvks = [] } = useMasterData('organizations')

    const { data: fldCategories = [] } = useFldCategories()
    const { data: fldSubcategories = [] } = useFldSubcategories()

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

    return (
        <>

            {isCFLD && (
                <CfldForms
                    entityType={entityType}
                    formData={formData}
                    setFormData={setFormData}
                    seasons={seasons}
                    cropTypes={cropTypes}
                    years={years}
                    extensionActivityTypes={cfldExtensionActivityTypes}
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
                    categories={fldCategories}
                    subCategories={fldSubcategories}
                />
            )}

            {isNARI && (
                <NariForms
                    entityType={entityType}
                    formData={formData}
                    setFormData={setFormData}
                    years={years}
                    seasons={seasons}
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
                />
            )}

            {isTSPSCSP && (
                <TspScspForms
                    entityType={entityType}
                    formData={formData}
                    setFormData={setFormData}
                    years={years}
                    districts={districts}
                />
            )}

            {isAgriDrone && (
                <AgriDroneForms
                    entityType={entityType}
                    formData={formData}
                    setFormData={setFormData}
                    years={years}
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
