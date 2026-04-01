import React from 'react'
import { X } from 'lucide-react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { FormInput, FormSelect } from '../shared/FormComponents'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { createMasterDataOptions } from '@/utils/formHelpers'

interface NaturalFarmingFormsProps {
    entityType: string
    formData: any
    setFormData: (data: any) => void
    states?: any[]
    seasons?: any[]
    naturalFarmingActivities?: any[]
    naturalFarmingSoilParameters?: any[]
    staffCategories?: any[]
}

export const NaturalFarmingForms: React.FC<NaturalFarmingFormsProps> = ({
    entityType,
    formData,
    setFormData,
    states = [],
    seasons = [],
    naturalFarmingActivities = [],
    naturalFarmingSoilParameters = [],
    staffCategories = [],
}) => {
    const selectedNaturalFarmingActivity = naturalFarmingActivities.find(
        (activity: any) => String(activity.naturalFarmingActivityId) === String(formData.activityId || '')
    )
    const handleFileChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const newFiles = Array.from(files);
            const previews: string[] = [];
            let count = 0;

            newFiles.forEach((file, index) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    previews[index] = reader.result as string;
                    count++;
                    if (count === newFiles.length) {
                        const existingPhotos = Array.isArray(formData[field]) ? formData[field] : [];
                        setFormData({
                            ...formData,
                            [field]: [
                                ...existingPhotos,
                                ...newFiles.map((f, i) => ({
                                    file: f,
                                    preview: previews[i],
                                    image: previews[i],
                                    caption: ''
                                }))
                            ]
                        });
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removePhoto = (field: string, index: number) => {
        const photos = [...(Array.isArray(formData[field]) ? formData[field] : [])];
        photos.splice(index, 1);
        setFormData({ ...formData, [field]: photos });
    };

    const updateCaption = (field: string, index: number, caption: string) => {
        const photos = [...(Array.isArray(formData[field]) ? formData[field] : [])];
        if (photos[index]) {
            photos[index] = { ...photos[index], caption };
            setFormData({ ...formData, [field]: photos });
        }
    };

    const renderPhotoFields = (field: string) => (
        <div className="space-y-4">
            <FormInput
                label="Photographs"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange(field)}
                helperText="Only images allowed. Uploading new files will be added to the list."
            />

            {Array.isArray(formData[field]) && formData[field].length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                    {formData[field].map((item: any, idx: number) => {
                        const src = item.preview || (typeof item.image === 'string' ? (item.image.startsWith('data:') || item.image.startsWith('http') ? item.image : `${import.meta.env.VITE_API_URL || ''}${item.image.startsWith('/') ? '' : '/'}${item.image}`) : '');
                        return (
                            <div key={idx} className="relative bg-white border border-gray-200 rounded-xl p-2 shadow-sm flex flex-col group">
                                <div className="relative aspect-square mb-2 overflow-hidden rounded-lg border border-gray-50">
                                    <img
                                        src={src}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        alt={`P ${idx + 1}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removePhoto(field, idx)}
                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors z-10 scale-90"
                                    >
                                        <X className="w-3 h-3 stroke-[2.5]" />
                                    </button>
                                </div>
                                <div className="space-y-1 mt-auto">
                                    <textarea
                                        placeholder="Caption..."
                                        className="w-full text-[12px] font-medium bg-gray-50/50 border border-gray-100 rounded-md focus:bg-white focus:ring-1 focus:ring-green-200 px-2 py-1.5 outline-none transition-all placeholder:text-gray-400 text-gray-700 min-h-[3.5rem] resize-none"
                                        value={item.caption || ''}
                                        onChange={(e) => updateCaption(field, idx, e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    // Normalize incoming photographs data when editing
    React.useEffect(() => {
        // Only normalize if we are editing an existing record and have an ID
        if (!formData.id) return;

        const photoFields = ['images', 'photographs', 'demoImages'];
        let hasChanges = false;
        const newData = { ...formData };

        photoFields.forEach(field => {
            const rawValue = formData[field];
            if (rawValue && typeof rawValue === 'string') {
                if (rawValue.startsWith('[') || rawValue.startsWith('{')) {
                    try {
                        const parsed = JSON.parse(rawValue);
                        const arrayToMap = Array.isArray(parsed) ? parsed : [parsed];
                        newData[field] = arrayToMap
                            .filter((item: any) => item && (typeof item === 'string' || item.image || item.preview || item.url))
                            .map((item: any) => {
                                if (typeof item === 'string') return { preview: item, image: item, caption: '' };
                                const url = item.image || item.url || item.path || item.preview || '';
                                return { preview: url, image: url, caption: item.caption || '' };
                            });
                        hasChanges = true;
                    } catch (e) {
                        console.error('Photo parsing error:', e);
                    }
                } else if (rawValue.trim() !== '' && !rawValue.includes('object Object')) {
                    const values = rawValue.includes(',') ? rawValue.split(',') : [rawValue];
                    newData[field] = values
                        .filter((v: string) => v && v.trim() !== '')
                        .map((s: string) => ({
                            preview: s.trim(),
                            image: s.trim(),
                            caption: ''
                        }));
                    hasChanges = true;
                }
            }
        });

        if (hasChanges) {
            setFormData(newData);
        }
    }, [formData.id, formData.entityType, setFormData]); // Only depend on identity change

    const isOtherActivitySelected = String(selectedNaturalFarmingActivity?.activityName || '').trim().toLowerCase() === 'other activity'

    return (
        <>
            {entityType === ENTITY_TYPES.PROJECT_NATURAL_FARMING_GEO && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Reporting Year"
                            required
                            type="date"
                            value={formData.reportingYear || ''}
                            onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
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
                        <FormInput
                            label="Agro Climatic Zone of KVK"
                            required
                            value={formData.agroClimaticZone || ''}
                            onChange={(e) => setFormData({ ...formData, agroClimaticZone: e.target.value })}
                        />
                        <FormInput
                            label="Farming Situation of the Selected KVK"
                            required
                            value={formData.farmingSituation || ''}
                            onChange={(e) => setFormData({ ...formData, farmingSituation: e.target.value })}
                        />
                        <FormInput
                            label="Longitude (E)"
                            required
                            value={formData.longitude || ''}
                            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                        />
                        <FormInput
                            label="Latitude (N)"
                            required
                            value={formData.latitude || ''}
                            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                        />
                    </div>
                </div>
            )}
            {entityType === ENTITY_TYPES.PROJECT_NATURAL_FARMING_PHYSICAL && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <MasterDataDropdown
                            label="Activity"
                            required
                            value={formData.activityId || ''}
                            onChange={(value) => setFormData({
                                ...formData,
                                activityId: value,
                            })}
                            options={createMasterDataOptions(naturalFarmingActivities, 'naturalFarmingActivityId', 'activityName')}
                            emptyMessage="No natural farming activities available"
                        />
                    </div>

                    {isOtherActivitySelected ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormInput
                                label="Name of the Innovative programme organized"
                                required
                                value={formData.innovativeProgrammeName || ''}
                                onChange={(e) => setFormData({ ...formData, innovativeProgrammeName: e.target.value })}
                            />
                            <FormInput
                                label="Significance of innovative programme"
                                required
                                value={formData.significanceOfInnovativeProgramme || ''}
                                onChange={(e) => setFormData({ ...formData, significanceOfInnovativeProgramme: e.target.value })}
                            />
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Title of Natural Farming training Programme"
                            value={formData.trainingTitle || ''}
                            onChange={(e) => setFormData({ ...formData, trainingTitle: e.target.value })}
                        />
                        <FormInput
                            label="Date of Training"
                            required
                            type="date"
                            value={formData.trainingDate || ''}
                            onChange={(e) => setFormData({ ...formData, trainingDate: e.target.value })}
                        />
                        <FormInput
                            label="Venue of programme"
                            required
                            value={formData.venue || ''}
                            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                        />
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800">Participants</h3>
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

                    <div className="space-y-6">
                        <FormInput
                            label="Remarks/ Observation/Feedback Recorded"
                            required
                            value={formData.remarks || ''}
                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        />
                        <div className="space-y-2">
                             {renderPhotoFields('images')}
                        </div>
                    </div>
                        </>
                    )}
                </div>
            )}
            {entityType === ENTITY_TYPES.PROJECT_NATURAL_FARMING_DEMO && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                            label="Farmer Name"
                            required
                            value={formData.farmerName || ''}
                            onChange={(e) => setFormData({ ...formData, farmerName: e.target.value })}
                        />
                        <FormInput
                            label="Village Name"
                            required
                            value={formData.villageName || ''}
                            onChange={(e) => setFormData({ ...formData, villageName: e.target.value })}
                        />
                        <FormInput
                            label="Address"
                            required
                            value={formData.address || ''}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                        <FormInput
                            label="Contact Number"
                            required
                            value={formData.contactNumber || ''}
                            onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                        />
                        <FormSelect
                            label="State"
                            required
                            value={String(formData.stateId || '')}
                            onChange={(e) => setFormData({ ...formData, stateId: e.target.value })}
                            options={states.map((s: any) => ({ value: String(s.stateId || s.id), label: s.stateName }))}
                            placeholder="Select"
                        />
                        <FormSelect
                            label="Category"
                            required
                            value={formData.staffCategoryId || ''}
                            onChange={(e) => setFormData({ ...formData, staffCategoryId: e.target.value })}
                            options={staffCategories.map((c: any) => ({ value: c.staffCategoryId, label: c.categoryName }))}
                            placeholder="Select"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Cropping patter of Farmer Plot"
                            required
                            value={formData.croppingSystem || formData.croppingPattern || ''}
                            onChange={(e) => setFormData({ ...formData, croppingSystem: e.target.value })}
                        />
                        <FormInput
                            label="Farming Situation of the selected KVK/Farmer"
                            required
                            value={formData.farmingSituation || ''}
                            onChange={(e) => setFormData({ ...formData, farmingSituation: e.target.value })}
                        />
                        <FormInput
                            label="Latitude (N)"
                            required
                            value={formData.latitude !== undefined && formData.latitude !== null ? String(formData.latitude) : ''}
                            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                        />
                        <FormInput
                            label="Longitude (E)"
                            required
                            value={formData.longitude !== undefined && formData.longitude !== null ? String(formData.longitude) : ''}
                            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Name of Activity"
                            required
                            value={formData.activityName || ''}
                            onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
                        />
                        <FormInput
                            label="Crop"
                            required
                            value={formData.crop || ''}
                            onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                        />
                        <FormInput
                            label="Variety"
                            required
                            value={formData.variety || ''}
                            onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                        />
                        <FormSelect
                            label="Season"
                            required
                            value={formData.seasonId || ''}
                            onChange={(e) => setFormData({ ...formData, seasonId: e.target.value })}
                            options={seasons.map((s: any) => ({ value: s.seasonId || s.id, label: s.seasonName }))}
                            placeholder="Select"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        <FormInput
                            label="Technology Demonstrated"
                            required
                            value={formData.technologyDemonstrated || ''}
                            onChange={(e) => setFormData({ ...formData, technologyDemonstrated: e.target.value })}
                        />
                        <FormInput
                            label="Area (ha) of natural farming practice"
                            required
                            type="number"
                            value={formData.area || ''}
                            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        />
                        <FormInput
                            label="Motivation Factors potential"
                            required
                            value={formData.motivationFactors || ''}
                            onChange={(e) => setFormData({ ...formData, motivationFactors: e.target.value })}
                        />
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800">Observations Recorded</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse ">
                                <thead>
                                    <tr className="bg-gray-50 text-left">
                                        <th className="p-4 border border-gray-300 font-medium text-gray-700 w-1/3">Data Parameter</th>
                                        <th className="p-4 border border-gray-300 font-medium text-gray-700">Without Natural Farming Intervention</th>
                                        <th className="p-4 border border-gray-300 font-medium text-gray-700">With Natural Farming intervention</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { label: 'Plant Height (cm)', key: 'plantHeight' },
                                        { label: 'Other relevant parameter', key: 'otherParameter' },
                                        { label: 'Yield (q/ha)', key: 'yield' },
                                        { label: 'Cost of cultivation (Rs/ha)', key: 'costOfCultivation' },
                                        { label: 'Gross Return (Rs/ha)', key: 'grossReturn' },
                                        { label: 'Net return (Rs/ha)', key: 'netReturn' },
                                        { label: 'B:C Ratio', key: 'bcrRatio' },
                                        { label: 'Soil PH', key: 'soilPh' },
                                        { label: 'Soil OC (%)', key: 'soilOc' },
                                        { label: 'Soil EC (dS/m)', key: 'soilEc' },
                                        { label: 'Available N (kg/ha)', key: 'availableN' },
                                        { label: 'Available P (kg/ha)', key: 'availableP' },
                                        { label: 'Available K (kg/ha)', key: 'availableK' },
                                        { label: 'Soil Microbes (cfu)', key: 'soilMicrobes' },
                                        { label: 'Any other specific', key: 'anyOtherSpecific' }
                                    ].map((row) => (
                                        <tr key={row.key}>
                                            <td className="p-4 border border-gray-300 text-gray-700">{row.label}</td>
                                            <td className="p-2 border border-gray-300">
                                                <input
                                                    type="text"
                                                    value={formData[`without_${row.key}`] || ''}
                                                    onChange={(e) => setFormData({ ...formData, [`without_${row.key}`]: e.target.value })}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                                />
                                            </td>
                                            <td className="p-2 border border-gray-300">
                                                <input
                                                    type="text"
                                                    value={formData[`with_${row.key}`] || ''}
                                                    onChange={(e) => setFormData({ ...formData, [`with_${row.key}`]: e.target.value })}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <FormInput
                            label="Farmers Feedback"
                            required
                            value={formData.farmersFeedback || ''}
                            onChange={(e) => setFormData({ ...formData, farmersFeedback: e.target.value })}
                        />
                        <div className="space-y-2">
                             {renderPhotoFields('images')}
                        </div>
                    </div>
                </div>
            )}
            {entityType === ENTITY_TYPES.PROJECT_NATURAL_FARMING_FARMERS && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FormInput
                            label="Reporting Year"
                            required
                            type="date"
                            value={formData.reportingYear || ''}
                            onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
                        />
                        <FormInput
                            label="Farmer Name"
                            required
                            value={formData.farmerName || ''}
                            onChange={(e) => setFormData({ ...formData, farmerName: e.target.value })}
                        />
                        <FormInput
                            label="Contact Number"
                            required
                            value={formData.contactNumber || ''}
                            onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                        />
                        <FormInput
                            label="Village Name"
                            required
                            value={formData.villageName || ''}
                            onChange={(e) => setFormData({ ...formData, villageName: e.target.value })}
                        />
                        <FormInput
                            label="Address"
                            required
                            value={formData.address || ''}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                        <FormInput
                            label="No. of indigenous(Desi Cows)"
                            required
                            type="number"
                            value={formData.noOfIndigenousCows || ''}
                            onChange={(e) => setFormData({ ...formData, noOfIndigenousCows: e.target.value })}
                        />
                        <FormInput
                            label="Land Holding (ha)"
                            required
                            type="number"
                            value={formData.landHolding || ''}
                            onChange={(e) => setFormData({ ...formData, landHolding: e.target.value })}
                        />
                        <FormInput
                            label="Normal Crops Grown"
                            required
                            type="number"
                            value={formData.normalCropsGrown || ''}
                            onChange={(e) => setFormData({ ...formData, normalCropsGrown: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="No. of Years practicing in Natural Farming"
                            required
                            type="number"
                            value={formData.practicingYearOfNaturalFarming || ''}
                            onChange={(e) => setFormData({ ...formData, practicingYearOfNaturalFarming: e.target.value })}
                        />
                        <FormInput
                            label="Area covered (ha) under Natural Farming"
                            required
                            type="number"
                            value={formData.areaCoveredUnderNaturalFarming || ''}
                            onChange={(e) => setFormData({ ...formData, areaCoveredUnderNaturalFarming: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Crop Grown under Natural Farming"
                            required
                            value={formData.cropGrownUnderNaturalFarming || ''}
                            onChange={(e) => setFormData({ ...formData, cropGrownUnderNaturalFarming: e.target.value })}
                        />
                        <FormInput
                            label="Natural Farming Technology practicing/ adopted"
                            required
                            value={formData.naturalFarmingTechnologyPracticingAdopted || ''}
                            onChange={(e) => setFormData({ ...formData, naturalFarmingTechnologyPracticingAdopted: e.target.value })}
                        />
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800">Observations Recorded</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-left">
                                        <th className="p-4 border font-medium text-gray-700 w-1/3">Data parameter</th>
                                        <th className="p-4 border font-medium text-gray-700">Without Natural Farming practice</th>
                                        <th className="p-4 border font-medium text-gray-700">With Natural Farming practice</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { label: 'Plant Height (cm)', key: 'plantHeight' },
                                        { label: 'Other relevant parameter', key: 'otherParameter' },
                                        { label: 'Yield (q/ha)', key: 'yield' },
                                        { label: 'Cost of cultivation (Rs/ha)', key: 'costOfCultivation' },
                                        { label: 'Gross Return (Rs/ha)', key: 'grossReturn' },
                                        { label: 'Net return (Rs/ha)', key: 'netReturn' },
                                        { label: 'B:C Ratio', key: 'bcRatio' },
                                        { label: 'Soil PH', key: 'soilPh' },
                                        { label: 'Soil OC (%)', key: 'soilOc' },
                                        { label: 'Soil EC (dS/m)', key: 'soilEc' },
                                        { label: 'Available N (kg/ha)', key: 'availableN' },
                                        { label: 'Available P (kg/ha)', key: 'availableP' },
                                        { label: 'Available K (kg/ha)', key: 'availableK' },
                                        { label: 'Soil Microbes (cfu)', key: 'soilMicrobes' },
                                        { label: 'Any other specific', key: 'anyOtherSpecific' }
                                    ].map((row) => (
                                        <tr key={row.key}>
                                            <td className="p-4 border text-gray-700">{row.label}</td>
                                            <td className="p-2 border">
                                                <input
                                                    type="text"
                                                    value={formData[`without_practicing_${row.key}`] !== undefined && formData[`without_practicing_${row.key}`] !== null ? String(formData[`without_practicing_${row.key}`]) : ''}
                                                    onChange={(e) => setFormData({ ...formData, [`without_practicing_${row.key}`]: e.target.value })}
                                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                                />
                                            </td>
                                            <td className="p-2 border">
                                                <input
                                                    type="text"
                                                    value={formData[`with_practicing_${row.key}`] !== undefined && formData[`with_practicing_${row.key}`] !== null ? String(formData[`with_practicing_${row.key}`]) : ''}
                                                    onChange={(e) => setFormData({ ...formData, [`with_practicing_${row.key}`]: e.target.value })}
                                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <FormInput
                            label="Farmers Feedback"
                            required
                            value={formData.farmersFeedback || ''}
                            onChange={(e) => setFormData({ ...formData, farmersFeedback: e.target.value })}
                        />
                    </div>
                </div>
            )}
            {entityType === ENTITY_TYPES.PROJECT_NATURAL_FARMING_BENEFICIARIES && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FormInput
                            label="Reporting Year"
                            required
                            type="date"
                            value={formData.reportingYear || ''}
                            onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
                        />
                        <FormInput
                            label="No. of blocks covered"
                            required
                            type="number"
                            value={formData.noOfBlocks || ''}
                            onChange={(e) => setFormData({ ...formData, noOfBlocks: e.target.value })}
                        />
                        <FormInput
                            label="No. of village covered"
                            required
                            type="number"
                            value={formData.noOfVillages || ''}
                            onChange={(e) => setFormData({ ...formData, noOfVillages: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Total no. of Trained/Practicing NF Farmer"
                            required
                            type="number"
                            value={formData.totalTrainedFarmers || ''}
                            onChange={(e) => setFormData({ ...formData, totalTrainedFarmers: e.target.value })}
                        />
                        <FormInput
                            label="No. of farmers influenced to adopt NF"
                            required
                            type="number"
                            value={formData.farmersInfluenced || ''}
                            onChange={(e) => setFormData({ ...formData, farmersInfluenced: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="No. of farmers with whom the NF farmer can engaged all season"
                            required
                            type="number"
                            value={formData.farmersEngagedAllSeason || ''}
                            onChange={(e) => setFormData({ ...formData, farmersEngagedAllSeason: e.target.value })}
                        />
                        <FormInput
                            label="No. of farmers with whom the NF farmer can engage in 1 season"
                            required
                            type="number"
                            value={formData.farmersEngagedOneSeason || ''}
                            onChange={(e) => setFormData({ ...formData, farmersEngagedOneSeason: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        <FormInput
                            label="Any Remarks (in less than 50 words)"
                            required
                            value={formData.remarks || ''}
                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        />
                    </div>
                </div>
            )}
            {entityType === ENTITY_TYPES.PROJECT_NATURAL_FARMING_SOIL && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FormInput
                            label="Reporting Year"
                            required
                            type="date"
                            value={formData.reportingYear || ''}
                            onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
                        />
                        <MasterDataDropdown
                            label="Soil Parameter"
                            required
                            value={formData.soilParameterId || ''}
                            onChange={(value) => setFormData({ ...formData, soilParameterId: value })}
                            options={createMasterDataOptions(naturalFarmingSoilParameters, 'naturalFarmingSoilParameterId', 'parameterName')}
                            emptyMessage="No soil parameters available"
                        />
                        <FormSelect
                            label="Season"
                            required
                            value={formData.seasonId || ''}
                            onChange={(e) => setFormData({ ...formData, seasonId: e.target.value })}
                            options={seasons.map((s: any) => ({ value: s.seasonId || s.id, label: s.seasonName }))}
                            placeholder="Select"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FormInput
                            label="Crop"
                            required
                            value={formData.crop || ''}
                            onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                        />
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800">Before crop sowing</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FormInput
                                label="pH"
                                required
                                value={formData.beforePh || ''}
                                onChange={(e) => setFormData({ ...formData, beforePh: e.target.value })}
                            />
                            <FormInput
                                label="EC (dS/m)"
                                required
                                value={formData.beforeEc || ''}
                                onChange={(e) => setFormData({ ...formData, beforeEc: e.target.value })}
                            />
                            <FormInput
                                label="OC (%)"
                                required
                                value={formData.beforeOc || ''}
                                onChange={(e) => setFormData({ ...formData, beforeOc: e.target.value })}
                            />
                            <FormInput
                                label="N (Kg/ha)"
                                required
                                value={formData.beforeN || ''}
                                onChange={(e) => setFormData({ ...formData, beforeN: e.target.value })}
                            />
                            <FormInput
                                label="P (Kg/ha)"
                                required
                                value={formData.beforeP || ''}
                                onChange={(e) => setFormData({ ...formData, beforeP: e.target.value })}
                            />
                            <FormInput
                                label="K (Kg/ha)"
                                required
                                value={formData.beforeK || ''}
                                onChange={(e) => setFormData({ ...formData, beforeK: e.target.value })}
                            />
                            <FormInput
                                label="Soil Microbes (cfu)"
                                required
                                value={formData.beforeMicrobes || ''}
                                onChange={(e) => setFormData({ ...formData, beforeMicrobes: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800">After harvesting</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FormInput
                                label="pH"
                                required
                                value={formData.afterPh || ''}
                                onChange={(e) => setFormData({ ...formData, afterPh: e.target.value })}
                            />
                            <FormInput
                                label="EC (dS/m)"
                                required
                                value={formData.afterEc || ''}
                                onChange={(e) => setFormData({ ...formData, afterEc: e.target.value })}
                            />
                            <FormInput
                                label="OC (%)"
                                required
                                value={formData.afterOc || ''}
                                onChange={(e) => setFormData({ ...formData, afterOc: e.target.value })}
                            />
                            <FormInput
                                label="N (Kg/ha)"
                                required
                                value={formData.afterN || ''}
                                onChange={(e) => setFormData({ ...formData, afterN: e.target.value })}
                            />
                            <FormInput
                                label="P (Kg/ha)"
                                required
                                value={formData.afterP !== undefined && formData.afterP !== null ? String(formData.afterP) : ''}
                                onChange={(e) => setFormData({ ...formData, afterP: e.target.value })}
                            />
                            <FormInput
                                label="K (Kg/ha)"
                                required
                                value={formData.afterK !== undefined && formData.afterK !== null ? String(formData.afterK) : ''}
                                onChange={(e) => setFormData({ ...formData, afterK: e.target.value })}
                            />
                            <FormInput
                                label="Soil Microbes (cfu)"
                                required
                                value={formData.afterMicrobes !== undefined && formData.afterMicrobes !== null ? String(formData.afterMicrobes) : ''}
                                onChange={(e) => setFormData({ ...formData, afterMicrobes: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            )}
            {entityType === ENTITY_TYPES.PROJECT_NATURAL_FARMING_BUDGET && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FormInput
                            label="Reporting Year"
                            required
                            type="date"
                            value={formData.reportingYear || ''}
                            onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
                        />
                        <MasterDataDropdown
                            label="Name of activity"
                            required
                            value={formData.activityId || ''}
                            onChange={(value) => setFormData({ ...formData, activityId: value })}
                            options={createMasterDataOptions(naturalFarmingActivities, 'naturalFarmingActivityId', 'activityName')}
                            emptyMessage="No activities available"
                        />
                        <FormInput
                            label="Number of activities organized"
                            required
                            type="number"
                            value={formData.noOfActivities || ''}
                            onChange={(e) => setFormData({ ...formData, noOfActivities: e.target.value })}
                        />
                        <FormInput
                            label="Budget sanction (Rs)"
                            required
                            type="number"
                            value={formData.budgetSanction || ''}
                            onChange={(e) => setFormData({ ...formData, budgetSanction: e.target.value })}
                        />
                        <FormInput
                            label="Budget expenditure (Rs)"
                            required
                            type="number"
                            value={formData.budgetExpenditure || ''}
                            onChange={(e) => setFormData({ ...formData, budgetExpenditure: e.target.value })}
                        />
                        <FormInput
                            label="Total Budget Expenditure (Rs)"
                            required
                            type="number"
                            value={formData.totalBudgetExpenditure || ''}
                            onChange={(e) => setFormData({ ...formData, totalBudgetExpenditure: e.target.value })}
                        />
                    </div>
                </div>
            )}
        </>
    )
}
