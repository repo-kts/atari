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

// Mock data for KVK User (their own KVK data)
const mockKVKData = {
    kvk: 'KVK Araria',
    oft: { completed: 2, total: 2 },
    fld: { completed: 7, total: 3 },
    training: 140,
    extensionActivity: 45,
    staff: 25,
}

export const KVKDashboard: React.FC = () => {
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const [selectedYear, setSelectedYear] = useState('All')

    const kpiCards = [
        {
            label: 'OFT Progress',
            value: `${mockKVKData.oft.completed}/${mockKVKData.oft.total}`,
            icon: <FileText className="w-6 h-6" />,
            bgColor: 'bg-emerald-50',
            iconColor: 'text-emerald-700',
        },
        {
            label: 'FLD Progress',
            value: `${mockKVKData.fld.completed}/${mockKVKData.fld.total}`,
            icon: <BarChart3 className="w-6 h-6" />,
            bgColor: 'bg-emerald-50',
            iconColor: 'text-emerald-700',
        },
        {
            label: 'Training',
            value: mockKVKData.training,
            icon: <GraduationCap className="w-6 h-6" />,
            bgColor: 'bg-emerald-50',
            iconColor: 'text-emerald-700',
        },
        {
            label: 'Extension Activity',
            value: mockKVKData.extensionActivity,
            icon: <Users className="w-6 h-6" />,
            bgColor: 'bg-emerald-50',
            iconColor: 'text-emerald-700',
        },
        {
            label: 'Staff',
            value: mockKVKData.staff,
            icon: <Tag className="w-6 h-6" />,
            bgColor: 'bg-emerald-50',
            iconColor: 'text-emerald-700',
        },
        {
            label: 'KVK',
            value: mockKVKData.kvk,
            icon: <Building2 className="w-6 h-6" />,
            bgColor: 'bg-emerald-50',
            iconColor: 'text-emerald-700',
        },
    ]

    const oftProgress = (mockKVKData.oft.completed / mockKVKData.oft.total) * 100
    const fldProgress = (mockKVKData.fld.completed / mockKVKData.fld.total) * 100

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
                    <label className="block text-sm font-medium text-emerald-700 mb-2">
                        Year
                    </label>
                    <select
                        value={selectedYear}
                        onChange={e => setSelectedYear(e.target.value)}
                        className="w-full h-12 px-4 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white text-[#212121] transition-all duration-200 hover:border-[#BDBDBD]"
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
                                    <span className="px-3 py-1 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        {mockKVKData.oft.completed}/
                                        {mockKVKData.oft.total}
                                    </span>
                                </div>
                                <div className="w-full bg-[#E0E0E0] rounded-full h-3">
                                    <div
                                        className="bg-emerald-600 h-3 rounded-full"
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
                                    <span className="px-3 py-1 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        {mockKVKData.fld.completed}/
                                        {mockKVKData.fld.total}
                                    </span>
                                </div>
                                <div className="w-full bg-[#E0E0E0] rounded-full h-3">
                                    <div
                                        className="bg-emerald-600 h-3 rounded-full"
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
                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                                <Building2 className="w-8 h-8 text-emerald-700" />
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
                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                                <CreditCard className="w-8 h-8 text-emerald-700" />
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
                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                                <UserCircle className="w-8 h-8 text-emerald-700" />
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
