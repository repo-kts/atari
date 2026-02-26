import React from 'react'
import { ENTITY_TYPES } from '../../../../../constants/entityTypes'
import { FormInput, FormSelect } from '../shared/FormComponents'

interface NaturalFarmingFormsProps {
    entityType: string
    formData: any
    setFormData: (data: any) => void
    years: any[]
    states?: any[]
    seasons?: any[]
}

export const NaturalFarmingForms: React.FC<NaturalFarmingFormsProps> = ({
    entityType,
    formData,
    setFormData,
    years,
    states = [],
    seasons = []
}) => {
    return (
        <>
            {entityType === ENTITY_TYPES.PROJECT_NATURAL_FARMING_GEO && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormSelect
                            label="Reporting Year"
                            required
                            value={formData.yearId || ''}
                            onChange={(e) => setFormData({ ...formData, yearId: parseInt(e.target.value) })}
                            options={years.map((y: any) => ({ value: String(y.id || y.yearId), label: y.yearName || y.year || y.name }))}
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
                        <FormSelect
                            label="Activity"
                            required
                            value={formData.activity || ''}
                            onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                            options={[
                                { value: 'Training', label: 'Training' },
                                { value: 'Demonstration', label: 'Demonstration' },
                                { value: 'Awareness', label: 'Awareness' },
                                { value: 'Workshop', label: 'Workshop' }
                            ]}
                            placeholder="Select"
                        />
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
                            <label className="block text-sm font-medium text-gray-700">Images</label>
                            <input
                                type="file"
                                multiple
                                onChange={(e) => setFormData({ ...formData, images: e.target.files })}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 border border-gray-300 rounded-md p-2"
                            />
                        </div>
                    </div>
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
                            value={formData.stateId || ''}
                            onChange={(e) => setFormData({ ...formData, stateId: e.target.value })}
                            options={states.map((s: any) => ({ value: s.id, label: s.stateName }))}
                            placeholder="Select"
                        />
                        <FormSelect
                            label="Category"
                            required
                            value={formData.category || ''}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            options={[
                                { value: 'General', label: 'General' },
                                { value: 'OBC', label: 'OBC' },
                                { value: 'SC', label: 'SC' },
                                { value: 'ST', label: 'ST' }
                            ]}
                            placeholder="Select"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Cropping System of Farmer"
                            required
                            value={formData.croppingSystem || ''}
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
                            value={formData.latitude || ''}
                            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                        />
                        <FormInput
                            label="Longitude (E)"
                            required
                            value={formData.longitude || ''}
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
                            options={seasons.map((s: any) => ({ value: s.id, label: s.seasonName }))}
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
                            <table className="min-w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-left">
                                        <th className="p-4 border font-medium text-gray-700 w-1/3">Data Parameter</th>
                                        <th className="p-4 border font-medium text-gray-700">Without Natural Farming Intervention</th>
                                        <th className="p-4 border font-medium text-gray-700">With Natural Farming intervention</th>
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
                                        { label: 'BCR Ratio', key: 'bcrRatio' },
                                        { label: 'Soil PH', key: 'soilPh' },
                                        { label: 'Soluble Salt', key: 'solubleSalt' },
                                        { label: 'Soil OC (q/ha)', key: 'soilOc' },
                                        { label: 'Available N (kg/ha)', key: 'availableN' },
                                        { label: 'Available P (kg/ha)', key: 'availableP' },
                                        { label: 'Available K (kg/ha)', key: 'availableK' },
                                        { label: 'Narrative description', key: 'narrativeDescription' },
                                        { label: 'Any other specific', key: 'anyOtherSpecific' }
                                    ].map((row) => (
                                        <tr key={row.key}>
                                            <td className="p-4 border text-gray-700">{row.label}</td>
                                            <td className="p-2 border">
                                                <input
                                                    type="text"
                                                    value={formData[`without_${row.key}`] || ''}
                                                    onChange={(e) => setFormData({ ...formData, [`without_${row.key}`]: e.target.value })}
                                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                                />
                                            </td>
                                            <td className="p-2 border">
                                                <input
                                                    type="text"
                                                    value={formData[`with_${row.key}`] || ''}
                                                    onChange={(e) => setFormData({ ...formData, [`with_${row.key}`]: e.target.value })}
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
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Images</label>
                            <input
                                type="file"
                                multiple
                                onChange={(e) => setFormData({ ...formData, demoImages: e.target.files })}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 border border-gray-300 rounded-md p-2"
                            />
                        </div>
                    </div>
                </div>
            )}
            {entityType === ENTITY_TYPES.PROJECT_NATURAL_FARMING_FARMERS && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FormSelect
                            label="State"
                            required
                            value={formData.stateId || ''}
                            onChange={(e) => setFormData({ ...formData, stateId: e.target.value })}
                            options={states.map((s: any) => ({ value: s.id, label: s.stateName }))}
                            placeholder="Select"
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
                            label="No. of indigenous Cows/Animals"
                            required
                            type="number"
                            value={formData.noOfAnimals || ''}
                            onChange={(e) => setFormData({ ...formData, noOfAnimals: e.target.value })}
                        />
                        <FormInput
                            label="Land Holding (ha)"
                            required
                            type="number"
                            value={formData.landHolding || ''}
                            onChange={(e) => setFormData({ ...formData, landHolding: e.target.value })}
                        />
                        <FormInput
                            label="Total farm area (ha)"
                            required
                            type="number"
                            value={formData.totalFarmArea || ''}
                            onChange={(e) => setFormData({ ...formData, totalFarmArea: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Area (ha) under practicing Natural Farming"
                            required
                            type="number"
                            value={formData.areaUnderPracticing || ''}
                            onChange={(e) => setFormData({ ...formData, areaUnderPracticing: e.target.value })}
                        />
                        <FormInput
                            label="Area (ha) in transition phase Natural Farming"
                            required
                            type="number"
                            value={formData.areaInTransition || ''}
                            onChange={(e) => setFormData({ ...formData, areaInTransition: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        <FormInput
                            label="Crop system under Natural Farming"
                            required
                            value={formData.cropSystem || ''}
                            onChange={(e) => setFormData({ ...formData, cropSystem: e.target.value })}
                        />
                        <FormInput
                            label="Motivation factor potential for practicing of Natural Farming"
                            required
                            value={formData.motivationFactors || ''}
                            onChange={(e) => setFormData({ ...formData, motivationFactors: e.target.value })}
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
                                        { label: 'Plant Weight (cm)', key: 'plantWeight' },
                                        { label: 'Other relevant parameter', key: 'otherParameter' },
                                        { label: 'Yield (q/ha)', key: 'yield' },
                                        { label: 'Cost of cultivation (Rs/ha)', key: 'costOfCultivation' },
                                        { label: 'Gross Return (Rs/ha)', key: 'grossReturn' },
                                        { label: 'Net return (Rs/ha)', key: 'netReturn' },
                                        { label: 'BCR Ratio', key: 'bcrRatio' },
                                        { label: 'Soil PH', key: 'soilPh' },
                                        { label: 'Soluble Salt', key: 'solubleSalt' },
                                        { label: 'Soil OC (q/ha)', key: 'soilOc' },
                                        { label: 'Available N (kg/ha)', key: 'availableN' },
                                        { label: 'Available P (kg/ha)', key: 'availableP' },
                                        { label: 'Available K (kg/ha)', key: 'availableK' },
                                        { label: 'Soil Microbial (cfu)', key: 'soilMicrobial' },
                                        { label: 'Population density', key: 'populationDensity' }
                                    ].map((row) => (
                                        <tr key={row.key}>
                                            <td className="p-4 border text-gray-700">{row.label}</td>
                                            <td className="p-2 border">
                                                <input
                                                    type="text"
                                                    value={formData[`without_practicing_${row.key}`] || ''}
                                                    onChange={(e) => setFormData({ ...formData, [`without_practicing_${row.key}`]: e.target.value })}
                                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                                />
                                            </td>
                                            <td className="p-2 border">
                                                <input
                                                    type="text"
                                                    value={formData[`with_practicing_${row.key}`] || ''}
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
                        <FormSelect
                            label="Year"
                            required
                            value={formData.yearId || ''}
                            onChange={(e) => setFormData({ ...formData, yearId: parseInt(e.target.value) })}
                            options={years.map((y: any) => ({ value: String(y.id || y.yearId), label: y.yearName || y.year || y.name }))}
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
                        <FormSelect
                            label="Year"
                            required
                            value={formData.yearId || ''}
                            onChange={(e) => setFormData({ ...formData, yearId: parseInt(e.target.value) })}
                            options={years.map((y: any) => ({ value: String(y.id || y.yearId), label: y.yearName || y.year || y.name }))}
                        />
                        <FormSelect
                            label="Soil Parameter"
                            required
                            value={formData.soilParameter || ''}
                            onChange={(e) => setFormData({ ...formData, soilParameter: e.target.value })}
                            options={[
                                { value: 'Chemical', label: 'Chemical' },
                                { value: 'Biological', label: 'Biological' },
                                { value: 'Physical', label: 'Physical' }
                            ]}
                            placeholder="Select"
                        />
                        <FormSelect
                            label="Season"
                            required
                            value={formData.seasonId || ''}
                            onChange={(e) => setFormData({ ...formData, seasonId: e.target.value })}
                            options={seasons.map((s: any) => ({ value: s.id, label: s.seasonName }))}
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
                                value={formData.afterP || ''}
                                onChange={(e) => setFormData({ ...formData, afterP: e.target.value })}
                            />
                            <FormInput
                                label="K (Kg/ha)"
                                required
                                value={formData.afterK || ''}
                                onChange={(e) => setFormData({ ...formData, afterK: e.target.value })}
                            />
                            <FormInput
                                label="Soil Microbes (cfu)"
                                required
                                value={formData.afterMicrobes || ''}
                                onChange={(e) => setFormData({ ...formData, afterMicrobes: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            )}
            {entityType === ENTITY_TYPES.PROJECT_NATURAL_FARMING_BUDGET && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FormSelect
                            label="Year"
                            required
                            value={formData.yearId || ''}
                            onChange={(e) => setFormData({ ...formData, yearId: parseInt(e.target.value) })}
                            options={years.map((y: any) => ({ value: String(y.id || y.yearId), label: y.yearName || y.year || y.name }))}
                        />
                        <FormSelect
                            label="Name of activity"
                            required
                            value={formData.activityName || ''}
                            onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
                            options={[
                                { value: 'Training', label: 'Training' },
                                { value: 'Demonstration', label: 'Demonstration' },
                                { value: 'Awareness', label: 'Awareness' },
                                { value: 'Workshop', label: 'Workshop' }
                            ]}
                            placeholder="Select"
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
