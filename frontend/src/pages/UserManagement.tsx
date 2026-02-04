import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { userApi, UserFilters } from '../services/userApi'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { CreateUserModal } from '../components/admin/CreateUserModal'
import { Search, Plus, Edit, Trash2, AlertCircle } from 'lucide-react'

/**
 * Role mapping for display
 */
const ROLE_MAP: Record<string, { id: number; name: string; label: string }> = {
    super_admin: { id: 1, name: 'super_admin', label: 'Super Admin' },
    zone_admin: { id: 2, name: 'zone_admin', label: 'Zone Admin' },
    state_admin: { id: 3, name: 'state_admin', label: 'State Admin' },
    district_admin: { id: 4, name: 'district_admin', label: 'District Admin' },
    org_admin: { id: 5, name: 'org_admin', label: 'Org Admin' },
    kvk: { id: 6, name: 'kvk', label: 'KVK' },
    state_user: { id: 7, name: 'state_user', label: 'State User' },
    district_user: { id: 8, name: 'district_user', label: 'District User' },
    org_user: { id: 9, name: 'org_user', label: 'Org User' },
}

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
    const { user: currentUser, hasRole } = useAuthStore()
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedRole, setSelectedRole] = useState<number | undefined>(undefined)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState<number | null>(null)

    // Check if user can create users
    const canCreateUsers = hasRole([
        'super_admin',
        'zone_admin',
        'state_admin',
        'district_admin',
        'org_admin',
    ])

    // Fetch users
    const fetchUsers = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const filters: UserFilters = {}
            if (searchTerm.trim()) {
                filters.search = searchTerm.trim()
            }
            if (selectedRole) {
                filters.roleId = selectedRole
            }

            const data = await userApi.getUsers(filters)
            setUsers(Array.isArray(data) ? data : [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load users')
        } finally {
            setIsLoading(false)
        }
    }

    // Load users on mount and when filters change
    useEffect(() => {
        fetchUsers()
    }, [searchTerm, selectedRole])

    // Handle delete user
    const handleDelete = async (userId: number) => {
        if (!confirm(`Are you sure you want to delete user "${users.find(u => u.userId === userId)?.name}"?`)) {
            return
        }

        setIsDeleting(userId)
        try {
            await userApi.deleteUser(userId)
            await fetchUsers() // Refresh list
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete user')
        } finally {
            setIsDeleting(null)
        }
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
        <div>
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-[#487749]">
                        User Management
                    </h1>
                    <p className="text-sm text-[#757575] mt-1">
                        Manage system users and their access
                    </p>
                </div>
                {canCreateUsers && (
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Create User
                    </Button>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-[#E0E0E0] p-4 mb-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Input
                            label="Search Users"
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            rightIcon={<Search className="w-4 h-4 text-[#757575]" />}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#487749] mb-2">
                            Filter by Role
                        </label>
                        <select
                            value={selectedRole || ''}
                            onChange={e =>
                                setSelectedRole(
                                    e.target.value ? parseInt(e.target.value) : undefined
                                )
                            }
                            className="w-full h-12 px-4 py-3 border border-[#E0E0E0] rounded-xl bg-[#FAF9F6] text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                        >
                            <option value="">All Roles</option>
                            {Object.values(ROLE_MAP).map(role => (
                                <option key={role.id} value={role.id}>
                                    {role.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-[#E0E0E0] shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#487749]"></div>
                        <p className="mt-4 text-[#757575]">Loading users...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="p-12 text-center text-[#757575]">
                        <p>No users found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#F5F5F5] border-b border-[#E0E0E0]">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#487749] uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#487749] uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#487749] uppercase tracking-wider">
                                        Phone
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#487749] uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#487749] uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#487749] uppercase tracking-wider">
                                        Last Login
                                    </th>
                                    {canCreateUsers && (
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-[#487749] uppercase tracking-wider">
                                            Actions
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E0E0E0]">
                                {users.map(user => (
                                    <tr
                                        key={user.userId}
                                        className="hover:bg-[#FAF9F6] transition-colors"
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
                                                {ROLE_MAP[user.roleName]?.label ?? user.roleName ?? '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#757575]">
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#757575]">
                                            {formatDate(user.lastLoginAt)}
                                        </td>
                                        {canCreateUsers && (
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            // TODO: Implement edit
                                                            alert('Edit functionality coming soon')
                                                        }}
                                                        className="p-2 rounded-lg hover:bg-[#F5F5F5] text-[#757575] hover:text-[#487749] transition-colors"
                                                        aria-label="Edit user"
                                                        title="Edit user"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user.userId)}
                                                        disabled={isDeleting === user.userId}
                                                        className="p-2 rounded-lg hover:bg-red-50 text-[#757575] hover:text-red-600 transition-colors disabled:opacity-50"
                                                        aria-label="Delete user"
                                                        title="Delete user"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
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

            {/* Create User Modal */}
            <CreateUserModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    fetchUsers() // Refresh user list after creation
                }}
            />
        </div>
    )
}
