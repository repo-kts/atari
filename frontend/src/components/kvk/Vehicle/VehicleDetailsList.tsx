import React, { useEffect, useState } from 'react'
import { DynamicTablePage, TableColumn, ButtonOption } from '../../common/DynamicTablePage'
import { getMockVehicleDetails } from '../../../mocks/kvkMockData'
import { Download, FileSpreadsheet, Plus } from 'lucide-react'
import { localStorageService, VehicleRecord } from '../../../utils/localStorageService'
import { useAuthStore } from '../../../stores/authStore'
import { Modal } from '../../ui/Modal'
import { Input } from '../../ui/Input'

export const VehicleDetailsList: React.FC = () => {
    const { user } = useAuthStore()
    const isKvkUser = user?.role !== 'admin' && user?.role !== 'super_admin'
    const [data, setData] = useState<VehicleRecord[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editing, setEditing] = useState<VehicleRecord | null>(null)
    const [form, setForm] = useState<Partial<VehicleRecord>>({})

    useEffect(() => {
        load()
    }, [])

    const load = () => {
        const stored = localStorageService.getVehiclesList()
        if (stored.length > 0) {
            setData(stored)
        } else {
            setData(getMockVehicleDetails() as unknown as VehicleRecord[])
        }
    }

    const handleAdd = () => {
        setEditing(null)
        setForm({
            year: new Date().getFullYear(),
            kvk_name: '',
            vehicle_name: '',
            registration_no: '',
            total_run: 0,
            status: '',
        })
        setIsModalOpen(true)
    }

    const handleEdit = (row: VehicleRecord) => {
        setEditing(row)
        setForm(row)
        setIsModalOpen(true)
    }

    const handleDelete = (row: VehicleRecord) => {
        if (confirm('Delete this vehicle?')) {
            localStorageService.deleteVehicle(row.id)
            load()
        }
    }

    const handleFormChange = (field: keyof VehicleRecord, value: string) => {
        setForm(prev => ({
            ...prev,
            [field]: field === 'year' || field === 'total_run' ? Number(value) || 0 : value,
        }))
    }

    const handleFormSubmit = () => {
        if (!form.kvk_name || !form.vehicle_name) {
            alert('KVK Name and Vehicle Name are required')
            return
        }

        if (editing) {
            localStorageService.updateVehicle(editing.id, {
                year: form.year || new Date().getFullYear(),
                kvk_name: form.kvk_name!,
                vehicle_name: form.vehicle_name!,
                registration_no: form.registration_no || '',
                total_run: form.total_run ?? 0,
                status: form.status || '',
            })
        } else {
            localStorageService.saveVehicle({
                id: Date.now(),
                year: form.year || new Date().getFullYear(),
                kvk_name: form.kvk_name!,
                vehicle_name: form.vehicle_name!,
                registration_no: form.registration_no || '',
                total_run: form.total_run ?? 0,
                status: form.status || '',
            })
        }

        setIsModalOpen(false)
        load()
    }

    const columns: TableColumn[] = [
        { key: 'year', label: 'Year', sortable: true },
        { key: 'kvk_name', label: 'KVK Name', sortable: true },
        { key: 'vehicle_name', label: 'Vehicle Name', sortable: true },
        { key: 'registration_no', label: 'Registration No.', sortable: true },
        { key: 'total_run', label: 'Total Run(km/hrs)', sortable: true },
        { key: 'status', label: 'Present Status', sortable: true },
    ]

    const buttons: ButtonOption[] = [
        { label: 'Download Report', icon: <Download className="w-4 h-4" />, onClick: () => {} },
        { label: 'Download Excel Report', icon: <FileSpreadsheet className="w-4 h-4" />, onClick: () => {} },
        ...(isKvkUser
            ? [{
                label: 'Add Vehicle',
                icon: <Plus className="w-4 h-4" />,
                onClick: handleAdd,
                variant: 'primary',
            } as ButtonOption]
            : []),
    ]

    return (
        <>
            <DynamicTablePage
                title="Vehicle Details"
                description="Detailed vehicle information"
                columns={columns}
                data={data}
                buttonOptions={buttons}
                showTabs={false}
                showBreadcrumbs={false}
                showBack={true}
                onEdit={isKvkUser ? handleEdit : undefined}
                onDelete={isKvkUser ? handleDelete : undefined}
            />

            {isKvkUser && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={editing ? 'Edit Vehicle Details' : 'Add Vehicle Details'}
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
                            label="Vehicle Name"
                            value={String(form.vehicle_name ?? '')}
                            onChange={e => handleFormChange('vehicle_name', e.target.value)}
                        />
                        <Input
                            label="Registration No."
                            value={String(form.registration_no ?? '')}
                            onChange={e => handleFormChange('registration_no', e.target.value)}
                        />
                        <Input
                            label="Total Run (km/hrs)"
                            type="number"
                            value={String(form.total_run ?? 0)}
                            onChange={e => handleFormChange('total_run', e.target.value)}
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
