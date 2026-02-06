import React, { useState } from 'react'
import { ChevronsUpDown } from 'lucide-react'
import { Card, CardContent } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { SmartBackButton } from '../../../components/common/SmartBackButton'

// Generic Placeholder List for Missing Sections
// Since the user didn't provide specific images for these, we'll create a standard structure 
// that can be easily customized later. Using "Any" for strict-compatibility for now.

export const GenericMiscellaneousList: React.FC<{ title: string }> = ({ title }) => {
    // Mock data for display purposes
    const [items] = useState<any[]>([])

    return (
        <div className="space-y-8 p-6 w-full min-w-0 font-sans">
            <SmartBackButton fallbackPath="/forms/miscellaneous" showBreadcrumbs />

            <div className="flex flex-col gap-6">
                <h1 className="text-2xl font-bold text-[#212121]">{title}</h1>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="w-64">
                        <label className="block text-sm font-medium text-[#487749] mb-2">Reporting Year</label>
                        <select
                            className="w-full h-11 px-4 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white text-[#212121]"
                        >
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
                    </div>
                </div>
            </div>

            <Card className="w-full overflow-hidden border-none shadow-xl shadow-gray-200/50 bg-white/80 backdrop-blur-sm rounded-3xl">
                <CardContent className="p-0">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[#CFE1D1]">
                                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 tracking-wider whitespace-nowrap border-b border-gray-200">
                                        <div className="flex items-center justify-between">S.No. <ChevronsUpDown className="w-4 h-4 text-gray-600" /></div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 tracking-wider whitespace-nowrap border-b border-gray-200">
                                        <div className="flex items-center justify-between">KVK Name <ChevronsUpDown className="w-4 h-4 text-gray-600" /></div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 tracking-wider whitespace-nowrap border-b border-gray-200">
                                        <div className="flex items-center justify-between">Details <ChevronsUpDown className="w-4 h-4 text-gray-600" /></div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {items.length > 0 ? (
                                    items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-3 text-sm text-gray-700">{index + 1}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-12 text-center border-t border-gray-200">
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
