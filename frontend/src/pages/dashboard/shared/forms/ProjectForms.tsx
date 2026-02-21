import React from 'react'
import { ENTITY_TYPES } from '../../../../constants/entityTypes'
import { ExtendedEntityType } from '../../../../utils/masterUtils'
import { FormInput, FormSelect, FormSection, FormTextArea } from './shared/FormComponents'
import { CfldForms } from './projects/CfldForms'
import { CraForms } from './projects/CraForms'
import { FpoForms } from './projects/FpoForms'
import { NariForms } from './projects/NariForms'
import { AryaForms } from './projects/AryaForms'
import { NicraForms } from './projects/NicraForms'
import { NaturalFarmingForms } from './projects/NaturalFarmingForms'
import { AgriDroneForms } from './projects/AgriDroneForms'
import { DrmrForms } from './projects/DrmrForms'
import { CsisaForms } from './projects/CsisaForms'
import { TspScspForms } from './projects/TspScspForms'
import { SeedHubForms } from './projects/SeedHubForms'

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
    if (!entityType) return null

    // Common Year Select
    const YearSelect = () => (
        <FormSelect
            label="Reporting Year"
            required
            value={formData.reportingYear || ''}
            onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
            options={[
                { value: '2023-24', label: '2023-24' },
                { value: '2024-25', label: '2024-25' },
                { value: '2025-26', label: '2025-26' },
            ]}
        />
    )

    return (
        <div className="space-y-6">
            <CfldForms
                entityType={entityType as ExtendedEntityType}
                formData={formData}
                setFormData={setFormData}
                YearSelect={YearSelect}
            />

            <CraForms
                entityType={entityType as ExtendedEntityType}
                formData={formData}
                setFormData={setFormData}
                YearSelect={YearSelect}
            />

            {/* FPO Forms */}
            <FpoForms
                entityType={entityType as ExtendedEntityType}
                formData={formData}
                setFormData={setFormData}
                YearSelect={YearSelect}
            />

            {/* NARI Forms */}
            <NariForms
                entityType={entityType as ExtendedEntityType}
                formData={formData}
                setFormData={setFormData}
                YearSelect={YearSelect}
            />

            {/* ARYA Forms */}
            <AryaForms
                entityType={entityType as ExtendedEntityType}
                formData={formData}
                setFormData={setFormData}
                YearSelect={YearSelect}
            />

            {/* NICRA Forms */}
            <NicraForms
                entityType={entityType as ExtendedEntityType}
                formData={formData}
                setFormData={setFormData}
                YearSelect={YearSelect}
            />

            {/* Natural Farming */}
            <NaturalFarmingForms
                entityType={entityType as ExtendedEntityType}
                formData={formData}
                setFormData={setFormData}
                YearSelect={YearSelect}
            />

            {/* Agri Drone */}
            <AgriDroneForms
                entityType={entityType as ExtendedEntityType}
                formData={formData}
                setFormData={setFormData}
                YearSelect={YearSelect}
            />

            {/* DRMR Forms */}
            <DrmrForms
                entityType={entityType as ExtendedEntityType}
                formData={formData}
                setFormData={setFormData}
                YearSelect={YearSelect}
            />

            {/* CSISA Forms */}
            <CsisaForms
                entityType={entityType as ExtendedEntityType}
                formData={formData}
                setFormData={setFormData}
                YearSelect={YearSelect}
            />

            {/* TSP/SCSP Forms */}
            <TspScspForms
                entityType={entityType as ExtendedEntityType}
                formData={formData}
                setFormData={setFormData}
                YearSelect={YearSelect}
            />

            {/* Seed Hub Forms */}
            <SeedHubForms
                entityType={entityType as ExtendedEntityType}
                formData={formData}
                setFormData={setFormData}
                YearSelect={YearSelect}
            />

            {/* Generic Fallback for other Project types */}
            {(!([ENTITY_TYPES.PROJECT_CFLD_TECHNICAL_PARAM,
            ENTITY_TYPES.PROJECT_CFLD_EXTENSION_ACTIVITY,
            ENTITY_TYPES.PROJECT_CFLD_BUDGET,
            ENTITY_TYPES.PROJECT_CRA_DETAILS,
            ENTITY_TYPES.PROJECT_CRA_EXTENSION_ACTIVITY,
            ENTITY_TYPES.PROJECT_FPO_DETAILS,
            ENTITY_TYPES.PROJECT_FPO_MANAGEMENT,
            ENTITY_TYPES.PROJECT_DRMR_DETAILS,
            ENTITY_TYPES.PROJECT_DRMR_ACTIVITY,
            ENTITY_TYPES.PROJECT_CSISA,
            ENTITY_TYPES.PROJECT_TSP_SCSP,
            ENTITY_TYPES.PROJECT_SEED_HUB,
            ENTITY_TYPES.PROJECT_NARI_NUTRI_GARDEN,
            ENTITY_TYPES.PROJECT_NARI_BIO_FORTIFIED,
            ENTITY_TYPES.PROJECT_NARI_VALUE_ADDITION,
            ENTITY_TYPES.PROJECT_NARI_TRAINING,
            ENTITY_TYPES.PROJECT_NARI_EXTENSION,
            ENTITY_TYPES.PROJECT_ARYA_CURRENT,
            ENTITY_TYPES.PROJECT_ARYA_EVALUATION,
            ENTITY_TYPES.PROJECT_NICRA_BASIC,
            ENTITY_TYPES.PROJECT_NICRA_DETAILS,
            ENTITY_TYPES.PROJECT_NICRA_TRAINING,
            ENTITY_TYPES.PROJECT_NICRA_EXTENSION,
            ENTITY_TYPES.PROJECT_NATURAL_FARMING_GEO,
            ENTITY_TYPES.PROJECT_NATURAL_FARMING_PHYSICAL,
            ENTITY_TYPES.PROJECT_NATURAL_FARMING_DEMO,
            ENTITY_TYPES.PROJECT_NATURAL_FARMING_FARMERS,
            ENTITY_TYPES.PROJECT_NATURAL_FARMING_BENEFICIARIES,
            ENTITY_TYPES.PROJECT_NATURAL_FARMING_SOIL,
            ENTITY_TYPES.PROJECT_NATURAL_FARMING_BUDGET,
            ENTITY_TYPES.PROJECT_AGRI_DRONE
            ] as string[]).includes(entityType)) && (
                    <FormSection title="Project Details">
                        <YearSelect />
                        <FormInput
                            label="Description/Name"
                            required
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                        <FormTextArea
                            label="Details"
                            value={formData.details || ''}
                            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                        />
                        <FormInput
                            label="Quantity/Value"
                            type="number"
                            value={formData.quantity || ''}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        />
                    </FormSection>
                )}
        </div>
    )
}
