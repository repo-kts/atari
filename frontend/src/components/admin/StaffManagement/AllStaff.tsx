import React, { useState, useEffect } from 'react'
import { localStorageService } from '../../../utils/localStorageService'
import { searchService } from '../../../utils/searchService'
import { exportService } from '../../../utils/exportService'
import { Staff } from '../../../types/staff'
import { Card, CardContent } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { Search, Download, FileSpreadsheet } from 'lucide-react'

export const AllStaff: React.FC = () => {
    const [staff, setStaff] = useState<Staff[]>([])
    const [filteredStaff, setFilteredStaff] = useState<Staff[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [jobTypeFilter, setJobTypeFilter] = useState<string>('')
    const [transferFilter, setTransferFilter] = useState<string>('')
    const [exporting, setExporting] = useState(false)

    useEffect(() => {
        loadStaff()
    }, [])

    useEffect(() => {
        let filtered = staff

        if (searchQuery.trim()) {
            filtered = searchService.searchStaff(searchQuery, undefined, {
                job_type: jobTypeFilter || undefined,
                is_transferred: transferFilter === 'transferred' ? true : transferFilter === 'active' ? false : undefined,
            })
        } else {
            filtered = staff
            if (jobTypeFilter) {
                filtered = filtered.filter(s => s.job_type === jobTypeFilter)
            }
            if (transferFilter === 'transferred') {
                filtered = filtered.filter(s => s.is_transferred === 1)
            } else if (transferFilter === 'active') {
                filtered = filtered.filter(s => s.is_transferred === 0)
            }
        }

        setFilteredStaff(filtered)
    }, [searchQuery, jobTypeFilter, transferFilter, staff])

    const loadStaff = () => {
        const allStaff = localStorageService.getStaff()
        // Load KVK details for each staff member
        const kvks = localStorageService.getKVKDetails()
        const staffWithKvk = allStaff.map(s => {
            const kvk = kvks.find(k => k.id === s.kvk_id)
            return { ...s, kvks: kvk }
        })
        setStaff(staffWithKvk)
        setFilteredStaff(staffWithKvk)
    }

    const handleExportPDF = async () => {
        setExporting(true)
        try {
            await exportService.exportToPDF(
                filteredStaff,
                'staff',
                { filename: `all-staff-${new Date().getTime()}.pdf` }
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
                `all-staff-${new Date().getTime()}`
            )
        } catch (error) {
            console.error('Export failed:', error)
            alert('Failed to export Excel')
        } finally {
            setExporting(false)
        }
    }

    const jobTypes = Array.from(new Set(staff.map(s => s.job_type)))

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <h2 className="text-2xl font-bold text-[#487749]">
                            All Staff Members
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
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                        <div>
                            <select
                                value={jobTypeFilter}
                                onChange={e => setJobTypeFilter(e.target.value)}
                                className="w-full h-12 px-4 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8F5E9]0/20 focus:border-[#487749] bg-white text-[#212121]"
                            >
                                <option value="">All Job Types</option>
                                {jobTypes.map(type => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <select
                                value={transferFilter}
                                onChange={e => setTransferFilter(e.target.value)}
                                className="w-full h-12 px-4 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8F5E9]0/20 focus:border-[#487749] bg-white text-[#212121]"
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="transferred">Transferred</option>
                            </select>
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
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-[#487749]">
                                            KVK Name
                                        </th>
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
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-[#487749]">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStaff.map(member => (
                                        <tr
                                            key={member.id}
                                            className="border-b border-[#E0E0E0] hover:bg-[#FAFAFA]"
                                        >
                                            <td className="px-4 py-3 text-[#212121]">
                                                {member.kvks?.kvk_name || '-'}
                                            </td>
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
                                            <td className="px-4 py-3 text-[#212121]">
                                                {member.is_transferred === 1 ? (
                                                    <span className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-xl">
                                                        Transferred
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs font-medium bg-[#E8F5E9] text-[#487749] rounded-xl">
                                                        Active
                                                    </span>
                                                )}
                                            </td>
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
