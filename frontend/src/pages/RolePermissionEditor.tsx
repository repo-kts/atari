import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { userApi, RolePermissionsResponse, ModuleWithPermissions } from '../services/userApi'
import { Button } from '../components/ui/Button'
import { AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'

/** Display order of menus to match the design (Role Permissions UI) */
const MENU_DISPLAY_ORDER = [
    'All Masters',
    'Role Management',
    'User Management',
    'About KVKs',
    'Achievements',
    'Performance Indicators',
    'Miscellaneous Information',
    'Digital Information',
    'Swachh Bharat Abhiyaan',
    'Meetings',
    'Module Images',
    'Targets',
    'Log History',
    'Notifications',
    'Reports',
]

export const RolePermissionEditor: React.FC = () => {
    const { roleId } = useParams<{ roleId: string }>()
    const navigate = useNavigate()
    const [data, setData] = useState<RolePermissionsResponse | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set())

    useEffect(() => {
        if (!roleId) return
        const fetchData = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const result = await userApi.getRolePermissions(Number(roleId))
                setData(result)
                // Initialize selected permissions from hasPermission flags
                const selected = new Set<number>()
                result.modules.forEach((module) =>
                    module.permissions.forEach((p) => {
                        if (p.hasPermission) selected.add(p.permissionId)
                    })
                )
                setSelectedPermissions(selected)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load permissions')
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [roleId])

    const togglePermission = (permissionId: number) => {
        setSelectedPermissions((prev) => {
            const next = new Set(prev)
            if (next.has(permissionId)) next.delete(permissionId)
            else next.add(permissionId)
            return next
        })
    }

    // Filter out USER_SCOPE (internal module) and sort by design order
    const orderedModules = useMemo(() => {
        if (!data?.modules) return []
        const list = data.modules.filter((m) => m.moduleCode !== 'USER_SCOPE')
        const orderIndex = (name: string) => {
            const i = MENU_DISPLAY_ORDER.indexOf(name)
            return i === -1 ? MENU_DISPLAY_ORDER.length : i
        }
        return [...list].sort((a, b) => {
            const i = orderIndex(a.menuName)
            const j = orderIndex(b.menuName)
            if (i !== j) return i - j
            return a.subMenuName.localeCompare(b.subMenuName)
        })
    }, [data?.modules])

    // Group by menu in display order
    const menuEntries = useMemo(() => {
        return MENU_DISPLAY_ORDER.map((menuName) => [
            menuName,
            orderedModules.filter((m) => m.menuName === menuName),
        ]).filter(([, mods]) => mods.length > 0) as [string, ModuleWithPermissions[]][]
    }, [orderedModules])

    // All permission IDs by action (for header "select all")
    const { viewIds, addIds, editIds, deleteIds } = useMemo(() => {
        const viewIds: number[] = []
        const addIds: number[] = []
        const editIds: number[] = []
        const deleteIds: number[] = []
        orderedModules.forEach((mod) => {
            mod.permissions.forEach((p) => {
                if (p.action === 'VIEW') viewIds.push(p.permissionId)
                else if (p.action === 'ADD') addIds.push(p.permissionId)
                else if (p.action === 'EDIT') editIds.push(p.permissionId)
                else if (p.action === 'DELETE') deleteIds.push(p.permissionId)
            })
        })
        return { viewIds, addIds, editIds, deleteIds }
    }, [orderedModules])

    const allSelected = (ids: number[]) => ids.length > 0 && ids.every((id) => selectedPermissions.has(id))
    const toggleAllForAction = (ids: number[]) => {
        setSelectedPermissions((prev) => {
            const next = new Set(prev)
            const select = !allSelected(ids)
            ids.forEach((id) => (select ? next.add(id) : next.delete(id)))
            return next
        })
    }

    const handleSave = async () => {
        if (!roleId || !data) return
        setIsSaving(true)
        setError(null)
        setSuccessMessage(null)
        try {
            await userApi.updateRolePermissions(Number(roleId), Array.from(selectedPermissions))
            setSuccessMessage('Permissions updated successfully')
            setTimeout(() => setSuccessMessage(null), 3000)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save permissions')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#487749]" />
                    <p className="mt-4 text-[#757575]">Loading permissions...</p>
                </div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center text-[#757575]">Role not found</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F5F5F5] p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Back button */}
                <button
                    onClick={() => navigate('/role-view')}
                    className="mb-4 inline-flex items-center gap-2 text-sm text-[#487749] hover:text-[#3a5f3a] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="font-medium">Back to Role Management</span>
                </button>

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-[#212121]">
                        Role: {data.roleName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </h1>
                    {data.description && (
                        <p className="text-sm text-[#757575] mt-1">{data.description}</p>
                    )}
                </div>

                {/* Messages */}
                {error && (
                    <div className="mb-4 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}
                {successMessage && (
                    <div className="mb-4 flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{successMessage}</span>
                    </div>
                )}

                {/* Table */}
                <div className="bg-white rounded-xl border border-[#E0E0E0] shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[#F5F5F5] border-b border-[#E0E0E0]">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#212121] border-r border-[#E0E0E0]">
                                        Menu
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#212121] border-r border-[#E0E0E0]">
                                        Sub Menus
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-[#212121] border-r border-[#E0E0E0]">
                                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={allSelected(viewIds)}
                                                onChange={() => toggleAllForAction(viewIds)}
                                                className="w-4 h-4 text-[#2196F3] border-gray-300 rounded focus:ring-[#2196F3] cursor-pointer"
                                            />
                                            View
                                        </label>
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-[#212121] border-r border-[#E0E0E0]">
                                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={allSelected(addIds)}
                                                onChange={() => toggleAllForAction(addIds)}
                                                className="w-4 h-4 text-[#2196F3] border-gray-300 rounded focus:ring-[#2196F3] cursor-pointer"
                                            />
                                            Add
                                        </label>
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-[#212121] border-r border-[#E0E0E0]">
                                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={allSelected(editIds)}
                                                onChange={() => toggleAllForAction(editIds)}
                                                className="w-4 h-4 text-[#2196F3] border-gray-300 rounded focus:ring-[#2196F3] cursor-pointer"
                                            />
                                            Edit
                                        </label>
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-[#212121]">
                                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={allSelected(deleteIds)}
                                                onChange={() => toggleAllForAction(deleteIds)}
                                                className="w-4 h-4 text-[#2196F3] border-gray-300 rounded focus:ring-[#2196F3] cursor-pointer"
                                            />
                                            Delete
                                        </label>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {menuEntries.map(([menuName, modules]) =>
                                    modules.map((module, moduleIndex) => {
                                        const viewPerm = module.permissions.find((p) => p.action === 'VIEW')
                                        const addPerm = module.permissions.find((p) => p.action === 'ADD')
                                        const editPerm = module.permissions.find((p) => p.action === 'EDIT')
                                        const deletePerm = module.permissions.find((p) => p.action === 'DELETE')

                                        return (
                                            <tr key={module.moduleId} className="border-b border-[#E0E0E0] hover:bg-[#FAFAFA]">
                                                {moduleIndex === 0 && (
                                                    <td
                                                        rowSpan={modules.length}
                                                        className="px-4 py-3 text-sm text-[#212121] align-top border-r border-[#E0E0E0] bg-[#F9F9F9]"
                                                    >
                                                        {menuName}
                                                    </td>
                                                )}
                                                <td className="px-4 py-3 text-sm text-[#212121] border-r border-[#E0E0E0]">
                                                    {module.subMenuName}
                                                </td>
                                                {/* View */}
                                                <td className="px-4 py-3 text-center border-r border-[#E0E0E0]">
                                                    {viewPerm && (
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedPermissions.has(viewPerm.permissionId)}
                                                            onChange={() => togglePermission(viewPerm.permissionId)}
                                                            className="w-4 h-4 text-[#2196F3] border-gray-300 rounded focus:ring-[#2196F3] cursor-pointer"
                                                        />
                                                    )}
                                                </td>
                                                {/* Add */}
                                                <td className="px-4 py-3 text-center border-r border-[#E0E0E0]">
                                                    {addPerm && (
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedPermissions.has(addPerm.permissionId)}
                                                            onChange={() => togglePermission(addPerm.permissionId)}
                                                            className="w-4 h-4 text-[#2196F3] border-gray-300 rounded focus:ring-[#2196F3] cursor-pointer"
                                                        />
                                                    )}
                                                </td>
                                                {/* Edit */}
                                                <td className="px-4 py-3 text-center border-r border-[#E0E0E0]">
                                                    {editPerm && (
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedPermissions.has(editPerm.permissionId)}
                                                            onChange={() => togglePermission(editPerm.permissionId)}
                                                            className="w-4 h-4 text-[#2196F3] border-gray-300 rounded focus:ring-[#2196F3] cursor-pointer"
                                                        />
                                                    )}
                                                </td>
                                                {/* Delete */}
                                                <td className="px-4 py-3 text-center">
                                                    {deletePerm && (
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedPermissions.has(deletePerm.permissionId)}
                                                            onChange={() => togglePermission(deletePerm.permissionId)}
                                                            className="w-4 h-4 text-[#2196F3] border-gray-300 rounded focus:ring-[#2196F3] cursor-pointer"
                                                        />
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Save button */}
                    <div className="px-6 py-4 border-t border-[#E0E0E0] bg-[#FAFAFA] flex items-center justify-center">
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="min-w-[120px] bg-[#4CAF50] hover:bg-[#45A049] text-white"
                        >
                            {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
