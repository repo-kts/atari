import React, { useState, useEffect } from 'react'
import { userApi, CreateUserData, PermissionAction, RoleInfo, getRoleLabel } from '../../services/userApi'
import { masterDataApi } from '../../services/masterDataApi'
import { aboutKvkApi } from '../../services/aboutKvkApi'
import { useAuth } from '../../contexts/AuthContext'
import { getRoleLevel } from '../../constants/roleHierarchy'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'
import { LoadingButton } from '../common/LoadingButton'
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import type { Zone, State, District, Organization } from '../../types/masterData'
import type { Kvk } from '../../types/aboutKvk'

const PERMISSION_ACTIONS: { value: PermissionAction; label: string }[] = [
    { value: 'VIEW', label: 'View' },
    { value: 'ADD', label: 'Add' },
    { value: 'EDIT', label: 'Edit' },
    { value: 'DELETE', label: 'Delete' },
]

/** Non-admin roles that require custom permissions */
const NON_ADMIN_ROLES = ['state_user', 'district_user', 'org_user', 'kvk']

/** Non-admin roles each creator can assign (admins cannot create other admins). Run seed to ensure state_user, district_user, org_user exist (IDs 7,8,9). */
const ALLOWED_NON_ADMIN_ROLES_FOR_CREATOR: Record<string, string[]> = {
    zone_admin: ['state_user', 'district_user', 'org_user', 'kvk'],
    state_admin: ['state_user', 'district_user', 'org_user', 'kvk'],
    district_admin: ['district_user', 'org_user', 'kvk'],
    org_admin: ['org_user', 'kvk'],
    kvk: ['kvk'],
}

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
    const [allRoles, setAllRoles] = useState<RoleInfo[]>([])

    // Dropdown data
    const [zones, setZones] = useState<Zone[]>([])
    const [states, setStates] = useState<State[]>([])
    const [districts, setDistricts] = useState<District[]>([])
    const [organizations, setOrganizations] = useState<Organization[]>([])
    const [kvks, setKvks] = useState<Kvk[]>([])
    const [loadingDropdowns, setLoadingDropdowns] = useState(false)
    const [dropdownError, setDropdownError] = useState<string | null>(null)

    // Allowed non-admin roles for current creator (when not Super Admin)
    const allowedRoleNames = (currentUser?.role && ALLOWED_NON_ADMIN_ROLES_FOR_CREATOR[currentUser.role]) || []
    const allowedRolesForDropdown = allRoles.filter(r => allowedRoleNames.includes(r.roleName))

    // Effective role from selection (both Super Admin and other admins choose or have a role)
    const selectedRole = formData.roleId
        ? allRoles.find(r => r.roleId === formData.roleId)?.roleName ?? null
        : null

    // Check if current user is a sub-admin (not super_admin)
    const isSubAdmin = currentUser?.role !== 'super_admin'
    const creatorLevel = getRoleLevel(currentUser?.role || '')

    // Sub-admin hierarchy dropdowns: only show dropdowns for levels STRICTLY BELOW the creator's own level
    // Hierarchy levels: zone=1, state=2, district=3, org=4
    // e.g. district_admin (level 3) should NOT see State (level 2) or District (level 3) dropdowns - those are inherited
    const needsStateLevel = ['state_user', 'district_user', 'org_user', 'kvk']
    const needsDistrictLevel = ['district_user', 'kvk']
    const needsOrgLevel = ['org_user', 'kvk']

    const showStateForSubAdmin = isSubAdmin && creatorLevel < 2 && needsStateLevel.includes(selectedRole || '')
    const showDistrictForSubAdmin = isSubAdmin && creatorLevel < 3 && needsDistrictLevel.includes(selectedRole || '')
    const showOrgForSubAdmin = isSubAdmin && creatorLevel < 4 && needsOrgLevel.includes(selectedRole || '')

    // For sub-admin filtering: use either creator's stateId or form-selected stateId
    const effectiveStateId = currentUser?.stateId || (formData.stateId ? Number(formData.stateId) : null)

    // Show permissions section for:
    // 1. Sub-admins (always, they can only create non-admin users)
    // 2. Super Admin when creating non-admin users (state_user, district_user, org_user, kvk)
    const showPermissionsSection =
        isSubAdmin ||
        (selectedRole !== null && NON_ADMIN_ROLES.includes(selectedRole))

    // Fetch roles from API (required for dropdown; without roles, create cannot proceed)
    useEffect(() => {
        userApi.getRoles()
            .then(setAllRoles)
            .catch(err => {
                console.error('Failed to fetch roles:', err)
                setDropdownError('Failed to load roles. You may need VIEW permission on User Management. Run: npm run seed:global-permissions')
            })
    }, [])

    // Fetch master data when modal opens
    useEffect(() => {
        if (!isOpen) return
        setDropdownError(null)

        if (!isSubAdmin) {
            // Super Admin: fetch all master data
            setLoadingDropdowns(true)
            const errors: string[] = []
            Promise.all([
                masterDataApi.getZones().then(res => setZones(res.data)).catch(err => {
                    console.error('Failed to fetch zones:', err)
                    errors.push('zones')
                }),
                masterDataApi.getStates().then(res => setStates(res.data)).catch(err => {
                    console.error('Failed to fetch states:', err)
                    errors.push('states')
                }),
                masterDataApi.getDistricts().then(res => setDistricts(res.data)).catch(err => {
                    console.error('Failed to fetch districts:', err)
                    errors.push('districts')
                }),
                masterDataApi.getOrganizations().then(res => setOrganizations(res.data)).catch(err => {
                    console.error('Failed to fetch organizations:', err)
                    errors.push('organizations')
                }),
            ]).finally(() => {
                setLoadingDropdowns(false)
                if (errors.length > 0) {
                    setDropdownError(`Failed to load ${errors.join(', ')}. Please close and reopen the form to retry.`)
                }
            })
        } else {
            // Sub-admin: fetch data for levels below their own (level-based)
            const promises: Promise<void>[] = []
            const errors: string[] = []

            if (creatorLevel < 2 && currentUser?.zoneId) {
                // zone_admin (level 1): fetch states in their zone
                promises.push(
                    masterDataApi.getStatesByZone(currentUser.zoneId).then(res => setStates(res.data)).catch(err => {
                        console.error('Failed to fetch states by zone:', err)
                        errors.push('states')
                    })
                )
            }
            if (creatorLevel >= 2 && creatorLevel < 3 && currentUser?.stateId) {
                // state_admin (level 2): fetch districts in their state
                promises.push(
                    masterDataApi.getDistrictsByState(currentUser.stateId).then(res => setDistricts(res.data)).catch(err => {
                        console.error('Failed to fetch districts by state:', err)
                        errors.push('districts')
                    })
                )
            }
            if (creatorLevel < 4 && currentUser?.districtId) {
                // district_admin: fetch orgs in their district
                promises.push(
                    masterDataApi.getOrganizationsByDistrict(currentUser.districtId).then(res => setOrganizations(res.data)).catch(err => {
                        console.error('Failed to fetch organizations by district:', err)
                        errors.push('organizations')
                    })
                )
            } else if (creatorLevel < 4 && currentUser?.stateId) {
                // state_admin: fetch all orgs (will be filtered by state via district)
                promises.push(
                    masterDataApi.getOrganizations().then(res => {
                        // Filter organizations by state through their district
                        const filtered = res.data.filter(org => org.district?.state?.stateId === currentUser?.stateId)
                        setOrganizations(filtered)
                    }).catch(err => {
                        console.error('Failed to fetch organizations:', err)
                        errors.push('organizations')
                    })
                )
            }

            if (promises.length > 0) {
                setLoadingDropdowns(true)
                Promise.all(promises).finally(() => {
                    setLoadingDropdowns(false)
                    if (errors.length > 0) {
                        setDropdownError(`Failed to load ${errors.join(', ')}. Please close and reopen the form to retry.`)
                    }
                })
            }
        }
    }, [isOpen, isSubAdmin, creatorLevel, currentUser?.zoneId, currentUser?.stateId])

    // Sub-admin cascade: when zone_admin selects a state, fetch districts and orgs for that state
    useEffect(() => {
        if (!isOpen || !isSubAdmin || !showStateForSubAdmin || !formData.stateId) return

        const stateId = Number(formData.stateId)
        const errors: string[] = []
        setDropdownError(null)
        Promise.all([
            masterDataApi.getDistrictsByState(stateId).then(res => setDistricts(res.data)).catch(err => {
                console.error('Failed to fetch districts by state:', err)
                errors.push('districts')
            }),
            masterDataApi.getOrganizations().then(res => {
                // Filter organizations by state through their district
                const filtered = res.data.filter(org => org.district?.state?.stateId === stateId)
                setOrganizations(filtered)
            }).catch(err => {
                console.error('Failed to fetch organizations:', err)
                errors.push('organizations')
            }),
        ]).then(() => {
            if (errors.length > 0) {
                setDropdownError(`Failed to load ${errors.join(', ')}. Please close and reopen the form to retry.`)
            }
        })
    }, [isOpen, isSubAdmin, showStateForSubAdmin, formData.stateId])

    // Fetch KVKs when needed (for both super admin and sub-admins creating KVK users)
    useEffect(() => {
        if (!isOpen || selectedRole !== 'kvk') return
        // Super admin: wait until org is selected before fetching KVKs
        if (!isSubAdmin && !formData.orgId) return

        const params: any = {}

        if (isSubAdmin) {
            // Sub-admin: use creator's fields for levels at/above, form selections for levels below
            const stateId = showStateForSubAdmin ? formData.stateId : currentUser?.stateId
            const districtId = showDistrictForSubAdmin ? formData.districtId : currentUser?.districtId
            const orgId = showOrgForSubAdmin ? formData.orgId : currentUser?.orgId
            if (stateId) params.stateId = Number(stateId)
            if (districtId) params.districtId = Number(districtId)
            if (orgId) params.orgId = Number(orgId)
        } else {
            // Super admin: use form selections
            if (formData.stateId) params.stateId = formData.stateId
            if (formData.districtId) params.districtId = formData.districtId
            if (formData.orgId) params.orgId = formData.orgId
        }

        aboutKvkApi.getKvks(params).then(res => {
            setKvks(res.data || [])
        }).catch(err => {
            console.error('Failed to fetch KVKs:', err)
            setKvks([])
            setDropdownError('Failed to load KVKs. Please close and reopen the form to retry.')
        })
    }, [isOpen, selectedRole, isSubAdmin, currentUser, formData.stateId, formData.districtId, formData.orgId, showStateForSubAdmin, showDistrictForSubAdmin, showOrgForSubAdmin])

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            const defaultRoleId = showPermissionsSection && allowedRolesForDropdown.length
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
            setDropdownError(null)
        }
    }, [isOpen, showPermissionsSection, allowedRolesForDropdown.length])

    // When non–super-admin opens modal, default role to first allowed option
    useEffect(() => {
        if (isOpen && showPermissionsSection && allowedRolesForDropdown.length > 0 && !formData.roleId) {
            setFormData(prev => ({ ...prev, roleId: allowedRolesForDropdown[0].roleId }))
        }
    }, [isOpen, showPermissionsSection, allowedRolesForDropdown.length])

    // Determine which hierarchy fields are required (full cascade: each level needs all parents)
    const zoneRequired = selectedRole === 'zone_admin' ||
        selectedRole === 'state_admin' || selectedRole === 'state_user' ||
        selectedRole === 'district_admin' || selectedRole === 'district_user' ||
        selectedRole === 'org_admin' || selectedRole === 'org_user' || selectedRole === 'kvk'
    const stateRequired = selectedRole === 'state_admin' || selectedRole === 'state_user' ||
        selectedRole === 'district_admin' || selectedRole === 'district_user' ||
        selectedRole === 'org_admin' || selectedRole === 'org_user' || selectedRole === 'kvk'
    const districtRequired = selectedRole === 'district_admin' || selectedRole === 'district_user' || selectedRole === 'kvk'
    const orgRequired = selectedRole === 'org_admin' || selectedRole === 'org_user' || selectedRole === 'kvk'
    const kvkRequired = selectedRole === 'kvk'

    // Show hierarchy fields that are required — ensures every required field has a visible dropdown
    const showZoneField = zoneRequired
    const showStateField = stateRequired
    const showDistrictField = districtRequired
    const showOrgField = orgRequired

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
            newErrors.permissions = 'Select at least one permission (View, Add, Edit, or Delete)'
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
                universityId: !showPermissionsSection && selectedRole === 'kvk' ? (formData.universityId ? (formData.universityId as number) : null) : null,
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

                {/* Dropdown Data Error */}
                {dropdownError && (
                    <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{dropdownError}</span>
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
                <div>
                    <label className="block text-sm font-medium text-[#487749] mb-2">
                        Role <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formData.roleId}
                        onChange={e => {
                            const roleId = e.target.value ? parseInt(e.target.value) : ''
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
                        className={`w-full h-12 px-4 py-3 border rounded-xl bg-[#FAF9F6] text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all ${
                            errors.roleId
                                ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                                : 'border-[#E0E0E0] hover:border-[#BDBDBD]'
                        } ${isSubmitting || submitSuccess ? 'opacity-50 cursor-not-allowed' : ''}`}
                        required
                        disabled={isSubmitting || submitSuccess}
                    >
                        <option value="">Select a role</option>
                        {(isSubAdmin ? allowedRolesForDropdown : allRoles).map(role => (
                            <option key={role.roleId} value={role.roleId}>
                                {getRoleLabel(role.roleName)}
                            </option>
                        ))}
                    </select>
                    {isSubAdmin && (
                        <p className="mt-1.5 text-xs text-[#757575]">
                            You can only create non-admin users (with custom permissions below).
                        </p>
                    )}
                    {errors.roleId && (
                        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                            {errors.roleId}
                        </p>
                    )}
                </div>

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
                            {PERMISSION_ACTIONS.map(({ value, label }) => (
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
                {isSubAdmin && !showStateForSubAdmin && !showDistrictForSubAdmin && !showOrgForSubAdmin && selectedRole !== 'kvk' && (
                    <p className="text-sm text-[#757575]">
                        New user will inherit your <strong className="text-[#212121]">Zone, State, District &amp; Organization</strong>.
                    </p>
                )}

                {/* Sub-admin: State dropdown (e.g., zone_admin creating state_user) */}
                {showStateForSubAdmin && (
                    <div>
                        <label className="block text-sm font-medium text-[#487749] mb-2">
                            State {stateRequired && <span className="text-red-500">*</span>}
                        </label>
                        <select
                            value={formData.stateId}
                            onChange={e => {
                                const stateId = e.target.value ? parseInt(e.target.value) : ''
                                handleChange('stateId', stateId)
                                setFormData(prev => ({
                                    ...prev,
                                    stateId: stateId as number | '',
                                    districtId: '',
                                    orgId: '',
                                    kvkId: '',
                                }))
                            }}
                            className={`w-full h-12 px-4 py-3 border rounded-xl bg-[#FAF9F6] text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all ${
                                errors.stateId ? 'border-red-300' : 'border-[#E0E0E0] hover:border-[#BDBDBD]'
                            } ${isSubmitting || submitSuccess || loadingDropdowns ? 'opacity-50 cursor-not-allowed' : ''}`}
                            required={stateRequired}
                            disabled={isSubmitting || submitSuccess || loadingDropdowns}
                        >
                            <option value="">Select a state</option>
                            {states.map(state => (
                                <option key={state.stateId} value={state.stateId}>
                                    {state.stateName}
                                </option>
                            ))}
                        </select>
                        {errors.stateId && <p className="mt-1.5 text-sm text-red-600">{errors.stateId}</p>}
                    </div>
                )}

                {/* Sub-admin: District dropdown */}
                {showDistrictForSubAdmin && (
                    <div>
                        <label className="block text-sm font-medium text-[#487749] mb-2">
                            District {districtRequired && <span className="text-red-500">*</span>}
                        </label>
                        <select
                            value={formData.districtId}
                            onChange={e => {
                                const districtId = e.target.value ? parseInt(e.target.value) : ''
                                handleChange('districtId', districtId)
                                setFormData(prev => ({
                                    ...prev,
                                    districtId: districtId as number | '',
                                    kvkId: '',
                                }))
                            }}
                            className={`w-full h-12 px-4 py-3 border rounded-xl bg-[#FAF9F6] text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all ${
                                errors.districtId ? 'border-red-300' : 'border-[#E0E0E0] hover:border-[#BDBDBD]'
                            } ${isSubmitting || submitSuccess || loadingDropdowns ? 'opacity-50 cursor-not-allowed' : ''}`}
                            required={districtRequired}
                            disabled={isSubmitting || submitSuccess || loadingDropdowns || (showStateForSubAdmin && !formData.stateId)}
                        >
                            <option value="">
                                {showStateForSubAdmin && !formData.stateId ? 'Select a state first' : 'Select a district'}
                            </option>
                            {(showStateForSubAdmin && formData.stateId
                                ? districts.filter(d => d.stateId === Number(formData.stateId))
                                : districts
                            ).map(district => (
                                <option key={district.districtId} value={district.districtId}>
                                    {district.districtName}
                                </option>
                            ))}
                        </select>
                        {errors.districtId && <p className="mt-1.5 text-sm text-red-600">{errors.districtId}</p>}
                    </div>
                )}

                {/* Sub-admin: Organization dropdown */}
                {showOrgForSubAdmin && (
                    <div>
                        <label className="block text-sm font-medium text-[#487749] mb-2">
                            Organization {orgRequired && <span className="text-red-500">*</span>}
                        </label>
                        <select
                            value={formData.orgId}
                            onChange={e => {
                                const orgId = e.target.value ? parseInt(e.target.value) : ''
                                handleChange('orgId', orgId)
                                // Reset dependent fields
                                setFormData(prev => ({
                                    ...prev,
                                    orgId: orgId as number | '',
                                    kvkId: '',
                                }))
                                setKvks([])
                            }}
                            className={`w-full h-12 px-4 py-3 border rounded-xl bg-[#FAF9F6] text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all ${
                                errors.orgId ? 'border-red-300' : 'border-[#E0E0E0] hover:border-[#BDBDBD]'
                            } ${isSubmitting || submitSuccess || loadingDropdowns ? 'opacity-50 cursor-not-allowed' : ''}`}
                            required={orgRequired}
                            disabled={isSubmitting || submitSuccess || loadingDropdowns || (showStateForSubAdmin && !formData.stateId)}
                        >
                            <option value="">
                                {showStateForSubAdmin && !formData.stateId ? 'Select a state first' : 'Select an organization'}
                            </option>
                            {(effectiveStateId
                                ? organizations.filter(o => o.district?.state?.stateId === effectiveStateId)
                                : organizations
                            ).map(org => (
                                <option key={org.orgId} value={org.orgId}>
                                    {org.orgName}
                                </option>
                            ))}
                        </select>
                        {errors.orgId && <p className="mt-1.5 text-sm text-red-600">{errors.orgId}</p>}
                    </div>
                )}

                {/* Super Admin hierarchy dropdowns */}
                {!isSubAdmin && showZoneField && (showStateField || showDistrictField || showOrgField) && (
                    <p className="text-xs text-[#757575]">
                        Select <strong>Zone → State → District → Organization → KVK</strong> in order. Higher-level selections filter the options below.
                    </p>
                )}

                {/* Super Admin: Zone → State → District cascade - select in order */}
                {!isSubAdmin && showZoneField && (
                    <div>
                        <label className="block text-sm font-medium text-[#487749] mb-2">
                            Zone {zoneRequired && <span className="text-red-500">*</span>}
                        </label>
                        <select
                            value={formData.zoneId}
                            onChange={e => {
                                const zoneId = e.target.value ? parseInt(e.target.value) : ''
                                handleChange('zoneId', zoneId)
                                // Reset dependent fields
                                setFormData(prev => ({
                                    ...prev,
                                    zoneId: zoneId as number | '',
                                    stateId: '',
                                    districtId: '',
                                    orgId: '',
                                    kvkId: '',
                                }))
                                setKvks([])
                            }}
                            className={`w-full h-12 px-4 py-3 border rounded-xl bg-[#FAF9F6] text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all ${
                                errors.zoneId
                                    ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                                    : 'border-[#E0E0E0] hover:border-[#BDBDBD]'
                            } ${isSubmitting || submitSuccess || loadingDropdowns ? 'opacity-50 cursor-not-allowed' : ''}`}
                            required={zoneRequired}
                            disabled={isSubmitting || submitSuccess || loadingDropdowns}
                        >
                            <option value="">Select a zone</option>
                            {zones.map(zone => (
                                <option key={zone.zoneId} value={zone.zoneId}>
                                    {zone.zoneName}
                                </option>
                            ))}
                        </select>
                        {errors.zoneId && (
                            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                {errors.zoneId}
                            </p>
                        )}
                    </div>
                )}

                {!isSubAdmin && showStateField && (
                    <div>
                        <label className="block text-sm font-medium text-[#487749] mb-2">
                            State {stateRequired && <span className="text-red-500">*</span>}
                        </label>
                        <select
                            value={formData.stateId}
                            onChange={e => {
                                const stateId = e.target.value ? parseInt(e.target.value) : ''
                                handleChange('stateId', stateId)
                                // Reset dependent fields
                                setFormData(prev => ({
                                    ...prev,
                                    stateId: stateId as number | '',
                                    districtId: '',
                                    orgId: '',
                                    kvkId: '',
                                }))
                                setKvks([])
                            }}
                            className={`w-full h-12 px-4 py-3 border rounded-xl bg-[#FAF9F6] text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all ${
                                errors.stateId
                                    ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                                    : 'border-[#E0E0E0] hover:border-[#BDBDBD]'
                            } ${isSubmitting || submitSuccess || loadingDropdowns ? 'opacity-50 cursor-not-allowed' : ''}`}
                            required={stateRequired}
                            disabled={isSubmitting || submitSuccess || loadingDropdowns || (showZoneField && !formData.zoneId)}
                        >
                            <option value="">
                                {showZoneField && !formData.zoneId ? 'Select a zone first' : 'Select a state'}
                            </option>
                            {(showZoneField && formData.zoneId
                                ? states.filter(s => s.zoneId === formData.zoneId)
                                : states
                            ).map(state => (
                                <option key={state.stateId} value={state.stateId}>
                                    {state.stateName}
                                </option>
                            ))}
                        </select>
                        {errors.stateId && (
                            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                {errors.stateId}
                            </p>
                        )}
                    </div>
                )}

                {!isSubAdmin && showDistrictField && (
                    <div>
                        <label className="block text-sm font-medium text-[#487749] mb-2">
                            District {districtRequired && <span className="text-red-500">*</span>}
                        </label>
                        <select
                            value={formData.districtId}
                            onChange={e => {
                                const districtId = e.target.value ? parseInt(e.target.value) : ''
                                handleChange('districtId', districtId)
                                // Reset dependent fields
                                setFormData(prev => ({
                                    ...prev,
                                    districtId: districtId as number | '',
                                    kvkId: '',
                                }))
                                setKvks([])
                            }}
                            className={`w-full h-12 px-4 py-3 border rounded-xl bg-[#FAF9F6] text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all ${
                                errors.districtId
                                    ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                                    : 'border-[#E0E0E0] hover:border-[#BDBDBD]'
                            } ${isSubmitting || submitSuccess || loadingDropdowns ? 'opacity-50 cursor-not-allowed' : ''}`}
                            required={districtRequired}
                            disabled={isSubmitting || submitSuccess || loadingDropdowns || (showStateField && !formData.stateId)}
                        >
                            <option value="">
                                {showStateField && !formData.stateId ? 'Select a state first' : 'Select a district'}
                            </option>
                            {(showStateField && formData.stateId
                                ? districts.filter(d => d.stateId === formData.stateId)
                                : districts
                            ).map(district => (
                                <option key={district.districtId} value={district.districtId}>
                                    {district.districtName}
                                </option>
                            ))}
                        </select>
                        {errors.districtId && (
                            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                {errors.districtId}
                            </p>
                        )}
                    </div>
                )}

                {!isSubAdmin && showOrgField && (
                    <div>
                        <label className="block text-sm font-medium text-[#487749] mb-2">
                            Organization {orgRequired && <span className="text-red-500">*</span>}
                        </label>
                        <select
                            value={formData.orgId}
                            onChange={e => {
                                const orgId = e.target.value ? parseInt(e.target.value) : ''
                                handleChange('orgId', orgId)
                                // Reset dependent fields
                                setFormData(prev => ({
                                    ...prev,
                                    orgId: orgId as number | '',
                                    kvkId: '',
                                }))
                                setKvks([])
                            }}
                            className={`w-full h-12 px-4 py-3 border rounded-xl bg-[#FAF9F6] text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all ${
                                errors.orgId
                                    ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                                    : 'border-[#E0E0E0] hover:border-[#BDBDBD]'
                            } ${isSubmitting || submitSuccess || loadingDropdowns ? 'opacity-50 cursor-not-allowed' : ''}`}
                            required={orgRequired}
                            disabled={isSubmitting || submitSuccess || loadingDropdowns || (showStateField && !formData.stateId)}
                        >
                            <option value="">
                                {showStateField && !formData.stateId ? 'Select a state first' : 'Select an organization'}
                            </option>
                            {(showStateField && formData.stateId
                                ? organizations.filter(o => o.district?.state?.stateId === formData.stateId)
                                : organizations
                            ).map(org => (
                                <option key={org.orgId} value={org.orgId}>
                                    {org.orgName}
                                </option>
                            ))}
                        </select>
                        {errors.orgId && (
                            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                {errors.orgId}
                            </p>
                        )}
                    </div>
                )}

                {selectedRole === 'kvk' && (
                    <div>
                        <label className="block text-sm font-medium text-[#487749] mb-2">
                            KVK {kvkRequired && <span className="text-red-500">*</span>}
                        </label>
                        <select
                            value={formData.kvkId}
                            onChange={e => {
                                const kvkId = e.target.value ? parseInt(e.target.value) : ''
                                handleChange('kvkId', kvkId)
                            }}
                            className={`w-full h-12 px-4 py-3 border rounded-xl bg-[#FAF9F6] text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all ${
                                errors.kvkId
                                    ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                                    : 'border-[#E0E0E0] hover:border-[#BDBDBD]'
                            } ${isSubmitting || submitSuccess ? 'opacity-50 cursor-not-allowed' : ''}`}
                            required={kvkRequired}
                            disabled={isSubmitting || submitSuccess || (!isSubAdmin && !formData.orgId)}
                        >
                            <option value="">
                                {!isSubAdmin && !formData.orgId ? 'Select zone, state, district and organization first' : 'Select a KVK'}
                            </option>
                            {kvks.map(kvk => (
                                <option key={kvk.kvkId} value={kvk.kvkId}>
                                    {kvk.kvkName}
                                </option>
                            ))}
                        </select>
                        {kvks.length === 0 && selectedRole === 'kvk' && (
                            <p className="mt-1.5 text-xs text-[#757575]">
                                {isSubAdmin
                                    ? 'No KVKs available for your location'
                                    : 'No KVKs found. Please select Zone, State, District and Organization first.'}
                            </p>
                        )}
                        {errors.kvkId && (
                            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                {errors.kvkId}
                            </p>
                        )}
                    </div>
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
