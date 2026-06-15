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
                // Loose match: select values come back as strings, publicationId is numeric.
                const selectedPublication = publicationItems.find(
                    (p: any) => String(p.publicationId) === String(value)
                )
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

    const handlePublisherNameChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData((prev: any) => ({ ...prev, publisherName: e.target.value }))
        },
        [setFormData]
    )

    const handleVenueChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData((prev: any) => ({ ...prev, venue: e.target.value }))
        },
        [setFormData]
    )

    const handleIsbnNumberChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData((prev: any) => ({ ...prev, isbnNumber: e.target.value }))
        },
        [setFormData]
    )

    const handlePublicationNameChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData((prev: any) => ({ ...prev, publicationName: e.target.value }))
        },
        [setFormData]
    )

    // Resolve the selected publication's name from its id so conditional fields
    // work for BOTH create (just-selected id) and edit (id loaded from record).
    // Falls back to any name already on formData when items aren't loaded yet.
    const selectedPublicationName = useMemo(() => {
        const id = formData.publicationId ?? formData.publication
        if (id !== undefined && id !== null && id !== '') {
            const match = publicationItems.find(
                (p: any) => String(p.publicationId) === String(id)
            )
            if (match) return match.publicationName
        }
        return (
            formData.publicationName ??
            (typeof formData.publication === 'string' ? formData.publication : '')
        )
    }, [formData.publicationId, formData.publication, formData.publicationName, publicationItems])

    // Which type-specific fields to show, driven by the selected publication type.
    // Defaults to "Name Of Publisher" only for any type not explicitly mapped.
    const fieldConfig = useMemo(() => {
        const name = String(selectedPublicationName ?? '').trim()
        switch (name) {
            case 'Research Paper Published':
                return { journal: true, naas: true, publisher: false, venue: false, isbn: false }
            case 'Abstracts Published in Seminar or Conference or Symposia':
                return { journal: false, naas: false, publisher: true, venue: true, isbn: false }
            case 'Books Published':
            case 'Book Chapter Published':
                return { journal: false, naas: false, publisher: true, venue: false, isbn: true }
            default:
                return { journal: false, naas: false, publisher: true, venue: false, isbn: false }
        }
    }, [selectedPublicationName])

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
                        {fieldConfig.journal && (
                            <FormInput
                                label="Name Of Journal"
                                required
                                value={formData.journalName ?? ''}
                                onChange={handleJournalNameChange}
                            />
                        )}
                        {fieldConfig.naas && (
                            <FormInput
                                label="NAAS Rating"
                                type="number"
                                required
                                value={formData.naasRating ?? ''}
                                onChange={(e) =>
                                    setFormData((prev: any) => ({ ...prev, naasRating: e.target.value }))
                                }
                                placeholder="e.g. 5.59"
                            />
                        )}
                        {fieldConfig.publisher && (
                            <FormInput
                                label="Name Of Publisher"
                                required
                                value={formData.publisherName ?? ''}
                                onChange={handlePublisherNameChange}
                            />
                        )}
                        {fieldConfig.venue && (
                            <FormInput
                                label="Venue"
                                required
                                value={formData.venue ?? ''}
                                onChange={handleVenueChange}
                            />
                        )}
                        {fieldConfig.isbn && (
                            <FormInput
                                label="ISBN Number"
                                required
                                value={formData.isbnNumber ?? ''}
                                onChange={handleIsbnNumberChange}
                            />
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
