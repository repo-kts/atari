import React from 'react'
import { ENTITY_TYPES } from '../../../../../constants/entityTypes'
import { FormInput, FormSelect } from '../shared/FormComponents'

interface NariFormsProps {
    entityType: string
    formData: any
    setFormData: (data: any) => void
    years: any[]
    seasons: any[]
}

export const NariForms: React.FC<NariFormsProps> = ({
    entityType,
    formData,
    setFormData,
    years,
    seasons
}) => {
    return (
        <>
            {entityType === ENTITY_TYPES.PROJECT_NARI_NUTRI_GARDEN && (
                <div className="space-y-10">
                    {/* Basic Details Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormSelect
                            label="Reporting Year"
                            required
                            value={formData.yearId || ''}
                            onChange={(e) => setFormData({ ...formData, yearId: parseInt(e.target.value) })}
                            options={years.map((y: any) => ({ value: String(y.id || y.yearId), label: y.yearName || y.year || y.name }))}
                        />
                        <FormSelect
                            label="Activity"
                            required
                            value={formData.activity || ''}
                            onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                            options={[
                                { value: 'Establishment', label: 'Establishment' },
                                { value: 'Maintenance', label: 'Maintenance' }
                            ]}
                            placeholder="Select Option"
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
                            onChange={(e) => setFormData({ ...formData, gardenType: e.target.value })}
                            options={[
                                { value: 'Kitchen Garden', label: 'Kitchen Garden' },
                                { value: 'Terrace Garden', label: 'Terrace Garden' },
                                { value: 'Vertical Garden', label: 'Vertical Garden' }
                            ]}
                            placeholder="Select Option"
                        />
                        <FormInput
                            label="Number"
                            required
                            type="number"
                            value={formData.number || ''}
                            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                        />
                        <FormInput
                            label="Area (sqm)"
                            required
                            type="number"
                            value={formData.areaSqm || ''}
                            onChange={(e) => setFormData({ ...formData, areaSqm: e.target.value })}
                        />
                    </div>

                    {/* Beneficiary Details Section */}
                    <div className="p-8 border border-gray-100 rounded-2xl bg-white shadow-sm space-y-8">
                        <h3 className="text-xl font-semibold text-gray-800">No. of beneficiaries</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FormInput
                                label="General_M"
                                required
                                type="number"
                                value={formData.genMale || ''}
                                onChange={(e) => setFormData({ ...formData, genMale: e.target.value })}
                            />
                            <FormInput
                                label="General_F"
                                required
                                type="number"
                                value={formData.genFemale || ''}
                                onChange={(e) => setFormData({ ...formData, genFemale: e.target.value })}
                            />
                            <FormInput
                                label="OBC_M"
                                required
                                type="number"
                                value={formData.obcMale || ''}
                                onChange={(e) => setFormData({ ...formData, obcMale: e.target.value })}
                            />
                            <FormInput
                                label="OBC_F"
                                required
                                type="number"
                                value={formData.obcFemale || ''}
                                onChange={(e) => setFormData({ ...formData, obcFemale: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FormInput
                                label="SC_M"
                                required
                                type="number"
                                value={formData.scMale || ''}
                                onChange={(e) => setFormData({ ...formData, scMale: e.target.value })}
                            />
                            <FormInput
                                label="SC_F"
                                required
                                type="number"
                                value={formData.scFemale || ''}
                                onChange={(e) => setFormData({ ...formData, scFemale: e.target.value })}
                            />
                            <FormInput
                                label="ST_M"
                                required
                                type="number"
                                value={formData.stMale || ''}
                                onChange={(e) => setFormData({ ...formData, stMale: e.target.value })}
                            />
                            <FormInput
                                label="ST_F"
                                required
                                type="number"
                                value={formData.stFemale || ''}
                                onChange={(e) => setFormData({ ...formData, stFemale: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_NARI_BIO_FORTIFIED && (
                <div className="space-y-10">
                    {/* Basic Details Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormSelect
                            label="Reporting Year"
                            required
                            value={formData.yearId || ''}
                            onChange={(e) => setFormData({ ...formData, yearId: parseInt(e.target.value) })}
                            options={years.map((y: any) => ({ value: String(y.id || y.yearId), label: y.yearName || y.year || y.name }))}
                        />
                        <FormInput
                            label="Name of Nutri-Smart Village"
                            required
                            value={formData.villageName || ''}
                            onChange={(e) => setFormData({ ...formData, villageName: e.target.value })}
                        />
                        <FormSelect
                            label="Season"
                            required
                            value={formData.seasonId || ''}
                            onChange={(e) => setFormData({ ...formData, seasonId: parseInt(e.target.value) })}
                            options={seasons.map((s: any) => ({ value: s.id || s.seasonId, label: s.seasonName }))}
                            placeholder="Select One"
                        />
                        <FormSelect
                            label="Activity"
                            required
                            value={formData.activity || ''}
                            onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                            options={[
                                { value: 'Demonstration', label: 'Demonstration' },
                                { value: 'Training', label: 'Training' }
                            ]}
                            placeholder="Select Option"
                        />
                        <FormSelect
                            label="Category of Crop"
                            required
                            value={formData.cropCategory || ''}
                            onChange={(e) => setFormData({ ...formData, cropCategory: e.target.value })}
                            options={[
                                { value: 'Cereal', label: 'Cereal' },
                                { value: 'Pulse', label: 'Pulse' },
                                { value: 'Oilseed', label: 'Oilseed' },
                                { value: 'Vegetable', label: 'Vegetable' },
                                { value: 'Fruit', label: 'Fruit' }
                            ]}
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
                            required
                            type="number"
                            step="0.01"
                            value={formData.areaHa || ''}
                            onChange={(e) => setFormData({ ...formData, areaHa: e.target.value })}
                        />
                    </div>

                    {/* Beneficiary Details Section */}
                    <div className="p-8 border border-gray-100 rounded-2xl bg-white shadow-sm space-y-8">
                        <h3 className="text-xl font-semibold text-gray-800">No. of beneficiaries</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FormInput
                                label="General_M"
                                required
                                type="number"
                                value={formData.genMale || ''}
                                onChange={(e) => setFormData({ ...formData, genMale: e.target.value })}
                            />
                            <FormInput
                                label="General_F"
                                required
                                type="number"
                                value={formData.genFemale || ''}
                                onChange={(e) => setFormData({ ...formData, genFemale: e.target.value })}
                            />
                            <FormInput
                                label="OBC_M"
                                required
                                type="number"
                                value={formData.obcMale || ''}
                                onChange={(e) => setFormData({ ...formData, obcMale: e.target.value })}
                            />
                            <FormInput
                                label="OBC_F"
                                required
                                type="number"
                                value={formData.obcFemale || ''}
                                onChange={(e) => setFormData({ ...formData, obcFemale: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FormInput
                                label="SC_M"
                                required
                                type="number"
                                value={formData.scMale || ''}
                                onChange={(e) => setFormData({ ...formData, scMale: e.target.value })}
                            />
                            <FormInput
                                label="SC_F"
                                required
                                type="number"
                                value={formData.scFemale || ''}
                                onChange={(e) => setFormData({ ...formData, scFemale: e.target.value })}
                            />
                            <FormInput
                                label="ST_M"
                                required
                                type="number"
                                value={formData.stMale || ''}
                                onChange={(e) => setFormData({ ...formData, stMale: e.target.value })}
                            />
                            <FormInput
                                label="ST_F"
                                required
                                type="number"
                                value={formData.stFemale || ''}
                                onChange={(e) => setFormData({ ...formData, stFemale: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_NARI_VALUE_ADDITION && (
                <div className="space-y-10">
                    {/* Basic Details Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormSelect
                            label="Reporting Year"
                            required
                            value={formData.yearId || ''}
                            onChange={(e) => setFormData({ ...formData, yearId: parseInt(e.target.value) })}
                            options={years.map((y: any) => ({ value: String(y.id || y.yearId), label: y.yearName || y.year || y.name }))}
                        />
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
                            onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                            options={[
                                { value: 'Demonstration', label: 'Demonstration' },
                                { value: 'Training', label: 'Training' }
                            ]}
                            placeholder="Select Option"
                        />
                        <FormInput
                            label="Name of Value-added product"
                            required
                            value={formData.productName || ''}
                            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                        />
                    </div>

                    {/* Beneficiary Details Section */}
                    <div className="p-8 border border-gray-100 rounded-2xl bg-white shadow-sm space-y-8">
                        <h3 className="text-xl font-semibold text-gray-800">No. of beneficiaries</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FormInput
                                label="General_M"
                                required
                                type="number"
                                value={formData.genMale || ''}
                                onChange={(e) => setFormData({ ...formData, genMale: e.target.value })}
                            />
                            <FormInput
                                label="General_F"
                                required
                                type="number"
                                value={formData.genFemale || ''}
                                onChange={(e) => setFormData({ ...formData, genFemale: e.target.value })}
                            />
                            <FormInput
                                label="OBC_M"
                                required
                                type="number"
                                value={formData.obcMale || ''}
                                onChange={(e) => setFormData({ ...formData, obcMale: e.target.value })}
                            />
                            <FormInput
                                label="OBC_F"
                                required
                                type="number"
                                value={formData.obcFemale || ''}
                                onChange={(e) => setFormData({ ...formData, obcFemale: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FormInput
                                label="SC_M"
                                required
                                type="number"
                                value={formData.scMale || ''}
                                onChange={(e) => setFormData({ ...formData, scMale: e.target.value })}
                            />
                            <FormInput
                                label="SC_F"
                                required
                                type="number"
                                value={formData.scFemale || ''}
                                onChange={(e) => setFormData({ ...formData, scFemale: e.target.value })}
                            />
                            <FormInput
                                label="ST_M"
                                required
                                type="number"
                                value={formData.stMale || ''}
                                onChange={(e) => setFormData({ ...formData, stMale: e.target.value })}
                            />
                            <FormInput
                                label="ST_F"
                                required
                                type="number"
                                value={formData.stFemale || ''}
                                onChange={(e) => setFormData({ ...formData, stFemale: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_NARI_TRAINING && (
                <div className="space-y-10">
                    {/* Basic Details Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormSelect
                            label="Reporting Year"
                            required
                            value={formData.yearId || ''}
                            onChange={(e) => setFormData({ ...formData, yearId: parseInt(e.target.value) })}
                            options={years.map((y: any) => ({ value: String(y.id || y.yearId), label: y.yearName || y.year || y.name }))}
                        />
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
                            onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                            options={[
                                { value: 'Demonstration', label: 'Demonstration' },
                                { value: 'Training', label: 'Training' }
                            ]}
                            placeholder="Select Option"
                        />
                        <FormInput
                            label="Title of training"
                            required
                            value={formData.trainingTitle || ''}
                            onChange={(e) => setFormData({ ...formData, trainingTitle: e.target.value })}
                        />
                        <FormInput
                            label="No of days"
                            required
                            type="number"
                            value={formData.noOfDays || ''}
                            onChange={(e) => setFormData({ ...formData, noOfDays: e.target.value })}
                        />
                        <FormInput
                            label="No of courses"
                            required
                            type="number"
                            value={formData.noOfCourses || ''}
                            onChange={(e) => setFormData({ ...formData, noOfCourses: e.target.value })}
                        />
                        <FormSelect
                            label="On Campus/Off Campus"
                            required
                            value={formData.campusType || ''}
                            onChange={(e) => setFormData({ ...formData, campusType: e.target.value })}
                            options={[
                                { value: 'On Campus', label: 'On Campus' },
                                { value: 'Off Campus', label: 'Off Campus' }
                            ]}
                            placeholder="Please Select"
                        />
                        <FormInput
                            label="Venue"
                            required
                            value={formData.venue || ''}
                            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                        />
                    </div>

                    {/* Beneficiary Details Section */}
                    <div className="p-8 border border-gray-100 rounded-2xl bg-white shadow-sm space-y-8">
                        <h3 className="text-xl font-semibold text-gray-800">No. of beneficiaries</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FormInput
                                label="General_M"
                                required
                                type="number"
                                value={formData.genMale || ''}
                                onChange={(e) => setFormData({ ...formData, genMale: e.target.value })}
                            />
                            <FormInput
                                label="General_F"
                                required
                                type="number"
                                value={formData.genFemale || ''}
                                onChange={(e) => setFormData({ ...formData, genFemale: e.target.value })}
                            />
                            <FormInput
                                label="OBC_M"
                                required
                                type="number"
                                value={formData.obcMale || ''}
                                onChange={(e) => setFormData({ ...formData, obcMale: e.target.value })}
                            />
                            <FormInput
                                label="OBC_F"
                                required
                                type="number"
                                value={formData.obcFemale || ''}
                                onChange={(e) => setFormData({ ...formData, obcFemale: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FormInput
                                label="SC_M"
                                required
                                type="number"
                                value={formData.scMale || ''}
                                onChange={(e) => setFormData({ ...formData, scMale: e.target.value })}
                            />
                            <FormInput
                                label="SC_F"
                                required
                                type="number"
                                value={formData.scFemale || ''}
                                onChange={(e) => setFormData({ ...formData, scFemale: e.target.value })}
                            />
                            <FormInput
                                label="ST_M"
                                required
                                type="number"
                                value={formData.stMale || ''}
                                onChange={(e) => setFormData({ ...formData, stMale: e.target.value })}
                            />
                            <FormInput
                                label="ST_F"
                                required
                                type="number"
                                value={formData.stFemale || ''}
                                onChange={(e) => setFormData({ ...formData, stFemale: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_NARI_EXTENSION && (
                <div className="space-y-10">
                    {/* Basic Details Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormSelect
                            label="Reporting Year"
                            required
                            value={formData.yearId || ''}
                            onChange={(e) => setFormData({ ...formData, yearId: parseInt(e.target.value) })}
                            options={years.map((y: any) => ({ value: String(y.id || y.yearId), label: y.yearName || y.year || y.name }))}
                        />
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
                            onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                            options={[
                                { value: 'Demonstration', label: 'Demonstration' },
                                { value: 'Training', label: 'Training' }
                            ]}
                            placeholder="Select Option"
                        />
                        <FormInput
                            label="Name of Activity"
                            required
                            value={formData.activityName || ''}
                            onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
                        />
                        <FormInput
                            label="No of Activities"
                            required
                            type="number"
                            value={formData.noOfActivities || ''}
                            onChange={(e) => setFormData({ ...formData, noOfActivities: e.target.value })}
                        />
                    </div>

                    {/* Beneficiary Details Section */}
                    <div className="p-8 border border-gray-100 rounded-2xl bg-white shadow-sm space-y-8">
                        <h3 className="text-xl font-semibold text-gray-800">No. of beneficiaries</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FormInput
                                label="General_M"
                                required
                                type="number"
                                value={formData.genMale || ''}
                                onChange={(e) => setFormData({ ...formData, genMale: e.target.value })}
                            />
                            <FormInput
                                label="General_F"
                                required
                                type="number"
                                value={formData.genFemale || ''}
                                onChange={(e) => setFormData({ ...formData, genFemale: e.target.value })}
                            />
                            <FormInput
                                label="OBC_M"
                                required
                                type="number"
                                value={formData.obcMale || ''}
                                onChange={(e) => setFormData({ ...formData, obcMale: e.target.value })}
                            />
                            <FormInput
                                label="OBC_F"
                                required
                                type="number"
                                value={formData.obcFemale || ''}
                                onChange={(e) => setFormData({ ...formData, obcFemale: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FormInput
                                label="SC_M"
                                required
                                type="number"
                                value={formData.scMale || ''}
                                onChange={(e) => setFormData({ ...formData, scMale: e.target.value })}
                            />
                            <FormInput
                                label="SC_F"
                                required
                                type="number"
                                value={formData.scFemale || ''}
                                onChange={(e) => setFormData({ ...formData, scFemale: e.target.value })}
                            />
                            <FormInput
                                label="ST_M"
                                required
                                type="number"
                                value={formData.stMale || ''}
                                onChange={(e) => setFormData({ ...formData, stMale: e.target.value })}
                            />
                            <FormInput
                                label="ST_F"
                                required
                                type="number"
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
