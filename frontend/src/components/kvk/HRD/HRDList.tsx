import React, { useState, useEffect } from 'react'
import { Plus, Sprout, ChevronsUpDown } from 'lucide-react'
import { Card, CardContent } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { useAuthStore } from '../../../stores/authStore'
import { localStorageService } from '../../../utils/localStorageService'
import { HRDTraining } from '../../../types/hrd'
import { Modal } from '../../ui/Modal'
import { SmartBackButton } from '../../../components/common/SmartBackButton'
import { KVKDetails } from '../../../types/kvk'

// Placeholder components for Add/Edit until fully implemented
const AddHRD = ({ onSuccess, onCancel }: { onSuccess: () => void, onCancel: () => void }) => (
    <div className="p-4">
        <p>Add HRD Training Form Placeholder</p>
        <div className="flex gap-2 mt-4">
            <Button onClick={onSuccess}>Save (Mock)</Button>
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
    </div>
)

const EditHRD = ({ item, onSuccess, onCancel }: { item: HRDTraining, onSuccess: () => void, onCancel: () => void }) => (
    <div className="p-4">
        <p>Edit HRD Training Form Placeholder for {item.course}</p>
        <div className="flex gap-2 mt-4">
            <Button onClick={onSuccess}>Save (Mock)</Button>
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
    </div>
)

export const HRDList: React.FC = () => {
    const { user } = useAuthStore()
    const isAdmin = user?.role === 'super_admin'
    const [items, setItems] = useState<HRDTraining[]>([])
    const [kvks, setKvks] = useState<KVKDetails[]>([])
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<HRDTraining | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    // Filters
    const [reportingYear, setReportingYear] = useState('2026')
    const [selectedKvk, setSelectedKvk] = useState<string>('all')

    useEffect(() => {
        loadData()
        if (isAdmin) {
            setKvks(localStorageService.getKVKDetails())
        }
    }, [user, isAdmin])

    const loadData = () => {
        const data = localStorageService.getHRDList(isAdmin ? undefined : (user?.kvkId ?? undefined))
        setItems(data)
    }

    // Filter logic
    const filteredItems = items.filter(item => {
        const matchesSearch =
            item.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.staff.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.kvk_name.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesKvk = selectedKvk === 'all' || item.kvk_id.toString() === selectedKvk
        const matchesYear = reportingYear === 'all' || item.reporting_year === reportingYear

        return matchesSearch && matchesKvk && matchesYear
    })

    return (
        <div className="space-y-8 p-6 w-full min-w-0">
            <SmartBackButton fallbackPath="/forms/achievements" showBreadcrumbs />

            <div className="flex flex-col gap-6">
                <h1 className="text-2xl font-bold text-[#212121]">HRD Program</h1>

                <div className="flex flex-wrap items-end gap-6">
                    <div className="w-64">
                        <label className="block text-sm font-medium text-[#487749] mb-2">Reporting Year</label>
                        <select
                            value={reportingYear}
                            onChange={(e) => setReportingYear(e.target.value)}
                            className="w-full h-11 px-4 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white text-[#212121]"
                        >
                            <option value="all">All Years</option>
                            <option value="2026">2026</option>
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                        </select>
                    </div>

                    {isAdmin && (
                        <div className="w-64">
                            <label className="block text-sm font-medium text-[#487749] mb-2">KVKs</label>
                            <select
                                value={selectedKvk}
                                onChange={(e) => setSelectedKvk(e.target.value)}
                                className="w-full h-11 px-4 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white text-[#212121]"
                            >
                                <option value="all">All</option>
                                {kvks.map(kvk => (
                                    <option key={kvk.id} value={kvk.id}>{kvk.kvk_name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Button variant="primary" className="h-11 px-6 bg-[#487749] hover:bg-[#3A613B]">
                            Filter
                        </Button>
                        <Button
                            variant="primary"
                            className="h-11 px-6 bg-[#487749] hover:bg-[#3A613B] whitespace-nowrap"
                        >
                            Download Report
                        </Button>
                        <Button
                            variant="primary"
                            className="h-11 px-6 bg-[#487749] hover:bg-[#3A613B] whitespace-nowrap"
                        >
                            Download Excel Report
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-[#212121] whitespace-nowrap">Search:</label>
                        <input
                            type="text"
                            placeholder=""
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-48 h-8 px-3 bg-white border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                        />
                    </div>

                    {!isAdmin && (
                        <Button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-[#487749] hover:bg-[#3A613B] text-white px-6 h-11 rounded-xl flex items-center gap-2 shadow-lg shadow-[#487749]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Plus className="w-5 h-5" />
                            Add Record
                        </Button>
                    )}
                </div>
            </div>

            <Card className="w-full overflow-hidden border-none shadow-xl shadow-gray-200/50 bg-white/80 backdrop-blur-sm rounded-3xl">
                <CardContent className="p-0">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[#D1E1D1] border-b border-[#487749]/10">
                                    <th className="px-6 py-4 text-left text-sm font-bold text-[#374151] tracking-wider whitespace-nowrap">
                                        <div className="flex items-center gap-1.5">S.No. <ChevronsUpDown className="w-3 h-3 text-gray-400" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-[#374151] tracking-wider whitespace-nowrap">
                                        <div className="flex items-center gap-1.5">KVK Name <ChevronsUpDown className="w-3 h-3 text-gray-400" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-[#374151] tracking-wider whitespace-nowrap">
                                        <div className="flex items-center gap-1.5">Staff <ChevronsUpDown className="w-3 h-3 text-gray-400" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-[#374151] tracking-wider whitespace-nowrap">
                                        <div className="flex items-center gap-1.5">Course <ChevronsUpDown className="w-3 h-3 text-gray-400" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-[#374151] tracking-wider whitespace-nowrap">
                                        <div className="flex items-center gap-1.5">Start Date <ChevronsUpDown className="w-3 h-3 text-gray-400" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-[#374151] tracking-wider whitespace-nowrap">
                                        <div className="flex items-center gap-1.5">End Date <ChevronsUpDown className="w-3 h-3 text-gray-400" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-[#374151] tracking-wider whitespace-nowrap">
                                        <div className="flex items-center gap-1.5">Organizer <ChevronsUpDown className="w-3 h-3 text-gray-400" /></div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#487749]/5">
                                {filteredItems.length > 0 ? (
                                    filteredItems.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-[#487749]/5 transition-colors group">
                                            <td className="px-4 py-5 text-sm text-gray-600 font-medium">{index + 1}</td>
                                            <td className="px-4 py-5 text-sm text-gray-600 font-medium">{item.kvk_name}</td>
                                            <td className="px-4 py-5 text-sm font-semibold text-gray-900">{item.staff}</td>
                                            <td className="px-4 py-5 text-sm text-gray-600">{item.course}</td>
                                            <td className="px-4 py-5 text-sm text-gray-600">{item.start_date}</td>
                                            <td className="px-4 py-5 text-sm text-gray-600">{item.end_date}</td>
                                            <td className="px-4 py-5 text-sm text-gray-600">{item.organizer}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                                    <Sprout className="w-8 h-8 text-gray-300" />
                                                </div>
                                                <p className="text-gray-500 font-medium text-lg">No records found</p>
                                                <p className="text-gray-400 text-sm">Try adjusting your filters or add a new record</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add HRD Training Record"
                size="lg"
            >
                <AddHRD
                    onSuccess={() => {
                        // Mock saving
                        const newItem: HRDTraining = {
                            id: Date.now(),
                            kvk_id: user?.kvkId || 1,
                            kvk_name: user?.name || 'Demo KVK',
                            reporting_year: reportingYear === 'all' ? '2026' : reportingYear,
                            staff: 'Dr. John Doe',
                            course: 'Modern Farming Techniques',
                            start_date: '2026-06-15',
                            end_date: '2026-06-20',
                            organizer: 'ICAR'
                        }
                        localStorageService.saveHRD(newItem)
                        setIsAddModalOpen(false)
                        loadData()
                    }}
                    onCancel={() => setIsAddModalOpen(false)}
                />
            </Modal>

            <Modal
                isOpen={!!editingItem}
                onClose={() => setEditingItem(null)}
                title="Edit HRD Training Record"
                size="lg"
            >
                {editingItem && (
                    <EditHRD
                        item={editingItem}
                        onSuccess={() => {
                            setEditingItem(null)
                            loadData()
                        }}
                        onCancel={() => setEditingItem(null)}
                    />
                )}
            </Modal>
        </div>
    )
}
