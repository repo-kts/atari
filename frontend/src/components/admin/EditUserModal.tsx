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
import { EntitySearchSelect } from '../common/EntitySearchSelect'
import {
    useUserHierarchyPicker,
    ROLE_TARGET_ENTITY,
    joinSublabel,
    type DerivedHierarchy,
} from '../../hooks/useUserHierarchyPicker'
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'
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
    universityId?: number | null
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
    universityId?: string
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
    universityId: '',
    kvkId: '',
    permissions: [],
}

function toFormFields(h: DerivedHierarchy) {
    return {
        zoneId: h.zoneId ?? '',
        stateId: h.stateId ?? '',
        districtId: h.districtId ?? '',
        orgId: h.orgId ?? '',
        universityId: h.universityId ?? '',
        kvkId: h.kvkId ?? '',
    } as const
}

interface EntityInfo {
    label: string
    sublabel?: string
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
    // The currently-assigned entity's name/context, resolved via a single
    // by-id lookup on open — the user list API only returns raw ids.
    const [initialEntityInfo, setInitialEntityInfo] = useState<EntityInfo | null>(null)
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

    const hierarchyPicker = useUserHierarchyPicker({
        selectedRole,
        isSubAdmin,
        actorLevel: editorLevel,
        currentUser,
        isKvkAdminActor: isKvkAdminEditing,
    })

    // Roles that fully inherit the editor's scope don't render a picker, so seed
    // formData's hierarchy fields directly whenever that's the active case.
    useEffect(() => {
        if (!selectedRole || hierarchyPicker.showPicker) return
        const derived = hierarchyPicker.resolveHierarchy(null)
        setFormData(prev => ({ ...prev, ...toFormFields(derived) }))
    }, [selectedRole, hierarchyPicker.showPicker])

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
                universityId: user.universityId ?? '',
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

    // Resolve the user's currently-assigned entity name for the search field's
    // initial display, since GET /admin/users only returns raw ids.
    useEffect(() => {
        if (!isOpen || !user) {
            setInitialEntityInfo(null)
            return
        }
        let cancelled = false
        const entity = ROLE_TARGET_ENTITY[user.roleName] ?? null

        const load = async () => {
            try {
                if (entity === 'zone' && user.zoneId) {
                    const res = await masterDataApi.getZoneById(user.zoneId)
                    if (!cancelled) setInitialEntityInfo({ label: res.data.zoneName })
                } else if (entity === 'state' && user.stateId) {
                    const res = await masterDataApi.getStateById(user.stateId)
                    if (!cancelled) {
                        setInitialEntityInfo({
                            label: res.data.stateName,
                            sublabel: joinSublabel([res.data.zone?.zoneName ? `Zone: ${res.data.zone.zoneName}` : undefined]),
                        })
                    }
                } else if (entity === 'district' && user.districtId) {
                    const res = await masterDataApi.getDistrictById(user.districtId)
                    if (!cancelled) {
                        setInitialEntityInfo({
                            label: res.data.districtName,
                            sublabel: joinSublabel([res.data.state?.stateName, res.data.zone?.zoneName]),
                        })
                    }
                } else if (entity === 'org' && user.orgId) {
                    const res = await masterDataApi.getOrganizationById(user.orgId)
                    if (!cancelled) {
                        setInitialEntityInfo({
                            label: res.data.orgName,
                            sublabel: joinSublabel([res.data.district?.districtName, res.data.district?.state?.stateName]),
                        })
                    }
                } else if (entity === 'host' && user.universityId) {
                    const res = await masterDataApi.getUniversityById(user.universityId)
                    if (!cancelled) {
                        setInitialEntityInfo({
                            label: res.data.universityName,
                            sublabel: joinSublabel([res.data.organization?.orgName]),
                        })
                    }
                } else if (entity === 'kvk' && user.kvkId) {
                    const res = await aboutKvkApi.getKvkById(user.kvkId)
                    if (!cancelled) {
                        setInitialEntityInfo({
                            label: res.data.kvkName,
                            sublabel: joinSublabel([res.data.org?.orgName, res.data.district?.districtName, res.data.state?.stateName]),
                        })
                    }
                } else if (!cancelled) {
                    setInitialEntityInfo(null)
                }
            } catch {
                if (!cancelled) setInitialEntityInfo(null)
            }
        }
        load()
        return () => {
            cancelled = true
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

        if (hierarchyPicker.showPicker && hierarchyPicker.targetField && !formData[hierarchyPicker.targetField as keyof FormData]) {
            newErrors[hierarchyPicker.targetField as keyof FormErrors] = `${hierarchyPicker.entityLabel} is required`
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

            const nextZoneId = formData.zoneId ? Number(formData.zoneId) : null
            const nextStateId = formData.stateId ? Number(formData.stateId) : null
            const nextDistrictId = formData.districtId ? Number(formData.districtId) : null
            const nextOrgId = formData.orgId ? Number(formData.orgId) : null
            const nextUniversityId = formData.universityId ? Number(formData.universityId) : null
            const nextKvkId = formData.kvkId ? Number(formData.kvkId) : null

            const roleChanged = formData.roleId !== user.roleId
            const hierarchyChanged =
                roleChanged ||
                nextZoneId !== (user.zoneId ?? null) ||
                nextStateId !== (user.stateId ?? null) ||
                nextDistrictId !== (user.districtId ?? null) ||
                nextOrgId !== (user.orgId ?? null) ||
                nextUniversityId !== (user.universityId ?? null) ||
                nextKvkId !== (user.kvkId ?? null)

            if (hierarchyChanged) {
                // Send the full set so the backend validates the combination as a whole.
                updateData.roleId = formData.roleId as number
                updateData.zoneId = nextZoneId
                updateData.stateId = nextStateId
                updateData.districtId = nextDistrictId
                updateData.orgId = nextOrgId
                updateData.universityId = nextUniversityId
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
                                universityId: backToOriginal ? (user.universityId ?? '') : '',
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

                {/* Inherited scope info — shown whenever the role doesn't need a direct pick */}
                {selectedRole && !hierarchyPicker.showPicker && (
                    <p className="text-sm text-[#757575]">
                        {isKvkAdminEditing
                            ? <>This user will be assigned to your own <strong className="text-[#212121]">KVK</strong>.</>
                            : <>This user will inherit your own <strong className="text-[#212121]">{hierarchyPicker.entityLabel}</strong> (and everything above it).</>}
                    </p>
                )}

                {/* Direct search-and-select for whichever entity this role targets */}
                {selectedRole && hierarchyPicker.showPicker && hierarchyPicker.targetField && (
                    <EntitySearchSelect
                        label={hierarchyPicker.entityLabel}
                        required
                        value={formData[hierarchyPicker.targetField as keyof FormData] as number | ''}
                        onSelect={(option) => {
                            const derived = hierarchyPicker.resolveHierarchy(option ? option.record : null)
                            setFormData(prev => ({ ...prev, ...toFormFields(derived) }))
                            const field = hierarchyPicker.targetField as keyof FormErrors
                            if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
                            setSubmitError(null)
                        }}
                        search={hierarchyPicker.search}
                        placeholder={hierarchyPicker.placeholder}
                        emptyMessage={hierarchyPicker.emptyMessage}
                        error={hierarchyPicker.targetField ? errors[hierarchyPicker.targetField as keyof FormErrors] : undefined}
                        disabled={isSubmitting || submitSuccess}
                        initialLabel={
                            ROLE_TARGET_ENTITY[user.roleName] === hierarchyPicker.targetEntity
                                ? initialEntityInfo?.label
                                : undefined
                        }
                        initialSublabel={
                            ROLE_TARGET_ENTITY[user.roleName] === hierarchyPicker.targetEntity
                                ? initialEntityInfo?.sublabel
                                : undefined
                        }
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
