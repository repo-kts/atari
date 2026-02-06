import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Sprout, ChevronsUpDown } from 'lucide-react'
import { Card, CardContent } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { useAuthStore } from '../../../stores/authStore'
import { localStorageService } from '../../../utils/localStorageService'
import { CelebrationDay } from '../../../types/celebrationDays'
import { Modal } from '../../ui/Modal'
import { SmartBackButton } from '../../../components/common/SmartBackButton'
import { KVKDetails } from '../../../types/kvk'

// Placeholder components for Add/Edit until fully implemented
const AddCelebrationDay = ({ onSuccess, onCancel }: { onSuccess: () => void, onCancel: () => void }) => (
    <div className="p-4">
        <p>Add Celebration Day Form Placeholder</p>
        <div className="flex gap-2 mt-4">
            <Button onClick={onSuccess}>Save (Mock)</Button>
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
    </div>
)

const EditCelebrationDay = ({ day, onSuccess, onCancel }: { day: CelebrationDay, onSuccess: () => void, onCancel: () => void }) => (
    <div className="p-4">
        <p>Edit Celebration Day Form Placeholder for {day.important_day}</p>
        <div className="flex gap-2 mt-4">
            <Button onClick={onSuccess}>Save (Mock)</Button>
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
    </div>
)

export const CelebrationDaysList: React.FC = () => {
    const { user } = useAuthStore()
    const isAdmin = user?.role === 'super_admin'
    const [days, setDays] = useState<CelebrationDay[]>([])
    const [kvks, setKvks] = useState<KVKDetails[]>([])
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [editingDay, setEditingDay] = useState<CelebrationDay | null>(null)
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
        // Use the new service method
        const data = localStorageService.getCelebrationDaysList(isAdmin ? undefined : (user?.kvkId ?? undefined))
        setDays(data)
    }

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this celebration day record?')) {
            localStorageService.deleteCelebrationDay(id)
            loadData()
        }
    }

    // Filter logic
    const filteredDays = days.filter(item => {
        const matchesSearch =
            item.important_day.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.kvk_name.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesKvk = selectedKvk === 'all' || item.kvk_id.toString() === selectedKvk
        const matchesYear = reportingYear === 'all' || item.reporting_year === reportingYear

        return matchesSearch && matchesKvk && matchesYear
    })

    return (
        <div className="space-y-8 p-6 w-full min-w-0">
            <SmartBackButton fallbackPath="/forms/achievements" showBreadcrumbs />

            <div className="flex flex-col gap-6">
                <h1 className="text-xl font-medium text-gray-800">Celebration days</h1>

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
                            <label className="block text-sm font-medium text-[#487749] mb-2">KVK</label>
                            <select
                                value={selectedKvk}
                                onChange={(e) => setSelectedKvk(e.target.value)}
                                className="w-full h-11 px-4 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white text-[#212121]"
                            >
                                <option value="all">All KVKs</option>
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

                    {/* Add button is not shown in screenshot but usually required. 
                         I will keep it for now as it's necessary for functionality. 
                     */}
                    {!isAdmin && (
                        <Button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-[#487749] hover:bg-[#3A613B] text-white px-6 h-11 rounded-xl flex items-center gap-2 shadow-lg shadow-[#487749]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Plus className="w-5 h-5" />
                            Add Celebration Day
                        </Button>
                    )}
                </div>
            </div>

            <Card className="w-full overflow-hidden border-none shadow-xl shadow-gray-200/50 bg-white/80 backdrop-blur-sm rounded-3xl">
                <CardContent className="p-0">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[#CFE1D1]">
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">
                                        <div className="flex items-center gap-1.5">S.No. <ChevronsUpDown className="w-3 h-3 text-gray-600" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">
                                        <div className="flex items-center gap-1.5">KVK Name <ChevronsUpDown className="w-3 h-3 text-gray-600" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">
                                        <div className="flex items-center gap-1.5">Important Days <ChevronsUpDown className="w-3 h-3 text-gray-600" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">
                                        <div className="flex items-center gap-1.5">Event date <ChevronsUpDown className="w-3 h-3 text-gray-600" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">
                                        <div className="flex items-center gap-1.5">No. of activities <ChevronsUpDown className="w-3 h-3 text-gray-600" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-b border-gray-200">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#487749]/5">
                                {filteredDays.length > 0 ? (
                                    filteredDays.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-[#487749]/5 transition-colors group">
                                            <td className="px-4 py-5 text-sm text-gray-600 font-medium">{index + 1}</td>
                                            <td className="px-4 py-5 text-sm text-gray-600 font-medium">{item.kvk_name}</td>
                                            <td className="px-4 py-5 text-sm font-semibold text-gray-900">{item.important_day}</td>
                                            <td className="px-4 py-5 text-sm text-gray-600">{item.event_date}</td>
                                            <td className="px-4 py-5 text-sm text-gray-600">{item.no_of_activities}</td>
                                            <td className="px-4 py-5 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => setEditingDay(item)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                                    <Sprout className="w-8 h-8 text-gray-300" />
                                                </div>
                                                <p className="text-gray-500 font-medium text-lg">No celebration days found</p>
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
                title="Add Celebration Day"
                size="lg"
            >
                <AddCelebrationDay
                    onSuccess={() => {
                        // Mock saving
                        const newDay: CelebrationDay = {
                            id: Date.now(),
                            kvk_id: user?.kvkId || 1,
                            kvk_name: user?.name || 'Demo KVK',
                            reporting_year: reportingYear === 'all' ? '2026' : reportingYear,
                            important_day: 'World Soil Day',
                            event_date: '2026-12-05',
                            no_of_activities: 12
                        }
                        localStorageService.saveCelebrationDay(newDay)
                        setIsAddModalOpen(false)
                        loadData()
                    }}
                    onCancel={() => setIsAddModalOpen(false)}
                />
            </Modal>

            <Modal
                isOpen={!!editingDay}
                onClose={() => setEditingDay(null)}
                title="Edit Celebration Day"
                size="lg"
            >
                {editingDay && (
                    <EditCelebrationDay
                        day={editingDay}
                        onSuccess={() => {
                            setEditingDay(null)
                            loadData()
                        }}
                        onCancel={() => setEditingDay(null)}
                    />
                )}
            </Modal>
        </div>
    )
}
