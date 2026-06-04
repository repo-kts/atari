import React, { useMemo, useCallback, useEffect } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput } from './shared/FormComponents'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { useAuth } from '@/contexts/AuthContext'
import { useKvkEmployees } from '@/hooks/forms/useAboutKvkData'
import { createStaffOptions } from '@/utils/formHelpers'
import { cleanIndianMobileInput } from '@/utils/indianPhone'
import { FormAttachmentSection } from '@/components/common/FormAttachmentSection'

const FARMER_AWARD_FORM_CODE = 'farmer_award'

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
    const activeKvkId = formData.kvkId || user?.kvkId
    const { data: employees = [], isLoading: isLoadingEmployees } = useKvkEmployees({ kvkId: activeKvkId })

    // Memoized options for Scientist/Employee dropdown - using API data only
    const scientistOptions = useMemo(() => {
        if (!employees || employees.length === 0) {
            return []
        }

        // Filter out invalid entries
        const validEmployees = employees.filter(
            (emp: any) =>
                emp.staffName &&
                emp.staffName !== 'undefined'
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

    // Reporting Date is now a free date input (column is DateTime). The legacy
    // year-master dropdown was removed in favor of a date picker so users can
    // record the exact date the award was conferred.
    const handleReportingDateChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData((prev: any) => ({ ...prev, reportingYear: e.target.value }))
        },
        [setFormData]
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
            setFormData((prev: any) => ({
                ...prev,
                contactNo: cleanIndianMobileInput(e.target.value),
            }))
        },
        [setFormData]
    )

    const handleAttachmentIds = useCallback(
        (ids: number[]) => setFormData((prev: any) => ({ ...prev, attachmentIds: ids })),
        [setFormData],
    )

    const renderFarmerAwardPhotos = () => (
        <FormAttachmentSection
            title="Photographs"
            formCode={FARMER_AWARD_FORM_CODE}
            kind="PHOTO"
            kvkId={formData.kvkId ?? null}
            recordId={formData.farmerAwardId ?? formData.id ?? null}
            showCaption
            initialAttachments={formData?.photos}
            onAttachmentIdsChange={handleAttachmentIds}
        />
    )

    if (!entityType) return null

    return (
        <>
            {/* KVK Awards */}
            {entityType === ENTITY_TYPES.ACHIEVEMENT_AWARD_KVK && (
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800">Institutional Award received by KVK</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            label="Reporting Date"
                            required
                            type="date"
                            value={formData.reportingYear ?? ''}
                            onChange={handleReportingDateChange}
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
                        <FormInput
                            label="Reporting Date"
                            required
                            type="date"
                            value={formData.reportingYear ?? ''}
                            onChange={handleReportingDateChange}
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
                        <FormInput
                            label="Reporting Date"
                            required
                            type="date"
                            value={formData.reportingYear ?? ''}
                            onChange={handleReportingDateChange}
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
                        {renderFarmerAwardPhotos()}
                    </div>
                </div>
            )}
        </>
    )
}
