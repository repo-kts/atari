import React from 'react'
import { SuperAdminDashboard } from './SuperAdminDashboard'

// Admin Dashboard - Similar to Super Admin but with some limitations
export const AdminDashboard: React.FC = () => {
    // Admin sees similar data but might have restricted actions
    return <SuperAdminDashboard />
}
