import React from 'react'
import { ENTITY_TYPES } from '../../../../../constants/entityTypes'
import { FormInput, FormSelect, FormTextArea } from '../shared/FormComponents'
import { ExtendedEntityType } from '../../../../../utils/masterUtils'

interface NaturalFarmingFormsProps {
    entityType: ExtendedEntityType
    formData: any
    setFormData: (data: any) => void
    YearSelect: React.FC
}

export const NaturalFarmingForms: React.FC<NaturalFarmingFormsProps> = ({
    entityType,
    formData,
    setFormData,
    YearSelect,
}) => {
    // Helper for observation rows - Demo
    const renderObservationRowDemo = (label: string, fieldKeyPart: string) => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <FormInput
                label=""
                placeholder="Natural Farming"
                value={formData[`${fieldKeyPart}Natural`] || ''}
                onChange={(e) => setFormData({ ...formData, [`${fieldKeyPart}Natural`]: e.target.value })}
            />
            <FormInput
                label=""
                placeholder="Non-Natural Farming"
                value={formData[`${fieldKeyPart}NonNatural`] || ''}
                onChange={(e) => setFormData({ ...formData, [`${fieldKeyPart}NonNatural`]: e.target.value })}
            />
        </div>
    );

    // Helper for observation rows - Farmers (Chemical vs Natural)
    const renderObservationRowFarmers = (label: string, fieldKeyPart: string) => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <FormInput
                label=""
                placeholder="Chemical Farming"
                value={formData[`${fieldKeyPart}Chemical`] || ''}
                onChange={(e) => setFormData({ ...formData, [`${fieldKeyPart}Chemical`]: e.target.value })}
            />
            <FormInput
                label=""
                placeholder="Natural Farming"
                value={formData[`${fieldKeyPart}Natural`] || ''}
                onChange={(e) => setFormData({ ...formData, [`${fieldKeyPart}Natural`]: e.target.value })}
            />
        </div>
    );

    return (
        <>
            {/* Geographical Info Form */}
            {entityType === ENTITY_TYPES.PROJECT_NATURAL_FARMING_GEO && (
                <div className="space-y-8">
                    <div className="mb-6">
                        <h3 className="text-xl font-normal text-gray-800">Create Geographical information</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <YearSelect />

                            <FormInput
                                label="Start Date"
                                type="date"
                                required
                                value={formData.startDate || ''}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />

                            <FormInput
                                label="End Date"
                                type="date"
                                required
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
                </div>
            )}

            {/* Physical Training Form */}
            {entityType === ENTITY_TYPES.PROJECT_NATURAL_FARMING_PHYSICAL && (
                <div className="space-y-8">
                    <div className="mb-6">
                        <h3 className="text-xl font-normal text-gray-800">Create Natural Farming</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormSelect
                                label="Activity"
                                required
                                value={formData.activity || ''}
                                options={[
                                    { value: 'Training for Farmers', label: 'Training for Farmers' },
                                    { value: 'Training for Extension Functionaries', label: 'Training for Extension Functionaries' },
                                    { value: 'Awareness Programme', label: 'Awareness Programme' },
                                    { value: 'Exposure Visit', label: 'Exposure Visit' },
                                ]}
                                onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                            />

                            <FormInput
                                label="Title of Natural Farming training Programme"
                                required
                                value={formData.trainingTitle || ''}
                                onChange={(e) => setFormData({ ...formData, trainingTitle: e.target.value })}
                            />

                            <FormInput
                                label="Date of Training"
                                type="date"
                                required
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
                    </div>

                    {/* Participants Section */}
                    <div>
                        <h4 className="text-lg font-normal text-gray-800 mb-4">Participants</h4>
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

                    {/* Remarks and Images */}
                    <div className="space-y-4">
                        <FormInput
                            label="Remarks/ Observation/Feedback Recorded"
                            required
                            value={formData.remarks || ''}
                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        />

                        <FormInput
                            label="Images"
                            type="file"
                            onChange={(_e) => {
                                // Handle file upload
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Demonstration Form */}
            {entityType === ENTITY_TYPES.PROJECT_NATURAL_FARMING_DEMO && (
                <div className="space-y-8">
                    <div className="mb-6">
                        <h3 className="text-xl font-normal text-gray-800">Create Demonstration Information</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Start Date"
                                type="date"
                                required
                                value={formData.startDate || ''}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />
                            <FormInput
                                label="End Date"
                                type="date"
                                required
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
                                label="Mobile Number"
                                required
                                value={formData.mobileNumber || ''}
                                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                            />
                            <FormSelect
                                label="Gender"
                                required
                                value={formData.gender || ''}
                                options={[
                                    { value: 'Male', label: 'Male' },
                                    { value: 'Female', label: 'Female' },
                                    { value: 'Other', label: 'Other' },
                                ]}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            />
                            <FormSelect
                                label="Category"
                                required
                                value={formData.category || ''}
                                options={[
                                    { value: 'General', label: 'General' },
                                    { value: 'OBC', label: 'OBC' },
                                    { value: 'SC', label: 'SC' },
                                    { value: 'ST', label: 'ST' },
                                ]}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            />
                            <FormInput
                                label="Cropping system (crop sequence)"
                                required
                                value={formData.croppingSystem || ''}
                                onChange={(e) => setFormData({ ...formData, croppingSystem: e.target.value })}
                            />
                            <FormInput
                                label="Farming Situation of the Selected KVK"
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
                            <FormInput
                                label="Name of crop"
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
                            <FormInput
                                label="Natural Farming demonstration"
                                required
                                value={formData.demonstration || ''}
                                onChange={(e) => setFormData({ ...formData, demonstration: e.target.value })}
                            />
                            <FormInput
                                label="Area Under Natural Farming practice"
                                required
                                value={formData.area || ''}
                                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                            />
                            <FormInput
                                label="Source of Natural inputs"
                                required
                                value={formData.sourceOfInputs || ''}
                                onChange={(e) => setFormData({ ...formData, sourceOfInputs: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Observations Recorded */}
                    <div>
                        <h4 className="text-lg font-normal text-gray-800 mb-6">Observations Recorded</h4>

                        {/* Header Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2 font-medium bg-gray-50 p-2 rounded">
                            <div>Parameter</div>
                            <div>Natural Farming practice</div>
                            <div>Non-Natural Farming practice</div>
                        </div>

                        <div className="space-y-4">
                            {renderObservationRowDemo('Plant height (cm)', 'plantHeight')}
                            {renderObservationRowDemo('No. of branches/plant/No. of tillers/hills', 'branches')}
                            {renderObservationRowDemo('No. of pods/plant/No. of grains/pod', 'pods')}
                            {renderObservationRowDemo('Yield (q/ha)', 'yield')}
                            {renderObservationRowDemo('Cost of cultivation (Rs/ha)', 'cost')}
                            {renderObservationRowDemo('Gross return (Rs/ha)', 'grossReturn')}
                            {renderObservationRowDemo('Net return (Rs/ha)', 'netReturn')}
                            {renderObservationRowDemo('BC Ratio', 'bcRatio')}
                            {renderObservationRowDemo('Soil pH', 'soilPh')}
                            {renderObservationRowDemo('Soil OC (%)', 'soilOc')}
                            {renderObservationRowDemo('Soil EC (dS/m)', 'soilEc')}
                            {renderObservationRowDemo('Available N (kg/ha)', 'availN')}
                            {renderObservationRowDemo('Available P (kg/ha)', 'availP')}
                            {renderObservationRowDemo('Available K (kg/ha)', 'availK')}
                            {renderObservationRowDemo('Any other remarks', 'otherRemarks')}
                        </div>
                    </div>

                    <div className="space-y-4 mt-8">
                        <FormTextArea
                            label="Feedback/Observation"
                            value={formData.feedback || ''}
                            onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                        />

                        <FormInput
                            label="Images"
                            type="file"
                            onChange={(_e) => {
                                // Handle file upload
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Farmers Form */}
            {entityType === ENTITY_TYPES.PROJECT_NATURAL_FARMING_FARMERS && (
                <div className="space-y-8">
                    <div className="mb-6">
                        <h3 className="text-xl font-normal text-gray-800">Create Farmer Information</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <YearSelect />

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

                            <FormInput
                                label="no. of indigenous (desi) Cows)"
                                required
                                value={formData.indigenousCows || ''}
                                onChange={(e) => setFormData({ ...formData, indigenousCows: e.target.value })}
                            />

                            <FormInput
                                label="Land Holding (ha)"
                                required
                                value={formData.landHolding || ''}
                                onChange={(e) => setFormData({ ...formData, landHolding: e.target.value })}
                            />

                            <FormInput
                                label="Farming System"
                                required
                                value={formData.farmingSystem || ''}
                                onChange={(e) => setFormData({ ...formData, farmingSystem: e.target.value })}
                            />

                            <FormInput
                                label="No. of Years practicing natural farming"
                                required
                                value={formData.yearsPracticing || ''}
                                onChange={(e) => setFormData({ ...formData, yearsPracticing: e.target.value })}
                            />

                            <FormInput
                                label="Area (ha) covered under natural farming"
                                required
                                value={formData.areaCovered || ''}
                                onChange={(e) => setFormData({ ...formData, areaCovered: e.target.value })}
                            />

                            <FormInput
                                label="Crop Grown under Natural Farming"
                                required
                                value={formData.cropGrown || ''}
                                onChange={(e) => setFormData({ ...formData, cropGrown: e.target.value })}
                            />

                            <FormInput
                                label="Natural Farming technology/practices adopted"
                                required
                                value={formData.practicesAdopted || ''}
                                onChange={(e) => setFormData({ ...formData, practicesAdopted: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Observations Recorded */}
                    <div>
                        <h4 className="text-lg font-normal text-gray-800 mb-6">Observations Recorded</h4>

                        {/* Header Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2 font-medium bg-gray-50 p-2 rounded">
                            <div>Name of parameter</div>
                            <div>With chemical farming practice</div>
                            <div>With Natural farming practice</div>
                        </div>

                        <div className="space-y-4">
                            {renderObservationRowFarmers('Plant height (cm)', 'plantHeight')}
                            {renderObservationRowFarmers('Other relevant parameter', 'otherParam')}
                            {renderObservationRowFarmers('Yield (q/ha)', 'yield')}
                            {renderObservationRowFarmers('Cost of cultivation (Rs/ha)', 'cost')}
                            {renderObservationRowFarmers('Gross Return (Rs/ha)', 'grossReturn')}
                            {renderObservationRowFarmers('Net Return (Rs/ha)', 'netReturn')}
                            {renderObservationRowFarmers('BC Ratio', 'bcRatio')}
                            {renderObservationRowFarmers('Soil pH', 'soilPh')}
                            {renderObservationRowFarmers('Soil OC (%)', 'soilOc')}
                            {renderObservationRowFarmers('Soil EC (dS/m)', 'soilEc')}
                            {renderObservationRowFarmers('Available N (kg/ha)', 'availN')}
                            {renderObservationRowFarmers('Available P (kg/ha)', 'availP')}
                            {renderObservationRowFarmers('Available K (kg/ha)', 'availK')}
                            {renderObservationRowFarmers('Any other specify', 'otherSpecify')}
                        </div>
                    </div>

                    <div className="space-y-4 mt-8">
                        <FormTextArea
                            label="Farmer Feedback"
                            value={formData.farmerFeedback || ''}
                            onChange={(e) => setFormData({ ...formData, farmerFeedback: e.target.value })}
                        />
                    </div>
                </div>
            )}

            {/* Beneficiaries Form */}
            {entityType === ENTITY_TYPES.PROJECT_NATURAL_FARMING_BENEFICIARIES && (
                <div className="space-y-8">
                    <div className="mb-6">
                        <h3 className="text-xl font-normal text-gray-800">Create Beneficiaries details</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <YearSelect />

                            <FormInput
                                label="No. of blocks covered"
                                type="number"
                                required
                                value={formData.blocksCovered || ''}
                                onChange={(e) => setFormData({ ...formData, blocksCovered: e.target.value })}
                            />

                            <FormInput
                                label="No. of village covered"
                                type="number"
                                required
                                value={formData.villagesCovered || ''}
                                onChange={(e) => setFormData({ ...formData, villagesCovered: e.target.value })}
                            />

                            <FormInput
                                label="Total no. of Trained/Practicing NF Farmer"
                                type="number"
                                required
                                value={formData.trainedFarmers || ''}
                                onChange={(e) => setFormData({ ...formData, trainedFarmers: e.target.value })}
                            />

                            <FormInput
                                label="No. of farmers influenced to adopt NF"
                                type="number"
                                required
                                value={formData.influencedFarmers || ''}
                                onChange={(e) => setFormData({ ...formData, influencedFarmers: e.target.value })}
                            />

                            <FormInput
                                label="No. of farmers with whom the NF farmer can engaged all season"
                                type="number"
                                required
                                value={formData.engagedAllSeason || ''}
                                onChange={(e) => setFormData({ ...formData, engagedAllSeason: e.target.value })}
                            />

                            <FormInput
                                label="No. of farmers with whom the NF farmer can engage in 1 season"
                                type="number"
                                required
                                value={formData.engagedOneSeason || ''}
                                onChange={(e) => setFormData({ ...formData, engagedOneSeason: e.target.value })}
                            />
                        </div>

                        <div className="mt-4">
                            <FormTextArea
                                label="Any Remarks (in less than 50 words)"
                                required
                                value={formData.remarks || ''}
                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Soil Data Form */}
            {entityType === ENTITY_TYPES.PROJECT_NATURAL_FARMING_SOIL && (
                <div className="space-y-8">
                    <div className="mb-6">
                        <h3 className="text-xl font-normal text-gray-800">Create Soil Data Information</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <YearSelect />

                            <FormSelect
                                label="Soil Parameter"
                                required
                                value={formData.soilParameter || ''}
                                options={[
                                    { value: 'Natural Farming', label: 'Natural Farming' },
                                    { value: 'Chemical Farming', label: 'Chemical Farming' },
                                    { value: 'Other', label: 'Other' },
                                ]}
                                onChange={(e) => setFormData({ ...formData, soilParameter: e.target.value })}
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
                        </div>

                        <div className="w-full">
                            <FormInput
                                label="Crop"
                                required
                                value={formData.crop || ''}
                                onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Before crop sowing */}
                    <div>
                        <h4 className="text-lg font-medium text-gray-800 mb-4">Before crop sowing</h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <FormInput
                                label="pH"
                                type="number"
                                required
                                value={formData.pHBefore || ''}
                                onChange={(e) => setFormData({ ...formData, pHBefore: e.target.value })}
                            />
                            <FormInput
                                label="EC (dS/m)"
                                type="number"
                                required
                                value={formData.ecBefore || ''}
                                onChange={(e) => setFormData({ ...formData, ecBefore: e.target.value })}
                            />
                            <FormInput
                                label="OC (%)"
                                type="number"
                                required
                                value={formData.ocBefore || ''}
                                onChange={(e) => setFormData({ ...formData, ocBefore: e.target.value })}
                            />
                            <FormInput
                                label="N (kg/ha)"
                                type="number"
                                required
                                value={formData.nBefore || ''}
                                onChange={(e) => setFormData({ ...formData, nBefore: e.target.value })}
                            />
                            <FormInput
                                label="P (Kg/ha)"
                                type="number"
                                required
                                value={formData.pBefore || ''}
                                onChange={(e) => setFormData({ ...formData, pBefore: e.target.value })}
                            />
                            <FormInput
                                label="K (Kg/ha)"
                                type="number"
                                required
                                value={formData.kBefore || ''}
                                onChange={(e) => setFormData({ ...formData, kBefore: e.target.value })}
                            />
                            <FormInput
                                label="Soil Microbes (cfu)"
                                type="number"
                                required
                                value={formData.microbesBefore || ''}
                                onChange={(e) => setFormData({ ...formData, microbesBefore: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* After harvesting */}
                    <div>
                        <h4 className="text-lg font-medium text-gray-800 mb-4">After harvesting</h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <FormInput
                                label="pH"
                                type="number"
                                required
                                value={formData.pHAfter || ''}
                                onChange={(e) => setFormData({ ...formData, pHAfter: e.target.value })}
                            />
                            <FormInput
                                label="EC (dS/m)"
                                type="number"
                                required
                                value={formData.ecAfter || ''}
                                onChange={(e) => setFormData({ ...formData, ecAfter: e.target.value })}
                            />
                            <FormInput
                                label="OC (%)"
                                type="number"
                                required
                                value={formData.ocAfter || ''}
                                onChange={(e) => setFormData({ ...formData, ocAfter: e.target.value })}
                            />
                            <FormInput
                                label="N (kg/ha)"
                                type="number"
                                required
                                value={formData.nAfter || ''}
                                onChange={(e) => setFormData({ ...formData, nAfter: e.target.value })}
                            />
                            <FormInput
                                label="P (Kg/ha)"
                                type="number"
                                required
                                value={formData.pAfter || ''}
                                onChange={(e) => setFormData({ ...formData, pAfter: e.target.value })}
                            />
                            <FormInput
                                label="K (Kg/ha)"
                                type="number"
                                required
                                value={formData.kAfter || ''}
                                onChange={(e) => setFormData({ ...formData, kAfter: e.target.value })}
                            />
                            <FormInput
                                label="Soil Microbes (cfu)"
                                type="number"
                                required
                                value={formData.microbesAfter || ''}
                                onChange={(e) => setFormData({ ...formData, microbesAfter: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Budget Form (PROJECT_NATURAL_FARMING_BUDGET) */}
            {entityType === ENTITY_TYPES.PROJECT_NATURAL_FARMING_BUDGET && (
                <div className="space-y-8">
                    <div className="mb-6">
                        <h3 className="text-xl font-normal text-gray-800">Create Financial information</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <YearSelect />

                            <FormSelect
                                label="Name of activity"
                                required
                                value={formData.activity || ''}
                                options={[
                                    { value: 'Training for Farmers', label: 'Training for Farmers' },
                                    { value: 'Training for Extension Functionaries', label: 'Training for Extension Functionaries' },
                                    { value: 'Awareness Programme', label: 'Awareness Programme' },
                                    { value: 'Exposure Visit', label: 'Exposure Visit' },
                                    { value: 'Other', label: 'Other' },
                                ]}
                                onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                            />

                            <FormInput
                                label="Number of activities organized"
                                type="number"
                                required
                                value={formData.activitiesOrganized || ''}
                                onChange={(e) => setFormData({ ...formData, activitiesOrganized: e.target.value })}
                            />

                            <FormInput
                                label="Budget sanction (Rs)"
                                type="number"
                                required
                                value={formData.budgetSanction || ''}
                                onChange={(e) => setFormData({ ...formData, budgetSanction: e.target.value })}
                            />

                            <FormInput
                                label="Budget expenditure (Rs)"
                                type="number"
                                required
                                value={formData.budgetExpenditure || ''}
                                onChange={(e) => setFormData({ ...formData, budgetExpenditure: e.target.value })}
                            />

                            <FormInput
                                label="Total Budget Expenditure (Rs)"
                                type="number"
                                required
                                value={formData.totalExpenditure || ''}
                                onChange={(e) => setFormData({ ...formData, totalExpenditure: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
