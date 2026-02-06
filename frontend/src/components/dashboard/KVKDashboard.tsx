import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '../ui/Card'
import { useAuthStore } from '../../stores/authStore'
import {
    FileText,
    BarChart3,
    Users,
    GraduationCap,
    Tag,
    Building2,
    CreditCard,
    UserCircle,
} from 'lucide-react'

// Mock data for KVK User - Year-wise data
const mockKVKDataByYear: Record<string, {
    kvk: string;
    oft: { completed: number; total: number };
    fld: { completed: number; total: number };
    training: number;
    extensionActivity: number;
    staff: number;
}> = {
    'All': {
        kvk: 'KVK Araria',
        oft: { completed: 2, total: 2 },
        fld: { completed: 5, total: 8 },
        training: 140,
        extensionActivity: 45,
        staff: 25,
    },
    '2023': {
        kvk: 'KVK Araria',
        oft: { completed: 1, total: 2 },
        fld: { completed: 4, total: 6 },
        training: 98,
        extensionActivity: 32,
        staff: 22,
    },
    '2024': {
        kvk: 'KVK Araria',
        oft: { completed: 2, total: 2 },
        fld: { completed: 3, total: 5 },
        training: 125,
        extensionActivity: 38,
        staff: 24,
    },
    '2025': {
        kvk: 'KVK Araria',
        oft: { completed: 2, total: 2 },
        fld: { completed: 6, total: 10 },
        training: 140,
        extensionActivity: 45,
        staff: 25,
    },
    '2026': {
        kvk: 'KVK Araria',
        oft: { completed: 1, total: 3 },
        fld: { completed: 2, total: 4 },
        training: 52,
        extensionActivity: 18,
        staff: 25,
    },
}

export const KVKDashboard: React.FC = () => {
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const [selectedYear, setSelectedYear] = useState('All')

    // Get data based on selected year
    const currentData = mockKVKDataByYear[selectedYear] || mockKVKDataByYear['All']

    const kpiCards = [
        {
            label: 'OFT Progress',
            value: `${currentData.oft.completed}/${currentData.oft.total}`,
            icon: <FileText className="w-6 h-6" />,
            bgColor: 'bg-[#E8F5E9]',
            iconColor: 'text-[#487749]',
        },
        {
            label: 'FLD Progress',
            value: `${currentData.fld.completed}/${currentData.fld.total}`,
            icon: <BarChart3 className="w-6 h-6" />,
            bgColor: 'bg-[#E8F5E9]',
            iconColor: 'text-[#487749]',
        },
        {
            label: 'Training',
            value: currentData.training,
            icon: <GraduationCap className="w-6 h-6" />,
            bgColor: 'bg-[#E8F5E9]',
            iconColor: 'text-[#487749]',
        },
        {
            label: 'Extension Activity',
            value: currentData.extensionActivity,
            icon: <Users className="w-6 h-6" />,
            bgColor: 'bg-[#E8F5E9]',
            iconColor: 'text-[#487749]',
        },
        {
            label: 'Staff',
            value: currentData.staff,
            icon: <Tag className="w-6 h-6" />,
            bgColor: 'bg-[#E8F5E9]',
            iconColor: 'text-[#487749]',
        },
        {
            label: 'KVK',
            value: currentData.kvk,
            icon: <Building2 className="w-6 h-6" />,
            bgColor: 'bg-[#E8F5E9]',
            iconColor: 'text-[#487749]',
        },
    ]

    const oftProgress = (currentData.oft.completed / currentData.oft.total) * 100
    const fldProgress = (currentData.fld.completed / currentData.fld.total) * 100

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-[#212121] mb-2">
                        Welcome, {user?.name}
                    </h2>
                    <p className="text-[#757575]">
                        View your KVK dashboard and manage your activities.
                    </p>
                </CardContent>
            </Card>

            {/* Year Filter */}
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
                                    <p className="text-3xl font-bold text-[#212121]">
                                        {card.value}
                                    </p>
                                </div>
                                <div
                                    className={`${card.bgColor} ${card.iconColor} p-4 rounded-xl border border-[#E0E0E0]`}
                                >
                                    {card.icon}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Progress Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* OFT Progress */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-[#212121] mb-4">
                            OFT Progress
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-[#212121]">
                                        Completed Tasks
                                    </span>
                                    <span className="px-3 py-1 rounded-xl text-xs font-medium bg-[#E8F5E9] text-[#487749] border border-[#C8E6C9]">
                                        {currentData.oft.completed}/
                                        {currentData.oft.total}
                                    </span>
                                </div>
                                <div className="w-full bg-[#E0E0E0] rounded-full h-3">
                                    <div
                                        className="bg-[#487749] h-3 rounded-full"
                                        style={{ width: `${oftProgress}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* FLD Progress */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-[#212121] mb-4">
                            FLD Progress
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-[#212121]">
                                        Completed Tasks
                                    </span>
                                    <span className="px-3 py-1 rounded-xl text-xs font-medium bg-[#E8F5E9] text-[#487749] border border-[#C8E6C9]">
                                        {currentData.fld.completed}/
                                        {currentData.fld.total}
                                    </span>
                                </div>
                                <div className="w-full bg-[#E0E0E0] rounded-full h-3">
                                    <div
                                        className="bg-[#487749] h-3 rounded-full"
                                        style={{ width: `${fldProgress}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Management Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate('/kvk/details')}
                >
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-[#E8F5E9] p-4 rounded-xl border border-[#C8E6C9]">
                                <Building2 className="w-8 h-8 text-[#487749]" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-[#212121] mb-1">
                                    KVK Details
                                </h3>
                                <p className="text-sm text-[#757575]">
                                    View and edit KVK information
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate('/kvk/bank-accounts')}
                >
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-[#E8F5E9] p-4 rounded-xl border border-[#C8E6C9]">
                                <CreditCard className="w-8 h-8 text-[#487749]" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-[#212121] mb-1">
                                    Bank Accounts
                                </h3>
                                <p className="text-sm text-[#757575]">
                                    Manage bank account details
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate('/kvk/staff')}
                >
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-[#E8F5E9] p-4 rounded-xl border border-[#C8E6C9]">
                                <UserCircle className="w-8 h-8 text-[#487749]" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-[#212121] mb-1">
                                    Staff Members
                                </h3>
                                <p className="text-sm text-[#757575]">
                                    Manage staff and employees
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
