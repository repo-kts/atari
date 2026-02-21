import React from 'react'
import { ENTITY_TYPES } from '../../../../../constants/entityTypes'
import { FormInput, FormSelect } from '../shared/FormComponents'
import { ExtendedEntityType } from '../../../../../utils/masterUtils'

interface SeedHubFormsProps {
    entityType: ExtendedEntityType
    formData: any
    setFormData: (data: any) => void
    YearSelect: React.FC
}

export const SeedHubForms: React.FC<SeedHubFormsProps> = ({
    entityType,
    formData,
    setFormData,
    YearSelect,
}) => {
    return (
        <>
            {entityType === ENTITY_TYPES.PROJECT_SEED_HUB && (
                <div className="space-y-8">
                    <div className="space-y-2">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border-b border-[#E8F5E9] pb-2">
                            <h3 className="text-lg font-semibold text-[#487749]">Create Seed Hub Program</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <YearSelect />
                            <FormSelect
                                label="Season"
                                required
                                value={formData.season || ''}
                                options={[
                                    { value: 'Kharif', label: 'Kharif' },
                                    { value: 'Rabi', label: 'Rabi' },
                                    { value: 'Summer', label: 'Summer' }
                                ]}
                                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
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
                                type="number"
                                step="0.01"
                                required
                                value={formData.areaCovered || ''}
                                onChange={(e) => setFormData({ ...formData, areaCovered: e.target.value })}
                            />
                            <FormInput
                                label="Crop and variety wise Yield (Q/ha)"
                                type="number"
                                step="0.01"
                                required
                                value={formData.yield || ''}
                                onChange={(e) => setFormData({ ...formData, yield: e.target.value })}
                            />

                            <FormInput
                                label="Crop and variety wise quantity of seed produced (Q)"
                                type="number"
                                step="0.01"
                                required
                                value={formData.qtyProduced || ''}
                                onChange={(e) => setFormData({ ...formData, qtyProduced: e.target.value })}
                            />
                            <FormInput
                                label="Crop and variety wise quantity of seed sale out (Q)"
                                type="number"
                                step="0.01"
                                required
                                value={formData.qtySold || ''}
                                onChange={(e) => setFormData({ ...formData, qtySold: e.target.value })}
                            />
                        </div>

                        <div className="mt-6">
                            <FormInput
                                label="Crop and variety wise number of farmers purchased seed from KVK"
                                type="number"
                                required
                                value={formData.farmersPurchased || ''}
                                onChange={(e) => setFormData({ ...formData, farmersPurchased: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <FormInput
                                label="Quantity of seed sale out to farmers (Q)"
                                type="number"
                                step="0.01"
                                required
                                value={formData.qtySoldToFarmers || ''}
                                onChange={(e) => setFormData({ ...formData, qtySoldToFarmers: e.target.value })}
                            />
                            <FormInput
                                label="No of village covered through sale of seed"
                                type="number"
                                required
                                value={formData.villagesCovered || ''}
                                onChange={(e) => setFormData({ ...formData, villagesCovered: e.target.value })}
                            />

                            <FormInput
                                label="Quantity of seed sale out to other organization (Q)"
                                type="number"
                                step="0.01"
                                required
                                value={formData.qtySoldOtherOrg || ''}
                                onChange={(e) => setFormData({ ...formData, qtySoldOtherOrg: e.target.value })}
                            />
                            <FormInput
                                label="Amount generated (Lakh) during"
                                type="number"
                                step="0.01"
                                required
                                value={formData.amountGenerated || ''}
                                onChange={(e) => setFormData({ ...formData, amountGenerated: e.target.value })}
                            />

                            <FormInput
                                label="Total amount (Lakh) in Seed Hub project presently"
                                type="number"
                                step="0.01"
                                required
                                value={formData.totalAmountPresently || ''}
                                onChange={(e) => setFormData({ ...formData, totalAmountPresently: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
