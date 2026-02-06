import React from 'react'
import { Card, CardContent } from '../ui/Card'
import { useDashboardStore } from '../../stores/dashboardStore'
import {
    Building2,
    Users,
    Car,
    TrendingUp,
    FileText,
    BarChart3,
} from 'lucide-react'

export const MetricsCards: React.FC = () => {
    const { filteredData } = useDashboardStore()

    const metrics = [
        {
            label: 'Total KVKs',
            value: filteredData.totalKVKs,
            icon: <Building2 className="w-6 h-6" />,
            color: 'bg-[#487749]',
        },
        {
            label: 'Staff Count',
            value: filteredData.totalStaff,
            icon: <Users className="w-6 h-6" />,
            color: 'bg-[#2196F3]',
        },
        {
            label: 'Vehicles',
            value: filteredData.vehicles.length,
            icon: <Car className="w-6 h-6" />,
            color: 'bg-[#FF9800]',
        },
        {
            label: 'Infrastructure %',
            value: `${filteredData.infraPercentage}%`,
            icon: <TrendingUp className="w-6 h-6" />,
            color: 'bg-[#9C27B0]',
        },
        {
            label: 'OFT Count',
            value: filteredData.oftCount,
            icon: <FileText className="w-6 h-6" />,
            color: 'bg-[#F44336]',
        },
        {
            label: 'FLD Count',
            value: filteredData.fldCount,
            icon: <BarChart3 className="w-6 h-6" />,
            color: 'bg-[#00BCD4]',
        },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric, index) => (
                <Card key={index}>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#757575] mb-1">
                                    {metric.label}
                                </p>
                                <p className="text-2xl font-bold text-[#212121]">
                                    {metric.value}
                                </p>
                            </div>
                            <div
                                className={`${metric.color} text-white p-3 rounded-xl`}
                            >
                                {metric.icon}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
