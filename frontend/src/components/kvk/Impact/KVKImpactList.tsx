import React, { useState, useEffect } from 'react'
import { Plus, Sprout, ChevronsUpDown } from 'lucide-react'
import { Card, CardContent } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { useAuthStore } from '../../../stores/authStore'
import { localStorageService } from '../../../utils/localStorageService'
import { KVKImpact } from '../../../types/impact'
import { Modal } from '../../ui/Modal'
import { SmartBackButton } from '../../../components/common/SmartBackButton'

const AddKVKImpact = ({ onSuccess, onCancel }: { onSuccess: () => void, onCancel: () => void }) => (
    <div className="p-4">
        <p>Add KVK Impact Form Placeholder</p>
        <div className="flex gap-2 mt-4">
            <Button onClick={onSuccess}>Save (Mock)</Button>
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
    </div>
)

export const KVKImpactList: React.FC = () => {
    const { user } = useAuthStore()
    const isAdmin = user?.role === 'super_admin'
    const [items, setItems] = useState<KVKImpact[]>([])
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [reportingYear, setReportingYear] = useState('2026')

    useEffect(() => {
        loadData()
    }, [user, isAdmin])

    const loadData = () => {
        const data = localStorageService.getKVKImpactList(isAdmin ? undefined : (user?.kvkId ?? undefined))
        setItems(data)
    }

    const filteredItems = items.filter(item => {
        const matchesSearch =
            item.specific_area.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.kvk_name.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesYear = reportingYear === 'all' || item.reporting_year === reportingYear

        return matchesSearch && matchesYear
    })

    return (
        <div className="space-y-8 p-6 w-full min-w-0">
            <SmartBackButton fallbackPath="/forms/performance" showBreadcrumbs />

            <div className="flex flex-col gap-6">
                <h1 className="text-xl font-medium text-gray-800">Impact of KVK activities</h1>

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
                    </div>
                    <Button
                        variant="primary"
                        className="h-11 px-6 bg-[#487749] hover:bg-[#3A613B] whitespace-nowrap"
                    >
                        Download Excel Report
                    </Button>
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

                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-[#487749] hover:bg-[#3A613B] text-white px-6 h-11 rounded-xl flex items-center gap-2 shadow-lg shadow-[#487749]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Plus className="w-5 h-5" />
                        Add Record
                    </Button>
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
                                        <div className="flex items-center gap-1.5">Name of Specific Area <ChevronsUpDown className="w-3 h-3 text-gray-600" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">
                                        <div className="flex items-center gap-1.5">Brief Details of the Area <ChevronsUpDown className="w-3 h-3 text-gray-600" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">
                                        <div className="flex items-center gap-1.5">No. of Farmers Benefitted <ChevronsUpDown className="w-3 h-3 text-gray-600" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">
                                        <div className="flex items-center gap-1.5">Horizontal Spread(in area/no.) <ChevronsUpDown className="w-3 h-3 text-gray-600" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-b border-gray-200">
                                        <div className="flex items-center gap-1.5">% of Adoption <ChevronsUpDown className="w-3 h-3 text-gray-600" /></div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#487749]/5">
                                {filteredItems.length > 0 ? (
                                    filteredItems.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-[#487749]/5 transition-colors">
                                            <td className="px-4 py-5 text-sm text-gray-600 font-medium">{index + 1}</td>
                                            <td className="px-4 py-5 text-sm text-gray-600 font-medium">{item.kvk_name}</td>
                                            <td className="px-4 py-5 text-sm text-gray-600 font-medium">{item.specific_area}</td>
                                            <td className="px-4 py-5 text-sm text-gray-600 font-medium">{item.brief_details}</td>
                                            <td className="px-4 py-5 text-sm text-gray-600">{item.farmers_benefitted}</td>
                                            <td className="px-4 py-5 text-sm text-gray-600">{item.horizontal_spread}</td>
                                            <td className="px-4 py-5 text-sm text-gray-600">{item.adoption_percentage}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                                    <Sprout className="w-8 h-8 text-gray-300" />
                                                </div>
                                                <p className="text-gray-500 font-medium text-lg">No data available in table</p>
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
                title="Add Impact Record"
                size="lg"
            >
                <AddKVKImpact
                    onSuccess={() => {
                        const newItem: KVKImpact = {
                            id: Date.now(),
                            kvk_id: user?.kvkId || 1,
                            kvk_name: user?.name || 'Demo KVK',
                            reporting_year: reportingYear === 'all' ? '2026' : reportingYear,
                            specific_area: 'Crop Production',
                            brief_details: 'Introduction of High Yielding Varieties',
                            farmers_benefitted: 150,
                            horizontal_spread: '50 ha',
                            adoption_percentage: '85%'
                        }
                        localStorageService.saveKVKImpact(newItem)
                        setIsAddModalOpen(false)
                        loadData()
                    }}
                    onCancel={() => setIsAddModalOpen(false)}
                />
            </Modal>
        </div>
    )
}
