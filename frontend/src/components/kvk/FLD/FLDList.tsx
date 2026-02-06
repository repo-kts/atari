import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../../../stores/authStore'
import { localStorageService } from '../../../utils/localStorageService'
import { FLD } from '../../../types/fld'
import { Card, CardContent } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { Modal } from '../../ui/Modal'
import { AddFLD } from './AddFLD'
import { EditFLD } from './EditFLD'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { SmartBackButton } from '../../common/SmartBackButton'

export const FLDList: React.FC = () => {
    const { user } = useAuthStore()
    const [flds, setFlds] = useState<FLD[]>([])
    const [filteredFlds, setFilteredFlds] = useState<FLD[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [editingFLD, setEditingFLD] = useState<FLD | null>(null)

    // Admin filtering
    const [selectedKvkId, setSelectedKvkId] = useState<string>('All')
    // Hardcoded list matching OFT/Screenshot
    const kvkList = [
        "KVK Araria", "KVK Arwal", "KVK Aurangabad", "KVK Banka", "KVK Begusarai",
        "Kvk Bhagalpur", "KVK Bhojpur", "KVK Bokaro", "KVK Buxar", "KVK Chatra",
        "KVK Darbhanga", "KVK Deoghar", "KVK Dhanbad", "KVK Dumka", "KVK East Champaran",
        "KVK East Champaran-II", "KVK East Singhbhum", "KVK Garhwa", "KVK Gaya-II",
        "KVK Giridih", "KVK Godda", "KVK Gopalganj", "KVK Gumla", "KVK Jamtara",
        "KVK Jamui", "KVK Jehanabad", "KVK Kaimur", "KVK Katihar", "KVK Khagaria",
        "KVK Khunti", "KVK Kishanganj", "KVK Koderma", "KVK Lakhisarai", "KVK Latehar",
        "KVK Lohardaga", "KVK Madhepura", "KVK Madhubani-II", "KVK Manpur Gaya",
        "KVK Munger", "KVK Muzaffarpur", "KVK Muzaffarpur-II", "KVK Nalanda",
        "KVK Nawada", "KVK Pakur", "KVK Palamu", "KVK Patna", "KVK Purnea",
        "KVK Ramgarh", "KVK Ranchi", "Kvk Rohtas", "KVK Saharsa", "KVK Sahibganj",
        "KVK Samastipur", "KVK Samastipur-II", "KVK Saraikela", "KVK Saran",
        "KVK Sheikhpura", "KVK Sheohar", "KVK Simdega"
    ]

    const isAdmin = user?.role === 'super_admin'

    useEffect(() => {
        loadFLDs()
    }, [user, isAdmin])

    useEffect(() => {
        filterData()
    }, [searchQuery, flds, selectedYear, selectedKvkId])

    const loadFLDs = () => {
        if (isAdmin) {
            const allFLDs = localStorageService.getFLDList()
            setFlds(allFLDs)
        } else if (user?.kvkId) {
            const list = localStorageService.getFLDList(user.kvkId)
            setFlds(list)
        }
    }

    const filterData = () => {
        let filtered = [...flds]

        // 1. Filter by Year
        if (selectedYear !== 'All') {
            filtered = filtered.filter(item => item.year === selectedYear)
        }

        // 2. Filter by KVK
        if (selectedKvkId !== 'All') {
            filtered = filtered.filter(item => item.kvk_name === selectedKvkId)
        }

        // 3. Search Query
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase()
            filtered = filtered.filter(item =>
                item.technology_name.toLowerCase().includes(q) ||
                item.category.toLowerCase().includes(q) ||
                item.sub_category.toLowerCase().includes(q) ||
                item.kvk_name.toLowerCase().includes(q)
            )
        }

        setFilteredFlds(filtered)
    }

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this FLD?')) {
            localStorageService.deleteFLD(id)
            loadFLDs()
        }
    }

    return (
        <div className="space-y-8 p-6">
            <SmartBackButton
                fallbackPath="/forms/achievements"
                showBreadcrumbs
            />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-xl font-medium text-gray-800">
                    View FLD
                </h2>
            </div>

            {/* Filters Section */}
            <div className="space-y-8">
                {/* Top Row: Year and KVK */}
                <div className="flex flex-col md:flex-row gap-8 items-end">
                    <div className="w-full md:w-72">
                        <label className="block text-sm font-medium text-[#487749] mb-2.5">
                            KVK
                        </label>
                        <select
                            value={selectedKvkId}
                            onChange={e => setSelectedKvkId(e.target.value)}
                            className="w-full h-11 px-4 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white text-[#212121]"
                        >
                            <option value="All">All</option>
                            {kvkList.map((kvkName, index) => (
                                <option key={index} value={kvkName}>{kvkName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="w-full md:w-auto flex-1">
                        <label className="block text-sm font-medium text-[#487749] mb-2.5">
                            Reporting Year
                        </label>
                        <div className="flex flex-wrap gap-3">
                            <select
                                value={selectedYear}
                                onChange={e => setSelectedYear(e.target.value)}
                                className="w-full md:w-64 h-11 px-4 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white text-[#212121]"
                            >
                                <option value="All">All</option>
                                <option value="2024">2024</option>
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                            </select>

                            <Button
                                variant="primary"
                                className="h-11 px-6 whitespace-nowrap bg-[#487749] hover:bg-[#3A613B]"
                            >
                                Filter
                            </Button>
                            <Button
                                variant="primary"
                                className="h-11 px-6 whitespace-nowrap bg-[#487749] hover:bg-[#3A613B]"
                            >
                                Download Report
                            </Button>
                            <Button
                                variant="primary"
                                className="h-11 px-6 whitespace-nowrap bg-[#487749] hover:bg-[#3A613B]"
                            >
                                Download Excel Report
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Search and Add Button */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="w-full md:max-w-md">
                        <label className="block text-sm font-medium text-[#487749] mb-2.5">
                            Search:
                        </label>
                        <input
                            type="text"
                            placeholder=""
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full h-11 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8F5E9]/20 focus:border-[#487749] bg-white text-[#212121] px-4"
                        />
                    </div>

                    {!isAdmin && (
                        <div className="shrink-0">
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setIsAddModalOpen(true)}
                                className="flex items-center h-11 px-6 bg-[#487749] hover:bg-[#3A613B]"
                            >
                                <Plus className="w-4 h-4 mr-2 shrink-0" />
                                <span>Add FLD Information</span>
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[#CFE1D1]">
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">S.No.</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">Reporting Year</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">Start Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">End Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">KVK Name</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">Category</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">Sub Category</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">Name of Technology Demonstrated</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">Ongoing/Completed</th>
                                    {!isAdmin && (
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-b border-gray-200">Action</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFlds.length === 0 ? (
                                    <tr>
                                        <td colSpan={isAdmin ? 9 : 10} className="px-4 py-8 text-center text-[#757575]">
                                            No FLD records found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredFlds.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            className="border-b border-[#E0E0E0] hover:bg-[#FAFAFA]"
                                        >
                                            <td className="px-4 py-3 text-[#212121]">{index + 1}</td>
                                            <td className="px-4 py-3 text-[#212121]">{item.year}</td>
                                            <td className="px-4 py-3 text-[#212121]">{item.start_date}</td>
                                            <td className="px-4 py-3 text-[#212121]">{item.end_date}</td>
                                            <td className="px-4 py-3 text-[#212121]">{item.kvk_name}</td>
                                            <td className="px-4 py-3 text-[#212121]">{item.category}</td>
                                            <td className="px-4 py-3 text-[#212121]">{item.sub_category}</td>
                                            <td className="px-4 py-3 text-[#212121]">{item.technology_name}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Completed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            {!isAdmin && (
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setEditingFLD(item)}
                                                            className="p-2 text-[#487749] hover:bg-[#E8F5E9] rounded-xl transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add FLD Details"
                size="lg"
            >
                <AddFLD
                    onSuccess={() => {
                        setIsAddModalOpen(false)
                        loadFLDs()
                    }}
                    onCancel={() => setIsAddModalOpen(false)}
                />
            </Modal>

            {editingFLD && (
                <Modal
                    isOpen={!!editingFLD}
                    onClose={() => setEditingFLD(null)}
                    title="Edit FLD Details"
                    size="lg"
                >
                    <EditFLD
                        fld={editingFLD}
                        onSuccess={() => {
                            setEditingFLD(null)
                            loadFLDs()
                        }}
                        onCancel={() => setEditingFLD(null)}
                    />
                </Modal>
            )}
        </div>
    )
}
