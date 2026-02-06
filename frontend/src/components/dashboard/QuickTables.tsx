import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardContent } from '../ui/Card'
import { useDashboardStore } from '../../stores/dashboardStore'
import { ArrowRight } from 'lucide-react'

export const QuickTables: React.FC = () => {
    const navigate = useNavigate()
    const { filteredData } = useDashboardStore()

    const handleRowClick = (path: string) => {
        navigate(path)
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Staff Table */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-[#212121]">
                        Recent Staff
                    </h3>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#E0E0E0]">
                                    <th className="text-left py-2 px-2 text-sm font-medium text-[#757575]">
                                        Name
                                    </th>
                                    <th className="text-left py-2 px-2 text-sm font-medium text-[#757575]">
                                        KVK
                                    </th>
                                    <th className="text-left py-2 px-2 text-sm font-medium text-[#757575]">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.staff.slice(0, 5).map(staff => (
                                    <tr
                                        key={staff.id}
                                        onClick={() =>
                                            handleRowClick(
                                                `/forms/employee-details?id=${staff.id}`
                                            )
                                        }
                                        className="border-b border-[#E0E0E0] hover:bg-[#F5F5F5] cursor-pointer transition-colors"
                                    >
                                        <td className="py-2 px-2 text-sm text-[#212121]">
                                            {staff.name}
                                        </td>
                                        <td className="py-2 px-2 text-sm text-[#757575]">
                                            {staff.kvk}
                                        </td>
                                        <td className="py-2 px-2 text-sm text-[#757575]">
                                            {staff.date}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredData.staff.length === 0 && (
                            <div className="text-center py-8 text-[#757575]">
                                No staff data available
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() =>
                            handleRowClick('/forms/employee-details')
                        }
                        className="mt-4 flex items-center gap-2 text-sm text-[#487749] hover:text-[#487749] transition-colors"
                    >
                        View All <ArrowRight className="w-4 h-4" />
                    </button>
                </CardContent>
            </Card>

            {/* Top Infrastructure Table */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-[#212121]">
                        Top Infrastructure
                    </h3>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#E0E0E0]">
                                    <th className="text-left py-2 px-2 text-sm font-medium text-[#757575]">
                                        KVK
                                    </th>
                                    <th className="text-left py-2 px-2 text-sm font-medium text-[#757575]">
                                        Type
                                    </th>
                                    <th className="text-left py-2 px-2 text-sm font-medium text-[#757575]">
                                        %
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.infrastructure
                                    .sort((a, b) => b.completion - a.completion)
                                    .slice(0, 5)
                                    .map(infra => (
                                        <tr
                                            key={infra.id}
                                            onClick={() =>
                                                handleRowClick(
                                                    `/forms/infrastructure?id=${infra.id}`
                                                )
                                            }
                                            className="border-b border-[#E0E0E0] hover:bg-[#F5F5F5] cursor-pointer transition-colors"
                                        >
                                            <td className="py-2 px-2 text-sm text-[#212121]">
                                                {infra.kvk}
                                            </td>
                                            <td className="py-2 px-2 text-sm text-[#757575]">
                                                {infra.type}
                                            </td>
                                            <td className="py-2 px-2 text-sm text-[#757575]">
                                                {infra.completion}%
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                        {filteredData.infrastructure.length === 0 && (
                            <div className="text-center py-8 text-[#757575]">
                                No infrastructure data available
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => handleRowClick('/forms/infrastructure')}
                        className="mt-4 flex items-center gap-2 text-sm text-[#487749] hover:text-[#487749] transition-colors"
                    >
                        View All <ArrowRight className="w-4 h-4" />
                    </button>
                </CardContent>
            </Card>

            {/* Vehicle Summary Table */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-[#212121]">
                        Vehicle Summary
                    </h3>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#E0E0E0]">
                                    <th className="text-left py-2 px-2 text-sm font-medium text-[#757575]">
                                        Vehicle
                                    </th>
                                    <th className="text-left py-2 px-2 text-sm font-medium text-[#757575]">
                                        Status
                                    </th>
                                    <th className="text-left py-2 px-2 text-sm font-medium text-[#757575]">
                                        KM
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.vehicles
                                    .slice(0, 5)
                                    .map((vehicle, index) => (
                                        <tr
                                            key={index}
                                            onClick={() =>
                                                handleRowClick(
                                                    `/forms/vehicle-details?vehicle=${vehicle.name}`
                                                )
                                            }
                                            className="border-b border-[#E0E0E0] hover:bg-[#F5F5F5] cursor-pointer transition-colors"
                                        >
                                            <td className="py-2 px-2 text-sm text-[#212121]">
                                                {vehicle.name}
                                            </td>
                                            <td className="py-2 px-2 text-sm">
                                                <span
                                                    className={`px-2 py-1 rounded text-xs ${
                                                        vehicle.status ===
                                                        'Active'
                                                            ? 'bg-[#E8F5E9] text-[#487749] border border-[#C8E6C9]'
                                                            : 'bg-[#FFF3E0] text-[#FF9800]'
                                                    }`}
                                                >
                                                    {vehicle.status}
                                                </span>
                                            </td>
                                            <td className="py-2 px-2 text-sm text-[#757575]">
                                                {vehicle.km.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                        {filteredData.vehicles.length === 0 && (
                            <div className="text-center py-8 text-[#757575]">
                                No vehicle data available
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => handleRowClick('/forms/vehicle-details')}
                        className="mt-4 flex items-center gap-2 text-sm text-[#487749] hover:text-[#487749] transition-colors"
                    >
                        View All <ArrowRight className="w-4 h-4" />
                    </button>
                </CardContent>
            </Card>
        </div>
    )
}
