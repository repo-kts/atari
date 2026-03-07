import React, { useState, useEffect } from 'react'
import { userApi, UpdateUserData, PermissionAction, getRoleLabel } from '../../services/userApi'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'
import { LoadingButton } from '../common/LoadingButton'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

const PERMISSION_ACTIONS: { value: PermissionAction; label: string }[] = [
    { value: 'VIEW', label: 'View' },
    { value: 'ADD', label: 'Add' },
    { value: 'EDIT', label: 'Edit' },
    { value: 'DELETE', label: 'Delete' },
]

/** Roles that get the ADD permission option */
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
    permissions?: PermissionAction[]
}

interface EditUserModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
    user: EditUser | null
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    user,
}) => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [permissions, setPermissions] = useState<PermissionAction[]>([])

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [submitSuccess, setSubmitSuccess] = useState(false)

    const isUserRole = user ? NON_ADMIN_ROLES.includes(user.roleName) : false

    // Populate form when modal opens or user changes
    useEffect(() => {
        if (isOpen && user) {
            setName(user.name || '')
            setEmail(user.email || '')
            setPhoneNumber(user.phoneNumber || '')
            setPermissions(user.permissions || [])
            setErrors({})
            setSubmitError(null)
            setSubmitSuccess(false)
        }
    }, [isOpen, user])

    // Reset on close
    useEffect(() => {
        if (!isOpen) {
            setErrors({})
            setSubmitError(null)
            setSubmitSuccess(false)
        }
    }, [isOpen])

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!name.trim()) {
            newErrors.name = 'Name is required'
        } else if (name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters'
        }

        if (!email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Invalid email format'
        }

        if (phoneNumber.trim()) {
            const cleaned = phoneNumber.replace(/[\s\-()]/g, '')
            if (!/^[6-9]\d{9}$/.test(cleaned)) {
                newErrors.phoneNumber = 'Invalid phone number (10 digits starting with 6-9)'
            }
        }

        if (isUserRole && permissions.length === 0) {
            newErrors.permissions = 'Select at least one permission'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitError(null)
        setSubmitSuccess(false)

        if (!validateForm() || !user) return

        setIsSubmitting(true)

        try {
            const updateData: UpdateUserData = {}

            if (name.trim() !== user.name) updateData.name = name.trim()
            if (email.trim().toLowerCase() !== user.email) updateData.email = email.trim().toLowerCase()

            const cleanedPhone = phoneNumber.trim() || null
            if (cleanedPhone !== (user.phoneNumber || null)) updateData.phoneNumber = cleanedPhone

            if (isUserRole) {
                updateData.permissions = permissions
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
                {submitSuccess && (
                    <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>User updated successfully!</span>
                    </div>
                )}

                {submitError && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{submitError}</span>
                    </div>
                )}

                {/* Role (read-only) */}
                <div>
                    <label className="block text-sm font-medium text-[#487749] mb-1.5">Role</label>
                    <div className="px-4 py-2.5 border border-[#E0E0E0] rounded-xl bg-[#F5F5F5] text-[#757575] text-sm">
                        {getRoleLabel(user.roleName)}
                    </div>
                </div>

                {/* Name */}
                <Input
                    label="Full Name"
                    type="text"
                    value={name}
                    onChange={e => {
                        setName(e.target.value)
                        if (errors.name) setErrors(prev => ({ ...prev, name: '' }))
                        setSubmitError(null)
                    }}
                    placeholder="Enter full name"
                    required
                    error={errors.name}
                    disabled={isSubmitting || submitSuccess}
                />

                {/* Email */}
                <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={e => {
                        setEmail(e.target.value)
                        if (errors.email) setErrors(prev => ({ ...prev, email: '' }))
                        setSubmitError(null)
                    }}
                    placeholder="user@example.com"
                    required
                    error={errors.email}
                    disabled={isSubmitting || submitSuccess}
                />

                {/* Phone Number */}
                <Input
                    label="Phone Number (Optional)"
                    type="tel"
                    value={phoneNumber}
                    onChange={e => {
                        setPhoneNumber(e.target.value)
                        if (errors.phoneNumber) setErrors(prev => ({ ...prev, phoneNumber: '' }))
                        setSubmitError(null)
                    }}
                    placeholder="9876543210"
                    error={errors.phoneNumber}
                    disabled={isSubmitting || submitSuccess}
                />

                {/* Permissions (only for _user roles) */}
                {isUserRole && (
                    <div>
                        <p className="block text-sm font-medium text-[#487749] mb-2">
                            Permissions <span className="text-red-500">*</span>
                        </p>
                        <p className="text-xs text-[#757575] mb-3">
                            Select the actions this user is allowed to perform.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            {(NON_ADMIN_ROLES_WITH_ADD.includes(user.roleName) ? PERMISSION_ACTIONS : PERMISSION_ACTIONS.filter(a => a.value !== 'ADD')).map(({ value, label }) => (
                                <label
                                    key={value}
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes(value)}
                                        onChange={e => {
                                            const checked = e.target.checked
                                            setPermissions(prev =>
                                                checked
                                                    ? [...prev, value]
                                                    : prev.filter(p => p !== value)
                                            )
                                            if (errors.permissions) {
                                                setErrors(prev => ({ ...prev, permissions: '' }))
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
