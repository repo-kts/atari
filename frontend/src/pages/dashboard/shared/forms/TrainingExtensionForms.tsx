import React from 'react'
import { ENTITY_TYPES } from '../../../../constants/entityTypes'
import { ExtendedEntityType } from '../../../../utils/masterUtils'
import { FormInput, FormSelect, FormSection } from './shared/FormComponents'
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

            {entityType === ENTITY_TYPES.TRAINING_CLIENTELE && (
                <FormInput
                    label="Training Clientele Name"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter training clientele name"
                />
            )}

            {entityType === ENTITY_TYPES.FUNDING_SOURCE && (
                <FormInput
                    label="Funding Source Name"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter funding source name"
                />
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

            {entityType === ENTITY_TYPES.ACHIEVEMENT_TRAINING && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect
                            label="Clientele"
                            required
                            value={formData.clientele || ''}
                            onChange={(e) => setFormData({ ...formData, clientele: e.target.value })}
                            options={[
                                { value: 'Farmers', label: 'Farmers' },
                                { value: 'Farm Women', label: 'Farm Women' },
                                { value: 'Rural Youth', label: 'Rural Youth' },
                                { value: 'Extension Personnel', label: 'Extension Personnel' },
                            ]}
                        />
                        <FormSelect
                            label="Training Type"
                            required
                            value={formData.trainingTypeId || ''}
                            onChange={(e) => setFormData({ ...formData, trainingTypeId: e.target.value })}
                            options={trainingTypes.map(t => ({ value: t.trainingTypeId, label: t.trainingTypeName }))}
                        />
                        <FormSelect
                            label="On Campus/Off Campus"
                            required
                            value={formData.campusType || ''}
                            onChange={(e) => setFormData({ ...formData, campusType: e.target.value })}
                            options={[
                                { value: 'On Campus', label: 'On Campus' },
                                { value: 'Off Campus', label: 'Off Campus' },
                            ]}
                        />
                        <FormSelect
                            label="Training Area"
                            required
                            value={formData.trainingAreaId || ''}
                            onChange={(e) => setFormData({ ...formData, trainingAreaId: e.target.value })}
                            options={trainingAreas.map(a => ({ value: a.trainingAreaId, label: a.trainingAreaName }))}
                        />
                        <FormSelect
                            label="Thematic Area"
                            required
                            value={formData.thematicArea || ''}
                            onChange={(e) => setFormData({ ...formData, thematicArea: e.target.value })}
                            options={[
                                { value: 'Crop Production', label: 'Crop Production' },
                                { value: 'Horticulture', label: 'Horticulture' },
                                { value: 'Livestock Production', label: 'Livestock Production' },
                                { value: 'Home Science', label: 'Home Science' },
                                { value: 'Plant Protection', label: 'Plant Protection' },
                                { value: 'Fisheries', label: 'Fisheries' },
                                { value: 'Production of Inputs', label: 'Production of Inputs' },
                                { value: 'Capacity Building', label: 'Capacity Building' },
                            ]}
                        />
                        <FormInput
                            label="Title of Training"
                            required
                            value={formData.title || ''}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                        <FormInput
                            label="Start Date"
                            required
                            type="date"
                            value={formData.startDate || ''}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                        <FormInput
                            label="End Date"
                            required
                            type="date"
                            value={formData.endDate || ''}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                        <FormSelect
                            label="Course Co-ordinator"
                            required
                            value={formData.coordinator || ''}
                            onChange={(e) => setFormData({ ...formData, coordinator: e.target.value })}
                            options={[
                                { value: 'Dr. Reeta Singh', label: 'Dr. Reeta Singh' },
                                { value: 'Sri Rajeev Kumar', label: 'Sri Rajeev Kumar' },
                                { value: 'Dr. Pushpam Patel', label: 'Dr. Pushpam Patel' },
                                { value: 'Smt. Sangeeta Kumari', label: 'Smt. Sangeeta Kumari' },
                            ]}
                        />
                        <FormInput
                            label="Venue"
                            required
                            value={formData.venue || ''}
                            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                        />
                        <FormSelect
                            label="Funding Source"
                            value={formData.fundingSource || ''}
                            onChange={(e) => setFormData({ ...formData, fundingSource: e.target.value })}
                            options={[
                                { value: 'ICAR', label: 'ICAR' },
                                { value: 'State Govt', label: 'State Govt' },
                                { value: 'NGO', label: 'NGO' },
                                { value: 'Other', label: 'Other' },
                            ]}
                        />
                        <FormInput
                            label="Funding Agency Name"
                            value={formData.fundingAgency || ''}
                            onChange={(e) => setFormData({ ...formData, fundingAgency: e.target.value })}
                        />
                    </div>

                    <FormSection title="Farmers Details">
                        <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormInput label="General_M" required type="number" value={formData.gen_m || ''} onChange={e => setFormData({ ...formData, gen_m: e.target.value })} />
                            <FormInput label="General_F" required type="number" value={formData.gen_f || ''} onChange={e => setFormData({ ...formData, gen_f: e.target.value })} />
                            <FormInput label="OBC_M" required type="number" value={formData.obc_m || ''} onChange={e => setFormData({ ...formData, obc_m: e.target.value })} />
                            <FormInput label="OBC_F" required type="number" value={formData.obc_f || ''} onChange={e => setFormData({ ...formData, obc_f: e.target.value })} />

                            <FormInput label="SC_M" required type="number" value={formData.sc_m || ''} onChange={e => setFormData({ ...formData, sc_m: e.target.value })} />
                            <FormInput label="SC_F" required type="number" value={formData.sc_f || ''} onChange={e => setFormData({ ...formData, sc_f: e.target.value })} />
                            <FormInput label="ST_M" required type="number" value={formData.st_m || ''} onChange={e => setFormData({ ...formData, st_m: e.target.value })} />
                            <FormInput label="ST_F" required type="number" value={formData.st_f || ''} onChange={e => setFormData({ ...formData, st_f: e.target.value })} />
                        </div>
                    </FormSection>
                </div>
            )}

            {entityType === ENTITY_TYPES.ACHIEVEMENT_EXTENSION && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect
                            label="Name of SMS/KVK Head"
                            required
                            value={formData.staffName || ''}
                            onChange={(e) => setFormData({ ...formData, staffName: e.target.value })}
                            options={[
                                { value: 'Dr. Reeta Singh', label: 'Dr. Reeta Singh' },
                                { value: 'Sri Rajeev Kumar', label: 'Sri Rajeev Kumar' },
                                { value: 'Dr. Pushpam Patel', label: 'Dr. Pushpam Patel' },
                                { value: 'Smt. Sangeeta Kumari', label: 'Smt. Sangeeta Kumari' },
                            ]}
                        />
                        <FormSelect
                            label="Nature of Extension Activity"
                            required
                            value={formData.extensionActivityType || ''}
                            onChange={(e) => setFormData({ ...formData, extensionActivityType: e.target.value })}
                            options={[
                                { value: 'Field Day', label: 'Field Day' },
                                { value: 'Kisan Mela', label: 'Kisan Mela' },
                                { value: 'Kisan Gosthi', label: 'Kisan Gosthi' },
                                { value: 'Exhibition', label: 'Exhibition' },
                                { value: 'Film Show', label: 'Film Show' },
                                { value: 'Method Demonstrations', label: 'Method Demonstrations' },
                                { value: 'Group Meetings', label: 'Group Meetings' },
                                { value: 'Workshops', label: 'Workshops' },
                                { value: 'Soil Health Camps', label: 'Soil Health Camps' },
                                { value: 'Farm Advisory Services', label: 'Farm Advisory Services' },
                                { value: 'Diagnostic Visits', label: 'Diagnostic Visits' },
                            ]}
                        />
                        <FormInput
                            label="No. of activities"
                            required
                            type="number"
                            value={formData.activityCount || ''}
                            onChange={(e) => setFormData({ ...formData, activityCount: e.target.value })}
                        />
                        <div className="hidden md:block"></div> { /* Spacer */}

                        <FormInput
                            label="Start Date"
                            required
                            type="date"
                            value={formData.startDate || ''}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                        <FormInput
                            label="End Date"
                            required
                            type="date"
                            value={formData.endDate || ''}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                    </div>

                    <FormSection title="Farmers">
                        <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormInput label="General_M" required type="number" value={formData.gen_m || ''} onChange={e => setFormData({ ...formData, gen_m: e.target.value })} />
                            <FormInput label="General_F" required type="number" value={formData.gen_f || ''} onChange={e => setFormData({ ...formData, gen_f: e.target.value })} />
                            <FormInput label="OBC_M" required type="number" value={formData.obc_m || ''} onChange={e => setFormData({ ...formData, obc_m: e.target.value })} />
                            <FormInput label="OBC_F" required type="number" value={formData.obc_f || ''} onChange={e => setFormData({ ...formData, obc_f: e.target.value })} />

                            <FormInput label="SC_M" required type="number" value={formData.sc_m || ''} onChange={e => setFormData({ ...formData, sc_m: e.target.value })} />
                            <FormInput label="SC_F" required type="number" value={formData.sc_f || ''} onChange={e => setFormData({ ...formData, sc_f: e.target.value })} />
                            <FormInput label="ST_M" required type="number" value={formData.st_m || ''} onChange={e => setFormData({ ...formData, st_m: e.target.value })} />
                            <FormInput label="ST_F" required type="number" value={formData.st_f || ''} onChange={e => setFormData({ ...formData, st_f: e.target.value })} />
                        </div>
                    </FormSection>

                    <FormSection title="Extension Officials">
                        <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormInput label="General_M" required type="number" value={formData.ext_gen_m || ''} onChange={e => setFormData({ ...formData, ext_gen_m: e.target.value })} />
                            <FormInput label="General_F" required type="number" value={formData.ext_gen_f || ''} onChange={e => setFormData({ ...formData, ext_gen_f: e.target.value })} />
                            <FormInput label="OBC_M" required type="number" value={formData.ext_obc_m || ''} onChange={e => setFormData({ ...formData, ext_obc_m: e.target.value })} />
                            <FormInput label="OBC_F" required type="number" value={formData.ext_obc_f || ''} onChange={e => setFormData({ ...formData, ext_obc_f: e.target.value })} />

                            <FormInput label="SC_M" required type="number" value={formData.ext_sc_m || ''} onChange={e => setFormData({ ...formData, ext_sc_m: e.target.value })} />
                            <FormInput label="SC_F" required type="number" value={formData.ext_sc_f || ''} onChange={e => setFormData({ ...formData, ext_sc_f: e.target.value })} />
                            <FormInput label="ST_M" required type="number" value={formData.ext_st_m || ''} onChange={e => setFormData({ ...formData, ext_st_m: e.target.value })} />
                            <FormInput label="ST_F" required type="number" value={formData.ext_st_f || ''} onChange={e => setFormData({ ...formData, ext_st_f: e.target.value })} />
                        </div>
                    </FormSection>
                </div>
            )}

            {entityType === ENTITY_TYPES.ACHIEVEMENT_OTHER_EXTENSION && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect
                            label="Name of SMS/KVK Head"
                            required
                            value={formData.staffName || ''}
                            onChange={(e) => setFormData({ ...formData, staffName: e.target.value })}
                            options={[
                                { value: 'Dr. Reeta Singh', label: 'Dr. Reeta Singh' },
                                { value: 'Sri Rajeev Kumar', label: 'Sri Rajeev Kumar' },
                                { value: 'Dr. Pushpam Patel', label: 'Dr. Pushpam Patel' },
                                { value: 'Smt. Sangeeta Kumari', label: 'Smt. Sangeeta Kumari' },
                            ]}
                        />
                        <FormSelect
                            label="Nature of Extension Activity"
                            required
                            value={formData.extensionActivityType || ''}
                            onChange={(e) => setFormData({ ...formData, extensionActivityType: e.target.value })}
                            options={[
                                { value: 'Newspaper coverage', label: 'Newspaper coverage' },
                                { value: 'Popular articles', label: 'Popular articles' },
                                { value: 'Radio Talks', label: 'Radio Talks' },
                                { value: 'TV Talks', label: 'TV Talks' },
                                { value: 'Animal Health Camps', label: 'Animal Health Camps' },
                                { value: 'Advisory Services', label: 'Advisory Services' },
                                { value: 'Others', label: 'Others' },
                            ]}
                        />
                        <FormInput
                            label="No. of activities"
                            required
                            type="number"
                            value={formData.activityCount || ''}
                            onChange={(e) => setFormData({ ...formData, activityCount: e.target.value })}
                        />
                        <div className="hidden md:block"></div> { /* Spacer */}

                        <FormInput
                            label="Start Date"
                            required
                            type="date"
                            value={formData.startDate || ''}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                        <FormInput
                            label="End Date"
                            required
                            type="date"
                            value={formData.endDate || ''}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                    </div>

                    <FormSection title="Farmers">
                        <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormInput label="General_M" required type="number" value={formData.gen_m || ''} onChange={e => setFormData({ ...formData, gen_m: e.target.value })} />
                            <FormInput label="General_F" required type="number" value={formData.gen_f || ''} onChange={e => setFormData({ ...formData, gen_f: e.target.value })} />
                            <FormInput label="OBC_M" required type="number" value={formData.obc_m || ''} onChange={e => setFormData({ ...formData, obc_m: e.target.value })} />
                            <FormInput label="OBC_F" required type="number" value={formData.obc_f || ''} onChange={e => setFormData({ ...formData, obc_f: e.target.value })} />

                            <FormInput label="SC_M" required type="number" value={formData.sc_m || ''} onChange={e => setFormData({ ...formData, sc_m: e.target.value })} />
                            <FormInput label="SC_F" required type="number" value={formData.sc_f || ''} onChange={e => setFormData({ ...formData, sc_f: e.target.value })} />
                            <FormInput label="ST_M" required type="number" value={formData.st_m || ''} onChange={e => setFormData({ ...formData, st_m: e.target.value })} />
                            <FormInput label="ST_F" required type="number" value={formData.st_f || ''} onChange={e => setFormData({ ...formData, st_f: e.target.value })} />
                        </div>
                    </FormSection>

                    <FormSection title="Extension Officials">
                        <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormInput label="General_M" required type="number" value={formData.ext_gen_m || ''} onChange={e => setFormData({ ...formData, ext_gen_m: e.target.value })} />
                            <FormInput label="General_F" required type="number" value={formData.ext_gen_f || ''} onChange={e => setFormData({ ...formData, ext_gen_f: e.target.value })} />
                            <FormInput label="OBC_M" required type="number" value={formData.ext_obc_m || ''} onChange={e => setFormData({ ...formData, ext_obc_m: e.target.value })} />
                            <FormInput label="OBC_F" required type="number" value={formData.ext_obc_f || ''} onChange={e => setFormData({ ...formData, ext_obc_f: e.target.value })} />

                            <FormInput label="SC_M" required type="number" value={formData.ext_sc_m || ''} onChange={e => setFormData({ ...formData, ext_sc_m: e.target.value })} />
                            <FormInput label="SC_F" required type="number" value={formData.ext_sc_f || ''} onChange={e => setFormData({ ...formData, ext_sc_f: e.target.value })} />
                            <FormInput label="ST_M" required type="number" value={formData.ext_st_m || ''} onChange={e => setFormData({ ...formData, ext_st_m: e.target.value })} />
                            <FormInput label="ST_F" required type="number" value={formData.ext_st_f || ''} onChange={e => setFormData({ ...formData, ext_st_f: e.target.value })} />
                        </div>
                    </FormSection>
                </div>
            )}

            {entityType === ENTITY_TYPES.ACHIEVEMENT_TECHNOLOGY_WEEK && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            label="Start Date"
                            required
                            type="date"
                            value={formData.startDate || ''}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                        <FormInput
                            label="End Date"
                            required
                            type="date"
                            value={formData.endDate || ''}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                        <FormInput
                            label="Type of activities"
                            required
                            value={formData.activityType || ''}
                            onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
                        />
                        <FormInput
                            label="No. of activities"
                            required
                            type="number"
                            value={formData.activityCount || ''}
                            onChange={(e) => setFormData({ ...formData, activityCount: e.target.value })}
                        />
                        <div className="md:col-span-2">
                            <FormInput
                                label="Related crop/livestock technology"
                                required
                                value={formData.relatedTechnology || ''}
                                onChange={(e) => setFormData({ ...formData, relatedTechnology: e.target.value })}
                            />
                        </div>
                    </div>

                    <FormSection title="Farmers Details">
                        <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormInput label="General_M" required type="number" value={formData.gen_m || ''} onChange={e => setFormData({ ...formData, gen_m: e.target.value })} />
                            <FormInput label="General_F" required type="number" value={formData.gen_f || ''} onChange={e => setFormData({ ...formData, gen_f: e.target.value })} />
                            <FormInput label="OBC_M" required type="number" value={formData.obc_m || ''} onChange={e => setFormData({ ...formData, obc_m: e.target.value })} />
                            <FormInput label="OBC_F" required type="number" value={formData.obc_f || ''} onChange={e => setFormData({ ...formData, obc_f: e.target.value })} />

                            <FormInput label="SC_M" required type="number" value={formData.sc_m || ''} onChange={e => setFormData({ ...formData, sc_m: e.target.value })} />
                            <FormInput label="SC_F" required type="number" value={formData.sc_f || ''} onChange={e => setFormData({ ...formData, sc_f: e.target.value })} />
                            <FormInput label="ST_M" required type="number" value={formData.st_m || ''} onChange={e => setFormData({ ...formData, st_m: e.target.value })} />
                            <FormInput label="ST_F" required type="number" value={formData.st_f || ''} onChange={e => setFormData({ ...formData, st_f: e.target.value })} />
                        </div>
                    </FormSection>
                </div>
            )}

            {entityType === ENTITY_TYPES.ACHIEVEMENT_CELEBRATION_DAYS && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            label="Event Date"
                            required
                            type="date"
                            value={formData.eventDate || ''}
                            onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                        />
                        <FormSelect
                            label="Important days"
                            required
                            value={formData.importantDay || ''}
                            onChange={(e) => setFormData({ ...formData, importantDay: e.target.value })}
                            options={[
                                { value: 'World Soil Day', label: 'World Soil Day' },
                                { value: 'International Women\'s Day', label: 'International Women\'s Day' },
                                { value: 'World Environment Day', label: 'World Environment Day' },
                                { value: 'Kisan Diwas', label: 'Kisan Diwas' },
                                { value: 'Others', label: 'Others' },
                            ]}
                        />
                        <div className="md:col-span-2">
                            <FormInput
                                label="No. of activities"
                                required
                                type="number"
                                value={formData.activityCount || ''}
                                onChange={(e) => setFormData({ ...formData, activityCount: e.target.value })}
                            />
                        </div>
                    </div>

                    <FormSection title="Farmers">
                        <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormInput label="General_M" required type="number" value={formData.gen_m || ''} onChange={e => setFormData({ ...formData, gen_m: e.target.value })} />
                            <FormInput label="General_F" required type="number" value={formData.gen_f || ''} onChange={e => setFormData({ ...formData, gen_f: e.target.value })} />
                            <FormInput label="OBC_M" required type="number" value={formData.obc_m || ''} onChange={e => setFormData({ ...formData, obc_m: e.target.value })} />
                            <FormInput label="OBC_F" required type="number" value={formData.obc_f || ''} onChange={e => setFormData({ ...formData, obc_f: e.target.value })} />

                            <FormInput label="SC_M" required type="number" value={formData.sc_m || ''} onChange={e => setFormData({ ...formData, sc_m: e.target.value })} />
                            <FormInput label="SC_F" required type="number" value={formData.sc_f || ''} onChange={e => setFormData({ ...formData, sc_f: e.target.value })} />
                            <FormInput label="ST_M" required type="number" value={formData.st_m || ''} onChange={e => setFormData({ ...formData, st_m: e.target.value })} />
                            <FormInput label="ST_F" required type="number" value={formData.st_f || ''} onChange={e => setFormData({ ...formData, st_f: e.target.value })} />
                        </div>
                    </FormSection>

                    <FormSection title="Extension Officials">
                        <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormInput label="General_M" required type="number" value={formData.ext_gen_m || ''} onChange={e => setFormData({ ...formData, ext_gen_m: e.target.value })} />
                            <FormInput label="General_F" required type="number" value={formData.ext_gen_f || ''} onChange={e => setFormData({ ...formData, ext_gen_f: e.target.value })} />
                            <FormInput label="OBC_M" required type="number" value={formData.ext_obc_m || ''} onChange={e => setFormData({ ...formData, ext_obc_m: e.target.value })} />
                            <FormInput label="OBC_F" required type="number" value={formData.ext_obc_f || ''} onChange={e => setFormData({ ...formData, ext_obc_f: e.target.value })} />

                            <FormInput label="SC_M" required type="number" value={formData.ext_sc_m || ''} onChange={e => setFormData({ ...formData, ext_sc_m: e.target.value })} />
                            <FormInput label="SC_F" required type="number" value={formData.ext_sc_f || ''} onChange={e => setFormData({ ...formData, ext_sc_f: e.target.value })} />
                            <FormInput label="ST_M" required type="number" value={formData.ext_st_m || ''} onChange={e => setFormData({ ...formData, ext_st_m: e.target.value })} />
                            <FormInput label="ST_F" required type="number" value={formData.ext_st_f || ''} onChange={e => setFormData({ ...formData, ext_st_f: e.target.value })} />
                        </div>
                    </FormSection>
                </div>
            )}        </>
    )
}
