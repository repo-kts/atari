import React from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { FormInput, FormSelect } from '../shared/FormComponents'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { SpecifyOtherInput } from '@/components/common/SpecifyOtherInput'
import { useOtherSpecify } from '@/hooks/useOtherSpecify'
import { CasteGenderTotals } from '@/components/common/CasteGenderTotals'
import { createMasterDataOptions } from '@/utils/formHelpers'

interface NariFormsProps {
    entityType: string
    formData: any
    setFormData: (data: any) => void
    seasons: any[]
    nariActivities: any[]
    nariCropCategories: any[]
    nariNutritionGardenTypes: any[]
}

export const NariForms: React.FC<NariFormsProps> = ({
    entityType,
    formData,
    setFormData,
    seasons,
    nariActivities,
    nariCropCategories,
    nariNutritionGardenTypes
}) => {
    // Nutrition-garden "Other → specify" (only this record stores activityOther / typeOfNutritionalGardenOther).
    const nariActivityOptions = React.useMemo(
        () => createMasterDataOptions(nariActivities, 'nariActivityId', 'activityName', { flagKey: 'isOther' }),
        [nariActivities]
    )
    const gardenTypeOptions = React.useMemo(
        () => createMasterDataOptions(nariNutritionGardenTypes, 'nutritionGardenTypeId', 'name', { flagKey: 'isOther' }),
        [nariNutritionGardenTypes]
    )
    const cropCategoryOptions = React.useMemo(
        () => createMasterDataOptions(nariCropCategories, 'cropCategoryId', 'name', { flagKey: 'isOther' }),
        [nariCropCategories]
    )
    const { isOtherSelected: isOtherNariActivity, otherResetPatch: nariActivityResetPatch } = useOtherSpecify(nariActivityOptions, formData.activityId)
    const { isOtherSelected: isOtherGardenType, otherResetPatch: gardenTypeResetPatch } = useOtherSpecify(gardenTypeOptions, formData.typeOfNutritionalGardenId)
    const { isOtherSelected: isOtherCropCategory, otherResetPatch: cropCategoryResetPatch } = useOtherSpecify(cropCategoryOptions, formData.cropCategoryId)
    return (
        <>
            {entityType === ENTITY_TYPES.PROJECT_NARI_NUTRI_GARDEN && (
                <div className="space-y-10">
                    {/* Basic Details Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Reporting Year"
                            required
                            type="date"
                            value={formData.reportingYear ?? ''}
                            onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
                        />
                        <MasterDataDropdown
                            label="Activity"
                            required
                            value={formData.activityId ?? ''}
                            onChange={(value) => setFormData({ ...formData, activityId: value, ...nariActivityResetPatch(value, 'activityOther') })}
                            options={nariActivityOptions}
                            placeholder="Select Activity"
                        />
                        {isOtherNariActivity && (
                            <SpecifyOtherInput
                                label="Please specify other activity"
                                required
                                value={formData.activityOther}
                                onChange={(e) => setFormData({ ...formData, activityOther: e.target.value })}
                            />
                        )}
                        <FormInput
                            label="Name of Nutri-Smart Village"
                            required
                            value={formData.villageName || formData.nameOfNutriSmartVillage || ''}
                            onChange={(e) => setFormData({ ...formData, villageName: e.target.value, nameOfNutriSmartVillage: e.target.value })}
                        />
                        <MasterDataDropdown
                            label="Type of Nutritional Garden"
                            required
                            value={formData.typeOfNutritionalGardenId ?? ''}
                            onChange={(value) => setFormData({ ...formData, typeOfNutritionalGardenId: value, ...gardenTypeResetPatch(value, 'typeOfNutritionalGardenOther') })}
                            options={gardenTypeOptions}
                            placeholder="Select Garden Type"
                        />
                        {isOtherGardenType && (
                            <SpecifyOtherInput
                                label="Please specify other garden type"
                                required
                                value={formData.typeOfNutritionalGardenOther}
                                onChange={(e) => setFormData({ ...formData, typeOfNutritionalGardenOther: e.target.value })}
                            />
                        )}
                        <FormInput
                            label="Number"
                            required
                            type="number"
                            value={formData.number ?? ''}
                            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                        />
                        <FormInput
                            label="Area (sqm)"
                            required
                            type="number"
                            value={formData.areaSqm ?? ''}
                            onChange={(e) => setFormData({ ...formData, areaSqm: e.target.value })}
                        />
                    </div>

                    {/* Beneficiary Details Section */}
                    <div className="space-y-6">
                        <h3 className="text-base font-semibold text-gray-800">No. of beneficiaries</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FormInput
                                label="General_M"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.generalM ?? ''}
                                onChange={(e) => setFormData({ ...formData, generalM: e.target.value })}
                            />
                            <FormInput
                                label="General_F"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.generalF ?? ''}
                                onChange={(e) => setFormData({ ...formData, generalF: e.target.value })}
                            />
                            <FormInput
                                label="OBC_M"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.obcM ?? ''}
                                onChange={(e) => setFormData({ ...formData, obcM: e.target.value })}
                            />
                            <FormInput
                                label="OBC_F"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.obcF ?? ''}
                                onChange={(e) => setFormData({ ...formData, obcF: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FormInput
                                label="SC_M"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.scM ?? ''}
                                onChange={(e) => setFormData({ ...formData, scM: e.target.value })}
                            />
                            <FormInput
                                label="SC_F"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.scF ?? ''}
                                onChange={(e) => setFormData({ ...formData, scF: e.target.value })}
                            />
                            <FormInput
                                label="ST_M"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.stM ?? ''}
                                onChange={(e) => setFormData({ ...formData, stM: e.target.value })}
                            />
                            <FormInput
                                label="ST_F"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.stF ?? ''}
                                onChange={(e) => setFormData({ ...formData, stF: e.target.value })}
                            />
                        </div>
                        <CasteGenderTotals
                            values={formData}
                            maleFields={['generalM', 'obcM', 'scM', 'stM']}
                            femaleFields={['generalF', 'obcF', 'scF', 'stF']}
                        />
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_NARI_BIO_FORTIFIED && (
                <div className="space-y-10">
                    {/* Basic Details Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Reporting Year"
                            required
                            type="date"
                            value={formData.reportingYear ?? ''}
                            onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
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
                            value={formData.seasonId ?? ''}
                            onChange={(value) => setFormData({ ...formData, seasonId: value })}
                            options={createMasterDataOptions(seasons, 'seasonId', 'seasonName')}
                            placeholder="Select Season"
                        />
                        <MasterDataDropdown
                            label="Activity"
                            required
                            value={formData.activityId ?? ''}
                            onChange={(value) => setFormData({ ...formData, activityId: value, ...nariActivityResetPatch(value, 'activityOther') })}
                            options={nariActivityOptions}
                            placeholder="Select Activity"
                        />
                        {isOtherNariActivity && (
                            <SpecifyOtherInput label="Please specify other activity" required value={formData.activityOther} onChange={(e) => setFormData({ ...formData, activityOther: e.target.value })} />
                        )}
                        <MasterDataDropdown
                            label="Category of Crop"
                            required
                            value={formData.cropCategoryId ?? ''}
                            onChange={(value) => setFormData({ ...formData, cropCategoryId: value, ...cropCategoryResetPatch(value, 'cropCategoryOther') })}
                            options={cropCategoryOptions}
                            placeholder="Select Category"
                        />
                        {isOtherCropCategory && (
                            <SpecifyOtherInput label="Please specify other crop category" required value={formData.cropCategoryOther} onChange={(e) => setFormData({ ...formData, cropCategoryOther: e.target.value })} />
                        )}
                        <FormInput
                            label="Name of Crop"
                            required
                            value={formData.cropName || formData.nameOfCrop || ''}
                            onChange={(e) => setFormData({ ...formData, cropName: e.target.value, nameOfCrop: e.target.value })}
                        />
                        <FormInput
                            label="Variety"
                            required
                            value={formData.variety ?? ''}
                            onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                        />
                        <FormInput
                            label="Area(ha)"
                            required
                            type="number"
                            step="0.01"
                            value={formData.areaHa ?? ''}
                            onChange={(e) => setFormData({ ...formData, areaHa: e.target.value })}
                        />
                    </div>

                    {/* Beneficiary Details Section */}
                    <div className="space-y-6">
                        <h3 className="text-base font-semibold text-gray-800">No. of beneficiaries</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FormInput
                                label="General_M"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.generalM ?? ''}
                                onChange={(e) => setFormData({ ...formData, generalM: e.target.value })}
                            />
                            <FormInput
                                label="General_F"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.generalF ?? ''}
                                onChange={(e) => setFormData({ ...formData, generalF: e.target.value })}
                            />
                            <FormInput
                                label="OBC_M"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.obcM ?? ''}
                                onChange={(e) => setFormData({ ...formData, obcM: e.target.value })}
                            />
                            <FormInput
                                label="OBC_F"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.obcF ?? ''}
                                onChange={(e) => setFormData({ ...formData, obcF: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FormInput
                                label="SC_M"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.scM ?? ''}
                                onChange={(e) => setFormData({ ...formData, scM: e.target.value })}
                            />
                            <FormInput
                                label="SC_F"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.scF ?? ''}
                                onChange={(e) => setFormData({ ...formData, scF: e.target.value })}
                            />
                            <FormInput
                                label="ST_M"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.stM ?? ''}
                                onChange={(e) => setFormData({ ...formData, stM: e.target.value })}
                            />
                            <FormInput
                                label="ST_F"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.stF ?? ''}
                                onChange={(e) => setFormData({ ...formData, stF: e.target.value })}
                            />
                        </div>
                        <CasteGenderTotals
                            values={formData}
                            maleFields={['generalM', 'obcM', 'scM', 'stM']}
                            femaleFields={['generalF', 'obcF', 'scF', 'stF']}
                        />
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_NARI_VALUE_ADDITION && (
                <div className="space-y-10">
                    {/* Basic Details Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Reporting Year"
                            required
                            type="date"
                            value={formData.reportingYear ?? ''}
                            onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
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
                            value={formData.activityId ?? ''}
                            onChange={(value) => setFormData({ ...formData, activityId: value, ...nariActivityResetPatch(value, 'activityOther') })}
                            options={nariActivityOptions}
                            placeholder="Select Activity"
                        />
                        {isOtherNariActivity && (
                            <SpecifyOtherInput label="Please specify other activity" required value={formData.activityOther} onChange={(e) => setFormData({ ...formData, activityOther: e.target.value })} />
                        )}
                        <FormInput
                            label="Name of Value-added product"
                            required
                            value={formData.productName || formData.nameOfValueAddedProduct || ''}
                            onChange={(e) => setFormData({ ...formData, productName: e.target.value, nameOfValueAddedProduct: e.target.value })}
                        />
                    </div>

                    {/* Beneficiary Details Section */}
                    <div className="space-y-6">
                        <h3 className="text-base font-semibold text-gray-800">No. of beneficiaries</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FormInput
                                label="General_M"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.generalM ?? ''}
                                onChange={(e) => setFormData({ ...formData, generalM: e.target.value })}
                            />
                            <FormInput
                                label="General_F"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.generalF ?? ''}
                                onChange={(e) => setFormData({ ...formData, generalF: e.target.value })}
                            />
                            <FormInput
                                label="OBC_M"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.obcM ?? ''}
                                onChange={(e) => setFormData({ ...formData, obcM: e.target.value })}
                            />
                            <FormInput
                                label="OBC_F"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.obcF ?? ''}
                                onChange={(e) => setFormData({ ...formData, obcF: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FormInput
                                label="SC_M"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.scM ?? ''}
                                onChange={(e) => setFormData({ ...formData, scM: e.target.value })}
                            />
                            <FormInput
                                label="SC_F"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.scF ?? ''}
                                onChange={(e) => setFormData({ ...formData, scF: e.target.value })}
                            />
                            <FormInput
                                label="ST_M"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.stM ?? ''}
                                onChange={(e) => setFormData({ ...formData, stM: e.target.value })}
                            />
                            <FormInput
                                label="ST_F"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.stF ?? ''}
                                onChange={(e) => setFormData({ ...formData, stF: e.target.value })}
                            />
                        </div>
                        <CasteGenderTotals
                            values={formData}
                            maleFields={['generalM', 'obcM', 'scM', 'stM']}
                            femaleFields={['generalF', 'obcF', 'scF', 'stF']}
                        />
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_NARI_TRAINING && (
                <div className="space-y-10">
                    {/* Basic Details Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Reporting Year"
                            required
                            type="date"
                            value={formData.reportingYear ?? ''}
                            onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
                        />
                        <FormInput
                            label="Name of Nutri-Smart Village"
                            required
                            value={formData.villageName || formData.nameOfNutriSmartVillage || ''}
                            onChange={(e) => setFormData({ ...formData, villageName: e.target.value, nameOfNutriSmartVillage: e.target.value })}
                        />
                        <FormInput
                            label="Area of Training"
                            required
                            value={formData.areaOfTraining || formData.trainingArea || ''}
                            onChange={(e) => setFormData({ ...formData, areaOfTraining: e.target.value, trainingArea: e.target.value })}
                        />
                        <MasterDataDropdown
                            label="Activity"
                            required
                            value={formData.activityId ?? ''}
                            onChange={(value) => setFormData({ ...formData, activityId: value, ...nariActivityResetPatch(value, 'activityOther') })}
                            options={nariActivityOptions}
                            placeholder="Select Activity"
                        />
                        {isOtherNariActivity && (
                            <SpecifyOtherInput label="Please specify other activity" required value={formData.activityOther} onChange={(e) => setFormData({ ...formData, activityOther: e.target.value })} />
                        )}
                        <FormInput
                            label="Title of training"
                            required
                            value={formData.titleOfTraining || formData.trainingTitle || ''}
                            onChange={(e) => setFormData({ ...formData, titleOfTraining: e.target.value, trainingTitle: e.target.value })}
                        />
                        <FormInput
                            label="No of days"
                            required
                            type="number"
                            wholeNumberOnly
                            value={formData.noOfDays || ''}
                            onChange={(e) => setFormData({ ...formData, noOfDays: e.target.value })}
                        />
                        <FormInput
                            label="No of courses"
                            required
                            type="number"
                            wholeNumberOnly
                            value={formData.noOfCourses || ''}
                            onChange={(e) => setFormData({ ...formData, noOfCourses: e.target.value })}
                        />
                        <FormSelect
                            label="On Campus/Off Campus"
                            required
                            value={formData.campusType ?? ''}
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
                            value={formData.venue ?? ''}
                            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                        />
                    </div>

                    {/* Beneficiary Details Section */}
                    <div className="space-y-6">
                        <h3 className="text-base font-semibold text-gray-800">No. of beneficiaries</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FormInput
                                label="General_M"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.generalM ?? ''}
                                onChange={(e) => setFormData({ ...formData, generalM: e.target.value })}
                            />
                            <FormInput
                                label="General_F"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.generalF ?? ''}
                                onChange={(e) => setFormData({ ...formData, generalF: e.target.value })}
                            />
                            <FormInput
                                label="OBC_M"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.obcM ?? ''}
                                onChange={(e) => setFormData({ ...formData, obcM: e.target.value })}
                            />
                            <FormInput
                                label="OBC_F"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.obcF ?? ''}
                                onChange={(e) => setFormData({ ...formData, obcF: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FormInput
                                label="SC_M"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.scM ?? ''}
                                onChange={(e) => setFormData({ ...formData, scM: e.target.value })}
                            />
                            <FormInput
                                label="SC_F"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.scF ?? ''}
                                onChange={(e) => setFormData({ ...formData, scF: e.target.value })}
                            />
                            <FormInput
                                label="ST_M"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.stM ?? ''}
                                onChange={(e) => setFormData({ ...formData, stM: e.target.value })}
                            />
                            <FormInput
                                label="ST_F"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.stF ?? ''}
                                onChange={(e) => setFormData({ ...formData, stF: e.target.value })}
                            />
                        </div>
                        <CasteGenderTotals
                            values={formData}
                            maleFields={['generalM', 'obcM', 'scM', 'stM']}
                            femaleFields={['generalF', 'obcF', 'scF', 'stF']}
                        />
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_NARI_EXTENSION && (
                <div className="space-y-10">
                    {/* Basic Details Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Reporting Year"
                            required
                            type="date"
                            value={formData.reportingYear ?? ''}
                            onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
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
                            value={formData.activityId ?? ''}
                            onChange={(value) => setFormData({ ...formData, activityId: value, ...nariActivityResetPatch(value, 'activityOther') })}
                            options={nariActivityOptions}
                            placeholder="Select Activity"
                        />
                        {isOtherNariActivity && (
                            <SpecifyOtherInput label="Please specify other activity" required value={formData.activityOther} onChange={(e) => setFormData({ ...formData, activityOther: e.target.value })} />
                        )}
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
                            wholeNumberOnly
                            value={formData.noOfActivities || ''}
                            onChange={(e) => setFormData({ ...formData, noOfActivities: e.target.value })}
                        />
                    </div>

                    {/* Beneficiary Details Section */}
                    <div className="space-y-6">
                        <h3 className="text-base font-semibold text-gray-800">No. of beneficiaries</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FormInput
                                label="General_M"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.generalM ?? ''}
                                onChange={(e) => setFormData({ ...formData, generalM: e.target.value })}
                            />
                            <FormInput
                                label="General_F"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.generalF ?? ''}
                                onChange={(e) => setFormData({ ...formData, generalF: e.target.value })}
                            />
                            <FormInput
                                label="OBC_M"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.obcM ?? ''}
                                onChange={(e) => setFormData({ ...formData, obcM: e.target.value })}
                            />
                            <FormInput
                                label="OBC_F"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.obcF ?? ''}
                                onChange={(e) => setFormData({ ...formData, obcF: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FormInput
                                label="SC_M"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.scM ?? ''}
                                onChange={(e) => setFormData({ ...formData, scM: e.target.value })}
                            />
                            <FormInput
                                label="SC_F"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.scF ?? ''}
                                onChange={(e) => setFormData({ ...formData, scF: e.target.value })}
                            />
                            <FormInput
                                label="ST_M"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.stM ?? ''}
                                onChange={(e) => setFormData({ ...formData, stM: e.target.value })}
                            />
                            <FormInput
                                label="ST_F"
                                required
                                type="number"
                                wholeNumberOnly
                                value={formData.stF ?? ''}
                                onChange={(e) => setFormData({ ...formData, stF: e.target.value })}
                            />
                        </div>
                        <CasteGenderTotals
                            values={formData}
                            maleFields={['generalM', 'obcM', 'scM', 'stM']}
                            femaleFields={['generalF', 'obcF', 'scF', 'stF']}
                        />
                    </div>
                </div>
            )}
        </>
    )
}
