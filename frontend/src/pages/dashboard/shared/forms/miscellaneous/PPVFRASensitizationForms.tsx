import React, { useCallback, useMemo } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput, FormSection } from '../shared/FormComponents'
import { useYears } from '@/hooks/useOtherMastersData'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { createMasterDataOptions } from '@/utils/formHelpers'

interface PPVFRASensitizationFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

export const PPVFRASensitizationForms: React.FC<PPVFRASensitizationFormsProps> = ({
    entityType,
    formData,
    setFormData,
}) => {
    const { data: years = [], isLoading: isLoadingYears } = useYears()

    const yearOptions = useMemo(
        () => {
            // For Plant Varieties, we might want the year name/value if the backend expects an Int (parseInt will handle "2023-24" as 2023)
            // But usually IDs are preferred if relations exist. Since no relation here, let's keep IDs but be mindful.
            return createMasterDataOptions(years, 'yearId', 'yearName')
        },
        [years]
    )

    const handleFieldChange = useCallback(
        (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const value = e.target.value
            setFormData({ ...formData, [field]: value })
        },
        [formData, setFormData]
    )

    const handleNumberChange = useCallback(
        (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value === '' ? '' : parseInt(e.target.value)
            setFormData({ ...formData, [field]: value })
        },
        [formData, setFormData]
    )

    const handleDateChange = useCallback(
        (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setFormData({ ...formData, [field]: value ? new Date(value).toISOString() : null })
        },
        [formData, setFormData]
    )


    const handleFileChange = useCallback(
        (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData({ ...formData, [field]: e.target.files })
        },
        [formData, setFormData]
    )

    if (!entityType) return null

    return (
        <div className="space-y-4">
            {/* 1. PPV & FRA Sensitization training Programme */}
            {entityType === ENTITY_TYPES.MISC_PPV_FRA_TRAINING && (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="Date of Training/Awareness Programme"
                            required
                            type="date"
                            value={formData.programmeDate ? new Date(formData.programmeDate).toISOString().split('T')[0] : ''}
                            onChange={handleDateChange('programmeDate')}
                        />

                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-gray-700">Type <span className="text-red-500">*</span></label>
                            <select
                                className="w-full px-4 py-2 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all bg-white"
                                value={formData.type || ''}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                required
                            >
                                <option value="">Select Type</option>
                                <option value="TRAINING">TRAINING</option>
                                <option value="AWARENESS">AWARENESS</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="Title"
                            required
                            value={formData.title || ''}
                            onChange={handleFieldChange('title')}
                            placeholder="Enter title"
                        />

                        <FormInput
                            label="Venue"
                            required
                            value={formData.venue || ''}
                            onChange={handleFieldChange('venue')}
                            placeholder="Enter venue"
                        />
                    </div>

                    <FormInput
                        label="Resource Person"
                        required
                        value={formData.resourcePerson || ''}
                        onChange={handleFieldChange('resourcePerson')}
                        placeholder="Enter resource person"
                    />

                    <FormSection title="No. of the Participant">
                        <FormInput
                            label="General_M"
                            required
                            type="number"
                            value={formData.generalM || ''}
                            onChange={handleNumberChange('generalM')}
                            placeholder="0"
                        />

                        <FormInput
                            label="General_F"
                            required
                            type="number"
                            value={formData.generalF || ''}
                            onChange={handleNumberChange('generalF')}
                            placeholder="0"
                        />

                        <FormInput
                            label="OBC_M"
                            required
                            type="number"
                            value={formData.obcM || ''}
                            onChange={handleNumberChange('obcM')}
                            placeholder="0"
                        />

                        <FormInput
                            label="OBC_F"
                            required
                            type="number"
                            value={formData.obcF || ''}
                            onChange={handleNumberChange('obcF')}
                            placeholder="0"
                        />

                        <FormInput
                            label="SC_M"
                            required
                            type="number"
                            value={formData.scM || ''}
                            onChange={handleNumberChange('scM')}
                            placeholder="0"
                        />

                        <FormInput
                            label="SC_F"
                            required
                            type="number"
                            value={formData.scF || ''}
                            onChange={handleNumberChange('scF')}
                            placeholder="0"
                        />

                        <FormInput
                            label="ST_M"
                            required
                            type="number"
                            value={formData.stM || ''}
                            onChange={handleNumberChange('stM')}
                            placeholder="0"
                        />

                        <FormInput
                            label="ST_F"
                            required
                            type="number"
                            value={formData.stF || ''}
                            onChange={handleNumberChange('stF')}
                            placeholder="0"
                        />
                    </FormSection>
                </div>
            )}

            {/* 2. PPV & FRA Sensitization Farmer Details */}
            {entityType === ENTITY_TYPES.MISC_PPV_FRA_PLANT_VARIETIES && (
                <div className="space-y-3">
                    <MasterDataDropdown
                        label="Reporting Year"
                        required
                        value={formData.reportingYearId || formData.yearId || formData.reportingYear || ''}
                        onChange={(val) => {
                            const selectedYear = years.find(y => y.yearId === val || y.yearName === val);
                            setFormData({
                                ...formData,
                                reportingYearId: val,
                                yearId: val,
                                reportingYear: selectedYear ? (parseInt(selectedYear.yearName) || val) : val
                            });
                        }}
                        options={yearOptions}
                        isLoading={isLoadingYears}
                        emptyMessage="No reporting years available"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="Name of Crop Registered"
                            required
                            value={formData.cropName || ''}
                            onChange={handleFieldChange('cropName')}
                            placeholder="Enter crop name"
                        />

                        <FormInput
                            label="Farmer Name"
                            required
                            value={formData.farmerName || ''}
                            onChange={handleFieldChange('farmerName')}
                            placeholder="Enter farmer name"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <FormInput
                            label="Mobile No."
                            required
                            value={formData.mobile || ''}
                            onChange={handleFieldChange('mobile')}
                            placeholder="Enter mobile number"
                        />

                        <FormInput
                            label="Village"
                            required
                            value={formData.village || ''}
                            onChange={handleFieldChange('village')}
                            placeholder="Enter village"
                        />

                        <FormInput
                            label="Block"
                            required
                            value={formData.block || ''}
                            onChange={handleFieldChange('block')}
                            placeholder="Enter block"
                        />
                    </div>

                    <FormInput
                        label="District"
                        required
                        value={formData.district || ''}
                        onChange={handleFieldChange('district')}
                        placeholder="Enter district"
                    />

                    <FormInput
                        label="Characteristics"
                        required
                        value={formData.characteristics || ''}
                        onChange={handleFieldChange('characteristics')}
                        placeholder="Enter characteristics"
                    />

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            Images
                        </label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange('images')}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-[#487749]/10 file:text-[#487749] hover:file:bg-[#487749]/20 transition-all border border-[#E0E0E0] rounded-xl p-2"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
