import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../stores/authStore'
import { localStorageService } from '../../../utils/localStorageService'
import { exportService } from '../../../utils/exportService'
import { KVKDetails } from '../../../types/kvk'
import { DynamicTablePage, TableColumn, ButtonOption } from '../../common/DynamicTablePage'
import { Download, FileSpreadsheet } from 'lucide-react'
import { getMockKVKs } from '../../../mocks/kvkMockData'

export const KVKListView: React.FC = () => {
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const [kvks, setKvks] = useState<KVKDetails[]>([])
    const [exporting, setExporting] = useState(false)

    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'

    useEffect(() => {
        loadKVKs()
    }, [user])

    const loadKVKs = () => {
        let data: KVKDetails[] = []
        if (isAdmin) {
            data = localStorageService.getKVKDetails()
        } else if (user?.kvk_id) {
            data = localStorageService.getKVKDetails(user.kvk_id)
        }

        if (!data || data.length === 0) {
            data = getMockKVKs()
        }

        setKvks(data)
    }

    const handleDelete = (kvk: KVKDetails) => {
        if (confirm('Are you sure you want to delete this KVK?')) {
            localStorageService.deleteKVKDetails(kvk.id)
            loadKVKs()
        }
    }

    const handleView = (row: KVKDetails) => {
        navigate(`/forms/about-kvk/view-kvks/${row.id}`)
    }

    const handleEdit = (_row: KVKDetails) => {
        navigate(`/forms/about-kvk/details`)
    }

    const handleExportPDF = async () => {
        setExporting(true)
        try {
            await exportService.exportToPDF(
                kvks,
                'kvk',
                { filename: `kvk-list-${new Date().getTime()}.pdf` }
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
                kvks,
                'kvk',
                `kvk-list-${new Date().getTime()}`
            )
        } catch (error) {
            console.error('Export failed:', error)
            alert('Failed to export Excel')
        } finally {
            setExporting(false)
        }
    }

    const columns: TableColumn[] = [
        { key: 'kvk_name', label: 'KVK Name', sortable: true },
        { key: 'state', label: 'State', sortable: true, render: (_value, row) => row.state?.state_name || '-' },
        { key: 'district', label: 'District', sortable: true, render: (_value, row) => row.district?.district_name || '-' },
        { key: 'university', label: 'University', sortable: true, render: (_value, row) => row.university?.university_name || '-' },
        { key: 'mobile', label: 'Mobile', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
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
            title="KVK List"
            description="View and manage all KVKs"
            columns={columns}
            data={kvks}
            buttonOptions={buttonOptions}
            onView={isAdmin ? handleView : undefined}
            onEdit={!isAdmin ? handleEdit : undefined}
            onDelete={handleDelete}
            searchPlaceholder="Search by KVK name, email, mobile, state, district..."
            showBreadcrumbs={true}
            showTabs={true}
        />
    )
}
