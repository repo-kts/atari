import React from 'react'
import { ENTITY_TYPES } from '../../../../../constants/entityTypes'
import { FormInput, FormTextArea } from '../shared/FormComponents'
import { ExtendedEntityType } from '../../../../../utils/masterUtils'

interface AgriDroneFormsProps {
    entityType: ExtendedEntityType
    formData: any
    setFormData: (data: any) => void
    YearSelect: React.FC
}

export const AgriDroneForms: React.FC<AgriDroneFormsProps> = ({
    entityType,
    formData,
    setFormData,
    YearSelect,
}) => {
    return (
        <>
            {entityType === ENTITY_TYPES.PROJECT_AGRI_DRONE && (
                <div className="space-y-8">
                    <div className="mb-6">
                        <h3 className="text-xl font-normal text-gray-800">Create Agri-Drone</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <YearSelect />

                            <FormInput
                                label="Name of the project implementing centre (PIC)"
                                required
                                value={formData.picName || ''}
                                onChange={(e) => setFormData({ ...formData, picName: e.target.value })}
                            />

                            <FormInput
                                label="No. of Agri Drones Sanctioned"
                                type="number"
                                required
                                value={formData.dronesSanctioned || ''}
                                onChange={(e) => setFormData({ ...formData, dronesSanctioned: e.target.value })}
                            />

                            <FormInput
                                label="No. of Agri Drones Purchased"
                                type="number"
                                required
                                value={formData.dronesPurchased || ''}
                                onChange={(e) => setFormData({ ...formData, dronesPurchased: e.target.value })}
                            />

                            <FormInput
                                label="Amount sanctioned (Rs)"
                                type="number"
                                required
                                value={formData.amountSanctioned || ''}
                                onChange={(e) => setFormData({ ...formData, amountSanctioned: e.target.value })}
                            />

                            <FormInput
                                label="Purchased cost of each Drone (Rs.)"
                                type="number"
                                required
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
                                value={formData.pilotContact || ''}
                                onChange={(e) => setFormData({ ...formData, pilotContact: e.target.value })}
                            />
                        </div>

                        <div className="w-full">
                            <FormInput
                                label="Target Area for Agri Drone Demonstration (ha) (1 demo = 1 ha area)"
                                required
                                value={formData.targetArea || ''}
                                onChange={(e) => setFormData({ ...formData, targetArea: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Amount sanctioned for Agri Drone Demonstrations (Rs.)"
                                type="number"
                                required
                                value={formData.demoAmountSanctioned || ''}
                                onChange={(e) => setFormData({ ...formData, demoAmountSanctioned: e.target.value })}
                            />

                            <FormInput
                                label="Amount utilised for Agri Drone Demonstrations (Rs.)"
                                type="number"
                                required
                                value={formData.demoAmountUtilised || ''}
                                onChange={(e) => setFormData({ ...formData, demoAmountUtilised: e.target.value })}
                            />
                        </div>

                        <div className="w-full">
                            <FormTextArea
                                label="Operation carried out (Pesticide/Weedicide/Nutrient application) in demonstration organised"
                                required
                                value={formData.operationDetails || ''}
                                onChange={(e) => setFormData({ ...formData, operationDetails: e.target.value })}
                            />
                        </div>

                        <div className="w-full">
                            <FormTextArea
                                label="Advantages of using Agri Drones as observed during the demonstrations"
                                required
                                value={formData.advantages || ''}
                                onChange={(e) => setFormData({ ...formData, advantages: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
