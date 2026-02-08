import React, { ReactNode } from 'react'

interface SidebarLayoutProps {
    title: string
    description: string
    tabs?: {
        id: string
        label: string
        icon: ReactNode
    }[]
    activeTab?: string
    onTabClick?: (tabId: string) => void
    children: ReactNode
    hideTabs?: boolean // When true, tabs are hidden (used when navigation is from sidebar dropdown)
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({
    title,
    description,
    tabs = [],
    activeTab,
    onTabClick,
    children,
    hideTabs = false,
}) => {
    const showTabs = !hideTabs && tabs.length > 0

    return (
        <div className="h-full flex flex-col bg-white rounded-2xl p-1">
            {/* Header */}
            <div className="bg-white px-6 py-4 rounded-t-2xl">
                <h1 className="text-2xl font-semibold text-[#487749]">{title}</h1>
                <p className="text-sm text-[#757575] mt-1">{description}</p>
            </div>

            {/* Tabs - Only show if not hidden */}
            {showTabs && (
                <div className="px-6 pb-3">
                    <div className="flex space-x-1 overflow-x-auto bg-[#487749] rounded-xl p-1 w-fit">
                        {tabs.map(tab => {
                            const isActive = activeTab === tab.id
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => onTabClick?.(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-200 ${isActive
                                        ? 'bg-white text-[#487749] shadow-sm'
                                        : 'text-white hover:text-[#487749] hover:bg-white/50'
                                        }`}
                                    role="tab"
                                    aria-selected={isActive}
                                >
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto bg-[#FAF9F6] rounded-2xl px-1">
                {children}
            </div>
        </div>
    )
}
