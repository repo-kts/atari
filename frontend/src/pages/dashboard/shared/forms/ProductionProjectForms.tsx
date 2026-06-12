import React, { useCallback, useMemo } from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput, FormSelect, FormSection } from './shared/FormComponents'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { DependentDropdown } from '@/components/common/DependentDropdown'
import { SpecifyOtherInput } from '@/components/common/SpecifyOtherInput'
import { IsOtherCheckbox } from '@/components/common/IsOtherCheckbox'
import { useOtherSpecify } from '@/hooks/useOtherSpecify'
import {
    useProductCategories,
    useProductTypes,
    useProducts,
} from '@/hooks/useProductionProjectsData'
import { useSeasons } from '@/hooks/useOftFldData'
import { useUnits } from '@/hooks/useOtherMastersData'
import { QUANTITY_DATA_TYPE_OPTIONS } from '@/constants/quantityDataType'
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
    const { data: units = [] } = useUnits()

    // Master-controlled "Other → specify" for the Product Category → Type → Product chain.
    const productCategoryOptions = useMemo(
        () => createMasterDataOptions(productCategories, 'productCategoryId', 'productCategoryName', { flagKey: 'isOther' }),
        [productCategories]
    )
    const productTypeOptions = useMemo(
        () => (productTypes as any[])
            .filter((t: any) => t.productCategoryId === formData.productCategoryId)
            .map((t: any) => ({ value: t.productTypeId, label: t.productCategoryType, isOther: Boolean(t.isOther) })),
        [productTypes, formData.productCategoryId]
    )
    const productOptions = useMemo(
        () => (products as any[])
            .filter((p: any) => p.productTypeId === formData.productTypeId && p.productCategoryId === formData.productCategoryId)
            .map((p: any) => ({ value: p.productId, label: p.productName, isOther: Boolean(p.isOther) })),
        [products, formData.productTypeId, formData.productCategoryId]
    )
    const { isOtherSelected: isOtherProductCategory, otherResetPatch: productCategoryResetPatch } = useOtherSpecify(productCategoryOptions, formData.productCategoryId)
    const { isOtherSelected: isOtherProductType, otherResetPatch: productTypeResetPatch } = useOtherSpecify(productTypeOptions, formData.productTypeId)
    const { isOtherSelected: isOtherProduct, otherResetPatch: productResetPatch } = useOtherSpecify(productOptions, formData.productId)

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

        return createMasterDataOptions(filtered, 'productTypeId', 'productCategoryType', { flagKey: 'isOther' })
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

        return createMasterDataOptions(filtered, 'productId', 'productName', { flagKey: 'isOther' })
    }, [products, formData.productCategoryId])

    // Optimized onChange handlers using useCallback
    const handleReportingYearChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, reportingYear: e.target.value })
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
            // Child specify-other texts reset with their dropdowns.
            productTypeOther: '',
            productOther: '',
            ...productCategoryResetPatch(value, 'productCategoryOther'),
        })
    }, [formData, setFormData, productCategories, productCategoryResetPatch])

    const handleProductTypeChange = useCallback((value: string | number) => {
        const selectedType = productTypes.find((t: any) => t.productTypeId === value)
        setFormData({
            ...formData,
            productTypeId: value,
            prodSubCategory: selectedType?.productCategoryType || '',
            productId: '',
            productOther: '',
            ...productTypeResetPatch(value, 'productTypeOther'),
        })
    }, [formData, setFormData, productTypes, productTypeResetPatch])

    const handleProductChange = useCallback((value: string | number) => {
        // Species / Breed / Variety is free text now — don't overwrite it.
        // Pull the product's master-defined unit; reset quantity inputs.
        const selProduct: any = products.find((p: any) => Number(p.productId) === Number(value))
        setFormData({
            ...formData,
            productId: value,
            unit: selProduct?.unit?.unitName ?? '',
            quantity: '',
            quantityText: '',
            ...productResetPatch(value, 'productOther'),
        })
    }, [formData, setFormData, productResetPatch, products])

    const handleSpeciesNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, speciesName: e.target.value })
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
                <div className="space-y-4">
                    <FormInput
                        label="Product Category Name"
                        required
                        value={formData.productCategoryName ?? ''}
                        onChange={(e) => setFormData({ ...formData, productCategoryName: e.target.value })}
                        placeholder="Enter product category name"
                    />
                    <IsOtherCheckbox
                        checked={Boolean(formData.isOther)}
                        onChange={(checked) => setFormData({ ...formData, isOther: checked })}
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.PRODUCT_TYPES && (
                <div className="space-y-4">
                    <FormSelect
                        label="Product Category"
                        required
                        value={formData.productCategoryId ?? ''}
                        onChange={(e) => setFormData({ ...formData, productCategoryId: parseInt(e.target.value) })}
                        options={productCategories.map(c => ({ value: c.productCategoryId, label: c.productCategoryName }))}
                    />
                    <FormInput
                        label="Product Type"
                        required
                        value={formData.productCategoryType ?? ''}
                        onChange={(e) => setFormData({ ...formData, productCategoryType: e.target.value })}
                        placeholder="Enter product type"
                    />
                    <IsOtherCheckbox
                        checked={Boolean(formData.isOther)}
                        onChange={(checked) => setFormData({ ...formData, isOther: checked })}
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.PRODUCTS && (
                <div className="space-y-4">
                    <FormSelect
                        label="Product Category"
                        required
                        value={formData.productCategoryId ?? ''}
                        onChange={(e) => {
                            const catId = parseInt(e.target.value)
                            setFormData({ ...formData, productCategoryId: catId, productTypeId: '' })
                        }}
                        options={productCategories.map(c => ({ value: c.productCategoryId, label: c.productCategoryName }))}
                    />
                    <FormSelect
                        label="Product Type"
                        required
                        value={formData.productTypeId ?? ''}
                        onChange={(e) => setFormData({ ...formData, productTypeId: parseInt(e.target.value) })}
                        disabled={!formData.productCategoryId}
                        options={productTypes
                            .filter((type: any) => type.productCategoryId === formData.productCategoryId)
                            .map(t => ({ value: t.productTypeId, label: t.productCategoryType }))}
                    />
                    <FormInput
                        label="Product Name"
                        required
                        value={formData.productName ?? ''}
                        onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                        placeholder="Enter product name"
                    />
                    <FormSelect
                        label="Unit"
                        value={formData.unitId ?? ''}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                unitId: e.target.value ? parseInt(e.target.value) : null,
                            })
                        }
                        options={units.map(u => ({ value: u.unitId, label: u.unitName }))}
                    />
                    <FormSelect
                        label="Quantity Data Type"
                        value={formData.quantityDataType ?? ''}
                        onChange={(e) =>
                            setFormData({ ...formData, quantityDataType: e.target.value || null })
                        }
                        options={QUANTITY_DATA_TYPE_OPTIONS}
                    />
                    <label className="flex items-center gap-2 text-sm text-[#212121] cursor-pointer">
                        <input
                            type="checkbox"
                            checked={Boolean(formData.quantityRequired)}
                            onChange={(e) =>
                                setFormData({ ...formData, quantityRequired: e.target.checked })
                            }
                        />
                        Quantity required in forms
                    </label>
                    <IsOtherCheckbox
                        checked={Boolean(formData.isOther)}
                        onChange={(checked) => setFormData({ ...formData, isOther: checked })}
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.CRA_CROPPING_SYSTEMS && (
                <div className="space-y-4">
                    <FormSelect
                        label="Season"
                        required
                        value={formData.seasonId ?? ''}
                        onChange={(e) => setFormData({ ...formData, seasonId: parseInt(e.target.value) })}
                        options={seasons.map(s => ({ value: s.seasonId, label: s.seasonName }))}
                    />
                    <FormInput
                        label="Crop Name"
                        required
                        value={formData.cropName ?? ''}
                        onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                        placeholder="Enter crop name"
                    />
                    <IsOtherCheckbox
                        checked={Boolean(formData.isOther)}
                        onChange={(checked) => setFormData({ ...formData, isOther: checked })}
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.CRA_FARMING_SYSTEMS && (
                <div className="space-y-4">
                    <FormSelect
                        label="Season"
                        required
                        value={formData.seasonId ?? ''}
                        onChange={(e) => setFormData({ ...formData, seasonId: parseInt(e.target.value) })}
                        options={seasons.map(s => ({ value: s.seasonId, label: s.seasonName }))}
                    />
                    <FormInput
                        label="Farming System Name"
                        required
                        value={formData.farmingSystemName ?? ''}
                        onChange={(e) => setFormData({ ...formData, farmingSystemName: e.target.value })}
                        placeholder="Enter farming system name"
                    />
                    <IsOtherCheckbox
                        checked={Boolean(formData.isOther)}
                        onChange={(checked) => setFormData({ ...formData, isOther: checked })}
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.ARYA_ENTERPRISES && (
                <div className="space-y-4">
                    <FormInput
                        label="Enterprise Name"
                        required
                        value={formData.enterpriseName ?? ''}
                        onChange={(e) => setFormData({ ...formData, enterpriseName: e.target.value })}
                        placeholder="Enter enterprise name"
                    />
                    <IsOtherCheckbox
                        checked={Boolean(formData.isOther)}
                        onChange={(checked) => setFormData({ ...formData, isOther: checked })}
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.TSP_SCSP_TYPES && (
                <FormInput
                    label="TSP/SCSP Type"
                    required
                    value={formData.typeName ?? ''}
                    onChange={(e) => setFormData({ ...formData, typeName: e.target.value.toUpperCase() })}
                    placeholder="Enter type (TSP or SCSP)"
                />
            )}

            {entityType === ENTITY_TYPES.TSP_SCSP_ACTIVITIES && (
                <div className="space-y-4">
                    <FormInput
                        label="TSP/SCSP Activity Name"
                        required
                        value={formData.activityName ?? ''}
                        onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
                        placeholder="Enter activity name"
                    />
                    <IsOtherCheckbox
                        checked={Boolean(formData.isOther)}
                        onChange={(checked) => setFormData({ ...formData, isOther: checked })}
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.NATURAL_FARMING_ACTIVITIES && (
                <FormInput
                    label="Natural Farming Activity Name"
                    required
                    value={formData.activityName ?? ''}
                    onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
                    placeholder="Enter natural farming activity name"
                />
            )}

            {entityType === ENTITY_TYPES.NATURAL_FARMING_SOIL_PARAMETERS && (
                <div className="space-y-4">
                    <FormInput
                        label="Natural Farming Soil Parameter"
                        required
                        value={formData.parameterName ?? ''}
                        onChange={(e) => setFormData({ ...formData, parameterName: e.target.value })}
                        placeholder="Enter natural farming soil parameter"
                    />
                    <IsOtherCheckbox
                        checked={Boolean(formData.isOther)}
                        onChange={(checked) => setFormData({ ...formData, isOther: checked })}
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.AGRI_DRONE_DEMONSTRATIONS_ON && (
                <div className="space-y-4">
                    <FormInput
                        label="Demonstrations on"
                        required
                        value={formData.demonstrationsOnName ?? ''}
                        onChange={(e) => setFormData({ ...formData, demonstrationsOnName: e.target.value })}
                        placeholder="Enter demonstrations on"
                    />
                    <IsOtherCheckbox
                        checked={Boolean(formData.isOther)}
                        onChange={(checked) => setFormData({ ...formData, isOther: checked })}
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.ACHIEVEMENT_PRODUCTION_SUPPLY && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            label="Reporting Date"
                            required
                            type="date"
                            value={formData.reportingYear ?? ''}
                            onChange={handleReportingYearChange}
                        />

                        {/* Product Category - From Product Categories Master */}
                        <MasterDataDropdown
                            label="Product Category"
                            required
                            value={formData.productCategoryId || formData.prodCategory || ''}
                            onChange={handleProductCategoryChange}
                            options={productCategoryOptions}
                            emptyMessage="No product categories available"
                        />
                        {isOtherProductCategory && (
                            <SpecifyOtherInput
                                label="Please specify other product category"
                                required
                                value={formData.productCategoryOther}
                                onChange={(e) => setFormData({ ...formData, productCategoryOther: e.target.value })}
                            />
                        )}

                        {/* Product Type - Dependent on Product Category */}
                        <DependentDropdown
                            label="Product Type"
                            required
                            value={formData.productTypeId || formData.prodSubCategory || ''}
                            onChange={handleProductTypeChange}
                            options={productTypeOptions}
                            dependsOn={{
                                value: formData.productCategoryId,
                                field: 'productCategoryId',
                            }}
                            onOptionsLoad={loadProductTypesByCategory}
                            cacheKey="product-types-by-category"
                            emptyMessage="No product types available for this category"
                            loadingMessage="Loading product types..."
                        />
                        {isOtherProductType && (
                            <SpecifyOtherInput
                                label="Please specify other product type"
                                required
                                value={formData.productTypeOther}
                                onChange={(e) => setFormData({ ...formData, productTypeOther: e.target.value })}
                            />
                        )}

                        {/* Product - Dependent on Product Type */}
                        <DependentDropdown
                            label="Product"
                            required
                            value={formData.productId || formData.speciesName || ''}
                            onChange={handleProductChange}
                            options={productOptions}
                            dependsOn={{
                                value: formData.productTypeId,
                                field: 'productTypeId',
                            }}
                            onOptionsLoad={loadProductsByType}
                            cacheKey="products-by-type"
                            emptyMessage="No products available for this type"
                            loadingMessage="Loading products..."
                        />
                        {isOtherProduct && (
                            <SpecifyOtherInput
                                label="Please specify other product"
                                required
                                value={formData.productOther}
                                onChange={(e) => setFormData({ ...formData, productOther: e.target.value })}
                            />
                        )}

                        {/* Species / Breed / Variety — free text */}
                        <FormInput
                            label="Species / Breed / Variety"
                            required
                            value={formData.speciesName ?? ''}
                            onChange={handleSpeciesNameChange}
                            placeholder="Enter species / breed / variety"
                        />

                        {/* Unit and Quantity — driven by the selected product's master */}
                        {(() => {
                            const selectedProduct: any = products.find((p: any) => Number(p.productId) === Number(formData.productId))
                            const dataType = selectedProduct?.quantityDataType || 'decimal'
                            const masterUnit = selectedProduct?.unit?.unitName || formData.unit || ''
                            const required = Boolean(selectedProduct?.quantityRequired)
                            const setText = (v: string) =>
                                setFormData({ ...formData, quantityText: v, quantity: 0, unit: masterUnit })
                            const setNumber = (raw: string) => {
                                const v = dataType === 'number' ? raw.replace(/[^0-9]/g, '') : raw
                                setFormData({ ...formData, quantity: v, quantityText: null, unit: masterUnit })
                            }
                            return (
                                <div className="grid grid-cols-2 gap-4">
                                    <FormInput
                                        label="Unit"
                                        value={masterUnit}
                                        readOnly
                                        onChange={() => {}}
                                        placeholder={formData.productId ? '' : 'Select product'}
                                    />
                                    {dataType === 'boolean' ? (
                                        <FormSelect
                                            label="Quantity"
                                            required={required}
                                            value={formData.quantityText ?? ''}
                                            onChange={(e) => setText(e.target.value)}
                                            options={[{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]}
                                        />
                                    ) : dataType === 'string' ? (
                                        <FormInput
                                            label="Quantity"
                                            required={required}
                                            value={formData.quantityText ?? ''}
                                            onChange={(e) => setText(e.target.value)}
                                            placeholder="e.g. N/A"
                                        />
                                    ) : (
                                        <FormInput
                                            label="Quantity"
                                            required={required}
                                            type="number"
                                            step={dataType === 'number' ? '1' : 'any'}
                                            value={formData.quantity ?? ''}
                                            onChange={(e) => setNumber(e.target.value)}
                                        />
                                    )}
                                </div>
                            )
                        })()}

                        {/* Value */}
                        <FormInput
                            label="Value(Rs)"
                            required
                            type="number"
                            value={formData.value ?? ''}
                            onChange={handleValueChange}
                        />
                    </div>

                    <FormSection title="Farmers Details">
                        <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormInput
                                label="General_M"
                                required
                                type="number"
                                value={formData.gen_m ?? ''}
                                onChange={handleFarmerFieldChange('gen_m')}
                            />
                            <FormInput
                                label="General_F"
                                required
                                type="number"
                                value={formData.gen_f ?? ''}
                                onChange={handleFarmerFieldChange('gen_f')}
                            />
                            <FormInput
                                label="OBC_M"
                                required
                                type="number"
                                value={formData.obc_m ?? ''}
                                onChange={handleFarmerFieldChange('obc_m')}
                            />
                            <FormInput
                                label="OBC_F"
                                required
                                type="number"
                                value={formData.obc_f ?? ''}
                                onChange={handleFarmerFieldChange('obc_f')}
                            />
                            <FormInput
                                label="SC_M"
                                required
                                type="number"
                                value={formData.sc_m ?? ''}
                                onChange={handleFarmerFieldChange('sc_m')}
                            />
                            <FormInput
                                label="SC_F"
                                required
                                type="number"
                                value={formData.sc_f ?? ''}
                                onChange={handleFarmerFieldChange('sc_f')}
                            />
                            <FormInput
                                label="ST_M"
                                required
                                type="number"
                                value={formData.st_m ?? ''}
                                onChange={handleFarmerFieldChange('st_m')}
                            />
                            <FormInput
                                label="ST_F"
                                required
                                type="number"
                                value={formData.st_f ?? ''}
                                onChange={handleFarmerFieldChange('st_f')}
                            />
                        </div>

                        <div className="flex flex-wrap gap-3 pt-4">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E8F5E9] border border-[#C8E6C9]">
                                <span className="text-xs font-semibold text-[#2E7D32] uppercase">Total Male</span>
                                <span className="text-sm font-bold text-[#1B5E20] tabular-nums">
                                    {(Number(formData.gen_m) || 0) +
                                        (Number(formData.obc_m) || 0) +
                                        (Number(formData.sc_m) || 0) +
                                        (Number(formData.st_m) || 0)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#FCE4EC] border border-[#F8BBD0]">
                                <span className="text-xs font-semibold text-[#AD1457] uppercase">Total Female</span>
                                <span className="text-sm font-bold text-[#880E4F] tabular-nums">
                                    {(Number(formData.gen_f) || 0) +
                                        (Number(formData.obc_f) || 0) +
                                        (Number(formData.sc_f) || 0) +
                                        (Number(formData.st_f) || 0)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E3F2FD] border border-[#BBDEFB]">
                                <span className="text-xs font-semibold text-[#1565C0] uppercase">Overall Total</span>
                                <span className="text-sm font-bold text-[#0D47A1] tabular-nums">
                                    {(Number(formData.gen_m) || 0) +
                                        (Number(formData.gen_f) || 0) +
                                        (Number(formData.obc_m) || 0) +
                                        (Number(formData.obc_f) || 0) +
                                        (Number(formData.sc_m) || 0) +
                                        (Number(formData.sc_f) || 0) +
                                        (Number(formData.st_m) || 0) +
                                        (Number(formData.st_f) || 0)}
                                </span>
                            </div>
                        </div>
                    </FormSection>
                </div>
            )}
        </>
    )
}
