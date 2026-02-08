import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { userApi, RolePermissionsResponse, ModuleWithPermissions } from '../../services/userApi'
import { AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react'
import { Breadcrumbs } from '../../components/common/Breadcrumbs'
import { Card, CardContent } from '../../components/ui/Card'
import { getBreadcrumbsForPath, getRouteConfig } from '../../config/routeConfig'

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
    const location = useLocation()
    const [data, setData] = useState<RolePermissionsResponse | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set())

    const routeConfig = getRouteConfig(location.pathname)
    const breadcrumbs = getBreadcrumbsForPath(location.pathname)

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
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#487749]" />
                    <p className="mt-4 text-[#757575]">Loading permissions...</p>
                </div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center text-[#757575]">Role not found</div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl p-1">
            {/* Back + Breadcrumbs */}
            <div className="mb-6 flex items-center gap-4 px-6 pt-4">
                <button
                    onClick={() => {
                        if (routeConfig?.parent) {
                            navigate(routeConfig.parent)
                        } else {
                            navigate('/role-view')
                        }
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#487749] border border-[#E0E0E0] rounded-xl hover:bg-[#F5F5F5] transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                </button>
                {breadcrumbs.length > 0 && (
                    <Breadcrumbs items={breadcrumbs.map((b, i) => ({ ...b, level: i }))} showHome={false} />
                )}
            </div>

            <Card className="bg-[#FAF9F6]">
                <CardContent className="p-6">
                    {/* Header */}
                    <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-xl font-semibold text-[#487749]">
                                Role Permissions: {data.roleName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </h2>
                            {data.description ? (
                                <p className="text-sm text-[#757575] mt-1">{data.description}</p>
                            ) : (
                                <p className="text-sm text-[#757575] mt-1">Configure granular access for this role</p>
                            )}
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-[#487749] text-white rounded-xl text-sm font-medium hover:bg-[#3d6540] disabled:opacity-50 transition-all duration-200 shadow-sm"
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
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
                    <div className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden mt-4">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-[#F5F5F5] border-b border-[#E0E0E0]">
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#212121] uppercase tracking-wider border-r border-[#E0E0E0]">
                                            Menu
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#212121] uppercase tracking-wider border-r border-[#E0E0E0]">
                                            Sub Menu
                                        </th>
                                        <th className="px-4 py-4 text-center text-xs font-semibold text-[#212121] uppercase tracking-wider border-r border-[#E0E0E0]">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <span>View</span>
                                                <input
                                                    type="checkbox"
                                                    checked={allSelected(viewIds)}
                                                    onChange={() => toggleAllForAction(viewIds)}
                                                    className="w-4 h-4 text-[#487749] border-[#E0E0E0] rounded focus:ring-[#487749]/20 cursor-pointer"
                                                />
                                            </div>
                                        </th>
                                        <th className="px-4 py-4 text-center text-xs font-semibold text-[#212121] uppercase tracking-wider border-r border-[#E0E0E0]">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <span>Add</span>
                                                <input
                                                    type="checkbox"
                                                    checked={allSelected(addIds)}
                                                    onChange={() => toggleAllForAction(addIds)}
                                                    className="w-4 h-4 text-[#487749] border-[#E0E0E0] rounded focus:ring-[#487749]/20 cursor-pointer"
                                                />
                                            </div>
                                        </th>
                                        <th className="px-4 py-4 text-center text-xs font-semibold text-[#212121] uppercase tracking-wider border-r border-[#E0E0E0]">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <span>Edit</span>
                                                <input
                                                    type="checkbox"
                                                    checked={allSelected(editIds)}
                                                    onChange={() => toggleAllForAction(editIds)}
                                                    className="w-4 h-4 text-[#487749] border-[#E0E0E0] rounded focus:ring-[#487749]/20 cursor-pointer"
                                                />
                                            </div>
                                        </th>
                                        <th className="px-4 py-4 text-center text-xs font-semibold text-[#212121] uppercase tracking-wider">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <span>Delete</span>
                                                <input
                                                    type="checkbox"
                                                    checked={allSelected(deleteIds)}
                                                    onChange={() => toggleAllForAction(deleteIds)}
                                                    className="w-4 h-4 text-[#487749] border-[#E0E0E0] rounded focus:ring-[#487749]/20 cursor-pointer"
                                                />
                                            </div>
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
                                                <tr key={module.moduleId} className="border-b border-[#E0E0E0] hover:bg-[#F5F5F5] transition-colors">
                                                    {moduleIndex === 0 && (
                                                        <td
                                                            rowSpan={modules.length}
                                                            className="px-6 py-4 text-sm font-medium text-[#487749] align-top border-r border-[#E0E0E0] bg-[#FAF9F6]"
                                                        >
                                                            {menuName}
                                                        </td>
                                                    )}
                                                    <td className="px-6 py-4 text-sm text-[#212121] border-r border-[#E0E0E0]">
                                                        {module.subMenuName}
                                                    </td>
                                                    {/* View */}
                                                    <td className="px-4 py-4 text-center border-r border-[#E0E0E0]">
                                                        {viewPerm && (
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedPermissions.has(viewPerm.permissionId)}
                                                                onChange={() => togglePermission(viewPerm.permissionId)}
                                                                className="w-4 h-4 text-[#487749] border-[#E0E0E0] rounded focus:ring-[#487749]/20 cursor-pointer"
                                                            />
                                                        )}
                                                    </td>
                                                    {/* Add */}
                                                    <td className="px-4 py-4 text-center border-r border-[#E0E0E0]">
                                                        {addPerm && (
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedPermissions.has(addPerm.permissionId)}
                                                                onChange={() => togglePermission(addPerm.permissionId)}
                                                                className="w-4 h-4 text-[#487749] border-[#E0E0E0] rounded focus:ring-[#487749]/20 cursor-pointer"
                                                            />
                                                        )}
                                                    </td>
                                                    {/* Edit */}
                                                    <td className="px-4 py-4 text-center border-r border-[#E0E0E0]">
                                                        {editPerm && (
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedPermissions.has(editPerm.permissionId)}
                                                                onChange={() => togglePermission(editPerm.permissionId)}
                                                                className="w-4 h-4 text-[#487749] border-[#E0E0E0] rounded focus:ring-[#487749]/20 cursor-pointer"
                                                            />
                                                        )}
                                                    </td>
                                                    {/* Delete */}
                                                    <td className="px-4 py-4 text-center">
                                                        {deletePerm && (
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedPermissions.has(deletePerm.permissionId)}
                                                                onChange={() => togglePermission(deletePerm.permissionId)}
                                                                className="w-4 h-4 text-[#487749] border-[#E0E0E0] rounded focus:ring-[#487749]/20 cursor-pointer"
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
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
