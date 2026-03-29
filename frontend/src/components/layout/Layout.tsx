import React, { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export const Layout: React.FC = () => {
    const location = useLocation()
    const isReportPage = location.pathname === '/all-reports'
    const [sidebarOpen, setSidebarOpen] = useState(!isReportPage)

    // Automatically collapse sidebar when navigating to reports
    useEffect(() => {
        if (isReportPage) {
            setSidebarOpen(false)
        }
    }, [isReportPage])

    return (
        <div className="flex h-screen overflow-hidden bg-[#F5F5F5]">
            <Sidebar
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
            />
            <div
                className={`flex-1 flex flex-col h-screen transition-all duration-300
                    ml-0
                    ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}
            >
                <Header />
                <main className="flex-1 overflow-y-auto p-4 relative">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
