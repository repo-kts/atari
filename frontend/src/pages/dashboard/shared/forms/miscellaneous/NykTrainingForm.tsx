import React from 'react'
import { FormInput } from '../shared/FormComponents'

interface NykTrainingFormProps {
    formData: any
    setFormData: (data: any) => void
}

export const NykTrainingForm: React.FC<NykTrainingFormProps> = ({ formData, setFormData }) => {
    return (
        <div className="space-y-6">
            <p className="text-sm text-green-600 font-medium">
                Note : Please select Financial Year Wise Date Range i.e Date Range would be from 01st of April – 31st of March
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                    label="Title of the training programme"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter title of the training programme"
                />

                <FormInput
                    label="Start Date"
                    required
                    type="date"
                    value={formData.startDate ? (typeof formData.startDate === 'string' ? formData.startDate.split('T')[0] : new Date(formData.startDate).toISOString().split('T')[0]) : ''}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />

                <FormInput
                    label="End Date"
                    required
                    type="date"
                    value={formData.endDate ? (typeof formData.endDate === 'string' ? formData.endDate.split('T')[0] : new Date(formData.endDate).toISOString().split('T')[0]) : ''}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
            </div>

            <div>
                <h3 className="text-base font-semibold text-gray-700 mb-4">No. of the participant</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FormInput
                        label="General_M"
                        required
                        type="number"
                        min="0"
                        value={formData.generalM ?? ''}
                        onChange={(e) => setFormData({ ...formData, generalM: e.target.value })}
                        placeholder="0"
                    />
                    <FormInput
                        label="General_F"
                        required
                        type="number"
                        min="0"
                        value={formData.generalF ?? ''}
                        onChange={(e) => setFormData({ ...formData, generalF: e.target.value })}
                        placeholder="0"
                    />
                    <FormInput
                        label="OBC_M"
                        required
                        type="number"
                        min="0"
                        value={formData.obcM ?? ''}
                        onChange={(e) => setFormData({ ...formData, obcM: e.target.value })}
                        placeholder="0"
                    />
                    <FormInput
                        label="OBC_F"
                        required
                        type="number"
                        min="0"
                        value={formData.obcF ?? ''}
                        onChange={(e) => setFormData({ ...formData, obcF: e.target.value })}
                        placeholder="0"
                    />
                    <FormInput
                        label="SC_M"
                        required
                        type="number"
                        min="0"
                        value={formData.scM ?? ''}
                        onChange={(e) => setFormData({ ...formData, scM: e.target.value })}
                        placeholder="0"
                    />
                    <FormInput
                        label="SC_F"
                        required
                        type="number"
                        min="0"
                        value={formData.scF ?? ''}
                        onChange={(e) => setFormData({ ...formData, scF: e.target.value })}
                        placeholder="0"
                    />
                    <FormInput
                        label="ST_M"
                        required
                        type="number"
                        min="0"
                        value={formData.stM ?? ''}
                        onChange={(e) => setFormData({ ...formData, stM: e.target.value })}
                        placeholder="0"
                    />
                    <FormInput
                        label="ST_F"
                        required
                        type="number"
                        min="0"
                        value={formData.stF ?? ''}
                        onChange={(e) => setFormData({ ...formData, stF: e.target.value })}
                        placeholder="0"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                    label="Amount of Fund Received (Rs)"
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.fundReceived ?? ''}
                    onChange={(e) => setFormData({ ...formData, fundReceived: e.target.value })}
                    placeholder="0.00"
                />
            </div>
        </div>
    )
}
