import React from 'react'
import { ENTITY_TYPES } from '../../../../../constants/entityTypes'
import { FormInput, FormSelect, FormSection } from '../shared/FormComponents'
import { ExtendedEntityType } from '../../../../../utils/masterUtils'

interface FpoFormsProps {
    entityType: ExtendedEntityType
    formData: any
    setFormData: (data: any) => void
    YearSelect: React.FC
}

export const FpoForms: React.FC<FpoFormsProps> = ({
    entityType,
    formData,
    setFormData,
    YearSelect,
}) => {
    return (
        <>
            {/* FPO Details Form */}
            {entityType === ENTITY_TYPES.PROJECT_FPO_DETAILS && (
                <div className="space-y-8">
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#487749] pb-2 border-b border-[#E8F5E9]">Add Formation and Promotion of FPOs as CBBOs under NCDC funding</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <YearSelect />
                            <FormInput
                                label="No. of blocks allocated"
                                type="number"
                                required
                                value={formData.blocksAllocated || ''}
                                onChange={(e) => setFormData({ ...formData, blocksAllocated: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="No. of FPOs registered as CBBO"
                            type="number"
                            required
                            value={formData.fposRegisteredAsCBBO || ''}
                            onChange={(e) => setFormData({ ...formData, fposRegisteredAsCBBO: e.target.value })}
                        />
                        <FormInput
                            label="Average no of members per FPO"
                            type="number"
                            required
                            value={formData.avgMembersPerFPO || ''}
                            onChange={(e) => setFormData({ ...formData, avgMembersPerFPO: e.target.value })}
                        />
                        <FormInput
                            label="No. of FPO received Management cost"
                            type="number"
                            required
                            value={formData.fposReceivedManagementCost || ''}
                            onChange={(e) => setFormData({ ...formData, fposReceivedManagementCost: e.target.value })}
                        />
                        <FormInput
                            label="No. of FPO received Equity Grant"
                            type="number"
                            required
                            value={formData.fposReceivedEquityGrant || ''}
                            onChange={(e) => setFormData({ ...formData, fposReceivedEquityGrant: e.target.value })}
                        />
                        <FormInput
                            label="Tech. backstopping provided to no. of FPOs"
                            type="number"
                            required
                            value={formData.techBackstoppingFPOs || ''}
                            onChange={(e) => setFormData({ ...formData, techBackstoppingFPOs: e.target.value })}
                        />
                        <FormInput
                            label="No. of training programme organized for FPOs for Technology backstopping as CBBO"
                            type="number"
                            required
                            value={formData.trainingProgramsOrganized || ''}
                            onChange={(e) => setFormData({ ...formData, trainingProgramsOrganized: e.target.value })}
                        />
                        <FormSelect
                            label="Training received by FPO members"
                            required
                            value={formData.trainingReceivedByMembers || ''}
                            options={[
                                { value: 'Yes', label: 'Yes' },
                                { value: 'No', label: 'No' }
                            ]}
                            onChange={(e) => setFormData({ ...formData, trainingReceivedByMembers: e.target.value })}
                        />
                        <FormInput
                            label="Assistance to no. of FPOs in economic activities"
                            type="number"
                            required
                            value={formData.assistanceToFPOs || ''}
                            onChange={(e) => setFormData({ ...formData, assistanceToFPOs: e.target.value })}
                        />
                        <FormSelect
                            label="Is Business plan prepared for FPOs as CBBOs"
                            required
                            value={formData.isBusinessPlanPreparedCBBOs || ''}
                            options={[
                                { value: 'Yes', label: 'Yes' },
                                { value: 'No', label: 'No' }
                            ]}
                            onChange={(e) => setFormData({ ...formData, isBusinessPlanPreparedCBBOs: e.target.value })}
                        />
                        <FormSelect
                            label="Is Business plan prepared for FPOs as without CBBOs"
                            required
                            value={formData.isBusinessPlanPreparedNonCBBOs || ''}
                            options={[
                                { value: 'Yes', label: 'Yes' },
                                { value: 'No', label: 'No' }
                            ]}
                            onChange={(e) => setFormData({ ...formData, isBusinessPlanPreparedNonCBBOs: e.target.value })}
                        />
                    </div>
                    <div className="w-full">
                        <FormInput
                            label="No. Of FPOs doing business"
                            type="number"
                            required
                            value={formData.fposDoingBusiness || ''}
                            onChange={(e) => setFormData({ ...formData, fposDoingBusiness: e.target.value })}
                        />
                    </div>
                </div>
            )}

            {/* FPO Management Form */}
            {entityType === ENTITY_TYPES.PROJECT_FPO_MANAGEMENT && (
                <div className="space-y-8">
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-[#487749] pb-2 border-b border-[#E8F5E9]">Add Details of commodity-based organizations/farmers cooperative society/FPO formed/Associated with KVK under NCDC funding</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <YearSelect />
                            <FormInput
                                label="Name of the FPO"
                                required
                                value={formData.fpoName || ''}
                                onChange={(e) => setFormData({ ...formData, fpoName: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Address of FPO"
                            required
                            value={formData.address || ''}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                        <FormInput
                            label="Registration No"
                            required
                            value={formData.registrationNumber || ''}
                            onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                        />
                        <FormInput
                            label="Date of Registration"
                            type="date"
                            required
                            value={formData.registrationDate || ''}
                            onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
                        />
                        <FormInput
                            label="Proposed Activity"
                            required
                            value={formData.proposedActivity || ''}
                            onChange={(e) => setFormData({ ...formData, proposedActivity: e.target.value })}
                        />
                        <FormInput
                            label="Commodity Identified"
                            required
                            value={formData.commodityIdentified || ''}
                            onChange={(e) => setFormData({ ...formData, commodityIdentified: e.target.value })}
                        />
                        <FormInput
                            label="Total No. of BOM Members"
                            type="number"
                            required
                            value={formData.bomMembers || ''}
                            onChange={(e) => setFormData({ ...formData, bomMembers: e.target.value })}
                        />
                        <FormInput
                            label="Total no of farmers attached"
                            type="number"
                            required
                            value={formData.farmersAttached || ''}
                            onChange={(e) => setFormData({ ...formData, farmersAttached: e.target.value })}
                        />
                        <FormInput
                            label="Financial position(Rupees in lakh)"
                            type="number"
                            required
                            value={formData.financialPosition || ''}
                            onChange={(e) => setFormData({ ...formData, financialPosition: e.target.value })}
                        />
                    </div>
                    <div className="w-full">
                        <FormInput
                            label="Success indicator"
                            required
                            value={formData.successIndicator || ''}
                            onChange={(e) => setFormData({ ...formData, successIndicator: e.target.value })}
                        />
                    </div>
                </div>
            )}
        </>
    )
}
