import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../../../stores/authStore'
import { localStorageService } from '../../../utils/localStorageService'
import { OFT } from '../../../types/oft'
import { Card, CardContent } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { Modal } from '../../ui/Modal'
import { AddOFT } from './AddOFT'
import { EditOFT } from './EditOFT'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { SmartBackButton } from '../../common/SmartBackButton'


export const OFTList: React.FC = () => {
    const { user } = useAuthStore()
    const [ofts, setOfts] = useState<OFT[]>([])
    const [filteredOfts, setFilteredOfts] = useState<OFT[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [editingOFT, setEditingOFT] = useState<OFT | null>(null)

    // Admin filtering
    // Admin filtering
    const [selectedKvkId, setSelectedKvkId] = useState<string>('All')
    // Hardcoded list as requested from images
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
        // Removed dynamic fetching to use the requested static list for now, 
        // to match the exact requirement of the screenshots.
        loadOFTs()
    }, [user, isAdmin])

    useEffect(() => {
        filterData()
    }, [searchQuery, ofts, selectedYear, selectedKvkId])

    const loadOFTs = () => {
        if (isAdmin) {
            const allOFTs = localStorageService.getOFTList()
            setOfts(allOFTs)
        } else if (user?.kvkId) {
            const list = localStorageService.getOFTList(user.kvkId)
            setOfts(list)
        }
    }

    const filterData = () => {
        let filtered = [...ofts]

        // 1. Filter by Year
        if (selectedYear !== 'All') {
            filtered = filtered.filter(item => item.year === selectedYear)
        }

        // 2. Filter by KVK (Admin only)
        if (isAdmin && selectedKvkId !== 'All') {
            // Filter by name since we are selecting by name from the static list
            filtered = filtered.filter(item => item.kvk_name === selectedKvkId)
        }

        // 3. Search Query
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase()
            filtered = filtered.filter(item =>
                item.title.toLowerCase().includes(q) ||
                item.staff.toLowerCase().includes(q) ||
                item.problem_diagnosed.toLowerCase().includes(q) ||
                (isAdmin && item.kvk_name.toLowerCase().includes(q))
            )
        }

        setFilteredOfts(filtered)
    }

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this OFT?')) {
            localStorageService.deleteOFT(id)
            loadOFTs()
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
                    View OFT Details
                </h2>
            </div>

            {/* Filters Section */}
            <div className="space-y-8">
                {/* Top Row: Year and Filter Button (and KVK for admin) */}
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

                    <div className="w-full md:w-64">
                        <label className="block text-sm font-medium text-[#487749] mb-2.5">
                            Reporting Year
                        </label>
                        <div className="flex gap-3">
                            <select
                                value={selectedYear}
                                onChange={e => setSelectedYear(e.target.value)}
                                className="w-full h-11 px-4 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white text-[#212121]"
                            >
                                <option value="All">All</option>
                                <option value="2024">2024</option>
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                            </select>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {/* Filter logic applies automatically */ }}
                                className="h-11 px-6 whitespace-nowrap"
                            >
                                Filter
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
                            className="w-full h-11 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8F5E9]0/20 focus:border-[#487749] bg-white text-[#212121] px-4"
                        />
                    </div>

                    {!isAdmin && (
                        <div className="shrink-0">
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setIsAddModalOpen(true)}
                                className="flex items-center h-10 px-6"
                            >
                                <Plus className="w-4 h-4 mr-2 shrink-0" />
                                <span>Add OFT Information</span>
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
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">
                                        S.No.
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">
                                        Reporting year
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">
                                        KVK Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">
                                        Staff
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">
                                        Title of On farm Trial (OFT)
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">
                                        Problem diagnosed
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">
                                        Ongoing/Completed
                                    </th>
                                    {!isAdmin && (
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-b border-gray-200">
                                            Action
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOfts.length === 0 ? (
                                    <tr>
                                        <td colSpan={isAdmin ? 7 : 8} className="px-4 py-8 text-center text-[#757575]">
                                            No OFT records found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOfts.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            className="border-b border-[#E0E0E0] hover:bg-[#FAFAFA]"
                                        >
                                            <td className="px-4 py-3 text-[#212121]">
                                                {index + 1}
                                            </td>
                                            <td className="px-4 py-3 text-[#212121]">
                                                {item.year}
                                            </td>
                                            <td className="px-4 py-3 text-[#212121]">
                                                {item.kvk_name}
                                            </td>
                                            <td className="px-4 py-3 text-[#212121]">
                                                {item.staff}
                                            </td>
                                            <td className="px-4 py-3 text-[#212121]">
                                                {item.title}
                                            </td>
                                            <td className="px-4 py-3 text-[#212121]">
                                                {item.problem_diagnosed}
                                            </td>
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
                                                            onClick={() => setEditingOFT(item)}
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
                title="Add OFT Details"
                size="lg"
            >
                <AddOFT
                    onSuccess={() => {
                        setIsAddModalOpen(false)
                        loadOFTs()
                    }}
                    onCancel={() => setIsAddModalOpen(false)}
                />
            </Modal>

            {editingOFT && (
                <Modal
                    isOpen={!!editingOFT}
                    onClose={() => setEditingOFT(null)}
                    title="Edit OFT Details"
                    size="lg"
                >
                    <EditOFT
                        oft={editingOFT}
                        onSuccess={() => {
                            setEditingOFT(null)
                            loadOFTs()
                        }}
                        onCancel={() => setEditingOFT(null)}
                    />
                </Modal>
            )}
        </div>
    )
}
