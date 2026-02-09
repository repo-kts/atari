import React from 'react'
import { ENTITY_TYPES } from '../../../../constants/entityTypes'
import { ExtendedEntityType } from '../../../../utils/masterUtils'
import { FormInput, FormSelect, FormTextArea, FormSection } from './shared/FormComponents'
import { State, District, Organization } from '../../../../types/masterData'
import { useMasterData } from '../../../../hooks/useMasterData'

import { useAuthStore } from '../../../../stores/authStore'

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

    const { data: zones = [] } = useMasterData('zones')
    const { data: states = [] } = useMasterData<State>('states')
    const { data: organizations = [] } = useMasterData<Organization>('organizations')
    const { data: districts = [] } = useMasterData<District>('districts')
    const { user } = useAuthStore()

    // Auto-set kvkId from user session if not already set
    React.useEffect(() => {
        if (user?.kvkId && !formData.kvkId) {
            setFormData({ ...formData, kvkId: user.kvkId })
        }
    }, [user?.kvkId, formData.kvkId, setFormData])

    if (!entityType) return null

    const posts = [
        { id: 1, post_name: 'Senior Scientist & Head' },
        { id: 2, post_name: 'Subject Matter Specialist' },
        { id: 3, post_name: 'Programme Assistant' },
        { id: 4, post_name: 'Farm Manager' },
        { id: 5, post_name: 'Stenographer Grade III' },
        { id: 6, post_name: 'Driver' },
        { id: 7, post_name: 'Skilled Support Staff' },
    ]

    return (
        <div className="space-y-4">
            {entityType === ENTITY_TYPES.KVK_BANK_ACCOUNTS && (
                <>
                    <FormSelect
                        label="Account Type"
                        required
                        value={formData.accountType || ''}
                        onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                        options={[
                            { value: 'KVK', label: 'KVK' },
                            { value: 'REVOLVING_FUND', label: 'Revolving Fund' },
                            { value: 'OTHER', label: 'Other' }
                        ]}
                    />
                    <FormInput
                        label="Account Name"
                        required
                        value={formData.accountName || ''}
                        onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                        placeholder="Enter account name"
                    />
                    <FormInput
                        label="Bank Name"
                        required
                        value={formData.bankName || ''}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        placeholder="Enter bank name"
                    />
                    <FormInput
                        label="Account Number"
                        required
                        value={formData.accountNumber || ''}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
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
                            value={formData.staffName || ''}
                            onChange={(e) => setFormData({ ...formData, staffName: e.target.value })}
                            placeholder="Enter staff name"
                        />
                        <FormSelect
                            label="Post"
                            required
                            value={formData.sanctionedPostId || ''}
                            onChange={(e) => setFormData({ ...formData, sanctionedPostId: parseInt(e.target.value) })}
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
                        <FormSelect
                            label="Discipline"
                            required
                            value={formData.disciplineId || ''}
                            onChange={(e) => setFormData({ ...formData, disciplineId: parseInt(e.target.value) })}
                            options={[
                                { value: 1, label: 'Agronomy' },
                                { value: 2, label: 'Horticulture' },
                                { value: 3, label: 'Plant Protection' },
                                { value: 4, label: 'Agricultural Extension' },
                                { value: 5, label: 'Animal Science' },
                                { value: 6, label: 'Soil Science' },
                                { value: 7, label: 'Home Science' }
                            ]}
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
                            value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''}
                            onChange={(e) => setFormData({ ...formData, dateOfBirth: new Date(e.target.value).toISOString() })}
                        />
                        <FormSelect
                            label="Caste Category"
                            value={formData.category || 'GENERAL'}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            options={[
                                { value: 'GENERAL', label: 'General' },
                                { value: 'OBC', label: 'OBC' },
                                { value: 'SC', label: 'SC' },
                                { value: 'ST', label: 'ST' }
                            ]}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Joining Date"
                            required
                            type="date"
                            value={formData.dateOfJoining ? new Date(formData.dateOfJoining).toISOString().split('T')[0] : ''}
                            onChange={(e) => setFormData({ ...formData, dateOfJoining: new Date(e.target.value).toISOString() })}
                        />
                        <FormSelect
                            label="Job Type"
                            required
                            value={formData.jobType || 'PERMANENT'}
                            onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                            options={[
                                { value: 'PERMANENT', label: 'Permanent' },
                                { value: 'TEMPORARY', label: 'Temporary' }
                            ]}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                            label="Pay Level"
                            required
                            value={formData.payLevel || 'LEVEL_10'}
                            onChange={(e) => setFormData({ ...formData, payLevel: e.target.value })}
                            options={[
                                { value: 'LEVEL_1', label: 'Level 1' },
                                { value: 'LEVEL_2', label: 'Level 2' },
                                { value: 'LEVEL_6', label: 'Level 6' },
                                { value: 'LEVEL_10', label: 'Level 10' },
                                { value: 'LEVEL_11', label: 'Level 11' },
                                { value: 'LEVEL_12', label: 'Level 12' },
                                { value: 'LEVEL_13A', label: 'Level 13A' },
                                { value: 'LEVEL_14', label: 'Level 14' }
                            ]}
                        />
                        <FormInput
                            label="Pay Scale"
                            value={formData.payScale || ''}
                            onChange={(e) => setFormData({ ...formData, payScale: e.target.value })}
                            placeholder="e.g., 15600-39100"
                        />
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.KVK_INFRASTRUCTURE && (
                <div className="space-y-4">
                    <FormSelect
                        label="Infrastructure Master"
                        required
                        value={formData.infraMasterId || ''}
                        onChange={(e) => setFormData({ ...formData, infraMasterId: parseInt(e.target.value) })}
                        options={[
                            { value: 1, label: 'Administrative Building' },
                            { value: 2, label: 'Farmers Hostel' },
                            { value: 3, label: 'Staff Quarters' },
                            { value: 4, label: 'Soil Testing Lab' }
                        ]}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Plinth Area (m²)"
                            required
                            type="number"
                            value={formData.plinthAreaSqM || ''}
                            onChange={(e) => setFormData({ ...formData, plinthAreaSqM: parseFloat(e.target.value) })}
                        />
                        <FormSelect
                            label="Totally Completed"
                            required
                            value={formData.totallyCompleted ? 'Yes' : 'No'}
                            onChange={(e) => setFormData({ ...formData, totallyCompleted: e.target.value === 'Yes' })}
                            options={[
                                { value: 'Yes', label: 'Yes' },
                                { value: 'No', label: 'No' }
                            ]}
                        />
                    </div>
                    <FormSelect
                        label="Under Use"
                        required
                        value={formData.underUse ? 'Yes' : 'No'}
                        onChange={(e) => setFormData({ ...formData, underUse: e.target.value === 'Yes' })}
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
                        value={formData.vehicleName || ''}
                        onChange={(e) => setFormData({ ...formData, vehicleName: e.target.value })}
                        placeholder="Enter vehicle name"
                    />
                    <FormInput
                        label="Registration No."
                        required
                        value={formData.registrationNo || ''}
                        onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value })}
                        placeholder="Enter registration number"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Purchase Year"
                            required
                            type="number"
                            value={formData.yearOfPurchase || ''}
                            onChange={(e) => setFormData({ ...formData, yearOfPurchase: parseInt(e.target.value) })}
                        />
                        <FormSelect
                            label="Status"
                            required
                            value={formData.presentStatus || 'WORKING'}
                            onChange={(e) => setFormData({ ...formData, presentStatus: e.target.value })}
                            options={[
                                { value: 'WORKING', label: 'Working' },
                                { value: 'NOT_WORKING', label: 'Not Working' },
                                { value: 'UNDER_REPAIR', label: 'Under Repair' }
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
                        value={formData.equipmentName || formData.implementName || ''}
                        onChange={(e) => setFormData({ ...formData, [entityType === ENTITY_TYPES.KVK_FARM_IMPLEMENTS ? 'implementName' : 'equipmentName']: e.target.value })}
                        placeholder="Enter name"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Purchase Year"
                            required
                            type="number"
                            value={formData.yearOfPurchase || ''}
                            onChange={(e) => setFormData({ ...formData, yearOfPurchase: parseInt(e.target.value) })}
                        />
                        <FormInput
                            label="Total Cost"
                            required
                            type="number"
                            value={formData.totalCost || ''}
                            onChange={(e) => setFormData({ ...formData, totalCost: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                            label="Status"
                            required
                            value={formData.presentStatus || 'WORKING'}
                            onChange={(e) => setFormData({ ...formData, presentStatus: e.target.value })}
                            options={entityType === ENTITY_TYPES.KVK_FARM_IMPLEMENTS ? [
                                { value: 'WORKING', label: 'Working' },
                                { value: 'GOOD_CONDITION', label: 'Good Condition' },
                                { value: 'NEW', label: 'New' },
                                { value: 'REPAIRABLE', label: 'Repairable' },
                                { value: 'NOT_WORKING', label: 'Not Working' }
                            ] : [
                                { value: 'WORKING', label: 'Working' },
                                { value: 'GOOD_CONDITION', label: 'Good Condition' },
                                { value: 'NEW', label: 'New' }
                            ]}
                        />
                        <FormInput
                            label="Source of Funding"
                            required
                            value={formData.sourceOfFunding || formData.sourceOfFund || ''}
                            onChange={(e) => setFormData({ ...formData, [entityType === ENTITY_TYPES.KVK_FARM_IMPLEMENTS ? 'sourceOfFund' : 'sourceOfFunding']: e.target.value })}
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
                                required
                                value={formData.email || ''}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="Enter email address"
                            />
                        </div>
                        <FormSelect
                            label="Zone"
                            required
                            value={formData.zoneId || ''}
                            onChange={(e) => setFormData({ ...formData, zoneId: parseInt(e.target.value), stateId: '', districtId: '' })}
                            options={(zones as any).map((z: any) => ({ value: z.zoneId, label: z.zoneName }))}
                        />
                        <FormSelect
                            label="State"
                            required
                            value={formData.stateId || ''}
                            onChange={(e) => setFormData({ ...formData, stateId: parseInt(e.target.value), districtId: '' })}
                            disabled={!formData.zoneId}
                            options={states
                                .filter(s => s.zoneId === formData.zoneId)
                                .map(s => ({ value: s.stateId, label: s.stateName }))}
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
                                required
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
                                required
                                value={formData.hostOrg || ''}
                                onChange={(e) => setFormData({ ...formData, hostOrg: e.target.value })}
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
                                type="number"
                                value={formData.yearOfSanction || ''}
                                onChange={(e) => setFormData({ ...formData, yearOfSanction: parseInt(e.target.value) })}
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
