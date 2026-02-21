import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getRoleLabel, type RoleInfo } from '../../services/userApi'
import { useRoles, useCreateRole } from '../../hooks/useUserManagement'
import { outranksOrEqual } from '../../constants/roleHierarchy'
import { Plus, MoreVertical, Trash2, Shield, Search, ChevronLeft } from 'lucide-react'
import { Breadcrumbs } from '../../components/common/Breadcrumbs'
import { Card, CardContent } from '../../components/ui/Card'
import { getBreadcrumbsForPath, getRouteConfig } from '../../config/routeConfig'
import { useConfirm } from '@/hooks/useConfirm'
import { useAlert } from '@/hooks/useAlert'
import { AddRoleModal } from '@/components/admin/AddRoleModal'

const PAGE_SIZE = 10

export const RoleManagement: React.FC = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { user: currentUser } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')
    const [page, setPage] = useState(1)
    const [openActionId, setOpenActionId] = useState<number | null>(null)
    const [sortBy, setSortBy] = useState<'roleId' | 'roleName'>('roleId')
    const [sortAsc, setSortAsc] = useState(true)
    const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const createRoleMutation = useCreateRole()

    const routeConfig = getRouteConfig(location.pathname)
    const breadcrumbs = getBreadcrumbsForPath(location.pathname)

    // Fetch roles using TanStack Query
    const { data: roles = [], isLoading, error: queryError } = useRoles()
    const error = queryError ? (queryError instanceof Error ? queryError.message : 'Failed to load roles') : null

    // Modal hooks
    const { confirm, ConfirmDialog } = useConfirm()
    const { alert, AlertDialog } = useAlert()

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpenActionId(null)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const filteredRoles = roles.filter(
        (r) =>
            !searchTerm.trim() ||
            getRoleLabel(r.roleName).toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.description ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    const sortedRoles = [...filteredRoles].sort((a, b) => {
        const aVal = sortBy === 'roleId' ? a.roleId : getRoleLabel(a.roleName)
        const bVal = sortBy === 'roleId' ? b.roleId : getRoleLabel(b.roleName)
        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortAsc ? aVal - bVal : bVal - aVal
        }
        const cmp = String(aVal).localeCompare(String(bVal))
        return sortAsc ? cmp : -cmp
    })

    const total = sortedRoles.length
    const start = (page - 1) * PAGE_SIZE
    const end = Math.min(start + PAGE_SIZE, total)
    const pageRoles = sortedRoles.slice(start, end)
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

    const toggleSort = (field: 'roleId' | 'roleName') => {
        if (sortBy === field) setSortAsc((v) => !v)
        else {
            setSortBy(field)
            setSortAsc(true)
        }
    }

    const handleAddRole = () => setIsAddRoleModalOpen(true)

    const handleCreateRole = async (
        roleName: string,
        description?: string | null,
        hierarchyLevel?: number
    ) => {
        const role = await createRoleMutation.mutateAsync({
            roleName,
            description,
            hierarchyLevel: hierarchyLevel ?? 9,
        })
        return role
    }

    const handleAddRoleSuccess = (roleId: number) => {
        navigate(`/role-view/${roleId}/permissions`)
    }

    const handleAddEditPermission = (role: RoleInfo) => {
        setOpenActionId(null)
        navigate(`/role-view/${role.roleId}/permissions`)
    }

    const handleDelete = (role: RoleInfo) => {
        setOpenActionId(null)
        confirm(
            {
                title: 'Delete Role',
                message: `Delete role "${getRoleLabel(role.roleName)}"? This may affect existing users.`,
                variant: 'danger',
                confirmText: 'Delete',
                cancelText: 'Cancel',
            },
            () => {
                alert({
                    title: 'Coming Soon',
                    message: 'Delete role – coming soon',
                    variant: 'info',
                })
            }
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
                            navigate('/dashboard')
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
                            <h2 className="text-xl font-semibold text-[#487749]">Role Management</h2>
                            <p className="text-sm text-[#757575] mt-1">Manage system roles and their permissions</p>
                        </div>
                        {currentUser?.role === 'super_admin' && (
                            <button
                                onClick={handleAddRole}
                                className="flex items-center gap-2 px-4 py-2 bg-[#487749] text-white rounded-xl text-sm font-medium hover:bg-[#3d6540] border border-[#487749] transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <Plus className="w-4 h-4" />
                                Add Role
                            </button>
                        )}
                    </div>

                    {/* Search Bar */}
                    <div className="my-2">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#757575]" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                    setPage(1)
                                }}
                                placeholder="Search by role name..."
                                className="w-full pl-10 pr-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#487749] bg-white text-[#212121] placeholder-[#9E9E9E] transition-all duration-200 hover:border-[#BDBDBD]"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="my-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#487749]"></div>
                            <span className="ml-3 text-[#757575]">Loading...</span>
                        </div>
                    ) : (
                        <>
                            {/* Table */}
                            <div className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden mt-4">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-[#F5F5F5] border-b border-[#E0E0E0]">
                                                <th
                                                    className="px-6 py-4 text-left text-xs font-semibold text-[#212121] uppercase tracking-wider cursor-pointer hover:bg-[#EEEEEE]"
                                                    onClick={() => toggleSort('roleId')}
                                                >
                                                    <span className="inline-flex items-center gap-1">
                                                        S.No.
                                                        <span className="text-[#9E9E9E]">↕</span>
                                                    </span>
                                                </th>
                                                <th
                                                    className="px-6 py-4 text-left text-xs font-semibold text-[#212121] uppercase tracking-wider cursor-pointer hover:bg-[#EEEEEE]"
                                                    onClick={() => toggleSort('roleName')}
                                                >
                                                    <span className="inline-flex items-center gap-1">
                                                        Name
                                                        <span className="text-[#9E9E9E]">↕</span>
                                                    </span>
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-semibold text-[#212121] uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-[#E0E0E0]">
                                            {pageRoles.length === 0 ? (
                                                <tr>
                                                    <td colSpan={3} className="px-6 py-12 text-center text-[#757575]">
                                                        No roles found
                                                    </td>
                                                </tr>
                                            ) : (
                                                pageRoles.map((role, index) => (
                                                    <tr key={role.roleId} className="hover:bg-[#F5F5F5] transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#212121]">
                                                            {start + index + 1}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#212121]">
                                                            {getRoleLabel(role.roleName)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                                            <div className="flex items-center justify-end gap-2 relative">
                                                                <button
                                                                    onClick={() => setOpenActionId(openActionId === role.roleId ? null : role.roleId)}
                                                                    className="p-1.5 text-[#487749] hover:bg-[#F5F5F5] rounded-xl border border-[#E0E0E0] transition-all duration-200"
                                                                    aria-label="Actions"
                                                                >
                                                                    <MoreVertical className="w-4 h-4" />
                                                                </button>
                                                                {openActionId === role.roleId && (
                                                                    <div
                                                                        ref={dropdownRef}
                                                                        className="absolute right-0 top-full mt-1 z-50 min-w-[180px] py-1 bg-white rounded-xl shadow-xl border border-[#E0E0E0]"
                                                                    >
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleAddEditPermission(role)}
                                                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#212121] hover:bg-[#F5F5F5] text-left"
                                                                        >
                                                                            <Shield className="w-4 h-4 text-[#757575]" />
                                                                            {(currentUser?.role === 'super_admin' || currentUser?.role === 'zone_admin' || outranksOrEqual(currentUser?.role || '', role.roleName)) ? 'Add/Edit Permission' : 'View Permission'}
                                                                        </button>
                                                                        {currentUser?.role === 'super_admin' && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleDelete(role)}
                                                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                                Delete
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {total > 0 && (
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-[#E0E0E0] bg-[#FAFAFA]">
                                        <div className="text-sm text-[#757575]">
                                            Showing <span className="font-medium text-[#212121]">{start + 1}</span> to{' '}
                                            <span className="font-medium text-[#212121]">{end}</span> of{' '}
                                            <span className="font-medium text-[#212121]">{total}</span> entries
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                                disabled={page <= 1}
                                                className="px-4 py-2 border border-[#E0E0E0] rounded-xl text-sm font-medium text-[#487749] hover:bg-white hover:border-[#BDBDBD] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                            >
                                                Previous
                                            </button>
                                            <div className="flex gap-1">
                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                                    <button
                                                        key={p}
                                                        onClick={() => setPage(p)}
                                                        className={`px-3 py-2 min-w-[2.5rem] border rounded-xl text-sm font-medium transition-all duration-200 ${page === p
                                                            ? 'bg-[#487749] text-white border-[#487749]'
                                                            : 'border-[#E0E0E0] text-[#487749] hover:bg-white hover:border-[#BDBDBD]'
                                                            }`}
                                                    >
                                                        {p}
                                                    </button>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                                disabled={page >= totalPages}
                                                className="px-4 py-2 border border-[#E0E0E0] rounded-xl text-sm font-medium text-[#487749] hover:bg-white hover:border-[#BDBDBD] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Add Role Modal */}
            <AddRoleModal
                isOpen={isAddRoleModalOpen}
                onClose={() => setIsAddRoleModalOpen(false)}
                onSuccess={handleAddRoleSuccess}
                onSubmit={handleCreateRole}
            />

            {/* Modals */}
            <ConfirmDialog />
            <AlertDialog />
        </div>
    )
}
