import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export const Layout: React.FC = () => {
    const location = useLocation()
    const isReportPage = location.pathname === '/all-reports'
    const [sidebarOpen, setSidebarOpen] = useState(!isReportPage)
    const effectiveSidebarOpen = sidebarOpen

    return (
        <div className="flex h-screen overflow-hidden bg-[#F5F5F5]">
            <Sidebar
                isOpen={effectiveSidebarOpen}
                onToggle={() => setSidebarOpen(prev => !prev)}
            />
            <div
                className={`w-full flex flex-col h-screen transition-all duration-300 ml-0 ${
                    effectiveSidebarOpen
                        ? 'lg:ml-64 lg:w-[calc(100%-16rem)]'
                        : 'lg:ml-16 lg:w-[calc(100%-4rem)]'
                }`}
            >
                <Header />
                <main className="flex-1 overflow-y-auto p-4 relative">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
