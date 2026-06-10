import React, { useState, useEffect } from 'react'
import { userApi, UpdateUserData, PermissionAction, getRoleLabel } from '../../services/userApi'
import { masterDataApi } from '../../services/masterDataApi'
import { aboutKvkApi } from '../../services/aboutKvkApi'
import { useAuth } from '../../contexts/AuthContext'
import { getRoleLevel, getCreatableRoles } from '../../constants/roleHierarchy'
import { Button } from '../ui/button'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'
import { LoadingButton } from '../common/LoadingButton'
import { DependentDropdown } from '../common/DependentDropdown'
import { buildKvkFilters } from '../../utils/kvkFilterUtils'
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import type { Zone, State, District, Organization } from '../../types/masterData'
import type { Kvk } from '../../types/aboutKvk'
import { useMasterData } from '../../hooks/useMasterData'
import { useRoles } from '../../hooks/useUserManagement'
import type { RoleInfo } from '../../services/userApi'
import { cleanIndianMobileInput, indianMobileFieldError } from '../../utils/indianPhone'

const PERMISSION_ACTIONS: { value: PermissionAction; label: string }[] = [
    { value: 'VIEW', label: 'View' },
    { value: 'ADD', label: 'Add' },
    { value: 'EDIT', label: 'Edit' },
    { value: 'DELETE', label: 'Delete' },
]

/** Roles that get the ADD permission option even though they are non-admin */
const NON_ADMIN_ROLES_WITH_ADD = ['kvk_user']

/** Non-admin roles that have user-level permissions */
const NON_ADMIN_ROLES = ['kvk_user', 'state_user', 'district_user', 'org_user']

export interface EditUser {
    userId: number
    name: string
    email: string
    phoneNumber?: string | null
    roleId: number
    roleName: string
    zoneId?: number | null
    stateId?: number | null
    districtId?: number | null
    orgId?: number | null
    kvkId?: number | null
    permissions?: PermissionAction[]
}

interface EditUserModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
    user: EditUser | null
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
    permissions?: string
}

const emptyForm: FormData = {
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
    kvkId: '',
    permissions: [],
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    user,
}) => {
    const [formData, setFormData] = useState<FormData>(emptyForm)
    // Snapshot of the user's permission set when the modal opened, so Save
    // can send a delta of only the actions the admin actually toggled.
    // Untouched checkboxes produce no writes — the matrix's per-module
    // distribution stays intact.
    const [initialPermissions, setInitialPermissions] = useState<PermissionAction[]>([])
    const { user: currentUser } = useAuth()

    const [errors, setErrors] = useState<FormErrors>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [submitSuccess, setSubmitSuccess] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const isSubAdmin = currentUser?.role !== 'super_admin'
    const editorLevel = getRoleLevel(currentUser?.role || '')
    const isKvkAdminEditing = currentUser?.role === 'kvk_admin'

    const { data: allRoles = [] } = useRoles()

    // Roles this admin may assign — plus the user's current role so the
    // dropdown always shows it even when the editor couldn't assign it anew.
    const allowedRoleNames = currentUser?.role ? getCreatableRoles(currentUser.role) : []
    const assignableRoles = isSubAdmin
        ? allRoles.filter((r: RoleInfo) => allowedRoleNames.includes(r.roleName) || r.roleId === user?.roleId)
        : allRoles

    const selectedRole = formData.roleId
        ? allRoles.find((r: RoleInfo) => r.roleId === formData.roleId)?.roleName ?? null
        : null

    // Which hierarchy fields the selected role requires (full cascade)
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

    const showZoneField = zoneRequired
    const showStateField = stateRequired
    const showDistrictField = districtRequired
    const showOrgField = orgRequired

    const { data: zones = [] } = useMasterData<Zone>('zones', { enabled: !isSubAdmin && showZoneField })

    // Sub-admin: only show dropdowns for levels STRICTLY BELOW the editor's own level
    const needsStateLevel = ['state_admin', 'state_user', 'district_admin', 'district_user', 'org_admin', 'org_user', 'kvk_admin', 'kvk_user']
    const needsDistrictLevel = ['district_admin', 'district_user', 'org_admin', 'org_user', 'kvk_admin', 'kvk_user']
    const needsOrgLevel = ['org_admin', 'org_user', 'kvk_admin', 'kvk_user']

    const showStateForSubAdmin = isSubAdmin && editorLevel < 2 && needsStateLevel.includes(selectedRole || '')
    const showDistrictForSubAdmin = isSubAdmin && editorLevel < 3 && needsDistrictLevel.includes(selectedRole || '')
    const showOrgForSubAdmin = isSubAdmin && editorLevel < 4 && needsOrgLevel.includes(selectedRole || '')

    const isSelectedRoleUser = selectedRole !== null && NON_ADMIN_ROLES.includes(selectedRole)
    const showPermissionsSection = isSelectedRoleUser

    // Seed the form from the user being edited
    useEffect(() => {
        if (isOpen && user) {
            const allowedActions: PermissionAction[] = NON_ADMIN_ROLES_WITH_ADD.includes(user.roleName)
                ? ['VIEW', 'ADD', 'EDIT', 'DELETE']
                : ['VIEW', 'EDIT', 'DELETE']
            const seeded = (user.permissions || []).filter(p => allowedActions.includes(p))
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                password: '',
                confirmPassword: '',
                roleId: user.roleId,
                zoneId: user.zoneId ?? '',
                stateId: user.stateId ?? '',
                districtId: user.districtId ?? '',
                orgId: user.orgId ?? '',
                kvkId: user.kvkId ?? '',
                permissions: seeded,
            })
            setInitialPermissions(seeded)
            setErrors({})
            setSubmitError(null)
            setSubmitSuccess(false)
            setShowPassword(false)
        }
    }, [isOpen, user])

    useEffect(() => {
        if (!isOpen) {
            setFormData(emptyForm)
            setErrors({})
            setSubmitError(null)
            setSubmitSuccess(false)
            setShowPassword(false)
        }
    }, [isOpen])

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required'
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters'
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format'
        }

        const phoneErr = indianMobileFieldError(formData.phoneNumber, false)
        if (phoneErr) {
            newErrors.phoneNumber = phoneErr
        }

        // Password is optional on edit — validated only when provided
        if (formData.password) {
            if (formData.password.length < 8) {
                newErrors.password = 'Password must be at least 8 characters'
            } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
                newErrors.password = 'Password must contain uppercase, lowercase, and number'
            }
            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match'
            }
        } else if (formData.confirmPassword) {
            newErrors.password = 'Enter the new password first'
        }

        if (!formData.roleId) {
            newErrors.roleId = 'Role is required'
        }

        if (!isSubAdmin) {
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
                newErrors.orgId = 'Institute is required'
            }
        } else {
            if (showStateForSubAdmin && stateRequired && !formData.stateId) {
                newErrors.stateId = 'State is required for this role'
            }
            if (showDistrictForSubAdmin && districtRequired && !formData.districtId) {
                newErrors.districtId = 'District is required for this role'
            }
            if (showOrgForSubAdmin && orgRequired && !formData.orgId) {
                newErrors.orgId = 'Institute is required for this role'
            }
        }
        if (kvkRequired && !isKvkAdminEditing && !formData.kvkId) {
            newErrors.kvkId = 'KVK is required for this role'
        }

        if (showPermissionsSection && (!formData.permissions || formData.permissions.length === 0)) {
            newErrors.permissions = 'Select at least one permission (View, Edit, or Delete)'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleChange = (field: keyof FormData, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }))
        if (errors[field as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined,
            }))
        }
        setSubmitError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitError(null)
        setSubmitSuccess(false)

        if (!validateForm() || !user) return

        setIsSubmitting(true)

        try {
            const updateData: UpdateUserData = {}

            if (formData.name.trim() !== user.name) updateData.name = formData.name.trim()
            if (formData.email.trim().toLowerCase() !== (user.email || '').toLowerCase()) {
                updateData.email = formData.email.trim().toLowerCase()
            }

            const cleanedPhone = cleanIndianMobileInput(formData.phoneNumber) || null
            if (cleanedPhone !== (user.phoneNumber || null)) updateData.phoneNumber = cleanedPhone

            if (formData.password) updateData.password = formData.password

            // Resolve the hierarchy the same way the create form does:
            // sub-admins inherit their own scope for levels at/above theirs.
            const nextZoneId = isSubAdmin
                ? (currentUser?.zoneId ?? null)
                : (formData.zoneId ? Number(formData.zoneId) : null)
            const nextStateId = isSubAdmin
                ? (showStateForSubAdmin ? (formData.stateId ? Number(formData.stateId) : null) : (currentUser?.stateId ?? null))
                : (formData.stateId ? Number(formData.stateId) : null)
            const nextDistrictId = isSubAdmin
                ? (showDistrictForSubAdmin ? (formData.districtId ? Number(formData.districtId) : null) : (currentUser?.districtId ?? null))
                : (formData.districtId ? Number(formData.districtId) : null)
            const nextOrgId = isSubAdmin
                ? (showOrgForSubAdmin ? (formData.orgId ? Number(formData.orgId) : null) : (currentUser?.orgId ?? null))
                : (formData.orgId ? Number(formData.orgId) : null)
            const nextKvkId = kvkRequired
                ? (isKvkAdminEditing ? (currentUser?.kvkId ?? null) : (formData.kvkId ? Number(formData.kvkId) : null))
                : null

            const roleChanged = formData.roleId !== user.roleId
            const hierarchyChanged =
                roleChanged ||
                nextZoneId !== (user.zoneId ?? null) ||
                nextStateId !== (user.stateId ?? null) ||
                nextDistrictId !== (user.districtId ?? null) ||
                nextOrgId !== (user.orgId ?? null) ||
                nextKvkId !== (user.kvkId ?? null)

            if (hierarchyChanged) {
                // Send the full set so the backend validates the combination as a whole.
                updateData.roleId = formData.roleId as number
                updateData.zoneId = nextZoneId
                updateData.stateId = nextStateId
                updateData.districtId = nextDistrictId
                updateData.orgId = nextOrgId
                updateData.kvkId = nextKvkId
            }

            if (isSelectedRoleUser) {
                const allowedActions: PermissionAction[] = NON_ADMIN_ROLES_WITH_ADD.includes(selectedRole || '')
                    ? ['VIEW', 'ADD', 'EDIT', 'DELETE']
                    : ['VIEW', 'EDIT', 'DELETE']
                const current = new Set(formData.permissions.filter(p => allowedActions.includes(p)))
                const initial = new Set(initialPermissions.filter(p => allowedActions.includes(p)))
                const add = [...current].filter(p => !initial.has(p))
                const remove = [...initial].filter(p => !current.has(p))
                if (add.length || remove.length) {
                    updateData.permissionsDelta = {
                        ...(add.length ? { add } : {}),
                        ...(remove.length ? { remove } : {}),
                    }
                }
            }

            await userApi.updateUser(user.userId, updateData)
            setSubmitSuccess(true)

            setTimeout(() => {
                onSuccess?.()
                onClose()
            }, 1500)
        } catch (error) {
            setSubmitError(
                error instanceof Error ? error.message : 'Failed to update user'
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!user) return null

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit User"
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Success Message */}
                {submitSuccess && (
                    <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>User updated successfully!</span>
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
                    onChange={e => handleChange('phoneNumber', cleanIndianMobileInput(e.target.value))}
                    placeholder="10-digit mobile (6–9…)"
                    error={errors.phoneNumber}
                    disabled={isSubmitting || submitSuccess}
                />

                {/* New Password (optional) */}
                <div>
                    <Input
                        label="New Password (Optional)"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={e => handleChange('password', e.target.value)}
                        placeholder="Leave blank to keep current password"
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
                        Setting a new password logs the user out everywhere.
                    </p>
                </div>

                {/* Confirm New Password — only when changing it */}
                {formData.password && (
                    <Input
                        label="Confirm New Password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={e => handleChange('confirmPassword', e.target.value)}
                        placeholder="Confirm new password"
                        required
                        error={errors.confirmPassword}
                        disabled={isSubmitting || submitSuccess}
                    />
                )}

                {/* Role */}
                <DependentDropdown
                    label="Role"
                    required
                    value={formData.roleId || ''}
                    onChange={(value) => {
                        const roleId = value ? Number(value) : ''
                        setFormData(prev => {
                            // Keep the saved hierarchy when switching back to the
                            // user's original role; reset it otherwise (same as create).
                            const backToOriginal = roleId === user.roleId
                            return {
                                ...prev,
                                roleId: roleId as number | '',
                                zoneId: backToOriginal ? (user.zoneId ?? '') : '',
                                stateId: backToOriginal ? (user.stateId ?? '') : '',
                                districtId: backToOriginal ? (user.districtId ?? '') : '',
                                orgId: backToOriginal ? (user.orgId ?? '') : '',
                                kvkId: backToOriginal ? (user.kvkId ?? '') : '',
                            }
                        })
                        if (errors.roleId) setErrors(prev => ({ ...prev, roleId: undefined }))
                        setSubmitError(null)
                    }}
                    options={assignableRoles.map((role: RoleInfo) => ({
                        value: role.roleId,
                        label: getRoleLabel(role.roleName)
                    }))}
                    emptyMessage="No roles available"
                    error={errors.roleId}
                    disabled={isSubmitting || submitSuccess}
                />
                {isSubAdmin && (
                    <p className="mt-1.5 text-xs text-[#757575]">
                        You can assign roles with lower hierarchy than yours.
                    </p>
                )}

                {/* Permissions (only for _user roles) */}
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
                        The user will inherit your <strong className="text-[#212121]">Zone, State, District &amp; Institute</strong>.
                    </p>
                )}

                {/* Sub-admin: State dropdown */}
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
                        label="Institute"
                        required={orgRequired}
                        value={formData.orgId || ''}
                        onChange={(value) => {
                            const orgId = value ? Number(value) : ''
                            handleChange('orgId', orgId)
                            setFormData(prev => ({
                                ...prev,
                                orgId: orgId as number | '',
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
                        Select <strong>Zone → State → District → Institute → KVK</strong> in order. Higher-level selections filter the options below.
                    </p>
                )}

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
                        label="Institute"
                        required={orgRequired}
                        value={formData.orgId || ''}
                        onChange={(value) => {
                            const orgId = value ? Number(value) : ''
                            handleChange('orgId', orgId)
                            setFormData(prev => ({
                                ...prev,
                                orgId: orgId as number | '',
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

                {/* KVK dropdown — loads from the selected Institute (no Host step needed on edit) */}
                {(selectedRole === 'kvk_admin' || selectedRole === 'kvk_user') && !isKvkAdminEditing && (
                    <DependentDropdown
                        label="KVK"
                        required={kvkRequired}
                        value={formData.kvkId || ''}
                        onChange={(value) => {
                            const kvkId = value ? Number(value) : ''
                            handleChange('kvkId', kvkId)
                        }}
                        dependsOn={{
                            value: (!isSubAdmin || showOrgForSubAdmin) ? formData.orgId : (currentUser?.orgId ?? currentUser?.districtId ?? currentUser?.stateId ?? currentUser?.zoneId),
                            field: 'orgId'
                        }}
                        options={[]}
                        onOptionsLoad={async (_orgId, _signal) => {
                            const params = buildKvkFilters({
                                isSubAdmin,
                                currentUser,
                                formData,
                                showStateForSubAdmin,
                                showDistrictForSubAdmin,
                                showOrgForSubAdmin,
                            })
                            const response = await aboutKvkApi.getKvks(params)
                            return response.data.map((kvk: Kvk) => ({
                                value: kvk.kvkId,
                                label: kvk.kvkName
                            }))
                        }}
                        emptyMessage={isSubAdmin
                            ? 'No KVKs available for your location'
                            : 'No KVKs found. Please select Zone, State, District and Institute first.'}
                        loadingMessage="Loading KVKs..."
                        cacheKey="kvks-by-org-edit"
                        error={errors.kvkId}
                        disabled={isSubmitting || submitSuccess}
                    />
                )}

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E0E0E0]">
                    <Button
                        type="button"
                        variant="secondary"
                        size="md"
                        onClick={onClose}
                        disabled={isSubmitting || submitSuccess}
                    >
                        Cancel
                    </Button>
                    <LoadingButton
                        type="submit"
                        variant="primary"
                        isLoading={isSubmitting}
                        loadingText="Saving..."
                        disabled={submitSuccess}
                    >
                        {submitSuccess ? 'Saved!' : 'Save Changes'}
                    </LoadingButton>
                </div>
            </form>
        </Modal>
    )
}
