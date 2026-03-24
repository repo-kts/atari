import React from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { FormInput, FormTextArea } from '../shared/FormComponents'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { createMasterDataOptions } from '@/utils/formHelpers'

interface AgriDroneFormsProps {
    entityType: string
    formData: any
    setFormData: (data: any) => void
    years: any[]
}

export const AgriDroneForms: React.FC<AgriDroneFormsProps> = ({
    entityType,
    formData,
    setFormData,
    years
}) => {
    return (
        <>
            {entityType === ENTITY_TYPES.PROJECT_AGRI_DRONE && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <MasterDataDropdown
                            label="Reporting Year"
                            required
                            value={formData.reportingYearId || formData.yearId || ''}
                            onChange={(value) => setFormData({ ...formData, reportingYearId: value, yearId: value })}
                            options={createMasterDataOptions(years, 'yearId', 'yearName')}
                            emptyMessage="No reporting years available"
                        />
                        <FormInput
                            label="Name of the project implementing centre (PIC)"
                            required
                            value={formData.projectImplementingCentre || ''}
                            onChange={(e) => setFormData({ ...formData, projectImplementingCentre: e.target.value })}
                        />
                        <FormInput
                            label="No. of Agri Drones Sanctioned"
                            required
                            type="number"
                            value={formData.dronesSanctioned || ''}
                            onChange={(e) => setFormData({ ...formData, dronesSanctioned: e.target.value })}
                        />
                        <FormInput
                            label="No. of Agri Drones Purchased"
                            required
                            type="number"
                            value={formData.dronesPurchased || ''}
                            onChange={(e) => setFormData({ ...formData, dronesPurchased: e.target.value })}
                        />
                        <FormInput
                            label="Amount sanctioned (Rs)"
                            required
                            type="number"
                            value={formData.amountSanctioned || ''}
                            onChange={(e) => setFormData({ ...formData, amountSanctioned: e.target.value })}
                        />
                        <FormInput
                            label="Purchased cost of each Drone (Rs.)"
                            required
                            type="number"
                            value={formData.costPerDrone || ''}
                            onChange={(e) => setFormData({ ...formData, costPerDrone: e.target.value })}
                        />
                        <FormInput
                            label="Company of Drone"
                            required
                            value={formData.droneCompany || ''}
                            onChange={(e) => setFormData({ ...formData, droneCompany: e.target.value })}
                        />
                        <FormInput
                            label="Model of Drone"
                            required
                            value={formData.droneModel || ''}
                            onChange={(e) => setFormData({ ...formData, droneModel: e.target.value })}
                        />
                        <FormInput
                            label="Name Agri Drone Pilot"
                            required
                            value={formData.pilotName || ''}
                            onChange={(e) => setFormData({ ...formData, pilotName: e.target.value })}
                        />
                        <FormInput
                            label="Contact No of Agri Drone Pilot"
                            required
                            placeholder="Mobile number"
                            value={formData.pilotContact || ''}
                            onChange={(e) => setFormData({ ...formData, pilotContact: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        <FormInput
                            label="Target Area for Agri Drone Demonstration (ha) (1 demo = 1 ha area)"
                            required
                            type="number"
                            value={formData.targetAreaHa || ''}
                            onChange={(e) => setFormData({ ...formData, targetAreaHa: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Amount sanctioned for Agri Drone Demonstrations (Rs.)"
                            required
                            type="number"
                            value={formData.demoAmountSanctioned || ''}
                            onChange={(e) => setFormData({ ...formData, demoAmountSanctioned: e.target.value })}
                        />
                        <FormInput
                            label="Amount utilised for Agri Drone Demonstrations (Rs.)"
                            required
                            type="number"
                            value={formData.demoAmountUtilised || ''}
                            onChange={(e) => setFormData({ ...formData, demoAmountUtilised: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        <FormTextArea
                            label="Operation carried out (Pesticide/Weedicide/Nutrient application) in demonstration organised"
                            required
                            value={formData.operationType || ''}
                            onChange={(e) => setFormData({ ...formData, operationType: e.target.value })}
                            rows={3}
                        />
                        <FormTextArea
                            label="Advantages of using Agri Drones as observed during the demonstrations"
                            required
                            value={formData.advantagesObserved || ''}
                            onChange={(e) => setFormData({ ...formData, advantagesObserved: e.target.value })}
                            rows={3}
                        />
                    </div>
                </div>
            )}
        </>
    )
}
