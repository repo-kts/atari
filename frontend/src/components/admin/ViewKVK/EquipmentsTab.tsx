import React, { useEffect, useState } from 'react'
import { DynamicTablePage, TableColumn, ButtonOption } from '../../common/DynamicTablePage'
import { getMockEquipments } from '../../../mocks/kvkMockData'
import { Download, FileSpreadsheet } from 'lucide-react'

interface EquipmentRow {
    id: number
    name: string
    category: string
    quantity: number
    condition: string
}

interface EquipmentsTabProps {
    kvkId: number
}

export const EquipmentsTab: React.FC<EquipmentsTabProps> = ({ kvkId }) => {
    const [equipments, setEquipments] = useState<EquipmentRow[]>([])
    const [exporting, setExporting] = useState(false)

    useEffect(() => {
        loadEquipments()
    }, [kvkId])

    const loadEquipments = () => {
        const data = getMockEquipments(kvkId)
        setEquipments(data)
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
        { key: 'name', label: 'Equipment', sortable: true },
        { key: 'category', label: 'Category', sortable: true },
        { key: 'quantity', label: 'Quantity', sortable: true },
        { key: 'condition', label: 'Condition', sortable: true },
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
            title="Equipments"
            description="Equipment details for this KVK"
            columns={columns}
            data={equipments}
            buttonOptions={buttonOptions}
            showBreadcrumbs={false}
            showTabs={false}
            showBack={false}
        />
    )
}
