import React, { useCallback, useMemo } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput, FormSection } from '../shared/FormComponents'
import { useFileHandling } from '@/hooks/useFileHandling'
import { useYears, usePpvFraTrainingTypes } from '@/hooks/useOtherMastersData'
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
    const { handleFileChange } = useFileHandling(formData, setFormData)
    const { data: years = [], isLoading: isLoadingYears } = useYears()
    const { data: trainingTypes = [], isLoading: isLoadingTypes } = usePpvFraTrainingTypes()

    const yearOptions = useMemo(
        () => {
            // For Plant Varieties, we might want the year name/value if the backend expects an Int (parseInt will handle "2023-24" as 2023)
            // But usually IDs are preferred if relations exist. Since no relation here, let's keep IDs but be mindful.
            return createMasterDataOptions(years, 'reportingYear', 'yearName')
        },
        [years]
    )

    const trainingTypeOptions = useMemo(
        () => createMasterDataOptions(trainingTypes, 'typeId', 'typeName'),
        [trainingTypes]
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


    const handleFileChangeLocal = useCallback(
        (field: string, multiple: boolean = false) => (e: React.ChangeEvent<HTMLInputElement>) => {
            handleFileChange(field, multiple)(e)
            // If the field is 'image', also update the 'image' property which is used in the repository
            if (field === 'images') {
                const file = e.target.files?.[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setFormData({ ...formData, image: reader.result as string });
                    };
                    reader.readAsDataURL(file);
                }
            }
        },
        [handleFileChange, formData, setFormData]
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

                        <MasterDataDropdown
                            label="Type"
                            required
                            value={formData.typeId ?? ''}
                            onChange={(val) => setFormData({ ...formData, typeId: val })}
                            options={trainingTypeOptions}
                            isLoading={isLoadingTypes}
                            emptyMessage="No training types available"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="Title"
                            required
                            value={formData.title ?? ''}
                            onChange={handleFieldChange('title')}
                            placeholder="Enter title"
                        />

                        <FormInput
                            label="Venue"
                            required
                            value={formData.venue ?? ''}
                            onChange={handleFieldChange('venue')}
                            placeholder="Enter venue"
                        />
                    </div>

                    <FormInput
                        label="Resource Person"
                        required
                        value={formData.resourcePerson ?? ''}
                        onChange={handleFieldChange('resourcePerson')}
                        placeholder="Enter resource person"
                    />

                    <FormSection title="No. of the Participant">
                        <FormInput
                            label="General_M"
                            required
                            type="number"
                            value={formData.generalM ?? ''}
                            onChange={handleNumberChange('generalM')}
                            placeholder="0"
                        />

                        <FormInput
                            label="General_F"
                            required
                            type="number"
                            value={formData.generalF ?? ''}
                            onChange={handleNumberChange('generalF')}
                            placeholder="0"
                        />

                        <FormInput
                            label="OBC_M"
                            required
                            type="number"
                            value={formData.obcM ?? ''}
                            onChange={handleNumberChange('obcM')}
                            placeholder="0"
                        />

                        <FormInput
                            label="OBC_F"
                            required
                            type="number"
                            value={formData.obcF ?? ''}
                            onChange={handleNumberChange('obcF')}
                            placeholder="0"
                        />

                        <FormInput
                            label="SC_M"
                            required
                            type="number"
                            value={formData.scM ?? ''}
                            onChange={handleNumberChange('scM')}
                            placeholder="0"
                        />

                        <FormInput
                            label="SC_F"
                            required
                            type="number"
                            value={formData.scF ?? ''}
                            onChange={handleNumberChange('scF')}
                            placeholder="0"
                        />

                        <FormInput
                            label="ST_M"
                            required
                            type="number"
                            value={formData.stM ?? ''}
                            onChange={handleNumberChange('stM')}
                            placeholder="0"
                        />

                        <FormInput
                            label="ST_F"
                            required
                            type="number"
                            value={formData.stF ?? ''}
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
                        value={formData.reportingYear ?? ''}
                        onChange={(val) => {
                            const selectedYear = years.find(y => y.reportingYear === val || y.yearName === val);
                            setFormData({
                                ...formData,
                                reportingYear: selectedYear ? (selectedYear.reportingYear || val) : val
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
                            value={formData.cropName ?? ''}
                            onChange={handleFieldChange('cropName')}
                            placeholder="Enter crop name"
                        />

                        <FormInput
                            label="Farmer Name"
                            required
                            value={formData.farmerName ?? ''}
                            onChange={handleFieldChange('farmerName')}
                            placeholder="Enter farmer name"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <FormInput
                            label="Mobile No."
                            required
                            value={formData.mobile ?? ''}
                            onChange={handleFieldChange('mobile')}
                            placeholder="Enter mobile number"
                        />

                        <FormInput
                            label="Village"
                            required
                            value={formData.village ?? ''}
                            onChange={handleFieldChange('village')}
                            placeholder="Enter village"
                        />

                        <FormInput
                            label="Block"
                            required
                            value={formData.block ?? ''}
                            onChange={handleFieldChange('block')}
                            placeholder="Enter block"
                        />
                    </div>

                    <FormInput
                        label="District"
                        required
                        value={formData.district ?? ''}
                        onChange={handleFieldChange('district')}
                        placeholder="Enter district"
                    />

                    <FormInput
                        label="Characteristics"
                        required
                        value={formData.characteristics ?? ''}
                        onChange={handleFieldChange('characteristics')}
                        placeholder="Enter characteristics"
                    />

                    <div className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-700">
                            Images
                        </label>

                        {(formData.image || formData.images) && (
                            <div className="flex flex-wrap gap-3 mb-4 p-4 border border-dashed border-[#487749]/30 rounded-2xl bg-[#487749]/5">
                                {(() => {
                                    try {
                                        const imageData = formData.image || formData.images;
                                        const images = typeof imageData === 'string'
                                            ? (imageData.startsWith('[') ? JSON.parse(imageData) : [imageData])
                                            : [];
                                        return images.map((img: string, idx: number) => (
                                            <div key={idx} className="relative group">
                                                <img
                                                    src={img}
                                                    className="h-24 w-auto object-cover rounded-xl shadow-md border-2 border-white hover:scale-105 transition-transform duration-300"
                                                    alt={`Preview ${idx + 1}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newImages = images.filter((_: any, i: number) => i !== idx);
                                                        const newValue = newImages.length === 0 ? null : (newImages.length === 1 ? newImages[0] : JSON.stringify(newImages));
                                                        setFormData({
                                                            ...formData,
                                                            image: newValue,
                                                            images: null // Clear the file objects
                                                        });
                                                    }}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ));
                                    } catch { return null; }
                                })()}
                            </div>
                        )}

                        <div className="relative group">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileChangeLocal('images', true)}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#487749] file:text-white hover:file:bg-[#3d633e] transition-all border-2 border-dashed border-[#E0E0E0] group-hover:border-[#487749]/50 rounded-2xl p-2 bg-gray-50/50"
                            />
                            <p className="mt-2 text-[10px] text-gray-500">
                                Max 2MB per file. (Optional)
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
