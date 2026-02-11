import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { UserRole } from '../../types/auth'
import { ShieldAlert } from 'lucide-react'

interface ProtectedRouteProps {
    children: React.ReactNode
    requiredRole?: UserRole | UserRole[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredRole,
}) => {
    const { isAuthenticated, user, hasRole, isLoading } = useAuth()

    // Show loading state while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#487749]"></div>
                    <p className="mt-4 text-[#757575]">Loading...</p>
                </div>
            </div>
        )
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />
    }

    // Check role-based access
    if (requiredRole && !hasRole(requiredRole)) {
        return (
            <div className="h-full w-full bg-[#F5F5F5] flex items-center justify-center p-4">
                <div className="bg-white p-1 rounded-2xl shadow-sm max-w-md w-full animate-fade-in-up">
                    <div className="bg-[#FAF9F6] rounded-xl p-8 text-center border border-[#E0E0E0]/50">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-white rounded-full shadow-sm border border-[#E0E0E0]/50">
                                <ShieldAlert className="w-10 h-10 text-[#487749]" />
                            </div>
                        </div>
                        <h1 className="text-xl font-bold text-[#212121] mb-3">
                            Access Restricted
                        </h1>
                        <p className="text-[#757575] mb-8 text-sm leading-relaxed px-4">
                            You don't have the required permissions to view this page. Please contact your administrator if you believe this is an error.
                        </p>
                        <a
                            href="/dashboard"
                            className="inline-flex w-full items-center justify-center px-6 py-3 bg-[#487749] text-white font-medium rounded-xl hover:bg-[#3d6540] transition-all duration-200 shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0"
                        >
                            Return to Dashboard
                        </a>
                    </div>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
