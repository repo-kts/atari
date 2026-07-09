import React, { useState, useEffect } from 'react'
import { userApi, CreateUserData, PermissionAction, getRoleLabel } from '../../services/userApi'
import { useAuth } from '../../contexts/AuthContext'
import { getRoleLevel, getCreatableRoles } from '../../constants/roleHierarchy'
import { Button } from '../ui/button'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'
import { LoadingButton } from '../common/LoadingButton'
import { DependentDropdown } from '../common/DependentDropdown'
import { EntitySearchSelect } from '../common/EntitySearchSelect'
import { useUserHierarchyPicker, type DerivedHierarchy } from '../../hooks/useUserHierarchyPicker'
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

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [formData, setFormData] = useState<FormData>(emptyForm)
    const { user: currentUser } = useAuth()

    const [errors, setErrors] = useState<FormErrors>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [submitSuccess, setSubmitSuccess] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    // Check if current user is a sub-admin (not super_admin)
    const isSubAdmin = currentUser?.role !== 'super_admin'
    const creatorLevel = getRoleLevel(currentUser?.role || '')
    const isKvkAdminCreating = currentUser?.role === 'kvk_admin'

    // Fetch roles using hooks
    const { data: allRoles = [] } = useRoles()

    // Allowed roles for current creator (when not Super Admin) — all roles strictly lower in hierarchy
    const allowedRoleNames = currentUser?.role ? getCreatableRoles(currentUser.role) : []
    const allowedRolesForDropdown = allRoles.filter((r: RoleInfo) => allowedRoleNames.includes(r.roleName))

    // Effective role from selection (both Super Admin and other admins choose or have a role)
    const selectedRole = formData.roleId
        ? allRoles.find((r: RoleInfo) => r.roleId === formData.roleId)?.roleName ?? null
        : null

    const hierarchyPicker = useUserHierarchyPicker({
        selectedRole,
        isSubAdmin,
        actorLevel: creatorLevel,
        currentUser,
        isKvkAdminActor: isKvkAdminCreating,
    })

    // Roles that fully inherit the creator's scope don't render a picker, so seed
    // formData's hierarchy fields directly whenever that's the active case.
    useEffect(() => {
        if (!selectedRole || hierarchyPicker.showPicker) return
        const derived = hierarchyPicker.resolveHierarchy(null)
        setFormData(prev => ({ ...prev, ...toFormFields(derived) }))
    }, [selectedRole, hierarchyPicker.showPicker])

    // Show permissions section only for _user roles (they use intersection pattern).
    // Admin roles get permissions from their role assignment, not user-level permissions.
    const isSelectedRoleUser = selectedRole !== null && NON_ADMIN_ROLES.includes(selectedRole)
    const showPermissionsSection = isSelectedRoleUser

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setFormData(emptyForm)
            setErrors({})
            setSubmitError(null)
            setSubmitSuccess(false)
            setShowPassword(false)
        }
    }, [isOpen])

    // When non–super-admin opens modal, auto-select first allowed role if none selected or current is invalid
    useEffect(() => {
        if (!isOpen || !isSubAdmin || allowedRolesForDropdown.length === 0) return
        const isCurrentRoleAllowed = formData.roleId !== '' &&
            allowedRolesForDropdown.some(r => r.roleId === formData.roleId)
        if (!isCurrentRoleAllowed) {
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

        const phoneErr = indianMobileFieldError(formData.phoneNumber, false)
        if (phoneErr) {
            newErrors.phoneNumber = phoneErr
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

        // Target entity validation — only when a picker is actually shown for this role
        if (hierarchyPicker.showPicker && hierarchyPicker.targetField && !formData[hierarchyPicker.targetField as keyof FormData]) {
            newErrors[hierarchyPicker.targetField as keyof FormErrors] = `${hierarchyPicker.entityLabel} is required`
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
            const effectiveRoleId = formData.roleId as number
            const userData: CreateUserData = {
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                phoneNumber: cleanIndianMobileInput(formData.phoneNumber) || null,
                password: formData.password,
                roleId: effectiveRoleId,
                zoneId: formData.zoneId ? Number(formData.zoneId) : null,
                stateId: formData.stateId ? Number(formData.stateId) : null,
                districtId: formData.districtId ? Number(formData.districtId) : null,
                orgId: formData.orgId ? Number(formData.orgId) : null,
                universityId: formData.universityId ? Number(formData.universityId) : null,
                kvkId: formData.kvkId ? Number(formData.kvkId) : null,
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
                    onChange={e => handleChange('phoneNumber', cleanIndianMobileInput(e.target.value))}
                    placeholder="10-digit mobile (6–9…)"
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
                        if (errors.roleId) setErrors(prev => ({ ...prev, roleId: undefined }))
                        setSubmitError(null)
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

                {/* Inherited scope info — shown whenever the role doesn't need a direct pick */}
                {selectedRole && !hierarchyPicker.showPicker && (
                    <p className="text-sm text-[#757575]">
                        {isKvkAdminCreating
                            ? <>New user will be assigned to your own <strong className="text-[#212121]">KVK</strong>.</>
                            : <>New user will inherit your own <strong className="text-[#212121]">{hierarchyPicker.entityLabel}</strong> (and everything above it).</>}
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
