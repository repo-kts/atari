import React, { useEffect, useState } from 'react'
import { DynamicTablePage, TableColumn, ButtonOption } from '../../common/DynamicTablePage'
import { getMockVehicles } from '../../../mocks/kvkMockData'
import { Download, FileSpreadsheet } from 'lucide-react'

interface VehicleRow {
    id: number
    type: string
    model: string
    registration_no: string
    purchase_year: number
}

interface VehiclesTabProps {
    kvkId: number
}

export const VehiclesTab: React.FC<VehiclesTabProps> = ({ kvkId }) => {
    const [vehicles, setVehicles] = useState<VehicleRow[]>([])
    const [exporting, setExporting] = useState(false)

    useEffect(() => {
        loadVehicles()
    }, [kvkId])

    const loadVehicles = () => {
        const data = getMockVehicles(kvkId)
        setVehicles(data)
    }

    const handleExportPDF = async () => {
        setExporting(true)
        try {
            // Placeholder export
            setTimeout(() => setExporting(false), 300)
        } catch (error) {
            console.error('Export failed:', error)
            setExporting(false)
        }
    }

    const handleExportExcel = async () => {
        setExporting(true)
        try {
            // Placeholder export
            setTimeout(() => setExporting(false), 300)
        } catch (error) {
            console.error('Export failed:', error)
            setExporting(false)
        }
    }

    const columns: TableColumn[] = [
        { key: 'type', label: 'Type', sortable: true },
        { key: 'model', label: 'Model', sortable: true },
        { key: 'registration_no', label: 'Registration No.', sortable: true },
        { key: 'purchase_year', label: 'Purchase Year', sortable: true },
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
            title="Vehicles"
            description="Vehicle details for this KVK"
            columns={columns}
            data={vehicles}
            buttonOptions={buttonOptions}
            showBreadcrumbs={false}
            showTabs={false}
            showBack={false}
        />
    )
}
