import React from 'react'
import { ENTITY_TYPES } from '../../../../constants/entityTypes'
import { ExtendedEntityType } from '../../../../utils/masterUtils'
import { FormInput, FormSelect, FormTextArea, FormSection } from './shared/FormComponents'
import { State, District, Organization } from '../../../../types/masterData'
import { useMasterData } from '../../../../hooks/useMasterData'

interface AboutKvkFormsProps {
    entityType: ExtendedEntityType | null
    formData: any
    setFormData: (data: any) => void
}

export const AboutKvkForms: React.FC<AboutKvkFormsProps> = ({
    entityType,
    formData,
    setFormData,
}) => {

    const { data: states = [] } = useMasterData<State>('states')
    const { data: organizations = [] } = useMasterData<Organization>('organizations')
    const { data: districts = [] } = useMasterData<District>('districts')

    const posts = [
        { id: 1, post_name: 'Senior Scientist & Head' },
        { id: 2, post_name: 'Subject Matter Specialist' },
        { id: 3, post_name: 'Programme Assistant' },
        { id: 4, post_name: 'Farm Manager' },
        { id: 5, post_name: 'Stenographer Grade III' },
        { id: 6, post_name: 'Driver' },
        { id: 7, post_name: 'Skilled Support Staff' },
    ]

    if (!entityType) return null

    return (
        <div className="space-y-4">
            {entityType === ENTITY_TYPES.KVK_BANK_ACCOUNTS && (
                <>
                    <FormSelect
                        label="Account Type"
                        required
                        value={formData.account_type || ''}
                        onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                        options={[
                            { value: 'Kvk', label: 'Kvk' },
                            { value: 'Revolving Fund', label: 'Revolving Fund' },
                            { value: 'Other', label: 'Other' }
                        ]}
                    />
                    <FormInput
                        label="Account Name"
                        required
                        value={formData.account_name || ''}
                        onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                        placeholder="Enter account name"
                    />
                    <FormInput
                        label="Bank Name"
                        required
                        value={formData.bank_name || ''}
                        onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                        placeholder="Enter bank name"
                    />
                    <FormInput
                        label="Account Number"
                        required
                        value={formData.account_number || ''}
                        onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                        placeholder="Enter account number"
                    />
                    <FormInput
                        label="Location"
                        required
                        value={formData.location || ''}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Enter branch location"
                    />
                </>
            )}

            {(entityType === ENTITY_TYPES.KVK_EMPLOYEES || entityType === ENTITY_TYPES.KVK_STAFF_TRANSFERRED) && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Staff Name"
                            required
                            value={formData.staff_name || ''}
                            onChange={(e) => setFormData({ ...formData, staff_name: e.target.value })}
                            placeholder="Enter staff name"
                        />
                        <FormSelect
                            label="Post"
                            required
                            value={formData.post_id || ''}
                            onChange={(e) => setFormData({ ...formData, post_id: parseInt(e.target.value) })}
                            options={posts.map(p => ({ value: p.id, label: p.post_name }))}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Mobile"
                            required
                            value={formData.mobile || ''}
                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                            placeholder="Mobile number"
                        />
                        <FormInput
                            label="Email"
                            required
                            type="email"
                            value={formData.email || ''}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="Email address"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Discipline"
                            required
                            value={formData.discipline || ''}
                            onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                            placeholder="Discipline"
                        />
                        <FormInput
                            label="Designation"
                            value={formData.designation || ''}
                            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                            placeholder="Designation"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Date of Birth"
                            required
                            type="date"
                            value={formData.dob || ''}
                            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        />
                        <FormSelect
                            label="Caste Category"
                            value={formData.cast_category || 'General'}
                            onChange={(e) => setFormData({ ...formData, cast_category: e.target.value })}
                            options={[
                                { value: 'General', label: 'General' },
                                { value: 'OBC', label: 'OBC' },
                                { value: 'SC', label: 'SC' },
                                { value: 'ST', label: 'ST' },
                                { value: 'EWS', label: 'EWS' }
                            ]}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Joining Date"
                            required
                            type="date"
                            value={formData.date_of_joining || ''}
                            onChange={(e) => setFormData({ ...formData, date_of_joining: e.target.value })}
                        />
                        <FormInput
                            label="Relieving Date"
                            type="date"
                            value={formData.releaving_date || ''}
                            onChange={(e) => setFormData({ ...formData, releaving_date: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                            label="Job Type"
                            required
                            value={formData.job_type || ''}
                            onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                            options={[
                                { value: 'Permanent', label: 'Permanent' },
                                { value: 'Contractual', label: 'Contractual' },
                                { value: 'Temporary', label: 'Temporary' },
                                { value: 'Deputation', label: 'Deputation' }
                            ]}
                        />
                        <FormInput
                            label="Pay Scale"
                            value={formData.pay_scale || ''}
                            onChange={(e) => setFormData({ ...formData, pay_scale: e.target.value })}
                            placeholder="e.g., Level 10"
                        />
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.KVK_INFRASTRUCTURE && (
                <div className="space-y-4">
                    <FormInput
                        label="Infrastructure Name"
                        required
                        value={formData.infrastructure || ''}
                        onChange={(e) => setFormData({ ...formData, infrastructure: e.target.value })}
                        placeholder="Enter infrastructure name"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Plinth Area (m²)"
                            required
                            type="number"
                            value={formData.plinth_area || ''}
                            onChange={(e) => setFormData({ ...formData, plinth_area: e.target.value })}
                        />
                        <FormSelect
                            label="Totally Completed"
                            required
                            value={formData.total_completed || 'No'}
                            onChange={(e) => setFormData({ ...formData, total_completed: e.target.value })}
                            options={[
                                { value: 'Yes', label: 'Yes' },
                                { value: 'No', label: 'No' }
                            ]}
                        />
                    </div>
                    <FormSelect
                        label="Under Use"
                        required
                        value={formData.under_use || 'No'}
                        onChange={(e) => setFormData({ ...formData, under_use: e.target.value })}
                        options={[
                            { value: 'Yes', label: 'Yes' },
                            { value: 'No', label: 'No' }
                        ]}
                    />
                </div>
            )}

            {(entityType === ENTITY_TYPES.KVK_VEHICLES || entityType === ENTITY_TYPES.KVK_VEHICLE_DETAILS) && (
                <div className="space-y-4">
                    <FormInput
                        label="Vehicle Name"
                        required
                        value={formData.vehicle_name || ''}
                        onChange={(e) => setFormData({ ...formData, vehicle_name: e.target.value })}
                        placeholder="Enter vehicle name"
                    />
                    <FormInput
                        label="Registration No."
                        required
                        value={formData.registration_no || ''}
                        onChange={(e) => setFormData({ ...formData, registration_no: e.target.value })}
                        placeholder="Enter registration number"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Purchase Year"
                            required
                            type="number"
                            value={formData.year || ''}
                            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                        />
                        <FormSelect
                            label="Status"
                            required
                            value={formData.status || 'Working'}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            options={[
                                { value: 'Working', label: 'Working' },
                                { value: 'Not Working', label: 'Not Working' },
                                { value: 'Under Repair', label: 'Under Repair' }
                            ]}
                        />
                    </div>
                </div>
            )}

            {(entityType === ENTITY_TYPES.KVK_EQUIPMENTS || entityType === ENTITY_TYPES.KVK_EQUIPMENT_DETAILS || entityType === ENTITY_TYPES.KVK_FARM_IMPLEMENTS) && (
                <div className="space-y-4">
                    <FormInput
                        label="Equipment/Implement Name"
                        required
                        value={formData.equipment_name || formData.implement_name || ''}
                        onChange={(e) => setFormData({ ...formData, [entityType === ENTITY_TYPES.KVK_FARM_IMPLEMENTS ? 'implement_name' : 'equipment_name']: e.target.value })}
                        placeholder="Enter name"
                    />
                    {entityType !== ENTITY_TYPES.KVK_FARM_IMPLEMENTS && (
                        <FormInput
                            label="Model"
                            value={formData.model || ''}
                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                            placeholder="Enter model number"
                        />
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        {entityType === ENTITY_TYPES.KVK_FARM_IMPLEMENTS ? (
                            <FormInput
                                label="Count"
                                required
                                type="number"
                                value={formData.count || ''}
                                onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) })}
                            />
                        ) : (
                            <FormInput
                                label="Purchase Year"
                                required
                                type="number"
                                value={formData.year || ''}
                                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                            />
                        )}
                        <FormSelect
                            label="Status"
                            required
                            value={formData.status || 'Working'}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            options={[
                                { value: 'Working', label: 'Working' },
                                { value: 'Not Working', label: 'Not Working' },
                                { value: 'Under Repair', label: 'Under Repair' }
                            ]}
                        />
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.KVKS && (
                <div className="space-y-8">
                    <FormSection title="Add KVK Details">
                        <div className="md:col-span-2">
                            <FormInput
                                label="Name of KVK"
                                required
                                value={formData.kvkName || ''}
                                onChange={(e) => setFormData({ ...formData, kvkName: e.target.value })}
                                placeholder="Enter KVK name"
                            />
                        </div>
                        <FormInput
                            label="Mobile Number"
                            required
                            value={formData.mobile || ''}
                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                            placeholder="+91"
                        />
                        <FormInput
                            label="Landline"
                            value={formData.landline || ''}
                            onChange={(e) => setFormData({ ...formData, landline: e.target.value })}
                            placeholder="Enter landline"
                        />
                        <FormInput
                            label="Fax"
                            value={formData.fax || ''}
                            onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                            placeholder="Enter fax"
                        />
                        <div className="md:col-span-2">
                            <FormInput
                                label="E-mail"
                                type="email"
                                value={formData.email || ''}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="Enter email address"
                            />
                        </div>
                        <FormSelect
                            label="State"
                            required
                            value={formData.stateId || ''}
                            onChange={(e) => setFormData({ ...formData, stateId: parseInt(e.target.value), districtId: '' })}
                            options={states.map(s => ({ value: s.stateId, label: s.stateName }))}
                        />
                        <div className="md:col-span-2">
                            <FormSelect
                                label="Organization"
                                required
                                value={formData.orgId || ''}
                                onChange={(e) => setFormData({ ...formData, orgId: parseInt(e.target.value) })}
                                options={organizations.map(org => ({ value: org.orgId, label: org.uniName }))}
                            />
                        </div>
                        <FormSelect
                            label="District"
                            required
                            value={formData.districtId || ''}
                            onChange={(e) => setFormData({ ...formData, districtId: parseInt(e.target.value) })}
                            disabled={!formData.stateId}
                            options={districts
                                .filter((d) => d.stateId === formData.stateId)
                                .map(d => ({ value: d.districtId, label: d.districtName }))}
                        />
                        <div className="md:col-span-2 lg:col-span-2">
                            <FormTextArea
                                label="Address"
                                value={formData.address || ''}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                rows={2}
                                placeholder="Enter complete address"
                            />
                        </div>
                    </FormSection>

                    <FormSection title="Host Organization Details">
                        <div className="md:col-span-2 lg:col-span-1">
                            <FormInput
                                label="Host Organization Name"
                                value={formData.hostOrganizationName || ''}
                                onChange={(e) => setFormData({ ...formData, hostOrganizationName: e.target.value })}
                                placeholder="Enter host organization name"
                            />
                        </div>
                        <FormInput
                            label="Mobile Number"
                            value={formData.hostMobile || ''}
                            onChange={(e) => setFormData({ ...formData, hostMobile: e.target.value })}
                            placeholder="+91"
                        />
                        <FormInput
                            label="Landline"
                            value={formData.hostLandline || ''}
                            onChange={(e) => setFormData({ ...formData, hostLandline: e.target.value })}
                            placeholder="Enter landline"
                        />
                        <FormInput
                            label="Fax"
                            value={formData.hostFax || ''}
                            onChange={(e) => setFormData({ ...formData, hostFax: e.target.value })}
                            placeholder="Enter fax"
                        />
                        <div className="md:col-span-2">
                            <FormInput
                                label="E-mail"
                                type="email"
                                value={formData.hostEmail || ''}
                                onChange={(e) => setFormData({ ...formData, hostEmail: e.target.value })}
                                placeholder="Enter email address"
                            />
                        </div>
                        <div className="md:col-span-2 lg:col-span-2">
                            <FormTextArea
                                label="Address"
                                value={formData.hostAddress || ''}
                                onChange={(e) => setFormData({ ...formData, hostAddress: e.target.value })}
                                rows={2}
                                placeholder="Enter complete address"
                            />
                        </div>
                    </FormSection>

                    <FormSection title="Year of Sanction">
                        <div className="max-w-xs">
                            <FormInput
                                label="Enter Year"
                                required
                                value={formData.yearOfSanction || ''}
                                onChange={(e) => setFormData({ ...formData, yearOfSanction: e.target.value })}
                                placeholder="e.g. 2004"
                            />
                        </div>
                    </FormSection>

                    <FormSection title="Total Land with KVK">
                        <FormInput
                            label="Item"
                            placeholder="e.g. Main Farm"
                        />
                        <FormInput
                            label="In Ha"
                            placeholder="e.g. 20"
                        />
                        <div className="flex items-end pb-1">
                            <button type="button" className="px-4 py-2.5 text-sm font-medium text-white bg-[#487749] rounded-xl hover:bg-[#3d6540] transition-all">
                                Add More Item
                            </button>
                        </div>
                    </FormSection>
                </div>
            )}
        </div>
    )
}
