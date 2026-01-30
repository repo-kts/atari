import React, { useState, useEffect } from 'react'
import { userApi, CreateUserData } from '../../services/userApi'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'

/**
 * Role mapping
 */
const ROLE_MAP: Record<string, { id: number; name: string; label: string }> = {
    super_admin: { id: 1, name: 'super_admin', label: 'Super Admin' },
    zone_admin: { id: 2, name: 'zone_admin', label: 'Zone Admin' },
    state_admin: { id: 3, name: 'state_admin', label: 'State Admin' },
    district_admin: { id: 4, name: 'district_admin', label: 'District Admin' },
    org_admin: { id: 5, name: 'org_admin', label: 'Org Admin' },
    kvk: { id: 6, name: 'kvk', label: 'KVK' },
}

interface CreateUserModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
}

interface FormData {
    name: string
    email: string
    password: string
    confirmPassword: string
    roleId: number | ''
    zoneId: number | ''
    stateId: number | ''
    districtId: number | ''
    orgId: number | ''
    kvkId: number | ''
}

interface FormErrors {
    name?: string
    email?: string
    password?: string
    confirmPassword?: string
    roleId?: string
    zoneId?: string
    stateId?: string
    districtId?: string
    orgId?: string
    kvkId?: string
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        roleId: '',
        zoneId: '',
        stateId: '',
        districtId: '',
        orgId: '',
        kvkId: '',
    })

    const [errors, setErrors] = useState<FormErrors>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [submitSuccess, setSubmitSuccess] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            // Reset form when closing
            setFormData({
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
                roleId: '',
                zoneId: '',
                stateId: '',
                districtId: '',
                orgId: '',
                kvkId: '',
            })
            setErrors({})
            setSubmitError(null)
            setSubmitSuccess(false)
            setShowPassword(false)
        }
    }, [isOpen])

    // Get selected role name
    const selectedRole = formData.roleId
        ? Object.values(ROLE_MAP).find(r => r.id === formData.roleId)?.name
        : null

    // Determine which hierarchy fields to show based on role
    const showZoneField = selectedRole === 'super_admin' || selectedRole === 'zone_admin'
    const showStateField = selectedRole === 'super_admin' || selectedRole === 'state_admin'
    const showDistrictField = selectedRole === 'super_admin' || selectedRole === 'district_admin'
    const showOrgField = selectedRole === 'super_admin' || selectedRole === 'org_admin'
    const showKvkField = selectedRole === 'super_admin' || selectedRole === 'kvk'

    // Determine which hierarchy fields are required
    const zoneRequired = selectedRole === 'zone_admin'
    const stateRequired = selectedRole === 'state_admin'
    const districtRequired = selectedRole === 'district_admin'
    const orgRequired = selectedRole === 'org_admin'
    const kvkRequired = selectedRole === 'kvk'

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

        // Hierarchy validation based on role
        if (zoneRequired && !formData.zoneId) {
            newErrors.zoneId = 'Zone is required for Zone Admin'
        }
        if (stateRequired && !formData.stateId) {
            newErrors.stateId = 'State is required for State Admin'
        }
        if (districtRequired && !formData.districtId) {
            newErrors.districtId = 'District is required for District Admin'
        }
        if (orgRequired && !formData.orgId) {
            newErrors.orgId = 'Organization is required for Org Admin'
        }
        if (kvkRequired && !formData.kvkId) {
            newErrors.kvkId = 'KVK is required for KVK user'
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
            const userData: CreateUserData = {
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
                roleId: formData.roleId as number,
                zoneId: formData.zoneId ? (formData.zoneId as number) : null,
                stateId: formData.stateId ? (formData.stateId as number) : null,
                districtId: formData.districtId ? (formData.districtId as number) : null,
                orgId: formData.orgId ? (formData.orgId as number) : null,
                kvkId: formData.kvkId ? (formData.kvkId as number) : null,
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

                {/* Role */}
                <div>
                    <label className="block text-sm font-medium text-[#487749] mb-2">
                        Role <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formData.roleId}
                        onChange={e => {
                            const roleId = e.target.value ? parseInt(e.target.value) : ''
                            handleChange('roleId', roleId)
                            // Clear hierarchy fields when role changes
                            setFormData(prev => ({
                                ...prev,
                                roleId: roleId as number | '',
                                zoneId: '',
                                stateId: '',
                                districtId: '',
                                orgId: '',
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
                        {Object.values(ROLE_MAP).map(role => (
                            <option key={role.id} value={role.id}>
                                {role.label}
                            </option>
                        ))}
                    </select>
                    {errors.roleId && (
                        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                            {errors.roleId}
                        </p>
                    )}
                </div>

                {/* Hierarchy Fields - Shown based on role */}
                {showZoneField && (
                    <Input
                        label={`Zone ID${zoneRequired ? ' *' : ''}`}
                        type="number"
                        value={formData.zoneId}
                        onChange={e =>
                            handleChange('zoneId', e.target.value ? parseInt(e.target.value) : '')
                        }
                        placeholder="Enter zone ID"
                        required={zoneRequired}
                        error={errors.zoneId}
                        disabled={isSubmitting || submitSuccess}
                    />
                )}

                {showStateField && (
                    <Input
                        label={`State ID${stateRequired ? ' *' : ''}`}
                        type="number"
                        value={formData.stateId}
                        onChange={e =>
                            handleChange('stateId', e.target.value ? parseInt(e.target.value) : '')
                        }
                        placeholder="Enter state ID"
                        required={stateRequired}
                        error={errors.stateId}
                        disabled={isSubmitting || submitSuccess}
                    />
                )}

                {showDistrictField && (
                    <Input
                        label={`District ID${districtRequired ? ' *' : ''}`}
                        type="number"
                        value={formData.districtId}
                        onChange={e =>
                            handleChange(
                                'districtId',
                                e.target.value ? parseInt(e.target.value) : ''
                            )
                        }
                        placeholder="Enter district ID"
                        required={districtRequired}
                        error={errors.districtId}
                        disabled={isSubmitting || submitSuccess}
                    />
                )}

                {showOrgField && (
                    <Input
                        label={`Organization ID${orgRequired ? ' *' : ''}`}
                        type="number"
                        value={formData.orgId}
                        onChange={e =>
                            handleChange('orgId', e.target.value ? parseInt(e.target.value) : '')
                        }
                        placeholder="Enter organization ID"
                        required={orgRequired}
                        error={errors.orgId}
                        disabled={isSubmitting || submitSuccess}
                    />
                )}

                {showKvkField && (
                    <Input
                        label={`KVK ID${kvkRequired ? ' *' : ''}`}
                        type="number"
                        value={formData.kvkId}
                        onChange={e =>
                            handleChange('kvkId', e.target.value ? parseInt(e.target.value) : '')
                        }
                        placeholder="Enter KVK ID"
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
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={isSubmitting || submitSuccess}
                    >
                        {isSubmitting ? 'Creating...' : submitSuccess ? 'Created!' : 'Create User'}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
