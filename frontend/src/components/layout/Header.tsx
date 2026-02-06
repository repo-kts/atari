import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Bell, User, LogOut, ChevronDown } from 'lucide-react'

export const Header: React.FC = () => {
    const navigate = useNavigate()
    const { user, logout } = useAuthStore()
    const [userMenuOpen, setUserMenuOpen] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const getRoleDisplayName = (role: string) => {
        switch (role) {
            case 'super_admin':
                return 'ATARI Super Admin'
            case 'admin':
                return 'Admin'
            case 'kvk':
                return 'KVK User'
            default:
                return role
        }
    }

    if (!user) return null

    return (
        <header className="bg-white border-b border-[#E0E0E0] sticky top-0 z-30">
            <div className="flex items-center justify-between px-4 lg:px-6 h-16">
                {/* Left side - Mobile menu button and title */}
                <div className="flex items-center gap-4">
                    <h1 className="text-lg font-semibold text-[#487749] hidden lg:block">
                        AMS - ATARI Zone (IV) Patna
                    </h1>
                </div>

                {/* Right side - Notifications and User menu */}
                <div className="flex items-center gap-3">
                    {/* Notifications */}
                    <button
                        className="relative p-2 rounded-xl hover:bg-[#F5F5F5] transition-all duration-200 border border-transparent hover:border-[#E0E0E0] focus:outline-none focus:ring-2 focus:ring-[#487749]/20"
                        aria-label="Notifications"
                    >
                        <Bell className="w-5 h-5 text-[#487749]" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[#F5F5F5] transition-all duration-200 border border-transparent hover:border-[#E0E0E0] focus:outline-none focus:ring-2 focus:ring-[#487749]/20"
                        >
                            <div className="w-8 h-8 bg-[#487749] rounded-xl flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium text-[#212121]">
                                    {user.name}
                                </p>
                                <p className="text-xs text-[#757575]">
                                    {getRoleDisplayName(user.role)}
                                </p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-[#757575] hidden md:block" />
                        </button>

                        {/* Dropdown Menu */}
                        {userMenuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setUserMenuOpen(false)}
                                />
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#E0E0E0] z-20 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-[#E0E0E0]">
                                        <p className="text-sm font-medium text-[#212121]">
                                            {user.name}
                                        </p>
                                        <p className="text-xs text-[#757575]">
                                            {user.email}
                                        </p>
                                        <p className="text-xs text-[#487749] mt-1 font-medium">
                                            {getRoleDisplayName(user.role)}
                                        </p>
                                    </div>
                                    <div className="p-2">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#487749] rounded-xl hover:bg-[#F5F5F5] transition-all duration-200 border border-transparent hover:border-[#E0E0E0]"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
