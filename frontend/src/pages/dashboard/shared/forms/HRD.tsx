import React from 'react'
import { ENTITY_TYPES } from '../../../../constants/entityTypes'
import { ExtendedEntityType } from '../../../../utils/masterUtils'
import { FormInput, FormSelect } from './shared/FormComponents'

interface HRDProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

export const HRD: React.FC<HRDProps> = ({
    entityType,
    formData,
    setFormData,
}) => {
    if (!entityType) return null

    return (
        <>
            {entityType === ENTITY_TYPES.ACHIEVEMENT_HRD && (
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800">Add HRD Program</h2>

                    {/* Row 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect
                            label="Name of Staff"
                            value={formData.staffName || ''}
                            onChange={(e) => setFormData({ ...formData, staffName: e.target.value })}
                            options={[
                                { value: 'Dr. Sharma', label: 'Dr. Sharma' },
                                { value: 'Dr. Patel', label: 'Dr. Patel' },
                                { value: 'Mr. Kumar', label: 'Mr. Kumar' },
                            ]}
                            placeholder="--Please Select--"
                        />
                        <FormInput
                            label="Course Name"
                            required
                            value={formData.courseName || ''}
                            onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                        />
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormInput
                            label="Start Date"
                            type="date"
                            required
                            value={formData.startDate || ''}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                        <FormInput
                            label="End Date"
                            type="date"
                            required
                            value={formData.endDate || ''}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                        <FormInput
                            label="Organizer/Venue"
                            required
                            value={formData.organizerVenue || ''}
                            onChange={(e) => setFormData({ ...formData, organizerVenue: e.target.value })}
                        />
                    </div>
                </div>
            )}
        </>
    )
}
