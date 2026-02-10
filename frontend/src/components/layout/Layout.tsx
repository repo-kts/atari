import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export const Layout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true)

    return (
        <div className="flex h-screen overflow-hidden bg-[#F5F5F5]">
            <Sidebar
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
            />
            <div
                className="flex-1 flex flex-col h-screen transition-all duration-300"
                style={{
                    marginLeft: sidebarOpen ? '16rem' : '4rem', // 256px = 16rem, 64px = 4rem
                }}
            >
                <Header />
                <main className="flex-1 overflow-y-auto p-4 relative">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
