import React, { useState, useEffect } from 'react'
import { Plus, Search, Download, Edit2, Trash2, X, Save } from 'lucide-react'

// Mock data - replace with API call later
const mockDistrictsData = [
    {
        id: 1,
        zoneName: 'ICAR-ATARI-Patna',
        stateName: 'Bihar',
        districtName: 'Araria',
    },
    {
        id: 2,
        zoneName: 'ICAR-ATARI-Patna',
        stateName: 'Bihar',
        districtName: 'Arwal',
    },
    {
        id: 3,
        zoneName: 'ICAR-ATARI-Patna',
        stateName: 'Bihar',
        districtName: 'Aurangabad',
    },
    {
        id: 4,
        zoneName: 'ICAR-ATARI-Patna',
        stateName: 'Bihar',
        districtName: 'Banka',
    },
    {
        id: 5,
        zoneName: 'ICAR-ATARI-Patna',
        stateName: 'Jharkhand',
        districtName: 'Bokaro',
    },
]

export const ViewDistricts: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editValues, setEditValues] = useState({ zoneName: '', stateName: '', districtName: '' })
    const [districts, setDistricts] = useState(mockDistrictsData)
    const itemsPerPage = 10

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery)
            setCurrentPage(1)
        }, 300)
        return () => clearTimeout(timer)
    }, [searchQuery])

    // Filter data based on search
    const filteredData = districts.filter(
        district =>
            district.zoneName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            district.stateName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            district.districtName.toLowerCase().includes(debouncedSearch.toLowerCase())
    )

    // Pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedData = filteredData.slice(startIndex, endIndex)

    const handleEdit = (district: typeof mockDistrictsData[0]) => {
        setEditingId(district.id)
        setEditValues({
            zoneName: district.zoneName,
            stateName: district.stateName,
            districtName: district.districtName
        })
    }

    const handleSave = (id: number) => {
        setDistricts(districts.map(district =>
            district.id === id ? { ...district, ...editValues } : district
        ))
        setEditingId(null)
        setEditValues({ zoneName: '', stateName: '', districtName: '' })
    }

    const handleCancel = () => {
        setEditingId(null)
        setEditValues({ zoneName: '', stateName: '', districtName: '' })
    }

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this district?')) {
            setDistricts(districts.filter(district => district.id !== id))
        }
    }

    const handleAddNew = () => {
        const newId = Math.max(...districts.map(d => d.id), 0) + 1
        const newDistrict = {
            id: newId,
            zoneName: 'Select Zone',
            stateName: 'Select State',
            districtName: 'New District'
        }
        setDistricts([...districts, newDistrict])
        setEditingId(newId)
        setEditValues({
            zoneName: 'Select Zone',
            stateName: 'Select State',
            districtName: 'New District'
        })
    }

    const handleExport = () => {
        const csv = [
            ['S.No.', 'Zone Name', 'State Name', 'District Name'],
            ...filteredData.map((district, index) => [
                index + 1,
                district.zoneName,
                district.stateName,
                district.districtName
            ])
        ].map(row => row.join(',')).join('\n')

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'districts.csv'
        a.click()
        window.URL.revokeObjectURL(url)
    }

    return (
        <div className="p-6">
            {/* Header with Actions */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-[#487749]">Districts Master</h2>
                    <p className="text-sm text-[#757575] mt-1">
                        Manage and view all districts in the system
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 border border-[#E0E0E0] rounded-xl text-sm font-medium text-[#487749] hover:bg-[#F5F5F5] hover:border-[#BDBDBD] transition-all duration-200"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button
                        onClick={handleAddNew}
                        className="flex items-center gap-2 px-4 py-2 bg-[#487749] text-white rounded-xl text-sm font-medium hover:bg-[#487749] border border-[#487749] hover:border-[#487749] transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        <Plus className="w-4 h-4" />
                        Add New District
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#757575]" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search districts by zone, state, or name..."
                        className="w-full pl-10 pr-4 py-2.5 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8F5E9]0/20 focus:border-[#487749] bg-white text-[#212121] placeholder-[#9E9E9E] transition-all duration-200 hover:border-[#BDBDBD]"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#F5F5F5] border-b border-[#E0E0E0]">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[#212121] uppercase tracking-wider">
                                    S.No.
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[#212121] uppercase tracking-wider">
                                    Zone Name
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[#212121] uppercase tracking-wider">
                                    State Name
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[#212121] uppercase tracking-wider">
                                    District Name
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-[#212121] uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-[#E0E0E0]">
                            {paginatedData.length > 0 ? (
                                paginatedData.map((district, index) => (
                                    <tr
                                        key={district.id}
                                        className="hover:bg-[#F5F5F5] transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#212121]">
                                            {startIndex + index + 1}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[#212121]">
                                            {editingId === district.id ? (
                                                <input
                                                    type="text"
                                                    value={editValues.zoneName}
                                                    onChange={e => setEditValues({ ...editValues, zoneName: e.target.value })}
                                                    className="px-3 py-1.5 border border-[#487749] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8F5E9]0/20 w-full max-w-xs transition-all duration-200"
                                                />
                                            ) : (
                                                <span className="font-medium">{district.zoneName}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[#212121]">
                                            {editingId === district.id ? (
                                                <input
                                                    type="text"
                                                    value={editValues.stateName}
                                                    onChange={e => setEditValues({ ...editValues, stateName: e.target.value })}
                                                    className="px-3 py-1.5 border border-[#487749] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8F5E9]0/20 w-full max-w-xs transition-all duration-200"
                                                />
                                            ) : (
                                                <span className="font-medium">{district.stateName}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[#212121]">
                                            {editingId === district.id ? (
                                                <input
                                                    type="text"
                                                    value={editValues.districtName}
                                                    onChange={e => setEditValues({ ...editValues, districtName: e.target.value })}
                                                    className="px-3 py-1.5 border border-[#487749] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8F5E9]0/20 w-full max-w-xs transition-all duration-200"
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter') handleSave(district.id)
                                                        if (e.key === 'Escape') handleCancel()
                                                    }}
                                                />
                                            ) : (
                                                <span className="font-medium">{district.districtName}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            {editingId === district.id ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleSave(district.id)}
                                                        className="p-1.5 text-[#487749] hover:bg-[#F5F5F5] rounded-xl border border-transparent hover:border-[#E0E0E0] transition-all duration-200"
                                                        aria-label="Save"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={handleCancel}
                                                        className="p-1.5 text-[#757575] hover:bg-[#F5F5F5] rounded-xl border border-transparent hover:border-[#E0E0E0] transition-all duration-200"
                                                        aria-label="Cancel"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(district)}
                                                        className="p-1.5 text-[#487749] hover:bg-[#F5F5F5] rounded-xl border border-transparent hover:border-[#E0E0E0] transition-all duration-200"
                                                        aria-label="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(district.id)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-200 transition-all duration-200"
                                                        aria-label="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-12 text-center"
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <p className="text-sm font-medium text-[#757575]">
                                                {debouncedSearch ? 'No districts found matching your search' : 'No districts available'}
                                            </p>
                                            {debouncedSearch && (
                                                <button
                                                    onClick={() => setSearchQuery('')}
                                                    className="text-sm text-[#487749] hover:text-[#3d6540] hover:underline transition-colors"
                                                >
                                                    Clear search
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {filteredData.length > 0 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-[#757575]">
                        Showing <span className="font-medium text-[#212121]">{startIndex + 1}</span> to{' '}
                        <span className="font-medium text-[#212121]">{Math.min(endIndex, filteredData.length)}</span> of{' '}
                        <span className="font-medium text-[#212121]">{filteredData.length}</span> entries
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border border-[#E0E0E0] rounded-xl text-sm font-medium text-[#487749] hover:bg-[#F5F5F5] hover:border-[#BDBDBD] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            Previous
                        </button>
                        <div className="flex gap-1">
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                let page: number
                                if (totalPages <= 5) {
                                    page = i + 1
                                } else if (currentPage <= 3) {
                                    page = i + 1
                                } else if (currentPage >= totalPages - 2) {
                                    page = totalPages - 4 + i
                                } else {
                                    page = currentPage - 2 + i
                                }

                                return (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-2 min-w-[2.5rem] border rounded-xl text-sm font-medium transition-all duration-200 ${
                                            currentPage === page
                                                ? 'bg-[#487749] text-white border-[#487749]'
                                                : 'border-[#E0E0E0] text-[#487749] hover:bg-[#F5F5F5] hover:border-[#BDBDBD]'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                )
                            })}
                        </div>
                        <button
                            onClick={() =>
                                setCurrentPage(prev => Math.min(totalPages, prev + 1))
                            }
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border border-[#E0E0E0] rounded-xl text-sm font-medium text-[#487749] hover:bg-[#F5F5F5] hover:border-[#BDBDBD] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
