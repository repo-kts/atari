import React, { useCallback, useMemo } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput, FormTextArea, FormSelect, FormSection } from '../shared/FormComponents'
import { useYears } from '@/hooks/useOtherMastersData'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { createMasterDataOptions } from '@/utils/formHelpers'
import { X } from 'lucide-react'

interface MeetingFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

// Yes/No options
const YES_NO_OPTIONS = [
    { value: 'YES', label: 'Yes' },
    { value: 'NO', label: 'No' },
]

export const MeetingForms: React.FC<MeetingFormsProps> = ({
    entityType,
    formData,
    setFormData,
}) => {
    const { data: years = [], isLoading: isLoadingYears } = useYears()

    const yearOptions = useMemo(
        () => createMasterDataOptions(years, 'reportingYear', 'yearName'),
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
            const dateVal = e.target.value ? new Date(e.target.value).toISOString() : null
            setFormData({ ...formData, [field]: dateVal })
        },
        [formData, setFormData]
    )

    const handleYearChange = useCallback(
        (value: string | number) => {
            setFormData({ ...formData, reportingYear: value })
        },
        [formData, setFormData]
    )

    const handleFileChange = useCallback(
        (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (files && files.length > 0) {
                // Strict image-only validation for SAC meetings section if applicable
                if (entityType === ENTITY_TYPES.MISC_MEETINGS_SAC) {
                    const hasNonImage = Array.from(files).some(file => !file.type.startsWith('image/'));
                    if (hasNonImage) {
                        alert('Only image files are allowed for SAC meetings.');
                        e.target.value = ''; // Reset input
                        return;
                    }
                }

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
        },
        [formData, setFormData, entityType]
    )

    const removePhoto = (field: string, index: number) => {
        const existingPhotos = Array.isArray(formData[field]) ? [...formData[field]] : [];
        existingPhotos.splice(index, 1);
        setFormData({
            ...formData,
            [field]: existingPhotos
        });
    };

    const updateCaption = (field: string, index: number, caption: string) => {
        const existingPhotos = Array.isArray(formData[field]) ? [...formData[field]] : [];
        if (existingPhotos[index]) {
            existingPhotos[index] = { ...existingPhotos[index], caption };
            setFormData({
                ...formData,
                [field]: existingPhotos
            });
        }
    };

    const renderPhotoFields = (field: string) => (
        <FormSection title="Photographs" className="col-span-1 mt-2" noGrid={true}>
            <FormInput
                label=""
                required={!Array.isArray(formData[field]) || formData[field].length === 0}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange(field)}
                helperText="Only images allowed. Uploading new files will be added to the list. Only the first image uploaded will appear in the table. (Max 5MB per file)"
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
                                        className="w-full text-[11px] font-bold bg-transparent border-none focus:ring-0 px-1 py-0 outline-none transition-all placeholder:text-gray-300 text-gray-700 min-h-[2.5rem] resize-none"
                                        value={item.caption || ''}
                                        onChange={(e) => updateCaption(field, idx, e.target.value)}
                                        rows={2}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </FormSection>
    );

    // Normalize incoming photographs data when editing
    React.useEffect(() => {
        // SAC Meetings use sacMeetingId
        if (!formData.id && !formData.sacMeetingId) return;

        const photoFields = ['uploadedFile'];
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
                            .filter((item: any) => item && (typeof item === 'string' || item.image || item.preview || item.url || item.file))
                            .map((item: any) => {
                                if (typeof item === 'string') return { preview: item, image: item, caption: '' };
                                const url = item.image || item.file || item.url || item.path || item.preview || '';
                                return { preview: url, image: url, caption: item.caption || '' };
                            });
                        hasChanges = true;
                    } catch (e) {
                        console.error('Photo parsing error:', e);
                    }
                } else if (rawValue.trim() !== '') {
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
    }, [formData.id, formData.sacMeetingId, formData.entityType, setFormData]);

    if (!entityType) return null

    const getDateValue = (d: any) => {
        if (!d) return ''
        try {
            return new Date(d).toISOString().split('T')[0]
        } catch {
            return ''
        }
    }

    return (
        <div className="space-y-4">
            {/* 1. Create Details of Scientific Advisory Committee(SAC) Meetings */}
            {entityType === ENTITY_TYPES.MISC_MEETINGS_SAC && (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="Start Date"
                            required
                            type="date"
                            value={getDateValue(formData.startDate)}
                            onChange={handleDateChange('startDate')}
                        />

                        <FormInput
                            label="End Date"
                            required
                            type="date"
                            value={getDateValue(formData.endDate)}
                            onChange={handleDateChange('endDate')}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="No of Participants"
                            required
                            type="number"
                            value={formData.numberOfParticipants || ''}
                            onChange={handleNumberChange('numberOfParticipants')}
                            placeholder="Enter number"
                        />

                        <FormInput
                            label="Total Statutory Members Present (State Line Department)"
                            required
                            type="number"
                            value={formData.statutoryMembersPresent || ''}
                            onChange={handleNumberChange('statutoryMembersPresent')}
                            placeholder="Enter number"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-3">
                            <FormTextArea
                                label="Salient Recommendations"
                                required
                                value={formData.salientRecommendations || ''}
                                onChange={handleFieldChange('salientRecommendations')}
                                rows={4}
                                placeholder="Enter recommendations"
                            />

                            <FormInput
                                label="Reason"
                                required
                                value={formData.reason || ''}
                                onChange={handleFieldChange('reason')}
                                placeholder="Enter reason"
                            />
                        </div>

                        <div className="space-y-3">
                            <FormSelect
                                label="Action Taken"
                                required
                                value={formData.actionTaken || ''}
                                onChange={handleFieldChange('actionTaken')}
                                options={YES_NO_OPTIONS}
                                placeholder="Select"
                            />

                            {renderPhotoFields('uploadedFile')}
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Create Details of Other Meeting Related to ATARI */}
            {entityType === ENTITY_TYPES.MISC_MEETINGS_OTHER && (
                <div className="space-y-3">
                    <MasterDataDropdown
                        label="Reporting Year"
                        required
                        value={formData.reportingYear || ''}
                        onChange={handleYearChange}
                        options={yearOptions}
                        isLoading={isLoadingYears}
                        emptyMessage="No reporting years available"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormInput
                            label="Meeting Date"
                            required
                            type="date"
                            value={getDateValue(formData.meetingDate)}
                            onChange={handleDateChange('meetingDate')}
                        />

                        <FormInput
                            label="Type of Meeting"
                            required
                            value={formData.typeOfMeeting || ''}
                            onChange={handleFieldChange('typeOfMeeting')}
                            placeholder="Enter meeting type"
                        />
                    </div>

                    <FormInput
                        label="Agenda"
                        required
                        value={formData.agenda || ''}
                        onChange={handleFieldChange('agenda')}
                        placeholder="Enter agenda"
                    />

                    <FormInput
                        label="Representative from ATARI"
                        required
                        value={formData.representativeFromAtari || ''}
                        onChange={handleFieldChange('representativeFromAtari')}
                        placeholder="Enter representative name"
                    />
                </div>
            )}
        </div>
    )
}
