import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { outranks } from '../../constants/roleHierarchy'
import { UserModuleWithPermissions, getRoleLabel } from '../../services/userApi'
import { useUserPermissions, useUpdateUserPermissions } from '../../hooks/useUserManagement'
import { AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react'
import { Breadcrumbs } from '../../components/common/Breadcrumbs'
import { Card, CardContent } from '../../components/ui/Card'
import { getBreadcrumbsForPath, getRouteConfig } from '../../config/route'

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

const IndeterminateCheckbox: React.FC<
    React.InputHTMLAttributes<HTMLInputElement> & { indeterminate?: boolean }
> = ({ indeterminate, ...props }) => {
    const ref = useRef<HTMLInputElement>(null)
    useEffect(() => {
        if (ref.current) ref.current.indeterminate = !!indeterminate
    }, [indeterminate])
    return <input ref={ref} type="checkbox" {...props} />
}

const CHECKBOX_CLASS =
    'w-4 h-4 text-[#487749] border-[#E0E0E0] rounded focus:ring-[#487749]/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'

export const UserPermissionEditor: React.FC = () => {
    const { userId } = useParams<{ userId: string }>()
    const navigate = useNavigate()
    const location = useLocation()
    const { user: currentUser } = useAuth()
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set())

    const routeConfig = getRouteConfig(location.pathname)
    const breadcrumbs = getBreadcrumbsForPath(location.pathname)

    const {
        data,
        isLoading,
        error: queryError,
    } = useUserPermissions(userId ? Number(userId) : null)

    const updateMutation = useUpdateUserPermissions()
    const isSaving = updateMutation.isPending
    const error = queryError
        ? queryError instanceof Error
            ? queryError.message
            : 'Failed to load permissions'
        : updateMutation.error
        ? updateMutation.error instanceof Error
            ? updateMutation.error.message
            : 'Failed to save permissions'
        : null

    // Seed selected set from current user grants
    useEffect(() => {
        if (data) {
            const selected = new Set<number>()
            data.modules.forEach((module) => {
                module.permissions.forEach((p) => {
                    if (p.hasPermission) selected.add(p.permissionId)
                })
            })
            setSelectedPermissions(selected)
        }
    }, [data])

    // Caller must strictly outrank the target user's role to edit (super_admin bypass).
    const canEdit =
        currentUser?.role === 'super_admin' ||
        (data?.roleName ? outranks(currentUser?.role || '', data.roleName) : false)

    const togglePermission = (permissionId: number, roleGrants: boolean) => {
        if (!canEdit || !roleGrants) return
        setSelectedPermissions((prev) => {
            const next = new Set(prev)
            if (next.has(permissionId)) next.delete(permissionId)
            else next.add(permissionId)
            return next
        })
    }

    const orderedModules = useMemo(() => {
        if (!data?.modules) return []
        const orderIndex = (name: string) => {
            const i = MENU_DISPLAY_ORDER.indexOf(name)
            return i === -1 ? MENU_DISPLAY_ORDER.length : i
        }
        return [...data.modules].sort((a, b) => {
            const i = orderIndex(a.menuName)
            const j = orderIndex(b.menuName)
            if (i !== j) return i - j
            return a.subMenuName.localeCompare(b.subMenuName)
        })
    }, [data?.modules])

    const menuEntries = useMemo(() => {
        // Group by actual menus present in the payload so an unknown menu
        // (e.g. one added to the backend but not yet listed in
        // MENU_DISPLAY_ORDER) is appended at the end instead of dropped.
        const groups = new Map<string, UserModuleWithPermissions[]>()
        for (const mod of orderedModules) {
            const arr = groups.get(mod.menuName) ?? []
            arr.push(mod)
            groups.set(mod.menuName, arr)
        }
        return Array.from(groups.entries()) as [string, UserModuleWithPermissions[]][]
    }, [orderedModules])

    // Only the role-granted permission IDs are toggleable. Header/group
    // "select all" checkboxes ignore anything outside the role ceiling.
    const { viewIds, addIds, editIds, deleteIds } = useMemo(() => {
        const viewIds: number[] = []
        const addIds: number[] = []
        const editIds: number[] = []
        const deleteIds: number[] = []
        orderedModules.forEach((mod) => {
            mod.permissions.forEach((p) => {
                if (!p.roleGrants) return
                if (p.action === 'VIEW') viewIds.push(p.permissionId)
                else if (p.action === 'ADD') addIds.push(p.permissionId)
                else if (p.action === 'EDIT') editIds.push(p.permissionId)
                else if (p.action === 'DELETE') deleteIds.push(p.permissionId)
            })
        })
        return { viewIds, addIds, editIds, deleteIds }
    }, [orderedModules])

    const groupPermIds = useMemo(() => {
        const map: Record<
            string,
            { viewIds: number[]; addIds: number[]; editIds: number[]; deleteIds: number[] }
        > = {}
        for (const [menuName, modules] of menuEntries) {
            const g = {
                viewIds: [] as number[],
                addIds: [] as number[],
                editIds: [] as number[],
                deleteIds: [] as number[],
            }
            for (const mod of modules) {
                for (const p of mod.permissions) {
                    if (!p.roleGrants) continue
                    if (p.action === 'VIEW') g.viewIds.push(p.permissionId)
                    else if (p.action === 'ADD') g.addIds.push(p.permissionId)
                    else if (p.action === 'EDIT') g.editIds.push(p.permissionId)
                    else if (p.action === 'DELETE') g.deleteIds.push(p.permissionId)
                }
            }
            map[menuName] = g
        }
        return map
    }, [menuEntries])

    const allSelected = useCallback(
        (ids: number[]) => ids.length > 0 && ids.every((id) => selectedPermissions.has(id)),
        [selectedPermissions]
    )
    const someSelected = useCallback(
        (ids: number[]) => ids.length > 0 && ids.some((id) => selectedPermissions.has(id)),
        [selectedPermissions]
    )

    const toggleAllForAction = (ids: number[]) => {
        if (!canEdit) return
        setSelectedPermissions((prev) => {
            const next = new Set(prev)
            const select = !allSelected(ids)
            ids.forEach((id) => (select ? next.add(id) : next.delete(id)))
            return next
        })
    }

    const handleSave = async () => {
        if (!userId || !data) return
        setSuccessMessage(null)

        const isEmpty = selectedPermissions.size === 0
        if (isEmpty) {
            const ok = window.confirm(
                `${data.name} will have no access after this save. Continue?`
            )
            if (!ok) return
        }

        try {
            await updateMutation.mutateAsync({
                userId: Number(userId),
                permissionIds: Array.from(selectedPermissions),
                allowEmpty: isEmpty,
            })
            setSuccessMessage('User permissions updated successfully')
            setTimeout(() => setSuccessMessage(null), 3000)
        } catch {
            // Mutation failure surfaces through updateMutation.error →
            // the top-level error banner; nothing to handle here.
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
                <div className="text-center text-[#757575]">User not found</div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl p-1">
            <div className="mb-6 flex items-center gap-4 px-6 pt-4">
                <button
                    onClick={() => {
                        if (routeConfig?.parent) {
                            navigate(routeConfig.parent)
                        } else {
                            navigate('/view-users')
                        }
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#487749] border border-[#E0E0E0] rounded-xl hover:bg-[#F5F5F5] transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                </button>
                {breadcrumbs.length > 0 && (
                    <Breadcrumbs
                        items={breadcrumbs.map((b, i) => ({ ...b, level: i }))}
                        showHome={false}
                    />
                )}
            </div>

            <Card className="bg-[#FAF9F6]">
                <CardContent className="p-6">
                    <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-xl font-semibold text-[#487749]">
                                User Permissions: {data.name}
                            </h2>
                            <p className="text-sm text-[#757575] mt-1">
                                {data.email} — {getRoleLabel(data.roleName)}
                            </p>
                            <p className="text-xs text-[#9E9E9E] mt-1">
                                Unavailable cells are outside this role's ceiling.
                            </p>
                        </div>
                        {canEdit ? (
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#487749] text-white rounded-xl text-sm font-medium hover:bg-[#3d6540] disabled:opacity-50 transition-all duration-200 shadow-sm"
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        ) : (
                            <span className="px-4 py-2 text-sm font-medium text-[#757575] bg-[#F5F5F5] rounded-xl border border-[#E0E0E0]">
                                View Only
                            </span>
                        )}
                    </div>

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

                    {data.mode === 'ceiling' && (
                        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
                            This user is on coarse role-derived permissions. Saving below will switch them to fine-grained per-module control.
                        </div>
                    )}

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
                                        {(['VIEW', 'ADD', 'EDIT', 'DELETE'] as const).map((action) => {
                                            const ids =
                                                action === 'VIEW'
                                                    ? viewIds
                                                    : action === 'ADD'
                                                    ? addIds
                                                    : action === 'EDIT'
                                                    ? editIds
                                                    : deleteIds
                                            return (
                                                <th
                                                    key={action}
                                                    className={`px-4 py-4 text-center text-xs font-semibold text-[#212121] uppercase tracking-wider ${
                                                        action === 'DELETE'
                                                            ? ''
                                                            : 'border-r border-[#E0E0E0]'
                                                    }`}
                                                >
                                                    <div className="flex flex-col items-center gap-1.5">
                                                        <span>
                                                            {action.charAt(0) +
                                                                action.slice(1).toLowerCase()}
                                                        </span>
                                                        <IndeterminateCheckbox
                                                            checked={allSelected(ids)}
                                                            indeterminate={
                                                                !allSelected(ids) && someSelected(ids)
                                                            }
                                                            onChange={() => toggleAllForAction(ids)}
                                                            disabled={!canEdit || ids.length === 0}
                                                            className={CHECKBOX_CLASS}
                                                        />
                                                    </div>
                                                </th>
                                            )
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {menuEntries.map(([menuName, modules]) => {
                                        const gp = groupPermIds[menuName]
                                        return (
                                            <React.Fragment key={menuName}>
                                                <tr className="bg-[#EFF5EF] border-b border-[#E0E0E0]">
                                                    <td className="px-6 py-3 text-sm font-semibold text-[#487749] border-r border-[#E0E0E0]">
                                                        {menuName}
                                                    </td>
                                                    <td className="px-6 py-3 text-xs text-[#757575] italic border-r border-[#E0E0E0]">
                                                        Select all
                                                    </td>
                                                    {(
                                                        [
                                                            ['VIEW', gp.viewIds],
                                                            ['ADD', gp.addIds],
                                                            ['EDIT', gp.editIds],
                                                            ['DELETE', gp.deleteIds],
                                                        ] as const
                                                    ).map(([action, ids], idx) => (
                                                        <td
                                                            key={action}
                                                            className={`px-4 py-3 text-center ${
                                                                idx === 3 ? '' : 'border-r border-[#E0E0E0]'
                                                            }`}
                                                        >
                                                            {ids.length > 0 && (
                                                                <IndeterminateCheckbox
                                                                    checked={allSelected(ids)}
                                                                    indeterminate={
                                                                        !allSelected(ids) &&
                                                                        someSelected(ids)
                                                                    }
                                                                    onChange={() =>
                                                                        toggleAllForAction(ids)
                                                                    }
                                                                    disabled={!canEdit}
                                                                    className={CHECKBOX_CLASS}
                                                                />
                                                            )}
                                                        </td>
                                                    ))}
                                                </tr>
                                                {modules.map((module) => {
                                                    const cells = (
                                                        ['VIEW', 'ADD', 'EDIT', 'DELETE'] as const
                                                    ).map((action) =>
                                                        module.permissions.find((p) => p.action === action)
                                                    )
                                                    return (
                                                        <tr
                                                            key={module.moduleId}
                                                            className="border-b border-[#E0E0E0] hover:bg-[#F5F5F5] transition-colors"
                                                        >
                                                            <td className="border-r border-[#E0E0E0]" />
                                                            <td className="px-6 py-4 text-sm text-[#212121] border-r border-[#E0E0E0]">
                                                                {module.subMenuName}
                                                            </td>
                                                            {cells.map((p, idx) => (
                                                                <td
                                                                    key={idx}
                                                                    className={`px-4 py-4 text-center ${
                                                                        idx === 3
                                                                            ? ''
                                                                            : 'border-r border-[#E0E0E0]'
                                                                    }`}
                                                                >
                                                                    {p && (
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedPermissions.has(
                                                                                p.permissionId
                                                                            )}
                                                                            onChange={() =>
                                                                                togglePermission(
                                                                                    p.permissionId,
                                                                                    p.roleGrants
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                !canEdit || !p.roleGrants
                                                                            }
                                                                            title={
                                                                                !p.roleGrants
                                                                                    ? 'Not available in this role'
                                                                                    : undefined
                                                                            }
                                                                            className={CHECKBOX_CLASS}
                                                                        />
                                                                    )}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    )
                                                })}
                                            </React.Fragment>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
