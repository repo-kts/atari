import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getRoleLabel } from '../../services/userApi'
import { useUsers, useDeleteUser } from '../../hooks/useUserManagement'
import { CreateUserModal } from '@/components/admin/CreateUserModal'
import { Search, Plus, Edit, Trash2, AlertCircle, ChevronLeft } from 'lucide-react'
import { Breadcrumbs } from '../../components/common/Breadcrumbs'
import { Card, CardContent } from '../../components/ui/Card'
import { getBreadcrumbsForPath, getRouteConfig } from '../../config/routeConfig'
import { useConfirm } from '@/hooks/useConfirm'
import { useAlert } from '@/hooks/useAlert'

/**
 * User interface matching API response
 */
interface User {
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
    kvkId?: number | null
    createdAt?: string
    lastLoginAt?: string | null
}

export const UserManagement: React.FC = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { hasPermission, canActOnRole } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    const routeConfig = getRouteConfig(location.pathname)
    const breadcrumbs = getBreadcrumbsForPath(location.pathname)

    // Fetch users with filters
    const {
        data: usersData = [],
        isLoading,
        error: queryError,
        refetch: refetchUsers
    } = useUsers({
        search: searchTerm.trim() || undefined,
    })

    const users = Array.isArray(usersData) ? usersData as User[] : []


    // Delete user mutation
    const deleteUserMutation = useDeleteUser()

    // Modal hooks
    const { confirm, ConfirmDialog } = useConfirm()
    const { alert, AlertDialog } = useAlert()

    const error = queryError ? (queryError instanceof Error ? queryError.message : 'Failed to load users') : null

    // Granular permissions from Role Permission Editor (user_management_users module)
    const canCreateUsers = hasPermission('ADD', 'user_management_users')
    const canEditUser = hasPermission('EDIT', 'user_management_users')
    const canDeleteUser = hasPermission('DELETE', 'user_management_users')
    const showActionsColumn = (canEditUser || canDeleteUser) && users.some(u => canActOnRole(u.roleName))

    // Handle delete user
    const handleDelete = async (userId: number) => {
        const user = users.find(u => u.userId === userId)

        confirm(
            {
                title: 'Delete User',
                message: `Are you sure you want to delete user "${user?.name}"?\n\nThis action cannot be undone.`,
                variant: 'danger',
                confirmText: 'Delete',
                cancelText: 'Cancel',
            },
            async () => {
        try {
            await deleteUserMutation.mutateAsync(userId)
                    alert({
                        title: 'Success',
                        message: 'User deleted successfully.',
                        variant: 'success',
                        autoClose: true,
                        autoCloseDelay: 2000,
                    })
        } catch (err) {
                    alert({
                        title: 'Error',
                        message: err instanceof Error ? err.message : 'Failed to delete user',
                        variant: 'error',
                    })
        }
            }
        )
    }

    // Format date
    const formatDate = (dateString?: string | null) => {
        if (!dateString) return 'Never'
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            })
        } catch {
            return 'Invalid date'
        }
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
                            <h2 className="text-xl font-semibold text-[#487749]">User Management</h2>
                            <p className="text-sm text-[#757575] mt-1">Manage system users and their access</p>
                        </div>
                        {canCreateUsers && (
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#487749] text-white rounded-xl text-sm font-medium hover:bg-[#3d6540] border border-[#487749] transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <Plus className="w-4 h-4" />
                                Create User
                            </button>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-[#487749] mb-2">
                                Search Users
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#757575]" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="Search by name or email..."
                                    className="w-full pl-10 pr-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8F5E9] focus:border-[#487749] bg-white text-[#212121] placeholder-[#9E9E9E] transition-all duration-200 hover:border-[#BDBDBD]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 0 Results Warning */}
                    {!isLoading && users.length === 0 && (
                        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <span>No users found matching the selected filters.</span>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Users Table */}
                    <div className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden shadow-sm">
                        {isLoading ? (
                            <div className="p-12 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#487749]"></div>
                                <p className="mt-4 text-[#757575]">Loading users...</p>
                            </div>
                        ) : !users || users.length === 0 ? (
                            <div className="p-12 text-center text-[#757575]">
                                <p>No users found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-[#F5F5F5] border-b border-[#E0E0E0]">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-[#212121] uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-[#212121] uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-[#212121] uppercase tracking-wider">
                                                Phone
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-[#212121] uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-[#212121] uppercase tracking-wider">
                                                Created
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-[#212121] uppercase tracking-wider">
                                                Last Login
                                            </th>
                                            {showActionsColumn && (
                                                <th className="px-6 py-4 text-right text-xs font-semibold text-[#212121] uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E0E0E0]">
                                        {users.map(user => (
                                            <tr
                                                key={user.userId}
                                                className="hover:bg-[#F5F5F5] transition-colors"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-[#212121]">
                                                        {user.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-[#757575]">
                                                        {user.email}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-[#757575]">
                                                        {user.phoneNumber || '—'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 py-1 text-xs font-medium rounded-lg bg-[#E8F5E9] text-[#487749]">
                                                        {user.roleName ? getRoleLabel(user.roleName) : '—'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#757575]">
                                                    {formatDate(user.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#757575]">
                                                    {formatDate(user.lastLoginAt)}
                                                </td>
                                                {showActionsColumn && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {canEditUser && canActOnRole(user.roleName) && (
                                                                <button
                                                                    onClick={() => {
                                                                        alert({
                                                                            title: 'Coming Soon',
                                                                            message: 'Edit functionality coming soon',
                                                                            variant: 'info',
                                                                        })
                                                                    }}
                                                                    className="p-1.5 text-[#487749] hover:bg-[#F5F5F5] rounded-xl border border-[#E0E0E0] transition-all duration-200"
                                                                    aria-label="Edit user"
                                                                    title="Edit user"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                            {canDeleteUser && canActOnRole(user.roleName) && (
                                                                <button
                                                                    onClick={() => handleDelete(user.userId)}
                                                                    disabled={deleteUserMutation.isPending}
                                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-xl border border-[#E0E0E0] hover:border-red-200 transition-all duration-200 disabled:opacity-50"
                                                                    aria-label="Delete user"
                                                                    title="Delete user"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Create User Modal */}
            <CreateUserModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    refetchUsers() // Refresh user list after creation
                }}
            />

            {/* Modals */}
            <ConfirmDialog />
            <AlertDialog />
        </div>
    )
}
