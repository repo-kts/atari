import React from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
import { FormInput, FormSelect, FormTextArea } from '../shared/FormComponents'
import { MasterDataDropdown } from '@/components/common/MasterDataDropdown'
import { createMasterDataOptions } from '@/utils/formHelpers'
import { cleanIndianMobileInput } from '@/utils/indianPhone'

interface AgriDroneFormsProps {
    entityType: string
    formData: any
    setFormData: (data: any) => void
    districts: any[]
    demonstrationsOnMasters: any[]
    agriDroneIntros: any[]
}

export const AgriDroneForms: React.FC<AgriDroneFormsProps> = ({
    entityType,
    formData,
    setFormData,
    districts,
    demonstrationsOnMasters,
    agriDroneIntros
}) => {
    return (
        <>
            {entityType === ENTITY_TYPES.PROJECT_AGRI_DRONE && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Reporting Year"
                            required
                            type="date"
                            value={formData.reportingYear ?? ''}
                            onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
                        />
                        <FormInput
                            label="Name of the project implementing centre (PIC)"
                            required
                            value={formData.projectImplementingCentre ?? ''}
                            onChange={(e) => setFormData({ ...formData, projectImplementingCentre: e.target.value })}
                        />
                        <FormInput
                            label="No. of Agri Drones Sanctioned"
                            required
                            type="number"
                            value={formData.dronesSanctioned ?? ''}
                            onChange={(e) => setFormData({ ...formData, dronesSanctioned: e.target.value })}
                        />
                        <FormInput
                            label="No. of Agri Drones Purchased"
                            required
                            type="number"
                            value={formData.dronesPurchased ?? ''}
                            onChange={(e) => setFormData({ ...formData, dronesPurchased: e.target.value })}
                        />
                        <FormInput
                            label="Amount sanctioned (Rs)"
                            required
                            type="number"
                            value={formData.amountSanctioned ?? ''}
                            onChange={(e) => setFormData({ ...formData, amountSanctioned: e.target.value })}
                        />
                        <FormInput
                            label="Purchased cost of each Drone (Rs.)"
                            required
                            type="number"
                            value={formData.costPerDrone ?? ''}
                            onChange={(e) => setFormData({ ...formData, costPerDrone: e.target.value })}
                        />
                        <FormInput
                            label="Company of Drone"
                            required
                            value={formData.droneCompany ?? ''}
                            onChange={(e) => setFormData({ ...formData, droneCompany: e.target.value })}
                        />
                        <FormInput
                            label="Model of Drone"
                            required
                            value={formData.droneModel ?? ''}
                            onChange={(e) => setFormData({ ...formData, droneModel: e.target.value })}
                        />
                        <FormInput
                            label="Name Agri Drone Pilot"
                            required
                            value={formData.pilotName ?? ''}
                            onChange={(e) => setFormData({ ...formData, pilotName: e.target.value })}
                        />
                        <FormInput
                            label="Contact No of Agri Drone Pilot"
                            required
                            placeholder="10-digit mobile"
                            value={formData.pilotContact ?? ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    pilotContact: cleanIndianMobileInput(e.target.value),
                                })
                            }
                            inputMode="numeric"
                            autoComplete="tel"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        <FormInput
                            label="Target Area for Agri Drone Demonstration (ha) (1 demo = 1 ha area)"
                            required
                            type="number"
                            value={formData.targetAreaHa ?? ''}
                            onChange={(e) => setFormData({ ...formData, targetAreaHa: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Amount sanctioned for Agri Drone Demonstrations (Rs.)"
                            required
                            type="number"
                            value={formData.demoAmountSanctioned ?? ''}
                            onChange={(e) => setFormData({ ...formData, demoAmountSanctioned: e.target.value })}
                        />
                        <FormInput
                            label="Amount utilised for Agri Drone Demonstrations (Rs.)"
                            required
                            type="number"
                            value={formData.demoAmountUtilised ?? ''}
                            onChange={(e) => setFormData({ ...formData, demoAmountUtilised: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        <FormTextArea
                            label="Operation carried out (Pesticide/Weedicide/Nutrient application) in demonstration organised"
                            required
                            value={formData.operationType ?? ''}
                            onChange={(e) => setFormData({ ...formData, operationType: e.target.value })}
                            rows={3}
                        />
                        <FormTextArea
                            label="Advantages of using Agri Drones as observed during the demonstrations"
                            required
                            value={formData.advantagesObserved ?? ''}
                            onChange={(e) => setFormData({ ...formData, advantagesObserved: e.target.value })}
                            rows={3}
                        />
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.PROJECT_AGRI_DRONE_DEMO && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Reporting Year"
                            required
                            type="date"
                            value={formData.reportingYear ?? ''}
                            onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
                        />

                        <MasterDataDropdown
                            label="Demonstrations on"
                            required
                            value={formData.demonstrationsOnId ?? ''}
                            onChange={(value) => setFormData({ ...formData, demonstrationsOnId: value })}
                            options={createMasterDataOptions(
                                demonstrationsOnMasters,
                                'agriDroneDemonstrationsOnId',
                                'demonstrationsOnName'
                            )}
                            emptyMessage="No options available"
                        />

                        <FormSelect
                            label="Name of the project implementing centre (PIC)"
                            required
                            value={formData.agriDroneId ?? ''}
                            onChange={(e) => {
                                const selectedId = parseInt(e.target.value)
                                if (!Number.isFinite(selectedId)) {
                                    setFormData({
                                        ...formData,
                                        agriDroneId: '',
                                        agriDroneIntroId: '',
                                        projectImplementingCentre: '',
                                        picName: '',
                                    })
                                    return
                                }
                                const selected = (agriDroneIntros || []).find((x: any) => (x.id ?? x.agriDroneId) === selectedId)
                                setFormData({
                                    ...formData,
                                    agriDroneId: selectedId,
                                    // alias (some backends/older payloads might use this key)
                                    agriDroneIntroId: selectedId,
                                    // keep these for display/exports
                                    projectImplementingCentre: selected?.projectImplementingCentre || '',
                                    picName: selected?.projectImplementingCentre || '',
                                })
                            }}
                            options={(agriDroneIntros || []).map((x: any) => ({
                                value: x.id ?? x.agriDroneId,
                                label: x.projectImplementingCentre || `Intro #${x.id ?? x.agriDroneId}`,
                            }))}
                            placeholder="Select PIC (from Intro)"
                        />

                        <FormSelect
                            label="Name of district"
                            required
                            value={formData.districtId ?? ''}
                            onChange={(e) => setFormData({ ...formData, districtId: parseInt(e.target.value) })}
                            options={districts.map((d: any) => ({
                                value: d.id || d.districtId,
                                label: d.districtName,
                            }))}
                            placeholder="Select District"
                        />

                        <FormInput
                            label="Date of demonstration"
                            required
                            type="date"
                            value={formData.dateOfDemons || formData.dateOfDemonstration || ''}
                            onChange={(e) =>
                                setFormData({ ...formData, dateOfDemons: e.target.value, dateOfDemonstration: e.target.value })
                            }
                        />

                        <FormInput
                            label="Place of demonstration"
                            required
                            value={formData.placeOfDemons || formData.placeOfDemonstration || ''}
                            onChange={(e) =>
                                setFormData({ ...formData, placeOfDemons: e.target.value, placeOfDemonstration: e.target.value })
                            }
                        />

                        <FormInput
                            label="Crop Name"
                            required
                            value={formData.cropName ?? ''}
                            onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                        />

                        <FormInput
                            label="No. of demos"
                            required
                            type="number"
                            value={formData.noOfDemos ?? ''}
                            onChange={(e) => setFormData({ ...formData, noOfDemos: e.target.value })}
                        />

                        <FormInput
                            label="Area covered under demos (area in ha)"
                            required
                            type="number"
                            value={formData.areaCoveredUnderDemos ?? ''}
                            onChange={(e) => setFormData({ ...formData, areaCoveredUnderDemos: e.target.value })}
                        />

                        <FormInput
                            label="No of farmers participated"
                            required
                            type="number"
                            value={formData.noOfFarmers || formData.noOfFarmersParticipated || ''}
                            onChange={(e) =>
                                setFormData({ ...formData, noOfFarmers: e.target.value, noOfFarmersParticipated: e.target.value })
                            }
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput label="General_M" required type="number" value={formData.generalM ?? ''} onChange={(e) => setFormData({ ...formData, generalM: e.target.value })} />
                        <FormInput label="General_F" required type="number" value={formData.generalF ?? ''} onChange={(e) => setFormData({ ...formData, generalF: e.target.value })} />
                        <FormInput label="OBC_M" required type="number" value={formData.obcM ?? ''} onChange={(e) => setFormData({ ...formData, obcM: e.target.value })} />
                        <FormInput label="OBC_F" required type="number" value={formData.obcF ?? ''} onChange={(e) => setFormData({ ...formData, obcF: e.target.value })} />
                        <FormInput label="SC_M" required type="number" value={formData.scM ?? ''} onChange={(e) => setFormData({ ...formData, scM: e.target.value })} />
                        <FormInput label="SC_F" required type="number" value={formData.scF ?? ''} onChange={(e) => setFormData({ ...formData, scF: e.target.value })} />
                        <FormInput label="ST_M" required type="number" value={formData.stM ?? ''} onChange={(e) => setFormData({ ...formData, stM: e.target.value })} />
                        <FormInput label="ST_F" required type="number" value={formData.stF ?? ''} onChange={(e) => setFormData({ ...formData, stF: e.target.value })} />
                    </div>
                </div>
            )}
        </>
    )
}
