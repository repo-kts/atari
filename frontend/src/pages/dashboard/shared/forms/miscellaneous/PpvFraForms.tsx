import React from 'react'
import { FormInput, FormSelect, FormTextArea } from '../shared/FormComponents'
import { ENTITY_TYPES } from '../../../../../constants/entityConstants'
import { ExtendedEntityType } from '../../../../../utils/masterUtils'
import { useMasterData } from '../../../../../hooks/useMasterData'

interface PpvFraTrainingFormProps {
    formData: any
    setFormData: (data: any) => void
}

const PpvFraTrainingForm: React.FC<PpvFraTrainingFormProps> = ({ formData, setFormData }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                    label="Date of training/awareness programme"
                    required
                    type="date"
                    value={formData.programmeDate ? (typeof formData.programmeDate === 'string' ? formData.programmeDate.split('T')[0] : new Date(formData.programmeDate).toISOString().split('T')[0]) : ''}
                    onChange={(e) => setFormData({ ...formData, programmeDate: e.target.value })}
                />
                <FormSelect
                    label="Type"
                    required
                    options={[
                        { value: 'TRAINING', label: 'Training' },
                        { value: 'AWARENESS', label: 'Awareness' }
                    ]}
                    value={formData.type || 'TRAINING'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                />
                <FormInput
                    label="Title"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                <FormInput
                    label="Venue"
                    required
                    value={formData.venue || ''}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                />
                <FormInput
                    label="Resource Person"
                    required
                    value={formData.resourcePerson || ''}
                    onChange={(e) => setFormData({ ...formData, resourcePerson: e.target.value })}
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
        </div>
    )
}

// --- Plant Varieties Form ---
interface PpvFraPlantVarietiesFormProps {
    formData: any
    setFormData: (data: any) => void
}

const PpvFraPlantVarietiesForm: React.FC<PpvFraPlantVarietiesFormProps> = ({ formData, setFormData }) => {
    const { data: districts = [], loading: districtsLoading } = useMasterData('districts')

    // Reporting year options
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 10 }, (_, i) => ({
        value: String(currentYear - i),
        label: String(currentYear - i),
    }));

    const districtOptions = districts.map((d: any) => ({
        value: d.districtName,
        label: d.districtName
    }))

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormSelect
                    label="Reporting Year"
                    required
                    options={[{ value: '', label: 'Select' }, ...yearOptions]}
                    value={formData.reportingYear || ''}
                    onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
                />
                <FormInput
                    label="Name of Crop Registered"
                    required
                    value={formData.cropName || ''}
                    onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                />
                <FormInput
                    label="Farmer Name"
                    required
                    value={formData.farmerName || ''}
                    onChange={(e) => setFormData({ ...formData, farmerName: e.target.value })}
                />
                <FormInput
                    label="Mobile No."
                    required
                    value={formData.mobile || ''}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
                <FormInput
                    label="Village"
                    required
                    value={formData.village || ''}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                />
                <FormInput
                    label="Block"
                    required
                    value={formData.block || ''}
                    onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                />
                <FormSelect
                    label="District"
                    required
                    options={districtOptions}
                    value={formData.district || ''}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder={districtsLoading ? 'Loading districts...' : 'Select District'}
                />
            </div>

            <FormTextArea
                label="Characteristics"
                required
                rows={4}
                value={formData.characteristics || ''}
                onChange={(e) => setFormData({ ...formData, characteristics: e.target.value })}
            />

            <FormInput
                label="Images"
                type="file"
                // Assuming standard file upload component handling here
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        setFormData({ ...formData, file });
                    }
                }}
            />
        </div>
    )
}

// --- Main Switcher Form Component ---
interface PpvFraFormsProps {
    entityType: ExtendedEntityType
    formData: any
    setFormData: (data: any) => void
}

export const PpvFraForms: React.FC<PpvFraFormsProps> = ({ entityType, formData, setFormData }) => {
    // Exact match or fallback check
    if (entityType === ENTITY_TYPES.MISC_PPV_FRA_TRAINING) {
        return <PpvFraTrainingForm formData={formData} setFormData={setFormData} />
    }

    if (entityType === ENTITY_TYPES.MISC_PPV_FRA_PLANT_VARIETIES) {
        return <PpvFraPlantVarietiesForm formData={formData} setFormData={setFormData} />
    }

    // Fallback if matching failed but we know it's a PPV/FRA form
    if (String(entityType).includes('ppv-fra-training')) {
        return <PpvFraTrainingForm formData={formData} setFormData={setFormData} />
    }
    if (String(entityType).includes('ppv-fra-plant-varieties')) {
        return <PpvFraPlantVarietiesForm formData={formData} setFormData={setFormData} />
    }

    return null
}
