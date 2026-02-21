import React from 'react'
import { ENTITY_TYPES } from '../../../../../constants/entityTypes'
import { FormInput, FormSelect } from '../shared/FormComponents'
import { ExtendedEntityType } from '../../../../../utils/masterUtils'

interface NicraFormsProps {
    entityType: ExtendedEntityType
    formData: any
    setFormData: (data: any) => void
    YearSelect: React.FC
}

export const NicraForms: React.FC<NicraFormsProps> = ({
    entityType,
    formData,
    setFormData,
    YearSelect,
}) => {
    return (
        <>
            {/* Basic Information Form */}
            {entityType === ENTITY_TYPES.PROJECT_NICRA_BASIC && (
                <div className="space-y-8">
                    <div className="mb-6">
                        <h3 className="text-xl font-normal text-gray-800">Basic Information District and Adopted Village Under NICRA</h3>
                    </div>

                    <div className="space-y-6">
                        {/* Month & Year */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Month & Year"
                                type="month"
                                required
                                value={formData.monthYear || ''}
                                onChange={(e) => setFormData({ ...formData, monthYear: e.target.value })}
                            />
                        </div>

                        {/* RF (mm) district */}
                        <div>
                            <h4 className="text-lg font-medium text-gray-700 mb-4">RF (mm) district</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormInput
                                    label="Normal"
                                    type="number"
                                    required
                                    value={formData.rfNormal || ''}
                                    onChange={(e) => setFormData({ ...formData, rfNormal: e.target.value })}
                                />
                                <FormInput
                                    label="Received"
                                    type="number"
                                    required
                                    value={formData.rfReceived || ''}
                                    onChange={(e) => setFormData({ ...formData, rfReceived: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Temperature OC */}
                        <div>
                            <h4 className="text-lg font-medium text-gray-700 mb-4">Temperature OC</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormInput
                                    label="Max."
                                    type="number"
                                    required
                                    value={formData.tempMax || ''}
                                    onChange={(e) => setFormData({ ...formData, tempMax: e.target.value })}
                                />
                                <FormInput
                                    label="Min."
                                    type="number"
                                    required
                                    value={formData.tempMin || ''}
                                    onChange={(e) => setFormData({ ...formData, tempMin: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Dry spell/ drought */}
                        <div>
                            <h4 className="text-lg font-medium text-gray-700 mb-4">Dry spell/ drought</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormInput
                                    label="> 10 days"
                                    type="number"
                                    required
                                    value={formData.drySpell10 || ''}
                                    onChange={(e) => setFormData({ ...formData, drySpell10: e.target.value })}
                                />
                                <FormInput
                                    label="> 15 days"
                                    type="number"
                                    required
                                    value={formData.drySpell15 || ''}
                                    onChange={(e) => setFormData({ ...formData, drySpell15: e.target.value })}
                                />
                                <FormInput
                                    label="> 20 days"
                                    type="number"
                                    required
                                    value={formData.drySpell20 || ''}
                                    onChange={(e) => setFormData({ ...formData, drySpell20: e.target.value })}
                                />
                                <FormInput
                                    label="Intensive rain > 60 mm"
                                    type="number"
                                    required
                                    value={formData.intensiveRain || ''}
                                    onChange={(e) => setFormData({ ...formData, intensiveRain: e.target.value })}
                                />
                                <FormInput
                                    label="Water depth (cm)"
                                    type="number"
                                    required
                                    value={formData.waterDepth || ''}
                                    onChange={(e) => setFormData({ ...formData, waterDepth: e.target.value })}
                                />
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
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Details Form (PROJECT_NICRA_DETAILS) */}
            {entityType === ENTITY_TYPES.PROJECT_NICRA_DETAILS && (
                <div className="space-y-8">
                    <div className="mb-6">
                        <h3 className="text-xl font-normal text-gray-800">Create NICRA Details</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <YearSelect />

                            <FormSelect
                                label="Category"
                                required
                                value={formData.category || ''}
                                options={[
                                    { value: 'Natural Resource Management', label: 'Natural Resource Management' },
                                    { value: 'Crop Production', label: 'Crop Production' },
                                    { value: 'Livestock and Fisheries', label: 'Livestock and Fisheries' },
                                    { value: 'Institutional Interventions', label: 'Institutional Interventions' },
                                ]}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            />

                            <FormSelect
                                label="Sub Category"
                                required
                                value={formData.subCategory || ''}
                                options={[
                                    { value: 'No subcategories available', label: 'No subcategories available' },
                                ]}
                                onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                            />

                            <FormInput
                                label="FST type"
                                required
                                value={formData.fstType || ''}
                                onChange={(e) => setFormData({ ...formData, fstType: e.target.value })}
                            />

                            <FormInput
                                label="Crop Name"
                                required
                                value={formData.cropName || ''}
                                onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
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
                                label="Month"
                                required
                                value={formData.month || ''}
                                options={[
                                    { value: 'January', label: 'January' },
                                    { value: 'February', label: 'February' },
                                    { value: 'March', label: 'March' },
                                    { value: 'April', label: 'April' },
                                    { value: 'May', label: 'May' },
                                    { value: 'June', label: 'June' },
                                    { value: 'July', label: 'July' },
                                    { value: 'August', label: 'August' },
                                    { value: 'September', label: 'September' },
                                    { value: 'October', label: 'October' },
                                    { value: 'November', label: 'November' },
                                    { value: 'December', label: 'December' },
                                ]}
                                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                            />

                            <FormInput
                                label="Technology demonstrated"
                                required
                                value={formData.technology || ''}
                                onChange={(e) => setFormData({ ...formData, technology: e.target.value })}
                            />

                            <FormInput
                                label="Area (ha)/ Unit"
                                required
                                value={formData.area || ''}
                                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                            />

                            <FormInput
                                label="Body wt. (Kg / animal)"
                                required
                                value={formData.bodyWeight || ''}
                                onChange={(e) => setFormData({ ...formData, bodyWeight: e.target.value })}
                            />

                            <FormInput
                                label="Yield (q/ ha)"
                                required
                                value={formData.yield || ''}
                                onChange={(e) => setFormData({ ...formData, yield: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Farmers Details Section */}
                    <div>
                        <h4 className="text-lg font-normal text-gray-800 mb-4">Farmers Details</h4>
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

                    {/* Economics Section */}
                    <div>
                        <h4 className="text-lg font-normal text-gray-800 mb-4">Economics of demonstration (Rs/ha)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Gross Cost"
                                type="number"
                                required
                                value={formData.grossCost || ''}
                                onChange={(e) => setFormData({ ...formData, grossCost: e.target.value })}
                            />
                            <FormInput
                                label="Gross Return"
                                type="number"
                                required
                                value={formData.grossReturn || ''}
                                onChange={(e) => setFormData({ ...formData, grossReturn: e.target.value })}
                            />
                            <FormInput
                                label="Net return"
                                type="number"
                                required
                                value={formData.netReturn || ''}
                                onChange={(e) => setFormData({ ...formData, netReturn: e.target.value })}
                            />
                            <FormInput
                                label="BCR ration"
                                type="number"
                                required
                                value={formData.bcrRatio || ''}
                                onChange={(e) => setFormData({ ...formData, bcrRatio: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Uploads Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            label="Photographs"
                            type="file"
                            onChange={(_e) => {
                                // Handle file upload
                            }}
                        />
                        <FormInput
                            label="Upload File"
                            type="file"
                            onChange={(_e) => {
                                // Handle file upload
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Training Form (PROJECT_NICRA_TRAINING) */}
            {entityType === ENTITY_TYPES.PROJECT_NICRA_TRAINING && (
                <div className="space-y-8">
                    <div className="mb-6">
                        <h3 className="text-xl font-normal text-gray-800">Create Basic Information</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Title of the training course"
                                required
                                value={formData.trainingTitle || ''}
                                onChange={(e) => setFormData({ ...formData, trainingTitle: e.target.value })}
                            />

                            <FormSelect
                                label="Campus Type"
                                required
                                value={formData.campusType || ''}
                                options={[
                                    { value: 'On Campus', label: 'On Campus' },
                                    { value: 'Off Campus', label: 'Off Campus' },
                                ]}
                                onChange={(e) => setFormData({ ...formData, campusType: e.target.value })}
                            />

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
                                label="Remark"
                                required
                                value={formData.remark || ''}
                                onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Farmers Details Section */}
                    <div>
                        <h4 className="text-lg font-normal text-gray-800 mb-4">Farmers Details</h4>
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

            {/* Extension Activity Form (PROJECT_NICRA_EXTENSION) */}
            {entityType === ENTITY_TYPES.PROJECT_NICRA_EXTENSION && (
                <div className="space-y-8">
                    <div className="mb-6">
                        <h3 className="text-xl font-normal text-gray-800">Create Extension Activity</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Activity Name"
                                required
                                value={formData.activityName || ''}
                                onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
                            />

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
                                label="Venue"
                                required
                                value={formData.venue || ''}
                                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Farmers Details Section */}
                    <div>
                        <h4 className="text-lg font-normal text-gray-800 mb-4">Farmers Details</h4>
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
