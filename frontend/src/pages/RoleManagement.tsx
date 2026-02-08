import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { userApi, RoleInfo, getRoleLabel } from '../services/userApi'
import { Button } from '../components/ui/Button'
import { Plus, MoreVertical, Pencil, Trash2, Shield } from 'lucide-react'

const PAGE_SIZE = 10

export const RoleManagement: React.FC = () => {
    const navigate = useNavigate()
    const [roles, setRoles] = useState<RoleInfo[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [page, setPage] = useState(1)
    const [openActionId, setOpenActionId] = useState<number | null>(null)
    const [sortBy, setSortBy] = useState<'roleId' | 'roleName'>('roleId')
    const [sortAsc, setSortAsc] = useState(true)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const fetchRoles = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await userApi.getRoles()
            setRoles(data ?? [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load roles')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchRoles()
    }, [])

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

    const handleAddRole = () => {
        // Placeholder – can open Add Role modal later
        alert('Add Role – coming soon')
    }

    const handleAddEditPermission = (role: RoleInfo) => {
        setOpenActionId(null)
        navigate(`/role-view/${role.roleId}/permissions`)
    }

    const handleEdit = (role: RoleInfo) => {
        setOpenActionId(null)
        alert(`Edit "${getRoleLabel(role.roleName)}" – coming soon`)
    }

    const handleDelete = (role: RoleInfo) => {
        setOpenActionId(null)
        if (!confirm(`Delete role "${getRoleLabel(role.roleName)}"? This may affect existing users.`)) return
        alert('Delete role – coming soon (backend not implemented yet)')
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-semibold text-[#212121]">View Roles</h1>
                <Button
                    onClick={handleAddRole}
                    className="flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Role
                </Button>
            </div>

            {/* Search */}
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                <label htmlFor="role-search" className="text-sm font-medium text-[#212121]">
                    Search:
                </label>
                <input
                    id="role-search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setPage(1)
                    }}
                    placeholder="Search by role name..."
                    className="max-w-xs w-full h-10 px-3 py-2 border border-[#E0E0E0] rounded-lg bg-white text-[#212121] placeholder:text-[#9E9E9E] focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749]"
                />
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {error}
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl border border-[#E0E0E0] shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#487749]" />
                        <p className="mt-4 text-[#757575]">Loading roles...</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-[#E8F5E9] border-b border-[#E0E0E0]">
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#487749] uppercase tracking-wider cursor-pointer hover:bg-[#C8E6C9]/50"
                                            onClick={() => toggleSort('roleId')}
                                        >
                                            <span className="inline-flex items-center gap-1">
                                                S.No.
                                                <span className="text-[#757575]">↕</span>
                                            </span>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#487749] uppercase tracking-wider cursor-pointer hover:bg-[#C8E6C9]/50"
                                            onClick={() => toggleSort('roleName')}
                                        >
                                            <span className="inline-flex items-center gap-1">
                                                Name
                                                <span className="text-[#757575]">↕</span>
                                            </span>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#487749] uppercase tracking-wider">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E0E0E0]">
                                    {pageRoles.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-[#757575]">
                                                No roles found
                                            </td>
                                        </tr>
                                    ) : (
                                        pageRoles.map((role, index) => (
                                            <tr
                                                key={role.roleId}
                                                className={index % 2 === 0 ? 'bg-white' : 'bg-[#F1F8E9]/30'}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#212121]">
                                                    {start + index + 1}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#212121]">
                                                    {getRoleLabel(role.roleName)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="relative" ref={openActionId === role.roleId ? dropdownRef : null}>
                                                        <button
                                                            type="button"
                                                            onClick={() => setOpenActionId(openActionId === role.roleId ? null : role.roleId)}
                                                            className="p-2 rounded-lg bg-[#2196F3] text-white hover:bg-[#1976D2] focus:outline-none focus:ring-2 focus:ring-[#2196F3]/50"
                                                            aria-label="Actions"
                                                        >
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>
                                                        {openActionId === role.roleId && (
                                                            <div className="absolute left-0 top-full mt-1 z-20 min-w-[180px] py-1 bg-white rounded-xl shadow-lg border border-[#E0E0E0]">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleAddEditPermission(role)}
                                                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#212121] hover:bg-[#F5F5F5] text-left"
                                                                >
                                                                    <Shield className="w-4 h-4 text-[#757575]" />
                                                                    Add/Edit Permission
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleEdit(role)}
                                                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#212121] hover:bg-[#F5F5F5] text-left"
                                                                >
                                                                    <Pencil className="w-4 h-4 text-[#757575]" />
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDelete(role)}
                                                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                    Delete
                                                                </button>
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
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-[#E0E0E0] bg-[#FAFAFA]">
                                <p className="text-sm text-[#757575]">
                                    Showing {start + 1} to {end} of {total} entries
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page <= 1}
                                    >
                                        Previous
                                    </Button>
                                    <span className="flex items-center gap-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                            <Button
                                                key={p}
                                                variant={p === page ? 'primary' : 'outline'}
                                                size="sm"
                                                className="min-w-10"
                                                onClick={() => setPage(p)}
                                            >
                                                {p}
                                            </Button>
                                        ))}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page >= totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
