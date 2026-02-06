import React, { useEffect, useState } from 'react'
import { DynamicTablePage, TableColumn, ButtonOption } from '../../common/DynamicTablePage'
import { getMockEquipmentList } from '../../../mocks/kvkMockData'
import { Download, FileSpreadsheet, Plus } from 'lucide-react'
import { localStorageService, EquipmentRecord } from '../../../utils/localStorageService'
import { useAuthStore } from '../../../stores/authStore'
import { Modal } from '../../ui/Modal'
import { Input } from '../../ui/Input'

export const EquipmentList: React.FC = () => {
    const { hasPermission } = useAuthStore()
    const canAdd = hasPermission('ADD')
    const canEdit = hasPermission('EDIT')
    const canDelete = hasPermission('DELETE')

    const [data, setData] = useState<EquipmentRecord[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editing, setEditing] = useState<EquipmentRecord | null>(null)
    const [form, setForm] = useState<Partial<EquipmentRecord>>({})

    useEffect(() => {
        load()
    }, [])

    const load = () => {
        const stored = localStorageService.getEquipmentsList()
        if (stored.length > 0) {
            setData(stored)
        } else {
            setData(getMockEquipmentList() as unknown as EquipmentRecord[])
        }
    }

    const handleAdd = () => {
        setEditing(null)
        setForm({
            year: new Date().getFullYear(),
            kvk_name: '',
            equipment_name: '',
            status: '',
        })
        setIsModalOpen(true)
    }

    const handleEdit = (row: EquipmentRecord) => {
        setEditing(row)
        setForm(row)
        setIsModalOpen(true)
    }

    const handleDelete = (row: EquipmentRecord) => {
        if (confirm('Delete this equipment?')) {
            localStorageService.deleteEquipment(row.id)
            load()
        }
    }

    const handleFormChange = (field: keyof EquipmentRecord, value: string) => {
        setForm(prev => ({
            ...prev,
            [field]: field === 'year' ? Number(value) || 0 : value,
        }))
    }

    const handleFormSubmit = () => {
        if (!form.kvk_name || !form.equipment_name) {
            alert('KVK Name and Equipment Name are required')
            return
        }

        if (editing) {
            localStorageService.updateEquipment(editing.id, {
                year: form.year || new Date().getFullYear(),
                kvk_name: form.kvk_name!,
                equipment_name: form.equipment_name!,
                status: form.status || '',
            })
        } else {
            localStorageService.saveEquipment({
                id: Date.now(),
                year: form.year || new Date().getFullYear(),
                kvk_name: form.kvk_name!,
                equipment_name: form.equipment_name!,
                status: form.status || '',
            })
        }

        setIsModalOpen(false)
        load()
    }

    const columns: TableColumn[] = [
        { key: 'year', label: 'Year', sortable: true },
        { key: 'kvk_name', label: 'KVK Name', sortable: true },
        { key: 'equipment_name', label: 'Equipment Name', sortable: true },
        { key: 'status', label: 'Present Status', sortable: true },
    ]

    const buttons: ButtonOption[] = [
        { label: 'Download Report', icon: <Download className="w-4 h-4" />, onClick: () => { } },
        { label: 'Download Excel Report', icon: <FileSpreadsheet className="w-4 h-4" />, onClick: () => { } },
        ...(canAdd
            ? [{
                label: 'Add Equipment',
                icon: <Plus className="w-4 h-4" />,
                onClick: handleAdd,
                variant: 'primary',
            } as ButtonOption]
            : []),
    ]

    return (
        <>
            <DynamicTablePage
                title="View Equipment Details"
                description="Equipment inventory by KVK"
                columns={columns}
                data={data}
                buttonOptions={buttons}
                showTabs={false}
                showBreadcrumbs={false}
                showBack={true}
                onEdit={canEdit ? handleEdit : undefined}
                onDelete={canDelete ? handleDelete : undefined}
            />

            {(canAdd || canEdit) && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={editing ? 'Edit Equipment' : 'Add Equipment'}
                    size="lg"
                >
                    <div className="space-y-4">
                        <Input
                            label="Year"
                            type="number"
                            value={String(form.year ?? new Date().getFullYear())}
                            onChange={e => handleFormChange('year', e.target.value)}
                        />
                        <Input
                            label="KVK Name"
                            value={String(form.kvk_name ?? '')}
                            onChange={e => handleFormChange('kvk_name', e.target.value)}
                        />
                        <Input
                            label="Equipment Name"
                            value={String(form.equipment_name ?? '')}
                            onChange={e => handleFormChange('equipment_name', e.target.value)}
                        />
                        <Input
                            label="Present Status"
                            value={String(form.status ?? '')}
                            onChange={e => handleFormChange('status', e.target.value)}
                        />

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                className="px-4 py-2 rounded-xl border border-[#E0E0E0] text-sm"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 rounded-xl bg-[#487749] text-white text-sm"
                                onClick={handleFormSubmit}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    )
}
