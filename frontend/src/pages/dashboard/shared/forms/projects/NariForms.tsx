import React from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { FormInput, FormSelect } from '../shared/FormComponents'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { createMasterDataOptions } from '@/utils/formHelpers'

interface NariFormsProps {
    entityType: string
    formData: any
    setFormData: (data: any) => void
    years: any[]
    seasons: any[]
    nariActivities: any[]
    nariCropCategories: any[]
    nariNutritionGardenTypes: any[]
}

export const NariForms: React.FC<NariFormsProps> = ({
    entityType,
    formData,
    setFormData,
    years,
    seasons,
    nariActivities,
    nariCropCategories,
    nariNutritionGardenTypes
}) => {
    return (
        <>
            {entityType === ENTITY_TYPES.PROJECT_NARI_NUTRI_GARDEN && (
                <div className="space-y-10">
                    {/* Basic Details Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <MasterDataDropdown
                            label="Reporting Year"
                            required
                            value={formData.reportingYearId || formData.yearId || ''}
                            onChange={(value) => setFormData({ ...formData, reportingYearId: value, yearId: value })}
                            options={createMasterDataOptions(years, 'yearId', 'yearName')}
                            emptyMessage="No reporting years available"
                        />
                        <MasterDataDropdown
                            label="Activity"
                            required
                            value={formData.activityId || ''}
                            onChange={(value) => setFormData({ ...formData, activityId: value })}
                            options={createMasterDataOptions(nariActivities, 'nariActivityId', 'activityName')}
                            placeholder="Select Activity"
                        />
                        <FormInput
                            label="Name of Nutri-Smart Village"
                            required
                            value={formData.villageName || formData.nameOfNutriSmartVillage || ''}
                            onChange={(e) => setFormData({ ...formData, villageName: e.target.value, nameOfNutriSmartVillage: e.target.value })}
                        />
                        <MasterDataDropdown
                            label="Type of Nutritional Garden"
                            required
                            value={formData.typeOfNutritionalGardenId || ''}
                            onChange={(value) => setFormData({ ...formData, typeOfNutritionalGardenId: value })}
                            options={createMasterDataOptions(nariNutritionGardenTypes, 'nutritionGardenTypeId', 'name')}
                            placeholder="Select Garden Type"
                        />
                        <FormInput
                            label="Number"
                            required
                            type="number"
                            value={formData.number || ''}
                            onChange={(e) => setFormData({ ...formData, number: parseInt(e.target.value) || 0 })}
                        />
                        <FormInput
                            label="Area (sqm)"
                            required
                            type="number"
                            value={formData.areaSqm || ''}
                            onChange={(e) => setFormData({ ...formData, areaSqm: parseFloat(e.target.value) || 0 })}
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
                                onChange={(e) => setFormData({ ...formData, genMale: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="General_F"
                                required
                                type="number"
                                value={formData.genFemale || ''}
                                onChange={(e) => setFormData({ ...formData, genFemale: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="OBC_M"
                                required
                                type="number"
                                value={formData.obcMale || ''}
                                onChange={(e) => setFormData({ ...formData, obcMale: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="OBC_F"
                                required
                                type="number"
                                value={formData.obcFemale || ''}
                                onChange={(e) => setFormData({ ...formData, obcFemale: parseInt(e.target.value) || 0 })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FormInput
                                label="SC_M"
                                required
                                type="number"
                                value={formData.scMale || ''}
                                onChange={(e) => setFormData({ ...formData, scMale: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="SC_F"
                                required
                                type="number"
                                value={formData.scFemale || ''}
                                onChange={(e) => setFormData({ ...formData, scFemale: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="ST_M"
                                required
                                type="number"
                                value={formData.stMale || ''}
                                onChange={(e) => setFormData({ ...formData, stMale: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="ST_F"
                                required
                                type="number"
                                value={formData.stFemale || ''}
                                onChange={(e) => setFormData({ ...formData, stFemale: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_NARI_BIO_FORTIFIED && (
                <div className="space-y-10">
                    {/* Basic Details Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <MasterDataDropdown
                            label="Reporting Year"
                            required
                            value={formData.reportingYearId || formData.yearId || ''}
                            onChange={(value) => setFormData({ ...formData, reportingYearId: value, yearId: value })}
                            options={createMasterDataOptions(years, 'yearId', 'yearName')}
                            emptyMessage="No reporting years available"
                        />
                        <FormInput
                            label="Name of Nutri-Smart Village"
                            required
                            value={formData.villageName || formData.nameOfNutriSmartVillage || ''}
                            onChange={(e) => setFormData({ ...formData, villageName: e.target.value, nameOfNutriSmartVillage: e.target.value })}
                        />
                        <MasterDataDropdown
                            label="Season"
                            required
                            value={formData.seasonId || ''}
                            onChange={(value) => setFormData({ ...formData, seasonId: value })}
                            options={createMasterDataOptions(seasons, 'seasonId', 'seasonName')}
                            placeholder="Select Season"
                        />
                        <MasterDataDropdown
                            label="Activity"
                            required
                            value={formData.activityId || ''}
                            onChange={(value) => setFormData({ ...formData, activityId: value })}
                            options={createMasterDataOptions(nariActivities, 'nariActivityId', 'activityName')}
                            placeholder="Select Activity"
                        />
                        <MasterDataDropdown
                            label="Category of Crop"
                            required
                            value={formData.cropCategoryId || ''}
                            onChange={(value) => setFormData({ ...formData, cropCategoryId: value })}
                            options={createMasterDataOptions(nariCropCategories, 'cropCategoryId', 'name')}
                            placeholder="Select Category"
                        />
                        <FormInput
                            label="Name of Crop"
                            required
                            value={formData.cropName || formData.nameOfCrop || ''}
                            onChange={(e) => setFormData({ ...formData, cropName: e.target.value, nameOfCrop: e.target.value })}
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
                            onChange={(e) => setFormData({ ...formData, areaHa: parseFloat(e.target.value) || 0 })}
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
                                onChange={(e) => setFormData({ ...formData, genMale: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="General_F"
                                required
                                type="number"
                                value={formData.genFemale || ''}
                                onChange={(e) => setFormData({ ...formData, genFemale: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="OBC_M"
                                required
                                type="number"
                                value={formData.obcMale || ''}
                                onChange={(e) => setFormData({ ...formData, obcMale: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="OBC_F"
                                required
                                type="number"
                                value={formData.obcFemale || ''}
                                onChange={(e) => setFormData({ ...formData, obcFemale: parseInt(e.target.value) || 0 })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FormInput
                                label="SC_M"
                                required
                                type="number"
                                value={formData.scMale || ''}
                                onChange={(e) => setFormData({ ...formData, scMale: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="SC_F"
                                required
                                type="number"
                                value={formData.scFemale || ''}
                                onChange={(e) => setFormData({ ...formData, scFemale: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="ST_M"
                                required
                                type="number"
                                value={formData.stMale || ''}
                                onChange={(e) => setFormData({ ...formData, stMale: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="ST_F"
                                required
                                type="number"
                                value={formData.stFemale || ''}
                                onChange={(e) => setFormData({ ...formData, stFemale: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_NARI_VALUE_ADDITION && (
                <div className="space-y-10">
                    {/* Basic Details Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <MasterDataDropdown
                            label="Reporting Year"
                            required
                            value={formData.reportingYearId || formData.yearId || ''}
                            onChange={(value) => setFormData({ ...formData, reportingYearId: value, yearId: value })}
                            options={createMasterDataOptions(years, 'yearId', 'yearName')}
                            emptyMessage="No reporting years available"
                        />
                        <FormInput
                            label="Name of Nutri-Smart Village"
                            required
                            value={formData.villageName || formData.nameOfNutriSmartVillage || ''}
                            onChange={(e) => setFormData({ ...formData, villageName: e.target.value, nameOfNutriSmartVillage: e.target.value })}
                        />
                        <FormInput
                            label="Name of Crop/veg./fruits/other"
                            required
                            value={formData.cropName || formData.nameOfCrop || ''}
                            onChange={(e) => setFormData({ ...formData, cropName: e.target.value, nameOfCrop: e.target.value })}
                        />
                        <MasterDataDropdown
                            label="Activity"
                            required
                            value={formData.activityId || ''}
                            onChange={(value) => setFormData({ ...formData, activityId: value })}
                            options={createMasterDataOptions(nariActivities, 'nariActivityId', 'activityName')}
                            placeholder="Select Activity"
                        />
                        <FormInput
                            label="Name of Value-added product"
                            required
                            value={formData.productName || formData.nameOfValueAddedProduct || ''}
                            onChange={(e) => setFormData({ ...formData, productName: e.target.value, nameOfValueAddedProduct: e.target.value })}
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
                                onChange={(e) => setFormData({ ...formData, genMale: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="General_F"
                                required
                                type="number"
                                value={formData.genFemale || ''}
                                onChange={(e) => setFormData({ ...formData, genFemale: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="OBC_M"
                                required
                                type="number"
                                value={formData.obcMale || ''}
                                onChange={(e) => setFormData({ ...formData, obcMale: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="OBC_F"
                                required
                                type="number"
                                value={formData.obcFemale || ''}
                                onChange={(e) => setFormData({ ...formData, obcFemale: parseInt(e.target.value) || 0 })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FormInput
                                label="SC_M"
                                required
                                type="number"
                                value={formData.scMale || ''}
                                onChange={(e) => setFormData({ ...formData, scMale: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="SC_F"
                                required
                                type="number"
                                value={formData.scFemale || ''}
                                onChange={(e) => setFormData({ ...formData, scFemale: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="ST_M"
                                required
                                type="number"
                                value={formData.stMale || ''}
                                onChange={(e) => setFormData({ ...formData, stMale: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="ST_F"
                                required
                                type="number"
                                value={formData.stFemale || ''}
                                onChange={(e) => setFormData({ ...formData, stFemale: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_NARI_TRAINING && (
                <div className="space-y-10">
                    {/* Basic Details Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <MasterDataDropdown
                            label="Reporting Year"
                            required
                            value={formData.reportingYearId || formData.yearId || ''}
                            onChange={(value) => setFormData({ ...formData, reportingYearId: value, yearId: value })}
                            options={createMasterDataOptions(years, 'yearId', 'yearName')}
                            emptyMessage="No reporting years available"
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
                        <MasterDataDropdown
                            label="Activity"
                            required
                            value={formData.activityId || ''}
                            onChange={(value) => setFormData({ ...formData, activityId: value })}
                            options={createMasterDataOptions(nariActivities, 'nariActivityId', 'activityName')}
                            placeholder="Select Activity"
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
                                { value: 'ON_CAMPUS', label: 'On Campus' },
                                { value: 'OFF_CAMPUS', label: 'Off Campus' }
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
                        <MasterDataDropdown
                            label="Reporting Year"
                            required
                            value={formData.reportingYearId || formData.yearId || ''}
                            onChange={(value) => setFormData({ ...formData, reportingYearId: value, yearId: value })}
                            options={createMasterDataOptions(years, 'yearId', 'yearName')}
                            emptyMessage="No reporting years available"
                        />
                        <FormInput
                            label="Name of Nutri-Smart Village"
                            required
                            value={formData.villageName || formData.nameOfNutriSmartVillage || ''}
                            onChange={(e) => setFormData({ ...formData, villageName: e.target.value, nameOfNutriSmartVillage: e.target.value })}
                        />
                        <MasterDataDropdown
                            label="Activity"
                            required
                            value={formData.activityId || ''}
                            onChange={(value) => setFormData({ ...formData, activityId: value })}
                            options={createMasterDataOptions(nariActivities, 'nariActivityId', 'activityName')}
                            placeholder="Select Activity"
                        />
                        <FormInput
                            label="Name of Activity"
                            required
                            value={formData.activityName || formData.nameOfActivity || ''}
                            onChange={(e) => setFormData({ ...formData, activityName: e.target.value, nameOfActivity: e.target.value })}
                        />
                        <FormInput
                            label="No of Activities"
                            required
                            type="number"
                            value={formData.noOfActivities || ''}
                            onChange={(e) => setFormData({ ...formData, noOfActivities: parseInt(e.target.value) || 0 })}
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
                                onChange={(e) => setFormData({ ...formData, genMale: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="General_F"
                                required
                                type="number"
                                value={formData.genFemale || ''}
                                onChange={(e) => setFormData({ ...formData, genFemale: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="OBC_M"
                                required
                                type="number"
                                value={formData.obcMale || ''}
                                onChange={(e) => setFormData({ ...formData, obcMale: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="OBC_F"
                                required
                                type="number"
                                value={formData.obcFemale || ''}
                                onChange={(e) => setFormData({ ...formData, obcFemale: parseInt(e.target.value) || 0 })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FormInput
                                label="SC_M"
                                required
                                type="number"
                                value={formData.scMale || ''}
                                onChange={(e) => setFormData({ ...formData, scMale: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="SC_F"
                                required
                                type="number"
                                value={formData.scFemale || ''}
                                onChange={(e) => setFormData({ ...formData, scFemale: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="ST_M"
                                required
                                type="number"
                                value={formData.stMale || ''}
                                onChange={(e) => setFormData({ ...formData, stMale: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="ST_F"
                                required
                                type="number"
                                value={formData.stFemale || ''}
                                onChange={(e) => setFormData({ ...formData, stFemale: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
