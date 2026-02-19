import React, { useCallback } from 'react'
import { ENTITY_TYPES } from '@/constants/entityTypes'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput } from './shared/FormComponents'

interface OtherMastersFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

export const OtherMastersForms: React.FC<OtherMastersFormsProps> = ({
    entityType,
    formData,
    setFormData,
}) => {
    if (!entityType) return null

    return (
        <>
            {/* Employee Masters */}
            {entityType === ENTITY_TYPES.STAFF_CATEGORY && (
                <FormInput
                    label="Category Name"
                    required
                    value={formData.categoryName || ''}
                    onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev: any) => ({ ...prev, categoryName: e.target.value }))
                    }, [setFormData])}
                    placeholder="Enter staff category name"
                />
            )}

            {entityType === ENTITY_TYPES.PAY_LEVEL && (
                <FormInput
                    label="Level Name"
                    required
                    value={formData.levelName || ''}
                    onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev: any) => ({ ...prev, levelName: e.target.value }))
                    }, [setFormData])}
                    placeholder="Enter pay level name"
                />
            )}

            {entityType === ENTITY_TYPES.SANCTIONED_POST && (
                <FormInput
                    label="Post Name"
                    required
                    value={formData.postName || ''}
                    onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev: any) => ({ ...prev, postName: e.target.value }))
                    }, [setFormData])}
                    placeholder="Enter sanctioned post name"
                />
            )}

            {entityType === ENTITY_TYPES.DISCIPLINE && (
                <FormInput
                    label="Discipline Name"
                    required
                    value={formData.disciplineName || ''}
                    onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev: any) => ({ ...prev, disciplineName: e.target.value }))
                    }, [setFormData])}
                    placeholder="Enter discipline name"
                />
            )}

            {/* Other Masters */}
            {entityType === ENTITY_TYPES.SEASON && (
                <FormInput
                    label="Season Name"
                    required
                    value={formData.seasonName || ''}
                    onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev: any) => ({ ...prev, seasonName: e.target.value }))
                    }, [setFormData])}
                    placeholder="Enter season name"
                />
            )}

            {entityType === ENTITY_TYPES.YEAR && (
                <FormInput
                    label="Year Name"
                    required
                    value={formData.yearName || ''}
                    onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev: any) => ({ ...prev, yearName: e.target.value }))
                    }, [setFormData])}
                    placeholder="Enter year name"
                />
            )}

            {entityType === ENTITY_TYPES.CROP_TYPE && (
                <FormInput
                    label="Crop Type Name"
                    required
                    value={formData.typeName || ''}
                    onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev: any) => ({ ...prev, typeName: e.target.value }))
                    }, [setFormData])}
                    placeholder="Enter crop type name"
                />
            )}

            {entityType === ENTITY_TYPES.INFRASTRUCTURE_MASTER && (
                <FormInput
                    label="Infrastructure Name"
                    required
                    value={formData.name || ''}
                    onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev: any) => ({ ...prev, name: e.target.value }))
                    }, [setFormData])}
                    placeholder="Enter infrastructure name"
                />
            )}

            {entityType === ENTITY_TYPES.IMPORTANT_DAY && (
                <FormInput
                    label="Day Name"
                    required
                    value={formData.dayName || ''}
                    onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev: any) => ({ ...prev, dayName: e.target.value }))
                    }, [setFormData])}
                    placeholder="Enter important day name"
                />
            )}
        </>
    )
}
