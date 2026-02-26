import React from 'react'
import { ENTITY_TYPES } from '../../../../../constants/entityTypes'
import { FormInput, FormSelect } from '../shared/FormComponents'

interface NicraFormsProps {
    entityType: string
    formData: any
    setFormData: (data: any) => void
    years: any[]
    seasons?: any[]
    categories?: any[]
    subCategories?: any[]
}

export const NicraForms: React.FC<NicraFormsProps> = ({
    entityType,
    formData,
    setFormData,
    years,
    seasons = [],
    categories = [],
    subCategories = []
}) => {
    return (
        <>
            {entityType === ENTITY_TYPES.PROJECT_NICRA_BASIC && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Month & Year"
                            required
                            type="month"
                            value={formData.monthYear || ''}
                            onChange={(e) => setFormData({ ...formData, monthYear: e.target.value })}
                        />
                        <div /> {/* Empty space for layout matching */}
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800">RF (mm) district</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormInput
                                label="Normal"
                                required
                                type="number"
                                value={formData.rfNormal || ''}
                                onChange={(e) => setFormData({ ...formData, rfNormal: e.target.value })}
                            />
                            <FormInput
                                label="Received"
                                required
                                type="number"
                                value={formData.rfReceived || ''}
                                onChange={(e) => setFormData({ ...formData, rfReceived: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800">Temperature OC</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormInput
                                label="Max."
                                required
                                type="number"
                                value={formData.tempMax || ''}
                                onChange={(e) => setFormData({ ...formData, tempMax: e.target.value })}
                            />
                            <FormInput
                                label="Min."
                                required
                                type="number"
                                value={formData.tempMin || ''}
                                onChange={(e) => setFormData({ ...formData, tempMin: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800">Dry spell/ drought</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormInput
                                label="> 10 days"
                                required
                                type="number"
                                value={formData.dry10 || ''}
                                onChange={(e) => setFormData({ ...formData, dry10: e.target.value })}
                            />
                            <FormInput
                                label="> 15 days"
                                required
                                type="number"
                                value={formData.dry15 || ''}
                                onChange={(e) => setFormData({ ...formData, dry15: e.target.value })}
                            />
                            <FormInput
                                label="> 20 days"
                                required
                                type="number"
                                value={formData.dry20 || ''}
                                onChange={(e) => setFormData({ ...formData, dry20: e.target.value })}
                            />
                            <FormInput
                                label="Intensive rain > 60 mm"
                                required
                                type="number"
                                value={formData.intensiveRain || ''}
                                onChange={(e) => setFormData({ ...formData, intensiveRain: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Water depth (cm)"
                            required
                            type="number"
                            value={formData.waterDepth || ''}
                            onChange={(e) => setFormData({ ...formData, waterDepth: e.target.value })}
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
                    </div>
                </div>
            )}
            {entityType === ENTITY_TYPES.PROJECT_NICRA_DETAILS && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormSelect
                            label="Reporting Year"
                            required
                            value={formData.yearId || ''}
                            onChange={(e) => setFormData({ ...formData, yearId: parseInt(e.target.value) })}
                            options={years.map((y: any) => ({ value: String(y.id || y.yearId), label: y.yearName || y.year || y.name }))}
                        />
                        <FormSelect
                            label="Category"
                            required
                            value={formData.categoryId || ''}
                            onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                            options={categories.map((c: any) => ({ value: c.id || c.categoryId, label: c.categoryName }))}
                        />
                        <FormSelect
                            label="Sub - Category"
                            required
                            value={formData.subCategoryId || ''}
                            onChange={(e) => setFormData({ ...formData, subCategoryId: parseInt(e.target.value) })}
                            options={subCategories
                                .filter((sc: any) => sc.categoryId === formData.categoryId)
                                .map((sc: any) => ({ value: sc.id || sc.subCategoryId, label: sc.subCategoryName }))}
                            placeholder={formData.categoryId ? "Select" : "No subcategories available"}
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
                            value={formData.seasonId || ''}
                            onChange={(e) => setFormData({ ...formData, seasonId: parseInt(e.target.value) })}
                            options={seasons.map((s: any) => ({ value: s.seasonId, label: s.seasonName }))}
                            placeholder="Please select"
                        />
                        <FormSelect
                            label="Month"
                            required
                            value={formData.month || ''}
                            onChange={(e) => setFormData({ ...formData, month: e.target.value })}
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
                        />
                        <FormInput
                            label="Technology demonstrated"
                            required
                            value={formData.technologyDemonstrated || ''}
                            onChange={(e) => setFormData({ ...formData, technologyDemonstrated: e.target.value })}
                        />
                        <FormInput
                            label="Area (ha)/ Unit"
                            required
                            value={formData.areaOrUnit || ''}
                            onChange={(e) => setFormData({ ...formData, areaOrUnit: e.target.value })}
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

                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800">Farmers Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 divide-x divide-gray-100">
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
                        <h3 className="text-xl font-semibold text-gray-800">Economics of demonstration (Rs/ha)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <FormInput
                                label="Gross Cost"
                                required
                                type="number"
                                value={formData.grossCost || ''}
                                onChange={(e) => setFormData({ ...formData, grossCost: e.target.value })}
                            />
                            <FormInput
                                label="Gross Return"
                                required
                                type="number"
                                value={formData.grossReturn || ''}
                                onChange={(e) => setFormData({ ...formData, grossReturn: e.target.value })}
                            />
                            <FormInput
                                label="Net return"
                                required
                                type="number"
                                value={formData.netReturn || ''}
                                onChange={(e) => setFormData({ ...formData, netReturn: e.target.value })}
                            />
                            <FormInput
                                label="BCR ration"
                                required
                                type="number"
                                step="0.01"
                                value={formData.bcrRatio || ''}
                                onChange={(e) => setFormData({ ...formData, bcrRatio: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Photographs"
                            type="file"
                            multiple
                            onChange={(e) => setFormData({ ...formData, photographs: e.target.files })}
                        />
                        <FormInput
                            label="Upload File"
                            type="file"
                            onChange={(e) => setFormData({ ...formData, uploadFile: e.target.files?.[0] })}
                        />
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_NICRA_TRAINING && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                            onChange={(e) => setFormData({ ...formData, campusType: e.target.value })}
                            options={[
                                { value: 'On Campus', label: 'On Campus' },
                                { value: 'Off Campus', label: 'Off Campus' }
                            ]}
                            placeholder="Select"
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
                            label="Remark"
                            required
                            value={formData.remark || ''}
                            onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                        />
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800">Farmers Details</h3>
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
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_NICRA_EXTENSION && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FormInput
                            label="Activity Name"
                            required
                            value={formData.activityName || ''}
                            onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
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
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FormInput
                            label="Venue"
                            required
                            value={formData.venue || ''}
                            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                        />
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800">Farmers Details</h3>
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
                </div>
            )}
        </>
    )
}
