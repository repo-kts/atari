import React, { useState, useEffect } from 'react'
import { localStorageService } from '../../../utils/localStorageService'
import { Staff } from '../../../types/staff'
import { exportService } from '../../../utils/exportService'
import { DynamicTablePage, TableColumn, ButtonOption } from '../../common/DynamicTablePage'
import { Download, FileSpreadsheet } from 'lucide-react'
import { getMockStaff, getMockKVKs } from '../../../mocks/kvkMockData'

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
        let staffList = localStorageService.getStaff(kvkId)
        let kvks = localStorageService.getKVKDetails()

        if (!staffList || staffList.length === 0) {
            staffList = getMockStaff(kvkId)
        }
        if (!kvks || kvks.length === 0) {
            kvks = getMockKVKs()
        }
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

    const columns: TableColumn[] = [
        { key: 'staff_name', label: 'Staff Name', sortable: true },
        { key: 'post', label: 'Post', sortable: true, render: (value, row) => row.post?.post_name || '-' },
        { key: 'mobile', label: 'Mobile', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'discipline', label: 'Discipline', sortable: true },
        { key: 'job_type', label: 'Job Type', sortable: true },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (value, row) => (
                row.is_transferred === 1 ? (
                                                <span className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-xl">
                                                    Transferred
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs font-medium bg-[#E8F5E9] text-[#487749] rounded-xl">
                                                    Active
                                                </span>
                )
            ),
        },
    ]

    const buttonOptions: ButtonOption[] = [
        {
            label: 'Export PDF',
            icon: <Download className="w-4 h-4" />,
            onClick: handleExportPDF,
            disabled: exporting,
        },
        {
            label: 'Export Excel',
            icon: <FileSpreadsheet className="w-4 h-4" />,
            onClick: handleExportExcel,
            disabled: exporting,
        },
    ]

    return (
        <DynamicTablePage
            title={`Employees (${staff.length})`}
            description="Manage employee details for this KVK"
            columns={columns}
            data={staff}
            buttonOptions={buttonOptions}
            showBreadcrumbs={false}
            showTabs={false}
            showBack={false}
        />
    )
}
