import React, { useMemo, useCallback, useEffect } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput } from './shared/FormComponents'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { useAuth } from '@/contexts/AuthContext'
import { useKvkEmployees } from '@/hooks/forms/useAboutKvkData'
import { createStaffOptions } from '@/utils/formHelpers'

interface HRDProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

export const HRDForms: React.FC<HRDProps> = ({
    entityType,
    formData,
    setFormData,
}) => {
    const { user } = useAuth()
    const activeKvkId = formData.kvkId || user?.kvkId
    const { data: employees = [], isLoading: isLoadingEmployees } = useKvkEmployees({ kvkId: activeKvkId })

    // Automatically sync kvkId from user session if it's missing in formData
    useEffect(() => {
        if (user?.kvkId && !formData.kvkId && !formData.id) {
            setFormData((prev: any) => ({ ...prev, kvkId: user.kvkId }))
        }
    }, [user?.kvkId, formData.kvkId, formData.id, setFormData])

    // Memoized options for Staff dropdown - using API data only
    const staffOptions = useMemo(() => {
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

    // Optimized onChange handlers using useCallback with functional updates
    const handleStaffChange = useCallback(
        (value: string | number) => {
            setFormData((prev: any) => {
                const selectedEmployee = employees.find(
                    (emp: any) => emp.kvkStaffId === value || emp.staffName === value
                )
                return {
                    ...prev,
                    kvkStaffId: value,
                    staffId: selectedEmployee?.kvkStaffId || value,
                    staffName: selectedEmployee?.staffName || '',
                }
            })
        },
        [setFormData, employees]
    )

    const handleCourseNameChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData((prev: any) => ({ ...prev, courseName: e.target.value }))
        },
        [setFormData]
    )

    const handleStartDateChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData((prev: any) => ({ ...prev, startDate: e.target.value }))
        },
        [setFormData]
    )

    const handleEndDateChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData((prev: any) => ({ ...prev, endDate: e.target.value }))
        },
        [setFormData]
    )

    const handleOrganizerChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData((prev: any) => ({ ...prev, organizer: e.target.value }))
        },
        [setFormData]
    )

    const handleVenueChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData((prev: any) => ({ ...prev, venue: e.target.value }))
        },
        [setFormData]
    )

    if (!entityType) return null

    return (
        <>
            {entityType === ENTITY_TYPES.ACHIEVEMENT_HRD && (
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800">Add HRD Program</h2>

                    {/* Row 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <MasterDataDropdown
                            label="Name of Staff"
                            required
                            value={formData.kvkStaffId || formData.staffId || ''}
                            onChange={handleStaffChange}
                            options={staffOptions}
                            isLoading={isLoadingEmployees}
                            loadingMessage="Loading staff..."
                            emptyMessage="No staff available. Add them from About KVK."
                            placeholder="--Please Select Staff--"
                        />
                        <FormInput
                            label="Course Name"
                            required
                            value={formData.courseName ?? ''}
                            onChange={handleCourseNameChange}
                        />
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            label="Start Date"
                            type="date"
                            required
                            value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''}
                            onChange={handleStartDateChange}
                        />
                        <FormInput
                            label="End Date"
                            type="date"
                            required
                            value={formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : ''}
                            onChange={handleEndDateChange}
                        />
                    </div>

                    {/* Row 3 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            label="Organizer"
                            required
                            value={formData.organizer ?? ''}
                            onChange={handleOrganizerChange}
                        />
                        <FormInput
                            label="Venue"
                            required
                            value={formData.venue ?? ''}
                            onChange={handleVenueChange}
                        />
                    </div>
                </div>
            )}
        </>
    )
}
