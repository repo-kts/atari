import React from 'react'
import { ENTITY_TYPES } from '../../../../constants/entityTypes'
import { ExtendedEntityType } from '../../../../utils/masterUtils'
import { FormInput, FormSelect } from './shared/FormComponents'
import {
    useTrainingTypes,
    useTrainingAreas,
} from '../../../../hooks/useTrainingExtensionEventsData'

interface TrainingExtensionFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

export const TrainingExtensionForms: React.FC<TrainingExtensionFormsProps> = ({
    entityType,
    formData,
    setFormData,
}) => {

    const { data: trainingTypes = [] } = useTrainingTypes()
    const { data: trainingAreas = [] } = useTrainingAreas()

    if (!entityType) return null

    return (
        <>
            {entityType === ENTITY_TYPES.TRAINING_TYPES && (
                <FormInput
                    label="Training Type Name"
                    required
                    value={formData.trainingTypeName || ''}
                    onChange={(e) => setFormData({ ...formData, trainingTypeName: e.target.value })}
                    placeholder="Enter training type name"
                />
            )}

            {entityType === ENTITY_TYPES.TRAINING_AREAS && (
                <div className="space-y-4">
                    <FormSelect
                        label="Training Type"
                        required
                        value={formData.trainingTypeId || ''}
                        onChange={(e) => setFormData({ ...formData, trainingTypeId: parseInt(e.target.value) })}
                        options={trainingTypes.map(t => ({ value: t.trainingTypeId, label: t.trainingTypeName }))}
                    />
                    <FormInput
                        label="Training Area Name"
                        required
                        value={formData.trainingAreaName || ''}
                        onChange={(e) => setFormData({ ...formData, trainingAreaName: e.target.value })}
                        placeholder="Enter training area name"
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.TRAINING_THEMATIC_AREAS && (
                <div className="space-y-4">
                    <FormSelect
                        label="Training Area"
                        required
                        value={formData.trainingAreaId || ''}
                        onChange={(e) => setFormData({ ...formData, trainingAreaId: parseInt(e.target.value) })}
                        options={trainingAreas.map(a => ({ value: a.trainingAreaId, label: a.trainingAreaName }))}
                    />
                    <FormInput
                        label="Thematic Area Name"
                        required
                        value={formData.trainingThematicAreaName || ''}
                        onChange={(e) => setFormData({ ...formData, trainingThematicAreaName: e.target.value })}
                        placeholder="Enter thematic area name"
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.EXTENSION_ACTIVITIES && (
                <FormInput
                    label="Extension Activity Name"
                    required
                    value={formData.extensionName || ''}
                    onChange={(e) => setFormData({ ...formData, extensionName: e.target.value })}
                    placeholder="Enter extension activity name"
                />
            )}

            {entityType === ENTITY_TYPES.OTHER_EXTENSION_ACTIVITIES && (
                <FormInput
                    label="Other Extension Activity Name"
                    required
                    value={formData.otherExtensionName || ''}
                    onChange={(e) => setFormData({ ...formData, otherExtensionName: e.target.value })}
                    placeholder="Enter other extension activity name"
                />
            )}

            {entityType === ENTITY_TYPES.EVENTS && (
                <FormInput
                    label="Event Name"
                    required
                    value={formData.eventName || ''}
                    onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                    placeholder="Enter event name"
                />
            )}
        </>
    )
}
