import React, { useCallback, useMemo } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput, FormSelect, FormSection } from './shared/FormComponents'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { DependentDropdown } from '@/components/common/DependentDropdown'
import {
    useProductCategories,
    useProductTypes,
    useProducts,
} from '@/hooks/useProductionProjectsData'
import { useSeasons } from '@/hooks/useOftFldData'
import { useYears } from '@/hooks/useOtherMastersData'
import { createMasterDataOptions } from '@/utils/formHelpers'

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
    // Fetch master data
    const { data: productCategories = [] } = useProductCategories()
    const { data: productTypes = [] } = useProductTypes()
    const { data: products = [] } = useProducts()
    const { data: seasons = [] } = useSeasons()
    const { data: years = [] } = useYears()

    // Memoized function to load product types by category (for DependentDropdown)
    const loadProductTypesByCategory = useCallback(async (categoryId: string | number, signal?: AbortSignal): Promise<{ value: string | number; label: string }[]> => {
        // Check if aborted
        if (signal?.aborted) {
            return []
        }

        const categoryIdNum = typeof categoryId === 'string' ? parseInt(categoryId) : categoryId
        if (!categoryIdNum || isNaN(categoryIdNum)) {
            return []
        }

        // Filter product types by category
        const filtered = productTypes.filter((type: any) => type.productCategoryId === categoryIdNum)

        // Check if aborted again before returning
        if (signal?.aborted) {
            return []
        }

        return createMasterDataOptions(filtered, 'productTypeId', 'productCategoryType')
    }, [productTypes])

    // Memoized function to load products by type (for DependentDropdown)
    const loadProductsByType = useCallback(async (typeId: string | number, signal?: AbortSignal): Promise<{ value: string | number; label: string }[]> => {
        // Check if aborted
        if (signal?.aborted) {
            return []
        }

        const typeIdNum = typeof typeId === 'string' ? parseInt(typeId) : typeId
        if (!typeIdNum || isNaN(typeIdNum)) {
            return []
        }

        // Filter products by both category and type
        const filtered = products.filter((product: any) =>
            product.productTypeId === typeIdNum &&
            product.productCategoryId === formData.productCategoryId
        )

        // Check if aborted again before returning
        if (signal?.aborted) {
            return []
        }

        return createMasterDataOptions(filtered, 'productId', 'productName')
    }, [products, formData.productCategoryId])

    const unitOptions = useMemo(() => [
        { value: 'Kg', label: 'Kg' },
        { value: 'Quintal', label: 'Quintal' },
        { value: 'Nos', label: 'Nos' },
    ], [])

    // Optimized onChange handlers using useCallback
    const handleReportingYearChange = useCallback((value: string | number) => {
        setFormData({ ...formData, reportingYear: value, reportingYearId: value })
    }, [formData, setFormData])

    const handleProductCategoryChange = useCallback((value: string | number) => {
        setFormData({
            ...formData,
            productCategoryId: value,
            prodCategory: productCategories.find((c: any) => c.productCategoryId === value)?.productCategoryName || '',
            productTypeId: '',
            prodSubCategory: '',
            productId: '',
            prodType: '',
        })
    }, [formData, setFormData, productCategories])

    const handleProductTypeChange = useCallback((value: string | number) => {
        const selectedType = productTypes.find((t: any) => t.productTypeId === value)
        setFormData({
            ...formData,
            productTypeId: value,
            prodSubCategory: selectedType?.productCategoryType || '',
            productId: '',
            speciesName: '',
        })
    }, [formData, setFormData, productTypes])

    const handleProductChange = useCallback((value: string | number) => {
        const selectedProduct = products.find((p: any) => p.productId === value)
        setFormData({
            ...formData,
            productId: value,
            speciesName: selectedProduct?.productName || '',
        })
    }, [formData, setFormData, products])

    const handleSpeciesNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, speciesName: e.target.value })
    }, [formData, setFormData])

    const handleUnitChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData({ ...formData, unit: e.target.value })
    }, [formData, setFormData])

    const handleQuantityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, quantity: e.target.value })
    }, [formData, setFormData])

    const handleValueChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, value: e.target.value })
    }, [formData, setFormData])

    // Farmers details handlers
    const handleFarmerFieldChange = useCallback((field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [field]: e.target.value })
    }, [formData, setFormData])

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

            {entityType === ENTITY_TYPES.TSP_SCSP_TYPES && (
                <FormInput
                    label="TSP/SCSP Type"
                    required
                    value={formData.typeName || ''}
                    onChange={(e) => setFormData({ ...formData, typeName: e.target.value.toUpperCase() })}
                    placeholder="Enter type (TSP or SCSP)"
                />
            )}

            {entityType === ENTITY_TYPES.TSP_SCSP_ACTIVITIES && (
                <FormInput
                    label="TSP/SCSP Activity Name"
                    required
                    value={formData.activityName || ''}
                    onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
                    placeholder="Enter activity name"
                />
            )}

            {entityType === ENTITY_TYPES.NATURAL_FARMING_ACTIVITIES && (
                <FormInput
                    label="Natural Farming Activity Name"
                    required
                    value={formData.activityName || ''}
                    onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
                    placeholder="Enter natural farming activity name"
                />
            )}

            {entityType === ENTITY_TYPES.NATURAL_FARMING_SOIL_PARAMETERS && (
                <FormInput
                    label="Natural Farming Soil Parameter"
                    required
                    value={formData.parameterName || ''}
                    onChange={(e) => setFormData({ ...formData, parameterName: e.target.value })}
                    placeholder="Enter natural farming soil parameter"
                />
            )}

            {entityType === ENTITY_TYPES.AGRI_DRONE_DEMONSTRATIONS_ON && (
                <FormInput
                    label="Demonstrations on"
                    required
                    value={formData.demonstrationsOnName || ''}
                    onChange={(e) => setFormData({ ...formData, demonstrationsOnName: e.target.value })}
                    placeholder="Enter demonstrations on"
                />
            )}

            {entityType === ENTITY_TYPES.ACHIEVEMENT_PRODUCTION_SUPPLY && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Reporting Year - From Years Master */}
                        <MasterDataDropdown
                            label="Reporting Year"
                            required
                            value={formData.reportingYearId || formData.reportingYear || formData.yearId || ''}
                            onChange={handleReportingYearChange}
                            options={createMasterDataOptions(years, 'yearId', 'yearName')}
                            emptyMessage="No reporting years available"
                        />

                        {/* Product Category - From Product Categories Master */}
                        <MasterDataDropdown
                            label="Product Category"
                            required
                            value={formData.productCategoryId || formData.prodCategory || ''}
                            onChange={handleProductCategoryChange}
                            options={createMasterDataOptions(productCategories, 'productCategoryId', 'productCategoryName')}
                            emptyMessage="No product categories available"
                        />

                        {/* Product Type - Dependent on Product Category */}
                        <DependentDropdown
                            label="Product Type"
                            required
                            value={formData.productTypeId || formData.prodSubCategory || ''}
                            onChange={handleProductTypeChange}
                            options={[]}
                            dependsOn={{
                                value: formData.productCategoryId,
                                field: 'productCategoryId',
                            }}
                            onOptionsLoad={loadProductTypesByCategory}
                            cacheKey="product-types-by-category"
                            emptyMessage="No product types available for this category"
                            loadingMessage="Loading product types..."
                        />

                        {/* Product - Dependent on Product Type */}
                        <DependentDropdown
                            label="Product"
                            required
                            value={formData.productId || formData.speciesName || ''}
                            onChange={handleProductChange}
                            options={[]}
                            dependsOn={{
                                value: formData.productTypeId,
                                field: 'productTypeId',
                            }}
                            onOptionsLoad={loadProductsByType}
                            cacheKey="products-by-type"
                            emptyMessage="No products available for this type"
                            loadingMessage="Loading products..."
                        />

                        {/* Species / Breed / Variety */}
                        <FormInput
                            label="Species / Breed / Variety"
                            required
                            value={formData.speciesName || ''}
                            onChange={handleSpeciesNameChange}
                        />

                        {/* Unit and Quantity */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormSelect
                                label="Unit"
                                required
                                value={formData.unit || ''}
                                onChange={handleUnitChange}
                                options={unitOptions}
                            />
                            <FormInput
                                label="Quantity"
                                required
                                type="number"
                                value={formData.quantity || ''}
                                onChange={handleQuantityChange}
                            />
                        </div>

                        {/* Value */}
                        <FormInput
                            label="Value(Rs)"
                            required
                            type="number"
                            value={formData.value || ''}
                            onChange={handleValueChange}
                        />
                    </div>

                    <FormSection title="Farmers Details">
                        <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormInput
                                label="General_M"
                                required
                                type="number"
                                value={formData.gen_m || ''}
                                onChange={handleFarmerFieldChange('gen_m')}
                            />
                            <FormInput
                                label="General_F"
                                required
                                type="number"
                                value={formData.gen_f || ''}
                                onChange={handleFarmerFieldChange('gen_f')}
                            />
                            <FormInput
                                label="OBC_M"
                                required
                                type="number"
                                value={formData.obc_m || ''}
                                onChange={handleFarmerFieldChange('obc_m')}
                            />
                            <FormInput
                                label="OBC_F"
                                required
                                type="number"
                                value={formData.obc_f || ''}
                                onChange={handleFarmerFieldChange('obc_f')}
                            />
                            <FormInput
                                label="SC_M"
                                required
                                type="number"
                                value={formData.sc_m || ''}
                                onChange={handleFarmerFieldChange('sc_m')}
                            />
                            <FormInput
                                label="SC_F"
                                required
                                type="number"
                                value={formData.sc_f || ''}
                                onChange={handleFarmerFieldChange('sc_f')}
                            />
                            <FormInput
                                label="ST_M"
                                required
                                type="number"
                                value={formData.st_m || ''}
                                onChange={handleFarmerFieldChange('st_m')}
                            />
                            <FormInput
                                label="ST_F"
                                required
                                type="number"
                                value={formData.st_f || ''}
                                onChange={handleFarmerFieldChange('st_f')}
                            />
                        </div>
                    </FormSection>
                </div>
            )}
        </>
    )
}
