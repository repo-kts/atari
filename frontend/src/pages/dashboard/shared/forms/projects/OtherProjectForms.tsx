import React from 'react'
import { ENTITY_TYPES } from '../../../../../constants/entityTypes'
import { FormInput } from '../shared/FormComponents'

interface OtherProjectFormsProps {
    entityType: string
    formData: any
    setFormData: (data: any) => void
}

export const OtherProjectForms: React.FC<OtherProjectFormsProps> = ({
    entityType,
    formData,
    setFormData
}) => {
    return (
        <>
            {entityType === ENTITY_TYPES.PROJECT_OTHER && (
                <div className="space-y-12">
                    {/* Basic Programme Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Name of the programme"
                            required
                            value={formData.programmeName || ''}
                            onChange={(e) => setFormData({ ...formData, programmeName: e.target.value })}
                        />
                        <FormInput
                            label="Date of the programme"
                            required
                            type="date"
                            value={formData.programmeDate || ''}
                            onChange={(e) => setFormData({ ...formData, programmeDate: e.target.value })}
                        />
                        <FormInput
                            label="Venue"
                            required
                            value={formData.venue || ''}
                            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                        />
                        <FormInput
                            label="Purpose"
                            required
                            value={formData.purpose || ''}
                            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                        />
                    </div>

                    {/* Participant Details Section */}
                    <div className="space-y-8">
                        <h3 className="text-xl font-bold text-gray-800">No. of farmers participant</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FormInput
                                label="General_M"
                                required
                                type="number"
                                value={formData.genMale || ''}
                                onChange={(e) => setFormData({ ...formData, genMale: e.target.value })}
                            />
                            <FormInput
                                label="General_F"
                                required
                                type="number"
                                value={formData.genFemale || ''}
                                onChange={(e) => setFormData({ ...formData, genFemale: e.target.value })}
                            />
                            <FormInput
                                label="OBC_M"
                                required
                                type="number"
                                value={formData.obcMale || ''}
                                onChange={(e) => setFormData({ ...formData, obcMale: e.target.value })}
                            />
                            <FormInput
                                label="OBC_F"
                                required
                                type="number"
                                value={formData.obcFemale || ''}
                                onChange={(e) => setFormData({ ...formData, obcFemale: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FormInput
                                label="SC_M"
                                required
                                type="number"
                                value={formData.scMale || ''}
                                onChange={(e) => setFormData({ ...formData, scMale: e.target.value })}
                            />
                            <FormInput
                                label="SC_F"
                                required
                                type="number"
                                value={formData.scFemale || ''}
                                onChange={(e) => setFormData({ ...formData, scFemale: e.target.value })}
                            />
                            <FormInput
                                label="ST_M"
                                required
                                type="number"
                                value={formData.stMale || ''}
                                onChange={(e) => setFormData({ ...formData, stMale: e.target.value })}
                            />
                            <FormInput
                                label="ST_F"
                                required
                                type="number"
                                value={formData.stFemale || ''}
                                onChange={(e) => setFormData({ ...formData, stFemale: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
