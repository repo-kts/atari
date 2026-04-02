import React from 'react'
import { ENTITY_TYPES } from '@/constants/entityConstants'
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
                            value={formData.programmeName ?? ''}
                            onChange={(e) => setFormData({ ...formData, programmeName: e.target.value })}
                        />
                        <FormInput
                            label="Date of the programme"
                            required
                            type="date"
                            value={formData.programmeDate ? new Date(formData.programmeDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => setFormData({ ...formData, programmeDate: e.target.value })}
                        />
                        <FormInput
                            label="Venue"
                            required
                            value={formData.venue ?? ''}
                            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                        />
                        <FormInput
                            label="Purpose"
                            required
                            value={formData.purpose ?? ''}
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
                                value={formData.farmersGeneralM ?? ''}
                                onChange={(e) => setFormData({ ...formData, farmersGeneralM: e.target.value })}
                            />
                            <FormInput
                                label="General_F"
                                required
                                type="number"
                                value={formData.farmersGeneralF ?? ''}
                                onChange={(e) => setFormData({ ...formData, farmersGeneralF: e.target.value })}
                            />
                            <FormInput
                                label="OBC_M"
                                required
                                type="number"
                                value={formData.farmersObcM ?? ''}
                                onChange={(e) => setFormData({ ...formData, farmersObcM: e.target.value })}
                            />
                            <FormInput
                                label="OBC_F"
                                required
                                type="number"
                                value={formData.farmersObcF ?? ''}
                                onChange={(e) => setFormData({ ...formData, farmersObcF: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FormInput
                                label="SC_M"
                                required
                                type="number"
                                value={formData.farmersScM ?? ''}
                                onChange={(e) => setFormData({ ...formData, farmersScM: e.target.value })}
                            />
                            <FormInput
                                label="SC_F"
                                required
                                type="number"
                                value={formData.farmersScF ?? ''}
                                onChange={(e) => setFormData({ ...formData, farmersScF: e.target.value })}
                            />
                            <FormInput
                                label="ST_M"
                                required
                                type="number"
                                value={formData.farmersStM ?? ''}
                                onChange={(e) => setFormData({ ...formData, farmersStM: e.target.value })}
                            />
                            <FormInput
                                label="ST_F"
                                required
                                type="number"
                                value={formData.farmersStF ?? ''}
                                onChange={(e) => setFormData({ ...formData, farmersStF: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
