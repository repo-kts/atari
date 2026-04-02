import React, { useMemo, useCallback, useEffect } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput } from './shared/FormComponents'
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

    const handleImageChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            if (file) {
                const reader = new FileReader()
                reader.onloadend = () => {
                    setFormData((prev: any) => ({ ...prev, image: reader.result as string }))
                }
                reader.readAsDataURL(file)
            }
        },
        [setFormData]
    )

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
                            value={formData.reportingYear ?? ''}
                            onChange={handleYearChange}
                            options={yearOptions}
                            isLoading={isLoadingYears}
                            loadingMessage="Loading years..."
                            emptyMessage="No years available. Add them from All Masters."
                        />
                        <FormInput
                            label="Name of the Award"
                            required
                            value={formData.awardName ?? ''}
                            onChange={handleAwardNameChange}
                        />
                        <FormInput
                            label="Amount"
                            required
                            value={formData.amount ?? ''}
                            onChange={handleAmountChange}
                        />
                        <FormInput
                            label="Achievement"
                            required
                            value={formData.achievement ?? ''}
                            onChange={handleAchievementChange}
                        />
                        <FormInput
                            label="Conferring Authority"
                            required
                            value={formData.conferringAuthority ?? ''}
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
                            value={formData.reportingYear ?? ''}
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
                            value={formData.awardName ?? ''}
                            onChange={handleAwardNameChange}
                        />
                        <FormInput
                            label="Amount"
                            required
                            value={formData.amount ?? ''}
                            onChange={handleAmountChange}
                        />
                        <FormInput
                            label="Achievement"
                            required
                            value={formData.achievement ?? ''}
                            onChange={handleAchievementChange}
                        />
                        <FormInput
                            label="Conferring Authority"
                            required
                            value={formData.conferringAuthority ?? ''}
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
                            value={formData.reportingYear ?? ''}
                            onChange={handleYearChange}
                            options={yearOptions}
                            isLoading={isLoadingYears}
                            loadingMessage="Loading years..."
                            emptyMessage="No years available. Add them from All Masters."
                        />
                        <FormInput
                            label="Name of the Award"
                            required
                            value={formData.awardName ?? ''}
                            onChange={handleAwardNameChange}
                        />
                        <FormInput
                            label="Name of the Farmer"
                            required
                            value={formData.farmerName ?? ''}
                            onChange={handleFarmerNameChange}
                        />
                        <FormInput
                            label="Address"
                            required
                            value={formData.address ?? ''}
                            onChange={handleAddressChange}
                        />
                        <FormInput
                            label="Contact No."
                            required
                            value={formData.contactNo ?? ''}
                            onChange={handleContactNoChange}
                        />
                        <FormInput
                            label="Amount"
                            required
                            value={formData.amount ?? ''}
                            onChange={handleAmountChange}
                        />
                        <FormInput
                            label="Achievement"
                            required
                            value={formData.achievement ?? ''}
                            onChange={handleAchievementChange}
                        />
                        <FormInput
                            label="Conferring Authority"
                            required
                            value={formData.conferringAuthority ?? ''}
                            onChange={handleConferringAuthorityChange}
                        />
                        <div className="md:col-span-2 space-y-4">
                            {/* Display existing image if available */}
                            {formData.image && typeof formData.image === 'string' && (
                                <div className="p-4 border border-[#E0E0E0] rounded-xl bg-gray-50">
                                    <p className="text-sm font-semibold text-gray-700 mb-2">Current Image:</p>
                                    <div className="relative w-full max-w-xs h-40 overflow-hidden rounded-lg border border-gray-200">
                                        <img
                                            src={formData.image}
                                            alt="Achievement"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 italic">Uploading a new file will replace this image.</p>
                                </div>
                            )}

                            <FormInput
                                label="Image"
                                type="file"
                                required={!formData.image} // Required only if no image exists (new record or no image set)
                                onChange={handleImageChange}
                                accept="image/*"
                                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#487749]/10 file:text-[#487749] hover:file:bg-[#487749]/20"
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
