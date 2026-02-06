import React, { useState, useEffect } from 'react'
import { ChevronsUpDown } from 'lucide-react'
import { Card, CardContent } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { useAuthStore } from '../../../stores/authStore'
import { SwachhtaBudgetRecord } from '../../../types/miscellaneous'
import { SmartBackButton } from '../../../components/common/SmartBackButton'

export const SwachhtaBudgetList: React.FC = () => {
    const { user } = useAuthStore()
    const isAdmin = user?.role === 'super_admin'
    const [items, setItems] = useState<SwachhtaBudgetRecord[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [reportingYear, setReportingYear] = useState('2026')
    const [kvkFilter, setKvkFilter] = useState('All')

    useEffect(() => {
        setItems([])
    }, [user, isAdmin])

    const filteredItems = items.filter(item => {
        const matchesSearch =
            item.kvk_name.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesYear = reportingYear === 'all' || item.reporting_year === reportingYear
        const matchesKvk = kvkFilter === 'All' || item.kvk_name === kvkFilter

        return matchesSearch && matchesYear && matchesKvk
    })

    return (
        <div className="space-y-8 p-6 w-full min-w-0 font-sans">
            <SmartBackButton fallbackPath="/forms/miscellaneous" showBreadcrumbs />

            <div className="flex flex-col gap-6">
                <h1 className="text-xl font-medium text-gray-800">View Details of quarterly budget expenditure on Swachh activities including SAP</h1>

                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Reporting Year</label>
                        <select
                            value={reportingYear}
                            onChange={(e) => setReportingYear(e.target.value)}
                            className="w-64 h-11 px-4 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white text-[#212121]"
                        >
                            <option value="all">All</option>
                            <option value="2026">2026</option>
                            <option value="2025">2025</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">KVKs</label>
                        <select
                            value={kvkFilter}
                            onChange={(e) => setKvkFilter(e.target.value)}
                            className="w-64 h-11 px-4 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white text-[#212121]"
                        >
                            <option value="All">All</option>
                            <option value="KVK Nalanda">KVK Nalanda</option>
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
                </div>
            </div>

            <Card className="w-full overflow-hidden border-none shadow-xl shadow-gray-200/50 bg-white/80 backdrop-blur-sm rounded-3xl">
                <CardContent className="p-0">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[#CFE1D1]">
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">
                                        <div className="flex items-center justify-between">S.No. <ChevronsUpDown className="w-4 h-4 text-gray-600" /></div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">
                                        <div className="flex items-center justify-between">KVK Name <ChevronsUpDown className="w-4 h-4 text-gray-600" /></div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">
                                        <div className="flex items-center justify-between">Vermicomposting No of village covered <ChevronsUpDown className="w-4 h-4 text-gray-600" /></div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">
                                        <div className="flex items-center justify-between">Vermicomposting Total Expenditure(Rs.in Lakhs) <ChevronsUpDown className="w-4 h-4 text-gray-600" /></div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">
                                        <div className="flex items-center justify-between">Other No of village covered <ChevronsUpDown className="w-4 h-4 text-gray-600" /></div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-b border-gray-200">
                                        <div className="flex items-center justify-between">Other Total Expenditure(Rs.in Lakhs) <ChevronsUpDown className="w-4 h-4 text-gray-600" /></div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredItems.length > 0 ? (
                                    filteredItems.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">{index + 1}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 font-medium">{item.kvk_name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">{item.vermicomposting_villages}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">{item.vermicomposting_expenditure}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">{item.other_villages}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{item.other_expenditure}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center border-t border-gray-200">
                                            <p className="text-gray-900 font-medium text-base">No data available in table</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-4 py-4 border-t border-gray-200 flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                            {filteredItems.length > 0 ? `Showing 1 to ${Math.min(10, filteredItems.length)} of ${filteredItems.length} entries` : 'Showing 0 to 0 of 0 entries'}
                        </span>
                        <div className="flex gap-1">
                            <Button variant="outline" size="sm" className="px-3" disabled>Previous</Button>
                            <Button variant="outline" size="sm" className="px-3" disabled>Next</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
