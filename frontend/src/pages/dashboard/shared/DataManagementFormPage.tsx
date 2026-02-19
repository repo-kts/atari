/**
 * Form Component for Data Management
 *
 * Renders within the existing layout (sidebar and header remain visible)
 */

import React from 'react'
import { ChevronLeft } from 'lucide-react'
import { ENTITY_TYPES } from '@/constants/entityTypes'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { getEntityTypeChecks } from '@/utils/entityTypeUtils'
import { LoadingButton } from '@/components/common/LoadingButton'

// Form Components
import { BasicMasterForms } from './forms/BasicMasterForms'
import { OtherMastersForms } from './forms/OtherMastersForms'
import { OftFldForms } from './forms/OftFldForms'
import { TrainingExtensionForms } from './forms/TrainingExtensionForms'
import { ProductionProjectForms } from './forms/ProductionProjectForms'
import { PublicationForms } from './forms/PublicationForms'
import { AboutKvkForms } from './forms/AboutKvkForms'
import { SoilWaterTesting } from './forms/SoilWaterTesting'
import { HRD } from './forms/HRD'
import { AwardRecognition } from './forms/AwardRecognition'

interface DataManagementFormPageProps {
    entityType: ExtendedEntityType | null
    title: string
    formData: any
    setFormData: (data: any) => void
    onSave: () => void
    onClose: () => void
    isSaving?: boolean
}

export function DataManagementFormPage({
    entityType,
    title,
    formData,
    setFormData,
    onSave,
    onClose,
    isSaving = false,
}: DataManagementFormPageProps) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave()
    }

    // Use centralized entity type checks
    const { isBasicMaster, isOftFld, isTrainingExtension, isProductionProject, isAboutKvk, isSoilWaterTesting, isHrd, isAward, isOtherMaster } =
        getEntityTypeChecks(entityType)

    return (
        <div className="space-y-6 min-h-[400px]">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#487749] border border-[#E0E0E0] rounded-xl hover:bg-[#F5F5F5] transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                </button>
                <h1 className="text-2xl font-semibold text-[#487749]">{title}</h1>
            </div>

            {/* Form Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] min-h-[300px]">
                {!entityType ? (
                    <div className="p-6">
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                            <p className="font-semibold">Error: Entity type is null</p>
                            <p className="text-sm mt-1">Please check the route configuration.</p>
                        </div>
                    </div>
                ) : (
                    <form id="masterDataForm" onSubmit={handleSubmit} className="p-6 space-y-6">
                        {isBasicMaster && (
                            <BasicMasterForms
                                entityType={entityType}
                                formData={formData}
                                setFormData={setFormData}
                            />
                        )}

                        {isOtherMaster && (
                            <OtherMastersForms
                                entityType={entityType}
                                formData={formData}
                                setFormData={setFormData}
                            />
                        )}

                        {isOftFld && (
                            <OftFldForms
                                entityType={entityType}
                                formData={formData}
                                setFormData={setFormData}
                            />
                        )}

                        {isTrainingExtension && (
                            <TrainingExtensionForms
                                entityType={entityType}
                                formData={formData}
                                setFormData={setFormData}
                            />
                        )}

                        {isProductionProject && (
                            <ProductionProjectForms
                                entityType={entityType}
                                formData={formData}
                                setFormData={setFormData}
                            />
                        )}

                        {(entityType === ENTITY_TYPES.PUBLICATION_ITEMS || entityType === ENTITY_TYPES.ACHIEVEMENT_PUBLICATION_DETAILS) && (
                            <PublicationForms
                                entityType={entityType}
                                formData={formData}
                                setFormData={setFormData}
                            />
                        )}

                        {isAboutKvk && (
                            <AboutKvkForms
                                entityType={entityType}
                                formData={formData}
                                setFormData={setFormData}
                            />
                        )}

                        {isSoilWaterTesting && (
                            <SoilWaterTesting
                                entityType={entityType}
                                formData={formData}
                                setFormData={setFormData}
                            />
                        )}

                        {isHrd && (
                            <HRD
                                entityType={entityType}
                                formData={formData}
                                setFormData={setFormData}
                            />
                        )}

                        {isAward && (
                            <AwardRecognition
                                entityType={entityType}
                                formData={formData}
                                setFormData={setFormData}
                            />
                        )}

                        {/* Fallback if no form matches */}
                        {!isBasicMaster && !isOtherMaster && !isOftFld && !isTrainingExtension && !isProductionProject &&
                            entityType !== ENTITY_TYPES.PUBLICATION_ITEMS && entityType !== ENTITY_TYPES.ACHIEVEMENT_PUBLICATION_DETAILS && !isAboutKvk && !isSoilWaterTesting && !isHrd && !isAward && (
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                                    <p className="font-semibold">Form not configured</p>
                                    <p className="text-sm mt-1">Entity type: {entityType}</p>
                                    <p className="text-xs mt-2">Please contact the development team to add support for this entity type.</p>
                                </div>
                            )}

                        {/* Form Actions */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-[#F0F0F0]">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSaving}
                                className="px-6 py-2.5 border border-[#E0E0E0] rounded-xl text-sm font-semibold text-[#616161] hover:bg-[#F5F5F5] hover:text-[#212121] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <LoadingButton
                                form="masterDataForm"
                                type="submit"
                                isLoading={isSaving}
                                loadingText={title.startsWith('Edit') || title.startsWith('Update') ? 'Updating...' : 'Submitting...'}
                                variant="primary"
                                size="md"
                                className="px-8 py-2.5"
                            >
                                {title.startsWith('Edit') || title.startsWith('Update') ? 'Update' : 'Submit'}
                            </LoadingButton>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
