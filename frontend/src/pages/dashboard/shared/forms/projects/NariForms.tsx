import React from 'react'
import { ENTITY_TYPES } from '../../../../../constants/entityTypes'
import { FormInput, FormSelect } from '../shared/FormComponents'
import { ExtendedEntityType } from '../../../../../utils/masterUtils'

interface NariFormsProps {
    entityType: ExtendedEntityType
    formData: any
    setFormData: (data: any) => void
    YearSelect: React.FC
}

export const NariForms: React.FC<NariFormsProps> = ({
    entityType,
    formData,
    setFormData,
    YearSelect,
}) => {
    return (
        <>
            {/* Nutrition Garden Form */}
            {entityType === ENTITY_TYPES.PROJECT_NARI_NUTRI_GARDEN && (
                <div className="space-y-8">
                    <div className="mb-6">
                        <h3 className="text-xl font-normal text-gray-800">Add Details of Established Nutrition Garden in Nutri-Smart Village</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <YearSelect />

                            <FormSelect
                                label="Activity"
                                required
                                value={formData.activity || ''}
                                options={[
                                    { value: 'Establishment of Nutrition Garden', label: 'Establishment of Nutrition Garden' },
                                    { value: 'Distribution of Planting Material', label: 'Distribution of Planting Material' },
                                    { value: 'Training', label: 'Training' },
                                ]}
                                onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                            />

                            <FormInput
                                label="Name of Nutri-Smart Village"
                                required
                                value={formData.villageName || ''}
                                onChange={(e) => setFormData({ ...formData, villageName: e.target.value })}
                            />

                            <FormSelect
                                label="Type of Nutritional Garden"
                                required
                                value={formData.gardenType || ''}
                                options={[
                                    { value: 'Backyard', label: 'Backyard' },
                                    { value: 'Community', label: 'Community' },
                                    { value: 'School', label: 'School' },
                                    { value: 'Rooftop', label: 'Rooftop' },
                                    { value: 'Vertical', label: 'Vertical' },
                                ]}
                                onChange={(e) => setFormData({ ...formData, gardenType: e.target.value })}
                            />

                            <FormInput
                                label="Number"
                                type="number"
                                required
                                value={formData.number || ''}
                                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                            />

                            <FormInput
                                label="Area (sqm)"
                                type="number"
                                required
                                value={formData.area || ''}
                                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Beneficiaries Section */}
                    <div className="p-6 bg-white rounded-lg border border-gray-100 shadow-sm space-y-6">
                        <h4 className="text-lg font-normal text-gray-800">No. of beneficiaries</h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <FormInput
                                label="General_M"
                                type="number"
                                required
                                value={formData.genMale || ''}
                                onChange={(e) => setFormData({ ...formData, genMale: e.target.value })}
                            />
                            <FormInput
                                label="General_F"
                                type="number"
                                required
                                value={formData.genFemale || ''}
                                onChange={(e) => setFormData({ ...formData, genFemale: e.target.value })}
                            />
                            <FormInput
                                label="OBC_M"
                                type="number"
                                required
                                value={formData.obcMale || ''}
                                onChange={(e) => setFormData({ ...formData, obcMale: e.target.value })}
                            />
                            <FormInput
                                label="OBC_F"
                                type="number"
                                required
                                value={formData.obcFemale || ''}
                                onChange={(e) => setFormData({ ...formData, obcFemale: e.target.value })}
                            />
                            <FormInput
                                label="SC_M"
                                type="number"
                                required
                                value={formData.scMale || ''}
                                onChange={(e) => setFormData({ ...formData, scMale: e.target.value })}
                            />
                            <FormInput
                                label="SC_F"
                                type="number"
                                required
                                value={formData.scFemale || ''}
                                onChange={(e) => setFormData({ ...formData, scFemale: e.target.value })}
                            />
                            <FormInput
                                label="ST_M"
                                type="number"
                                required
                                value={formData.stMale || ''}
                                onChange={(e) => setFormData({ ...formData, stMale: e.target.value })}
                            />
                            <FormInput
                                label="ST_F"
                                type="number"
                                required
                                value={formData.stFemale || ''}
                                onChange={(e) => setFormData({ ...formData, stFemale: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Bio-fortified Crops Form */}
            {entityType === ENTITY_TYPES.PROJECT_NARI_BIO_FORTIFIED && (
                <div className="space-y-8">
                    <div className="mb-6">
                        <h3 className="text-xl font-normal text-gray-800">Create Details of Bio-fortified crops used in Nutri-Smart village</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <YearSelect />

                            <FormInput
                                label="Name of Nutri-Smart Village"
                                required
                                value={formData.villageName || ''}
                                onChange={(e) => setFormData({ ...formData, villageName: e.target.value })}
                            />

                            <FormSelect
                                label="Season"
                                required
                                value={formData.season || ''}
                                options={[
                                    { value: 'Kharif', label: 'Kharif' },
                                    { value: 'Rabi', label: 'Rabi' },
                                    { value: 'Zaid', label: 'Zaid' },
                                ]}
                                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                            />

                            <FormSelect
                                label="Activity"
                                required
                                value={formData.activity || ''}
                                options={[
                                    { value: 'Introduction of Bio-fortified Crops', label: 'Introduction of Bio-fortified Crops' },
                                    { value: 'Popularization', label: 'Popularization' },
                                ]}
                                onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                            />

                            <FormSelect
                                label="Category of Crop"
                                required
                                value={formData.cropCategory || ''}
                                options={[
                                    { value: 'Cereal', label: 'Cereal' },
                                    { value: 'Pulse', label: 'Pulse' },
                                    { value: 'Oilseed', label: 'Oilseed' },
                                    { value: 'Vegetable', label: 'Vegetable' },
                                    { value: 'Fruit', label: 'Fruit' },
                                ]}
                                onChange={(e) => setFormData({ ...formData, cropCategory: e.target.value })}
                            />

                            <FormInput
                                label="Name of Crop"
                                required
                                value={formData.cropName || ''}
                                onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                            />

                            <FormInput
                                label="Variety"
                                required
                                value={formData.variety || ''}
                                onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                            />

                            <FormInput
                                label="Area(ha)"
                                type="number"
                                required
                                value={formData.area || ''}
                                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Beneficiaries Section */}
                    <div className="p-6 bg-white rounded-lg border border-gray-100 shadow-sm space-y-6">
                        <h4 className="text-lg font-normal text-gray-800">No. of beneficiaries</h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <FormInput
                                label="General_M"
                                type="number"
                                required
                                value={formData.genMale || ''}
                                onChange={(e) => setFormData({ ...formData, genMale: e.target.value })}
                            />
                            <FormInput
                                label="General_F"
                                type="number"
                                required
                                value={formData.genFemale || ''}
                                onChange={(e) => setFormData({ ...formData, genFemale: e.target.value })}
                            />
                            <FormInput
                                label="OBC_M"
                                type="number"
                                required
                                value={formData.obcMale || ''}
                                onChange={(e) => setFormData({ ...formData, obcMale: e.target.value })}
                            />
                            <FormInput
                                label="OBC_F"
                                type="number"
                                required
                                value={formData.obcFemale || ''}
                                onChange={(e) => setFormData({ ...formData, obcFemale: e.target.value })}
                            />
                            <FormInput
                                label="SC_M"
                                type="number"
                                required
                                value={formData.scMale || ''}
                                onChange={(e) => setFormData({ ...formData, scMale: e.target.value })}
                            />
                            <FormInput
                                label="SC_F"
                                type="number"
                                required
                                value={formData.scFemale || ''}
                                onChange={(e) => setFormData({ ...formData, scFemale: e.target.value })}
                            />
                            <FormInput
                                label="ST_M"
                                type="number"
                                required
                                value={formData.stMale || ''}
                                onChange={(e) => setFormData({ ...formData, stMale: e.target.value })}
                            />
                            <FormInput
                                label="ST_F"
                                type="number"
                                required
                                value={formData.stFemale || ''}
                                onChange={(e) => setFormData({ ...formData, stFemale: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Value Addition Form */}
            {entityType === ENTITY_TYPES.PROJECT_NARI_VALUE_ADDITION && (
                <div className="space-y-8">
                    <div className="mb-6">
                        <h3 className="text-xl font-normal text-gray-800">Create Details of Value addition in Nutri-Smart village</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <YearSelect />

                            <FormInput
                                label="Name of Nutri-Smart Village"
                                required
                                value={formData.villageName || ''}
                                onChange={(e) => setFormData({ ...formData, villageName: e.target.value })}
                            />

                            <FormInput
                                label="Name of Crop/veg./fruits/other"
                                required
                                value={formData.cropName || ''}
                                onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                            />

                            <FormSelect
                                label="Activity"
                                required
                                value={formData.activity || ''}
                                options={[
                                    { value: 'Value Addition', label: 'Value Addition' },
                                    { value: 'Processing', label: 'Processing' },
                                    { value: 'Packaging', label: 'Packaging' },
                                    { value: 'Labelling', label: 'Labelling' },
                                ]}
                                onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                            />

                            <FormInput
                                label="Name of Value-added product"
                                required
                                value={formData.productName || ''}
                                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Beneficiaries Section */}
                    <div className="p-6 bg-white rounded-lg border border-gray-100 shadow-sm space-y-6">
                        <h4 className="text-lg font-normal text-gray-800">No. of beneficiaries</h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <FormInput
                                label="General_M"
                                type="number"
                                required
                                value={formData.genMale || ''}
                                onChange={(e) => setFormData({ ...formData, genMale: e.target.value })}
                            />
                            <FormInput
                                label="General_F"
                                type="number"
                                required
                                value={formData.genFemale || ''}
                                onChange={(e) => setFormData({ ...formData, genFemale: e.target.value })}
                            />
                            <FormInput
                                label="OBC_M"
                                type="number"
                                required
                                value={formData.obcMale || ''}
                                onChange={(e) => setFormData({ ...formData, obcMale: e.target.value })}
                            />
                            <FormInput
                                label="OBC_F"
                                type="number"
                                required
                                value={formData.obcFemale || ''}
                                onChange={(e) => setFormData({ ...formData, obcFemale: e.target.value })}
                            />
                            <FormInput
                                label="SC_M"
                                type="number"
                                required
                                value={formData.scMale || ''}
                                onChange={(e) => setFormData({ ...formData, scMale: e.target.value })}
                            />
                            <FormInput
                                label="SC_F"
                                type="number"
                                required
                                value={formData.scFemale || ''}
                                onChange={(e) => setFormData({ ...formData, scFemale: e.target.value })}
                            />
                            <FormInput
                                label="ST_M"
                                type="number"
                                required
                                value={formData.stMale || ''}
                                onChange={(e) => setFormData({ ...formData, stMale: e.target.value })}
                            />
                            <FormInput
                                label="ST_F"
                                type="number"
                                required
                                value={formData.stFemale || ''}
                                onChange={(e) => setFormData({ ...formData, stFemale: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Training Programmes Form */}
            {entityType === ENTITY_TYPES.PROJECT_NARI_TRAINING && (
                <div className="space-y-8">
                    <div className="mb-6">
                        <h3 className="text-xl font-normal text-gray-800">Create Training Programmes in Nutri-Smart Village</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <YearSelect />

                            <FormInput
                                label="Name of Nutri-Smart Village"
                                required
                                value={formData.villageName || ''}
                                onChange={(e) => setFormData({ ...formData, villageName: e.target.value })}
                            />

                            <FormInput
                                label="Area of Training"
                                required
                                value={formData.trainingArea || ''}
                                onChange={(e) => setFormData({ ...formData, trainingArea: e.target.value })}
                            />

                            <FormSelect
                                label="Activity"
                                required
                                value={formData.activity || ''}
                                options={[
                                    { value: 'Capacity Building', label: 'Capacity Building' },
                                    { value: 'Skill Development', label: 'Skill Development' },
                                    { value: 'Awareness', label: 'Awareness' },
                                ]}
                                onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                            />

                            <FormInput
                                label="Title of training"
                                required
                                value={formData.trainingTitle || ''}
                                onChange={(e) => setFormData({ ...formData, trainingTitle: e.target.value })}
                            />

                            <FormInput
                                label="No of days"
                                type="number"
                                required
                                value={formData.days || ''}
                                onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                            />

                            <FormInput
                                label="No of courses"
                                type="number"
                                required
                                value={formData.courses || ''}
                                onChange={(e) => setFormData({ ...formData, courses: e.target.value })}
                            />

                            <FormSelect
                                label="On Campus/Off Campus"
                                required
                                value={formData.campusType || ''}
                                options={[
                                    { value: 'On Campus', label: 'On Campus' },
                                    { value: 'Off Campus', label: 'Off Campus' },
                                ]}
                                onChange={(e) => setFormData({ ...formData, campusType: e.target.value })}
                            />

                            <FormInput
                                label="Venue"
                                required
                                value={formData.venue || ''}
                                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Beneficiaries Section */}
                    <div className="p-6 bg-white rounded-lg border border-gray-100 shadow-sm space-y-6">
                        <h4 className="text-lg font-normal text-gray-800">No. of beneficiaries</h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <FormInput
                                label="General_M"
                                type="number"
                                required
                                value={formData.genMale || ''}
                                onChange={(e) => setFormData({ ...formData, genMale: e.target.value })}
                            />
                            <FormInput
                                label="General_F"
                                type="number"
                                required
                                value={formData.genFemale || ''}
                                onChange={(e) => setFormData({ ...formData, genFemale: e.target.value })}
                            />
                            <FormInput
                                label="OBC_M"
                                type="number"
                                required
                                value={formData.obcMale || ''}
                                onChange={(e) => setFormData({ ...formData, obcMale: e.target.value })}
                            />
                            <FormInput
                                label="OBC_F"
                                type="number"
                                required
                                value={formData.obcFemale || ''}
                                onChange={(e) => setFormData({ ...formData, obcFemale: e.target.value })}
                            />
                            <FormInput
                                label="SC_M"
                                type="number"
                                required
                                value={formData.scMale || ''}
                                onChange={(e) => setFormData({ ...formData, scMale: e.target.value })}
                            />
                            <FormInput
                                label="SC_F"
                                type="number"
                                required
                                value={formData.scFemale || ''}
                                onChange={(e) => setFormData({ ...formData, scFemale: e.target.value })}
                            />
                            <FormInput
                                label="ST_M"
                                type="number"
                                required
                                value={formData.stMale || ''}
                                onChange={(e) => setFormData({ ...formData, stMale: e.target.value })}
                            />
                            <FormInput
                                label="ST_F"
                                type="number"
                                required
                                value={formData.stFemale || ''}
                                onChange={(e) => setFormData({ ...formData, stFemale: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Extension Activities Form */}
            {entityType === ENTITY_TYPES.PROJECT_NARI_EXTENSION && (
                <div className="space-y-8">
                    <div className="mb-6">
                        <h3 className="text-xl font-normal text-gray-800">Create Extension Activities under NARI Project</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <YearSelect />

                            <FormInput
                                label="Name of Nutri-Smart Village"
                                required
                                value={formData.villageName || ''}
                                onChange={(e) => setFormData({ ...formData, villageName: e.target.value })}
                            />

                            <FormSelect
                                label="Activity"
                                required
                                value={formData.activity || ''}
                                options={[
                                    { value: 'Field Days', label: 'Field Days' },
                                    { value: 'Diagnostic Visits', label: 'Diagnostic Visits' },
                                    { value: 'Kisan Goshties', label: 'Kisan Goshties' },
                                    { value: 'Exposure Visits', label: 'Exposure Visits' },
                                    { value: 'Kisan Mela', label: 'Kisan Mela' },
                                ]}
                                onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                            />

                            <FormInput
                                label="Name of Activity"
                                required
                                value={formData.activityName || ''}
                                onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
                            />

                            <FormInput
                                label="No of Activities"
                                type="number"
                                required
                                value={formData.activitiesCount || ''}
                                onChange={(e) => setFormData({ ...formData, activitiesCount: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Beneficiaries Section */}
                    <div className="p-6 bg-white rounded-lg border border-gray-100 shadow-sm space-y-6">
                        <h4 className="text-lg font-normal text-gray-800">No. of beneficiaries</h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <FormInput
                                label="General_M"
                                type="number"
                                required
                                value={formData.genMale || ''}
                                onChange={(e) => setFormData({ ...formData, genMale: e.target.value })}
                            />
                            <FormInput
                                label="General_F"
                                type="number"
                                required
                                value={formData.genFemale || ''}
                                onChange={(e) => setFormData({ ...formData, genFemale: e.target.value })}
                            />
                            <FormInput
                                label="OBC_M"
                                type="number"
                                required
                                value={formData.obcMale || ''}
                                onChange={(e) => setFormData({ ...formData, obcMale: e.target.value })}
                            />
                            <FormInput
                                label="OBC_F"
                                type="number"
                                required
                                value={formData.obcFemale || ''}
                                onChange={(e) => setFormData({ ...formData, obcFemale: e.target.value })}
                            />
                            <FormInput
                                label="SC_M"
                                type="number"
                                required
                                value={formData.scMale || ''}
                                onChange={(e) => setFormData({ ...formData, scMale: e.target.value })}
                            />
                            <FormInput
                                label="SC_F"
                                type="number"
                                required
                                value={formData.scFemale || ''}
                                onChange={(e) => setFormData({ ...formData, scFemale: e.target.value })}
                            />
                            <FormInput
                                label="ST_M"
                                type="number"
                                required
                                value={formData.stMale || ''}
                                onChange={(e) => setFormData({ ...formData, stMale: e.target.value })}
                            />
                            <FormInput
                                label="ST_F"
                                type="number"
                                required
                                value={formData.stFemale || ''}
                                onChange={(e) => setFormData({ ...formData, stFemale: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
