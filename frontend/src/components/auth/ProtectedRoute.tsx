import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { UserRole } from '../../types/auth'

interface ProtectedRouteProps {
    children: React.ReactNode
    requiredRole?: UserRole | UserRole[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredRole,
}) => {
    const { isAuthenticated, user, hasRole, checkAuth, isLoading } = useAuthStore()
    const [isChecking, setIsChecking] = useState(true)

    // Check authentication on mount
    useEffect(() => {
        const verifyAuth = async () => {
            if (!isAuthenticated) {
                const authenticated = await checkAuth()
                if (!authenticated) {
                    // Not authenticated, will redirect below
                }
            }
            setIsChecking(false)
        }

        verifyAuth()
    }, [isAuthenticated, checkAuth])

    // Show loading state while checking auth
    if (isChecking || isLoading) {
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
            <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
                    <h1 className="text-2xl font-bold text-[#212121] mb-4">
                        Access Denied
                    </h1>
                    <p className="text-[#757575] mb-6">
                        You don't have permission to access this page.
                    </p>
                    <a
                        href="/dashboard"
                        className="inline-block px-6 py-2 bg-[#487749] text-white rounded-xl hover:bg-[#487749] transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        Go to Dashboard
                    </a>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
