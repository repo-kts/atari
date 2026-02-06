import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, BookOpen } from 'lucide-react'
import { Card, CardContent } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { useAuthStore } from '../../../stores/authStore'
import { localStorageService } from '../../../utils/localStorageService'
import { Publication } from '../../../types/publication'
import { Modal } from '../../ui/Modal'
import { AddPublication } from './AddPublication'
import { EditPublication } from './EditPublication'
import { SmartBackButton } from '../../../components/common/SmartBackButton'
import { KVKDetails } from '../../../types/kvk'

export const PublicationList: React.FC = () => {
    const { user } = useAuthStore()
    const isAdmin = user?.role === 'super_admin'
    const [publications, setPublications] = useState<Publication[]>([])
    const [kvks, setKvks] = useState<KVKDetails[]>([])
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [editingPublication, setEditingPublication] = useState<Publication | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    // Filters
    const [selectedKvk, setSelectedKvk] = useState<string>('all')
    const [selectedYear, setSelectedYear] = useState<string>('2024')
    const [selectedItem, setSelectedItem] = useState<string>('all')

    const publicationItems = [
        "Research Paper Published",
        "Abstracts Published in Seminar or Conference or Symposia",
        "Books Published",
        "Book Chapter Published",
        "Popular Articles Published",
        "Success Story Published",
        "Extension Bulletins Published",
        "Extension Folders or Leaflet or Pamphlets",
        "Technical Reports",
        "News Letter",
        "Electronic Publication CD or DVD",
        "E Publication"
    ]

    useEffect(() => {
        loadData()
        if (isAdmin) {
            setKvks(localStorageService.getKVKDetails())
        }
    }, [user, isAdmin])

    const loadData = () => {
        const data = localStorageService.getPublicationList(isAdmin ? undefined : (user?.kvkId ?? undefined))
        setPublications(data)
    }

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this publication?')) {
            localStorageService.deletePublication(id)
            loadData()
        }
    }

    const filteredPublications = publications.filter(pub => {
        const matchesSearch =
            pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pub.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pub.journal_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pub.kvk_name.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesKvk = selectedKvk === 'all' || pub.kvk_id.toString() === selectedKvk
        const matchesYear = selectedYear === 'all' || pub.year === selectedYear
        const matchesItem = selectedItem === 'all' || pub.publication_item === selectedItem

        return matchesSearch && matchesKvk && matchesYear && matchesItem
    })

    return (
        <div className="space-y-8 p-6">
            <SmartBackButton fallbackPath="/forms/achievements" showBreadcrumbs />

            <div className="flex flex-col gap-6">
                <h1 className="text-xl font-medium text-gray-800">Publications</h1>
                <div className="flex flex-wrap items-end gap-6">
                    <div className="flex-1 min-w-[300px]">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Publication Item</label>
                        <select
                            value={selectedItem}
                            onChange={(e) => setSelectedItem(e.target.value)}
                            className="w-full h-11 px-4 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white text-[#212121]"
                        >
                            <option value="all">All</option>
                            {publicationItems.map(item => (
                                <option key={item} value={item}>{item}</option>
                            ))}
                        </select>
                    </div>

                    <div className="w-48">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-full h-11 px-4 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white text-[#212121]"
                        >
                            <option value="all">All</option>
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                        </select>
                    </div>

                    {isAdmin && (
                        <div className="w-64">
                            <label className="block text-sm font-medium text-gray-700 mb-2">KVK</label>
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
                        <Button variant="primary" className="h-11 px-4 bg-[#487749] hover:bg-[#3A613B] whitespace-nowrap">
                            Download Report
                        </Button>
                        <Button variant="primary" className="h-11 px-4 bg-[#487749] hover:bg-[#3A613B] whitespace-nowrap">
                            Download Excel Report
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search publications..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 bg-white border border-[#E0E0E0] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] transition-all"
                        />
                    </div>

                    {!isAdmin && (
                        <Button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-[#487749] hover:bg-[#3A613B] text-white px-6 h-12 rounded-2xl flex items-center gap-2 shadow-lg shadow-[#487749]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Plus className="w-5 h-5" />
                            Add Publication Details
                        </Button>
                    )}
                </div>
            </div>

            <Card className="overflow-hidden border-none shadow-xl shadow-gray-200/50 bg-white/80 backdrop-blur-sm rounded-3xl">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[#CFE1D1]">
                                    <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700 tracking-wider w-20 border-r border-white border-b border-gray-200">S.No.</th>
                                    <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700 tracking-wider border-r border-white border-b border-gray-200">Publication Name</th>
                                    <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700 tracking-wider w-24 border-r border-white border-b border-gray-200">Year</th>
                                    <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700 tracking-wider border-r border-white border-b border-gray-200">Title</th>
                                    <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700 tracking-wider border-r border-white border-b border-gray-200">Author Name</th>
                                    <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700 tracking-wider border-r border-white border-b border-gray-200">Journal Name</th>
                                    {isAdmin && <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700 tracking-wider border-r border-white border-b border-gray-200">KVK Name</th>}
                                    <th className="px-6 py-5 text-right text-sm font-semibold text-gray-700 tracking-wider w-32 border-b border-gray-200">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#487749]/5">
                                {filteredPublications.length > 0 ? (
                                    filteredPublications.map((pub, index) => (
                                        <tr key={pub.id} className="hover:bg-[#487749]/5 transition-colors group">
                                            <td className="px-6 py-5 text-sm text-gray-600 font-medium">{index + 1}</td>
                                            <td className="px-6 py-5">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#487749]/10 text-[#487749]">
                                                    {pub.publication_item}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-sm text-gray-600">{pub.year}</td>
                                            <td className="px-6 py-5 text-sm font-semibold text-gray-900">{pub.title}</td>
                                            <td className="px-6 py-5 text-sm text-gray-600">{pub.author_name}</td>
                                            <td className="px-6 py-5 text-sm text-gray-600 italic">{pub.journal_name}</td>
                                            {isAdmin && <td className="px-6 py-5 text-sm text-gray-600 font-medium">{pub.kvk_name}</td>}
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => setEditingPublication(pub)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(pub.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={isAdmin ? 8 : 7} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                                    <BookOpen className="w-8 h-8 text-gray-300" />
                                                </div>
                                                <p className="text-gray-500 font-medium text-lg">No publications found</p>
                                                <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
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
                title="Add Publication Information"
                size="lg"
            >
                <AddPublication
                    onSuccess={() => {
                        setIsAddModalOpen(false)
                        loadData()
                    }}
                    onCancel={() => setIsAddModalOpen(false)}
                />
            </Modal>

            <Modal
                isOpen={!!editingPublication}
                onClose={() => setEditingPublication(null)}
                title="Edit Publication Information"
                size="lg"
            >
                {editingPublication && (
                    <EditPublication
                        publication={editingPublication}
                        onSuccess={() => {
                            setEditingPublication(null)
                            loadData()
                        }}
                        onCancel={() => setEditingPublication(null)}
                    />
                )}
            </Modal>
        </div>
    )
}
