import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, GraduationCap, ChevronsUpDown } from 'lucide-react'
import { Card, CardContent } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { useAuthStore } from '../../../stores/authStore'
import { localStorageService } from '../../../utils/localStorageService'
import { Training } from '../../../types/training'
import { Modal } from '../../ui/Modal'
import { AddTraining } from './AddTraining'
import { EditTraining } from './EditTraining'
import { SmartBackButton } from '../../../components/common/SmartBackButton'
import { KVKDetails } from '../../../types/kvk'

export const TrainingList: React.FC = () => {
    const { user } = useAuthStore()
    const isAdmin = user?.role === 'super_admin'
    const [trainings, setTrainings] = useState<Training[]>([])
    const [kvks, setKvks] = useState<KVKDetails[]>([])
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [editingTraining, setEditingTraining] = useState<Training | null>(null)
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
        const data = localStorageService.getTrainingList(isAdmin ? undefined : (user?.kvkId ?? undefined))
        setTrainings(data)
    }

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this training record?')) {
            localStorageService.deleteTraining(id)
            loadData()
        }
    }

    const filteredTrainings = trainings.filter(item => {
        const matchesSearch =
            item.training_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.training_discipline.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.kvk_name.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesKvk = selectedKvk === 'all' || item.kvk_id.toString() === selectedKvk
        const matchesYear = reportingYear === 'all' || item.reporting_year === reportingYear

        return matchesSearch && matchesKvk && matchesYear
    })

    return (
        <div className="space-y-8 p-6 w-full min-w-0">
            <SmartBackButton fallbackPath="/forms/achievements" showBreadcrumbs />

            <div className="flex flex-col gap-6">
                <h1 className="text-xl font-medium text-gray-800">View Training</h1>

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
                            className="h-11 px-4 bg-[#487749] hover:bg-[#3A613B] whitespace-nowrap"
                        >
                            Download Report
                        </Button>
                        <Button
                            variant="primary"
                            className="h-11 px-4 bg-[#487749] hover:bg-[#3A613B] whitespace-nowrap"
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
                            Add Training Information
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
                                        <div className="flex items-center gap-1.5">Reporting Year <ChevronsUpDown className="w-3 h-3 text-gray-600" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">
                                        <div className="flex items-center gap-1.5">KVK Name <ChevronsUpDown className="w-3 h-3 text-gray-600" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">
                                        <div className="flex items-center gap-1.5">Start Date <ChevronsUpDown className="w-3 h-3 text-gray-600" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">
                                        <div className="flex items-center gap-1.5">End Date <ChevronsUpDown className="w-3 h-3 text-gray-600" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">
                                        <div className="flex items-center gap-1.5">Training Program <ChevronsUpDown className="w-3 h-3 text-gray-600" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">
                                        <div className="flex items-center gap-1.5">Training Title <ChevronsUpDown className="w-3 h-3 text-gray-600" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">
                                        <div className="flex items-center gap-1.5">Venue <ChevronsUpDown className="w-3 h-3 text-gray-600" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">
                                        <div className="flex items-center gap-1.5">Training Discipline <ChevronsUpDown className="w-3 h-3 text-gray-600" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">
                                        <div className="flex items-center gap-1.5">Thematic Area <ChevronsUpDown className="w-3 h-3 text-gray-600" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-b border-gray-200">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#487749]/5">
                                {filteredTrainings.length > 0 ? (
                                    filteredTrainings.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-[#487749]/5 transition-colors group">
                                            <td className="px-4 py-5 text-sm text-gray-600 font-medium">{index + 1}</td>
                                            <td className="px-4 py-5 text-sm text-gray-600 font-medium">{item.reporting_year}</td>
                                            <td className="px-4 py-5 text-sm text-gray-600 font-medium">{item.kvk_name}</td>
                                            <td className="px-4 py-5 text-sm text-gray-600 whitespace-nowrap">{item.start_date}</td>
                                            <td className="px-4 py-5 text-sm text-gray-600 whitespace-nowrap">{item.end_date}</td>
                                            <td className="px-4 py-5 text-sm text-gray-600">
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-[#487749]/10 text-[#487749]">
                                                    {item.training_program}
                                                </span>
                                            </td>
                                            <td className="px-4 py-5 text-sm font-semibold text-gray-900">{item.training_title}</td>
                                            <td className="px-4 py-5 text-sm text-gray-600">{item.venue}</td>
                                            <td className="px-4 py-5 text-sm text-gray-600">{item.training_discipline}</td>
                                            <td className="px-4 py-5 text-sm text-gray-600">{item.thematic_area}</td>
                                            <td className="px-4 py-5 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => setEditingTraining(item)}
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
                                        <td colSpan={isAdmin ? 11 : 10} className="px-4 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                                    <GraduationCap className="w-8 h-8 text-gray-300" />
                                                </div>
                                                <p className="text-gray-500 font-medium text-lg">No training records found</p>
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
                title="Add Training Information"
                size="lg"
            >
                <AddTraining
                    onSuccess={() => {
                        setIsAddModalOpen(false)
                        loadData()
                    }}
                    onCancel={() => setIsAddModalOpen(false)}
                />
            </Modal>

            <Modal
                isOpen={!!editingTraining}
                onClose={() => setEditingTraining(null)}
                title="Edit Training Information"
                size="lg"
            >
                {editingTraining && (
                    <EditTraining
                        training={editingTraining}
                        onSuccess={() => {
                            setEditingTraining(null)
                            loadData()
                        }}
                        onCancel={() => setEditingTraining(null)}
                    />
                )}
            </Modal>
        </div>
    )
}
