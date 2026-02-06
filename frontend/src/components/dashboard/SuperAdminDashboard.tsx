import React, { useState } from 'react'
import { Card, CardContent } from '../ui/Card'
import {
    Users,
    FileText,
    BarChart3,
    GraduationCap,
    Tag,
} from 'lucide-react'

// Mock data for Super Admin - Year-wise data
const mockDataByYear: Record<string, {
    kpiData: { organization: number; kvk: number; totalOFT: number; totalFLD: number; training: number; totalStaff: number };
    oftData: { kvk: string; completed: number; total: number; status: string }[];
    fldData: { kvk: string; completed: number; total: number; status: string }[];
    trainingData: { kvk: string; count: number; status: string }[];
    extensionActivity: { kvk: string; count: number; status: string }[];
}> = {
    'All': {
        kpiData: { organization: 9, kvk: 66, totalOFT: 462, totalFLD: 788, training: 7284, totalStaff: 636 },
        oftData: [
            { kvk: 'KVK Araria', completed: 2, total: 2, status: 'complete' },
            { kvk: 'KVK Arwal', completed: 3, total: 5, status: 'in-progress' },
            { kvk: 'KVK Aurangabad', completed: 0, total: 7, status: 'pending' },
            { kvk: 'KVK Banka', completed: 3, total: 4, status: 'in-progress' },
        ],
        fldData: [
            { kvk: 'KVK Araria', completed: 5, total: 8, status: 'in-progress' },
            { kvk: 'KVK Arwal', completed: 19, total: 23, status: 'in-progress' },
            { kvk: 'KVK Aurangabad', completed: 0, total: 5, status: 'pending' },
            { kvk: 'KVK Banka', completed: 5, total: 9, status: 'in-progress' },
        ],
        trainingData: [
            { kvk: 'KVK Araria', count: 140, status: 'active' },
            { kvk: 'KVK Arwal', count: 89, status: 'active' },
            { kvk: 'KVK Aurangabad', count: 45, status: 'active' },
            { kvk: 'KVK Banka', count: 120, status: 'active' },
        ],
        extensionActivity: [
            { kvk: 'KVK Araria', count: 45, status: 'active' },
            { kvk: 'KVK Arwal', count: 114, status: 'active' },
            { kvk: 'KVK Aurangabad', count: 67, status: 'active' },
            { kvk: 'KVK Banka', count: 89, status: 'active' },
        ],
    },
    '2023': {
        kpiData: { organization: 8, kvk: 58, totalOFT: 320, totalFLD: 540, training: 5120, totalStaff: 580 },
        oftData: [
            { kvk: 'KVK Araria', completed: 1, total: 2, status: 'in-progress' },
            { kvk: 'KVK Arwal', completed: 3, total: 3, status: 'complete' },
            { kvk: 'KVK Aurangabad', completed: 2, total: 5, status: 'in-progress' },
            { kvk: 'KVK Banka', completed: 2, total: 4, status: 'in-progress' },
        ],
        fldData: [
            { kvk: 'KVK Araria', completed: 4, total: 5, status: 'in-progress' },
            { kvk: 'KVK Arwal', completed: 12, total: 15, status: 'in-progress' },
            { kvk: 'KVK Aurangabad', completed: 3, total: 8, status: 'in-progress' },
            { kvk: 'KVK Banka', completed: 6, total: 6, status: 'complete' },
        ],
        trainingData: [
            { kvk: 'KVK Araria', count: 98, status: 'active' },
            { kvk: 'KVK Arwal', count: 67, status: 'active' },
            { kvk: 'KVK Aurangabad', count: 32, status: 'active' },
            { kvk: 'KVK Banka', count: 85, status: 'active' },
        ],
        extensionActivity: [
            { kvk: 'KVK Araria', count: 32, status: 'active' },
            { kvk: 'KVK Arwal', count: 78, status: 'active' },
            { kvk: 'KVK Aurangabad', count: 45, status: 'active' },
            { kvk: 'KVK Banka', count: 56, status: 'active' },
        ],
    },
    '2024': {
        kpiData: { organization: 9, kvk: 62, totalOFT: 398, totalFLD: 650, training: 6450, totalStaff: 610 },
        oftData: [
            { kvk: 'KVK Araria', completed: 2, total: 2, status: 'complete' },
            { kvk: 'KVK Arwal', completed: 2, total: 4, status: 'in-progress' },
            { kvk: 'KVK Aurangabad', completed: 3, total: 6, status: 'in-progress' },
            { kvk: 'KVK Banka', completed: 3, total: 3, status: 'complete' },
        ],
        fldData: [
            { kvk: 'KVK Araria', completed: 4, total: 6, status: 'in-progress' },
            { kvk: 'KVK Arwal', completed: 15, total: 18, status: 'in-progress' },
            { kvk: 'KVK Aurangabad', completed: 4, total: 7, status: 'in-progress' },
            { kvk: 'KVK Banka', completed: 7, total: 8, status: 'in-progress' },
        ],
        trainingData: [
            { kvk: 'KVK Araria', count: 125, status: 'active' },
            { kvk: 'KVK Arwal', count: 78, status: 'active' },
            { kvk: 'KVK Aurangabad', count: 38, status: 'active' },
            { kvk: 'KVK Banka', count: 105, status: 'active' },
        ],
        extensionActivity: [
            { kvk: 'KVK Araria', count: 38, status: 'active' },
            { kvk: 'KVK Arwal', count: 95, status: 'active' },
            { kvk: 'KVK Aurangabad', count: 52, status: 'active' },
            { kvk: 'KVK Banka', count: 72, status: 'active' },
        ],
    },
    '2025': {
        kpiData: { organization: 9, kvk: 66, totalOFT: 462, totalFLD: 788, training: 7284, totalStaff: 636 },
        oftData: [
            { kvk: 'KVK Araria', completed: 2, total: 2, status: 'complete' },
            { kvk: 'KVK Arwal', completed: 4, total: 5, status: 'in-progress' },
            { kvk: 'KVK Aurangabad', completed: 0, total: 7, status: 'pending' },
            { kvk: 'KVK Banka', completed: 3, total: 4, status: 'in-progress' },
        ],
        fldData: [
            { kvk: 'KVK Araria', completed: 6, total: 10, status: 'in-progress' },
            { kvk: 'KVK Arwal', completed: 19, total: 23, status: 'in-progress' },
            { kvk: 'KVK Aurangabad', completed: 0, total: 5, status: 'pending' },
            { kvk: 'KVK Banka', completed: 5, total: 9, status: 'in-progress' },
        ],
        trainingData: [
            { kvk: 'KVK Araria', count: 140, status: 'active' },
            { kvk: 'KVK Arwal', count: 89, status: 'active' },
            { kvk: 'KVK Aurangabad', count: 45, status: 'active' },
            { kvk: 'KVK Banka', count: 120, status: 'active' },
        ],
        extensionActivity: [
            { kvk: 'KVK Araria', count: 45, status: 'active' },
            { kvk: 'KVK Arwal', count: 114, status: 'active' },
            { kvk: 'KVK Aurangabad', count: 67, status: 'active' },
            { kvk: 'KVK Banka', count: 89, status: 'active' },
        ],
    },
    '2026': {
        kpiData: { organization: 9, kvk: 68, totalOFT: 185, totalFLD: 290, training: 2850, totalStaff: 645 },
        oftData: [
            { kvk: 'KVK Araria', completed: 1, total: 3, status: 'in-progress' },
            { kvk: 'KVK Arwal', completed: 2, total: 2, status: 'complete' },
            { kvk: 'KVK Aurangabad', completed: 0, total: 4, status: 'pending' },
            { kvk: 'KVK Banka', completed: 1, total: 2, status: 'in-progress' },
        ],
        fldData: [
            { kvk: 'KVK Araria', completed: 2, total: 4, status: 'in-progress' },
            { kvk: 'KVK Arwal', completed: 5, total: 8, status: 'in-progress' },
            { kvk: 'KVK Aurangabad', completed: 0, total: 3, status: 'pending' },
            { kvk: 'KVK Banka', completed: 2, total: 5, status: 'in-progress' },
        ],
        trainingData: [
            { kvk: 'KVK Araria', count: 52, status: 'active' },
            { kvk: 'KVK Arwal', count: 35, status: 'active' },
            { kvk: 'KVK Aurangabad', count: 18, status: 'active' },
            { kvk: 'KVK Banka', count: 48, status: 'active' },
        ],
        extensionActivity: [
            { kvk: 'KVK Araria', count: 18, status: 'active' },
            { kvk: 'KVK Arwal', count: 42, status: 'active' },
            { kvk: 'KVK Aurangabad', count: 25, status: 'active' },
            { kvk: 'KVK Banka', count: 32, status: 'active' },
        ],
    },
}

const getProgressColor = (status: string) => {
    switch (status) {
        case 'complete':
        case 'active':
            return 'bg-[#487749]'
        case 'in-progress':
            return 'bg-[#5c9a5e]'
        case 'over':
            return 'bg-amber-500'
        case 'pending':
            return 'bg-gray-300'
        default:
            return 'bg-gray-300'
    }
}

const getBadgeColor = (status: string) => {
    switch (status) {
        case 'complete':
        case 'active':
            return 'bg-[#E8F5E9] text-[#487749] border border-[#C8E6C9]'
        case 'in-progress':
            return 'bg-[#F1F8E9] text-[#487749] border border-[#DCEDC8]'
        case 'over':
            return 'bg-[#FFF3E0] text-[#F57C00] border border-[#FFE0B2]'
        case 'pending':
            return 'bg-[#F5F5F5] text-[#757575] border border-[#E0E0E0]'
        default:
            return 'bg-[#F5F5F5] text-[#757575] border border-[#E0E0E0]'
    }
}

export const SuperAdminDashboard: React.FC = () => {
    const [selectedYear, setSelectedYear] = useState('All')
    const [selectedKVK, setSelectedKVK] = useState('All')

    // Get data based on selected year
    const currentData = mockDataByYear[selectedYear] || mockDataByYear['All']
    const { kpiData, oftData, fldData, trainingData, extensionActivity } = currentData

    // Filter by KVK if selected
    const filteredOFTData = selectedKVK === 'All'
        ? oftData
        : oftData.filter(item => item.kvk === selectedKVK)
    const filteredFLDData = selectedKVK === 'All'
        ? fldData
        : fldData.filter(item => item.kvk === selectedKVK)
    const filteredTrainingData = selectedKVK === 'All'
        ? trainingData
        : trainingData.filter(item => item.kvk === selectedKVK)
    const filteredExtensionData = selectedKVK === 'All'
        ? extensionActivity
        : extensionActivity.filter(item => item.kvk === selectedKVK)

    const kpiCards = [
        {
            label: 'Organization',
            value: kpiData.organization,
            icon: <FileText className="w-6 h-6" />,
            bgColor: 'bg-[#E8F5E9]',
            iconColor: 'text-[#487749]',
        },
        {
            label: 'KVK',
            value: kpiData.kvk,
            icon: <BarChart3 className="w-6 h-6" />,
            bgColor: 'bg-[#E8F5E9]',
            iconColor: 'text-[#487749]',
        },
        {
            label: 'Total OFT',
            value: kpiData.totalOFT,
            icon: <Users className="w-6 h-6" />,
            bgColor: 'bg-[#E8F5E9]',
            iconColor: 'text-[#487749]',
        },
        {
            label: 'Total FLD',
            value: kpiData.totalFLD,
            icon: <FileText className="w-6 h-6" />,
            bgColor: 'bg-[#E8F5E9]',
            iconColor: 'text-[#487749]',
        },
        {
            label: 'Training',
            value: kpiData.training.toLocaleString(),
            icon: <GraduationCap className="w-6 h-6" />,
            bgColor: 'bg-[#E8F5E9]',
            iconColor: 'text-[#487749]',
        },
        {
            label: 'Total Staff',
            value: kpiData.totalStaff,
            icon: <Tag className="w-6 h-6" />,
            bgColor: 'bg-[#E8F5E9]',
            iconColor: 'text-[#487749]',
        },
    ]

    const calculateProgress = (completed: number, total: number) => {
        if (total === 0) return 0
        return Math.min((completed / total) * 100, 100)
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex gap-4">
                <div className="w-48">
                    <label className="block text-sm font-medium text-[#487749] mb-2">
                        Year
                    </label>
                    <select
                        value={selectedYear}
                        onChange={e => setSelectedYear(e.target.value)}
                        className="w-full h-12 px-4 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white text-[#212121] transition-all duration-200 hover:border-[#BDBDBD]"
                    >
                        <option value="All">All</option>
                        <option value="2023">2023</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                    </select>
                </div>
                <div className="w-48">
                    <label className="block text-sm font-medium text-[#487749] mb-2">
                        KVK
                    </label>
                    <select
                        value={selectedKVK}
                        onChange={e => setSelectedKVK(e.target.value)}
                        className="w-full h-12 px-4 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white text-[#212121] transition-all duration-200 hover:border-[#BDBDBD]"
                    >
                        <option value="All">All</option>
                        <option value="KVK Araria">KVK Araria</option>
                        <option value="KVK Arwal">KVK Arwal</option>
                        <option value="KVK Aurangabad">KVK Aurangabad</option>
                        <option value="KVK Banka">KVK Banka</option>
                    </select>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {kpiCards.map((card, index) => (
                    <Card key={index} className="overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-[#757575] mb-1">
                                        {card.label}
                                    </p>
                                    <p className="text-3xl font-semibold text-[#212121]">
                                        {card.value}
                                    </p>
                                </div>
                                <div
                                    className={`${card.bgColor} ${card.iconColor} p-3 rounded-xl border border-[#E0E0E0]`}
                                >
                                    {card.icon}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Data Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* OFT Table */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-[#212121] mb-4">
                            OFT
                        </h3>
                        <div className="space-y-3">
                            {filteredOFTData.map((item, index) => {
                                const progress = calculateProgress(
                                    item.completed,
                                    item.total
                                )
                                return (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-[#212121]">
                                                {index + 1} {item.kvk}
                                            </span>
                                            <span
                                                className={`px-2.5 py-1 rounded-xl text-xs font-medium ${getBadgeColor(
                                                    item.status
                                                )}`}
                                            >
                                                {item.completed}/{item.total}
                                            </span>
                                        </div>
                                        <div className="w-full bg-[#E0E0E0] rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${getProgressColor(
                                                    item.status
                                                )}`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* FLD Table */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-[#212121] mb-4">
                            FLD
                        </h3>
                        <div className="space-y-3">
                            {filteredFLDData.map((item, index) => {
                                const progress = calculateProgress(
                                    item.completed,
                                    item.total
                                )
                                return (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-[#212121]">
                                                {index + 1} {item.kvk}
                                            </span>
                                            <span
                                                className={`px-2.5 py-1 rounded-xl text-xs font-medium ${getBadgeColor(
                                                    item.status
                                                )}`}
                                            >
                                                {item.completed}/{item.total}
                                            </span>
                                        </div>
                                        <div className="w-full bg-[#E0E0E0] rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${getProgressColor(
                                                    item.status
                                                )}`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Training Table */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-[#212121]">
                                Training
                            </h3>
                            <div className="flex gap-2">
                                <select className="text-xs border border-[#E0E0E0] rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white text-[#212121] transition-all duration-200">
                                    <option>All</option>
                                </select>
                                <select className="text-xs border border-[#E0E0E0] rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white text-[#212121] transition-all duration-200">
                                    <option>All</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {filteredTrainingData.map((item, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-[#212121]">
                                            {index + 1} {item.kvk}
                                        </span>
                                        <span
                                            className={`px-2.5 py-1 rounded-xl text-xs font-medium ${getBadgeColor(
                                                item.status
                                            )}`}
                                        >
                                            {item.count}
                                        </span>
                                    </div>
                                    <div className="w-full bg-[#E0E0E0] rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${getProgressColor(
                                                item.status
                                            )}`}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Extension Activity Table */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-[#212121]">
                                Extension Activity
                            </h3>
                            <select className="text-xs border border-[#E0E0E0] rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white text-[#212121] transition-all duration-200">
                                <option>All</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            {filteredExtensionData.map((item, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-[#212121]">
                                            {index + 1} {item.kvk}
                                        </span>
                                        <span
                                            className={`px-2.5 py-1 rounded-xl text-xs font-medium ${getBadgeColor(
                                                item.status
                                            )}`}
                                        >
                                            {item.count}
                                        </span>
                                    </div>
                                    <div className="w-full bg-[#E0E0E0] rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${getProgressColor(
                                                item.status
                                            )}`}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
