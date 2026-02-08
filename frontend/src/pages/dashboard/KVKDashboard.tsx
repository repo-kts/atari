import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '../../components/ui/Card'
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
            <Card className="bg-gradient-to-r from-[#487749] to-[#5c9a5e] border-none overflow-hidden relative">
                <CardContent className="p-8 relative z-10 text-white">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-2xl font-bold">
                            Welcome Back, {user?.name}!
                        </h2>
                        <p className="text-white/80 font-medium max-w-xl">
                            Here's what's happening at your KVK today. Track your progress across various activities and manage your station's data efficiently.
                        </p>
                    </div>
                </CardContent>
                <div className="absolute top-0 right-0 w-64 h-full bg-white/10 -skew-x-12 translate-x-32" />
            </Card>

            {/* Year Filter */}
            <div className="flex flex-wrap gap-4 items-end bg-[#FAF9F6] p-4 rounded-xl border border-[#E0E0E0]">
                <div className="w-full sm:w-48">
                    <label className="block text-xs font-bold text-[#487749] uppercase tracking-wider mb-2">
                        Reporting Year
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
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {kpiCards.map((card, index) => (
                    <Card key={index} className="border-[#E0E0E0] hover:border-[#487749]/30 transition-all duration-300 group hover:shadow-sm">
                        <CardContent className="p-5">
                            <div className="flex flex-col gap-3">
                                <div
                                    className={`${card.bgColor} ${card.iconColor} w-10 h-10 rounded-xl border border-[#E0E0E0] flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                                >
                                    {React.cloneElement(card.icon as React.ReactElement, { className: 'w-5 h-5' } as any)}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-[#757575] uppercase tracking-wider mb-1 line-clamp-1">
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

            {/* Progress Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* OFT Progress */}
                <Card className="border-[#E0E0E0]">
                    <CardContent className="p-0">
                        <div className="p-5 border-b border-[#E0E0E0] bg-[#FAF9F6]">
                            <h3 className="text-base font-bold text-[#487749] uppercase tracking-wider">
                                On-Farm Testing (OFT) Progress
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-bold text-[#212121]">
                                            Tasks Completion
                                        </span>
                                        <span className="px-3 py-1 rounded-xl text-xs font-bold bg-[#E8F5E9] text-[#487749] border border-[#C8E6C9]">
                                            {currentData.oft.completed} / {currentData.oft.total}
                                        </span>
                                    </div>
                                    <div className="w-full bg-[#F5F5F5] rounded-full h-3 border border-[#E0E0E0]/50">
                                        <div
                                            className="bg-[#487749] h-3 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${oftProgress}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-[#757575] mt-3 font-medium italic">
                                        * Progress is based on total allotted trials for the current year.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* FLD Progress */}
                <Card className="border-[#E0E0E0]">
                    <CardContent className="p-0">
                        <div className="p-5 border-b border-[#E0E0E0] bg-[#FAF9F6]">
                            <h3 className="text-base font-bold text-[#487749] uppercase tracking-wider">
                                Front Line Demonstration (FLD) Progress
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-bold text-[#212121]">
                                            Demonstration Status
                                        </span>
                                        <span className="px-3 py-1 rounded-xl text-xs font-bold bg-[#E8F5E9] text-[#487749] border border-[#C8E6C9]">
                                            {currentData.fld.completed} / {currentData.fld.total}
                                        </span>
                                    </div>
                                    <div className="w-full bg-[#F5F5F5] rounded-full h-3 border border-[#E0E0E0]/50">
                                        <div
                                            className="bg-[#487749] h-3 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${fldProgress}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-[#757575] mt-3 font-medium italic">
                                        * Progress is tracked across all major crop demonstration plots.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Management Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card
                    className="cursor-pointer border-[#E0E0E0] hover:border-[#487749]/30 transition-all duration-300 group hover:shadow-sm"
                    onClick={() => navigate('/kvk/details')}
                >
                    <CardContent className="p-6">
                        <div className="flex items-center gap-5">
                            <div className="bg-[#E8F5E9] p-4 rounded-xl border border-[#E0E0E0] group-hover:scale-110 transition-transform duration-300">
                                <Building2 className="w-8 h-8 text-[#487749]" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#212121] mb-1">
                                    KVK Details
                                </h3>
                                <p className="text-sm text-[#757575] font-medium">
                                    Manage profile and assets
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className="cursor-pointer border-[#E0E0E0] hover:border-[#487749]/30 transition-all duration-300 group hover:shadow-sm"
                    onClick={() => navigate('/kvk/bank-accounts')}
                >
                    <CardContent className="p-6">
                        <div className="flex items-center gap-5">
                            <div className="bg-[#E8F5E9] p-4 rounded-xl border border-[#E0E0E0] group-hover:scale-110 transition-transform duration-300">
                                <CreditCard className="w-8 h-8 text-[#487749]" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#212121] mb-1">
                                    Bank Accounts
                                </h3>
                                <p className="text-sm text-[#757575] font-medium">
                                    Manage financial details
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className="cursor-pointer border-[#E0E0E0] hover:border-[#487749]/30 transition-all duration-300 group hover:shadow-sm"
                    onClick={() => navigate('/kvk/staff')}
                >
                    <CardContent className="p-6">
                        <div className="flex items-center gap-5">
                            <div className="bg-[#E8F5E9] p-4 rounded-xl border border-[#E0E0E0] group-hover:scale-110 transition-transform duration-300">
                                <UserCircle className="w-8 h-8 text-[#487749]" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#212121] mb-1">
                                    Staff Directory
                                </h3>
                                <p className="text-sm text-[#757575] font-medium">
                                    Manage human resources
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
