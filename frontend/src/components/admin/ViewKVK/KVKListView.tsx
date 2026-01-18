import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../stores/authStore'
import { localStorageService } from '../../../utils/localStorageService'
import { searchService } from '../../../utils/searchService'
import { exportService } from '../../../utils/exportService'
import { KVKDetails } from '../../../types/kvk'
import { Card, CardContent } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { Search, Download, FileSpreadsheet, Eye, Edit2, Trash2 } from 'lucide-react'

export const KVKListView: React.FC = () => {
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const [kvks, setKvks] = useState<KVKDetails[]>([])
    const [filteredKvks, setFilteredKvks] = useState<KVKDetails[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [exporting, setExporting] = useState(false)

    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'

    useEffect(() => {
        loadKVKs()
    }, [user])

    useEffect(() => {
        if (searchQuery.trim()) {
            const filtered = searchService.searchKVKs(searchQuery)
            setFilteredKvks(filtered)
        } else {
            setFilteredKvks(kvks)
        }
    }, [searchQuery, kvks])

    const loadKVKs = () => {
        // For admin/super_admin, show all KVKs
        // For KVK users, show only their own KVK
        if (isAdmin) {
            const allKVKs = localStorageService.getKVKDetails()
            setKvks(allKVKs)
            setFilteredKvks(allKVKs)
        } else if (user?.kvk_id) {
            const kvksList = localStorageService.getKVKDetails(user.kvk_id)
            setKvks(kvksList)
            setFilteredKvks(kvksList)
        }
    }

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this KVK?')) {
            localStorageService.deleteKVKDetails(id)
            loadKVKs()
        }
    }

    const handleExportPDF = async () => {
        setExporting(true)
        try {
            await exportService.exportToPDF(
                filteredKvks,
                'kvk',
                { filename: `kvk-list-${new Date().getTime()}.pdf` }
            )
        } catch (error) {
            console.error('Export failed:', error)
            alert('Failed to export PDF')
        } finally {
            setExporting(false)
        }
    }

    const handleExportExcel = async () => {
        setExporting(true)
        try {
            await exportService.exportToExcel(
                filteredKvks,
                'kvk',
                `kvk-list-${new Date().getTime()}`
            )
        } catch (error) {
            console.error('Export failed:', error)
            alert('Failed to export Excel')
        } finally {
            setExporting(false)
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <h2 className="text-2xl font-bold text-emerald-700">
                            KVK List
                        </h2>
                        <div className="flex gap-2 flex-wrap">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExportPDF}
                                disabled={exporting}
                                className="flex items-center"
                            >
                                <Download className="w-4 h-4 mr-2 shrink-0" />
                                <span>Export PDF</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExportExcel}
                                disabled={exporting}
                                className="whitespace-nowrap flex items-center"
                            >
                                <FileSpreadsheet className="w-4 h-4 mr-2 shrink-0" />
                                <span>Export Excel</span>
                            </Button>
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#757575] w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by KVK name, email, mobile, state, district..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full h-12 pl-10 pr-4 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white text-[#212121]"
                            />
                        </div>
                    </div>

                    {filteredKvks.length === 0 ? (
                        <p className="text-[#757575] text-center py-8">
                            No KVKs found
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-emerald-50 border-b border-[#E0E0E0]">
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-700">
                                            KVK Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-700">
                                            State
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-700">
                                            District
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-700">
                                            University
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-700">
                                            Mobile
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-700">
                                            Email
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-700">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredKvks.map(kvk => (
                                        <tr
                                            key={kvk.id}
                                            className="border-b border-[#E0E0E0] hover:bg-[#FAFAFA]"
                                        >
                                            <td className="px-4 py-3 text-[#212121]">
                                                {kvk.kvk_name}
                                            </td>
                                            <td className="px-4 py-3 text-[#212121]">
                                                {kvk.state?.state_name || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-[#212121]">
                                                {kvk.district?.district_name || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-[#212121]">
                                                {kvk.university?.university_name || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-[#212121]">
                                                {kvk.mobile}
                                            </td>
                                            <td className="px-4 py-3 text-[#212121]">
                                                {kvk.email}
                                            </td>
                                            {isAdmin && (
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => navigate(`/forms/about-kvk/view-kvks/${kvk.id}`)}
                                                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(kvk.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                            {!isAdmin && (
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => navigate(`/forms/about-kvk/details`)}
                                                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/forms/about-kvk/details`)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(kvk.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
