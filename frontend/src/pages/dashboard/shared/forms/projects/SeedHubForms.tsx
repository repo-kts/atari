import React from 'react'
import { ENTITY_TYPES } from '../../../../../constants/entityTypes'
import { FormInput, FormSelect } from '../shared/FormComponents'

interface SeedHubFormsProps {
    entityType: string
    formData: any
    setFormData: (data: any) => void
    years: any[]
    seasons: any[]
}

export const SeedHubForms: React.FC<SeedHubFormsProps> = ({
    entityType,
    formData,
    setFormData,
    years,
    seasons
}) => {
    return (
        <>
            {entityType === ENTITY_TYPES.PROJECT_SEED_HUB && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormSelect
                            label="Reporting Year"
                            required
                            value={formData.yearId || ''}
                            onChange={(e) => setFormData({ ...formData, yearId: parseInt(e.target.value) })}
                            options={years.map((y: any) => ({ value: String(y.id || y.yearId), label: y.yearName || y.year || y.name }))}
                        />
                        <FormSelect
                            label="Season"
                            required
                            value={formData.seasonId || ''}
                            onChange={(e) => setFormData({ ...formData, seasonId: parseInt(e.target.value) })}
                            options={seasons.map((s: any) => ({ value: s.id || s.seasonId, label: s.seasonName }))}
                        />
                        <FormInput
                            label="Name of crop taken under seed production"
                            required
                            value={formData.cropName || ''}
                            onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                        />
                        <FormInput
                            label="Name of variety taken under seed production"
                            required
                            value={formData.varietyName || ''}
                            onChange={(e) => setFormData({ ...formData, varietyName: e.target.value })}
                        />
                        <FormInput
                            label="Crop and variety wise area (ha) covered under seed production"
                            required
                            type="number"
                            value={formData.areaCovered || ''}
                            onChange={(e) => setFormData({ ...formData, areaCovered: e.target.value })}
                        />
                        <FormInput
                            label="Crop and variety wise Yield (Q/ha)"
                            required
                            type="number"
                            value={formData.yield || ''}
                            onChange={(e) => setFormData({ ...formData, yield: e.target.value })}
                        />
                        <FormInput
                            label="Crop and variety wise quantity of seed produced (Q)"
                            required
                            type="number"
                            value={formData.quantityProduced || ''}
                            onChange={(e) => setFormData({ ...formData, quantityProduced: e.target.value })}
                        />
                        <FormInput
                            label="Crop and variety wise quantity of seed sale out (Q)"
                            required
                            type="number"
                            value={formData.quantitySold || ''}
                            onChange={(e) => setFormData({ ...formData, quantitySold: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        <FormInput
                            label="Crop and variety wise number of farmers purchased seed from KVK"
                            required
                            type="number"
                            value={formData.farmersCount || ''}
                            onChange={(e) => setFormData({ ...formData, farmersCount: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Quantity of seed sale out to farmers (Q)"
                            required
                            type="number"
                            value={formData.quantitySoldFarmers || ''}
                            onChange={(e) => setFormData({ ...formData, quantitySoldFarmers: e.target.value })}
                        />
                        <FormInput
                            label="No of village covered through sale of seed"
                            required
                            type="number"
                            value={formData.villagesCovered || ''}
                            onChange={(e) => setFormData({ ...formData, villagesCovered: e.target.value })}
                        />
                        <FormInput
                            label="Quantity of seed sale out to other organization (Q)"
                            required
                            type="number"
                            value={formData.quantitySoldOrg || ''}
                            onChange={(e) => setFormData({ ...formData, quantitySoldOrg: e.target.value })}
                        />
                        <FormInput
                            label="Amount generated (Lakh) during"
                            required
                            type="number"
                            value={formData.amountGenerated || ''}
                            onChange={(e) => setFormData({ ...formData, amountGenerated: e.target.value })}
                        />
                        <FormInput
                            label="Total amount (Lakh) in Seed Hub project presently"
                            required
                            type="number"
                            value={formData.totalAmountPresently || ''}
                            onChange={(e) => setFormData({ ...formData, totalAmountPresently: e.target.value })}
                        />
                    </div>
                </div>
            )}
        </>
    )
}
