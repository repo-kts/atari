import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../../stores/authStore'
import { localStorageService } from '../../../utils/localStorageService'
import { Staff } from '../../../types/staff'
import { Card, CardContent } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { exportService } from '../../../utils/exportService'
import { searchService } from '../../../utils/searchService'
import { Plus, Search, Edit2, Trash2, Download, FileSpreadsheet } from 'lucide-react'

export const StaffList: React.FC = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useAuthStore()
    const [staff, setStaff] = useState<Staff[]>([])
    const [filteredStaff, setFilteredStaff] = useState<Staff[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [exporting, setExporting] = useState(false)

    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'
    const isTransferredPage = location.pathname.includes('staff-transferred')

    // Determine the add path based on current location
    const getAddPath = () => {
        if (location.pathname.includes('/forms/about-kvk/')) {
            return '/forms/about-kvk/employee-details/add'
        }
        return '/kvk/staff/add'
    }

    useEffect(() => {
        loadStaff()
    }, [user])

    useEffect(() => {
        if (searchQuery.trim()) {
            const filtered = searchService.searchStaff(
                searchQuery,
                isAdmin ? undefined : user?.kvk_id
            )
            setFilteredStaff(applyTransferredFilter(filtered))
        } else {
            setFilteredStaff(applyTransferredFilter(staff))
        }
    }, [searchQuery, staff, user, isAdmin, isTransferredPage])

    const applyTransferredFilter = (list: Staff[]) => {
        if (isTransferredPage) {
            return list.filter(s => s.is_transferred === 1)
        }
        return list.filter(s => s.is_transferred === 0)
    }

    const loadStaff = () => {
        // For admin/super_admin, show all staff
        // For KVK users, show only their KVK's staff
        if (isAdmin) {
            const allStaff = localStorageService.getStaff()
            // Load KVK details for each staff member
            const kvks = localStorageService.getKVKDetails()
            const staffWithKvk = allStaff.map(s => {
                const kvk = kvks.find(k => k.id === s.kvk_id)
                return { ...s, kvks: kvk }
            })
            setStaff(staffWithKvk)
            setFilteredStaff(applyTransferredFilter(staffWithKvk))
        } else if (user?.kvk_id) {
            const staffList = localStorageService.getStaff(user.kvk_id)
            setStaff(staffList)
            setFilteredStaff(applyTransferredFilter(staffList))
        }
    }

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this staff member?')) {
            localStorageService.deleteStaff(id)
            loadStaff()
        }
    }

    const handleTransfer = (id: number) => {
        if (confirm('Mark this staff member as transferred?')) {
            localStorageService.transferStaff(id)
            loadStaff()
        }
    }

    const handleExportPDF = async () => {
        setExporting(true)
        try {
            await exportService.exportToPDF(
                filteredStaff,
                'staff',
                { filename: `staff-${new Date().getTime()}.pdf` }
            )
        } catch (error) {
            console.error('Export failed:', error)
            alert('Failed to export PDF')
        } finally {
            setExporting(false)
        }
    }

    const handleExportExcel = async () => {
        setExporting(true)
        try {
            await exportService.exportToExcel(
                filteredStaff,
                'staff',
                `staff-${new Date().getTime()}`
            )
        } catch (error) {
            console.error('Export failed:', error)
            alert('Failed to export Excel')
        } finally {
            setExporting(false)
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <h2 className="text-2xl font-bold text-[#487749]">
                            Staff Members
                        </h2>
                        <div className="flex gap-2 flex-wrap">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExportPDF}
                                disabled={exporting}
                                className="flex items-center"
                            >
                                <Download className="w-4 h-4 mr-2 shrink-0" />
                                <span>Export PDF</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExportExcel}
                                disabled={exporting}
                                className="flex items-center"
                            >
                                <FileSpreadsheet className="w-4 h-4 mr-2 shrink-0" />
                                <span>Export Excel</span>
                            </Button>
                            {!isAdmin && !isTransferredPage && (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => navigate(getAddPath())}
                                    className="flex items-center"
                                >
                                    <Plus className="w-4 h-4 mr-2 shrink-0" />
                                    <span>Add Staff</span>
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#757575] w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name, email, mobile, post..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full h-12 pl-10 pr-4 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8F5E9]0/20 focus:border-[#487749] bg-white text-[#212121]"
                            />
                        </div>
                    </div>

                    {filteredStaff.length === 0 ? (
                        <p className="text-[#757575] text-center py-8">
                            No staff members found
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-[#E8F5E9] border-b border-[#E0E0E0]">
                                        {isAdmin && (
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-[#487749]">
                                                KVK Name
                                            </th>
                                        )}
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-[#487749]">
                                            Staff Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-[#487749]">
                                            Post
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-[#487749]">
                                            Mobile
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-[#487749]">
                                            Email
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-[#487749]">
                                            Discipline
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-[#487749]">
                                            Job Type
                                        </th>
                                        {!isAdmin && !isTransferredPage && (
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-[#487749]">
                                                Actions
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStaff.map(member => (
                                        <tr
                                            key={member.id}
                                            className="border-b border-[#E0E0E0] hover:bg-[#FAFAFA]"
                                        >
                                            {isAdmin && (
                                                <td className="px-4 py-3 text-[#212121]">
                                                    {member.kvks?.kvk_name || '-'}
                                                </td>
                                            )}
                                            <td className="px-4 py-3 text-[#212121]">
                                                {member.staff_name}
                                            </td>
                                            <td className="px-4 py-3 text-[#212121]">
                                                {member.post?.post_name || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-[#212121]">
                                                {member.mobile}
                                            </td>
                                            <td className="px-4 py-3 text-[#212121]">
                                                {member.email}
                                            </td>
                                                <td className="px-4 py-3 text-[#212121]">
                                                {member.discipline}
                                            </td>
                                            <td className="px-4 py-3 text-[#212121]">
                                                {member.job_type}
                                            </td>
                                            {!isAdmin && !isTransferredPage && (
                                                <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => alert('Edit feature coming soon')}
                                                        className="p-2 text-[#487749] hover:bg-[#E8F5E9] rounded-xl transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    {member.is_transferred === 0 && (
                                                        <button
                                                            onClick={() => handleTransfer(member.id)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                                            title="Transfer"
                                                        >
                                                            Transfer
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(member.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                                        title="Delete"
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
                </CardContent>
            </Card>
        </div>
    )
}
