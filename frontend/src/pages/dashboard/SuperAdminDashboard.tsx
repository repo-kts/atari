import React, { useState } from 'react'
import { Card, CardContent } from '../../components/ui/Card'
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
            <div className="flex flex-wrap gap-4 items-end bg-[#FAF9F6] p-4 rounded-xl mb-6">
                <div className="w-full sm:w-48">
                    <label className="block text-xs font-bold text-[#487749] uppercase tracking-wider mb-2">
                        Year
                    </label>
                    <select
                        value={selectedYear}
                        onChange={e => setSelectedYear(e.target.value)}
                        className="w-full h-11 px-4 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white text-[#212121] text-sm font-medium transition-all duration-200 hover:border-[#487749]/50"
                    >
                        <option value="All">All Years</option>
                        <option value="2023">2023</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                    </select>
                </div>
                <div className="w-full sm:w-64">
                    <label className="block text-xs font-bold text-[#487749] uppercase tracking-wider mb-2">
                        Filter by KVK
                    </label>
                    <select
                        value={selectedKVK}
                        onChange={e => setSelectedKVK(e.target.value)}
                        className="w-full h-11 px-4 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#487749]/20 focus:border-[#487749] bg-white text-[#212121] text-sm font-medium transition-all duration-200 hover:border-[#487749]/50"
                    >
                        <option value="All">All KVKs</option>
                        <option value="KVK Araria">KVK Araria</option>
                        <option value="KVK Arwal">KVK Arwal</option>
                        <option value="KVK Aurangabad">KVK Aurangabad</option>
                        <option value="KVK Banka">KVK Banka</option>
                    </select>
                </div>
                <div className="ml-auto">
                    <button
                        onClick={() => { setSelectedYear('All'); setSelectedKVK('All'); }}
                        className="px-4 py-2 text-sm font-medium text-[#757575] hover:text-[#487749] transition-colors"
                    >
                        Reset Filters
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {kpiCards.map((card, index) => (
                    <Card key={index} className="border-[#E0E0E0] hover:border-[#487749]/30 transition-all duration-300 group  hover:shadow-sm">
                        <CardContent className="p-5">
                            <div className="flex flex-col gap-3">
                                <div
                                    className={`${card.bgColor} ${card.iconColor} w-10 h-10 rounded-xl border border-[#E0E0E0] flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                                >
                                    {React.cloneElement(card.icon as React.ReactElement, { className: 'w-5 h-5' } as any)}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-[#757575] uppercase tracking-wider mb-1">
                                        {card.label}
                                    </p>
                                    <p className="text-2xl font-bold text-[#212121]">
                                        {card.value}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Data Progress Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-2">
                {/* OFT Table */}
                <Card className="border-[#E0E0E0] ">
                    <CardContent className="p-0">
                        <div className="p-5 border-b border-[#E0E0E0] bg-[#FAF9F6]">
                            <h3 className="text-base font-bold text-[#487749] uppercase tracking-wider">
                                On-Farm Testing (OFT) Progress
                            </h3>
                        </div>
                        <div className="p-6 space-y-5">
                            {filteredOFTData.map((item, index) => {
                                const progress = calculateProgress(
                                    item.completed,
                                    item.total
                                )
                                return (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-[#212121]">
                                                {item.kvk}
                                            </span>
                                            <span
                                                className={`px-3 py-1 rounded-xl text-xs font-bold ${getBadgeColor(
                                                    item.status
                                                )}`}
                                            >
                                                {item.completed} / {item.total}
                                            </span>
                                        </div>
                                        <div className="w-full bg-[#F5F5F5] rounded-full h-2 border border-[#E0E0E0]/50">
                                            <div
                                                className={`h-2 rounded-full ${getProgressColor(
                                                    item.status
                                                )} transition-all duration-1000 ease-out`}
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
                <Card className="border-[#E0E0E0] ">
                    <CardContent className="p-0">
                        <div className="p-5 border-b border-[#E0E0E0] bg-[#FAF9F6]">
                            <h3 className="text-base font-bold text-[#487749] uppercase tracking-wider">
                                Front Line Demonstration (FLD) Progress
                            </h3>
                        </div>
                        <div className="p-6 space-y-5">
                            {filteredFLDData.map((item, index) => {
                                const progress = calculateProgress(
                                    item.completed,
                                    item.total
                                )
                                return (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-[#212121]">
                                                {item.kvk}
                                            </span>
                                            <span
                                                className={`px-3 py-1 rounded-xl text-xs font-bold ${getBadgeColor(
                                                    item.status
                                                )}`}
                                            >
                                                {item.completed} / {item.total}
                                            </span>
                                        </div>
                                        <div className="w-full bg-[#F5F5F5] rounded-full h-2 border border-[#E0E0E0]/50">
                                            <div
                                                className={`h-2 rounded-full ${getProgressColor(
                                                    item.status
                                                )} transition-all duration-1000 ease-out`}
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
                <Card className="border-[#E0E0E0] ">
                    <CardContent className="p-0">
                        <div className="p-5 border-b border-[#E0E0E0] bg-[#FAF9F6] flex items-center justify-between">
                            <h3 className="text-base font-bold text-[#487749] uppercase tracking-wider">
                                Training Activities
                            </h3>
                            <div className="flex gap-2">
                                <select className="text-[10px] font-bold uppercase tracking-wider border border-[#E0E0E0] rounded-lg px-2 py-1 focus:outline-none focus:border-[#487749] bg-white text-[#757575]">
                                    <option>Categories</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-6 space-y-5">
                            {filteredTrainingData.map((item, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-[#212121]">
                                            {item.kvk}
                                        </span>
                                        <span
                                            className={`px-3 py-1 rounded-xl text-xs font-bold ${getBadgeColor(
                                                item.status
                                            )}`}
                                        >
                                            {item.count} Sessions
                                        </span>
                                    </div>
                                    <div className="w-full bg-[#F5F5F5] rounded-full h-2 border border-[#E0E0E0]/50">
                                        <div
                                            className={`h-2 rounded-full ${getProgressColor(
                                                item.status
                                            )} transition-all duration-1000 ease-out`}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Extension Activity Table */}
                <Card className="border-[#E0E0E0] ">
                    <CardContent className="p-0">
                        <div className="p-5 border-b border-[#E0E0E0] bg-[#FAF9F6] flex items-center justify-between">
                            <h3 className="text-base font-bold text-[#487749] uppercase tracking-wider">
                                Extension Activities
                            </h3>
                            <button className="text-[10px] font-bold uppercase tracking-wider text-[#487749] hover:underline">
                                View Details
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            {filteredExtensionData.map((item, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-[#212121]">
                                            {item.kvk}
                                        </span>
                                        <span
                                            className={`px-3 py-1 rounded-xl text-xs font-bold ${getBadgeColor(
                                                item.status
                                            )}`}
                                        >
                                            {item.count} Activities
                                        </span>
                                    </div>
                                    <div className="w-full bg-[#F5F5F5] rounded-full h-2 border border-[#E0E0E0]/50">
                                        <div
                                            className={`h-2 rounded-full ${getProgressColor(
                                                item.status
                                            )} transition-all duration-1000 ease-out`}
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
