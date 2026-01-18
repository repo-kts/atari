import React, { useState, useEffect } from 'react'
import { localStorageService } from '../../../utils/localStorageService'
import { Staff } from '../../../types/staff'
import { Card, CardContent } from '../../ui/Card'
import { exportService } from '../../../utils/exportService'
import { Download, FileSpreadsheet } from 'lucide-react'
import { Button } from '../../ui/Button'

interface EmployeesTabProps {
    kvkId: number
}

export const EmployeesTab: React.FC<EmployeesTabProps> = ({ kvkId }) => {
    const [staff, setStaff] = useState<Staff[]>([])
    const [exporting, setExporting] = useState(false)

    useEffect(() => {
        loadStaff()
    }, [kvkId])

    const loadStaff = () => {
        const staffList = localStorageService.getStaff(kvkId)
        // Load KVK details for each staff member
        const kvks = localStorageService.getKVKDetails()
        const staffWithKvk = staffList.map(s => {
            const kvk = kvks.find(k => k.id === s.kvk_id)
            return { ...s, kvks: kvk }
        })
        setStaff(staffWithKvk)
    }

    const handleExportPDF = async () => {
        setExporting(true)
        try {
            await exportService.exportToPDF(
                staff,
                'staff',
                { filename: `staff-kvk-${kvkId}-${new Date().getTime()}.pdf` }
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
                staff,
                'staff',
                `staff-kvk-${kvkId}-${new Date().getTime()}`
            )
        } catch (error) {
            console.error('Export failed:', error)
            alert('Failed to export Excel')
        } finally {
            setExporting(false)
        }
    }

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h3 className="text-xl font-bold text-emerald-700">
                        Employees ({staff.length})
                    </h3>
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

                {staff.length === 0 ? (
                    <p className="text-[#757575] text-center py-8">
                        No employees found
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-emerald-50 border-b border-[#E0E0E0]">
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-700">
                                        Staff Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-700">
                                        Post
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-700">
                                        Mobile
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-700">
                                        Email
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-700">
                                        Discipline
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-700">
                                        Job Type
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-700">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {staff.map(member => (
                                    <tr
                                        key={member.id}
                                        className="border-b border-[#E0E0E0] hover:bg-[#FAFAFA]"
                                    >
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
                                                <span className="px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-xl">
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
    )
}
