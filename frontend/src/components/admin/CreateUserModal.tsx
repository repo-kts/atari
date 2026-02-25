import React, { useState, useEffect } from 'react'
import { userApi, CreateUserData, PermissionAction, getRoleLabel } from '../../services/userApi'
import { masterDataApi } from '../../services/masterDataApi'
import { aboutKvkApi } from '../../services/aboutKvkApi'
import { useAuth } from '../../contexts/AuthContext'
import { getRoleLevel, isAdminRole, getCreatableRoles } from '../../constants/roleHierarchy'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'
import { LoadingButton } from '../common/LoadingButton'
import { DependentDropdown } from '../common/DependentDropdown'
import { buildKvkFilters } from '../../utils/kvkFilterUtils'
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import type { Zone, State, District, Organization, University } from '../../types/masterData'
import type { Kvk } from '../../types/aboutKvk'
import { useMasterData } from '../../hooks/useMasterData'
import { useRoles } from '../../hooks/useUserManagement'
import type { RoleInfo } from '../../services/userApi'

const PERMISSION_ACTIONS: { value: PermissionAction; label: string }[] = [
    { value: 'VIEW', label: 'View' },
    { value: 'ADD', label: 'Add' },
    { value: 'EDIT', label: 'Edit' },
    { value: 'DELETE', label: 'Delete' },
]

/** Roles that get the ADD permission option even though they are non-admin */
const NON_ADMIN_ROLES_WITH_ADD = ['kvk_user']

/** Non-admin roles that require custom permissions */
const NON_ADMIN_ROLES = ['kvk_user', 'state_user', 'district_user', 'org_user']


interface CreateUserModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
}

interface FormData {
    name: string
    email: string
    phoneNumber: string
    password: string
    confirmPassword: string
    roleId: number | ''
    zoneId: number | ''
    stateId: number | ''
    districtId: number | ''
    orgId: number | ''
    universityId: number | ''
    kvkId: number | ''
    permissions: PermissionAction[]
}

interface FormErrors {
    name?: string
    email?: string
    phoneNumber?: string
    password?: string
    confirmPassword?: string
    roleId?: string
    zoneId?: string
    stateId?: string
    districtId?: string
    orgId?: string
    kvkId?: string
    universityId?: string
    permissions?: string
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        roleId: '',
        zoneId: '',
        stateId: '',
        districtId: '',
        orgId: '',
        universityId: '',
        kvkId: '',
        permissions: [],
    })
    const { user: currentUser } = useAuth()

    const [errors, setErrors] = useState<FormErrors>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [submitSuccess, setSubmitSuccess] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    // Check if current user is a sub-admin (not super_admin)
    const isSubAdmin = currentUser?.role !== 'super_admin'
    const creatorLevel = getRoleLevel(currentUser?.role || '')

    // Fetch roles using hooks
    const { data: allRoles = [] } = useRoles()

    // Allowed roles for current creator (when not Super Admin) — all roles strictly lower in hierarchy
    const allowedRoleNames = currentUser?.role ? getCreatableRoles(currentUser.role) : []
    const allowedRolesForDropdown = allRoles.filter((r: RoleInfo) => allowedRoleNames.includes(r.roleName))

    // Effective role from selection (both Super Admin and other admins choose or have a role)
    const selectedRole = formData.roleId
        ? allRoles.find((r: RoleInfo) => r.roleId === formData.roleId)?.roleName ?? null
        : null

    // Determine which hierarchy fields are required (full cascade: each level needs all parents)
    const zoneRequired = selectedRole === 'zone_admin' ||
        selectedRole === 'state_admin' || selectedRole === 'state_user' ||
        selectedRole === 'district_admin' || selectedRole === 'district_user' ||
        selectedRole === 'org_admin' || selectedRole === 'org_user' || selectedRole === 'kvk_admin' || selectedRole === 'kvk_user'
    const stateRequired = selectedRole === 'state_admin' || selectedRole === 'state_user' ||
        selectedRole === 'district_admin' || selectedRole === 'district_user' ||
        selectedRole === 'org_admin' || selectedRole === 'org_user' || selectedRole === 'kvk_admin' || selectedRole === 'kvk_user'
    const districtRequired = selectedRole === 'district_admin' || selectedRole === 'district_user' ||
        selectedRole === 'org_admin' || selectedRole === 'org_user' || selectedRole === 'kvk_admin' || selectedRole === 'kvk_user'
    const orgRequired = selectedRole === 'org_admin' || selectedRole === 'org_user' || selectedRole === 'kvk_admin' || selectedRole === 'kvk_user'
    const kvkRequired = selectedRole === 'kvk_admin' || selectedRole === 'kvk_user'

    // Show hierarchy fields that are required — ensures every required field has a visible dropdown
    const showZoneField = zoneRequired
    const showStateField = stateRequired
    const showDistrictField = districtRequired
    const showOrgField = orgRequired

    // Fetch zones using hooks
    const { data: zones = [] } = useMasterData<Zone>('zones', { enabled: !isSubAdmin && showZoneField })

    // Sub-admin hierarchy dropdowns: only show dropdowns for levels STRICTLY BELOW the creator's own level
    // Hierarchy levels: zone=1, state=2, district=3, org=4
    // e.g. district_admin (level 3) should NOT see State (level 2) or District (level 3) dropdowns - those are inherited
    const needsStateLevel = ['state_admin', 'state_user', 'district_admin', 'district_user', 'org_admin', 'org_user', 'kvk_admin', 'kvk_user']
    const needsDistrictLevel = ['district_admin', 'district_user', 'org_admin', 'org_user', 'kvk_admin', 'kvk_user']
    const needsOrgLevel = ['org_admin', 'org_user', 'kvk_admin', 'kvk_user']

    const showStateForSubAdmin = isSubAdmin && creatorLevel < 2 && needsStateLevel.includes(selectedRole || '')
    const showDistrictForSubAdmin = isSubAdmin && creatorLevel < 3 && needsDistrictLevel.includes(selectedRole || '')
    const showOrgForSubAdmin = isSubAdmin && creatorLevel < 4 && needsOrgLevel.includes(selectedRole || '')

    // Show permissions section only for _user roles (they use intersection pattern).
    // Admin roles get permissions from their role assignment, not user-level permissions.
    const isSelectedRoleUser = selectedRole !== null && NON_ADMIN_ROLES.includes(selectedRole)
    const showPermissionsSection = isSelectedRoleUser

    // Note: All dropdown data is now loaded dynamically via DependentDropdown components
    // No need for manual state management or useEffect hooks for fetching dropdown data

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            const defaultRoleId = isSubAdmin && allowedRolesForDropdown.length
                ? allowedRolesForDropdown[0].roleId
                : ''
            setFormData({
                name: '',
                email: '',
                phoneNumber: '',
                password: '',
                confirmPassword: '',
                roleId: defaultRoleId as number | '',
                zoneId: '',
                stateId: '',
                districtId: '',
                orgId: '',
                universityId: '',
                kvkId: '',
                permissions: [],
            })
            setErrors({})
            setSubmitError(null)
            setSubmitSuccess(false)
            setShowPassword(false)
        }
    }, [isOpen, isSubAdmin, allowedRolesForDropdown.length])

    // When non–super-admin opens modal, default role to first allowed option
    useEffect(() => {
        if (isOpen && isSubAdmin && allowedRolesForDropdown.length > 0 && !formData.roleId) {
            setFormData(prev => ({ ...prev, roleId: allowedRolesForDropdown[0].roleId }))
        }
    }, [isOpen, isSubAdmin, allowedRolesForDropdown.length, formData.roleId])

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required'
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters'
        }

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format'
        }

        // Phone number validation (optional)
        if (formData.phoneNumber.trim()) {
            const cleaned = formData.phoneNumber.replace(/[\s\-()]/g, '')
            if (!/^[6-9]\d{9}$/.test(cleaned)) {
                newErrors.phoneNumber = 'Invalid phone number (10 digits starting with 6-9)'
            }
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required'
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters'
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Password must contain uppercase, lowercase, and number'
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm password'
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }

        // Role validation
        if (!formData.roleId) {
            newErrors.roleId = 'Role is required'
        }

        // Hierarchy validation (full cascade: Zone → State → District → Org → KVK)
        if (!isSubAdmin) {
            // Super Admin must provide full hierarchy from form
            if (zoneRequired && !formData.zoneId) {
                newErrors.zoneId = 'Zone is required'
            }
            if (stateRequired && !formData.stateId) {
                newErrors.stateId = 'State is required'
            }
            if (districtRequired && !formData.districtId) {
                newErrors.districtId = 'District is required'
            }
            if (orgRequired && !formData.orgId) {
                newErrors.orgId = 'Organization is required'
            }
        } else {
            // Sub-admin: validate form-selected hierarchy fields below their level
            if (showStateForSubAdmin && stateRequired && !formData.stateId) {
                newErrors.stateId = 'State is required for this role'
            }
            if (showDistrictForSubAdmin && districtRequired && !formData.districtId) {
                newErrors.districtId = 'District is required for this role'
            }
            if (showOrgForSubAdmin && orgRequired && !formData.orgId) {
                newErrors.orgId = 'Organization is required for this role'
            }
        }
        // KVK validation applies to both Super Admin and sub-admins
        if (kvkRequired && !formData.kvkId) {
            newErrors.kvkId = 'KVK is required for KVK user'
        }

        if (showPermissionsSection && (!formData.permissions || formData.permissions.length === 0)) {
            newErrors.permissions = 'Select at least one permission (View, Edit, or Delete)'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Handle input change
    const handleChange = (
        field: keyof FormData,
        value: string | number
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }))
        // Clear error for this field when user starts typing
        if (errors[field as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined,
            }))
        }
        setSubmitError(null)
    }

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitError(null)
        setSubmitSuccess(false)

        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)

        try {
            // Prepare user data
            const effectiveRoleId = formData.roleId as number
            const userData: CreateUserData = {
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                phoneNumber: formData.phoneNumber.trim() || null,
                password: formData.password,
                roleId: effectiveRoleId,
                // Sub-admins: inherit fields at their level, use form selections for levels below
                // Super Admin: uses form data for everything
                zoneId: isSubAdmin
                    ? (currentUser?.zoneId ?? null)
                    : (formData.zoneId ? (formData.zoneId as number) : null),
                stateId: isSubAdmin
                    ? (showStateForSubAdmin ? (formData.stateId ? Number(formData.stateId) : null) : (currentUser?.stateId ?? null))
                    : (formData.stateId ? (formData.stateId as number) : null),
                districtId: isSubAdmin
                    ? (showDistrictForSubAdmin ? (formData.districtId ? Number(formData.districtId) : null) : (currentUser?.districtId ?? null))
                    : (formData.districtId ? (formData.districtId as number) : null),
                orgId: isSubAdmin
                    ? (showOrgForSubAdmin ? (formData.orgId ? Number(formData.orgId) : null) : (currentUser?.orgId ?? null))
                    : (formData.orgId ? (formData.orgId as number) : null),
                universityId: (selectedRole === 'kvk_admin' || selectedRole === 'kvk_user') ? (formData.universityId ? (formData.universityId as number) : null) : null,
                kvkId: formData.kvkId ? (formData.kvkId as number) : null,
            }
            if (showPermissionsSection && formData.permissions.length > 0) {
                userData.permissions = formData.permissions
            }

            await userApi.createUser(userData)
            setSubmitSuccess(true)

            // Call success callback after a short delay
            setTimeout(() => {
                onSuccess?.()
                onClose()
            }, 1500)
        } catch (error) {
            setSubmitError(
                error instanceof Error ? error.message : 'Failed to create user'
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create New User"
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Success Message */}
                {submitSuccess && (
                    <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>User created successfully!</span>
                    </div>
                )}

                {/* Error Message */}
                {submitError && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{submitError}</span>
                    </div>
                )}


                {/* Name */}
                <Input
                    label="Full Name"
                    type="text"
                    value={formData.name}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder="Enter full name"
                    required
                    error={errors.name}
                    disabled={isSubmitting || submitSuccess}
                />

                {/* Email */}
                <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={e => handleChange('email', e.target.value)}
                    placeholder="user@example.com"
                    required
                    error={errors.email}
                    disabled={isSubmitting || submitSuccess}
                />

                {/* Phone Number */}
                <Input
                    label="Phone Number (Optional)"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={e => handleChange('phoneNumber', e.target.value)}
                    placeholder="9876543210"
                    error={errors.phoneNumber}
                    disabled={isSubmitting || submitSuccess}
                />

                {/* Password */}
                <div>
                    <Input
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={e => handleChange('password', e.target.value)}
                        placeholder="Enter password (min 8 chars)"
                        required
                        error={errors.password}
                        disabled={isSubmitting || submitSuccess}
                        rightIcon={
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-[#757575] hover:text-[#487749] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#487749]"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                aria-pressed={showPassword}
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        }
                    />
                    <p className="mt-1 text-xs text-[#757575]">
                        Must contain uppercase, lowercase, and number
                    </p>
                </div>

                {/* Confirm Password */}
                <Input
                    label="Confirm Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={e => handleChange('confirmPassword', e.target.value)}
                    placeholder="Confirm password"
                    required
                    error={errors.confirmPassword}
                    disabled={isSubmitting || submitSuccess}
                />

                {/* Role: Super Admin sees all roles; other admins see only non-admin roles (state/district/org/KVK user) */}
                <DependentDropdown
                    label="Role"
                    required
                    value={formData.roleId || ''}
                    onChange={(value) => {
                        const roleId = value ? Number(value) : ''
                        handleChange('roleId', roleId)
                        setFormData(prev => ({
                            ...prev,
                            roleId: roleId as number | '',
                            zoneId: '',
                            stateId: '',
                            districtId: '',
                            orgId: '',
                            universityId: '',
                            kvkId: '',
                        }))
                    }}
                        options={(isSubAdmin ? allowedRolesForDropdown : allRoles).map((role: RoleInfo) => ({
                            value: role.roleId,
                            label: getRoleLabel(role.roleName)
                        }))}
                    emptyMessage="No roles available"
                    error={errors.roleId}
                    disabled={isSubmitting || submitSuccess}
                />
                {isSubAdmin && (
                    <p className="mt-1.5 text-xs text-[#757575]">
                        You can create roles with lower hierarchy than yours.
                    </p>
                )}

                {/* Permissions for this user (when creator is not Super Admin) */}
                {showPermissionsSection && (
                    <div>
                        <p className="block text-sm font-medium text-[#487749] mb-2">
                            Permissions for this user <span className="text-red-500">*</span>
                        </p>
                        <p className="text-xs text-[#757575] mb-3">
                            Select at least one permission. The user will only be able to perform the selected actions.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            {(NON_ADMIN_ROLES_WITH_ADD.includes(selectedRole || '') ? PERMISSION_ACTIONS : PERMISSION_ACTIONS.filter(a => a.value !== 'ADD')).map(({ value, label }) => (
                                <label
                                    key={value}
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.permissions.includes(value)}
                                        onChange={e => {
                                            const checked = e.target.checked
                                            setFormData(prev => ({
                                                ...prev,
                                                permissions: checked
                                                    ? [...prev.permissions, value]
                                                    : prev.permissions.filter(p => p !== value),
                                            }))
                                            if (errors.permissions) {
                                                setErrors(prev => ({ ...prev, permissions: undefined }))
                                            }
                                        }}
                                        disabled={isSubmitting || submitSuccess}
                                        className="w-4 h-4 rounded border-[#BDBDBD] text-[#487749] focus:ring-[#487749]"
                                    />
                                    <span className="text-sm text-[#212121]">{label}</span>
                                </label>
                            ))}
                        </div>
                        {errors.permissions && (
                            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                {errors.permissions}
                            </p>
                        )}
                    </div>
                )}

                {/* Hierarchy info for sub-admins */}
                {isSubAdmin && !showStateForSubAdmin && !showDistrictForSubAdmin && !showOrgForSubAdmin && selectedRole !== 'kvk_admin' && selectedRole !== 'kvk_user' && (
                    <p className="text-sm text-[#757575]">
                        New user will inherit your <strong className="text-[#212121]">Zone, State, District &amp; Organization</strong>.
                    </p>
                )}

                {/* Sub-admin: State dropdown (e.g., zone_admin creating state_user) */}
                {showStateForSubAdmin && (
                    <DependentDropdown
                        label="State"
                        required={stateRequired}
                        value={formData.stateId || ''}
                        onChange={(value) => {
                            const stateId = value ? Number(value) : ''
                            handleChange('stateId', stateId)
                            setFormData(prev => ({
                                ...prev,
                                stateId: stateId as number | '',
                                districtId: '',
                                orgId: '',
                                universityId: '',
                                kvkId: '',
                            }))
                        }}
                        dependsOn={{
                            value: currentUser?.zoneId,
                            field: 'zoneId'
                        }}
                        options={[]}
                        onOptionsLoad={async (zoneId, signal) => {
                            const response = await masterDataApi.getStatesByZone(zoneId as number, signal)
                            return response.data.map((s: State) => ({
                                value: s.stateId,
                                label: s.stateName
                            }))
                        }}
                        cacheKey="states-by-zone"
                        emptyMessage="No states available for this zone"
                        loadingMessage="Loading states..."
                        error={errors.stateId}
                        disabled={isSubmitting || submitSuccess}
                    />
                )}

                {/* Sub-admin: District dropdown */}
                {showDistrictForSubAdmin && (
                    <DependentDropdown
                        label="District"
                        required={districtRequired}
                        value={formData.districtId || ''}
                        onChange={(value) => {
                            const districtId = value ? Number(value) : ''
                            handleChange('districtId', districtId)
                            setFormData(prev => ({
                                ...prev,
                                districtId: districtId as number | '',
                                orgId: '',
                                universityId: '',
                                kvkId: '',
                            }))
                        }}
                        dependsOn={{
                            value: showStateForSubAdmin ? formData.stateId : currentUser?.stateId,
                            field: 'stateId'
                        }}
                        options={[]}
                        onOptionsLoad={async (stateId, signal) => {
                            const response = await masterDataApi.getDistrictsByState(stateId as number, signal)
                            return response.data.map((d: District) => ({
                                value: d.districtId,
                                label: d.districtName
                            }))
                        }}
                        cacheKey="districts-by-state"
                        emptyMessage="No districts available for this state"
                        loadingMessage="Loading districts..."
                        error={errors.districtId}
                        disabled={isSubmitting || submitSuccess}
                    />
                )}

                {/* Sub-admin: Organization dropdown */}
                {showOrgForSubAdmin && (
                    <DependentDropdown
                        label="Organization"
                        required={orgRequired}
                        value={formData.orgId || ''}
                        onChange={(value) => {
                            const orgId = value ? Number(value) : ''
                            handleChange('orgId', orgId)
                            setFormData(prev => ({
                                ...prev,
                                orgId: orgId as number | '',
                                universityId: '',
                                kvkId: '',
                            }))
                        }}
                        dependsOn={{
                            value: showDistrictForSubAdmin ? formData.districtId : (showStateForSubAdmin ? formData.stateId : currentUser?.districtId),
                            field: showDistrictForSubAdmin ? 'districtId' : (showStateForSubAdmin ? 'stateId' : 'districtId')
                        }}
                        options={[]}
                        onOptionsLoad={async (depValue, signal) => {
                            if (showDistrictForSubAdmin) {
                                const response = await masterDataApi.getOrganizationsByDistrict(depValue as number, signal)
                                return response.data.map((org: Organization) => ({
                                    value: org.orgId,
                                    label: org.orgName
                                }))
                            } else {
                                // Filter by state
                                const response = await masterDataApi.getOrganizations()
                                const filtered = response.data.filter((org: Organization) =>
                                    org.district?.state?.stateId === depValue
                                )
                                return filtered.map((org: Organization) => ({
                                    value: org.orgId,
                                    label: org.orgName
                                }))
                            }
                        }}
                        cacheKey="organizations-by-district"
                        emptyMessage="No organizations available"
                        loadingMessage="Loading organizations..."
                        error={errors.orgId}
                        disabled={isSubmitting || submitSuccess}
                    />
                )}

                {/* Super Admin hierarchy dropdowns */}
                {!isSubAdmin && showZoneField && (showStateField || showDistrictField || showOrgField) && (
                    <p className="text-xs text-[#757575]">
                        Select <strong>Zone → State → District → Organization → KVK</strong> in order. Higher-level selections filter the options below.
                    </p>
                )}

                {/* Super Admin: Zone → State → District cascade - select in order */}
                {!isSubAdmin && showZoneField && (
                    <DependentDropdown
                        label="Zone"
                        required={zoneRequired}
                        value={formData.zoneId || ''}
                        onChange={(value) => {
                            const zoneId = value ? Number(value) : ''
                            handleChange('zoneId', zoneId)
                            setFormData(prev => ({
                                ...prev,
                                zoneId: zoneId as number | '',
                                stateId: '',
                                districtId: '',
                                orgId: '',
                                universityId: '',
                                kvkId: '',
                            }))
                        }}
                        options={zones.map(z => ({ value: z.zoneId, label: z.zoneName }))}
                        emptyMessage="No zones available"
                        error={errors.zoneId}
                        disabled={isSubmitting || submitSuccess}
                    />
                )}

                {!isSubAdmin && showStateField && (
                    <DependentDropdown
                        label="State"
                        required={stateRequired}
                        value={formData.stateId || ''}
                        onChange={(value) => {
                            const stateId = value ? Number(value) : ''
                            handleChange('stateId', stateId)
                            setFormData(prev => ({
                                ...prev,
                                stateId: stateId as number | '',
                                districtId: '',
                                orgId: '',
                                universityId: '',
                                kvkId: '',
                            }))
                        }}
                        dependsOn={{
                            value: showZoneField ? formData.zoneId : undefined,
                            field: 'zoneId'
                        }}
                        options={[]}
                        onOptionsLoad={async (zoneId, signal) => {
                            const response = await masterDataApi.getStatesByZone(zoneId as number, signal)
                            return response.data.map((s: State) => ({
                                value: s.stateId,
                                label: s.stateName
                            }))
                        }}
                        cacheKey="states-by-zone"
                        emptyMessage="No states available for this zone"
                        loadingMessage="Loading states..."
                        error={errors.stateId}
                        disabled={isSubmitting || submitSuccess}
                    />
                )}

                {!isSubAdmin && showDistrictField && (
                    <DependentDropdown
                        label="District"
                        required={districtRequired}
                        value={formData.districtId || ''}
                        onChange={(value) => {
                            const districtId = value ? Number(value) : ''
                            handleChange('districtId', districtId)
                            setFormData(prev => ({
                                ...prev,
                                districtId: districtId as number | '',
                                orgId: '',
                                universityId: '',
                                kvkId: '',
                            }))
                        }}
                        dependsOn={{
                            value: showStateField ? formData.stateId : undefined,
                            field: 'stateId'
                        }}
                        options={[]}
                        onOptionsLoad={async (stateId, signal) => {
                            const response = await masterDataApi.getDistrictsByState(stateId as number, signal)
                            return response.data.map((d: District) => ({
                                value: d.districtId,
                                label: d.districtName
                            }))
                        }}
                        cacheKey="districts-by-state"
                        emptyMessage="No districts available for this state"
                        loadingMessage="Loading districts..."
                        error={errors.districtId}
                        disabled={isSubmitting || submitSuccess}
                    />
                )}

                {!isSubAdmin && showOrgField && (
                    <DependentDropdown
                        label="Organization"
                        required={orgRequired}
                        value={formData.orgId || ''}
                        onChange={(value) => {
                            const orgId = value ? Number(value) : ''
                            handleChange('orgId', orgId)
                            setFormData(prev => ({
                                ...prev,
                                orgId: orgId as number | '',
                                universityId: '',
                                kvkId: '',
                            }))
                        }}
                        dependsOn={{
                            value: showDistrictField ? formData.districtId : (showStateField ? formData.stateId : undefined),
                            field: showDistrictField ? 'districtId' : 'stateId'
                        }}
                        options={[]}
                        onOptionsLoad={async (depValue, signal) => {
                            if (showDistrictField) {
                                const response = await masterDataApi.getOrganizationsByDistrict(depValue as number, signal)
                                return response.data.map((org: Organization) => ({
                                    value: org.orgId,
                                    label: org.orgName
                                }))
                            } else {
                                // Filter by state
                                const response = await masterDataApi.getOrganizations()
                                const filtered = response.data.filter((org: Organization) =>
                                    org.district?.state?.stateId === depValue
                                )
                                return filtered.map((org: Organization) => ({
                                    value: org.orgId,
                                    label: org.orgName
                                }))
                            }
                        }}
                        cacheKey="organizations-by-district"
                        emptyMessage="No organizations available"
                        loadingMessage="Loading organizations..."
                        error={errors.orgId}
                        disabled={isSubmitting || submitSuccess}
                    />
                )}

                {/* University dropdown - shown when Organization is visible */}
                {((!isSubAdmin && showOrgField) || showOrgForSubAdmin) && (
                    <DependentDropdown
                        label="University"
                        value={formData.universityId || ''}
                        onChange={(value) => {
                            const universityId = value ? Number(value) : ''
                            handleChange('universityId', universityId)
                            setFormData(prev => ({
                                ...prev,
                                universityId: universityId as number | '',
                                kvkId: '',
                            }))
                        }}
                        dependsOn={{
                            value: formData.orgId,
                            field: 'orgId'
                        }}
                        options={[]}
                        onOptionsLoad={async (orgId, signal) => {
                            const response = await masterDataApi.getUniversitiesByOrganization(orgId as number, signal)
                            return response.data.map((u: University) => ({
                                value: u.universityId,
                                label: u.universityName
                            }))
                        }}
                        cacheKey="universities-by-org"
                        emptyMessage="No universities available for this organization"
                        loadingMessage="Loading universities..."
                        error={errors.universityId}
                        disabled={isSubmitting || submitSuccess}
                    />
                )}

                {(selectedRole === 'kvk_admin' || selectedRole === 'kvk_user') && (
                    <DependentDropdown
                        label={`KVK ${kvkRequired ? '*' : ''}`}
                        value={formData.kvkId || ''}
                        onChange={(value) => {
                            const kvkId = value ? Number(value) : ''
                            handleChange('kvkId', kvkId)
                        }}
                        dependsOn={{
                            value: !isSubAdmin ? formData.universityId : (showOrgForSubAdmin ? formData.universityId : (currentUser as any)?.universityId),
                            field: 'universityId'
                        }}
                        options={[]}
                        onOptionsLoad={async (universityId, _signal) => {
                            const params = buildKvkFilters({
                                isSubAdmin,
                                currentUser,
                                formData,
                                showStateForSubAdmin,
                                showDistrictForSubAdmin,
                                showOrgForSubAdmin,
                                universityId: universityId, // Pass the selected universityId
                            });
                            const response = await aboutKvkApi.getKvks(params)
                            return response.data.map((kvk: Kvk) => ({
                                value: kvk.kvkId,
                                label: kvk.kvkName
                            }))
                        }}
                        emptyMessage={isSubAdmin
                            ? 'No KVKs available for your location'
                            : 'No KVKs found. Please select Zone, State, District, Organization and University first.'}
                        loadingMessage="Loading KVKs..."
                        cacheKey="kvks-by-university"
                        required={kvkRequired}
                        error={errors.kvkId}
                        disabled={isSubmitting || submitSuccess}
                    />
                )}

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E0E0E0]">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={isSubmitting || submitSuccess}
                    >
                        Cancel
                    </Button>
                    <LoadingButton
                        type="submit"
                        variant="primary"
                        isLoading={isSubmitting}
                        loadingText="Creating..."
                        disabled={submitSuccess}
                    >
                        {submitSuccess ? 'Created!' : 'Create User'}
                    </LoadingButton>
                </div>
            </form>
        </Modal>
    )
}
