import React, { useMemo, useCallback, useEffect } from 'react'
import { X } from 'lucide-react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput, FormSection } from './shared/FormComponents'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { useAuth } from '@/contexts/AuthContext'
import { useYears } from '@/hooks/useOtherMastersData'
import { useKvkEmployees } from '@/hooks/forms/useAboutKvkData'
import { createMasterDataOptions, createStaffOptions } from '@/utils/formHelpers'

interface AwardRecognitionProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

export const AwardRecognition: React.FC<AwardRecognitionProps> = ({
    entityType,
    formData,
    setFormData,
}) => {
    const { user } = useAuth()
    const { data: years = [], isLoading: isLoadingYears } = useYears()
    const activeKvkId = formData.kvkId || user?.kvkId
    const { data: employees = [], isLoading: isLoadingEmployees } = useKvkEmployees({ kvkId: activeKvkId })

    // Memoized options for Year dropdown
    const yearOptions = useMemo(
        () => createMasterDataOptions(years, 'reportingYear', 'yearName'),
        [years]
    )

    // Memoized options for Scientist/Employee dropdown - using API data only
    const scientistOptions = useMemo(() => {
        if (!employees || employees.length === 0) {
            return []
        }

        // Filter out invalid entries
        const excludedNames = ['dsfo', 'Dr. Anil Kumar Ravi']
        const validEmployees = employees.filter(
            (emp: any) =>
                emp.staffName &&
                emp.staffName !== 'undefined' &&
                !excludedNames.includes(emp.staffName)
        )

        // Use createStaffOptions for consistent formatting
        return createStaffOptions(validEmployees)
    }, [employees])

    // Automatically sync kvkId from user session if it's missing in formData
    useEffect(() => {
        if (user?.kvkId && !formData.kvkId && !formData.id) {
            setFormData((prev: any) => ({ ...prev, kvkId: user.kvkId }))
        }
    }, [user?.kvkId, formData.kvkId, formData.id, setFormData])

    // Sync scientistName to staffId for edit mode compatibility (Scientist Awards)
    useEffect(() => {
        if (entityType === ENTITY_TYPES.ACHIEVEMENT_AWARD_SCIENTIST && employees && employees.length > 0) {
            // If we have scientistName but no staffId, try to find matching staff
            if (formData.scientistName && !formData.staffId) {
                // Find staff by name (case-insensitive)
                const matchingStaff = employees.find((emp: any) =>
                    emp.staffName &&
                    emp.staffName.toLowerCase() === formData.scientistName.toLowerCase()
                );
                if (matchingStaff) {
                    setFormData((prev: any) => ({
                        ...prev,
                        staffId: matchingStaff.kvkStaffId,
                        scientistName: matchingStaff.staffName
                    }));
                }
            }
        }
    }, [formData.scientistName, formData.staffId, entityType, employees, setFormData])

    // Optimized onChange handlers using useCallback with functional updates
    const handleYearChange = useCallback(
        (value: string | number) => {
            setFormData((prev: any) => {
                const selectedYear = years.find((y: any) => y.reportingYear === value)
                return {
                    ...prev,
                    reportingYear: selectedYear?.reportingYear || value,
                    yearName: selectedYear?.yearName || '',
                }
            })
        },
        [setFormData, years]
    )

    const handleScientistChange = useCallback(
        (value: string | number) => {
            setFormData((prev: any) => {
                const selectedEmployee = employees.find(
                    (emp: any) => emp.kvkStaffId === value || emp.staffName === value
                )
                return {
                    ...prev,
                    scientistName: selectedEmployee?.staffName || value,
                    staffId: selectedEmployee?.kvkStaffId || value,
                }
            })
        },
        [setFormData, employees]
    )

    // Optimized input change handlers using functional updates
    const handleAwardNameChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData((prev: any) => ({ ...prev, awardName: e.target.value }))
        },
        [setFormData]
    )

    const handleAmountChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData((prev: any) => ({ ...prev, amount: e.target.value }))
        },
        [setFormData]
    )

    const handleAchievementChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData((prev: any) => ({ ...prev, achievement: e.target.value }))
        },
        [setFormData]
    )

    const handleConferringAuthorityChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData((prev: any) => ({ ...prev, conferringAuthority: e.target.value }))
        },
        [setFormData]
    )

    const handleFarmerNameChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData((prev: any) => ({ ...prev, farmerName: e.target.value }))
        },
        [setFormData]
    )

    const handleAddressChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData((prev: any) => ({ ...prev, address: e.target.value }))
        },
        [setFormData]
    )

    const handleContactNoChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData((prev: any) => ({ ...prev, contactNo: e.target.value }))
        },
        [setFormData]
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
                        setFormData((prev: any) => ({
                            ...prev,
                            [field]: [
                                ...existingPhotos,
                                ...newFiles.map((f, i) => ({
                                    file: f,
                                    preview: previews[i],
                                    image: previews[i],
                                    caption: ''
                                }))
                            ]
                        }));
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removePhoto = (field: string, index: number) => {
        const photos = [...(Array.isArray(formData[field]) ? formData[field] : [])];
        photos.splice(index, 1);
        setFormData((prev: any) => ({ ...prev, [field]: photos }));
    };

    const updateCaption = (field: string, index: number, caption: string) => {
        const photos = [...(Array.isArray(formData[field]) ? formData[field] : [])];
        if (photos[index]) {
            photos[index] = { ...photos[index], caption };
            setFormData((prev: any) => ({ ...prev, [field]: photos }));
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
    useEffect(() => {
        // Only normalize if we are editing an existing record and have an ID
        if (!formData.id) return;

        const photoFields = ['photographs', 'image'];
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

    if (!entityType) return null

    return (
        <>
            {/* KVK Awards */}
            {entityType === ENTITY_TYPES.ACHIEVEMENT_AWARD_KVK && (
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800">Institutional Award received by KVK</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <MasterDataDropdown
                            label="Reporting Year"
                            required
                            value={formData.reportingYear || ''}
                            onChange={handleYearChange}
                            options={yearOptions}
                            isLoading={isLoadingYears}
                            loadingMessage="Loading years..."
                            emptyMessage="No years available. Add them from All Masters."
                        />
                        <FormInput
                            label="Name of the Award"
                            required
                            value={formData.awardName || ''}
                            onChange={handleAwardNameChange}
                        />
                        <FormInput
                            label="Amount"
                            required
                            value={formData.amount || ''}
                            onChange={handleAmountChange}
                        />
                        <FormInput
                            label="Achievement"
                            required
                            value={formData.achievement || ''}
                            onChange={handleAchievementChange}
                        />
                        <FormInput
                            label="Conferring Authority"
                            required
                            value={formData.conferringAuthority || ''}
                            onChange={handleConferringAuthorityChange}
                            className="md:col-span-2"
                        />
                    </div>
                </div>
            )}

            {/* Scientist Awards */}
            {entityType === ENTITY_TYPES.ACHIEVEMENT_AWARD_SCIENTIST && (
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800">Recognition received by Head/Scientist</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <MasterDataDropdown
                            label="Reporting Year"
                            required
                            value={formData.reportingYear || ''}
                            onChange={handleYearChange}
                            options={yearOptions}
                            isLoading={isLoadingYears}
                            loadingMessage="Loading years..."
                            emptyMessage="No years available. Add them from All Masters."
                        />
                        <MasterDataDropdown
                            label="Head/Scientist"
                            required
                            value={formData.staffId ? parseInt(formData.staffId) : ''}
                            onChange={handleScientistChange}
                            options={scientistOptions}
                            isLoading={isLoadingEmployees}
                            loadingMessage="Loading staff..."
                            emptyMessage="No staff available. Add them from About KVK."
                            placeholder="--Please Select Scientist--"
                        />
                        <FormInput
                            label="Name of the Award"
                            required
                            value={formData.awardName || ''}
                            onChange={handleAwardNameChange}
                        />
                        <FormInput
                            label="Amount"
                            required
                            value={formData.amount || ''}
                            onChange={handleAmountChange}
                        />
                        <FormInput
                            label="Achievement"
                            required
                            value={formData.achievement || ''}
                            onChange={handleAchievementChange}
                        />
                        <FormInput
                            label="Conferring Authority"
                            required
                            value={formData.conferringAuthority || ''}
                            onChange={handleConferringAuthorityChange}
                        />
                    </div>
                </div>
            )}

            {/* Farmer Awards */}
            {entityType === ENTITY_TYPES.ACHIEVEMENT_AWARD_FARMER && (
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800">Recognition received by Farmers</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <MasterDataDropdown
                            label="Reporting Year"
                            required
                            value={formData.reportingYear || ''}
                            onChange={handleYearChange}
                            options={yearOptions}
                            isLoading={isLoadingYears}
                            loadingMessage="Loading years..."
                            emptyMessage="No years available. Add them from All Masters."
                        />
                        <FormInput
                            label="Name of the Award"
                            required
                            value={formData.awardName || ''}
                            onChange={handleAwardNameChange}
                        />
                        <FormInput
                            label="Name of the Farmer"
                            required
                            value={formData.farmerName || ''}
                            onChange={handleFarmerNameChange}
                        />
                        <FormInput
                            label="Address"
                            required
                            value={formData.address || ''}
                            onChange={handleAddressChange}
                        />
                        <FormInput
                            label="Contact No."
                            required
                            value={formData.contactNo || ''}
                            onChange={handleContactNoChange}
                        />
                        <FormInput
                            label="Amount"
                            required
                            value={formData.amount || ''}
                            onChange={handleAmountChange}
                        />
                        <FormInput
                            label="Achievement"
                            required
                            value={formData.achievement || ''}
                            onChange={handleAchievementChange}
                        />
                        <FormInput
                            label="Conferring Authority"
                            required
                            value={formData.conferringAuthority || ''}
                            onChange={handleConferringAuthorityChange}
                        />
                        {renderPhotoFields('image')}
                    </div>
                </div>
            )}
        </>
    )
}
