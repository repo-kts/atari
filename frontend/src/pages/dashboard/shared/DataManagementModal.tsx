import React from 'react'
import { X } from 'lucide-react'
import { ENTITY_TYPES } from '../../../constants/entityTypes'
import { ExtendedEntityType } from '../../../utils/masterUtils'
import { getEntityTypeChecks } from '../../../utils/entityTypeUtils'

// Form Components
import { BasicMasterForms } from './forms/BasicMasterForms'
import { OtherMastersForms } from './forms/OtherMastersForms'
import { OftFldForms } from './forms/OftFldForms'
import { TrainingExtensionForms } from './forms/TrainingExtensionForms'
import { ProductionProjectForms } from './forms/ProductionProjectForms'
import { PublicationForms } from './forms/PublicationForms'
import { AboutKvkForms } from './forms/AboutKvkForms'

interface DataManagementModalProps {
    entityType: ExtendedEntityType | null
    title: string
    formData: any
    setFormData: (data: any) => void
    onSave: () => void
    onClose: () => void
}

export function DataManagementModal({
    entityType,
    title,
    formData,
    setFormData,
    onSave,
    onClose,
}: DataManagementModalProps) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave()
    }

    if (!entityType) return null

    // Use centralized entity type checks
    const { isBasicMaster, isOtherMaster, isOftFld, isTrainingExtension, isProductionProject, isAboutKvk } =
        getEntityTypeChecks(entityType)

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 py-10 px-4" onClick={onClose}>
            <div
                className={`bg-white rounded-2xl shadow-2xl w-full ${entityType === ENTITY_TYPES.KVKS ? 'max-w-4xl' : 'max-w-md'} max-h-[90vh] flex flex-col`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#F0F0F0]">
                    <h2 className="text-xl font-bold text-[#212121]">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#F5F5F5] rounded-xl transition-colors group"
                    >
                        <X className="w-5 h-5 text-[#757575] group-hover:text-red-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200">
                    <form id="masterDataForm" onSubmit={handleSubmit} className="space-y-6">
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

                        {entityType === ENTITY_TYPES.PUBLICATION_ITEMS && (
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
                    </form>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t border-[#F0F0F0] bg-gray-50/50 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 border border-[#E0E0E0] rounded-xl text-sm font-semibold text-[#616161] hover:bg-[#F5F5F5] hover:text-[#212121] transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        form="masterDataForm"
                        type="submit"
                        className="px-8 py-2.5 bg-[#487749] text-white rounded-xl text-sm font-semibold hover:bg-[#3d6540] transition-all shadow-sm hover:shadow-lg active:scale-95"
                    >
                        {title.startsWith('Edit') || title.startsWith('Update') ? 'Update' : 'Create'}
                    </button>
                </div>
            </div>
        </div>
    )
}
