import React, { useEffect, useState } from 'react'
import { DynamicTablePage, TableColumn, ButtonOption } from '../../common/DynamicTablePage'
import { getMockInfrastructureList } from '../../../mocks/kvkMockData'
import { Download, FileSpreadsheet, Plus } from 'lucide-react'
import { localStorageService, InfrastructureRecord } from '../../../utils/localStorageService'
import { useAuthStore } from '../../../stores/authStore'
import { Modal } from '../../ui/Modal'
import { Input } from '../../ui/Input'

export const InfrastructureList: React.FC = () => {
    const { hasPermission } = useAuthStore()
    const canAdd = hasPermission('ADD')
    const canEdit = hasPermission('EDIT')
    const canDelete = hasPermission('DELETE')
    const [data, setData] = useState<InfrastructureRecord[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editing, setEditing] = useState<InfrastructureRecord | null>(null)
    const [form, setForm] = useState<Partial<InfrastructureRecord>>({})

    useEffect(() => {
        load()
    }, [])

    const load = () => {
        const stored = localStorageService.getInfrastructureList()
        if (stored.length > 0) {
            setData(stored)
        } else {
            setData(getMockInfrastructureList() as unknown as InfrastructureRecord[])
        }
    }

    const handleAdd = () => {
        setEditing(null)
        setForm({
            kvk_name: '',
            infrastructure: '',
            not_started: 'No',
            plinth: 'No',
            lintel: 'No',
            roof: 'No',
            total_completed: 'No',
            plinth_area: '0',
            under_use: 'No',
        })
        setIsModalOpen(true)
    }

    const handleEdit = (row: InfrastructureRecord) => {
        setEditing(row)
        setForm(row)
        setIsModalOpen(true)
    }

    const handleDelete = (row: InfrastructureRecord) => {
        if (confirm('Delete this infrastructure record?')) {
            localStorageService.deleteInfrastructure(row.id)
            load()
        }
    }

    const handleFormChange = (field: keyof InfrastructureRecord, value: string) => {
        setForm(prev => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleFormSubmit = () => {
        if (!form.kvk_name || !form.infrastructure) {
            alert('KVK Name and Infrastructure are required')
            return
        }

        const payload: InfrastructureRecord = {
            id: editing?.id || Date.now(),
            kvk_name: form.kvk_name!,
            infrastructure: form.infrastructure!,
            not_started: form.not_started || 'No',
            plinth: form.plinth || 'No',
            lintel: form.lintel || 'No',
            roof: form.roof || 'No',
            total_completed: form.total_completed || 'No',
            plinth_area: form.plinth_area || '0',
            under_use: form.under_use || 'No',
        }

        if (editing) {
            localStorageService.updateInfrastructure(editing.id, payload)
        } else {
            localStorageService.saveInfrastructure(payload)
        }

        setIsModalOpen(false)
        load()
    }

    const columns: TableColumn[] = [
        { key: 'kvk_name', label: 'KVK Name', sortable: true },
        { key: 'infrastructure', label: 'Name of Infrastructure', sortable: true },
        { key: 'not_started', label: 'Not Yet Started', sortable: true },
        { key: 'plinth', label: 'Completed upto plinth level', sortable: true },
        { key: 'lintel', label: 'Completed upto lintel level', sortable: true },
        { key: 'roof', label: 'Completed upto roof level', sortable: true },
        { key: 'total_completed', label: 'Totally Completed', sortable: true },
        { key: 'plinth_area', label: 'Plinth Area(m²)', sortable: true },
        { key: 'under_use', label: 'Under use', sortable: true },
    ]

    const buttons: ButtonOption[] = [
        { label: 'Download Report', icon: <Download className="w-4 h-4" />, onClick: () => {} },
        { label: 'Download Excel Report', icon: <FileSpreadsheet className="w-4 h-4" />, onClick: () => {} },
        ...(canAdd
            ? [{
                label: 'Add Infrastructure',
                icon: <Plus className="w-4 h-4" />,
                onClick: handleAdd,
                variant: 'primary',
            } as ButtonOption]
            : []),
    ]

    return (
        <>
            <DynamicTablePage
                title="Infrastructure Details"
                description="KVK infrastructure status"
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
                    title={editing ? 'Edit Infrastructure' : 'Add Infrastructure'}
                    size="lg"
                >
                    <div className="space-y-4">
                        <Input
                            label="KVK Name"
                            value={String(form.kvk_name ?? '')}
                            onChange={e => handleFormChange('kvk_name', e.target.value)}
                        />
                        <Input
                            label="Name of Infrastructure"
                            value={String(form.infrastructure ?? '')}
                            onChange={e => handleFormChange('infrastructure', e.target.value)}
                        />
                        <Input
                            label="Not Yet Started (Yes/No)"
                            value={String(form.not_started ?? 'No')}
                            onChange={e => handleFormChange('not_started', e.target.value)}
                        />
                        <Input
                            label="Completed upto plinth level (Yes/No)"
                            value={String(form.plinth ?? 'No')}
                            onChange={e => handleFormChange('plinth', e.target.value)}
                        />
                        <Input
                            label="Completed upto lintel level (Yes/No)"
                            value={String(form.lintel ?? 'No')}
                            onChange={e => handleFormChange('lintel', e.target.value)}
                        />
                        <Input
                            label="Completed upto roof level (Yes/No)"
                            value={String(form.roof ?? 'No')}
                            onChange={e => handleFormChange('roof', e.target.value)}
                        />
                        <Input
                            label="Totally Completed (Yes/No)"
                            value={String(form.total_completed ?? 'No')}
                            onChange={e => handleFormChange('total_completed', e.target.value)}
                        />
                        <Input
                            label="Plinth Area(m²)"
                            value={String(form.plinth_area ?? '0')}
                            onChange={e => handleFormChange('plinth_area', e.target.value)}
                        />
                        <Input
                            label="Under use (Yes/No)"
                            value={String(form.under_use ?? 'No')}
                            onChange={e => handleFormChange('under_use', e.target.value)}
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
