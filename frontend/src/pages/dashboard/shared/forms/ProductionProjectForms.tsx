import React from 'react'
import { ENTITY_TYPES } from '../../../../constants/entityTypes'
import { ExtendedEntityType } from '../../../../utils/masterUtils'
import { FormInput, FormSelect, FormSection } from './shared/FormComponents'
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

            {entityType === ENTITY_TYPES.ACHIEVEMENT_PRODUCTION_SUPPLY && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect
                            label="Reporting Year"
                            required
                            value={formData.reportingYear || ''}
                            onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
                            options={[
                                { value: '2023-24', label: '2023-24' },
                                { value: '2024-25', label: '2024-25' },
                                { value: '2025-26', label: '2025-26' },
                            ]}
                        />
                        <FormSelect
                            label="Category"
                            required
                            value={formData.prodCategory || ''}
                            onChange={(e) => setFormData({ ...formData, prodCategory: e.target.value })}
                            options={[
                                { value: 'Seeds', label: 'Seeds' },
                                { value: 'Planting Material', label: 'Planting Material' },
                                { value: 'Bio-products', label: 'Bio-products' },
                                { value: 'Livestock', label: 'Livestock' },
                            ]}
                        />
                        <FormSelect
                            label="Sub-category"
                            required
                            value={formData.prodSubCategory || ''}
                            onChange={(e) => setFormData({ ...formData, prodSubCategory: e.target.value })}
                            options={[
                                { value: 'Cereals', label: 'Cereals' },
                                { value: 'Pulses', label: 'Pulses' },
                                { value: 'Oilseeds', label: 'Oilseeds' },
                                { value: 'Vegetables', label: 'Vegetables' },
                                { value: 'Fruits', label: 'Fruits' },
                            ]}
                        />
                        <FormSelect
                            label="Type"
                            required
                            value={formData.prodType || ''}
                            onChange={(e) => setFormData({ ...formData, prodType: e.target.value })}
                            options={[
                                { value: 'Foundation', label: 'Foundation' },
                                { value: 'Certified', label: 'Certified' },
                                { value: 'Truthfully Labelled', label: 'Truthfully Labelled' },
                            ]}
                        />
                        <FormInput
                            label="Species / Breed / Variety"
                            required
                            value={formData.speciesName || ''}
                            onChange={(e) => setFormData({ ...formData, speciesName: e.target.value })}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormSelect
                                label="Unit"
                                required
                                value={formData.unit || ''}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                options={[
                                    { value: 'Kg', label: 'Kg' },
                                    { value: 'Quintal', label: 'Quintal' },
                                    { value: 'Nos', label: 'Nos' },
                                ]}
                            />
                            <FormInput
                                label="Quantity"
                                required
                                type="number"
                                value={formData.quantity || ''}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            />
                        </div>
                        <FormInput
                            label="Value(Rs)"
                            required
                            type="number"
                            value={formData.value || ''}
                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        />
                    </div>

                    <FormSection title="Farmers Details">
                        <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormInput label="General_M" required type="number" value={formData.gen_m || ''} onChange={e => setFormData({ ...formData, gen_m: e.target.value })} />
                            <FormInput label="General_F" required type="number" value={formData.gen_f || ''} onChange={e => setFormData({ ...formData, gen_f: e.target.value })} />
                            <FormInput label="OBC_M" required type="number" value={formData.obc_m || ''} onChange={e => setFormData({ ...formData, obc_m: e.target.value })} />
                            <FormInput label="OBC_F" required type="number" value={formData.obc_f || ''} onChange={e => setFormData({ ...formData, obc_f: e.target.value })} />

                            <FormInput label="SC_M" required type="number" value={formData.sc_m || ''} onChange={e => setFormData({ ...formData, sc_m: e.target.value })} />
                            <FormInput label="SC_F" required type="number" value={formData.sc_f || ''} onChange={e => setFormData({ ...formData, sc_f: e.target.value })} />
                            <FormInput label="ST_M" required type="number" value={formData.st_m || ''} onChange={e => setFormData({ ...formData, st_m: e.target.value })} />
                            <FormInput label="ST_F" required type="number" value={formData.st_f || ''} onChange={e => setFormData({ ...formData, st_f: e.target.value })} />
                        </div>
                    </FormSection>
                </div>
            )}
        </>
    )
}
