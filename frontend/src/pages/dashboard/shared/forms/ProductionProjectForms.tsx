import React from 'react'
import { ENTITY_TYPES } from '../../../../constants/entityTypes'
import { ExtendedEntityType } from '../../../../utils/masterUtils'
import { FormInput, FormSelect } from './shared/FormComponents'
import {
    useProductCategories,
    useProductTypes,
} from '../../../../hooks/useProductionProjectsData'
import { useSeasons } from '../../../../hooks/useOftFldData'

interface ProductionProjectFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

export const ProductionProjectForms: React.FC<ProductionProjectFormsProps> = ({
    entityType,
    formData,
    setFormData,
}) => {

    const { data: productCategories = [] } = useProductCategories()
    const { data: productTypes = [] } = useProductTypes()
    const { data: seasons = [] } = useSeasons()

    if (!entityType) return null

    return (
        <>
            {entityType === ENTITY_TYPES.PRODUCT_CATEGORIES && (
                <FormInput
                    label="Product Category Name"
                    required
                    value={formData.productCategoryName || ''}
                    onChange={(e) => setFormData({ ...formData, productCategoryName: e.target.value })}
                    placeholder="Enter product category name"
                />
            )}

            {entityType === ENTITY_TYPES.PRODUCT_TYPES && (
                <div className="space-y-4">
                    <FormSelect
                        label="Product Category"
                        required
                        value={formData.productCategoryId || ''}
                        onChange={(e) => setFormData({ ...formData, productCategoryId: parseInt(e.target.value) })}
                        options={productCategories.map(c => ({ value: c.productCategoryId, label: c.productCategoryName }))}
                    />
                    <FormInput
                        label="Product Type"
                        required
                        value={formData.productCategoryType || ''}
                        onChange={(e) => setFormData({ ...formData, productCategoryType: e.target.value })}
                        placeholder="Enter product type"
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.PRODUCTS && (
                <div className="space-y-4">
                    <FormSelect
                        label="Product Category"
                        required
                        value={formData.productCategoryId || ''}
                        onChange={(e) => {
                            const catId = parseInt(e.target.value)
                            setFormData({ ...formData, productCategoryId: catId, productTypeId: '' })
                        }}
                        options={productCategories.map(c => ({ value: c.productCategoryId, label: c.productCategoryName }))}
                    />
                    <FormSelect
                        label="Product Type"
                        required
                        value={formData.productTypeId || ''}
                        onChange={(e) => setFormData({ ...formData, productTypeId: parseInt(e.target.value) })}
                        disabled={!formData.productCategoryId}
                        options={productTypes
                            .filter((type: any) => type.productCategoryId === formData.productCategoryId)
                            .map(t => ({ value: t.productTypeId, label: t.productCategoryType }))}
                    />
                    <FormInput
                        label="Product Name"
                        required
                        value={formData.productName || ''}
                        onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                        placeholder="Enter product name"
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.CRA_CROPPING_SYSTEMS && (
                <div className="space-y-4">
                    <FormSelect
                        label="Season"
                        required
                        value={formData.seasonId || ''}
                        onChange={(e) => setFormData({ ...formData, seasonId: parseInt(e.target.value) })}
                        options={seasons.map(s => ({ value: s.seasonId, label: s.seasonName }))}
                    />
                    <FormInput
                        label="Crop Name"
                        required
                        value={formData.cropName || ''}
                        onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                        placeholder="Enter crop name"
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.CRA_FARMING_SYSTEMS && (
                <div className="space-y-4">
                    <FormSelect
                        label="Season"
                        required
                        value={formData.seasonId || ''}
                        onChange={(e) => setFormData({ ...formData, seasonId: parseInt(e.target.value) })}
                        options={seasons.map(s => ({ value: s.seasonId, label: s.seasonName }))}
                    />
                    <FormInput
                        label="Farming System Name"
                        required
                        value={formData.farmingSystemName || ''}
                        onChange={(e) => setFormData({ ...formData, farmingSystemName: e.target.value })}
                        placeholder="Enter farming system name"
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.ARYA_ENTERPRISES && (
                <FormInput
                    label="Enterprise Name"
                    required
                    value={formData.enterpriseName || ''}
                    onChange={(e) => setFormData({ ...formData, enterpriseName: e.target.value })}
                    placeholder="Enter enterprise name"
                />
            )}
        </>
    )
}
