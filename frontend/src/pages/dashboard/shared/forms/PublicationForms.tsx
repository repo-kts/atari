import React, { useMemo, useCallback } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput } from './shared/FormComponents'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { useYears } from '@/hooks/useOtherMastersData'
import { usePublicationItems } from '@/hooks/usePublicationData'
import { createMasterDataOptions } from '@/utils/formHelpers'

interface PublicationFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

export const PublicationForms: React.FC<PublicationFormsProps> = ({
    entityType,
    formData,
    setFormData,
}) => {
    // Fetch master data from APIs
    const { data: years = [], isLoading: isLoadingYears } = useYears()
    const { data: publicationItems = [], isLoading: isLoadingPublications } = usePublicationItems()

    // Memoized options for Year dropdown
    const yearOptions = useMemo(
        () => createMasterDataOptions(years, 'reportingYear', 'yearName'),
        [years]
    )

    // Memoized options for Publication dropdown
    // Using publication items from API, fallback to static types if needed
    const publicationOptions = useMemo(() => {
        // If publication items exist, use them; otherwise use static types
        if (publicationItems.length > 0) {
            return createMasterDataOptions(publicationItems, 'publicationId', 'publicationName')
        }
        return []
    }, [publicationItems])

    // Optimized onChange handlers using useCallback with functional updates
    // This ensures we always work with the latest state and prevents unnecessary dependencies
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

    const handlePublicationChange = useCallback(
        (value: string | number) => {
            setFormData((prev: any) => {
                const selectedPublication = publicationItems.find((p: any) => p.publicationId === value)
                return {
                    ...prev,
                    publication: value,
                    publicationId: value,
                    publicationName:
                        selectedPublication?.publicationName ||
                        (typeof value === 'string' ? value : ''),
                }
            })
        },
        [setFormData, publicationItems]
    )

    // Optimized input change handlers using functional updates
    // This prevents unnecessary recreations and ensures we always have the latest formData
    const handleTitleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData((prev: any) => ({ ...prev, title: e.target.value }))
        },
        [setFormData]
    )

    const handleAuthorNameChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData((prev: any) => ({ ...prev, authorName: e.target.value }))
        },
        [setFormData]
    )

    const handleJournalNameChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData((prev: any) => ({ ...prev, journalName: e.target.value }))
        },
        [setFormData]
    )

    const handlePublicationNameChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData((prev: any) => ({ ...prev, publicationName: e.target.value }))
        },
        [setFormData]
    )

    if (!entityType) return null

    return (
        <>
            {entityType === ENTITY_TYPES.PUBLICATION_ITEMS && (
                <FormInput
                    label="Publication Item"
                    required
                    value={formData.publicationName ?? ''}
                    onChange={handlePublicationNameChange}
                    placeholder="Enter publication item"
                />
            )}

            {entityType === ENTITY_TYPES.ACHIEVEMENT_PUBLICATION_DETAILS && (
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800">Add Publication</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <MasterDataDropdown
                            label="Year"
                            required
                            value={formData.reportingYear ?? ''}
                            onChange={handleYearChange}
                            options={yearOptions}
                            isLoading={isLoadingYears}
                            emptyMessage="No years available. Add them from All Masters."
                        />
                        <MasterDataDropdown
                            label="Publication"
                            required
                            value={formData.publicationId || formData.publication || ''}
                            onChange={handlePublicationChange}
                            options={publicationOptions}
                            isLoading={isLoadingPublications}
                            emptyMessage="No publications available. Add them from All Masters."
                        />
                        <FormInput
                            label="Title"
                            required
                            value={formData.title ?? ''}
                            onChange={handleTitleChange}
                        />
                        <FormInput
                            label="Author Name"
                            required
                            value={formData.authorName ?? ''}
                            onChange={handleAuthorNameChange}
                        />
                        <FormInput
                            label="Journal Name"
                            required
                            value={formData.journalName ?? ''}
                            onChange={handleJournalNameChange}
                        />
                    </div>
                </div>
            )}
        </>
    )
}
