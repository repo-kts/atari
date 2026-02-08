import React from 'react'
import { ENTITY_TYPES } from '../../../../constants/entityTypes'
import { ExtendedEntityType } from '../../../../utils/masterUtils'
import { FormInput, FormSelect } from './shared/FormComponents'
import { Zone, State } from '../../../../types/masterData'
import { useMasterData } from '../../../../hooks/useMasterData'

interface BasicMasterFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

export const BasicMasterForms: React.FC<BasicMasterFormsProps> = ({
    entityType,
    formData,
    setFormData,
}) => {
    // useMasterData doesn't support 'enabled' option currently, but since this 
    // component is conditionally rendered, the useEffect inside useMasterData 
    // will only trigger when this component mounts.
    const { data: zones = [] } = useMasterData<Zone>('zones')
    const { data: states = [] } = useMasterData<State>('states')

    if (!entityType) return null

    return (
        <>
            {entityType === ENTITY_TYPES.ZONES && (
                <FormInput
                    label="Zone Name"
                    required
                    value={formData.zoneName || ''}
                    onChange={(e) => setFormData({ ...formData, zoneName: e.target.value })}
                    placeholder="Enter zone name"
                />
            )}

            {entityType === ENTITY_TYPES.STATES && (
                <div className="space-y-4">
                    <FormInput
                        label="State Name"
                        required
                        value={formData.stateName || ''}
                        onChange={(e) => setFormData({ ...formData, stateName: e.target.value })}
                        placeholder="Enter state name"
                    />
                    <FormSelect
                        label="Zone"
                        required
                        value={formData.zoneId || ''}
                        onChange={(e) => setFormData({ ...formData, zoneId: parseInt(e.target.value) })}
                        options={zones.map(z => ({ value: z.zoneId, label: z.zoneName }))}
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.DISTRICTS && (
                <div className="space-y-4">
                    <FormInput
                        label="District Name"
                        required
                        value={formData.districtName || ''}
                        onChange={(e) => setFormData({ ...formData, districtName: e.target.value })}
                        placeholder="Enter district name"
                    />
                    <FormSelect
                        label="Zone"
                        required
                        value={formData.zoneId || ''}
                        onChange={(e) => {
                            const zoneId = parseInt(e.target.value)
                            setFormData({ ...formData, zoneId, stateId: '' })
                        }}
                        options={zones.map(z => ({ value: z.zoneId, label: z.zoneName }))}
                    />
                    <FormSelect
                        label="State"
                        required
                        value={formData.stateId || ''}
                        onChange={(e) => setFormData({ ...formData, stateId: parseInt(e.target.value) })}
                        disabled={!formData.zoneId}
                        options={states
                            .filter((state) => state.zoneId === formData.zoneId)
                            .map(s => ({ value: s.stateId, label: s.stateName }))}
                    />
                </div>
            )}

            {entityType === ENTITY_TYPES.ORGANIZATIONS && (
                <div className="space-y-4">
                    <FormInput
                        label="Organization Name"
                        required
                        value={formData.uniName || ''}
                        onChange={(e) => setFormData({ ...formData, uniName: e.target.value })}
                        placeholder="Enter organization name"
                    />
                    <FormSelect
                        label="State"
                        required
                        value={formData.stateId || ''}
                        onChange={(e) => setFormData({ ...formData, stateId: parseInt(e.target.value) })}
                        options={states.map(s => ({ value: s.stateId, label: s.stateName }))}
                    />
                </div>
            )}
        </>
    )
}
