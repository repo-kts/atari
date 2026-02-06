import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { SuperAdminDashboard } from './SuperAdminDashboard'
import { AdminDashboard } from './AdminDashboard'
import { KVKDashboard } from './KVKDashboard'
import { LogOut } from 'lucide-react'

export const Dashboard: React.FC = () => {
    const navigate = useNavigate()
    const { user, logout } = useAuthStore()
    const [showLogoutModal, setShowLogoutModal] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    // Render dashboard based on user role
    const renderDashboard = () => {
        if (!user) return null

        switch (user.role) {
            case 'super_admin':
                return <SuperAdminDashboard />
            case 'admin':
                return <AdminDashboard />
            case 'kvk':
                return <KVKDashboard />
            default:
                return <SuperAdminDashboard />
        }
    }

    return (
        <>
            <div className="min-h-screen bg-[#F5F5F5] p-4 lg:p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-semibold text-[#212121]">
                                    Dashboard
                                </h1>
                                <p className="text-sm text-[#757575] mt-1">
                                    Overview of your system activities
                                </p>
                            </div>

                            {/* Logout Button */}
                            {user && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowLogoutModal(true)}
                                    className="flex items-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="hidden sm:inline">
                                        Logout
                                    </span>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Role-based Dashboard Content */}
                    {renderDashboard()}
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            <Modal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                title="Confirm Logout"
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-[#757575]">
                        Are you sure you want to logout? You will need to login
                        again to access the system.
                    </p>
                    {user && (
                        <div className="bg-[#E8F5E9] border border-[#C8E6C9] p-3 rounded-xl">
                            <p className="text-sm text-[#212121]">
                                <span className="font-medium">User:</span>{' '}
                                {user.name}
                            </p>
                            <p className="text-sm text-[#757575]">
                                <span className="font-medium">Role:</span>{' '}
                                {user.role === 'super_admin'
                                    ? 'ATARI Super Admin'
                                    : user.role === 'admin'
                                      ? 'Admin'
                                      : 'KVK User'}
                            </p>
                        </div>
                    )}
                    <div className="flex gap-3 justify-end pt-4 border-t border-[#E0E0E0]">
                        <Button
                            variant="outline"
                            onClick={() => setShowLogoutModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700 focus:ring-red-500"
                        >
                            Logout
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    )
}
