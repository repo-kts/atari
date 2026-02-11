import React from 'react'
import { ENTITY_TYPES } from '@/constants/entityTypes'
import { ExtendedEntityType } from '@/utils/masterUtils'
import { FormInput, FormSelect, FormTextArea, FormSection } from './shared/FormComponents'
import { State, District, Organization } from '@/types/masterData'
import { useMasterData } from '@/hooks/useMasterData'
import { useAuth } from '@/contexts/AuthContext'
import {
    useSanctionedPosts,
    useDisciplines,
    useInfraMasters,
    useKvkVehiclesForDropdown,
    useKvkEquipmentsForDropdown,
    enumToOptions,
    AccountTypeEnum,
    PayLevelEnum,
    StaffCategoryEnum,
    VehiclePresentStatusEnum,
    EquipmentPresentStatusEnum,
    ImplementPresentStatusEnum
} from '@/hooks/forms/useAboutKvkData'

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
    const { user } = useAuth()

    // Fetch About KVK master data
    const { data: sanctionedPosts = [] } = useSanctionedPosts()
    const { data: disciplines = [] } = useDisciplines()
    const { data: infraMasters = [] } = useInfraMasters()

    const activeKvkId = user?.kvkId || formData.kvkId;
    const { data: vehicles = [] } = useKvkVehiclesForDropdown(activeKvkId)
    const { data: equipments = [] } = useKvkEquipmentsForDropdown(activeKvkId)

    React.useEffect(() => {
        if (user?.kvkId && !formData.kvkId) {
            setFormData({ ...formData, kvkId: user.kvkId })
        }
    }, [user?.kvkId, formData.kvkId, setFormData])


    // Extract nested IDs from related objects when editing (for select fields)
    React.useEffect(() => {
        if (entityType === ENTITY_TYPES.KVK_EMPLOYEES || entityType === ENTITY_TYPES.KVK_STAFF_TRANSFERRED) {
            const updates: any = {}

            // Extract sanctionedPostId from nested sanctionedPost object
            if (formData.sanctionedPost && formData.sanctionedPost.sanctionedPostId && !formData.sanctionedPostId) {
                updates.sanctionedPostId = formData.sanctionedPost.sanctionedPostId
            }

            // Extract disciplineId from nested discipline object
            if (formData.discipline && formData.discipline.disciplineId && !formData.disciplineId) {
                updates.disciplineId = formData.discipline.disciplineId
            }

            // Extract kvkId from nested kvk object
            if (formData.kvk && formData.kvk.kvkId && !formData.kvkId) {
                updates.kvkId = formData.kvk.kvkId
            }

            if (Object.keys(updates).length > 0) {
                setFormData((prev: any) => ({ ...prev, ...updates }))
            }
        }
    }, [entityType, formData.sanctionedPost, formData.discipline, formData.kvk, setFormData])

    if (!entityType) return null

    return (
        <div className="space-y-4">
            {entityType === ENTITY_TYPES.KVK_BANK_ACCOUNTS && (
                <>
                    <FormSelect
                        label="Account Type"
                        required
                        value={formData.accountType || ''}
                        onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                        options={enumToOptions(AccountTypeEnum)}
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

            {(entityType === ENTITY_TYPES.KVK_EMPLOYEES) && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                            label="Sanctioned Post"
                            required
                            value={formData.sanctionedPostId || ''}
                            onChange={(e) => setFormData({ ...formData, sanctionedPostId: parseInt(e.target.value) })}
                            options={sanctionedPosts.map((p: any) => ({ value: p.sanctionedPostId, label: p.postName }))}
                        />
                        <FormInput
                            label="Staff Name"
                            required
                            value={formData.staffName || ''}
                            onChange={(e) => setFormData({ ...formData, staffName: e.target.value })}
                            placeholder="Enter staff name"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Position Order"
                            required
                            value={formData.positionOrder || ''}
                            onChange={(e) => setFormData({ ...formData, positionOrder: parseInt(e.target.value) })}
                            placeholder="Position Order"
                        />
                        <FormInput
                            label="Mobile"
                            required
                            value={formData.mobile || ''}
                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                            placeholder="Mobile number"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Email"
                            type="email"
                            value={formData.email || ''}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="Email address"
                        />
                        <FormSelect
                            label="Pay Level"
                            value={formData.payLevel || ''}
                            onChange={(e) => setFormData({ ...formData, payLevel: e.target.value || '' })}
                            options={enumToOptions(PayLevelEnum)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Pay Scale"
                            value={formData.payScale || ''}
                            onChange={(e) => setFormData({ ...formData, payScale: e.target.value })}
                            placeholder="e.g., 15600-39100"
                        />
                        <FormSelect
                            label="Discipline"
                            required
                            value={formData.disciplineId || ''}
                            onChange={(e) => setFormData({ ...formData, disciplineId: parseInt(e.target.value) })}
                            options={disciplines.map((d: any) => ({ value: d.disciplineId, label: d.disciplineName }))}
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
                        <FormInput
                            label="Date of Joining"
                            required
                            type="date"
                            value={formData.dateOfJoining ? new Date(formData.dateOfJoining).toISOString().split('T')[0] : ''}
                            onChange={(e) => setFormData({ ...formData, dateOfJoining: new Date(e.target.value).toISOString() })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                            label="Job Type"
                            value={formData.jobType || ''}
                            onChange={(e) => setFormData({ ...formData, jobType: e.target.value || '' })}
                            options={[
                                { value: 'PERMANENT', label: 'Permanent' },
                                { value: 'TEMPORARY', label: 'Temporary' }
                            ]}
                        />
                        <FormInput
                            label="Details of Allowances"
                            value={formData.allowances || ''}
                            onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
                            placeholder="Allowances"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                            label="Category"
                            required
                            value={formData.category || ''}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value || '' })}
                            options={enumToOptions(StaffCategoryEnum)}
                        />
                        <FormInput
                            label="Resume"
                            value={formData.resumePath || ''}
                            onChange={(e) => setFormData({ ...formData, resumePath: e.target.value })}
                            placeholder="Resume link"
                        />
                        <FormInput
                            label="Photo"
                            required
                            value={formData.photoPath || ''}
                            onChange={(e) => setFormData({ ...formData, photoPath: e.target.value })}
                            placeholder="Photo link"
                        />
                    </div>
                </div>
            )}

            {entityType === ENTITY_TYPES.KVK_INFRASTRUCTURE && (
                <div className="space-y-4">
                    <FormSelect
                        label="Name of Infrastructure"
                        required
                        value={formData.infraMasterId || ''}
                        onChange={(e) => setFormData({ ...formData, infraMasterId: parseInt(e.target.value) })}
                        options={infraMasters.map((i: any) => ({ value: i.infraMasterId, label: i.name }))}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                            label="Completed upto plinth level"
                            required
                            value={formData.completedPlinthLevel !== undefined ? (formData.completedPlinthLevel ? 'Yes' : 'No') : ''}
                            onChange={(e) => setFormData({ ...formData, completedPlinthLevel: e.target.value === 'Yes' })}
                            options={[
                                { value: 'Yes', label: 'Yes' },
                                { value: 'No', label: 'No' }
                            ]}
                        />
                        <FormSelect
                            label="Completed upto lintel level"
                            required
                            value={formData.completedLintelLevel !== undefined ? (formData.completedLintelLevel ? 'Yes' : 'No') : ''}
                            onChange={(e) => setFormData({ ...formData, completedLintelLevel: e.target.value === 'Yes' })}
                            options={[
                                { value: 'Yes', label: 'Yes' },
                                { value: 'No', label: 'No' }
                            ]}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                            label="Completed upto roof level"
                            required
                            value={formData.completedRoofLevel !== undefined ? (formData.completedRoofLevel ? 'Yes' : 'No') : ''}
                            onChange={(e) => setFormData({ ...formData, completedRoofLevel: e.target.value === 'Yes' })}
                            options={[
                                { value: 'Yes', label: 'Yes' },
                                { value: 'No', label: 'No' }
                            ]}
                        />
                        <FormSelect
                            label="Not Yet Started"
                            required
                            value={formData.notYetStarted !== undefined ? (formData.notYetStarted ? 'Yes' : 'No') : ''}
                            onChange={(e) => setFormData({ ...formData, notYetStarted: e.target.value === 'Yes' })}
                            options={[
                                { value: 'Yes', label: 'Yes' },
                                { value: 'No', label: 'No' }
                            ]}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                            label="Totally Completed"
                            required
                            value={formData.totallyCompleted !== undefined ? (formData.totallyCompleted ? 'Yes' : 'No') : ''}
                            onChange={(e) => setFormData({ ...formData, totallyCompleted: e.target.value === 'Yes' })}
                            options={[
                                { value: 'Yes', label: 'Yes' },
                                { value: 'No', label: 'No' }
                            ]}
                        />
                        <FormInput
                            label="Plinth Area (m²)"
                            required
                            type="number"
                            step="0.01"
                            value={formData.plinthAreaSqM || ''}
                            onChange={(e) => setFormData({ ...formData, plinthAreaSqM: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                            label="Under use or not"
                            required
                            value={formData.underUse !== undefined ? (formData.underUse ? 'Yes' : 'No') : ''}
                            onChange={(e) => setFormData({ ...formData, underUse: e.target.value === 'Yes' })}
                            options={[
                                { value: 'Yes', label: 'Yes' },
                                { value: 'No', label: 'No' }
                            ]}
                        />
                        <FormInput
                            label="Source of Funding"
                            required
                            value={formData.sourceOfFunding || ''}
                            onChange={(e) => setFormData({ ...formData, sourceOfFunding: e.target.value })}
                            placeholder="Enter source of funding"
                        />
                    </div>
                </div>
            )}

            {(entityType === ENTITY_TYPES.KVK_VEHICLES) && (
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
                        <FormInput
                            label="Total Cost (Rs.)"
                            type="number"
                            value={formData.totalCost || ''}
                            onChange={(e) => setFormData({ ...formData, totalCost: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Total Run (Kms)"
                            type="number"
                            value={formData.totalRun || ''}
                            onChange={(e) => setFormData({ ...formData, totalRun: e.target.value })}
                        />
                        <FormSelect
                            label="Present Status"
                            required
                            value={formData.presentStatus || ''}
                            onChange={(e) => setFormData({ ...formData, presentStatus: e.target.value || '' })}
                            options={enumToOptions(VehiclePresentStatusEnum)}
                        />
                    </div>
                </div>
            )}

            {(entityType === ENTITY_TYPES.KVK_EQUIPMENTS) && (
                <div className="space-y-4">
                    <FormInput
                        label={"Equipment Name"}
                        required
                        value={formData.equipmentName || ''}
                        onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
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
                            label="Total Cost (Rs.)"
                            required
                            type="number"
                            value={formData.totalCost || ''}
                            onChange={(e) => setFormData({ ...formData, totalCost: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                            label="Present Status"
                            required
                            value={formData.presentStatus || ''}
                            onChange={(e) => setFormData({ ...formData, presentStatus: e.target.value || '' })}
                            options={enumToOptions(EquipmentPresentStatusEnum)}
                        />
                        <FormInput
                            label="Source of Funding"
                            required
                            value={formData.sourceOfFunding || ''}
                            onChange={(e) => setFormData({ ...formData, sourceOfFunding: e.target.value })}
                            placeholder="Enter source"
                        />
                    </div>
                </div>
            )}


            {/* Vehicle Details Form */}
            {entityType === ENTITY_TYPES.KVK_VEHICLE_DETAILS && (
                <div className="space-y-4">
                    <FormInput
                        label="Reporting Year"
                        required
                        value={formData.reportingYear || ''}
                        onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
                        placeholder="e.g., 2023-24"
                    />
                    <FormSelect
                        label="Vehicle"
                        required
                        value={formData.vehicleId || ''}
                        onChange={(e) => setFormData({ ...formData, vehicleId: parseInt(e.target.value) })}
                        options={vehicles.map((v: any) => ({ value: v.vehicleId, label: v.vehicleName }))}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Total Run (km)"
                            required
                            value={formData.totalRun || ''}
                            onChange={(e) => setFormData({ ...formData, totalRun: e.target.value })}
                            placeholder="Enter total run"
                        />
                        <FormSelect
                            label="Present Status"
                            required
                            value={formData.presentStatus || ''}
                            onChange={(e) => setFormData({ ...formData, presentStatus: e.target.value || '' })}
                            options={enumToOptions(VehiclePresentStatusEnum)}
                        />
                    </div>
                    <FormInput
                        label="Repairing Cost (Rs.)"
                        type="number"
                        value={formData.repairingCost || ''}
                        onChange={(e) => setFormData({ ...formData, repairingCost: parseFloat(e.target.value) })}
                        placeholder="Enter repairing cost (optional)"
                    />
                </div>
            )}

            {/* Equipment Details Form */}
            {entityType === ENTITY_TYPES.KVK_EQUIPMENT_DETAILS && (
                <div className="space-y-4">
                    <FormInput
                        label="Reporting Year"
                        required
                        value={formData.reportingYear || ''}
                        onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
                        placeholder="e.g., 2023-24"
                    />
                    <FormSelect
                        label="Equipment"
                        required
                        value={formData.equipmentId || ''}
                        onChange={(e) => setFormData({ ...formData, equipmentId: parseInt(e.target.value) })}
                        options={equipments.map((eq: any) => ({ value: eq.equipmentId, label: eq.equipmentName }))}
                    />
                    <FormSelect
                        label="Present Status"
                        required
                        value={formData.presentStatus || ''}
                        onChange={(e) => setFormData({ ...formData, presentStatus: e.target.value || '' })}
                        options={enumToOptions(EquipmentPresentStatusEnum)}
                    />
                </div>
            )}

            {/* Farm Implements Form */}
            {entityType === ENTITY_TYPES.KVK_FARM_IMPLEMENTS && (
                <div className="space-y-4">
                    <FormInput
                        label="Name of Implement"
                        required
                        value={formData.implementName || ''}
                        onChange={(e) => setFormData({ ...formData, implementName: e.target.value })}
                        placeholder="Enter implement name"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Year of Purchase"
                            required
                            type="number"
                            value={formData.yearOfPurchase || ''}
                            onChange={(e) => setFormData({ ...formData, yearOfPurchase: parseInt(e.target.value) })}
                        />
                        <FormInput
                            label="Total Cost (Rs.)"
                            required
                            type="number"
                            value={formData.totalCost || ''}
                            onChange={(e) => setFormData({ ...formData, totalCost: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                            label="Present Status"
                            required
                            value={formData.presentStatus || ''}
                            onChange={(e) => setFormData({ ...formData, presentStatus: e.target.value || '' })}
                            options={enumToOptions(ImplementPresentStatusEnum)}
                        />
                        <FormInput
                            label="Source of Fund"
                            required
                            value={formData.sourceOfFund || ''}
                            onChange={(e) => setFormData({ ...formData, sourceOfFund: e.target.value })}
                            placeholder="Enter source of fund"
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
