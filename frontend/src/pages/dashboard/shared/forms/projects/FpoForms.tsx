import React from 'react'
import { ENTITY_TYPES } from '../../../../../constants/entityTypes'
import { FormInput, FormSelect } from '../shared/FormComponents'

interface FpoFormsProps {
    entityType: string
    formData: any
    setFormData: (data: any) => void
    years: any[]
}

export const FpoForms: React.FC<FpoFormsProps> = ({
    entityType,
    formData,
    setFormData,
    years
}) => {
    return (
        <>
            {entityType === ENTITY_TYPES.PROJECT_FPO_DETAILS && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect
                            label="Reporting Year"
                            required
                            value={formData.yearId || ''}
                            onChange={(e) => setFormData({ ...formData, yearId: parseInt(e.target.value) })}
                            options={years.map((y: any) => ({ value: String(y.id || y.yearId), label: y.yearName || y.year || y.name }))}
                        />
                        <FormInput
                            label="No. of blocks allocated"
                            required
                            type="number"
                            value={formData.blocksAllocated || ''}
                            onChange={(e) => setFormData({ ...formData, blocksAllocated: e.target.value })}
                        />
                        <FormInput
                            label="No. of FPOs registered as CBBO"
                            required
                            type="number"
                            value={formData.fposRegisteredAsCbbo || ''}
                            onChange={(e) => setFormData({ ...formData, fposRegisteredAsCbbo: e.target.value })}
                        />
                        <FormInput
                            label="Average no of members per FPO"
                            required
                            type="number"
                            value={formData.avgMembersPerFpo || ''}
                            onChange={(e) => setFormData({ ...formData, avgMembersPerFpo: e.target.value })}
                        />
                        <FormInput
                            label="No. of FPO received Management cost"
                            required
                            type="number"
                            value={formData.fposReceivedMgmtCost || ''}
                            onChange={(e) => setFormData({ ...formData, fposReceivedMgmtCost: e.target.value })}
                        />
                        <FormInput
                            label="No. of FPO received Equitys Grant"
                            required
                            type="number"
                            value={formData.fposReceivedEquityGrant || ''}
                            onChange={(e) => setFormData({ ...formData, fposReceivedEquityGrant: e.target.value })}
                        />
                        <FormInput
                            label="Tech. backstopping provided to no. of FPOs"
                            required
                            type="number"
                            value={formData.techBackstoppingFpos || ''}
                            onChange={(e) => setFormData({ ...formData, techBackstoppingFpos: e.target.value })}
                        />
                        <FormInput
                            label="No. of training programme organized for FPOs for Technology backstopping as CBBO"
                            required
                            type="number"
                            value={formData.trainingProgsOrganized || ''}
                            onChange={(e) => setFormData({ ...formData, trainingProgsOrganized: e.target.value })}
                        />
                        <FormSelect
                            label="Training received by FPO members"
                            required
                            value={formData.trainingReceivedByMembers || ''}
                            onChange={(e) => setFormData({ ...formData, trainingReceivedByMembers: e.target.value })}
                            options={[
                                { value: 'Yes', label: 'Yes' },
                                { value: 'No', label: 'No' },
                            ]}
                        />
                        <FormInput
                            label="Assistance to no. of FPOs in economic activities"
                            required
                            type="number"
                            value={formData.assistanceEconomicActivities || ''}
                            onChange={(e) => setFormData({ ...formData, assistanceEconomicActivities: e.target.value })}
                        />
                        <FormSelect
                            label="Is Business plan prepared for FPOs as CBBOs"
                            required
                            value={formData.businessPlanCbbo || ''}
                            onChange={(e) => setFormData({ ...formData, businessPlanCbbo: e.target.value })}
                            options={[
                                { value: 'Yes', label: 'Yes' },
                                { value: 'No', label: 'No' },
                            ]}
                        />
                        <FormSelect
                            label="Is Business plan prepared for FPOs as without CBBOs"
                            required
                            value={formData.businessPlanWithoutCbbo || ''}
                            onChange={(e) => setFormData({ ...formData, businessPlanWithoutCbbo: e.target.value })}
                            options={[
                                { value: 'Yes', label: 'Yes' },
                                { value: 'No', label: 'No' },
                            ]}
                        />
                        <FormInput
                            label="No. Of FPOs doing business"
                            required
                            type="number"
                            value={formData.fposDoingBusiness || ''}
                            onChange={(e) => setFormData({ ...formData, fposDoingBusiness: e.target.value })}
                        />
                    </div>
                </div>
            )}
            {entityType === ENTITY_TYPES.PROJECT_FPO_MANAGEMENT && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect
                            label="Reporting Year"
                            required
                            value={formData.yearId || ''}
                            onChange={(e) => setFormData({ ...formData, yearId: parseInt(e.target.value) })}
                            options={years.map((y: any) => ({ value: String(y.id || y.yearId), label: y.yearName || y.year || y.name }))}
                        />
                        <FormInput
                            label="Name of the FPO"
                            required
                            value={formData.fpoName || ''}
                            onChange={(e) => setFormData({ ...formData, fpoName: e.target.value })}
                        />
                        <FormInput
                            label="Address of FPO"
                            required
                            value={formData.fpoAddress || ''}
                            onChange={(e) => setFormData({ ...formData, fpoAddress: e.target.value })}
                        />
                        <FormInput
                            label="Registration No"
                            required
                            value={formData.registrationNo || ''}
                            onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value })}
                        />
                        <FormInput
                            label="Date of Registration"
                            required
                            type="date"
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
                            required
                            type="number"
                            value={formData.bomMembersCount || ''}
                            onChange={(e) => setFormData({ ...formData, bomMembersCount: e.target.value })}
                        />
                        <FormInput
                            label="Total no of farmers attached"
                            required
                            type="number"
                            value={formData.farmersAttachedCount || ''}
                            onChange={(e) => setFormData({ ...formData, farmersAttachedCount: e.target.value })}
                        />
                        <FormInput
                            label="Financial position (Rupees in lakh)"
                            required
                            type="number"
                            value={formData.financialPosition || ''}
                            onChange={(e) => setFormData({ ...formData, financialPosition: e.target.value })}
                        />
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
