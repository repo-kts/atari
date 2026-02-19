import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { LoadingButton } from '../common/LoadingButton'

/** Hierarchy level options: 0=highest, 9=lowest */
export const HIERARCHY_LEVEL_OPTIONS: { value: number; label: string }[] = [
    { value: 0, label: '0 - Super Admin (highest)' },
    { value: 1, label: '1 - Zone Admin' },
    { value: 2, label: '2 - State Admin' },
    { value: 3, label: '3 - District Admin' },
    { value: 4, label: '4 - Org Admin' },
    { value: 5, label: '5 - KVK' },
    { value: 6, label: '6 - State User' },
    { value: 7, label: '7 - District User' },
    { value: 8, label: '8 - Org User' },
    { value: 9, label: '9 - Custom (lowest)' },
]

interface AddRoleModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: (roleId: number) => void
    onSubmit: (
        roleName: string,
        description?: string | null,
        hierarchyLevel?: number
    ) => Promise<{ roleId: number } | void>
}

export const AddRoleModal: React.FC<AddRoleModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    onSubmit,
}) => {
    const [roleName, setRoleName] = useState('')
    const [description, setDescription] = useState('')
    const [hierarchyLevel, setHierarchyLevel] = useState(9)
    const [errors, setErrors] = useState<{ roleName?: string }>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    const resetForm = () => {
        setRoleName('')
        setDescription('')
        setHierarchyLevel(9)
        setErrors({})
        setSubmitError(null)
    }

    const handleClose = () => {
        if (!isSubmitting) {
            resetForm()
            onClose()
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const trimmedName = roleName.trim()
        if (!trimmedName) {
            setErrors({ roleName: 'Role name is required' })
            return
        }
        setErrors({})
        setSubmitError(null)
        setIsSubmitting(true)
        try {
            const result = await onSubmit(trimmedName, description.trim() || null, hierarchyLevel)
            resetForm()
            onClose()
            if (result?.roleId != null) onSuccess?.(result.roleId)
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : 'Failed to create role')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Add Role" size="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="roleName" className="block text-sm font-medium text-[#212121] mb-1.5">
                        Role Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="roleName"
                        type="text"
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                        placeholder="e.g. custom_admin"
                        disabled={isSubmitting}
                        error={errors.roleName}
                    />
                    {!errors.roleName && (
                        <p className="mt-1 text-xs text-[#757575]">
                            Use snake_case (e.g. zone_admin, state_user)
                        </p>
                    )}
                </div>
                <div>
                    <label htmlFor="hierarchyLevel" className="block text-sm font-medium text-[#212121] mb-1.5">
                        Hierarchy Level <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="hierarchyLevel"
                        value={hierarchyLevel}
                        onChange={(e) => setHierarchyLevel(Number(e.target.value))}
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#487749] bg-white text-[#212121] disabled:opacity-60"
                    >
                        {HIERARCHY_LEVEL_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <p className="mt-1 text-xs text-[#757575]">
                        Lower number = higher authority. Affects who can see and manage this role.
                    </p>
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-[#212121] mb-1.5">
                        Description
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Optional description of this role"
                        disabled={isSubmitting}
                        rows={3}
                        className="w-full px-3 py-2 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#487749] bg-white text-[#212121] placeholder-[#9E9E9E] disabled:opacity-60"
                    />
                </div>
                {submitError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                        {submitError}
                    </div>
                )}
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="px-4 py-2 border border-[#E0E0E0] rounded-xl text-sm font-medium text-[#212121] hover:bg-[#F5F5F5] disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <LoadingButton
                        type="submit"
                        isLoading={isSubmitting}
                        disabled={isSubmitting || !roleName.trim()}
                        className="px-4 py-2 bg-[#487749] text-white rounded-xl text-sm font-medium hover:bg-[#3d6540] disabled:opacity-50"
                    >
                        Create Role
                    </LoadingButton>
                </div>
            </form>
        </Modal>
    )
}
