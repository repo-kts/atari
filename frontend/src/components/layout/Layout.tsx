import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { LayoutUIProvider, useLayoutUI } from '../../contexts/LayoutUIContext'

export const Layout: React.FC = () => {
    const location = useLocation()
    const isReportPage = location.pathname === '/all-reports'
    return (
        <LayoutUIProvider initialSidebarOpen={!isReportPage}>
            <LayoutContent />
        </LayoutUIProvider>
    )
}

const LayoutContent: React.FC = () => {
    const { sidebarOpen, toggleSidebar } = useLayoutUI()
    const effectiveSidebarOpen = sidebarOpen

    return (
        <div className="flex h-screen overflow-hidden bg-[#F5F5F5]">
            <Sidebar
                isOpen={effectiveSidebarOpen}
                onToggle={toggleSidebar}
            />
            <div
                className={`w-full flex flex-col h-screen transition-all duration-300 ml-0 ${
                    effectiveSidebarOpen
                        ? 'lg:ml-64 lg:w-[calc(100%-16rem)]'
                        : 'lg:ml-16 lg:w-[calc(100%-4rem)]'
                }`}
            >
                <Header />
                <main className="flex-1 overflow-y-auto md:p-4 relative">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
