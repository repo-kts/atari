import React from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { FormInput, FormSelect } from '../shared/FormComponents'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { createMasterDataOptions } from '@/utils/formHelpers'

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
                        <MasterDataDropdown
                            label="Reporting Year"
                            required
                            value={formData.reportingYearId || formData.yearId || ''}
                            onChange={(value) => setFormData({ ...formData, reportingYearId: value, yearId: value })}
                            options={createMasterDataOptions(years, 'yearId', 'yearName')}
                            emptyMessage="No reporting years available"
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
                        <MasterDataDropdown
                            label="Season"
                            required
                            value={formData.seasonId || ''}
                            onChange={(value) => setFormData({ ...formData, seasonId: value })}
                            options={createMasterDataOptions(seasons, 'seasonId', 'seasonName')}
                            emptyMessage="No seasons available"
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
                                { value: 'ON_CAMPUS', label: 'On Campus' },
                                { value: 'OFF_CAMPUS', label: 'Off Campus' }
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

            {entityType === ENTITY_TYPES.PROJECT_NICRA_INTERVENTION && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Start Date"
                            required
                            type="date"
                            value={formData.startDate || ''}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                        <FormInput
                            label="End date"
                            required
                            type="date"
                            value={formData.endDate || ''}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                        <FormSelect
                            label="Seed bank/Fodder bank"
                            required
                            value={formData.seedBankFodderBank || ''}
                            onChange={(e) => setFormData({ ...formData, seedBankFodderBank: e.target.value })}
                            options={[
                                { value: 'SeedBank', label: 'Seed bank' },
                                { value: 'FodderBank', label: 'Fodder bank' }
                            ]}
                            placeholder="Select"
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
                        <FormInput
                            label="Quantity in (q)"
                            required
                            type="number"
                            value={formData.quantityQ || ''}
                            onChange={(e) => setFormData({ ...formData, quantityQ: e.target.value })}
                        />
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_NICRA_REVENUE && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <MasterDataDropdown
                            label="Year"
                            required
                            value={formData.reportingYearId || formData.yearId || ''}
                            onChange={(value) => setFormData({ ...formData, reportingYearId: value, yearId: value })}
                            options={createMasterDataOptions(years, 'yearId', 'yearName')}
                            emptyMessage="No reporting years available"
                        />
                        <FormInput
                            label="Revenue"
                            required
                            type="number"
                            value={formData.revenue || ''}
                            onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                        />
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_NICRA_CUSTOM_HIRING && (
                <div className="space-y-10">
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
                            label="Name of farm implement/ equipment"
                            required
                            value={formData.nameOfFarmImplement || ''}
                            onChange={(e) => setFormData({ ...formData, nameOfFarmImplement: e.target.value })}
                        />
                        <FormInput
                            label="Area covered by Farm Implement"
                            required
                            type="number"
                            value={formData.areaCovered || ''}
                            onChange={(e) => setFormData({ ...formData, areaCovered: e.target.value })}
                        />
                        <FormInput
                            label="Farm Implement used (In Hours)"
                            required
                            type="number"
                            value={formData.farmImplementUsedHours || ''}
                            onChange={(e) => setFormData({ ...formData, farmImplementUsedHours: e.target.value })}
                        />
                        <FormInput
                            label="Revenue generated by Farm Implement (Rs.)"
                            required
                            type="number"
                            value={formData.revenueGeneratedRs || ''}
                            onChange={(e) => setFormData({ ...formData, revenueGeneratedRs: e.target.value })}
                        />
                        <FormInput
                            label="Expenditure Incurred on repairing (Rs.)"
                            required
                            type="number"
                            value={formData.expenditureIncurredRepairingRs || ''}
                            onChange={(e) => setFormData({ ...formData, expenditureIncurredRepairingRs: e.target.value })}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Photographs"
                            type="file"
                            multiple
                            onChange={(e) => setFormData({ ...formData, photographs: e.target.files })}
                        />
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_NICRA_VCRMC && (
                <div className="space-y-10">
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
                            label="Village name"
                            required
                            value={formData.villageName || ''}
                            onChange={(e) => setFormData({ ...formData, villageName: e.target.value })}
                        />
                        <FormInput
                            label="Constitution Date"
                            required
                            type="date"
                            value={formData.constitutionDate || ''}
                            onChange={(e) => setFormData({ ...formData, constitutionDate: e.target.value })}
                        />
                        <FormInput
                            label="Meetings organized by VCRMC (no.)"
                            required
                            type="number"
                            value={formData.meetingsOrganized || ''}
                            onChange={(e) => setFormData({ ...formData, meetingsOrganized: e.target.value })}
                        />
                        <FormInput
                            label="Meeting Date"
                            required
                            type="date"
                            value={formData.meetingDate || ''}
                            onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                        />
                        <FormInput
                            label="Name of Secretary"
                            required
                            value={formData.nameOfSecretary || ''}
                            onChange={(e) => setFormData({ ...formData, nameOfSecretary: e.target.value })}
                        />
                        <FormInput
                            label="Name of President"
                            required
                            value={formData.nameOfPresident || ''}
                            onChange={(e) => setFormData({ ...formData, nameOfPresident: e.target.value })}
                        />
                        <FormInput
                            label="Major decision taken"
                            required
                            value={formData.majorDecisionTaken || ''}
                            onChange={(e) => setFormData({ ...formData, majorDecisionTaken: e.target.value })}
                        />
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800">VCRMC members (no.)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormInput
                                label="Male"
                                required
                                type="number"
                                value={formData.maleMembers || ''}
                                onChange={(e) => setFormData({ ...formData, maleMembers: e.target.value })}
                            />
                            <FormInput
                                label="Female"
                                required
                                type="number"
                                value={formData.femaleMembers || ''}
                                onChange={(e) => setFormData({ ...formData, femaleMembers: e.target.value })}
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
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_NICRA_SOIL_HEALTH && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                            label="No. of Soil Samples Collected"
                            required
                            type="number"
                            value={formData.noOfSoilSamplesCollected || ''}
                            onChange={(e) => setFormData({ ...formData, noOfSoilSamplesCollected: e.target.value })}
                        />
                        <FormInput
                            label="No. of Samples Analysed"
                            required
                            type="number"
                            value={formData.noOfSamplesAnalysed || ''}
                            onChange={(e) => setFormData({ ...formData, noOfSamplesAnalysed: e.target.value })}
                        />
                        <FormInput
                            label="SHC Issued"
                            required
                            type="number"
                            value={formData.shcIssued || ''}
                            onChange={(e) => setFormData({ ...formData, shcIssued: e.target.value })}
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

            {entityType === ENTITY_TYPES.PROJECT_NICRA_CONVERGENCE && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                            label="Development Scheme/Programme"
                            required
                            value={formData.developmentSchemeProgramme || ''}
                            onChange={(e) => setFormData({ ...formData, developmentSchemeProgramme: e.target.value })}
                        />
                        <FormInput
                            label="Nature of work"
                            required
                            value={formData.natureOfWork || ''}
                            onChange={(e) => setFormData({ ...formData, natureOfWork: e.target.value })}
                        />
                        <FormInput
                            label="Amount (Rs)"
                            required
                            type="number"
                            value={formData.amountRs || ''}
                            onChange={(e) => setFormData({ ...formData, amountRs: e.target.value })}
                        />
                        <FormInput
                            label="Photographs"
                            type="file"
                            multiple
                            onChange={(e) => setFormData({ ...formData, photographs: e.target.files })}
                        />
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_NICRA_DIGNITARIES && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Date of Visit"
                            required
                            type="date"
                            value={formData.dateOfVisit || ''}
                            onChange={(e) => setFormData({ ...formData, dateOfVisit: e.target.value })}
                        />
                        <FormSelect
                            label="Type"
                            required
                            value={formData.type || ''}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            options={[
                                { value: 'VIP', label: 'VIP' },
                                { value: 'Expert', label: 'Expert' }
                                // { value: 'SAU', label: 'SAU' },
                                // { value: 'StateDept', label: 'State Department' },
                                // { value: 'Others', label: 'Others' }
                            ]}
                            placeholder="Select"
                        />
                        <FormInput
                            label="Name"
                            required
                            value={formData.name || ''}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <FormInput
                            label="Remark"
                            required
                            value={formData.remark || ''}
                            onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                        />
                        <FormInput
                            label="Photographs"
                            type="file"
                            multiple
                            onChange={(e) => setFormData({ ...formData, photographs: e.target.files })}
                        />
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_NICRA_PI_COPI && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                            label="Type"
                            required
                            value={formData.type || ''}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            options={[
                                { value: 'PI', label: 'PI' },
                                { value: 'CO-PI', label: 'CO-PI' }
                            ]}
                            placeholder="Select"
                        />
                        <FormInput
                            label="Name"
                            required
                            value={formData.name || ''}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                </div>
            )}
        </>
    )
}
