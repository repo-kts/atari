import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../dashboard/Sidebar'
import { Header } from './Header'

export const Layout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true)

    return (
        <div className="flex min-h-screen bg-[#F5F5F5]">
            <Sidebar
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
            />
            <div
                className="flex-1 flex flex-col min-h-screen transition-all duration-300 overflow-x-hidden"
                style={{
                    marginLeft: sidebarOpen ? '16rem' : '4rem',
                    width: sidebarOpen ? 'calc(100% - 16rem)' : 'calc(100% - 4rem)',
                }}
            >
                <Header />
                <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 min-h-0 p-2">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
