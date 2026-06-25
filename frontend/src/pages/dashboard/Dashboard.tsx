import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { SuperAdminDashboard } from './SuperAdminDashboard'
import { AdminDashboard } from './AdminDashboard'
import { KVKDashboard } from './KVKDashboard'

export const Dashboard: React.FC = () => {
    const { user } = useAuth()

    // Render dashboard based on user role
    const renderDashboard = () => {
        if (!user) return null

        switch (user.role) {
            case 'super_admin':
                return <SuperAdminDashboard />
            case 'zone_admin':
            case 'state_admin':
            case 'district_admin':
            case 'org_admin':
                return <AdminDashboard />
            case 'kvk_admin':
            case 'kvk_user':
            case 'state_user':
            case 'district_user':
            case 'org_user':
                return <KVKDashboard />
            default:
                return <KVKDashboard />
        }
    }

    // super_admin and the KVK-side dashboards render their own header (title +
    // filters on one row), so skip the shared header for them to avoid a
    // duplicate title. Only the admin dashboards keep the shared header.
    const SHARED_HEADER_ROLES = [
        'zone_admin',
        'state_admin',
        'district_admin',
        'org_admin',
    ]
    const ownsHeader = !SHARED_HEADER_ROLES.includes(user?.role ?? '')

    return (
        <div className="bg-white rounded-2xl p-1">
            {!ownsHeader && (
                /* Header Section */
                <div className="mb-6 px-6 pt-6">
                    <div>
                        <h1 className="text-2xl font-bold text-[#487749]">
                            Dashboard
                        </h1>
                        <p className="text-sm text-[#757575] mt-1 font-medium">
                            Central overview of system activities and performance metrics
                        </p>
                    </div>
                </div>
            )}

            <div className={ownsHeader ? 'p-6' : 'px-6 pb-6'}>
                {/* Role-based Dashboard Content */}
                {renderDashboard()}
            </div>
        </div>
    )
}
