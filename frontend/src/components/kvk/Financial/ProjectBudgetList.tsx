import React, { useState, useEffect } from 'react'
import { ChevronsUpDown } from 'lucide-react'
import { Card, CardContent } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { useAuthStore } from '../../../stores/authStore'
import { ProjectBudget } from '../../../types/financialPerformance'
import { SmartBackButton } from '../../../components/common/SmartBackButton'

export const ProjectBudgetList: React.FC = () => {
    const { user } = useAuthStore()
    const isAdmin = user?.role === 'super_admin'
    const [items, setItems] = useState<ProjectBudget[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [reportingYear, setReportingYear] = useState('2025-2026')

    useEffect(() => {
        setItems([])
    }, [user, isAdmin])

    const filteredItems = items.filter(item => {
        const matchesSearch =
            item.kvk_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.project_name.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesYear = reportingYear === 'all' || item.reporting_year === reportingYear

        return matchesSearch && matchesYear
    })

    return (
        <div className="space-y-8 p-6 w-full min-w-0">
            <SmartBackButton fallbackPath="/forms/performance" showBreadcrumbs />

            <div className="flex flex-col gap-6">
                <h1 className="text-xl font-medium text-gray-800">View Project-wise Budget Details (FY)</h1>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="w-64">
                        <label className="block text-sm font-medium text-[#487749] mb-2">Reporting Year</label>
                        <select
                            value={reportingYear}
                            onChange={(e) => setReportingYear(e.target.value)}
                            className="w-full h-11 px-4 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white text-[#212121]"
                        >
                            <option value="all">All</option>
                            <option value="2025-2026">2025-2026</option>
                            <option value="2024-2025">2024-2025</option>
                        </select>
                    </div>

                    <div className="flex gap-2 mt-7">
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
                                        <div className="flex items-center justify-between">KVK <ChevronsUpDown className="w-4 h-4 text-gray-600" /></div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">
                                        <div className="flex items-center justify-between">Project Name <ChevronsUpDown className="w-4 h-4 text-gray-600" /></div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">
                                        <div className="flex items-center justify-between">Funding Agency <ChevronsUpDown className="w-4 h-4 text-gray-600" /></div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">
                                        <div className="flex items-center justify-between">Budget Estimate <ChevronsUpDown className="w-4 h-4 text-gray-600" /></div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">
                                        <div className="flex items-center justify-between">Budget Allocated <ChevronsUpDown className="w-4 h-4 text-gray-600" /></div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">
                                        <div className="flex items-center justify-between">Budget Released <ChevronsUpDown className="w-4 h-4 text-gray-600" /></div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-r border-white border-b border-gray-200">
                                        <div className="flex items-center justify-between">Expenditure <ChevronsUpDown className="w-4 h-4 text-gray-600" /></div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 tracking-wider whitespace-nowrap border-b border-gray-200">
                                        <div className="flex items-center justify-between">Unspent Balance <ChevronsUpDown className="w-4 h-4 text-gray-600" /></div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredItems.length > 0 ? (
                                    filteredItems.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">{index + 1}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">{item.kvk_name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">{item.project_name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">{item.funding_agency}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">{item.budget_estimate}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">{item.budget_allocated}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">{item.budget_released}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">{item.expenditure}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{item.unspent_balance}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-12 text-center border-t border-gray-200">
                                            <p className="text-gray-900 font-medium text-base">No data available in table</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
